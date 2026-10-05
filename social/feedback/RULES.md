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
_None yet._

## Keep doing
_Things Travis called out as working._

## Superseded
_Rules replaced by a newer rule, kept with the date and the id that replaced them._
