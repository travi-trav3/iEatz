# assets/audio

Sound for reels. `render-motion.js` mixes these into the MP4 so reels keep auto-publishing through
Buffer: Instagram's API cannot attach library music, and it posts audio inside the file as
"original audio".

## What goes here
- **Music beds: Meta Sound Collection only**, downloaded from Meta Business Suite. iEatz is an
  Instagram business account, and business accounts are only cleared for that library, not for
  the trending songs a personal account sees. The license covers Meta platforms, so a reel with a
  bed goes to Instagram and Facebook only: never reuse that MP4 on Pinterest, TikTok or YouTube.
- **Voiceovers:** your own voice, recorded as a phone voice memo (`.m4a` is fine). One take of
  the reel's headline and one line after it, 3 to 6 seconds. No AI voices.
- `fixtures/` holds generated test signals for `batches/v2-audio-smoke.json`. Never publish them.

Name files for what they are: `bed-<mood>-<source-id>.mp3`, `vo-<post-file>.m4a`.

## Using it in a batch
```json
"motion": { "duration": 8, "fps": 24,
  "audio": { "bed": "bed-warm-acoustic-12345.mp3", "license": "Meta Sound Collection #12345",
             "voice": "vo-o04-ig-reel.m4a", "voiceAt": 0.3, "bedDb": -8 } }
```
- `bed` needs `license` or the render fails. The bed loops or trims to the reel, fades in over
  0.3 s and out over the last 1.2 s.
- Voice and bed are loudness-matched before mixing, so `bedDb` (default -8) is the bed's level
  under the voice whatever the files' own levels; the bed also ducks while the voice speaks.
- The mix is normalized to -14 LUFS / -1.5 dBTP, AAC 128k 48 kHz. The render line prints
  `audio=bed+voice mean=… max=…` and fails on clipping or a near-silent track.
- The renderer cannot judge taste. Listen to every reel with sound before it is scheduled.
