# iEatz Healthy — Content Pillars (CPP) design system

The canonical, code-backed source for the **content-pillar** social templates:
three 5-slide Instagram carousels and nine Pinterest pins, one program per
topic pillar (Pantry/Fridge · Health/Diet · Grocery/Instacart). This is the
"deep template" set the CONTROL_CENTER §4 references — ported in from the Drive
**"iEatz Healthy Design System"** bundle (`ui_kits/instagram/`) so it lives in
git and renders headless with zero external egress.

## What's here
```
cpp.css                 Design tokens (--ie-* + ui-kit aliases). Load first.
cpp-frames.css          Frame/slide/pin component CSS (.ig, .pin, .hl, .horizon, .phone, …).
modules/
  Shared.jsx            Primitives: Mark, Badge, Pager, Swipe, Horizon, Photo, Phone, HeadBlock.
  Carousels.jsx         window.CAROUSELS = { pantry, health, grocery } — 5 slides each.
  Pins.jsx              window.PINS = { pantry, health, grocery } — 3 pins each.
  AppStoreBadge.jsx     Official-style "Download on the App Store" badge (SVG).
vendor/                 React + ReactDOM (dev) + Babel standalone — the exact libs the
                        templates were authored against (pinned, offline-safe).
assets/                 16 images: 4 REAL app screens (screen-recipe/weight/inventory/
                        instacart-missing) + 12 curated photos the templates reference.
```

## Templates (the depth that was missing from the flat harness)
**Carousel slides** — `HookSlide` (photo hero + headline), `StepsSlide` (numbered
white cards over the green *Horizon* wave), `AppSlide` (real app screen in a phone
on a softened food photo), `QuoteSlide` (dark testimonial, optional 5 stars),
`CtaSlide` (App Store badge + handle).
**Pin layouts** — `ListPin` (numbered list + full-height side photo), `HookPin`
(photo top, headline below), `StatPin` (giant italic numeral + circular photo
corner over the Horizon), `AppPin` (headline + phone proof).
**New brand device** — `Horizon`: the connecting green contour wave that echoes the
CPP tiles. **New primitive** — `Phone`: notch + glass frame that may ONLY hold the
real app screens in `assets/` (HARD CONSTRAINT §3).

## Rendering
`node social/render/cpp-render.js` renders every frame to `social/render/cppout/`.
`node social/render/cpp-render.js <pillar> [ig|pin] [index]` renders a subset.
Output is 1080×1350 (carousel) / 1000×1500 (pin), fonts self-hosted from
`social/render/fonts/`, screenshot at 2× then downsampled with sharp — same output
contract as the other harness scripts. Every frame still passes the CONTROL_CENTER
§6 QA gate (open each PNG before hosting).

## Provenance / editing
Sourced from the operator's Drive design-system bundle (May 2026), decoded Jul 16
2026. Fix applied on import: JSX **attribute** strings don't interpret `\uXXXX`
escapes (they render literally), so all escapes were converted to real characters —
edit with literal `—` / `'` / `"`, never `—`, inside `attr="…"` positions.
When the design system changes upstream, re-import here and re-render; keep this the
single source of truth for the CPP templates.
