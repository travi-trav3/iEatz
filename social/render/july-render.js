const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const sharp = require('sharp');

const DIR = __dirname;
const PHOTOS = 'file://' + path.resolve(__dirname, '../../assets/photos');
const OUT = path.join(DIR, 'julyout');
const HTMLD = path.join(DIR, 'julyhtml');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(HTMLD, { recursive: true });
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

// ---------- templates (proven in render.js / fix-render.js) ----------
const tPhoto = (p) => `<div class="pin t-photo">
  <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
  <div class="panel">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    ${p.chips ? `<div class="chips">${p.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>` : ''}
    <div class="spacer"></div>
    ${foot}
  </div>
</div>`;

const pinList = (p) => `<div class="pin t-list">
  <div class="list-wrap">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    <div class="list">
      ${p.items.map((it, i) => `<div class="item"><div class="num">${i + 1}</div><div class="lab"><span class="t">${it.t}</span><span class="s">${it.s}</span></div></div>`).join('')}
    </div>
  </div>
  ${foot}
</div>`;

const igPhoto = (p) => `<div class="pin ig-photo">
  <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
  <div class="panel">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    ${p.chips ? `<div class="chips">${p.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>` : ''}
    <div class="spacer"></div>
    ${foot}
  </div>
</div>`;

const igRecipe = (p) => `<div class="pin ig-recipe">
  <div class="rwrap">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    <div class="need">You need</div>
    <div class="ings">${p.ings.map(x => `<span class="ing">${x}</span>`).join('')}</div>
    <div class="method"><span class="rule"></span><p>${p.method}</p></div>
  </div>
  ${foot}
</div>`;

const tStat = (p) => `<div class="pin t-stat">
  <div class="stat-wrap">
    <div class="eyebrow">${p.eyebrow}</div>
    <div class="stat">${p.stat}</div>
    <div class="stat-sub">${p.statSub}</div>
    <div class="stat-body"><span class="rule"></span><p>${p.statBody}</p></div>
  </div>
  ${foot}
</div>`;

const tDevice = (p) => `<div class="pin t-device">
  <div class="dhead">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    ${p.cap ? `<div class="dcap">${p.cap}</div>` : ''}
  </div>
  <div class="stage"><div class="phone"><div class="screen"><img src="${PHOTOS}/${p.photo}" alt=""></div></div></div>
  ${foot}
</div>`;

const igQuote = (p) => `<div class="pin ig-quote">
  <div class="qwrap">
    <div class="eyebrow">${p.eyebrow}</div>
    <blockquote class="quote">${p.quote}</blockquote>
    <div class="attr"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="name">${p.name}</span></div>
  </div>
  ${foot}
</div>`;

const EXTRA = `
.ig-quote{display:flex;flex-direction:column;background:var(--paper);padding:96px 76px 58px}
.ig-quote .qwrap{flex:1;display:flex;flex-direction:column;justify-content:center}
.ig-quote .quote{font-family:var(--serif);font-weight:400;font-size:82px;line-height:1.08;letter-spacing:-0.01em;color:var(--ink);margin:22px 0 0}
.ig-quote .quote .accent{color:var(--green);font-style:italic}
.ig-quote .attr{display:flex;align-items:center;gap:20px;margin-top:52px}
.ig-quote .stars{color:var(--green);font-size:36px;letter-spacing:5px}
.ig-quote .name{font-family:var(--sans);font-weight:600;font-size:32px;color:var(--ink)}
.ig-photo{display:flex;flex-direction:column}
.ig-photo .hero{width:100%;height:760px;overflow:hidden;position:relative}
.ig-photo .hero img{width:100%;height:100%;object-fit:cover;display:block}
.ig-photo .hero::after{content:"";position:absolute;inset:0;box-shadow:inset 0 -70px 80px -55px rgba(10,15,12,0.26)}
.ig-photo .panel{flex:1;background:var(--paper);padding:60px 66px 54px;display:flex;flex-direction:column}
.ig-photo .head{font-size:66px;margin-top:16px}
.ig-photo .chips{margin-top:26px;display:flex;flex-wrap:wrap;gap:14px}
.ig-photo .spacer{flex:1;min-height:18px}
.ig-recipe{padding:76px 72px 54px;display:flex;flex-direction:column}
.ig-recipe .rwrap{flex:1;display:flex;flex-direction:column;justify-content:center}
.ig-recipe .head{font-size:96px;margin-top:14px}
.ig-recipe .need{font-family:var(--sans);font-weight:600;font-size:22px;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink-light);margin-top:48px}
.ig-recipe .ings{display:flex;flex-wrap:wrap;gap:16px;margin-top:22px}
.ig-recipe .ing{font-family:var(--sans);font-weight:600;font-size:30px;color:var(--green-dark);background:var(--green-light);padding:16px 28px;border-radius:999px}
.ig-recipe .method{display:flex;gap:24px;margin-top:44px;max-width:840px}
.ig-recipe .method .rule{width:46px;height:3px;background:var(--green);margin-top:18px;flex:none}
.ig-recipe .method p{font-family:var(--serif);font-size:46px;line-height:1.15;color:var(--ink)}
.t-photo .chips{display:flex;flex-wrap:wrap;gap:14px}
`;

const htmlDoc = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="fonts.css">
<style>${baseCss}${EXTRA}
html,body{width:${p.w}px;height:${p.h}px;margin:0}.pin{width:${p.w}px;height:${p.h}px}
</style></head><body>${p.render(p)}</body></html>`;

// ---------- the July 18–31 batch ----------
const PIN = { w: 1000, h: 1500 };
const IG = { w: 1080, h: 1350 };

const posts = [
  // ---------- PINTEREST ----------
  { file: 'jul18-pin-highprotein-bowl', ...PIN, render: tPhoto, photo: 'food/power-bowl-veg.jpg',
    eyebrow: 'High-protein dinners', head: `High-protein grain bowl for <span class="accent">busy weeknights.</span>`,
    chips: ['30 g protein', '20 minutes', 'No meal prep'] },
  { file: 'jul19-pin-fridge-meals', ...PIN, render: tPhoto, photo: 'fridge/fridge-organized.jpg',
    eyebrow: 'Pantry & fridge meals', head: `What to make with <span class="accent">what's in your fridge.</span>`,
    chips: ['Zero shopping', 'Less waste', 'Scan & cook'] },
  { file: 'jul20-pin-5ingredient-pasta', ...PIN, render: tPhoto, photo: 'food/tomato-pasta-skillet.jpg',
    eyebrow: '5-ingredient dinners', head: `5-ingredient <span class="accent">skillet pasta.</span>`,
    chips: ['5 ingredients', 'One pan', '25 minutes'] },
  { file: 'jul21-pin-cheap-healthy', ...PIN, render: tPhoto, photo: 'food/rice-bowl-in-hands.jpg',
    eyebrow: 'Cheap healthy dinners', head: `Healthy dinners <span class="accent">under $6.</span>`,
    chips: ['Under $6', 'High protein', '15 minutes'] },
  { file: 'jul22-pin-grocery-week', ...PIN, render: tPhoto, photo: 'grocery/grocery-bag-produce.jpg',
    eyebrow: 'Meal prep for beginners', head: `One grocery run, <span class="accent">a week of dinners.</span>`,
    chips: ['1 grocery run', '5 dinners', 'Scan receipt'] },
  { file: 'jul23-pin-glutenfree', ...PIN, render: tPhoto, photo: 'food/green-bowl-floral.jpg',
    eyebrow: 'Gluten-free weeknight', head: `Gluten-free dinners <span class="accent">from your pantry.</span>`,
    chips: ['Gluten-free', 'Weeknight-fast', 'No planning'] },
  { file: 'jul24-pin-mealprep-list', ...PIN, render: pinList,
    eyebrow: 'Meal prep for beginners', head: `<span class="accent">5 dinners</span> from one grocery run.`,
    items: [
      { t: 'Sheet-pan chicken + veg', s: 'Roast it all on one pan, 25 minutes' },
      { t: 'Big-batch grain bowls', s: 'Cook once, eat high-protein all week' },
      { t: 'Skillet pasta', s: 'Canned tomatoes, garlic, whatever greens' },
      { t: 'Loaded veggie tacos', s: 'Beans, slaw, a squeeze of lime' },
      { t: 'Fridge-clean-out soup', s: 'The odds and ends, simmered' },
    ] },
  { file: 'jul25-pin-backtoschool-lunch', ...PIN, render: tPhoto, photo: 'food/grain-bowl-burlap.jpg',
    eyebrow: 'Back-to-school lunchbox', head: `Back-to-school <span class="accent">lunchbox ideas.</span>`,
    chips: ['Make ahead', 'Kid-approved', '15 minutes'] },
  { file: 'jul26-pin-busy-weeknight', ...PIN, render: tPhoto, photo: 'food/spaghetti-plate.jpg',
    eyebrow: 'Busy weeknight dinners', head: `Busy weeknight dinners <span class="accent">in 20 minutes.</span>`,
    chips: ['20 minutes', 'One pan', 'Whole family'] },
  { file: 'jul28-pin-highprotein-lunch', ...PIN, render: tPhoto, photo: 'food/veggie-bowl-eggs.jpg',
    eyebrow: 'High-protein lunches', head: `High-protein lunches <span class="accent">for the week.</span>`,
    chips: ['Meal-prep friendly', 'High protein', '5 days'] },
  { file: 'jul29-pin-pantry-dinner', ...PIN, render: tPhoto, photo: 'pantry/pantry-jars.jpg',
    eyebrow: 'Pantry & fridge meals', head: `Your pantry is <span class="accent">tonight's dinner.</span>`,
    chips: ['Pantry staples', 'No shopping', 'Scan & cook'] },
  { file: 'jul31-pin-grocery-five', ...PIN, render: tPhoto, photo: 'grocery/grocery-storefront.jpg',
    eyebrow: 'Meal prep for beginners', head: `One grocery run, <span class="accent">five weeknight dinners.</span>`,
    chips: ['1 trip', '5 dinners', 'Back-to-school'] },

  // ---------- INSTAGRAM (8-pillar rotation, one each Jul 18-31) ----------
  // 1. Recipe/Food
  { file: 'jul18-ig-recipe-pasta', ...IG, render: igPhoto, photo: 'food/pesto-pasta-bowl.jpg',
    eyebrow: 'Recipe · 20-minute dinner', head: `20-minute <span class="accent">weeknight pasta.</span>`,
    chips: ['20 min', 'One pan', '5 ingredients'] },
  // 2. Money/Waste
  { file: 'jul20-ig-money-waste', ...IG, render: tStat,
    eyebrow: 'The cost of no plan', stat: '$1,500',
    statSub: `of groceries the average household throws out every year.`,
    statBody: `iEatz turns what's already in your kitchen into dinner — so more of it gets eaten, not tossed.` },
  // 3. Grocery/Instacart
  { file: 'jul22-ig-grocery-instacart', ...IG, render: igPhoto, photo: 'grocery/woman-grocery-shopping.jpg',
    eyebrow: 'Grocery to table', head: `One grocery run, <span class="accent">a week of dinners.</span>`,
    chips: ['1 grocery run', '5 dinners', 'One-tap cart'] },
  // 4. Product/Feature (real app screen only)
  { file: 'jul24-ig-product-feature', ...IG, render: tDevice, photo: 'app-recipe.jpg',
    eyebrow: 'How it works', head: `Scan your receipt. <span class="accent">Get dinner.</span>`,
    cap: `iEatz reads what you already bought and builds recipes from it — in seconds.` },
  // 5. Transformation (approved testimonial)
  { file: 'jul25-ig-transformation', ...IG, render: igQuote,
    eyebrow: 'From the reviews',
    quote: `Three weeks in and I <span class="accent">haven't ordered takeout once.</span> I just cook what's already in my kitchen.`,
    name: 'Ashly H.' },
  // 6. Pantry/Fridge
  { file: 'jul27-ig-pantry-fridge', ...IG, render: igPhoto, photo: 'fridge/fridge-real-mess.jpg',
    eyebrow: 'Pantry-first cooking', head: `3 things in your fridge, <span class="accent">one dinner.</span>`,
    chips: ['Zero shopping', 'Less waste', 'Scan & cook'] },
  // 7. Health/Diet
  { file: 'jul29-ig-health-diet', ...IG, render: igPhoto, photo: 'food/chickpea-power-bowl.jpg',
    eyebrow: 'High-protein, no prep', head: `High-protein dinners <span class="accent">without the meal prep.</span>`,
    chips: ['30 g protein', 'No Sunday prep', '20 min'] },
  // 8. Lifestyle
  { file: 'jul31-ig-lifestyle', ...IG, render: igPhoto, photo: 'lifestyle/couple-cooking.jpg',
    eyebrow: 'Weeknight, handled', head: `Tonight's dinner is <span class="accent">already in your kitchen.</span>`,
    chips: ['No takeout', 'No planning', '15 minutes'] },
];

