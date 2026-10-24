/**
 * TwinkleLittleStarScene.ts
 * Scene 5: "Twinkle, Twinkle, Little Star" (Bedtime Sensory & Melodic Chimes).
 * 
 * Features:
 * - Deep indigo midnight sky with soft glowing pastel clouds and crescent moon in sleeping cap.
 * - Gentle Glockenspiel, Celesta, and Music Box samples at a calming 60 BPM lullaby tempo.
 * - Pentatonic Stars (C5, D5, E5, G5, A5, C6) that illuminate with expanding circular glow & chime.
 * - Constellation Trails: dragging fingers across sky leaves glowing golden dust and plays arpeggios.
 * - Sleeping Moon: tapping plays gentle snore (snore.mp3) and blows floating "Zzz" bubbles that pop into star sparks.
 */

import { AudioEngine } from '../audio/AudioEngine';
import type { InstrumentType } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import type { StorybookScene } from './SceneManager';

interface StarNode {
  id: string;
  note: string;
  xPct: number;
  yPct: number;
  size: number;
  element?: HTMLElement;
}

export class TwinkleLittleStarScene implements StorybookScene {
  public readonly id = 'twinkle_star';
  public readonly title = 'Twinkle, Twinkle, Little Star';
  public readonly subtitle = 'Bedtime Melodic Chimes';
  public readonly icon = '⭐';
  public readonly themeColor = '#7209B7';

  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;

  public element!: HTMLElement;

  // Scene elements
  private moonEl!: HTMLElement;
  private constellationCanvas!: HTMLCanvasElement;
  private constellationCtx!: CanvasRenderingContext2D;
  private starsContainerEl!: HTMLElement;

  // Stars configuration (pentatonic bell mapping)
  private readonly stars: StarNode[] = [
    { id: 's1', note: 'C5', xPct: 15, yPct: 22, size: 44 },
    { id: 's2', note: 'D5', xPct: 35, yPct: 18, size: 52 },
    { id: 's3', note: 'E5', xPct: 52, yPct: 30, size: 48 },
    { id: 's4', note: 'G5', xPct: 28, yPct: 45, size: 56 },
    { id: 's5', note: 'A5', xPct: 70, yPct: 20, size: 50 },
    { id: 's6', note: 'C6', xPct: 82, yPct: 38, size: 60 },
    { id: 's7', note: 'E5', xPct: 42, yPct: 62, size: 46 },
    { id: 's8', note: 'D5', xPct: 65, yPct: 55, size: 54 },
    { id: 's9', note: 'G5', xPct: 85, yPct: 68, size: 48 },
    { id: 's10', note: 'C5', xPct: 18, yPct: 70, size: 52 }
  ];

  // Instrument selection: glock, celesta, musicbox
  private currentInstrument: 'glock' | 'celesta' | 'musicbox' = 'celesta';

  // State
  private isActive: boolean = false;
  private activeTimeouts: Set<number> = new Set();
  private zzzInterval: number | null = null;
  private vocalAudio: HTMLAudioElement | null = null;
  private isVocalPlaying: boolean = false;
  private lastDragNoteTime: number = 0;
  private isDraggingConstellation: boolean = false;
  private lullabyTimer: number | null = null;
  private isLullabyPlaying: boolean = false;

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    this.container = container;
    this.bursts = bursts;
    this.engine = AudioEngine.getInstance();

