# iEatz Social — Session Handover Brief (2026-07-16)

**You are the new permanent home for all iEatz content creation and Buffer scheduling.**
This brief primes you; the full operating manual is **`social/CONTROL_CENTER.md`** — read it
completely before your first action. This file tells you what's true *right now*, what Travis
actually wants, and the lessons the last session paid for so you don't pay for them again.

---

## 1. Intent — why this system exists (read this like a mission statement)

Travis (travis@appliedintelligenceai.co, they/them pronouns unstated — use their name) is building
an autonomous content engine for **iEatz Healthy** ("Dinner, decided."), an iOS app that scans a
grocery receipt and turns what's already in your kitchen into healthy recipes. North star:
**app installs**, via organic Pinterest + Instagram now, and an SEO/AEO recipe-page Content Hub
from August (see `CONTENT_HUB.md`). Judged on install *trend* over months, not week-2 numbers.

What Travis values, in priority order — this is the quality bar you're held to:

1. **Autonomy.** Do not ask for approval on Buffer/connector actions — it is durably granted
   (allowlist in `.claude/settings.json`, granted verbally many times). Asking again actively
   frustrates. Act, then report outcomes honestly. Confirm first only for genuinely destructive
   or scope-changing moves.
2. **Human, not bot.** Posting patterns must read as a person: all 7 weekdays covered over a
   ~2-week run, dayparts spread (early-AM / lunch / evening / late-night), irregular
   non-repeating minutes, uneven spacing. A fixed grid (M/W/F 9:00, or all pins 2–4 PM) is a
   failure. Same for visuals: rotate surfaces (paper / deep-green / full-bleed photo); no two
   adjacent grid posts share a shell.
3. **Zero fabrication.** No invented app screens, no fake testimonials (approved names only:
   Maya R., Leoactionz, SixSocks, Ashly H.), macros always labeled estimates, every number
   sanity-checked. One shipped math error created this rule.
4. **Reliability.** Ledger-driven, idempotent, resumable. Anything not committed to git is lost.
   Verify (HTTP 200, QA gate, Buffer response) before declaring done.
5. **Compounding.** Every learning gets memorialized: brand-specific → `CONTROL_CENTER.md`;
   brand-agnostic → the `social-content-pipeline` skill (`social/skills/.../SKILL.md`) AND its
   Notion mirror (page `3870a9f4-35b5-800a-ba80-e79895dd75ee`). Update the evolution log as you go.

## 2. Live state (verified in Buffer 2026-07-16)

- **July 18–31 batch: 20 posts scheduled and DONE.** 12 Pinterest + 8 Instagram, rendered,
  QA-passed, hosted, verified 200, humanized times on both channels. Nothing pending in the batch.
- **Ledger of record:** `social/manifest/july-batch.json` — every post's `bufferId`, `dueAt`,
  `file`, `text`, `status`. It matches Buffer exactly as of this handover. Keep it that way:
  after ANY Buffer mutation, update the ledger and push.
- **Key IDs** (also in the ledger header): org **Applied Intelligence Co.**
  `6a138b7d82bb2ed009fed356` · Pinterest channel `6a14637fc687a22dd424eee8`, board Quick Saves
  `boardServiceId "1011339728760978564"` · Instagram channel `6a14b495c687a22dd4267bfc` ·
  App Store URL `https://apps.apple.com/us/app/ai-recipe-generator-by-ieatz/id6475559706` ·
  timezone America/Los_Angeles · Slack #social `C0BATGA438T`.
- **Image hosting:** `https://raw.githubusercontent.com/travi-trav3/iEatz/add-food-photography/...`
  — the **`add-food-photography` branch serves the live images. Do not delete it before Aug 1**
  (after the Jul 31 posts publish), or merge it to the default branch and re-point nothing
  (raw URLs pin to the branch name — the branch must keep existing until the last post is out).
- **Permissions:** `.claude/settings.json` on `add-food-photography` allows every connector.
  If you are prompted for approvals, the session was started from a branch without that file —
  first move: merge/land it on `main`.

## 3. Your first moves (in order)

1. `get_account` — anchor on `currentTime` (the session clock jumps days between turns; never
   trust "today" from memory) and confirm the org by name.
2. Read `social/CONTROL_CENTER.md` fully, then skim `social/manifest/july-batch.json`.
3. `list_posts` (status `sent` + `scheduled`, both channels) — reconcile reality vs the ledger
   before creating anything. Posts start publishing **Jul 18**.
4. From ~Aug 1 (≥2 weeks of `sent` data): pull metrics (`get_aggregated_post_metrics` /
   `includeMetrics`) and let each channel's real winners set future times — data replaces the
   generic dayparts.
5. Plan the **August batch**: back-to-school seasonal lens (already seeded in late-July posts),
   8-pillar rotation, and begin the **Content Hub** build (`CONTENT_HUB.md`) — it needs the
   website repo added via `add_repo` and the 7 Pinterest keyword boards (see Open items).

