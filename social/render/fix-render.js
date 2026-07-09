const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const sharp = require('sharp');

const DIR = __dirname;
const PHOTOS = 'file://'+require('path').resolve(__dirname,'../../assets/photos');
const OUT = path.join(DIR, 'fixout');
const PINS = path.join(DIR, 'pins');
fs.mkdirSync(OUT, { recursive: true });
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
const foot = `<div class="foot">${badge}<span class="url">ieatzhealthy.com</span></div>`;

// Pinterest numbered list (reuses base t-list)
const pinList = (p) => `<div class="pin t-list">
  <div class="list-wrap">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    <div class="list">
      ${p.items.map((it,i)=>`<div class="item"><div class="num">${i+1}</div><div class="lab"><span class="t">${it.t}</span><span class="s">${it.s}</span></div></div>`).join('')}
    </div>
  </div>
  ${foot}
</div>`;

// Pinterest price comparison (new)
const pinCompare = (p) => `<div class="pin t-compare">
  <div class="cwrap">
    <div class="eyebrow">${p.eyebrow}</div>
    <div class="prices">
      <div class="pcol"><span class="plabel">Takeout</span><span class="pnum old">$18</span></div>
      <span class="arrow">&rarr;</span>
      <div class="pcol"><span class="plabel">Made at home</span><span class="pnum new">$6</span></div>
    </div>
    <h1 class="head">${p.head}</h1>
    <div class="stat-body"><span class="rule"></span><p>${p.body}</p></div>
  </div>
  ${foot}
</div>`;

// IG photo card (1080x1350)
const igPhoto = (p) => `<div class="pin ig-photo">
  <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
  <div class="panel">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    ${p.chips?`<div class="chips">${p.chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div>`:''}
    <div class="spacer"></div>
    ${foot}
  </div>
</div>`;

// IG recipe card, typographic (1080x1350) — no photo
const igRecipe = (p) => `<div class="pin ig-recipe">
  <div class="rwrap">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    <div class="need">You need</div>
    <div class="ings">${p.ings.map(x=>`<span class="ing">${x}</span>`).join('')}</div>
    <div class="method"><span class="rule"></span><p>${p.method}</p></div>
  </div>
  ${foot}
</div>`;

const EXTRA = `
/* size override injected per pin */
/* ---- Pinterest compare ---- */
.t-compare{padding:96px 88px 64px;display:flex;flex-direction:column}
.t-compare .cwrap{flex:1;display:flex;flex-direction:column;justify-content:center}
.t-compare .prices{display:flex;align-items:center;gap:40px;margin:8px 0 8px}
.t-compare .pcol{display:flex;flex-direction:column;gap:8px}
.t-compare .plabel{font-family:var(--sans);font-weight:600;font-size:22px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-light)}
.t-compare .pnum{font-family:var(--serif);font-style:italic;font-weight:400;line-height:0.85;letter-spacing:-0.02em}
.t-compare .pnum.old{font-size:150px;color:var(--ink-faint);text-decoration:line-through;text-decoration-thickness:5px}
.t-compare .pnum.new{font-size:220px;color:var(--green)}
.t-compare .arrow{font-family:var(--sans);font-size:64px;color:var(--ink-light);margin-top:26px}
.t-compare .head{font-size:78px;margin-top:26px}
.t-compare .stat-body{display:flex;gap:24px;margin-top:32px;max-width:760px}
.t-compare .stat-body .rule{width:46px;height:3px;background:var(--green);margin-top:18px;flex:none}
.t-compare .stat-body p{font-family:var(--sans);font-size:29px;line-height:1.46;color:var(--ink-medium)}
/* ---- IG photo card ---- */
.ig-photo{display:flex;flex-direction:column}
.ig-photo .hero{width:100%;height:760px;overflow:hidden;position:relative}
.ig-photo .hero img{width:100%;height:100%;object-fit:cover;display:block}
.ig-photo .hero::after{content:"";position:absolute;inset:0;box-shadow:inset 0 -70px 80px -55px rgba(10,15,12,0.26)}
.ig-photo .panel{flex:1;background:var(--paper);padding:60px 66px 54px;display:flex;flex-direction:column}
.ig-photo .head{font-size:66px;margin-top:16px}
.ig-photo .chips{margin-top:26px}
.ig-photo .spacer{flex:1;min-height:18px}
/* ---- IG recipe card ---- */
.ig-recipe{padding:76px 72px 54px;display:flex;flex-direction:column}
.ig-recipe .rwrap{flex:1;display:flex;flex-direction:column;justify-content:center}
.ig-recipe .head{font-size:96px;margin-top:14px}
.ig-recipe .need{font-family:var(--sans);font-weight:600;font-size:22px;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink-light);margin-top:48px}
.ig-recipe .ings{display:flex;flex-wrap:wrap;gap:16px;margin-top:22px}
.ig-recipe .ing{font-family:var(--sans);font-weight:600;font-size:30px;color:var(--green-dark);background:var(--green-light);padding:16px 28px;border-radius:999px}
.ig-recipe .method{display:flex;gap:24px;margin-top:44px;max-width:840px}
.ig-recipe .method .rule{width:46px;height:3px;background:var(--green);margin-top:18px;flex:none}
.ig-recipe .method p{font-family:var(--serif);font-size:46px;line-height:1.15;color:var(--ink)}
`;

const html = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../fonts.css">
<style>${baseCss}${EXTRA}
html,body{width:${p.w}px;height:${p.h}px}.pin{width:${p.w}px;height:${p.h}px}
</style></head><body>${p.render(p)}</body></html>`;

const pins = [
  { file:'fix-leftover-rice', w:1000, h:1500, render:pinList, eyebrow:'No-waste cooking',
    head:`<span class="accent">5 meals</span> from leftover rice.`, items:[
      {t:'Kimchi fried rice', s:'Rice, kimchi, a fried egg on top'},
      {t:'Stuffed peppers', s:'Rice, beans, whatever cheese you have'},
      {t:'Egg fried rice', s:'The 10-minute weeknight classic'},
      {t:'Rice pudding', s:'Milk, cinnamon, a little honey'},
      {t:'Crispy rice salad', s:'Pan-crisped rice over fresh greens'},
    ]},
  { file:'fix-poke', w:1000, h:1500, render:pinCompare, eyebrow:'Eat this, not that',
    head:`Restaurant poke, made at home.`,
    body:`A restaurant poke bowl runs about $18. Build the same thing in 25 minutes for around $6 with what's already in your kitchen.` },
  { file:'fix-chickpea', w:1080, h:1350, render:igPhoto, photo:'buddha-bowl.jpg', eyebrow:'Pantry staple',
    head:`4 dinners from <span class="accent">one can of chickpeas.</span>`, chips:['4 recipes','Under 20 min','Plant-based'] },
  { file:'fix-shakshuka', w:1080, h:1350, render:igRecipe, eyebrow:'20-minute one-pan dinner',
    head:`Skillet <span class="accent">shakshuka.</span>`,
    ings:['Canned tomatoes','Eggs','Onion + garlic','Cumin + paprika'],
    method:`Simmer the tomatoes with the spices, crack the eggs right into the pan, cover until just set. One pan, twenty minutes.` },
];

