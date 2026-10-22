# Feedback loop: Buffer notes to repo rules

Travis leaves feedback in Buffer. Claude reads it, fixes what can still be fixed, and turns every
lasting point into a rule in this folder, so the next batch applies it without being told again.

## Leaving feedback (Travis)
- **On a post:** open it in Buffer (queue, calendar or sent) and add a **note**. Works on
  scheduled, draft and sent posts. One point per note is easiest to act on.
- **Edit the caption** in Buffer. That counts as feedback too: Claude logs what you changed and
  never changes your words back. Cut the same phrase twice and it goes on the banned list.
- **Delete a post** you don't want. That counts as a rejection: it is logged with its topic and
  pillar, and never recreated.
- **Not about one post:** in Ideas, create an idea titled **`Feedback: <topic>`** with the detail
  in the body. Any column.
- Say "always" or "never" when you mean a standing rule. Otherwise Claude decides whether it
  generalizes and says how it read the note in the summary, so a misread is easy to correct.
- Praise counts too: "this one works" is recorded under Keep doing.
- Reels: a note about the video itself (cut, footage, music, timing) comes back as a question,
  because re-cutting video waits for an interactive session. Caption notes on reels are fixed.

## When it runs
- **On a schedule: 10am, 12pm, 3pm and 7pm Pacific, every day.** A Claude Code scheduled task
  ("iEatz feedback loop, 4x daily") starts a fresh session that follows "Scheduled runs" below.
  A run with nothing new ends in about two minutes with no commit and no Slack message.
- When Travis says "review the feedback", in any session: the same steps, without the
  scheduled-run limits.
- At the start of every batch (CONTROL_CENTER section 10, step 0).

Every run looks at iEatz posts created in the last 45 days, on two channels only: Instagram
`6a14b495c687a22dd4267bfc` and Pinterest `6a7a4b64b2d9d577435279f6`. The Buffer org is shared
with Club Pilot: never read, edit or comment on any other channel. (Pinterest
`6a14637fc687a22dd424eee8` in older docs is the retired channel; it is no longer in Buffer.)

## Steps
`$S` is the session scratchpad. `fb` is `node social/feedback/feedback.js`.

1. **Set up.** In the repo: `git fetch origin add-food-photography && git checkout
   add-food-photography && git pull --ff-only origin add-food-photography`. This branch also
   serves the live post images; never delete or rewrite it.
1b. **Channel health (added Oct 22, after Instagram sat disconnected from Oct 18 to Oct 22 and
   four posts failed before anyone noticed).** `get_channel` for Instagram
   `6a14b495c687a22dd4267bfc` and Pinterest `6a7a4b64b2d9d577435279f6`. If either returns
   `isDisconnected: true` or `isLocked: true`, post one line to Slack #social naming the channel
   and the next three scheduled posts that will fail, with the fix (Buffer > Channels >
   Reconnect), then carry on with the review. Also list posts with `status: error` in the Queue
   query result (step 2) and name them in the summary: an errored post is a post that did not go
   out, whatever the ledger says.
2. **Pull.** `fb since` prints the window start; use it as `$since` in the Window and Queue
   queries (below), with `$org` = `6a138b7d82bb2ed009fed356`. Follow `pageInfo.endCursor` until
   `hasNextPage` is false. Run the Ideas query once. Save each result **exactly as returned**
   (no reformatting, no trimming) as `$S/window-1.json`, `$S/queue-1.json`, `$S/ideas.json`.
3. **List what is new:** `fb new --json $S/window-*.json $S/queue-*.json $S/ideas.json`. It
   skips Buffer- and AI-generated notes, anything already processed, and every non-iEatz post;
   keeps open questions on the list; and maps each post to its ledger entry. If `items` is
   empty and there is no `baseline`: **stop.** No commit, no Slack, no branch changes. If
   `baseline` is set (first run only), commit `state.json` as `Feedback: caption baseline`.
4. **Act on each item,** oldest first. Before each one: `git pull --ff-only origin
   add-food-photography`, then `fb check <id>`; exit 3 means another run already did it, skip.
   Then handle it by kind (below), and right after its Buffer edit (or right away, if there is
   none): `fb mark <outcome> <id>` (add `--from <the same dump files>`, last, for `caption:` and
   `deleted:` ids), add its `LOG.md` entry, commit `Feedback: <one line>` and push.
5. **Verify.** If anything changed `banned-phrases.txt` or gate code, run the gates on the newest
   ledger: `cd social/render && node diversity-gate.js ../manifest/<newest>.json --with
   ../manifest/send-this.json` (it runs the copy gate too). A queued post that now fails needs
   the fix from the rule step. If a gate script crashes (a stack trace, not a FAIL list), revert
   the change that caused it, commit, and report it in Slack.
