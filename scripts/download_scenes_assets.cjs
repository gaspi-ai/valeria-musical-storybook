const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'audio');
fs.mkdirSync(targetDir, { recursive: true });

async function downloadFile(name, url) {
  const dest = path.join(targetDir, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`[EXISTS] ${name} (${fs.statSync(dest).size} bytes)`);
    return;
  }
  try {
    console.log(`[FETCHING] ${name} from ${url}...`);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`[SAVED] ${name} (${buf.length} bytes)`);
  } catch (err) {
    console.error(`[ERROR] ${name}:`, err.message);
  }
}

async function extractSoundfont(url, prefix, notes) {
  try {
    console.log(`[SOUNDFONT] Fetching ${prefix} from ${url}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    for (const note of notes) {
      const idx = text.indexOf(`"${note}":`);
      if (idx !== -1) {
        const start = text.indexOf('data:audio/mp3;base64,', idx);
        const end = text.indexOf('"', start);
        if (start !== -1 && end !== -1) {
          const b64 = text.substring(start + 22, end);
          const buf = Buffer.from(b64, 'base64');
          const fileName = `${prefix}_${note}.mp3`;
          fs.writeFileSync(path.join(targetDir, fileName), buf);
          console.log(`[SAVED SF] ${fileName} (${buf.length} bytes)`);
        }
      }
    }
  } catch (err) {
    console.error(`[ERROR SF] ${prefix}:`, err.message);
  }
}

async function extractSoundfontFirst(url, outName) {
  try {
    console.log(`[SOUNDFONT FIRST] Fetching ${outName} from ${url}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const start = text.indexOf('data:audio/mp3;base64,');
    if (start !== -1) {
      const end = text.indexOf('"', start);
      const b64 = text.substring(start + 22, end);
      const buf = Buffer.from(b64, 'base64');
      fs.writeFileSync(path.join(targetDir, outName), buf);
      console.log(`[SAVED SF FIRST] ${outName} (${buf.length} bytes)`);
    }
  } catch (err) {
    console.error(`[ERROR SF FIRST] ${outName}:`, err.message);
  }
}

async function run() {
  console.log('--- Downloading SFX Assets ---');
  await downloadFile('cow.ogg', 'https://raw.githubusercontent.com/moonlit111/AmbientSoundGenerator/master/www/audio/animals/cows.ogg');
  await downloadFile('sheep.ogg', 'https://raw.githubusercontent.com/moonlit111/AmbientSoundGenerator/master/www/audio/animals/sheep.ogg');
  await downloadFile('duck.mp3', 'https://raw.githubusercontent.com/jonjonsson/SoundMonster/master/Public%20domain/quack%20duck.mp3');
  await downloadFile('slide_whistle.mp3', 'https://raw.githubusercontent.com/jonjonsson/SoundMonster/master/Public%20domain/flute%20slide%20cartoon%20falling.mp3');
  await downloadFile('snore.mp3', 'https://raw.githubusercontent.com/jonjonsson/SoundMonster/master/Public%20domain/snore%20loop.mp3');
  await downloadFile('rain.ogg', 'https://raw.githubusercontent.com/moonlit111/AmbientSoundGenerator/master/www/audio/rain/light-rain.ogg');
  await downloadFile('river.ogg', 'https://raw.githubusercontent.com/moonlit111/AmbientSoundGenerator/master/www/audio/nature/river.ogg');
  await downloadFile('row_boat.ogg', 'https://raw.githubusercontent.com/moonlit111/AmbientSoundGenerator/master/www/audio/transport/rowing-boat.ogg');
  await downloadFile('bubbles.ogg', 'https://raw.githubusercontent.com/moonlit111/AmbientSoundGenerator/master/www/audio/things/bubbles.ogg');
  await downloadFile('animal_sprites.mp3', 'https://raw.githubusercontent.com/gustavocardoso/animals/master/src/audio/animals/sounds-160.mp3');

  console.log('--- Extracting Soundfonts ---');
  const pentatonicNotes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6'];
  await extractSoundfont('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/banjo-mp3.js', 'banjo', pentatonicNotes);
  await extractSoundfont('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/celesta-mp3.js', 'celesta', pentatonicNotes);
  await extractSoundfont('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/orchestral_harp-mp3.js', 'harp', pentatonicNotes);
  await extractSoundfont('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3.js', 'nylon_guitar', pentatonicNotes);
  await extractSoundfont('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_bass-mp3.js', 'bass', ['C2', 'E2', 'G2', 'A2', 'C3', 'E3', 'G3']);
  await extractSoundfontFirst('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/woodblock-mp3.js', 'woodblock.mp3');

  console.log('--- All Assets Downloaded & Extracted ---');
}

run();
