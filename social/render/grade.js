// Render-time photo grade: one warm grade (+ optional CSS grain) so stock from six
// photographers reads as one camera. Source bytes in assets/photos are never touched;
// graded copies are cached in render/.grade-cache keyed by source hash + grade params.
// On by default for batches created on/after V2_FROM; per-post "grade": false opts out;
// app-*.jpg (real app screens) are never graded.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { mapPhotos } = require('./doc');

const V2_FROM = '2026-09-25';
const GRADE = { v: 1, brightness: 1.02, saturation: 0.92, tint: '#F2E9D6', strength: 0.12 };
const PHOTO_DIR = path.resolve(__dirname, '../../assets/photos');
const CACHE = path.join(__dirname, '.grade-cache');

const isV2 = (batch, p = {}) => { const c = p.createdAt || batch.createdAt; return !!c && c >= V2_FROM; };
const gradeOn = (p, batch) => p.grade === false ? false : p.grade === true ? true : isV2(batch, p);

const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });

async function gradeFile(rel) {
  if (/^app-/.test(path.basename(rel))) return rel;
  const buf = fs.readFileSync(path.join(PHOTO_DIR, rel));
  const key = crypto.createHash('sha1').update(buf).update(JSON.stringify(GRADE)).digest('hex').slice(0, 20);
  const out = path.join(CACHE, key + '.jpg');
  if (!fs.existsSync(out)) {
    fs.mkdirSync(CACHE, { recursive: true });
    const base = await sharp(buf).rotate().modulate({ brightness: GRADE.brightness, saturation: GRADE.saturation }).toColourspace('srgb').png({ compressionLevel: 0 }).toBuffer();
    // tint() swaps chroma for the target colour at full strength; lay that over the base
    // at GRADE.strength opacity for a low-strength warm wash.
    const wash = await sharp(base).tint(hex(GRADE.tint)).ensureAlpha(GRADE.strength).png({ compressionLevel: 0 }).toBuffer();
    const tmp = out + '.tmp';
    await sharp(base).composite([{ input: wash, blend: 'over' }]).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(tmp);
    fs.renameSync(tmp, out);
  }
  return path.relative(PHOTO_DIR, out);
}

// Returns the post with every photo field pointing at its graded copy (relative to assets/photos).
async function applyGrade(p) {
  const map = {};
  const q = mapPhotos(p, (f) => f);
  for (const f of require('./doc').photosOf(p)) map[f] = await gradeFile(f);
  return mapPhotos(q, (f) => map[f] || f);
}

module.exports = { V2_FROM, GRADE, isV2, gradeOn, gradeFile, applyGrade };
