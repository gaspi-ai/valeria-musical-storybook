/**
 * GameScenes.ts
 * 6 Rebuilt-From-Scratch Flagship Musical Storybook Games for Toddlers (1–2 Years).
 *
 * Every game has:
 * - Its ONE exact, accurate studio nursery rhyme melody (zero clashing loops or buzzes!)
 * - Automatic music ducking when tapping interactive toys/animals
 * - Crisp custom SVG artwork (zero blurry OS emoji reliance for main actors)
 * - Bilingual EN / FR voice integration + Parent Voice Recorder support
 */

import confetti from 'canvas-confetti';
import { BaseGameScene } from './BaseGameScene';
import type { InstrumentType } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import { getAnimalSvg, getWordSvg } from '../learning/LessonArt';
import { ANIMAL_FRIENDS, t } from '../learning/curriculum';
import { appPrefs } from '../state/AppPreferences';

// ============================================================================
// GAME 1: WHEELS ON THE BUS (Song: The Wheels on the Bus)
// ============================================================================
export class WheelsBusGame extends BaseGameScene {
  public readonly id = 'wheels';
  public readonly title = 'Wheels on the Bus';
  public readonly subtitle = 'Interactive School Bus';
  public readonly icon = '🚌';
  public readonly themeColor = '#FFBD00';
  public readonly songFile = 'songs/wheels_on_the_bus.mp3';
  public readonly songLabel = 'Wheels on the Bus';

