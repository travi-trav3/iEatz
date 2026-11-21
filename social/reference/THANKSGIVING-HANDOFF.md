# Thanksgiving carts: handoff brief for the next session

Written Nov 20 2026, 20:00 PT, by the session that built Phase 1. Travis's verdict on that work:
photo selection and holiday copy were careless, several frames made no sense to a stranger, and the
gates let all of it through. Read this before touching anything. Everything below is in the repo on
branch `add-food-photography`; the hub page is on `main`.

## 1. What exists and what state it is in

| Thing | Where | State |
|---|---|---|
| Hub page | https://ieatzhealthy.com/thanksgiving/ (`thanksgiving/index.html` on `main`) | Live, 200, seven exact cart URLs, disclosure three times, "How it works" above the grid. Not reviewed by Travis line by line. |
| Render batch | `social/render/batches/nov-19-29-thanksgiving.json` | Holds every version ever cut (v1 to v5). Only the files named in the ledger are live. |
| Ledger | `social/manifest/nov-19-29-thanksgiving-batch.json` | 15 rows (P1, P1b, P2 to P10, I1 to I4). Every row has a Buffer id. `qa.fixed` on each row is the history of what Travis rejected. |
| Hosted frames | `assets/pinterest/nov19/`, `assets/social/nov19/` | Served from raw.githubusercontent on this branch. Never delete a file a Buffer post points at. |
| Photo library | `assets/photos/thanksgiving/` (14 Unsplash shots Travis supplied, plus 3 crops) | Indexed in `assets/photos/photos.json` as `source: stock`. The batch declares `photoPool`. |
| Rules | `social/feedback/RULES.md` F-022 (new), LOG.md entry for Nov 19 | Read F-022 first. |
| Buffer | org Applied Intelligence Co., Pinterest `6a7a4b64b2d9d577435279f6`, Instagram `6a14b495c687a22dd4267bfc` | 13 drafts, 1 scheduled (I2, Sat 11:00), 2 sent by hand (P2 Pinterest, I3 Instagram, both Nov 19 ~17:00). Travis has NOT said go. |

Published so far: P2 (Pinterest, the plated dinner punchline) and I3 (Instagram, the cream send-this
casserole). Travis published both himself and had go-live pings posted in #social.

## 2. What went wrong, in Travis's words, in order

1. "its white and hard to read" (headline over a bright photo).
2. "the text thread shouldnt be just buying finished dishes. it should be the ingredients PLUS the
   step by step recipes on how to make it, all delivered to your door. the entire thanksgiving set
   needs to have that vibe."
3. "pick the dinner you want out of the 7; the instacart already has every ingredient you'll need to
   make a homemade thanksgiving dinner, delivered to your door without shopping or knowing what to
   cook; then ieatz can tell you how to cook each dish step-by-step." This is THE message. Every frame
   carries it now.
4. "it needs to be straightforward and easy to grasp the value the instacart basket is providing: all
   the ingredients, for all the classic recipes."
5. "white text over white bowl is bad. why are you using the same photos all the time? you can still
   use all the existing images in the repo."
6. "use some humor too, especially with the thankful image. thanksgivings usually aren't perfect: the
   uncle talking about politics, staying under your parents' roof, family dynamics, stress, cooking all
   day, too much wine. not ALL of them humor though."
7. "'wait that's the whole thing?' is an obvious AI copywriter tell." Replaced with "ok so i'm just
   bringing wine".
8. "there should be images on some of the carousels." I1 now has a photo on every slide.
9. "how is it 'less money'? it's the same grocery store price." Money claim removed everywhere.
10. "this red circle doesn't make sense. it mentions turkey breast but says nobody roasted a bird. you
    are missing a bridge." (I2: circle on a cheese wedge, "nobody roasted a bird", card selling a
    turkey breast.) Rebuilt as board = pregame, card = the dinner part.
11. "the whole dinner is a couple of bananas??? furthest thing from thanksgiving." (P10: circle on
    bananas in a grocery bag labelled "the whole dinner".) Rebuilt on the pie table with the pie circled.
12. The THANKFUL frame had three unrelated gags (the store, the uncle, the butter). Now one line.

The pattern behind all of it: frames were assembled from parts (a shell, a photo from a pool, a
headline from the mechanic, a marker joke) without anyone asking what a stranger sees in two seconds.
The gates measured nouns and layouts, not sense.

## 3. What was patched in the system (verify these, do not trust them)

- `social/render/copy-gate.js` rule 5b: any `label` or `marks[].label` on a punchline/sharpie unit
  requires `markClaim` (literally what the mark surrounds) and `markClaim` must share a noun with
  `photoClaim`. This would have failed the banana pin. It will not catch a mark that is true but
  pointless.
- `social/render/diversity-gate.js`: a batch-level `photoPool` (path prefixes); any photo outside it
  fails. Also `stockOk` on a ledger row downgrades the own-first failure to a warning, with the reason.
- `social/render/ledger.js` exposes `stockOk`.
- `social/render/templates.js`: poster shell accepts `headSize`.
- `social/render/base.css`: on-photo thread scrim is much darker at the top.
- `copy-allowlist.txt`: Friendsgiving, Southern, Thanksgiving.
- RULES.md F-022 (mark referents, photo pools, one frame one story, the two-second read, humor on a
  true observation only).

