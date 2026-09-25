// Motion renderer. Usage: node render-motion.js batches/<batch>.json
// Same template registry, CSS, fonts, grade and photoClaim rules as render-batch.js. Every post
// with "motion": { duration, fps, timeline? } renders 1080x1920 frames by stepping the shell's
// window.setT(t), then encodes H.264 (yuv420p, crf 20, faststart) with no audio track.
// Outputs out/<name>/<file>.mp4 and <file>-cover.png (the final frame, for the ledger/manifest).
// Motion-capable shells: receipt, poster, bleed. Posts without "motion" are skipped.
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const { TEMPLATES } = require('./templates');
const { photosOf, htmlDoc, prepare, chromePath, DIR } = require('./doc');
const { isV2, gradeOn, applyGrade } = require('./grade');

const PHOTOS = 'file://' + path.resolve(DIR, '../../assets/photos');
const W = 1080, H = 1920, MAX_MB = 2;

// ffmpeg: $FFMPEG, then Playwright's bundled build, then the system one; first with libx264 wins.
// (Playwright's build ships VP8 only, so on most machines this lands on the system ffmpeg.)
let skipped = [];
function findFfmpeg() {
  const bundled = (() => { try { return execFileSync('sh', ['-c', 'ls /opt/pw-browsers/ffmpeg-*/ffmpeg-linux 2>/dev/null']).toString().trim().split('\n').filter(Boolean); } catch (e) { return []; } })();
  const tried = [];
  for (const c of [process.env.FFMPEG, ...bundled, 'ffmpeg'].filter(Boolean)) {
    try {
      const enc = execFileSync(c, ['-hide_banner', '-encoders'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      if (/\blibx264\b/.test(enc)) { skipped = tried; return c; }
      tried.push(`${c} (no libx264)`);
    } catch (e) { tried.push(`${c} (not runnable)`); }
  }
  throw new Error(`no ffmpeg with libx264. Tried: ${tried.join(', ')}. Install ffmpeg (brew install ffmpeg / apt-get install ffmpeg) or set FFMPEG=/path/to/ffmpeg.`);
}
const hasMovflags = (ff) => { try { return /movflags/.test(execFileSync(ff, ['-hide_banner', '-h', 'muxer=mp4'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString()); } catch (e) { return false; } };

const batchPath = process.argv[2];
if (!batchPath) { console.error('usage: node render-motion.js <batch.json>'); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
const OUT = path.join(DIR, 'out', batch.name);
const HTMLD = path.join(DIR, 'html', batch.name);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(HTMLD, { recursive: true });

function encoder(ff, fps, out, movflags) {
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-vf', `scale=${W}:${H}:flags=lanczos`, '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '20',
    '-maxrate', '1600k', '-bufsize', '3200k', '-r', String(fps), '-an'];
  if (movflags) args.push('-movflags', '+faststart');
  args.push(out);
  const proc = spawn(ff, args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => proc.on('close', c => c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));
  const write = (buf) => new Promise(r => { if (proc.stdin.write(buf)) r(); else proc.stdin.once('drain', r); });
  return { write, end: () => { proc.stdin.end(); return done; } };
}

(async () => {
  const posts = batch.posts.filter(p => p.motion);
  if (!posts.length) { console.error(`no posts with "motion" in ${batchPath}`); process.exit(1); }
  const ff = findFfmpeg();
  const movflags = hasMovflags(ff);
  console.log(`ffmpeg: ${ff}${movflags ? '' : ' (no -movflags support: faststart skipped)'}${skipped.length ? `; skipped ${skipped.join(', ')}` : ''}`);
  const browser = await chromium.launch({ executablePath: chromePath(), args: ['--no-sandbox', '--force-color-profile=srgb'] });
  let bad = 0;
  for (const post of posts) {
    const p = { ...post, w: post.w || W, h: post.h || H };
    const t = TEMPLATES[p.template];
    const problems = [];
    if (!t) { console.error(`!! unknown template "${p.template}" for ${p.file}`); bad++; continue; }
    if (typeof t.motion !== 'function') { console.error(`!! ${p.file}: template "${p.template}" is not motion-capable`); bad++; continue; }
    if (p.w !== W || p.h !== H) { console.error(`!! ${p.file}: motion renders ${W}x${H}, post says ${p.w}x${p.h}`); bad++; continue; }
    const duration = p.motion.duration || 8, fps = p.motion.fps || 24;
    p.motion = { ...p.motion, duration, fps };
    const photos = photosOf(p);
    if (isV2(batch, p) && photos.length && !p.photoClaim) problems.push('photoClaim=MISSING');
    const graded = photos.some(f => !/^app-/.test(path.basename(f))) && gradeOn(p, batch);
    let html;
    try { html = htmlDoc(graded ? await applyGrade(p) : p, PHOTOS, { motion: true }); } catch (e) { console.error(`!! ${e.message}`); bad++; continue; }
    const hp = path.join(HTMLD, p.file + '.motion.html');
    fs.writeFileSync(hp, html);
    const page = await browser.newPage({ viewport: { width: W, height: H, deviceScaleFactor: 2 } });
    await page.goto('file://' + hp, { waitUntil: 'load' });
    const { imgs, fc } = await prepare(page);
    if (!Object.values(fc).every(Boolean)) problems.push('fonts=' + JSON.stringify(fc));
    if (!imgs.every(i => i.ok)) problems.push('photo=FAIL');
    const mp4 = path.join(OUT, p.file + '.mp4');
    const enc = encoder(ff, fps, mp4, movflags);
    const n = Math.round(duration * fps);
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await page.evaluate((tt) => window.setT(tt), i / fps);
      await enc.write(await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } }));
    }
    await enc.end();
    // Cover = the fully-built final state (identical to the static render of the same post).
    await page.evaluate((tt) => window.setT(tt), duration);
    const cover = path.join(OUT, p.file + '-cover.png');
    await sharp(await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } })).resize(W, H, { fit: 'fill', kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(cover);
    await page.close();
    const mb = fs.statSync(mp4).size / 1048576;
    if (mb >= MAX_MB) problems.push(`size ${mb.toFixed(2)}MB >= ${MAX_MB}MB`);
    let probe = '';
    try { probe = execFileSync(ff, ['-hide_banner', '-i', mp4], { stdio: ['ignore', 'pipe', 'pipe'] }).toString(); } catch (e) { probe = String(e.stderr || ''); }
    const v = (probe.match(/Video: ([^\n]+)/) || [])[1] || '?';
    if (!/h264/.test(v) || !/yuv420p/.test(v) || !/1080x1920/.test(v)) problems.push('stream=' + v);
    if (/Audio:/.test(probe)) problems.push('has audio track');
    const ok = !problems.length;
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : '!! '}${p.file}.mp4 ${W}x${H} ${duration}s@${fps}fps ${n} frames ${mb.toFixed(2)}MB ${((Date.now() - t0) / 1000).toFixed(0)}s ${Object.entries(fc).map(([k, v]) => `${k}=${v}`).join(' ')} photo=${photos.join(',') || '(none)'}${graded ? ' grade=on' : ''} + ${p.file}-cover.png${problems.length ? ' ' + problems.join(' ') : ''}`);
  }
  await browser.close();
  console.log(`\n${posts.length} motion posts, ${bad} with automated-QA issues.`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e.message || e); process.exit(1); });
