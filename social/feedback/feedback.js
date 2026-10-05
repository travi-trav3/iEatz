// Feedback inbox for Travis's Buffer notes. The Buffer API is reached through MCP tools, so the
// session saves the query result to a file and this script does the deterministic part:
//
//   node feedback.js new <dump.json> [<dump.json> ...]
//       Each dump is one page of the posts query or the ideas query (any order). Lists every
//       user-written note, and every idea titled "Feedback...", not yet in state.json, oldest
//       first, with the ledger entry the post came from (file, shell, photo).
//   node feedback.js mark <outcome> <id> [<id> ...]
//       Records ids as processed. outcome: rule | fix | rule+fix | answered | no-op | question
//       ("question" ids stay open and are listed again by `new` until marked otherwise).
//
// The dumps are the raw JSON results of the two queries in README.md.
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const STATE = path.join(DIR, 'state.json');
const MANIFEST = path.join(DIR, '../manifest');

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { processed: {}, runs: [] };
const save = () => fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');
// Accepts the bare query result, {result: ...}, or a saved MCP tool result ([{type, text}, ...]).
function read(f) {
  let j = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (Array.isArray(j)) j = j.map(x => { try { return JSON.parse(x.text); } catch (e) { return null; } }).find(x => x && (x.posts || x.ideas)) || {};
  return j.result || j;
}
const iso = (t) => typeof t === 'number' ? new Date(t > 1e12 ? t : t * 1000).toISOString() : t;

// bufferId -> { ledger, file, template, photo, status }
function ledgerIndex() {
  const idx = {};
  for (const f of fs.readdirSync(MANIFEST).filter(f => f.endsWith('.json'))) {
    let m; try { m = JSON.parse(fs.readFileSync(path.join(MANIFEST, f), 'utf8')); } catch (e) { continue; }
    for (const p of m.posts || []) {
      if (!p.bufferId) continue;
      idx[p.bufferId] = { ledger: f, file: p.file || p.id, template: p.template, photo: p.heroPhoto || p.photo, status: p.status };
    }
  }
  return idx;
}

function open(id) { const s = state.processed[id]; return !s || s.outcome === 'question'; }

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'new') {
  if (!args.length) { console.error('usage: node feedback.js new <dump.json> [<dump.json> ...]'); process.exit(1); }
  const idx = ledgerIndex();
  const items = [];
  const seen = new Set();
  for (const f of args) {
    const d = read(f);
    if (!d.posts && !d.ideas) { console.error(`!! ${f}: neither a posts nor an ideas query result`); process.exit(1); }
    for (const { node: post } of (d.posts && d.posts.edges) || []) {
      for (const n of post.notes || []) {
        if (n.type !== 'userGenerated' || !open(n.id) || seen.has(n.id)) continue;
        seen.add(n.id);
        items.push({ kind: 'note', id: n.id, at: n.updatedAt || n.createdAt, author: n.author && (n.author.name || n.author.email), text: n.text,
          post: { id: post.id, channel: post.channelService, status: post.status, dueAt: post.dueAt, ledger: idx[post.id] || null } });
      }
    }
    for (const { node: idea } of (d.ideas && d.ideas.edges) || []) {
      const c = idea.content || {};
      if (!/^\s*feedback\b/i.test(c.title || '') || !open(idea.id) || seen.has(idea.id)) continue;
      seen.add(idea.id);
      items.push({ kind: 'idea', id: idea.id, at: iso(idea.updatedAt || idea.createdAt), text: `${c.title}\n${c.text || ''}`.trim() });
    }
  }
  items.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  if (!items.length) { console.log('No new feedback.'); process.exit(0); }
  for (const it of items) {
    const p = it.post;
    console.log(`\n[${it.kind} ${it.id}] ${it.at}${it.author ? ' by ' + it.author : ''}${state.processed[it.id] ? ' (open question)' : ''}`);
    if (p) console.log(`  on ${p.channel} post ${p.id} (${p.status}, due ${p.dueAt})${p.ledger ? ` -> ${p.ledger.ledger}: ${p.ledger.file} [${p.ledger.template || '?'}${p.ledger.photo ? ', ' + p.ledger.photo : ''}]` : ' -> not in any ledger'}`);
    console.log('  ' + it.text.replace(/\n/g, '\n  '));
  }
  console.log(`\n${items.length} item(s) to process.`);
} else if (cmd === 'mark') {
  const [outcome, ...ids] = args;
  const OK = ['rule', 'fix', 'rule+fix', 'answered', 'no-op', 'question'];
  if (!OK.includes(outcome) || !ids.length) { console.error(`usage: node feedback.js mark <${OK.join('|')}> <id> [<id> ...]`); process.exit(1); }
  const at = new Date().toISOString();
  for (const id of ids) state.processed[id] = { outcome, at };
  state.runs.push({ at, outcome, ids });
  save();
  console.log(`marked ${ids.length} as ${outcome}`);
} else {
  console.error('usage: node feedback.js new <dump.json>... | mark <outcome> <id...>');
  process.exit(1);
}
