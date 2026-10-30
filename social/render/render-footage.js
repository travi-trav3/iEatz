// Real-footage reels. Usage: node render-footage.js batches/<batch>.json [--only <file>]
// A post: { "file", "w": 1080, "h": 1920, "template": "footage", "video": "assets/video/raw/x.mp4",
//   "trim": [start, end]?, "hold": seconds (freeze the last frame)?, "speed": 1?, "footer"?,
//   "segments": [{ "trim": [a, b], "speed": s }, ...]? (a cut: each piece at its own speed, in
//   order, instead of one trim and one speed), "style": "center"? (type in the middle third),
//   "stabilize": true? (two-pass vid.stab on the whole clip before the cuts, for handheld walking),
//   "endCard": { "template": "device" | any static shell, ...its fields, "duration": 3 }? (a still
//   rendered from that shell at the reel size, cross-faded in after the footage; the proof or the
//   ask, in a shell the viewer has not just seen),
//   "audioLevel": -14? (loudnorm target; a quiet ambience clip wants -20 so the gain does not
//   turn room tone into hiss), "cover": 0.6? (the second the cover frame is taken from),
//   "overlays": [ { "head", "sub"?, "eyebrow"?, "at": "top"?, "from": s, "to": s }, ... ], "footageClaim": "..." }
//   (an overlay's "at": "top" puts that beat's type in the upper third, for a frame whose subject
//   fills the bottom, like a cart seen from the handle)
// For every overlay the footage shell renders a transparent PNG (type, scrim, badge); ffmpeg scales
// and crops the clip to the frame, holds the last frame if asked, fades the overlays in and out at
// their beats, keeps the clip's own sound (normalised to -14 LUFS) and writes <file>.mp4 plus a
// cover PNG from frame 0.6 s with the first overlay. Raw clips live in assets/video/raw (gitignored,
// originals in the Drive inbox); only the finished reel is committed.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright-core');
const sharp = require('sharp');
const { TEMPLATES } = require('./templates');
const { htmlDoc, prepare, chromePath, DIR } = require('./doc');

