// SlideRecipe.jsx — Photo-led recipe card; the workhorse slide
function SlideRecipe({
  photoLabel = "Cucumber-tahini grain bowl",
  chips = ["15 min", "Vegetarian", "From pantry"],
  title = "Lemon-tahini grain bowl",
  subtitle = "Made from 4 things in your fridge.",
  pager
} = {}) {
  return (
    <div className="ig-slide" data-screen-label="03 Recipe" style={{background: 'var(--paper)'}}>
      {/* Photo placeholder, near-full bleed top */}
      <div className="ig-photo" style={{
        position:'absolute', top:80, left:80, right:80, height:780,
        borderRadius:36
      }}><span>{photoLabel}</span></div>

      {/* Chips */}
      <div style={{position:'absolute', top:920, left:80, right:80, display:'flex', gap:14, flexWrap:'wrap'}}>
        {chips.map((c, i) => <span key={i} className="ig-pill">{c}</span>)}
      </div>

      {/* Title */}
      <h2 style={{
        position:'absolute', top:1010, left:80, right:80, margin:0,
        fontFamily:'var(--font-serif)', fontWeight:500,
        fontSize:84, lineHeight:1.0, letterSpacing:'-0.015em',
        color:'var(--ink-1)', textWrap:'balance'
      }}>{title}</h2>

      <p style={{
        position:'absolute', top:1130, left:80, right:80, margin:0,
        fontFamily:'var(--font-sans)', fontSize:28, fontWeight:400, lineHeight:1.4,
        color:'var(--ink-3)'
      }}>{subtitle}</p>

      <IGBadge />
      {pager && <div className="ig-pager">{pager}</div>}
    </div>
  );
}

Object.assign(window, { SlideRecipe });
