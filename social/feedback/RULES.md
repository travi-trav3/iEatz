# Operator rules from feedback

Read this before planning, writing, rendering or scheduling a batch. Every rule came from
Travis's notes in Buffer or in session (see `README.md`). Each one says how it is enforced; a
rule enforced by a gate fails the batch, and a rule enforced by this file is checked by hand at
the QA gate and in the rationale table.

Format:
```
### F-001 · 2026-10-12 · <short name>
Source: note <id> on <channel> post <bufferId> (<ledger file>)
Rule: <the instruction>
Why: <Travis's reason, quoted or paraphrased>
Enforced by: copy gate (banned-phrases.txt) | copy-gate.js | diversity-gate.js | templates.js | this file
```

## The voice (reboot, 2026-10-30)

From the approved reboot doc (iEatz Social Reboot, Oct 30 2026). This section outranks the
brand voice in CONTROL_CENTER §2, which is superseded.

iEatz on Instagram and Pinterest is a 27 year old who refuses to go to the store, cooks whatever
is in the fridge, films it on a phone, and is a little too proud of the result. Not a wellness
brand. Not a recipe magazine. A person with a point of view and a trick.

1. Real kitchen, real phone, real mess. Nothing styled. A sticky counter beats a stock flatlay.
2. Food in the first second. If the opening frame is not something you want to eat or a problem
   you recognize, cut it.
3. One idea per post. The idea is a feeling (relief, smugness, panic at 6 PM), not a feature.
4. Sound on. Every reel has a track or a voice. Silence is a bug.
5. People in frame. Hands, faces, reactions, a bite. The app appears as proof, late, never as
   the hero.
6. Write like a text message, not a brand. Lowercase is fine. Fragments are fine. Mild swearing
   is fine. Hashtag walls are not.
7. Be honest to the product. iEatz does not read photos of food (F-001). It reads a receipt,
   takes what you type, writes the recipe, counts the protein, sends the rest to Instacart.
   Everything else is the person.

**Headline:** a problem, a promise with a number, or a surprise. Eight words or fewer (F-005).
**Caption:** the first line is the thought, never the recipe. Naming the dish, the time and the
protein is the most it gives away; the method stays in the app (F-006). One sentence about what
iEatz did, in plain words. Five hashtags at most, all ones people search. "Verify for allergens"
goes last, never in the first three lines.
**Words we stop using:** fridge-first, editorial, wellness, nourish, elevate, hack, unlock,
journey, delicious. If the word would not survive a group chat, it does not ship.
**The read-aloud test:** every headline goes in the rationale table as it would be said to a
friend. If Travis would not say it out loud, it does not ship.

Before and after, from the doc:

| Before (what shipped) | After (what ships from now) |
|---|---|
| Roasted tomato ricotta toast. Dinner, 20 minutes. | this is what dinner looks like when you refuse to go to the store |
| Add the board, get the recipe. | nothing to make? wrong. 8 random things on a board are a 12 minute dinner, you just can't see it yet |
| One roast chicken, four dinners. | bought one rotisserie chicken on sunday. ate like a different person every night. here's how |
| The herbs went in before they went off. | the cilantro was 2 days from the trash. it's pesto now. 15 min, 17 g protein, zero guilt |
| Walking the aisle with no plan, which is how it usually goes. | no list. no plan. just vibes and a cart. dinner got decided anyway |

"After" lines are captions and reel beats; the headline on the image is still eight words or
fewer, so a long "after" line splits into the headline (the hook) and the caption (the rest).

**What the gates keep:** truth about the product (F-001), annotations agree with the photo
(F-002), type never over a photo on paper shells (F-003), every post has a reason and the app
in it (F-004), every headline is a problem, a promise or a surprise (F-005), captions sell the
app (F-006).
**What the gates dropped (Nov 2026):** every rotation rule that picked the shell for the post:
adjacent template and surface, the template cap, pillar adjacency and the three-pillar floor,
the formulaic-CTA cap, the accent-tail and eyebrow ratios, the plated-photo cap, the
carousel-and-reel-per-week rule, the two-beat aphorism cap. They produced the sameness they
were meant to prevent. Shell choice comes from the post's job and the rationale table; the
unused-shells list stays as a reminder, not a rule.
**What the gates added:** no post from stock after 2026-11-15 (F-008); no reel without a track
(F-009); a hook type on every post (F-007).

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

