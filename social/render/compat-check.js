// Backward-compat guard: re-render legacy batches and byte-compare every PNG against the
// committed asset of the same name under assets/. Any harness change must keep this green.
// Usage: node compat-check.js [batches/<batch>.json ...]   (default: batches/sep-10-16.json)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '../..');
const batches = process.argv.slice(2).length ? process.argv.slice(2) : ['batches/sep-10-16.json'];
const index = {};
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.png')) (index[e.name] = index[e.name] || []).push(f);
  }
})(path.join(REPO, 'assets'));

let bad = 0, n = 0;
for (const b of batches) {
  const batch = JSON.parse(fs.readFileSync(path.resolve(__dirname, b), 'utf8'));
  execFileSync('node', [path.join(__dirname, 'render-batch.js'), path.resolve(__dirname, b)], { stdio: 'ignore' });
  for (const p of batch.posts) {
    const out = path.join(__dirname, 'out', batch.name, p.file + '.png');
    const refs = index[p.file + '.png'] || [];
    if (!refs.length) { console.log(`-- ${p.file}.png (no committed asset to compare)`); continue; }
    n++;
    const same = refs.some(r => fs.readFileSync(r).equals(fs.readFileSync(out)));
    if (!same) bad++;
    console.log(`${same ? 'SAME' : 'DIFF'} ${p.file}.png vs ${path.relative(REPO, refs[0])}`);
  }
}
console.log(`\n${n} compared, ${bad} differ.`);
process.exit(bad ? 1 : 0);
