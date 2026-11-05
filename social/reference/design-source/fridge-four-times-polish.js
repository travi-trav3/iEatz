// Polish Travis's "Fridge four times" carousel in place and capture each slide at 1080x1350.
const { chromium } = require('/home/user/iEatz/social/render/node_modules/playwright-core');
const { chromePath } = require('/home/user/iEatz/social/render/doc.js');
const P = 'file:///home/user/iEatz/assets/photos/own/';
(async () => {
  const [src, outDir] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: chromePath(), args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
  await pg.goto('file://' + src, { waitUntil: 'load' });
  await pg.waitForFunction(() => !document.getElementById('__bundler_loading'), null, { timeout: 60000 }).catch(() => {});
  await pg.waitForTimeout(2500);
  await pg.evaluate((P) => {
    const css = document.createElement('style');
    css.textContent = `.z{zoom:1!important;box-shadow:none!important}
      .tag{position:absolute;font-family:var(--font-mono,ui-monospace,monospace);font-weight:500;font-size:28px;letter-spacing:.06em;text-transform:uppercase;padding:14px 22px;z-index:6;white-space:nowrap}
      .inside{list-style:none;margin:0;padding:0;display:grid;gap:26px}
      .inside li{display:flex;justify-content:space-between;align-items:baseline;gap:24px;border-bottom:1px solid rgba(245,242,234,.22);padding-bottom:22px}
      .inside .n{font-family:var(--font-serif);font-size:52px;line-height:1.05;color:#F5F2EA;letter-spacing:-.01em}
      .inside .t{font-family:var(--font-mono,ui-monospace,monospace);font-size:24px;color:#9FD7B1;white-space:nowrap}
      .thumbs{display:flex;gap:22px}
      .thumbs img{width:286px;height:286px;object-fit:cover;border:12px solid #fff;box-shadow:0 14px 30px rgba(48,38,14,.22)}
      .thumbs img:nth-child(1){transform:rotate(-3deg)} .thumbs img:nth-child(2){transform:rotate(2deg)} .thumbs img:nth-child(3){transform:rotate(-1.5deg)}
      .hl,.sub{text-wrap:pretty!important}`;
    document.head.appendChild(css);
    const sec = l => document.querySelector(`section[data-screen-label^="${l}"]`);
    const drop = el => el && el.parentNode && el.parentNode.removeChild(el);
    // 1 Hook: tell non-swipers there is a free cookbook
    sec('01').insertAdjacentHTML('beforeend', '<div class="tag" style="right:72px;top:72px;background:#C9412B;color:#F5F2EA;transform:rotate(3deg)">Free cookbook inside &rarr;</div>');
    // 2 Turn: complete sentences
    const s2 = sec('02');
    s2.querySelector('.hl').innerHTML = 'We planned 30 dinners <span class="green">so you don’t have to.</span>';
    s2.querySelector('.hl').style.fontSize = '124px';
    s2.querySelector('.sub').textContent = 'Every one takes under 30 minutes. Shop your usual store with the list, or tap the Instacart cart and have it delivered. Either way, the thinking is already done.';
    // 3 Nachos: complete sentences and the real-user proof
    const s3 = sec('03');
    s3.querySelector('.hl').textContent = 'Yes, there are loaded nachos in this cookbook.';
    s3.querySelector('.sub').textContent = 'It’s real food that looks like a Friday, not a diet.';
    s3.insertAdjacentHTML('beforeend', '<div class="tag" style="left:72px;top:72px;background:rgba(245,242,234,.92);color:#0E4A2A;text-transform:none;letter-spacing:.02em">Made by a real iEatz user</div>');
    // 4 What's inside: replaces the placeholder photo slide
    const s4 = sec('04');
    s4.style.background = '#0E4A2A';
    drop(s4.querySelector('.bleed')); drop(s4.querySelector('.fade'));
    const box = s4.querySelector('div[style*="bottom:150px"]');
    box.style.cssText = 'position:absolute;left:80px;right:80px;top:120px;display:grid;gap:56px';
    box.innerHTML = `<h2 class="hl" style="font-size:104px;line-height:0.98;color:#F5F2EA;max-width:900px">Here’s a taste<br><span style="font-style:italic;color:#9FD7B1">of what’s inside.</span></h2>
      <ul class="inside">
        <li><span class="n">One-pan garlic chicken and broccoli</span><span class="t">&lt;30 MIN</span></li>
        <li><span class="n">Ground beef and sweet potato skillet</span><span class="t">&lt;30 MIN</span></li>
        <li><span class="n">Black bean and corn quesadillas</span><span class="t">&lt;30 MIN</span></li>
        <li><span class="n">Shrimp and zucchini stir-fry</span><span class="t">&lt;30 MIN</span></li>
        <li><span class="n">Loaded sheet-pan nachos</span><span class="t">&lt;30 MIN</span></li>
      </ul>
      <p class="sub" style="font-size:34px;color:#F5F2EA">Plus 25 more, each with its own Instacart list.</p>`;
    // 5 Ask: complete sentence and proof thumbnails
    const s5 = sec('05');
    const h5 = s5.querySelector('.hl'); h5.innerHTML = 'Comment <span class="green" style="font-style:normal">COOKBOOK</span><br>and it’s yours.'; h5.style.fontSize = '124px';
    const sub5 = s5.querySelector('.sub'); sub5.textContent = 'We’ll DM you all 30 dinners. It’s free.';
    sub5.insertAdjacentHTML('afterend', `<div class="thumbs"><img src="${P}2026-10-29-travis-img6201.jpg" style="object-position:45% 55%"><img src="${P}2026-10-29-travis-img6315.jpg" style="object-position:50% 70%"><img src="${P}2026-10-29-travis-img6825.jpg" style="object-position:45% 62%"></div>`);
  }, P);
  await pg.waitForTimeout(1500);
  await pg.evaluate(async () => { await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
  const secs = await pg.$$('section.s');
  for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: `${outDir}/slide-${i + 1}.png` });
  // F-018 check on every text block
  const orphans = await pg.evaluate(() => {
    const out = [];
    document.querySelectorAll('section.s .hl, section.s .sub, section.s .tag, section.s .inside .n, section.s p').forEach(el => {
      const words = []; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(n.textContent))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const q = r.getClientRects()[0]; if (q) words.push({ w: m[0], top: q.top, h: q.height }); } }
      const lines = []; for (const w of words) { const L = lines[lines.length - 1]; if (L && Math.abs(w.top - L.top) < w.h * 0.5) L.ws.push(w.w); else lines.push({ top: w.top, ws: [w.w] }); }
      if (lines.length > 1) lines.forEach(L => { if (L.ws.length === 1) out.push(`"${L.ws[0]}" alone in "${el.textContent.trim().slice(0, 60)}"`); });
    });
    return out;
  });
  console.log('orphans:', orphans.length ? orphans.join(' | ') : 'none');
  await b.close();
})();
