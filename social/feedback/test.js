// Tests for feedback.js against the fixture dumps in fixtures/. Run: node social/feedback/test.js
// Each scenario gets a fresh temp copy of the fixture ledgers and its own state.json, so the
// real ledgers and state are never touched.
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { spawnSync } = require('child_process');

const FX = path.join(__dirname, 'fixtures');
const SCRIPT = path.join(__dirname, 'feedback.js');
const NOW = '2026-10-16T22:00:00Z';
const fx = (f) => path.join(FX, f);
const DUMPS = [fx('window.json'), fx('queue.json'), fx('ideas.json')];
const A = 'aaaaaaaaaaaaaaaaaaaaaaa1', B = 'bbbbbbbbbbbbbbbbbbbbbbb2', C = 'ccccccccccccccccccccccc3', D = 'ddddddddddddddddddddddd4', F = 'fffffffffffffffffffffff6';
const BASELINE = { baseline: { at: '2026-10-15T00:00:00Z', posts: 4, differ: 0 }, captions: {} };

function sandbox(state) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'feedback-test-'));
  fs.mkdirSync(path.join(dir, 'manifest'));
  for (const f of ['ledger.json', 'ledger-old.json']) fs.copyFileSync(fx(f), path.join(dir, 'manifest', f));
  if (state) fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify(state));
  const env = { ...process.env, FEEDBACK_STATE: path.join(dir, 'state.json'), FEEDBACK_MANIFEST: path.join(dir, 'manifest'), FEEDBACK_NOW: NOW };
  const run = (...args) => {
    const r = spawnSync(process.execPath, [SCRIPT, ...args], { env, encoding: 'utf8' });
    return { code: r.status, out: r.stdout, err: r.stderr };
  };
  const inbox = (dumps = DUMPS) => { const r = run('new', '--json', ...dumps); assert.strictEqual(r.code, 0, r.err); return JSON.parse(r.out); };
  const state_ = () => JSON.parse(fs.readFileSync(env.FEEDBACK_STATE, 'utf8'));
  const ledger = (f = 'ledger.json') => JSON.parse(fs.readFileSync(path.join(dir, 'manifest', f), 'utf8'));
  const dump = (name, obj) => { const p = path.join(dir, name); fs.writeFileSync(p, JSON.stringify(obj)); return p; };
  return { dir, run, inbox, state: state_, ledger, dump };
}
const ids = (r, kind) => r.items.filter(i => !kind || i.kind === kind).map(i => i.id);

let failed = 0;
function test(name, fn) {
  try { fn(); console.log(`ok - ${name}`); } catch (e) { failed++; console.log(`not ok - ${name}\n  ${e.stack.split('\n').slice(0, 3).join('\n  ')}`); }
}

test('a new note is listed, with its post and ledger entry', () => {
  const s = sandbox(BASELINE);
  const it = s.inbox().items.find(i => i.id === '6b0000000000000000000a01');
  assert(it, 'note a01 missing');
  assert.strictEqual(it.kind, 'note');
  assert.strictEqual(it.post.id, A);
  assert.strictEqual(it.post.channel, 'instagram');
  assert.strictEqual(it.ledger.id, 'a-ig');
  assert.strictEqual(it.ledger.batch, 'ledger.json');
});

test('an already-processed note is not listed', () => {
  const s = sandbox({ ...BASELINE, processed: { '6b0000000000000000000b03': { outcome: 'fix', at: '2026-10-14T10:00:00Z' } } });
  assert(!ids(s.inbox()).includes('6b0000000000000000000b03'));
});

test('a Buffer-generated note is ignored', () => {
  const s = sandbox(BASELINE);
  assert(!ids(s.inbox()).includes('6b0000000000000000000a02'));
});

test('an open question is listed again, flagged as reopened', () => {
  const s = sandbox({ ...BASELINE, processed: { '6b0000000000000000000b04': { outcome: 'question', at: '2026-10-15T10:00:00Z' } } });
  const it = s.inbox().items.find(i => i.id === '6b0000000000000000000b04');
  assert(it && it.reopened, 'question not listed again');
  assert.strictEqual(s.run('check', '6b0000000000000000000b04').code, 0);
});

test('a note on a sent post is listed (learning only)', () => {
  const s = sandbox(BASELINE);
  const it = s.inbox().items.find(i => i.id === '6b0000000000000000000e05');
  assert(it && it.post.status === 'sent');
});