  private isDoorsOpen = false;
  private isSpinning = true;

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['horn_car.mp3', 'horn_bulb.mp3', 'wiper.mp3', 'door_bell.mp3', 'dog.mp3', 'meow.mp3', 'chime.mp3'];
  }

  protected renderStageHtml(): string {
    return `
      <div class="pro-bus-sky">
        <div class="pro-sky-sun" id="pro-bus-sun" role="button" aria-label="Sun">
          ${getWordSvg('sun')}
        </div>
      </div>

      <div class="pro-bus-wrap">
        <svg viewBox="0 0 640 320" class="pro-bus-svg" id="pro-bus-svg">
          <ellipse cx="320" cy="292" rx="260" ry="18" fill="rgba(29,53,87,0.25)"/>
          <!-- Bus Body -->
          <path d="M 55 245 L 55 82 Q 55 38 100 38 L 495 38 Q 535 38 560 85 L 580 135 L 605 135 Q 622 135 622 162 L 622 245 Q 622 255 608 255 L 55 255 Z"
                fill="#FFBD00" stroke="#D97706" stroke-width="7" stroke-linejoin="round"/>
          <path d="M 55 82 Q 55 38 100 38 L 495 38 Q 530 38 552 76 L 55 76 Z" fill="#FFF8DC" stroke="#D97706" stroke-width="5"/>
          <line x1="55" y1="168" x2="585" y2="168" stroke="#1D3557" stroke-width="10"/>
          <!-- Windows with Smiling Animal Passengers -->
          <rect x="86" y="88" width="84" height="62" rx="10" fill="#CAF0F8" stroke="#1D3557" stroke-width="5"/>
          <text x="128" y="133" font-size="40" text-anchor="middle" class="pro-passenger" data-sfx="dog.mp3" style="cursor:pointer;">🐶</text>

          <rect x="188" y="88" width="84" height="62" rx="10" fill="#CAF0F8" stroke="#1D3557" stroke-width="5"/>
          <text x="230" y="133" font-size="40" text-anchor="middle" class="pro-passenger" data-sfx="meow.mp3" style="cursor:pointer;">🐱</text>

          <rect x="290" y="88" width="84" height="62" rx="10" fill="#CAF0F8" stroke="#1D3557" stroke-width="5"/>
          <text x="332" y="133" font-size="40" text-anchor="middle" class="pro-passenger" data-sfx="monkey.mp3" style="cursor:pointer;">🐵</text>

          <!-- Folding Door -->
          <g id="pro-bus-door" style="cursor:pointer;">
            <rect x="392" y="86" width="76" height="162" rx="8" fill="#FFE066" stroke="#1D3557" stroke-width="5"/>
            <rect x="400" y="96" width="60" height="54" rx="6" fill="#E0FBFC" stroke="#1D3557" stroke-width="3"/>
            <text id="pro-door-peek" x="430" y="136" font-size="34" text-anchor="middle">🐻</text>
            <line id="pro-door-split" x1="430" y1="86" x2="430" y2="248" stroke="#1D3557" stroke-width="4"/>
          </g>

          <!-- Front Windshield & Wiper -->
          <polygon points="484,88 544,88 568,144 484,144" fill="#CAF0F8" stroke="#1D3557" stroke-width="5"/>
          <g id="pro-bus-wiper" class="pro-bus-wiper">
            <line x1="496" y1="142" x2="546" y2="96" stroke="#1D3557" stroke-width="6" stroke-linecap="round"/>
            <line x1="534" y1="88" x2="558" y2="108" stroke="#EF233C" stroke-width="5" stroke-linecap="round"/>
          </g>

          <!-- Horn Grille & Headlight -->
          <g id="pro-bus-horn" style="cursor:pointer;">
            <circle cx="604" cy="154" r="15" fill="#FFF3B0" stroke="#F4A261" stroke-width="4"/>
            <rect x="594" y="178" width="24" height="54" rx="5" fill="#4A5568" stroke="#1D3557" stroke-width="4"/>
          </g>

          <!-- Spinning Wheels -->
          <g class="pro-bus-wheel spinning" id="pro-wheel-1">
            <circle cx="165" cy="255" r="42" fill="#2B2D42" stroke="#111" stroke-width="5"/>
            <circle cx="165" cy="255" r="22" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4"/>
            <circle cx="165" cy="255" r="9" fill="#FFBD00"/>
            <circle cx="165" cy="238" r="4" fill="#EF233C"/>
            <circle cx="165" cy="272" r="4" fill="#EF233C"/>
          </g>
          <g class="pro-bus-wheel spinning" id="pro-wheel-2">
            <circle cx="495" cy="255" r="42" fill="#2B2D42" stroke="#111" stroke-width="5"/>
            <circle cx="495" cy="255" r="22" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4"/>
            <circle cx="495" cy="255" r="9" fill="#FFBD00"/>
            <circle cx="495" cy="238" r="4" fill="#EF233C"/>
            <circle cx="495" cy="272" r="4" fill="#EF233C"/>
          </g>
        </svg>

        <div class="pro-bus-actions">
          <button class="pro-toy-pill" id="btn-pro-horn">📢 BEEP!</button>
          <button class="pro-toy-pill" id="btn-pro-wiper">💦 SWISH!</button>
          <button class="pro-toy-pill" id="btn-pro-door">🚪 DOORS!</button>
          <button class="pro-toy-pill" id="btn-pro-wheels">🎡 WHEELS!</button>
        </div>
      </div>
    `;
  }

  protected bindStageEvents(): void {
    const busSvg = this.stageEl.querySelector('#pro-bus-svg') as HTMLElement;
    const wiper = this.stageEl.querySelector('#pro-bus-wiper') as HTMLElement;
    const wheels = this.stageEl.querySelectorAll('.pro-bus-wheel');
    const doorSplit = this.stageEl.querySelector('#pro-door-split') as HTMLElement;
    const doorPeek = this.stageEl.querySelector('#pro-door-peek') as HTMLElement;

    const honk = (x: number, y: number) => {
      this.playEffect(Math.random() > 0.5 ? 'horn_car.mp3' : 'horn_bulb.mp3', 0.9);
      this.bursts.spawnBurst(x, y, 14, '#FF6B6B');
      busSvg.classList.remove('pop-bounce');
      void busSvg.getBoundingClientRect();
      busSvg.classList.add('pop-bounce');
    };

    const swish = (x: number, y: number) => {
      this.playEffect('wiper.mp3', 0.85, 1.1);
      this.bursts.spawnWaterSplash(x, y, 10);
      wiper.classList.remove('swishing');
      void wiper.getBoundingClientRect();
      wiper.classList.add('swishing');
    };

    const toggleDoors = (x: number, y: number) => {
      this.isDoorsOpen = !this.isDoorsOpen;
      this.playEffect('door_bell.mp3', 0.75, this.isDoorsOpen ? 1.15 : 0.9);
      this.bursts.spawnBurst(x, y, 12, '#06D6A0');
      if (doorSplit) doorSplit.style.opacity = this.isDoorsOpen ? '0' : '1';
      if (doorPeek) doorPeek.textContent = this.isDoorsOpen ? '🐘' : '🐻';
    };

    const toggleWheels = (x: number, y: number) => {
      this.isSpinning = !this.isSpinning;
      wheels.forEach(w => w.classList.toggle('spinning', this.isSpinning));
      this.playEffect('boing.mp3', 0.65, 1.25);
      this.bursts.spawnBurst(x, y, 10, '#FFBD00');
    };

    this.stageEl.querySelector('#pro-bus-horn')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      honk(pe.clientX, pe.clientY);
    });
    this.stageEl.querySelector('#btn-pro-horn')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      honk(pe.clientX, pe.clientY);
    });
    this.stageEl.querySelector('#pro-bus-wiper')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      swish(pe.clientX, pe.clientY);
    });
    this.stageEl.querySelector('#btn-pro-wiper')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      swish(pe.clientX, pe.clientY);
    });
    this.stageEl.querySelector('#pro-bus-door')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      toggleDoors(pe.clientX, pe.clientY);
    });
    this.stageEl.querySelector('#btn-pro-door')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      toggleDoors(pe.clientX, pe.clientY);
    });
    this.stageEl.querySelector('#btn-pro-wheels')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      toggleWheels(pe.clientX, pe.clientY);
    });
    wheels.forEach(w => {
      w.addEventListener('pointerdown', (e) => {
        const pe = e as PointerEvent;
        toggleWheels(pe.clientX, pe.clientY);
      });
    });

    this.stageEl.querySelector('#pro-bus-sun')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      this.playEffect('chime.mp3', 0.85);
      this.bursts.spawnStarGlow(pe.clientX, pe.clientY, 14, '#FFD166');
    });

    this.stageEl.querySelectorAll('.pro-passenger').forEach(p => {
      p.addEventListener('pointerdown', (e) => {
        const pe = e as PointerEvent;
        const sfx = p.getAttribute('data-sfx') || 'dog.mp3';
        this.playEffect(sfx, 0.9);
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 12, '#FFD166');
      });
    });
  }
}

