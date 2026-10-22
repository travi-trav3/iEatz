// Shared page builder for render-batch.js and render-motion.js: one template registry, one CSS,
// one font check, one carousel expansion. Anything both renderers need lives here.
const fs = require('fs');
const path = require('path');
const { TEMPLATES } = require('./templates');

const DIR = __dirname;
const baseCss = fs.readFileSync(path.join(DIR, 'base.css'), 'utf8');

// Every face the kit ships. Force-loaded then checked on every render, used on the slide or not.
const FONT_CHECKS = {
  serif: '400 80px "Instrument Serif"',
  italic: 'italic 400 80px "Instrument Serif"',
  sans: '600 27px "Inter Tight"',
  mono: '400 27px "JetBrains Mono"',
  marker: '400 60px "Permanent Marker"',
};

// [data-fit="<min px>"]: shrink the element's font-size in 2px steps until it no longer overflows
// its own box. Runs after fonts load, before the screenshot (and before motion frame 0).
const FIT_SCRIPT = `<script>window.__fit=()=>{for(const el of document.querySelectorAll('[data-fit]')){const min=+el.dataset.fit||40;let fs=parseFloat(getComputedStyle(el).fontSize),g=300;while(g--&&fs>min&&(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)){fs-=2;el.style.fontSize=fs+'px';}}};</script>`;

const CAROUSEL_COVERS = ['poster', 'sharpie', 'split'];

// A carousel post { file, w, h, slides:[{template,...}] } becomes one render job per slide:
// <file>--01 ... all at the post's size. Slide 1 has no pager; slides 2+ show "n / total".
function expand(p) {
  if (!p.slides) return [p];
  const n = p.slides.length;
  if (n < 2 || n > 10) throw new Error(`${p.file}: carousel has ${n} slides (2 to 10)`);
  if (!CAROUSEL_COVERS.includes(p.slides[0].template))
    throw new Error(`${p.file}: carousel cover must be ${CAROUSEL_COVERS.join(' | ')}, got "${p.slides[0].template}"`);
  // Interior rule (R3, Oct 22 2026): a recipe carousel shows the food. Every slide after the
  // cover carries a photo or a readout, and at most one slide is a bare `list`. The October
  // batches shipped seven near-identical list slides in a row ("four soups", zero soup).
  // Batches created before 2026-10-22 (already published) are exempt so they still re-render.
  if (!p.createdAt || p.createdAt >= '2026-10-22') {
    const lists = p.slides.slice(1).filter(s => s.template === 'list').length;
    if (lists > 1) throw new Error(`${p.file}: ${lists} list slides; a carousel gets at most one (use "steps" for recipe slides: photo + numbered steps)`);
    p.slides.slice(1).forEach((s, i) => {
      const hasPhoto = !!(s.photo || s.top || s.bottom || (s.cards || []).length || (s.bg && s.bg.photo) || (s.msgs || []).some(m => m.photo));
      if (!hasPhoto && !(s.readout || []).length && s.template !== 'receipt')
        throw new Error(`${p.file}: slide ${i + 2} ("${s.template}") shows no food: give it a photo or a readout`);
    });
  }
  return p.slides.map((s, i) => {
    const q = { w: p.w, h: p.h, grade: p.grade, grain: p.grain, createdAt: p.createdAt, ...s };
    q.file = `${p.file}--${String(i + 1).padStart(2, '0')}`;
    q._carousel = p.file;
    if (i > 0) {
      q._pager = { n: i + 1, total: n };
      if (!s.footer) q.footer = 'none';
      if (q.footer === 'badge-tr') throw new Error(`${q.file}: badge-tr collides with the carousel pager`);
    }
    return q;
  });
}

// Every photo a post references, wherever the shell keeps it.
function photosOf(p) {
  const out = [];
  const add = (f) => { if (f && !out.includes(f)) out.push(f); };
  add(p.photo);
  (p.cards || []).forEach(c => add(c.photo));
  if (p.top) add(p.top.photo);
  if (p.bottom) add(p.bottom.photo);
  if (p.bg && typeof p.bg === 'object') add(p.bg.photo);
  (p.msgs || []).forEach(m => add(m.photo));
  return out;
}

// Deep copy of a post with every photo field passed through fn (used by the grade step).
function mapPhotos(p, fn) {
  const q = JSON.parse(JSON.stringify(p));
  if (q.photo) q.photo = fn(q.photo);
  (q.cards || []).forEach(c => { if (c.photo) c.photo = fn(c.photo); });
  if (q.top && q.top.photo) q.top.photo = fn(q.top.photo);
  if (q.bottom && q.bottom.photo) q.bottom.photo = fn(q.bottom.photo);
  if (q.bg && typeof q.bg === 'object' && q.bg.photo) q.bg.photo = fn(q.bg.photo);
  (q.msgs || []).forEach(m => { if (m.photo) m.photo = fn(m.photo); });
  return q;
}

