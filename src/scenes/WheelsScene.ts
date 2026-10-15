/**
 * WheelsScene.ts
 * Interactive "Wheels on the Bus" Scene (Mechanical Cause & Effect).
 * 
 * Features:
 * - High-contrast whimsical yellow school bus SVG with Duck Duck Moose storybook styling.
 * - Interactive spinning wheels with momentum physics, parallax scenery driver, and engine pitch modulation.
 * - Accordion folding bus doors revealing friendly animal passengers (Puppy, Kitty, Monkey, Elephant, Bird).
 * - Windshield wipers with swipeable swish-swash rubber squeak physics.
 * - Brassy bulb/car horn with whole-bus squash & stretch bounce.
 * - Interactive sun with chime, smiling rain clouds with water splashes, and fluttering scenery.
 * - Real acoustic sound effects & beat-synchronized bouncing.
 */

import { AudioEngine } from '../audio/AudioEngine';
import { AcousticEnsemble } from '../audio/AcousticEnsemble';
import { TouchBurstManager } from '../components/TouchBurstManager';
import type { StorybookScene } from './SceneManager';

export class WheelsScene implements StorybookScene {
  public readonly id = 'wheels';
  public readonly title = 'Wheels on the Bus';
  public readonly subtitle = 'Interactive School Bus';
  public readonly icon = '🚌';
  public readonly themeColor = '#FFD166';

  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;
  private ensemble: AcousticEnsemble;

  public element!: HTMLElement;

  // Wheel physics state
  private wheelAngle: number = 0;
  private wheelVelocity: number = 0;
  private isDraggingWheel: boolean = false;
  private lastDragX: number = 0;
  private lastDragTime: number = 0;
  private wheelAnimId: number = 0;
  private parallaxOffset: number = 0;

  // Door state
  private isDoorOpen: boolean = false;

  // Wiper state
  private isWiperActive: boolean = false;

  // Beat subscription
  private unsubscribeBeat: (() => void) | null = null;

  // Elements cache
  private busBodyEl!: HTMLElement;
  private frontWheelEl!: SVGElement;
  private backWheelEl!: SVGElement;
  private sunEl!: HTMLElement;
  private cloudEls: HTMLElement[] = [];
  private parallaxRoadEl!: HTMLElement;
  private parallaxHillsEl!: HTMLElement;
  private passengerEls: HTMLElement[] = [];
  private driverEl!: HTMLElement;

  constructor(container: HTMLElement, bursts: TouchBurstManager, ensemble: AcousticEnsemble) {
    this.container = container;
    this.bursts = bursts;
    this.engine = AudioEngine.getInstance();
    this.ensemble = ensemble;

    this.render();
    this.bindEvents();
    this.startWheelPhysics();
  }

  public activate(): void {
    this.element.style.display = 'block';
    this.engine.startEngineRumble();
    if (!this.wheelAnimId) {
      this.startWheelPhysics();
    }

    // Subscribe to downbeat visual bounce
    this.unsubscribeBeat = this.engine.onBeat((beatNum) => {
      if (beatNum % 2 === 0) {
        this.bounceBusSlightly();
      }
    });
  }

  public deactivate(): void {
    this.element.style.display = 'none';
    this.engine.stopEngineRumble();
    if (this.wheelAnimId) {
      cancelAnimationFrame(this.wheelAnimId);
      this.wheelAnimId = 0;
    }
    if (this.unsubscribeBeat) {
      this.unsubscribeBeat();
      this.unsubscribeBeat = null;
    }
  }