## 4. Open items you are inheriting

| Item | Status | Notes |
|---|---|---|
| 7 Pinterest keyword boards | **Blocked on Travis** — Buffer/API can't create boards; must be made natively in Pinterest | Then re-home Quick-Saves pins for Rich Pins |
| Merge `add-food-photography` → `main` | Recommended after Jul 31 (or now, keeping branch alive) | Carries the settings allowlist + all social infra to future sessions |
| August Content Hub | Spec ready in `CONTENT_HUB.md` | Needs website repo via `add_repo`; iEatsHealthy.com/recipes/ pages |
| Engine repo (`appliedintelligenceco`) | Blocked on Travis creating the repo | For the brand-agnostic pipeline (skill layer 2) |
| Account-level Skill paste | Manual step for Travis | Paste `social/skills/social-content-pipeline/SKILL.md` into Settings → Skills |
| Notion skill mirror sync | Behind repo SKILL.md | Sync the grid-first/surface-rotation rule to Notion page `3870a9f4-...` |
| Slack engagement alerts | Starts Jul 18 | On each `sent` post: alert #social with platform, first line, direct link |

## 5. Field lessons — what will actually bite you (training from the last session)

**Buffer MCP mechanics**
- The server **flaps constantly**. Tool missing → `ToolSearch "select:mcp__Buffer__<tool>"`,
  retry. Never conclude a capability is gone; never conclude a failure means denial.
- **A "permission stream closed" abort is not a failure of the whole batch.** In a parallel
  batch, earlier calls may have landed. ALWAYS re-check with `list_posts`/`get_post` before
  retrying an `edit_post`/`create_post`, or you'll double-fire. Batch ≤4 calls; drop to
  sequential when the connection is shaky.
- `edit_post` **re-validates the whole post, never merges.** Carry forward `text`, `assets`
  (map `source`→`url`, `thumbnail`→`thumbnailUrl`, keep `altText`+`dimensions`), and full
  `metadata` (`pinterest.boardServiceId` + `title` + `url`; `instagram.type` +
  `shouldShareToFeed`). Dropping any required field rejects the edit.
- **`list_posts` omits `metadata`** (no pin titles). `get_post` per post before editing —
  never reconstruct titles from memory.
- `dueAt` takes ISO with `-07:00`; responses return **UTC** — convert before you "verify."
- Never trust IDs from conversation memory after compaction. Re-fetch from the ledger or
  `list_posts`. Fabricating a 24-hex ID is worse than an extra call.

**Session/platform mechanics**
- **Settings load at session START only.** Mid-session settings edits change nothing now;
  they help the *next* session, and only if on the checked-out branch. Don't chase in-session
  permission fixes — explain, land the file, move on.
- Ephemeral container: commit+push anything that matters, immediately. The ledger commit after
  each Buffer mutation is the resume point that survives restarts/compaction.
- MCP servers reconnect mid-turn; deferred tools need a `ToolSearch` reload after every flap.

**Content quality (why the QA gate exists — all real shipped failures)**
- Wrong photo for the copy (poke ≠ flatbread), Georgia-fallback fonts, logo/badge collisions,
  a $1,866-should-be-$1,860 math error, misleading photo slugs ("gluten-free" file showed
  bread). **Open every rendered PNG with the Read tool and every photo before use.** No
  exceptions, even for a "one-line copy change" re-render.
- Pinterest favors fresh images — don't reuse a hero photo within ~30 days
  (`assets/photos/photos.json` is the index; buddha-bowl.jpg is resting).

**Working with Travis**
- Lead every report with the outcome, then a compact table of what's scheduled. They read
  fast and act fast; don't bury the answer.
- When they say "you have approval," they mean it globally and durably — re-asking reads as
  a malfunction. If a platform-level prompt appears anyway, explain the layer it comes from
  (connector auth vs session permissions vs settings file) in plain words; the ambiguity
  between those three layers has been a repeated source of frustration.
- They will message mid-turn; fold the new instruction in without dropping the running task.

## 6. Current schedule cheat-sheet (all times PT)

**Pinterest (12):** Jul 18 8:25a · 19 11:10a · 20 6:50p · 21 12:15p · 22 7:35a · 23 9:20p ·
24 5:05p · 25 10:10a · 26 7:45p · 28 8:15a · 29 12:50p · 31 6:20p
**Instagram (8):** Jul 18 10:35a · 19 1:05p · 21 7:20a · 23 6:40p · 25 9:50a · 27 12:35p ·
29 9:10p · 31 5:25p

Every clock time is unique across the batch by design. When adding posts, keep it that way.

---

*Maintained by the session that scheduled the July batch. Update this file (or retire it into
CONTROL_CENTER §11) once August is underway — a stale handover is worse than none.*
