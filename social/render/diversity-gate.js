// BATCH DIVERSITY GATE — run before any scheduling run, and after any batch change.
// Usage: node diversity-gate.js ../manifest/<batch>.json
// Checks each channel's posts AS A SET (publish order), not as isolated images.
// Requires per-post fields: pillar, topic, template, surface, heroPhoto, cta, title/text.
// Exit 1 on any failure. Pair with contact-sheet.js and eyeball the montage.
const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('usage: node diversity-gate.js <batch.json>'); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(path, 'utf8'));
const fails = [];
const byChannel = {};
for (const p of batch.posts) (byChannel[p.channel] = byChannel[p.channel] || []).push(p);

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3);
const overlap = (a, b) => {
  const A = new Set(norm(a)), B = new Set(norm(b));
  if (!A.size || !B.size) return 0;
  let n = 0; for (const w of A) if (B.has(w)) n++;
  return n < 3 ? 0 : n / Math.min(A.size, B.size); // require >=3 shared words: short titles are noisy
};

for (const [channel, posts] of Object.entries(byChannel)) {
  posts.sort((a, b) => (a.dueAt || '').localeCompare(b.dueAt || ''));
  const n = posts.length, cap = Math.ceil(n / 3);

  // 1. No two ADJACENT posts share a template or surface
  for (let i = 1; i < n; i++) {
    if (posts[i].template && posts[i].template === posts[i - 1].template)
      fails.push(`${channel}: adjacent template "${posts[i].template}" (${posts[i - 1].id} -> ${posts[i].id})`);
    if (posts[i].surface && posts[i].surface === posts[i - 1].surface)
      fails.push(`${channel}: adjacent surface "${posts[i].surface}" (${posts[i - 1].id} -> ${posts[i].id})`);
  }
  // 2. No template exceeds ~1/3 of the batch
  const tCount = {};
  posts.forEach(p => { if (p.template) tCount[p.template] = (tCount[p.template] || 0) + 1; });
  for (const [t, c] of Object.entries(tCount)) if (c > cap)
    fails.push(`${channel}: template "${t}" used ${c}/${n} (cap ${cap})`);
  // 3. No pillar back-to-back; batch covers >=3 pillars (when n >= 6)
  for (let i = 1; i < n; i++)
    if (posts[i].pillar && posts[i].pillar === posts[i - 1].pillar)
      fails.push(`${channel}: adjacent pillar "${posts[i].pillar}" (${posts[i - 1].id} -> ${posts[i].id})`);
  const pillars = new Set(posts.map(p => p.pillar).filter(Boolean));
  if (n >= 6 && pillars.size < 3)
    fails.push(`${channel}: only ${pillars.size} pillars across ${n} posts (need >=3)`);
  // 4. No repeated message: headline/title word-overlap > 60% between any two posts
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const o = overlap(posts[i].title || posts[i].text, posts[j].title || posts[j].text);
    if (o > 0.6) fails.push(`${channel}: near-duplicate message ${posts[i].id} vs ${posts[j].id} (${Math.round(o * 100)}% word overlap)`);
  }
  // 5. Hero photo never reused within the batch
  const seen = {};
  posts.forEach(p => { if (p.heroPhoto) { if (seen[p.heroPhoto]) fails.push(`${channel}: hero photo reused ${seen[p.heroPhoto]} & ${p.id} (${p.heroPhoto})`); seen[p.heroPhoto] = p.id; } });
  // 6. Caption CTA formula capped: any one cta type <= 40%, never 3 in a row
  const cCount = {};
  posts.forEach(p => { if (p.cta && p.cta !== 'none') cCount[p.cta] = (cCount[p.cta] || 0) + 1; });
  for (const [c, k] of Object.entries(cCount)) if (k / n > 0.4)
    fails.push(`${channel}: cta "${c}" on ${k}/${n} posts (cap 40%)`);
  for (let i = 2; i < n; i++)
    if (posts[i].cta && posts[i].cta !== 'none' && posts[i].cta === posts[i - 1].cta && posts[i].cta === posts[i - 2].cta)
      fails.push(`${channel}: cta "${posts[i].cta}" 3x in a row ending at ${posts[i].id}`);

  console.log(`${channel}: ${n} posts | templates ${JSON.stringify(tCount)} | pillars [${[...pillars]}]`);
}

if (fails.length) { console.error('\nDIVERSITY GATE FAILED:'); fails.forEach(f => console.error(' - ' + f)); process.exit(1); }
console.log('\nDiversity gate PASSED.');
