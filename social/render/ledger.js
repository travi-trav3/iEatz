// Loads a batch for the gates and normalizes every post to one shape.
// Input is either a Buffer ledger (social/manifest/<batch>.json) or a render batch
// (render/batches/<batch>.json). A ledger may point at its render batch with
// "renderBatch": "social/render/batches/<batch>.json"; posts are joined on the file stem
// (assets/.../x.png, x--01.png, x.mp4, x-cover.png all join to render post "x").
// Anatomy fields written at planning time win; anything missing is derived from the render
// post, and a written field that disagrees with the render is reported as a mismatch.
const fs = require('fs');
const path = require('path');
const { TEMPLATES, surfaceOf, footerOf } = require('./templates');
const { photosOf } = require('./doc');

const REPO = path.resolve(__dirname, '../..');
const STYLE = {};
for (const p of JSON.parse(fs.readFileSync(path.join(REPO, 'assets/photos/photos.json'), 'utf8')).photos) STYLE[p.file] = p.style;
const styleOf = (f) => !f ? null : /^app-/.test(path.basename(f)) ? 'product' : (STYLE[f] || 'unknown');

const stem = (f) => path.basename(String(f || '')).replace(/\.(png|mp4|jpe?g)$/i, '').replace(/-cover$/, '').replace(/--\d+$/, '');
const strip = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

// The line a viewer reads as the headline, per shell.
const headlineOf = (r) => r.head || r.seam || r.quote || (r.stat && r.sub ? `${r.stat} ${r.sub}` : r.stat || r.sub) || '';
// Headline ends in an italic accent span (the "green italic tail").
const ACCENT_TAIL = /<(em|i)\b[^>]*>[^<]*<\/\1>\s*[.!?]?\s*$|<span class="(accent|i)"[^>]*>[^<]*<\/span>\s*[.!?]?\s*$/;
const accentTailOf = (html) => ACCENT_TAIL.test(String(html || '').trim());

function inferChannel(r) {
  if (r.channel) return r.channel;
  if (r.w === 1000 && r.h === 1500) return 'pinterest';
  if (r.w === 1080) return 'instagram';
  return 'unknown';
}

// Derive every gate field from a render post (carousel: cover slide for anatomy, first photo slide for hero).
function derive(r) {
  const cover = r.slides ? r.slides[0] : r;
  const photoSlide = r.slides ? (r.slides.find(s => photosOf(s).length) || cover) : r;
  const hero = photosOf(photoSlide)[0] || null;
  return {
    template: r.slides ? 'carousel' : r.template,
    coverTemplate: cover.template,
    surface: surfaceOf(cover),
    format: r.slides ? 'carousel' : r.motion ? 'reel' : 'static',
    footer: footerOf(cover),
    eyebrow: !!cover.eyebrow,
    accentTail: accentTailOf(headlineOf(cover)),
    heroPhoto: hero,
    photoClaim: photoSlide.photoClaim || r.photoClaim || null,
    headline: strip(headlineOf(cover)),
  };
}

// Copy a gate should read: [{field, text}] for every rendered string plus caption fields.
const SKIP = new Set(['file', 'photo', 'objPos', 'template', 'footer', 'channel', 'dueAt', 'id', 'status', 'bufferId', 'slackAlert',
  'surface', 'pillar', 'topic', 'cta', 'heroPhoto', 'format', 'photoStyle', 'board', 'boardServiceId', 'labelSide', 'ink', 'bg', 'createdAt', 'url', 'alt']);
function copyOf(obj, prefix = '', out = []) {
  if (Array.isArray(obj)) { obj.forEach((v, i) => copyOf(v, `${prefix}[${i}]`, out)); return out; }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (SKIP.has(k) || k.startsWith('_') || k === 'motion') continue;
      copyOf(v, prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
  }
  if (typeof obj === 'string' && prefix) out.push({ field: prefix, text: obj });
  return out;
}

function load(file) {
  const abs = path.resolve(file);
  const batch = JSON.parse(fs.readFileSync(abs, 'utf8'));
  let render = null;
  if (batch.renderBatch) {
    const rp = path.resolve(REPO, batch.renderBatch);
    render = JSON.parse(fs.readFileSync(rp, 'utf8'));
  }
  const byStem = {};
  if (render) for (const r of render.posts) byStem[stem(r.file)] = r;
  const isRender = !render && batch.posts.some(p => p.template || p.slides) && batch.posts.every(p => !p.bufferId);
  const posts = [];
  const mismatches = [];
  for (const raw of batch.posts) {
    const r = render ? byStem[stem(raw.file)] : (raw.template || raw.slides ? raw : null);
    const d = r ? derive(r) : {};
    const post = {
      id: raw.id || raw.file,
      channel: inferChannel(raw.channel ? raw : (r || raw)),
      dueAt: raw.dueAt || (r && r.dueAt) || '',
      pillar: raw.pillar || (r && r.pillar), topic: raw.topic || (r && r.topic), cta: raw.cta || (r && r.cta),
      title: raw.title || (r && r.title) || '', text: raw.text || (r && r.text) || '', firstComment: raw.firstComment || (r && r.firstComment) || '',
      render: r,
    };
    for (const k of ['template', 'surface', 'format', 'footer', 'eyebrow', 'accentTail', 'heroPhoto', 'photoClaim']) {
      // A render batch read directly has no separate ledger: its props (eyebrow text, footer
      // default) are render inputs, so every anatomy field comes from derive().
      const written = r === raw ? (d[k] !== undefined ? d[k] : raw[k]) : raw[k];
      if (written !== undefined && written !== null) {
        post[k] = written;
        if (r && r !== raw && d[k] !== undefined && d[k] !== null && k !== 'template' && JSON.stringify(written) !== JSON.stringify(d[k]))
          mismatches.push(`${post.id}: ledger ${k}=${JSON.stringify(written)} but the render says ${JSON.stringify(d[k])}`);
      } else post[k] = d[k] !== undefined ? d[k] : null;
    }
    if (post.template === 'carousel' && !post.coverTemplate) post.coverTemplate = d.coverTemplate;
    post.coverTemplate = d.coverTemplate || post.template;
    post.photoStyle = raw.photoStyle || (r && r.photoStyle) || styleOf(post.heroPhoto);
    post.headline = d.headline || strip(raw.head || '');
    const seenCopy = new Set();
    post.copy = [...copyOf({ title: post.title, text: post.text, firstComment: post.firstComment }), ...(r ? copyOf(r) : [])]
      .filter(c => { const k = c.field + '\u0000' + c.text; if (seenCopy.has(k)) return false; seenCopy.add(k); return true; });
    posts.push(post);
  }
  return { batch, render, posts, mismatches, isRender, source: path.relative(REPO, abs) };
}

module.exports = { load, derive, stem, strip, headlineOf, accentTailOf, styleOf, copyOf };
