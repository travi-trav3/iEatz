const fs=require('fs');const path=require('path');
const {chromium}=require('playwright-core');const sharp=require('sharp');
const DIR=__dirname;const PHOTOS='file://'+require('path').resolve(__dirname,'../../assets/photos');
const OUT=path.join(DIR,'icout');fs.mkdirSync(OUT,{recursive:true});
const baseCss=fs.readFileSync(path.join(DIR,'base.css'),'utf8');
const MARK=`<svg class="mark" viewBox="0 0 38.25 58.486" fill="none">
<path d="M 0 5.03 C 0 2.252 2.252 0 5.03 0 L 33.22 0 C 35.998 0 38.25 2.252 38.25 5.03 L 38.25 20.119 L 0 20.119 L 0 5.03 Z" fill="currentColor"></path>
<path d="M 0 49.83 C 0 52.608 2.252 54.86 5.03 54.86 L 33.22 54.86 C 35.998 54.86 38.25 52.608 38.25 49.83 L 38.25 22.81 L 0 22.81 L 0 49.83 Z" fill="currentColor"></path>
<path d="M 6.083 6.2 C 6.083 5.489 6.659 4.913 7.369 4.913 C 8.08 4.913 8.656 5.489 8.656 6.2 L 8.656 16.259 C 8.656 16.97 8.08 17.546 7.369 17.546 C 6.659 17.546 6.083 16.97 6.083 16.259 L 6.083 6.2 Z" fill="currentColor"></path>
<path d="M 6.083 26.787 C 6.083 26.076 6.659 25.5 7.369 25.5 C 8.08 25.5 8.656 26.076 8.656 26.787 L 8.656 36.846 C 8.656 37.557 8.08 38.133 7.369 38.133 C 6.659 38.133 6.083 37.557 6.083 36.846 L 6.083 26.787 Z" fill="currentColor"></path>
<path d="M 5.264 54.86 L 10.878 54.86 L 9.892 57.771 C 9.748 58.199 9.347 58.486 8.895 58.486 L 7.2 58.486 C 6.743 58.486 6.338 58.192 6.198 57.757 L 5.264 54.86 Z" fill="currentColor"></path>
<path d="M 27.489 54.86 L 33.103 54.86 L 32.117 57.771 C 31.972 58.199 31.571 58.486 31.12 58.486 L 29.425 58.486 C 28.968 58.486 28.563 58.192 28.423 57.757 L 27.489 54.86 Z" fill="currentColor"></path></svg>`;

// Small full-color Instacart carrot logo (green top + orange dome) — used sparingly, unaltered colors
const CARROT=`<svg class="carrot" viewBox="0 0 100 120" fill="none">
<path d="M50 74 L20 40 H37 V8 H63 V40 H80 Z" fill="#08B704"/>
<path d="M22 112 A28 28 0 0 1 78 112 Z" fill="#FF6E00"/></svg>`;

const EXTRA=`
.icp{display:flex;flex-direction:column}
.icp .hero{width:100%;height:740px;overflow:hidden;position:relative}
.icp .hero img{width:100%;height:100%;object-fit:cover;display:block}
.icp .hero::after{content:"";position:absolute;inset:0;box-shadow:inset 0 -70px 80px -55px rgba(10,15,12,0.24)}
.icp .panel{flex:1;background:var(--paper);padding:56px 64px 54px;display:flex;flex-direction:column}
.icp .head{font-size:64px;margin-top:16px}
.icp .sub{font-family:var(--sans);font-weight:400;font-size:28px;line-height:1.45;color:var(--ink-medium);margin-top:22px;max-width:900px}
.icp .spacer{flex:1;min-height:28px}
/* small "Shop with Instacart" chip — the only Instacart element, in iEatz styling */
.icp .swi{display:inline-flex;align-items:center;gap:13px;align-self:flex-start;
  background:var(--green-dark);border-radius:999px;padding:16px 28px 16px 22px;margin-bottom:36px}
.icp .swi .carrot{width:26px;height:31px;flex:none}
.icp .swi .t{font-family:var(--sans);font-weight:600;font-size:27px;letter-spacing:-0.01em;color:#fff}
.icp .foot{display:flex;align-items:center;justify-content:space-between}
`;

const html=(p)=>`<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../fonts.css"><style>${baseCss}${EXTRA}
html,body{width:${p.w}px;height:${p.h}px}.pin{width:${p.w}px;height:${p.h}px}</style></head>
<body><div class="pin icp">
  <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
  <div class="panel">
    <div class="eyebrow">${p.eyebrow}</div>
    <h1 class="head">${p.head}</h1>
    <div class="sub">${p.sub}</div>
    <div class="spacer"></div>
    <div class="swi">${CARROT}<span class="t">Shop with Instacart</span></div>
    <div class="foot"><div class="badge">${MARK}<span>iEatz Healthy</span></div><span class="url">ieatzhealthy.com</span></div>
  </div>
</div></body></html>`;

const pins=[{file:'instacart-pilot-ig',w:1080,h:1350,photo:'couple-cooking.jpg',
  eyebrow:'Never miss an ingredient',
  head:`The ingredients you're missing, <span class="accent">handled.</span>`,
  sub:`iEatz builds the recipe from what's already in your kitchen, then sends the rest to your cart in a tap.`}];

(async()=>{
 const b=await chromium.launch({executablePath: (process.env.PW_CHROMIUM || require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null').toString().trim().split('
')[0]),args:['--no-sandbox','--force-color-profile=srgb']});
 for(const p of pins){
  const page=await b.newPage({viewport:{width:p.w,height:p.h,deviceScaleFactor:2}});
  const hp=path.join(DIR,'pins',p.file+'.html');fs.writeFileSync(hp,html(p));
  await page.goto('file://'+hp,{waitUntil:'load'});
  await page.evaluate(async()=>{await document.fonts.ready;});
  await page.evaluate(async()=>{const a=[...document.images];await Promise.all(a.map(i=>i.complete&&i.naturalWidth?0:new Promise(r=>{i.onload=i.onerror=r})));});
  const buf=await page.screenshot({clip:{x:0,y:0,width:p.w,height:p.h}});
  const o=path.join(OUT,p.file+'.png');
  await sharp(buf).resize(p.w,p.h,{fit:'fill',kernel:'lanczos3'}).png({compressionLevel:9}).toFile(o);
  const m=await sharp(o).metadata();console.log(`✓ ${p.file}.png ${m.width}x${m.height}`);
  await page.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
