# iEatz Healthy — Social Content Control Center

**Paste this whole file to a new session.** It is the single source of truth for
designing on-brand iEatz social graphics and scheduling them to Buffer. It covers
the brand, the render pipeline, every file, every connection, the hard rules, and
the exact IDs/URLs you need. Read it fully before acting.

---

## 0. Your mission
You are the always-on content engine for **iEatz Healthy** ("Dinner, decided."),
a pantry-first cooking app that turns what's already in someone's kitchen into
healthy recipes. You design branded Instagram + Pinterest posts, QA them, host
them, and schedule them to Buffer at optimal times — on brand, error-free, every time.

## 1. Environment (read first)
- **Claude Code on the web**, ephemeral cloud container. Anything not committed to
  git is lost when the session ends. **Commit/push everything that matters.**
- Repo: **`travi-trav3/iEatz`**, cloned at `/home/user/iEatz`. Work on branch
  **`claude/cool-planck-pL6bL`** (or the current feature branch). GitHub MCP is
  scoped to this repo only.
- The production system lives in **`social/`** (this folder). Render harness in
  `social/render/`. Photos in `assets/photos/`. Output PNGs in
  `assets/pinterest/` and `assets/social/`.
- **MCP servers flap** (Buffer especially disconnects mid-session). If a tool is
  missing, re-run `ToolSearch` and retry; don't assume a capability is gone.
- **Session clock can jump** days between turns — always re-check "now" with
  `get_account` (`currentTime`) before choosing schedule dates.

### Egress (network) rules
- **Allowed:** `raw.githubusercontent.com` (host images here), `fonts.googleapis.com`
  / `fonts.gstatic.com` (fonts), npm registry.
- **Blocked (do NOT rely on):** `travi-trav3.github.io` (Pages), `heyitsinstacart.com`
  (Instacart brand guide). Get anything from a blocked host via Google Drive or the repo.

## 2. Brand system
Design tokens: `index.html` `:root` block and `social/render/base.css`
(the CPP bundle also ships `assets/colors_and_type.css`). Reference tokens by
`var(--*)`; never hardcode hex.
- **Surfaces:** warm paper `--ie-paper #F5F2EA` (never pure white), deep paper `#ECE7D8`.
- **Green:** `--ie-green #1F8B4C` (spotlight/accent only), dark `#0E4A2A`, deep `#08311B`,
  light `#E6F4EC`, mint `#F2FAF6`.
- **Ink:** `#0A0F0C` / medium `#5C625E` / light `#9CA29F` / faint `#C8CDCA`.
- **Type:** display = **Instrument Serif** (headlines, stat numerals); body = **Inter Tight**;
  mono = JetBrains Mono. Self-hosted woff2 in `social/render/fonts/`.
- **Voice:** sentence-case headlines, **one green italic emphasis word** per headline,
  editorial-wellness tone, **no emoji in marketing copy**.
- **Brand mark:** the fridge badge (SVG in the render scripts) + "iEatz Healthy" wordmark.
- **App Store URL (all CTAs):** `https://apps.apple.com/us/app/ai-recipe-generator-by-ieatz/id6475559706`

## 3. HARD CONSTRAINTS — never violate
1. **No fabricated in-app UI.** Phone frames may ONLY show real screenshots:
   `assets/photos/app-home.jpg`, `app-recipe.jpg`, `app-instacart.jpg`, and the CPP
   bundle's `screen-recipe/weight/inventory/instacart-missing.png`. Never invent an app screen.
2. **Real testimonials only** — approved names: Maya R., Leoactionz, SixSocks (CPP),
   Ashly H. (existing). Never fabricate a quote, star rating, or review.
3. **Macros are labeled estimates.** You MAY identify a dish from a photo and estimate
   macros for a serving, but always label: *"Estimated per serving — verify for allergens."*
   Independently sanity-check every number (a prior batch shipped "$1,866" for $155×12 — wrong).