const REPO = path.resolve(DIR, '../..');
const PHOTOS = 'file://' + path.resolve(DIR, '../../assets/photos');
const batchPath = process.argv[2];
if (!batchPath) { console.error('usage: node render-footage.js <batch.json> [--only <file>]'); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
const oi = process.argv.indexOf('--only');
const only = oi > 0 ? process.argv[oi + 1] : null;
const posts = batch.posts.filter(p => p.template === 'footage' && (!only || p.file === only));
if (!posts.length) { console.error('!! no footage posts' + (only ? ` named "${only}"` : '')); process.exit(1); }
const OUT = path.join(DIR, 'out', batch.name);
const HTMLD = path.join(DIR, 'html', batch.name);
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(HTMLD, { recursive: true });

const probe = (f) => {
  const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=width,height,codec_type', '-of', 'json', f]));
  const v = j.streams.find(s => s.codec_type === 'video');
  return { duration: +j.format.duration, w: v.width, h: v.height, audio: j.streams.some(s => s.codec_type === 'audio') };
};

(async () => {
  const browser = await chromium.launch({ executablePath: chromePath(), args: ['--no-sandbox', '--force-color-profile=srgb'] });
  let bad = 0;
  for (const p of posts) {
    const src = path.join(REPO, p.video);
    if (!fs.existsSync(src)) { console.error(`!! ${p.file}: video not found: ${p.video}`); bad++; continue; }
    if (!(p.overlays || []).length) { console.error(`!! ${p.file}: no overlays`); bad++; continue; }
    if (!p.footageClaim) { console.error(`!! ${p.file}: footageClaim missing (say what the clip literally shows)`); bad++; continue; }
    const info = probe(src);
    const segs = p.segments || [{ trim: p.trim || [0, info.duration], speed: p.speed || 1 }];
    for (const s of segs) { s.speed = s.speed || 1; if (!s.trim || s.trim[1] <= s.trim[0] || s.trim[1] > info.duration + 0.05) { console.error(`!! ${p.file}: bad segment ${JSON.stringify(s)} (clip is ${info.duration}s)`); bad++; segs.length = 0; break; } }
    if (!segs.length) continue;
    const clipLen = segs.reduce((a, s) => a + (s.trim[1] - s.trim[0]) / s.speed, 0);
    const hold = p.hold || 0;
    const footLen = clipLen + hold;              // the footage, overlays live here
    const ec = p.endCard || null;
    const ecDur = ec ? (ec.duration || 3) : 0;
    const XF = ec ? (ec.fade != null ? ec.fade : 0.1) : 0;   // into the end card: a near-cut by default (ec.fade for a slower dissolve)
    const total = footLen + ecDur - XF;
    // 1. overlays: one transparent PNG per beat
    const pngs = [];
    let issues = [];
    for (let i = 0; i < p.overlays.length; i++) {
      const o = p.overlays[i];
      const q = { file: `${p.file}--ov${i + 1}`, w: p.w, h: p.h, template: 'footage', footer: p.footer, style: p.style, at: o.at, head: o.head, sub: o.sub, eyebrow: o.eyebrow, createdAt: batch.createdAt };
      let html;
      try { html = htmlDoc(q, PHOTOS); } catch (e) { console.error(`!! ${e.message}`); bad++; issues.push(e.message); break; }
      html = html.replace('<html', '<html class="footage"');
      const hp = path.join(HTMLD, q.file + '.html'); fs.writeFileSync(hp, html);
      const page = await browser.newPage({ viewport: { width: p.w, height: p.h }, deviceScaleFactor: 1 });
      await page.goto('file://' + hp, { waitUntil: 'load' });
      const { fc, safe } = await prepare(page);
      if (safe.length) issues.push(...safe);
      if (!Object.values(fc).every(Boolean)) issues.push('fonts missing');
      const png = path.join(OUT, q.file + '.png');
      await page.screenshot({ path: png, omitBackground: true, clip: { x: 0, y: 0, width: p.w, height: p.h } });
      await page.close();
      pngs.push({ png, from: o.from, to: o.to == null ? footLen : o.to });
    }
    // 1b. end card: a static shell rendered at the reel size
    let ecPng = null;
    if (ec) {
      const q = { ...ec, file: `${p.file}--end`, w: p.w, h: p.h, createdAt: batch.createdAt };
      delete q.duration;
      let html;
      try { html = htmlDoc(q, PHOTOS); } catch (e) { issues.push(`end card: ${e.message}`); html = null; }
      if (html) {
        const hp = path.join(HTMLD, q.file + '.html'); fs.writeFileSync(hp, html);
        const page = await browser.newPage({ viewport: { width: p.w, height: p.h }, deviceScaleFactor: 1 });
        await page.goto('file://' + hp, { waitUntil: 'load' });
        const { fc, safe } = await prepare(page);
        if (safe.length) issues.push(...safe.map(s => `end card: ${s}`));
        if (!Object.values(fc).every(Boolean)) issues.push('end card: fonts missing');
        ecPng = path.join(OUT, q.file + '.png');
        await page.screenshot({ path: ecPng, clip: { x: 0, y: 0, width: p.w, height: p.h } });
        await page.close();
      }
    }
    if (issues.length) { console.error(`!! ${p.file}: ${issues.join('; ')}`); bad++; continue; }
    // 2. composite with ffmpeg
    const out = path.join(OUT, p.file + '.mp4');
    const args = ['-v', 'error', '-y', '-i', src];
    for (const o of pngs) args.push('-loop', '1', '-t', String(footLen), '-i', o.png);
    if (ecPng) args.push('-loop', '1', '-t', String(ecDur), '-i', ecPng);
    const withAudio = info.audio && p.audio !== false;
    // atempo takes 0.5 to 2 per stage; chain stages for faster cuts
    const atempo = (s) => { const st = []; let x = s; while (x > 2) { st.push('atempo=2'); x /= 2; } while (x < 0.5) { st.push('atempo=0.5'); x *= 2; } st.push(`atempo=${x.toFixed(4)}`); return st.join(','); };
    const fc = [];
    let vin = '0:v';
    if (p.stabilize) {
      const trf = path.join(OUT, p.file + '.trf');
      try { execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', `vidstabdetect=shakiness=7:accuracy=15:result=${trf}`, '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] }); }
      catch (e) { console.error(`!! ${p.file}: vidstabdetect: ${String(e.stderr || e.message).slice(0, 300)}`); bad++; continue; }
      fc.push(`[0:v]vidstabtransform=input=${trf}:smoothing=24:zoom=3:optzoom=1:interpol=bicubic,unsharp=5:5:0.6:3:3:0.3[stab]`);
      fc.push(`[stab]split=${segs.length}${segs.map((s, i) => `[in${i}]`).join('')}`);
      vin = null;
    }
    segs.forEach((s, i) => {
      fc.push(`[${vin || `in${i}`}]trim=start=${s.trim[0]}:end=${s.trim[1]},setpts=(PTS-STARTPTS)/${s.speed}[sv${i}]`);
      if (withAudio) fc.push(`[0:a]atrim=start=${s.trim[0]}:end=${s.trim[1]},asetpts=PTS-STARTPTS,${atempo(s.speed)}[sa${i}]`);
    });
    fc.push(`${segs.map((s, i) => withAudio ? `[sv${i}][sa${i}]` : `[sv${i}]`).join('')}concat=n=${segs.length}:v=1:a=${withAudio ? 1 : 0}${withAudio ? '[cv][ca]' : '[cv]'}`);
    fc.push(`[cv]scale=${p.w}:${p.h}:force_original_aspect_ratio=increase,crop=${p.w}:${p.h},setsar=1,fps=30${hold ? `,tpad=stop_mode=clone:stop_duration=${hold}` : ''}[v0]`);
    if (withAudio) fc.push(`[ca]apad,atrim=0:${total},highpass=f=110,loudnorm=I=${p.audioLevel || -14}:TP=-1.5:LRA=11[aout]`);
    let last = 'v0';
    pngs.forEach((o, i) => {
      const fadeIn = i === 0 ? '' : `,fade=t=in:st=${o.from}:d=0.3:alpha=1`;
      const fadeOut = o.to < footLen ? `,fade=t=out:st=${Math.max(0, o.to - 0.3)}:d=0.3:alpha=1` : '';
      fc.push(`[${i + 1}:v]format=rgba${fadeIn}${fadeOut}[o${i}]`);
      fc.push(`[${last}][o${i}]overlay=0:0:enable='between(t,${o.from},${o.to})'[v${i + 1}]`);
      last = `v${i + 1}`;
    });
    if (ecPng) {
      fc.push(`[${pngs.length + 1}:v]scale=${p.w}:${p.h},setsar=1,fps=30,format=yuv420p[ec]`);
      fc.push(`[${last}]format=yuv420p[vf]`);
      fc.push(`[vf][ec]xfade=transition=fade:duration=${XF}:offset=${(footLen - XF).toFixed(3)}[vend]`);
      last = 'vend';
    }
    args.push('-filter_complex', fc.join(';'), '-map', `[${last}]`);
    if (withAudio) args.push('-map', '[aout]', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000'); // loudnorm upsamples to 192 kHz and aac picked 96 kHz; Instagram wants 48
    else args.push('-an');
    args.push('-t', String(total), '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out);
    try { execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) { console.error(`!! ${p.file}: ffmpeg: ${String(e.stderr || e.message).slice(0, 400)}`); bad++; continue; }
    // 3. cover: the frame at `cover` seconds (default 0.6) under whichever overlay is on at that moment
    const coverT = p.cover != null ? p.cover : 0.6;
    const frame = path.join(OUT, p.file + '-frame.png');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(coverT), '-i', out, '-frames:v', '1', frame]);
    const cover = path.join(OUT, p.file + '-cover.png');
    const onAt = pngs.find(o => coverT >= o.from && coverT < o.to) || pngs[0];
    await sharp(frame).composite([{ input: onAt.png }]).png().toFile(cover);
    fs.unlinkSync(frame);
    const o = probe(out);
    const mb = (fs.statSync(out).size / 1048576).toFixed(2);
    console.log(`OK ${p.file}.mp4 ${o.w}x${o.h} ${o.duration.toFixed(1)}s (${segs.length > 1 ? `${segs.length} cuts, ` : ''}${p.stabilize ? 'stabilized, ' : ''}clip ${clipLen.toFixed(1)}s${hold ? ` + hold ${hold}s` : ''}, source ${info.w}x${info.h}) ${mb}MB audio=${withAudio ? `clip at ${p.audioLevel || -14} LUFS` : 'none'} overlays=${pngs.length}${ec ? ` + end card ${ec.template} ${ecDur}s` : ''} + ${p.file}-cover.png`);
  }
  await browser.close();
  console.log(`\n${posts.length} footage post${posts.length === 1 ? '' : 's'}, ${bad} with issues.`);
  process.exit(bad ? 1 : 0);
})();