// ============================================================================
// GAME 2: OLD MACDONALD'S FARM (Song: Old MacDonald Had a Farm)
// ============================================================================
export class OldMacDonaldGame extends BaseGameScene {
  public readonly id = 'old_macdonald';
  public readonly title = "Old MacDonald's Farm";
  public readonly subtitle = 'Barnyard Animal Sounds';
  public readonly icon = '🚜';
  public readonly themeColor = '#52B788';
  public readonly songFile = 'songs/old_macdonald.mp3';
  public readonly songLabel = 'Old MacDonald';

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['cow.mp3', 'dog.mp3', 'meow.mp3', 'duck.mp3', 'sheep.mp3', 'monkey.mp3'];
  }

  protected renderStageHtml(): string {
    const lang = appPrefs.get().language;
    return `
      <div class="pro-farm-grid">
        ${ANIMAL_FRIENDS.map(a => `
          <button class="pro-farm-card" data-animal-id="${a.id}" style="--card-accent: ${a.color}">
            <div class="pro-farm-art">${getAnimalSvg(a.id)}</div>
            <div class="pro-farm-name">${t(a.label, lang)}</div>
            <div class="pro-farm-sound">${t(a.soundWord, lang)}</div>
          </button>
        `).join('')}
      </div>
    `;
  }

  protected bindStageEvents(): void {
    this.stageEl.querySelectorAll('.pro-farm-card').forEach(card => {
      card.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const id = card.getAttribute('data-animal-id');
        const animal = ANIMAL_FRIENDS.find(a => a.id === id);
        if (!animal) return;

        card.classList.remove('pop-bounce');
        void (card as HTMLElement).offsetWidth;
        card.classList.add('pop-bounce');

        this.playEffect(animal.sfx, 0.92);
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 14, animal.color);
      });
    });
  }
}

// ============================================================================
// GAME 3: ITSY BITSY SPIDER (Song: The Itsy Bitsy Spider)
// ============================================================================
export class ItsyBitsyGame extends BaseGameScene {
  public readonly id = 'itsy_bitsy';
  public readonly title = 'Itsy Bitsy Spider';
  public readonly subtitle = 'Climb, Rain & Sunshine';
  public readonly icon = '🕷️';
  public readonly themeColor = '#FF6B6B';
  public readonly songFile = 'songs/itsy_bitsy.mp3';
  public readonly songLabel = 'Itsy Bitsy Spider';

  private step = 0;
  private readonly climbNotes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['slide_whistle.mp3', 'splash.mp3', 'chime.mp3', 'fanfare.mp3', ...this.climbNotes.map(n => `marimba_${n}.mp3`)];
  }

  protected renderStageHtml(): string {
    return `
      <div class="pro-spider-sky">
        <button class="pro-weather-btn" id="pro-spider-rain">
          <span>🌧️</span><span>RAIN</span>
        </button>
        <button class="pro-weather-btn" id="pro-spider-sun">
          <span>☀️</span><span>SUN</span>
        </button>
      </div>

      <div class="pro-spout-track" id="pro-spout-track" role="button" aria-label="Climb the waterspout">
        <div class="pro-spider-actor" id="pro-spider-actor">
          <svg viewBox="0 0 100 100" class="lesson-svg">
            <g stroke="#1D3557" stroke-width="5" stroke-linecap="round">
              <line x1="25" y1="42" x2="6" y2="30"/><line x1="25" y1="54" x2="4" y2="54"/>
              <line x1="25" y1="66" x2="8" y2="78"/><line x1="75" y1="42" x2="94" y2="30"/>
              <line x1="75" y1="54" x2="96" y2="54"/><line x1="75" y1="66" x2="92" y2="78"/>
            </g>
            <circle cx="50" cy="54" r="28" fill="#5A189A" stroke="#1D3557" stroke-width="5"/>
            <circle cx="40" cy="48" r="7" fill="#FFFFFF"/><circle cx="60" cy="48" r="7" fill="#FFFFFF"/>
            <circle cx="40" cy="48" r="3.5" fill="#1D3557"/><circle cx="60" cy="48" r="3.5" fill="#1D3557"/>
            <path d="M 40 62 Q 50 72 60 62" fill="none" stroke="#FFD166" stroke-width="4" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    `;
  }

  protected bindStageEvents(): void {
    const spider = this.stageEl.querySelector('#pro-spider-actor') as HTMLElement;
    const track = this.stageEl.querySelector('#pro-spout-track') as HTMLElement;

    const updateSpiderPos = () => {
      const pct = 4 + (this.step / (this.climbNotes.length - 1)) * 72;
      spider.style.bottom = `${pct}%`;
    };

    const climb = (x: number, y: number) => {
      this.element.classList.remove('raining');
      if (this.step < this.climbNotes.length - 1) {
        this.step++;
      } else {
        this.playEffect('fanfare.mp3', 0.65);
        this.bursts.spawnStarGlow(x, y, 16, '#FFD166');
        this.step = 0;
      }
      const note = this.climbNotes[this.step];
      if (this.isMusicOn) this.engine.duckMusic(600);
      this.engine.playInstrumentNote('marimba', note, { volume: 0.9 });
      this.bursts.spawnBurst(x, y, 10, '#06D6A0');
      updateSpiderPos();
    };

    track.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      climb(pe.clientX, pe.clientY);
    });

    this.stageEl.querySelector('#pro-spider-rain')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      this.element.classList.add('raining');
      this.playEffect('slide_whistle.mp3', 0.85);
      this.bursts.spawnWaterSplash(pe.clientX, pe.clientY, 18);
      this.step = 0;
      updateSpiderPos();
    });

    this.stageEl.querySelector('#pro-spider-sun')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      this.element.classList.remove('raining');
      this.playEffect('chime.mp3', 0.85);
      this.bursts.spawnStarGlow(pe.clientX, pe.clientY, 16, '#FFD166');
    });
  }
}

