# iEatz Healthy — Design System

A two-track design system for **iEatz Healthy**, a consumer iOS app that turns the food already in your pantry into AI-generated healthy meals.

> Two tracks, one brand:
> • **Marketing / Instagram** — editorial serif headlines, warm paper backgrounds, generous whitespace. Premium-but-approachable, Stripe-meets-wellness.
> • **iOS App** — Plus Jakarta Sans, mint backgrounds, bright produce-green. Friendly, energetic, fresh.

---

## Sources & inputs

This system was built from:

- **Figma file** — `iEatz Healthy Mobile App.fig` (the user-attached design file). High-fidelity screens at `/Final-design-High-fidelity-design/`; foundations at `/Color`, `/Typography`, `/Icon`, `/Button`, `/Input-field`.
- **GitHub repos** (provided but **not accessible** to this build — see Caveats):
  - `https://github.com/iEatz-Healthy/iEatz`
  - `https://github.com/iEatz-Healthy/ieatz-onboarding-swiftui-handoff`
- **Brand brief** — provided in chat. Colors and type for the Instagram side are taken from this brief (Fraunces was requested but substituted; see Caveats).

If you have access to either GitHub repo, **read it before producing production work** — it will sharpen every screen here.

---

## Index — what's in this folder

```
/
├── README.md                       ← you are here
├── SKILL.md                        ← Agent Skill manifest (Claude Code-compatible)
├── colors_and_type.css             ← the canonical token file. Import this first.
│
├── assets/
│   └── brand/
│       ├── logo-mark-green.svg     ← fridge mark, green
│       ├── logo-mark.svg           ← fridge mark, currentColor
│       └── logo-lockup.svg         ← mark + wordmark
│
├── preview/                        ← Design System tab cards (small specimens)
│   ├── colors-brand.html
│   ├── colors-ink.html
│   ├── colors-surfaces.html
│   ├── colors-semantic.html
│   ├── type-display.html
│   ├── type-body.html
│   ├── type-stat.html
│   ├── type-eyebrow.html
│   ├── spacing-scale.html
│   ├── spacing-radii.html
│   ├── spacing-shadow.html
│   ├── spacing-ig-safe.html
│   ├── brand-logo.html
│   ├── brand-backgrounds.html
│   ├── brand-voice.html
│   ├── components-buttons.html
│   ├── components-cards.html
│   ├── components-stat-cards.html
│   └── components-inputs.html
│
└── ui_kits/
    ├── instagram/                  ← 1080×1350 templates
    │   ├── README.md
    │   ├── index.html              ← full preview, six templates
    │   ├── ig.css
    │   ├── IGBadge.jsx
    │   ├── IGSlide.jsx
    │   └── Templates.jsx
    │
    └── ios_app/                    ← iOS app recreation
        ├── README.md
        ├── index.html              ← live click-through + 7 screens
        ├── app.css
        ├── Icons.jsx
        ├── Chrome.jsx
        └── Screens.jsx
```

---

## Content fundamentals

**Tone.** Plainspoken, warm, mildly editorial. Like a friend who reads The Cut and cooks. Confident without being smug. Calm — never breathless. Verbs over adjectives.

**Voice rules.**
- **"You" not "users".** Always second person. "Type three things from your fridge" — not "Users type ingredients".
- **Don't over-explain technology.** It's not "AI-powered meal generation". It's "we turn three things into dinner".
- **Concrete over abstract.** "Cucumber, chickpeas, lemon" beats "fresh ingredients".
- **Cook = a verb, not a noun.** The app is about doing.
- **Short.** Carousels should read in 10 seconds. Cut every word you can.
- **No exclamation marks** except in true celebration ("Account ready!").

**Casing.**
- Headlines: Sentence case. Never Title Case Like This.
- Eyebrows and labels: ALL CAPS with `letter-spacing: 0.08em`. Inter Tight 500.
- CTAs: Sentence case ("Download iEatz Healthy", "Generate recipe"), not all caps.

**Punctuation.**
- Curly quotes (`"` `"`), real apostrophes (`'`), em dashes (`—`) with no surrounding spaces.
- Numerals as digits: "15 minutes" not "fifteen minutes" in UI; spelled-out only in editorial copy where it reads better.

**Vibe / examples.**
- ✅ "Tonight's dinner is already in your fridge."
- ✅ "Open the fridge. Snap. Cook."
- ✅ "Three things. One photo. Dinner in fifteen."
- ❌ "Discover endless meal possibilities powered by AI!"
- ❌ "Revolutionize your kitchen workflow."
- ❌ "Healthy choices made easy. 🥗✨"

