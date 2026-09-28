// Motion renderer. Usage: node render-motion.js batches/<batch>.json
// Same template registry, CSS, fonts, grade and photoClaim rules as render-batch.js. Every post
// with "motion": { duration, fps, timeline? } renders 1080x1920 frames by stepping the shell's
// window.setT(t), then encodes H.264 (yuv420p, crf 20, faststart). No audio track unless
// motion.audio is set (see audioPlan): sound is baked into the file so reels keep auto-publishing
// through Buffer, because Instagram's API cannot attach library music and posts file audio as
// "original audio".
// Outputs out/<name>/<file>.mp4 and <file>-cover.png (the final frame, for the ledger/manifest).
// Motion-capable shells: receipt, poster, bleed. Posts without "motion" are skipped.
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync, execFileSync } = require('child_process');
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const { TEMPLATES } = require('./templates');
const { photosOf, htmlDoc, prepare, chromePath, DIR } = require('./doc');
const { isV2, gradeOn, applyGrade } = require('./grade');

const PHOTOS = 'file://' + path.resolve(DIR, '../../assets/photos');
const AUDIO = path.resolve(DIR, '../../assets/audio');
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

// motion.audio: { bed, license, voice, voiceAt, bedDb }, files under assets/audio/.
// bed = music, looped or trimmed to the reel, faded in and out; it needs `license` naming where the
// track is cleared for Instagram (the business account only gets Meta Sound Collection).
// voice = a voiceover starting at voiceAt s (default 0.3). Both are loudness-matched first, so
// bedDb is the bed's level under the voice whatever the source files' levels (default -8); the
// bed also ducks further while the voice speaks. The mix is normalized to -14 LUFS, -1.5 dBTP.
function audioPlan(p) {
  const a = p.motion.audio;
  if (!a) return null;
  if (!a.bed && !a.voice) throw new Error(`${p.file}: motion.audio needs "bed" and/or "voice"`);
  if (a.bed && !a.license) throw new Error(`${p.file}: motion.audio.bed needs "license" (where the track is cleared for Instagram, e.g. "Meta Sound Collection")`);
  const file = (f) => {
    const fp = path.join(AUDIO, f);
    if (!fs.existsSync(fp)) throw new Error(`${p.file}: audio file not found: assets/audio/${f}`);
    return fp;
  };
  return { bed: a.bed && file(a.bed), voice: a.voice && file(a.voice), voiceAt: a.voiceAt ?? 0.3, bedDb: a.bedDb ?? -8 };
}

function mux(ff, video, plan, D, out, movflags) {
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', video];
  const f = [];
  const fmt = 'aformat=sample_rates=48000:channel_layouts=stereo';
  const match = 'loudnorm=I=-16:TP=-2,aresample=48000';
  let n = 1;
  if (plan.bed) {
    args.push('-stream_loop', '-1', '-i', plan.bed);
    const level = plan.voice ? `,${match},volume=${plan.bedDb}dB` : '';
    f.push(`[${n++}:a]${fmt},atrim=0:${D},asetpts=N/SR/TB${level},afade=t=in:st=0:d=0.3,afade=t=out:st=${(D - 1.2).toFixed(2)}:d=1.2[bed]`);
  }
  if (plan.voice) {
    const ms = Math.round(plan.voiceAt * 1000);
    args.push('-i', plan.voice);
    f.push(`[${n++}:a]${fmt}${plan.bed ? ',' + match : ''},adelay=${ms}:all=1,apad,atrim=0:${D}[vo]`);
  }
  if (plan.bed && plan.voice) f.push('[vo]asplit=2[vk][vm]', '[bed][vk]sidechaincompress=threshold=0.05:ratio=4:attack=15:release=400[duck]', '[duck][vm]amix=inputs=2:duration=first:normalize=0[mix]');
  const mixed = plan.bed && plan.voice ? '[mix]' : plan.bed ? '[bed]' : '[vo]';
  f.push(`${mixed}loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`);
  args.push('-filter_complex', f.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-t', String(D));
  if (movflags) args.push('-movflags', '+faststart');
  args.push(out);
  execFileSync(ff, args, { stdio: ['ignore', 'inherit', 'inherit'] });
}

// volumedetect prints to stderr and exits 0.
const volume = (ff, mp4) => {
  const s = String(spawnSync(ff, ['-hide_banner', '-i', mp4, '-map', '0:a', '-af', 'volumedetect', '-f', 'null', '-']).stderr || '');
  const num = (k) => { const m = s.match(new RegExp(`${k}: (-?[\\d.]+) dB`)); return m ? +m[1] : null; };
  return { mean: num('mean_volume'), max: num('max_volume') };
};

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
    let html, plan;
    try {
      plan = audioPlan(p);
      html = htmlDoc(graded ? await applyGrade(p) : p, PHOTOS, { motion: true });
    } catch (e) { console.error(`!! ${e.message}`); bad++; continue; }
    const hp = path.join(HTMLD, p.file + '.motion.html');
    fs.writeFileSync(hp, html);
    const page = await browser.newPage({ viewport: { width: W, height: H, deviceScaleFactor: 2 } });
    await page.goto('file://' + hp, { waitUntil: 'load' });
    const { imgs, fc } = await prepare(page);
    if (!Object.values(fc).every(Boolean)) problems.push('fonts=' + JSON.stringify(fc));
    if (!imgs.every(i => i.ok)) problems.push('photo=FAIL');
    const mp4 = path.join(OUT, p.file + '.mp4');
    const silent = plan ? path.join(OUT, p.file + '.video.mp4') : mp4;
    const enc = encoder(ff, fps, silent, movflags);
    const n = Math.round(duration * fps);
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await page.evaluate((tt) => window.setT(tt), i / fps);
      await enc.write(await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } }));
    }
    await enc.end();
    if (plan) {
      try { mux(ff, silent, plan, duration, mp4, movflags); }
      catch (e) { console.error(`!! ${p.file}: audio mix failed: ${e.message}`); bad++; await page.close(); continue; }
      finally { fs.rmSync(silent, { force: true }); }
    }
    // Cover = the fully-built final state; matches the static render of the same post to within
    // a few 1-level pixel differences (inline transforms at rest), i.e. visually identical.
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
    let audio = 'audio=none';
    if (!plan) {
      if (/Audio:/.test(probe)) problems.push('has audio track');
    } else {
      const a = (probe.match(/Audio: ([^\n]+)/) || [])[1] || '';
      const vol = volume(ff, mp4);
      audio = `audio=${[plan.bed && 'bed', plan.voice && 'voice'].filter(Boolean).join('+')} mean=${vol.mean}dB max=${vol.max}dB`;
      if (!/aac/.test(a) || !/48000 Hz/.test(a)) problems.push('audio stream=' + (a || 'MISSING'));
      if (vol.max === null || vol.max > -0.5) problems.push('audio clipping');
      if (vol.mean === null || vol.mean < -35) problems.push('audio near silent');
    }
    const ok = !problems.length;
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : '!! '}${p.file}.mp4 ${W}x${H} ${duration}s@${fps}fps ${n} frames ${mb.toFixed(2)}MB ${((Date.now() - t0) / 1000).toFixed(0)}s ${Object.entries(fc).map(([k, v]) => `${k}=${v}`).join(' ')} photo=${photos.join(',') || '(none)'}${graded ? ' grade=on' : ''} ${audio} + ${p.file}-cover.png${problems.length ? ' ' + problems.join(' ') : ''}`);
  }
  await browser.close();
  console.log(`\n${posts.length} motion posts, ${bad} with automated-QA issues.`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e.message || e); process.exit(1); });
