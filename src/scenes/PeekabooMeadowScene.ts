/**
 * PeekabooMeadowScene.ts
 * Scene B: "Peek-a-Boo Meadow" (Object Permanence & Surprise).
 * 
 * Features:
 * - Cognitive hide-and-seek tailored for the 11-18 month developmental milestone.
 * - 3 large thumb-sized hiding spots: Hollow Log, Rustling Flowering Bush, Wooden Fence Door.
 * - Friendly peek-a-boo animals: Baby Bear, Bunny, and Kitten with poking ears/tails.
 * - Joyful human vocal "Peek-a-Boo!" or gentle giggle accompanied by xylophone flourish.
 * - Auto-repeatability: animal ducks down after 3 seconds of inactivity and sneaks to a new spot.
 * - Fluttering butterflies scattering pollen dust when touched; smiling sun.
 * - Bouncy acoustic folk groove at 95 BPM (upright bass + guitar fingerpicking + shaker).
 */

import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import type { StorybookScene } from './SceneManager';

type HidingSpotId = 'log' | 'bush' | 'fence';
type AnimalType = 'bear' | 'bunny' | 'kitten';

interface Butterfly {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  wingAngle: number;
  wingSpeed: number;
  el: HTMLElement;
}

export class PeekabooMeadowScene implements StorybookScene {
  public readonly id = 'peekaboo_meadow';
  public readonly title = 'Peek-a-Boo Meadow';
  public readonly subtitle = 'Object Permanence & Surprise';
  public readonly icon = '🌸';
  public readonly themeColor = '#52B788';

  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;

  public element!: HTMLElement;

  // Scene elements
  private logSpotEl!: HTMLElement;
  private bushSpotEl!: HTMLElement;
  private fenceSpotEl!: HTMLElement;
  private sunEl!: HTMLElement;
  private butterfliesContainer!: HTMLElement;

  // State
  private currentHidingSpot: HidingSpotId = 'bush';
  private currentAnimal: AnimalType = 'bunny';
  private isAnimalRevealed: boolean = false;
  private autoDuckTimer: number | null = null;
  private animFrameId: number = 0;
  private isFolkMusicPlaying: boolean = true;

  // Butterflies
  private butterflies: Butterfly[] = [];
  private nextButterflyId: number = 1;

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    this.container = container;
    this.bursts = bursts;
    this.engine = AudioEngine.getInstance();

    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.element = document.createElement('div');
    this.element.className = 'storybook-scene scene-peekaboo-meadow';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- Sunny Blue Sky & Rolling Green Meadow -->
      <div class="meadow-sky-bg">
        <div class="meadow-sun" id="meadow-sun" role="button" aria-label="Smiling Sunny Sky">
          <div class="sun-face">
            <span class="sun-eye l"></span>
            <span class="sun-eye r"></span>
            <span class="sun-smile"></span>
          </div>
          <div class="sun-rays"></div>
        </div>
        <div class="meadow-cloud cloud-1"></div>
        <div class="meadow-cloud cloud-2"></div>
      </div>

      <!-- Rolling Green Hills & Flower Bed -->
      <div class="meadow-hills-bg">
        <div class="hill-back"></div>
        <div class="hill-mid"></div>
        <div class="hill-front">
          <div class="wildflower-patch">
            <span class="flower f1">🌼</span>
            <span class="flower f2">🌸</span>
            <span class="flower f3">🌷</span>
            <span class="flower f4">🌼</span>
            <span class="flower f5">🌺</span>
          </div>
        </div>
      </div>

      <!-- Butterflies Layer -->
      <div class="butterflies-container" id="butterflies-container"></div>

      <!-- 3 Primary Thumb-Target Hiding Spots -->
      <div class="meadow-hiding-area">
        <!-- 1. Hollow Log Spot (Left) -->
        <div class="hiding-spot spot-log" id="spot-log" role="button" aria-label="Hollow Mossy Log">
          <div class="animal-container" id="animal-log">
            <!-- Dynamic animal injected here -->
          </div>
          <div class="log-cover">
            <div class="log-wood-grain"></div>
            <div class="log-moss"></div>
            <div class="log-tap-hint">TAP LOG! 🪵</div>
          </div>
        </div>

        <!-- 2. Rustling Flowering Bush Spot (Center) -->
        <div class="hiding-spot spot-bush" id="spot-bush" role="button" aria-label="Rustling Flowering Bush">
          <div class="animal-container" id="animal-bush">
            <!-- Dynamic animal injected here -->
          </div>
          <div class="bush-cover">
            <div class="bush-leaves"></div>
            <div class="bush-flowers">
              <span class="bf-1">🌸</span>
              <span class="bf-2">🌼</span>
              <span class="bf-3">🌸</span>
            </div>
            <div class="bush-tap-hint">TAP BUSH! 🌿</div>
          </div>
        </div>

