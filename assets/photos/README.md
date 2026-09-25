# Photo library — `assets/photos/`

Raw food photography for the iEatz Healthy social content pipeline, organized by
content pillar. `photos.json` is the machine-readable index the render/scheduler
pipeline reads; each entry carries a `category` (pillar) and a public `url`.

## Layout

```
assets/photos/
├── photos.json          # index: { file, category, style, url, flag?, note? } × 75
├── food/                # 39
├── fridge/              # 8
├── grocery/             # 5
├── lifestyle/           # 19
└── pantry/              # 4
```

`urlBase` in `photos.json` points at the branch the images live on
(`add-food-photography`). When this branch merges to `main`, update `urlBase`
(one line) to `.../travi-trav3/iEatz/main/assets/photos/` and the per-entry
`url`s follow.

## Flags

- `low-res` — source under 100 KB (legacy thumbnails, e.g. `food-01.jpg`). Fine
  as fallbacks; avoid as hero/full-bleed imagery.
- `ext-mismatch` — file is PNG data with a `.jpg` name (`shop-label-check.jpg`).

## Populating / refreshing the bytes

Source set: the **iEatz Healthy Design System** photo export (Drive folder, or
locally under `.../iEatz Healthy Design System (1)/assets/photos/`). Copy the
five category folders in here (filenames must match `photos.json`), skip
`IMPORT-LOG.csv` (provenance record only), then commit.

## Style (what the frame documents)

Every entry carries a `style`, tagged by opening the photo, not by reading the slug.
The render ledger copies it to each post as `photoStyle`; the diversity gate caps
`plated` at 30% of a channel's photo posts.

| style | means | count (Sep 2026) |
|---|---|---|
| `kitchen` | fridge, pantry, counter, groceries as a place | 15 |
| `process` | hands or tools mid-task: chopping, stirring, carving | 7 |
| `people` | a person is the subject | 15 |
| `plated` | finished food styled for the camera; every styled overhead bowl or flat lay | 38 |
| `product` | a phone showing the real iEatz app (the `app-*.jpg` screenshots count here) | 0 |
| `receipt` | a grocery receipt in frame | 0 |

Half the library is `plated` and none of it is `receipt` or `product`. That is the gap
the re-sourcing below exists to close. `note` flags entries whose slug misdescribes the
photo (for example `food/nuts-almonds.png` is a shopper with a phone, no almonds).

## Re-sourcing (Pexels / Unsplash), documentary kitchen

Direction: real kitchen, real light, mid-process; hands, phones and receipts allowed;
mess allowed; negative space for type; usable at 4:5, 2:3 and 9:16 (≥2400 px long edge).
Plated food only as the payoff frame of a split or carousel.

**Search terms**

- open fridge phone
- grocery receipt counter
- receipt on kitchen counter
- messy pantry
- pantry shelf cans jars
- cooking overhead phone
- phone propped kitchen recipe
- hands chopping cutting board
- pan steam stove hands
- pot of rice lid off
- packing lunchbox
- lunchbox open counter
- unpacking groceries kitchen
- leftovers containers fridge
- dinner table homework laptop

**Exclude** (reject on sight, whatever the search returned)

- flat lay
- overhead bowl
- garnish, microgreens, edible flowers
- wine glass
- white marble
- restaurant plating, tweezers, slate boards
- pristine all-white kitchen with nothing cooking
- models laughing at food

Tag each new photo's `style` on import, open it before tagging, and add a `note` when
the slug and the photo disagree. Photos that will sit in a split or carousel with each
other should come from the same kitchen; stock can't do that, which is why the shoot
list in the creative direction memo (Sep 2026) is the real fix.

## Render-time grade

`social/render` grades every photo at render time for batches created on or after
2026-09-25: `modulate({brightness: 1.02, saturation: 0.92})` plus a low-strength warm
wash toward `#F2E9D6`, so stock from different photographers reads as one camera. The
bytes in this folder are never modified. `app-*.jpg` screenshots are never graded.
Opt out per post with `"grade": false`; add `"grain": true` for the film-grain layer.
