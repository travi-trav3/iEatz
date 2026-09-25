// Single shell registry — ALL templates live here; ALL CSS lives in base.css.
// Every shell renders at 1080x1350 (IG feed), 1000x1500 (Pinterest) and 1080x1920 (story/reel).
// Surfaces: paper | paper-deep | mint | dark | photo-bleed. The diversity gate reads these tags
// (surfaceOf(p) for shells whose surface depends on props, e.g. thread).
// deprecated: true = kept so old batches re-render; the gate warns on any new use.

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
const foot = `<div class="foot">${badge}<span class="url">ieatzhealthy.com</span></div>`;
const footDark = `<div class="foot-dark abs">${badgeDark}<span class="url">ieatzhealthy.com</span></div>`;

const chips = (p) => p.chips ? `<div class="chips">${p.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>` : '';

// eyebrow prop: absent or empty -> no element (base.css zeroes the next element's top margin).
const eyebrow = (p, cls = '') => p.eyebrow ? `<div class="eyebrow${cls}">${p.eyebrow}</div>` : '';

// footer prop: where the brand badge sits.
//   badge-url  today's row: badge left, ieatzhealthy.com right (never on Instagram; the gate enforces it)
//   badge-bl / badge-br  badge alone in the shell's bottom row, left or right
//   badge-tl / badge-tr  badge alone, pinned to a top corner
//   none       no badge (carousel inner slides, mostly)
// Each shell says what its corners sit on so the badge picks a legible variant:
//   paper -> ink badge, dark -> paper badge, photo -> stamp (paper pill, readable on any photo).
const FOOTERS = ['badge-bl', 'badge-br', 'badge-tl', 'badge-tr', 'badge-url', 'none'];
const badgeAs = (on, extra = '') => {
  const cls = on === 'photo' ? ' stamp' : on === 'dark' ? ' on-dark' : '';
  return `<div class="badge${cls}${extra}">${MARK}<span>iEatz Healthy</span></div>`;
};
// o = { url: badge-url markup, row: (badgeHtml, side) => bottom-row markup,
//       bottom: 'paper'|'dark'|'photo', top: 'paper'|'dark'|'photo', def: shell default }
function footer(p, o) {
  const f = p.footer || o.def || 'badge-url';
  if (!FOOTERS.includes(f)) throw new Error(`${p.file}: unknown footer "${f}" (one of ${FOOTERS.join(', ')})`);
  if (f === 'none') return '';
  if (f === 'badge-url') {
    if (!o.url) throw new Error(`${p.file}: footer "badge-url" is not available on template "${p.template}"`);
    return o.url;
  }
  const v = f[6], h = f[7];
  if (v === 'b' && o.row) return o.row(badgeAs(o.bottom), h);
  return badgeAs(v === 't' ? o.top : o.bottom, ` corner ${v}${h}`);
}
const rowPaper = (b, h) => `<div class="foot solo-${h}">${b}</div>`;
const rowDark = (b, h) => `<div class="foot-dark solo-${h}">${b}</div>`;
const rowDarkAbs = (b, h) => `<div class="foot-dark abs solo-${h}">${b}</div>`;
// Shared footer configs for the legacy shells.
const F_PAPER = { url: foot, row: rowPaper, bottom: 'paper', top: 'paper' };
const F_PHOTO_TOP = { url: foot, row: rowPaper, bottom: 'paper', top: 'photo' };
const F_BLEED = { url: footDark, row: rowDarkAbs, bottom: 'dark', top: 'photo' };

