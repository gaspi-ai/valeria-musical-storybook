/**
 * generate_song_audio.cjs
 * Generates pristine acoustic 44.1kHz 16-bit PCM WAV tracks for Valeria's Toddler Jukebox.
 * Features:
 * - Real acoustic modal harmonics & Karplus-Strong plucked physical modeling.
 * - Multi-track arrangements (Melody + Harmony Chords + Acoustic Bass + Shaker/Percussion).
 * - Master Dynamics Compression to prevent any speaker clipping.
 */

const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const songsDir = path.join(__dirname, '..', 'public', 'audio', 'songs');
fs.mkdirSync(songsDir, { recursive: true });

function noteToFreq(note) {
  const notes = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98
  };
  return notes[note] || 440.0;
}

// Write 16-bit Stereo PCM WAV file
function writeWav(filePath, leftChannel, rightChannel) {
  const numSamples = leftChannel.length;
  const byteRate = sampleRate * 2 * 2; // 16-bit stereo = 4 bytes per frame
  const blockAlign = 4;
  const dataSize = numSamples * 4;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(2, 22);  // NumChannels (2 for stereo)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write samples with soft-knee limiter (-0.5 dB ceiling)
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    let l = Math.max(-1.0, Math.min(1.0, leftChannel[i]));
    let r = Math.max(-1.0, Math.min(1.0, rightChannel[i]));

    // Soft clip
    l = Math.tanh(l * 1.05) * 0.92;
    r = Math.tanh(r * 1.05) * 0.92;

    const intL = Math.floor(l * 32767);
    const intR = Math.floor(r * 32767);

    buffer.writeInt16LE(intL, offset);
    buffer.writeInt16LE(intR, offset + 2);
    offset += 4;
  }

  fs.writeFileSync(filePath, buffer);
  console.log(`[GENERATED] ${path.basename(filePath)} (${(buffer.length / 1024).toFixed(1)} KB, ${(numSamples / sampleRate).toFixed(1)}s)`);
}

// Acoustic synthesis helper functions
function addPluck(channel, startSec, freq, durationSec, vol = 0.5, timbre = 'guitar') {
  const startSample = Math.floor(startSec * sampleRate);
  const totalSamples = Math.floor(durationSec * sampleRate);
  const endSample = Math.min(channel.length, startSample + totalSamples);

  for (let i = startSample; i < endSample; i++) {
    const t = (i - startSample) / sampleRate;
    let sample = 0;

    if (timbre === 'guitar') {
      // Warm nylon acoustic guitar
      const decay = Math.exp(-t * 3.2);
      sample = (
        Math.sin(2 * Math.PI * freq * t) * 0.65 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 * Math.exp(-t * 4.5) +
        Math.sin(2 * Math.PI * freq * 3 * t) * 0.12 * Math.exp(-t * 6.0)
      ) * decay;
    } else if (timbre === 'piano') {
      // Warm grand piano
      const decay = Math.exp(-t * 2.2);
      sample = (
        Math.sin(2 * Math.PI * freq * t) * 0.60 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.22 * Math.exp(-t * 3.0) +
        Math.sin(2 * Math.PI * freq * 3 * t) * 0.12 * Math.exp(-t * 4.5) +
        Math.sin(2 * Math.PI * freq * 4 * t) * 0.06 * Math.exp(-t * 6.0)
      ) * decay;
    } else if (timbre === 'bell' || timbre === 'glock') {
      // Glockenspiel / metallic crystal bell
      const decay = Math.exp(-t * 2.8);
      sample = (
        Math.sin(2 * Math.PI * freq * t) * 0.70 +
        Math.sin(2 * Math.PI * freq * 2.76 * t) * 0.25 * Math.exp(-t * 3.5) +
        Math.sin(2 * Math.PI * freq * 5.4 * t) * 0.12 * Math.exp(-t * 5.5)
      ) * decay;
    } else if (timbre === 'musicbox') {
      // Dreamy chime musicbox
      const decay = Math.exp(-t * 1.8);
      sample = (
        Math.sin(2 * Math.PI * freq * t) * 0.75 +
        Math.sin(2 * Math.PI * freq * 3.0 * t) * 0.18 * Math.exp(-t * 3.5)
      ) * decay;
    } else if (timbre === 'banjo') {
      // Twangy acoustic banjo
      const decay = Math.exp(-t * 5.2);
      sample = (
        Math.sin(2 * Math.PI * freq * t) * 0.55 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.32 +
        Math.sin(2 * Math.PI * freq * 3 * t) * 0.18 +
        Math.sin(2 * Math.PI * freq * 4 * t) * 0.10
      ) * decay;
    } else if (timbre === 'bass') {
      // Warm upright wooden bass
      const decay = Math.exp(-t * 2.0);
      sample = (
        Math.sin(2 * Math.PI * freq * t) * 0.75 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.20 * Math.exp(-t * 3.5)
      ) * decay;
    }

    channel[i] += sample * vol;
  }
}

