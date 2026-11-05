# Reel sound: how every reel gets its music

The procedure behind F-012 (music on every reel), F-013 (no Trial Reels, no hook variants) and
F-014 (the Sunday routine), all in `feedback/RULES.md`. Written Nov 4 2026.

## The split, and why

Buffer's post editor has a **Music** picker for Instagram reels. The Buffer API does not: there
is no music field on `create_post`, `edit_post` or `get_post` (checked Nov 4 2026). So:

| Step | Who | Where |
|---|---|---|
| Read what is trending, when a source is available | Claude | Virlo until Nov 11; Travis's notes after |
| Pick 2 or 3 tracks per reel, with search terms and a cue | Claude | the ledger row's `sound` |
| Flag the draft | Claude | Buffer: `needs music` tag + a block at the top of the caption |
| Choose the track, add it, delete the block, remove the tag, press Schedule | Travis | Buffer's editor |
| Never edit that reel through the API again | Claude | (see "Do not edit after the music") |

There is no gate on the music being added (Travis, Nov 4: trust it). The gate checks only that
Claude made the picks.

## What a pick looks like

Every reel's ledger row carries (the two named tracks are from Buffer's picker as seen on Nov 4;
the first pick is a placeholder for whatever the Virlo read finds):

```json
"sound": {
  "picks": [
    { "title": "<a sound from the Virlo read>", "artist": "<artist>", "source": "virlo-niche",
      "why": "breaking out in food content this week (Virlo, Sunday read); hard downbeat lands on the plate at 0.0" },
    { "title": "Sunset Circuit", "artist": "Fellow Travelers", "source": "fit",
      "why": "unbothered mid-tempo under 'no list, just vibes': the joke is how calm it is" },
    { "title": "Like A Star", "artist": "Otis McDonald", "source": "fit",
      "why": "soft and warm for the bite at the end if the voice carries the hook" }
  ],
  "search": ["upbeat kitchen", "lofi morning", "funky groove"],
  "cue": "downbeat on the plate at 0.0; bed ducks under the voice; swell on the bite at 11 s"
}
```

- **2 or 3 picks.** Each has a title, the artist when known, a `why` written for this clip (not
  "upbeat, fits the vibe"), and a `source`:
  - `virlo-niche`: trending or breaking out in food, grocery or cooking content (Virlo).
  - `virlo-platform`: trending on Reels as a whole (Virlo).
  - `fit`: picked for the picture, not the trend. A mood, a tempo, or a lyric that is clever
    against the visual: something deadpan under a disaster, something triumphant under a
    sad fridge, a lyric that names what is on screen.
- **At least one `fit` pick on every reel** (the gate warns without one). It is the backstop
  for a trending sound that turns out not to be in Buffer's picker, and after Nov 11 it is the
  normal case.
- **Search terms** (1 to 3) for Buffer's picker, for when none of the picks is there.
- **The cue** says where the beat, drop or swell should land on the cut, so the track serves
  the edit and not the other way round.
- **Never call a pick "trending" without Virlo.** Picks from memory are `fit`. If Virlo is down
  on a Sunday, every pick is `fit` and the review table says so.

### Picking well

- Start from the clip, not the chart. Watch the cut, name its one feeling (RULES.md voice, rule
  3), then look for a track that either matches it or plays against it on purpose.
- Trending matters, but only if it fits. A trending sound that fights the picture costs more
  watch time than it earns in reach.
- Voice first. When the reel has a voiceover or someone talking, the music is a bed under it:
  no vocals in the track, or vocals that duck well.
- Business accounts are only cleared for commercially licensed audio. Many sounds trending in the
  Instagram app are licensed songs that Buffer's picker (and Instagram, for a business account)
  will not offer. Prefer trending sounds that are original audio or library tracks, and say so
  in the `why` when you cannot tell.

## The Buffer draft

When the Sunday routine creates a reel draft (F-010, F-014):

1. Attach the `needs music` tag (`tagIds`, id below).
2. Put this block at the top of the draft's caption in Buffer, followed by one blank line and
   then the ledger caption. The block never goes in the ledger `text`, so the copy gate never
   reads it:

   ```
   🎵 PICK ONE IN MUSIC, THEN DELETE THIS BLOCK
   1) <Virlo pick> · <artist> (breaking out in food content; drop on the plate)
   2) Sunset Circuit · Fellow Travelers (deadpan under the cart)
   3) Like A Star · Otis McDonald (warm under the bite)
   not there? search: upbeat kitchen / lofi morning / funky groove
   ```

3. Leave `metadata.instagram` as `{type: "reel", shouldShareToFeed: true}`. No Trial Reel step
   (F-013).

**`needs music` tag id:** `6aeb8cffd38803d21dbdebac` (Buffer name "Needs Music", colour #D925AC; read Nov 4 2026 from post 6ada61d12f4faf5f79630579). Pass it in `tagIds` on `create_post` for every reel.

## Travis's step, per reel (about a minute)

1. In Buffer, filter by the `needs music` tag, then open the reel draft.
2. Music, Add Music: try the picks in order, else the search terms. Pick by ear against the
   preview.
3. Delete the 🎵 block from the caption. **If the block stays, it publishes.**
4. Remove the `needs music` tag.
5. Press Schedule. That is the go for this reel.

Tell the session which track you used ("o07r: Sunset Circuit") when it is convenient. It goes in
the ledger as `sound.used` for the Monday read, but nothing waits on it.

## Do not edit after the music

`edit_post` re-sends the whole post. Nobody has tested whether a track added in Buffer's editor
survives an API edit, so once Travis has added music the session does not touch that reel through
the API. A recut or caption change goes back as a new draft (or Travis makes the edit in Buffer).
To retire this rule: add music to one test draft in the editor, change its caption with
`edit_post`, and check in the editor whether the track is still there.

## Trend source

**Virlo, until Nov 11 2026 only.** Travis's Virlo trial ends Nov 11 and will not be renewed (the
plan is $49 a month). The MCP connector reaches `dev.virlo.ai` but needs Travis's sign-in, and
every call spends Virlo credits. The Nov 4 audit, gathered in Chrome from his trial workspace, is
the trend record: `VIRLO-AUDIT-2026-11.md`. Its main finding for sound: no track carries the food
niche (the most-used sound was in 2 of 316 videos; 7 of the top 10 were original audio), so voice
leads and the music is a bed (F-016).

**After Nov 11:** picks are `fit` by default. If Travis notices a sound rising in the Reels app
that is also in Buffer's picker, he names it in the session and it can be a `virlo-platform`-style
trend pick with `source: "fit"` and the note "Travis, Reels app, <date>". Re-run a free trend read
only if a new trial or a free source turns up.

## What happened to Trial Reels

`TRIAL-REELS.md` planned every reel as an Instagram Trial Reel, cut three ways with a different
hook. Instagram only offers Trial Reels to professional accounts with at least 200 followers
(Instagram Help Center, "About trial reels on Instagram"), and @ieatzhealthy is below that, so
the plan never ran (Travis, Nov 4). Without Trial Reels the three variants would all reach
followers, so they are retired too (F-013). When the account passes 200 followers, check for the
toggle and propose a new rule.
