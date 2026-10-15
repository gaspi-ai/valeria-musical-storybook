/**
 * MusicalMeScene.ts
 * Interactive "Musical Me" Storybook Garden Scene (Pitch & Melodic Exploration).
 * 
 * Features:
 * - Pentatonic Harmony (C4, D4, E4, G4, A4, C5, D5, E5) so every tap sounds delightful and never dissonant.
 * - Real acoustic wooden marimba, metallic glockenspiel, studio piano, and music box sounds.
 * - Whimsical smiling flower / lily pad sound bars with squash-stretch physics and organic ripple bursts.
 * - Gentle Call-and-Response mode with a cute singing Bluebird companion, glowing guidance, and confetti celebration.
 */

import { AudioEngine } from '../audio/AudioEngine';
import type { InstrumentType } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import confetti from 'canvas-confetti';

interface SoundPad {
  note: string;
  label: string;
  color: string;
  stemColor: string;
  icon: string;
}

export class MusicalMeScene {
  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;

  public element!: HTMLElement;
  public currentInstrument: InstrumentType = 'marimba';

  // Pentatonic Sound Pads
  private readonly pads: SoundPad[] = [
    { note: 'C4', label: 'Do', color: '#FF6B6B', stemColor: '#E63946', icon: '🌸' },
    { note: 'D4', label: 'Re', color: '#FF9F1C', stemColor: '#F77F00', icon: '🌻' },
    { note: 'E4', label: 'Mi', color: '#FFD166', stemColor: '#FCBF49', icon: '🌼' },
    { note: 'G4', label: 'Sol', color: '#06D6A0', stemColor: '#2A9D8F', icon: '🌿' },
    { note: 'A4', label: 'La', color: '#118AB2', stemColor: '#0077B6', icon: '🌷' },
    { note: 'C5', label: 'Do', color: '#7209B7', stemColor: '#560BAD', icon: '🌺' },
    { note: 'D5', label: 'Re', color: '#F72585', stemColor: '#B5179E', icon: '🌹' }
  ];

  // Call & response state
  private isCallResponseActive: boolean = false;
  private promptPadIndex: number = 0;
  private companionEl!: HTMLElement;
  private padElements: HTMLElement[] = [];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    this.container = container;
    this.bursts = bursts;
    this.engine = AudioEngine.getInstance();

