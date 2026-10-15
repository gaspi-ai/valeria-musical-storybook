const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'audio');
fs.mkdirSync(targetDir, { recursive: true });

const downloads = [
  { name: 'wheels_bus_track.mp3', url: 'https://archive.org/download/jamendo-556490/01-2147285-Matthew%20Mike%20Cole-The%20Wheels%20on%20the%20Bus.mp3' },
  { name: 'horn_car.mp3', url: 'https://raw.githubusercontent.com/jonjonsson/SoundMonster/master/Public%20domain/horn%20car.mp3' },
  { name: 'horn_bulb.mp3', url: 'https://raw.githubusercontent.com/jonjonsson/SoundMonster/master/Public%20domain/horn%20bicycle.mp3' },
  { name: 'boing.mp3', url: 'https://raw.githubusercontent.com/jonjonsson/SoundMonster/master/Public%20domain/boing%20cartoon.mp3' },
  { name: 'door_bell.mp3', url: 'https://raw.githubusercontent.com/jonjonsson/SoundMonster/master/Public%20domain/doorbell.mp3' },
  { name: 'chime.mp3', url: 'https://raw.githubusercontent.com/rse/soundfx/master/soundfx.d/chime1.mp3' },
  { name: 'laugh.mp3', url: 'https://raw.githubusercontent.com/rse/soundfx/master/soundfx.d/laugh1.mp3' },
  { name: 'wiper.mp3', url: 'https://raw.githubusercontent.com/rse/soundfx/master/soundfx.d/whoosh2.mp3' },
  { name: 'splash.mp3', url: 'https://raw.githubusercontent.com/rse/soundfx/master/soundfx.d/splash1.mp3' },
  { name: 'fanfare.mp3', url: 'https://raw.githubusercontent.com/rse/soundfx/master/soundfx.d/fanfare1.mp3' },
  { name: 'piano_C4.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/C4.mp3' },
  { name: 'piano_D4.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/D4.mp3' },
  { name: 'piano_E4.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/E4.mp3' },
  { name: 'piano_G4.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/G4.mp3' },
  { name: 'piano_A4.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/A4.mp3' },
  { name: 'piano_C5.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/C5.mp3' },
  { name: 'piano_D5.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/D5.mp3' },
  { name: 'piano_E5.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/E5.mp3' },
  { name: 'piano_G5.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/G5.mp3' },
  { name: 'xylo_C5.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/xylophone/C5.mp3' },
  { name: 'xylo_G5.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/xylophone/G5.mp3' },
  { name: 'xylo_C6.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/xylophone/C6.mp3' },
  { name: 'xylo_G6.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/xylophone/G6.mp3' },
  { name: 'guitar_C4.mp3', url: 'https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/C4.mp3' }
];

async function run() {
  console.log(`Downloading ${downloads.length} audio assets...`);
  for (const item of downloads) {
    const dest = path.join(targetDir, item.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`[EXISTS] ${item.name} (${fs.statSync(dest).size} bytes)`);
      continue;
    }
    try {
      console.log(`[FETCHING] ${item.name} from ${item.url}...`);
      const res = await fetch(item.url, { headers: { 'User-Agent': 'ToddlerMusicalStorybook/1.0' } });
      if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`[SAVED] ${item.name} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`[ERROR] Failed to download ${item.name}:`, err.message);
    }
  }
  console.log('Finished downloading audio assets.');
}

run();
