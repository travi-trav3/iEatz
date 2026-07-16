// Grid-variety fix: 3 new IG shells (deep-green stat, full-bleed photo, dark quote overlay)
// so the grid rotates SURFACES (paper / deep green / photo), not just templates.
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
const badgeDark = `<div class="badge on-dark">${MARK}<span>iEatz Healthy</span></div>`;

// ---- Shell A: deep-green stat / typographic ----
const igStatDark = (p) => `<div class="pin ig-statdark">
  <div class="swrap">
    <div class="eyebrow mint">${p.eyebrow}</div>
    <div class="bignum">${p.stat}</div>
    <h1 class="subhead">${p.sub}</h1>
    <div class="stat-body"><span class="rule"></span><p>${p.body}</p></div>
  </div>
  <div class="foot-dark">${badgeDark}<span class="url">ieatzhealthy.com</span></div>
</div>`;

// ---- Shell B: full-bleed photo, scrim, overlay headline ----
const igFullBleed = (p) => `<div class="pin ig-bleed">
  <img class="bg" src="${PHOTOS}/${p.photo}" alt="">
  <div class="scrim"></div>
  <div class="bwrap">
    <div class="eyebrow mint">${p.eyebrow}</div>
    <h1 class="bhead">${p.head}</h1>
    ${p.sub ? `<p class="bsub">${p.sub}</p>` : ''}
  </div>
  <div class="foot-dark abs">${badgeDark}<span class="url">ieatzhealthy.com</span></div>
</div>`;

// ---- Shell C: dark quote overlay (testimonial on lifestyle photo) ----
const igQuoteDark = (p) => `<div class="pin ig-quotedark">
  <img class="bg" src="${PHOTOS}/${p.photo}" alt="">
  <div class="scrim heavy"></div>
  <div class="qwrap">
    <div class="eyebrow mint">${p.eyebrow}</div>
    <h1 class="quote">${p.quote}</h1>
    <div class="attr">${p.attr}</div>
  </div>
  <div class="foot-dark abs">${badgeDark}<span class="url">ieatzhealthy.com</span></div>
</div>`;

const EXTRA = `
.eyebrow.mint{color:var(--mark-mint)}
.foot-dark{display:flex;align-items:center;justify-content:space-between;padding:0}
.foot-dark .url{font-family:var(--sans);font-weight:600;font-size:24px;color:rgba(245,242,234,0.66)}
.foot-dark.abs{position:absolute;left:72px;right:72px;bottom:56px}
/* Shell A: deep green */
.ig-statdark{background:var(--green-deep);padding:88px 80px 56px;display:flex;flex-direction:column}
.ig-statdark .swrap{flex:1;display:flex;flex-direction:column;justify-content:center}
.ig-statdark .bignum{font-family:var(--serif);font-style:italic;font-weight:400;color:var(--mark-mint);line-height:0.9;letter-spacing:-0.02em;margin-top:26px}
.ig-statdark .subhead{font-family:var(--serif);font-weight:400;font-size:64px;line-height:1.04;letter-spacing:-0.01em;color:var(--paper);margin-top:30px;max-width:860px}
.ig-statdark .stat-body{display:flex;gap:24px;margin-top:42px;max-width:800px}
.ig-statdark .stat-body .rule{width:46px;height:3px;background:var(--mark-mint);margin-top:18px;flex:none}
.ig-statdark .stat-body p{font-family:var(--sans);font-size:29px;line-height:1.5;color:rgba(245,242,234,0.82)}
/* Shell B: full bleed */
.ig-bleed{background:var(--ink)}
.ig-bleed .bg,.ig-quotedark .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,15,12,0.10) 0%,rgba(10,15,12,0.06) 34%,rgba(10,15,12,0.82) 86%)}
.scrim.heavy{background:linear-gradient(180deg,rgba(10,15,12,0.46) 0%,rgba(10,15,12,0.52) 40%,rgba(10,15,12,0.88) 88%)}
.ig-bleed .bwrap{position:absolute;left:72px;right:72px;bottom:170px}
.ig-bleed .bhead{font-family:var(--serif);font-weight:400;font-size:92px;line-height:0.99;letter-spacing:-0.01em;color:var(--paper)}
.ig-bleed .bhead .accent{color:var(--mark-mint);font-style:italic}
.ig-bleed .bsub{font-family:var(--sans);font-size:29px;line-height:1.45;color:rgba(245,242,234,0.85);margin-top:26px;max-width:800px}
.ig-bleed .eyebrow,.ig-quotedark .eyebrow{margin-bottom:22px}
/* Shell C: quote overlay */
.ig-quotedark{background:var(--ink)}
.ig-quotedark .qwrap{position:absolute;left:72px;right:72px;bottom:170px}
.ig-quotedark .quote{font-family:var(--serif);font-weight:400;font-size:76px;line-height:1.06;letter-spacing:-0.01em;color:var(--paper)}
.ig-quotedark .quote .accent{color:var(--mark-mint);font-style:italic}
.ig-quotedark .attr{font-family:var(--sans);font-weight:600;font-size:24px;letter-spacing:0.12em;text-transform:uppercase;color:var(--mark-mint);margin-top:34px}
`;

