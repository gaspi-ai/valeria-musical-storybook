/**
 * RowYourBoatScene.ts
 * Scene 6: "Row, Row, Row Your Boat" (Liquid Touch & Physics).
 * 
 * Features:
 * - Flowing blue river with weeping willows, floating water lilies, and wooden rowboat with animal friends.
 * - Plucked acoustic harp (harp_*.mp3) & real flowing river stream loop (river.ogg).
 * - Interactive water surface: dragging fingers creates ripple wave physics and water droplets.
 * - Oars & Boat: Swiping oars rocks boat back and forth, playing rhythmic rowing phrases with water splashes.
 * - Jumping Fish: Tapping river leaps colorful fish out in an arc with splash on re-entry.
 * - Water Lilies: Tapping pads dips into water and plays bamboo woodblock clacks (woodblock.mp3).
 */

import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import type { StorybookScene } from './SceneManager';

interface RipplePoint {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export class RowYourBoatScene implements StorybookScene {
  public readonly id = 'row_boat';
  public readonly title = 'Row, Row, Row Your Boat';
  public readonly subtitle = 'Liquid Touch & Physics';
  public readonly icon = '🛶';
  public readonly themeColor = '#0077B6';

  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;

  public element!: HTMLElement;

  // Scene elements
  private boatWrapEl!: HTMLElement;
  private oarLeftEl!: HTMLElement;
  private oarRightEl!: HTMLElement;
  private riverCanvas!: HTMLCanvasElement;
  private riverCtx!: CanvasRenderingContext2D;
  private fishEl!: HTMLElement;

  // State
  private isActive: boolean = false;
  private activeTimeouts: Set<number> = new Set();
  private vocalAudio: HTMLAudioElement | null = null;
  private isVocalPlaying: boolean = false;

  // Water physics state
  private ripples: RipplePoint[] = [];
  private isWaterLoopRunning: boolean = false;
  private waterAnimId: number = 0;

  // Boat rowing state
  private boatRockAngle: number = 0;
  private rowStrokeIndex: number = 0;
  private isFishJumping: boolean = false;

