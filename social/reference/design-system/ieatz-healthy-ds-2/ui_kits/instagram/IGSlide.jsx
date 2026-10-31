// IGSlide.jsx — bare 1080×1350 canvas with brand badge.
function IGSlide({ children, bg = "paper", badgeSide = "left", badgeDark = false, pager, style, ...rest }) {
  const bgVar = {
    paper: "var(--paper)",
    "paper-light": "var(--paper-light)",
    mint: "var(--brand-mint)",
    "green-light": "var(--brand-green-light)",
    green: "var(--brand-green)",
    "green-dark": "var(--brand-green-dark)",
    ink: "var(--ink-1)",
    white: "var(--white)",
  }[bg] || bg;
  return (
    <section className="ig-slide" style={{ background: bgVar, ...style }} {...rest}>
      {children}
      {pager && <div className="ig-pager">{pager}</div>}
      <IGBadge side={badgeSide} dark={badgeDark} />
    </section>
  );
}

Object.assign(window, { IGSlide });
