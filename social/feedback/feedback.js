// Feedback inbox for Travis's Buffer notes. The Buffer API is reached through MCP tools, so the
// session saves the query results to files and this script does the deterministic part:
//
//   node feedback.js since [--days N]
//       Prints the window start (now minus 45 days) for the $since variable of both queries.
//   node feedback.js new [--json] [--days N] <dump.json> [<dump.json> ...]
//       Each dump is one page of the Window, Queue or Ideas query in README.md (any order).
//       Lists, oldest first, everything not yet in state.json:
//         note     a user-written note on an iEatz post (Buffer- and AI-generated notes skipped)
//         idea     an idea titled "Feedback..."
//         caption  a queued post whose Buffer text differs from the ledger: Travis edited it
//         deleted  a post the ledger says is scheduled that is gone from Buffer: rejected
//       Open questions are listed again. Posts on any other channel are ignored. The first run
//       records a baseline instead of listing caption edits (see README "Caption edits").
//   node feedback.js check <id>
//       Exit 0 if the id is still open, 3 if another run already processed it.
//   node feedback.js mark <outcome> <id> [<id> ...] [--from <dump.json> ...]
//       Records ids as processed. outcome: rule | fix | rule+fix | answered | no-op | logged |
//       question ("question" ids stay open). caption: and deleted: ids need --from (the same
//       dumps) and also update the ledger: the caption becomes the ledger text, a deleted post
//       gets status "deleted".
//   node feedback.js set-text <bufferId> <file>
//       After Claude changes a post's copy with edit_post: the file holds the exact text sent,
//       which becomes the ledger text so the next run does not read it as Travis's edit.
//   node feedback.js run <ok|failed> [--note "..."]
//       Records a run that did something or failed (last 20 kept). Quiet runs record nothing.
//       Prints "ALERT" on the second failure in a row and about once a day after that.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = __dirname;
const STATE = process.env.FEEDBACK_STATE || path.join(DIR, 'state.json');
const MANIFEST = process.env.FEEDBACK_MANIFEST || path.join(DIR, '../manifest');
const NOW = process.env.FEEDBACK_NOW ? new Date(process.env.FEEDBACK_NOW) : new Date();
const DAYS = 45;
// The only two channels this loop may read or act on. The org is shared with Club Pilot.
const CHANNELS = { '6a14b495c687a22dd4267bfc': 'instagram', '6a7a4b64b2d9d577435279f6': 'pinterest' };
const QUEUED = new Set(['scheduled', 'draft', 'needs_approval', 'error']);
const OUTCOMES = ['rule', 'fix', 'rule+fix', 'answered', 'no-op', 'logged', 'question'];
const RUNS_KEPT = 20;

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
state.processed = state.processed || {};
state.runs = state.runs || [];
const save = () => fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');

// Flags out, positionals left. --from takes every following non-flag argument.
const argv = process.argv.slice(2);
const flags = { from: [] };
const pos = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--json') flags.json = true;
  else if (a === '--days' || a === '--note') flags[a.slice(2)] = argv[++i];
  else if (a === '--from') { while (argv[i + 1] && !argv[i + 1].startsWith('--')) flags.from.push(argv[++i]); }
  else pos.push(a);
}
const days = Number(flags.days || DAYS);
const since = new Date(NOW.getTime() - days * 864e5);