(async () => {
  const browser = await chromium.launch({ executablePath: (process.env.PW_CHROMIUM || require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null').toString().trim().split('
')[0]), args:['--no-sandbox','--force-color-profile=srgb'] });
  const report=[];
  for (const p of pins) {
    const page = await browser.newPage({ viewport:{ width:p.w, height:p.h, deviceScaleFactor:2 } });
    const hp = path.join(PINS, p.file + '.html');
    fs.writeFileSync(hp, html(p));
    await page.goto('file://' + hp, { waitUntil:'load' });
    await page.evaluate(async()=>{ await document.fonts.ready; });
    const imgs = await page.evaluate(async()=>{const a=[...document.images];await Promise.all(a.map(i=>i.complete&&i.naturalWidth?0:new Promise(r=>{i.onload=i.onerror=r})));return a.map(i=>({s:i.currentSrc.split('/').pop(),w:i.naturalWidth,ok:i.naturalWidth>0}));});
    const fc = await page.evaluate(()=>({serif:document.fonts.check('400 80px "Instrument Serif"'),italic:document.fonts.check('italic 400 80px "Instrument Serif"'),sans:document.fonts.check('600 27px "Inter Tight"')}));
    const buf = await page.screenshot({ clip:{ x:0,y:0,width:p.w,height:p.h } });
    const outPath = path.join(OUT, p.file + '.png');
    await sharp(buf).resize(p.w, p.h, { fit:'fill', kernel:'lanczos3' }).png({ compressionLevel:9 }).toFile(outPath);
    const m = await sharp(outPath).metadata();
    report.push({ file:p.file, dim:`${m.width}x${m.height}`, fc, imgs });
    console.log(`✓ ${p.file}.png ${m.width}x${m.height} serif=${fc.serif} italic=${fc.italic} sans=${fc.sans} imgs=${imgs.map(i=>i.s+'('+i.w+(i.ok?'':' FAIL')+')').join(',')||'none'}`);
    await page.close();
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
