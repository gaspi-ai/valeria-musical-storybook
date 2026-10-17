/**
 * SongsJukebox.ts
 * Dedicated "Songs Section" (Toddler Jukebox) for Valeria's Musical Storybook.
 * Optimized for iPhone 12 Pro (390 x 844 viewport, safe-area aware).
 * 
 * Features:
 * - 6-Card Jukebox Grid with min 140px x 140px touch targets & squash-and-stretch physics.
 * - Fullscreen Theater Mode (100dvh x 100dvw, touch-action: none) with Lottie + SVG reactive stages.
 * - Time-Coded Beat Event Dispatcher: syncs animation scales and pulses to audio clock.
 * - Multi-touch interactive particle canvas (30-particle object pool for zero GC latency).
 * - Discreet Parent Exit (2-second hold or double-tap with circular SVG progress ring).
 * - Celebratory finish with gentle confetti & smooth loop.
 */

import lottie from 'lottie-web';
import type { AnimationItem } from 'lottie-web';
import confetti from 'canvas-confetti';
import { SongPlayer, type SongMetadata } from './SongPlayer';
import { AudioEngine } from '../audio/AudioEngine';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'heart' | 'star' | 'circle' | 'sparkle';
  active: boolean;
}

export class SongsJukebox {
  private container: HTMLElement;
  private player: SongPlayer;
  private engine: AudioEngine;

  // Root view element
  private element!: HTMLElement;
  private gridViewEl!: HTMLElement;
  private theaterViewEl!: HTMLElement;
  private lottieContainer!: HTMLElement;
  private activeLottieAnim: AnimationItem | null = null;
  private stageInteractiveEl!: HTMLElement;

  // Canvas particle overlay
  private particleCanvas!: HTMLCanvasElement;
  private particleCtx!: CanvasRenderingContext2D;
  private readonly POOL_SIZE = 30;
  private particlePool: Particle[] = [];
  private particleAnimId: number = 0;

  // Discreet Parent Exit
  private exitBtn!: HTMLElement;
  private exitProgressRing!: SVGCircleElement;
  private holdStartTime: number = 0;
  private holdDurationMs: number = 2000; // 2-second hold
  private holdAnimFrame: number = 0;
  private lastTapTime: number = 0;

  // State
  private isJukeboxOpen: boolean = false;
  private isTheaterActive: boolean = false;
  private beatCleanup: (() => void) | null = null;
  private endCleanup: (() => void) | null = null;

  // Back to storybook callback
  private onBackToStorybook: () => void;

  constructor(container: HTMLElement, onBackToStorybook: () => void) {
    this.container = container;
    this.onBackToStorybook = onBackToStorybook;
    this.player = SongPlayer.getInstance();
    this.engine = AudioEngine.getInstance();

    this.render();
    this.initParticlePool();
    this.bindEvents();
  }

