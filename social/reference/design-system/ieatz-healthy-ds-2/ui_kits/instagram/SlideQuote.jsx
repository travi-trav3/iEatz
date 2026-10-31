// SlideQuote.jsx — Pull quote slide
function SlideQuote({
  quote = "I stopped grocery-shopping for recipes. Now the recipes find me.",
  attribution = "— Maya R., Brooklyn",
  pager
} = {}) {
  return (
    <div className="ig-slide" data-screen-label="04 Quote" style={{background: 'var(--brand-green-light)'}}>
      {/* Big serif quote mark */}
      <div style={{
        position:'absolute', top:120, left:72,
        fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400,
        fontSize:380, lineHeight:0.8, color:'rgba(31,139,76,0.22)',
        userSelect:'none'
      }}>"</div>

      <blockquote style={{
        position:'absolute', top:340, left:80, right:80, margin:0,
        fontFamily:'var(--font-serif)', fontWeight:400, fontStyle:'italic',
        fontSize:84, lineHeight:1.08, letterSpacing:'-0.015em',
        color:'var(--ink-1)', textWrap:'balance'
      }}>{quote}</blockquote>

      <div style={{
        position:'absolute', bottom:240, left:80,
        display:'flex', alignItems:'center', gap:18
      }}>
        <span className="ig-accent" style={{width:48, height:4}} />
        <span style={{
          fontFamily:'var(--font-sans)', fontSize:26, fontWeight:500,
          color:'var(--ink-2)', letterSpacing:'0.02em'
        }}>{attribution}</span>
      </div>

      <IGBadge />
      {pager && <div className="ig-pager">{pager}</div>}
    </div>
  );
}

Object.assign(window, { SlideQuote });