// The first JSON value in a string: the Buffer tool prints the result, then {"rateLimit": ...}.
function firstJson(s) {
  try { return JSON.parse(s); } catch (e) { /* fall through */ }
  const start = s.search(/[[{]/);
  let depth = 0, str = false;
  for (let i = start; start >= 0 && i < s.length; i++) {
    const c = s[i];
    if (str) { if (c === '\\') i++; else if (c === '"') str = false; continue; }
    if (c === '"') str = true;
    else if (c === '{' || c === '[') depth++;
    else if ((c === '}' || c === ']') && --depth === 0) return JSON.parse(s.slice(start, i + 1));
  }
  throw new Error('no JSON value found');
}
// Accepts the bare query result, {result: ...}, {data: ...}, or a saved MCP tool result ([{type, text}, ...]).
function read(f) {
  let j;
  try { j = firstJson(fs.readFileSync(f, 'utf8')); } catch (e) { throw new Error(`${f}: not JSON (${e.message})`); }
  if (Array.isArray(j)) j = j.map(x => { try { return JSON.parse(x.text); } catch (e) { return null; } }).find(x => x && (x.posts || x.ideas || x.data || x.result)) || {};
  return j.result || j.data || j;
}
const iso = (t) => typeof t === 'number' ? new Date(t > 1e12 ? t : t * 1000).toISOString() : t;

// Compare captions the way a reader would: Buffer's whitespace and quote handling, and any
// transcription of the dump, must never read as an edit. Words and punctuation still count.
const norm = (s) => String(s || '').normalize('NFKC').replace(/[​-‍﻿]/g, '')
  .replace(/[‘’‚′]/g, "'").replace(/[“”„″]/g, '"')
  .replace(/\s+/g, ' ').trim();
const hash = (s) => crypto.createHash('sha1').update(norm(s)).digest('hex').slice(0, 8);

// The changed span, word by word: common prefix and suffix dropped, a few words of context kept.
function span(before, after, ctx = 3) {
  const a = norm(before).split(' '), b = norm(after).split(' ');
  let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
  let j = 0; while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
  const head = a.slice(Math.max(0, i - ctx), i).join(' '), tail = a.slice(a.length - j, a.length - j + ctx).join(' ');
  return { removed: a.slice(i, a.length - j).join(' '), added: b.slice(i, b.length - j).join(' '),
    before: [i > ctx ? '…' : '', head, a.slice(i, a.length - j).join(' '), tail, j > ctx ? '…' : ''].filter(Boolean).join(' '),
    after: [i > ctx ? '…' : '', head, b.slice(i, b.length - j).join(' '), tail, j > ctx ? '…' : ''].filter(Boolean).join(' ') };
}

// bufferId -> { batch, path, i, post, createdAt }, over every ledger in social/manifest.
function ledgers() {
  const idx = {};
  for (const f of fs.readdirSync(MANIFEST).filter(f => f.endsWith('.json'))) {
    const p = path.join(MANIFEST, f);
    let m; try { m = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { continue; }
    (m.posts || []).forEach((post, i) => {
      if (post.bufferId) idx[post.bufferId] = { batch: f, path: p, i, post, createdAt: post.createdAt || m.createdAt || null };
    });
  }
  return idx;
}
// travisEdited: Travis has rewritten this caption in Buffer before, so it is his copy now.
const brief = (l) => l && { batch: l.batch, id: l.post.id, file: l.post.file, template: l.post.template, photo: l.post.heroPhoto || l.post.photo,
  pillar: l.post.pillar, topic: l.post.topic, status: l.post.status, dueAt: l.post.dueAt,
  travisEdited: Object.keys(state.processed).some(k => k.startsWith(`caption:${l.post.bufferId}:`)) };
// Rewrites one ledger post in place, keeping the file's formatting (2-space JSON).
function writeLedger(l, change) {
  const raw = fs.readFileSync(l.path, 'utf8');
  const m = JSON.parse(raw);
  change(m.posts[l.i]);
  fs.writeFileSync(l.path, JSON.stringify(m, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
}

// Every post in the dumps, merged by id (Window gives notes, Queue gives text and assets).
function load(files) {
  const posts = new Map(), ideas = [], warnings = [];
  let windowed = false, complete = false, offChannel = 0;
  for (const f of files) {
    const d = read(f);
    if (!d.posts && !d.ideas) throw new Error(`${f}: neither a posts nor an ideas query result`);
    if (d.posts) {
      const edges = d.posts.edges || [];
      if (edges.some(e => e.node && 'notes' in e.node)) { windowed = true; if (d.posts.pageInfo && d.posts.pageInfo.hasNextPage === false) complete = true; }
      for (const { node } of edges) {
        if (!CHANNELS[node.channelId]) { offChannel++; continue; }
        posts.set(node.id, Object.assign(posts.get(node.id) || {}, node));
      }
    }
    for (const { node } of (d.ideas && d.ideas.edges) || []) ideas.push(node);
  }
  if (offChannel) warnings.push(`${offChannel} post(s) ignored: not on an iEatz channel (or no channelId in the query)`);
  return { posts, ideas, windowed, complete, warnings };
}

const open = (id) => { const s = state.processed[id]; return !s || s.outcome === 'question'; };
const postOf = (p) => p && { id: p.id, channel: CHANNELS[p.channelId], status: p.status, dueAt: p.dueAt,
  assets: (p.assets || []).map(a => a.source).filter(Boolean) };

function inbox(files) {
  const { posts, ideas, windowed, complete, warnings } = load(files);
  const idx = ledgers();
  const items = [];
  let baseline = null;

  for (const post of posts.values()) {
    for (const n of post.notes || []) {
      if (n.type !== 'userGenerated' || !open(n.id)) continue;
      items.push({ kind: 'note', id: n.id, at: n.updatedAt || n.createdAt, author: n.author && (n.author.name || n.author.email), text: n.text,
        reopened: !!state.processed[n.id], post: postOf(post), ledger: brief(idx[post.id]) });
    }
  }
  for (const idea of ideas) {
    const c = idea.content || {};
    if (!/^\s*feedback\b/i.test(c.title || '') || !open(idea.id)) continue;
    items.push({ kind: 'idea', id: idea.id, at: iso(idea.updatedAt || idea.createdAt), text: `${c.title}\n${c.text || ''}`.trim(), reopened: !!state.processed[idea.id] });
  }

  // Caption edits: queued posts only (sent posts cannot change). Expected text is the baseline
  // for this post if the first run recorded one, else the ledger.
  const queued = [...posts.values()].filter(p => typeof p.text === 'string' && QUEUED.has(p.status) && idx[p.id] && typeof idx[p.id].post.text === 'string');
  const hasQueue = [...posts.values()].some(p => typeof p.text === 'string');
  if (!hasQueue) warnings.push('no Queue query dump: caption edits not checked');
  else if (!state.baseline) {
    state.captions = {};
    for (const p of queued) if (norm(p.text) !== norm(idx[p.id].post.text)) state.captions[p.id] = p.text;
    baseline = { at: NOW.toISOString(), posts: queued.length, differ: Object.keys(state.captions).length };
    state.baseline = baseline;
    save();
  } else {
    const captions = state.captions || {};
    for (const p of queued) {
      const was = p.id in captions ? captions[p.id] : idx[p.id].post.text;
      if (norm(p.text) === norm(was)) continue;
      const id = `caption:${p.id}:${hash(p.text)}`;
      if (!open(id)) continue;
      const s = span(was, p.text);
      // Same cut: equal, or one contains the other and the shorter is a real phrase (8+ chars).
      const key = s.removed.toLowerCase();
      const same = (r) => r === key || (Math.min(r.length, key.length) >= 8 && (r.includes(key) || key.includes(r)));
      const repeatOf = key ? Object.entries(state.processed).filter(([k, v]) => k.startsWith('caption:') && v.removed && same(v.removed.toLowerCase())).map(([k]) => k) : [];
      items.push({ kind: 'caption', id, at: p.updatedAt || NOW.toISOString(), post: postOf(p), ledger: brief(idx[p.id]),
        removed: s.removed, added: s.added, before: s.before, after: s.after, repeatOf });
    }
  }

  // Deletions: only from a complete Window listing, and only ledgers created inside the window
  // (a day of margin), so an older post outside the query never reads as deleted.
  if (!windowed) warnings.push('no Window query dump: deletions not checked');
  else if (!complete) warnings.push('Window listing has more pages than were saved: deletions not checked');
  else if (!posts.size) warnings.push('Window listing is empty: deletions not checked');
  else {
    for (const [bid, l] of Object.entries(idx)) {
      if (l.post.status !== 'scheduled' || posts.has(bid) || !l.createdAt) continue;
      if (new Date(l.createdAt).getTime() < since.getTime() + 864e5) continue;
      const id = `deleted:${bid}`;
      if (!open(id)) continue;
      items.push({ kind: 'deleted', id, at: l.post.dueAt, bufferId: bid, ledger: brief(l), text: (l.post.text || '').slice(0, 140) });
    }
  }

  items.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  return { since: since.toISOString(), baseline, warnings, items };
}

function printHuman(r) {
  for (const w of r.warnings) console.log(`warning: ${w}`);
  if (r.baseline) console.log(`Baseline recorded: ${r.baseline.posts} queued post(s), ${r.baseline.differ} already differ from the ledger (not logged). Commit state.json.`);
  if (!r.items.length) { console.log('No new feedback.'); return; }
  for (const it of r.items) {
    const p = it.post, l = it.ledger;
    console.log(`\n[${it.kind} ${it.id}] ${it.at || ''}${it.author ? ' by ' + it.author : ''}${it.reopened ? ' (open question)' : ''}`);
    if (p) console.log(`  on ${p.channel} post ${p.id} (${p.status}, due ${p.dueAt || '?'})${l ? ` -> ${l.batch}: ${l.file} [${l.template || '?'}${l.photo ? ', ' + l.photo : ''}]` : ' -> not in any ledger'}`);
    if (it.kind === 'caption') {
      console.log(`  before: "${it.before}"\n  after:  "${it.after}"`);
      if (it.repeatOf.length) console.log(`  same cut as before: ${it.repeatOf.join(', ')}`);
    } else if (it.kind === 'deleted') {
      console.log(`  ${l.batch}: ${l.id} (${l.pillar || '?'} / ${l.topic || '?'}, was due ${l.dueAt}) is gone from Buffer\n  "${it.text}"`);
    } else console.log('  ' + it.text.replace(/\n/g, '\n  '));
  }
  console.log(`\n${r.items.length} item(s) to process.`);
}

function usage(msg) { console.error(msg || 'usage: node feedback.js since | new [--json] <dump...> | check <id> | mark <outcome> <id...> [--from <dump...>] | set-text <bufferId> <file> | run <ok|failed> [--note ...]'); process.exit(1); }

const [cmd, ...args] = pos;
if (cmd === 'since') {
  console.log(since.toISOString());
} else if (cmd === 'new') {
  if (!args.length) usage('usage: node feedback.js new [--json] [--days N] <dump.json> [<dump.json> ...]');
  let r;
  try { r = inbox(args); } catch (e) { console.error(`!! ${e.message}`); process.exit(1); }
  if (flags.json) console.log(JSON.stringify(r, null, 2)); else printHuman(r);
} else if (cmd === 'check') {
  if (!args[0]) usage('usage: node feedback.js check <id>');
  const s = state.processed[args[0]];
  if (open(args[0])) { console.log(s ? 'open (question)' : 'open'); process.exit(0); }
  console.log(`processed: ${s.outcome} at ${s.at}`); process.exit(3);
} else if (cmd === 'mark') {
  const [outcome, ...ids] = args;
  if (!OUTCOMES.includes(outcome) || !ids.length) usage(`usage: node feedback.js mark <${OUTCOMES.join('|')}> <id> [<id> ...] [--from <dump.json> ...]`);
  const at = NOW.toISOString();
  const needsDump = ids.filter(id => /^(caption|deleted):/.test(id));
  const loaded = needsDump.length ? (flags.from.length ? load(flags.from) : usage('caption: and deleted: ids need --from <the dumps they came from>')) : null;
  const idx = needsDump.length ? ledgers() : null;
  for (const id of ids) {
    const rec = { outcome, at };
    if (flags.note) rec.note = flags.note;
    const [kind, bid] = id.split(':');
    if (kind === 'caption') {
      const p = loaded.posts.get(bid), l = idx[bid];
      if (!p || typeof p.text !== 'string' || !l) { console.error(`!! ${id}: post not in the dumps or not in a ledger`); process.exit(1); }
      if (`caption:${bid}:${hash(p.text)}` !== id) { console.error(`!! ${id}: the caption in the dumps has changed since; run new again`); process.exit(1); }
      const s = span(state.captions && bid in state.captions ? state.captions[bid] : l.post.text, p.text);
      Object.assign(rec, { removed: s.removed, added: s.added });
      writeLedger(l, (post) => { post.text = p.text; });
      if (state.captions) delete state.captions[bid];
    } else if (kind === 'deleted') {
      const l = idx[bid];
      if (!l) { console.error(`!! ${id}: not in any ledger`); process.exit(1); }
      if (loaded.posts.has(bid)) { console.error(`!! ${id}: the post is in the dumps, so it is not deleted`); process.exit(1); }
      writeLedger(l, (post) => { post.status = 'deleted'; post.deletedAt = at; });
    }
    state.processed[id] = rec;
  }
  save();
  console.log(`marked ${ids.length} as ${outcome}`);
} else if (cmd === 'set-text') {
  const [bid, file] = args;
  if (!bid || !file) usage('usage: node feedback.js set-text <bufferId> <file with the exact text sent to edit_post>');
  const l = ledgers()[bid];
  if (!l) { console.error(`!! ${bid}: not in any ledger`); process.exit(1); }
  const text = fs.readFileSync(file, 'utf8').replace(/\n$/, '');
  writeLedger(l, (post) => { post.text = text; });
  if (state.captions && bid in state.captions) { delete state.captions[bid]; save(); }
  console.log(`${l.batch}: ${l.post.id} text set (${text.length} chars)`);
} else if (cmd === 'run') {
  const [result] = args;
  if (!['ok', 'failed'].includes(result)) usage('usage: node feedback.js run <ok|failed> [--note "..."]');
  state.runs.push(Object.assign({ at: NOW.toISOString(), result }, flags.note ? { note: flags.note } : {}));
  state.runs = state.runs.slice(-RUNS_KEPT);
  save();
  // Failures in a row, newest back. Alert on the second, then about once a day (4 runs a day).
  let streak = 0;
  for (let i = state.runs.length - 1; i >= 0 && state.runs[i].result === 'failed'; i--) streak++;
  const alert = result === 'failed' && streak >= 2 && streak % 4 === 2;
  console.log(`run recorded: ${result}${streak > 1 ? ` (${streak} failed in a row)` : ''}${alert ? '\nALERT: post the failure line in Slack' : ''}`);
} else usage();
