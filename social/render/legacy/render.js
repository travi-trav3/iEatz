const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const sharp = require('sharp');

const DIR = __dirname;
const PHOTOS = 'file://'+require('path').resolve(__dirname,'../../assets/photos');
const OUT = path.join(DIR, 'out');
const PINS = path.join(DIR, 'pins');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PINS, { recursive: true });
const baseCss = fs.readFileSync(path.join(DIR, 'base.css'), 'utf8');

const MARK = `<svg class="mark" viewBox="0 0 38.25 58.486" fill="none">
<path d="M 0 5.03 C 0 2.252 2.252 0 5.03 0 L 33.22 0 C 35.998 0 38.25 2.252 38.25 5.03 L 38.25 20.119 L 0 20.119 L 0 5.03 Z" fill="currentColor"></path>
<path d="M 0 49.83 C 0 52.608 2.252 54.86 5.03 54.86 L 33.22 54.86 C 35.998 54.86 38.25 52.608 38.25 49.83 L 38.25 22.81 L 0 22.81 L 0 49.83 Z" fill="currentColor"></path>
<path d="M 6.083 6.2 C 6.083 5.489 6.659 4.913 7.369 4.913 C 8.08 4.913 8.656 5.489 8.656 6.2 L 8.656 16.259 C 8.656 16.97 8.08 17.546 7.369 17.546 C 6.659 17.546 6.083 16.97 6.083 16.259 L 6.083 6.2 Z" fill="currentColor"></path>
<path d="M 6.083 26.787 C 6.083 26.076 6.659 25.5 7.369 25.5 C 8.08 25.5 8.656 26.076 8.656 26.787 L 8.656 36.846 C 8.656 37.557 8.08 38.133 7.369 38.133 C 6.659 38.133 6.083 37.557 6.083 36.846 L 6.083 26.787 Z" fill="currentColor"></path>
<path d="M 5.264 54.86 L 10.878 54.86 L 9.892 57.771 C 9.748 58.199 9.347 58.486 8.895 58.486 L 7.2 58.486 C 6.743 58.486 6.338 58.192 6.198 57.757 L 5.264 54.86 Z" fill="currentColor"></path>
<path d="M 27.489 54.86 L 33.103 54.86 L 32.117 57.771 C 31.972 58.199 31.571 58.486 31.12 58.486 L 29.425 58.486 C 28.968 58.486 28.563 58.192 28.423 57.757 L 27.489 54.86 Z" fill="currentColor"></path>
</svg>`;

const badge = (dark) => `<div class="badge${dark ? ' on-dark' : ''}">${MARK}<span>iEatz Healthy</span></div>`;
const foot = (dark) => `<div class="foot">${badge(dark)}<span class="url">ieatzhealthy.com</span></div>`;

