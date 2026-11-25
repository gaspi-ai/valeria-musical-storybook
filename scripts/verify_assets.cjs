/**
 * verify_assets.cjs
 * Build-time media integrity validator for Valeria's Musical Storybook.
 * Ensures:
 *  1. Zero iOS-incompatible .ogg files or references exist.
 *  2. Zero unused .wav song files remain in public/audio/songs/.
 *  3. Every static local audio/Lottie reference in src/ exists in public/.
 *  4. Total public/ size stays under mobile budget (<= 55 MB).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SRC_DIR = path.join(ROOT, 'src');
const MAX_PUBLIC_MB = 55;

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

let errors = 0;

// 1. Scan public/
const publicFiles = walk(PUBLIC_DIR);
const publicMap = new Map();
let totalBytes = 0;

for (const file of publicFiles) {
  const rel = path.relative(PUBLIC_DIR, file).replace(/\\/g, '/');
  const size = fs.statSync(file).size;
  totalBytes += size;
  publicMap.set(rel, size);

  if (rel.endsWith('.ogg')) {
    console.error(`[ERROR] iOS-incompatible .ogg file found in public/: ${rel}`);
    errors++;
  }
  if (rel.startsWith('audio/songs/') && rel.endsWith('.wav')) {
    console.error(`[ERROR] Unused uncompressed .wav song found: ${rel}`);
    errors++;
  }
}

const totalMB = +(totalBytes / (1024 * 1024)).toFixed(2);
if (totalMB > MAX_PUBLIC_MB) {
  console.error(`[ERROR] public/ size is ${totalMB} MB (exceeds budget of ${MAX_PUBLIC_MB} MB)`);
  errors++;
}

// 2. Scan src/ for media string literals
const srcFiles = walk(SRC_DIR).filter(f => f.endsWith('.ts'));
const refRegex = /['"]([^'"`\n]+\.(?:mp3|ogg|wav|json))['"]/g;
const checkedRefs = new Set();

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = refRegex.exec(content)) !== null) {
    const raw = match[1];
    if (raw.startsWith('http://') || raw.startsWith('https://')) continue;
    if (raw.includes('${')) continue;
    if (raw.endsWith('manifest.json')) continue;

    if (raw.endsWith('.ogg')) {
      console.error(`[ERROR] .ogg reference in ${path.relative(ROOT, file)}: ${raw}`);
      errors++;
      continue;
    }

    const clean = raw.replace(/^\/+/, '');
    const normalized = (clean.startsWith('audio/') || clean.startsWith('animations/'))
      ? clean
      : `audio/${clean}`;

    checkedRefs.add(normalized);
    if (!publicMap.has(normalized)) {
      console.error(`[ERROR] Missing asset referenced in ${path.relative(ROOT, file)}: ${raw} (expected public/${normalized})`);
      errors++;
    } else if (publicMap.get(normalized) < 100) {
      console.error(`[ERROR] Asset appears empty/corrupt (${publicMap.get(normalized)} bytes): public/${normalized}`);
      errors++;
    }
  }
}

// 3. Verify required iOS/PWA icons
for (const icon of ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  if (!publicMap.has(icon)) {
    console.error(`[ERROR] Missing required PWA/iOS icon: public/${icon}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\nAsset verification FAILED with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log(`Asset verification PASSED! (${publicFiles.length} public files, ${totalMB} MB total, ${checkedRefs.size} static refs verified, 0 .ogg files)`);
}
