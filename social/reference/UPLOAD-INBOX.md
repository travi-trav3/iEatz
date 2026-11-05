# Upload inbox (Google Drive)

Travis drops new material here; a session pulls it, checks it, and commits only what the render
needs (photos into `assets/photos/<category>/`, audio beds into `assets/audio/`, renders into
`assets/social/` and `assets/pinterest/`). Raw video never goes into git.

Folder: **iEatz social inbox** (Travis's Drive, created Oct 22 2026)
https://drive.google.com/drive/folders/1blKSlrZMasGCS2YIqQFo2c1F8enCpBWf

| Subfolder | What goes in | Notes |
|---|---|---|
| 1 photos (kitchen, fridge, receipts, food) | phone photos, 3000 px or wider; logos and packaging brands in frame are fine (Oct 30), faces only with consent | the fridge category is empty of usable shots: clean shelves, a receipt on the counter, a bag being unpacked, the pan on the stove are the gaps |
| 2 video clips (phone b-roll, screen recordings) | 10 to 60 s clips, vertical, natural light: receipt on the counter, a pan on the heat, a screen recording of a receipt import and of a recipe with macros | these become 30 to 60 s reels; the rendered 7 to 10 s graphics stay for the weeks without footage |
| 3 app screenshots (full resolution) | every screen, 1170 px wide or more, straight from the phone | replaces the 640 px screens the device shell uses today |
| 4 audio (Meta Sound Collection downloads) | mp3 beds from Meta Business Suite, with the Sound Collection id in the file name | business accounts are cleared for this library only; see `assets/audio/README.md` |
| 5 design system export | the updated design system (HTML, Figma export, or a zip) | lands in `social/reference/design-system/<name>/` |

## Indexing (Nov 2026)
Every upload is reviewed within a day and goes into `assets/photos/photos.json` with
`source: "own"`, an honest `description` (what the frame literally shows, who is in it), and a
`flag` for a face that did not consent (`no-consent`): a flagged photo is never used. Logos and
product labels are fine since Oct 30 2026 and go in the `note`. Clips are logged in the batch that cuts them
(`footageClaim`), never committed. From Nov 15 2026 our own photos come first: a post on a `stock` photo fails the gate only while
an own photo is free; an empty inbox means the library (never-used, then rested 60 days) is the
plan, never a thin week (F-008, `node social/render/photo-usage.js`). Inbox checks are logged in `photos.json` under `inboxLog`.

Stock b-roll, if filming slips: Pexels and Pixabay (free, commercial use), Mixkit, Coverr; paid:
Artgrid, Storyblocks, Envato Elements. Instagram's 2026 originality rule treats pure stock
reposts as non-original, so stock is always cut with our own type, app screens or voice, never
posted as is.

## What to film for one reel (Nov 5 2026, F-017)
One dish, one session, phone held vertical, daylight, about 10 minutes of the cook's time. Hands
only, no faces needed.
1. **Before:** the ingredients where they actually are: the fridge shelf, the veg drawer, or the
   receipt on the counter. 3 to 5 s, one slow move in.
2. **The process:** 6 to 10 clips of 2 to 4 s each, one action per clip, close: chopping, the pan
   hitting the heat, things going in, a stir, a flip. Hold still at the start and end of each.
3. **The money shot:** the finished dish, 5 to 8 s, with a hand doing something to it: a fork in,
   a dip, a lift, a pull. Shoot two or three tries. This becomes the first and last frame.
4. **The app (Travis):** a screen recording of the iEatz step that made it: the receipt import or
   the items typed in, then the recipe with protein estimated. 10 to 20 s.
5. **Name it:** put the dish and how long it took in the file name or a note
   ("fridge-fried-rice-12min"), so the title card is true.
Clips go in folder 2. Screen recordings are usually over the Drive connector's ~6.3 MB limit, so
until the file path is fixed, AirDrop or email them to Travis to upload another way.

## How a clip becomes a reel (Oct 25 2026)
1. Drop the clip in folder 2 (or send it in chat). It is copied to `assets/video/raw/` (gitignored).
2. The batch gets a `footage` post: the clip, a `hold` for the last frame, two or three `overlays`
   (a line each, with the second from the moment the shot changes), `footageClaim` (what the clip
   literally shows), `why` and `app`.
3. `node render-footage.js batches/<batch>.json --only <file>` writes the reel and its cover; the
   clip's own sound is kept at -14 LUFS. Only the finished mp4 is committed and hosted.
First one: `o26-ig-footage` (grocery aisle, tilt to the cart, 7.3 s), Mon Oct 26 6:40 PM PT.
What makes a clip easy to use: vertical, 6 to 20 seconds, one movement (walk, tilt, pour, flip),
the food or the receipt filling the frame by the end, no faces you do not want posted.
