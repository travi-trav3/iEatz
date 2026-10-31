---
name: ieatz-healthy-design
description: Use this skill to generate well-branded interfaces and assets for iEatz Healthy, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Two tracks** — Marketing (Instrument Serif + Inter Tight on warm paper) and iOS App (Plus Jakarta Sans on mint).
- **Primary use case** — Instagram posts at 1080×1350 (4:5 portrait), feed and carousels, max 10 slides.
- **Brand badge** is always on every IG slide, never dominant.
- Read `colors_and_type.css` first; it's the canonical token file. Import it from any new HTML you create.
- For IG, start from `ui_kits/instagram/Templates.jsx` — six templates (editorial title, big stat, three steps, recipe hero, quote, CTA).
- For app screens, start from `ui_kits/ios_app/Screens.jsx`.

## Rules of thumb
- Sentence case for headlines. UPPERCASE 0.08em for eyebrows. No emoji in marketing.
- 80px safe zone, nothing critical in bottom 15% of an IG post.
- Brand green is a spotlight — accent bars, stat numerals, one word per headline, CTAs, badge. Never a slide background fill.
- Shadows are green-tinted (`rgba(14,74,42,…)`), never gray.
- Real food photography only. Placeholders should obviously be placeholders.

## When you don't have what you need
- Logos: `assets/brand/`
- Icons: `ui_kits/ios_app/Icons.jsx` for outline icons; the **fridge mark** is the only custom logo.
- Fonts: loaded from Google Fonts. If absent, fall back to `Georgia` (serif) and system-ui (sans).
- Photography: use the `.ig-photo` placeholder block and flag to the user that real photos are needed.
