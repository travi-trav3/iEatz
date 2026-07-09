# iEatz Healthy — Pinterest pins (10) → Buffer idea manifest

Generated for org **Applied Intelligence Co.** (`6a138b7d82bb2ed009fed356`),
channel **ieatzhealthy** Pinterest profile (`6a14637fc687a22dd424eee8`).

All pins are **1000 × 1500 (2:3)**, rendered from the iEatz design system
(`index.html` tokens): warm paper backgrounds, Instrument Serif headlines,
Inter Tight body, brand green `#1F8B4C` as spotlight, fridge-mark badge.
Fonts were self-hosted at render time and verified loaded (no Georgia fallback).

## Why files + not API attach

The Buffer MCP connection in this session exposes `createIdea` but **no
`updateIdea`/`editIdea` mutation** (confirmed via `introspect_schema`), so
existing ideas cannot have media attached programmatically. These PNGs are
committed to the repo for **manual attach in Buffer** (open each idea → add the
matching image). Public URL for each (works once this branch is pushed):

`https://raw.githubusercontent.com/travi-trav3/iEatz/claude/cool-planck-pL6bL/assets/pinterest/<file>`

(If GitHub Pages is enabled on the default branch after merge, the same files
also resolve at `https://travi-trav3.github.io/iEatz/assets/pinterest/<file>`.)

## Mapping

| File | Idea title | Idea ID | Headline overlay | Source visual |
|------|-----------|---------|------------------|---------------|
| `01-fridge.png` | What to make with what's in your fridge | `6a147b109fe5b621c37d4cfe` | Healthy recipes from your fridge. | photo: fridge-real-mess.jpg |
| `02-grain-bowl.png` | 15-minute lemon tahini grain bowl | `6a147b19ff4aaa9905e306f4` | Lemon-tahini grain bowl. (chips: 15 min / Vegetarian / From pantry) | photo: buddha-bowl.jpg |
| `03-stop-wasting.png` | How to stop wasting groceries | `6a147b219fe5b621c37d4d52` | $1,500 wasted on food every year. (Big Stat) | typographic |
| `04-keto.png` | Easy keto dinners from pantry staples | `6a147b289fe5b621c37d4d89` | Eat keto from what you have. | app screen: app-recipe.jpg (Carbs/Protein/Fat) |
| `05-meal-prep.png` | Weekly meal prep made simple | `6a147b309fe5b621c37d4dcf` | A week of meals, planned for you. | photo: meal-prep-spread.jpg |
| `06-high-protein-breakfast.png` | High-protein breakfast ideas | `6a147b384a6f5d18c535d73d` | High-protein, no planning. (chips: Eggs + greens / 20 g protein / Under 15 min) | photo: cutting-board-veg.jpg (eggs) |
| `07-track-calories.png` | Track calories without obsessing | `6a147b3fff4aaa9905e30769` | Track calories, skip the obsessing. | app screen: app-home.jpg (Today's Calories) |
| `08-gluten-free.png` | Gluten-free dinner ideas | `6a147b47e72395f3a7fb6278` | Gluten-free, from what you have. (chips: Gluten-free / 30 min / High protein) | photo: salmon.jpg |
| `09-fridge-to-cart.png` | Turn your fridge into a shopping list | `6a147b4e9fe5b621c37d4e2f` | Fridge to cart, one tap. | app screen: app-instacart.jpg (Instacart handoff) |
| `10-five-dinners.png` | 5 dinners without going to the store | `6a147b56e72395f3a7fb62ba` | 5 dinners, zero shopping. (numbered list) | typographic |

## Notes / flags

- **#8 gluten-free** uses `salmon.jpg`, the only source photo at low resolution
  (320×480). It renders acceptably crisp at pin size, but it is the one asset
  worth re-shooting if you want max sharpness. `tacos.jpg` was deliberately
  **not** used here — those are flour tortillas (not gluten-free), which would
  be a factual mismatch on a GF pin.
- **#3** and **#10** are typographic (Big Stat / numbered list) — both explicitly
  allowed by the brief. The $1,500/household/year food-waste figure is a widely
  cited USDA-range estimate; phrased as "about $1,500" to avoid false precision.
- **#4, #7, #9** composite the **real** iEatz app UI (recipe macros, calorie
  dashboard, Instacart handoff) from `assets/photos/`, so no UI was invented.