const html = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../fonts.css">
<style>${baseCss}${EXTRA}
html,body{width:1080px;height:1350px;margin:0}.pin{width:1080px;height:1350px}
.ig-statdark .bignum{font-size:${p.statSize || 300}px}
</style></head><body>${p.render(p)}</body></html>`;

const posts = [
  { file:'jul19-ig-money-waste-v2', render:igStatDark, statSize:290,
    eyebrow:'The pantry math', stat:'$1,500',
    sub:'of groceries thrown out per household, <span style="color:var(--mark-mint);font-style:italic">every year.</span>',
    body:'Most of it is food that never got cooked. iEatz turns what’s already in your kitchen into dinner — so it gets eaten, not tossed.' },
  { file:'jul21-ig-grocery-v2', render:igFullBleed, photo:'grocery/woman-grocery-shopping.jpg',
    eyebrow:'Grocery to table',
    head:'One grocery run, <span class="accent">a week of dinners.</span>',
    sub:'Scan the receipt — iEatz plans five healthy meals from what you bought.' },
  { file:'jul25-ig-transformation-v2', render:igQuoteDark, photo:'lifestyle/woman-in-kitchen.jpg',
    eyebrow:'From the App Store reviews',
    quote:'“Three weeks in and I haven’t ordered takeout once. I just cook <span class="accent">what’s already in my kitchen.</span>”',
    attr:'— Ashly H., iEatz user' },
  { file:'jul29-ig-health-diet-v2', render:igStatDark, statSize:330,
    eyebrow:'High-protein, zero prep', stat:'30 g',
    sub:'of protein per serving — from groceries <span style="color:var(--mark-mint);font-style:italic">you already bought.</span>',
    body:'No Sunday prep, no macro math. iEatz builds high-protein dinners from your receipt. Macros are estimates per serving.' },
  { file:'jul31-ig-lifestyle-v2', render:igFullBleed, photo:'lifestyle/couple-cooking.jpg',
    eyebrow:'Weeknight, handled',
    head:'Tonight’s dinner is <span class="accent">already in your kitchen.</span>',
    sub:'No takeout, no planning — a 15-minute recipe iEatz found on the receipt.' },
];

(async () => {
  const exec = process.env.PW_CHROMIUM ||
    require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null')
      .toString().trim().split(/\s+/)[0];
  const browser = await chromium.launch({ executablePath: exec, args:['--no-sandbox','--force-color-profile=srgb'] });
  for (const p of posts) {
    const page = await browser.newPage({ viewport:{ width:1080, height:1350, deviceScaleFactor:2 } });
    const hp = path.join(HTMLDIR, p.file + '.html');
    fs.writeFileSync(hp, html(p));
    await page.goto('file://' + hp, { waitUntil:'load' });
    await page.evaluate(async()=>{ await document.fonts.ready; });
    const imgs = await page.evaluate(async()=>{const a=[...document.images];await Promise.all(a.map(i=>i.complete&&i.naturalWidth?0:new Promise(r=>{i.onload=i.onerror=r})));return a.map(i=>({s:i.currentSrc.split('/').pop(),w:i.naturalWidth,ok:i.naturalWidth>0}));});
    const fc = await page.evaluate(()=>({serif:document.fonts.check('400 80px "Instrument Serif"'),italic:document.fonts.check('italic 400 80px "Instrument Serif"'),sans:document.fonts.check('600 27px "Inter Tight"')}));
    const buf = await page.screenshot({ clip:{ x:0,y:0,width:1080,height:1350 } });
    const outPath = path.join(OUT, p.file + '.png');
    await sharp(buf).resize(1080, 1350, { fit:'fill', kernel:'lanczos3' }).png({ compressionLevel:9 }).toFile(outPath);
    const m = await sharp(outPath).metadata();
    console.log(`✓ ${p.file}.png ${m.width}x${m.height} serif=${fc.serif} italic=${fc.italic} sans=${fc.sans} imgs=${imgs.map(i=>i.s+'('+i.w+(i.ok?'':' FAIL')+')').join(',')||'none'}`);
    await page.close();
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