    this.render();
    this.bindEvents();
  }

  public activate(): void {
    this.element.style.display = 'block';
    // Greet with gentle arpeggio
    setTimeout(() => {
      this.playGentleGlissando();
    }, 350);
  }

  public deactivate(): void {
    this.element.style.display = 'none';
  }

  public setInstrument(inst: InstrumentType): void {
    this.currentInstrument = inst;
    const instButtons = this.element.querySelectorAll('.inst-badge');
    instButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-inst') === inst);
    });
  }

  private render(): void {
    this.element = document.createElement('div');
    this.element.className = 'scene musical-me-scene';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- Dreamy Watercolor Garden Backdrop -->
      <div class="garden-sky">
        <div class="sky-rainbow"></div>
        <div class="sky-clouds">
          <div class="garden-cloud gc-1">☁️</div>
          <div class="garden-cloud gc-2">☁️</div>
          <div class="garden-cloud gc-3">☁️</div>
        </div>

        <!-- Singing Bluebird Musical Companion -->
        <div class="musical-companion" id="music-companion" title="Tap me to play a song!">
          <div class="companion-bird">
            <svg viewBox="0 0 100 90" class="bird-svg">
              <!-- Body -->
              <ellipse cx="50" cy="50" rx="32" ry="26" fill="#4CC9F0" stroke="#3A0CA3" stroke-width="3" />
              <!-- Belly -->
              <ellipse cx="46" cy="56" rx="20" ry="16" fill="#CAF0F8" />
              <!-- Wing with Flutter -->
              <path class="bird-wing" d="M 40 45 Q 20 30 30 65 Q 45 60 40 45" fill="#4361EE" stroke="#3A0CA3" stroke-width="2.5" />
              <!-- Eye -->
              <circle cx="68" cy="42" r="7" fill="#2B2D42" />
              <circle cx="66" cy="40" r="2.5" fill="#FFFFFF" />
              <!-- Cheerful Beak -->
              <polygon points="76,44 94,48 76,54" fill="#FFB703" stroke="#FB8500" stroke-width="2" />
              <!-- Musical notes singing out -->
              <g class="bird-music-notes">
                <text x="82" y="26" font-size="18" fill="#FFB703" class="chirp-note n1">♪</text>
                <text x="92" y="16" font-size="16" fill="#F72585" class="chirp-note n2">♫</text>
              </g>
            </svg>
            <div class="companion-speech-bubble" id="companion-bubble">
              <span>Tap me to play! 🎵</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Garden Rolling Grass Foreground -->
      <div class="garden-ground">
        <div class="grass-hill hill-back"></div>
        <div class="grass-hill hill-front"></div>
      </div>

      <!-- Pentatonic Storybook Sound Bars (Friendly Blooming Flower Bars) -->
      <div class="sound-pads-container" id="sound-pads-root">
        ${this.pads.map((pad, idx) => `
          <div class="sound-pad-wrapper" data-index="${idx}" data-note="${pad.note}" style="--pad-color: ${pad.color}; --stem-color: ${pad.stemColor};">
            <!-- Flower Stem & Leaves -->
            <div class="pad-stem">
              <div class="pad-leaf leaf-left"></div>
              <div class="pad-leaf leaf-right"></div>
            </div>

            <!-- Big Friendly Touchable Sound Pad / Blossom -->
            <div class="sound-pad-flower" id="pad-${idx}">
              <div class="pad-glow-ring"></div>
              <div class="pad-petal-petals">
                <span class="pad-emoji">${pad.icon}</span>
              </div>
              <div class="pad-center-face">
                <div class="pad-eyes">
                  <span class="eye"></span>
                  <span class="eye"></span>
                </div>
                <div class="pad-smile"></div>
              </div>
              <span class="pad-solfege-label">${pad.label}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Instrument Switcher Bar (Toddler Friendly Big Badges) -->
      <div class="instrument-selector-bar">
        <button class="inst-badge active" data-inst="marimba" title="Wooden Marimba">
          <span class="inst-icon">🪵</span>
          <span class="inst-name">Marimba</span>
        </button>
        <button class="inst-badge" data-inst="glock" title="Sparkling Glockenspiel">
          <span class="inst-icon">🔔</span>
          <span class="inst-name">Bells</span>
        </button>
        <button class="inst-badge" data-inst="piano" title="Studio Grand Piano">
          <span class="inst-icon">🎹</span>
          <span class="inst-name">Piano</span>
        </button>
        <button class="inst-badge" data-inst="musicbox" title="Dreamy Music Box">
          <span class="inst-icon">🎼</span>
          <span class="inst-name">Music Box</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.element);

    this.companionEl = this.element.querySelector('#music-companion') as HTMLElement;
    this.padElements = Array.from(this.element.querySelectorAll('.sound-pad-flower')) as HTMLElement[];
  }

  private bindEvents(): void {
    // 1. Multi-Touch Sound Pad Strikes
    const padWrappers = this.element.querySelectorAll('.sound-pad-wrapper');
    padWrappers.forEach((wrap) => {
      wrap.addEventListener('pointerdown', (e: Event) => {
        const pe = e as PointerEvent;
        pe.preventDefault();
        pe.stopPropagation();

        const index = parseInt(wrap.getAttribute('data-index') || '0', 10);
        const note = wrap.getAttribute('data-note') || 'C4';
        this.strikePad(index, note, pe.clientX, pe.clientY);
      });
    });

    // 2. Instrument Badge Selectors
    const instBadges = this.element.querySelectorAll('.inst-badge');
    instBadges.forEach(btn => {
      btn.addEventListener('pointerdown', (e: Event) => {
        const pe = e as PointerEvent;
        pe.preventDefault();
        pe.stopPropagation();

        const inst = btn.getAttribute('data-inst') as InstrumentType;
        this.setInstrument(inst);
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 10, '#FFD166');
        this.engine.playInstrumentNote(inst, 'C5', { volume: 0.8 });
      });
    });

    // 3. Singing Companion Call & Response Trigger
    this.companionEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.bursts.spawnBurst(e.clientX, e.clientY, 16, '#4CC9F0');
      this.triggerCallAndResponse();
    });
  }

  /**
   * Strikes a sound pad with organic resonance, particle bursts, and squash-stretch.
   */
  public strikePad(index: number, note: string, touchX: number, touchY: number): void {
    const padConfig = this.pads[index];
    const padEl = this.padElements[index];

    // 1. Play real acoustic studio instrument note
    this.engine.playInstrumentNote(this.currentInstrument, note, {
      volume: 0.85
    });

    // 2. Spawn tactile burst
    this.bursts.spawnBurst(touchX, touchY, 14, padConfig.color);

    // 3. Squash and Stretch Physics on Flower Pad
    if (padEl) {
      padEl.classList.remove('pad-strike');
      void padEl.offsetWidth; // force reflow
      padEl.classList.add('pad-strike');
    }

    // 4. Call & Response validation
    if (this.isCallResponseActive && index === this.promptPadIndex) {
      this.celebrateCallResponseSuccess(touchX, touchY);
    }
  }

  /**
   * Call & Response: The Bluebird sings a note motif and illuminates the flower pad.
   */
  private triggerCallAndResponse(): void {
    this.isCallResponseActive = true;
    const bubble = this.element.querySelector('#companion-bubble') as HTMLElement;
    bubble.innerHTML = `<span>Listen & Tap! 🎶</span>`;

    // Pick a random target pad
    this.promptPadIndex = Math.floor(Math.random() * this.pads.length);
    const targetPad = this.pads[this.promptPadIndex];

    // Flutter bird
    this.companionEl.classList.add('bird-singing');

    // Bird plays the target note
    setTimeout(() => {
      this.engine.playInstrumentNote(this.currentInstrument, targetPad.note, { volume: 0.9 });
      this.highlightPad(this.promptPadIndex);
    }, 400);

    setTimeout(() => {
      this.companionEl.classList.remove('bird-singing');
      bubble.innerHTML = `<span>Your turn! 👆</span>`;
    }, 1200);
  }

  private highlightPad(index: number): void {
    const padEl = this.padElements[index];
    if (padEl) {
      padEl.classList.add('pad-golden-glow');
    }
  }

  private celebrateCallResponseSuccess(touchX: number, touchY: number): void {
    this.isCallResponseActive = false;
    const bubble = this.element.querySelector('#companion-bubble') as HTMLElement;
    bubble.innerHTML = `<span>Yay! Wonderful! 🌟</span>`;

    // Clear glows
    this.padElements.forEach(p => p.classList.remove('pad-golden-glow'));

    // Joyful acoustic applause & fanfare
    this.engine.playSound('fanfare.mp3', { volume: 0.7 });
    this.engine.playSound('laugh.mp3', { volume: 0.5 });

    // Confetti burst
    confetti({
      particleCount: 45,
      spread: 60,
      origin: {
        x: touchX / window.innerWidth,
        y: touchY / window.innerHeight
      },
      colors: ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2']
    });

    // Reset bubble after 2.5s
    setTimeout(() => {
      bubble.innerHTML = `<span>Tap me to play! 🎵</span>`;
    }, 2500);
  }

  /**
   * Sweeps across the pentatonic scale in a dreamy welcoming waterfall.
   */
  private playGentleGlissando(): void {
    this.pads.forEach((p, idx) => {
      setTimeout(() => {
        this.engine.playInstrumentNote(this.currentInstrument, p.note, { volume: 0.55 });
        const padEl = this.padElements[idx];
        if (padEl) {
          padEl.classList.add('pad-strike');
          setTimeout(() => padEl.classList.remove('pad-strike'), 350);
        }
      }, idx * 110);
    });
  }
}
