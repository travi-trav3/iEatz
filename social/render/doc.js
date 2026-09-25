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
</style></head><body>${t.render(p, PHOTOS)}${grain}${pager}${FIT_SCRIPT}${opts.motion ? t.motion(p) : ''}</body></html>`;
}

// Wait for fonts + images, force-load and check every face, then fit text. Returns QA facts.
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
  return { imgs, fc };
}

function chromePath() {
  if (process.env.PW_CHROMIUM) return process.env.PW_CHROMIUM;
  return require('child_process').execSync('ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null').toString().trim().split('\n')[0];
}

module.exports = { FONT_CHECKS, CAROUSEL_COVERS, expand, photosOf, mapPhotos, htmlDoc, prepare, chromePath, DIR };