test('an idea titled Feedback is listed, any other idea is not', () => {
  const s = sandbox(BASELINE);
  const r = s.inbox();
  assert(ids(r, 'idea').includes('6a1000000000000000000001'));
  assert(!ids(r, 'idea').includes('6a1000000000000000000002'));
});

test('a caption edit is listed with only the changed span, and marking it updates the ledger', () => {
  const s = sandbox(BASELINE);
  const caps = s.inbox().items.filter(i => i.kind === 'caption');
  assert.deepStrictEqual(caps.map(c => c.post.id), [B], 'expected exactly one caption edit, on B');
  const c = caps[0];
  assert.strictEqual(c.removed, 'No typing, no list.');
  assert.strictEqual(c.added, '');
  assert(c.before.includes('No typing, no list.') && !c.after.includes('No typing'), 'before/after spans wrong');
  assert(!c.before.includes('Savory oats'), 'span should not quote the whole caption');
  const m = s.run('mark', 'logged', c.id, '--from', ...DUMPS);
  assert.strictEqual(m.code, 0, m.err);
  assert.strictEqual(s.ledger().posts[1].text, 'Savory oats with a jammy egg, 24 g of protein in ten minutes. Full recipe on the site.');
  assert.strictEqual(s.state().processed[c.id].removed, 'No typing, no list.');
  assert.strictEqual(s.inbox().items.filter(i => i.kind === 'caption').length, 0, 'edit seen again after marking');
});

test('a normalization-only difference (whitespace, curly quote) is not an edit', () => {
  const s = sandbox(BASELINE);
  assert(!s.inbox().items.some(i => i.kind === 'caption' && i.post.id === D));
});

test('a caption cut made twice is flagged as a repeat', () => {
  const s = sandbox(BASELINE);
  const first = s.inbox().items.find(i => i.kind === 'caption');
  s.run('mark', 'logged', first.id, '--from', ...DUMPS);
  const q = JSON.parse(fs.readFileSync(fx('queue.json'), 'utf8'));
  q.posts.edges[0].node.text = q.posts.edges[0].node.text.replace(' No typing, no list.', '');
  const again = s.inbox([fx('window.json'), s.dump('queue2.json', q)]).items.find(i => i.kind === 'caption');
  assert(again && again.post.id === A, 'second cut not listed');
  assert.deepStrictEqual(again.repeatOf, [first.id]);
});

test('a stale caption id is refused by mark', () => {
  const s = sandbox(BASELINE);
  const r = s.run('mark', 'logged', `caption:${B}:00000000`, '--from', ...DUMPS);
  assert.notStrictEqual(r.code, 0);
});

test('a deleted post is listed, and marking it sets the ledger status', () => {
  const s = sandbox(BASELINE);
  const del = s.inbox().items.filter(i => i.kind === 'deleted');
  assert.deepStrictEqual(del.map(d => d.bufferId), [C], 'expected exactly C deleted');
  assert.strictEqual(del[0].ledger.topic, 'Receipt');
  assert.strictEqual(del[0].ledger.pillar, 'Budget');
  assert.strictEqual(s.run('mark', 'logged', `deleted:${C}`, '--from', ...DUMPS).code, 0);
  assert.strictEqual(s.ledger().posts[2].status, 'deleted');
  assert(!s.inbox().items.some(i => i.kind === 'deleted'));
});

test('a ledger older than the window is never read as deleted', () => {
  const s = sandbox(BASELINE);
  assert(!ids(s.inbox()).includes(`deleted:${F}`));
});

test('deletions are not checked from an incomplete listing or without the Window dump', () => {
  const s = sandbox(BASELINE);
  const w = JSON.parse(fs.readFileSync(fx('window.json'), 'utf8'));
  w.posts.pageInfo.hasNextPage = true;
  const r = s.inbox([s.dump('w1.json', w), fx('queue.json')]);
  assert(!r.items.some(i => i.kind === 'deleted'));
  assert(r.warnings.some(x => /more pages/.test(x)));
  const r2 = s.inbox([fx('queue.json')]);
  assert(!r2.items.some(i => i.kind === 'deleted'));
});

test('a post on a non-iEatz channel is ignored, notes and caption alike', () => {
  const s = sandbox(BASELINE);
  const r = s.inbox();
  assert(!ids(r).includes('6b0000000000000000000c06'));
  assert(!r.items.some(i => i.post && i.post.id === '99999999999999999999999a'));
  assert(r.warnings.some(x => /not on an iEatz channel/.test(x)));
});

