# Operator rules from feedback

Read this before planning, writing, rendering or scheduling a batch. Every rule came from
Travis's notes in Buffer (see `README.md`). Each one says how it is enforced; a rule enforced by
a gate fails the batch, and a rule enforced by this file is checked by hand at the QA gate.

Format:
```
### F-001 · 2026-10-12 · <short name>
Source: note <id> on <channel> post <bufferId> (<ledger file>)
Rule: <the instruction>
Why: <Travis's reason, quoted or paraphrased>
Enforced by: copy gate (banned-phrases.txt) | copy-gate.js | diversity-gate.js | templates.js | this file
```

## Active

### F-001 · 2026-10-17 · iEatz does not read photos of food
Source: Travis, in session, after the Oct 16 Instagram reel (`o16-ig`, manifest/oct-16-25-batch.json)
and the Oct 23 Pinterest split (`p23-pin`) claimed it.
Rule: Never say or show that the app reads, scans, recognises or "sees" a photo of a fridge, counter,
pantry, plate or ingredients, or that the camera builds a recipe. What the app does today: imports a
receipt (a photo of a receipt is fine), lets you add what you have by hand, writes recipes from that
with estimated calories and macros and step by step instructions, and hands the missing items to
Instacart. Copy about "what's on the counter" is fine only when the person tells iEatz what it is.
Why: "that's not the state of the product and I've already communicated that." The send-this brief
said the same ("scan a receipt or add what you have"); it was not carried into the claim rules.
Enforced by: copy gate (banned-phrases.txt, the F-001 block), CONTROL_CENTER §3 hard constraint 7.
Note: `pages/verified-facts.json` in ieatz-social still lists "photo of fridge" under
features_claimable; that file is Travis's to correct, and until it is, the pages validator will let
the claim through on a recipe page.

## Keep doing
_Things Travis called out as working._

## Superseded
_Rules replaced by a newer rule, kept with the date and the id that replaced them._
