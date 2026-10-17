// Password gate for /cookbook/* (the page and the PDF), run by Cloudflare Pages Functions.
// The word is handed out in the Instagram DM flow (ManyChat "IG Cookbook"), so the page reads as
// members-only instead of a public URL. Three ways in, all set a one-year cookie:
//   1. the form on the gate page (POST, field "key")
//   2. a link that carries it:  /cookbook/?key=WORD   (the DM button can use this; the query string
//      is stripped on redirect so the word never sits in the address bar)
//   3. an existing cookie
// Everything else gets the gate page with a 401 and noindex. The password is COOKBOOK_PASSWORD in
// the Pages project's environment variables; DEFAULT_PASSWORD is the fallback until one is set.
// Matching ignores case and surrounding spaces. Change the word: every old cookie stops working.

const DEFAULT_PASSWORD = 'REALFOOD';
const COOKIE = 'cookbook_key';
const MAX_AGE = 60 * 60 * 24 * 365;

const norm = (s) => String(s || '').trim().toUpperCase();

// Cookie value = hex SHA-256 of the normalized word, so the word itself is never stored client-side.
async function token(word) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ieatz-cookbook:' + norm(word)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function cookieValue(request) {
  const m = (request.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  return m ? m[1] : null;
}

function setCookie(value) {
  return `${COOKIE}=${value}; Path=/cookbook; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

function gatePage(url, wrong) {
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>The Real Food Cookbook | iEatz Healthy</title>
<link rel="icon" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--paper:#F5F2EA;--green:#1F8B4C;--green-dark:#0E4A2A;--ink:#0A0F0C;--ink-medium:#5C625E;--ink-faint:#C8CDCA;--tomato:#C9412B}
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;background:var(--paper);color:var(--ink);font-family:"Inter Tight",system-ui,sans-serif;-webkit-font-smoothing:antialiased;display:flex;flex-direction:column}
main{flex:1;display:flex;align-items:center;justify-content:center;padding:48px 20px}
.card{width:100%;max-width:460px;text-align:center}
.badge{display:inline-flex;align-items:center;gap:10px;font-weight:600;font-size:17px;color:var(--ink);margin-bottom:40px}
.badge svg{width:22px;height:auto;color:var(--green)}
.eyebrow{font-weight:600;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--green);margin-bottom:14px}
h1{font-family:"Instrument Serif",Georgia,serif;font-weight:400;font-size:44px;line-height:1;letter-spacing:-.015em;color:var(--green-dark)}
p{font-size:16px;line-height:1.5;color:var(--ink-medium);margin-top:16px}
form{margin-top:28px;display:flex;flex-direction:column;gap:12px}
input{width:100%;font:inherit;font-size:18px;letter-spacing:.08em;text-transform:uppercase;text-align:center;padding:14px 16px;border:1.5px solid var(--ink-faint);border-radius:12px;background:#fff;color:var(--ink);outline:none}
input:focus{border-color:var(--green)}
button{font:inherit;font-weight:600;font-size:16px;padding:14px 22px;border:0;border-radius:999px;background:var(--green-dark);color:var(--paper);cursor:pointer}
.err{color:var(--tomato);font-size:14px;margin-top:4px}
.fine{font-size:13px;color:var(--ink-medium);margin-top:22px;line-height:1.5}
.fine a{color:var(--green-dark)}
</style>
</head>
<body>
<main>
<div class="card">
<div class="badge"><svg viewBox="0 0 38.25 58.486" fill="currentColor"><path d="M0 5.03C0 2.252 2.252 0 5.03 0h28.19c2.778 0 5.03 2.252 5.03 5.03v15.089H0z"/><path d="M0 49.83c0 2.778 2.252 5.03 5.03 5.03h28.19c2.778 0 5.03-2.252 5.03-5.03V22.81H0z"/><path d="M5.264 54.86h5.614l-.986 2.911a1.05 1.05 0 0 1-.997.715H7.2a1.05 1.05 0 0 1-1.002-.729zM27.489 54.86h5.614l-.986 2.911a1.05 1.05 0 0 1-.997.715h-1.695a1.05 1.05 0 0 1-1.002-.729z"/></svg>iEatz Healthy</div>
<div class="eyebrow">Members only</div>
<h1>The Real Food Cookbook</h1>
<p>30 healthy meals, all under 30 minutes. This page opens with the word from your DM.</p>
<form method="post" action="${esc(url.pathname)}" autocomplete="off">
<input type="text" name="key" placeholder="Enter the word" aria-label="The word from your DM" autocapitalize="characters" autofocus required>
${wrong ? '<div class="err">That is not it. Check the DM and try again.</div>' : ''}
<button type="submit">Open the cookbook</button>
</form>
<p class="fine">Don't have the word? Comment COOKBOOK on any <a href="https://www.instagram.com/ieatzhealthy/">@ieatzhealthy</a> post and it lands in your DMs.</p>
</div>
</main>
</body>
</html>`;
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const password = env && env.COOKBOOK_PASSWORD ? env.COOKBOOK_PASSWORD : DEFAULT_PASSWORD;
  const good = await token(password);

  // 3. cookie
  if (cookieValue(request) === good) return next();

  // 2. ?key=WORD on a GET: set the cookie, drop the key from the URL
  if (request.method === 'GET' && url.searchParams.has('key')) {
    if ((await token(url.searchParams.get('key'))) === good) {
      url.searchParams.delete('key');
      return new Response(null, { status: 302, headers: { Location: url.pathname + (url.search || ''), 'Set-Cookie': setCookie(good), 'Cache-Control': 'no-store' } });
    }
    url.searchParams.delete('key');
    return new Response(gatePage(url, true), { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
  }

  // 1. the form
  if (request.method === 'POST') {
    let word = '';
    try { word = (await request.formData()).get('key'); } catch (e) { word = ''; }
    if ((await token(word)) === good) {
      return new Response(null, { status: 303, headers: { Location: url.pathname, 'Set-Cookie': setCookie(good), 'Cache-Control': 'no-store' } });
    }
    return new Response(gatePage(url, true), { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
  }

  return new Response(gatePage(url, false), { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}
