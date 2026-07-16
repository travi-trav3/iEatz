// Template-depth fix (Jul 2026): port the missing IG templates from the
// iEatz Healthy Design System (Drive: ui_kits/instagram/Templates.jsx) into
// this harness, so the grid rotates through the FULL template depth:
//   ig-steps      <- TplThreeSteps  (numbered white cards on paper)  [NEW]
//   ig-recipehero <- TplRecipeHero  (photo-dominant recipe feature)  [NEW]
//   ig-cta        <- TplCTA         (closing CTA slide)              [NEW, available]
// Already ported elsewhere: EditorialTitle (t-photo), BigStat (t-stat/ig-statdark),
// Quote (ig-quotedark), plus grid-fix shells ig-bleed.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const sharp = require('sharp');

const DIR = __dirname;
const PHOTOS = 'file://' + path.resolve(DIR, '../../assets/photos');
const OUT = path.join(DIR, 'gridout');
const HTMLDIR = path.join(DIR, 'gridpins');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(HTMLDIR, { recursive: true });
const baseCss = fs.readFileSync(path.join(DIR, 'base.css'), 'utf8');

const MARK = `<svg class="mark" viewBox="0 0 38.25 58.486" fill="none">
<path d="M 0 5.03 C 0 2.252 2.252 0 5.03 0 L 33.22 0 C 35.998 0 38.25 2.252 38.25 5.03 L 38.25 20.119 L 0 20.119 L 0 5.03 Z" fill="currentColor"></path>
<path d="M 0 49.83 C 0 52.608 2.252 54.86 5.03 54.86 L 33.22 54.86 C 35.998 54.86 38.25 52.608 38.25 49.83 L 38.25 22.81 L 0 22.81 L 0 49.83 Z" fill="currentColor"></path>
<path d="M 6.083 6.2 C 6.083 5.489 6.659 4.913 7.369 4.913 C 8.08 4.913 8.656 5.489 8.656 6.2 L 8.656 16.259 C 8.656 16.97 8.08 17.546 7.369 17.546 C 6.659 17.546 6.083 16.97 6.083 16.259 L 6.083 6.2 Z" fill="currentColor"></path>
<path d="M 6.083 26.787 C 6.083 26.076 6.659 25.5 7.369 25.5 C 8.08 25.5 8.656 26.076 8.656 26.787 L 8.656 36.846 C 8.656 37.557 8.08 38.133 7.369 38.133 C 6.659 38.133 6.083 37.557 6.083 36.846 L 6.083 26.787 Z" fill="currentColor"></path>
<path d="M 5.264 54.86 L 10.878 54.86 L 9.892 57.771 C 9.748 58.199 9.347 58.486 8.895 58.486 L 7.2 58.486 C 6.743 58.486 6.338 58.192 6.198 57.757 L 5.264 54.86 Z" fill="currentColor"></path>
<path d="M 27.489 54.86 L 33.103 54.86 L 32.117 57.771 C 31.972 58.199 31.571 58.486 31.12 58.486 L 29.425 58.486 C 28.968 58.486 28.563 58.192 28.423 57.757 L 27.489 54.86 Z" fill="currentColor"></path>
</svg>`;
const badge = `<div class="badge">${MARK}<span>iEatz Healthy</span></div>`;
const badgeDark = `<div class="badge on-dark">${MARK}<span>iEatz Healthy</span></div>`;

// ---- Shell D: ig-steps (TplThreeSteps) — numbered white cards on paper ----
const igSteps = (p) => `<div class="pin ig-steps">
  <div class="eyebrow">${p.eyebrow}</div>
  <h1 class="head shead">${p.head}</h1>
  <div class="cards">
    ${p.steps.map((s, i) => `<div class="card">
      <div class="num">0${i + 1}</div>
      <div>
        <div class="ctitle">${s.title}</div>
        <div class="cnote">${s.note}</div>
      </div>
    </div>`).join('')}
  </div>
  <div class="foot-light">${badge}<span class="url">ieatzhealthy.com</span></div>
</div>`;

// ---- Shell E: ig-recipehero (TplRecipeHero) — photo-dominant recipe feature ----
const igRecipeHero = (p) => `<div class="pin ig-recipehero">
  <div class="hero"><img src="${PHOTOS}/${p.photo}" style="object-position:${p.pos || 'center'}"></div>
  <div class="rwrap">
    <div class="chips">${p.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>
    <h1 class="head rhead">${p.head}</h1>
  </div>
  <div class="foot-light abs">${badge}<span class="url">ieatzhealthy.com</span></div>
</div>`;

// ---- Shell F: ig-cta (TplCTA) — closing CTA slide (available for future batches) ----
const igCta = (p) => `<div class="pin ig-cta">
  <div class="eyebrow">${p.eyebrow}</div>
  <h1 class="head chead">${p.head}</h1>
  <p class="csub">${p.sub}</p>
  <div class="btns"><span class="btn-solid">${p.cta}</span><span class="btn-ghost">${p.handle}</span></div>
  <div class="foot-light abs">${badge}<span class="url">ieatzhealthy.com</span></div>
</div>`;

