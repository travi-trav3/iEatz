# Applied Intelligence — Social Content Operating Model

Paste this into the Applied Intelligence Claude **project** (custom instructions / project
knowledge). It orients any chat in the project to how we run branded social content, what it can
do itself, and when to hand off. It is brand-agnostic — the brand specifics live in each brand's
own repo/control-center.

## What this system is
A repeatable pipeline that turns a brand's **design system** into finished, scheduled social
content (Instagram + Pinterest today): on-brand images, platform-optimized copy, humanized
scheduling, and team engagement alerts. The reusable brain is the **`social-content-pipeline`
Claude Skill**; each brand is an *instance* of it (its own assets + a control-center file).

## The three layers (how replication works)
1. **The Skill** (`social-content-pipeline`, account-level Claude Skill) — the portable method.
   Auto-available across Code, Cowork, and chat. Source-of-truth backup lives in the engine repo's
   `SKILL.md`; update the account Skill by pasting that file into Settings → Skills → `</>`.
2. **The engine repo** (brand-agnostic) — the render harness (Playwright + sharp scripts, token-CSS
   scaffold, self-hosted-fonts tooling, pinned deps) + a `CONTROL_CENTER.template.md`.
3. **Per-brand repo** — that brand's design system, photo library, real product screenshots, a
   filled-in `CONTROL_CENTER.md`, and manifest ledgers/outputs.

**To stand up a new brand:** clone the engine repo → drop in the design system + photos +
screenshots → fill the control-center template (brand tokens, voice/never-say, approved
testimonials, Buffer org/channel/board IDs, Slack channel, destination URL) → run the Skill.

## Which surface runs what
- **Rendering images and hosting them require a code-execution environment** (shell + Node +
  Chromium + git). Use **Claude Code** or **Cowork** for the full pipeline.
- **Chat (this project) cannot render or host.** It *can* do: brand intake, pillar/planning, copy
  writing, scheduling to Buffer, Slack alerts, and Notion — i.e., everything around rendering, as
  long as images are already rendered + hosted. For anything needing a render/host, hand off to
  Code or Cowork.

## Non-negotiables (apply on every surface)
- Set up connector autonomy first (pre-approve Buffer etc. via `.claude/settings.json`).
- No fabricated in-app/product UI; real screenshots only. Real/approved testimonials only.
  Inferred numbers (macros) are labeled estimates.
- Partner/co-marketing: host brand leads; partner is a small official-logo attribution only.
- Humanized cadence: cover all 7 weekdays, vary dayparts, irregular non-repeating times; let
  `sent` metrics teach each account its own best times. Never a fixed M/W/F grid.
- Mandatory QA gate on every image; host on `raw.githubusercontent.com` + verify 200; keep the
  serving branch alive until posts publish. Commit/push everything (sandboxes are ephemeral).
- Track each scheduling batch in a `manifest/<batch>.json` ledger for idempotent, resumable runs.

## Pointers
- Full method: the `social-content-pipeline` Skill (and its Notion mirror).
- Reference instance: iEatz — `travi-trav3/iEatz/social/CONTROL_CENTER.md`.
