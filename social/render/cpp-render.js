// CPP renderer (Jul 2026) — renders the iEatz Healthy Content-Pillars design
// system (social/design-system/cpp) to production PNGs.
//
// The CPP templates are authored as React/Babel JSX (the canonical design
// system, ported in from the Drive "iEatz Healthy Design System" bundle). This
// driver loads the vendored React + ReactDOM + Babel, mounts ONE frame at exact
// pixel size, waits for fonts + images, screenshots at 2x, and downsamples with
// sharp — the same output contract as the other harness scripts.
//
// Usage:
//   node cpp-render.js                       # renders ALL frames (3 carousels + 9 pins)
//   node cpp-render.js pantry                # one pillar, all its frames
//   node cpp-render.js grocery ig 2          # a single frame (kind=ig|pin, index)
//
// Pillars: pantry | health | grocery. Kinds: ig (1080x1350 carousel slide) | pin (1000x1500).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const sharp = require('sharp');

const DIR = __dirname;
const DS = path.resolve(DIR, '../design-system/cpp');
const OUT = path.join(DIR, 'cppout');
fs.mkdirSync(OUT, { recursive: true });

const fileUrl = (p) => 'file://' + p;
const read = (p) => fs.readFileSync(p, 'utf8');

const tokensCss = read(path.join(DS, 'cpp.css'));
const framesCss = read(path.join(DS, 'cpp-frames.css'));
const modShared = read(path.join(DS, 'modules/Shared.jsx'));
const modBadge = read(path.join(DS, 'modules/AppStoreBadge.jsx'));
const modCarousels = read(path.join(DS, 'modules/Carousels.jsx'));
const modPins = read(path.join(DS, 'modules/Pins.jsx'));

// Map each design-system asset id ("assets/<name>") to a file:// URL so the
// templates' resolveSrc(window.__resources[src]) finds the real image/screen.
const assetDir = path.join(DS, 'assets');
const resources = {};
for (const f of fs.readdirSync(assetDir)) resources['assets/' + f] = fileUrl(path.join(assetDir, f));