// ============================================================================
// GAME 4: TWINKLE, TWINKLE, LITTLE STAR (Song: Twinkle, Twinkle, Little Star)
// ============================================================================
export class TwinkleStarGame extends BaseGameScene {
  public readonly id = 'twinkle_star';
  public readonly title = 'Twinkle, Twinkle, Little Star';
  public readonly subtitle = 'Bedtime Musical Sky';
  public readonly icon = '⭐';
  public readonly themeColor = '#7209B7';
  public readonly songFile = 'songs/twinkle.mp3';
  public readonly songLabel = 'Twinkle Little Star';

  private readonly stars = [
    { note: 'C5', x: 18, y: 24 },
    { note: 'D5', x: 44, y: 18 },
    { note: 'E5', x: 26, y: 50 },
    { note: 'G5', x: 56, y: 42 },
    { note: 'A5', x: 80, y: 44 },
    { note: 'C6', x: 38, y: 74 },
    { note: 'G5', x: 72, y: 72 },
    { note: 'C5', x: 16, y: 78 },
  ];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['snore.mp3', 'chime.mp3', 'celesta_C5.mp3', 'celesta_D5.mp3', 'celesta_E5.mp3', 'celesta_G5.mp3', 'celesta_A5.mp3', 'celesta_C6.mp3'];
  }

  protected renderStageHtml(): string {
    return `
      <div class="pro-night-sky">
        <button class="pro-moon-btn" id="pro-moon-btn" aria-label="Sleeping Moon">
          ${getWordSvg('moon')}
        </button>

        ${this.stars.map((s, idx) => `
          <button class="pro-star-btn" data-note="${s.note}" style="left:${s.x}%; top:${s.y}%;" aria-label="Star ${idx + 1}">
            <svg viewBox="0 0 60 60" class="lesson-svg">
              <polygon points="30,4 37,22 56,24 41,36 46,55 30,45 14,55 19,36 4,24 23,22" fill="#FFE066" stroke="#F4A261" stroke-width="3" stroke-linejoin="round"/>
            </svg>
          </button>
        `).join('')}
      </div>
    `;
  }

  protected bindStageEvents(): void {
    this.stageEl.querySelectorAll('.pro-star-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const note = btn.getAttribute('data-note') || 'C5';
        this.engine.playInstrumentNote('celesta', note, { volume: 0.9 });
        this.bursts.spawnStarGlow(pe.clientX, pe.clientY, 14, '#FFE066');
      });
    });

    this.stageEl.querySelector('#pro-moon-btn')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const pe = e as PointerEvent;
      this.playEffect('snore.mp3', 0.75);
      this.bursts.spawnStarGlow(pe.clientX, pe.clientY, 14, '#C084FC');
    });
  }
}

// ============================================================================
// GAME 5: ROW, ROW, ROW YOUR BOAT (Song: Row, Row, Row Your Boat)
// ============================================================================
export class RowBoatGame extends BaseGameScene {
  public readonly id = 'row_boat';
  public readonly title = 'Row, Row, Row Your Boat';
  public readonly subtitle = 'Gentle River Adventure';
  public readonly icon = '🛶';
  public readonly themeColor = '#0077B6';
  public readonly songFile = 'songs/row_boat.mp3';
  public readonly songLabel = 'Row Your Boat';

  private rockDir = 1;

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['row_boat.mp3', 'splash.mp3', 'bubbles.mp3', 'harp_C4.mp3', 'harp_E4.mp3', 'harp_G4.mp3', 'harp_C5.mp3'];
  }

  protected renderStageHtml(): string {
    return `
      <div class="pro-river-stage">
        <button class="pro-boat-btn" id="pro-boat-btn" aria-label="Row the Boat">
          <svg viewBox="0 0 320 200" class="lesson-svg">
            <!-- Animal Friends -->
            <text x="108" y="102" font-size="48" text-anchor="middle">🐻</text>
            <text x="160" y="96" font-size="48" text-anchor="middle">🐶</text>
            <text x="212" y="102" font-size="48" text-anchor="middle">🐰</text>
            <!-- Wooden Rowboat Hull -->
            <path d="M 32 108 L 288 108 L 254 166 Q 160 182 66 166 Z" fill="#C68642" stroke="#6F4E37" stroke-width="7" stroke-linejoin="round"/>
            <line x1="56" y1="134" x2="264" y2="134" stroke="#8D5524" stroke-width="5"/>
            <!-- Oars -->
            <line x1="90" y1="120" x2="36" y2="180" stroke="#F4A261" stroke-width="8" stroke-linecap="round"/>
            <line x1="230" y1="120" x2="284" y2="180" stroke="#F4A261" stroke-width="8" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="pro-river-toys">
          <button class="pro-toy-pill" id="btn-pro-row">🛶 ROW!</button>
          <button class="pro-toy-pill" id="btn-pro-fish">🐟 FISH!</button>
          <button class="pro-toy-pill" id="btn-pro-splash">💦 SPLASH!</button>
        </div>
      </div>
    `;
  }

  protected bindStageEvents(): void {
    const boat = this.stageEl.querySelector('#pro-boat-btn') as HTMLElement;
    const harpNotes = ['C4', 'E4', 'G4', 'C5'];
    let idx = 0;

    const row = (x: number, y: number) => {
      this.rockDir *= -1;
      boat.style.transform = `rotate(${this.rockDir * 8}deg) translateY(-8px)`;
      this.safeTimeout(() => { boat.style.transform = 'rotate(0deg) translateY(0px)'; }, 360);

      this.playEffect('row_boat.mp3', 0.85);
      this.engine.playInstrumentNote('harp', harpNotes[idx++ % harpNotes.length], { volume: 0.8 });
      this.bursts.spawnWaterSplash(x, y, 16);
    };

    boat.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      row(pe.clientX, pe.clientY);
    });
    this.stageEl.querySelector('#btn-pro-row')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      row(pe.clientX, pe.clientY);
    });
    this.stageEl.querySelector('#btn-pro-fish')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      this.playEffect('bubbles.mp3', 0.85);
      this.bursts.spawnWaterSplash(pe.clientX, pe.clientY, 16);
    });
    this.stageEl.querySelector('#btn-pro-splash')?.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      this.playEffect('splash.mp3', 0.9);
      this.bursts.spawnWaterSplash(pe.clientX, pe.clientY, 20);
    });
  }
}

