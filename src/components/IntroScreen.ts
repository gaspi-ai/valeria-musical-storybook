/**
 * IntroScreen.ts
 * Large, Inviting "Tap to Play" Audio Unlock Screen for Toddlers.
 * 
 * Features a smiling vibrating storybook sun, bouncing musical notes,
 * and unlocks the Web Audio API AudioContext on the very first touch.
 */

import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from './TouchBurstManager';

export class IntroScreen {
  private container: HTMLElement;
  private onStart: () => void;
  private element!: HTMLElement;
  private bursts: TouchBurstManager;

  constructor(container: HTMLElement, bursts: TouchBurstManager, onStart: () => void) {
    this.container = container;
    this.bursts = bursts;
    this.onStart = onStart;
    this.render();
  }

  private render(): void {
    this.element = document.createElement('div');
    this.element.className = 'intro-screen';

    this.element.innerHTML = `
      <div class="intro-backdrop">
        <div class="intro-floating-note note-1">🎵</div>
        <div class="intro-floating-note note-2">🎶</div>
        <div class="intro-floating-note note-3">⭐</div>
        <div class="intro-floating-note note-4">✨</div>
      </div>

      <div class="intro-center-card">
        <!-- Big Smiling Musical Sun -->
        <div class="intro-sun-wrap">
          <svg class="intro-sun-svg" viewBox="0 0 200 200">
            <!-- Sun Rays -->
            <g class="sun-rays-group">
              <polygon points="100,10 93,36 107,36" fill="#FFA500" />
              <polygon points="100,190 93,164 107,164" fill="#FFA500" />
              <polygon points="10,100 36,93 36,107" fill="#FFA500" />
              <polygon points="190,100 164,93 164,107" fill="#FFA500" />
              <polygon points="36,36 57,48 48,57" fill="#FFA500" />
              <polygon points="164,164 143,152 152,143" fill="#FFA500" />
              <polygon points="164,36 152,57 143,48" fill="#FFA500" />
              <polygon points="36,164 48,143 57,152" fill="#FFA500" />
            </g>
            <!-- Sun Face Body -->
            <circle cx="100" cy="100" r="62" fill="#FFD166" stroke="#F4A261" stroke-width="5" />
            <!-- Cheerful Rosy Cheeks -->
            <circle cx="68" cy="114" r="10" fill="#FF8A8A" opacity="0.6" />
            <circle cx="132" cy="114" r="10" fill="#FF8A8A" opacity="0.6" />
            <!-- Cute Cartoon Eyes with Sparkle -->
            <g class="sun-eyes">
              <ellipse cx="76" cy="94" rx="7" ry="9" fill="#264653" />
              <circle cx="74" cy="91" r="3" fill="#FFFFFF" />
              <ellipse cx="124" cy="94" rx="7" ry="9" fill="#264653" />
              <circle cx="122" cy="91" r="3" fill="#FFFFFF" />
            </g>
            <!-- Big Smiling Mouth -->
            <path d="M 76 112 Q 100 136 124 112" fill="none" stroke="#264653" stroke-width="5" stroke-linecap="round" />
          </svg>
        </div>

        <h1 class="intro-title">Valeria's Musical Storybook</h1>
        <p class="intro-subtitle">Interactive Songs for Little Explorers</p>

        <!-- Big inviting tap button with squash-and-stretch -->
        <button class="intro-tap-btn" id="intro-start-button">
          <span class="tap-hand-icon">👆</span>
          <span class="tap-text">TAP TO PLAY!</span>
          <span class="tap-music-icon">🎶</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.element);

    // Any touch or click unlocks audio immediately
    const handleUnlock = async (e: MouseEvent | TouchEvent | PointerEvent) => {
      e.preventDefault();
      const clientX = 'clientX' in e ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
      const clientY = 'clientY' in e ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);

      const engine = AudioEngine.getInstance();
      await engine.unlock();

      // Spawn joyful burst
      this.bursts.spawnBurst(clientX, clientY, 20, '#FFD166');

      // Play welcome glockenspiel arpeggio
      engine.playInstrumentNote('glock', 'C4', { volume: 0.8 });
      setTimeout(() => engine.playInstrumentNote('glock', 'E4', { volume: 0.8 }), 100);
      setTimeout(() => engine.playInstrumentNote('glock', 'G4', { volume: 0.85 }), 200);
      setTimeout(() => engine.playInstrumentNote('glock', 'C5', { volume: 0.9 }), 300);
      setTimeout(() => engine.playSound('fanfare.mp3', { volume: 0.5 }), 400);

      // Smooth fade out
      this.element.classList.add('fade-out');
      setTimeout(() => {
        if (this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.onStart();
      }, 550);
    };

    const tapBtn = this.element.querySelector('#intro-start-button') as HTMLElement;
    tapBtn.addEventListener('pointerdown', handleUnlock);
    this.element.addEventListener('pointerdown', (e) => {
      if (e.target === this.element || (e.target as HTMLElement).classList.contains('intro-sun-wrap')) {
        handleUnlock(e);
      }
    });
  }
}
