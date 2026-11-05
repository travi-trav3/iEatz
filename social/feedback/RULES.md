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
4. Sound on. Every reel has music, under the voice when there is one (F-012). Silence is a bug.
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
goes last, never in the opening; the gate checks it is the last line.
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
**What the gates added:** own photos first from 2026-11-15, the library as the fallback, never a thin week for lack of a photo (F-008); no reel without
2 or 3 sound picks in its ledger row (F-012); no hook-variant reels (F-013); a hook type on every post (F-007).

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
and the allergen line fail on batches created from 2026-10-30, warn before); banned-phrases.txt
(F-007 block); the rationale table at the QA gate.

### F-008 · 2026-10-30 · Own photos first, the library second, never a thin week for lack of a photo
Source: the reboot doc ("Stock photos stop on 15 November"), then Travis, in session, Oct 30: "we
can't solely rely on the team-provided photography. If that is empty or they have all been used
recently, then we need to use the existing library; there are 26 photographs there that have not
been used even once."
Rule: Photos are picked in this order, and `node social/render/photo-usage.js` prints the supply
in exactly this order every Monday: (1) our own photos (`source: "own"` in photos.json, from the
Drive inbox, unflagged, not used in the last 30 days); (2) library photos never used in any
ledger; (3) library photos rested 60 days or more; (4) nothing else, except a hotfix. From
Nov 15 a stock photo on a post is a gate failure only while an own photo is free; when the inbox
is empty or the own photos were all used this month, the library is the plan, not an excuse for
a thin week. A photo used in the last 30 days warns (rest it). Flagged photos (`low-res`,
`empty-scene`, `no-consent`) are never used. A logo or a product label in frame is fine (Travis,
Oct 30: "it's okay if there is a logo"; real kitchens have brands), so the `brand-in-frame` flag
is retired and the brands are kept in the photo's `note`. The one thing still worth a look by
hand: a third-party app on a screen in the shot, which can read as ours. The week of Nov 2 uses
8 never-used photos; on Nov 9 the supply is 12 never-used (the whole fridge category is back)
and 11 rested, plus whatever the team shoots.
Why: the inputs are the ceiling. A rule that strands the feed when the inbox is empty makes the
team's upload rate the posting rate, and 173 reach a month cannot afford dark weeks.
Enforced by: diversity-gate.js rule 6 (own-first failure from 2026-11-15; 30-day reuse warning);
photo-usage.js for the Monday plan; photos.json `source`, `flag`, `description`.