// ============================================================================
// GAME 6: RAINBOW XYLOPHONE (Song: Frère Jacques / Are You Sleeping — EN & FR!)
// ============================================================================
export class RainbowXylophoneGame extends BaseGameScene {
  public readonly id = 'musical_me';
  public readonly title = 'Rainbow Xylophone';
  public readonly subtitle = 'Frère Jacques & Play-Along';
  public readonly icon = '🎹';
  public readonly themeColor = '#4ECDC4';
  public readonly songFile = 'songs/frere_jacques.mp3';
  public readonly songLabel = 'Frère Jacques';

  private currentInst: InstrumentType = appPrefs.get().instrument || 'marimba';
  private guideIdx = 0;

  // Exact notes for "Frère Jacques" mapped to our 8 rainbow bars
  private readonly guideSequence = ['C4', 'D4', 'E4', 'C4', 'C4', 'D4', 'E4', 'C4', 'E4', 'G4', 'A4', 'C5'];

  private readonly bars = [
    { note: 'C4', label: 'Do', color: '#FF595E', heightPct: 100 },
    { note: 'D4', label: 'Re', color: '#FF924C', heightPct: 92 },
    { note: 'E4', label: 'Mi', color: '#FFCA3A', heightPct: 84 },
    { note: 'G4', label: 'Sol', color: '#52B788', heightPct: 76 },
    { note: 'A4', label: 'La', color: '#1982C4', heightPct: 68 },
    { note: 'C5', label: 'Do', color: '#6A4C93', heightPct: 60 },
    { note: 'D5', label: 'Re', color: '#F72585', heightPct: 54 },
  ];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  public setInstrument(inst: InstrumentType): void {
    this.currentInst = inst;
    this.stageEl?.querySelectorAll('.pro-inst-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-inst') === inst);
    });
  }

  protected getPreloadAssets(): string[] {
    const out = ['fanfare.mp3'];
    for (const b of this.bars) {
      out.push(`marimba_${b.note}.mp3`, `glock_${b.note}.mp3`, `piano_${b.note}.mp3`, `musicbox_${b.note}.mp3`);
    }
    return out;
  }

  protected renderStageHtml(): string {
    return `
      <div class="pro-xylo-controls">
        <button class="pro-inst-pill ${this.currentInst === 'marimba' ? 'active' : ''}" data-inst="marimba">🪵 Marimba</button>
        <button class="pro-inst-pill ${this.currentInst === 'glock' ? 'active' : ''}" data-inst="glock">🔔 Bells</button>
        <button class="pro-inst-pill ${this.currentInst === 'piano' ? 'active' : ''}" data-inst="piano">🎹 Piano</button>
        <button class="pro-inst-pill ${this.currentInst === 'musicbox' ? 'active' : ''}" data-inst="musicbox">🎼 Box</button>
      </div>

      <div class="pro-xylo-bars">
        ${this.bars.map((b, idx) => `
          <button class="pro-xylo-bar ${idx === 0 ? 'glow-guide' : ''}" data-note="${b.note}" style="--bar-color:${b.color}; height:${b.heightPct}%;">
            <span class="xylo-screw"></span>
            <span>${b.label}</span>
            <span class="xylo-screw"></span>
          </button>
        `).join('')}
      </div>
    `;
  }

  protected bindStageEvents(): void {
    this.stageEl.querySelectorAll('.pro-inst-pill').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const inst = (btn.getAttribute('data-inst') || 'marimba') as InstrumentType;
        this.setInstrument(inst);
        appPrefs.update({ instrument: inst });
        this.engine.playInstrumentNote(inst, 'C5', { volume: 0.85 });
      });
    });

    const barEls = Array.from(this.stageEl.querySelectorAll('.pro-xylo-bar')) as HTMLElement[];

    const highlightGuide = () => {
      const targetNote = this.guideSequence[this.guideIdx % this.guideSequence.length];
      barEls.forEach(el => el.classList.toggle('glow-guide', el.getAttribute('data-note') === targetNote));
    };

    barEls.forEach(bar => {
      bar.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const note = bar.getAttribute('data-note') || 'C4';
        const barMeta = this.bars.find(b => b.note === note);

        if (this.isMusicOn) this.engine.duckMusic(550);
        this.engine.playInstrumentNote(this.currentInst, note, { volume: 0.92 });
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 12, barMeta?.color || '#FFD166');

        // Advance guided glow when hitting the glowing bar
        if (note === this.guideSequence[this.guideIdx % this.guideSequence.length]) {
          this.guideIdx++;
          if (this.guideIdx % this.guideSequence.length === 0 && !appPrefs.get().bedtimeMode) {
            confetti({ particleCount: 35, spread: 60, origin: { y: 0.65 } });
          }
          highlightGuide();
        }
      });
    });
  }
}