**Emoji.** Used inside the **app** as ingredient stand-ins until real food photos arrive (this matches the Figma's current state). **Not used in marketing** — Instagram headlines and captions are emoji-free. The app's bottom-nav fridge is a custom SVG icon, not an emoji.

---

## Visual foundations

### Backgrounds
- **Marketing default:** warm cream paper `#F5F2EA`. A second tone `#FBFAF6` for secondary surfaces. **Never pure white** in marketing.
- **App default:** almost-white mint `#F1FCF3`. White (`#FFF`) used only for cards.
- **Decoration:** subtle concentric arc lines in `#BBE3C8` on onboarding (matches the Figma). No gradient walls. No noise. No texture.
- **Full-bleed photography** is reserved for recipe heroes and top-of-carousel splashes; everywhere else, photos sit in 16px–36px radius cards.

### Color usage
- **Brand green is precious.** Used for: accent bars, stat numerals, single-word headline emphasis, CTAs, the brand badge, active chip fills. **Never** a slide background fill or a card background fill at scale.
- **Dark green** is the heavy CTA fill in marketing and the deep CTA in the app.
- **Green-light + mint** are the safe panel/chip backgrounds. Tinted, not gray.
- **Ink ladder** is what you reach for most: `ink-1` for titles, `ink-3` for body, `ink-4` for meta. Avoid pure black — `ink-1 = #0A0F0C` is a calmer near-black.

### Type
- **Editorial serif: Instrument Serif.** Display + headings + stats. Clean transitional letterforms — picked specifically over Fraunces (which has too much organic wobble). One weight (400) carries everything; italic for stat slides.
- **UI sans: Inter Tight.** All body copy, labels, eyebrows, badges, buttons in marketing.
- **App sans: Plus Jakarta Sans.** Carries 100% of the iOS app UI. Don't mix Instrument Serif inside the app.
- **Stat treatment:** Instrument Serif italic in brand green, 100–240px in marketing, with an Inter Tight uppercase label below.
- **Mobile minimum sizes:** body 24px, headlines 36px+ (at 1080×1350 scale).

### Layout
- **4pt grid** (`s-1` = 4 through `s-10` = 128).
- **IG safe zone: 80px** on all sides at 1080×1350.
- **No critical content** in the bottom 15% of single feed posts (caption preview covers it).
- Brand badge anchored bottom-left at 80px / 60px.
- Generous breathing room. If a slide feels full, it is.

### Shadows (green-tinted, never gray)
```css
--shadow-sm: 0 1px 2px rgba(14,74,42,.04), 0 2px 6px rgba(14,74,42,.05);
--shadow-md: 0 2px 6px rgba(14,74,42,.05), 0 8px 24px rgba(14,74,42,.07);
--shadow-lg: 0 4px 12px rgba(14,74,42,.06), 0 16px 40px rgba(14,74,42,.10), 0 32px 72px rgba(14,74,42,.06);
```
All three layered with `rgba(14, 74, 42, …)` — the dark-green base — never `rgba(0,0,0,…)`. This is the "soft green-tinted shadow" called for in the brief.

### Corners
| Element | Radius |
|---|---|
| Pill / chip / status badge | `999` (full) |
| Small chip / app field | `10–14` |
| Standard card | `16` |
| Hero card / sheet | `24` |
| Photo frame / splash sheet | `36+` |

### Borders
Hairline `1px solid var(--ink-5)` (#C9CFC9) on secondary buttons and dividers. Otherwise rely on shadow.

### Hover / press / animation
- **Hover:** primary buttons shift 1 tone darker (e.g. `#0E4A2A` → `#0B3A21`); never opacity changes.
- **Press:** `transform: translateY(1px)` and shadow drops to none. No scale-down.
- **Cards on hover (web only):** lift one shadow tier (`md` → `lg`), 180ms ease-out.
- **App animations:** match iOS native — short, snappy, no bounce. Don't add easing curves that don't exist in iOS.
- No fades into view on load. Decks and slides should appear instantly.

### Transparency & blur
- **App use only.** Bottom-sheet overlays use `rgba(0,0,0,0.4)` scrim; the sheet itself is opaque. The "Add ingredient" sheet (Figma) uses an iOS-style blur — replicate with `backdrop-filter: blur(20px)` on `rgba(255,255,255,0.75)`.
- **Marketing never uses blur.** Paper is paper.

### Imagery direction
- Warm, natural light. No moody dark food shots.
- Top-down or 3/4 angle. No close-ups of raw protein.
- A hand or wood texture allowed; no plates on white.
- Real food, prepared. Never stock-photo "fresh ingredients spilling out of a basket".
- Placeholder rule: when a real photo isn't available, render an `.ig-photo` block (mint gradient + label) so it's obvious where photography goes.

---

## Iconography

**Approach.** Outline icons, 1.5–2px stroke, rounded caps and joins. Square-ish proportions. No filled icon set, no duotone, no skeumorphic.

**Source.**
- **The fridge mark / Inventory icon is custom.** Vector copied straight out of the Figma — kept in `assets/brand/`. Reuse it as the bottom-nav Inventory icon (not a generic refrigerator emoji).
- **Everything else is Lucide-style** outlines, hand-redrawn in `ui_kits/ios_app/Icons.jsx`. Same stroke weight and corner radius as Lucide so swapping in `lucide-react` later is one-line. **Flagged substitution** — if you find the original Figma icon set in either GitHub repo, swap in.

**Emoji as icons.** Used sparingly inside the app for ingredient tiles (Apple 🍎, Bread 🍞, etc) — matches the Figma's onboarding screen. **Not used elsewhere.** Marketing has zero emoji.

**Unicode characters.** Only `→ ← ·` for inline UI. No checkmarks via unicode — use the `Check` SVG.

---

## Logo & brand badge

The **iEatz logo mark is a stylized green fridge** — two-door, with two small handles visible. Sourced directly from the Figma file (`Vector.svg`). Lives in `assets/brand/`.

**Lockup:**
- Mark + "iEatz" / "Healthy" stacked, Inter Tight 700, 24px each line.
- Mark color: `--brand-green` (#1F8B4C) in marketing; `--brand-mark-green` (#61CA8C) on the actual app splash screen, where it sits on mint and reads brighter.

**Brand badge for IG posts** (always present, never dominant):
- Mark at 22–28px tall in brand green
- "iEatz Healthy" wordmark in Inter Tight 500, 22px, `ink-2`
- Anchored bottom-left or bottom-right, 80px from edge

---

## Components

Exported, bundle-compiled components (import via `const { X } = window.IEatzHealthyDesignSystem_c3fa3a`):

- **AppStoreBadge** — official-style "Download on the App Store" badge; black pill, Apple logo + wordmark, native 3:1 ratio, height-scalable. (`components/AppStoreBadge/`)

---

## Quick start

```html
<link rel="stylesheet" href="/colors_and_type.css">
<body style="background: var(--paper);">
  <h1 class="t-display">A pantry-first kind of healthy.</h1>
  <p class="t-body">Three things. One photo. Dinner in fifteen.</p>
  <span class="t-eyebrow">Eating well · 04</span>
</body>
```

For Instagram posts, copy the `ui_kits/instagram/` setup. For app screens, copy `ui_kits/ios_app/`.

---

## Caveats — please read

- **GitHub repos are inaccessible.** Both `iEatz-Healthy/iEatz` and `iEatz-Healthy/ieatz-onboarding-swiftui-handoff` 404 for this connection (likely private or SSO-protected). The system was built from the Figma file plus the brand brief. Iconography, screen recreations, and many spacing/sizing decisions would be sharper with codebase access — please re-attach if available.
- **Font substitution: Fraunces → Instrument Serif.** The brief specified Fraunces; in practice its `SOFT` / `WONK` variable axes (and its slightly hand-drawn personality at large sizes) read as visually "wavy" and got flagged in review. Instrument Serif is the new editorial serif — clean transitional letterforms, single 400 weight, no variable wobble. **If you specifically want Fraunces back**, swap the `@import` and `--font-serif` in `colors_and_type.css` and pin `'opsz' 144, 'SOFT' 0, 'WONK' 0` on every Fraunces selector.
- **Inter Tight + Plus Jakarta Sans are loaded from Google Fonts** (not a local `.ttf` bundle). If you have licensed binaries, drop them in `fonts/` and update the `@import` to `@font-face` declarations.
- **Icon set is Lucide-style, hand-drawn.** Not extracted from the Figma's vuesax/outline set. The fridge mark IS the real one.
- **Production photography included.** 35 real food + lifestyle photos in `assets/photos/`. Organized into five roles in the Brand — Photography preview: **fridge** (the brand's hero subject — includes one tagged anti-goal for "not this" comparisons), **food hero shots**, **lifestyle** (process, people, kitchen), **pantry**, and **graphic accents**.
- **Sample copy is illustrative.** Pricing tiers, testimonials, and numbers ("300/day", "$4.99") match the Figma's hi-fi screens; verify with product before shipping.