// photo-top template (also recipe hero with chips)
const tPhoto = (p) => `<div class="pin t-photo">
  <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
  <div class="panel">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    ${p.chips ? `<div class="chips">${p.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>` : ''}
    <div class="spacer"></div>
    ${foot(false)}
  </div>
</div>`;

const tStat = (p) => `<div class="pin t-stat">
  <div class="stat-wrap">
    <div class="eyebrow">${p.eyebrow}</div>
    <div class="stat">${p.stat}</div>
    <div class="stat-sub">${p.statSub}</div>
    <div class="stat-body"><span class="rule"></span><p>${p.statBody}</p></div>
  </div>
  ${foot(false)}
</div>`;

const tDevice = (p) => `<div class="pin t-device">
  <div class="dhead">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    ${p.cap ? `<div class="dcap">${p.cap}</div>` : ''}
  </div>
  <div class="stage"><div class="phone"><div class="screen"><img src="${PHOTOS}/${p.photo}" alt=""></div></div></div>
  ${foot(false)}
</div>`;

const tList = (p) => `<div class="pin t-list">
  <div class="list-wrap">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    <div class="list">
      ${p.items.map((it, i) => `<div class="item"><div class="num">${i + 1}</div><div class="lab"><span class="t">${it.t}</span><span class="s">${it.s}</span></div></div>`).join('')}
    </div>
  </div>
  ${foot(false)}
</div>`;

const TPL = { photo: tPhoto, stat: tStat, device: tDevice, list: tList };

const pins = [
  { file: '01-fridge', idea: "What to make with what's in your fridge", tpl: 'photo', photo: 'fridge-real-mess.jpg',
    eyebrow: 'AI recipe ideas', head: `Healthy recipes from your <span class="accent">fridge.</span>` },
  { file: '02-grain-bowl', idea: '15-minute lemon tahini grain bowl', tpl: 'photo', photo: 'buddha-bowl.jpg',
    eyebrow: '15-minute recipe', head: `Lemon-tahini grain bowl.`, chips: ['15 min', 'Vegetarian', 'From pantry'] },
  { file: '03-stop-wasting', idea: 'How to stop wasting groceries', tpl: 'stat', accentPhoto: 'meal-prep-spread.jpg',
    eyebrow: 'Grocery math', stat: '$1,500', statSub: 'wasted on food every year.',
    statBody: `The average U.S. household tosses about <strong>$1,500 of groceries a year.</strong> iEatz builds recipes around what you already have, so it gets eaten, not thrown out.` },
  { file: '04-keto', idea: 'Easy keto dinners from pantry staples', tpl: 'device', photo: 'app-recipe.jpg',
    eyebrow: 'Keto, simplified', head: `Eat keto from <span class="accent">what you have.</span>`,
    cap: 'Carbs, protein, and fat tracked for every recipe, built from your ingredients.' },
  { file: '05-meal-prep', idea: 'Weekly meal prep made simple', tpl: 'photo', photo: 'meal-prep-spread.jpg',
    eyebrow: 'Weekly meal prep', head: `A week of meals, <span class="accent">planned for you.</span>` },
  { file: '06-high-protein-breakfast', idea: 'High-protein breakfast ideas', tpl: 'photo', photo: 'cutting-board-veg.jpg',
    eyebrow: 'Breakfast ideas', head: `<span class="accent">High-protein,</span> no planning.`, chips: ['Eggs + greens', '20 g protein', 'Under 15 min'] },
  { file: '07-track-calories', idea: 'Track calories without obsessing', tpl: 'device', photo: 'app-home.jpg',
    eyebrow: 'Calorie tracking', head: `Track calories, <span class="accent">skip the obsessing.</span>`,
    cap: 'Calories and macros log as you cook. No weighing every bite.' },
  { file: '08-gluten-free', idea: 'Gluten-free dinner ideas', tpl: 'photo', photo: 'salmon.jpg',
    eyebrow: 'Gluten-free dinners', head: `<span class="accent">Gluten-free,</span> from what you have.`, chips: ['Gluten-free', '30 min', 'High protein'] },
  { file: '09-fridge-to-cart', idea: 'Turn your fridge into a shopping list', tpl: 'device', photo: 'app-instacart.jpg',
    eyebrow: 'Smart shopping list', head: `Fridge to cart, <span class="accent">one tap.</span>`,
    cap: 'iEatz fills the gaps and sends the whole list to Instacart.' },
  { file: '10-five-dinners', idea: '5 dinners without going to the store', tpl: 'list',
    eyebrow: 'No grocery run', head: `<span class="accent">5 dinners,</span> zero shopping.`, items: [
      { t: 'Chickpea pasta', s: 'Canned chickpeas, pantry tomatoes, garlic' },
      { t: 'Veggie fried rice', s: "Leftover rice and whatever's in the crisper" },
      { t: 'White bean & greens skillet', s: 'Beans, olive oil, a handful of greens' },
      { t: 'Loaded baked potatoes', s: 'Bake, top with what you have, done' },
      { t: 'Pantry shakshuka', s: 'Eggs poached in canned tomatoes and spice' },
    ] },
];

const htmlFor = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../fonts.css">
<style>${baseCss}</style></head>
<body>${TPL[p.tpl](p)}</body></html>`;

(async () => {
  const browser = await chromium.launch({
    executablePath: (process.env.PW_CHROMIUM || require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null').toString().trim().split('
')[0]),
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1500, deviceScaleFactor: 2 } });
  const report = [];
  for (const p of pins) {
    const htmlPath = path.join(PINS, p.file + '.html');
    fs.writeFileSync(htmlPath, htmlFor(p));
    await page.goto('file://' + htmlPath, { waitUntil: 'load' });
    // wait fonts + images
    await page.evaluate(async () => { await document.fonts.ready; });
    const imgState = await page.evaluate(async () => {
      const imgs = [...document.images];
      await Promise.all(imgs.map(i => i.complete && i.naturalWidth ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
      return imgs.map(i => ({ src: i.currentSrc.split('/').pop(), w: i.naturalWidth, h: i.naturalHeight, ok: i.naturalWidth > 0 }));
    });
    const fontCheck = await page.evaluate(() => ({
      serif: document.fonts.check('400 88px "Instrument Serif"'),
      serifItalic: document.fonts.check('italic 400 88px "Instrument Serif"'),
      sans: document.fonts.check('600 27px "Inter Tight"'),
    }));
    const buf2x = await page.screenshot({ clip: { x: 0, y: 0, width: 1000, height: 1500 } });
    const meta2x = await sharp(buf2x).metadata();
    const outPath = path.join(OUT, p.file + '.png');
    await sharp(buf2x).resize(1000, 1500, { fit: 'fill', kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(outPath);
    const finalMeta = await sharp(outPath).metadata();
    report.push({ file: p.file + '.png', idea: p.idea, tpl: p.tpl,
      render2x: `${meta2x.width}x${meta2x.height}`, final: `${finalMeta.width}x${finalMeta.height}`,
      fonts: fontCheck, imgs: imgState });
    console.log(`✓ ${p.file}.png  final ${finalMeta.width}x${finalMeta.height}  serif=${fontCheck.serif} italic=${fontCheck.serifItalic} sans=${fontCheck.sans}  imgs=${imgState.map(i => i.src + '(' + i.w + 'x' + i.h + (i.ok ? '' : ' FAIL') + ')').join(',') || 'none'}`);
  }
  await browser.close();
  fs.writeFileSync(path.join(DIR, 'report.json'), JSON.stringify(report, null, 2));
  const bad = report.filter(r => !r.fonts.serif || !r.fonts.serifItalic || !r.fonts.sans || r.final !== '1000x1500' || r.imgs.some(i => !i.ok));
  console.log(bad.length ? `\n⚠ ISSUES in ${bad.length} pin(s): ${bad.map(b => b.file).join(', ')}` : '\n✅ All 10: 1000x1500, fonts loaded, images OK');
})().catch(e => { console.error(e); process.exit(1); });