  private render(): void {
    this.element = document.createElement('div');
    this.element.className = 'scene wheels-scene';

    this.element.innerHTML = `
      <!-- Parallax Countryside Scenery -->
      <div class="sky-background">
        <!-- Interactive Smiling Sun -->
        <div class="scenery-sun" id="wheels-sun">
          <svg viewBox="0 0 120 120" class="sun-svg">
            <g class="sun-rays">
              <polygon points="60,6 55,22 65,22" fill="#FFA500" />
              <polygon points="60,114 55,98 65,98" fill="#FFA500" />
              <polygon points="6,60 22,55 22,65" fill="#FFA500" />
              <polygon points="114,60 98,55 98,65" fill="#FFA500" />
              <polygon points="22,22 36,29 29,36" fill="#FFA500" />
              <polygon points="98,98 84,91 91,84" fill="#FFA500" />
              <polygon points="98,22 91,36 84,29" fill="#FFA500" />
              <polygon points="22,98 29,84 36,91" fill="#FFA500" />
            </g>
            <circle cx="60" cy="60" r="38" fill="#FFD166" stroke="#F4A261" stroke-width="4" />
            <circle cx="42" cy="67" r="6" fill="#FF8A8A" opacity="0.6" />
            <circle cx="78" cy="67" r="6" fill="#FF8A8A" opacity="0.6" />
            <ellipse cx="48" cy="55" rx="4" ry="6" fill="#264653" />
            <circle cx="46" cy="53" r="2" fill="#FFF" />
            <ellipse cx="72" cy="55" rx="4" ry="6" fill="#264653" />
            <circle cx="70" cy="53" r="2" fill="#FFF" />
            <path d="M 48 68 Q 60 82 72 68" fill="none" stroke="#264653" stroke-width="3.5" stroke-linecap="round" />
          </svg>
        </div>

        <!-- Interactive Cloud 1 -->
        <div class="scenery-cloud cloud-1" data-cloud="1">
          <svg viewBox="0 0 120 70" class="cloud-svg">
            <path d="M 20 50 A 20 20 0 0 1 40 25 A 25 25 0 0 1 80 20 A 22 22 0 0 1 105 45 A 18 18 0 0 1 95 60 L 25 60 A 15 15 0 0 1 20 50 Z" fill="#FFFFFF" opacity="0.95" />
            <ellipse cx="50" cy="42" rx="2.5" ry="3.5" fill="#457B9D" />
            <ellipse cx="70" cy="42" rx="2.5" ry="3.5" fill="#457B9D" />
            <path d="M 54 48 Q 60 55 66 48" fill="none" stroke="#457B9D" stroke-width="2" stroke-linecap="round" />
          </svg>
          <div class="rain-container"></div>
        </div>

        <!-- Interactive Cloud 2 -->
        <div class="scenery-cloud cloud-2" data-cloud="2">
          <svg viewBox="0 0 100 60" class="cloud-svg">
            <path d="M 15 45 A 16 16 0 0 1 32 24 A 20 20 0 0 1 68 20 A 18 18 0 0 1 88 42 L 80 52 L 20 52 Z" fill="#FFFFFF" opacity="0.9" />
            <ellipse cx="44" cy="36" rx="2" ry="3" fill="#457B9D" />
            <ellipse cx="60" cy="36" rx="2" ry="3" fill="#457B9D" />
            <path d="M 48 42 Q 52 47 56 42" fill="none" stroke="#457B9D" stroke-width="2" stroke-linecap="round" />
          </svg>
          <div class="rain-container"></div>
        </div>

        <!-- Rolling Parallax Countryside Hills -->
        <div class="scenery-hills" id="wheels-hills">
          <svg viewBox="0 0 1200 240" preserveAspectRatio="none" class="hills-svg">
            <path d="M 0 160 Q 300 80 600 150 T 1200 130 L 1200 240 L 0 240 Z" fill="#90BE6D" />
            <path d="M 0 190 Q 400 130 800 180 T 1600 170 L 1600 240 L 0 240 Z" fill="#43AA8B" opacity="0.85" />
          </svg>
        </div>

        <!-- Road Surface with Animated Dashes -->
        <div class="scenery-road" id="wheels-road">
          <div class="road-pavement"></div>
          <div class="road-stripes"></div>
        </div>
      </div>

      <!-- Whimsical Yellow School Bus Wrapper -->
      <div class="bus-container" id="wheels-bus-root">
        <div class="bus-body" id="wheels-bus-body">
          <svg viewBox="0 0 680 340" class="bus-svg">
            <!-- Bus Main Chassis Shell -->
            <defs>
              <linearGradient id="busGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFDE59" />
                <stop offset="65%" stop-color="#FFBD00" />
                <stop offset="100%" stop-color="#FFA000" />
              </linearGradient>
              <linearGradient id="busRoofGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="100%" stop-color="#FFF3C4" />
              </linearGradient>
              <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#E0F7FA" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#80DEEA" stop-opacity="0.85" />
              </linearGradient>
            </defs>

            <!-- Shadow Under Bus -->
            <ellipse cx="340" cy="305" rx="300" ry="22" fill="rgba(38, 70, 83, 0.28)" />

            <!-- Bus Main Body Shape -->
            <!-- Back curve, roof, front windshield slant, hood, front bumper -->
            <path d="M 60 250 
                     L 60 90 
                     Q 60 40 100 40 
                     L 520 40 
                     Q 550 40 575 80 
                     L 600 140 
                     L 630 140 
                     Q 645 140 645 160 
                     L 645 250 
                     Q 645 260 635 260 
                     L 560 260 
                     A 55 55 0 0 0 450 260 
                     L 240 260 
                     A 55 55 0 0 0 130 260 
                     L 60 260 Z"
                  fill="url(#busGrad)" 
                  stroke="#E2711D" 
                  stroke-width="7" 
                  stroke-linejoin="round" />

            <!-- White Roof Cap -->
            <path d="M 60 90 Q 60 40 100 40 L 520 40 Q 550 40 575 80 L 60 80 Z" 
                  fill="url(#busRoofGrad)" stroke="#E2711D" stroke-width="5" />

            <!-- Classic School Bus Black Side Stripes -->
            <path d="M 60 170 L 600 170" stroke="#264653" stroke-width="9" stroke-linecap="round" />
            <path d="M 60 195 L 600 195" stroke="#264653" stroke-width="5" stroke-linecap="round" />

            <!-- "SCHOOL BUS" Whimsical Sign on Roof -->
            <rect x="230" y="46" width="180" height="26" rx="6" fill="#FFBD00" stroke="#264653" stroke-width="3" />
            <text x="320" y="65" font-family="'Outfit', 'Impact', sans-serif" font-weight="900" font-size="15" fill="#264653" text-anchor="middle" letter-spacing="3">SCHOOL BUS</text>

            <!-- Front Hood & Grille / Interactive Horn Button -->
            <g id="bus-grille-group" class="interactive-horn-target" style="cursor: pointer;">
              <rect x="615" y="165" width="28" height="65" rx="6" fill="#4A5568" stroke="#1A202C" stroke-width="4" />
              <line x1="620" y1="178" x2="638" y2="178" stroke="#FFD166" stroke-width="3" stroke-linecap="round" />
              <line x1="620" y1="192" x2="638" y2="192" stroke="#FFD166" stroke-width="3" stroke-linecap="round" />
              <line x1="620" y1="206" x2="638" y2="206" stroke="#FFD166" stroke-width="3" stroke-linecap="round" />
              <line x1="620" y1="220" x2="638" y2="220" stroke="#FFD166" stroke-width="3" stroke-linecap="round" />

              <!-- Shiny Big Headlight -->
              <circle cx="628" cy="150" r="16" fill="#FFF9A6" stroke="#F4A261" stroke-width="4" />
              <circle cx="626" cy="148" r="7" fill="#FFFFFF" />
            </g>

            <!-- Front Bumper -->
            <rect x="625" y="240" width="30" height="22" rx="6" fill="#264653" stroke="#1D3557" stroke-width="4" />
            <rect x="45" y="240" width="25" height="22" rx="6" fill="#264653" stroke="#1D3557" stroke-width="4" />

            <!-- Big Front Windshield Glass -->
            <polygon points="505,86 565,86 590,140 505,140" fill="url(#glassGrad)" stroke="#264653" stroke-width="5" />

            <!-- Passenger Windows (Openings where animated animal passengers sit) -->
            <!-- Window 1 (Back) -->
            <rect x="95" y="86" width="80" height="65" rx="8" fill="url(#glassGrad)" stroke="#264653" stroke-width="5" />
            <!-- Window 2 (Middle) -->
            <rect x="195" y="86" width="80" height="65" rx="8" fill="url(#glassGrad)" stroke="#264653" stroke-width="5" />
            <!-- Window 3 (Near Door) -->
            <rect x="295" y="86" width="80" height="65" rx="8" fill="url(#glassGrad)" stroke="#264653" stroke-width="5" />
            <!-- Window 4 (Door Window Area) -->
            <rect x="395" y="86" width="85" height="65" rx="8" fill="url(#glassGrad)" stroke="#264653" stroke-width="5" />

            <!-- Interactive Windshield Wiper -->
            <g id="bus-wiper-assembly" class="wiper-assembly">
              <circle cx="510" cy="138" r="5" fill="#264653" />
              <line id="bus-wiper-arm" x1="510" y1="138" x2="570" y2="92" stroke="#264653" stroke-width="6" stroke-linecap="round" />
              <line id="bus-wiper-blade" x1="555" y1="80" x2="585" y2="105" stroke="#E63946" stroke-width="5" stroke-linecap="round" />
            </g>

            <!-- Door Frame Outline -->
            <rect x="390" y="82" width="95" height="175" rx="6" fill="none" stroke="#264653" stroke-width="6" />

            <!-- Wheel Wells (fenders) -->
            <path d="M 125 260 A 60 60 0 0 1 245 260" fill="none" stroke="#264653" stroke-width="8" />
            <path d="M 445 260 A 60 60 0 0 1 565 260" fill="none" stroke="#264653" stroke-width="8" />
          </svg>

          <!-- Inside Passengers (HTML overlays placed precisely inside the SVG window frames) -->
          <div class="passengers-layer">
            <!-- Passenger 1: Playful Puppy -->
            <div class="passenger-item p-puppy" data-animal="dog" title="Puppy - Tap me!">
              <div class="animal-avatar puppy-avatar">🐶</div>
            </div>

            <!-- Passenger 2: Sweet Kitty -->
            <div class="passenger-item p-kitty" data-animal="meow" title="Kitty - Tap me!">
              <div class="animal-avatar kitty-avatar">🐱</div>
            </div>

            <!-- Passenger 3: Silly Monkey -->
            <div class="passenger-item p-monkey" data-animal="monkey" title="Monkey - Tap me!">
              <div class="animal-avatar monkey-avatar">🐵</div>
            </div>

            <!-- Driver: Friendly Bear / Elephant in Front Window -->
            <div class="driver-item" data-animal="bear" title="Driver - Tap me!">
              <div class="driver-avatar">🐻</div>
              <div class="driver-hat">🧢</div>
            </div>
          </div>

          <!-- Accordion Folding Bus Doors Overlay -->
          <div class="bus-door-container" id="wheels-bus-door" title="Tap to Open/Close Doors!">
            <div class="door-panel door-left">
              <div class="door-window">
                <span class="door-passenger-peek">🐘</span>
              </div>
              <div class="door-handle"></div>
            </div>
            <div class="door-panel door-right">
              <div class="door-window">
                <span class="door-passenger-peek">🐦</span>
              </div>
              <div class="door-handle"></div>
            </div>
          </div>

          <!-- Rotatable Wheels (Front & Back) with Realistic Rubber Treads and Rims -->
          <div class="wheel-mount wheel-back" id="wheel-back-mount">
            <svg viewBox="0 0 120 120" class="wheel-svg" id="wheel-back-svg">
              <!-- Outer Heavy Rubber Tire -->
              <circle cx="60" cy="60" r="54" fill="#2B2D42" stroke="#1A1C29" stroke-width="4" />
              <!-- Tire Tread Marks -->
              <circle cx="60" cy="60" r="48" fill="none" stroke="#3D405B" stroke-width="4" stroke-dasharray="8 6" />
              <!-- Shiny Rim -->
              <circle cx="60" cy="60" r="34" fill="#E0E1DD" stroke="#8D99AE" stroke-width="4" />
              <circle cx="60" cy="60" r="18" fill="#FFBD00" stroke="#E2711D" stroke-width="3" />
              <!-- Rim Lug Nuts / Spokes for Clear Visual Rotation -->
              <circle cx="60" cy="38" r="4" fill="#2B2D42" />
              <circle cx="60" cy="82" r="4" fill="#2B2D42" />
              <circle cx="38" cy="60" r="4" fill="#2B2D42" />
              <circle cx="82" cy="60" r="4" fill="#2B2D42" />
              <circle cx="44" cy="44" r="3.5" fill="#E63946" />
              <circle cx="76" cy="76" r="3.5" fill="#E63946" />
              <circle cx="44" cy="76" r="3.5" fill="#E63946" />
              <circle cx="76" cy="44" r="3.5" fill="#E63946" />
              <!-- Center Hub -->
              <circle cx="60" cy="60" r="8" fill="#2B2D42" />
            </svg>
          </div>

          <div class="wheel-mount wheel-front" id="wheel-front-mount">
            <svg viewBox="0 0 120 120" class="wheel-svg" id="wheel-front-svg">
              <circle cx="60" cy="60" r="54" fill="#2B2D42" stroke="#1A1C29" stroke-width="4" />
              <circle cx="60" cy="60" r="48" fill="none" stroke="#3D405B" stroke-width="4" stroke-dasharray="8 6" />
              <circle cx="60" cy="60" r="34" fill="#E0E1DD" stroke="#8D99AE" stroke-width="4" />
              <circle cx="60" cy="60" r="18" fill="#FFBD00" stroke="#E2711D" stroke-width="3" />
              <circle cx="60" cy="38" r="4" fill="#2B2D42" />
              <circle cx="60" cy="82" r="4" fill="#2B2D42" />
              <circle cx="38" cy="60" r="4" fill="#2B2D42" />
              <circle cx="82" cy="60" r="4" fill="#2B2D42" />
              <circle cx="44" cy="44" r="3.5" fill="#E63946" />
              <circle cx="76" cy="76" r="3.5" fill="#E63946" />
              <circle cx="44" cy="76" r="3.5" fill="#E63946" />
              <circle cx="76" cy="44" r="3.5" fill="#E63946" />
              <circle cx="60" cy="60" r="8" fill="#2B2D42" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Quick Scene Action Toggles for Toddlers (Bottom Corner - Giant Friendly Buttons) -->
      <div class="toddler-quick-bar">
        <!-- Giant Musical Song Toggle Button -->
        <button class="toddler-action-btn song-toggle-btn" id="wheels-song-btn" title="Sing Along!">
          <span class="btn-bubble-icon">🎵</span>
          <span class="btn-label">SING!</span>
        </button>

        <!-- Horn Button -->
        <button class="toddler-action-btn horn-touch-btn" id="wheels-horn-btn" title="Beep Beep!">
          <span class="btn-bubble-icon">📢</span>
          <span class="btn-label">BEEP!</span>
        </button>

        <!-- Wipers Button -->
        <button class="toddler-action-btn wiper-touch-btn" id="wheels-wiper-btn" title="Swish Swash!">
          <span class="btn-bubble-icon">💦</span>
          <span class="btn-label">SWISH!</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.element);

    // Cache elements
    this.busBodyEl = this.element.querySelector('#wheels-bus-body') as HTMLElement;
    this.frontWheelEl = this.element.querySelector('#wheel-front-svg') as SVGElement;
    this.backWheelEl = this.element.querySelector('#wheel-back-svg') as SVGElement;
    this.sunEl = this.element.querySelector('#wheels-sun') as HTMLElement;
    this.cloudEls = Array.from(this.element.querySelectorAll('.scenery-cloud')) as HTMLElement[];
    this.parallaxRoadEl = this.element.querySelector('#wheels-road') as HTMLElement;
    this.parallaxHillsEl = this.element.querySelector('#wheels-hills') as HTMLElement;
    this.passengerEls = Array.from(this.element.querySelectorAll('.passenger-item')) as HTMLElement[];
    this.driverEl = this.element.querySelector('.driver-item') as HTMLElement;
  }

  private bindEvents(): void {
    // 1. Wheel Drag & Spin Physics
    const wheelMounts = this.element.querySelectorAll('.wheel-mount');
    wheelMounts.forEach(wheel => {
      wheel.addEventListener('pointerdown', (e: Event) => {
        const pe = e as PointerEvent;
        pe.preventDefault();
        pe.stopPropagation();
        this.isDraggingWheel = true;
        this.lastDragX = pe.clientX;
        this.lastDragTime = performance.now();
        this.wheelVelocity = 0;

        this.bursts.spawnBurst(pe.clientX, pe.clientY, 8, '#FFBD00');
        this.engine.playSound('boing.mp3', { volume: 0.35, pitch: 1.4 });
      });
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDraggingWheel) return;
      const now = performance.now();
      const dt = Math.max(1, now - this.lastDragTime);
      const dx = e.clientX - this.lastDragX;

      // Adjust velocity based on drag speed
      this.wheelVelocity = (dx / dt) * 16.0;
      this.wheelAngle += dx * 0.8;
      this.applyWheelRotation();

      this.lastDragX = e.clientX;
      this.lastDragTime = now;
    });

    const stopWheelDrag = () => {
      this.isDraggingWheel = false;
    };
    window.addEventListener('pointerup', stopWheelDrag);
    window.addEventListener('pointercancel', stopWheelDrag);

    // 2. Door Open / Close Interaction
    const doorEl = this.element.querySelector('#wheels-bus-door') as HTMLElement;
    doorEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDoor(e.clientX, e.clientY);
    });

    // 3. Wiper Interaction (Swipe or Tap)
    const wiperAssembly = this.element.querySelector('#bus-wiper-assembly') as HTMLElement;
    wiperAssembly.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerWipers(e.clientX, e.clientY);
    });

    // 4. Horn Interactions (Grille tap or giant bottom BEEP button)
    const grilleGroup = this.element.querySelector('#bus-grille-group') as HTMLElement;
    grilleGroup.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerHorn(e.clientX, e.clientY);
    });

    const hornBtn = this.element.querySelector('#wheels-horn-btn') as HTMLElement;
    hornBtn.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerHorn(e.clientX, e.clientY);
    });

    const wiperBtn = this.element.querySelector('#wheels-wiper-btn') as HTMLElement;
    wiperBtn.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerWipers(e.clientX, e.clientY);
    });

    // 5. Sing Along Button
    const songBtn = this.element.querySelector('#wheels-song-btn') as HTMLElement;
    songBtn.addEventListener('pointerdown', async (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.bursts.spawnBurst(e.clientX, e.clientY, 16, '#06D6A0');

      const isPlaying = await this.engine.toggleSongTrack();
      if (isPlaying) {
        songBtn.classList.add('playing');
        this.ensemble.stop();
        this.engine.startScheduler(104);
      } else {
        songBtn.classList.remove('playing');
        this.ensemble.start();
      }
    });

    // 6. Passengers Tap Reactions
    this.passengerEls.forEach(p => {
      p.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const animal = p.getAttribute('data-animal');
        this.bursts.spawnBurst(e.clientX, e.clientY, 10, '#FFD166');
        this.bounceElement(p);

        // Play animal sound
        if (animal === 'dog') {
          this.engine.playSound('dog.mp3', { volume: 0.85 });
        } else if (animal === 'meow') {
          this.engine.playSound('meow.mp3', { volume: 0.85 });
        } else if (animal === 'monkey') {
          this.engine.playSound('monkey.mp3', { volume: 0.85 });
        }
        setTimeout(() => {
          this.engine.playSound('laugh.mp3', { volume: 0.45 });
        }, 300);
      });
    });

    // 7. Driver Tap Reaction
    this.driverEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.bursts.spawnBurst(e.clientX, e.clientY, 12, '#4ECDC4');
      this.bounceElement(this.driverEl);
      this.engine.playSound('cuckoo.mp3', { volume: 0.75 });
      setTimeout(() => {
        this.triggerHorn(e.clientX, e.clientY);
      }, 250);
    });

    // 8. Sun Interaction
    this.sunEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.bursts.spawnBurst(e.clientX, e.clientY, 20, '#FFA500');
      this.sunEl.classList.remove('sun-pulse');
      void this.sunEl.offsetWidth; // force reflow
      this.sunEl.classList.add('sun-pulse');

      this.engine.playSound('chime.mp3', { volume: 0.85 });
      this.engine.playInstrumentNote('glock', 'C6', { volume: 0.75 });
    });

    // 9. Clouds Interaction (Rain burst)
    this.cloudEls.forEach(cloud => {
      cloud.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.bursts.spawnBurst(e.clientX, e.clientY, 14, '#457B9D');
        this.triggerCloudRain(cloud);
      });
    });
  }

  /**
   * Continuous 60 FPS Wheel physics loop.
   * Handles inertia, deceleration, and updates parallax landscape.
   */
  private startWheelPhysics(): void {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000.0);
      lastTime = time;

      if (!this.isDraggingWheel) {
        // Minimum cruising speed if song is playing or free wheeling
        const baseSpeed = this.engine.isTrackPlaying ? 160 : 40;
        if (Math.abs(this.wheelVelocity) < baseSpeed) {
          this.wheelVelocity += (baseSpeed - this.wheelVelocity) * 0.08;
        } else {
          // Friction damping
          this.wheelVelocity *= 0.985;
        }

        this.wheelAngle += this.wheelVelocity * dt;
        this.applyWheelRotation();
      }

      // Parallax update
      const speedRatio = Math.abs(this.wheelVelocity) / 100.0;
      this.parallaxOffset = (this.parallaxOffset + this.wheelVelocity * dt * 0.4) % 1200;
      if (this.parallaxHillsEl) {
        this.parallaxHillsEl.style.transform = `translateX(${-this.parallaxOffset * 0.3}px)`;
      }
      if (this.parallaxRoadEl) {
        const stripeOffset = (-this.parallaxOffset * 1.2) % 40;
        this.parallaxRoadEl.style.backgroundPosition = `${stripeOffset}px 0`;
      }

      // Modulate engine rumble pitch with speed
      this.engine.updateEngineSpeed(speedRatio);

      this.wheelAnimId = requestAnimationFrame(loop);
    };

    this.wheelAnimId = requestAnimationFrame(loop);
  }

  private applyWheelRotation(): void {
    if (this.frontWheelEl && this.backWheelEl) {
      this.frontWheelEl.style.transform = `rotate(${this.wheelAngle}deg)`;
      this.backWheelEl.style.transform = `rotate(${this.wheelAngle}deg)`;
    }
  }

  /**
   * Toggles the accordion bus doors with latch sounds and squash-stretch.
   */
  private toggleDoor(touchX: number, touchY: number): void {
    this.isDoorOpen = !this.isDoorOpen;
    const doorEl = this.element.querySelector('#wheels-bus-door') as HTMLElement;

    if (this.isDoorOpen) {
      doorEl.classList.add('door-open');
      this.bursts.spawnBurst(touchX, touchY, 12, '#06D6A0');
      // Realistic door opening latch and creak
      this.engine.playSound('door_bell.mp3', { volume: 0.7, pitch: 1.2 });
      setTimeout(() => {
        this.engine.playSound('laugh.mp3', { volume: 0.5 });
      }, 200);
    } else {
      doorEl.classList.remove('door-open');
      this.bursts.spawnBurst(touchX, touchY, 10, '#E76F51');
      // Door slam / latch shut
      this.engine.playSound('door_bell.mp3', { volume: 0.8, pitch: 0.9 });
      this.engine.playSound('boing.mp3', { volume: 0.4, pitch: 0.8 });
    }
  }

  /**
   * Windshield wipers animation & synchronized rubber squeak.
   */
  private triggerWipers(touchX: number, touchY: number): void {
    if (this.isWiperActive) return;
    this.isWiperActive = true;

    this.bursts.spawnBurst(touchX, touchY, 10, '#4ECDC4');
    this.engine.playSound('wiper.mp3', { volume: 0.85, pitch: 1.1 });

    const wiperAssembly = this.element.querySelector('#bus-wiper-assembly') as HTMLElement;
    wiperAssembly.classList.remove('swish');
    void wiperAssembly.offsetWidth;
    wiperAssembly.classList.add('swish');

    setTimeout(() => {
      this.engine.playSound('wiper.mp3', { volume: 0.8, pitch: 1.25 });
    }, 380);

    setTimeout(() => {
      this.isWiperActive = false;
      wiperAssembly.classList.remove('swish');
    }, 800);
  }

  /**
   * Brass bulb / car horn with elastic whole-bus squash and stretch.
   */
  public triggerHorn(touchX: number, touchY: number): void {
    this.bursts.spawnBurst(touchX, touchY, 18, '#FF6B6B');

    // Alternate between classic car horn and vintage bulb horn
    const hornSound = Math.random() > 0.5 ? 'horn_car.mp3' : 'horn_bulb.mp3';
    this.engine.playSound(hornSound, { volume: 0.95 });

    // Elastic Squash & Stretch on entire bus body
    if (this.busBodyEl) {
      this.busBodyEl.classList.remove('bus-squash-stretch');
      void this.busBodyEl.offsetWidth;
      this.busBodyEl.classList.add('bus-squash-stretch');
    }
  }

  /**
   * Gentle rhythmic bus bounce synchronized to audio beat.
   */
  private bounceBusSlightly(): void {
    if (this.busBodyEl && !this.busBodyEl.classList.contains('bus-squash-stretch')) {
      this.busBodyEl.classList.remove('bus-beat-bob');
      void this.busBodyEl.offsetWidth;
      this.busBodyEl.classList.add('bus-beat-bob');
    }
  }

  private bounceElement(el: HTMLElement): void {
    el.classList.remove('element-bounce');
    void el.offsetWidth;
    el.classList.add('element-bounce');
  }

  private triggerCloudRain(cloud: HTMLElement): void {
    cloud.classList.add('cloud-raining');
    this.engine.playSound('splash.mp3', { volume: 0.75, pitch: 1.2 });

    const rainWrap = cloud.querySelector('.rain-container') as HTMLElement;
    rainWrap.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = `${15 + i * 11}%`;
      drop.style.animationDelay = `${i * 0.08}s`;
      rainWrap.appendChild(drop);
    }

    setTimeout(() => {
      cloud.classList.remove('cloud-raining');
      rainWrap.innerHTML = '';
    }, 1800);
  }
}
