/* Shared.jsx — primitives for the iEatz pillar social templates.
   Exposed on window for the carousel + pin scripts. */

const IEATZ_MARK = "M 0 5.03 C 0 2.252 2.252 0 5.03 0 L 33.22 0 C 35.998 0 38.25 2.252 38.25 5.03 L 38.25 20.119 L 0 20.119 L 0 5.03 Z M 0 49.83 C 0 52.608 2.252 54.86 5.03 54.86 L 33.22 54.86 C 35.998 54.86 38.25 52.608 38.25 49.83 L 38.25 22.81 L 0 22.81 L 0 49.83 Z";

function Mark({ className = "mark" }) {
  return (
    <svg className={className} viewBox="0 0 38.25 58.486" fill="currentColor" aria-hidden="true">
      <path d="M 0 5.03 C 0 2.252 2.252 0 5.03 0 L 33.22 0 C 35.998 0 38.25 2.252 38.25 5.03 L 38.25 20.119 L 0 20.119 L 0 5.03 Z" />
      <path d="M 0 49.83 C 0 52.608 2.252 54.86 5.03 54.86 L 33.22 54.86 C 35.998 54.86 38.25 52.608 38.25 49.83 L 38.25 22.81 L 0 22.81 L 0 49.83 Z" />
      <path d="M 6.083 6.2 C 6.083 5.489 6.659 4.913 7.369 4.913 C 8.08 4.913 8.656 5.489 8.656 6.2 L 8.656 16.259 C 8.656 16.97 8.08 17.546 7.369 17.546 C 6.659 17.546 6.083 16.97 6.083 16.259 L 6.083 6.2 Z" />
      <path d="M 6.083 26.787 C 6.083 26.076 6.659 25.5 7.369 25.5 C 8.08 25.5 8.656 26.076 8.656 26.787 L 8.656 36.846 C 8.656 37.557 8.08 38.133 7.369 38.133 C 6.659 38.133 6.083 37.557 6.083 36.846 L 6.083 26.787 Z" />
    </svg>
  );
}

// Brand badge — corner lock-up. pos: 'bl' | 'br'
function Badge({ dark = false, pos = "bl", handle = false }) {
  const style = pos === "br" ? { bottom: 62, right: 80 } : { bottom: 62, left: 80 };
  return (
    <div className={"badge" + (dark ? " on-dark" : "")} style={style}>
      <Mark />
      <div className="wm">
        <b>iEatz</b>
        <span>{handle ? "@ieatz.healthy" : "Healthy"}</span>
      </div>
    </div>
  );
}

// Carousel pager dots
function Pager({ n, total, dark = false }) {
  return (
    <div className={"pager" + (dark ? " on-dark" : "")}>
      {Array.from({ length: total }).map((_, i) => (
        <i key={i} className={i === n ? "on" : ""} />
      ))}
    </div>
  );
}

function Swipe({ dark = false, label = "Swipe" }) {
  return (
    <div className={"swipe" + (dark ? " on-dark" : "")}>
      <span>{label}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

// The connecting green "horizon" wave (echoes the CPP tiles). Sits at a given
// baseline (px from top of the frame). Fills below + rides three contour lines.
function Horizon({ width, height, base, dark = false, opacity }) {
  const step = 26, period = width * 0.9, amp = height * 0.045, phase = 0.7;
  const crest = (x) => base + amp * Math.sin((x / period) * Math.PI * 2 + phase);
  let top = "";
  for (let x = 0; x <= width; x += step) top += (x === 0 ? "M" : "L") + x + " " + crest(x).toFixed(1) + " ";
  const fillPath = "M0 " + height + " " + top + "L" + width + " " + height + " Z";
  const offs = [[0, 5], [-height * 0.05, 2.5], [-height * 0.1, 2]];
  const fillColor = dark ? "#0B3A21" : "var(--pillar-accent)";
  const lineColor = dark ? "#6FCB93" : "var(--pillar-accent)";
  return (
    <svg className="horizon" width={width} height={height} viewBox={`0 0 ${width} ${height}`}
         preserveAspectRatio="none"
         style={{ position: "absolute", inset: 0, zIndex: 1, opacity: opacity != null ? opacity : (dark ? 0.5 : 0.14) }}>
      <path d={fillPath} fill={fillColor} />
      {offs.map(([o, sw], i) => {
        let dd = "";
        for (let x = 0; x <= width; x += step) dd += (x === 0 ? "M" : "L") + x + " " + (crest(x) + o).toFixed(1) + " ";
        return <path key={i} d={dd} fill="none" stroke={lineColor} strokeWidth={sw} strokeLinecap="round" opacity={0.9} />;
      })}
    </svg>
  );
}

// Photo slot: real image when usePhotos && src, else labelled placeholder.
function resolveSrc(src) {
  return (src && window.__resources && window.__resources[src]) || src;
}
function Photo({ src, label, pos = "center", style, className = "" }) {
  const usePhotos = window.__PILLAR_PHOTOS !== false;
  if (usePhotos && src) {
    return <div className={"photo " + className} style={{ backgroundImage: `url(${resolveSrc(src)})`, backgroundPosition: pos, ...style }} />;
  }
  return (
    <div className={"photo placeholder " + className} style={style}>
      <div className="ph-inner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M3 17l5-4 4 3 3-3 6 5" />
        </svg>
        <span>{label || "Team photo"}</span>
      </div>
    </div>
  );
}

// Phone showing an app screenshot. width in px within the 1080/1000 art space.
function Phone({ src, width = 620, style }) {
  const h = width * (2.02); // ~ device aspect incl. bezel
  return (
    <div className="phone" style={{ width, height: h, ...style }}>
      <div className="notch" />
      <div className="glass">
        <img src={resolveSrc(src)} alt="" />
      </div>
    </div>
  );
}

// Big-headline block: eyebrow + accent bar + headline (+ support)
function HeadBlock({ eyebrow, html, support, size = 92, onDark = false, gap = 34, maxWidth }) {
  const s = `calc(${size}px * var(--hl-scale))`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, maxWidth }}>
      {eyebrow && <p className={"eyebrow" + (onDark ? " on-dark" : "")}>{eyebrow}</p>}
      <span className="accent-bar" />
      <h1 className={"hl" + (onDark ? " on-dark" : "")} style={{ fontSize: s }}
          dangerouslySetInnerHTML={{ __html: html }} />
      {support && <p className={"support" + (onDark ? " on-dark" : "")}
                     dangerouslySetInnerHTML={{ __html: support }} />}
    </div>
  );
}

// Scaling wrappers used by the gallery
function IGFrame({ children, cap, dark }) {
  return (
    <div className="frame-wrap">
      <div className="scale-ig"><div className={"ig" + (dark ? " dark" : "")}>{children}</div></div>
      {cap && <div className="frame-cap">{cap}</div>}
    </div>
  );
}
function PinFrame({ children, cap, tall, dark }) {
  const usePhotos = true;
  const h = window.__PILLAR_TALL ? 1875 : 1500;
  return (
    <div className="frame-wrap">
      <div className="scale-pin" style={{ height: 300 * (h / 1000) }}>
        <div className={"pin" + (dark ? " dark" : "")} style={{ height: h }}>{children}</div>
      </div>
      {cap && <div className="frame-cap">{cap}</div>}
    </div>
  );
}

Object.assign(window, { Mark, Badge, Pager, Swipe, Horizon, Photo, Phone, HeadBlock, IGFrame, PinFrame });
