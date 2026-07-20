# iEatz Healthy — Social Content Production System

Durable home for the iEatz social graphics pipeline (Instagram + Pinterest).
Everything a future session needs to design, render, QA, host, and schedule posts.

## Layout
```
social/
  CONTROL_CENTER.md    ← the master prompt for a new session (read this first)
  README.md            ← this file
  render/              ← the render harness (Playwright + sharp)
    base.css           ← design tokens + ALL template/shell classes (single source)
    fonts.css + fonts/ ← self-hosted Instrument Serif + Inter Tight (no fallback)
    templates.js       ← the shell registry (photo/list/stat/statdark/bleed/quotedark/quote/device/recipe)
    render-batch.js    ← THE entrypoint: node render-batch.js batches/<batch>.json
    diversity-gate.js  ← mandatory pre-scheduling batch check (run on the manifest ledger)
    contact-sheet.js   ← per-channel montage; eyeball every batch as a set
    batches/           ← batch content JSONs (posts as data, not code)
    legacy/            ← retired one-off batch scripts (reference only; do not extend)
    package.json       ← deps: playwright-core, sharp
  manifest/            ← post → file → Buffer-idea mappings
```
Rendered PNGs live in `../assets/pinterest/` and `../assets/social/` (hosted from the repo).

## Run
```bash
cd social/render && npm install
export PW_CHROMIUM=$(ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome | head -1)  # do NOT run playwright install
node batch-render.js      # writes PNGs to render/batchout/
```
Scripts auto-detect Chromium (`PW_CHROMIUM` or glob) and resolve photos from `../../assets/photos`.

## Non-negotiables (see CONTROL_CENTER.md for the full list)
- Self-host fonts; never ship a Georgia fallback (`await document.fonts.ready` + `document.fonts.check`).
- Render at `deviceScaleFactor: 2`, then downscale to exact pixel size.
- **QA gate:** open and eyeball EVERY rendered PNG before hosting — photo matches the copy, no element/logo collisions (contain phone mockups; keep the badge in clear space), spelling, math, exact dimensions.
- Host on `raw.githubusercontent.com/travi-trav3/iEatz/<branch>/assets/...` and verify HTTP 200 before scheduling (`github.io` is egress-blocked).
- Macros are labeled estimates. Instacart used sparingly, iEatz-forward, official logo only.
