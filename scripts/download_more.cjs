const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'audio');
fs.mkdirSync(targetDir, { recursive: true });

async function extractSoundfont(url, prefix) {
  try {
    console.log(`Fetching soundfont: ${url}`);
    const res = await fetch(url);
    const text = await res.text();
    const notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6'];
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
          console.log(`Saved ${fileName} (${buf.length} bytes)`);
        }
      }
    }
  } catch (err) {
    console.error(`Error extracting soundfont ${prefix}:`, err.message);
  }
}

async function run() {
  await extractSoundfont('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/marimba-mp3.js', 'marimba');
  await extractSoundfont('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/glockenspiel-mp3.js', 'glock');
  await extractSoundfont('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/music_box-mp3.js', 'musicbox');
  console.log('All soundfonts extracted successfully!');
}

run();