// ============================================================================
// GAME 7: MAGIC BUBBLE POP (Song: Pop Goes the Weasel)
// ============================================================================
export class MagicBubblePopGame extends BaseGameScene {
  public readonly id = 'bubble_pop';
  public readonly title = 'Magic Bubble Pop';
  public readonly subtitle = 'Pop & Discover Surprises';
  public readonly icon = '🫧';
  public readonly themeColor = '#4CC9F0';
  public readonly songFile = 'songs/pop_goes_weasel.mp3';
  public readonly songLabel = 'Pop Goes the Weasel';

  private spawnTimer: number | null = null;
  private noteIdx = 0;
  private readonly scale = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];
  private readonly bubblePalette = [
    { color: '#FF6B8B', en: 'Pink', fr: 'Rose', icon: '💖' },
    { color: '#4CC9F0', en: 'Blue', fr: 'Bleu', icon: '🦆' },
    { color: '#FFD166', en: 'Yellow', fr: 'Jaune', icon: '⭐' },
    { color: '#52B788', en: 'Green', fr: 'Vert', icon: '🦋' },
    { color: '#A06CD5', en: 'Purple', fr: 'Violet', icon: '🌸' },
    { color: '#FF9F1C', en: 'Orange', fr: 'Orange', icon: '🎵' },
  ];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['bubbles.mp3', ...this.scale.map(n => `glock_${n}.mp3`)];
  }

  protected renderStageHtml(): string {
    return `
      <div class="pro-bubble-sky" id="pro-bubble-sky">
        <div class="pro-bubble-banner" id="pro-bubble-banner">🫧 POP!</div>
      </div>
    `;
  }

  protected bindStageEvents(): void {
    const sky = this.stageEl.querySelector('#pro-bubble-sky') as HTMLElement;
    sky.addEventListener('pointerdown', (e) => {
      if (e.target === sky) {
        const pe = e as PointerEvent;
        this.spawnBubble(pe.clientX, pe.clientY);
      }
    });
  }

  protected onActivate(): void {
    const sky = this.stageEl.querySelector('#pro-bubble-sky') as HTMLElement;
    sky.querySelectorAll('.magic-bubble').forEach(b => b.remove());
    // Spawn initial batch of giant bubbles
    for (let i = 0; i < 6; i++) {
      this.safeTimeout(() => this.spawnBubble(), i * 260);
    }
    this.spawnTimer = window.setInterval(() => {
      if (!this.isActive) return;
      if (sky.querySelectorAll('.magic-bubble').length < 8) {
        this.spawnBubble();
      }
    }, 950);
  }

  protected onDeactivate(): void {
    if (this.spawnTimer !== null) {
      clearInterval(this.spawnTimer);
      this.spawnTimer = null;
    }
    const sky = this.stageEl.querySelector('#pro-bubble-sky');
    sky?.querySelectorAll('.magic-bubble').forEach(b => b.remove());
  }

  private spawnBubble(customX?: number, customY?: number): void {
    if (!this.isActive) return;
    const sky = this.stageEl.querySelector('#pro-bubble-sky') as HTMLElement;
    const banner = this.stageEl.querySelector('#pro-bubble-banner') as HTMLElement;
    const meta = this.bubblePalette[Math.floor(Math.random() * this.bubblePalette.length)];
    const size = 84 + Math.floor(Math.random() * 34);

    const bubble = document.createElement('button');
    bubble.className = 'magic-bubble';
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.setProperty('--b-color', meta.color);

    if (customX !== undefined && customY !== undefined) {
      const rect = sky.getBoundingClientRect();
      bubble.style.left = `${Math.max(10, Math.min(82, ((customX - rect.left) / rect.width) * 100))}%`;
      bubble.style.top = `${Math.max(10, Math.min(75, ((customY - rect.top) / rect.height) * 100))}%`;
    } else {
      bubble.style.left = `${8 + Math.random() * 74}%`;
      bubble.style.bottom = `-20px`;
    }

    bubble.innerHTML = `<span class="bubble-surprise">${meta.icon}</span><span class="bubble-glint"></span>`;

    bubble.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const pe = e as PointerEvent;
      const note = this.scale[this.noteIdx++ % this.scale.length];
      this.playEffect('bubbles.mp3', 0.8);
      this.engine.playGlockNote(note, { volume: 0.9 });
      this.bursts.spawnBurst(pe.clientX, pe.clientY, 16, meta.color);

      const colorWord = appPrefs.get().language === 'fr' ? meta.fr : meta.en;
      if (banner) banner.textContent = `${meta.icon} ${colorWord}!`;
      this.speech.speak(colorWord);

      bubble.classList.add('popped');
      this.safeTimeout(() => bubble.remove(), 180);
    });

    sky.appendChild(bubble);
    // Auto-cleanup if bubble drifts off top
    this.safeTimeout(() => {
      if (bubble.parentNode) bubble.remove();
    }, 9500);
  }
}

