/**
 * BathTimeScene.ts
 * Scene A: "Bath Time Splash & Clean" (Sensory Water & Bubbles).
 * 
 * Features:
 * - High-contrast pastel bathroom with porcelain clawfoot tub & undulating water.
 * - Draggable yellow sponge for scratch-off dirt cleaning on a muddy cartoon puppy.
 * - Bubble popping with pentatonic crystal bell tones (C5, D5, E5, G5, A5).
 * - Buoyant rubber duck with authentic rubber squeak & dive rebound.
 * - Brass faucet with continuous running water trickle & ripple generator.
 * - Acoustic ragtime swing ukulele groove at 110 BPM with washboard & shaker.
 * - Strict mobile safe-area insets & >= 56px touch targets for iPhone 12 Pro.
 */

import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import type { StorybookScene } from './SceneManager';

interface MudSpot {
  id: string;
  xPct: number;
  yPct: number;
  size: number;
  cleanProgress: number; // 0 = muddy, 1 = clean
  el?: HTMLElement;
}

interface FloatingBubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  seed: number;
  note: string;
  el: HTMLElement;
}

export class BathTimeScene implements StorybookScene {
  public readonly id = 'bath_time';
  public readonly title = 'Bath Time Splash & Clean';
  public readonly subtitle = 'Sensory Water & Bubbles';
  public readonly icon = '🛁';
  public readonly themeColor = '#48CAE4';

  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;

  public element!: HTMLElement;

  // Scene elements
  private waterCanvas!: HTMLCanvasElement;
  private waterCtx!: CanvasRenderingContext2D;
  private puppyEl!: HTMLElement;
  private puppyTailEl!: HTMLElement;
  private spongeEl!: HTMLElement;
  private duckEl!: HTMLElement;
  private faucetEl!: HTMLElement;
  private waterStreamEl!: HTMLElement;
  private bubblesContainer!: HTMLElement;
  private cleanCelebrationEl!: HTMLElement;

  // State
  private isActive: boolean = false;
  private activeTimeouts: Set<number> = new Set();
  private vocalAudio: HTMLAudioElement | null = null;
  private isVocalPlaying: boolean = false;
  private isWaterRunning: boolean = false;
  private isPuppyClean: boolean = false;
  private animFrameId: number = 0;
  private waterWaveOffset: number = 0;
  private isUkulelePlaying: boolean = true;

  // Sponge dragging
  private isDraggingSponge: boolean = false;
  private lastSpongeSoundTime: number = 0;

  // Mud spots on puppy
  private mudSpots: MudSpot[] = [
    { id: 'm1', xPct: 32, yPct: 40, size: 28, cleanProgress: 0 },
    { id: 'm2', xPct: 62, yPct: 42, size: 32, cleanProgress: 0 },
    { id: 'm3', xPct: 48, yPct: 30, size: 24, cleanProgress: 0 },
    { id: 'm4', xPct: 42, yPct: 58, size: 36, cleanProgress: 0 },
    { id: 'm5', xPct: 60, yPct: 62, size: 30, cleanProgress: 0 }
  ];

  // Floating soap bubbles
  private floatingBubbles: FloatingBubble[] = [];
  private nextBubbleId: number = 1;
  private readonly pentatonicScale = ['C5', 'D5', 'E5', 'G5', 'A5'];

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
    this.element.className = 'storybook-scene scene-bath-time';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- Pastel Tiled Bathroom Background -->
      <div class="bathroom-tile-bg">
        <div class="bathroom-tile-grid"></div>
        <div class="bathroom-mirror">
          <div class="mirror-sheen"></div>
        </div>
        <div class="bathroom-soap-shelf">
          <div class="soap-bar soap-mint"></div>
          <div class="shampoo-bottle"></div>
        </div>
      </div>

      <!-- Bath Tub Area -->
      <div class="bathtub-container" id="bathtub-container">
        <!-- Brass Faucet -->
        <div class="brass-faucet-wrap" id="brass-faucet" role="button" aria-label="Brass Water Faucet">
          <div class="faucet-handle" id="faucet-handle"></div>
          <div class="faucet-spout"></div>
          <div class="faucet-stream" id="faucet-stream"></div>
          <div class="faucet-tap-hint">TAP TAP 🚰</div>
        </div>

