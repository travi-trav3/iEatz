const fs = require('fs');
const path = require('path');
// SET GATE (the file keeps its old name so every runbook still works) — run before any
// scheduling run, and after any batch change.
// Usage: node diversity-gate.js <ledger or render batch> [--with <ledger>]...
//   ../manifest/<batch>.json   Buffer ledger (joins its "renderBatch" for anatomy fields)
//   batches/<batch>.json       render batch with channel/dueAt/pillar/cta/title/text per post
//
// Reboot, Nov 2026 (social/feedback/RULES.md F-007 to F-009, the reboot doc of Oct 30): the
// rotation rules that used to pick the shell for the post are GONE: adjacent template and
// surface, the template cap, pillar adjacency and the three-pillar floor, the formulaic-CTA cap,
// the accent-tail and eyebrow ratios, the plated-photo cap, the carousel-and-reel-per-week rule.
// They produced the sameness they were meant to prevent (F-004: the shell and the photo were
// picked to satisfy rotation, and the content followed). Shell choice comes from the post's job
// and the rationale table.
// What stays, as failures: the copy gate (truth, rationale, headline, F-006), ledger/render
// mismatches, a near-duplicate message, a hero photo reused in one channel's set, the badge in
// its home position and never badge-url on Instagram.
// What is new: from 2026-11-15 our own photos come first and a stock photo fails only while an
// own one is free (F-008; `node photo-usage.js` prints the supply in priority order); every reel
// due from 2026-11-02 names its track (F-009); the three hook variants of one clip (`variantOf`) are
// allowed to share a caption, a clip and a cover.
// Warnings never fail: deprecated shells, a hero with no style, a week with no comment-COOKBOOK
// post, the shells unused across the last three ledgers (the planner starts from them).
// --with <ledger> (repeatable) merges another ledger's posts into the set before the checks: a
// weekly batch runs with every live series ledger (e.g. ../manifest/send-this.json) so the
// set rules see the feed as it will actually publish.
// A ledger with "series": "<name>" is one shell by design: its set rules run where it is merged.
// Pair with contact-sheet.js --with-live and eyeball the montage.
const { load } = require('./ledger');
const { TEMPLATES, footerHome } = require('./templates');
const { photosOf } = require('./doc');
const { supply } = require('./photo-usage');
const copyGate = require('./copy-gate');

const STOCK_ENDS = '2026-11-15';   // F-008: from this, own photos first; stock only while no own photo is free
const TRACK_FROM = '2026-11-02';   // F-009: from this, no reel without a track
const REPO = path.resolve(__dirname, '../..');
const PHOTO_SOURCE = {};
for (const ph of JSON.parse(fs.readFileSync(path.join(REPO, 'assets/photos/photos.json'), 'utf8')).photos) PHOTO_SOURCE[ph.file] = ph.source || 'stock';
// app-*.jpg are real screens of the product, never stock; anything not in the index is unknown and counts as stock.
const isStock = (f) => !/^app-/.test(path.basename(f)) && (PHOTO_SOURCE[f] || 'stock') === 'stock';
const photosOfPost = (r) => {
  if (!r) return [];
  const out = new Set();
  for (const unit of r.slides || [r]) photosOf(unit).forEach(f => out.add(f));
  if (r.endCard) photosOf(r.endCard).forEach(f => out.add(f));
  return [...out];
};

