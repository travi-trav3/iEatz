// Single render entrypoint. Usage: node render-batch.js batches/<batch>.json [--only <file>]
// --only renders one post (its "file", e.g. p25-pin-poster; a carousel renders all its slides).
// Batch JSON: { "name": "...", "posts": [{ "file", "w", "h", "template", ...fields,
//   "footer"?, "statSize"?, "headSize"? } | { "file", "w", "h", "slides": [{ "template", ... }] }] }
// Outputs to out/<name>/ (carousels as <file>--01.png ...), HTML to html/<name>/.
// Batches with "createdAt" >= 2026-09-25 are v2: photos are graded (per-post "grade": false
// opts out) and every photo-bearing post or slide needs a "photoClaim". Older batches render
// exactly as they always did.
// Auto-QA per PNG: dims, every font face, every image loaded, photoClaim (v2). The visual QA
// gate (open every PNG), the diversity gate and the copy gate still apply after.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const { TEMPLATES } = require('./templates');
const { expand, photosOf, htmlDoc, prepare, chromePath, DIR } = require('./doc');
const { isV2, gradeOn, applyGrade } = require('./grade');

const PHOTO_DIR = path.resolve(DIR, '../../assets/photos');
const PHOTO_FLAG = {};
for (const ph of JSON.parse(fs.readFileSync(path.join(PHOTO_DIR, 'photos.json'), 'utf8')).photos) if (ph.flag) PHOTO_FLAG[ph.file] = ph.flag;
const PHOTOS = 'file://' + PHOTO_DIR;
const batchPath = process.argv[2];
if (!batchPath) { console.error('usage: node render-batch.js <batch.json> [--only <file>]'); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
const oi = process.argv.indexOf('--only');
const only = oi > 0 ? process.argv[oi + 1] : null;
const posts = only ? batch.posts.filter(p => p.file === only) : batch.posts;
if (only && !posts.length) { console.error(`!! no post with file "${only}" in ${batchPath}`); process.exit(1); }
const OUT = path.join(DIR, 'out', batch.name);
const HTMLD = path.join(DIR, 'html', batch.name);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(HTMLD, { recursive: true });

// sharpie: mean luminance of the photo's top band decides whether the headline gets a light shade.
async function annotate(p) {
  if (p.template === 'sharpie' && p.photo && p.shade == null) {
    const src = path.join(PHOTO_DIR, p.photo);
    const m = await sharp(src).metadata();
    const band = await sharp(src).extract({ left: 0, top: 0, width: m.width, height: Math.max(1, Math.round(m.height * 0.22)) }).stats();
    const [r, g, b] = band.channels.map(c => c.mean / 255);
    p._topLum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return p;
}

(async () => {
  const browser = await chromium.launch({ executablePath: chromePath(), args: ['--no-sandbox', '--force-color-profile=srgb'] });
  let bad = 0, n = 0;
  for (const post of posts) {
    let jobs;
    try { jobs = expand({ createdAt: batch.createdAt, ...post }); } catch (e) { console.error(`!! ${e.message}`); bad++; continue; }
    for (const p of jobs) {
      n++;
      const t = TEMPLATES[p.template];
      if (!t) { console.error(`!! unknown template "${p.template}" for ${p.file}`); bad++; continue; }
      const photos = photosOf(p);
      // photos.json flags "low-res" (under 1600 px) and "brand-in-frame" (a logo, a retailer, a
      // third-party screen) refuse the photo at render (R10, Oct 22 2026): the batch has to pick
      // another shot instead of shipping a soft or off-brand frame.
      const refused = photos.map(f => [f, PHOTO_FLAG[f]]).filter(([, fl]) => fl && /low-res|brand-in-frame/.test(fl));
      if (refused.length) { console.error(`!! ${p.file}: photo refused: ${refused.map(([f, fl]) => `${f} (${fl})`).join(', ')}`); bad++; continue; }
      const graded = photos.some(f => !/^app-/.test(path.basename(f))) && gradeOn(p, batch);
      const claimMissing = isV2(batch, p) && photos.length > 0 && !p.photoClaim;
      let html;
      try { html = htmlDoc(await annotate(graded ? await applyGrade(p) : p), PHOTOS); } catch (e) { console.error(`!! ${e.message}`); bad++; continue; }
      const page = await browser.newPage({ viewport: { width: p.w, height: p.h, deviceScaleFactor: 2 } });
      const hp = path.join(HTMLD, p.file + '.html');
      fs.writeFileSync(hp, html);
      await page.goto('file://' + hp, { waitUntil: 'load' });
      const { imgs, fc, safe } = await prepare(page);
      const buf = await page.screenshot({ clip: { x: 0, y: 0, width: p.w, height: p.h } });
      const outPath = path.join(OUT, p.file + '.png');
      await sharp(buf).resize(p.w, p.h, { fit: 'fill', kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(outPath);
      const m = await sharp(outPath).metadata();
      const photoOk = imgs.every(i => i.ok) && (!photos.length || imgs.length > 0);
      const fontsOk = Object.values(fc).every(Boolean);
      const ok = m.width === p.w && m.height === p.h && fontsOk && photoOk && !claimMissing && !safe.length;
      if (!ok) bad++;
      const fonts = Object.entries(fc).map(([k, v]) => `${k}=${v}`).join(' ');
      const dep = t.deprecated ? ` [deprecated: ${t.deprecated}]` : '';
      const extra = (graded ? ' grade=on' : '') + (p.grain === true || (p.template === 'collage' && p.grain !== false) ? ' grain=on' : '') + (claimMissing ? ' photoClaim=MISSING' : '')
        + (safe.length ? ` safe=FAIL: ${safe.join('; ')}` : '');
      console.log(`${ok ? 'OK ' : '!! '}${p.file}.png ${m.width}x${m.height} ${fonts} photo=${photos.join(',') || '(none)'}${photos.length ? '(' + (photoOk ? 'ok' : 'FAIL') + ')' : ''}${extra}${dep}`);
      await page.close();
    }
  }
  await browser.close();
  console.log(`\n${n} rendered, ${bad} with automated-QA issues.`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
