# Brief: audit the iEatz social output and tell us how to fix it

Written Nov 3 2026 for an independent review session. You are not the system that made this work.
Judge it the way a strong social media manager would judge an agency's output, then tell us what you
would change. Be blunt. Travis, the owner, already thinks it is sub-standard and wants to know why
and what a good operator would do instead.

## 1. Your role and the question

Act as a senior social media manager who has grown a consumer app's Instagram and Pinterest from
near zero. Answer four questions:

1. **What is wrong with the current drafts?** Cover every reel, the static post and every pin.
2. **How would you give that feedback to the editor?** Write the actual notes you would send: specific, timestamped for video, actionable.
3. **What strategy changes would you make?** Content mix, formats, who is on camera, voice, cadence, channels, and what to stop doing.
4. **What tactical changes would you make in the next two weeks?** Include the production process, the tools, skills and connectors the AI editor needs, and the review loop with the humans.

Then make one call: patch the current system, or overhaul it. Say why.

## 2. The business

- **What iEatz is:** a free iOS and Android app at https://apps.apple.com/us/app/id6475559706. You tell it, or snap a grocery receipt for, what is in your kitchen. It writes recipes from that, estimates calories and protein, and sends missing items to Instacart.
- **What it does not do:** it does not read photos of food. Never claim it does.
- **Audience:** 20s to 30s people who don't plan meals, buy groceries on vibes, and waste food.
- **Brand persona:** a 27-year-old who refuses to go back to the store.
- **People:** Travis runs the social program as a solo operator. Korian is the iEatz founder and approves content. A small team uploads photos and phone clips to a shared Google Drive inbox.
- **Production:** an AI session (Claude) is the copywriter, editor and scheduler.

## 3. Voice and hard rules (keep these; question everything else)

- **Voice:** real kitchen, food in the first second, one feeling per post, sound on, people in frame, text-message captions, lowercase is fine, mild swearing is fine.
- **Headlines:** every headline is a problem, a promise with a number, or a surprise, eight words or fewer.
- **Truth rules:**
  - Never claim the app read a photo.
  - Never give a recipe method in a caption.
  - Never claim a dish came out of iEatz unless the cook confirms it did.
  - Nutrition is always "estimated".
- **Stock:** no stock photos after Nov 15. The team's own photos come first.

## 4. The numbers (be honest about how small this is)

| Metric | Value |
|---|---|
| Instagram reach, typical month | 173 |
| Instagram reach, Oct 26 to 31 | 186 |
| Best reel ever | 139 views, 127 reach |
| Saves and shares, all of last week | 0 |
| Average watch time | 2.4 s of 6.8 s, and 3.6 s of 9.8 s (viewers leave around second 3) |
| Pinterest, last 30 days (from Pinterest Analytics; Buffer under-reports) | about 503 impressions, 0 saves |
| Pinterest, best board | Cheap healthy dinners, 303 impressions |
| Pinterest, best single pin | 266 impressions |

- **Last week's best reel:** phone footage of a real grocery run, at https://www.instagram.com/reel/De-stMWiqJ7/.
- **A second cut of the same clip:** 30 reach, at https://www.instagram.com/reel/DfGRY7wjJgU/.
- **What did badly:** designed reels and static cards reached 0 to 22 people.

## 5. What to review

The ten drafts for Nov 3 to 8 sit in Buffer under the organization "Applied Intelligence Co." If you
have the Buffer connector, read them by ID. Otherwise use the hosted files below. Base URL for all files:
`https://raw.githubusercontent.com/travi-trav3/iEatz/add-food-photography/`

| Slot (PT) | Post | Buffer ID | File |
|---|---|---|---|
| Tue 17:15 | Trial reel, opens on the full cart, "$86.63 of groceries. Zero plan." | 6ae93c590d3397810d06fac7 | assets/social/nov2/o03r-ig-haul-problem.mp4 |
| Wed 17:15 | Trial reel, opens on the eggs plate, "One receipt. 4 breakfasts. Zero planning." | 6ae93d056f053cdb90b73832 | assets/social/nov2/o04r-ig-haul-promise.mp4 |
| Thu 17:15 | Trial reel, opens on the chips grab, "The chips were not breakfast." | 6ae93d08186a5afbce798343 | assets/social/nov2/o05r-ig-haul-surprise.mp4 |
| Wed 18:45 | Instagram static, the comment-COOKBOOK lead magnet on the team's nachos | 6ae93d0b7996caf141c50a91 | assets/social/nov2/o04-ig-cookbook-nachos-v2.png |
| Tue 12:10 | Pin, coconut curry | 6ae93d1641f57fdb742c094c | assets/pinterest/nov2/p03-pin-curry-v2.png |
| Wed 12:10 | Pin, haul with the receipt | 6ae93d2e0d3397810d07382d | assets/pinterest/nov2/p04-pin-receipt-v3.png |
| Thu 12:10 | Pin, pancakes | 6ae93d346f053cdb90b7406e | assets/pinterest/nov2/p05-pin-pancakes-v2.png |
| Fri 12:10 | Pin, date night | 6ae93d396f053cdb90b74421 | assets/pinterest/nov2/p06-pin-datenight-v2.png |
| Sat 12:10 | Pin, sheet pan | 6ae93d41186a5afbce798e6f | assets/pinterest/nov2/p07-pin-sheetpan-v2.png |
| Sun 12:10 | Pin, bunless burger bowl | 6ae93d477996caf141c5164e | assets/pinterest/nov2/p02-pin-burgerbowl-v2.png |

