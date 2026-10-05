# Feedback loop: Buffer notes to repo rules

Travis leaves feedback in Buffer. Claude reads it, fixes what can still be fixed, and turns every
lasting point into a rule in this folder, so the next batch applies it without being told again.

## Leaving feedback (Travis)
- **On a post:** open it in Buffer (queue, calendar or sent) and add a **note**. Works on
  scheduled, draft and sent posts. One point per note is easiest to act on.
- **Not about one post:** in Ideas, create an idea titled **`Feedback: <topic>`** with the detail
  in the body. Any column.
- Say "always" or "never" when you mean a standing rule. Otherwise Claude decides whether it
  generalizes and says how it read the note in the summary, so a misread is easy to correct.
- Praise counts too: "this one works" is recorded under Keep doing.

When it runs: when Travis says "review the feedback", at the start of every batch (CONTROL_CENTER
section 10, step 0), and on the Monday 4:50 PM PT routine.

## Processing (Claude)
Work on branch `add-food-photography`; `git pull` first. The Buffer API has no way to write a
note back, so the reply goes to Slack #social.

1. **Pull.** Run the posts query (below), following `pageInfo.endCursor` until `hasNextPage` is
   false, and save each page as a JSON file in the scratchpad. Run the ideas query once, save it.
2. **List what is new:** `node social/feedback/feedback.js new <file> [<file> ...]`. It skips
   notes Buffer generated, skips anything already processed, keeps open questions on the list,
   and maps each post to its ledger entry (file, shell, photo).
3. **Read each item in context.** `get_post` for the post; open the image or video asset when
   the note is about anything visual. Then classify:
   - **fix**: about this post only. Scheduled or draft: change it now (copy with `edit_post`;
     visuals: re-render, re-host with a new `?v=N`, `edit_post` the asset, update the ledger).
     Already sent: nothing to change; it is logged.
   - **rule**: the point generalizes. Add it to `RULES.md` as the next `F-NNN` (date, source
     id, the post, the rule as an instruction, why, how it is enforced). Enforce it as high up
     this ladder as it will go:
     1. a word or phrase: add it to `banned-phrases.txt` (the copy gate fails on it);
     2. anything else countable: a check in `render/copy-gate.js` or `render/diversity-gate.js`;
     3. a visual default: `render/templates.js` / `render/base.css`;
     4. a judgment call: the rule text in `RULES.md`, which every batch reads.
     Then check everything still queued in Buffer against the new rule and fix what breaks it.
   - **rule+fix**: both.
   - **answered**: Travis asked something. Answer it in the summary.
   - **question**: ambiguous, and guessing would change the brand. Ask in the summary. It stays
     open (and keeps showing up in step 2) until marked otherwise.
   - **no-op**: acknowledgement only. Praise goes under Keep doing in `RULES.md`.
   A new rule that contradicts an older one wins; move the older one to Superseded with the date
   and the new rule's id. Never delete a rule.
4. **Mark:** `node social/feedback/feedback.js mark <outcome> <id> [...]`.
5. **Log:** append one entry per item to `LOG.md`: the date, the quoted note, the post, the
   outcome, and what changed (rule id, file, post edit).
6. **Verify:** if a rule touched code, run the copy and diversity gates on the newest batch and
   ledger; a gate failure on a queued post means it needs the fix from step 3.
7. **Commit and push:** `Feedback: <one line>`, with the files above plus any code or ledger
   changes.
8. **Tell Travis** in Slack #social (C0BATGA438T), only when there was new feedback: one line per
   item, the quote shortened, an arrow, what changed ("rule F-004, enforced by the copy gate",
   "fixed the scheduled Thursday pin", "question: ..."). Links as markdown `[label](url)`, never
   bare. Same summary in the session reply.

## Queries
Posts with notes, both iEatz channels (paginate with `after`):
```graphql
query Notes($org: OrganizationId!, $after: String) {
  posts(first: 100, after: $after, input: {
    organizationId: $org,
    filter: { channelIds: ["6a14b495c687a22dd4267bfc", "6a7a4b64b2d9d577435279f6"] },
    sort: [{ field: createdAt, direction: desc }] }) {
    edges { node { id status channelService dueAt
      notes { id type text createdAt updatedAt author { name email } } } }
    pageInfo { hasNextPage endCursor }
  }
}
```
Variables: `{"org": "6a138b7d82bb2ed009fed356"}`. Ideas:
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
- `state.json`: processed ids (`feedback.js` writes it; do not edit by hand).
- `feedback.js`: the inbox and mark commands.
