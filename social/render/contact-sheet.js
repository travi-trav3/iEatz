// Contact sheet — view a batch AS THE AUDIENCE SEES IT before scheduling.
// Usage: node contact-sheet.js <ledger or render batch> [--with-live]
// Writes out/<batch>-contact-<channel>.png per channel (posts in publish order).
// --with-live: also writes out/<batch>-grid-instagram.png, the Instagram profile grid as it
//   will look once the batch is out: 3 columns, newest first, tiles cropped 3:4 like the grid,
//   the new batch (green bar) in front of the last 9 live IG posts (grey bar) pulled from the
//   previous ledgers in social/manifest (newest createdAt first; walks back until it has 9).
// Carousels show their cover; reels show <file>-cover.png. Mandatory step: eyeball the sheets.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { load, stem } = require('./ledger');

const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith('--'));
const withLive = args.includes('--with-live');
if (!input) { console.error('usage: node contact-sheet.js <ledger or render batch> [--with-live]'); process.exit(1); }
const REPO = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const { batch, render, posts } = load(input);
const name = batch.batch || batch.name || 'batch';
const renderName = (render && render.name) || batch.name;

// The image a post shows in a feed: ledger file, else the render output; carousel -> cover, reel -> cover png.
function tileOf(file) {
  const tries = [];
  if (file) {
    const abs = path.isAbsolute(file) ? file : path.join(REPO, file);
    if (/\.mp4$/i.test(abs)) tries.push(abs.replace(/\.mp4$/i, '-cover.png'));
    tries.push(abs);
  }
  const s = stem(file);
  if (renderName) for (const suf of ['.png', '--01.png', '-cover.png']) tries.push(path.join(OUT, renderName, s + suf));
  return tries.find(f => fs.existsSync(f) && /\.png$|\.jpe?g$/i.test(f)) || null;
}

async function tile(file, w, h, crop34) {
  const img = sharp(file);
  if (crop34) {
    const m = await img.metadata();
    const cw = Math.min(m.width, Math.round(m.height * 3 / 4)), ch = Math.min(m.height, Math.round(m.width * 4 / 3));
    return sharp(file).extract({ left: Math.round((m.width - cw) / 2), top: Math.round((m.height - ch) / 2), width: cw, height: ch }).resize(w, h).toBuffer();
  }
  return img.resize(w, h, { fit: 'contain', background: '#ffffff' }).toBuffer();
}

async function sheet(files, out, { cols, tw, th, bars, crop34 }) {
  const gap = 8, bar = bars ? 8 : 0;
  const rows = Math.ceil(files.length / cols);
  const W = cols * tw + (cols + 1) * gap, H = rows * (th + bar) + (rows + 1) * gap;
  const comps = [];
  for (let i = 0; i < files.length; i++) {
    const left = gap + (i % cols) * (tw + gap), top = gap + Math.floor(i / cols) * (th + bar + gap);
    comps.push({ input: await tile(files[i], tw, th, crop34), left, top });
    if (bars) comps.push({ input: { create: { width: tw, height: bar - 2, channels: 3, background: bars[i] } }, left, top: top + th + 2 });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } }).composite(comps).png().toFile(out);
  console.log(out);
}

(async () => {
  const byChannel = {};
  for (const p of posts) (byChannel[p.channel] = byChannel[p.channel] || []).push(p);
  for (const [channel, list] of Object.entries(byChannel)) {
    const ps = [...list].sort((a, b) => (a.dueAt || '').localeCompare(b.dueAt || ''));
    const raw = new Map(batch.posts.map(r => [r.id || r.file, r]));
    const files = ps.map(p => tileOf((raw.get(p.id) || {}).file || p.id)).filter(Boolean);
    if (files.length < ps.length) console.warn(`${channel}: ${ps.length - files.length} post(s) have no rendered image yet (render first)`);
    if (!files.length) continue;
    await sheet(files, path.join(OUT, `${name}-contact-${channel}.png`), { cols: Math.min(6, files.length), tw: 220, th: channel === 'pinterest' ? 330 : channel === 'story' ? 391 : 275 });
  }

  if (withLive) {
    const ig = (byChannel.instagram || []).sort((a, b) => (a.dueAt || '').localeCompare(b.dueAt || ''));
    const raw = new Map(batch.posts.map(r => [r.id || r.file, r]));
    const fresh = ig.map(p => tileOf((raw.get(p.id) || {}).file || p.id)).filter(Boolean);
    // Previous ledgers, newest first, excluding this batch; IG posts already out (sent, or due in the past).
    const now = Date.now();
    const mdir = path.join(REPO, 'social/manifest');
    const self = path.resolve(input);
    const ledgers = fs.readdirSync(mdir).filter(f => f.endsWith('.json')).map(f => path.join(mdir, f))
      .filter(f => path.resolve(f) !== self)
      .map(f => ({ f, j: JSON.parse(fs.readFileSync(f, 'utf8')) }))
      .filter(x => Array.isArray(x.j.posts) && x.j.posts.length && x.j.batch !== name)
      .sort((a, b) => String(b.j.createdAt || '').localeCompare(String(a.j.createdAt || '')));
    const live = [];
    for (const { j } of ledgers) {
      const sent = j.posts.filter(p => p.channel === 'instagram' && (p.status === 'sent' || (p.dueAt && Date.parse(p.dueAt) < now)))
        .sort((a, b) => (b.dueAt || '').localeCompare(a.dueAt || ''));
      for (const p of sent) { if (live.length < 9) { const f = tileOf(p.file); if (f) live.push({ f, dueAt: p.dueAt }); } }
      if (live.length >= 9) break;
    }
    live.sort((a, b) => (b.dueAt || '').localeCompare(a.dueAt || ''));
    // Grid order = newest first: the new batch (reverse publish order), then the live tiles.
    const files = [...fresh.slice().reverse(), ...live.map(x => x.f)];
    const bars = [...fresh.map(() => '#1F8B4C'), ...live.map(() => '#C8CDCA')];
    console.log(`instagram grid: ${fresh.length} new + ${live.length} live (from ${ledgers.slice(0, 3).map(x => x.j.batch).join(', ')})`);
    await sheet(files, path.join(OUT, `${name}-grid-instagram.png`), { cols: 3, tw: 300, th: 400, bars, crop34: true });
  }
})().catch(e => { console.error(e); process.exit(1); });
