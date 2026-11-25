/**
 * build_accurate_songs.cjs
 * Generates crystal-clear, music-theory-accurate studio arrangements (128kbps MP3)
 * for every Musical Game and Jukebox song in Valeria's Musical Storybook.
 *
 * Uses warm, multi-harmonic acoustic physical modeling (piano, marimba, celesta,
 * harp, upright bass, soft brush shaker), exact traditional melodies & harmonies,
 * gentle stereo spread, and soft-knee mastering (-1 dB ceiling, zero clipping).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const SR = 44100;
const SONGS_DIR = path.join(__dirname, '..', 'public', 'audio', 'songs');
const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');
fs.mkdirSync(SONGS_DIR, { recursive: true });

const NOTE_SEMITONES = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

function noteFreq(note) {
  if (!note || note === '-') return 0;
  const m = note.match(/^([A-G][#b]?)([0-8])$/);
  if (!m) return 0;
  const semi = NOTE_SEMITONES[m[1]];
  const oct = parseInt(m[2], 10);
  const midi = (oct + 1) * 12 + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function addTone(L, R, startSec, freq, durSec, vol, timbre = 'piano', pan = 0) {
  if (!freq || durSec <= 0) return;
  const startIdx = Math.max(0, Math.floor(startSec * SR));
  const len = Math.floor((durSec + 0.35) * SR);
  const endIdx = Math.min(L.length, startIdx + len);

  const panL = Math.cos(((pan + 1) * Math.PI) / 4);
  const panR = Math.sin(((pan + 1) * Math.PI) / 4);
  const twoPiF = 2 * Math.PI * freq;

  for (let i = startIdx; i < endIdx; i++) {
    const t = (i - startIdx) / SR;
    // Smooth 6ms attack to guarantee zero clicks
    const attack = t < 0.006 ? t / 0.006 : 1.0;
    // Smooth release tail after note duration
    const release = t > durSec ? Math.exp(-(t - durSec) * 10) : 1.0;
    let s = 0;

    if (timbre === 'marimba') {
      const env = Math.exp(-t * 5.2);
      s = (
        Math.sin(twoPiF * t) * 0.78 +
        Math.sin(twoPiF * 4 * t) * 0.16 * Math.exp(-t * 14) +
        Math.sin(twoPiF * 2 * t) * 0.06 * Math.exp(-t * 9)
      ) * env;
    } else if (timbre === 'celesta' || timbre === 'musicbox') {
      const env = Math.exp(-t * 2.4);
      s = (
        Math.sin(twoPiF * t) * 0.72 +
        Math.sin(twoPiF * 2 * t) * 0.18 * Math.exp(-t * 3.8) +
        Math.sin(twoPiF * 3 * t) * 0.08 * Math.exp(-t * 5.5)
      ) * env;
    } else if (timbre === 'harp') {
      const env = Math.exp(-t * 2.6);
      s = (
        Math.sin(twoPiF * t) * 0.68 +
        Math.sin(twoPiF * 2 * t) * 0.22 * Math.exp(-t * 4.2) +
        Math.sin(twoPiF * 3 * t) * 0.08 * Math.exp(-t * 6.5)
      ) * env;
    } else if (timbre === 'bass') {
      const env = Math.exp(-t * 3.2);
      s = (
        Math.sin(twoPiF * t) * 0.82 +
        Math.sin(twoPiF * 2 * t) * 0.18 * Math.exp(-t * 5.0)
      ) * env;
    } else if (timbre === 'guitar') {
      const env = Math.exp(-t * 3.6);
      s = (
        Math.sin(twoPiF * t) * 0.60 +
        Math.sin(twoPiF * 2 * t) * 0.25 * Math.exp(-t * 4.8) +
        Math.sin(twoPiF * 3 * t) * 0.12 * Math.exp(-t * 6.5)
      ) * env;
    } else {
      // Warm acoustic studio piano
      const env = Math.exp(-t * 2.5);
      s = (
        Math.sin(twoPiF * t) * 0.64 +
        Math.sin(twoPiF * 2 * t) * 0.22 * Math.exp(-t * 3.5) +
        Math.sin(twoPiF * 3 * t) * 0.10 * Math.exp(-t * 5.0) +
        Math.sin(twoPiF * 4 * t) * 0.04 * Math.exp(-t * 7.0)
      ) * env;
    }

    const out = s * attack * release * vol;
    L[i] += out * panL;
    R[i] += out * panR;
  }
}

function addSoftBrush(L, R, startSec, vol = 0.04) {
  const startIdx = Math.max(0, Math.floor(startSec * SR));
  const len = Math.floor(0.05 * SR);
  const endIdx = Math.min(L.length, startIdx + len);
  let prev = 0;
  for (let i = startIdx; i < endIdx; i++) {
    const t = (i - startIdx) / SR;
    const env = Math.exp(-t * 65);
    const white = Math.random() * 2 - 1;
    // Simple high-pass shimmer for soft shaker
    const hp = white - prev * 0.7;
    prev = white;
    const val = hp * env * vol;
    L[i] += val;
    R[i] += val;
  }
}

function renderArrangement(config) {
  const { filename, destDir = SONGS_DIR, bpm, melody, chords, leadTimbre, chordTimbre, bassTimbre = 'bass', repeats = 2, brush = true } = config;
  const secPerBeat = 60 / bpm;

  // Calculate total beats of 1 cycle
  const cycleBeats = melody.reduce((acc, [, beats]) => acc + beats, 0);
  const totalBeats = cycleBeats * repeats + 2; // +2 beats gentle ring-out tail
  const totalSamples = Math.ceil(totalBeats * secPerBeat * SR);

  const L = new Float32Array(totalSamples);
  const R = new Float32Array(totalSamples);

  for (let rep = 0; rep < repeats; rep++) {
    const cycleStartBeat = rep * cycleBeats;

    // 1. Melody
    let cursor = cycleStartBeat;
    for (const [note, beats] of melody) {
      if (note && note !== '-') {
        const startSec = cursor * secPerBeat;
        const durSec = beats * secPerBeat * 0.92;
        addTone(L, R, startSec, noteFreq(note), durSec, 0.42, leadTimbre, 0.08);
        // Subtle warm octave bell sparkle on second repeat
        if (rep === 1 && leadTimbre !== 'celesta' && leadTimbre !== 'musicbox') {
          addTone(L, R, startSec, noteFreq(note), durSec * 0.75, 0.14, 'celesta', -0.15);
        }
      }
      cursor += beats;
    }

    // 2. Chords + Warm Upright Bass
    let chordCursor = cycleStartBeat;
    for (const [bassNote, chordNotes, beats] of chords) {
      const startSec = chordCursor * secPerBeat;
      const durSec = beats * secPerBeat * 0.9;
      if (bassNote) {
        addTone(L, R, startSec, noteFreq(bassNote), durSec, 0.24, bassTimbre, -0.1);
      }
      if (chordNotes && chordNotes.length) {
        chordNotes.forEach((cn, idx) => {
          addTone(L, R, startSec + idx * 0.022, noteFreq(cn), durSec * 0.85, 0.14, chordTimbre, (idx - 1) * 0.22);
        });
      }
      chordCursor += beats;
    }

    // 3. Gentle soft brush rhythm (optional, never loud or harsh)
    if (brush) {
      for (let b = 0; b < Math.floor(cycleBeats); b++) {
        addSoftBrush(L, R, (cycleStartBeat + b) * secPerBeat, b % 2 === 1 ? 0.032 : 0.018);
      }
    }
  }

  // Normalize & soft-limit to clean -1dB peak
  let peak = 0.001;
  for (let i = 0; i < totalSamples; i++) {
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const norm = Math.min(1.0, 0.88 / peak);

  const wavBuf = Buffer.alloc(44 + totalSamples * 4);
  wavBuf.write('RIFF', 0);
  wavBuf.writeUInt32LE(36 + totalSamples * 4, 4);
  wavBuf.write('WAVE', 8);
  wavBuf.write('fmt ', 12);
  wavBuf.writeUInt32LE(16, 16);
  wavBuf.writeUInt16LE(1, 20);
  wavBuf.writeUInt16LE(2, 22);
  wavBuf.writeUInt32LE(SR, 24);
  wavBuf.writeUInt32LE(SR * 4, 28);
  wavBuf.writeUInt16LE(4, 32);
  wavBuf.writeUInt16LE(16, 34);
  wavBuf.write('data', 36);
  wavBuf.writeUInt32LE(totalSamples * 4, 40);

  let off = 44;
  for (let i = 0; i < totalSamples; i++) {
    const l = Math.tanh(L[i] * norm) * 0.94;
    const r = Math.tanh(R[i] * norm) * 0.94;
    wavBuf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(l * 32767))), off);
    wavBuf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(r * 32767))), off + 2);
    off += 4;
  }

  const tmpWav = path.join(destDir, filename.replace(/\.mp3$/i, '.tmp.wav'));
  const outMp3 = path.join(destDir, filename);
  fs.writeFileSync(tmpWav, wavBuf);

  execFileSync(ffmpegPath, [
    '-y', '-i', tmpWav, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '128k', outMp3
  ], { stdio: 'pipe' });
  fs.unlinkSync(tmpWav);

  const kb = (fs.statSync(outMp3).size / 1024).toFixed(1);
  console.log(`[OK] ${filename} (${kb} KB, ${(totalSamples / SR).toFixed(1)}s)`);
}

// Common C-major harmony voicings
const C_CHORD = ['C4', 'E4', 'G4'];
const F_CHORD = ['C4', 'F4', 'A4'];
const G_CHORD = ['B3', 'D4', 'G4'];
const Am_CHORD = ['C4', 'E4', 'A4'];
const Dm_CHORD = ['D4', 'F4', 'A4'];

const ARRANGEMENTS = [
  // 1. THE WHEELS ON THE BUS (Exact traditional melody in C Major)
  {
    filename: 'wheels_on_the_bus.mp3',
    bpm: 112,
    leadTimbre: 'marimba',
    chordTimbre: 'guitar',
    repeats: 2,
    brush: true,
    melody: [
      ['G4', 1],
      ['C5', 1], ['C5', 0.5], ['C5', 0.5], ['E5', 1], ['G5', 1],
      ['E5', 2], ['C5', 2],
      ['D5', 2], ['B4', 1], ['G4', 1],
      ['E5', 2], ['C5', 1], ['G4', 1],
      ['C5', 1], ['C5', 0.5], ['C5', 0.5], ['E5', 1], ['G5', 1],
      ['E5', 2], ['C5', 2],
      ['D5', 2], ['G4', 1], ['G4', 1],
      ['C5', 3], ['-', 1],
    ],
    chords: [
      ['G2', G_CHORD, 1],
      ['C3', C_CHORD, 4], ['C3', C_CHORD, 4],
      ['G2', G_CHORD, 4], ['C3', C_CHORD, 4],
      ['C3', C_CHORD, 4], ['C3', C_CHORD, 4],
      ['G2', G_CHORD, 4], ['C3', C_CHORD, 4],
    ],
  },

  // 2. OLD MACDONALD HAD A FARM (Exact traditional melody in C Major)
  {
    filename: 'old_macdonald.mp3',
    bpm: 108,
    leadTimbre: 'guitar',
    chordTimbre: 'piano',
    repeats: 2,
    brush: true,
    melody: [
      ['C5', 1], ['C5', 1], ['C5', 1], ['G4', 1],
      ['A4', 1], ['A4', 1], ['G4', 2],
      ['E5', 1], ['E5', 1], ['D5', 1], ['D5', 1],
      ['C5', 3], ['G4', 1],
      ['C5', 1], ['C5', 1], ['C5', 1], ['G4', 1],
      ['A4', 1], ['A4', 1], ['G4', 2],
      ['E5', 1], ['E5', 1], ['D5', 1], ['D5', 1],
      ['C5', 3], ['-', 1],
    ],
    chords: [
      ['C3', C_CHORD, 4], ['F2', F_CHORD, 2], ['C3', C_CHORD, 2],
      ['C3', C_CHORD, 2], ['G2', G_CHORD, 2], ['C3', C_CHORD, 4],
      ['C3', C_CHORD, 4], ['F2', F_CHORD, 2], ['C3', C_CHORD, 2],
      ['C3', C_CHORD, 2], ['G2', G_CHORD, 2], ['C3', C_CHORD, 4],
    ],
  },

  // 3. THE ITSY BITSY SPIDER (Exact traditional 6/8 melody in C Major)
  {
    filename: 'itsy_bitsy.mp3',
    bpm: 132,
    leadTimbre: 'guitar',
    chordTimbre: 'harp',
    repeats: 2,
    brush: false,
    melody: [
      ['G4', 1],
      ['C5', 2], ['C5', 1], ['C5', 2], ['D5', 1],
      ['E5', 3], ['E5', 2], ['E5', 1],
      ['D5', 2], ['C5', 1], ['D5', 2], ['E5', 1],
      ['C5', 5], ['-', 1],
      ['E5', 3], ['E5', 2], ['F5', 1],
      ['G5', 3], ['G5', 3],
      ['F5', 2], ['E5', 1], ['F5', 2], ['G5', 1],
      ['E5', 5], ['-', 1],
      ['C5', 3], ['C5', 2], ['D5', 1],
      ['E5', 3], ['E5', 3],
      ['D5', 2], ['C5', 1], ['D5', 2], ['E5', 1],
      ['C5', 4], ['G4', 1], ['G4', 1],
      ['C5', 2], ['C5', 1], ['C5', 2], ['D5', 1],
      ['E5', 3], ['E5', 2], ['E5', 1],
      ['D5', 2], ['C5', 1], ['D5', 2], ['E5', 1],
      ['C5', 5], ['-', 1],
    ],
    chords: [
      ['G2', G_CHORD, 1],
      ['C3', C_CHORD, 6], ['C3', C_CHORD, 6], ['G2', G_CHORD, 6], ['C3', C_CHORD, 6],
      ['C3', C_CHORD, 6], ['G2', G_CHORD, 6], ['G2', G_CHORD, 6], ['C3', C_CHORD, 6],
      ['C3', C_CHORD, 6], ['C3', C_CHORD, 6], ['G2', G_CHORD, 6], ['C3', C_CHORD, 6],
      ['C3', C_CHORD, 6], ['C3', C_CHORD, 6], ['G2', G_CHORD, 6], ['C3', C_CHORD, 6],
    ],
  },

  // 4. TWINKLE, TWINKLE, LITTLE STAR (Exact traditional lullaby in C Major)
  {
    filename: 'twinkle.mp3',
    bpm: 86,
    leadTimbre: 'celesta',
    chordTimbre: 'harp',
    repeats: 2,
    brush: false,
    melody: [
      ['C5', 1], ['C5', 1], ['G5', 1], ['G5', 1], ['A5', 1], ['A5', 1], ['G5', 2],
      ['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['D5', 1], ['D5', 1], ['C5', 2],
      ['G5', 1], ['G5', 1], ['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['D5', 2],
      ['G5', 1], ['G5', 1], ['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['D5', 2],
      ['C5', 1], ['C5', 1], ['G5', 1], ['G5', 1], ['A5', 1], ['A5', 1], ['G5', 2],
      ['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['D5', 1], ['D5', 1], ['C5', 2],
    ],
    chords: [
      ['C3', C_CHORD, 4], ['F2', F_CHORD, 2], ['C3', C_CHORD, 2],
      ['F2', F_CHORD, 2], ['C3', C_CHORD, 2], ['G2', G_CHORD, 2], ['C3', C_CHORD, 2],
      ['C3', C_CHORD, 2], ['F2', F_CHORD, 2], ['C3', C_CHORD, 2], ['G2', G_CHORD, 2],
      ['C3', C_CHORD, 2], ['F2', F_CHORD, 2], ['C3', C_CHORD, 2], ['G2', G_CHORD, 2],
      ['C3', C_CHORD, 4], ['F2', F_CHORD, 2], ['C3', C_CHORD, 2],
      ['F2', F_CHORD, 2], ['C3', C_CHORD, 2], ['G2', G_CHORD, 2], ['C3', C_CHORD, 2],
    ],
  },

  // 5. ROW, ROW, ROW YOUR BOAT (Exact traditional 6/8 melody in C Major)
  {
    filename: 'row_boat.mp3',
    bpm: 138,
    leadTimbre: 'harp',
    chordTimbre: 'piano',
    repeats: 2,
    brush: false,
    melody: [
      ['C5', 3], ['C5', 3], ['C5', 2], ['D5', 1], ['E5', 3],
      ['E5', 2], ['D5', 1], ['E5', 2], ['F5', 1], ['G5', 6],
      ['C6', 1], ['C6', 1], ['C6', 1], ['G5', 1], ['G5', 1], ['G5', 1],
      ['E5', 1], ['E5', 1], ['E5', 1], ['C5', 1], ['C5', 1], ['C5', 1],
      ['G5', 2], ['F5', 1], ['E5', 2], ['D5', 1], ['C5', 6],
    ],
    chords: [
      ['C3', C_CHORD, 6], ['C3', C_CHORD, 6],
      ['C3', C_CHORD, 6], ['G2', G_CHORD, 6],
      ['C3', C_CHORD, 6], ['C3', C_CHORD, 6],
      ['G2', G_CHORD, 6], ['C3', C_CHORD, 6],
    ],
  },

  // 6. FRÈRE JACQUES / ARE YOU SLEEPING (Exact EN/FR classic in C Major)
  {
    filename: 'frere_jacques.mp3',
    bpm: 102,
    leadTimbre: 'marimba',
    chordTimbre: 'celesta',
    repeats: 2,
    brush: true,
    melody: [
      ['C5', 1], ['D5', 1], ['E5', 1], ['C5', 1],
      ['C5', 1], ['D5', 1], ['E5', 1], ['C5', 1],
      ['E5', 1], ['F5', 1], ['G5', 2],
      ['E5', 1], ['F5', 1], ['G5', 2],
      ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['F5', 0.5], ['E5', 1], ['C5', 1],
      ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['F5', 0.5], ['E5', 1], ['C5', 1],
      ['C5', 1], ['G4', 1], ['C5', 2],
      ['C5', 1], ['G4', 1], ['C5', 2],
    ],
    chords: [
      ['C3', C_CHORD, 4], ['C3', C_CHORD, 4],
      ['C3', C_CHORD, 2], ['G2', G_CHORD, 2], ['C3', C_CHORD, 2], ['G2', G_CHORD, 2],
      ['C3', C_CHORD, 4], ['C3', C_CHORD, 4],
      ['C3', C_CHORD, 2], ['G2', G_CHORD, 2], ['C3', C_CHORD, 4],
    ],
  },

  // 7. YOU ARE MY SUNSHINE (Exact traditional folk melody in C Major)
  {
    filename: 'sunshine.mp3',
    bpm: 110,
    leadTimbre: 'piano',
    chordTimbre: 'guitar',
    repeats: 2,
    brush: true,
    melody: [
      ['G4', 1], ['C5', 1], ['D5', 1],
      ['E5', 2], ['E5', 2], ['E5', 1], ['D#5', 1], ['E5', 1], ['C5', 1],
      ['C5', 3], ['-', 1], ['C5', 1], ['D5', 1], ['E5', 1], ['F5', 1],
      ['A5', 2], ['A5', 2], ['G5', 1], ['F5', 1], ['E5', 2],
      ['-', 1], ['C5', 1], ['D5', 1], ['E5', 1], ['F5', 1],
      ['A5', 2], ['A5', 2], ['G5', 1], ['F5', 1], ['E5', 1], ['C5', 2],
      ['C5', 1], ['D5', 1], ['E5', 1.5], ['F5', 0.5], ['D5', 2],
      ['D5', 1], ['E5', 1], ['C5', 4],
    ],
    chords: [
      ['G2', G_CHORD, 3],
      ['C3', C_CHORD, 4], ['C3', C_CHORD, 4], ['C3', C_CHORD, 4], ['C3', C_CHORD, 4],
      ['F2', F_CHORD, 4], ['C3', C_CHORD, 4], ['C3', C_CHORD, 4],
      ['F2', F_CHORD, 4], ['C3', C_CHORD, 4], ['C3', C_CHORD, 4],
      ['G2', G_CHORD, 4], ['C3', C_CHORD, 4],
    ],
  },

  // 8. SKIDAMARINK / I LOVE YOU MOMMY (Exact joyful melody in C Major)
  {
    filename: 'mommy.mp3',
    bpm: 108,
    leadTimbre: 'piano',
    chordTimbre: 'harp',
    repeats: 2,
    brush: true,
    melody: [
      ['C5', 0.5], ['D5', 0.5], ['E5', 0.5], ['C5', 0.5], ['G5', 1], ['E5', 1],
      ['C5', 0.5], ['D5', 0.5], ['E5', 0.5], ['C5', 0.5], ['G5', 2],
      ['A5', 1], ['G5', 1], ['F5', 1], ['E5', 1], ['D5', 3], ['-', 1],
      ['D5', 0.5], ['E5', 0.5], ['F5', 0.5], ['D5', 0.5], ['A5', 1], ['F5', 1],
      ['G5', 1], ['E5', 1], ['D5', 1], ['B4', 1], ['C5', 3], ['-', 1],
    ],
    chords: [
      ['C3', C_CHORD, 4], ['C3', C_CHORD, 4],
      ['F2', F_CHORD, 4], ['G2', G_CHORD, 4],
      ['D3', Dm_CHORD, 4], ['G2', G_CHORD, 4], ['C3', C_CHORD, 4],
    ],
  },

  // 9. FIVE LITTLE MONKEYS (Playful bouncy melody in C Major)
  {
    filename: 'monkeys.mp3',
    bpm: 118,
    leadTimbre: 'marimba',
    chordTimbre: 'piano',
    repeats: 2,
    brush: true,
    melody: [
      ['G5', 1], ['G5', 0.5], ['G5', 0.5], ['E5', 1], ['C5', 1],
      ['D5', 0.5], ['D5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 2],
      ['G5', 1], ['G5', 1], ['A5', 1], ['G5', 1],
      ['F5', 1], ['E5', 1], ['D5', 2],
      ['E5', 1], ['E5', 1], ['F5', 1], ['E5', 1],
      ['D5', 1], ['C5', 1], ['G4', 2],
      ['C5', 1], ['D5', 1], ['E5', 1], ['G5', 1],
      ['E5', 1], ['D5', 1], ['C5', 2],
    ],
    chords: [
      ['C3', C_CHORD, 4], ['G2', G_CHORD, 2], ['C3', C_CHORD, 2],
      ['C3', C_CHORD, 4], ['G2', G_CHORD, 4],
      ['C3', C_CHORD, 4], ['G2', G_CHORD, 4],
      ['C3', C_CHORD, 4], ['G2', G_CHORD, 2], ['C3', C_CHORD, 2],
    ],
  },

  // 10. ROCK-A-BYE BABY (Exact soothing 3/4 lullaby in C Major)
  {
    filename: 'rock_a_bye.mp3',
    bpm: 84,
    leadTimbre: 'musicbox',
    chordTimbre: 'harp',
    repeats: 2,
    brush: false,
    melody: [
      ['E5', 2], ['G5', 1], ['E6', 2], ['D6', 1],
      ['C6', 2], ['B5', 1], ['A5', 3],
      ['F5', 2], ['A5', 1], ['D6', 2], ['C6', 1],
      ['B5', 2], ['A5', 1], ['G5', 3],
      ['E5', 2], ['G5', 1], ['E6', 2], ['D6', 1],
      ['C6', 2], ['B5', 1], ['A5', 3],
      ['G5', 1], ['A5', 1], ['B5', 1], ['C6', 3],
      ['C6', 3], ['-', 3],
    ],
    chords: [
      ['C3', C_CHORD, 6], ['A2', Am_CHORD, 6],
      ['F2', F_CHORD, 6], ['G2', G_CHORD, 6],
      ['C3', C_CHORD, 6], ['A2', Am_CHORD, 6],
      ['G2', G_CHORD, 3], ['C3', C_CHORD, 9],
    ],
  },
];

for (const arr of ARRANGEMENTS) {
  renderArrangement(arr);
}

// Also copy wheels_on_the_bus.mp3 to public/audio/wheels_bus_track.mp3 so legacy references stay 100% accurate
fs.copyFileSync(
  path.join(SONGS_DIR, 'wheels_on_the_bus.mp3'),
  path.join(AUDIO_DIR, 'wheels_bus_track.mp3')
);
console.log('[OK] Synced public/audio/wheels_bus_track.mp3 with accurate Wheels on the Bus arrangement!');
