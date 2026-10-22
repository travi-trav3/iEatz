# Feedback log

One entry per note or idea, newest last. Format:
`- 2026-10-12 · note <id> · <channel> <post file> · "<quote>" → <outcome>: <what changed>`

## 2026-10-05
- Loop set up. No notes in Buffer yet.

## 2026-10-05 (batch start + 16:50 routine)
- Batch-start review for oct-5-11 (checked again at 21:55 PT, after the first Monday routine fired): all 197 iEatz posts (both query pages) have no notes, and no idea is titled "Feedback". Nothing to apply.

## 2026-10-12 (routine)
- Weekly review: 198 posts, 33 ideas, no notes, nothing titled Feedback. Nothing to apply.


## 2026-10-16 (caption baseline)
- First run of caption-edit detection: 22 queued iEatz posts in the 45-day window, all byte-identical to their ledger text, so the baseline holds no overrides. Every post in the window is still in Buffer (no deletions). No notes, no Feedback ideas.

## 2026-10-17
- 2026-10-17 · in session (not a Buffer note) · instagram o16-ig reel, sent Oct 16 20:10 PT, and pinterest p23-pin, scheduled Oct 23 · "it says you can 'point the camera at the fridge' and 'iEatz reads what's in the fridge/counter'. FALSE, that's not the state of the product and I've already communicated that" → rule+fix: F-001 written; 13 phrase patterns added to banned-phrases.txt; CONTROL_CENTER §3 hard constraint 7; p23 re-rendered and re-scheduled without the claim; o16 is already published and cannot be edited through Buffer: it needs deleting on Instagram by hand (ledger status `retracted`). Queue audit: no other scheduled post carries the claim. Published history: aug-18-31 "iEatz reads the stragglers" (Aug 22) is the only earlier near-miss.
- 2026-10-17 · in session · pinterest p17-pin (Sat 10:50) · "it says quesadilla but is circled on eggs WTF?? plus it's already on a board which means the human already has an intention" → rule+fix: F-002; the sharpie pin replaced with a thread (p17-pin-thread.png) before it published; the same board was the cover of o24-ig (Oct 24) and was replaced with a typographic poster cover (o24-ig-carousel-v2).
- 2026-10-17 · in session · instagram o17-ig (Sat 09:25) · "letters over the pic and isn't very readable. BAD. change to Shelf stable ingredients, fresh dinner in 30" → rule+fix: F-003; headline changed to Travis's line, cards moved up so the type sits on clean paper, re-hosted as o17-ig-collage-v2.png; Buffer's edit flipped the post to a draft nine minutes before its slot, re-scheduled for 09:40 PT. `data-clear` added to doc.js so an overlap fails the render.

- 2026-10-17 · in session · instagram o21-ig (new, Wed Oct 21 18:45 PT) · the retracted o16 reel left the Oct 17–23 window without a reel → added a pesto salmon reel (food/power-bowl-veg.jpg, the photo shows exactly that dish; copy says "add the four to iEatz", inside F-001). Buffer 6ad3a42f0b0d72757ae71b3f, alert Dr0CA42EBY73. Gate note: the cookbook-dm window rule now applies to ledgers only, so the v2-smoke fixture passes again.

## 2026-10-19 (routine)
- Weekly review: 59 posts in the window, 33 ideas, no notes, nothing titled Feedback. Two caption diffs were Claude's own Oct 17 COOKBOOK edits on o18-ig and o24-ig (set-text had not been run); ledger text synced, no Travis edits. Found in passing: o18-ig (Sun Oct 18 17:05 PT) is in `error`: "Buffer has lost authorization to post on your behalf", the Instagram channel is disconnected, so every Instagram post fails until Travis reconnects it in Buffer. Pinterest unaffected. Reported in Slack.

## 2026-10-22 (queue repair after the Instagram reconnect)
- Instagram reconnected in Buffer around 11:50 PT. Buffer then published the three held posts at once (o18 soup carousel, o20 device, st02 send-this), left st01 (Thu 11:00) in error and re-slotted the o21 reel to Fri Oct 23 07:00. Moves: st01 to Thu Oct 29 11:00 PT (the slot st02 vacated); o23 from Fri 07:50 to Fri 17:30 so it is not stacked on the reel. New alerts scheduled for o21, o23 and st01. Lesson for the plan: a disconnected channel is invisible until a post fails; the Monday routine should check `isDisconnected` on both channels first.

## 2026-10-22 (overhaul round one and the Oct 26 to Nov 1 batch)
- Travis: "the content is getting a bit uglier and isn't using the depth of the templates"; plan written and awaiting his approval (scratchpad plan-social-overhaul.md); started on the fixes that need no approval. Round one shipped: steps shell, carousel interior rule, poster fit bug and underline wrap, poster and thread recomposed, one badge home per surface, flagged photos refused, channel health step in the Monday routine. Oct 26 to Nov 1 batch planned, rendered, QA'd by eye, hosted and scheduled: 5 Instagram (board reel, three-dinner carousel with steps interiors, COOKBOOK receipt reel Wed, herbs-to-pesto split, Sunday thread) plus st01 Thu, and 10 pins (two a weekday, one to the cookbook with the password in the URL). Photo pass: 14 photos now flagged brand-in-frame; the fridge category is unusable until clean shelves are shot. Drive inbox created for photos, clips, screens, audio and the design system export.
- 2026-10-22 · in session · instagram o23-ig (Fri Oct 23 17:30) · "this isn't good. just a photo of cabinets really. I thought we gated ugly posts?" → rule+fix: F-004; the empty-kitchen photo replaced with a cook chopping mushrooms at the board (v3), quote scrim lightened so the photo reads, caption rewritten to match; kitchen-wide flagged empty-scene. Buffer updated.
- 2026-10-22 · in session · pinterest p24-pin (Sat Oct 24 09:15) · "not funny or insightful or relevant to the value prop of the app at all. What was the rationale?" → rule+fix: F-004; rationale was a shell picked for rotation after a near-duplicate retarget; replaced with the recipe as three steps and a readout, title and link to the lentil pasta anchor. Buffer updated. The same pattern was in two posts scheduled today (p27b thread, o01 thread): replaced with a steps list and a poster before publishing. Copy gate now requires `why` and `app` on every post.
