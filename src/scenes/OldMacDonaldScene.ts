/**
 * OldMacDonaldScene.ts
 * Scene 3: "Old MacDonald Had a Farm" (Animal Sound Discovery).
 * 
 * Features:
 * - Hand-painted style sunny barnyard with big red wooden barn, green pastures, muddy puddle, duck pond, and tractor.
 * - Upbeat acoustic banjo & upright bass arrangement (4/4 time, ~105 BPM).
 * - Interactive Barn Doors: tap to open with wooden latch squeak, revealing cycling animals.
 * - Tactile Animals:
 *   - Cow: Chew & ear-twitch with authentic deep "Moooo" (cow.ogg)
 *   - Duck: Waddles into pond, authentic splash (splash.mp3), and "Quack-quack" (duck.mp3)
 *   - Pig: Rolls in mud patch with authentic snort (animal_sprites.mp3) and mud splatter particles
 *   - Sheep: Bounces like a wool puff with gentle "Baaaa" (sheep.ogg)
 *   - Tractor: Engine chugs "chug-chug-pop" locked to banjo tempo with smoke puffs
 */

import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import type { StorybookScene } from './SceneManager';

type FarmAnimal = 'cow' | 'sheep' | 'pig' | 'duck';

export class OldMacDonaldScene implements StorybookScene {
  public readonly id = 'old_macdonald';
  public readonly title = "Old MacDonald's Farm";
  public readonly subtitle = 'Barnyard Animal Sounds';
  public readonly icon = '🚜';
  public readonly themeColor = '#70E000';

  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;

  public element!: HTMLElement;

  // Scene elements
  private barnDoorsEl!: HTMLElement;
  private barnAnimalEl!: HTMLElement;
  private cowEl!: HTMLElement;
  private sheepEl!: HTMLElement;
  private pigEl!: HTMLElement;
  private duckEl!: HTMLElement;
  private tractorEl!: HTMLElement;
  private tractorExhaustEl!: HTMLElement;

