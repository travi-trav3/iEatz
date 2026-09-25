# iEatz Healthy — Social Content Production System

Durable home for the iEatz social graphics pipeline (Instagram + Pinterest).
Everything a future session needs to design, render, QA, host, and schedule posts.
`CONTROL_CENTER.md` is the master prompt for a new session; read it first.

## Layout
```
social/
  CONTROL_CENTER.md     ← master prompt for a new session (brand, rules, IDs, workflow)
  README.md             ← this file
  manifest/             ← Buffer ledgers, one per batch (the scheduling source of truth)
  render/               ← the render harness (Playwright + sharp + ffmpeg)
    templates.js        ← THE shell registry (every shell, its surface, default footer, motion)
    base.css            ← design tokens + ALL shell CSS (single source)
    fonts.css + fonts/  ← self-hosted Instrument Serif, Inter Tight, JetBrains Mono, Permanent Marker
    doc.js              ← page builder shared by both renderers (fonts check, text fit, carousels)
    grade.js            ← render-time photo grade (v2 batches), cached in .grade-cache/
    render-batch.js     ← static PNGs:  node render-batch.js batches/<batch>.json
    render-motion.js    ← reels (MP4): node render-motion.js batches/<batch>.json
    ledger.js           ← loads a ledger or render batch for the gates (joins renderBatch)
    diversity-gate.js   ← set-level rules; also runs the copy gate
    copy-gate.js        ← copy rules as code; copy-allowlist.txt = allowed capitals
    contact-sheet.js    ← per-channel montage; --with-live = the IG grid as it will look
    compat-check.js     ← re-renders legacy batches and byte-compares with committed PNGs
    batches/            ← render batches (posts as data, not code); fixtures/bad.json
    legacy/             ← retired one-off scripts (reference only; do not extend)
```
Rendered PNGs/MP4s are copied to `../assets/pinterest/` and `../assets/social/` for hosting.

## Run (one command each)
```bash
cd social/render && npm install          # playwright-core + sharp; never `playwright install`
node render-batch.js batches/<batch>.json            # PNGs -> out/<batch>/ (carousels: <file>--01.png ...)
node render-motion.js batches/<batch>.json           # posts with "motion" -> out/<batch>/<file>.mp4 + <file>-cover.png
node diversity-gate.js ../manifest/<batch>.json      # diversity + copy gates (add --soft-format for the first two v2 batches)
node copy-gate.js ../manifest/<batch>.json           # copy gate alone
node contact-sheet.js ../manifest/<batch>.json --with-live   # per-channel sheets + IG grid with the last 9 live posts
node compat-check.js                                 # sep-10-16 must stay byte-identical
```
Chromium: `PW_CHROMIUM` or the `/opt/pw-browsers/chromium*` glob. Motion needs an ffmpeg with
libx264: `$FFMPEG`, else Playwright's bundled build (VP8 only, so it is skipped), else the system
`ffmpeg` (`brew install ffmpeg` / `apt-get install ffmpeg`). Photos resolve from `../../assets/photos`.

Smoke tests: `node render-batch.js batches/v2-smoke.json` (every shell at 1080x1350, 1000x1500,
1080x1920: 70 PNGs, all `OK`), `node render-motion.js batches/v2-motion-smoke.json` (three MP4s under
2 MB), and both gates pass on `batches/v2-smoke.json` and fail on `batches/fixtures/bad.json`.

## Batch JSON
```json
{ "name": "sep-28-oct-4", "createdAt": "2026-09-25",
  "posts": [ { "file": "…", "w": 1080, "h": 1350, "template": "poster", "footer": "badge-tr", "…props": "…" },
             { "file": "…", "w": 1080, "h": 1350, "slides": [ { "template": "poster", "…": "…" }, { "template": "recipephoto", "…": "…" } ] },
             { "file": "…", "w": 1080, "h": 1920, "template": "receipt", "motion": { "duration": 8, "fps": 24 }, "…": "…" } ] }
```
- **Sizes:** Instagram 1080x1350, Pinterest 1000x1500, story/reel 1080x1920. Every shell renders at all three;
  9:16 frames keep type out of the top 250 px and bottom 330 px (platform UI).
- **v2 batches** (`createdAt` >= 2026-09-25): photos are graded (per-post `"grade": false` opts out;
  `app-*.jpg` never graded), `"grain": true` adds the film grain layer, and every photo-bearing post or
  slide needs `photoClaim` (what the photo literally shows) or the render line fails. Older batches
  render exactly as before.
- **footer** (every shell except `ad*`): `badge-url` (legacy row) | `badge-bl` | `badge-br` | `badge-tl` |
  `badge-tr` | `none`. Never `badge-url` on Instagram; no position on two adjacent posts or > 50% of a batch.
- **eyebrow**: optional on every shell; absent or empty omits it and its margin.
- **headSize** overrides the headline size on bleed/poster/receipt/collage. Headlines marked
  `data-fit` (poster, receipt, split seam) shrink to fit their box automatically.

## Shells
Current kit (surface in brackets; the gate reads it):

