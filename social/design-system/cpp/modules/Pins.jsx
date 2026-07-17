/* Pins.jsx — nine Pinterest pins, three per content pillar.
   Pin surface is 1000px wide; height 1500 (2:3) or 1875 (tall) set by PinFrame.
   Content uses % for vertical anchors so it adapts to either height.
   Exports window.PINS = { pantry:[...], health:[...], grocery:[...] }. */

const PA = "assets/";

/* ---------- reusable pin layouts ---------- */

// Save-worthy numbered list, with a full-height side photo.
function ListPin({ eyebrow, titleHtml, items, photo, photoLabel, photoPos, tag = "Free on the App Store" }) {
  return (
    <>
      <div className="photo-side" style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 372 }}>
        <Photo src={PA + photo} label={photoLabel} pos={photoPos} style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, var(--pillar-paper), transparent 22%)" }} />
      </div>
      <div style={{ position: "absolute", top: 110, left: 70, width: 528 }}>
        <p className="eyebrow">{eyebrow}</p>
        <span className="accent-bar" style={{ margin: "26px 0 30px" }} />
        <h1 className="hl" style={{ fontSize: "calc(64px * var(--hl-scale))", lineHeight: 1.04 }}
            dangerouslySetInnerHTML={{ __html: titleHtml }} />
      </div>
      <div style={{ position: "absolute", top: 500, left: 70, width: 540 }}>
        <div className="nlist">
          {items.map((it, i) => (
            <div className="item" key={i}>
              <div className="num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="it-title">{it.title}</div>
                <div className="it-note">{it.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Badge pos="bl" handle />
      {tag && <div className="pin-tag">{tag}</div>}
    </>
  );
}

// Full-bleed photo hook: photo top ~60%, headline below on paper.
function HookPin({ photo, photoLabel, photoPos, eyebrow, titleHtml, support, size = 76 }) {
  return (
    <>
      <Photo src={PA + photo} label={photoLabel} pos={photoPos}
             style={{ position: "absolute", top: 0, left: 0, right: 0, height: "58%" }} />
      <div className="bleed-top-shade" />
      <div style={{ position: "absolute", top: "61%", left: 70, right: 70 }}>
        <p className="eyebrow">{eyebrow}</p>
        <span className="accent-bar" style={{ margin: "24px 0 28px" }} />
        <h1 className="hl" style={{ fontSize: `calc(${size}px * var(--hl-scale))`, lineHeight: 1.02 }}
            dangerouslySetInnerHTML={{ __html: titleHtml }} />
        {support && <p className="support" style={{ marginTop: 28 }} dangerouslySetInnerHTML={{ __html: support }} />}
      </div>
      <Badge pos="bl" handle />
      <div className="pin-tag">Free on the App Store</div>
    </>
  );
}

// Big-stat pin: giant italic numeral, label, support, photo accent corner.
function StatPin({ eyebrow, stat, unit, labelHtml, support, photo, photoLabel }) {
  return (
    <>
      <Horizon width={1000} height={1500} base={1290} opacity={0.12} />
      <div style={{ position: "absolute", top: 84, right: -70, width: 420, height: 420, borderRadius: "50%", overflow: "hidden", boxShadow: "var(--ie-shadow-md)" }}>
        <Photo src={PA + photo} label={photoLabel} style={{ position: "absolute", inset: 0 }} />
      </div>
      <div style={{ position: "absolute", top: 560, left: 70, right: 70 }}>
        <p className="eyebrow">{eyebrow}</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: 8 }}>
          <span className="stat-num" style={{ fontSize: 300 }}>{stat}</span>
          {unit && <span style={{ fontFamily: "var(--ie-font-display)", fontSize: 84, fontStyle: "italic", color: "var(--ie-ink)", lineHeight: 1, paddingBottom: 44 }}>{unit}</span>}
        </div>
        <h2 className="hl" style={{ fontSize: "calc(60px * var(--hl-scale))", marginTop: 8 }}
            dangerouslySetInnerHTML={{ __html: labelHtml }} />
        <p className="support" style={{ marginTop: 26, maxWidth: 780 }} dangerouslySetInnerHTML={{ __html: support }} />
      </div>
      <Badge pos="bl" handle />
      <div className="pin-tag">Free on the App Store</div>
    </>
  );
}