### F-010 · 2026-11-02 · Everything goes into Buffer as a draft the moment it is cut
Source: Travis, in session, Nov 2 ("you should always put them in buffer as drafts at least so i can
view and leave feedback there or bring it here directly to you").
Rule: Every post that is rendered or cut is created in Buffer as a draft in its planned slot the
same day (`saveToDraft: true`, `mode: customScheduled`, `dueAt` set), and its `bufferId` and
`status: draft` go in the ledger. Scheduling still waits for Travis's go: on the go the drafts are
converted in place, never re-created. Reels are the exception (F-012): Travis schedules them
himself in Buffer's editor when he adds the music, and the session does not edit a reel through
the API after that. Before any recut or scheduling, read the notes on each draft
(Buffer `get_post` returns them) and anything Travis says in session; that is the feedback channel.
Why: Travis reviews in Buffer, where the post looks the way it will publish; a link in Slack or a
frame in the repo is not a review.
Enforced by: the batch routine (drafts on render) and the scheduled checks (read draft notes first).

### F-011 · 2026-11-02 · No Slack message to anyone else under Travis's name
Source: Travis, in session, Nov 2 ("you are replying as you, but under my slack profile/name/photo.
can we create a profile/username for you").
Rule: The Slack connector posts as Travis. Until a separate bot identity exists (a Slack app with
its own bot token, set up by Travis), nothing is posted in #social or any shared channel, and no
one else is replied to. Reminders meant for Travis (reels waiting on music, go-checks) go
to his own DM with himself (channel id U0B25658MC0), which only he sees. Status and questions come
to the session. Reading #social is fine.
Why: messages to the founder and the team read as Travis's own words.
Enforced by: every routine that would post to Slack checks this rule first.

### F-012 · 2026-11-04 · Every reel gets music: Claude picks, Travis adds
Source: Travis, in session, Nov 4 ("update SOPs to include adding a thoughtful sound that is trending
or appropriate/clever for the visual clip to all reels"), after the Nov 3 audit measured the three
drafted reels silent from second 4 (-46.9 dBFS) and found `track: "buffer"` passing the gate with
no music in the file.
Rule: Every reel gets music, ducked under the voice when there is one. Buffer's editor now has a
Music picker for Instagram reels, but the Buffer API has no music field (checked Nov 4 against
`create_post`, `edit_post` and `get_post`), so the work splits:
- **Claude picks.** At planning time every reel's ledger row carries `sound`: 2 or 3 `picks`
  (title, artist, why it fits this clip, and `source`: `virlo-niche`, `virlo-platform` or `fit`),
  2 or 3 `search` terms to type into Buffer's picker if none of the picks is there, and a `cue`
  (where the beat or drop should land on the cut). At least one pick is chosen for fit: a mood,
  tempo or lyric that is clever against the picture. A trend-backed pick is welcome when there is
  data behind it, but not required: the Nov 4 Virlo read found sound trends barely move this niche
  (F-016), and the Virlo trial ends Nov 11. Picks from memory are `source: "fit"` and never called
  trending.
- **Claude flags it on the draft.** The Buffer draft carries the `needs music` tag (created once by
  Travis; its id is in `reference/REEL-SOUND.md`) and a block at the top of its caption, never in
  the ledger `text`: `🎵 PICK ONE IN MUSIC, THEN DELETE THIS BLOCK` followed by the picks and the
  search terms.
- **Travis adds and schedules.** In Buffer's editor he picks the track, deletes the block, removes
  the tag and presses Schedule. That is the go for a reel. The session does not edit the post
  through the API afterwards: an API edit re-sends the whole post and has not been tested to keep
  a track added in the editor. A recut goes back to Travis for the music.
- **No gate on the music itself** (Travis's call, Nov 4): nothing can read the track back, so the
  ledger trusts it. The gate checks only that Claude did its part.
Business accounts only get commercially cleared audio, so a sound trending in the Instagram app
may be missing from Buffer's picker. That is why every reel also carries search terms and a fit
pick. Baking a Meta Sound Collection bed into the file (`render-motion.js`, `assets/audio/`) stays
as the fallback for a reel that must auto-publish without Travis.
Why: "Sound on" was a rule the pipeline could not keep. The reel is half sound, and a picked track
is the cheapest lift to watch time there is.
Enforced by: diversity-gate.js rule 7 (a reel due from 2026-11-09 fails without `sound.picks` of 2
or 3, each with a `why`, and at least one `sound.search` term; earlier reels still accept `track`);
`reference/REEL-SOUND.md` for the procedure.

### F-013 · 2026-11-04 · No Trial Reels, no hook-variant cuts
Source: Travis, in session, Nov 4 ("looks like you missed something important - we cant run trial
reels"). Instagram's Help Center lists Trial Reels for public professional accounts with at least
200 followers (1,000 for personal accounts); @ieatzhealthy is below that.
Rule: Reels publish as normal reels. One cut per clip, one hook per reel; three cuts of one clip
(`variantOf`) are retired, because without Trial Reels every variant goes to followers too, and the
Oct 29 second cut of one clip earned 30 reach against the first's 127. The hook test becomes week
over week: every reel keeps its `hook` type in the ledger, and the Monday read compares reels of
different hooks across weeks. When the account passes 200 followers, check the toggle in Buffer and
propose Trial Reels again as a new rule; until then the toggle is not a step.
Why: the three-variant plan rested on followers never seeing the variants. They would have.
Enforced by: diversity-gate.js rule 7b (a reel due from 2026-11-09 with `variantOf` fails); the
follower count in the Monday read.

### F-014 · 2026-11-04 · Sunday: draft the week two weeks out
Source: Travis, in session, Nov 4 ("we will have to run this as a routine where content is added 2
weeks ahead, every Sunday. I then review it and give feedback").
Rule: Every Sunday the routine plans, cuts and drafts the week that starts 15 days later (Sunday
Nov 8 drafts Mon Nov 23 to Sun Nov 29), so Travis always has two weeks of drafts in Buffer and
reviews one new week at a time. In order: read draft notes and session feedback (F-010); if a trend source
is available (Virlo until Nov 11, or Travis's weekly scout in the Reels app), read it (F-012); plan from the footage and photos in the inbox; render, gate,
host; create every post as a draft in its slot, reels with the `needs music` tag and the sound
block; post the review table in the session (F-011: not Slack), one row per post with why, app,
hook, the headline read aloud and, for reels, the three picks. Travis gives feedback during the
week; pins and statics convert on his go (F-010), reels on his own Schedule press (F-012).
Footage for a week has to be in the inbox by the Sunday that drafts it.
Two weeks of drafts is about 6 Instagram and 14 Pinterest posts in Buffer at once. Travis moved
Buffer from Free to Essentials on Nov 4 (`get_account` limits: 5,000 scheduled posts, 250 tags), so
the old 10-per-channel cap no longer binds, and first comments are available again (F-015).
Why: Travis reviews in one sitting with time to fix things, instead of a go-check racing the slot.
Enforced by: the Sunday scheduled routine and this file.

### F-015 · 2026-11-04 · A first comment on every Instagram post
Source: Travis, in session, Nov 4 ("first comment needs to be back on and a standard SOP"), after
the move to Buffer Essentials. Nov 4 test: `edit_post` with `metadata.instagram.firstComment` on a
retired draft saved it and read it back; the test comment was removed the same minute.
Rule: Every Instagram post (reel, static, carousel, send-this) carries a first comment, written at
planning time into the ledger's `firstComment` and sent in the same `create_post` call that makes
the draft. It is never added later with `edit_post` on a reel (F-012: no API edits after the
music). The comment:
- **is a reply, not more caption.** The brand reacting to the one specific thing the viewer just
  saw: a detail in the frame, the number in the headline, the obvious objection ("no, it does not
  mean eggs five nights in a row"). If it would read naturally pasted onto the end of the caption,
  rewrite it (the portable rule in `skills/social-content-pipeline/SKILL.md`).
- **can ask one real question** when it fits (the saddest thing in your fridge, your last receipt
  total). Never "comment YES" bait.
- **is short and in the voice:** one line, 20 words at most, lowercase is fine, no hashtags, no
  link, no repeat of the value prop.
- **obeys the truth rules:** F-001, F-002 and F-006 apply. The copy gate already reads
  `firstComment`.
- **never says COOKBOOK** on a comment-COOKBOOK post. ManyChat fires on comments with the word,
  and whether it ignores the account's own comment is untested, so the brand's comment never
  says it.
Pinterest has no first comment.
Check after the first publish: open the first Instagram post that goes out with a first comment
and confirm the comment is under it, then log it. Buffer saving the field is not proof that
Instagram gets it.
Why: the account is too small for comments to start on their own; a first comment gives a viewer
something to answer, and Essentials makes it schedulable.
Enforced by: diversity-gate.js rule 10 (an Instagram post due from 2026-11-09 fails with no
`firstComment`, with more than 20 words, with a hashtag or a link, or, on a cookbook-dm post, with
the word COOKBOOK); the copy gate for the words.

### F-016 · 2026-11-04 · What the Nov 4 Virlo read changes about reels, within what we can make
Source: the Virlo audit of Travis's "Healthy Meal Recipes" research agent, Nov 4
(`reference/VIRLO-AUDIT-2026-11.md`: 316 videos, 61% TikTok, 19 scored Reels, first cycle), and
Travis, same day: "we won't have a lot of voice-over content. we are doing programmatic via claude
to create reels bc we don't have an in-house content creator ... stick with what we are capable
of doing ... work in some voice over content occasionally."
The constraint comes first: reels are cut by Claude from the team's phone clips and photos, with
on-screen text, the clip's own sound and a music track. Nobody is on camera and voiceover is the
exception. Research is used where it fits that; a format that needs a creator is not copied.
Rule:
- **The default reel is faceless:** real footage, the on-screen line, the clip's own sound
  (sizzle, crunch, the cart) and the F-012 track under it. That makes the music pick matter more,
  not less. A voiceover is a bonus when Travis or the team records one (a 3 to 6 s phone memo,
  `assets/audio/README.md`); plan for one or two a month, never as the assumption.
- **Length follows the footage and the job.** Most reels are short teasers, under 20 s: one dish,
  one rescue, one receipt. Go longer (30 to 60 s) only when there is enough real footage to carry
  it, typically a fridge rescue with a before, the cooking and the plate, or a story that ends on
  the app. Never pad a short clip set to reach a length.
- **The first frame shows the outcome or states the problem** (voice rule 2): the finished dish,
  or the problem in on-screen text over food. The app comes late, as proof, never as the opener.
- **No "I've been doing X for years and just found this" hook.** It is 10 of the 25 winning
  outliers in the niche, mostly paid placements for funded competitors (Potto, Osta and others).
  Copying it makes iEatz read as one more ad. Use the problem, the outcome or the fridge.
- **Lead with the open angle.** Competitors crowd "AI meal planner" (47.4M views). "Rescue what's
  already in your fridge" is smaller (9.9M) but has the best share rates in the read and almost no
  app owns it. It also suits faceless footage: the sad drawer, the pan, the plate.
- **Benchmark on shares and engagement, not views.** The niche's leaderboard is inflated by paid
  placements (6 of 25) and boosted posts (engagement under 1%). The Monday read compares iEatz
  with itself on shares, saves and engagement rate.
Why: the first real data on the niche, read against what a two-person team with an AI editor can
produce every week.
Enforced by: this file at planning and in the review table; F-012's gate for the music.

### F-017 · 2026-11-05 · The default reel: dish first, hands, loop
Source: Virlo audit 2 (`reference/VIRLO-AUDIT-2-2026-11.md`): the 9 scored faceless food Reels in
Travis's research agent, frame by frame. Small sample, 5 of the 9 from one competitor account, so
this is how the few winners are built, not proof. The best match to our pipeline is @hangrywife's
9-second beer cheese dip (Virality 43, 2.4K followers): a finished dish, one title card, hands
only, a cut about every second, a track, back to the dish.
Rule: unless the batch has a reason to do otherwise, a reel is cut to this spec.
- **0 to 2 s: the finished dish with a hand doing something to it** (a fork in, a dip, a lift, a
  pull). 7 of the 9 open this way. On it, a title card naming the dish and its time, "12 minute
  fridge fried rice", on for 2 to 3 s. It is a promise with a number (F-005), eight words or fewer.
- **Text style:** small, centered, sentence case or lowercase, no background box (what the
  winners use), with a soft shadow or outline so it reads over any footage; contrast still
  decides (voice rule, F-003). Usually one title card and nothing else; at most one more line, for
  the turn.
- **Then the process, hands only, from the fridge, the drawer or the receipt:** a new shot about
  every second. No shot is held longer than 2 s except the money shot at the end. (The Nov 3
  drafts held one plate for 5.5 s.)
- **Optional, the last 3 to 6 s: a real iEatz screen recording** of the step that made the dish
  (receipt import, or what you have turned into the recipe with protein estimated). Real screens
  only, nothing the app does not do (F-001). The recipe-then-app Reels had the highest repost
  counts in the set. This needs Travis's screen recordings to reach the editor, which the Drive
  connector's ~6.3 MB limit blocked in November.
- **End on the finished dish** so the loop restarts cleanly.
- **Length:** 8 to 20 s for this spec. Longer only when the footage carries it (F-016).
- **Cover:** the frame at `thumbnailOffset` shows the dish with its name on it. The cover can say
  something different from the first-frame card.
- **Audio:** the F-012 track; keep the clip's own sizzle low under it where it adds something.
- **Caption:** the thought first (F-006), the app line, hashtags. The first comment follows F-015.
What this spec does not settle (Travis's calls, listed in the audit file): an AI voiceover test,
a comment-RECIPE DM, a series label, ingredient lists in the caption.
Why: the one place the research describes a reel we can make every week with no one on camera.
Enforced by: this file at the cut and the review template; the shot list in `UPLOAD-INBOX.md`.

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
- 2026-10-30 · `brand-in-frame` photo flag (refused at render since Oct 22; 15 photos, the whole
  fridge category among them) → retired by Travis ("it's okay if there is a logo, slightly blur
  it or just remove that gate altogether"). Removed rather than blurred: a blur needs hand-placed
  coordinates per photo and reads as doctored; a jar with a label reads as a real fridge. The
  brands stay in each photo's `note`.
- 2026-11-04 · F-009 (Sound on, three hooks, trial reels; `track: "buffer"` on the ledger) →
  F-012 (music on every reel, Claude picks 2 or 3 tracks, Travis adds them in Buffer's editor and
  schedules the reel), F-013 (no Trial Reels below 200 followers, no hook-variant cuts) and F-014
  (the Sunday routine, two weeks out). `reference/TRIAL-REELS.md` is kept for the history only.
  The retired text:
  > ### F-009 · 2026-10-30 · Sound on, three hooks, trial reels
  > Source: the reboot doc and social/reference/TRIAL-REELS.md, approved by Travis Oct 30.
  > Rule: Every reel ships as a Trial Reel with a track. Music and the Trial Reel toggle are set by
  > Travis in Buffer's editor (neither is in the API), so the ledger names the track (`track:
  > "buffer"`, or the Sound Collection id of a bed baked in by render-motion.js) and the Slack alert
  > for the reel names the two manual steps. Every clip is cut three ways with a different first line
  > (a problem, a promise with a number, a surprise), one per day at 17:15 PT; the three variants
  > share `variantOf` in the ledger so the dedupe and hero rules read them as one post. Pins go out
  > at 12:10 PT. The 72-hour read (non-follower views, watch time, shares, graduated or not) picks
  > next week's hook pattern; losers retire.
  > Why: "Reels are muted by default in the algorithm's eyes"; "173 reach a month means the
  > audience cannot vote", so every reel is a test against strangers.
  > Enforced by: diversity-gate.js rule 7 (a reel due from 2026-11-02 with no `track` fails);
  > TRIAL-REELS.md and the Slack alert template for the manual steps; this file for the cut.