(async () => {
  const exec = require('child_process');
  const chromePath = process.env.PW_CHROMIUM ||
    exec.execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null').toString().trim().split('\n')[0];
  const browser = await chromium.launch({ executablePath: chromePath, args: ['--no-sandbox', '--force-color-profile=srgb'] });
  const report = [];
  for (const p of posts) {
    const page = await browser.newPage({ viewport: { width: p.w, height: p.h, deviceScaleFactor: 2 } });
    const hp = path.join(HTMLD, p.file + '.html');
    fs.writeFileSync(hp, htmlDoc(p));
    await page.goto('file://' + hp, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    const imgs = await page.evaluate(async () => {
      const a = [...document.images];
      await Promise.all(a.map(i => i.complete && i.naturalWidth ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
      return a.map(i => ({ s: i.currentSrc.split('/').pop(), w: i.naturalWidth, ok: i.naturalWidth > 0 }));
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
    report.push({ file: p.file, dim: `${m.width}x${m.height}`, ...fc, photoOk });
    console.log(`${(m.width === p.w && m.height === p.h && fc.serif && fc.italic && fc.sans && photoOk) ? 'OK ' : '!! '}${p.file}.png ${m.width}x${m.height} serif=${fc.serif} italic=${fc.italic} sans=${fc.sans} photo=${p.photo || '(none)'}${p.photo ? '(' + (photoOk ? 'ok' : 'FAIL') + ')' : ''}`);
    await page.close();
  }
  await browser.close();
  const bad = report.filter(r => !(r.dim === '1000x1500' || r.dim === '1080x1350') || !r.serif || !r.italic || !r.sans || !r.photoOk);
  console.log(`\n${report.length} rendered, ${bad.length} with automated-QA issues.`);
})().catch(e => { console.error(e); process.exit(1); });