6. **Record and report.** `fb run ok --note "<n> item(s)"`, commit, push. Then post the summary
   in Slack #social (`C0BATGA438T`) and give the same summary as the session reply.

### Notes and ideas
Read each in context: `get_post` for the post; open the image or video asset when the note is
about anything visual. Then classify:
- **fix**: about this post only. Scheduled or draft: change it now (copy: `edit_post`; visuals:
  "Re-rendered images" below). Already sent: nothing to change; it is logged.
- **rule**: the point generalizes. Add it to `RULES.md` as the next `F-NNN` (date, source id,
  the post, the rule as an instruction, why, how it is enforced). Enforce it as high up this
  ladder as it will go:
  1. a word or phrase: add it to `banned-phrases.txt` (the copy gate fails on it);
  2. anything else countable: a check in `render/copy-gate.js` or `render/diversity-gate.js`;
  3. a visual default: `render/templates.js` / `render/base.css`;
  4. a judgment call: the rule text in `RULES.md`, which every batch reads.
  Then check everything still queued in Buffer against the new rule and fix what breaks it.
- **rule+fix**: both.
- **answered**: Travis asked something. Answer it in the summary.
- **question**: ambiguous, and guessing would change the brand. Ask in the summary. It stays
  open (and keeps showing up in step 3) until marked otherwise.
- **no-op**: acknowledgement only. Praise goes under Keep doing in `RULES.md`.
- **logged**: learning only, nothing to change (a note on a sent post, a caption edit, a
  deletion).
A new rule that contradicts an older one wins; move the older one to Superseded with the date and
the new rule's id. Never delete a rule.

### Caption edits
`fb new` compares Buffer's text for every queued post with the ledger's `text`, ignoring
whitespace and curly-versus-straight quotes. A difference means Travis edited it in Buffer.
- Confirm it first: `get_post`, and check the item's `after` span is really in the post's text.
  If it isn't, the dump was mis-saved: save it again and rerun step 3. Never accept an edit you
  have not confirmed.
- `fb mark logged caption:<...> --from <dumps>` sets the ledger's `text` to his caption, so it
  is not seen again. Never change his words.