function gate(file, opts = {}) {
  const loaded = load(file);
  // --with merges only the series posts that fall inside this batch's own publish window per
  // channel (first to last dueAt): a post three weeks out is not part of this set.
  const span = {};
  for (const p of loaded.posts) {
    if (!p.dueAt) continue;
    const s = span[p.channel] = span[p.channel] || { lo: p.dueAt, hi: p.dueAt };
    if (p.dueAt < s.lo) s.lo = p.dueAt; if (p.dueAt > s.hi) s.hi = p.dueAt;
  }
  for (const w of opts.with || []) {
    const extra = load(w);
    const inside = extra.posts.filter(p => span[p.channel] && p.dueAt >= span[p.channel].lo && p.dueAt <= span[p.channel].hi);
    loaded.posts.push(...inside);
    loaded.mismatches.push(...extra.mismatches.map(m => `${extra.source}: ${m}`));
  }
  const { batch, posts, mismatches } = loaded;
  const series = !!batch.series;
  const fails = [...mismatches.map(m => `ledger/render mismatch: ${m}`)];
  // The copy gate runs as part of this gate (and standalone as copy-gate.js).
  fails.push(...copyGate.check(loaded).map(f => `copy: ${f}`));
  const warns = [...(copyGate.check.warns || []).map(w => `copy: ${w}`)];
  const lines = [];
  if (series) lines.push(`series ledger "${batch.series}": one shell by design; set rules apply where a weekly batch merges it with --with`);
  const byChannel = {};
  for (const p of posts) (byChannel[p.channel] = byChannel[p.channel] || []).push(p);

  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3);
  const overlap = (a, b) => {
    const A = new Set(norm(a)), B = new Set(norm(b));
    if (!A.size || !B.size) return 0;
    let n = 0; for (const w of A) if (B.has(w)) n++;
    return n < 3 ? 0 : n / Math.min(A.size, B.size); // require >=3 shared words: short titles are noisy
  };
  // Hook variants of one clip (trial reels: three first lines, one cut) are one post for the
  // dedupe and hero rules; followers never see trial reels, so near-duplicates are by design.
  const sameClip = (a, b) => a.variantOf && b.variantOf && a.variantOf === b.variantOf;
  // The weekly comment-COOKBOOK ask says the same thing every week by design (the offer, the
  // word, the price); two of them are not a repeated message.
  const sameAsk = (a, b) => a.cta === 'cookbook-dm' && b.cta === 'cookbook-dm';

  for (const [channel, list] of Object.entries(byChannel)) {
    const ps = [...list].sort((a, b) => (a.dueAt || '').localeCompare(b.dueAt || ''));
    const n = ps.length;

    // 1. Deprecated shells warn on any use.
    const tCount = {};
    ps.forEach(p => { if (p.template) tCount[p.template] = (tCount[p.template] || 0) + 1; });
    ps.forEach(p => { const t = TEMPLATES[p.coverTemplate || p.template]; if (t && t.deprecated) warns.push(`${channel}: ${p.id} uses deprecated "${p.coverTemplate || p.template}" (${t.deprecated})`); });
    // 2. No repeated message: headline/title word-overlap > 60% between any two posts (variants of one clip exempt).
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (sameClip(ps[i], ps[j]) || sameAsk(ps[i], ps[j])) continue;
      const o = overlap(ps[i].title || ps[i].text, ps[j].title || ps[j].text);
      if (o > 0.6) fails.push(`${channel}: near-duplicate message ${ps[i].id} vs ${ps[j].id} (${Math.round(o * 100)}% word overlap)`);
    }
    // 3. Hero photo never reused within the batch (variants of one clip exempt).
    const seen = {};
    ps.forEach(p => { if (p.heroPhoto) { const prev = seen[p.heroPhoto]; if (prev && !sameClip(prev, p)) fails.push(`${channel}: hero photo reused ${prev.id} & ${p.id} (${p.heroPhoto})`); seen[p.heroPhoto] = seen[p.heroPhoto] || p; } });
    // 4. Footer: never badge-url on Instagram. From 2026-10-26 the mark sits in its home position
    //    for the surface (templates.js FOOTER_HOME); only "none" (carousel interiors), "badge-bc"
    //    (sendthis) and "ad" are also allowed.
    if (channel === 'instagram') ps.forEach(p => { if (p.footer === 'badge-url') fails.push(`instagram: ${p.id} footer "badge-url" (the URL is dead weight on Instagram; move the badge)`); });
    const fCount = {};
    ps.forEach(p => { if (p.footer && p.footer !== 'ad') fCount[p.footer] = (fCount[p.footer] || 0) + 1; });
    ps.forEach(p => {
      if (!p.footer || p.footer === 'ad' || p.footer === 'none' || p.footer === 'badge-bc' || p.dueAt < '2026-10-26') return;
      const home = footerHome(p.surface);
      if (home && p.footer !== home) (series ? warns : fails).push(`${channel}: ${p.id} footer "${p.footer}" on a ${p.surface} shell (home is "${home}")`);
    });
    // 5. A hero with no style in photos.json is a photo nobody opened.
    ps.forEach(p => { if (p.heroPhoto && (!p.photoStyle || p.photoStyle === 'unknown')) warns.push(`${channel}: ${p.id} hero ${p.heroPhoto} has no style in photos.json`); });
    // 6. F-008 (as Travis set it Oct 30): own photos first, the library second, never a thin week
    //    because the inbox was empty. From 2026-11-15 a stock photo fails only while an own photo
    //    (source "own", unflagged, not used in the last 30 days) is free on the post's day; with
    //    none free it is a note, not a failure. A photo used in the last 30 days anywhere warns:
    //    rest it (CONTROL_CENTER §5), there are never-used and rested photos first.
    ps.forEach(p => {
      if (!p.dueAt) return;
      const day = p.dueAt.slice(0, 10);
      const photos = photosOfPost(p.render);
      if (!photos.length) return;
      let sup; try { sup = supply(day); } catch (e) { warns.push(`photo supply check skipped: ${e.message}`); return; }
      const tier = Object.fromEntries(sup.rows.map(r => [r.file, r]));
      const ownFree = (sup.by.own || []).length;
      const stock = photos.filter(isStock);
      if (day >= STOCK_ENDS && stock.length) {
        if (ownFree) fails.push(`${channel}: ${p.id} is due ${day} on stock (${stock.join(', ')}) while ${ownFree} of our own photos are free (own first; F-008)`);
        else warns.push(`${channel}: ${p.id} is due ${day} on stock (${stock.join(', ')}): no own photo free, the library is the fallback (F-008)`);
      }
      for (const f of photos) {
        const r = tier[f]; if (!r || !r.lastUsed) continue;
        // the use being checked is this post itself when it is already in a ledger; look past it
        const prior = (sup.uses[f] || []).filter(u => u.date && u.date < day && !u.post.endsWith(`:${p.id}`)).sort((a, b) => b.date.localeCompare(a.date))[0];
        if (prior && Math.round((Date.parse(day) - Date.parse(prior.date)) / 864e5) <= 30 && !(p.variantOf))
          warns.push(`${channel}: ${p.id} reuses ${f}, last used ${prior.date} (${prior.post}); rest a photo 30 days when a never-used or rested one fits (F-008)`);
      }
    });
    // 7. F-009: a reel due from 2026-11-02 names its track in the ledger (`track`: "buffer" when
    //    Travis adds Instagram's licensed music in the Buffer editor, or the Sound Collection id
    //    of the bed baked in by render-motion.js). Silence is a bug. Render batches have no
    //    ledger row, so this runs on ledgers only.
    ps.forEach(p => {
      if (p.format !== 'reel' || !p.status || !p.dueAt || p.dueAt.slice(0, 10) < TRACK_FROM) return;
      if (!p.track || !String(p.track).trim()) fails.push(`${channel}: ${p.id} is a reel with no track (ledger "track": "buffer" or the Sound Collection id; F-009)`);
    });
    // 8. Instagram: one comment-COOKBOOK post a week keeps the ManyChat flow fed. A warning: a
    //    week with no footage ships two posts, and the right posts beat the calendar.
    if (channel === 'instagram' && n && ps[0].status) {
      const day = (s) => Date.parse(s) || 0;
      const t0 = day(ps[0].dueAt);
      const windows = {};
      ps.forEach(p => { const w = Math.floor((day(p.dueAt) - t0) / (7 * 864e5)); (windows[w] = windows[w] || []).push(p); });
      for (const [w, wp] of Object.entries(windows)) {
        const span = `${wp[0].dueAt.slice(0, 10)} .. ${wp[wp.length - 1].dueAt.slice(0, 10)}, ${wp.length} posts`;
        if (wp[0].dueAt >= '2026-10-17' && !wp.some(p => p.cta === 'cookbook-dm')) warns.push(`instagram: no "comment COOKBOOK" post (cta cookbook-dm) in 7-day window ${+w + 1} (${span})`);
      }
    }
    const fm = {}; ps.forEach(p => { fm[p.format] = (fm[p.format] || 0) + 1; });
    const hooks = {}; ps.forEach(p => { if (p.hook) hooks[p.hook] = (hooks[p.hook] || 0) + 1; });
    const pillars = new Set(ps.map(p => p.pillar).filter(Boolean));
    lines.push(`${channel}: ${n} posts | templates ${JSON.stringify(tCount)} | pillars [${[...pillars]}] | formats ${JSON.stringify(fm)} | hooks ${JSON.stringify(hooks)} | footers ${JSON.stringify(fCount)}`);
  }
  return { fails, warns, lines };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const withs = [];
  for (let i = 0; i < args.length; i++) if (args[i] === '--with') withs.push(args.splice(i, 2)[1]), i--;
  const file = args.find(a => !a.startsWith('--'));
  if (!file) { console.error('usage: node diversity-gate.js <ledger or render batch> [--with <ledger>]...'); process.exit(1); }
  if (args.includes('--soft-format')) console.log('(--soft-format is a no-op since Nov 2026: the carousel-and-reel-per-week rule is gone)');
  const { fails, warns, lines } = gate(file, { with: withs });
  lines.forEach(l => console.log(l));
  // 9. Shell coverage (Oct 29 2026, Travis: "you still aren't using the full range of templates").
  //    Across this ledger and the two before it, every live shell should appear at least once;
  //    the ones that do not are listed so the next plan starts from them. A warning, because
  //    the right post beats the rotation (F-004); the planner reads it, the batch does not fail.
  try {
    const dir = path.dirname(file);
    const ledgers = fs.readdirSync(dir).filter(f => /-batch\.json$/.test(f)).map(f => path.join(dir, f))
      .map(f => ({ f, created: (JSON.parse(fs.readFileSync(f, 'utf8')).createdAt || '') })).filter(x => x.created && x.created <= ((load(file).batch || {}).createdAt || "9"))
      .sort((a, b) => b.created.localeCompare(a.created)).slice(0, 3).map(x => x.f);
    const used = new Set();
    for (const f of ledgers) for (const p of load(f).posts) {
      const r = p.render || {}; if (r.template) used.add(r.template);
      for (const s of r.slides || []) if (s.template) used.add(s.template);
      if (r.endCard && r.endCard.template) used.add(r.endCard.template);
    }
    const live = Object.entries(TEMPLATES).filter(([n, t]) => !t.deprecated && !/^ad/.test(n) && n !== 'sendthis').map(([n]) => n);
    const unused = live.filter(n => !used.has(n));
    if (unused.length) warns.push(`shells unused across the last ${ledgers.length} ledgers: ${unused.join(', ')} (a reminder, not a rule: the post's job picks the shell)`);
  } catch (e) { warns.push(`shell coverage check skipped: ${e.message}`); }
  if (warns.length) { console.log('\nWarnings:'); warns.forEach(w => console.log(' ~ ' + w)); }
  if (fails.length) { console.error('\nSET GATE FAILED:'); fails.forEach(f => console.error(' - ' + f)); process.exit(1); }
  console.log('\nSet gate PASSED.');
}

module.exports = { gate };
