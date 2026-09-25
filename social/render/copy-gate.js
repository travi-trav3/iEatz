// COPY GATE — brand copy rules as code. Run standalone or via diversity-gate.js (which runs it).
// Usage: node copy-gate.js <ledger or render batch>
// Reads every caption field (title, text, firstComment) and every rendered string (head, sub,
// body, seam, cap, method, slides...) through ledger.js. Fails on:
//   1. any em dash (U+2014), or an en dash (U+2013) used as a dash (anywhere but between digits)
//   2. "not X, it's Y" / "not X. It's Y" / "not X, but Y" (and the parallel "not by X, by Y")
//   3. more than 50% of a channel's headlines under five words (the two-beat aphorism cap)
//   4. sentence-case violations in headlines: a capitalised word after the first that is not a
//      sentence start, the pronoun I, an acronym, or on copy-allowlist.txt
//   5. photoClaim: required on every photo post/slide, and at least one noun from it must
//      appear in the headline or caption (both strings are printed so the fix is obvious)
const fs = require('fs');
const path = require('path');
const { load, strip, headlineOf } = require('./ledger');
const { photosOf } = require('./doc');

const ALLOW = fs.readFileSync(path.join(__dirname, 'copy-allowlist.txt'), 'utf8')
  .split('\n').map(l => l.replace(/#.*/, '').trim()).filter(Boolean).sort((a, b) => b.length - a.length);

const NOT_X = /\bnot\b[^.]{3,60}[,.]\s*(it's|its|it is|but)\b/i;
const NOT_X_PARALLEL = /\bnot\s+(by|for|to|about|from|with)\b[^.,]{2,40},\s*\1\b/i;
const EN_DASH_AS_DASH = /(?<!\d)–|–(?!\d)/;

const STOP = new Set(('the and with of a an on in at by for from to into onto over under beside next near above below behind '
  + 'its their her his our your some few full half open fresh white red green black dark bright real small large big little '
  + 'wooden glass plastic two three four five one sliced chopped holding stirring cooking chopping slicing topped stacked '
  + 'packaged missing listing sitting standing person people woman women man men hand hands someone table shot view '
  + 'close closeup overhead top side left right front back up out off down very lots lot of plus other another each '
  + 'showing shows photo image frame background foreground').split(/\s+/));
const words = (s) => strip(s).toLowerCase().replace(/[’']/g, "'").match(/[a-z][a-z']*/g) || [];
const stem = (w) => w.replace(/'s$/, '').replace(/(ies)$/, 'y').replace(/(ves)$/, 'f').replace(/(oes|ches|shes|xes)$/, (m) => m.slice(0, -2)).replace(/([^s])s$/, '$1');
const nouns = (s) => [...new Set(words(s).filter(w => w.length >= 3 && !STOP.has(w)).map(stem))];

function sentenceCase(html) {
  let t = strip(html).replace(/[’]/g, "'");
  for (const a of ALLOW) t = t.split(a).join(a.toLowerCase());
  const bad = [];
  const tokens = t.split(/\s+/).filter(Boolean);
  for (let i = 1; i < tokens.length; i++) {
    const w = tokens[i].replace(/^[("'‘“]+/, '');
    if (!/^[A-Z]/.test(w)) continue;
    const prev = tokens[i - 1];
    if (/[.!?:]["')’”]*$/.test(prev)) continue;          // new sentence (or after a colon label)
    if (/^I('|$|[.,!?])/.test(w)) continue;                          // the pronoun I
    if (/^[A-Z0-9]{2,6}[.,!?]?$/.test(w)) continue;                  // acronym
    bad.push(w.replace(/[.,!?;:]+$/, ''));
  }
  return bad;
}

function check(loaded) {
  const fails = [];
  const byChannel = {};
  for (const p of loaded.posts) (byChannel[p.channel] = byChannel[p.channel] || []).push(p);
  for (const p of loaded.posts) {
    // 1-2: dashes and not-X on every string
    for (const { field, text } of p.copy) {
      const s = String(text).replace(/[’]/g, "'");
      if (s.includes('—')) fails.push(`${p.id}: em dash in ${field}: "${strip(s).slice(0, 90)}"`);
      else if (EN_DASH_AS_DASH.test(s)) fails.push(`${p.id}: en dash used as a dash in ${field}: "${strip(s).slice(0, 90)}"`);
      const nx = strip(s).match(NOT_X) || strip(s).match(NOT_X_PARALLEL);
      if (nx) fails.push(`${p.id}: "not X, Y" construction in ${field}: "...${nx[0]}..."`);
    }
    // 4: sentence case in headlines (post head/seam and every slide head)
    const r = p.render || {};
    const heads = [];
    if (r.head) heads.push(['head', r.head]); if (r.seam) heads.push(['seam', r.seam]);
    (r.slides || []).forEach((s, i) => { if (s.head) heads.push([`slides[${i}].head`, s.head]); if (s.seam) heads.push([`slides[${i}].seam`, s.seam]); });
    for (const [field, h] of heads) {
      const bad = sentenceCase(h);
      if (bad.length) fails.push(`${p.id}: sentence case in ${field}: "${strip(h)}" capitalises ${bad.map(b => `"${b}"`).join(', ')} (not a sentence start or on copy-allowlist.txt)`);
    }
    // 5: photoClaim required and grounded in the copy, per photo-bearing unit (post or slide)
    const units = r.slides ? r.slides.map((s, i) => ({ id: `${p.id} slide ${i + 1}`, r: s, head: headlineOf(s) })) : [{ id: p.id, r, head: headlineOf(r) }];
    for (const u of units) {
      if (!photosOf(u.r).length) continue;
      const claim = u.r.photoClaim || (!r.slides ? p.photoClaim : null);
      if (!claim) { fails.push(`${u.id}: photo post without photoClaim (say what the photo literally shows)`); continue; }
      const copy = `${u.head} ${p.text}`;
      const have = new Set(words(copy).map(stem));
      const claimNouns = nouns(claim);
      if (!claimNouns.some(n => have.has(n)))
        fails.push(`${u.id}: photoClaim shares no noun with the headline or caption\n     photoClaim: "${claim}"\n     headline:   "${strip(u.head)}"\n     caption:    "${strip(p.text).slice(0, 160)}"`);
    }
  }
  // 3: two-beat aphorism cap, per channel
  for (const [channel, ps] of Object.entries(byChannel)) {
    const hs = ps.map(p => p.headline).filter(Boolean);
    const short = hs.filter(h => (h.match(/[A-Za-z0-9$][\w'$.:]*/g) || []).length < 5);
    if (hs.length && short.length / hs.length > 0.5)
      fails.push(`${channel}: ${short.length}/${hs.length} headlines are under five words (cap 50%): ${short.map(h => `"${h}"`).join(', ')}`);
  }
  return fails;
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node copy-gate.js <ledger or render batch>'); process.exit(1); }
  const loaded = load(file);
  const fails = check(loaded);
  const n = loaded.posts.length, strings = loaded.posts.reduce((a, p) => a + p.copy.length, 0);
  console.log(`${loaded.source}: ${n} posts, ${strings} strings checked`);
  if (fails.length) { console.error('\nCOPY GATE FAILED:'); fails.forEach(f => console.error(' - ' + f)); process.exit(1); }
  console.log('\nCopy gate PASSED.');
}

module.exports = { check, sentenceCase, nouns };
