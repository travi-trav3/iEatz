# Instagram UI Kit

Six base templates for 1080×1350 feed posts and carousels.

## Files
- `index.html` — kit preview, all six templates in a scaling grid
- `ig.css` — template-specific CSS (sits on top of `colors_and_type.css`)
- `IGBadge.jsx` — always-on brand badge (fridge mark + wordmark)
- `IGSlide.jsx` — `<section class="ig-slide">` wrapper at 1080×1350
- `Templates.jsx` — the six templates

## Templates
1. **TplEditorialTitle** — large serif title, eyebrow, accent bar (announcements)
2. **TplBigStat** — single huge italic numeral in brand green (proof points)
3. **TplThreeSteps** — three numbered cards (explainers, how-it-works)
4. **TplRecipeHero** — full-bleed food photo + recipe title + chips
5. **TplQuote** — dark green slide with editorial pull quote (testimonials)
6. **TplCTA** — closing slide with app CTA and handle

## Content pillar 04 — Send this to
Type-only shareable posts (hook + italic payoff + "iEatz" wordmark), alternating cream and dark green. Template: `templates/ig-send-this/`. Pillar card: `pillar-send-this.html`. Proposed cadence: 1 per week in the organic rotation, 4 approved hooks queued, top sends recut as ads. Scheduling runs through Buffer.

## Rules
- 80px safe zone on all sides; no critical content in bottom 15% (caption preview)
- Brand badge always present, bottom-left by default
- Real food photography — placeholders flag where team-shot images go
- Green used sparingly: accent bars, stat numbers, CTA fill, one word per headline
- Body min 24px, headlines 36px+