// ============================================================================
// GAME 8: HATCH THE SURPRISE EGGS (Song: Baa, Baa, Black Sheep)
// ============================================================================
export class SurpriseEggsGame extends BaseGameScene {
  public readonly id = 'surprise_eggs';
  public readonly title = 'Hatch Surprise Eggs';
  public readonly subtitle = 'Tap, Crack & Hatch!';
  public readonly icon = '🐣';
  public readonly themeColor = '#FF9F1C';
  public readonly songFile = 'songs/baa_baa_black_sheep.mp3';
  public readonly songLabel = 'Baa Baa Black Sheep';

  private eggTaps: number[] = [0, 0, 0];
  private eggAnimals = [ANIMAL_FRIENDS[0], ANIMAL_FRIENDS[1], ANIMAL_FRIENDS[3]];
  private readonly eggColors = [
    { bg: '#FF6B8B', dot: '#FFF3B0' },
    { bg: '#4CC9F0', dot: '#FFFFFF' },
    { bg: '#FFCA3A', dot: '#FF6B6B' },
  ];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['cow.mp3', 'dog.mp3', 'meow.mp3', 'duck.mp3', 'sheep.mp3', 'monkey.mp3', 'fanfare.mp3', 'marimba_C5.mp3', 'marimba_E5.mp3'];
  }

  protected renderStageHtml(): string {
    return `
      <div class="pro-eggs-banner" id="pro-eggs-banner">🥚 TAP AN EGG!</div>
      <div class="pro-eggs-row" id="pro-eggs-row"></div>
    `;
  }

  protected bindStageEvents(): void {
    this.resetEggs();
  }

  protected onActivate(): void {
    this.resetEggs();
  }

  private resetEggs(): void {
    this.eggTaps = [0, 0, 0];
    const shuffled = [...ANIMAL_FRIENDS].sort(() => Math.random() - 0.5);
    this.eggAnimals = shuffled.slice(0, 3);
    this.renderEggs();
  }

  private renderEggs(): void {
    const row = this.stageEl.querySelector('#pro-eggs-row') as HTMLElement;
    const banner = this.stageEl.querySelector('#pro-eggs-banner') as HTMLElement;
    const lang = appPrefs.get().language;

    row.innerHTML = [0, 1, 2].map(idx => {
      const taps = this.eggTaps[idx];
      const animal = this.eggAnimals[idx];
      const col = this.eggColors[idx];

      if (taps >= 3) {
        return `
          <button class="pro-egg-slot hatched pop-bounce" data-idx="${idx}">
            <div class="hatched-animal-art">${getAnimalSvg(animal.id)}</div>
            <span class="hatched-animal-label">${t(animal.label, lang)}!</span>
          </button>
        `;
      }

      return `
        <button class="pro-egg-slot stage-${taps}" data-idx="${idx}" aria-label="Surprise Egg ${idx + 1}">
          <svg viewBox="0 0 140 170" class="egg-svg">
            <ellipse cx="70" cy="96" rx="54" ry="66" fill="${col.bg}" stroke="#FFFFFF" stroke-width="7"/>
            <circle cx="48" cy="76" r="10" fill="${col.dot}" opacity="0.8"/>
            <circle cx="92" cy="84" r="12" fill="${col.dot}" opacity="0.8"/>
            <circle cx="68" cy="122" r="11" fill="${col.dot}" opacity="0.8"/>
            ${taps >= 1 ? `<path d="M 32 92 L 54 80 L 68 96 L 86 78 L 108 94" fill="none" stroke="#1D3557" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
            ${taps >= 2 ? `<path d="M 42 118 L 62 104 L 80 120 L 98 106" fill="none" stroke="#1D3557" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
          </svg>
          <span class="egg-tap-dots">${'⭐'.repeat(taps)}${'○'.repeat(3 - taps)}</span>
        </button>
      `;
    }).join('');

    row.querySelectorAll('.pro-egg-slot').forEach(el => {
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const idx = parseInt(el.getAttribute('data-idx') || '0', 10);
        const animal = this.eggAnimals[idx];

        if (this.eggTaps[idx] >= 3) {
          // Already hatched: replay joyful animal sound!
          this.playEffect(animal.sfx, 0.92);
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 14, animal.color);
          this.speech.speakForKey(animal.id, t(animal.spoken, lang));
          return;
        }

        this.eggTaps[idx]++;
        if (this.eggTaps[idx] === 1) {
          this.engine.playInstrumentNote('marimba', 'C5', { volume: 0.9 });
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 8, '#FFD166');
          this.renderEggs();
        } else if (this.eggTaps[idx] === 2) {
          this.engine.playInstrumentNote('marimba', 'E5', { volume: 0.9 });
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 12, '#FF9F1C');
          this.renderEggs();
        } else {
          // HATCHED!
          this.playEffect(animal.sfx, 0.92);
          this.engine.playSound('fanfare.mp3', { volume: 0.6 });
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 20, animal.color);
          if (banner) banner.textContent = `🐣 ${t(animal.label, lang)} — ${t(animal.soundWord, lang)}`;
          this.speech.speakForKey(animal.id, t(animal.spoken, lang));
          if (!appPrefs.get().bedtimeMode) {
            confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
          }
          this.renderEggs();

          // If all 3 eggs hatched, bring fresh eggs after a celebratory pause
          if (this.eggTaps.every(v => v >= 3)) {
            this.safeTimeout(() => {
              if (banner) banner.textContent = lang === 'fr' ? '🥚 NOUVEAUX ŒUFS !' : '🥚 FRESH EGGS!';
              this.resetEggs();
            }, 2600);
          }
        }
      });
    });
  }
}