// ---------- v2 helpers ----------
const img = (PHOTOS, f, pos) => `<img src="${PHOTOS}/${f}" alt=""${pos ? ` style="object-position:${pos}"` : ''}>`;
const need = (p, ...keys) => { for (const k of keys) if (p[k] == null || p[k] === '') throw new Error(`${p.file}: template "${p.template}" needs "${k}"`); };
const cap = (p, key, max, min = 0) => {
  const n = (p[key] || []).length;
  if (n > max) throw new Error(`${p.file}: "${key}" has ${n} entries, max ${max}`);
  if (n < min) throw new Error(`${p.file}: "${key}" has ${n} entries, min ${min}`);
};
const once = (p, html, cls, max = 1) => {
  const n = (String(html).match(new RegExp(`class="${cls}"`, 'g')) || []).length;
  if (n > max) throw new Error(`${p.file}: headline has ${n} class="${cls}" spans, max ${max}`);
};
// Seeded PRNG (FNV-1a -> mulberry32): same post file name, same pen strokes, every render.
const seeded = (str) => {
  let h = 2166136261;
  for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
// Catmull-Rom through points -> cubic Bezier path (open).
const smooth = (pts) => {
  const f = (n) => n.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
};
// One pen pass around an ellipse: 24 points, 2-5 px radial jitter, a slight tilt, and an
// overshoot past the start the way a hand closes a loop.
const penEllipse = (m, rnd) => {
  const N = 24, start = rnd() * Math.PI * 2, tilt = (rnd() - 0.5) * 0.14, pts = [];
  for (let i = 0; i <= N + 2; i++) {
    const a = start + (i / N) * Math.PI * 2;
    const j = (2 + rnd() * 3) * (rnd() < 0.5 ? -1 : 1);
    const x = (m.rx + j) * Math.cos(a), y = (m.ry + j) * Math.sin(a);
    pts.push([m.x + x * Math.cos(tilt) - y * Math.sin(tilt), m.y + x * Math.sin(tilt) + y * Math.cos(tilt)]);
  }
  return smooth(pts);
};
// Pen arrow: a slightly bowed jittered shaft plus two head strokes.
const penArrow = (a, rnd) => {
  const dx = a.x2 - a.x1, dy = a.y2 - a.y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  const bow = (rnd() - 0.5) * len * 0.12, pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, b = Math.sin(Math.PI * t) * bow, j = (rnd() - 0.5) * 3;
    pts.push([a.x1 + dx * t + nx * (b + j), a.y1 + dy * t + ny * (b + j)]);
  }
  const ang = Math.atan2(pts[8][1] - pts[7][1], pts[8][0] - pts[7][0]), L = 38;
  const h = (s) => { const t = ang + Math.PI + s * (0.45 + (rnd() - 0.5) * 0.1); return `M${a.x2.toFixed(1)},${a.y2.toFixed(1)} L${(a.x2 + L * Math.cos(t)).toFixed(1)},${(a.y2 + L * Math.sin(t)).toFixed(1)}`; };
  return `${smooth(pts)} ${h(1)} ${h(-1)}`;
};
// ---------- motion (render-motion.js) ----------
// A motion-capable shell exposes motion(p) -> <script> that defines window.setT(t) (t in seconds).
// setT is a pure function of t: no CSS transitions, no timers, so every frame is reproducible.
// The static render never loads these scripts, so the final motion frame IS the static post.
// Timelines default to fractions of the duration; p.motion.timeline overrides any phase
// with [start, end] seconds.
const MOTION_LIB = `const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=(x)=>1-Math.pow(1-clamp(x),3);
const back=(x)=>{x=clamp(x);const c=1.70158;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
const prog=(t,r)=>clamp((t-r[0])/Math.max(0.0001,r[1]-r[0]));`;
const timeline = (p, defs) => {
  const D = (p.motion && p.motion.duration) || 8;
  const tl = {};
  for (const [k, [a, b]] of Object.entries(defs)) tl[k] = [a * D, b * D];
  return Object.assign(tl, (p.motion && p.motion.timeline) || {});
};
const motionScript = (p, tl, body) => `<script>(()=>{${MOTION_LIB}
const TL=${JSON.stringify(tl)},D=${(p.motion && p.motion.duration) || 8};let ready=false;
${body}})();</script>`;

