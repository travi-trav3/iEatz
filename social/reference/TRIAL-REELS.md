# Trial Reels: the distribution plan

Instagram Trial Reels (Buffer: "Trial Reel: Auto") show a reel to people who do not follow the
account first. If it performs, Instagram pushes it to followers after 72 hours; if not, followers
never see it. For an account with 173 reach a month, that is the lever: every reel is a test
against strangers, and a weak one costs nothing with the people who already follow us.

## The loop
1. **Every reel ships as a Trial Reel.** The toggle is in Buffer's post editor (Trial Reel: Auto),
   not in the API, so it is Travis's step before the slot: the Slack alert for each reel says so.
2. **Three hooks, one clip.** A clip is cut three ways with a different first line (a problem, a
   promise with a number, a surprise; F-005). Followers do not see trial reels, so near-duplicates
   are fine. One per day, same slot.
3. **Read at 72 hours:** non-follower views, average watch time, shares, and whether Instagram
   graduated it to followers. The winner's hook pattern is the next week's default; the losers
   are retired, not re-posted.
4. **Music on every reel**, added in Buffer at scheduling (Buffer attaches Instagram's licensed
   music at publish; it needs the Instagram account linked to the Facebook Page once: the
   "Save & Link" prompt in the editor). Baked-in audio stays for voice; music comes from Buffer.
5. **Slot:** 17:15 PT (20:15 ET) for reels, so both coasts are in their evening; the old 18:40 PT
   slot was 21:40 ET. Trial distribution runs for days, so the slot matters less than for a feed
   post, but the first hour still seeds it.

## Measuring
`get_post` with `includeMetrics: true` on the Monday routine for every reel older than 72 hours;
log views, reach, saves, shares and watch time against the hook type in the batch ledger (`hook`
field: problem | promise | surprise). After four weeks the table says which hook earns the
follower push; until then it is a guess.

## Not available from the session
Trial Reel toggle, Buffer music picker, Meta Sound Collection downloads: all UI-only. Sound
Collection tracks downloaded by Travis go to the Drive audio inbox and are mixed in-file by
render-motion.js (for voice beds); Buffer music is preferred for the reel itself.
