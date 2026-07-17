/* Carousels.jsx — three 5-slide Instagram carousels, one per content pillar.
   Each slide is absolutely-positioned content inside a 1080×1350 .ig surface.
   Exports window.CAROUSELS = { pantry:[...], health:[...], grocery:[...] }
   where each item = { cap, dark, content }. */

const A = "assets/";
const TOTAL = 5;

/* ---------- reusable slide layouts ---------- */

// Full-bleed photo hook: photo top, headline block on paper below.
function HookSlide({ n, photo, photoLabel, photoPos, eyebrow, html, support, size = 90 }) {
  return (
    <>
      <Photo src={A + photo} label={photoLabel} pos={photoPos}
             style={{ position: "absolute", top: 0, left: 0, right: 0, height: 792 }} />
      <div className="bleed-top-shade" />
      <div style={{ position: "absolute", top: 852, left: 80, right: 80 }}>
        <HeadBlock eyebrow={eyebrow} html={html} support={support} size={size} gap={30} />
      </div>
      <Pager n={n} total={TOTAL} />
      <Badge pos="bl" />
      <Swipe />
    </>
  );
}

// Three-step "how it works".
function StepsSlide({ n, eyebrow, html, steps }) {
  return (
    <>
      <Horizon width={1080} height={1350} base={1180} />
      <div style={{ position: "absolute", top: 128, left: 80, right: 80 }}>
        <HeadBlock eyebrow={eyebrow} html={html} size={82} gap={28} />
      </div>
      <div style={{ position: "absolute", top: 560, left: 80, right: 80, display: "flex", flexDirection: "column", gap: 26 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "start", gap: 30,
            background: "var(--ie-white)", borderRadius: 26, padding: "38px 42px",
            boxShadow: "var(--ie-shadow-sm)", border: "var(--ie-border-card)",
          }}>
            <div style={{ fontFamily: "var(--ie-font-display)", fontStyle: "italic", fontSize: 92, lineHeight: 1, color: "var(--pillar-accent)", letterSpacing: "-0.02em" }}>{s.num}</div>
            <div>
              <div style={{ fontFamily: "var(--ie-font-display)", fontSize: 46, fontWeight: 500, lineHeight: 1.04, color: "var(--ie-ink)", letterSpacing: "-0.01em" }}>{s.title}</div>
              <div style={{ fontFamily: "var(--ie-font-sans)", fontSize: 25, lineHeight: 1.36, color: "var(--ie-ink-medium)", marginTop: 10 }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>
      <Pager n={n} total={TOTAL} />
      <Badge pos="bl" />
      <Swipe />
    </>
  );
}

// App-screenshot proof: headline top, phone centered on softened food photo.
function AppSlide({ n, eyebrow, html, support, screen, bgPhoto, pill }) {
  return (
    <>
      {bgPhoto && (
        <Photo src={A + bgPhoto} style={{ position: "absolute", inset: 0, opacity: 0.16 }} />
      )}
      <Horizon width={1080} height={1350} base={1230} opacity={0.1} />
      <div style={{ position: "absolute", top: 116, left: 80, right: 80 }}>
        <HeadBlock eyebrow={eyebrow} html={html} support={support} size={58} gap={24} maxWidth={920} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 118, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <Phone src={A + screen} width={372} />
          {pill && <span className="pill solid" style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", boxShadow: "var(--ie-shadow-md)" }}>{pill}</span>}
        </div>
      </div>
      <Pager n={n} total={TOTAL} />
      <Badge pos="bl" />
      <Swipe />
    </>
  );
}

// Dark testimonial / review slide.
function QuoteSlide({ n, photo, photoLabel, photoPos, quoteHtml, attrib, stars, eyebrow }) {
  return (
    <>
      <Photo src={A + photo} label={photoLabel} pos={photoPos}
             style={{ position: "absolute", top: 0, left: 0, right: 0, height: 700 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 760,
        background: "linear-gradient(180deg, rgba(8,49,27,0) 42%, var(--ie-green-deep) 96%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 720 }}>
        {stars && (
          <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="38" height="38" viewBox="0 0 24 24" fill="#E4A93C"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z"/></svg>
            ))}
          </div>
        )}
        {eyebrow && <p className="eyebrow on-dark" style={{ marginBottom: 22 }}>{eyebrow}</p>}
        <div style={{ fontFamily: "var(--ie-font-display)", fontSize: 62, fontWeight: 400, lineHeight: 1.16, letterSpacing: "-0.012em", color: "#fff" }}
             dangerouslySetInnerHTML={{ __html: quoteHtml }} />
        <div style={{ marginTop: 40, fontFamily: "var(--ie-font-sans)", fontSize: 24, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9FE4B3" }}>{attrib}</div>
      </div>
      <Pager n={n} total={TOTAL} dark />
      <Badge pos="bl" dark />
    </>
  );
}

// Closing CTA slide.
function CtaSlide({ n, photo, photoLabel, line, support }) {
  return (
    <>
      <Photo src={A + photo} label={photoLabel}
             style={{ position: "absolute", top: 0, left: 0, right: 0, height: 620 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 660,
        background: "linear-gradient(180deg, rgba(245,242,234,0) 52%, var(--pillar-paper) 96%)" }} />
      <div style={{ position: "absolute", top: 660, left: 80, right: 80 }}>
        <p className="eyebrow">Try iEatz Healthy</p>
        <h1 className="hl" style={{ fontSize: "calc(96px * var(--hl-scale))", marginTop: 28 }}
            dangerouslySetInnerHTML={{ __html: line }} />
        <p className="support" style={{ marginTop: 30, maxWidth: 820 }}
           dangerouslySetInnerHTML={{ __html: support }} />
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 210, display: "flex", alignItems: "center", gap: 34 }}>
        <AppStoreBadge height={104} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "var(--ie-font-sans)", fontSize: 20, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ie-ink-light)" }}>Follow along</span>
          <span style={{ fontFamily: "var(--ie-font-sans)", fontSize: 36, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ie-ink)" }}>@ieatz.healthy</span>
        </div>
      </div>
      <Pager n={n} total={TOTAL} />
    </>
  );
}

/* ============================================================
   PILLAR 1 — PANTRY / FRIDGE  · "Cook with what you have"
   ============================================================ */
const PANTRY = [
  { cap: "pantry-01 · hook", content:
    <HookSlide n={0} photo="fridge-warm-open.jpg" photoLabel="Open fridge, warm light" photoPos="center 40%"
      eyebrow="Pantry-first cooking"
      html={'Tonight’s dinner is <em>already</em><br>in your fridge.'}
      support="Three things you forgot you owned, one photo, and dinner in fifteen." size={88} /> },
  { cap: "pantry-02 · steps", content:
    <StepsSlide n={1} eyebrow="How it works" html={'Snap. Scan.<br><em>Cook.</em>'}
      steps={[
        { num: "01", title: "Open the fridge.", note: "Or the pantry, freezer, lunch bag — wherever food lives." },
        { num: "02", title: "Snap a photo.", note: "iEatz reads the ingredients. No typing, no checklist." },
        { num: "03", title: "Cook in fifteen.", note: "Real recipes, ranked by what you actually have." },
      ]} /> },
  { cap: "pantry-03 · app", content:
    <AppSlide n={2} eyebrow="From your kitchen" html={'Recipes from <em>what you have</em> —<br>not a shopping list from 2019.'}
      screen="screen-recipe.png" bgPhoto="buddha-bowl.jpg" /> },
  { cap: "pantry-04 · quote", dark: true, content:
    <QuoteSlide n={3} photo="couple-cooking.jpg" photoLabel="Couple cooking together" photoPos="center 30%"
      quoteHtml={'“I haven’t ordered takeout in three weeks. The wildest part is I’m <span style="color:#9FE4B3;font-style:italic">cooking from what was already there.</span>”'}
      attrib="Maya R. · iEatz user since March" /> },
  { cap: "pantry-05 · cta", content:
    <CtaSlide n={4} photo="pan-steam.jpg" photoLabel="Pan on the stove, steam"
      line="Stop staring<br>into the <em>fridge.</em>"
      support="iEatz turns what you already own into dinner. The starter plan is <b>free, forever.</b>" /> },
];

/* ============================================================
   PILLAR 2 — HEALTH / DIET  · "Body stats · macros · calories"
   ============================================================ */
const HEALTH = [
  { cap: "health-01 · hook", content:
    <HookSlide n={0} photo="green-bowl-floral.jpg" photoLabel="Green grain bowl, top-down" photoPos="center"
      eyebrow="Built around you"
      html={'Healthy dinners,<br><em>your numbers.</em>'}
      support="Every recipe tuned to your calories, macros, and goals — before you cook." size={90} /> },
  { cap: "health-02 · app", content:
    <AppSlide n={1} eyebrow="Know before you cook" html={'See <em>calories & macros</em><br>before the first chop.'}
      support="Protein, carbs, fat and calories on every recipe card." screen="screen-recipe.png" bgPhoto="green-bowl-floral.jpg" /> },
  { cap: "health-03 · app", content:
    <AppSlide n={2} eyebrow="Tuned to you" html={'Targets set to<br><em>your body.</em>'}
      support="Tell iEatz your goals once — every suggestion follows." screen="screen-weight.png" bgPhoto="prep-spread-greens.jpg" /> },
  { cap: "health-04 · review", dark: true, content:
    <QuoteSlide n={3} photo="health-person.jpg" photoLabel="Person eating well, bright" photoPos="center 30%"
      eyebrow="Loved on the App Store" stars
      quoteHtml={'“Superb for healthy meals. <span style="color:#9FE4B3;font-style:italic">Love using it to plan my meals.</span>”'}
      attrib="Leoactionz · App Store review" /> },
  { cap: "health-05 · cta", content:
    <CtaSlide n={4} photo="prep-spread-greens.jpg" photoLabel="Prep spread, fresh greens"
      line="Eat for <em>your</em><br>body, not a<br>generic plan."
      support="Set your targets and let iEatz do the math. <b>Free to start.</b>" /> },
];

/* ============================================================
   PILLAR 3 — GROCERY / INSTACART  · "Ingredients · Instacart · inventory"
   ============================================================ */
const GROCERY = [
  { cap: "grocery-01 · hook", content:
    <HookSlide n={0} photo="tacos-lime.jpg" photoLabel="Chickpea & lime tacos" photoPos="center 45%"
      eyebrow="Grocery, sorted"
      html={'Cook what<br>you’re <em>craving.</em>'}
      support="Pick any recipe. iEatz checks your kitchen and sorts the shopping list." size={92} /> },
  { cap: "grocery-02 · app", content:
    <AppSlide n={1} eyebrow="Your kitchen, remembered" html={'iEatz knows<br><em>your kitchen.</em>'}
      support="A running inventory of what’s on hand — so nothing gets bought twice." screen="screen-inventory.png" bgPhoto="grocery-haul.jpg" /> },
  { cap: "grocery-03 · app", content:
    <AppSlide n={2} eyebrow="Only what’s missing" html={'Shop the gaps,<br><em>delivered</em> in a tap.'}
      support="iEatz adds only what you’re missing to an Instacart cart." screen="screen-instacart-missing.png" bgPhoto="grocery-haul.jpg" pill="Powered by Instacart" /> },
  { cap: "grocery-04 · review", dark: true, content:
    <QuoteSlide n={3} photo="cutting-board-veg.jpg" photoLabel="Cutting board with vegetables" photoPos="center 40%"
      eyebrow="Loved on the App Store" stars
      quoteHtml={'“I haven’t had any groceries go to waste. <span style="color:#9FE4B3;font-style:italic">It helps me create tasty meals I’d never have thought of.</span>”'}
      attrib="SixSocks · App Store review" /> },
  { cap: "grocery-05 · cta", content:
    <CtaSlide n={4} photo="grocery-haul.jpg" photoLabel="Fresh grocery haul on counter"
      line="From craving<br>to <em>cart</em> in<br>three taps."
      support="Recipe, kitchen check, Instacart cart — all in iEatz. <b>Free to start.</b>" /> },
];

window.CAROUSELS = { pantry: PANTRY, health: HEALTH, grocery: GROCERY };
