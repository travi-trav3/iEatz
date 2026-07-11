# iEatz Healthy — Content Hub Build Spec v2 (August 2026+)

**North star: app installs, via organic Pinterest + search/AI answer engines (SEO/AEO).**
Recipe/ingredient pages on **iEatsHealthy.com/recipes/** become the owned destination that
(a) ranks for long-tail recipe queries, (b) gets cited by LLMs answering "what do I make
with X", (c) unlocks Pinterest Rich Pins, and (d) routes every visitor to the App Store
with readable attribution. Extends `CONTROL_CENTER.md`; does not replace it.
Expectation-setting: SEO/AEO compounds over months 2–6 (per the acquisition-push plan) —
the system is judged on trajectory at the 90-day checkpoint, not week-2 numbers.

> v2 = the original spec, pressure-tested. Original decisions are kept; a **Changelog**
> at the bottom lists what was added/modified and why.

---

## 1. What this system is — one source, three renders
One structured **content object** per concept produces:
1. a unique web page at `iEatsHealthy.com/recipes/[slug]`,
2. the social creative (Pinterest pin + IG post),
3. the scheduled Buffer posts routing traffic to the page/app.
Nothing written twice; nothing drifts. The web page is the only net-new output.

### Repos & where data lives (do not conflate)
- **`travi-trav3/iEatz`** — the social pipeline (`social/`), photo library, rendered PNGs
  Buffer ingests. *(The original spec's "ieatz-social repo" is this repo; there is no
  separate social repo. PNG hosting is `raw.githubusercontent.com`, NOT github.io — that
  host is egress-blocked from sessions.)*
- **iEatsHealthy.com website repo** (Cloudflare) — the `/recipes/` pages, plus the
  **content objects** (`content/objects/*.json`) and the **hub ledger**
  (`content/ledger.json`). Single source of truth lives next to what it builds.
  ⚠️ Not yet in the session — `add_repo` prerequisite (Notion task, due 7/15).

## 2. Decisions locked (v1, unchanged)
- Pages in a **subdirectory** `/recipes/[slug]` — authority compounds under one domain.
- Template controls **structure only**; content genuinely unique per page.
- Website repo pushes to Cloudflare; publishing fully automatable.
- Recipes are Claude Code–generated.
- **Volume: 2–3 pages/week — do not accelerate** at the cost of uniqueness rules.
- Buffer `customScheduled` with `dueAt` 7+ days out; the lead time is the review window.
- A page is created only when the concept earns one.

## 3. Decisions locked (v2 additions)
- **Slugs are immutable.** lowercase-hyphen, no dates, no renames; if a rename is ever
  unavoidable, a 301 goes in the same deploy.
- **Scheduled-asset durability:** any PNG referenced by a scheduled Buffer post must be
  served from a durable ref (`main`), not a feature branch. Merge before scheduling.
- **Pages are static, server-rendered HTML** — full content in the initial payload.
  LLM/answer-engine crawlers do not execute JavaScript; a JS-rendered page is invisible
  to the AEO half of this plan.
- **Web images get their own pipeline.** Library photos are 1–13 MB originals; pages
  serve resized WebP (~1200px hero, ~640px inline, quality ≈80) with width/height set.
  Shipping originals would tank Core Web Vitals and the SEO half of the plan.
- **Every page carries the iOS Smart App Banner** (`apple-itunes-app`, app id 6475559706)
  — a free, native install path for all mobile-Safari organic traffic.
- **Recipe schema only with an honest photo.** Recipe JSON-LD requires an image; the
  image must actually depict (or credibly represent) the dish. Concepts are chosen
  partly by what the 74-photo library can support; if no honest photo exists, the
  concept waits or ships FAQ-schema-only.

## 4. Attribution architecture (v2 — closes the biggest measurement hole)
UTMs die at the App Store: GA sees the outbound click, App Store Connect never sees the
UTM, so "which content drove installs" would be unreadable — blinding the exact loop this
plan exists to optimize. Two-layer fix:
- **On-site + social links (GA-readable):** every CTA carries
  `utm_source={pinterest|instagram|google}`, `utm_medium={social|organic}`,
  `utm_campaign=hub`, `utm_content=<content-id>`.
- **App Store links (install-readable):** use Apple **campaign links** —
  `?pt=<provider-token>&ct=<content-id>&mt=8` — so App Store Connect reports
  product-page views/installs **per content ID**. One-time setup: pull the provider
  token (pt) from App Store Connect.
- The Smart App Banner inherits the page context; page→store buttons always use the
  campaign link.
Result: GA shows page behavior per content; ASC shows installs per content; the ledger
joins them by `content-id`.

## 5. CTA & destination routing v2
Decided per concept at batch planning, recorded in the object.

| Concept type | Pin URL | Page CTA | Why |
|---|---|---|---|
| Page-backed (recipe/ingredient query) | **the page** (+UTM) | App Store campaign link | Rich Pins fire from the page's Recipe/OG markup; Pinterest gets a trusted owned domain; installs stay attributed |
| Maps cleanly to a CPP theme | CPP URL (+UTM) | — | tighter message match |
| Brand / story / proof (no search target) | homepage or App Store campaign link | — | no page earned |
| Unsure | homepage (+UTM) | — | default |

**v2 change:** in v1, page-backed pins pointed at the App Store. That threw away the Rich
Pin unlock the Q3 strategy explicitly wanted ("Rich Pins require OG tags on a destination
we control — that's the argument for the recipes landing page"). Pins → page → store is
the loop. Validate the domain once in Pinterest's Rich Pin validator, and claim the
domain in the Pinterest account (one-time, manual — makes pins from the domain credit
the ieatzhealthy account).

## 6. Order of operations v2 (per batch)
1. **Plan the batch** — target queries mapped to real search questions × niche use case.
   Run the **dedup check** against the ledger's query registry (§10). Sanity-check
   demand (Google/Pinterest autocomplete presence). Validate constraints against the
   **capability gate file** (§9). Decide destination per concept.
2. **Generate the content object** — one record; single source of truth.
3. **Render social creative** — existing pipeline + QA gates (Control Center §6).
4. **Generate the page** (if earned) — from the object; includes schema, OG tags,
   Smart App Banner, internal links, sitemap entry.
5. **Schema lint (automated)** — parse the emitted JSON-LD; assert required Recipe
   fields (name, image, ingredients, instructions) and FAQ shape. Fail = no deploy.
6. **Deploy & verify (GATE)** — push to Cloudflare; poll the **final URL** until
   HTTP 200 *and* the response body contains the H1 (a 200 shell with no content is
   still a fail). If the domain is egress-blocked from the session, fall back to the
   Cloudflare API for deploy status (Cloudflare MCP is connected) — but the 200 check
   is the standard.
7. **Ping the index** — sitemap already updated in the deploy; IndexNow ping (Bing/AI
   crawlers); GSC picks up via sitemap.
8. **Resolve CTA URLs** — router applies §5 + appends UTM / campaign tokens.
9. **Approve at schedule time** (preview gate), then Buffer `customScheduled`,
   `dueAt` 7+ days out. Images referenced must already be on `main` (§3).
10. **Write the ledger record** — content ID ↔ object path, images, page URL + status,
    destination, Buffer post IDs, dueAt, query target + variants.
11. **T-48h pre-flight (automated)** — for every post due in the next 48h: re-verify
    page URL 200 + image URL 200 + (for page posts) H1 still present. Any failure →
    move post to draft (`saveToDraft:true`) + Slack alert to #social. This is what
    makes auto-publish safe even in a week the human review slips.
12. **Weekly review checkpoint** — standing review of everything queued for the next
    7 days (a scheduled session/Routine compiles the digest to Slack; human eyes decide).

The gates at 5/6, the ledger at 10, the pre-flight at 11, and the review at 12 are the
difference between "works when babysat" and "works."

## 7. Page uniqueness system — HARD checklist (every page passes ALL)
AI recipe content at volume is a flagged pattern (helpful-content/spam systems); thin
templated pages get suppressed as doorway pages; LLMs ignore pages that don't answer a
specific question. 2–3/week reads as human-curated — keep it that way.
1. Target **one specific long-tail question**, not a broad ingredient.
2. **Answer directly in the first 1–2 sentences** (AEO / featured-snippet grab).
3. **1–3 genuinely distinct real recipes**, real ingredient lists, real steps. No recipe
   reused across pages.
4. **Vary supporting sections** — rotate (substitutions · why this works · time-savers ·
   storage · what to serve with · common mistakes · nutrition note); pick 2–4; never the
   same set twice running.
5. **Distinct title tag, meta description, H1, intro** — no boilerplate reuse.
6. **Recipe JSON-LD + FAQ schema** (2–3 real Q&A pairs phrased as people search).
7. **Natural, varied app integration** — one contextual line, phrased differently each
   time, + CTA. Not a repeated banner block.
8. **2–4 internal links** to related hub pages (topical cluster).
9. **Substance bar:** ~400–700 useful words; never padded.
10. **Utility test:** page helps even if the app didn't exist, or it's thin — rework.
11. **(v2) Honest imagery:** photo depicts the dish (or is plainly presented as
    ingredient/inspiration imagery, excluded from Recipe schema). Never a mismatched
    photo inside Recipe markup.
12. **(v2) Accuracy bar:** macros labeled "Estimated per serving — verify for
    allergens" (brand rule); no health/medical claims; diet tags only where the
    capability gate allows.

## 8. Technical SEO/AEO checklist (v2 — mostly one-time)
- **Google Search Console + Bing Webmaster Tools** verified; sitemap submitted to both.
  Bing matters disproportionately: ChatGPT/Copilot answers lean on the Bing index.
- **IndexNow** enabled (Cloudflare has native support) — instant Bing/AI-crawler pings.
- `robots.txt` sane; **canonical** on every page; `dateModified` maintained in schema
  (freshness signal on updates).
- **OG + Twitter card tags** on every page (also what Rich Pins read).
- **Hub index page `/recipes/`** listing all pages, linked from the site's main
  **nav/footer** — pages must not be orphans or the cluster never compounds.
- **Static HTML, CWV-clean:** WebP images sized to slot, width/height attributes,
  no render-blocking JS. Target LCP < 2.5s on mobile.
- **llms.txt** at the domain root (cheap, speculative-but-rising AEO surface).
- Optional: `feed.xml` for the hub (some AI crawlers and aggregators read feeds).

## 9. Content integrity & E-E-A-T (v2)
- **Provenance:** each page states recipes are iEatz-generated (pending Travis confirm;
  recommended) — honest, and every page becomes a live product demo.
- **Human review line:** "Reviewed by the iEatz team" with review date — E-E-A-T
  transparency that matches reality (the preview gate IS a human review).
- **Capability gate file:** `content/supported-capabilities.json` — the definitive list
  of diets/constraints the app genuinely supports (from Travis, task due 7/15).
  Batch planning mechanically rejects any query target outside it.
- **YMYL caution:** nutrition-adjacent content — keep claims modest and functional;
  allergen disclaimer per brand rules; never "diet X cures/prevents Y".
- Unsplash photo licensing covers commercial web use; keep IMPORT-LOG.csv provenance.

## 10. Query planning & dedup (v2)
- **Query registry:** the ledger records every page's `query_target` + variants. A new
  concept must not overlap an existing page's intent — if it does, **update/extend the
  existing page** (freshness beats cannibalization) or internal-link instead.
- **Demand sanity check:** the query (or a close variant) should appear in Google/
  Pinterest autocomplete. Long-tail is the strategy; zero-demand vanity phrasing is not.
- **Cluster-first batches:** launch 3 pages around one theme in the first batch so
  internal links have real targets from day 1 (e.g., chicken+rice meal prep · leftover
  rotisserie chicken 15-min · high-protein pantry bowls).
- **Niche axes (unchanged):** inventory state × constraint × outcome. Examples:
  "High-protein dinner from chicken and rice for meal prep" · "No-cook dinners for a
  nearly empty fridge" · "What to make with leftover rotisserie chicken in 15 minutes" ·
  "Single-serving keto dinner with eggs and spinach" (capability-gated) · "Budget
  dinners from pantry staples at the end of the month". Narrow and real wins.

## 11. Failure modes → designed mitigations (v2)
| Failure | Mitigation |
|---|---|
| Post publishes pointing at a 404 page | Deploy gate (§6.6) + T-48h pre-flight auto-draft (§6.11) |
| Branch deleted → scheduled images break | Images on `main` before scheduling (§3) |
| Human skips the weekly review | Pre-flight is automated and independent of the human |
| Cloudflare deploy async/slow | Poll with backoff; Cloudflare API fallback for status |
| iEatsHealthy.com egress-blocked from session | Detected in build step 1; API-status fallback; flag if body-check impossible |
| Schema drift/invalid JSON-LD | Automated schema lint pre-deploy (§6.5) |
| Query cannibalization over months | Ledger query registry + planning dedup (§10) |
| Rich results flagged as spam | Honest-imagery rule (§7.11) + provenance + volume cap |
| Attribution unreadable | Two-layer UTM + Apple campaign tokens (§4) |
| Pages orphaned / never crawled | Sitemap in deploy + nav link + IndexNow + GSC/Bing (§8) |
| CWV tanks rankings | WebP image pipeline + static HTML (§3, §8) |
| Buffer/MCP flap mid-batch | Ledger records progress; every step idempotent and resumable |

## 12. Net-new to build
1. **Page template + generator** — object → static schema-marked page → website repo.
2. **Web-image pipeline** — library photo → sized WebP variants in the website repo.
3. **Publish-and-verify** — push → poll final URL for 200 + H1 → IndexNow ping.
4. **Schema lint** — JSON-LD parse + required-field assertions, pre-deploy.
5. **Sitemap + internal-linking automation** — new page → sitemap + cross-links.
6. **CTA router** — §5 rules + UTM/campaign-token appending.
7. **Ledger** — `content/ledger.json` read/write helpers + query registry check.
8. **T-48h pre-flight** — scheduled check (Routine) over the Buffer queue; auto-draft
   + Slack alert on failure.
9. **Weekly review digest** — scheduled compilation of the next 7 days' queue to Slack.
One-time setup (manual, ~an hour total): GSC + Bing verification · IndexNow token ·
Apple provider token (pt) · Pinterest domain claim + Rich Pin validation · nav link
to `/recipes/` · `supported-capabilities.json` from Travis's list.

## 13. Content object schema v2
```json
{
  "id": "chicken-rice-highprotein-mealprep",
  "status": "planned | object | rendered | page_live | scheduled | sent | indexed",
  "pillar": "Ingredient Idea",
  "query_target": "high-protein dinner from chicken and rice for meal prep",
  "query_variants": ["chicken and rice meal prep high protein", "healthy chicken rice meal prep"],
  "niche": { "inventory": "chicken + rice", "constraint": "high-protein, meal prep", "outcome": "meal prep" },
  "page": {
    "create": true,
    "slug": "high-protein-chicken-rice-meal-prep",
    "title_tag": "...", "meta_description": "...", "h1": "...", "direct_answer": "...",
    "recipes": [ { "name": "...", "ingredients": [], "steps": [], "time": "", "macros": {}, "image": "food/... (must depict dish)" } ],
    "supporting_sections": ["why this works", "substitutions"],
    "faq": [ { "q": "...", "a": "..." } ],
    "app_mention": "...", "internal_links": ["slug-1", "slug-2"],
    "date_published": "", "date_modified": ""
  },
  "assets": { "pin_png": "...", "ig_png": "...", "web_images": ["...webp"] },
  "social": { "pin": { "title": "", "description": "", "board": "" }, "ig": { "caption": "", "alt": "" } },
  "cta": {
    "destination": "page | app_store | cpp_health | homepage",
    "pin_url": "https://ieatshealthy.com/recipes/...?utm_...",
    "store_url": "https://apps.apple.com/...?pt=<pt>&ct=chicken-rice-highprotein-mealprep&mt=8"
  },
  "buffer": { "pin_post_id": "", "ig_post_id": "", "due_at": "" }
}
```

## 14. Build sequence (prove the path manually before automating)
0. **Preflight:** website repo added via `add_repo`; confirm session can reach the
   domain (or wire the Cloudflare API fallback); collect the one-time setup items (§12).
1. Build the page template; **hand-build one real page end-to-end**; deploy; confirm
   200 + content at the final URL. Validate schema in Google's Rich Results test and
   the Pinterest Rich Pin validator. *(This one page also becomes the Rich-Pin/domain-
   claim test article.)*
2. Finalize the content-object schema (§13).
3. Page generator. 4. Web-image pipeline. 5. Publish-and-verify + schema lint.
6. Sitemap/internal-link automation. 7. CTA router. 8. Ledger + registry.
9. Pre-flight + weekly-digest Routines. 10. First real batch: **one 3-page cluster**
   through the full pipeline (shorter Buffer lead on batches 1–2, then 7-day auto).

## 15. Metrics & checkpoints
- **Weekly (ops):** queue review (§6.12); pre-flight incident count (should be ~0).
- **Monthly (performance):** GSC impressions/clicks + Bing equivalents per page;
  pin outbound clicks (Buffer metrics); page → store CTR (GA, by utm_content);
  installs by ct token (App Store Connect); indexation rate (pages indexed / published).
- **Day-90 checkpoint:** trajectory review. Healthy = indexation >80%, impressions
  compounding month-over-month, first attributable installs. Unhealthy = re-examine
  query selection and page quality before adding volume — never fix flat results by
  publishing faster (that's the doorway-page death spiral).

## 16. Open items (pending Travis — Notion tasks created, due 2026-07-15)
1. **Auto-publish + 7-day window** — recommended accept; T-48h pre-flight (§6.11) is the
   real safeguard; run batches 1–2 on shorter lead first. *(pending confirm)*
2. **Capability list** — definitive supported diets/use-cases → `supported-capabilities.json`.
   *(pending product input — blocks diet-targeted pages only; pantry/budget/protein pages can start)*
3. **Recipe provenance** — recommended yes. *(pending confirm)*

---

## Changelog — v1 → v2 (pressure-test results)
**Added (holes that defeated the goal):**
- §4 Attribution: UTMs never reach App Store Connect — Apple campaign links (`ct`/`pt`)
  added so installs are attributable per content; without this the optimization loop is blind.
- §5 Routing: page-backed pins now point at the **page**, not the App Store — captures
  the Rich Pin unlock the Q3 strategy called out; Pinterest domain claim added.
- §6.11 T-48h automated pre-flight — auto-publish safety no longer rests solely on a
  human remembering the weekly review.
- §3/§8 Static-HTML + WebP image pipeline + Smart App Banner + CWV bar — original spec
  would have shipped multi-MB JPEGs and JS-invisible content; both silently kill SEO/AEO.
- §8 Bing Webmaster + IndexNow — AEO is substantially Bing-fed (ChatGPT/Copilot);
  Google-only indexing missed half the answer-engine surface.
- §7.11 Honest-imagery rule — Recipe schema with mismatched stock photos is a
  rich-results spam pattern; concepts now constrained by the photo library.
- §10 Query registry + dedup + cluster-first bootstrapping + demand sanity check.
- §11 Failure-mode table; §15 metrics + day-90 checkpoint with explicit "don't fix flat
  results with volume" rule.
**Modified:** ledger + content objects consolidated into the website repo (single source
next to what it builds); scheduled images must live on `main`; hub index page + nav link
required; slugs immutable.
**Unchanged:** all v1 locked decisions, the 10 uniqueness rules (extended to 12), the
niche model, 2–3/week volume, the destination-earns-a-page principle.
