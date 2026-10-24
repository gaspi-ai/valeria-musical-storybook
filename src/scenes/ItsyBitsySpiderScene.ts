/**
 * ItsyBitsySpiderScene.ts
 * Scene 4: "Itsy Bitsy Spider" (Climbing & Rain Physics).
 * 
 * Features:
 * - Brick garden wall with vintage copper waterspout, leafy ivy vines, and dynamic sky.
 * - Light acoustic nylon guitar & real rain acoustic loop (rain.ogg).
 * - Interactive Spider climbing spout with ascending pentatonic marimba scale.
 * - Rain Cloud tap with water droplets, cascade wash-down, and slide-whistle physics.
 * - Smiling Sun tap that clears rain, plays guitar chords, and makes spider shake off drops.
 */

import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import type { StorybookScene } from './SceneManager';

export class ItsyBitsySpiderScene implements StorybookScene {
  public readonly id = 'itsy_bitsy';
  public readonly title = 'Itsy Bitsy Spider';
  public readonly subtitle = 'Climbing & Rain Physics';
  public readonly icon = '🕷️';
  public readonly themeColor = '#FF6B6B';

  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;

  public element!: HTMLElement;

  // Scene elements
  private spiderEl!: HTMLElement;
  private spoutWaterEl!: HTMLElement;
  private cloudEl!: HTMLElement;
  private sunEl!: HTMLElement;
  private skyEl!: HTMLElement;
  private flowerBedEl!: HTMLElement;

  // State
  private isActive: boolean = false;
  private activeTimeouts: Set<number> = new Set();
  private vocalAudio: HTMLAudioElement | null = null;
  private isVocalPlaying: boolean = false;
  private spiderStepIndex: number = 0; // 0 (bottom in flower bed) to 7 (top of spout)
  private isRaining: boolean = false;
  private isWashingDown: boolean = false;
  private rainTimer: number | null = null;
  private guitarStrumTimer: number | null = null;