// Self-hosted marketing fonts already live in the harness (Instrument Serif +
// Inter Tight) — reuse them so there is one font source of truth.
const fontsCss = read(path.join(DIR, 'fonts.css'))
  .replace(/url\(\.\/fonts\//g, 'url(' + fileUrl(path.join(DIR, 'fonts')) + '/');

const SIZES = { ig: { w: 1080, h: 1350 }, pin: { w: 1000, h: 1500 } };

function pageHtml(pillar, kind, idx) {
  const { w, h } = SIZES[kind];
  return `<!doctype html><html><head><meta charset="utf-8">
<style>${fontsCss}</style>
<style>${tokensCss}</style>
<style>${framesCss}</style>
<style>
  html,body{margin:0;background:#fff}
  #root, #root > .ig, #root > .pin{position:absolute;top:0;left:0}
</style>
<script>
  window.__PILLAR_PHOTOS = true;
  window.__PILLAR_TALL = false;
  window.__resources = ${JSON.stringify(resources)};
  window.__FRAME = { pillar:${JSON.stringify(pillar)}, kind:${JSON.stringify(kind)}, idx:${idx} };
</script>
<script src="${fileUrl(path.join(DS, 'vendor/react.development.js'))}"></script>
<script src="${fileUrl(path.join(DS, 'vendor/react-dom.development.js'))}"></script>
<script src="${fileUrl(path.join(DS, 'vendor/babel.min.js'))}"></script>
</head><body>
<div id="root"></div>
<script type="text/babel">${modBadge}</script>
<script type="text/babel">${modShared}</script>
<script type="text/babel">${modCarousels}</script>
<script type="text/babel">${modPins}</script>
<script type="text/babel">
  const F = window.__FRAME;
  const bank = F.kind === 'pin' ? window.PINS : window.CAROUSELS;
  const item = bank[F.pillar][F.idx];
  const cls = (F.kind === 'pin' ? 'pin' : 'ig') + (item.dark ? ' dark' : '');
  const el = React.createElement('div', { className: cls, style: { width: ${w}, height: ${h} } }, item.content);
  ReactDOM.render(el, document.getElementById('root'));
  window.__CAP = item.cap;
</script>
</body></html>`;
}

// Frame catalog — mirrors the design-system caps so filenames are stable/meaningful.
const FRAMES = {
  pantry: { ig: 5, pin: 3 },
  health: { ig: 5, pin: 3 },
  grocery: { ig: 5, pin: 3 },
};
const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

async function renderOne(browser, pillar, kind, idx) {
  const { w, h } = SIZES[kind];
  const page = await browser.newPage({ viewport: { width: w, height: h, deviceScaleFactor: 2 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const hp = path.join(OUT, `_${pillar}-${kind}-${idx}.html`);
  fs.writeFileSync(hp, pageHtml(pillar, kind, idx));
  await page.goto(fileUrl(hp), { waitUntil: 'load' });
  // Wait for React mount, fonts, and every background/img to finish.
  await page.waitForSelector('#root > div', { timeout: 15000 });
  await page.evaluate(async () => {
    const faces = ['400 80px "Instrument Serif"', 'italic 400 80px "Instrument Serif"',
      '600 27px "Inter Tight"', '700 26px "Inter Tight"'];
    await Promise.all(faces.map((f) => document.fonts.load(f).catch(() => {})));
    await document.fonts.ready;
  });
  await page.evaluate(async () => {
    const urls = [];
    document.querySelectorAll('*').forEach((n) => {
      const bg = getComputedStyle(n).backgroundImage;
      const m = bg && bg.match(/url\("?(file:[^")]+)"?\)/);
      if (m) urls.push(m[1]);
    });
    document.querySelectorAll('img').forEach((i) => i.src && urls.push(i.src));
    await Promise.all(urls.map((u) => new Promise((res) => {
      const im = new Image(); im.onload = im.onerror = res; im.src = u;
    })));
  });
  const fc = await page.evaluate(() => ({
    serif: document.fonts.check('400 80px "Instrument Serif"'),
    italic: document.fonts.check('italic 400 80px "Instrument Serif"'),
    sans: document.fonts.check('600 27px "Inter Tight"'),
  }));
  const cap = await page.evaluate(() => window.__CAP || '');
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: w, height: h } });
  const name = `${pillar}-${kind === 'ig' ? 'car' : 'pin'}-${idx + 1}-${slug(cap.split('·').pop() || cap)}`;
  const outPath = path.join(OUT, name + '.png');
  await sharp(buf).resize(w, h, { fit: 'fill', kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(outPath);
  const m = await sharp(outPath).metadata();
  console.log(`✓ ${name}.png ${m.width}x${m.height} serif=${fc.serif} italic=${fc.italic} sans=${fc.sans}${errors.length ? ' ERRORS=' + errors.join('|') : ''}`);
  await page.close();
  return errors.length === 0;
}

(async () => {
  const [argPillar, argKind, argIdx] = process.argv.slice(2);
  const exec = process.env.PW_CHROMIUM ||
    require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null').toString().trim().split(/\s+/)[0];
  const browser = await chromium.launch({ executablePath: exec, args: ['--no-sandbox', '--force-color-profile=srgb'] });
  let ok = true;
  const pillars = argPillar ? [argPillar] : Object.keys(FRAMES);
  for (const pillar of pillars) {
    if (argKind && argIdx != null) {
      ok = (await renderOne(browser, pillar, argKind, Number(argIdx))) && ok;
      continue;
    }
    for (const kind of ['ig', 'pin']) {
      for (let i = 0; i < FRAMES[pillar][kind]; i++) ok = (await renderOne(browser, pillar, kind, i)) && ok;
    }
  }
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
