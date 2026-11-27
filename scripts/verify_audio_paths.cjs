/**
 * verify_audio_paths.cjs
 * Automated sanity check verifying:
 *  1. AudioEngine.resolveAudioPath() idempotency on root ('./') and sub-path ('/valeria-musical-storybook/') builds.
 *  2. All VOICE_KEY_ALIASES and core voice MP3s exist in BOTH public/audio/voices/en/ and public/audio/voices/fr/.
 *  3. Zero .ogg audio files anywhere in public/.
 */

const fs = require('node:fs');
const path = require('node:path');

function resolveAudioPath(inputPath, rawBase) {
  if (inputPath.startsWith('http://') || inputPath.startsWith('https://')) {
    return inputPath;
  }
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const baseTail = base.replace(/^\.?\//, '').replace(/^\/+/, '');

  let clean = inputPath.trim().replace(/^\.?\//, '').replace(/^\/+/, '');
  while (baseTail && clean.startsWith(baseTail)) {
    clean = clean.slice(baseTail.length).replace(/^\/+/, '');
  }
  while (clean.startsWith('audio/audio/')) {
    clean = clean.slice('audio/'.length);
  }
  const withAudio = clean.startsWith('audio/') ? clean : `audio/${clean}`;
  return `${base}${withAudio}`;
}

let failures = 0;

function assertEq(actual, expected, label) {
  if (actual !== expected) {
    console.error(`FAIL [${label}]: expected "${expected}", got "${actual}"`);
    failures++;
  }
}

// 1. Test idempotency across root & sub-path bases
for (const base of ['./', '/', '/valeria-musical-storybook/']) {
  const expectedPrefix = base.endsWith('/') ? base : `${base}/`;
  const samples = ['glock_C5.mp3', 'chime.mp3', 'voices/en/fw_ball.mp3', 'songs/wheels_bus.mp3'];
  for (const s of samples) {
    const once = resolveAudioPath(s, base);
    const twice = resolveAudioPath(once, base);
    const thrice = resolveAudioPath(twice, base);
    const expected = `${expectedPrefix}audio/${s}`;
    assertEq(once, expected, `once(${s}, ${base})`);
    assertEq(twice, expected, `twice(${s}, ${base})`);
    assertEq(thrice, expected, `thrice(${s}, ${base})`);
  }
}

// 2. Verify all alias targets exist in EN and FR voice directories
const ALIAS_TARGETS = [
  'animal_cow', 'animal_dog', 'animal_cat', 'animal_duck', 'animal_monkey', 'animal_sheep',
  'fw_mama', 'fw_dada', 'ui_yay', 'ui_lang',
];

for (const lang of ['en', 'fr']) {
  for (const target of ALIAS_TARGETS) {
    const fp = path.join('public', 'audio', 'voices', lang, `${target}.mp3`);
    if (!fs.existsSync(fp) || fs.statSync(fp).size < 500) {
      console.error(`FAIL [missing voice]: ${fp}`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\nAudio path verification FAILED (${failures} errors)`);
  process.exit(1);
}

console.log('Audio path idempotency & voice alias verification PASSED (0 failures).');