// App-proof pin: headline top, phone showing a real screen.
function AppPin({ eyebrow, titleHtml, support, screen, pill, photo }) {
  return (
    <>
      {photo && <Photo src={PA + photo} style={{ position: "absolute", inset: 0, opacity: 0.14 }} />}
      <Horizon width={1000} height={1500} base={1330} opacity={0.1} />
      <div style={{ position: "absolute", top: 100, left: 70, right: 70 }}>
        <p className="eyebrow">{eyebrow}</p>
        <span className="accent-bar" style={{ margin: "24px 0 26px" }} />
        <h1 className="hl" style={{ fontSize: "calc(58px * var(--hl-scale))", lineHeight: 1.03 }}
            dangerouslySetInnerHTML={{ __html: titleHtml }} />
        {support && <p className="support" style={{ marginTop: 24, maxWidth: 820 }} dangerouslySetInnerHTML={{ __html: support }} />}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 128, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <Phone src={PA + screen} width={430} />
          {pill && <span className="pill solid" style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", boxShadow: "var(--ie-shadow-md)" }}>{pill}</span>}
        </div>
      </div>
      <Badge pos="bl" handle />
    </>
  );
}

/* ============================================================
   PILLAR 1 — PANTRY / FRIDGE
   ============================================================ */
const PANTRY_PINS = [
  { cap: "pin · pantry · list", content:
    <ListPin eyebrow="Pantry math" photo="pantry-jars.jpg" photoLabel="Pantry jars on shelf" photoPos="center"
      titleHtml={'5 staples that<br>make <em>any</em><br>dinner work.'}
      items={[
        { title: "Tinned beans", note: "the answer to most dinners" },
        { title: "Red lentils", note: "soup base · 18g protein" },
        { title: "Couscous", note: "ready in five minutes" },
        { title: "Tahini", note: "dressings, drizzles, dips" },
        { title: "Smoked paprika", note: "one teaspoon = a meal" },
      ]} /> },
  { cap: "pin · pantry · hook", content:
    <HookPin photo="fridge-warm-open.jpg" photoLabel="Open fridge, warm light" photoPos="center 42%"
      eyebrow="Pantry-first cooking"
      titleHtml={'Cook with what’s<br><em>already</em> in your fridge.'}
      support="Snap a photo. iEatz finds the dinner hiding in there." /> },
  { cap: "pin · pantry · stat", content:
    <StatPin eyebrow="Snap to plate" stat="15" unit="min" photo="buddha-bowl.jpg" photoLabel="Rainbow buddha bowl"
      labelHtml={'dinners from a<br><em>single photo.</em>'}
      support="Point your camera at the fridge — iEatz ranks real recipes by what you already have." /> },
];

/* ============================================================
   PILLAR 2 — HEALTH / DIET
   ============================================================ */
const HEALTH_PINS = [
  { cap: "pin · health · list", content:
    <ListPin eyebrow="Eat for your goals" photo="green-bowl-floral.jpg" photoLabel="Green grain bowl" photoPos="center"
      titleHtml={'5 ways iEatz<br>keeps you <em>on track.</em>'}
      items={[
        { title: "Macros up front", note: "protein, carbs & fat on every card" },
        { title: "Calorie targets", note: "tuned to your body, not averages" },
        { title: "Allergy flags", note: "hidden triggers caught for you" },
        { title: "Weekly trends", note: "see the pattern, not one day" },
        { title: "Goal-first picks", note: "suggestions follow your numbers" },
      ]} tag="Free on the App Store" /> },
  { cap: "pin · health · app", content:
    <AppPin eyebrow="Know before you cook"
      titleHtml={'See <em>macros</em><br>before you cook.'}
      support="Calories, protein, carbs and fat on every recipe card." screen="screen-recipe.png" photo="green-bowl-floral.jpg" /> },
  { cap: "pin · health · hook", content:
    <HookPin photo="prep-spread-greens.jpg" photoLabel="Fresh greens prep spread" photoPos="center 45%"
      eyebrow="Built around you"
      titleHtml={'Eat for <em>your</em> body,<br>not a generic plan.'}
      support="Set your targets once. Every recipe follows your numbers." size={72} /> },
];

/* ============================================================
   PILLAR 3 — GROCERY / INSTACART
   ============================================================ */
const GROCERY_PINS = [
  { cap: "pin · grocery · list", content:
    <ListPin eyebrow="Grocery, sorted" photo="shop-label-check.jpg" photoLabel="Shopper checking a label" photoPos="center 40%"
      titleHtml={'Craving to cart,<br>in <em>three taps.</em>'}
      items={[
        { title: "Pick a recipe", note: "anything you’re craving tonight" },
        { title: "iEatz checks your kitchen", note: "against a running inventory" },
        { title: "Missing bits → Instacart", note: "only what you don’t already have" },
      ]} tag="Powered by Instacart" /> },
  { cap: "pin · grocery · hook", content:
    <HookPin photo="grocery-haul.jpg" photoLabel="Fresh grocery haul on counter" photoPos="center 45%"
      eyebrow="Kitchen inventory"
      titleHtml={'Never buy what<br>you <em>already own.</em>'}
      support="iEatz remembers your kitchen, so the list only holds what’s missing." /> },
  { cap: "pin · grocery · app", content:
    <AppPin eyebrow="Only what’s missing"
      titleHtml={'Shop the gaps,<br><em>delivered.</em>'}
      support="iEatz builds an Instacart cart from just the ingredients you’re missing." screen="screen-instacart-missing.png" pill="Powered by Instacart" photo="grocery-haul.jpg" /> },
];

window.PINS = { pantry: PANTRY_PINS, health: HEALTH_PINS, grocery: GROCERY_PINS };
