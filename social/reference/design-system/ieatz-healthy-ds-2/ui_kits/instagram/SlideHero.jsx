// SlideHero.jsx — Editorial hero slide (carousel cover, single post)
function SlideHero({
  eyebrow = "Issue 04 · Pantry edit",
  title = (<>Cook with what's <i style={{color:'var(--brand-green)'}}>already there.</i></>),
  body = "Tap once. Snap your fridge. We'll do the rest — 12 minute dinners pulled from your real ingredients, no grocery run.",
  pager
} = {}) {
  return (
    <div className="ig-slide" data-screen-label="01 Hero" style={{background: 'var(--paper)'}}>
      {/* Soft top illustration band */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:540,
        background: 'radial-gradient(60% 100% at 80% 20%, rgba(31,139,76,0.10), transparent 70%), radial-gradient(60% 80% at 10% 30%, rgba(97,202,140,0.10), transparent 70%)'
      }} />

      {/* Eyebrow */}
      <div style={{position:'absolute', top:160, left:80, right:80}}>
        <span className="ig-eyebrow">{eyebrow}</span>
        <span className="ig-accent" style={{marginTop:24}} />
      </div>

      {/* Title (Instrument Serif) */}
      <h1 style={{
        position:'absolute', top:340, left:80, right:80, margin:0,
        fontFamily:'var(--font-serif)', fontWeight:500,
        fontSize:144, lineHeight:0.98, letterSpacing:'-0.02em',
        color:'var(--ink-1)',
        fontVariationSettings: "'opsz' 36",
        textWrap:'balance'
      }}>{title}</h1>

      {/* Body */}
      <p style={{
        position:'absolute', top:920, left:80, right:240, margin:0,
        fontFamily:'var(--font-sans)', fontSize:32, fontWeight:400, lineHeight:1.4,
        color:'var(--ink-3)', textWrap:'pretty'
      }}>{body}</p>

      {/* Bottom-right read affordance */}
      <div style={{
        position:'absolute', bottom:60, right:80,
        fontFamily:'var(--font-sans)', fontSize:22, fontWeight:500,
        color:'var(--ink-3)', letterSpacing:'0.04em'
      }}>
        Swipe → 
      </div>

      <IGBadge />
      {pager && <div className="ig-pager">{pager}</div>}
    </div>
  );
}

Object.assign(window, { SlideHero });