        <!-- 3. Wooden Fence Gate Spot (Right) -->
        <div class="hiding-spot spot-fence" id="spot-fence" role="button" aria-label="Wooden Fence Door">
          <div class="animal-container" id="animal-fence">
            <!-- Dynamic animal injected here -->
          </div>
          <div class="fence-cover" id="fence-door">
            <div class="fence-plank p1"></div>
            <div class="fence-plank p2"></div>
            <div class="fence-crossbar"></div>
            <div class="fence-tap-hint">TAP GATE! 🚪</div>
          </div>
        </div>
      </div>

      <!-- Toddler Bottom Quick Tappers (>= 56px, Safe-Area Padded) -->
      <div class="meadow-toddler-bar">
        <button class="meadow-quick-btn btn-log" id="btn-peek-log">
          <span class="btn-icon">🪵</span>
          <span class="btn-text">LOG</span>
        </button>
        <button class="meadow-quick-btn btn-bush" id="btn-peek-bush">
          <span class="btn-icon">🌿</span>
          <span class="btn-text">BUSH</span>
        </button>
        <button class="meadow-quick-btn btn-fence" id="btn-peek-fence">
          <span class="btn-icon">🚪</span>
          <span class="btn-text">GATE</span>
        </button>
        <button class="meadow-quick-btn btn-butterfly" id="btn-spawn-butterfly">
          <span class="btn-icon">🦋</span>
          <span class="btn-text">FLUTTER</span>
        </button>
        <button class="meadow-quick-btn btn-peekaboo" id="btn-trigger-peekaboo">
          <span class="btn-icon">✨</span>
          <span class="btn-text">PEEK-A-BOO!</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.element);

    // Cache elements
    this.logSpotEl = this.element.querySelector('#spot-log') as HTMLElement;
    this.bushSpotEl = this.element.querySelector('#spot-bush') as HTMLElement;
    this.fenceSpotEl = this.element.querySelector('#spot-fence') as HTMLElement;
    this.sunEl = this.element.querySelector('#meadow-sun') as HTMLElement;
    this.butterfliesContainer = this.element.querySelector('#butterflies-container') as HTMLElement;

    // Initialize initial animal hiding in bush
    this.setupHidingAnimal('bush', 'bunny');
    this.initButterflies();
  }

  private bindEvents(): void {
    // 1. Log Spot Tap
    this.logSpotEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.handleSpotTap('log', e.clientX, e.clientY);
    });

    // 2. Bush Spot Tap
    this.bushSpotEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.handleSpotTap('bush', e.clientX, e.clientY);
    });

    // 3. Fence Spot Tap
    this.fenceSpotEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.handleSpotTap('fence', e.clientX, e.clientY);
    });

    // 4. Sun Tap
    this.sunEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.sunEl.classList.add('sun-bounce');
      this.engine.playGlockNote('G5', { volume: 0.9 });
      this.bursts.spawnStarGlow(e.clientX, e.clientY, 10, '#FFD166');
      setTimeout(() => this.sunEl.classList.remove('sun-bounce'), 800);
    });

    // 5. Toddler Bottom Quick Buttons
    this.element.querySelector('#btn-peek-log')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const rect = this.logSpotEl.getBoundingClientRect();
      this.handleSpotTap('log', rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    this.element.querySelector('#btn-peek-bush')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const rect = this.bushSpotEl.getBoundingClientRect();
      this.handleSpotTap('bush', rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    this.element.querySelector('#btn-peek-fence')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const rect = this.fenceSpotEl.getBoundingClientRect();
      this.handleSpotTap('fence', rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    this.element.querySelector('#btn-spawn-butterfly')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.createButterfly();
      this.engine.playHarpNote('E5', { volume: 0.8 });
    });

    this.element.querySelector('#btn-trigger-peekaboo')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.revealAnimal(true);
    });
  }

  /**
   * Sets up animal inside target spot with ears/tail poking out.
   */
  private setupHidingAnimal(spot: HidingSpotId, animal: AnimalType): void {
    // Clear all animal containers
    ['log', 'bush', 'fence'].forEach(s => {
      const container = this.element.querySelector(`#animal-${s}`) as HTMLElement;
      if (container) container.innerHTML = '';
      const spotEl = this.element.querySelector(`#spot-${s}`) as HTMLElement;
      spotEl?.classList.remove('revealed', 'peeking');
    });

    this.currentHidingSpot = spot;
    this.currentAnimal = animal;
    this.isAnimalRevealed = false;

    const targetContainer = this.element.querySelector(`#animal-${spot}`) as HTMLElement;
    const spotEl = this.element.querySelector(`#spot-${spot}`) as HTMLElement;
    if (!targetContainer || !spotEl) return;

    spotEl.classList.add('peeking');

    let animalHtml = '';
    if (animal === 'bunny') {
      animalHtml = `
        <div class="peekaboo-animal animal-bunny" id="active-animal">
          <div class="bunny-ears-peeking">
            <div class="b-ear left"><div class="b-ear-inner"></div></div>
            <div class="b-ear right"><div class="b-ear-inner"></div></div>
          </div>
          <div class="bunny-head">
            <div class="bunny-eyes">
              <span class="b-eye l"></span>
              <span class="b-eye r"></span>
            </div>
            <div class="bunny-paws" id="animal-paws">
              <span class="b-paw l">🐾</span>
              <span class="b-paw r">🐾</span>
            </div>
            <div class="bunny-snout">
              <span class="b-nose"></span>
              <span class="b-whiskers l"></span>
              <span class="b-whiskers r"></span>
            </div>
          </div>
        </div>
      `;
    } else if (animal === 'bear') {
      animalHtml = `
        <div class="peekaboo-animal animal-bear" id="active-animal">
          <div class="bear-ears-peeking">
            <div class="bear-ear left"></div>
            <div class="bear-ear right"></div>
          </div>
          <div class="bear-head">
            <div class="bear-eyes">
              <span class="bear-eye l"></span>
              <span class="bear-eye r"></span>
            </div>
            <div class="bear-paws" id="animal-paws">
              <span class="bear-paw l">🐾</span>
              <span class="bear-paw r">🐾</span>
            </div>
            <div class="bear-snout">
              <span class="bear-nose"></span>
            </div>
          </div>
        </div>
      `;
    } else {
      animalHtml = `
        <div class="peekaboo-animal animal-kitten" id="active-animal">
          <div class="kitten-ears-peeking">
            <div class="k-ear left"></div>
            <div class="k-ear right"></div>
          </div>
          <div class="kitten-head">
            <div class="kitten-eyes">
              <span class="k-eye l"></span>
              <span class="k-eye r"></span>
            </div>
            <div class="kitten-paws" id="animal-paws">
              <span class="k-paw l">🐾</span>
              <span class="k-paw r">🐾</span>
            </div>
            <div class="kitten-snout">
              <span class="k-nose"></span>
              <span class="k-whiskers"></span>
            </div>
          </div>
        </div>
      `;
    }

    targetContainer.innerHTML = animalHtml;
  }

  /**
   * Tap on one of the 3 hiding spots.
   */
  private handleSpotTap(spot: HidingSpotId, x: number, y: number): void {
    if (this.currentHidingSpot === spot) {
      // Tap on the hiding spot where the animal is -> REVEAL!
      this.revealAnimal(false, x, y);
    } else {
      // Tapped empty spot -> rustle empty with spring sound
      const spotEl = this.element.querySelector(`#spot-${spot}`) as HTMLElement;
      spotEl.classList.add('rustle-empty');
      this.engine.playSound('boing.mp3', { volume: 0.7, pitch: 1.3 });
      this.bursts.spawnBurst(x, y, 6, '#52B788');
      setTimeout(() => spotEl.classList.remove('rustle-empty'), 450);

      // Cue animal in its spot to wiggle ears to help the toddler
      const activeEl = this.element.querySelector('#active-animal') as HTMLElement;
      if (activeEl) {
        activeEl.classList.add('wiggle-ears');
        setTimeout(() => activeEl.classList.remove('wiggle-ears'), 600);
      }
    }
  }

  /**
   * The Big Reveal: Animal parts cover, pops up, covers eyes, opens them with "PEEK-A-BOO!"
   */
  private revealAnimal(force: boolean = false, x?: number, y?: number): void {
    if (this.isAnimalRevealed && !force) return;
    this.isAnimalRevealed = true;

    if (this.autoDuckTimer) {
      clearTimeout(this.autoDuckTimer);
      this.autoDuckTimer = null;
    }

    const spotEl = this.element.querySelector(`#spot-${this.currentHidingSpot}`) as HTMLElement;
    const animalEl = this.element.querySelector('#active-animal') as HTMLElement;
    const pawsEl = this.element.querySelector('#animal-paws') as HTMLElement;

    if (!spotEl || !animalEl) return;

    spotEl.classList.add('revealed');
    animalEl.classList.add('pop-up');

    // Animal paws cover eyes for split second, then swing open
    if (pawsEl) {
      pawsEl.classList.add('covering-eyes');
      setTimeout(() => {
        pawsEl.classList.remove('covering-eyes');
        pawsEl.classList.add('open-wide');
      }, 350);
    }

    // Play human vocal "Peek-a-Boo!" / giggle and xylophone flourish
    this.engine.playPeekabooFlourish();
    this.engine.playAnimalSound(this.currentAnimal);

    const rect = spotEl.getBoundingClientRect();
    const burstX = x !== undefined ? x : rect.left + rect.width / 2;
    const burstY = y !== undefined ? y : rect.top + rect.height * 0.3;
    this.bursts.spawnBurst(burstX, burstY, 16, '#FFD166');
    this.bursts.spawnPollenSparkles(burstX, burstY, 12);

    // AUTO-REPEATABILITY: After 3 seconds of inactivity, animal giggles and sneaks to a new spot
    this.autoDuckTimer = window.setTimeout(() => {
      this.duckAndSwitchSpot();
    }, 3200);
  }

  /**
   * Animal giggles, ducks down, and reappears in a new randomized spot.
   */
  private duckAndSwitchSpot(): void {
    const animalEl = this.element.querySelector('#active-animal') as HTMLElement;
    if (animalEl) {
      animalEl.classList.add('duck-down');
    }

    this.engine.playSound('laugh.mp3', { volume: 0.65, pitch: 1.2 });

    setTimeout(() => {
      // Pick different spot
      const allSpots: HidingSpotId[] = ['log', 'bush', 'fence'];
      const otherSpots = allSpots.filter(s => s !== this.currentHidingSpot);
      const nextSpot = otherSpots[Math.floor(Math.random() * otherSpots.length)];

      // Pick next animal
      const allAnimals: AnimalType[] = ['bear', 'bunny', 'kitten'];
      const otherAnimals = allAnimals.filter(a => a !== this.currentAnimal);
      const nextAnimal = otherAnimals[Math.floor(Math.random() * otherAnimals.length)];

      this.setupHidingAnimal(nextSpot, nextAnimal);
    }, 450);
  }

  /**
   * Initializes floating meadow butterflies.
   */
  private initButterflies(): void {
    for (let i = 0; i < 3; i++) {
      this.createButterfly();
    }
  }

  private createButterfly(): void {
    const id = this.nextButterflyId++;
    const colors = ['#FF6B6B', '#4CC9F0', '#FFD166', '#A06CD5', '#FF9F1C'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const el = document.createElement('div');
    el.className = 'meadow-butterfly';
    el.id = `butterfly-${id}`;
    el.innerHTML = `
      <div class="butterfly-wing left" style="background-color: ${color};"></div>
      <div class="butterfly-body"></div>
      <div class="butterfly-wing right" style="background-color: ${color};"></div>
    `;

    const startX = window.innerWidth * (0.1 + Math.random() * 0.8);
    const startY = window.innerHeight * (0.15 + Math.random() * 0.4);

    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;

    // Touch butterfly -> scatters glowing pollen dust
    el.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.bursts.spawnPollenSparkles(e.clientX, e.clientY, 16);
      this.engine.playGlockNote('E5', { volume: 0.8 });
      el.classList.add('flutter-fast');
      setTimeout(() => el.classList.remove('flutter-fast'), 800);
    });

    this.butterfliesContainer.appendChild(el);

    this.butterflies.push({
      id,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.0,
      color,
      wingAngle: 0,
      wingSpeed: 0.15 + Math.random() * 0.1,
      el
    });
  }

  /**
   * Meadow animation loop (butterflies & gentle ambient movement).
   */
  private startMeadowLoop(): void {
    let frame = 0;

    const loop = () => {
      frame++;

      // Update butterflies
      for (const b of this.butterflies) {
        b.x += b.vx + Math.sin(frame * 0.03) * 0.8;
        b.y += b.vy + Math.cos(frame * 0.04) * 0.6;

        // Keep inside screen
        if (b.x < 20) b.vx = Math.abs(b.vx);
        if (b.x > window.innerWidth - 60) b.vx = -Math.abs(b.vx);
        if (b.y < 40) b.vy = Math.abs(b.vy);
        if (b.y > window.innerHeight * 0.65) b.vy = -Math.abs(b.vy);

        b.el.style.left = `${b.x}px`;
        b.el.style.top = `${b.y}px`;
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public activate(): void {
    this.element.style.display = 'block';

    // Start gentle bouncy folk rhythm (95 BPM)
    if (this.isFolkMusicPlaying) {
      this.engine.startMeadowFolkGroove();
    }

    this.startMeadowLoop();
  }

  public deactivate(): void {
    this.element.style.display = 'none';
    this.engine.stopMeadowFolkGroove();
    if (this.autoDuckTimer) {
      clearTimeout(this.autoDuckTimer);
      this.autoDuckTimer = null;
    }
    cancelAnimationFrame(this.animFrameId);
  }
}
