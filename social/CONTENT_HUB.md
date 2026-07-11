# iEatz Healthy — Content Hub Build Spec (August 2026+)

**Extends `CONTROL_CENTER.md`; does not replace it.** The social pipeline (design →
render → QA → host → schedule) stays exactly as documented there. This adds a **web-page
layer**: ingredient/recipe pages on **iEatsHealthy.com/recipes/** as an organic SEO/AEO
acquisition engine that feeds the same pipeline. Status: ready to build, starts August.

## The idea — one source, three renders
One structured **content object** per concept produces three things:
1. a unique web page at `iEatsHealthy.com/recipes/[slug]`,
2. the social creative (Pinterest pin + IG post),
3. the scheduled Buffer posts that route traffic to the app.
Nothing is written twice; nothing drifts. **The web page is the only net-new output** —
render + QA + Buffer scheduling already exist.

## Two repos — do NOT conflate
- **`travi-trav3/iEatz`** (this repo) + GitHub raw hosting — rendered PNGs for Buffer to
  ingest. *(Note: the spec calls this "ieatz-social"; there is no separate social repo —
  the pipeline lives in this repo's `social/`.)*
- **iEatsHealthy.com repo** + **Cloudflare** — the website and the new `/recipes/` pages.
  The page generator writes **here**, and Claude Code has direct push access.
  ⚠️ **Prerequisite:** this website repo is NOT in the session yet — add it via `add_repo`
  before building/pushing pages.

## Decisions locked
- Pages live in a **subdirectory** (`/recipes/[slug]`), not a subdomain — authority
  compounds under one domain.
- Template controls **structure only**; content is genuinely unique per page.
- Hosting: website repo → Cloudflare (automatable push).
- Recipes are Claude Code–generated (same as social copy).
- **Volume: 2–3 pages/week.** Slow enough to read as human-curated. Do NOT accelerate at
  the cost of the uniqueness rules.
- Scheduling: Buffer `customScheduled`, `dueAt` **7+ days out** (auto-publishes; the lead
  time IS the review window).
- A page is created **only when the concept earns one**. Brand/proof/App-Store posts don't
  get a page.

## Order of operations (per batch)
1. **Plan the batch** — pick target queries (real search questions × niche use case);
   decide each concept's destination up front (new page / existing page / CPP / homepage / App Store).
2. **Generate the content object** — one structured record; single source of truth.
3. **Render the social creative** — pin + IG from the object (existing pipeline + QA gates).
4. **Generate the page** — only if earned; deploy to website repo → Cloudflare.
5. **GATE: verify the page is live** — confirm the final URL returns **HTTP 200** before
   scheduling anything against it. (The #1 rot mode is scheduling a post pointing at a 404.)
6. **Resolve the CTA URL with UTM tags** — per-content attribution readable in GA.
7. **Approve at schedule time** (preview gate), then Buffer schedule with `dueAt` 7+ days out.
8. **Write to the manifest ledger** — content ID ↔ images, page URL, destination, schedule entry.
9. **Weekly review checkpoint** — review everything queued to auto-publish in the next 7 days.

The **step-5 gate**, **step-8 ledger**, and **step-9 review** are what make it "works"
instead of "works when babysat."

## Page uniqueness system — HARD checklist (each page must pass ALL)
AI recipe content at volume is a flagged pattern (Google helpful-content / spam updates);
thin templated pages get suppressed as doorway pages; LLMs ignore pages that don't answer a
specific question. The template scales; these rules keep it from becoming worthless.
1. Target **one specific long-tail question**, not a broad ingredient.
2. **Answer it directly in the first 1–2 sentences** (AEO / featured-snippet grab).
3. **1–3 genuinely distinct real recipes** with real ingredients + steps. No recipe reused across pages.
4. **Vary supporting sections** — rotate a menu (substitutions, why this works, time-saver
   tips, storage, what to serve with, common mistakes, nutrition note); pick 2–4 per page. Never the same set.
5. **Distinct title tag, meta description, H1, intro** on every page. No boilerplate paragraph reused.
6. **Recipe JSON-LD + FAQ schema** (2–3 real Q&A pairs) — earns rich results + machine-readability.
7. **Natural, varied app integration** — one contextual "iEatz does this from a photo of
   your fridge" line, phrased differently each time, plus CTA. Not a repeated banner.
8. **2–4 internal links** to related hub pages (builds the topical cluster).
9. **Substance bar:** ~400–700 words of useful content. Never padded.
10. **Utility test:** would this help someone even if the app didn't exist? If no, it's thin — rework.

## Niche / use-case model (pick coordinates across 3 axes → a real query)
- **Inventory state:** single ingredient · ingredient pair · nearly-empty fridge · pantry staples · specific leftover.
- **Constraint:** time (15-min, no-cook) · diet (*only where the app genuinely supports it*) · equipment (one pan, no oven, air fryer) · situation (single serving, feeding kids, post-workout, end-of-month budget).
- **Outcome:** dinner · meal prep · quick lunch · use-it-up / reduce waste.

Examples: "High-protein dinner from chicken and rice for meal prep" · "No-cook dinners for a
nearly empty fridge" · "What to make with leftover rotisserie chicken in 15 minutes" ·
"Single-serving keto dinner with eggs and spinach" · "Budget dinners from pantry staples at
the end of the month." **Narrow and real wins; generic loses.**

## CTA routing (decide per concept during planning)
- Specific recipe/ingredient question worth ranking → **build a page**; CTA → App Store, or a themed CPP if it maps to a cluster.
- Query maps cleanly to a CPP theme (pantry/fridge, health/diet, grocery/instacart) → CTA can go straight to that CPP.
- Brand/story/proof with no search target → **no page**; point to homepage or App Store.
- Unsure → homepage. Every CTA carries **UTM tags**.

## Net-new to build (all extensions of the Claude Code pipeline)
1. **Page generator** — content object → static schema-marked page → website repo.
2. **Publish-and-verify** — push to Cloudflare, poll final URL to HTTP 200 before scheduling.
3. **Sitemap + internal-linking automation** — add page to sitemap, cross-link related pages (or it isn't crawled / cluster doesn't compound).
4. **CTA router** — apply routing rule + append UTMs.
5. **Scheduling w/ lead time + weekly review view** — `customScheduled` 7+ day `dueAt` + standing weekly review of what's queued.

## Content object (extends existing content JSON)
```json
{
  "id": "chicken-rice-highprotein-mealprep",
  "pillar": "Ingredient Idea",
  "query_target": "high-protein dinner from chicken and rice for meal prep",
  "niche": { "inventory": "chicken + rice", "constraint": "high-protein, meal prep", "outcome": "meal prep" },
  "page": {
    "create": true, "slug": "high-protein-chicken-rice-meal-prep",
    "title_tag": "...", "meta_description": "...", "h1": "...", "direct_answer": "...",
    "recipes": [ { "name": "...", "ingredients": [], "steps": [], "time": "", "macros": {} } ],
    "supporting_sections": ["why this works", "substitutions"],
    "faq": [ { "q": "...", "a": "..." } ],
    "app_mention": "...", "internal_links": ["...", "..."]
  },
  "social": { "pin": {}, "ig": {} },
  "cta": { "destination": "app_store | cpp_health | homepage", "url": "...", "utm": "..." }
}
```

## Build sequence (prove the path manually before automating)
1. Build the page template; **hand-build one real page end-to-end**, deploy, confirm live + 200 at final URL (validates the Cloudflare push path).
2. Finalize the content-object schema.
3. Build the page generator.
4. Build publish-and-verify.
5. Build sitemap + internal-linking automation.
6. Build the CTA router + UTM tagging.
7. Wire Buffer scheduling (7+ day lead) + weekly review view.
8. Run the first batch of 2–3 pages through the full pipeline.

## Open items — CONFIRM before first batch
1. **Auto-publish w/ 7-day review window** (change from drafts-only). *Recommendation:* accept
   it, with the weekly checkpoint as the mitigation; run the first 1–2 batches on a shorter
   lead (or drafts) to prove the page-live gate, then move to full auto. — **PENDING CONFIRM**
2. **Diet/constraint targets must map to real app capability.** Need the definitive list of
   diets/use-cases the app genuinely supports (high-protein? budget? keto? gluten-free?
   vegan? meal-prep?) so pages don't target queries the product can't back. Same principle as
   the open CPP decision to trim vegan/gluten-free/meal-prep. — **PENDING: product owner input**
3. **Recipe provenance on-page.** *Recommendation:* be transparent recipes are iEatz-generated
   — honest, and turns each page into a working product demo. — **PENDING CONFIRM**
