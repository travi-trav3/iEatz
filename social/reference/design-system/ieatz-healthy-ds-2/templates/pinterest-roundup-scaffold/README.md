# Pinterest bridge page — blank scaffold

The starting file for any new bridge page: pin lands, reader gets what they came for, app gets the install. Works for recipe roundups and for pages that have nothing to do with recipes.

Hand Claude Code this file plus the filled example at `templates/pinterest-roundup/PinterestRoundup.dc.html`.

## Two conventions

`[[TOKEN]]` — page content. Replace. Each token carries its own brief inside the brackets, so the instruction travels with the slot.

No token — universal. Fixed across every page in the cluster: the value-prop headline and all three beats, every CTA label and reassurance line, the proof-row labels, "Three things you already have", the FAQ heading, the footer provenance line, both sticky bars. Do not rewrite these page to page. They are what makes twenty pages read as one system rather than twenty attempts.

## Content type, not "recipes"

Items are **items**. There is no fixed count — set `itemCount` (3–8).

`contentType` switches the visible labels on every item:

| type | list block | steps block | closing note |
|---|---|---|---|
| `recipe` | Ingredients | Method | Why it works. |
| `list` | What to look for | — | Worth knowing. |
| `swaps` | Swap in | — | The catch. |
| `howto` | — | How to do it | Where people go wrong. |
| `comparison` | Where it wins | — | The verdict. |
| `mealplan` | On the plate | Order of play | Make it easier. |

Each item has five optional blocks that render **only when filled**: `facts[]` (the chip row), `keyFact` (the one chip in solid accent), `body` (prose), `list[]`, `steps[]`, `note`. A recipe fills nearly all of them. A "five things you forgot you owned" page fills `body` and nothing else, and the item renders as clean prose with no empty headings. Any item can override `listLabel`, `stepsLabel` or `noteLabel` directly.

Set `ITEM_SCHEMA_TYPE` in the JSON-LD to match: `Recipe` for recipe pages, `HowTo` for technique pages, otherwise `Thing`. Recipe-only schema fields (`totalTime`, `recipeIngredient`, `recipeInstructions`, `nutrition`) come off non-recipe pages entirely — invalid schema is worse than thin schema.

## The variation budget

Four axes. **Vary three per page, leave the fourth at default, never repeat a combination in consecutive pages.** Record the picks in `CONTENT.variant` and mirror them into the props of the same name, so the choice is auditable rather than accidental.

**`heroComposition`**
- `portrait_inset` — 2:3 hero with a small inset and a timestamp chip. Quote sits after the paragraphs. The workhorse.
- `fullbleed_overlay` — dark full-bleed photo, type over it, quote high and prominent. Best when the photo carries the pain point on its own.
- `two_up` — headline across the top, two pins and a text column beneath. Good for before/after or contrast pages.
- `stacked` — narrow single column, quote pulled out mid-flow with a rule, photo at the bottom. Reads the most editorial; best for essay-shaped openers.

**`itemRhythm`**
- `mirror` — alternating sides on alternating bands. Default.
- `left_with_bleed` — every item text-left, with a full-bleed photo breather after every third. Faster to read, more magazine.
- `card_grid` — compact cards in a grid. The right answer for short-prose items (`list`, `swaps`, `comparison`). Wrong for `recipe`, which needs the room. It renders every block including steps and the closing note, but a steps-heavy `howto` or `mealplan` will read cramped in a card — prefer `left_with_bleed` for those. A grid has no between-item slots, so a card_grid page gets **one** interstitial after the grid rather than two inside it; `photo_break` or `mid_strip` still fires, whichever the chosen style uses.

**`interstitialStyle`** — picks the first interstitial; the second is automatically the next style in the list, so a page never repeats a treatment. `photo_band` · `dark_strip` · `pull_quote` · `stat`.

**`accent`** — `green` (#1F8B4C) · `forest` (#0E4A2A) · `deep` (#08311B). Implemented as a CSS custom property set on `:root`, so accented rules paint immediately at the default and the variant swaps one property.

Pull-quote placement is deliberately *not* a separate axis — each hero composition carries its own, which is part of what distinguishes them. Same variety, a quarter of the markup.

**What never varies:** the type scale, the spacing rhythm, the section order, the universal copy, the CTA labels. Monotony across a cluster comes from identical *rhythm*, not from a consistent typeface — so rhythm is what moves and the vocabulary is what holds.

## Pacing

Interstitials are positional, not authored: one at roughly 40% through the items and a second at 80%, computed from `itemCount`. Three items or eight, they land in the right place, and the second never falls after the last item.

## Filling it

All repeating content lives in `get CONTENT()` at the top of the logic class — items, supporting rows, FAQ, internal links. Singular copy is `[[TOKEN]]` text sitting in the markup where it renders.

## Section order, and one caveat

Hero presses the pain point → short answer for the snippet → the app and what changes about their week → the items the pin promised → supporting section → FAQ → related pages → final CTA.

The app section sits above the items at Travis's direction. This inverts the original build spec, which placed the bridge module after the last item on the grounds that value debt should be paid before any ask. Both are defensible; this order puts the pitch in front of everyone rather than only the readers who finish. It is the single biggest thing to watch in the A/B read.

## Tracked CTA positions

`header`, `bridge`, `photo_break`, `mid_strip`, `footer`, `sticky`, each with `platform: ios | android` where both stores appear. Events: `app_store_click`, `scroll_depth` (25/50/75/100), `item_anchor_click`. All push to `window.dataLayer` and to `gtag` if present, with UTMs read on load and attached to every event.

App Store links build as `…/id6475559706?pt=<providerToken>&ct=<campaignToken>&mt=8`. Tokenize by arm (`pin-lp`, `pin-direct`) and nothing finer until a single page clears five downloads in a reporting window — below that threshold App Store Connect reports an empty cell, which reads as failure when it is just no data.

## Rules that survive every page

1. No item reused across pages. Not reworded, not re-scaled.
2. Bridge copy varies in wording, never in axis: the page is a guess about your kitchen, the app is not. If a line would also make sense on a competitor's app, it is wrong.
3. Supporting section rotates. Never the same one consecutively. Pool: protein math, prep-ahead notes, swaps, buy-once-use-five-ways, common mistakes, scaling for a family.
4. No email capture, no popups, no gated content, no full site nav.
5. No claim about an app feature that is not verified as shipping. The shopping list stays out of hero copy until Tony confirms it.
6. App screens come from the live App Store listing or a CPP variant. No recreations, no mockups, no screen that does not ship.
7. Every item gets its own 1000×1500 pinnable image with real alt text. One page, six or more pins.

## The filled example's settings

`PinterestRoundup.dc.html` is `contentType: recipe`, `itemCount: 5`, `heroComposition: portrait_inset`, `itemRhythm: mirror`, `interstitialStyle: photo_band`, `accent: green`. It predates the generalized item model, so its logic class still uses `recipes` rather than `items` — read it for the writing standard and the finished tone, and read this file for the structure.

## Before page two

Deploy page one, confirm HTTP 200, then pass both Google's Rich Results Test and Pinterest's Rich Pin validator. If Pinterest renders a five-item roundup as a single Recipe rich pin, decide then whether to accept it or suppress with `<meta name="pinterest-rich-pin" content="false">`.