const EXTRA = `
.foot-light{display:flex;align-items:center;justify-content:space-between}
.foot-light .url{font-family:var(--sans);font-weight:600;font-size:24px;color:var(--ink-light)}
.foot-light.abs{position:absolute;left:80px;right:80px;bottom:56px}
/* Shell D: three steps on paper */
.ig-steps{background:var(--paper);padding:96px 80px 56px;display:flex;flex-direction:column}
.ig-steps .shead{font-size:88px;margin-top:30px;max-width:880px}
.ig-steps .cards{flex:1;display:flex;flex-direction:column;justify-content:center;gap:30px;margin:44px 0 30px}
.ig-steps .card{display:grid;grid-template-columns:132px 1fr;align-items:start;gap:30px;background:var(--white);border-radius:24px;padding:36px 40px;box-shadow:0 2px 6px rgba(14,74,42,0.05),0 8px 24px rgba(14,74,42,0.07)}
.ig-steps .num{font-family:var(--serif);font-style:italic;font-weight:400;font-size:82px;line-height:1;letter-spacing:-0.02em;color:var(--green)}
.ig-steps .ctitle{font-family:var(--serif);font-weight:400;font-size:44px;line-height:1.05;letter-spacing:-0.01em;color:var(--ink)}
.ig-steps .cnote{font-family:var(--sans);font-size:25px;line-height:1.42;color:var(--ink-medium);margin-top:10px}
/* Shell E: recipe hero — photo top ~66%, paper below, pills + tight headline */
.ig-recipehero{background:var(--paper)}
.ig-recipehero .hero{position:absolute;top:0;left:0;right:0;height:850px;overflow:hidden}
.ig-recipehero .hero img{width:100%;height:100%;object-fit:cover;display:block}
.ig-recipehero .hero::after{content:"";position:absolute;inset:0;box-shadow:inset 0 -70px 80px -60px rgba(10,15,12,0.20)}
.ig-recipehero .rwrap{position:absolute;left:80px;right:80px;top:906px}
.ig-recipehero .chips{margin-bottom:34px}
.ig-recipehero .rhead{font-size:92px;line-height:1.0}
/* Shell F: CTA slide */
.ig-cta{background:var(--paper);padding:230px 80px 56px}
.ig-cta .chead{font-size:124px;line-height:0.98;letter-spacing:-0.02em;margin-top:40px;max-width:900px}
.ig-cta .csub{font-family:var(--sans);font-size:32px;line-height:1.45;color:var(--ink-medium);margin-top:52px;max-width:780px}
.ig-cta .btns{display:flex;gap:24px;position:absolute;left:80px;bottom:250px}
.ig-cta .btn-solid{background:var(--green-dark);color:#fff;border-radius:20px;padding:30px 52px;font-family:var(--sans);font-size:30px;font-weight:600}
.ig-cta .btn-ghost{border:2px solid var(--ink-faint);color:var(--ink);border-radius:20px;padding:28px 46px;font-family:var(--sans);font-size:30px;font-weight:600}
`;

const html = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../fonts.css">
<style>${baseCss}${EXTRA}
html,body{width:1080px;height:1350px;margin:0}.pin{width:1080px;height:1350px}
</style></head><body>${p.render(p)}</body></html>`;

const posts = [
  { file: 'jul17-ig-recipe-shakshuka-v2', render: igSteps,
    eyebrow: '20-minute one-pan dinner',
    head: 'Skillet shakshuka, in <span class="accent">three moves.</span>',
    steps: [
      { title: 'Simmer the tomatoes.', note: 'Canned tomatoes, onion, garlic, cumin and paprika — one skillet.' },
      { title: 'Crack the eggs right in.', note: 'Straight into the sauce. No second pan.' },
      { title: 'Cover until just set.', note: 'Twenty minutes total — dinner that looks like an hour.' },
    ] },
  { file: 'jul18-ig-recipe-pasta-v2', render: igRecipeHero,
    photo: 'food/pesto-pasta-bowl.jpg', pos: '62% center',
    chips: ['20 min', 'One pan', '5 ingredients'],
    head: '20-minute <span class="accent">weeknight pasta.</span>' },
];

(async () => {
  const exec = process.env.PW_CHROMIUM ||
    require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null')
      .toString().trim().split(/\s+/)[0];
  const browser = await chromium.launch({ executablePath: exec, args: ['--no-sandbox', '--force-color-profile=srgb'] });
  for (const p of posts) {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350, deviceScaleFactor: 2 } });
    const hp = path.join(HTMLDIR, p.file + '.html');
    fs.writeFileSync(hp, html(p));
    await page.goto('file://' + hp, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    const imgs = await page.evaluate(async () => { const a = [...document.images]; await Promise.all(a.map(i => i.complete && i.naturalWidth ? 0 : new Promise(r => { i.onload = i.onerror = r }))); return a.map(i => ({ s: i.currentSrc.split('/').pop(), w: i.naturalWidth, ok: i.naturalWidth > 0 })); });
    const fc = await page.evaluate(() => ({ serif: document.fonts.check('400 80px "Instrument Serif"'), italic: document.fonts.check('italic 400 80px "Instrument Serif"'), sans: document.fonts.check('600 27px "Inter Tight"') }));
    const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    const outPath = path.join(OUT, p.file + '.png');
    await sharp(buf).resize(1080, 1350, { fit: 'fill', kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(outPath);
    const m = await sharp(outPath).metadata();
    console.log(`✓ ${p.file}.png ${m.width}x${m.height} serif=${fc.serif} italic=${fc.italic} sans=${fc.sans} imgs=${imgs.map(i => i.s + '(' + i.w + (i.ok ? '' : ' FAIL') + ')').join(',') || 'none'}`);
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1) });