// opts.motion: append the shell's setT script (render-motion.js only).
function htmlDoc(p, PHOTOS, opts = {}) {
  const t = TEMPLATES[p.template];
  if (!t) throw new Error(`unknown template "${p.template}" for ${p.file}`);
  const grain = p.grain === true && !t.ownGrain ? '<div class="grain-layer fixed"></div>' : '';
  const pager = p._pager ? `<div class="pager">${p._pager.n} / ${p._pager.total}</div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${DIR}/fonts.css">
<style>${baseCss}
html,body{width:${p.w}px;height:${p.h}px;margin:0}.pin{width:${p.w}px;height:${p.h}px}
:root{--s:${p.w / 1080}}
${p.statSize ? `.ig-statdark .bignum{font-size:${p.statSize}px}` : ''}
${p.headSize ? `.ig-bleed .bhead{font-size:${p.headSize}px}.po-head,.rc-head,.cc-head{font-size:${p.headSize}px}` : ''}
</style></head><body>${t.render(p, PHOTOS)}${grain}${pager}${FIT_SCRIPT}${SAFE_SCRIPT}${opts.motion ? t.motion(p) : ''}</body></html>`;
}

// [data-safe="<pad px>[,<max bottom fraction>]"]: after fitting, the element's box must sit inside
// the frame's safe zone and above the given fraction of the height, and nothing inside it may
// overflow horizontally (a word wider than its box). Violations fail the render line: a shell that
// cannot fit its copy says so instead of shrinking it past its smallest tier.
const SAFE_SCRIPT = `<script>window.__safe=()=>{const W=innerWidth,H=innerHeight,out=[];for(const el of document.querySelectorAll('[data-safe]')){const [pad=80,frac=1]=el.dataset.safe.split(',').map(Number);const r=el.getBoundingClientRect();const n=(el.className||el.tagName).toString().split(' ')[0];
if(r.left<pad-0.5||r.right>W-pad+0.5||r.top<pad-0.5||r.bottom>H-pad+0.5)out.push(n+' breaks the '+pad+'px safe zone (x '+Math.round(r.left)+'-'+Math.round(r.right)+', y '+Math.round(r.top)+'-'+Math.round(r.bottom)+')');
if(r.bottom>H*frac+0.5)out.push(n+' bottom '+Math.round(r.bottom)+'px is below the '+Math.round(frac*100)+'% line ('+Math.round(H*frac)+'px)');
for(const t of [el,...el.querySelectorAll('*')])if(t.scrollWidth>t.clientWidth+1){out.push(((t.className||t.tagName).toString().split(' ')[0])+' overflows its box ('+t.scrollWidth+'px in '+t.clientWidth+'px)');break;}}
for(const el of document.querySelectorAll('[data-clear]')){const r=el.getBoundingClientRect();const n=(el.className||el.tagName).toString().split(' ')[0];
for(const o of document.querySelectorAll(el.dataset.clear)){if(o===el||el.contains(o)||o.contains(el))continue;const q=o.getBoundingClientRect();
if(r.left<q.right-1&&r.right>q.left+1&&r.top<q.bottom-1&&r.bottom>q.top+1){out.push(n+' sits over '+((o.className||o.tagName).toString().split(' ')[0])+' (F-003: type on clean paper)');break;}}}
for(const u of document.querySelectorAll('.u')){if(u.getClientRects().length>1){out.push('underlined phrase "'+u.textContent.trim()+'" wraps onto two lines (shorten it or the headline)');break;}}
for(const h of document.querySelectorAll('.po-head,.th-head,.t-steps .head,.t-list .head,.bhead,.cc-head')){const lh=parseFloat(getComputedStyle(h).lineHeight)||1;const lines=Math.round(h.getBoundingClientRect().height/lh);if(lines>4){out.push(((h.className||h.tagName).toString().split(' ')[0])+' runs to '+lines+' lines (max 4: cut the headline)');break;}}
return out;};</script>`;

// Wait for fonts + images, force-load and check every face, then fit text and check safe zones.
// Returns QA facts: imgs, fc (font checks) and safe (violations, empty when clean).
async function prepare(page) {
  await page.evaluate(async () => { await document.fonts.ready; });
  const imgs = await page.evaluate(async () => {
    const a = [...document.images];
    await Promise.all(a.map(i => i.complete && i.naturalWidth ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    return a.map(i => ({ src: i.src, w: i.naturalWidth, ok: i.naturalWidth > 0 }));
  });
  const fc = await page.evaluate(async (checks) => {
    const r = {};
    for (const [k, f] of Object.entries(checks)) {
      try { await document.fonts.load(f); } catch (e) {}
      r[k] = document.fonts.check(f);
    }
    return r;
  }, FONT_CHECKS);
  await page.evaluate(() => window.__fit && window.__fit());
  const safe = await page.evaluate(() => (window.__safe ? window.__safe() : []));
  return { imgs, fc, safe };
}

function chromePath() {
  if (process.env.PW_CHROMIUM) return process.env.PW_CHROMIUM;
  return require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null').toString().trim().split('\n')[0];
}

module.exports = { FONT_CHECKS, CAROUSEL_COVERS, expand, photosOf, mapPhotos, htmlDoc, prepare, chromePath, DIR };
