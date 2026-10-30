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