  private readonly climbNotes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];

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
    this.element.className = 'storybook-scene scene-itsy-bitsy';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- Dynamic Sky (Sunny to Rainy gradient) -->
      <div class="spider-sky sunny" id="spider-sky">
        <!-- Smiling Sun -->
        <div class="spider-sun sun-pulse" id="spider-sun" role="button" aria-label="Sun">
          <div class="sun-face">
            <span class="sun-eye l"></span>
            <span class="sun-eye r"></span>
            <span class="sun-smile"></span>
          </div>
          <div class="sun-rays-ring"></div>
        </div>

        <!-- Rain Cloud -->
        <div class="spider-cloud" id="spider-cloud" role="button" aria-label="Rain Cloud">
          <div class="cloud-puffs">
            <span class="puff p1"></span>
            <span class="puff p2"></span>
            <span class="puff p3"></span>
          </div>
          <div class="cloud-face">
            <span class="c-eye l"></span>
            <span class="c-eye r"></span>
            <span class="c-mouth"></span>
          </div>
          <div class="rain-drops-container" id="cloud-rain-drops"></div>
          <div class="cloud-tap-hint">TAP RAIN! 🌧️</div>
        </div>
      </div>

      <!-- Brick Garden Wall Background -->
      <div class="brick-wall-bg">
        <div class="brick-pattern"></div>

        <!-- Leafy Ivy Vines -->
        <div class="ivy-vines left">
          <span class="ivy-leaf l1">🍃</span>
          <span class="ivy-leaf l2">🌿</span>
          <span class="ivy-leaf l3">🍃</span>
          <span class="ivy-leaf l4">🌿</span>
        </div>
        <div class="ivy-vines right">
          <span class="ivy-leaf r1">🌿</span>
          <span class="ivy-leaf r2">🍃</span>
          <span class="ivy-leaf r3">🌿</span>
        </div>

        <!-- Vintage Copper Waterspout -->
        <div class="waterspout-wrap" id="waterspout-wrap">
          <div class="spout-gutter-funnel">
            <div class="gutter-rim"></div>
          </div>
          <div class="spout-pipe">
            <div class="spout-pipe-shine"></div>
            <!-- Rushing water layer -->
            <div class="spout-water-stream" id="spout-water"></div>
            <!-- Step markers on spout -->
            <div class="spout-rungs">
              <span class="rung"></span>
              <span class="rung"></span>
              <span class="rung"></span>
              <span class="rung"></span>
              <span class="rung"></span>
              <span class="rung"></span>
              <span class="rung"></span>
            </div>
          </div>
          <div class="spout-elbow">
            <div class="elbow-curve"></div>
          </div>

          <!-- The Cute Climbing Spider -->
          <div class="itsy-spider" id="itsy-spider" role="button" aria-label="Itsy Bitsy Spider">
            <div class="spider-thread"></div>
            <div class="spider-legs left">
              <span class="leg l1"></span>
              <span class="leg l2"></span>
              <span class="leg l3"></span>
              <span class="leg l4"></span>
            </div>
            <div class="spider-body">
              <div class="spider-eyes">
                <span class="s-eye l"><span class="pupil"></span></span>
                <span class="s-eye r"><span class="pupil"></span></span>
              </div>
              <div class="spider-cheeks">
                <span class="cheek l"></span>
                <span class="cheek r"></span>
              </div>
              <div class="spider-smile"></div>
            </div>
            <div class="spider-legs right">
              <span class="leg r1"></span>
              <span class="leg r2"></span>
              <span class="leg r3"></span>
              <span class="leg r4"></span>
            </div>
            <div class="spider-water-droplet-hat">💧</div>
          </div>
        </div>
      </div>

      <!-- Flower Bed & Garden Soil at Bottom -->
      <div class="spider-flowerbed" id="spider-flowerbed">
        <div class="soil-ground"></div>
        <div class="flowers-row">
          <div class="spider-flower f1">🌸</div>
          <div class="spider-flower f2">🌼</div>
          <div class="spider-flower f3">🌷</div>
          <div class="spider-flower f4">🌻</div>
          <div class="spider-flower f5">🌺</div>
          <div class="spider-flower f6">🌸</div>
        </div>
      </div>

      <!-- Toddler Bottom Quick Tappers -->
      <div class="spider-toddler-bar">
        <button class="spider-quick-btn btn-sing-vocal" id="btn-spider-sing" data-action="sing">🎶 SING</button>
        <button class="spider-quick-btn btn-climb" data-action="climb">🕷️ CLIMB UP</button>
        <button class="spider-quick-btn btn-rain" data-action="rain">🌧️ DOWN CAME RAIN</button>
        <button class="spider-quick-btn btn-sun" data-action="sun">☀️ OUT CAME SUN</button>
      </div>
    `;

    this.container.appendChild(this.element);

    this.spiderEl = this.element.querySelector('#itsy-spider') as HTMLElement;
    this.spoutWaterEl = this.element.querySelector('#spout-water') as HTMLElement;
    this.cloudEl = this.element.querySelector('#spider-cloud') as HTMLElement;
    this.sunEl = this.element.querySelector('#spider-sun') as HTMLElement;
    this.skyEl = this.element.querySelector('#spider-sky') as HTMLElement;
    this.flowerBedEl = this.element.querySelector('#spider-flowerbed') as HTMLElement;

    this.updateSpiderPosition(false);
  }

  private bindEvents(): void {
    // Tapping or swiping the Spider or Spout climbs up
    this.spiderEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.climbStep(e.clientX, e.clientY);
    });

    const spoutWrap = this.element.querySelector('#waterspout-wrap') as HTMLElement;
    spoutWrap.addEventListener('pointerdown', (e: PointerEvent) => {
      // If not clicking rain or sun, climb!
      const target = e.target as HTMLElement;
      if (!target.closest('#spider-cloud') && !target.closest('#spider-sun')) {
        this.climbStep(e.clientX, e.clientY);
      }
    });

    // Cloud Interaction (Down came the rain)
    this.cloudEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.triggerRain(e.clientX, e.clientY);
    });

    // Sun Interaction (Out came the sun)
    this.sunEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.triggerSun(e.clientX, e.clientY);
    });

    // Interactive Flower Bed (bounce flowers with woodblock clacks)
    this.flowerBedEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      this.engine.playSound('woodblock.mp3', { volume: 0.7, pitch: 1.2 });
      this.bursts.spawnBurst(e.clientX, e.clientY, 8, '#FF6B6B');
      const flowers = this.flowerBedEl.querySelectorAll('.spider-flower');
      flowers.forEach(f => {
        f.classList.add('flower-bounce');
        this.safeTimeout(() => f.classList.remove('flower-bounce'), 600);
      });
    });

    // Bottom Quick Buttons
    const quickBtns = this.element.querySelectorAll('.spider-quick-btn');
    quickBtns.forEach(btn => {
      btn.addEventListener('pointerdown', (e: Event) => {
        e.stopPropagation();
        const pEvt = e as PointerEvent;
        const act = (btn as HTMLElement).getAttribute('data-action');
        if (act === 'sing') this.toggleVocalSong();
        else if (act === 'climb') this.climbStep(pEvt.clientX, pEvt.clientY);
        else if (act === 'rain') this.triggerRain(pEvt.clientX, pEvt.clientY);
        else if (act === 'sun') this.triggerSun(pEvt.clientX, pEvt.clientY);
      });
    });
  }

  public activate(): void {
    this.isActive = true;
    this.element.style.display = 'block';
    this.spiderStepIndex = 0;
    this.updateSpiderPosition(false);
    this.playAcousticNylonGuitarStrum();
  }

  public deactivate(): void {
    this.isActive = false;
    this.element.style.display = 'none';
    this.clearAllTimeouts();
    this.stopRain();
    this.stopVocalSong();
    if (this.guitarStrumTimer !== null) {
      clearTimeout(this.guitarStrumTimer);
      this.guitarStrumTimer = null;
    }
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
    const btn = this.element.querySelector('#btn-spider-sing') as HTMLElement;
    if (btn) btn.classList.add('active');

    try {
      this.vocalAudio = new Audio(this.engine.resolveAudioPath('audio/songs/itsy_bitsy.mp3'));
      this.vocalAudio.volume = 0.95;
      this.isVocalPlaying = true;
      this.vocalAudio.play().catch(e => console.warn('Itsy bitsy vocal song play warning:', e));
      this.vocalAudio.onended = () => {
        this.stopVocalSong();
      };
    } catch (e) {
      console.warn('Could not start vocal song:', e);
    }
  }

  private stopVocalSong(): void {
    this.isVocalPlaying = false;
    const btn = this.element.querySelector('#btn-spider-sing') as HTMLElement;
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
   * Spider climbs up the copper spout step-by-step.
   * Plays ascending pentatonic marimba / nylon guitar scale!
   */
  public climbStep(cx: number, cy: number): void {
    if (!this.isActive || this.isWashingDown) return;

    if (this.spiderStepIndex < this.climbNotes.length - 1) {
      this.spiderStepIndex++;
    } else {
      // At top, celebrate with chime and restart from step 1
      this.engine.playSound('fanfare.mp3', { volume: 0.7 });
      this.bursts.spawnStarGlow(cx || window.innerWidth * 0.5, cy || window.innerHeight * 0.25, 16, '#FFD166');
      this.spiderStepIndex = 0;
      this.engine.playVoice('voice_spider_climb.wav', 'The itsy bitsy spider climbed up the water spout!', 0.9);
    }

    const note = this.climbNotes[this.spiderStepIndex];
    // Play acoustic marimba note + nylon guitar note
    this.engine.playInstrumentNote('marimba', note, { volume: 0.85 });
    this.engine.playInstrumentNote('nylon_guitar', note, { volume: 0.5 });

    this.bursts.spawnBurst(cx || window.innerWidth * 0.5, cy || window.innerHeight * 0.5, 10, '#06D6A0');
    this.updateSpiderPosition(true);
  }

  private updateSpiderPosition(animate: boolean): void {
    // 0 = bottom (0%), 7 = top (82%)
    const pct = (this.spiderStepIndex / (this.climbNotes.length - 1)) * 82;
    this.spiderEl.style.bottom = `${8 + pct}%`;

    if (animate) {
      this.spiderEl.classList.remove('spider-step-bounce');
      void this.spiderEl.offsetWidth;
      this.spiderEl.classList.add('spider-step-bounce');
    }
  }

  /**
   * Rain Cloud: "Down came the rain, and washed the spider out!"
   */
  public triggerRain(cx: number, cy: number): void {
    if (!this.isActive || this.isRaining) return;
    this.isRaining = true;

    // Darken sky to rainy blue-grey
    this.skyEl.classList.remove('sunny');
    this.skyEl.classList.add('rainy');
    this.cloudEl.classList.add('cloud-shaking');

    // Spoken voice cue
    this.engine.playVoice('voice_spider_rain.wav', 'Down came the rain and washed the spider out!', 0.9);

    // Soft acoustic rain trickle loop
    this.engine.playAmbientSound('rain.ogg', 0.45);
    this.bursts.spawnWaterSplash(cx || window.innerWidth * 0.3, cy || window.innerHeight * 0.25, 14);

    // Cascading rain particles
    const rainWrap = this.element.querySelector('#cloud-rain-drops') as HTMLElement;
    if (rainWrap) {
      rainWrap.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop-item';
        drop.style.left = `${10 + i * 9}%`;
        drop.style.animationDelay = `${i * 0.07}s`;
        rainWrap.appendChild(drop);
      }
    }

    // Rush of water washes spider down the spout!
    this.safeTimeout(() => {
      this.triggerSpoutWashDown();
    }, 600);

    // Rain clears after a few seconds
    this.rainTimer = this.safeTimeout(() => {
      this.stopRain();
    }, 4500);
  }

  private triggerSpoutWashDown(): void {
    if (!this.isActive || this.isWashingDown) return;
    this.isWashingDown = true;

    // Rushing water visual down spout
    this.spoutWaterEl.classList.add('water-cascading');

    // Slide whistle falling sound + bubble pop!
    this.engine.playSound('slide_whistle.mp3', { volume: 0.85 });
    this.safeTimeout(() => {
      this.engine.playSound('bubbles.ogg', { volume: 0.8 });
      this.engine.playSound('splash.mp3', { volume: 0.7, pitch: 1.1 });
    }, 700);

    // Spider slides down into flowerbed with squash & stretch
    this.spiderEl.classList.add('spider-washed-down');
    this.spiderStepIndex = 0;
    this.updateSpiderPosition(false);

    const spiderRect = this.spiderEl.getBoundingClientRect();
    this.bursts.spawnWaterSplash(spiderRect.left + 25, spiderRect.top + 25, 16);

    this.safeTimeout(() => {
      this.spoutWaterEl.classList.remove('water-cascading');
      this.spiderEl.classList.remove('spider-washed-down');
      this.isWashingDown = false;
    }, 1400);
  }

  private stopRain(): void {
    this.isRaining = false;
    this.engine.stopAmbientSound();
    this.cloudEl.classList.remove('cloud-shaking');
    const rainWrap = this.element.querySelector('#cloud-rain-drops') as HTMLElement;
    if (rainWrap) rainWrap.innerHTML = '';
    if (this.rainTimer !== null) {
      clearTimeout(this.rainTimer);
      this.rainTimer = null;
    }
  }

  /**
   * Sun: "Out came the sun and dried up all the rain!"
   */
  public triggerSun(cx: number, cy: number): void {
    if (!this.isActive) return;
    this.stopRain();

    // Brighten sky
    this.skyEl.classList.remove('rainy');
    this.skyEl.classList.add('sunny');

    // Spoken voice cue
    this.engine.playVoice('voice_spider_sun.wav', 'Out came the sun and dried up all the rain!', 0.9);

    // Warm acoustic guitar chord & smiling sun chime
    this.engine.playSound('chime.mp3', { volume: 0.8, pitch: 1.05 });
    this.engine.playInstrumentNote('nylon_guitar', 'C4', { volume: 0.65 });
    this.safeTimeout(() => {
      this.engine.playInstrumentNote('nylon_guitar', 'G4', { volume: 0.6 });
      this.engine.playInstrumentNote('nylon_guitar', 'C5', { volume: 0.6 });
    }, 120);

    this.bursts.spawnStarGlow(cx || window.innerWidth * 0.75, cy || window.innerHeight * 0.2, 16, '#FFD166');

    this.sunEl.classList.remove('sun-shine-big');
    void this.sunEl.offsetWidth;
    this.sunEl.classList.add('sun-shine-big');

    // Spider shakes off droplets with cheerful wiggle
    this.spiderEl.classList.remove('spider-wiggle-dry');
    void this.spiderEl.offsetWidth;
    this.spiderEl.classList.add('spider-wiggle-dry');
    this.safeTimeout(() => this.spiderEl.classList.remove('spider-wiggle-dry'), 1000);
  }

  private playAcousticNylonGuitarStrum(): void {
    const chord = ['C4', 'E4', 'G4', 'C5'];
    chord.forEach((n, idx) => {
      this.safeTimeout(() => {
        if (this.isActive) {
          this.engine.playInstrumentNote('nylon_guitar', n, { volume: 0.4 });
        }
      }, idx * 60);
    });
  }
}