test('the first run records a baseline and lists no caption edits; the next run is quiet and read-only', () => {
  const s = sandbox(null);
  const r = s.inbox();
  assert(r.baseline, 'no baseline reported');
  assert.strictEqual(r.items.filter(i => i.kind === 'caption').length, 0);
  assert(B in s.state().captions, 'B baseline text not recorded');
  assert(!(D in s.state().captions), 'normalization-only D should not need a baseline entry');
  const before = fs.readFileSync(path.join(s.dir, 'state.json'), 'utf8');
  const r2 = s.inbox();
  assert.strictEqual(r2.baseline, null);
  assert.strictEqual(r2.items.filter(i => i.kind === 'caption').length, 0, 'baseline did not absorb B');
  assert.strictEqual(fs.readFileSync(path.join(s.dir, 'state.json'), 'utf8'), before, 'a quiet run wrote state.json');
});

test('a caption edit made after the baseline is still caught', () => {
  const s = sandbox(null);
  s.inbox();
  const q = JSON.parse(fs.readFileSync(fx('queue.json'), 'utf8'));
  q.posts.edges[1].node.text += ' Two eggs.';
  const caps = s.inbox([fx('window.json'), s.dump('q.json', q)]).items.filter(i => i.kind === 'caption');
  assert.strictEqual(caps.length, 1);
  assert.strictEqual(caps[0].added, 'Two eggs.');
});

test('set-text records Claude\'s own copy edit so it is not read as Travis\'s', () => {
  const s = sandbox(BASELINE);
  const q = JSON.parse(fs.readFileSync(fx('queue.json'), 'utf8'));
  q.posts.edges[0].node.text = 'New caption Claude wrote.';
  const txt = path.join(s.dir, 'a.txt');
  fs.writeFileSync(txt, 'New caption Claude wrote.\n');
  assert.strictEqual(s.run('set-text', A, txt).code, 0);
  assert.strictEqual(s.ledger().posts[0].text, 'New caption Claude wrote.');
  assert(!s.inbox([fx('window.json'), s.dump('q.json', q)]).items.some(i => i.kind === 'caption' && i.post.id === A));
});

test('check exits 3 for a processed id and 0 for an open one', () => {
  const s = sandbox({ ...BASELINE, processed: { x1: { outcome: 'fix', at: NOW } } });
  assert.strictEqual(s.run('check', 'x1').code, 3);
  assert.strictEqual(s.run('check', 'x2').code, 0);
});

test('run keeps the last 20 and alerts on the second failure in a row, then about daily', () => {
  const s = sandbox(BASELINE);
  for (let i = 0; i < 22; i++) s.run('run', 'ok');
  assert.strictEqual(s.state().runs.length, 20);
  const alerts = [];
  for (let i = 1; i <= 7; i++) alerts.push(/ALERT/.test(s.run('run', 'failed', '--note', 'Buffer tools missing').out));
  assert.deepStrictEqual(alerts, [false, true, false, false, false, true, false]);
  s.run('run', 'ok');
  assert(!/ALERT/.test(s.run('run', 'failed').out), 'streak should reset after an ok run');
});

test('a post whose caption Travis edited is flagged travisEdited on later items', () => {
  const s = sandbox({ ...BASELINE, processed: { [`caption:${A}:12345678`]: { outcome: 'logged', at: NOW, removed: 'x', added: '' } } });
  const it = s.inbox().items.find(i => i.id === '6b0000000000000000000a01');
  assert.strictEqual(it.ledger.travisEdited, true);
  assert.strictEqual(s.inbox().items.find(i => i.id === '6b0000000000000000000e05').ledger.travisEdited, false);
});

test('the inbox lists nothing else: exactly the expected items', () => {
  const s = sandbox({ ...BASELINE, processed: { '6b0000000000000000000b03': { outcome: 'fix', at: NOW }, '6b0000000000000000000b04': { outcome: 'question', at: NOW } } });
  assert.deepStrictEqual(ids(s.inbox()).sort(), ['6a1000000000000000000001', '6b0000000000000000000a01', '6b0000000000000000000b04', '6b0000000000000000000e05',
    `caption:${B}:` + s.inbox().items.find(i => i.kind === 'caption').id.split(':')[2], `deleted:${C}`].sort());
});

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
