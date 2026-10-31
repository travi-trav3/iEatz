// SlideStat.jsx — Big italic number on warm paper
function SlideStat({
  eyebrow = "Why it works",
  stat = "12",
  unit = "min",
  caption = (<>Average prep time when you cook from what's <b style={{color:'var(--ink-1)', fontWeight:600}}>already in your kitchen.</b></>),
  pager
} = {}) {
  return (
    <div className="ig-slide" data-screen-label="02 Stat" style={{background: 'var(--paper-light)'}}>
      <div style={{position:'absolute', top:160, left:80, right:80}}>
        <span className="ig-eyebrow">{eyebrow}</span>
      </div>

      {/* Giant italic number */}
      <div style={{
        position:'absolute', top:280, left:80, right:80,
        display:'flex', alignItems:'baseline', gap:32,
        fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400,
        color:'var(--brand-green)',
        letterSpacing:'-0.03em', lineHeight:0.85
      }}>
        <span style={{fontSize:540}}>{stat}</span>
        <span style={{fontStyle:'normal', fontSize:140, color:'var(--ink-1)', fontWeight:400}}>{unit}</span>
      </div>

      <span className="ig-accent" style={{position:'absolute', left:80, top:920}} />

      <p style={{
        position:'absolute', top:960, left:80, right:120, margin:0,
        fontFamily:'var(--font-sans)', fontSize:38, fontWeight:400, lineHeight:1.35,
        color:'var(--ink-3)', textWrap:'pretty'
      }}>{caption}</p>

      <IGBadge />
      {pager && <div className="ig-pager">{pager}</div>}
    </div>
  );
}

Object.assign(window, { SlideStat });
