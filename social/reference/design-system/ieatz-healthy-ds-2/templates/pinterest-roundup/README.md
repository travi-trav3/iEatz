# Pinterest roundup page — template

The bridge page between a Pinterest pin and an App Store install. Free recipes first, app invite after. Lives at `iEatsHealthy.com/recipes/[slug]`.

Built from `ieatz-pinterest-content-page-template` (2026-09-02, Travis Enos / Applied Mobile Growth), which extends `ieatz-content-hub-build-spec.md`.

## Files

| File | What it is |
|---|---|
| `PinterestRoundup.dc.html` | The template, populated as the example page (`10-minute-breakfasts-busy-mornings`). Visual source of truth. |
| `content.example.json` | The content object from §8 of the spec, filled for that page. This is the generator's input contract. |
| `ds-base.js` | Loads `colors_and_type.css`, `styles.css` and the compiled bundle. One line to repoint in a consuming project. |

## What comes from where

Singular copy — H1, direct answer, bridge headline and beats, protein-math section, FAQ, final CTA, footer — is written as literal markup so it is click-editable in the editor and paints instantly. Repeating content — the five recipes, the jump list, FAQ rows, related links — comes from data in the logic class, mapped one-to-one to `content.example.json`. That is the line the spec draws: nothing unique is hand-authored inside the repeating HTML.

Tweaks on the page (code-only, not copy): `campaignToken`, `providerToken`, `ctaDestination` (`app_store` / `cpp_pantry` / `cpp_health` / `cpp_grocery`), `showStickyBar`, `showAppScreens`.

## Section order as built

Header (logo + one App Store link, no nav) → H1 + direct answer + hero pin → jump list → recipes 1–5 in full → inline app mention after recipe 2 → **bridge module** (gap headline, three end-state beats, two app screens, proof row, CTA + reassurance) → protein math → FAQ → related pages → dark-green final CTA → footer with provenance → sticky App Store bar, appears past recipe 1.

## Analytics wired in

`app_store_click` fires from all five CTA positions with `page_slug`, `cta_position`, `utm_content`. `scroll_depth` at 25/50/75/100. `recipe_anchor_click` with `recipe_name`. All UTMs are read on load and attached to every event. Events push to `window.dataLayer` and to `gtag` if present.

App Store links build as `…/id6475559706?pt=<providerToken>&ct=<campaignToken>&mt=8`. Start with `pin-lp` and `pin-direct` and nothing finer — each metric only displays once it hits 5 in the date range.

## Before this ships

Blocking:

1. **Recipes are draft.** Travis authors the final five. Names, times, servings, protein figures, methods and the protein-math table are all placeholder-quality and must be replaced or verified. Rule 11: no recipe reused across pages.
2. **Photography.** Six 2:3 slots (1000×1500): one hero, five recipes. Each renders as a labeled placeholder carrying its dimensions, subject and alt text. Nothing ships until real food photos exist — this is the channel's production bottleneck.
3. **Proof row.** The 5.0 rating is set; the review quote, reviewer name and usage number are `VERIFY` slots to be pasted from the live site. Nothing invented.
4. **App screens are recreations** drawn from `ui_kits/ios_app/` in this design system, labeled as such on the page. Swap in verified App Store captures before publish.
5. **App Store URL.** Uses the bare `id6475559706` form rather than the stale `/ai-recipe-generator-by-ieatz/` slug on the live site. Confirm when campaign tokens go in — the app is now "Fridge to Table: AI Recipes".
6. **Provenance line** in the footer says recipes are engine-generated and human-edited. Confirm that is true of the process before it ships.
7. **Shopping list.** Nothing on the page leads with missing-ingredient shopping list generation, per the 8/29 flag. Keep it that way until Tony confirms.

Gates from §9 of the spec: deploy page one, confirm HTTP 200, then Google Rich Results Test **and** Pinterest Rich Pin validator. Do not build page two until both pass. If Pinterest renders it as a single Recipe rich pin rather than an Article, decide then whether to accept it or suppress with `<meta name="pinterest-rich-pin" content="false">`.

## Deploy note

The DC runs on the design-system runtime, so it is the design and content source, not the deployed file. The generator (§9 step 5) reads `content.example.json`'s shape and emits static HTML against this layout. The three JSON-LD blocks and the OG/meta set in the template `<helmet>` are production-ready and can be lifted verbatim; at integration the inline styles should be replaced by the live site stylesheet, which is where `colors_and_type.css` already lives.

## Second supporting section

Only one is built (protein math). Slot 6b is deliberately empty so page two can rotate — prep-ahead notes, ingredient swaps, buy-once-use-five-ways, common mistakes, scaling for a family. Rule 13: never the same two in consecutive pages.