// receipt: the tape prints top-down line by line, then the dishes, then the sticker, then the headline.
const receiptMotion = (p) => motionScript(p, timeline(p, { print: [0.04, 0.45], dishes: [0.48, 0.66], sticker: [0.69, 0.74], head: [0.76, 0.84] }), `
let tape, items, dishes, sticker, head, em, H, bottoms, dishBottoms;
function setup(){tape=document.querySelector('.rc-tape');H=tape.offsetHeight;
items=[...tape.querySelectorAll('.rc-store,.rc-meta,.rc-line,.rc-total,.rc-read')];
dishes=[...tape.querySelectorAll('.rc-dish')];sticker=document.querySelector('.rc-sticker');
head=document.querySelector('.rc-head');em=head&&head.querySelector('em');
const bot=(el)=>el.offsetTop+el.offsetHeight-tape.offsetTop+10;
bottoms=items.map(bot);dishBottoms=dishes.map(bot);ready=true;}
window.setT=(t)=>{if(!ready)setup();
const f=prog(t,TL.print)*items.length;
items.forEach((el,i)=>{el.style.opacity=clamp((f-i)*2.5);});
const k=Math.min(items.length-1,Math.floor(f));const prev=k>0?bottoms[k-1]:36;
let reveal=f>=items.length?bottoms[items.length-1]:prev+(bottoms[k]-prev)*clamp(f-k);
const d=prog(t,TL.dishes)*dishes.length;
dishes.forEach((el,i)=>{const a=ease(d-i);el.style.opacity=a;el.style.transform='translateX('+((1-a)*-18)+'px)';});
if(d>0){const j=Math.min(dishes.length-1,Math.floor(d));const from=j>0?dishBottoms[j-1]:bottoms[items.length-1];reveal=d>=dishes.length?H:from+(dishBottoms[j]-from)*clamp(d-j);}
if(d>=dishes.length)reveal=H;
tape.style.clipPath='inset(0 0 '+Math.max(0,H-reveal)+'px 0)';
if(sticker){const s=prog(t,TL.sticker);sticker.style.opacity=clamp(s*3);sticker.style.transform='rotate(8deg) scale('+(0.55+0.45*back(s))+')';}
if(head){const h=prog(t,TL.head);head.style.opacity=ease(h*1.4);head.style.transform='translateY('+((1-ease(h))*26)+'px)';
if(em){em.style.opacity=ease((h-0.35)*2);}}};`);

// poster: headline holds from frame 0 (silent-safe), the tomato underline draws in, body fades,
// the readout counts up to its values, the ticker strip fills left to right.
const posterMotion = (p) => motionScript(p, timeline(p, { underline: [0.08, 0.22], body: [0.2, 0.3], count: [0.26, 0.55], strip: [0.36, 0.56] }), `
let u, body, vals, bars;
function setup(){u=document.querySelector('.po-head .u');body=document.querySelector('.po-body');
vals=[...document.querySelectorAll('.po-readout .v')].map(el=>({el,src:el.textContent}));
bars=[...document.querySelectorAll('.po-strip i')];ready=true;}
const count=(src,a)=>src.replace(/\\d+(?:\\.\\d+)?/g,(m)=>{const dec=(m.split('.')[1]||'').length;return (parseFloat(m)*a).toFixed(dec);});
window.setT=(t)=>{if(!ready)setup();
if(u)u.style.backgroundSize=(ease(prog(t,TL.underline))*100)+'% 0.075em';
if(body)body.style.opacity=ease(prog(t,TL.body));
const c=ease(prog(t,TL.count));vals.forEach(v=>{v.el.textContent=count(v.src,c);});
const s=prog(t,TL.strip)*bars.length;bars.forEach((b,i)=>{b.style.transformOrigin='0 50%';b.style.transform='scaleX('+ease(s-i)+')';});};`);

// bleed: 1.06x slow zoom on the photo while the headline reveals word by word, sub after.
const bleedMotion = (p) => motionScript(p, timeline(p, { eyebrow: [0.03, 0.1], head: [0.1, 0.5], sub: [0.52, 0.62] }), `
let bg, eb, words, sub;
function split(el){const out=[];const walk=(n)=>{for(const c of [...n.childNodes]){if(c.nodeType===3){const parts=c.textContent.split(/(\\s+)/);const frag=document.createDocumentFragment();
parts.forEach(w=>{if(!w)return;if(/^\\s+$/.test(w)){frag.appendChild(document.createTextNode(w));return;}const s=document.createElement('span');s.textContent=w;s.style.display='inline-block';frag.appendChild(s);out.push(s);});
n.replaceChild(frag,c);}else walk(c);}};walk(el);return out;}
function setup(){bg=document.querySelector('.ig-bleed .bg');eb=document.querySelector('.ig-bleed .eyebrow');
words=split(document.querySelector('.ig-bleed .bhead'));sub=document.querySelector('.ig-bleed .bsub');ready=true;}
window.setT=(t)=>{if(!ready)setup();
bg.style.transformOrigin='50% 45%';bg.style.transform='scale('+(1+0.06*clamp(t/D))+')';
if(eb)eb.style.opacity=ease(prog(t,TL.eyebrow));
const w=prog(t,TL.head)*words.length;words.forEach((s,i)=>{const a=ease((w-i)*1.6);s.style.opacity=a;s.style.transform='translateY('+((1-a)*22)+'px)';});
if(sub)sub.style.opacity=ease(prog(t,TL.sub));};`);

