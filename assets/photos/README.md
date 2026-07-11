# Photo library — `assets/photos/`

Raw food photography for the iEatz Healthy social content pipeline, organized by
content pillar. `photos.json` is the machine-readable index the render/scheduler
pipeline reads; each entry carries a `category` (pillar) and a public `url`.

## Layout

```
assets/photos/
├── photos.json          # index: { file, category, url, flag? } × 74
├── food/                # 39
├── fridge/              # 8
├── grocery/             # 5
├── lifestyle/           # 18
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