        <!-- Clawfoot Bathtub SVG Back & Body -->
        <div class="clawfoot-tub-body">
          <div class="tub-back-rim"></div>

          <!-- Cartoon Muddy Puppy -->
          <div class="cartoon-puppy" id="cartoon-puppy">
            <div class="puppy-ears">
              <div class="puppy-ear left"></div>
              <div class="puppy-ear right"></div>
            </div>
            <div class="puppy-tail" id="puppy-tail"></div>
            <div class="puppy-head">
              <div class="puppy-face">
                <div class="puppy-eye left"><div class="pupil"></div></div>
                <div class="puppy-eye right"><div class="pupil"></div></div>
                <div class="puppy-snout">
                  <div class="puppy-nose"></div>
                  <div class="puppy-mouth"></div>
                  <div class="puppy-tongue"></div>
                </div>
              </div>
              <div class="puppy-cheeks">
                <span class="puppy-blush left"></span>
                <span class="puppy-blush right"></span>
              </div>
            </div>
            <div class="puppy-body">
              <div class="puppy-paws">
                <div class="puppy-paw left"></div>
                <div class="puppy-paw right"></div>
              </div>
            </div>

            <!-- Scratch-Off Mud Patches Layer -->
            <div class="puppy-mud-layer" id="puppy-mud-layer"></div>

            <!-- Clean Celebration Hearts & Sparkles -->
            <div class="puppy-clean-celebration" id="puppy-clean-celebration">
              <div class="celebration-badge">SO CLEAN! 🧼✨</div>
              <div class="heart-pop">💖</div>
            </div>
          </div>

          <!-- Dynamic Undulating Water Canvas Layer -->
          <canvas class="bath-water-canvas" id="bath-water-canvas"></canvas>

          <!-- Floating Yellow Rubber Duck -->
          <div class="rubber-duck-wrap" id="rubber-duck" role="button" aria-label="Rubber Duck">
            <div class="rubber-duck">
              <div class="duck-head">
                <div class="duck-eye"></div>
                <div class="duck-beak"></div>
              </div>
              <div class="duck-body">
                <div class="duck-wing"></div>
                <div class="duck-tail"></div>
              </div>
            </div>
            <div class="duck-water-ring"></div>
          </div>

          <!-- Bathtub Porcelain Front Rim -->
          <div class="tub-front-rim">
            <div class="tub-sheen"></div>
            <div class="tub-suds-rim"></div>
          </div>
          <!-- Golden Claw Feet -->
          <div class="tub-claw-foot foot-l"></div>
          <div class="tub-claw-foot foot-r"></div>
        </div>
      </div>

      <!-- Floating Soap Bubbles Layer -->
      <div class="floating-bubbles-layer" id="floating-bubbles-layer"></div>

      <!-- Draggable Yellow Scrubbing Sponge -->
      <div class="draggable-sponge" id="draggable-sponge" role="button" aria-label="Draggable Bath Sponge">
        <div class="sponge-texture"></div>
        <div class="sponge-bubbles-puff"></div>
        <div class="sponge-hint">RUB PUPPY! 🧽</div>
      </div>