  // State
  private isActive: boolean = false;
  private isBarnOpen: boolean = false;
  private currentBarnAnimalIndex: number = 0;
  private readonly barnAnimals: FarmAnimal[] = ['cow', 'sheep', 'pig', 'duck'];
  private isTractorChugging: boolean = false;
  private tractorInterval: number | null = null;
  private banjoTimer: number | null = null;
  private isPlayingMusic: boolean = false;
  private isVocalSongPlaying: boolean = false;
  private vocalSongNode: AudioBufferSourceNode | null = null;
  private activeTimeouts: Set<number> = new Set();

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
    for (const id of this.activeTimeouts) {
      clearTimeout(id);
    }
    this.activeTimeouts.clear();
    if (this.banjoTimer !== null) {
      clearTimeout(this.banjoTimer);
      this.banjoTimer = null;
    }
  }

  private render(): void {
    this.element = document.createElement('div');
    this.element.className = 'storybook-scene scene-old-macdonald';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <div class="farm-sky">
        <div class="farm-sun sun-pulse" id="farm-sun">
          <div class="sun-face">
            <span class="sun-eye left"></span>
            <span class="sun-eye right"></span>
            <span class="sun-smile"></span>
          </div>
        </div>
        <div class="farm-cloud cloud-1"></div>
        <div class="farm-cloud cloud-2"></div>
      </div>

      <!-- Rolling Green Pastures -->
      <div class="farm-pastures">
        <div class="hill hill-back"></div>
        <div class="hill hill-front"></div>
      </div>

      <!-- Wooden Fence & Flowers -->
      <div class="farm-fence">
        <div class="fence-post"></div>
        <div class="fence-post"></div>
        <div class="fence-post"></div>
        <div class="fence-post"></div>
        <div class="fence-post"></div>
        <div class="fence-rail top"></div>
        <div class="fence-rail bottom"></div>
      </div>

      <!-- Big Red Barn -->
      <div class="farm-barn-wrap" id="farm-barn">
        <div class="barn-roof">
          <div class="barn-weathervane">🐓</div>
        </div>
        <div class="barn-body">
          <div class="barn-loft-window">
            <span class="hay-bale">🌾</span>
          </div>
          <div class="barn-door-frame">
            <div class="barn-inside" id="barn-inside">
              <div class="barn-animal-peek" id="barn-animal-peek">
                <span class="peek-emoji">🐮</span>
                <span class="peek-label">MOO!</span>
              </div>
            </div>
            <div class="barn-door door-left" id="door-left">
              <div class="door-cross-beam"></div>
            </div>
            <div class="barn-door door-right" id="door-right">
              <div class="door-cross-beam"></div>
            </div>
          </div>
        </div>
        <div class="barn-tap-hint">TAP BARN! 🚪</div>
      </div>

      <!-- Interactive Grazing Cow -->
      <div class="field-animal cow-wrap" id="field-cow" role="button" aria-label="Cow">
        <div class="cow-body">
          <div class="cow-head">
            <div class="cow-ears">
              <span class="ear ear-left"></span>
              <span class="ear ear-right"></span>
            </div>
            <div class="cow-horns">
              <span class="horn left"></span>
              <span class="horn right"></span>
            </div>
            <div class="cow-eyes">
              <span class="eye"></span>
              <span class="eye"></span>
            </div>
            <div class="cow-snout">
              <span class="nostril"></span>
              <span class="nostril"></span>
            </div>
          </div>
          <div class="cow-torso">
            <div class="cow-spot spot-1"></div>
            <div class="cow-spot spot-2"></div>
            <div class="cow-bell">🔔</div>
          </div>
          <div class="cow-legs">
            <span class="leg"></span>
            <span class="leg"></span>
            <span class="leg"></span>
            <span class="leg"></span>
          </div>
        </div>
        <span class="animal-name-badge">COW 🐮</span>
      </div>

      <!-- Fluffy Bouncing Sheep -->
      <div class="field-animal sheep-wrap" id="field-sheep" role="button" aria-label="Sheep">
        <div class="sheep-body">
          <div class="sheep-wool-puff">
            <div class="wool-cloud c1"></div>
            <div class="wool-cloud c2"></div>
            <div class="wool-cloud c3"></div>
            <div class="sheep-head">
              <span class="sheep-ear l"></span>
              <span class="sheep-ear r"></span>
              <span class="sheep-eye"></span>
              <span class="sheep-eye"></span>
            </div>
          </div>
          <div class="sheep-legs">
            <span class="s-leg"></span>
            <span class="s-leg"></span>
            <span class="s-leg"></span>
            <span class="s-leg"></span>
          </div>
        </div>
        <span class="animal-name-badge">SHEEP 🐑</span>
      </div>

      <!-- Muddy Puddle & Pig -->
      <div class="mud-puddle-zone" id="mud-zone">
        <div class="mud-puddle">
          <div class="field-animal pig-wrap" id="field-pig" role="button" aria-label="Pig">
            <div class="pig-body">
              <div class="pig-head">
                <span class="pig-ear l"></span>
                <span class="pig-ear r"></span>
                <div class="pig-snout">
                  <span class="p-nostril"></span>
                  <span class="p-nostril"></span>
                </div>
                <span class="pig-eye"></span>
                <span class="pig-eye"></span>
              </div>
              <div class="pig-torso">
                <span class="pig-tail">🌀</span>
                <span class="mud-splat on-pig"></span>
              </div>
            </div>
            <span class="animal-name-badge">PIG 🐷</span>
          </div>
        </div>
      </div>

      <!-- Blue Duck Pond & Waddling Duck -->
      <div class="duck-pond-zone" id="pond-zone">
        <div class="duck-pond">
          <div class="pond-reeds">🌾🌾</div>
          <div class="field-animal duck-wrap" id="field-duck" role="button" aria-label="Duck">
            <div class="duck-body">
              <div class="duck-head">
                <span class="duck-eye"></span>
                <span class="duck-bill">🦆</span>
              </div>
              <div class="duck-torso">
                <span class="duck-wing"></span>
              </div>
            </div>
            <span class="animal-name-badge">DUCK 🦆</span>
          </div>
        </div>
      </div>

      <!-- Vintage Green Farm Tractor -->
      <div class="farm-tractor-wrap" id="farm-tractor" role="button" aria-label="Tractor">
        <div class="tractor-body">
          <div class="tractor-exhaust" id="tractor-exhaust">
            <div class="exhaust-pipe"></div>
          </div>
          <div class="tractor-hood">
            <div class="tractor-grill"></div>
            <div class="tractor-headlight">💡</div>
          </div>
          <div class="tractor-cabin">
            <span class="tractor-seat">🪑</span>
            <span class="tractor-wheel-steer">🛞</span>
          </div>
          <div class="tractor-wheel wheel-front">
            <div class="spoke-hub"></div>
          </div>
          <div class="tractor-wheel wheel-back">
            <div class="spoke-hub"></div>
          </div>
        </div>
        <span class="animal-name-badge tractor-badge">CHUG-CHUG! 🚜</span>
      </div>

      <!-- Toddler Bottom Quick Tappers -->
      <div class="farm-toddler-bar">
        <button class="farm-quick-btn btn-cow" data-target="cow">🐮 MOO</button>
        <button class="farm-quick-btn btn-sheep" data-target="sheep">🐑 BAA</button>
        <button class="farm-quick-btn btn-pig" data-target="pig">🐷 OINK</button>
        <button class="farm-quick-btn btn-duck" data-target="duck">🦆 QUACK</button>
        <button class="farm-quick-btn btn-tractor" data-target="tractor">🚜 CHUG</button>
        <button class="farm-quick-btn btn-sing" id="btn-farm-sing" data-target="sing" style="background: linear-gradient(135deg, #FF6B8B, #FF8E53); color: white; font-weight: 800;">🎶 SING!</button>
      </div>
    `;

    this.container.appendChild(this.element);

    // Cache interactive elements
    this.barnDoorsEl = this.element.querySelector('#farm-barn') as HTMLElement;
    this.barnAnimalEl = this.element.querySelector('#barn-animal-peek') as HTMLElement;
    this.cowEl = this.element.querySelector('#field-cow') as HTMLElement;
    this.sheepEl = this.element.querySelector('#field-sheep') as HTMLElement;
    this.pigEl = this.element.querySelector('#field-pig') as HTMLElement;
    this.duckEl = this.element.querySelector('#field-duck') as HTMLElement;
    this.tractorEl = this.element.querySelector('#farm-tractor') as HTMLElement;
    this.tractorExhaustEl = this.element.querySelector('#tractor-exhaust') as HTMLElement;
  }

  private bindEvents(): void {
    // Barn Doors Tap (Cycles Farm Animals with latch squeak)
    this.barnDoorsEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.toggleBarn(e.clientX, e.clientY);
    });

    // Cow Interaction (Moo, ear-twitch, chew, sparkles)
    this.cowEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.triggerCow(e.clientX, e.clientY);
    });

    // Sheep Interaction (Baaa, wool puff bounce, star burst)
    this.sheepEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.triggerSheep(e.clientX, e.clientY);
    });

    // Pig Interaction (Oink snort, mud roll, mud splatter)
    this.pigEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.triggerPig(e.clientX, e.clientY);
    });

    // Duck Interaction (Quack, pond splash, wing flap)
    this.duckEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.triggerDuck(e.clientX, e.clientY);
    });

    // Tractor Interaction (Chug-chug-pop, smoke puffs)
    this.tractorEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.triggerTractor(e.clientX, e.clientY);
    });

    // Smiling Sun
    const sunEl = this.element.querySelector('#farm-sun') as HTMLElement;
    sunEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.engine.playSound('chime.mp3', { volume: 0.8, pitch: 1.1 });
      this.bursts.spawnStarGlow(e.clientX, e.clientY, 14, '#FFD166');
      sunEl.classList.add('sun-bounce');
      this.safeTimeout(() => sunEl.classList.remove('sun-bounce'), 800);
    });

    // Quick toddler buttons
    const quickBtns = this.element.querySelectorAll('.farm-quick-btn');
    quickBtns.forEach(btn => {
      btn.addEventListener('pointerdown', (e: Event) => {
        e.stopPropagation();
        const pEvt = e as PointerEvent;
        const target = (btn as HTMLElement).getAttribute('data-target');
        if (target === 'cow') this.triggerCow(pEvt.clientX, pEvt.clientY);
        else if (target === 'sheep') this.triggerSheep(pEvt.clientX, pEvt.clientY);
        else if (target === 'pig') this.triggerPig(pEvt.clientX, pEvt.clientY);
        else if (target === 'duck') this.triggerDuck(pEvt.clientX, pEvt.clientY);
        else if (target === 'tractor') this.triggerTractor(pEvt.clientX, pEvt.clientY);
        else if (target === 'sing') this.toggleVocalSong();
      });
    });
  }

  public activate(): void {
    this.isActive = true;
    this.element.style.display = 'block';
    this.startFarmBanjoGroove();
  }

  public deactivate(): void {
    this.isActive = false;
    this.element.style.display = 'none';
    this.stopFarmBanjoGroove();
    this.stopTractor();
    this.stopVocalSong();
    this.clearAllTimeouts();
  }

  public toggleVocalSong(): void {
    if (this.isVocalSongPlaying) {
      this.stopVocalSong();
    } else {
      this.startVocalSong();
    }
  }

  public startVocalSong(): void {
    this.stopFarmBanjoGroove();
    this.stopVocalSong();
    this.isVocalSongPlaying = true;
    const btn = this.element.querySelector('#btn-farm-sing') as HTMLElement;
    if (btn) btn.innerText = '⏸ PAUSE';

    this.vocalSongNode = this.engine.playSound('songs/old_macdonald.mp3', { volume: 0.95 });
    if (this.vocalSongNode) {
      this.vocalSongNode.onended = () => {
        this.stopVocalSong();
        if (this.isActive) this.startFarmBanjoGroove();
      };
    }
  }

  public stopVocalSong(): void {
    this.isVocalSongPlaying = false;
    const btn = this.element.querySelector('#btn-farm-sing') as HTMLElement;
    if (btn) btn.innerText = '🎶 SING!';
    if (this.vocalSongNode) {
      try {
        this.vocalSongNode.stop();
        this.vocalSongNode.disconnect();
      } catch {}
      this.vocalSongNode = null;
    }
  }

  /**
   * Toggles Barn doors open/close, revealing cycling farm animals with authentic sounds.
   */
  private toggleBarn(cx: number, cy: number): void {
    if (!this.isActive) return;
    this.isBarnOpen = !this.isBarnOpen;
    const doorL = this.element.querySelector('#door-left') as HTMLElement;
    const doorR = this.element.querySelector('#door-right') as HTMLElement;

    if (this.isBarnOpen) {
      doorL.classList.add('open');
      doorR.classList.add('open');

      // Next animal in cycle
      this.currentBarnAnimalIndex = (this.currentBarnAnimalIndex + 1) % this.barnAnimals.length;
      const currentAnimal = this.barnAnimals[this.currentBarnAnimalIndex];
      this.updateBarnPeek(currentAnimal);

      // Wooden door latch squeak
      this.engine.playSound('woodblock.mp3', { volume: 0.8, pitch: 0.85 });
      this.bursts.spawnBurst(cx, cy, 12, '#FFD166');

      // Play corresponding animal sound
      this.safeTimeout(() => {
        this.playAnimalSound(currentAnimal, cx, cy);
      }, 150);
    } else {
      doorL.classList.remove('open');
      doorR.classList.remove('open');
      this.engine.playSound('woodblock.mp3', { volume: 0.9, pitch: 1.1 });
      this.bursts.spawnBurst(cx, cy, 8, '#E76F51');
    }
  }

  private updateBarnPeek(animal: FarmAnimal): void {
    const emojiMap: Record<FarmAnimal, string> = {
      cow: '🐮', sheep: '🐑', pig: '🐷', duck: '🦆'
    };
    const labelMap: Record<FarmAnimal, string> = {
      cow: 'MOO! 🐮', sheep: 'BAA! 🐑', pig: 'OINK! 🐷', duck: 'QUACK! 🦆'
    };

    const emojiEl = this.barnAnimalEl.querySelector('.peek-emoji') as HTMLElement;
    const labelEl = this.barnAnimalEl.querySelector('.peek-label') as HTMLElement;
    emojiEl.innerText = emojiMap[animal];
    labelEl.innerText = labelMap[animal];

    this.barnAnimalEl.classList.remove('bounce-peek');
    void this.barnAnimalEl.offsetWidth;
    this.barnAnimalEl.classList.add('bounce-peek');
  }

  private playAnimalSound(animal: FarmAnimal, cx: number, cy: number): void {
    if (!this.isActive) return;
    if (animal === 'cow') this.triggerCow(cx, cy);
    else if (animal === 'sheep') this.triggerSheep(cx, cy);
    else if (animal === 'pig') this.triggerPig(cx, cy);
    else if (animal === 'duck') this.triggerDuck(cx, cy);
  }

  /**
   * Cow: Deep authentic "Moooo" (cow.ogg) + ear twitch & head chew.
   */
  public triggerCow(cx: number, cy: number): void {
    if (!this.isActive) return;
    this.engine.playSound('cow.ogg', { volume: 0.9, pitch: 1.0 });
    this.engine.playInstrumentNote('banjo', 'C4', { volume: 0.6 });
    this.bursts.spawnBurst(cx || window.innerWidth * 0.3, cy || window.innerHeight * 0.6, 12, '#06D6A0');

    this.cowEl.classList.remove('cow-moo-anim');
    void this.cowEl.offsetWidth;
    this.cowEl.classList.add('cow-moo-anim');
    this.safeTimeout(() => this.cowEl.classList.remove('cow-moo-anim'), 1200);
  }

  /**
   * Sheep: Gentle "Baaaa" (sheep.ogg) + wool puff bounce.
   */
  public triggerSheep(cx: number, cy: number): void {
    if (!this.isActive) return;
    this.engine.playSound('sheep.ogg', { volume: 0.85, pitch: 1.05 });
    this.engine.playInstrumentNote('banjo', 'E4', { volume: 0.6 });
    this.bursts.spawnStarGlow(cx || window.innerWidth * 0.7, cy || window.innerHeight * 0.5, 14, '#FFF3B0');

    this.sheepEl.classList.remove('sheep-bounce-anim');
    void this.sheepEl.offsetWidth;
    this.sheepEl.classList.add('sheep-bounce-anim');
    this.safeTimeout(() => this.sheepEl.classList.remove('sheep-bounce-anim'), 1000);
  }

  /**
   * Pig: Authentic snort (animal_sprites.mp3 offset 65.28s) + mud splatter particles!
   */
  public triggerPig(cx: number, cy: number): void {
    if (!this.isActive) return;
    this.engine.playSound('animal_sprites.mp3', {
      volume: 0.9,
      offset: 65.28,
      duration: 2.45
    });
    this.engine.playInstrumentNote('banjo', 'G4', { volume: 0.6 });
    this.bursts.spawnMudSplatter(cx || window.innerWidth * 0.25, cy || window.innerHeight * 0.8, 12);

    this.pigEl.classList.remove('pig-mud-roll');
    void this.pigEl.offsetWidth;
    this.pigEl.classList.add('pig-mud-roll');
    this.safeTimeout(() => this.pigEl.classList.remove('pig-mud-roll'), 1100);
  }

  /**
   * Duck: Authentic quack (duck.mp3) + water splash particles.
   */
  public triggerDuck(cx: number, cy: number): void {
    if (!this.isActive) return;
    this.engine.playSound('duck.mp3', { volume: 0.85 });
    this.engine.playSound('splash.mp3', { volume: 0.65, pitch: 1.3 });
    this.engine.playInstrumentNote('banjo', 'A4', { volume: 0.6 });
    this.bursts.spawnWaterSplash(cx || window.innerWidth * 0.75, cy || window.innerHeight * 0.75, 14);

    this.duckEl.classList.remove('duck-paddle-anim');
    void this.duckEl.offsetWidth;
    this.duckEl.classList.add('duck-paddle-anim');
    this.safeTimeout(() => this.duckEl.classList.remove('duck-paddle-anim'), 1000);
  }

  /**
   * Tractor: Chug-chug-pop engine rhythm + smoke puffs.
   */
  public triggerTractor(cx: number, cy: number): void {
    if (!this.isActive) return;
    if (this.isTractorChugging) {
      this.stopTractor();
      return;
    }

    this.isTractorChugging = true;
    this.tractorEl.classList.add('tractor-chugging');
    this.engine.playSound('woodblock.mp3', { volume: 0.75, pitch: 0.7 });
    this.bursts.spawnSmokePuff(cx || window.innerWidth * 0.88, cy || window.innerHeight * 0.8);

    // Chug along locked to ~105 BPM
    let chugStep = 0;
    this.tractorInterval = window.setInterval(() => {
      if (!this.isActive) {
        this.stopTractor();
        return;
      }
      chugStep++;
      const pitch = chugStep % 2 === 0 ? 0.95 : 1.15;
      this.engine.playSound('woodblock.mp3', { volume: 0.65, pitch });

      const exhaustRect = this.tractorExhaustEl.getBoundingClientRect();
      this.bursts.spawnSmokePuff(exhaustRect.left + 10, exhaustRect.top);

      if (chugStep >= 12) {
        this.stopTractor();
      }
    }, 285);
  }

  private stopTractor(): void {
    this.isTractorChugging = false;
    if (this.tractorInterval !== null) {
      clearInterval(this.tractorInterval);
      this.tractorInterval = null;
    }
    this.tractorEl.classList.remove('tractor-chugging');
  }

  /**
   * Banjo groove accompaniment (~105 BPM) for Old MacDonald.
   */
  private startFarmBanjoGroove(): void {
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;

    // Upbeat banjo accompaniment phrase in C major
    const notes = ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'C5', 'A4', 'G4', 'E4', 'D4', 'C4'];
    const bassNotes = ['C2', 'G2', 'C3', 'G2'];
    let noteIdx = 0;
    let bassIdx = 0;

    const playStep = () => {
      if (!this.isPlayingMusic || !this.isActive) return;

      const n = notes[noteIdx % notes.length];
      this.engine.playInstrumentNote('banjo', n, { volume: 0.35 });

      if (noteIdx % 2 === 0) {
        const bn = bassNotes[bassIdx % bassNotes.length];
        this.engine.playSound(`bass_${bn}.mp3`, { volume: 0.45 });
        bassIdx++;
      }

      noteIdx++;
      this.banjoTimer = this.safeTimeout(playStep, 285); // ~105 BPM eighth notes
    };

    this.banjoTimer = this.safeTimeout(playStep, 500);
  }

  private stopFarmBanjoGroove(): void {
    this.isPlayingMusic = false;
    if (this.banjoTimer !== null) {
      clearTimeout(this.banjoTimer);
      this.banjoTimer = null;
    }
  }
}