| shell | surface | props | default footer |
|---|---|---|---|
| `receipt` | dark | `store`, `meta`, `lines[{item,price}]` ≤6, `moreCount`, `total`, `dishes[{name,when}]` ≤4, `head` (one `<em>`), `sticker`? | badge-br · **motion** |
| `poster` | paper | `head` (≤1 `<span class="u">` tomato underline, ≤1 `<span class="i">` green italic), `body`, `readout[{label,value}]` ≤3, `strip` | badge-tr · **motion** |
| `collage` | paper-deep | `cards[{photo,w,h,x,y,rot,tape?,objPos?}]` 2–3, `notes[{text,x,y,big?}]`, `arrow{text,x,y}`?, `price{text,x,y}`?, `head`, `grain` (default true). Positions are px on the 1080x1350 frame; other sizes scale by width, centered | badge-tl |
| `split` | photo-bleed | `top{photo,objPos,label}`, `bottom{photo,objPos}`, `seam`, `cap` (`<b>` = mono saffron) | badge-br |
| `thread` | mint / photo-bleed | `bg`: `"mint"` or `{photo,objPos}`, `head`?, `msgs[]` ≤8 bubbles: `{who,text}` (who = them or me), `{who:"me",photo}`, `{time}`; `foot` | badge-br |
| `sharpie` | photo-bleed | `photo`, `objPos`, `head` (≤24 chars, marker caps), `marks[{x,y,rx,ry,label,labelSide}]` 1–4, `arrows[{x1,y1,x2,y2}]`?, `ink` (`#0A0F0C` or `#fff`), `shade`? (auto). Marks are in 1080x1350 photo space; a mark cropped out at another size throws | badge-br |
| `bleed` | photo-bleed | `photo`, `objPos`, `eyebrow`, `head`, `sub`, `headSize` | badge-url · **motion** |
| `recipephoto` | paper | `photo`, `objPos`, `eyebrow`, `head`, `ings[]`, `method` | badge-url |
| `list` | paper | `eyebrow`, `head`, `items[{t,s}]` | badge-url |
| `device` | mint | `photo` (`app-*.jpg` only: real screens), `eyebrow`, `head`, `cap` | badge-url |
| `photo` / `igphoto` | paper | `photo`, `eyebrow`, `head`, `chips[]` | badge-url |
| `stat` | paper | `eyebrow`, `stat`, `statSub`, `statBody` | badge-url |
| `quotedark` | dark | `photo`, `eyebrow`, `quote`, `attr` (approved testimonials only) | badge-url |
| `ad*` | — | Meta ad shells, unchanged | own |

**Carousel** is a container, not a shell: `slides[{template,...props}]`, 2–10 slides, all at the post's
size. The cover must be `poster`, `sharpie` or `split`; slides 2+ get an `n / total` pager top-right
(mono) and default to `footer: "none"` (`badge-tr` is refused there). Output `<file>--01.png` … and the
ledger carries `slides: [...]` in order.

**Motion**: `motion: { duration, fps, timeline? }` on a `receipt`, `poster` or `bleed` post at 1080x1920.
Each shell's `setT(t)` is a pure function of time: receipt prints line by line, then dishes, sticker,
headline; poster draws the underline, counts the readout up, fills the strip; bleed zooms 1.06x while
the headline reveals word by word. Silent-safe: every word is on screen by the end; no audio track.
`timeline` overrides any phase with `[start, end]` seconds.

**Deprecated** (kept so old batches re-render; the gate warns on any use): `statdark` (use `poster`),
`recipe` (text-only; use `recipephoto`), `quote` (paper; use `quotedark`).

## Gates
- **Diversity gate** (`diversity-gate.js`): per channel, in publish order. Adjacent template, surface,
  pillar or footer never repeat; template ≤ ⅓; ≥3 pillars; no near-duplicate messages; no hero reuse;
  formulaic CTA ≤ 40% and never 3 in a row; accentTail ≤ 40%; eyebrow ≤ 50%; plated ≤ 30% of photo
  posts; Instagram needs a carousel and a reel in every 7-day window.
- **Copy gate** (`copy-gate.js`, also run by the diversity gate): no em dash, no en dash as a dash, no
  "not X, it's Y" family, ≤ 50% of headlines under five words, sentence-case headlines (allowlist in
  `copy-allowlist.txt`), and every `photoClaim` shares a noun with its headline or caption.
- **Ledger fields** written at planning time: `pillar, topic, template, surface, heroPhoto, cta,
  format, footer, eyebrow, accentTail, photoStyle, photoClaim`. A ledger with `"renderBatch"` gets any
  missing field derived from the render batch, and a written field that disagrees with it fails.

## Non-negotiables (see CONTROL_CENTER.md for the full list)
- Self-host fonts; never ship a fallback-font render (the render line checks every face).
- Render at `deviceScaleFactor: 2`, then downscale to exact pixel size.
- **QA gate:** open and eyeball EVERY rendered PNG before hosting: photo matches the copy (and the
  `photoClaim`), no collisions, spelling, math, exact dimensions.
- Host on `raw.githubusercontent.com/travi-trav3/iEatz/<branch>/assets/...` and verify HTTP 200
  before scheduling (`github.io` is egress-blocked).
- Macros are labeled estimates. Instacart used sparingly, iEatz-forward, official logo only.