// ============================================================================
// GAME 9: PEEK-A-BOO MAGIC BOXES (Song: Where Is Thumbkin / Coucou Bébé!)
// ============================================================================
export class PeekabooBoxesGame extends BaseGameScene {
  public readonly id = 'peekaboo_boxes';
  public readonly title = 'Peek-a-Boo Boxes';
  public readonly subtitle = 'Object Permanence & Surprise';
  public readonly icon = '🙈';
  public readonly themeColor = '#F72585';
  public readonly songFile = 'songs/where_is_thumbkin.mp3';
  public readonly songLabel = 'Peek-a-Boo!';

  private hidingIdx = 1;
  private hidingAnimal = ANIMAL_FRIENDS[1];
  private isRevealed = false;

  private readonly boxes = [
    { id: 0, emoji: '🎁', color: '#FF6B8B', label: { en: 'Gift Box', fr: 'Cadeau' } },
    { id: 1, emoji: '🌿', color: '#52B788', label: { en: 'Bush', fr: 'Buisson' } },
    { id: 2, emoji: '☁️', color: '#4CC9F0', label: { en: 'Cloud', fr: 'Nuage' } },
  ];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['laugh.mp3', 'boing.mp3', 'chime.mp3', 'cow.mp3', 'dog.mp3', 'meow.mp3', 'duck.mp3', 'sheep.mp3', 'monkey.mp3'];
  }

  protected renderStageHtml(): string {
    return `
      <div class="pro-peek-banner" id="pro-peek-banner">🙈 PEEK-A-BOO!</div>
      <div class="pro-peek-row" id="pro-peek-row"></div>
    `;
  }

  protected bindStageEvents(): void {
    this.pickNewHidingSpot();
  }

  protected onActivate(): void {
    this.pickNewHidingSpot();
  }

  private pickNewHidingSpot(): void {
    this.isRevealed = false;
    const otherIndices = [0, 1, 2].filter(i => i !== this.hidingIdx);
    this.hidingIdx = otherIndices[Math.floor(Math.random() * otherIndices.length)];
    this.hidingAnimal = ANIMAL_FRIENDS[Math.floor(Math.random() * ANIMAL_FRIENDS.length)];
    this.renderBoxes();
  }

  private renderBoxes(): void {
    const row = this.stageEl.querySelector('#pro-peek-row') as HTMLElement;
    const banner = this.stageEl.querySelector('#pro-peek-banner') as HTMLElement;
    const lang = appPrefs.get().language;
    if (!this.isRevealed && banner) {
      banner.textContent = lang === 'fr' ? '🙈 COUCOU ! OÙ EST-IL ?' : '🙈 WHERE IS YOUR FRIEND?';
    }

    row.innerHTML = this.boxes.map(b => {
      const isHidingHere = b.id === this.hidingIdx;
      const revealedHere = isHidingHere && this.isRevealed;

      return `
        <button class="pro-peek-box ${isHidingHere && !this.isRevealed ? 'peeking-wiggle' : ''} ${revealedHere ? 'revealed pop-bounce' : ''}" data-box-id="${b.id}" style="--box-color:${b.color}">
          ${revealedHere
            ? `<div class="peek-revealed-art">${getAnimalSvg(this.hidingAnimal.id)}</div><span class="peek-box-label">${t(this.hidingAnimal.label, lang)}!</span>`
            : `${isHidingHere ? '<span class="peeking-ears">👀</span>' : ''}<span class="peek-box-emoji">${b.emoji}</span><span class="peek-box-label">${t(b.label, lang)}</span>`
          }
        </button>
      `;
    }).join('');

    row.querySelectorAll('.pro-peek-box').forEach(el => {
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const boxId = parseInt(el.getAttribute('data-box-id') || '0', 10);

        if (boxId === this.hidingIdx) {
          if (this.isRevealed) return;
          this.isRevealed = true;
          this.playEffect(this.hidingAnimal.sfx, 0.9);
          this.engine.playSound('laugh.mp3', { volume: 0.7 });
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 20, '#FFD166');
          if (banner) {
            banner.textContent = lang === 'fr'
              ? `🎉 COUCOU ! ${t(this.hidingAnimal.label, lang)} !`
              : `🎉 PEEK-A-BOO! ${t(this.hidingAnimal.label, lang)}!`;
          }
          this.speech.speakForKey(
            this.hidingAnimal.id,
            lang === 'fr' ? `Coucou ! ${t(this.hidingAnimal.label, lang)} !` : `Peek a boo! ${t(this.hidingAnimal.label, lang)}!`
          );
          if (!appPrefs.get().bedtimeMode) {
            confetti({ particleCount: 35, spread: 60, origin: { y: 0.58 } });
          }
          this.renderBoxes();

          this.safeTimeout(() => {
            this.pickNewHidingSpot();
          }, 2600);
        } else {
          // Gentle empty rustle + wiggle cue on real spot
          this.playEffect('boing.mp3', 0.65, 1.3);
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 8, '#52B788');
          el.classList.add('pop-bounce');
          this.safeTimeout(() => el.classList.remove('pop-bounce'), 420);
        }
      });
    });
  }
}

