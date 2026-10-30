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

### F-002 · 2026-10-17 · Annotations must agree with the photo
Source: Travis, in session, on `p17-pin` (sharpie on a cutting board: the eggs circled and labelled
"the quesadilla").
Rule: A mark or label on a photo names what the thing is, or a next step that fits what the photo
already shows. Never relabel an ingredient as a dish it is not, and never annotate a scene where the
person has visibly chosen what they are making (a prepped board, a pan on the heat): the photo
already has an intention and the mark argues with it. Sharpie belongs on raw groceries, a receipt,
a full fridge shelf, a bag coming home: things that have not been decided yet.
Why: "it says quesadilla but is circled on eggs; plus it's already on a board, which means the human
already has an intention for what they're preparing. Dumb and nonsensical."
Enforced by: this file, checked at the QA gate (CONTROL_CENTER §6 item 7). The photoClaim gate
cannot read intent; a person can.

### F-003 · 2026-10-17 · Type sits on clean paper, never over a photo
Source: Travis, in session, on `o17-ig` (collage headline over the bowl card).
Rule: Headlines and notes on collage, and any type on a paper shell, sit on clear background with
nothing under them. Photo shells (bleed, sharpie, split) put type over the photo by design and carry
a scrim or halo for it; paper shells do not.
Why: "letters over the pic and isn't very readable. BAD."
Enforced by: doc.js `data-clear`: the collage headline and notes fail the render if their box
overlaps a card (render line prints `sits over cc-card (F-003)`).

### F-004 · 2026-10-22 · Every post has a reason, and the app is in it
Source: Travis, in session, on `o23-ig` (the SixSocks quote over an empty white kitchen: "just a
photo of cabinets. I thought we gated ugly posts?") and `p24-pin` (a text-thread sketch about a
pasta dinner: "not funny or insightful or relevant to the value prop of the app at all. Can you
tell me what the rationale of this post was?"). The honest rationale for both was the diversity
gate: the shell and the photo were picked to satisfy rotation rules, and the content followed.
Rule: A post is planned from its reason, then given a shell. Every render-batch post carries two
lines before it can be scheduled: `why`, the insight or joke in one sentence (what makes this worth
a stranger's second), and `app`, where a real capability enters (receipt import, add what you
have, a recipe with calories and protein, the Instacart hand-off, the cookbook). A post whose
`app` line cannot be written is not an iEatz post. A text thread is a product moment, not a bit:
the reply side shows what iEatz did, or the shell is wrong for the idea. A quote card's photo
shows food or cooking, never a bare room. Variety rules never pick the shell; when the right post
breaks rotation, the right post wins (a `fixed` hotfix is exempt from adjacency).
Why: "this is the kind of stuff we need to fix in the system so it doesn't keep happening."
Enforced by: copy-gate.js rule 7 (`why` and `app` required on batches from Oct 22 2026, `app`
must name a capability, thread replies must show the app); the rationale table the copy gate
prints is read at the QA gate (CONTROL_CENTER §6 item 9); `empty-scene` photo flag refused at
render; diversity-gate.js rule 1 skips hotfixed posts.

### F-005 · 2026-10-26 · Every headline is a problem, a promise or a surprise
Source: Travis, on `p26b-pin` ("Add the board, get the recipe" over a cutting board): "this doesn't
make sense or isn't clear enough. What's the point of this post? All our content should be hard
hitting, creative, curious, engaging and point towards the value prop or a problem we are solving."
Rule: The headline is the whole post for a stranger scrolling at speed. It states, in eight words
or fewer, a problem they have ("Nothing to make?"), a promise with a number ("Dinner in 15"), or a
surprise that makes them look twice ("This is a 12-minute dinner. You just can't see it yet."). It
never uses our own jargon or an instruction that only makes sense to us ("add the board", "name
them", "tell iEatz"): the how-to belongs in the sub-line and the caption, after the hook has done
its work. On Pinterest the title is a search phrase plus the payoff ("what to cook with eggs,
avocado, mushrooms and spinach in 12 minutes") and the description opens with the problem.
Why: a post that is clear only to the people who built the app reaches nobody else.
Enforced by: this file at the QA gate (CONTROL_CENTER §6 item 10) and the rationale review; the
copy gate flags a headline that opens with an instruction verb ("Add", "Tell", "Name", "Type",
"Snap") as a warning so the reviewer looks at it.

### F-006 · 2026-10-30 · Captions sell the app, never the recipe
Source: Travis, in session, on the Oct 30 queue (`o30-ig` pesto split: "Blitz it with the parmesan end,
olive oil, a squeeze of lemon and a clove of garlic; toss with linguine...").
Rule: A caption or pin description names the pain point and builds the want. It never walks through the
recipe: no ingredient lists with method, no "roast, toast, toss" steps, no temperatures or step timings.
Naming the dish, the time and the protein is fine; the recipe itself lives in the app. "The cilantro is
two days from the trash and you have no plan for it" is the post. "Blitz it with x, y, z, then toss with
linguine" is the app's job, given away to someone who is scrolling and will never cook from a caption.
Why: "the content and copy should be building their desire to download the app, not give them partial
value of the app itself. Build curiosity, entertain, make them smile. Push on the pain point and the
problem, don't provide a partial solution."
Enforced by: copy-gate.js rule 9 (three or more cooking-method verbs in a caption fail the batch from
Oct 30 2026; earlier batches warn), and this file at the QA gate. Recipe steps on a carousel slide or a
Pinterest steps card are a separate decision for the reboot doc; the caption rule applies everywhere now.

## Keep doing
_Things Travis called out as working._

## Superseded
_Rules replaced by a newer rule, kept with the date and the id that replaced them._
