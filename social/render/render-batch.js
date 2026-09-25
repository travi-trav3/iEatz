// Single render entrypoint. Usage: node render-batch.js batches/<batch>.json
// Batch JSON: { "name": "...", "posts": [{ "file", "w", "h", "template", ...fields,
//   "footer"?, "statSize"?, "headSize"? } | { "file", "w", "h", "slides": [{ "template", ... }] }] }
// Outputs to out/<name>/ (carousels as <file>--01.png ...), HTML to html/<name>/.
// Auto-QA per PNG: dims, every font face, every image loaded. The visual QA gate (open every
// PNG), the diversity gate and the copy gate still apply after.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const { TEMPLATES } = require('./templates');
const { expand, photosOf, htmlDoc, prepare, chromePath, DIR } = require('./doc');

const PHOTO_DIR = path.resolve(DIR, '../../assets/photos');
const PHOTOS = 'file://' + PHOTO_DIR;
const batchPath = process.argv[2];
if (!batchPath) { console.error('usage: node render-batch.js <batch.json>'); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
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
  for (const post of batch.posts) {
    let jobs;
    try { jobs = expand(post); } catch (e) { console.error(`!! ${e.message}`); bad++; continue; }
    for (const p of jobs) {
      n++;
      const t = TEMPLATES[p.template];
      if (!t) { console.error(`!! unknown template "${p.template}" for ${p.file}`); bad++; continue; }
      let html;
      try { html = htmlDoc(await annotate(p), PHOTOS); } catch (e) { console.error(`!! ${e.message}`); bad++; continue; }
      const page = await browser.newPage({ viewport: { width: p.w, height: p.h, deviceScaleFactor: 2 } });
      const hp = path.join(HTMLD, p.file + '.html');
      fs.writeFileSync(hp, html);
      await page.goto('file://' + hp, { waitUntil: 'load' });
      const { imgs, fc } = await prepare(page);
      const buf = await page.screenshot({ clip: { x: 0, y: 0, width: p.w, height: p.h } });
      const outPath = path.join(OUT, p.file + '.png');
      await sharp(buf).resize(p.w, p.h, { fit: 'fill', kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(outPath);
      const m = await sharp(outPath).metadata();
      const photos = photosOf(p);
      const photoOk = imgs.every(i => i.ok) && (!photos.length || imgs.length > 0);
      const fontsOk = Object.values(fc).every(Boolean);
      const ok = m.width === p.w && m.height === p.h && fontsOk && photoOk;
      if (!ok) bad++;
      const fonts = Object.entries(fc).map(([k, v]) => `${k}=${v}`).join(' ');
      const dep = t.deprecated ? ` [deprecated: ${t.deprecated}]` : '';
      console.log(`${ok ? 'OK ' : '!! '}${p.file}.png ${m.width}x${m.height} ${fonts} photo=${photos.join(',') || '(none)'}${photos.length ? '(' + (photoOk ? 'ok' : 'FAIL') + ')' : ''}${dep}`);
      await page.close();
    }
  }
  await browser.close();
  console.log(`\n${n} rendered, ${bad} with automated-QA issues.`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