    this.render();
    this.bindEvents();
  }

  private safeTimeout(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.activeTimeouts.delete(id);
      if (this.isActive) {
        fn();
      }
    }, ms);
    this.activeTimeouts.add(id);
    return id;
  }

  private clearAllTimeouts(): void {
    this.activeTimeouts.forEach(id => clearTimeout(id));
    this.activeTimeouts.clear();
  }

  private render(): void {
    this.element = document.createElement('div');
    this.element.className = 'storybook-scene scene-twinkle-star';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- Deep Indigo Night Sky & Floating Clouds -->
      <div class="night-sky-bg">
        <div class="night-glow-ambient"></div>
        <div class="night-cloud cloud-l"></div>
        <div class="night-cloud cloud-r"></div>
        <div class="night-cloud cloud-mid"></div>
      </div>

      <!-- Constellation Trail Canvas -->
      <canvas class="constellation-canvas" id="constellation-canvas"></canvas>

      <!-- The Sleeping Crescent Moon wearing a nightcap -->
      <div class="sleeping-moon-wrap" id="sleeping-moon" role="button" aria-label="Sleeping Moon">
        <div class="moon-body">
          <div class="moon-face">
            <span class="moon-sleep-eye l"></span>
            <span class="moon-sleep-eye r"></span>
            <span class="moon-rosy-cheek"></span>
            <span class="moon-sleep-mouth"></span>
          </div>
          <div class="moon-nightcap">
            <div class="cap-cone"></div>
            <div class="cap-pom-pom">✨</div>
          </div>
        </div>
        <div class="moon-zzz-container" id="moon-zzz"></div>
        <div class="moon-tap-hint">TAP MOON! 🌙</div>
      </div>

      <!-- Shimmering Pentatonic Stars -->
      <div class="stars-container" id="stars-container"></div>

      <!-- Toddler Bottom Quick Tappers -->
      <div class="twinkle-toddler-bar">
        <button class="twinkle-quick-btn btn-sing-vocal" id="btn-toggle-sing">
          <span class="btn-icon">🌟</span>
          <span class="btn-text">SING 🎶</span>
        </button>
        <button class="twinkle-quick-btn btn-lullaby" id="btn-toggle-lullaby">
          <span class="btn-icon">🔔</span>
          <span class="btn-text">LULLABY</span>
        </button>
        <button class="twinkle-quick-btn btn-inst ${this.currentInstrument === 'celesta' ? 'active' : ''}" data-inst="celesta">
          <span class="btn-icon">✨</span>
          <span class="btn-text">CELESTA</span>
        </button>
        <button class="twinkle-quick-btn btn-inst ${this.currentInstrument === 'glock' ? 'active' : ''}" data-inst="glock">
          <span class="btn-icon">🔔</span>
          <span class="btn-text">BELLS</span>
        </button>
        <button class="twinkle-quick-btn btn-inst ${this.currentInstrument === 'musicbox' ? 'active' : ''}" data-inst="musicbox">
          <span class="btn-icon">🎼</span>
          <span class="btn-text">MUSIC BOX</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.element);

    this.moonEl = this.element.querySelector('#sleeping-moon') as HTMLElement;
    this.constellationCanvas = this.element.querySelector('#constellation-canvas') as HTMLCanvasElement;
    this.constellationCtx = this.constellationCanvas.getContext('2d')!;
    this.starsContainerEl = this.element.querySelector('#stars-container') as HTMLElement;

    this.renderStars();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.constellationCanvas.width = window.innerWidth * dpr;
    this.constellationCanvas.height = window.innerHeight * dpr;
    this.constellationCtx.resetTransform();
    this.constellationCtx.scale(dpr, dpr);
  }

  private renderStars(): void {
    this.starsContainerEl.innerHTML = '';
    for (const star of this.stars) {
      const starEl = document.createElement('div');
      starEl.className = 'interactive-star';
      starEl.id = star.id;
      starEl.style.left = `${star.xPct}%`;
      starEl.style.top = `${star.yPct}%`;
      starEl.style.width = `${star.size}px`;
      starEl.style.height = `${star.size}px`;
      starEl.setAttribute('role', 'button');
      starEl.setAttribute('aria-label', `Star note ${star.note}`);

      starEl.innerHTML = `
        <div class="star-halo"></div>
        <div class="star-shape">
          <svg viewBox="0 0 40 40" class="star-svg">
            <polygon points="20,2 25,14 38,15 28,24 31,37 20,30 9,37 12,24 2,15 15,14" fill="#FFD166" />
          </svg>
          <span class="star-sparkle-center">⭐</span>
        </div>
      `;

      this.starsContainerEl.appendChild(starEl);
      star.element = starEl;

      starEl.addEventListener('pointerdown', (e: PointerEvent) => {
        e.stopPropagation();
        this.triggerStar(star, e.clientX, e.clientY);
      });
    }
  }

  private bindEvents(): void {
    // Sleeping Moon Interaction (Snore & Zzz bubble sparks)
    this.moonEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.triggerMoon(e.clientX, e.clientY);
    });

    // Dragging across the sky connects stars with constellation dust & arpeggios
    this.element.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isDraggingConstellation = true;
      this.handleConstellationDrag(e.clientX, e.clientY);
    });

    this.element.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.isDraggingConstellation) {
        this.handleConstellationDrag(e.clientX, e.clientY);
      }
    });

    const stopDrag = () => {
      this.isDraggingConstellation = false;
      this.fadeConstellationCanvas();
    };
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    // Instrument switcher buttons
    const instBtns = this.element.querySelectorAll('.btn-inst');
    instBtns.forEach(btn => {
      btn.addEventListener('pointerdown', (e: Event) => {
        e.stopPropagation();
        instBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentInstrument = (btn as HTMLElement).getAttribute('data-inst') as 'glock' | 'celesta' | 'musicbox';
        this.engine.playInstrumentNote(this.currentInstrument as InstrumentType, 'C5', { volume: 0.75 });
      });
    });

    // Lullaby toggle button
    const lullabyBtn = this.element.querySelector('#btn-toggle-lullaby') as HTMLElement;
    lullabyBtn.addEventListener('pointerdown', (e: Event) => {
      e.stopPropagation();
      this.toggleLullaby();
    });

    // Real vocal singing toggle button
    const singBtn = this.element.querySelector('#btn-toggle-sing') as HTMLElement;
    singBtn.addEventListener('pointerdown', (e: Event) => {
      e.stopPropagation();
      this.toggleVocalSong();
    });
  }

  public activate(): void {
    this.isActive = true;
    this.element.style.display = 'block';
    this.startZzzLoop();
    this.playInitialBellChime();

    // Spoken voice welcome
    this.safeTimeout(() => {
      if (this.isActive) {
        this.engine.playVoice('voice_twinkle_wish.wav', 'Twinkle twinkle, make a wish!', 0.85);
      }
    }, 1200);
  }

  public deactivate(): void {
    this.isActive = false;
    this.element.style.display = 'none';
    this.clearAllTimeouts();
    if (this.zzzInterval !== null) {
      clearInterval(this.zzzInterval);
      this.zzzInterval = null;
    }
    this.stopLullaby();
    this.stopVocalSong();
    this.fadeConstellationCanvas();
  }

  public toggleVocalSong(): void {
    if (this.isVocalPlaying) {
      this.stopVocalSong();
    } else {
      this.startVocalSong();
    }
  }

  private startVocalSong(): void {
    this.stopVocalSong();
    this.stopLullaby();

    const btn = this.element.querySelector('#btn-toggle-sing') as HTMLElement;
    if (btn) btn.classList.add('active');

    try {
      this.vocalAudio = new Audio(this.engine.resolveAudioPath('audio/songs/twinkle.mp3'));
      this.vocalAudio.volume = 0.95;
      this.isVocalPlaying = true;
      this.vocalAudio.play().catch(e => console.warn('Twinkle vocal song play warning:', e));
      this.vocalAudio.onended = () => {
        this.stopVocalSong();
      };
    } catch (e) {
      console.warn('Could not start vocal song:', e);
    }
  }

  private stopVocalSong(): void {
    this.isVocalPlaying = false;
    const btn = this.element.querySelector('#btn-toggle-sing') as HTMLElement;
    if (btn) btn.classList.remove('active');
    if (this.vocalAudio) {
      this.vocalAudio.pause();
      this.vocalAudio.currentTime = 0;
      this.vocalAudio.removeAttribute('src');
      this.vocalAudio.load();
      this.vocalAudio = null;
    }
  }

  /**
   * Taps an individual star: expanding halo, star glow burst, and authentic chime note.
   */
  public triggerStar(star: StarNode, cx: number, cy: number): void {
    if (!this.isActive) return;

    // Play real acoustic note via polyphonic AudioEngine voice
    this.engine.playInstrumentNote(this.currentInstrument as InstrumentType, star.note, {
      volume: 0.85
    });

    // Star illumination and squash-stretch
    if (star.element) {
      star.element.classList.remove('star-illuminated');
      void star.element.offsetWidth;
      star.element.classList.add('star-illuminated');
      this.safeTimeout(() => star.element?.classList.remove('star-illuminated'), 1200);
    }

    // Radiant celestial star particles
    this.bursts.spawnStarGlow(cx, cy, 14, '#FFE066');
  }

  /**
   * Constellation Dragging: Toddler swipes finger across sky.
   * Plays gentle bell arpeggio and draws sparkling golden dust!
   */
  private handleConstellationDrag(x: number, y: number): void {
    if (!this.isActive) return;

    const now = Date.now();
    if (now - this.lastDragNoteTime > 150) {
      this.lastDragNoteTime = now;

      // Find closest star or random pentatonic note
      const note = this.stars[Math.floor(Math.random() * this.stars.length)].note;
      this.engine.playInstrumentNote(this.currentInstrument as InstrumentType, note, {
        volume: 0.45
      });
      this.bursts.spawnStarGlow(x, y, 4, '#FFD166');
    }

    // Draw glowing constellation trail on canvas
    this.constellationCtx.beginPath();
    this.constellationCtx.arc(x, y, 3, 0, Math.PI * 2);
    this.constellationCtx.fillStyle = 'rgba(255, 230, 102, 0.75)';
    this.constellationCtx.shadowColor = 'rgba(255, 215, 0, 0.9)';
    this.constellationCtx.shadowBlur = 10;
    this.constellationCtx.fill();
  }

  private fadeConstellationCanvas(): void {
    let fadeFrames = 0;
    const fade = () => {
      this.constellationCtx.fillStyle = 'rgba(11, 8, 38, 0.15)';
      this.constellationCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      fadeFrames++;
      if (fadeFrames < 15 && this.isActive) {
        requestAnimationFrame(fade);
      } else {
        this.constellationCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };
    fade();
  }

  /**
   * Sleeping Moon: Plays gentle snore loop and blows floating Zzz bubbles!
   */
  public triggerMoon(cx: number, cy: number): void {
    if (!this.isActive) return;

    this.engine.playSound('snore.mp3', { volume: 0.8 });
    this.engine.playSound('chime.mp3', { volume: 0.5, pitch: 1.2 });
    this.bursts.spawnBurst(cx, cy, 12, '#9D4EDD');

    this.moonEl.classList.remove('moon-smile-bounce');
    void this.moonEl.offsetWidth;
    this.moonEl.classList.add('moon-smile-bounce');

    this.spawnZzzBubble(cx, cy);
  }

  private spawnZzzBubble(_x?: number, _y?: number): void {
    if (!this.isActive) return;

    const zzzWrap = this.element.querySelector('#moon-zzz') as HTMLElement;
    if (!zzzWrap) return;

    const bubble = document.createElement('div');
    bubble.className = 'zzz-bubble';
    bubble.innerText = 'Zzz';
    bubble.style.left = `${Math.random() * 30 + 10}px`;
    bubble.style.top = '0px';

    bubble.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.engine.playSound('bubbles.ogg', { volume: 0.7 });
      this.bursts.spawnStarGlow(e.clientX, e.clientY, 8, '#FFD166');
      bubble.remove();
    });

    zzzWrap.appendChild(bubble);
    this.safeTimeout(() => bubble.remove(), 4000);
  }

  private startZzzLoop(): void {
    if (this.zzzInterval !== null) {
      clearInterval(this.zzzInterval);
    }
    this.zzzInterval = window.setInterval(() => {
      if (this.isActive && this.element.style.display !== 'none') {
        const moonRect = this.moonEl.getBoundingClientRect();
        this.spawnZzzBubble(moonRect.left + 40, moonRect.top);
      }
    }, 3800);
  }

  /**
   * Calming Bedtime 60 BPM Lullaby Auto-Melody.
   */
  public toggleLullaby(): void {
    if (this.isLullabyPlaying) {
      this.stopLullaby();
    } else {
      this.startLullaby();
    }
  }

  private startLullaby(): void {
    this.stopVocalSong();
    this.isLullabyPlaying = true;
    const btn = this.element.querySelector('#btn-toggle-lullaby') as HTMLElement;
    if (btn) btn.classList.add('active');

    // Classic "Twinkle, Twinkle, Little Star" melody in C
    // C C G G A A G - F F E E D D C
    const melody = [
      'C5', 'C5', 'G5', 'G5', 'A5', 'A5', 'G5',
      'E5', 'E5', 'D5', 'D5', 'C5'
    ];
    let step = 0;

    const playNext = () => {
      if (!this.isLullabyPlaying || !this.isActive) return;

      const note = melody[step % melody.length];
      this.engine.playInstrumentNote(this.currentInstrument as InstrumentType, note, {
        volume: 0.65
      });

      // Highlight corresponding star on screen
      const matchedStar = this.stars.find(s => s.note === note);
      if (matchedStar && matchedStar.element) {
        matchedStar.element.classList.add('star-illuminated');
        this.safeTimeout(() => matchedStar.element?.classList.remove('star-illuminated'), 900);
      }

      step++;
      this.lullabyTimer = this.safeTimeout(playNext, 1000); // 60 BPM lullaby pace
    };

    playNext();
  }

  private stopLullaby(): void {
    this.isLullabyPlaying = false;
    const btn = this.element.querySelector('#btn-toggle-lullaby') as HTMLElement;
    if (btn) btn.classList.remove('active');
    if (this.lullabyTimer !== null) {
      clearTimeout(this.lullabyTimer);
      this.lullabyTimer = null;
    }
  }

  private playInitialBellChime(): void {
    const arpeggio = ['C5', 'E5', 'G5', 'C6'];
    arpeggio.forEach((n, idx) => {
      this.safeTimeout(() => {
        if (this.isActive) {
          this.engine.playInstrumentNote(this.currentInstrument as InstrumentType, n, { volume: 0.5 });
        }
      }, idx * 120);
    });
  }
}