  private readonly harpRowNotes = ['C4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'E4', 'F4', 'G4', 'C5'];

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
    this.element.className = 'storybook-scene scene-row-boat';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- Scenic River Sky & Weeping Willows -->
      <div class="river-sky">
        <div class="river-sun sun-pulse">
          <div class="sun-face">
            <span class="sun-eye l"></span>
            <span class="sun-eye r"></span>
            <span class="sun-smile"></span>
          </div>
        </div>
        <div class="weeping-willow left">
          <div class="willow-trunk"></div>
          <div class="willow-foliage">
            <span class="branch b1">🌿</span>
            <span class="branch b2">🍃</span>
            <span class="branch b3">🌿</span>
          </div>
        </div>
        <div class="weeping-willow right">
          <div class="willow-trunk"></div>
          <div class="willow-foliage">
            <span class="branch b4">🍃</span>
            <span class="branch b5">🌿</span>
          </div>
        </div>
      </div>

      <!-- Water Surface & Canvas Ripples -->
      <div class="river-water-wrap" id="river-water-zone">
        <canvas class="river-ripple-canvas" id="river-ripple-canvas"></canvas>
        <div class="river-surface-flow"></div>

        <!-- Floating Water Lilies -->
        <div class="water-lily lily-1" id="lily-1" role="button" aria-label="Water Lily">
          <div class="lily-pad">
            <span class="pad-notch"></span>
            <span class="lily-bloom">🌸</span>
          </div>
        </div>
        <div class="water-lily lily-2" id="lily-2" role="button" aria-label="Water Lily">
          <div class="lily-pad">
            <span class="pad-notch"></span>
            <span class="lily-bloom">🌺</span>
          </div>
        </div>
        <div class="water-lily lily-3" id="lily-3" role="button" aria-label="Water Lily">
          <div class="lily-pad">
            <span class="pad-notch"></span>
            <span class="lily-bloom">🌼</span>
          </div>
        </div>

        <!-- Jumping Fish -->
        <div class="jumping-fish" id="jumping-fish">
          <span class="fish-emoji">🐟</span>
        </div>

        <!-- Wooden Rowboat with Animal Friends -->
        <div class="rowboat-wrap" id="rowboat-wrap" role="button" aria-label="Rowboat">
          <div class="boat-hull">
            <div class="boat-wood-grain"></div>
            <!-- Animal Passengers -->
            <div class="boat-passengers">
              <span class="passenger p-bear" title="Baby Bear">🐻</span>
              <span class="passenger p-puppy" title="Happy Puppy">🐶</span>
              <span class="passenger p-bunny" title="Cute Bunny">🐰</span>
            </div>
            <!-- Oars -->
            <div class="oar oar-left" id="oar-left">
              <div class="oar-handle"></div>
              <div class="oar-blade"></div>
            </div>
            <div class="oar oar-right" id="oar-right">
              <div class="oar-handle"></div>
              <div class="oar-blade"></div>
            </div>
          </div>
          <div class="boat-wake-trail"></div>
          <div class="boat-tap-hint">SWIPE TO ROW! 🛶</div>
        </div>
      </div>

      <!-- Toddler Bottom Quick Tappers -->
      <div class="river-toddler-bar">
        <button class="river-quick-btn btn-sing-vocal" id="btn-river-sing" data-action="sing">🎶 SING</button>
        <button class="river-quick-btn btn-row" data-action="row">🛶 ROW BOAT</button>
        <button class="river-quick-btn btn-fish" data-action="fish">🐟 JUMPING FISH</button>
        <button class="river-quick-btn btn-splash" data-action="splash">💦 SPLASH</button>
        <button class="river-quick-btn btn-harp" data-action="harp">🎵 HARP SONG</button>
      </div>
    `;

    this.container.appendChild(this.element);

    this.boatWrapEl = this.element.querySelector('#rowboat-wrap') as HTMLElement;
    this.oarLeftEl = this.element.querySelector('#oar-left') as HTMLElement;
    this.oarRightEl = this.element.querySelector('#oar-right') as HTMLElement;
    this.riverCanvas = this.element.querySelector('#river-ripple-canvas') as HTMLCanvasElement;
    this.riverCtx = this.riverCanvas.getContext('2d')!;
    this.fishEl = this.element.querySelector('#jumping-fish') as HTMLElement;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.riverCanvas.width = window.innerWidth * dpr;
    this.riverCanvas.height = window.innerHeight * 0.65 * dpr;
    this.riverCtx.resetTransform();
    this.riverCtx.scale(dpr, dpr);
  }

  private bindEvents(): void {
    // Rowboat & Oars Interaction
    this.boatWrapEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.rowBoat(e.clientX, e.clientY);
    });

    // Water Surface Dragging (generates ripple waves & droplet splashes)
    const waterZone = this.element.querySelector('#river-water-zone') as HTMLElement;
    waterZone.addEventListener('pointerdown', (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#rowboat-wrap') && !target.closest('.water-lily')) {
        this.addWaterRipple(e.clientX, e.clientY);
        this.triggerRiverTap(e.clientX, e.clientY);
      }
    });

    waterZone.addEventListener('pointermove', (e: PointerEvent) => {
      if (e.buttons > 0) {
        this.addWaterRipple(e.clientX, e.clientY, 0.4);
      }
    });

    // Water Lily Pads Interaction (clacks with woodblock and bobbing spring)
    const lilies = this.element.querySelectorAll('.water-lily');
    lilies.forEach(lily => {
      lily.addEventListener('pointerdown', (e: Event) => {
        e.stopPropagation();
        const pEvt = e as PointerEvent;
        this.triggerLily(lily as HTMLElement, pEvt.clientX, pEvt.clientY);
      });
    });

    // Bottom Quick Buttons
    const quickBtns = this.element.querySelectorAll('.river-quick-btn');
    quickBtns.forEach(btn => {
      btn.addEventListener('pointerdown', (e: Event) => {
        e.stopPropagation();
        const pEvt = e as PointerEvent;
        const act = (btn as HTMLElement).getAttribute('data-action');
        if (act === 'sing') this.toggleVocalSong();
        else if (act === 'row') this.rowBoat(pEvt.clientX, pEvt.clientY);
        else if (act === 'fish') this.triggerJumpingFish(pEvt.clientX, pEvt.clientY);
        else if (act === 'splash') this.triggerSplashZone(pEvt.clientX, pEvt.clientY);
        else if (act === 'harp') this.playHarpPhrase();
      });
    });
  }

  public activate(): void {
    this.isActive = true;
    this.element.style.display = 'block';
    // Gentle flowing river background sound
    this.engine.playAmbientSound('river.ogg', 0.4);
    this.startWaterRippleLoop();
    this.playInitialHarpStrum();
  }

  public deactivate(): void {
    this.isActive = false;
    this.element.style.display = 'none';
    this.clearAllTimeouts();
    this.engine.stopAmbientSound();
    this.stopWaterRippleLoop();
    this.stopVocalSong();
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
    const btn = this.element.querySelector('#btn-river-sing') as HTMLElement;
    if (btn) btn.classList.add('active');

    try {
      this.vocalAudio = new Audio(this.engine.resolveAudioPath('audio/songs/row_boat.mp3'));
      this.vocalAudio.volume = 0.95;
      this.isVocalPlaying = true;
      this.vocalAudio.play().catch(e => console.warn('Row boat vocal song play warning:', e));
      this.vocalAudio.onended = () => {
        this.stopVocalSong();
      };
    } catch (e) {
      console.warn('Could not start vocal song:', e);
    }
  }

  private stopVocalSong(): void {
    this.isVocalPlaying = false;
    const btn = this.element.querySelector('#btn-river-sing') as HTMLElement;
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
   * Rows the boat: rocks boat with spring physics, swings oars,
   * plays acoustic splash sound & rhythmic harp note.
   */
  public rowBoat(_cx?: number, _cy?: number): void {
    if (!this.isActive) return;

    this.boatRockAngle = this.rowStrokeIndex % 2 === 0 ? 6 : -6;
    this.boatWrapEl.style.transform = `rotate(${this.boatRockAngle}deg) translateY(-8px)`;

    // Swing oars
    this.oarLeftEl.classList.add('oar-stroke');
    this.oarRightEl.classList.add('oar-stroke');

    // Play real rowing water splash sound
    this.engine.playSound('row_boat.ogg', { volume: 0.85 });
    this.engine.playSound('splash.mp3', { volume: 0.55, pitch: 1.15 });

    // Play next note of "Row, Row, Row Your Boat" on acoustic harp
    const note = this.harpRowNotes[this.rowStrokeIndex % this.harpRowNotes.length];
    this.engine.playInstrumentNote('harp', note, { volume: 0.75 });
    this.rowStrokeIndex++;

    if (this.rowStrokeIndex % 4 === 0) {
      this.engine.playVoice('voice_row_boat.wav', 'Row row row your boat, merrily merrily merrily!', 0.85);
    }

    // Water splash particles from oars
    const boatRect = this.boatWrapEl.getBoundingClientRect();
    this.bursts.spawnWaterSplash(boatRect.left + 20, boatRect.top + 35, 12);
    this.bursts.spawnWaterSplash(boatRect.right - 20, boatRect.top + 35, 12);

    this.addWaterRipple(boatRect.left + 30, boatRect.top + 40, 0.9);
    this.addWaterRipple(boatRect.right - 30, boatRect.top + 40, 0.9);

    this.safeTimeout(() => {
      this.boatWrapEl.style.transform = `rotate(0deg) translateY(0px)`;
      this.oarLeftEl.classList.remove('oar-stroke');
      this.oarRightEl.classList.remove('oar-stroke');
    }, 450);
  }

  /**
   * Water Lily: dips into water with a bobbing spring and plays bamboo woodblock clacks.
   */
  public triggerLily(lilyEl: HTMLElement, cx: number, cy: number): void {
    if (!this.isActive) return;

    this.engine.playSound('woodblock.mp3', { volume: 0.8, pitch: 1.25 });
    this.engine.playSound('bubbles.ogg', { volume: 0.6 });

    lilyEl.classList.remove('lily-dip');
    void lilyEl.offsetWidth;
    lilyEl.classList.add('lily-dip');

    this.bursts.spawnWaterSplash(cx, cy, 10);
    this.addWaterRipple(cx, cy, 0.8);

    this.safeTimeout(() => lilyEl.classList.remove('lily-dip'), 600);
  }

  /**
   * Jumping Fish: leaps out of the river in an arc with a water splash upon re-entry!
   */
  public triggerJumpingFish(cx?: number, _cy?: number): void {
    if (!this.isActive || this.isFishJumping) return;
    this.isFishJumping = true;

    const startX = cx ? Math.max(80, Math.min(window.innerWidth - 80, cx)) : window.innerWidth * 0.35;
    this.fishEl.style.left = `${startX}px`;
    this.fishEl.classList.add('fish-leaping');

    // Splashing jump sound
    this.engine.playSound('splash.mp3', { volume: 0.75, pitch: 1.3 });
    this.engine.playInstrumentNote('harp', 'G4', { volume: 0.65 });
    this.bursts.spawnWaterSplash(startX, window.innerHeight * 0.65, 14);

    this.safeTimeout(() => {
      // Re-entry splash
      this.engine.playSound('splash.mp3', { volume: 0.8, pitch: 1.1 });
      this.bursts.spawnWaterSplash(startX + 60, window.innerHeight * 0.65, 16);
      this.addWaterRipple(startX + 60, window.innerHeight * 0.65, 1.0);
      this.fishEl.classList.remove('fish-leaping');
      this.isFishJumping = false;
    }, 900);
  }

  private triggerRiverTap(cx: number, cy: number): void {
    if (!this.isActive) return;
    this.engine.playSound('bubbles.ogg', { volume: 0.55 });
    this.bursts.spawnWaterSplash(cx, cy, 8);
    if (Math.random() < 0.4) {
      this.triggerJumpingFish(cx, cy);
    }
  }

  private triggerSplashZone(cx: number, cy: number): void {
    if (!this.isActive) return;
    this.engine.playSound('splash.mp3', { volume: 0.9, pitch: 1.0 });
    this.bursts.spawnWaterSplash(cx || window.innerWidth * 0.5, cy || window.innerHeight * 0.6, 20);
    this.addWaterRipple(cx || window.innerWidth * 0.5, cy || window.innerHeight * 0.6, 1.2);
  }

  private addWaterRipple(x: number, y: number, intensity: number = 0.7): void {
    const canvasRect = this.riverCanvas.getBoundingClientRect();
    const relY = y - canvasRect.top;
    if (relY >= 0 && relY <= canvasRect.height) {
      this.ripples.push({
        x,
        y: relY,
        radius: 8,
        maxRadius: 65 * intensity,
        alpha: 0.85 * intensity,
        speed: 1.8
      });
    }
  }

  private startWaterRippleLoop(): void {
    if (this.isWaterLoopRunning) return;
    this.isWaterLoopRunning = true;

    const loop = () => {
      this.renderWaterRipples();
      if (this.isWaterLoopRunning && this.isActive) {
        this.waterAnimId = requestAnimationFrame(loop);
      }
    };
    this.waterAnimId = requestAnimationFrame(loop);
  }

  private stopWaterRippleLoop(): void {
    this.isWaterLoopRunning = false;
    cancelAnimationFrame(this.waterAnimId);
  }

  private renderWaterRipples(): void {
    this.riverCtx.clearRect(0, 0, this.riverCanvas.width, this.riverCanvas.height);

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += rip.speed;
      rip.alpha -= 0.018;

      if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.riverCtx.beginPath();
      this.riverCtx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.38, 0, 0, Math.PI * 2);
      this.riverCtx.strokeStyle = `rgba(202, 240, 248, ${rip.alpha})`;
      this.riverCtx.lineWidth = 3;
      this.riverCtx.stroke();
    }
  }

  private playInitialHarpStrum(): void {
    const arpeggio = ['C4', 'E4', 'G4', 'C5'];
    arpeggio.forEach((n, idx) => {
      this.safeTimeout(() => {
        if (this.isActive) {
          this.engine.playInstrumentNote('harp', n, { volume: 0.5 });
        }
      }, idx * 100);
    });
  }

  private playHarpPhrase(): void {
    const phrase = ['C4', 'D4', 'E4', 'G4', 'E4', 'C4'];
    phrase.forEach((n, idx) => {
      this.safeTimeout(() => {
        if (this.isActive) {
          this.engine.playInstrumentNote('harp', n, { volume: 0.65 });
        }
      }, idx * 180);
    });
  }
}
