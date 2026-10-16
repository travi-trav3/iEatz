// Re-hosts a re-rendered post under a new file name, so Buffer can never fetch stale bytes.
// raw.githubusercontent.com caches a path for minutes and Buffer keeps whatever it fetched at
// edit time, so a fix never overwrites a path and never relies on ?v=N.
//
//   node rehost.js stage <bufferId> > stage.json
//       After `node render-batch.js batches/<batch>.json --only <file>`: copies the render
//       output to the next free revision name next to the current file (x.png -> x-r2.png,
//       carousel x--01.png -> x-r2--01.png ...) and prints the new paths, URLs and sha256s.
//       The old file stays: other posts or a pending edit may still point at it.
//   node rehost.js verify stage.json
//       After commit and push: fetches every new URL until it returns 200 and the body's
//       sha256 matches the local file (up to 5 minutes). Exit 0 only when all match; only then
//       call edit_post.
//   node rehost.js record stage.json
//       After edit_post succeeded: points the ledger at the new files and notes the old one.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '../..');
const MANIFEST = path.join(REPO, 'social/manifest');
const OUT = path.join(REPO, 'social/render/out');
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function find(bid) {
  for (const f of fs.readdirSync(MANIFEST).filter(f => f.endsWith('.json'))) {
    const p = path.join(MANIFEST, f);
    let m; try { m = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { continue; }
    const i = (m.posts || []).findIndex(x => x.bufferId === bid);
    if (i >= 0) return { path: p, batch: f, m, i, post: m.posts[i] };
  }
  return null;
}
// assets/x/p25-pin-poster-r2--01.png -> { dir, base: p25-pin-poster, rev: 2, slide: --01, ext: .png }
function parts(file) {
  const m = path.basename(file).match(/^(.*?)(?:-r(\d+))?(--\d+|-cover)?(\.\w+)$/);
  return { dir: path.dirname(file), base: m[1], rev: Number(m[2] || 1), slide: m[3] || '', ext: m[4] };
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'stage') {
  const l = arg && find(arg);
  if (!l) { console.error(`!! ${arg}: not in any ledger`); process.exit(1); }
  const files = l.post.slides || [l.post.file];
  if (files.some(f => !/\.png$/i.test(f))) { console.error(`!! ${l.post.id}: not a static image post (${files[0]}); reels are copy-only on scheduled runs`); process.exit(1); }
  if (!l.m.renderBatch) { console.error(`!! ${l.batch}: no renderBatch, so there is no render output to re-host`); process.exit(1); }
  const render = JSON.parse(fs.readFileSync(path.join(REPO, l.m.renderBatch), 'utf8'));
  const p0 = parts(files[0]);
  const taken = fs.existsSync(path.join(REPO, p0.dir)) ? fs.readdirSync(path.join(REPO, p0.dir))
    .filter(f => f.startsWith(p0.base + '-r')).map(f => parts(f)).filter(q => q.base === p0.base).map(q => q.rev) : [];
  const rev = Math.max(p0.rev, ...taken) + 1;
  const out = files.map(f => {
    const q = parts(f);
    const from = path.join(OUT, render.name, `${q.base}${q.slide}${q.ext}`);
    if (!fs.existsSync(from)) { console.error(`!! ${path.relative(REPO, from)} missing: run render-batch.js ${l.m.renderBatch.replace('social/render/', '')} --only ${q.base}`); process.exit(1); }
    const to = path.join(q.dir, `${q.base}-r${rev}${q.slide}${q.ext}`);
    fs.copyFileSync(from, path.join(REPO, to));
    return { from: path.relative(REPO, from), to, url: (l.m.urlBase || '') + to, sha256: sha(fs.readFileSync(path.join(REPO, to))) };
  });
  console.log(JSON.stringify({ bufferId: arg, ledger: l.batch, post: l.post.id, revision: rev, replaces: files, files: out }, null, 2));
} else if (cmd === 'verify') {
  const st = JSON.parse(fs.readFileSync(arg, 'utf8'));
  const deadline = Date.now() + 5 * 60e3;
  const left = new Set(st.files.map(f => f.url));
  while (left.size) {
    for (const f of st.files.filter(f => left.has(f.url))) {
      let body = null;
      try { body = execFileSync('curl', ['-sSf', '--max-time', '30', f.url], { maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { /* not there yet */ }
      if (body && sha(body) === f.sha256) { console.log(`OK ${f.url}`); left.delete(f.url); }
    }
    if (!left.size) break;
    if (Date.now() > deadline) { for (const u of left) console.error(`!! ${u}: no 200 with matching sha256 after 5 minutes`); process.exit(1); }
    execFileSync('sleep', ['10']);
  }
  console.log('verified: safe to edit_post');
} else if (cmd === 'record') {
  const st = JSON.parse(fs.readFileSync(arg, 'utf8'));
  const l = find(st.bufferId);
  if (!l) { console.error(`!! ${st.bufferId}: not in any ledger`); process.exit(1); }
  const raw = fs.readFileSync(l.path, 'utf8');
  const post = l.m.posts[l.i];
  post.revisions = (post.revisions || []).concat({ at: new Date().toISOString(), replaced: post.file });
  post.file = st.files[0].to;
  if (post.slides) post.slides = st.files.map(f => f.to);
  fs.writeFileSync(l.path, JSON.stringify(l.m, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
  console.log(`${l.batch}: ${post.id} -> ${post.file}`);
} else {
  console.error('usage: node rehost.js stage <bufferId> | verify <stage.json> | record <stage.json>');
  process.exit(1);
}
