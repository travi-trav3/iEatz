// Contact sheet — view a batch AS THE AUDIENCE SEES IT before scheduling.
// Usage: node contact-sheet.js ../manifest/<batch>.json
// Writes out/<batch-name>-contact-<channel>.png per channel (posts in publish order).
// Mandatory step: eyeball each sheet next to the already-published tiles.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const manifestPath = process.argv[2];
if (!manifestPath) { console.error('usage: node contact-sheet.js <batch.json>'); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const REPO = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const byChannel = {};
  for (const p of batch.posts) (byChannel[p.channel] = byChannel[p.channel] || []).push(p);
  for (const [channel, posts] of Object.entries(byChannel)) {
    posts.sort((a, b) => (a.dueAt || '').localeCompare(b.dueAt || ''));
    const files = posts.map(p => path.join(REPO, p.file)).filter(f => fs.existsSync(f));
    if (!files.length) continue;
    const cols = Math.min(6, files.length), gap = 8, tw = 220;
    const th = channel === 'instagram' ? 275 : 330;
    const rows = Math.ceil(files.length / cols);
    const W = cols * tw + (cols + 1) * gap, H = rows * th + (rows + 1) * gap;
    const comps = [];
    for (let i = 0; i < files.length; i++) {
      comps.push({
        input: await sharp(files[i]).resize(tw, th).toBuffer(),
        left: gap + (i % cols) * (tw + gap),
        top: gap + Math.floor(i / cols) * (th + gap),
      });
    }
    const out = path.join(OUT, `${batch.batch || 'batch'}-contact-${channel}.png`);
    await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
      .composite(comps).png().toFile(out);
    console.log(out);
  }
})();
