const fs = require('fs');
const path = require('path');

const songsTargetDir = path.join(__dirname, '..', 'public', 'audio', 'songs');
fs.mkdirSync(songsTargetDir, { recursive: true });

const songs = [
  {
    id: 'mommy',
    filename: 'mommy.mp3',
    url: 'https://archive.org/download/Skinnamarink/skinnamarink.mp3'
  },
  {
    id: 'sunshine',
    filename: 'sunshine.mp3',
    url: 'https://archive.org/download/WilfCarter-YouAreMySunshine/You%20Are%20My%20Sunshine.mp3'
  },
  {
    id: 'twinkle',
    filename: 'twinkle.mp3',
    url: 'https://archive.org/download/TwinkleTwinkleLittleStar_201502/Twinkle%2C%20twinkle%2C%20little%20star%2C.mp3'
  },
  {
    id: 'monkeys',
    filename: 'monkeys.mp3',
    url: 'https://archive.org/download/FiveLittleMonkeys/Five%20Little%20Monkeys.mp3'
  },
  {
    id: 'old_macdonald',
    filename: 'old_macdonald.mp3',
    url: 'https://archive.org/download/nurseryrhymes_201610/Old_McDonald_Loop_B.mp3'
  },
  {
    id: 'rock_a_bye',
    filename: 'rock_a_bye.mp3',
    url: 'https://archive.org/download/loc-jukebox-880365-rock-a-bye-baby/jukebox-880365_rock-a-bye-baby.mp3'
  },
  {
    id: 'row_boat',
    filename: 'row_boat_song.mp3',
    url: 'https://archive.org/download/tvtunes_24973/Sesame%20Street%20-%20Row%20Row%20Row%20Your%20Boat.mp3'
  },
  {
    id: 'itsy_bitsy',
    filename: 'itsy_bitsy_song.mp3',
    url: 'https://archive.org/download/kinder52019.theitsybitsyspider/Kinder%205%202019.%20The%20Itsy%20Bitsy%20Spider.mp3'
  }
];

async function download(url, dest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`[SUCCESS] ${path.basename(dest)}: ${buf.length} bytes`);
    return true;
  } catch (err) {
    clearTimeout(timeout);
    console.error(`[ERROR] ${path.basename(dest)}:`, err.message);
    return false;
  }
}

async function run() {
  for (const s of songs) {
    const dest = path.join(songsTargetDir, s.filename);
    console.log(`Downloading ${s.filename}...`);
    await download(s.url, dest);
  }
  console.log('All downloads processed.');
}

run();
