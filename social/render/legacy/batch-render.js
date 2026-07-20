const fs=require('fs');const path=require('path');
const {chromium}=require('playwright-core');const sharp=require('sharp');
const DIR=__dirname;const PHOTOS='file://'+require('path').resolve(__dirname,'../../assets/photos');
const OUT=path.join(DIR,'batchout');fs.mkdirSync(OUT,{recursive:true});
const baseCss=fs.readFileSync(path.join(DIR,'base.css'),'utf8');
const MARK=`<svg class="mark" viewBox="0 0 38.25 58.486" fill="none">
<path d="M 0 5.03 C 0 2.252 2.252 0 5.03 0 L 33.22 0 C 35.998 0 38.25 2.252 38.25 5.03 L 38.25 20.119 L 0 20.119 L 0 5.03 Z" fill="currentColor"></path>
<path d="M 0 49.83 C 0 52.608 2.252 54.86 5.03 54.86 L 33.22 54.86 C 35.998 54.86 38.25 52.608 38.25 49.83 L 38.25 22.81 L 0 22.81 L 0 49.83 Z" fill="currentColor"></path>
<path d="M 6.083 6.2 C 6.083 5.489 6.659 4.913 7.369 4.913 C 8.08 4.913 8.656 5.489 8.656 6.2 L 8.656 16.259 C 8.656 16.97 8.08 17.546 7.369 17.546 C 6.659 17.546 6.083 16.97 6.083 16.259 L 6.083 6.2 Z" fill="currentColor"></path>
<path d="M 6.083 26.787 C 6.083 26.076 6.659 25.5 7.369 25.5 C 8.08 25.5 8.656 26.076 8.656 26.787 L 8.656 36.846 C 8.656 37.557 8.08 38.133 7.369 38.133 C 6.659 38.133 6.083 37.557 6.083 36.846 L 6.083 26.787 Z" fill="currentColor"></path>
<path d="M 5.264 54.86 L 10.878 54.86 L 9.892 57.771 C 9.748 58.199 9.347 58.486 8.895 58.486 L 7.2 58.486 C 6.743 58.486 6.338 58.192 6.198 57.757 L 5.264 54.86 Z" fill="currentColor"></path>
<path d="M 27.489 54.86 L 33.103 54.86 L 32.117 57.771 C 31.972 58.199 31.571 58.486 31.12 58.486 L 29.425 58.486 C 28.968 58.486 28.563 58.192 28.423 57.757 L 27.489 54.86 Z" fill="currentColor"></path></svg>`;
const CARROT=`<svg class="carrot" viewBox="0 0 100 120" fill="none"><path d="M50 74 L20 40 H37 V8 H63 V40 H80 Z" fill="#08B704"/><path d="M22 112 A28 28 0 0 1 78 112 Z" fill="#FF6E00"/></svg>`;
const HEART=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"></path></svg>`;
const BACK=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>`;

const EXTRA=`
/* ===== Recipe card ===== */
.t-recipe{padding:56px 70px 50px;display:flex;flex-direction:column;align-items:center;text-align:center}
.t-recipe .rhead{display:flex;flex-direction:column;align-items:center}
.t-recipe .stage{flex:1;display:flex;align-items:center;justify-content:center;width:100%;min-height:0}
.t-recipe .eyeline{width:46px;height:3px;background:var(--green);border-radius:2px}
.t-recipe .eyebrow{margin-top:18px}
.t-recipe .head{font-size:64px;margin-top:14px}
.t-recipe .phone{width:600px;background:#0A0F0C;border-radius:60px;padding:14px;box-shadow:0 40px 90px rgba(14,74,42,0.20),0 10px 26px rgba(14,74,42,0.10)}
.t-recipe .screen{background:#fff;border-radius:46px;overflow:hidden;padding:24px 24px 26px}
.t-recipe .sbar{display:flex;justify-content:space-between;align-items:center;font-family:var(--sans);font-weight:600;font-size:26px;color:var(--ink);padding:6px 12px 20px}
.t-recipe .sbar .ic{display:flex;gap:8px;align-items:center}
.t-recipe .sbar .ic span{width:24px;height:16px;background:var(--ink);border-radius:3px;display:inline-block}
.t-recipe .sbar .ic .b{width:30px;border:2px solid var(--ink);background:transparent;border-radius:4px}
.t-recipe .navrow{display:flex;justify-content:space-between;margin-bottom:18px}
.t-recipe .circ{width:64px;height:64px;border-radius:50%;background:var(--green-light);display:flex;align-items:center;justify-content:center;color:var(--green-dark)}
.t-recipe .circ svg{width:28px;height:28px}
.t-recipe .food{width:100%;height:470px;border-radius:32px;overflow:hidden}
.t-recipe .food img{width:100%;height:100%;object-fit:cover;display:block}
.t-recipe .card{background:#fff;border:1px solid #EFEDE6;border-radius:34px;box-shadow:0 18px 40px rgba(14,74,42,0.08);margin:-70px 6px 0;position:relative;padding:32px 36px 38px;text-align:left}
.t-recipe .gen{display:flex;align-items:center;gap:10px;font-family:var(--sans);font-weight:600;font-size:24px;color:var(--green)}
.t-recipe .rname{font-family:var(--sans);font-weight:700;font-size:50px;letter-spacing:-0.02em;color:var(--ink);margin-top:12px;line-height:1.02}
.t-recipe .meta{font-family:var(--sans);font-weight:400;font-size:26px;color:var(--ink-light);margin-top:10px}
.t-recipe .macros{display:flex;gap:16px;margin-top:26px;border-top:1px solid #EFEDE6;padding-top:26px}
.t-recipe .mac{display:flex;flex-direction:column;gap:5px;flex:1}
.t-recipe .mac .n{font-family:var(--sans);font-weight:700;font-size:42px;letter-spacing:-0.02em;color:var(--ink)}
.t-recipe .mac.cal .n{color:var(--green)}
.t-recipe .mac .l{font-family:var(--sans);font-weight:600;font-size:18px;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink-light)}
.t-recipe .est{font-family:var(--sans);font-size:18px;color:var(--ink-light);margin-top:16px}
.t-recipe .foot{width:100%;display:flex;align-items:center;justify-content:space-between;margin-top:24px}
/* ===== Instacart (iEatz-forward, IC sparingly) ===== */
.icp{display:flex;flex-direction:column}
.icp .hero{width:100%;height:${'${HEROH}'}px;overflow:hidden;position:relative}
.icp .hero img{width:100%;height:100%;object-fit:cover;display:block}
.icp .hero::after{content:"";position:absolute;inset:0;box-shadow:inset 0 -70px 80px -55px rgba(10,15,12,0.24)}
.icp .panel{flex:1;background:var(--paper);padding:54px 64px 52px;display:flex;flex-direction:column}
.icp .head{font-size:62px;margin-top:16px}
.icp .sub{font-family:var(--sans);font-weight:400;font-size:28px;line-height:1.45;color:var(--ink-medium);margin-top:22px;max-width:900px}
.icp .spacer{flex:1;min-height:26px}
.icp .swi{display:inline-flex;align-items:center;gap:13px;align-self:flex-start;background:var(--green-dark);border-radius:999px;padding:15px 28px 15px 22px;margin-bottom:34px}
.icp .swi .carrot{width:26px;height:31px;flex:none}
.icp .swi .t{font-family:var(--sans);font-weight:600;font-size:27px;letter-spacing:-0.01em;color:#fff}
.icp .foot{display:flex;align-items:center;justify-content:space-between}
`;

const recipeHTML=(p)=>`<div class="pin t-recipe">
  <div class="rhead"><div class="eyeline"></div><div class="eyebrow">${p.eyebrow}</div><h1 class="head">${p.head}</h1></div>
  <div class="stage"><div class="phone"><div class="screen">
    <div class="sbar"><span>9:41</span><span class="ic"><span></span><span></span><span class="b"></span></span></div>
    <div class="navrow"><div class="circ">${BACK}</div><div class="circ">${HEART}</div></div>
    <div class="food"><img src="${PHOTOS}/${p.photo}" alt=""></div>
    <div class="card"><div class="gen">✦&nbsp; Generated from your fridge</div>
      <div class="rname">${p.name}</div><div class="meta">${p.meta}</div>
      <div class="macros">
        <div class="mac"><span class="n">${p.protein}</span><span class="l">Protein</span></div>
        <div class="mac"><span class="n">${p.carbs}</span><span class="l">Carbs</span></div>
        <div class="mac"><span class="n">${p.fat}</span><span class="l">Fat</span></div>
        <div class="mac cal"><span class="n">${p.cal}</span><span class="l">Cal</span></div></div>
      <div class="est">Estimated per serving — verify for allergens.</div></div>
  </div></div></div>
  <div class="foot"><div class="badge">${MARK}<span>iEatz Healthy</span></div><span class="url">ieatzhealthy.com</span></div>
</div>`;

const icHTML=(p)=>`<div class="pin icp">
  <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
  <div class="panel"><div class="eyebrow">${p.eyebrow}</div><h1 class="head">${p.head}</h1>
    <div class="sub">${p.sub}</div><div class="spacer"></div>
    <div class="swi">${CARROT}<span class="t">Shop with Instacart</span></div>
    <div class="foot"><div class="badge">${MARK}<span>iEatz Healthy</span></div><span class="url">ieatzhealthy.com</span></div>
  </div></div>`;

const html=(p)=>{
  const heroH = p.h===1500?820:740;
  const css = (baseCss+EXTRA).replace('${HEROH}',heroH);
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../fonts.css">
<style>${css}\nhtml,body{width:${p.w}px;height:${p.h}px}.pin{width:${p.w}px;height:${p.h}px}</style></head>
<body>${p.kind==='recipe'?recipeHTML(p):icHTML(p)}</body></html>`;
};

// ---- batch content (recipes + macros generated from the photos) ----
const recipes=[
 {slug:'tacos', photo:'tacos.jpg', eyebrow:'BUILT AROUND YOU', head:`Healthy dinners, <span class="accent">your numbers</span>`,
  name:'Crispy chickpea & sweet-potato tacos', meta:'25 min · easy · serves 4', protein:'12g',carbs:'46g',fat:'16g',cal:'390'},
 {slug:'salmon', photo:'salmon.jpg', eyebrow:'BUILT AROUND YOU', head:`Healthy dinners, <span class="accent">your numbers</span>`,
  name:'Creamy lemon-herb salmon', meta:'25 min · easy · serves 2', protein:'34g',carbs:'8g',fat:'28g',cal:'420'},
 {slug:'scramble', photo:'cutting-board-veg.jpg', eyebrow:'COOK WHAT YOU HAVE', head:`Cook with what's <span class="accent">already in your fridge</span>`,
  name:'Garden veggie & egg scramble', meta:'15 min · easy · serves 2', protein:'18g',carbs:'9g',fat:'15g',cal:'240'},
 {slug:'pesto', photo:'pesto-pasta-bowl.jpg', eyebrow:'COOK WHAT YOU HAVE', head:`Cook with what's <span class="accent">already in your fridge</span>`,
  name:'Pesto pasta salad', meta:'20 min · easy · serves 4', protein:'14g',carbs:'48g',fat:'22g',cal:'440'},
];
const instas=[
 {slug:'couple', photo:'couple-cooking.jpg', eyebrow:'Never miss an ingredient',
  head:`The ingredients you're missing, <span class="accent">handled.</span>`,
  sub:`iEatz builds the recipe from what's already in your kitchen, then sends the rest to your cart in a tap.`},
 {slug:'fridge', photo:'fridge-organized.jpg', eyebrow:'Stock up in one order',
  head:`A full fridge, <span class="accent">without the trip.</span>`,
  sub:`Turn a week of iEatz recipes into a single order — fresh produce and pantry staples delivered to your door.`},
];

const sizes=[{tag:'ig',w:1080,h:1350},{tag:'pin',w:1000,h:1500}];
const jobs=[];
for(const r of recipes) for(const s of sizes) jobs.push({...r,kind:'recipe',...s,file:`recipe-${r.slug}-${s.tag}`});
for(const c of instas) for(const s of sizes) jobs.push({...c,kind:'ic',...s,file:`instacart-${c.slug}-${s.tag}`});

(async()=>{
 const b=await chromium.launch({executablePath: (process.env.PW_CHROMIUM || require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null').toString().trim().split('
')[0]),args:['--no-sandbox','--force-color-profile=srgb']});
 for(const p of jobs){
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