### F-007 · 2026-10-30 · Write like a person, not a brand
Source: Travis, in session, Oct 30 ("we need to shake the social strategy up; the copy is not good,
the content is not strong. Youthful social-native brand, gen Z unpolished energy, relatable and
human"), approved as the reboot doc the same day.
Rule: The voice section above. In the batch: every post carries a hook type (`hookType` on the
render post, `hook` in the ledger: problem | promise | surprise) and the rationale table shows
why, app, hook and the headline read aloud, reviewed by Travis before anything is scheduled.
Captions carry five hashtags at most and never "verify for allergens" in the first three lines.
The stop-word list is banned.
Why: "reads like a brand posting to post; nothing a 26 year old would send a friend."
Enforced by: copy-gate.js rules 10 to 12 (headline over eight words, missing hook type, hashtags
and the allergen line fail on batches created from 2026-11-02, warn before); banned-phrases.txt
(F-007 block); the rationale table at the QA gate.

### F-008 · 2026-10-30 · No post from stock after 2026-11-15
Source: the reboot doc ("Stock photos stop on 15 November; after that a pin without our own photo
does not ship"), approved by Travis Oct 30.
Rule: From Nov 15 2026 no post may use a photo whose `source` in `assets/photos/photos.json` is
`stock` (every photo in the library on Oct 30 is stock). Our own photos arrive through the Drive
inbox, are indexed with `source: "own"`, an honest description, and a flag for any logo or a
face that did not consent; a flagged photo is never used. Footage reels (our own clips) and
`app-*.jpg` (real screens) are not stock. Posts with no photo (send-this, poster) are unaffected.
Why: "48 of 80 stock photos are used, one dinner photo is left": the library is the ceiling, and
recombining it is what "played out" looks like.
Enforced by: diversity-gate.js rule 6 (fails on dueAt on or after 2026-11-15); photos.json
`source`.

### F-009 · 2026-10-30 · Sound on, three hooks, trial reels
Source: the reboot doc and social/reference/TRIAL-REELS.md, approved by Travis Oct 30.
Rule: Every reel ships as a Trial Reel with a track. Music and the Trial Reel toggle are set by
Travis in Buffer's editor (neither is in the API), so the ledger names the track (`track:
"buffer"`, or the Sound Collection id of a bed baked in by render-motion.js) and the Slack alert
for the reel names the two manual steps. Every clip is cut three ways with a different first line
(a problem, a promise with a number, a surprise), one per day at 17:15 PT; the three variants
share `variantOf` in the ledger so the dedupe and hero rules read them as one post. Pins go out
at 12:10 PT. The 72-hour read (non-follower views, watch time, shares, graduated or not) picks
next week's hook pattern; losers retire.
Why: "Reels are muted by default in the algorithm's eyes"; "173 reach a month means the
audience cannot vote", so every reel is a test against strangers.
Enforced by: diversity-gate.js rule 7 (a reel due from 2026-11-02 with no `track` fails);
TRIAL-REELS.md and the Slack alert template for the manual steps; this file for the cut.

## Keep doing
_Things Travis called out as working._

## Superseded
_Rules replaced by a newer rule, kept with the date and the id that replaced them._

- 2026-10-30 · CONTROL_CENTER §2 voice ("sentence-case headlines, one green italic emphasis word
  per headline, editorial-wellness tone") → replaced by the voice section above (F-007).
  Sentence case stays as a gate (Title Case is still wrong); lowercase is fine; the green accent
  is a choice, not a rule.
- 2026-10-30 · diversity-gate.js rules 1, 2, 3, 6, 7, 9 and 10 (adjacency, template cap, pillar
  rules, formulaic CTA cap, accent-tail and eyebrow ratios, plated cap, carousel and reel per
  week) and copy-gate.js rule 3 (the two-beat aphorism cap) → dropped by the reboot (F-007).
  The feed is planned from footage and the rationale table, not from rotation.
- 2026-10-30 · CONTROL_CENTER §5 "rotate all 8 pillars, never two of the same back to back" →
  the five reboot pillars (Fridge to dinner, The receipt, Cook with me, Send this to, Comment
  COOKBOOK) with a cadence each, in the reboot doc; the `pillar` ledger field keeps the old names
  for the metrics history.
