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

const TEMPLATES = {
  // ---------- paper surfaces ----------
  photo: { surface: 'paper', render: (p, PHOTOS) => `<div class="pin t-photo">
    <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
    <div class="panel"><div class="eyebrow">${p.eyebrow}</div><h1 class="head">${p.head}</h1>${chips(p)}<div class="spacer"></div>${foot}</div>
  </div>` },

  igphoto: { surface: 'paper', render: (p, PHOTOS) => `<div class="pin ig-photo">
    <div class="hero"><img src="${PHOTOS}/${p.photo}" alt=""></div>
    <div class="panel"><div class="eyebrow">${p.eyebrow}</div><h1 class="head">${p.head}</h1>${chips(p)}<div class="spacer"></div>${foot}</div>
  </div>` },

  list: { surface: 'paper', render: (p) => `<div class="pin t-list">
    <div class="list-wrap"><div class="eyebrow">${p.eyebrow}</div><h1 class="head">${p.head}</h1>
    <div class="list">${p.items.map((it, i) => `<div class="item"><div class="num">${i + 1}</div><div class="lab"><span class="t">${it.t}</span><span class="s">${it.s}</span></div></div>`).join('')}</div></div>${foot}
  </div>` },

  recipe: { surface: 'paper', render: (p) => `<div class="pin ig-recipe">
    <div class="rwrap"><div class="eyebrow">${p.eyebrow}</div><h1 class="head">${p.head}</h1>
    <div class="need">You need</div><div class="ings">${p.ings.map(x => `<span class="ing">${x}</span>`).join('')}</div>
    <div class="method"><span class="rule"></span><p>${p.method}</p></div></div>${foot}
  </div>` },

  quote: { surface: 'paper', render: (p) => `<div class="pin ig-quote">
    <div class="qwrap"><div class="eyebrow">${p.eyebrow}</div><blockquote class="quote">${p.quote}</blockquote>
    <div class="attr"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="name">${p.name}</span></div></div>${foot}
  </div>` },

  stat: { surface: 'paper', render: (p) => `<div class="pin t-stat">
    <div class="stat-wrap"><div class="eyebrow">${p.eyebrow}</div><div class="stat">${p.stat}</div>
    <div class="stat-sub">${p.statSub}</div><div class="stat-body"><span class="rule"></span><p>${p.statBody}</p></div></div>${foot}
  </div>` },

  recipephoto: { surface: 'paper', render: (p, PHOTOS) => `<div class="pin t-recipephoto">
    <div class="hero"><img src="${PHOTOS}/${p.photo}" alt="" style="object-position:${p.objPos || 'center'}"></div>
    <div class="panel"><div class="eyebrow">${p.eyebrow}</div><h1 class="head">${p.head}</h1>
    <div class="need">You need</div><div class="ings">${p.ings.map(x => `<span class="ing">${x}</span>`).join('')}</div>
    <div class="method"><span class="rule"></span><p>${p.method}</p></div><div class="spacer"></div>${foot}</div>
  </div>` },

  // ---------- mint surface ----------
  device: { surface: 'mint', render: (p, PHOTOS) => `<div class="pin t-device">
    <div class="dhead"><div class="eyebrow">${p.eyebrow}</div><h1 class="head">${p.head}</h1><p class="dcap">${p.cap}</p></div>
    <div class="stage"><div class="phone"><span class="screen"><img src="${PHOTOS}/${p.photo}" alt=""></span></div></div>
    <div class="foot">${badge}<span class="url">ieatzhealthy.com</span></div>
  </div>` },

  // ---------- dark surface ----------
  statdark: { surface: 'dark', render: (p) => `<div class="pin ig-statdark">
    <div class="swrap"><div class="eyebrow mint">${p.eyebrow}</div><div class="bignum">${p.stat}</div>
    <h1 class="subhead">${p.sub}</h1><div class="stat-body"><span class="rule"></span><p>${p.body}</p></div></div>
    <div class="foot-dark">${badgeDark}<span class="url">ieatzhealthy.com</span></div>
  </div>` },

  quotedark: { surface: 'dark', render: (p, PHOTOS) => `<div class="pin ig-quotedark">
    <img class="bg" src="${PHOTOS}/${p.photo}" alt=""><div class="scrim heavy"></div>
    <div class="qwrap"><div class="eyebrow mint">${p.eyebrow}</div><h1 class="quote">${p.quote}</h1><div class="attr">${p.attr}</div></div>${footDark}
  </div>` },

  // ---------- photo-bleed surface ----------
  bleed: { surface: 'photo-bleed', render: (p, PHOTOS) => `<div class="pin ig-bleed">
    <img class="bg" src="${PHOTOS}/${p.photo}" alt="" style="object-position:${p.objPos || 'center'}"><div class="scrim"></div>
    <div class="bwrap"><div class="eyebrow mint">${p.eyebrow}</div><h1 class="bhead">${p.head}</h1>${p.sub ? `<p class="bsub">${p.sub}</p>` : ''}</div>${footDark}
  </div>` },
};

module.exports = { TEMPLATES, MARK, badge, badgeDark, foot, footDark };