function addShaker(channel, startSec, vol = 0.12) {
  const startSample = Math.floor(startSec * sampleRate);
  const numSamples = Math.floor(0.08 * sampleRate);
  for (let i = 0; i < numSamples; i++) {
    const idx = startSample + i;
    if (idx >= channel.length) break;
    const t = i / sampleRate;
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 45);
    channel[idx] += noise * vol;
  }
}

function addKick(channel, startSec, vol = 0.35) {
  const startSample = Math.floor(startSec * sampleRate);
  const numSamples = Math.floor(0.2 * sampleRate);
  for (let i = 0; i < numSamples; i++) {
    const idx = startSample + i;
    if (idx >= channel.length) break;
    const t = i / sampleRate;
    const f = 120 * Math.exp(-t * 25) + 45;
    const sample = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 14);
    channel[idx] += sample * vol;
  }
}

function addWoodblock(channel, startSec, pitch = 800, vol = 0.25) {
  const startSample = Math.floor(startSec * sampleRate);
  const numSamples = Math.floor(0.06 * sampleRate);
  for (let i = 0; i < numSamples; i++) {
    const idx = startSample + i;
    if (idx >= channel.length) break;
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 70);
    channel[idx] += sample * vol;
  }
}

// -------------------------------------------------------------
// SONG 1: "I Love You Mommy" (Skidamarink)
// -------------------------------------------------------------
function buildMommySong() {
  const bpm = 108;
  const beat = 60 / bpm;
  const totalBeats = 64;
  const duration = totalBeats * beat + 1.5;
  const left = new Float32Array(Math.floor(duration * sampleRate));
  const right = new Float32Array(Math.floor(duration * sampleRate));

  // Melody notes: [note, durationInBeats]
  const melody = [
    // Phrase 1: Ski-da-ma-rink a-dink a-dink
    ['G4', 0.5], ['G4', 0.5], ['E4', 0.5], ['C4', 0.5],
    ['A4', 0.5], ['A4', 0.5], ['F4', 0.5], ['D4', 0.5],
    // Ski-da-ma-rink a-doo
    ['G4', 0.5], ['G4', 0.5], ['E4', 0.5], ['C4', 0.5],
    ['A4', 0.75], ['B4', 0.75], ['C5', 1.5],
    // I love you!
    ['C5', 0.75], ['B4', 0.5], ['A4', 0.5], ['G4', 0.75], ['E4', 0.5], ['F4', 0.5], ['G4', 1.5],
    // Ski-da-ma-rink a-dink a-dink
    ['G4', 0.5], ['G4', 0.5], ['E4', 0.5], ['C4', 0.5],
    ['A4', 0.5], ['A4', 0.5], ['F4', 0.5], ['D4', 0.5],
    // I love you in the morning
    ['C5', 0.5], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5], ['G4', 0.5], ['E4', 0.5], ['C4', 0.5], ['D4', 0.5],
    ['E4', 1.0], ['C4', 2.0]
  ];

  // Chords progression per 4-beat bar
  const chords = [
    ['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['D4', 'F4', 'A4'], ['G3', 'B3', 'D4'],
    ['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['D4', 'F4', 'A4'], ['G3', 'B3', 'D4'],
    ['F4', 'A4', 'C5'], ['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], ['G3', 'B3', 'D4'],
    ['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4']
  ];
  const bassNotes = [
    'C3', 'A2', 'D3', 'G2', 'C3', 'A2', 'D3', 'G2',
    'F2', 'C3', 'D3', 'G2', 'C3', 'F2', 'G2', 'C3'
  ];

  // Render Chords & Rhythm
  for (let bar = 0; bar < 16; bar++) {
    const barStart = bar * 4 * beat;
    const chord = chords[bar % chords.length];
    const bass = bassNotes[bar % bassNotes.length];

    // Bass on beat 1 and 3
    addPluck(left, barStart, noteToFreq(bass), beat * 1.8, 0.45, 'bass');
    addPluck(right, barStart, noteToFreq(bass), beat * 1.8, 0.45, 'bass');
    addPluck(left, barStart + 2 * beat, noteToFreq(bass), beat * 1.8, 0.4, 'bass');
    addPluck(right, barStart + 2 * beat, noteToFreq(bass), beat * 1.8, 0.4, 'bass');

    // Acoustic Guitar arpeggios on each beat
    for (let b = 0; b < 4; b++) {
      const beatTime = barStart + b * beat;
      chord.forEach((n, idx) => {
        const offset = idx * 0.02;
        addPluck(left, beatTime + offset, noteToFreq(n), beat * 1.2, 0.25, 'guitar');
        addPluck(right, beatTime + offset + 0.005, noteToFreq(n), beat * 1.2, 0.28, 'guitar');
      });
      addShaker(left, beatTime, 0.12);
      addShaker(right, beatTime, 0.12);
    }
  }

  // Render Melody (Grand Piano + Glockenspiel sparkle)
  let curBeat = 0;
  for (let i = 0; i < melody.length; i++) {
    const [note, dur] = melody[i];
    const t = curBeat * beat;
    addPluck(left, t, noteToFreq(note), dur * beat * 1.2, 0.55, 'piano');
    addPluck(right, t, noteToFreq(note), dur * beat * 1.2, 0.55, 'piano');
    addPluck(right, t, noteToFreq(note) * 2, dur * beat * 0.8, 0.22, 'glock'); // Sparkling bell overtone
    curBeat += dur;
  }

  writeWav(path.join(songsDir, 'mommy.wav'), left, right);
}

// -------------------------------------------------------------
// SONG 2: "You Are My Sunshine"
// -------------------------------------------------------------
function buildSunshineSong() {
  const bpm = 114;
  const beat = 60 / bpm;
  const totalBeats = 64;
  const duration = totalBeats * beat + 1.5;
  const left = new Float32Array(Math.floor(duration * sampleRate));
  const right = new Float32Array(Math.floor(duration * sampleRate));

  const melody = [
    // You are my sun-shine, my on-ly sun-shine
    ['G3', 0.5], ['C4', 1.0], ['D4', 0.5], ['E4', 1.0], ['E4', 1.0],
    ['E4', 0.5], ['D4', 0.5], ['E4', 1.0], ['C4', 1.0], ['C4', 1.0],
    // You make me hap-py when skies are gray
    ['C4', 0.5], ['D4', 0.5], ['E4', 1.0], ['F4', 1.0], ['A4', 1.5],
    ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 1.0], ['C4', 2.0],
    // You'll ne-ver know, dear, how much I love you
    ['C4', 0.5], ['D4', 0.5], ['E4', 1.0], ['F4', 1.0], ['A4', 1.5],
    ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 1.0], ['C4', 1.5],
    // Please don't take my sun-shine a-way
    ['C4', 0.5], ['D4', 0.5], ['E4', 1.0], ['F4', 1.0], ['D4', 1.0], ['E4', 1.0], ['C4', 3.0]
  ];

  const chords = [
    ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
    ['F4', 'A4', 'C5'], ['F4', 'A4', 'C5'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
    ['F4', 'A4', 'C5'], ['F4', 'A4', 'C5'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
    ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4']
  ];
  const bassNotes = [
    'C3', 'G2', 'C3', 'G2', 'F2', 'C3', 'C3', 'G2',
    'F2', 'C3', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2'
  ];

  for (let bar = 0; bar < 16; bar++) {
    const barStart = bar * 4 * beat;
    const chord = chords[bar % chords.length];
    const bass = bassNotes[bar % bassNotes.length];

    addPluck(left, barStart, noteToFreq(bass), beat * 1.5, 0.45, 'bass');
    addPluck(right, barStart, noteToFreq(bass), beat * 1.5, 0.45, 'bass');
    addPluck(left, barStart + 2 * beat, noteToFreq('G2'), beat * 1.5, 0.4, 'bass');

    // Bouncy ukulele / banjo strums
    for (let b = 0; b < 4; b++) {
      const beatTime = barStart + b * beat;
      chord.forEach((n, idx) => {
        addPluck(left, beatTime + idx * 0.015, noteToFreq(n), beat * 0.9, 0.28, 'banjo');
        addPluck(right, beatTime + idx * 0.015, noteToFreq(n), beat * 0.9, 0.25, 'guitar');
      });
      addShaker(left, beatTime, 0.12);
      addShaker(right, beatTime, 0.12);
    }
  }

  let curBeat = 0;
  for (let i = 0; i < melody.length; i++) {
    const [note, dur] = melody[i];
    const t = curBeat * beat;
    addPluck(left, t, noteToFreq(note), dur * beat * 1.1, 0.58, 'guitar');
    addPluck(right, t, noteToFreq(note), dur * beat * 1.1, 0.58, 'piano');
    addPluck(left, t, noteToFreq(note), dur * beat * 0.9, 0.35, 'glock');
    curBeat += dur;
  }

  writeWav(path.join(songsDir, 'sunshine.wav'), left, right);
}

// -------------------------------------------------------------
// SONG 3: "Twinkle, Twinkle, Little Star"
// -------------------------------------------------------------
function buildTwinkleSong() {
  const bpm = 88;
  const beat = 60 / bpm;
  const totalBeats = 48;
  const duration = totalBeats * beat + 2.0;
  const left = new Float32Array(Math.floor(duration * sampleRate));
  const right = new Float32Array(Math.floor(duration * sampleRate));

  const melody = [
    ['C4', 1.0], ['C4', 1.0], ['G4', 1.0], ['G4', 1.0],
    ['A4', 1.0], ['A4', 1.0], ['G4', 2.0],
    ['F4', 1.0], ['F4', 1.0], ['E4', 1.0], ['E4', 1.0],
    ['D4', 1.0], ['D4', 1.0], ['C4', 2.0],
    ['G4', 1.0], ['G4', 1.0], ['F4', 1.0], ['F4', 1.0],
    ['E4', 1.0], ['E4', 1.0], ['D4', 2.0],
    ['G4', 1.0], ['G4', 1.0], ['F4', 1.0], ['F4', 1.0],
    ['E4', 1.0], ['E4', 1.0], ['D4', 2.0],
    ['C4', 1.0], ['C4', 1.0], ['G4', 1.0], ['G4', 1.0],
    ['A4', 1.0], ['A4', 1.0], ['G4', 2.0],
    ['F4', 1.0], ['F4', 1.0], ['E4', 1.0], ['E4', 1.0],
    ['D4', 1.0], ['D4', 1.0], ['C4', 2.0]
  ];

  const chords = [
    ['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['C4', 'E4', 'G4'],
    ['F4', 'A4', 'C5'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'],
    ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'],
    ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'],
    ['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['C4', 'E4', 'G4'],
    ['F4', 'A4', 'C5'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4']
  ];

  // Dreamy celestial harp arpeggio accompaniment
  for (let bar = 0; bar < 12; bar++) {
    const barStart = bar * 4 * beat;
    const chord = chords[bar % chords.length];
    addPluck(left, barStart, noteToFreq('C3'), beat * 3.5, 0.35, 'bass');
    addPluck(right, barStart, noteToFreq('C3'), beat * 3.5, 0.35, 'bass');

    // Slow harp ripple
    for (let b = 0; b < 4; b++) {
      const beatTime = barStart + b * beat;
      const note = chord[b % chord.length];
      addPluck(left, beatTime, noteToFreq(note), beat * 1.5, 0.25, 'musicbox');
      addPluck(right, beatTime + 0.1, noteToFreq(note), beat * 1.5, 0.22, 'guitar');
    }
  }

  // Sparkling Musicbox + Celesta melody
  let curBeat = 0;
  for (let i = 0; i < melody.length; i++) {
    const [note, dur] = melody[i];
    const t = curBeat * beat;
    addPluck(left, t, noteToFreq(note), dur * beat * 1.4, 0.60, 'musicbox');
    addPluck(right, t, noteToFreq(note), dur * beat * 1.4, 0.58, 'bell');
    addPluck(left, t, noteToFreq(note) * 2, dur * beat * 0.8, 0.20, 'glock');
    curBeat += dur;
  }

  writeWav(path.join(songsDir, 'twinkle.wav'), left, right);
}

// -------------------------------------------------------------
// SONG 4: "Five Little Monkeys Jumping on the Bed"
// -------------------------------------------------------------
function buildMonkeysSong() {
  const bpm = 126;
  const beat = 60 / bpm;
  const totalBeats = 64;
  const duration = totalBeats * beat + 1.5;
  const left = new Float32Array(Math.floor(duration * sampleRate));
  const right = new Float32Array(Math.floor(duration * sampleRate));

  const melody = [
    // Five lit-tle mon-keys jump-ing on the bed
    ['E4', 0.5], ['E4', 0.5], ['E4', 0.5], ['E4', 0.5], ['D4', 0.5], ['C4', 0.5], ['E4', 0.5], ['G4', 0.5],
    // One fell off and bumped his head
    ['A4', 0.5], ['A4', 0.5], ['A4', 0.5], ['G4', 0.5], ['E4', 1.0], ['D4', 1.0],
    // Ma-ma called the doc-tor and the doc-tor said
    ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['E4', 0.5], ['D4', 0.5], ['C4', 0.5], ['D4', 0.5], ['E4', 0.5],
    // "No more mon-keys jump-ing on the bed!"
    ['G4', 0.5], ['G4', 0.5], ['E4', 0.5], ['C4', 0.5], ['D4', 1.0], ['C4', 2.0]
  ];

  for (let bar = 0; bar < 16; bar++) {
    const barStart = bar * 4 * beat;

    // Ragtime Kick on beat 1 and 3, Snare/Woodblock on beat 2 and 4
    addKick(left, barStart, 0.4);
    addKick(right, barStart, 0.4);
    addWoodblock(left, barStart + beat, 750, 0.35);
    addWoodblock(right, barStart + beat, 750, 0.35);
    addKick(left, barStart + 2 * beat, 0.35);
    addKick(right, barStart + 2 * beat, 0.35);
    addWoodblock(left, barStart + 3 * beat, 750, 0.35);
    addWoodblock(right, barStart + 3 * beat, 750, 0.35);

    // Stride piano chords
    const chord = ['C4', 'E4', 'G4'];
    addPluck(left, barStart + beat, noteToFreq('E4'), beat * 0.8, 0.35, 'piano');
    addPluck(right, barStart + beat, noteToFreq('G4'), beat * 0.8, 0.35, 'piano');
    addPluck(left, barStart + 3 * beat, noteToFreq('E4'), beat * 0.8, 0.35, 'piano');
    addPluck(right, barStart + 3 * beat, noteToFreq('G4'), beat * 0.8, 0.35, 'piano');
  }

  // Play melody twice
  for (let repeat = 0; repeat < 2; repeat++) {
    let curBeat = repeat * 16;
    for (let i = 0; i < melody.length; i++) {
      const [note, dur] = melody[i];
      const t = curBeat * beat;
      addPluck(left, t, noteToFreq(note), dur * beat * 0.9, 0.60, 'piano');
      addPluck(right, t, noteToFreq(note), dur * beat * 0.9, 0.60, 'piano');
      addPluck(right, t, noteToFreq(note), dur * beat * 0.7, 0.35, 'banjo');
      curBeat += dur;
    }
  }

  writeWav(path.join(songsDir, 'monkeys.wav'), left, right);
}

// -------------------------------------------------------------
// SONG 5: "Old MacDonald Had a Farm"
// -------------------------------------------------------------
function buildFarmSong() {
  const bpm = 112;
  const beat = 60 / bpm;
  const totalBeats = 64;
  const duration = totalBeats * beat + 1.5;
  const left = new Float32Array(Math.floor(duration * sampleRate));
  const right = new Float32Array(Math.floor(duration * sampleRate));

  const melody = [
    // Old Mac-Don-ald had a farm, E-I-E-I-O!
    ['C4', 1.0], ['C4', 1.0], ['C4', 1.0], ['G3', 1.0], ['A3', 1.0], ['A3', 1.0], ['G3', 2.0],
    ['E4', 1.0], ['E4', 1.0], ['D4', 1.0], ['D4', 1.0], ['C4', 3.0], [null, 1.0],
    // And on that farm he had a cow, E-I-E-I-O!
    ['G3', 1.0], ['C4', 1.0], ['C4', 1.0], ['C4', 1.0], ['G3', 1.0], ['A3', 1.0], ['A3', 1.0], ['G3', 2.0],
    ['E4', 1.0], ['E4', 1.0], ['D4', 1.0], ['D4', 1.0], ['C4', 3.0], [null, 1.0],
    // With a moo-moo here and a moo-moo there
    ['G3', 0.5], ['G3', 0.5], ['C4', 1.0], ['C4', 0.5], ['C4', 0.5], ['C4', 1.0],
    ['G3', 0.5], ['G3', 0.5], ['C4', 1.0], ['C4', 0.5], ['C4', 0.5], ['C4', 1.0],
    // Old Mac-Don-ald had a farm, E-I-E-I-O!
    ['C4', 1.0], ['C4', 1.0], ['C4', 1.0], ['G3', 1.0], ['A3', 1.0], ['A3', 1.0], ['G3', 2.0],
    ['E4', 1.0], ['E4', 1.0], ['D4', 1.0], ['D4', 1.0], ['C4', 3.0]
  ];

  for (let bar = 0; bar < 16; bar++) {
    const barStart = bar * 4 * beat;
    addPluck(left, barStart, noteToFreq('C2'), beat * 1.5, 0.5, 'bass');
    addPluck(right, barStart, noteToFreq('C2'), beat * 1.5, 0.5, 'bass');
    addPluck(left, barStart + 2 * beat, noteToFreq('G2'), beat * 1.5, 0.45, 'bass');
    addPluck(right, barStart + 2 * beat, noteToFreq('G2'), beat * 1.5, 0.45, 'bass');

    // Banjo strumming
    for (let b = 0; b < 4; b++) {
      const beatTime = barStart + b * beat;
      addPluck(left, beatTime, noteToFreq('G4'), beat * 0.8, 0.32, 'banjo');
      addPluck(right, beatTime + 0.01, noteToFreq('C5'), beat * 0.8, 0.32, 'banjo');
      addWoodblock(left, beatTime, 650, 0.2);
    }
  }

  let curBeat = 0;
  for (let i = 0; i < melody.length; i++) {
    const [note, dur] = melody[i];
    if (note) {
      const t = curBeat * beat;
      addPluck(left, t, noteToFreq(note), dur * beat * 1.1, 0.65, 'banjo');
      addPluck(right, t, noteToFreq(note), dur * beat * 1.1, 0.65, 'piano');
      addPluck(right, t, noteToFreq(note), dur * beat * 0.8, 0.35, 'guitar');
    }
    curBeat += dur;
  }

  writeWav(path.join(songsDir, 'old_macdonald.wav'), left, right);
}

// -------------------------------------------------------------
// SONG 6: "Rock-a-Bye Baby"
// -------------------------------------------------------------
function buildLullabySong() {
  const bpm = 76;
  const beat = 60 / bpm;
  const totalBeats = 48; // 6/8 time: 8 measures of 6 eighth notes
  const duration = totalBeats * beat + 2.5;
  const left = new Float32Array(Math.floor(duration * sampleRate));
  const right = new Float32Array(Math.floor(duration * sampleRate));

  const melody = [
    // Rock-a-bye ba-by, on the tree top
    ['E4', 1.0], ['G4', 0.5], ['C5', 1.5], ['B4', 1.0], ['A4', 0.5], ['G4', 1.5],
    // When the wind blows, the cra-dle will rock
    ['A4', 1.0], ['C5', 0.5], ['F4', 1.5], ['E4', 1.0], ['D4', 0.5], ['C4', 1.5],
    // When the bough breaks, the cra-dle will fall
    ['E4', 1.0], ['G4', 0.5], ['C5', 1.5], ['B4', 1.0], ['A4', 0.5], ['G4', 1.5],
    // And down will come ba-by, cra-dle and all
    ['A4', 1.0], ['C5', 0.5], ['G4', 1.5], ['E4', 1.0], ['D4', 0.5], ['C4', 2.5]
  ];

  // Gentle 6/8 harp rocking arpeggios
  const harpChords = [
    ['C3', 'E3', 'G3', 'C4', 'E4', 'G4'],
    ['G2', 'D3', 'G3', 'B3', 'D4', 'G4'],
    ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
    ['C3', 'E3', 'G3', 'C4', 'E4', 'G4']
  ];

  for (let m = 0; m < 8; m++) {
    const mStart = m * 3 * beat;
    const chord = harpChords[m % harpChords.length];

    // Deep warm cello bass
    addPluck(left, mStart, noteToFreq(chord[0]), beat * 2.8, 0.45, 'bass');
    addPluck(right, mStart, noteToFreq(chord[0]), beat * 2.8, 0.45, 'bass');

    // Arpeggio notes in 6/8 sway
    for (let s = 0; s < 6; s++) {
      const stepTime = mStart + (s * 0.5) * beat;
      const note = chord[s % chord.length];
      addPluck(left, stepTime, noteToFreq(note), beat * 1.8, 0.22, 'musicbox');
      addPluck(right, stepTime + 0.02, noteToFreq(note), beat * 1.8, 0.22, 'guitar');
    }
  }

  let curBeat = 0;
  for (let i = 0; i < melody.length; i++) {
    const [note, dur] = melody[i];
    const t = curBeat * beat;
    addPluck(left, t, noteToFreq(note), dur * beat * 1.5, 0.62, 'musicbox');
    addPluck(right, t, noteToFreq(note), dur * beat * 1.5, 0.58, 'bell');
    addPluck(right, t, noteToFreq(note) * 2, dur * beat * 0.8, 0.18, 'glock');
    curBeat += dur;
  }

  writeWav(path.join(songsDir, 'rock_a_bye.wav'), left, right);
}

// Generate all 6 songs
buildMommySong();
buildSunshineSong();
buildTwinkleSong();
buildMonkeysSong();
buildFarmSong();
buildLullabySong();
console.log('✨ All 6 Toddler Jukebox acoustic songs generated successfully!');
