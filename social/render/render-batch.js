// Single render entrypoint. Usage: node render-batch.js batches/<batch>.json
// Batch JSON: { "name": "...", "posts": [{ "file", "w", "h", "template", ...fields,
//   "statSize"?, "headSize"? }] }
// Outputs to out/<name>/, HTML to html/<name>/. Auto-QA: dims, fonts, photo load.
// The visual QA gate (open every PNG) and the batch diversity gate still apply after.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const { TEMPLATES } = require('./templates');

const DIR = __dirname;
const PHOTOS = 'file://' + path.resolve(DIR, '../../assets/photos');
const batchPath = process.argv[2];
if (!batchPath) { console.error('usage: node render-batch.js <batch.json>'); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
const OUT = path.join(DIR, 'out', batch.name);
const HTMLD = path.join(DIR, 'html', batch.name);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(HTMLD, { recursive: true });
const baseCss = fs.readFileSync(path.join(DIR, 'base.css'), 'utf8');

const htmlDoc = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${DIR}/fonts.css">
<style>${baseCss}
html,body{width:${p.w}px;height:${p.h}px;margin:0}.pin{width:${p.w}px;height:${p.h}px}
${p.statSize ? `.ig-statdark .bignum{font-size:${p.statSize}px}` : ''}
${p.headSize ? `.ig-bleed .bhead{font-size:${p.headSize}px}` : ''}
</style></head><body>${TEMPLATES[p.template].render(p, PHOTOS)}</body></html>`;

(async () => {
  const exec = require('child_process');
  const chromePath = process.env.PW_CHROMIUM ||
    exec.execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null').toString().trim().split('\n')[0];
  const browser = await chromium.launch({ executablePath: chromePath, args: ['--no-sandbox', '--force-color-profile=srgb'] });
  let bad = 0;
  for (const p of batch.posts) {
    if (!TEMPLATES[p.template]) { console.error(`!! unknown template "${p.template}" for ${p.file}`); bad++; continue; }
    const page = await browser.newPage({ viewport: { width: p.w, height: p.h, deviceScaleFactor: 2 } });
    const hp = path.join(HTMLD, p.file + '.html');
    fs.writeFileSync(hp, htmlDoc(p));
    await page.goto('file://' + hp, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    const imgs = await page.evaluate(async () => {
      const a = [...document.images];
      await Promise.all(a.map(i => i.complete && i.naturalWidth ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
      return a.map(i => ({ w: i.naturalWidth, ok: i.naturalWidth > 0 }));
    });
    const fc = await page.evaluate(() => ({
      serif: document.fonts.check('400 80px "Instrument Serif"'),
      italic: document.fonts.check('italic 400 80px "Instrument Serif"'),
      sans: document.fonts.check('600 27px "Inter Tight"'),
    }));
    const buf = await page.screenshot({ clip: { x: 0, y: 0, width: p.w, height: p.h } });
    const outPath = path.join(OUT, p.file + '.png');
    await sharp(buf).resize(p.w, p.h, { fit: 'fill', kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(outPath);
    const m = await sharp(outPath).metadata();
    const photoOk = p.photo ? imgs.some(i => i.ok) : true;
    const ok = m.width === p.w && m.height === p.h && fc.serif && fc.italic && fc.sans && photoOk;
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : '!! '}${p.file}.png ${m.width}x${m.height} serif=${fc.serif} italic=${fc.italic} sans=${fc.sans} photo=${p.photo || '(none)'}${p.photo ? '(' + (photoOk ? 'ok' : 'FAIL') + ')' : ''}`);
    await page.close();
  }
  await browser.close();
  console.log(`\n${batch.posts.length} rendered, ${bad} with automated-QA issues.`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
