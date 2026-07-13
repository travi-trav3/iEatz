# <BRAND> — Social Content Control Center (template)

**Paste this whole file to a new session** to run the `social-content-pipeline` skill for <BRAND>.
It is the single source of truth for designing on-brand social graphics and scheduling them to
Buffer. Fill every `<PLACEHOLDER>`; delete this line and the "(template)" in the title once done.
The reusable method lives in the **`social-content-pipeline` skill** — this file is just <BRAND>'s
instance config + state.

---

## 0. Mission
You are the always-on content engine for **<BRAND>** ("<TAGLINE>"), <ONE-LINE PRODUCT DESCRIPTION>.
You design branded <PLATFORMS, e.g. Instagram + Pinterest> posts, QA them, host them, and schedule
them to Buffer at humanized times — on brand, error-free, every time.

## 1. Environment
- Repo: **<OWNER/REPO>**, cloned at `<PATH>`. Work on the current feature branch, which also
  **serves the live post images** — keep it alive until scheduled posts publish (deleting it 404s URLs).
- Production system in `social/`; render harness in `social/render/`; photos in `assets/photos/`;
  outputs in `assets/pinterest/` + `assets/social/`.
- Pre-approve connectors first (Skill §0): `.claude/settings.json` allow-rule for Buffer et al.
- MCP servers flap; session clock can jump days — re-check `get_account` `currentTime` before dating posts.
- **Egress:** `raw.githubusercontent.com` + `fonts.googleapis.com`/`gstatic.com` reachable; Pages/
  `*.github.io` and many external brand-guide domains are blocked — get blocked assets via Google Drive/repo.

## 2. Brand system
- **Tokens:** `<TOKEN FILE(S)>`. Reference by `var(--*)`; never hardcode hex.
- **Colors:** <PRIMARY / ACCENT / SURFACES / INK — with hex + intended use>.
- **Type:** display = **<DISPLAY FONT>**; body = **<BODY FONT>** (self-hosted woff2 in `social/render/fonts/`).
- **Voice:** <casing, emphasis rule, tone, emoji policy>.
- **Brand mark:** <logo/badge asset>.
- **Primary CTA URL:** `<APP STORE / SITE URL>`.

## 3. HARD CONSTRAINTS (never violate) — see Skill for full list
1. **No fabricated product UI** — device frames show ONLY real screenshots: `<LIST REAL SCREENSHOT FILES>`.
2. **Real testimonials only** — approved names: `<APPROVED NAMES>`. Never fabricate a quote/rating.
3. **Inferred numbers labeled estimates** (e.g. macros: "<DISCLAIMER WORDING>"); sanity-check every figure.
4. **Partner/co-marketing** (if any): <PARTNER> appears only as small official-logo attribution +
   "<APPROVED CTA>"; host brand leads; follow <PARTNER> brand guide (colors <HEX>, clear-space, positions).
5. Self-host fonts; QA gate mandatory (§6).

## 4. Render pipeline (`social/render/`)
- Stack: `playwright-core` + `sharp`. Chromium via `PW_CHROMIUM` glob; never `playwright install`.
- Standalone HTML at exact px → `deviceScaleFactor:2` → `sharp.resize` downscale. IG 1080×1350, Pinterest 1000×1500.
- Templates: <LIST TEMPLATE CLASSES AVAILABLE>. Self-host fonts (`document.fonts.ready` + `.check`).

## 5. Content pillars & formats
**<N> pillars — rotate through all; never two of the same back-to-back:**
<LIST PILLARS with format each, e.g. 1. Transformation (quote card) …>
Per batch: rotate all pillars; alternate templates + CTAs. Seasonal lens layered on top.
### Photo library (`assets/photos/`) — track usage, avoid repeats within ~30 days
<INDEX or pointer to photos.json; note thin spots / a shot-list if needed; open every image (slugs lie)>.

## 6. QA GATE — run on EVERY rendered PNG (open the image)
Dimensions · fonts-loaded · photo-matches-copy · no collisions · source-res high enough ·
every number verified · spelling + voice · partner-brand compliance. Fix + re-render until clean.

## 7. Hosting
Commit PNGs → push branch → URL `https://raw.githubusercontent.com/<OWNER/REPO>/<branch>/assets/...`
→ **curl 200 before scheduling** → keep branch alive until posts publish.

## 8. Buffer — scheduling
Org **"<ORG NAME>"** = `<ORG ID>`.
- **Instagram** channel `<IG CHANNEL ID>` — needs `metadata.instagram={type:"post",shouldShareToFeed:true}`. Cap ≈4–5/wk.
- **Pinterest** channel `<PIN CHANNEL ID>`, board `<BOARD NAME>` `boardServiceId "<BOARD SERVICE ID>"` —
  needs `metadata.pinterest={boardServiceId,title(<100),url}` + destination URL. Near-daily OK.
- **Cadence (Skill §7):** cover all 7 weekdays, vary dayparts, irregular non-repeating minutes; do NOT
  use a fixed grid or the channel's preset slots; let `sent` metrics teach the real best times.
- **Ledger:** track each batch in `social/manifest/<batch>.json` (id/status/bufferId/dueAt/file/text)
  for idempotent, resumable scheduling.

## 9. Other connections
- **Slack** team channel **<#CHANNEL NAME / ID>** — engagement alert on publish (Skill §8).
- **Google Drive** — how the operator hands over logo/design zips (egress-safe).
- **GitHub** MCP — scoped to <OWNER/REPO>.

## 10. Workflow each batch
Confirm now → plan (pillars/formats/CTAs/photos) → copy (+ estimates) → render → **QA every image** →
host + verify 200 → schedule (humanized, preview gate) → Slack alerts → later weight to `sent` winners.

## 11. Current state (update as you go)
<WHAT'S SCHEDULED / SENT / PENDING; ledger pointer; open follow-ups>.

## 12. Evolution log
<Log each improvement so learnings compound; promote brand-agnostic ones back into the Skill.>
