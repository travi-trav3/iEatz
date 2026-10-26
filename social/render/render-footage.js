// Real-footage reels. Usage: node render-footage.js batches/<batch>.json [--only <file>]
// A post: { "file", "w": 1080, "h": 1920, "template": "footage", "video": "assets/video/raw/x.mp4",
//   "trim": [start, end]?, "hold": seconds (freeze the last frame)?, "speed": 1?, "footer"?,
//   "overlays": [ { "head", "sub"?, "eyebrow"?, "from": s, "to": s }, ... ], "footageClaim": "..." }
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
    const trim = p.trim || [0, info.duration];
    const speed = p.speed || 1;
    const clipLen = (trim[1] - trim[0]) / speed;
    const hold = p.hold || 0;
    const total = clipLen + hold;
    // 1. overlays: one transparent PNG per beat
    const pngs = [];
    let issues = [];
    for (let i = 0; i < p.overlays.length; i++) {
      const o = p.overlays[i];
      const q = { file: `${p.file}--ov${i + 1}`, w: p.w, h: p.h, template: 'footage', footer: p.footer, head: o.head, sub: o.sub, eyebrow: o.eyebrow, createdAt: batch.createdAt };
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
      pngs.push({ png, from: o.from, to: o.to == null ? total : o.to });
    }
    if (issues.length) { console.error(`!! ${p.file}: ${issues.join('; ')}`); bad++; continue; }
    // 2. composite with ffmpeg
    const out = path.join(OUT, p.file + '.mp4');
    const args = ['-v', 'error', '-y', '-ss', String(trim[0]), '-to', String(trim[1]), '-i', src];
    for (const o of pngs) args.push('-loop', '1', '-t', String(total), '-i', o.png);
    const fc = [];
    fc.push(`[0:v]setpts=PTS/${speed},scale=${p.w}:${p.h}:force_original_aspect_ratio=increase,crop=${p.w}:${p.h},setsar=1,fps=30${hold ? `,tpad=stop_mode=clone:stop_duration=${hold}` : ''}[v0]`);
    let last = 'v0';
    pngs.forEach((o, i) => {
      const fadeIn = i === 0 ? '' : `,fade=t=in:st=${o.from}:d=0.3:alpha=1`;
      const fadeOut = o.to < total ? `,fade=t=out:st=${Math.max(0, o.to - 0.3)}:d=0.3:alpha=1` : '';
      fc.push(`[${i + 1}:v]format=rgba${fadeIn}${fadeOut}[o${i}]`);
      fc.push(`[${last}][o${i}]overlay=0:0:enable='between(t,${o.from},${o.to})'[v${i + 1}]`);
      last = `v${i + 1}`;
    });
    args.push('-filter_complex', fc.join(';'), '-map', `[${last}]`);
    if (info.audio && p.audio !== false) args.push('-map', '0:a', '-af', `atempo=${Math.min(2, Math.max(0.5, speed))},apad,atrim=0:${total},loudnorm=I=-14:TP=-1.5:LRA=11`, '-c:a', 'aac', '-b:a', '128k');
    else args.push('-an');
    args.push('-t', String(total), '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out);
    try { execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) { console.error(`!! ${p.file}: ffmpeg: ${String(e.stderr || e.message).slice(0, 400)}`); bad++; continue; }
    // 3. cover: frame at 0.6 s under the first overlay
    const frame = path.join(OUT, p.file + '-frame.png');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '0.6', '-i', out, '-frames:v', '1', frame]);
    const cover = path.join(OUT, p.file + '-cover.png');
    await sharp(frame).composite([{ input: pngs[0].png }]).png().toFile(cover);
    fs.unlinkSync(frame);
    const o = probe(out);
    const mb = (fs.statSync(out).size / 1048576).toFixed(2);
    console.log(`OK ${p.file}.mp4 ${o.w}x${o.h} ${o.duration.toFixed(1)}s (clip ${clipLen.toFixed(1)}s${hold ? ` + hold ${hold}s` : ''}, source ${info.w}x${info.h}) ${mb}MB audio=${info.audio && p.audio !== false ? 'clip' : 'none'} overlays=${pngs.length} + ${p.file}-cover.png`);
  }
  await browser.close();
  console.log(`\n${posts.length} footage post${posts.length === 1 ? '' : 's'}, ${bad} with issues.`);
  process.exit(bad ? 1 : 0);
})();