- Log it quoting only the changed span, before then after (the item's `before` and `after`).
- The same kind of edit twice means a rule. `repeatOf` lists earlier edits that cut the same
  phrase: a phrase cut twice goes into `banned-phrases.txt`.
- The first run records a baseline (Buffer's current text, where it differs from the ledger)
  instead of reporting edits, so Buffer's own formatting never reads as a wave of edits.
- After Claude changes a post's copy with `edit_post`, write the exact text sent to a file and
  run `fb set-text <bufferId> <file>`, or the next run reads Claude's edit as Travis's.
- Not compared: pin titles and Instagram first comments.

### Deletions
A post the ledger says is `scheduled`, from a ledger created inside the window, that is missing
from a complete Window listing was deleted in Buffer: Travis rejected it.
- Confirm it first: `get_post` must come back not found. If the post is there, the listing was
  incomplete: page it again; do not mark it.
- `fb mark logged deleted:<bufferId> --from <dumps>` sets its ledger status to `deleted`.
- Log it with its topic and pillar. Never recreate it.

### Editing a post in Buffer
- `edit_post` re-validates the whole post: carry `text`, every asset (with its `altText`) and
  the metadata forward and change only what the fix needs. Instagram: `metadata.instagram`
  `type` and `shouldShareToFeed` (omit `firstComment` to keep it). Pinterest:
  `metadata.pinterest` `boardServiceId` (from `board.serviceId`), `title`, `url`. Never send
  `mode` or `dueAt`: that reschedules the post.
- Never retry an `edit_post` blindly. If a call errors or its result is unclear, `get_post`
  first and only resend what did not land, so nothing double-fires.
- **Travis's captions are his.** If the item's `ledger.travisEdited` is true, or the post has an
  open caption item, never overwrite the caption unless the note itself asks for a caption
  change.

### Re-rendered images
Learned the hard way on another engine: raw.githubusercontent.com caches a path for minutes and
Buffer keeps whatever bytes it fetched at edit time. So:
1. Change the render batch post (`social/render/batches/<batch>.json`, joined by file name),
   not the ledger, for anything on the image.
2. `cd social/render && npm ci` (only on runs that render), then
   `node render-batch.js batches/<batch>.json --only <file>`. It must print `OK`. Open the PNG
   and run the QA gate (CONTROL_CENTER section 6) on it.
3. `node social/feedback/rehost.js stage <bufferId> > $S/stage.json` copies it to a **new file
   name** (`x.png` becomes `x-r2.png`, carousel slides `x-r2--01.png`...). Never overwrite a
   path, never rely on `?v=N`, and leave the old file in place: other posts or a pending edit
   may still point at it.
4. Commit the new files and the render batch change, and push.
5. `node social/feedback/rehost.js verify $S/stage.json`: fetches each new URL until it returns
   200 **and** the sha256 of the body matches the local file. Only then call `edit_post` with
   the new URLs (`url` and `thumbnailUrl`), and `get_post` to confirm Buffer has them.
6. `node social/feedback/rehost.js record $S/stage.json` points the ledger at the new files.
   Then mark, log, commit, push.

### Slack summary
Only when something was new. One line per item: the note or change shortened, an arrow, what
changed ("rule F-004, enforced by the copy gate", "re-rendered the Sat burrito pin, Buffer
updated", "you cut 'no list' from the Tue pin: logged", "question: ..."). Links as markdown
`[label](url)`, never bare. Same summary in the session reply.

### Failures
- Buffer tools are deferred: load them with `ToolSearch` (`select:mcp__Buffer__execute_query,
  mcp__Buffer__get_post,mcp__Buffer__edit_post`). If they don't load, run `ToolSearch` once more
  (query `Buffer`). Still missing: `fb run failed --note "Buffer tools unavailable"`, commit
  `Feedback: run failed (Buffer unreachable)`, push, stop. If it printed `ALERT`, post one Slack
  line: the feedback check couldn't reach Buffer on <n> runs in a row.
- Any other error mid-run: record `fb run failed --note "<what>"`, commit what is already done,
  push, and say in Slack what is left.

## Scheduled runs
Unattended: no questions, nobody is watching. Same steps as above, with these limits:
- **fix, copy:** `edit_post`, then `fb set-text`.
- **fix, image:** re-render only that post, per "Re-rendered images". `npm ci` only on runs that
  render.
- **video or reel:** copy fixes only. A note about the video itself becomes a `question` and
  goes to Slack for an interactive session.
- **rule:** enforce only through rung 1 (`banned-phrases.txt`) or rung 4 (the rule text in
  `RULES.md`). Anything that needs a code change (`copy-gate.js`, `diversity-gate.js`,
  `templates.js`, `base.css`) is written as `Enforced by: this file (code check proposed:
  <what>)` and listed in Slack. There is no CI on this branch, so unreviewed gate code never
  ships from a scheduled run.
- **re-checking queued posts against a new rule:** change other queued posts only when the note
  said "always" or "never". Otherwise list them in Slack and leave them.
- **sent posts:** learning only; nothing to edit.
- **Travis's caption:** never overwrite a caption he edited unless the note asks for a caption
  change.
- Never write to Notion. Never touch a channel other than the two above.

## Queries
Window: every iEatz post in the window, with its notes. Paginate with `after`.
```graphql
query Window($org: OrganizationId!, $since: DateTime!, $after: String) {
  posts(first: 100, after: $after, input: {
    organizationId: $org,
    filter: { channelIds: ["6a14b495c687a22dd4267bfc", "6a7a4b64b2d9d577435279f6"], createdAt: { start: $since } },
    sort: [{ field: createdAt, direction: desc }] }) {
    edges { node { id status channelId
      notes { id type text createdAt updatedAt author { name email } } } }
    pageInfo { hasNextPage endCursor }
  }
}
```
Queue: the posts not yet sent, with their text and assets.
```graphql
query Queue($org: OrganizationId!, $since: DateTime!, $after: String) {
  posts(first: 100, after: $after, input: {
    organizationId: $org,
    filter: { channelIds: ["6a14b495c687a22dd4267bfc", "6a7a4b64b2d9d577435279f6"], createdAt: { start: $since },
      status: [scheduled, draft, needs_approval, error] },
    sort: [{ field: dueAt, direction: asc }] }) {
    edges { node { id status channelId dueAt updatedAt text assets { source } } }
    pageInfo { hasNextPage endCursor }
  }
}
```
Ideas:
```graphql
query Ideas($org: OrganizationId!) {
  ideas(first: 100, input: { organizationId: $org }) {
    edges { node { id groupId createdAt updatedAt content { title text } } }
    pageInfo { hasNextPage endCursor }
  }
}
```

## Files
- `RULES.md`: the rules. Read at the start of every batch, before planning.
- `banned-phrases.txt`: phrases the copy gate fails on.
- `LOG.md`: what came in and what was done, newest last.
- `state.json`: processed ids, the caption baseline and the last 20 runs that did something
  (`feedback.js` writes it; do not edit by hand).
- `feedback.js`: since, new, check, mark, set-text and run (usage at the top of the file).
- `rehost.js`: stage, verify and record a re-rendered image under a new file name.
- `test.js`: `node social/feedback/test.js`, against the dumps in `fixtures/`.
