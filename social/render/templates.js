// Single shell registry — ALL templates live here; ALL CSS lives in base.css.
// Every shell works at both 1080x1350 (IG) and 1000x1500 (Pinterest).
// Surfaces: paper | mint | dark | photo-bleed. The diversity gate reads these tags.

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

  recipe: { surface: 'paper', render: (p) => `<div class="pin ig-recipe">
    <div class="rwrap">${eyebrow(p)}<h1 class="head">${p.head}</h1>
    <div class="need">You need</div><div class="ings">${p.ings.map(x => `<span class="ing">${x}</span>`).join('')}</div>
    <div class="method"><span class="rule"></span><p>${p.method}</p></div></div>${footer(p, F_PAPER)}
  </div>` },

  quote: { surface: 'paper', render: (p) => `<div class="pin ig-quote">
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
  statdark: { surface: 'dark', render: (p) => `<div class="pin ig-statdark">
    <div class="swrap">${eyebrow(p, ' mint')}<div class="bignum">${p.stat}</div>
    <h1 class="subhead">${p.sub}</h1><div class="stat-body"><span class="rule"></span><p>${p.body}</p></div></div>
    ${footer(p, { url: `<div class="foot-dark">${badgeDark}<span class="url">ieatzhealthy.com</span></div>`, row: rowDark, bottom: 'dark', top: 'dark' })}
  </div>` },

  quotedark: { surface: 'dark', render: (p, PHOTOS) => `<div class="pin ig-quotedark">
    <img class="bg" src="${PHOTOS}/${p.photo}" alt=""><div class="scrim heavy"></div>
    <div class="qwrap">${eyebrow(p, ' mint')}<h1 class="quote">${p.quote}</h1><div class="attr">${p.attr}</div></div>${footer(p, { ...F_BLEED, top: 'dark' })}
  </div>` },

  // ---------- photo-bleed surface ----------
  bleed: { surface: 'photo-bleed', render: (p, PHOTOS) => `<div class="pin ig-bleed">
    <img class="bg" src="${PHOTOS}/${p.photo}" alt="" style="object-position:${p.objPos || 'center'}"><div class="scrim"></div>
    <div class="bwrap">${eyebrow(p, ' mint')}<h1 class="bhead">${p.head}</h1>${p.sub ? `<p class="bsub">${p.sub}</p>` : ''}</div>${footer(p, F_BLEED)}
  </div>` },
};

module.exports = { TEMPLATES, MARK, badge, badgeDark, foot, footDark, FOOTERS };
