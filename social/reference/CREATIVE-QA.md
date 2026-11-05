# Creative QA: the review every post gets before it is drafted

Rule F-019 in `feedback/RULES.md`. Written Nov 4 2026 from Travis: "take a screenshot of the
final post and think: does this make sense to a human who is scrolling on IG and passes by our
content? does it make them feel something and is the intention clearly communicated? could it be
interpreted incorrectly or partially? is there a more efficient way to communicate it while still
being engaging and creative, clever, or humorous?"

The automated gates check rules. They cannot tell whether a post is clear, so a person-shaped
review does that, every time, on the rendered image, never on the plan.

## Who is reviewing

**The Creative QA reviewer** is a 27-year-old scrolling Instagram on the couch at 9 PM, thumb
moving. They have never heard of iEatz. They give a post two seconds. They are not reading the
caption. They are bored and quick to judge, and they will only stop for something that makes them
feel something: a laugh, an "ugh, that's me," a "wait, how."

Write the review as that person would react, then as the editor who has to fix it.

## The steps

1. **Render the final post** (the PNG, or for a reel the cover plus frames at 0.0, 1.0, 2.0 s and
   the last second).
2. **Look at it twice:** once full size, once at feed size (Instagram about 390 px wide,
   Pinterest about 236 px wide; `node social/render/contact-sheet.js` makes the feed-size sheet).
   Open both images and look. Do not review from the copy in the ledger.
3. **Answer the six questions in writing** (below). One line each, honest.
4. **Verdict:** `pass` only if every answer is a clean yes. Anything else is `fix`: change the copy
   or the layout, re-render, and review again from step 1.
5. **Record it** in the ledger row as `qa`:
   ```json
   "qa": { "verdict": "pass", "rounds": 2,
           "read": "No pancake mix? Still pancakes. The app turned flour, eggs, milk into a stack.",
           "fixed": ["named iEatz as an app in a subheader", "stack was cropped in the bubble"] }
   ```
   `read` is what the scroller would say the post means, in their words. If `read` is not what
   the post is for, it is not a pass.
6. **Show the screenshot** in the Sunday review table next to the row, so Travis reviews the same
   image.

## The six questions

1. **Two seconds:** what does a stranger think this post is saying? Write it down. Is that the
   message? If they would get only half of it, it fails.
2. **Message first:** is the main message the biggest, first-read thing on the image? Nothing
   (a photo, a logo, a chip row) should win the eye before it. If it needs a subheader to land, add
   one directly under the headline.
3. **Feeling:** does it make the scroller feel one thing (relief, a laugh, "that's me," surprise)?
   Name the feeling. "Informed" is not a feeling.
4. **Misreading:** could it be read wrongly or partly? Who or what is "iEatz" to a stranger? Does
   any word, number or picture contradict another (a bun in the "forgot the buns" photo)? Does it
   imply the app does something it does not (F-001)?
5. **Shorter and sharper:** is there a more efficient way to say it that is still clever, funny or
   creative? Cut every word that does not earn its place. Try one alternative line before passing.
6. **Craft:** is every word readable at feed size; no word alone on a line and no number cut from
   its unit (F-018); the food looks good enough to want; the layout is not the same as the
   previous post on that channel (F-020)?

## Example (the Nov 4 pancake pin)

| Round | What it said | Reviewer's read | Problem | Fix |
|---|---|---|---|---|
| 1 | "No pancake mix in the house. *Pancakes anyway.*" | "some pancakes?" | iEatz's part is invisible | headline names iEatz |
| 2 | "No pancake mix? *iEatz said: pancakes.*" | "what is iEatz? who said?" | still unclear, still the same bottom-panel layout | new layout, the text thread |
| 3 | thread: "No pancake mix? Still pancakes." + bubbles | "pancakes from stuff in the kitchen, somebody's app" | iEatz not named as an app | subheader: "Told the iEatz app what we had. It wrote the recipe." |
| 4 | same, subheader on one line, full stack in the bubble | "an app turned flour, eggs and milk into pancakes, and the roommate is coming downstairs" | none | **pass** |