The captions are in each Buffer draft and in `social/manifest/nov-2-8-batch.json`. The three reels
share one caption.

### How the reels were made

- **Footage:** nine team phone clips of 2.5 to 5 s each, from a Sunday night grocery run and Monday's breakfast plate.
- **Cut:** joined with ffmpeg into about 9 s per reel, with 0.6 s grabs and the plate arriving at 3.6 s.
- **Text:** overlays are HTML rendered in the brand serif with a dark band behind them.
- **Sound:** only store noise at -20 LUFS. No music, because Buffer's music picker can only be used by hand. No voiceover.
- **Variants:** the three differ only in the first 1.2 s.

### The statics

- **Format:** 1000×1500 pins and a 1080×1350 Instagram post, rendered from HTML templates.
- **Layout:** the team's photo on top, a paper panel with an eyebrow, a serif headline and three chips below.

## 6. History you should know (facts, not conclusions)

- **Reboot, Oct 30:** a "reboot" strategy doc was approved. It says the photo library was exhausted, there was only one clip, the voice dated from May, copy was written to pass internal checks, there was no sound, and changes were made on taste without data.
- **End cards, Oct 29:** two device-mockup end cards and a receipt end card were rejected in one afternoon, across seven versions of one reel.
- **Format retirements:** rendered "slideshow" reels and static cards were retired as Instagram reach plays after last week's numbers.
- **Footage problems:**
  - 17 of the 26 clips the team uploaded, including every screen recording of the app, could not be pulled. The Drive connector stops at about 6 MB per file.
  - Many team photos arrive as 360 px Apple Photos previews, not originals.
- **Instagram tooling:** the Trial Reel toggle and music can only be set by hand in Buffer. Buffer is on the Free plan: no first comments, 10 scheduled posts per channel.
- **Slack:** the AI posts to Slack only under Travis's own account. That has been paused.
- **Trend research:** the trend tool, Virlo, does not connect from the AI's environment.

Repository: `travi-trav3/iEatz`, branch `add-food-photography`. The useful files are in `social/`:

- `feedback/RULES.md`: voice and rules
- `feedback/LOG.md`: everything done and decided
- `reference/TRIAL-REELS.md`
- `reference/UPLOAD-INBOX.md`
- `reference/design-system/ieatz-healthy-ds-2/`: the brand design system
- `render/`: the pipeline

The reboot doc is at https://claude.ai/artifact/7pUW142GJm7H2ScBR997ny.

## 7. What we want back

Keep it to what a busy owner will act on, and put the recommendation first.

1. **Verdict:** patch or overhaul, in three sentences, with the single biggest reason.
2. **Asset-by-asset critique:** for each of the ten drafts, a grade (ship, fix, or kill), what is wrong in plain words, and the fix. For each reel, timestamped editor notes, for example "0:00 to 1:2: …". Judge each one against what currently performs in food and grocery content on Instagram Reels and Pinterest, and name the reference formats or creators you mean.
3. **Feedback to the editor:** show how you would brief an editor, human or AI, so the second cut lands. Include the template you would use for every review.
4. **Strategy:** the content pillars and formats, the ratio of talking-to-camera, POV cooking, voiceover and statics, and who appears on camera. Cover what Pinterest needs versus Instagram, posting cadence, what to stop, and how the cookbook lead magnet should work.
5. **Two-week plan:** day by day, covering what gets shot, by whom, how it reaches the editor, how it is reviewed, and when it posts. Make it realistic for a solo operator, a busy founder and a small team.
6. **The system and stack:** what the AI editor needs to do impressive work. Name skills, connectors and tools specifically: licensed music, voiceover, a real video editor such as FilmCraft or CapCut, trend research, captions, and a way to get full-size files in. Give each a reason, and say what stays human.
7. **Metrics:** the three numbers to watch weekly and the targets for 30 days, given the baseline above.

## 8. How to work

- **Watch and look before judging.** Watch every reel and open every image. If you can't load a file, say so and judge only what you saw.
- **Back every claim about what works on Reels or Pinterest** with a source or a named example. Mark anything that is your opinion.
- **Don't soften.** If the right answer is "stop making designed graphics and put a person on camera", say it.
- **Don't change anything in Buffer, Slack or the repo.** This is an audit; Travis decides what to act on.
