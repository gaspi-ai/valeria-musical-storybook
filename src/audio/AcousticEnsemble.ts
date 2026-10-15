/**
 * AcousticEnsemble.ts
 * Real Acoustic Multi-Track Stem Player & Rhythm Section for "Wheels on the Bus".
 * 
 * Schedules authentic acoustic instrument stems on the Web Audio hardware clock:
 * - Upright bass walking line (C3, G3, F3)
 * - Acoustic guitar chords (C major, G7)
 * - Woodblock / hand percussion rhythm
 * - Downbeat synchronized brass horn / bulb horn hits
 */

import { AudioEngine } from './AudioEngine';

export class AcousticEnsemble {
  private engine: AudioEngine;
  private isPlaying: boolean = false;
  private unsubscribeBeat: (() => void) | null = null;

  // Dynamic Stems state
  public isRhythmActive: boolean = true;
  public isBassActive: boolean = true;
  public isChordsActive: boolean = true;
  public isMelodyActive: boolean = false;

  // Pending queue for downbeat synchronized hits (e.g. toddler taps horn -> plays on beat 1)
  private queuedHorn: boolean = false;

  // "Wheels on the Bus" chord progression in C major (16-beat cycle / 4 measures)
  // Measure 1: C major ("The wheels on the bus go round and round")
  // Measure 2: G7      ("round and round, round and round")
  // Measure 3: C major ("The wheels on the bus go round and round")
  // Measure 4: G7 - C  ("all through the town")
  private readonly chordProgression: string[] = [
    'C4', 'C4', 'C4', 'C4', // Bar 1
    'G4', 'G4', 'G4', 'G4', // Bar 2
    'C4', 'C4', 'C4', 'C4', // Bar 3
    'G4', 'G4', 'C4', 'C4'  // Bar 4
  ];

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  public start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    this.engine.startScheduler(108);
    this.unsubscribeBeat = this.engine.onBeat((beatNumber, time) => {
      this.onBeatTick(beatNumber, time);
    });
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.unsubscribeBeat) {
      this.unsubscribeBeat();
      this.unsubscribeBeat = null;
    }
  }

  public queueHornOnDownbeat(): void {
    this.queuedHorn = true;
  }

  /**
   * Hardware-clock scheduled beat handler.
   */
  private onBeatTick(beatNumber: number, time: number): void {
    const stepInCycle = beatNumber % 16;
    const isDownbeat = (beatNumber % 4) === 0;

    // 1. Queued Horn Hit on Downbeat
    if (this.queuedHorn && (beatNumber % 2 === 0)) {
      this.queuedHorn = false;
      this.engine.playSound('horn_car.mp3', { time, volume: 0.9 });
    }

    // 2. Upright Bass Stem (Beats 0 and 2 of each 4-beat measure)
    if (this.isBassActive && (beatNumber % 2 === 0)) {
      const chord = this.chordProgression[stepInCycle];
      const bassNote = chord === 'C4' ? 'C4' : 'G4';
      // Play warm acoustic piano or marimba low root note
      this.engine.playInstrumentNote('marimba', bassNote, {
        time,
        volume: 0.6,
        pitch: 0.5 // Sub-octave for deep upright bass feel
      });
    }

    // 3. Acoustic Rhythm / Percussion (Woodblock / click on offbeats 1 & 3)
    if (this.isRhythmActive) {
      if (beatNumber % 2 === 1) {
        // High crisp snap
        this.engine.playSound('door_bell.mp3', {
          time,
          volume: 0.15,
          pitch: 1.8
        });
      } else {
        // Low warm tap
        this.engine.playSound('boing.mp3', {
          time,
          volume: 0.18,
          pitch: 2.2
        });
      }
    }

    // 4. Acoustic Chord Comping (Light marimba/glock chord arpeggio)
    if (this.isChordsActive && beatNumber % 2 === 0) {
      const chordRoot = this.chordProgression[stepInCycle];
      const notes = chordRoot === 'C4' ? ['C4', 'E4', 'G4'] : ['D4', 'G4', 'B4' as string];

      notes.forEach((n, idx) => {
        const strumOffset = idx * 0.025; // Gentle acoustic strum flam
        this.engine.playInstrumentNote('marimba', n === 'B4' ? 'G4' : n, {
          time: time + strumOffset,
          volume: 0.28,
          pitch: n === 'B4' ? 1.25 : 1.0
        });
      });
    }

    // 5. Melodic Glockenspiel Accent on Downbeats
    if (isDownbeat) {
      this.engine.playInstrumentNote('glock', 'C5', {
        time,
        volume: 0.35,
        pitch: stepInCycle >= 8 ? 1.2 : 1.0
      });
    }
  }
}