// Row helper for shells whose bottom row carries its own caption/headline: badge left or right of it.
const withBadge = (content, b, h) => h === 'l' ? `${b}${content}` : `${content}${b}`;

const TEMPLATES = {
  // ---------- paper surfaces ----------
  photo: { surface: 'paper', render: (p, PHOTOS) => `<div class="pin t-photo">
    <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
    <div class="panel">${eyebrow(p)}<h1 class="head">${p.head}</h1>${chips(p)}<div class="spacer"></div>${footer(p, F_PHOTO_TOP)}</div>
  </div>` },

  igphoto: { surface: 'paper', render: (p, PHOTOS) => `<div class="pin ig-photo">
    <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
    <div class="panel">${eyebrow(p)}<h1 class="head">${p.head}</h1>${chips(p)}<div class="spacer"></div>${footer(p, F_PHOTO_TOP)}</div>
  </div>` },

  list: { surface: 'paper', render: (p) => `<div class="pin t-list">
    <div class="list-wrap">${eyebrow(p)}<h1 class="head">${p.head}</h1>
    <div class="list">${p.items.map((it, i) => `<div class="item"><div class="num">${i + 1}</div><div class="lab"><span class="t">${it.t}</span><span class="s">${it.s}</span></div></div>`).join('')}</div></div>${footer(p, F_PAPER)}
  </div>` },

  recipe: { surface: 'paper', deprecated: 'text-only recipe cards are feed-dead: use recipephoto', render: (p) => `<div class="pin ig-recipe">
    <div class="rwrap">${eyebrow(p)}<h1 class="head">${p.head}</h1>
    <div class="need">You need</div><div class="ings">${p.ings.map(x => `<span class="ing">${x}</span>`).join('')}</div>
    <div class="method"><span class="rule"></span><p>${p.method}</p></div></div>${footer(p, F_PAPER)}
  </div>` },

  quote: { surface: 'paper', deprecated: 'paper quote retired: use quotedark', render: (p) => `<div class="pin ig-quote">
    <div class="qwrap">${eyebrow(p)}<blockquote class="quote">${p.quote}</blockquote>
    <div class="attr"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="name">${p.name}</span></div></div>${footer(p, F_PAPER)}
  </div>` },

  stat: { surface: 'paper', render: (p) => `<div class="pin t-stat">
    <div class="stat-wrap">${eyebrow(p)}<div class="stat">${p.stat}</div>
    <div class="stat-sub">${p.statSub}</div><div class="stat-body"><span class="rule"></span><p>${p.statBody}</p></div></div>${footer(p, F_PAPER)}
  </div>` },

  recipephoto: { surface: 'paper', render: (p, PHOTOS) => `<div class="pin t-recipephoto">
    <div class="hero"><img src="${PHOTOS}/${p.photo}" alt="" style="object-position:${p.objPos || 'center'}"></div>
    <div class="panel">${eyebrow(p)}<h1 class="head">${p.head}</h1>
    <div class="need">You need</div><div class="ings">${p.ings.map(x => `<span class="ing">${x}</span>`).join('')}</div>
    <div class="method"><span class="rule"></span><p>${p.method}</p></div><div class="spacer"></div>${footer(p, F_PHOTO_TOP)}</div>
  </div>` },

  adtype: { surface: 'paper', render: (p, PHOTOS) => `<div class="pin ad-type">
    <span class="rule"></span><h1 class="head">${p.head}</h1><p class="sub">${p.sub}</p>
    <div class="ad-badges"><img src="${PHOTOS}/../app-store-badge.png" alt="Download on the App Store"><span class="free">Free on iOS</span></div>
    <div class="ad-foot">${badge}</div>
  </div>` },

  adphoto: { surface: 'paper', render: (p, PHOTOS) => `<div class="pin ad-photo">
    <div class="hero"><img src="${PHOTOS}/${p.photo}" alt="" style="object-position:${p.objPos || 'center'}"></div>
    <div class="panel"><h1 class="head">${p.head}</h1><p class="sub">${p.sub}</p>
    <div class="ad-badges"><img src="${PHOTOS}/../app-store-badge.png" alt="Download on the App Store"><span class="free">Free on iOS</span></div>
    <div class="ad-foot">${badge}</div></div>
  </div>` },

  addevice: { surface: 'mint', render: (p, PHOTOS) => `<div class="pin ad-device">
    <h1 class="head">${p.head}</h1><p class="sub">${p.sub}</p>
    <div class="stage"><div class="phone"><img src="${PHOTOS}/${p.photo}" alt=""></div></div>
    <div class="ad-row"><div class="ad-badges"><img src="${PHOTOS}/../app-store-badge.png" alt="Download on the App Store"><span class="free">Free on iOS</span></div>${badge}</div>
  </div>` },

  adbleed: { surface: 'photo-bleed', render: (p, PHOTOS) => `<div class="pin ad-bleed">
    <img class="bg" src="${PHOTOS}/${p.photo}" alt="" style="object-position:${p.objPos || 'center'}"><div class="scrim2"></div>
    <div class="bwrap"><div class="eyebrow">${p.eyebrow}</div><h1 class="bhead">${p.head}</h1><p class="bsub">${p.sub}</p>
    <span class="ad-btn">${p.btn || 'Learn more'}</span></div>
    <div class="foot-ad">${badgeDark}<span class="url" style="color:rgba(255,255,255,0.75)">ieatzhealthy.com</span></div>
  </div>` },

  adstatdark: { surface: 'dark', render: (p) => `<div class="pin ad-statdark">
    <div class="eyebrow">${p.eyebrow}</div><div class="stat">${p.stat}</div>
    <h1 class="ssub">${p.sub}</h1><p class="sbody">${p.body}</p>
    <span class="ad-btn">${p.btn || 'Learn more'}</span>
    <div class="foot-row">${badgeDark}<span class="url" style="color:rgba(255,255,255,0.7)">ieatzhealthy.com</span></div>
  </div>` },

  // ---------- mint surface ----------
  device: { surface: 'mint', render: (p, PHOTOS) => `<div class="pin t-device">
    <div class="dhead">${eyebrow(p)}<h1 class="head">${p.head}</h1><p class="dcap">${p.cap}</p></div>
    <div class="stage"><div class="phone"><span class="screen"><img src="${PHOTOS}/${p.photo}" alt=""></span></div></div>
    ${footer(p, { url: foot, row: rowPaper, bottom: 'paper', top: 'paper' })}
  </div>` },

  // ---------- dark surface ----------
  statdark: { surface: 'dark', deprecated: 'folded into poster (type-only shell)', render: (p) => `<div class="pin ig-statdark">
    <div class="swrap">${eyebrow(p, ' mint')}<div class="bignum">${p.stat}</div>
    <h1 class="subhead">${p.sub}</h1><div class="stat-body"><span class="rule"></span><p>${p.body}</p></div></div>
    ${footer(p, { url: `<div class="foot-dark">${badgeDark}<span class="url">ieatzhealthy.com</span></div>`, row: rowDark, bottom: 'dark', top: 'dark' })}
  </div>` },

  quotedark: { surface: 'dark', render: (p, PHOTOS) => `<div class="pin ig-quotedark">
    <img class="bg" src="${PHOTOS}/${p.photo}" alt=""><div class="scrim heavy"></div>
    <div class="qwrap">${eyebrow(p, ' mint')}<h1 class="quote">${p.quote}</h1><div class="attr">${p.attr}</div></div>${footer(p, { ...F_BLEED, top: 'dark' })}
  </div>` },

  // ---------- photo-bleed surface ----------
  bleed: { surface: 'photo-bleed', motion: bleedMotion, render: (p, PHOTOS) => `<div class="pin ig-bleed">
    <img class="bg" src="${PHOTOS}/${p.photo}" alt="" style="object-position:${p.objPos || 'center'}"><div class="scrim"></div>
    <div class="bwrap">${eyebrow(p, ' mint')}<h1 class="bhead">${p.head}</h1>${p.sub ? `<p class="bsub">${p.sub}</p>` : ''}</div>${footer(p, F_BLEED)}
  </div>` },

  // ---------- v2 shells (Sep 2026 creative refresh) ----------
  // receipt: the product mechanic on screen. Receipt tape on deep green, mono line items,
  // "iEatz read this as" and the dinners it maps to. Motion-capable (tape prints line by line).
  receipt: { surface: 'dark', defaultFooter: 'badge-br', motion: receiptMotion, render: (p) => {
    need(p, 'store', 'total', 'head'); cap(p, 'lines', 6, 1); cap(p, 'dishes', 4, 1);
    if ((p.head.match(/<em>/g) || []).length > 1) throw new Error(`${p.file}: receipt head allows one <em>`);
    const f = p.footer || 'badge-br';
    const row = (b, h) => `<div class="rc-bottom">${withBadge(`<h1 class="rc-head" data-fit="56">${p.head}</h1>`, b, h)}</div>`;
    const bottom = f === 'badge-bl' || f === 'badge-br' ? footer(p, { row, bottom: 'dark', def: 'badge-br' })
      : `<div class="rc-bottom"><h1 class="rc-head" data-fit="56">${p.head}</h1></div>${footer(p, { url: `<div class="foot-dark rc-url">${badgeDark}<span class="url">ieatzhealthy.com</span></div>`, bottom: 'dark', top: 'dark', def: 'badge-br' })}`;
    return `<div class="pin sh-receipt">
    <div class="rc-stage"><div class="rc-wrap">
      <div class="rc-tape">
        <div class="rc-store">${p.store}</div>${p.meta ? `<div class="rc-meta">${p.meta}</div>` : ''}
        <div class="rc-lines">${p.lines.map(l => `<div class="rc-line"><span>${l.item}</span><span>${l.price}</span></div>`).join('')}${p.moreCount ? `<div class="rc-line rc-more"><span>+ ${p.moreCount} more</span><span></span></div>` : ''}</div>
        <div class="rc-total"><span>Total</span><span>${p.total}</span></div>
        <div class="rc-read">iEatz read this as</div>
        <div class="rc-dishes">${p.dishes.map(d => `<div class="rc-dish"><span class="n">${d.name}</span><span class="w">${d.when}</span></div>`).join('')}</div>
      </div>
      ${p.sticker ? `<div class="rc-sticker">${p.sticker}</div>` : ''}
    </div></div>
    ${bottom}
  </div>`; } },

  // poster: type is the picture. One tomato underline (.u), one green italic (.i), mono readout,
  // optional ticker strip. Replaces statdark as the type-only shell. Motion: readout counts up,
  // underline draws in.
  poster: { surface: 'paper', defaultFooter: 'badge-tr', motion: posterMotion, render: (p) => {
    need(p, 'head'); once(p, p.head, 'u'); once(p, p.head, 'i'); cap(p, 'readout', 3);
    const hasU = /class="u"/.test(p.head);
    const bars = Array.from({ length: 8 }, (_, i) => `<i class="${i % 2 ? (hasU ? 'k' : 't') : 'g'}"></i>`).join('');
    return `<div class="pin sh-poster">
    <h1 class="po-head" data-fit="84">${p.head}</h1>
    ${p.body || p.readout ? `<div class="po-row">${p.body ? `<p class="po-body">${p.body}</p>` : '<span></span>'}${p.readout ? `<div class="po-readout">${p.readout.map(r => `<div class="ro"><span class="l">${r.label}</span><span class="v">${r.value}</span></div>`).join('')}</div>` : ''}</div>` : ''}
    ${p.strip ? `<div class="po-strip">${bars}</div>` : ''}
    ${footer(p, { url: foot, row: rowPaper, bottom: 'paper', top: 'paper', def: 'badge-tr' })}
  </div>`; } },

  // collage: 2-3 photos as cut cards on deep paper, saffron tape, serif annotations, one tomato
  // price tag, film grain. Positions are px on a 1080x1350 stage, scaled by frame width and
  // centered vertically at other sizes.
  collage: { surface: 'paper-deep', defaultFooter: 'badge-tl', ownGrain: true, render: (p, PHOTOS) => {
    need(p, 'head'); cap(p, 'cards', 3, 2); cap(p, 'notes', 4);
    const s = p.w / 1080, top = Math.round((p.h - 1350 * s) / 2);
    const tape = (t) => !t ? '' : `<i class="cc-tape ${t === true ? 'c' : t}"></i>`;
    return `<div class="pin sh-collage">
    <div class="cc-stage" style="top:${top}px;transform:scale(${s})">
      ${p.cards.map(c => `<div class="cc-card" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;transform:rotate(${c.rot || 0}deg)">${img(PHOTOS, c.photo, c.objPos)}${tape(c.tape)}</div>`).join('')}
      ${(p.notes || []).map(n => `<div class="cc-note${n.big ? ' big' : ''}" style="left:${n.x}px;top:${n.y}px">${n.text}</div>`).join('')}
      ${p.arrow ? `<div class="cc-arrow" style="left:${p.arrow.x}px;top:${p.arrow.y}px">${p.arrow.text}</div>` : ''}
      ${p.price ? `<div class="cc-price" style="left:${p.price.x}px;top:${p.price.y}px">${p.price.text}</div>` : ''}
      <h1 class="cc-head">${p.head}</h1>
    </div>
    ${p.grain === false ? '' : '<div class="grain-layer"></div>'}
    ${footer(p, { url: foot, row: rowPaper, bottom: 'paper', top: 'paper', def: 'badge-tl' })}
  </div>`; } },

  // split: before over after in one frame. Top photo + mono label, bottom photo under a dark
  // scrim, paper seam label on the cut, caption bottom (<b> renders mono saffron).
  split: { surface: 'photo-bleed', defaultFooter: 'badge-br', render: (p, PHOTOS) => {
    need(p, 'top', 'bottom', 'seam');
    const f = p.footer || 'badge-br';
    const labelSide = f === 'badge-tl' ? 'r' : 'l';
    const capHtml = p.cap ? `<p class="sp-cap">${p.cap}</p>` : '<span></span>';
    const row = (b, h) => `<div class="sp-row">${withBadge(capHtml, b, h)}</div>`;
    const bottom = f === 'badge-bl' || f === 'badge-br' ? footer(p, { row, bottom: 'dark', def: 'badge-br' })
      : `${p.cap ? `<div class="sp-row">${capHtml}</div>` : ''}${f === 'badge-url' ? `<div class="foot-dark sp-url">${badgeDark}<span class="url">ieatzhealthy.com</span></div>` : ''}`;
    return `<div class="pin sh-split">
    <div class="sp-half sp-top">${img(PHOTOS, p.top.photo, p.top.objPos)}${p.top.label ? `<div class="sp-label ${labelSide}">${p.top.label}</div>` : ''}</div>
    <div class="sp-half sp-bot">${img(PHOTOS, p.bottom.photo, p.bottom.objPos)}<div class="sp-scrim"></div></div>
    <div class="sp-cut"></div>
    <div class="sp-seam"><div class="sp-pill" data-fit="36">${p.seam}</div></div>
    <div class="sp-foot">${bottom}</div>
    ${f === 'badge-tl' || f === 'badge-tr' ? footer(p, { top: 'photo', bottom: 'dark' }) : ''}
  </div>`; } },

  // thread: the 5:45 "what do you want for dinner" text exchange. A messaging UI, not iEatz UI.
  // bg: "mint" (panel) or {photo, objPos} (bubbles float over a full-bleed photo, "Delivered"
  // under the last me bubble, one white line at the bottom).
  thread: { defaultFooter: 'badge-br', surface: (p) => (p.bg && typeof p.bg === 'object' ? 'photo-bleed' : 'mint'), render: (p, PHOTOS) => {
    const onPhoto = p.bg && typeof p.bg === 'object';
    const bubbles = (p.msgs || []).filter(m => m.who);
    if (!bubbles.length) throw new Error(`${p.file}: thread needs at least one message`);
    if (bubbles.length > 8) throw new Error(`${p.file}: thread has ${bubbles.length} messages, max 8`);
    let lastMe = -1; p.msgs.forEach((m, i) => { if (m.who === 'me') lastMe = i; });
    const msgs = p.msgs.map((m, i) => {
      const el = m.time ? `<div class="th-time">${m.time}</div>`
        : m.photo ? `<div class="th-b me ph">${img(PHOTOS, m.photo, m.objPos)}</div>`
        : `<div class="th-b ${m.who === 'me' ? 'me' : 'them'}">${m.text}</div>`;
      return el + (onPhoto && i === lastMe ? '<div class="th-dlv">Delivered</div>' : '');
    }).join('');
    const on = onPhoto ? 'dark' : 'paper';
    const fline = p.foot ? `<p class="th-line">${p.foot}</p>` : '<span></span>';
    const row = (b, h) => `<div class="th-foot">${withBadge(fline, b, h)}</div>`;
    const f = p.footer || 'badge-br';
    const bottom = f === 'badge-bl' || f === 'badge-br' ? footer(p, { row, bottom: on, def: 'badge-br' })
      : `${p.foot ? `<div class="th-foot">${fline}</div>` : ''}${footer(p, { url: onPhoto ? `<div class="foot-dark th-url">${badgeDark}<span class="url">ieatzhealthy.com</span></div>` : foot.replace('class="foot"', 'class="foot th-url"'), top: onPhoto ? 'photo' : 'paper', bottom: on, def: 'badge-br' })}`;
    return `<div class="pin sh-thread${onPhoto ? ' on-photo' : ''}">
    ${onPhoto ? `<img class="bg" src="${PHOTOS}/${p.bg.photo}" alt="" style="object-position:${p.bg.objPos || 'center'}"><div class="th-scrim"></div>` : ''}
    ${p.head ? `<h1 class="th-head">${p.head}</h1>` : ''}
    <div class="th-msgs">${msgs}</div>
    ${bottom}
  </div>`; } },

  // sharpie: a photo marked up with a pen. Marks are ellipses/arrows in 1080x1350 photo space on
  // a 4:5 stage that COVERS the frame, so marks stay on the thing they circle at every size.
  // Pen paths are seeded from the post file name: re-renders are identical.
  sharpie: { surface: 'photo-bleed', defaultFooter: 'badge-br', render: (p, PHOTOS) => {
    need(p, 'photo', 'head'); cap(p, 'marks', 4, 1);
    const headText = String(p.head).replace(/<[^>]+>/g, '');
    if (headText.length > 24) throw new Error(`${p.file}: sharpie head is ${headText.length} chars, max 24`);
    const ink = p.ink || '#0A0F0C';
    const c = Math.max(p.w / 1080, p.h / 1350);
    const vx = (1080 * c - p.w) / (2 * c), vy = (1350 * c - p.h) / (2 * c);
    for (const m of p.marks) {
      if (m.x - m.rx < vx + 8 || m.x + m.rx > 1080 - vx - 8 || m.y - m.ry < vy + 8 || m.y + m.ry > 1350 - vy - 8)
        throw new Error(`${p.file}: mark at (${m.x},${m.y}) is cropped out of the ${p.w}x${p.h} frame (visible x ${Math.round(vx)}-${Math.round(1080 - vx)}, y ${Math.round(vy)}-${Math.round(1350 - vy)})`);
    }
    const rnd = seeded(p.file);
    const sw = (6 / c).toFixed(2);
    const paths = p.marks.map(m => `<path d="${penEllipse(m, rnd)}"/><path d="${penEllipse(m, rnd)}" opacity="0.92"/>`).join('')
      + (p.arrows || []).map(a => `<path d="${penArrow(a, rnd)}"/>`).join('');
    const labels = p.marks.filter(m => m.label).map(m => {
      const side = m.labelSide || 'above';
      const pos = side === 'right' ? `left:${m.x + m.rx + 26}px;top:${m.y}px;transform:translateY(-50%)`
        : side === 'below' ? `left:${m.x}px;top:${m.y + m.ry + 18}px;transform:translateX(-50%)`
        : `left:${m.x}px;top:${m.y - m.ry - 18}px;transform:translate(-50%,-100%)`;
      return `<div class="sk-label" style="${pos};font-size:${(44 / c).toFixed(1)}px">${m.label}</div>`;
    }).join('');
    const shade = p.shade != null ? p.shade : (p._topLum != null && p._topLum > 0.6 && ink !== '#fff' && ink.toLowerCase() !== '#ffffff');
    return `<div class="pin sh-sharpie" style="--ink-pen:${ink}">
    <div class="sk-stage" style="transform:translate(-50%,-50%) scale(${c})">
      ${img(PHOTOS, p.photo, p.objPos)}
      ${shade ? `<div class="sk-shade" style="top:${vy.toFixed(1)}px;height:${(0.34 * p.h / c).toFixed(1)}px"></div>` : ''}
      <svg class="sk-pen" viewBox="0 0 1080 1350" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>
      ${labels}
    </div>
    <h1 class="sk-head">${p.head}</h1>
    ${footer(p, { url: footDark, row: rowDarkAbs, top: 'photo', bottom: 'photo', def: 'badge-br' })}
  </div>`; } },
};

const surfaceOf = (p) => { const t = TEMPLATES[p.template]; if (!t) return null; return typeof t.surface === 'function' ? t.surface(p) : t.surface; };
// Footer a post actually renders with (legacy shells default to badge-url; ad shells have their own).
const footerOf = (p) => { const t = TEMPLATES[p.template]; if (!t) return null; if (/^ad/.test(p.template)) return 'ad'; return p.footer || t.defaultFooter || 'badge-url'; };

module.exports = { TEMPLATES, MARK, badge, badgeDark, foot, footDark, FOOTERS, surfaceOf, footerOf };
