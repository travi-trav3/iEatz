'use strict';
// Polls each recipe page until it is live with the right body, then posts a
// commit status per slug: context "recipes/verify-live/<slug>", state
// success or failure, description with the reason. Fails the job if any
// page did not verify. Same body check as ieatz-social/pages/lib/verify-live.js.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ORIGIN = process.env.ORIGIN || 'https://ieatzhealthy.com';
const TIMEOUT = (parseInt(process.env.TIMEOUT_MINUTES || '20', 10)) * 60000;
const INTERVAL = (parseInt(process.env.INTERVAL_SECONDS || '30', 10)) * 1000;
const sha = process.env.GITHUB_SHA;
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;

function changedSlugs() {
  if (process.env.SLUGS && process.env.SLUGS.trim()) return process.env.SLUGS.split(',').map((s) => s.trim()).filter(Boolean);
  let files = '';
  try { files = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' }); } catch (e) { files = ''; }
  const slugs = new Set();
  for (const f of files.split('\n')) {
    const m = /^recipes\/([^/]+)\/index\.html$/.exec(f.trim());
    if (m) slugs.add(m[1]);
  }
  if (!slugs.size) for (const d of fs.readdirSync('recipes', { withFileTypes: true })) if (d.isDirectory() && fs.existsSync(path.join('recipes', d.name, 'index.html'))) slugs.add(d.name);
  return [...slugs];
}

function expectedOgTitle(slug) {
  const html = fs.readFileSync(path.join('recipes', slug, 'index.html'), 'utf8');
  const m = /<meta property="og:title" content="([^"]*)"/.exec(html);
  return m ? m[1] : null;
}

function checkBody(body, ogTitle) {
  const reasons = [];
  const m = /<meta property="og:title" content="([^"]*)"/.exec(body);
  if (!m) reasons.push('no og:title in body');
  else if (ogTitle && m[1] !== ogTitle) reasons.push(`og:title is "${m[1]}", expected "${ogTitle}"`);
  const blocks = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) reasons.push('no JSON-LD in body');
  for (const b of blocks) { try { JSON.parse(b[1]); } catch (e) { reasons.push(`JSON-LD does not parse: ${e.message}`); } }
  return reasons;
}

async function status(context, state, description) {
  if (!token || !sha || !repo) return;
  const res = await fetch(`https://api.github.com/repos/${repo}/statuses/${sha}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'content-type': 'application/json' },
    body: JSON.stringify({ state, context, description: description.slice(0, 140) }),
  });
  if (!res.ok) console.log(`status post failed: ${res.status} ${await res.text()}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function verify(slug) {
  const url = `${ORIGIN}/recipes/${slug}/`;
  const og = expectedOgTitle(slug);
  const deadline = Date.now() + TIMEOUT;
  let last = 'not attempted';
  let attempts = 0;
  while (Date.now() < deadline) {
    attempts++;
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'ieatz-verify-live', 'cache-control': 'no-cache' } });
      const body = await res.text();
      if (res.status === 200) {
        const reasons = checkBody(body, og);
        if (!reasons.length) return { ok: true, attempts, url };
        last = `200 but ${reasons.join('; ')}`;
        if (attempts === 1 || attempts % 10 === 0) {
          const title = (/<title>([^<]*)<\/title>/.exec(body) || [])[1] || '(no title)';
          console.log(`  served: <title>${title}</title>, ${body.length} bytes, server=${res.headers.get('server') || '?'}, cf-cache=${res.headers.get('cf-cache-status') || '?'}`);
        }
      } else last = `HTTP ${res.status}`;
    } catch (e) { last = `fetch error: ${e.message}`; }
    console.log(`${url}: attempt ${attempts}: ${last}`);
    await sleep(INTERVAL);
  }
  return { ok: false, attempts, url, reason: `timeout after ${attempts} attempts; last: ${last}` };
}

(async () => {
  const slugs = changedSlugs();
  console.log(`verifying: ${slugs.join(', ') || '(none)'}`);
  let failed = false;
  for (const slug of slugs) {
    await status(`recipes/verify-live/${slug}`, 'pending', 'polling');
    const r = await verify(slug);
    if (r.ok) { console.log(`LIVE ${r.url} after ${r.attempts} attempts`); await status(`recipes/verify-live/${slug}`, 'success', `live after ${r.attempts} attempts at ${new Date().toISOString()}`); }
    else { failed = true; console.log(`NOT LIVE ${r.url}: ${r.reason}`); await status(`recipes/verify-live/${slug}`, 'failure', r.reason); }
  }
  process.exit(failed ? 1 : 0);
})();