      <!-- Toddler Bottom Quick Tappers (>= 56px Touch Targets, Safe-Area Padded) -->
      <div class="bathtime-toddler-bar">
        <button class="bath-quick-btn btn-sing-vocal" id="btn-bath-sing">
          <span class="btn-icon">🎶</span>
          <span class="btn-text">SING</span>
        </button>
        <button class="bath-quick-btn btn-sponge" id="btn-snap-sponge">
          <span class="btn-icon">🧽</span>
          <span class="btn-text">SPONGE</span>
        </button>
        <button class="bath-quick-btn btn-duck" id="btn-tap-duck">
          <span class="btn-icon">🦆</span>
          <span class="btn-text">DUCK</span>
        </button>
        <button class="bath-quick-btn btn-faucet" id="btn-toggle-faucet">
          <span class="btn-icon">🚰</span>
          <span class="btn-text">FAUCET</span>
        </button>
        <button class="bath-quick-btn btn-bubbles" id="btn-spawn-bubbles">
          <span class="btn-icon">🫧</span>
          <span class="btn-text">BUBBLES</span>
        </button>
        <button class="bath-quick-btn btn-remud" id="btn-remud-puppy">
          <span class="btn-icon">🐶</span>
          <span class="btn-text">MUDDY!</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.element);

    // Cache elements
    this.waterCanvas = this.element.querySelector('#bath-water-canvas') as HTMLCanvasElement;
    this.waterCtx = this.waterCanvas.getContext('2d')!;
    this.puppyEl = this.element.querySelector('#cartoon-puppy') as HTMLElement;
    this.puppyTailEl = this.element.querySelector('#puppy-tail') as HTMLElement;
    this.spongeEl = this.element.querySelector('#draggable-sponge') as HTMLElement;
    this.duckEl = this.element.querySelector('#rubber-duck') as HTMLElement;
    this.faucetEl = this.element.querySelector('#brass-faucet') as HTMLElement;
    this.waterStreamEl = this.element.querySelector('#faucet-stream') as HTMLElement;
    this.bubblesContainer = this.element.querySelector('#floating-bubbles-layer') as HTMLElement;
    this.cleanCelebrationEl = this.element.querySelector('#puppy-clean-celebration') as HTMLElement;

    this.renderMudSpots();
  }

  private renderMudSpots(): void {
    const mudLayer = this.element.querySelector('#puppy-mud-layer') as HTMLElement;
    mudLayer.innerHTML = '';
    this.mudSpots.forEach(m => {
      const el = document.createElement('div');
      el.className = 'mud-spot';
      el.id = `mud-spot-${m.id}`;
      el.style.left = `${m.xPct}%`;
      el.style.top = `${m.yPct}%`;
      el.style.width = `${m.size}px`;
      el.style.height = `${m.size * 0.85}px`;
      el.style.opacity = `${1 - m.cleanProgress}`;
      mudLayer.appendChild(el);
      m.el = el;
    });
  }

  private bindEvents(): void {
    // 1. Rubber Duck Dive & Squeak
    this.duckEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.triggerDuckDive(e.clientX, e.clientY);
    });

    // 2. Brass Faucet Running Water Toggle
    this.faucetEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.toggleFaucet();
    });

    // 3. Puppy Direct Tap Reaction
    this.puppyEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.engine.playSound('dog.mp3', { volume: 0.9, pitch: 1.1 });
      this.puppyTailEl.classList.add('wagging-fast');
      this.bursts.spawnBurst(e.clientX, e.clientY, 8, '#FFD166');
      this.safeTimeout(() => this.puppyTailEl.classList.remove('wagging-fast'), 800);
    });

    // 4. Draggable Sponge Handling (zero-lag pointer events)
    this.setupDraggableSponge();

    // 5. Toddler Bottom Quick Action Buttons
    this.element.querySelector('#btn-bath-sing')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.toggleVocalSong();
    });

    this.element.querySelector('#btn-snap-sponge')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.snapSpongeToPuppy();
    });

    this.element.querySelector('#btn-tap-duck')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const rect = this.duckEl.getBoundingClientRect();
      this.triggerDuckDive(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    this.element.querySelector('#btn-toggle-faucet')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.toggleFaucet();
    });

    this.element.querySelector('#btn-spawn-bubbles')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      for (let i = 0; i < 5; i++) {
        const x = window.innerWidth * (0.2 + Math.random() * 0.6);
        const y = window.innerHeight * (0.45 + Math.random() * 0.2);
        this.createFloatingBubble(x, y);
      }
      this.engine.playSound('bubbles.ogg', { volume: 0.7 });
    });

    this.element.querySelector('#btn-remud-puppy')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.remudPuppy();
    });

    // Tap anywhere on water canvas to splash
    this.waterCanvas.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.bursts.spawnWaterSplash(e.clientX, e.clientY, 12);
      this.engine.playSound('splash.mp3', { volume: 0.7, pitch: 0.9 + Math.random() * 0.3 });
    });
  }

  /**
   * Draggable sponge with scratch-off cleaning logic.
   */
  private setupDraggableSponge(): void {
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDraggingSponge) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newX = initialLeft + dx;
      const newY = initialTop + dy;

      this.spongeEl.style.left = `${newX}px`;
      this.spongeEl.style.top = `${newY}px`;

      // Scrub cleaning check
      this.checkSpongeScrub(newX + 35, newY + 25);
    };

    const onPointerUp = () => {
      this.isDraggingSponge = false;
      this.spongeEl.classList.remove('dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    this.spongeEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.isDraggingSponge = true;
      this.spongeEl.classList.add('dragging');

      startX = e.clientX;
      startY = e.clientY;
      const rect = this.spongeEl.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      this.engine.playSqueak();
      this.bursts.spawnSoapBubbles(e.clientX, e.clientY, 4);

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    });
  }

  /**
   * Checks intersection between dragged sponge and puppy mud spots (Scratch-Off effect).
   */
  private checkSpongeScrub(spongeX: number, spongeY: number): void {
    const now = Date.now();
    let cleanedAny = false;

    for (const spot of this.mudSpots) {
      if (!spot.el || spot.cleanProgress >= 1) continue;
      const spotRect = spot.el.getBoundingClientRect();
      const spotCenterX = spotRect.left + spotRect.width / 2;
      const spotCenterY = spotRect.top + spotRect.height / 2;

      const dist = Math.hypot(spongeX - spotCenterX, spongeY - spotCenterY);
      if (dist < 45) {
        // Scrub off dirt gradually
        spot.cleanProgress = Math.min(1, spot.cleanProgress + 0.12);
        spot.el.style.opacity = `${1 - spot.cleanProgress}`;
        cleanedAny = true;

        if (now - this.lastSpongeSoundTime > 180) {
          this.engine.playSqueak();
          this.bursts.spawnSoapBubbles(spotCenterX, spotCenterY, 3);
          this.lastSpongeSoundTime = now;
        }

        if (spot.cleanProgress >= 1) {
          this.bursts.spawnBurst(spotCenterX, spotCenterY, 8, '#ADE8F4');
        }
      }
    }

    if (cleanedAny) {
      this.puppyTailEl.classList.add('wagging-fast');
      this.checkAllClean();
    }
  }

  private checkAllClean(): void {
    if (this.isPuppyClean) return;
    const allClean = this.mudSpots.every(s => s.cleanProgress >= 1);
    if (allClean) {
      this.isPuppyClean = true;
      this.cleanCelebrationEl.classList.add('show');
      this.engine.playSound('dog.mp3', { volume: 1.0 });
      this.engine.playPeekabooFlourish();
      this.engine.playVoice('voice_clean.wav', 'Squeaky clean! All fresh and sparkly!', 0.95);

      const rect = this.puppyEl.getBoundingClientRect();
      this.bursts.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20, '#FFD166');
      this.bursts.spawnSoapBubbles(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
    }
  }

  private remudPuppy(): void {
    this.isPuppyClean = false;
    this.cleanCelebrationEl.classList.remove('show');
    this.mudSpots.forEach(s => {
      s.cleanProgress = 0;
      if (s.el) s.el.style.opacity = '1';
    });

    const rect = this.puppyEl.getBoundingClientRect();
    this.bursts.spawnMudSplatter(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
    this.engine.playSound('splash.mp3', { volume: 0.8, pitch: 0.8 });
  }

  private snapSpongeToPuppy(): void {
    const puppyRect = this.puppyEl.getBoundingClientRect();
    const targetX = puppyRect.left + puppyRect.width * 0.4;
    const targetY = puppyRect.top + puppyRect.height * 0.45;

    this.spongeEl.style.left = `${targetX}px`;
    this.spongeEl.style.top = `${targetY}px`;
    this.engine.playSqueak();
    this.bursts.spawnSoapBubbles(targetX + 30, targetY + 25, 6);
    this.checkSpongeScrub(targetX + 35, targetY + 25);
  }

  /**
   * Buoyant Rubber Duck diving & rebounding.
   */
  private triggerDuckDive(x: number, y: number): void {
    if (!this.isActive) return;
    this.duckEl.classList.add('diving');
    this.engine.playRubberDuck();
    this.engine.playVoice('voice_splash.wav', 'Splish splash! Having fun in the bath!', 0.85);
    this.bursts.spawnWaterSplash(x, y, 14);

    this.safeTimeout(() => {
      this.duckEl.classList.remove('diving');
      this.duckEl.classList.add('rebound');
      this.safeTimeout(() => this.duckEl.classList.remove('rebound'), 500);
    }, 450);
  }

  /**
   * Toggles brass faucet running water stream.
   */
  private toggleFaucet(): void {
    this.isWaterRunning = !this.isWaterRunning;
    const handle = this.element.querySelector('#faucet-handle') as HTMLElement;

    if (this.isWaterRunning) {
      handle.classList.add('turned');
      this.waterStreamEl.classList.add('flowing');
      this.engine.startFaucetRunningWater();

      const rect = this.waterStreamEl.getBoundingClientRect();
      this.bursts.spawnWaterSplash(rect.left + rect.width / 2, rect.bottom, 12);
    } else {
      handle.classList.remove('turned');
      this.waterStreamEl.classList.remove('flowing');
      this.engine.stopFaucetRunningWater();
    }
  }

  /**
   * Creates an interactive floating soap bubble that drifts upward.
   */
  private createFloatingBubble(x?: number, y?: number): void {
    const startX = x !== undefined ? x : window.innerWidth * (0.15 + Math.random() * 0.7);
    const startY = y !== undefined ? y : window.innerHeight * 0.75 + Math.random() * 40;
    const size = 38 + Math.floor(Math.random() * 26);
    const id = this.nextBubbleId++;
    const note = this.pentatonicScale[Math.floor(Math.random() * this.pentatonicScale.length)];

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'soap-bubble';
    bubbleEl.id = `bubble-${id}`;
    bubbleEl.style.width = `${size}px`;
    bubbleEl.style.height = `${size}px`;
    bubbleEl.style.left = `${startX}px`;
    bubbleEl.style.top = `${startY}px`;

    bubbleEl.innerHTML = `
      <div class="bubble-shine"></div>
      <div class="bubble-sheen"></div>
    `;

    // Tap to pop bubble with pentatonic crystal chime
    bubbleEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.popBubble(id, e.clientX, e.clientY, note);
    });

    this.bubblesContainer.appendChild(bubbleEl);

    this.floatingBubbles.push({
      id,
      x: startX,
      y: startY,
      size,
      speed: 0.8 + Math.random() * 1.2,
      wobbleSpeed: 0.03 + Math.random() * 0.04,
      wobbleAmp: 15 + Math.random() * 15,
      seed: Math.random() * 100,
      note,
      el: bubbleEl
    });
  }

  private popBubble(id: number, x: number, y: number, note: string): void {
    const idx = this.floatingBubbles.findIndex(b => b.id === id);
    if (idx === -1) return;
    const bubble = this.floatingBubbles[idx];

    bubble.el.classList.add('popping');
    this.engine.playBubblePop(note);
    this.bursts.spawnBurst(x, y, 8, '#A0E4FF');

    setTimeout(() => {
      if (bubble.el.parentElement) {
        bubble.el.parentElement.removeChild(bubble.el);
      }
    }, 200);

    this.floatingBubbles.splice(idx, 1);
  }

  /**
   * Undulating water surface animation loop on Canvas.
   */
  private startWaterLoop(): void {
    const canvas = this.waterCanvas;
    const ctx = this.waterCtx;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      this.waterWaveOffset += 0.04;

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      if (w > 0 && h > 0) {
        // Draw undulating water layer 1 (Back wave)
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, 24);
        for (let x = 0; x <= w; x += 15) {
          const wave = Math.sin(x * 0.02 + this.waterWaveOffset) * 6;
          ctx.lineTo(x, 24 + wave);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = 'rgba(72, 202, 228, 0.55)';
        ctx.fill();

        // Layer 2 (Front wave with foam highlight)
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, 30);
        for (let x = 0; x <= w; x += 12) {
          const wave = Math.sin(x * 0.025 - this.waterWaveOffset * 1.2) * 8;
          ctx.lineTo(x, 30 + wave);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 20, 0, h);
        grad.addColorStop(0, 'rgba(144, 224, 239, 0.85)');
        grad.addColorStop(1, 'rgba(0, 119, 182, 0.95)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Foam crest line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // If faucet is running, draw ripples under spout
        if (this.isWaterRunning && frameCount % 20 === 0) {
          const spoutX = w * 0.22;
          this.bursts.spawnWaterSplash(spoutX, window.innerHeight * 0.58, 4);
        }
      }

      // Update Floating Bubbles
      for (let i = this.floatingBubbles.length - 1; i >= 0; i--) {
        const b = this.floatingBubbles[i];
        b.y -= b.speed;
        const wobbleX = b.x + Math.sin(frameCount * b.wobbleSpeed + b.seed) * b.wobbleAmp;

        b.el.style.left = `${wobbleX}px`;
        b.el.style.top = `${b.y}px`;

        // If drifted past top of screen, respawn at bottom
        if (b.y < -60) {
          b.y = window.innerHeight * 0.75 + Math.random() * 30;
          b.x = window.innerWidth * (0.15 + Math.random() * 0.7);
        }
      }

      // Spawn initial bubbles if under target
      if (this.floatingBubbles.length < 7 && frameCount % 60 === 0) {
        this.createFloatingBubble();
      }

      this.animFrameId = requestAnimationFrame(draw);
    };

    this.animFrameId = requestAnimationFrame(draw);
  }

  public activate(): void {
    this.isActive = true;
    this.element.style.display = 'block';

    // Start 110 BPM acoustic ragtime ukulele swing groove
    if (this.isUkulelePlaying) {
      this.engine.startUkuleleSwingGroove();
    }

    // Start continuous water canvas loop
    this.startWaterLoop();

    // Position sponge conveniently near puppy
    this.safeTimeout(() => {
      this.snapSpongeToPuppy();
    }, 200);
  }

  public deactivate(): void {
    this.isActive = false;
    this.element.style.display = 'none';
    this.clearAllTimeouts();
    this.engine.stopUkuleleSwingGroove();
    this.engine.stopFaucetRunningWater();
    this.isWaterRunning = false;
    this.stopVocalSong();
    cancelAnimationFrame(this.animFrameId);

    // Clean up bubbles
    this.bubblesContainer.innerHTML = '';
    this.floatingBubbles = [];
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
    this.engine.stopUkuleleSwingGroove();
    const btn = this.element.querySelector('#btn-bath-sing') as HTMLElement;
    if (btn) btn.classList.add('active');

    try {
      this.vocalAudio = new Audio(this.engine.resolveAudioPath('audio/songs/mommy.mp3'));
      this.vocalAudio.volume = 0.95;
      this.isVocalPlaying = true;
      this.vocalAudio.play().catch(e => console.warn('Bath vocal song play warning:', e));
      this.vocalAudio.onended = () => {
        this.stopVocalSong();
      };
    } catch (e) {
      console.warn('Could not start vocal song:', e);
    }
  }

  private stopVocalSong(): void {
    this.isVocalPlaying = false;
    const btn = this.element.querySelector('#btn-bath-sing') as HTMLElement;
    if (btn) btn.classList.remove('active');
    if (this.vocalAudio) {
      this.vocalAudio.pause();
      this.vocalAudio.currentTime = 0;
      this.vocalAudio.removeAttribute('src');
      this.vocalAudio.load();
      this.vocalAudio = null;
    }
    if (this.isActive && this.isUkulelePlaying) {
      this.engine.startUkuleleSwingGroove();
    }
  }
}