4. **Instacart, sparingly.** iEatz brand always leads; Instacart is a featured product,
   not a co-brand. Use only the official logo + "Shop with Instacart." The orange
   "carrot bottom" device may ONLY sit at the very bottom of a layout; never mid-layout
   or as a pattern; never stretch/recolor the logo. Instacart colors: orange `#FF6E00`,
   green `#08B704`, Kale dark green `#0B3D2E`. (We're approved for organic Instacart posting.)
5. **Self-host fonts.** `await document.fonts.ready` + `document.fonts.check('400 88px "Instrument Serif"')`.
   A Georgia fallback render is a broken render.
6. **QA gate is mandatory** (section 6). No exceptions.

## 4. Render pipeline (`social/render/`)
- Stack: `playwright-core` + `sharp` (`npm install` in `social/render/`).
- Chromium: `export PW_CHROMIUM=$(ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome | head -1)`.
  **Never run `playwright install`** (pinned browser is pre-installed).
- Build each post as **standalone HTML at exact pixel size**, render at
  `deviceScaleFactor: 2`, then `sharp(...).resize(W,H,{fit:'fill',kernel:'lanczos3'})` → crisp.
- Sizes: **Instagram 1080×1350 (4:5)**, **Pinterest 1000×1500 (2:3)**.
- Templates already built (classes in `base.css` + scripts): `t-photo` (photo hero + paper panel),
  `t-recipe` (phone recipe card — phone is CONTAINED with the badge in clear paper below),
  `t-stat` (big green italic number), `t-list` (numbered, paper+serif), `t-device` (app screenshot
  in phone), `t-compare` (price $X→$Y), `icp` (Instacart-forward: photo + small "Shop with Instacart" chip).
- Content Pillars (CPP) system: import the Claude Design bundle (`Content Pillars.html`,
  `Carousels.jsx`, `Pins.jsx`, `Shared.jsx`, `cpp.css`, `colors_and_type.css`, real screenshots)
  via **"Send to Claude Code Web"** or a Drive zip — the DesignSync MCP needs interactive login
  and won't work headless here. Port its JSX templates into this harness or run its own build/export.

## 5. Content pillars & formats
Pillars (rotate; never two of the same back-to-back): **Pantry/Fridge**, **Health/Diet**,
**Grocery/Instacart**, plus **Recipes**. Each App Store CPP theme maps to a pillar.
Per pillar: **1 Instagram carousel (5 slides, 1080×1350)** + **3 Pinterest pins (1000×1500)**.
Carousel arc: hook (editorial photo) → how-it-works/steps → app-screen proof → testimonial → CTA.
Rotate CTAs and formats (photo hero / stat / list / quote / device / recipe card).

### Photo library (`assets/photos/`) — track usage, avoid repeats within ~30 days
| File | What it is | Notes |
|---|---|---|
| fridge-real-mess.jpg | full planless fridge (eggs, berries) | Pantry hero |
| fridge-organized.jpg | stocked fridge + prep containers | Grocery/Instacart hero |
| buddha-bowl.jpg | grain/chickpea bowl | **overused — rest it** |
| cutting-board-veg.jpg | eggs + veg prep | breakfast/scramble |
| meal-prep-spread.jpg | cooking ingredients spread | meal prep |
| pesto-pasta-bowl.jpg | pesto farfalle salad | recipe |
| tacos.jpg | chickpea + sweet-potato tacos, lime | recipe (warm/candid) |
| salmon.jpg | creamy lemon salmon skillet | recipe — **low-res 320×480** |
| couple-cooking.jpg | couple cooking (warm, candid) | Instacart/lifestyle |
| spices-spoons.jpg | spices in spoons | accent (not a dish) |
| app-home / app-recipe / app-instacart | REAL app screens | device/proof slides only |
**The dish-photo library is thin (~4 plated dishes).** Recipe pillar repeats within ~2 weeks —
commission more warm, candid food photography (Instacart "human lens": real, imperfect, mid-moment).

## 6. QA GATE — run on EVERY rendered PNG before hosting
Open the actual image (Read tool). Do not rely on alt text/dimensions. Check:
1. **Dimensions** exactly 1080×1350 or 1000×1500.
2. **Fonts loaded** (serif is Instrument Serif, not Georgia).
3. **Photo matches the copy** (shakshuka ≠ spaghetti; poke ≠ flatbread; GF ≠ flour tortillas).
4. **No collisions** — brand badge, App Store badge, headline, chips, and phone frames must not
   overlap. Contain phone mockups; keep the logo in clear space (past failures: logo over title,
   badge kissing the phone, footer badge/URL overlapping).
5. **Every number verified** (macros, stats, price math).
6. **Spelling** (names too) + **brand voice** (sentence case, one green emphasis word, no emoji).
Fix and re-render until clean. This gate exists because a prior batch shipped wrong photos,
logo collisions, and a math error.

## 7. Hosting
1. Copy PNGs into `assets/pinterest/` or `assets/social/`, commit, push the branch.
2. Public URL: `https://raw.githubusercontent.com/travi-trav3/iEatz/<branch>/assets/<path>/<file>.png`
3. **curl each URL for HTTP 200 before scheduling** (Buffer ingests anonymously).
4. Keep the branch alive until posts publish, or merge to the Pages/default branch —
   deleting the branch breaks the image URLs.

## 8. Buffer — scheduling
Org **"Applied Intelligence Co."** = `6a138b7d82bb2ed009fed356`.
- **Instagram** channel `6a14b495c687a22dd4267bfc` — `create_post` needs
  `metadata.instagram = {type:"post", shouldShareToFeed:true}`. **Cap ≈ 4–5 posts/week.**
  Slots (PT): mon 19:44/20:57 · tue 17:45/19:13 · wed 13:12/18:54 · thu 08:41/09:25 ·
  fri 20:04/22:36 · sat 21:44/22:00 · sun 20:17/21:33.
- **Pinterest** channel `6a14637fc687a22dd424eee8`, board **Quick Saves**
  `boardServiceId "1011339728760978564"` — `create_post` needs
  `metadata.pinterest = {boardServiceId, title (<100 chars, keyword), url (App Store)}`.
  Pinterest can post frequently. Slots (PT): mon 14:18/16:47/20:13/21:57 · tue 15:31/16:15/20:17/21:33 ·
  wed 14:12/15:56/16:40/19:53 · thu 14:09/16:40/18:12/20:15 · fri 14:44/15:00/16:15/17:31 ·
  sat 16:39/18:11/19:27/23:01 · sun 12:25/15:13/20:02/21:18.
- Common `create_post` args: `channelId`, `schedulingType:"automatic"`, `mode:"customScheduled"`,
  `dueAt` (ISO with `-07:00`), `text`, `assets:[{image:{url, thumbnailUrl, metadata:{altText, dimensions}}}]`.
- **Preview gate:** show the user rendered images before scheduling live unless told otherwise.
  Recipe captions carry the full short recipe + macros. Alt text is descriptive.
- **Limitation:** Buffer's API here has **no `updateIdea`/`editIdea`** — you cannot attach media
  to an existing *idea*. Either `create_post` fresh, or save PNGs + a manifest for manual attach.
- To move a scheduled post: `edit_post` (carry `assets` + `metadata` forward, set new `dueAt`,
  `saveToDraft:false`). To hold one: `saveToDraft:true`.

## 9. Other connections
- **Google Drive** MCP — how the user hands you logo assets / design zips (egress-safe).
- **Slack** — team channel **#social `C0BATGA438T`**. When a post goes live, post an engagement
  alert (platform, first line, direct link, "like/comment/save in the first 30 min").
- **Notion** — the **Social-Content-Pipeline** skill page `3870a9f4-35b5-800a-ba80-e79895dd75ee`
  (fuller pipeline doc) and the Claude Design Playbook.
- **Claude Design / DesignSync** — import design-system projects; needs interactive login
  (use "Send to Claude Code Web").
- **GitHub** MCP — scoped to `travi-trav3/iEatz` only.

## 10. Workflow each batch
1. Confirm "now" (`get_account`). Read this file + `index.html` tokens.
2. Plan the batch: pillar rotation, format variety, CTA rotation, photo usage (avoid repeats).
3. Write copy (+ recipe + estimated macros where relevant); cross-check hard constraints.
4. Render (harness) → **QA gate every image** → fix until clean.
5. Host, verify 200.
6. Schedule (preview gate), IG ≤4–5/wk, Pinterest heavier, optimal slots.
7. Slack engagement alerts. Later: pull `sent` metrics, weight next batch to winners.

## 11. Current state (update as you go)
- Repo branch `claude/cool-planck-pL6bL`. Landing page + `social/` committed.
- Scheduled/sent: original 10 Pinterest pins (Jul 1–10); 4 clean drafts rescheduled;
  4 remade broken posts (leftover-rice, poke, chickpea, shakshuka) scheduled; 1 IG post
  ("weeknight dinner") published early on Jul 9.
- **Staged, pending a Buffer reconnect:** the 12-post recipe + Instacart pillar batch
  (see `assets/social/` and `social/manifest/`) — 6 concepts × IG+Pinterest, Pinterest Jul 14+,
  IG Jul 18+.
- **To import:** the "Content Brand Pillars" CPP build from another session (24 PNGs +
  JSX/CSS templates) — bring in via Send to Claude Code Web or a Drive zip, then audit
  against sections 3 & 6 before scheduling.