  private render(): void {
    this.element = document.createElement('div');
    this.element.className = 'toddler-jukebox-container';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- ==============================================================
           1. SELECTION VIEW: 6-CARD SONG JUKEBOX GRID
           ============================================================== -->
      <div class="jukebox-grid-view" id="jukebox-grid-view">
        <header class="jukebox-header">
          <button class="jukebox-back-btn" id="btn-back-to-storybook" aria-label="Back to Storybook">
            <span class="back-icon">⬅️</span>
            <span class="back-text">STORYBOOK</span>
          </button>
          <div class="jukebox-title-wrap">
            <h1 class="jukebox-title">🎶 Toddler Jukebox</h1>
            <p class="jukebox-subtitle">Tap any song to sing & play!</p>
          </div>
          <div class="jukebox-header-spacer"></div>
        </header>

        <!-- 6 Vibrant Touch Target Cards (>= 140px x 140px) -->
        <div class="jukebox-cards-grid">
          ${SongPlayer.SONGS.map(song => `
            <div class="song-card" data-song-id="${song.id}" role="button" tabindex="0" aria-label="Play ${song.title}" style="--song-color: ${song.themeColor}; --song-accent: ${song.accentColor}">
              <div class="song-card-aura"></div>
              <div class="song-card-icon-wrap">
                <span class="song-card-icon">${song.icon}</span>
                <span class="song-card-musical-note">🎵</span>
              </div>
              <div class="song-card-info">
                <h3 class="song-card-title">${song.title}</h3>
                <span class="song-card-subtitle">${song.subtitle}</span>
              </div>
              <div class="song-card-badge">TAP TO PLAY ▶</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ==============================================================
           2. FULLSCREEN THEATER MODE (100dvh x 100dvw)
           ============================================================== -->
      <div class="jukebox-theater-view" id="jukebox-theater-view" style="display: none;">
        <!-- Lottie Vector Stage Background -->
        <div class="theater-lottie-stage" id="theater-lottie-stage"></div>

        <!-- Reactive SVG Vector Layer (Beat-pulsed & interactive) -->
        <div class="theater-interactive-stage" id="theater-interactive-stage"></div>

        <!-- 60 FPS Multi-Touch Canvas Particle Overlay -->
        <canvas class="theater-particle-canvas" id="theater-particle-canvas"></canvas>

        <!-- Subtle Top-Right Discreet Parent Exit Button (2s Hold / Double-Tap) -->
        <div class="theater-discreet-exit-wrap">
          <div class="theater-exit-btn" id="theater-exit-btn" role="button" aria-label="Hold 2s or double-tap to return to song list">
            <svg class="exit-ring-svg" viewBox="0 0 44 44">
              <circle class="exit-ring-bg" cx="22" cy="22" r="18" />
              <circle class="exit-ring-progress" cx="22" cy="22" r="18" />
            </svg>
            <div class="exit-icon-inner">
              <span class="exit-icon">✕</span>
              <span class="exit-label">HOLD</span>
            </div>
          </div>
        </div>

        <!-- Celebration Overlay on Song Complete -->
        <div class="theater-celebration-overlay" id="theater-celebration-overlay" style="display: none;">
          <div class="celebration-card">
            <span class="celebration-icon">🎉⭐🎉</span>
            <h2>BEAUTIFUL SINGING!</h2>
            <p>Playing again soon, or pick another song!</p>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    // Cache elements
    this.gridViewEl = this.element.querySelector('#jukebox-grid-view') as HTMLElement;
    this.theaterViewEl = this.element.querySelector('#jukebox-theater-view') as HTMLElement;
    this.lottieContainer = this.element.querySelector('#theater-lottie-stage') as HTMLElement;
    this.stageInteractiveEl = this.element.querySelector('#theater-interactive-stage') as HTMLElement;
    this.particleCanvas = this.element.querySelector('#theater-particle-canvas') as HTMLCanvasElement;
    this.particleCtx = this.particleCanvas.getContext('2d', { alpha: true })!;

    this.exitBtn = this.element.querySelector('#theater-exit-btn') as HTMLElement;
    this.exitProgressRing = this.element.querySelector('.exit-ring-progress') as SVGCircleElement;

    const circumference = 2 * Math.PI * 18;
    this.exitProgressRing.style.strokeDasharray = `${circumference}`;
    this.exitProgressRing.style.strokeDashoffset = `${circumference}`;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (!this.particleCanvas) return;
    this.particleCanvas.width = window.innerWidth;
    this.particleCanvas.height = window.innerHeight;
  }

  private initParticlePool(): void {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      this.particlePool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 20,
        color: '#FF6B8B',
        alpha: 1,
        life: 0,
        maxLife: 60,
        shape: 'heart',
        active: false
      });
    }
  }

  private bindEvents(): void {
    // 1. Return to Storybook button
    const backBtn = this.element.querySelector('#btn-back-to-storybook') as HTMLElement;
    backBtn.addEventListener('click', () => {
      this.engine.playSound('woodblock.mp3', { volume: 0.7 });
      this.closeJukebox();
      this.onBackToStorybook();
    });

    // 2. Song Card selection (Tactile squash-and-stretch bounce)
    const cards = this.element.querySelectorAll('.song-card');
    cards.forEach(card => {
      const handleSelect = (e: Event) => {
        e.preventDefault();
        const songId = card.getAttribute('data-song-id');
        if (!songId) return;

        // Tactile squash-and-stretch
        card.classList.add('squash-bounce');
        this.engine.playSound('chime.mp3', { volume: 0.8 });
        setTimeout(() => card.classList.remove('squash-bounce'), 450);

        // Open Fullscreen Theater
        setTimeout(() => {
          this.openTheaterMode(songId);
        }, 180);
      };

      card.addEventListener('pointerdown', handleSelect);
    });

    // 3. Discreet Parent Exit (2-Second Hold OR Double-Tap)
    this.setupDiscreetExit();

    // 4. Interactive touch layer in theater mode
    this.theaterViewEl.addEventListener('pointerdown', (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.theater-discreet-exit-wrap')) return;
      this.handleTheaterTouch(e.clientX, e.clientY);
    });
  }

  /**
   * Discreet Parent Exit with circular SVG progress animation.
   */
  private setupDiscreetExit(): void {
    const circumference = 2 * Math.PI * 18;

    const startHold = (e: PointerEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Check double-tap shortcut
      const now = Date.now();
      if (now - this.lastTapTime < 350) {
        this.cancelHold();
        this.closeTheaterMode();
        return;
      }
      this.lastTapTime = now;

      this.holdStartTime = now;
      this.exitBtn.classList.add('holding');

      const updateProgress = () => {
        const elapsed = Date.now() - this.holdStartTime;
        const progress = Math.min(1.0, elapsed / this.holdDurationMs);
        this.exitProgressRing.style.strokeDashoffset = `${circumference * (1 - progress)}`;

        if (progress >= 1.0) {
          this.cancelHold();
          this.closeTheaterMode();
        } else {
          this.holdAnimFrame = requestAnimationFrame(updateProgress);
        }
      };

      this.holdAnimFrame = requestAnimationFrame(updateProgress);
    };

    const cancelHold = () => {
      this.cancelHold();
    };

    this.exitBtn.addEventListener('pointerdown', startHold);
    this.exitBtn.addEventListener('pointerup', cancelHold);
    this.exitBtn.addEventListener('pointercancel', cancelHold);
    this.exitBtn.addEventListener('pointerleave', cancelHold);
  }

  private cancelHold(): void {
    cancelAnimationFrame(this.holdAnimFrame);
    this.exitBtn.classList.remove('holding');
    const circumference = 2 * Math.PI * 18;
    this.exitProgressRing.style.strokeDashoffset = `${circumference}`;
  }

  /**
   * Opens the Jukebox selection view.
   */
  public openJukebox(): void {
    this.isJukeboxOpen = true;
    this.element.style.display = 'block';
    this.gridViewEl.style.display = 'block';
    this.theaterViewEl.style.display = 'none';
  }

  /**
   * Closes the Jukebox and returns to standard scenes.
   */
  public closeJukebox(): void {
    this.isJukeboxOpen = false;
    this.closeTheaterMode();
    this.element.style.display = 'none';
  }

  /**
   * Launches Fullscreen Theater Mode for a given song.
   */
  public async openTheaterMode(songId: string): Promise<void> {
    const song = SongPlayer.SONGS.find(s => s.id === songId);
    if (!song) return;

    this.isTheaterActive = true;
    this.gridViewEl.style.display = 'none';
    this.theaterViewEl.style.display = 'block';
    this.element.style.background = song.themeColor;

    // Load Lottie Animation
    this.loadLottie(song.lottieFile);

    // Build the reactive SVG stage
    this.buildReactiveStage(song);

    // Start audio & sync
    await this.player.playSong(song);

    // Hook time-coded beat pulses
    if (this.beatCleanup) this.beatCleanup();
    this.beatCleanup = this.player.onBeat((beat) => {
      this.handleBeatSync(beat);
    });

    // Hook song complete
    if (this.endCleanup) this.endCleanup();
    this.endCleanup = this.player.onEnded(() => {
      this.handleSongComplete(song);
    });

    this.startParticleLoop();
  }

  public closeTheaterMode(): void {
    this.isTheaterActive = false;
    this.player.stop();

    if (this.beatCleanup) {
      this.beatCleanup();
      this.beatCleanup = null;
    }
    if (this.endCleanup) {
      this.endCleanup();
      this.endCleanup = null;
    }

    if (this.activeLottieAnim) {
      this.activeLottieAnim.destroy();
      this.activeLottieAnim = null;
    }

    cancelAnimationFrame(this.particleAnimId);
    this.particlePool.forEach(p => p.active = false);

    const celebration = this.element.querySelector('#theater-celebration-overlay') as HTMLElement;
    if (celebration) celebration.style.display = 'none';

    this.theaterViewEl.style.display = 'none';
    this.gridViewEl.style.display = 'block';
    this.element.style.background = '';
  }

  /**
   * Loads Lottie JSON animation.
   */
  private loadLottie(path: string): void {
    if (this.activeLottieAnim) {
      this.activeLottieAnim.destroy();
      this.activeLottieAnim = null;
    }

    this.lottieContainer.innerHTML = '';
    try {
      this.activeLottieAnim = lottie.loadAnimation({
        container: this.lottieContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: path
      });
    } catch (err) {
      console.warn('Lottie load warning:', err);
    }
  }

  /**
   * Builds high-contrast, cute reactive SVG characters for the selected song.
   */
  private buildReactiveStage(song: SongMetadata): void {
    let stageHtml = '';

    if (song.id === 'mommy') {
      stageHtml = `
        <div class="theater-stage-content stage-mommy">
          <div class="mommy-tree-canopy">
            <span class="blossom b1">🌸</span>
            <span class="blossom b2">🌸</span>
            <span class="blossom b3">🌺</span>
            <span class="blossom b4">🌸</span>
          </div>
          <div class="bears-duo-wrap" id="theater-beat-target">
            <div class="mama-bear" role="button" aria-label="Mama Bear">
              <div class="bear-ear left"></div>
              <div class="bear-ear right"></div>
              <div class="bear-face">
                <div class="bear-eye left"></div>
                <div class="bear-eye right"></div>
                <div class="bear-muzzle"><div class="bear-nose"></div></div>
                <div class="bear-blush left"></div>
                <div class="bear-blush right"></div>
              </div>
              <div class="bear-arm left"></div>
              <div class="bear-arm right"></div>
            </div>
            <div class="baby-bear" role="button" aria-label="Baby Bear">
              <div class="baby-ear left"></div>
              <div class="baby-ear right"></div>
              <div class="baby-face">
                <div class="baby-eye left"></div>
                <div class="baby-eye right"></div>
                <div class="baby-muzzle"><div class="baby-nose"></div></div>
              </div>
            </div>
          </div>
          <div class="floating-hearts-stream" id="floating-hearts-stream">
            <span class="stream-heart h1">💖</span>
            <span class="stream-heart h2">💕</span>
            <span class="stream-heart h3">💖</span>
          </div>
        </div>
      `;
    } else if (song.id === 'sunshine') {
      stageHtml = `
        <div class="theater-stage-content stage-sunshine">
          <div class="sun-character-wrap" id="theater-beat-target" role="button" aria-label="Smiling Sunshine">
            <div class="sun-rays-rotator">
              <span class="ray r1"></span><span class="ray r2"></span><span class="ray r3"></span><span class="ray r4"></span>
              <span class="ray r5"></span><span class="ray r6"></span><span class="ray r7"></span><span class="ray r8"></span>
            </div>
            <div class="sun-main-body">
              <div class="sun-cool-sunglasses">
                <div class="lens left"></div>
                <div class="lens right"></div>
                <div class="glasses-bridge"></div>
              </div>
              <div class="sun-bright-smile"></div>
              <div class="sun-rosy-cheeks left"></div>
              <div class="sun-rosy-cheeks right"></div>
            </div>
          </div>
          <div class="sunflowers-row">
            <div class="swaying-sunflower sf-1">🌻</div>
            <div class="swaying-sunflower sf-2">🌻</div>
            <div class="swaying-sunflower sf-3">🌻</div>
          </div>
        </div>
      `;
    } else if (song.id === 'monkeys') {
      stageHtml = `
        <div class="theater-stage-content stage-monkeys">
          <div class="monkeys-bedroom">
            <div class="bed-frame">
              <div class="bed-headboard"></div>
              <div class="bed-mattress" id="theater-beat-target">
                <div class="mattress-stripe s1"></div>
                <div class="mattress-stripe s2"></div>
                <div class="mattress-stripe s3"></div>
              </div>
              <div class="bed-pillows">
                <div class="fluffy-pillow left"></div>
                <div class="fluffy-pillow right"></div>
              </div>
            </div>
            <div class="jumping-monkeys-layer">
              <div class="jumping-monkey m-1" id="monkey-1" role="button" aria-label="Jumping Monkey 1">
                <div class="m-ear l"></div><div class="m-ear r"></div>
                <div class="m-head"><div class="m-eye l"></div><div class="m-eye r"></div><div class="m-mouth"></div></div>
                <div class="m-body"></div>
              </div>
              <div class="jumping-monkey m-2" id="monkey-2" role="button" aria-label="Jumping Monkey 2">
                <div class="m-ear l"></div><div class="m-ear r"></div>
                <div class="m-head"><div class="m-eye l"></div><div class="m-eye r"></div><div class="m-mouth"></div></div>
                <div class="m-body"></div>
              </div>
              <div class="jumping-monkey m-3" id="monkey-3" role="button" aria-label="Jumping Monkey 3">
                <div class="m-ear l"></div><div class="m-ear r"></div>
                <div class="m-head"><div class="m-eye l"></div><div class="m-eye r"></div><div class="m-mouth"></div></div>
                <div class="m-body"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (song.id === 'twinkle') {
      stageHtml = `
        <div class="theater-stage-content stage-twinkle">
          <div class="night-sky-cosmos" id="theater-beat-target">
            <div class="crescent-moon-glow">
              <div class="crescent-moon-shape"></div>
              <div class="moon-sleepy-eye"></div>
            </div>
            <div class="main-hero-star" id="hero-twinkle-star" role="button" aria-label="Twinkle Star">
              <span class="star-sparkle-center">⭐</span>
              <div class="star-halo-ring"></div>
            </div>
            <div class="constellation-sparkles">
              <span class="mini-star ms-1">✦</span>
              <span class="mini-star ms-2">✧</span>
              <span class="mini-star ms-3">✦</span>
              <span class="mini-star ms-4">✧</span>
              <span class="mini-star ms-5">✦</span>
            </div>
          </div>
        </div>
      `;
    } else if (song.id === 'old_macdonald') {
      stageHtml = `
        <div class="theater-stage-content stage-farm">
          <div class="farm-countryside" id="theater-beat-target">
            <div class="farm-red-barn">
              <div class="barn-roof"></div>
              <div class="barn-door-white-x"></div>
            </div>
            <div class="singing-animals-trio">
              <div class="singing-cow" id="farm-cow" role="button" aria-label="Singing Cow">
                <span class="animal-avatar">🐮</span>
                <span class="note-bubble">MOO! ♪</span>
              </div>
              <div class="singing-sheep" id="farm-sheep" role="button" aria-label="Singing Sheep">
                <span class="animal-avatar">🐑</span>
                <span class="note-bubble">BAA! ♫</span>
              </div>
              <div class="singing-duck" id="farm-duck" role="button" aria-label="Singing Duck">
                <span class="animal-avatar">🦆</span>
                <span class="note-bubble">QUACK! ♬</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Rock-a-Bye Baby
      stageHtml = `
        <div class="theater-stage-content stage-lullaby">
          <div class="treetop-cradle-wrap" id="theater-beat-target">
            <div class="treetop-branch"></div>
            <div class="hanging-cradle" id="hanging-cradle" role="button" aria-label="Rocking Cradle">
              <div class="cradle-wood">
                <span class="baby-face-peek">👶</span>
                <div class="cradle-stars-carving">⭐ 🌙 ⭐</div>
              </div>
            </div>
            <div class="fireflies-cluster">
              <span class="firefly ff-1">✨</span>
              <span class="firefly ff-2">✨</span>
              <span class="firefly ff-3">✨</span>
            </div>
          </div>
        </div>
      `;
    }

    this.stageInteractiveEl.innerHTML = stageHtml;

    // Attach custom stage clicks
    this.bindStageInteractions(song.id);
  }

  private bindStageInteractions(songId: string): void {
    if (songId === 'mommy') {
      const duo = this.stageInteractiveEl.querySelector('.bears-duo-wrap');
      duo?.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.engine.playHarpNote('C5', { volume: 0.85 });
        const ev = e as PointerEvent;
        this.spawnBurst(ev.clientX, ev.clientY, 12, 'heart', '#FF6B8B');
      });
    } else if (songId === 'sunshine') {
      const sun = this.stageInteractiveEl.querySelector('.sun-character-wrap');
      sun?.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.engine.playGlockNote('G5', { volume: 0.9 });
        this.engine.playSound('laugh.mp3', { volume: 0.7, pitch: 1.25 });
        const ev = e as PointerEvent;
        this.spawnBurst(ev.clientX, ev.clientY, 15, 'sparkle', '#FFAA00');
      });
    } else if (songId === 'monkeys') {
      const monkeys = this.stageInteractiveEl.querySelectorAll('.jumping-monkey');
      monkeys.forEach(m => {
        m.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          m.classList.add('backflip');
          this.engine.playSound('boing.mp3', { volume: 0.8, pitch: 1.3 });
          setTimeout(() => m.classList.remove('backflip'), 700);
          const ev = e as PointerEvent;
          this.spawnBurst(ev.clientX, ev.clientY, 10, 'circle', '#10B981');
        });
      });
    } else if (songId === 'twinkle') {
      const star = this.stageInteractiveEl.querySelector('#hero-twinkle-star');
      star?.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.engine.playGlockNote('C6', { volume: 0.95 });
        const ev = e as PointerEvent;
        this.spawnBurst(ev.clientX, ev.clientY, 14, 'star', '#FFD166');
      });
    } else if (songId === 'old_macdonald') {
      const cow = this.stageInteractiveEl.querySelector('#farm-cow');
      const sheep = this.stageInteractiveEl.querySelector('#farm-sheep');
      const duck = this.stageInteractiveEl.querySelector('#farm-duck');

      cow?.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.engine.playSound('cow.ogg', { volume: 0.9 });
        const ev = e as PointerEvent;
        this.spawnBurst(ev.clientX, ev.clientY, 8, 'circle', '#D97706');
      });
      sheep?.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.engine.playSound('sheep.ogg', { volume: 0.9 });
        const ev = e as PointerEvent;
        this.spawnBurst(ev.clientX, ev.clientY, 8, 'circle', '#FFF3B0');
      });
      duck?.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.engine.playSound('duck.mp3', { volume: 0.9 });
        const ev = e as PointerEvent;
        this.spawnBurst(ev.clientX, ev.clientY, 8, 'circle', '#48CAE4');
      });
    } else if (songId === 'rock_a_bye') {
      const cradle = this.stageInteractiveEl.querySelector('#hanging-cradle');
      cradle?.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.engine.playMusicBoxNote('C5', { volume: 0.85 });
        const ev = e as PointerEvent;
        this.spawnBurst(ev.clientX, ev.clientY, 12, 'sparkle', '#C084FC');
      });
    }
  }

  /**
   * Time-coded beat synchronization: triggers SVG pulse animations on musical beat drops.
   */
  private handleBeatSync(data: { isDrop: boolean }): void {
    const target = this.stageInteractiveEl.querySelector('#theater-beat-target') as HTMLElement;
    if (target) {
      target.classList.remove('beat-pulse');
      void target.offsetWidth;
      target.classList.add('beat-pulse');
    }

    // On beat drops, emit gentle ambient floaters
    if (data.isDrop) {
      const activeSong = this.player.getActiveSong();
      if (activeSong) {
        const x = window.innerWidth * (0.2 + Math.random() * 0.6);
        const y = window.innerHeight * (0.3 + Math.random() * 0.4);
        const shape = activeSong.id === 'mommy' ? 'heart' : activeSong.id === 'twinkle' ? 'star' : 'sparkle';
        this.spawnBurst(x, y, 4, shape, activeSong.accentColor);
      }
    }
  }

  /**
   * Interactive touch anywhere on the theater stage.
   */
  private handleTheaterTouch(x: number, y: number): void {
    const activeSong = this.player.getActiveSong();
    if (!activeSong) return;

    let shape: 'heart' | 'star' | 'circle' | 'sparkle' = 'sparkle';
    if (activeSong.id === 'mommy') shape = 'heart';
    else if (activeSong.id === 'twinkle') shape = 'star';
    else if (activeSong.id === 'monkeys') shape = 'circle';

    this.spawnBurst(x, y, 10, shape, activeSong.accentColor);

    // Audio touch feedback
    if (activeSong.id === 'twinkle' || activeSong.id === 'rock_a_bye') {
      this.engine.playMusicBoxNote('E5', { volume: 0.6 });
    } else {
      this.engine.playGlockNote('G5', { volume: 0.55 });
    }
  }

  /**
   * Song End Celebration.
   */
  private handleSongComplete(_song: SongMetadata): void {
    const celebration = this.element.querySelector('#theater-celebration-overlay') as HTMLElement;
    if (celebration) {
      celebration.style.display = 'flex';
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
      this.engine.playSound('fanfare.mp3', { volume: 0.8 });

      setTimeout(() => {
        celebration.style.display = 'none';
      }, 3500);
    }
  }

  /**
   * 30-Particle Object Pool System.
   */
  private spawnBurst(x: number, y: number, count: number, shape: 'heart' | 'star' | 'circle' | 'sparkle', color: string): void {
    let spawned = 0;
    for (const p of this.particlePool) {
      if (!p.active) {
        const angle = (Math.PI * 2 * spawned) / count + (Math.random() - 0.5);
        const speed = 2.5 + Math.random() * 3.5;

        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.size = 14 + Math.random() * 12;
        p.color = color;
        p.alpha = 1;
        p.life = 0;
        p.maxLife = 35 + Math.floor(Math.random() * 20);
        p.shape = shape;
        p.active = true;

        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  private startParticleLoop(): void {
    cancelAnimationFrame(this.particleAnimId);

    const updateParticles = () => {
      if (!this.isTheaterActive) return;

      const ctx = this.particleCtx;
      ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

      for (const p of this.particlePool) {
        if (p.active) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // Gentle gravity
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          if (p.life >= p.maxLife) {
            p.active = false;
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          if (p.shape === 'heart') {
            ctx.font = `${p.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💖', p.x, p.y);
          } else if (p.shape === 'star') {
            ctx.font = `${p.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', p.x, p.y);
          } else if (p.shape === 'sparkle') {
            ctx.font = `${p.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨', p.x, p.y);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      this.particleAnimId = requestAnimationFrame(updateParticles);
    };

    this.particleAnimId = requestAnimationFrame(updateParticles);
  }

  public get isOpen(): boolean {
    return this.isJukeboxOpen;
  }
}
