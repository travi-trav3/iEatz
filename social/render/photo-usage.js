// PHOTO SUPPLY — what the planner may use this week, in priority order (F-008, Nov 2026).
// Usage: node photo-usage.js [--as-of YYYY-MM-DD] [--json]
// Reads every ledger in ../manifest (with its render batch) and every render batch, and dates
// each photo's uses by the post's dueAt. Then sorts the library:
//   1. own, unflagged, not used in the last 30 days      (the team's photos: first choice)
//   2. stock, unflagged, never used                      (the library nobody has opened)
//   3. stock, unflagged, rested: last used 60+ days ago  (used once in July is fresh again)
//   4. recent: used in the last 60 days                  (not this week)
//   5. unusable: flagged (low-res, empty-scene, no-consent)
// The gate (diversity-gate.js rule 6) uses the same numbers: a stock photo on a post due on or
// after 2026-11-15 fails only while an own photo is available; a week never ships thin because
// the inbox was empty. A photo used in the last 30 days warns (CONTROL_CENTER §5: rest a hero).
const fs = require('fs');
const path = require('path');
const { photosOf } = require('./doc');

const REPO = path.resolve(__dirname, '../..');
const INDEX = JSON.parse(fs.readFileSync(path.join(REPO, 'assets/photos/photos.json'), 'utf8'));
const MANIFEST = path.join(REPO, 'social/manifest');
const BATCHES = path.join(__dirname, 'batches');
const PHOTO_RE = /^(food|fridge|grocery|lifestyle|pantry)\/[^/]+\.(jpe?g|png)$|^app-[^/]+\.jpg$/;

const photosOfPost = (r) => {
  const out = new Set();
  if (!r) return out;
  for (const unit of r.slides || [r]) photosOf(unit).forEach(f => out.add(f));
  if (r.endCard) photosOf(r.endCard).forEach(f => out.add(f));
  return out;
};
const stem = (f) => path.basename(String(f || '')).replace(/\.(png|mp4|jpe?g)$/i, '').replace(/-cover$/, '').replace(/--\d+$/, '').replace(/-r\d+$/, '');

// uses: file -> [{date, post, source}] (date = dueAt day, or the batch createdAt when a render batch has no dueAt)
function usage() {
  const uses = {};
  const add = (f, date, post, src) => { if (PHOTO_RE.test(f)) (uses[f] = uses[f] || []).push({ date, post, src }); };
  const seenBatch = new Set();
  for (const f of fs.readdirSync(MANIFEST).filter(f => f.endsWith('.json') && f !== 'manifest.json')) {
    let led; try { led = JSON.parse(fs.readFileSync(path.join(MANIFEST, f), 'utf8')); } catch { continue; }
    let byStem = {};
    if (led.renderBatch) {
      try { const rb = JSON.parse(fs.readFileSync(path.join(REPO, led.renderBatch), 'utf8')); seenBatch.add(path.resolve(REPO, led.renderBatch)); for (const r of rb.posts || []) byStem[stem(r.file)] = r; } catch { }
    }
    for (const p of led.posts || []) {
      if (p.status === 'cut' || p.status === 'retracted') continue;   // never published, or pulled: not a use the feed saw
      const date = (p.dueAt || led.createdAt || '').slice(0, 10);
      const r = byStem[stem(p.file)];
      if (r) photosOfPost(r).forEach(ph => add(ph, date, `${f}:${p.id}`, 'ledger'));
      else if (p.heroPhoto) add(p.heroPhoto, date, `${f}:${p.id}`, 'ledger');
      else if (p.photo) add(p.photo, date, `${f}:${p.id}`, 'ledger');
    }
  }
  // render batches with no ledger (early batches, fixtures and smoke tests excluded)
  for (const f of fs.readdirSync(BATCHES).filter(f => f.endsWith('.json') && !/smoke|fixture|r4-/.test(f))) {
    const abs = path.resolve(BATCHES, f); if (seenBatch.has(abs)) continue;
    let rb; try { rb = JSON.parse(fs.readFileSync(abs, 'utf8')); } catch { continue; }
    for (const r of rb.posts || []) {
      if (r.status === 'retracted' || r.status === 'cut') continue;
      photosOfPost(r).forEach(ph => add(ph, (r.dueAt || rb.createdAt || '').slice(0, 10), `${f}:${r.file}`, 'batch'));
    }
  }
  return uses;
}

const dayDiff = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
const USABLE_FLAG = /low-res|empty-scene|no-consent|ext-mismatch/;   // brand-in-frame retired Oct 30 2026: logos are fine

function supply(asOf) {
  const uses = usage();
  const rows = INDEX.photos.map(ph => {
    const u = (uses[ph.file] || []).filter(x => x.date && x.date <= asOf).sort((a, b) => b.date.localeCompare(a.date));
    const last = u[0] ? u[0].date : null;
    const since = last ? dayDiff(asOf, last) : null;
    const flagged = !!(ph.flag && USABLE_FLAG.test(ph.flag));
    const source = ph.source || 'stock';
    let tier;
    if (flagged) tier = 'unusable';
    else if (source === 'own') tier = since === null || since > 30 ? 'own' : 'recent';
    else if (!last) tier = 'never-used';
    else if (since >= 60) tier = 'rested';
    else tier = 'recent';
    return { file: ph.file, source, style: ph.style, flag: ph.flag || null, description: ph.description || null, uses: u.length, lastUsed: last, daysSince: since, tier };
  });
  const by = {}; for (const r of rows) (by[r.tier] = by[r.tier] || []).push(r);
  return { asOf, rows, by, uses };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const ai = args.indexOf('--as-of');
  const asOf = ai >= 0 ? args[ai + 1] : new Date().toISOString().slice(0, 10);
  const s = supply(asOf);
  if (args.includes('--json')) { console.log(JSON.stringify(s.rows, null, 2)); process.exit(0); }
  const order = ['own', 'never-used', 'rested', 'recent', 'unusable'];
  console.log(`photo supply as of ${asOf}: ${s.rows.length} photos`);
  for (const t of order) {
    const list = (s.by[t] || []).sort((a, b) => (a.lastUsed || '').localeCompare(b.lastUsed || ''));
    console.log(`\n${t} (${list.length})`);
    for (const r of list) console.log(`  ${r.file.padEnd(44)} ${r.style.padEnd(8)} ${r.uses ? `used ${r.uses}x, last ${r.lastUsed} (${r.daysSince}d)` : 'never used'}${r.flag ? `  [${r.flag}]` : ''}`);
  }
  const own = (s.by.own || []).length, never = (s.by['never-used'] || []).length, rested = (s.by.rested || []).length;
  console.log(`\nplan from: ${own} own, then ${never} never-used, then ${rested} rested (60+ days). ${(s.by.recent || []).length} recent, ${(s.by.unusable || []).length} unusable.`);
}

module.exports = { supply, usage };
