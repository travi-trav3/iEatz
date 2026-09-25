// BATCH DIVERSITY GATE — run before any scheduling run, and after any batch change.
// Usage: node diversity-gate.js <ledger or render batch> [--soft-format]
//   ../manifest/<batch>.json   Buffer ledger (joins its "renderBatch" for anatomy fields)
//   batches/<batch>.json       render batch with channel/dueAt/pillar/cta/title/text per post
// Checks each channel's posts AS A SET (publish order), not as isolated images.
// Per-post fields (written at planning time, derived from the render batch when missing):
//   pillar, topic, template, surface, heroPhoto, cta, title/text                  (v1)
//   format static|carousel|reel, footer, eyebrow, accentTail, photoStyle, photoClaim  (v2)
// Exit 1 on any failure. Warnings never fail. --soft-format turns the Instagram
// carousel/reel-per-week rule into a warning (allowed for the first two v2 batches only).
// Pair with contact-sheet.js --with-live and eyeball the montage.
const { load } = require('./ledger');
const { TEMPLATES } = require('./templates');

function gate(file, opts = {}) {
  const { batch, posts, mismatches } = load(file);
  const fails = [...mismatches.map(m => `ledger/render mismatch: ${m}`)];
  const warns = [];
  const lines = [];
  const byChannel = {};
  for (const p of posts) (byChannel[p.channel] = byChannel[p.channel] || []).push(p);

  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3);
  const overlap = (a, b) => {
    const A = new Set(norm(a)), B = new Set(norm(b));
    if (!A.size || !B.size) return 0;
    let n = 0; for (const w of A) if (B.has(w)) n++;
    return n < 3 ? 0 : n / Math.min(A.size, B.size); // require >=3 shared words: short titles are noisy
  };
  const pct = (k, n) => `${k}/${n} (${Math.round(100 * k / n)}%)`;

  for (const [channel, list] of Object.entries(byChannel)) {
    const ps = [...list].sort((a, b) => (a.dueAt || '').localeCompare(b.dueAt || ''));
    const n = ps.length, cap = Math.ceil(n / 3);

    // 1. No two ADJACENT posts share a template, surface or footer position
    for (let i = 1; i < n; i++) {
      const a = ps[i - 1], b = ps[i];
      if (b.template && b.template === a.template) fails.push(`${channel}: adjacent template "${b.template}" (${a.id} -> ${b.id})`);
      if (b.surface && b.surface === a.surface) fails.push(`${channel}: adjacent surface "${b.surface}" (${a.id} -> ${b.id})`);
      if (b.footer && b.footer === a.footer && b.footer !== 'ad') fails.push(`${channel}: adjacent footer "${b.footer}" (${a.id} -> ${b.id})`);
    }
    // 2. No template exceeds ~1/3 of the batch; deprecated shells warn on any use
    const tCount = {};
    ps.forEach(p => { if (p.template) tCount[p.template] = (tCount[p.template] || 0) + 1; });
    for (const [t, c] of Object.entries(tCount)) if (c > cap) fails.push(`${channel}: template "${t}" used ${c}/${n} (cap ${cap})`);
    ps.forEach(p => { const t = TEMPLATES[p.coverTemplate || p.template]; if (t && t.deprecated) warns.push(`${channel}: ${p.id} uses deprecated "${p.coverTemplate || p.template}" (${t.deprecated})`); });
    // 3. No pillar back-to-back; batch covers >=3 pillars (when n >= 6)
    for (let i = 1; i < n; i++)
      if (ps[i].pillar && ps[i].pillar === ps[i - 1].pillar) fails.push(`${channel}: adjacent pillar "${ps[i].pillar}" (${ps[i - 1].id} -> ${ps[i].id})`);
    const pillars = new Set(ps.map(p => p.pillar).filter(Boolean));
    if (n >= 6 && pillars.size < 3) fails.push(`${channel}: only ${pillars.size} pillars across ${n} posts (need >=3)`);
    // 4. No repeated message: headline/title word-overlap > 60% between any two posts
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const o = overlap(ps[i].title || ps[i].text, ps[j].title || ps[j].text);
      if (o > 0.6) fails.push(`${channel}: near-duplicate message ${ps[i].id} vs ${ps[j].id} (${Math.round(o * 100)}% word overlap)`);
    }
    // 5. Hero photo never reused within the batch
    const seen = {};
    ps.forEach(p => { if (p.heroPhoto) { if (seen[p.heroPhoto]) fails.push(`${channel}: hero photo reused ${seen[p.heroPhoto]} & ${p.id} (${p.heroPhoto})`); seen[p.heroPhoto] = p.id; } });
    // 6. FORMULAIC caption closers capped <= 40%, never 3 in a row.
    const formulaic = batch.formulaicCtas || ['receipt-scan'];
    for (const f of formulaic) {
      const k = ps.filter(p => p.cta === f).length;
      if (k / n > 0.4) fails.push(`${channel}: formulaic cta "${f}" on ${k}/${n} posts (cap 40%)`);
      for (let i = 2; i < n; i++)
        if (ps[i].cta === f && ps[i - 1].cta === f && ps[i - 2].cta === f) fails.push(`${channel}: formulaic cta "${f}" 3x in a row ending at ${ps[i].id}`);
    }

    // ---------- v2 anatomy rules (Sep 2026) ----------
    // 7. Italic accent tail on <= 40% of posts; eyebrow on <= 50%
    const tails = ps.filter(p => p.accentTail === true).length;
    if (tails / n > 0.4) fails.push(`${channel}: accentTail on ${pct(tails, n)} (cap 40%)`);
    const brows = ps.filter(p => p.eyebrow === true).length;
    if (brows / n > 0.5) fails.push(`${channel}: eyebrow on ${pct(brows, n)} (cap 50%)`);
    // 8. Footer: never badge-url on Instagram; no single position on > 50% of the batch
    if (channel === 'instagram') ps.forEach(p => { if (p.footer === 'badge-url') fails.push(`instagram: ${p.id} footer "badge-url" (the URL is dead weight on Instagram; move the badge)`); });
    const fCount = {};
    ps.forEach(p => { if (p.footer && p.footer !== 'ad') fCount[p.footer] = (fCount[p.footer] || 0) + 1; });
    for (const [f, c] of Object.entries(fCount)) if (c / n > 0.5) fails.push(`${channel}: footer "${f}" on ${pct(c, n)} (cap 50%)`);
    // 9. Plated photography on <= 30% of photo posts
    const photoPosts = ps.filter(p => p.heroPhoto);
    const plated = photoPosts.filter(p => p.photoStyle === 'plated').length;
    if (photoPosts.length && plated / photoPosts.length > 0.3) fails.push(`${channel}: photoStyle "plated" on ${pct(plated, photoPosts.length)} of photo posts (cap 30%)`);
    ps.forEach(p => { if (p.heroPhoto && (!p.photoStyle || p.photoStyle === 'unknown')) warns.push(`${channel}: ${p.id} hero ${p.heroPhoto} has no style in photos.json`); });
    // 10. Instagram: at least one carousel and one reel in every 7-day window of the batch
    if (channel === 'instagram' && n) {
      const day = (s) => Date.parse(s) || 0;
      const t0 = day(ps[0].dueAt);
      const windows = {};
      ps.forEach(p => { const w = Math.floor((day(p.dueAt) - t0) / (7 * 864e5)); (windows[w] = windows[w] || []).push(p); });
      for (const [w, wp] of Object.entries(windows)) {
        for (const fmt of ['carousel', 'reel']) {
          if (!wp.some(p => p.format === fmt)) {
            const msg = `instagram: no ${fmt} in 7-day window ${+w + 1} (${wp[0].dueAt.slice(0, 10)} .. ${wp[wp.length - 1].dueAt.slice(0, 10)}, ${wp.length} posts)`;
            (opts.softFormat ? warns : fails).push(msg + (opts.softFormat ? ' [--soft-format]' : ''));
          }
        }
      }
    }
    const fm = {}; ps.forEach(p => { fm[p.format] = (fm[p.format] || 0) + 1; });
    lines.push(`${channel}: ${n} posts | templates ${JSON.stringify(tCount)} | pillars [${[...pillars]}] | formats ${JSON.stringify(fm)} | footers ${JSON.stringify(fCount)} | accentTail ${pct(tails, n)} eyebrow ${pct(brows, n)} plated ${photoPosts.length ? pct(plated, photoPosts.length) : '0/0'}`);
  }
  return { fails, warns, lines };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));
  if (!file) { console.error('usage: node diversity-gate.js <ledger or render batch> [--soft-format]'); process.exit(1); }
  const { fails, warns, lines } = gate(file, { softFormat: args.includes('--soft-format') });
  lines.forEach(l => console.log(l));
  if (warns.length) { console.log('\nWarnings:'); warns.forEach(w => console.log(' ~ ' + w)); }
  if (fails.length) { console.error('\nDIVERSITY GATE FAILED:'); fails.forEach(f => console.error(' - ' + f)); process.exit(1); }
  console.log('\nDiversity gate PASSED.');
}

module.exports = { gate };