Not patched, and worth doing: nothing checks that headline + marker label + card tell one story. That
is a judgment call and should stay one, but the Creative QA `read` field has to be written honestly as
what a stranger sees, not as what the author meant. The `read` lines on the bad frames were fiction.

## 4. What to do, in order

1. Open every one of the 15 live frames at full size (the `file` path on each ledger row) and do the
   two-second read for each. Write down what you actually see before reading the ledger's `read`. Any
   frame where the photo, the headline, the marker and the card are not one idea gets re-cut. Expect
   to re-cut some. The ones Travis has not yet seen since their last change: P1 v4, P1b, P3, P5, P6 v3,
   P7, P8, P9, P10 v3, I1 v4 (slides 3 to 10), I2 v5, I4 v4.
2. Check the humor rule against the set: P1/P1b (group chat, bringing wine), P3 (dry casserole), P4
   (nobody will notice), P9 (mom's review), I1 caption (the uncle), I2 (board is the pregame), I4
   (thankful the shopping is done, the uncle in the caption). P2, P5, P6, P7, P8, P10 are straight.
   If a joke is not a true observation about Thanksgiving, cut it.
3. The claim "iEatz walks you through each dish step by step" is on every frame. It is true of the
   product in general. Nobody has yet put cart B1's ingredients into iEatz and watched the output.
   Travis was asked to screen-record that during the cart check. Until it exists, do not strengthen the
   claim further.
4. On Travis's "go": `edit_post` with `saveToDraft:false, mode:"customScheduled", dueAt` per row. P1,
   P1b and I1 have passed their original slots; propose new ones (Sat/Sun are open on Pinterest at
   12:10 and 18:10 only for P5/P6/P7; Instagram has I2 Sat 11:00). Re-pull the Pinterest board id once
   `Thanksgiving dinner menu and grocery list ideas` exists and move every cart pin onto it; the
   fallback board id is `1011339728762228750`.
5. Phase 2 (Fri Nov 27 to Sun Nov 29): six pins L1 to L6 to the Pantry board linking to the landing
   page through OneLink, I5 reel from Travis's Friday shoot, I6 carousel of four real iEatz outputs.
   Leftover ingredients only, never leftover dishes. Table due Thu Nov 26. Scorecard Mon Nov 30.
6. Slack: nothing posts in #social under Travis's name except the go-live pings he asks for by name.
   Status and review tables go to his DM `U0B25658MC0` or stay in the session.

## 5. Hard rules in force

F-001 (the app does not read food photos), F-004 (why and app on every post), F-005 (headline is a
problem, promise or surprise, eight words or fewer), F-006 (captions sell the app, never the recipe),
F-007 (text-message voice), F-010 (everything into Buffer as a draft the moment it is cut), F-011 (no
#social posts under Travis's name), F-015 (first comment on every IG post), F-018 (no orphans), F-019
(Creative QA on the screenshot), F-020 (layout variety), F-021 (whole sentences), F-022 (above). Brief
rules: exact cart URLs, no prices, disclosure on every cart pin, B6 vegetarian not vegan, no em dashes,
sentence case, no "not X, it's Y". Commit trailers: Co-Authored-By and Claude-Session lines as in the
git log.

## 6. Nov 20 audit (20:00 to 21:30 PT, the session after the one above)

Every live frame was opened and read cold. Re-cut and now live in the ledger: I2 v6, I4 v5, I1 v5,
P1b v5, P3 v4 (photo shell), P4 v5 (steps shell, Travis's own plate), P5 v4 (bleed, mac only), P7 v4,
P9 v4 (texts only), P10 v4. Unchanged: P1 v4, P2 and I3 (sent), P8 v3. Each row's last `qa.fixed`
line says what was wrong.

Still open:
- P6 and I1 slide 8 (vegetarian) show a pan of roasted sweet potatoes under "stuffed butternut
  squash". Nothing in the library is a stuffed squash. I1 is `qa.verdict: hold` and fails the set
  gate on purpose. Needs one photo from Travis; do not ship either until it lands.
- P1 and P1b are the same headline and the same thread. Recommendation: drop P1b.
- P2 (already published) has the tape covering "Thanks" in its tag. Fixed in base.css for every
  later render; the live pin is as it is.
- Template changes this session: `photo` and `igphoto` take `objPos`; `.pl-tag` sits above
  `.pl-tape`; `bleed` is allowed as a carousel cover (doc.js).
- Buffer state at 20:45 PT Nov 20: the nine draft pins and I4 carry the new frames. I1 and I2 are
  SCHEDULED (I1 Sat 08:15 PT, set at 20:35 PT by someone other than this session; I2 Sat 11:00 PT)
  and still carry the old frames (I1 v4, I2 v5): the ledger is ahead of Buffer on those two rows
  until Travis says to swap. P1b shows a failed publish attempt at 20:37 PT (Buffer "unknown
  error"); this session's image edit at 20:41 saved it back as a draft. P3's Buffer time is now
  Sat 12:10 PT, the same slot as P5.
