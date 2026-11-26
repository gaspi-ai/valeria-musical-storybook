/**
 * ArcadeGames.ts
 * 4 RV AppStudios-Inspired Flagship Toddler Games (Built from scratch for iPhone/iPad):
 *  1. BalloonFruitGame  — Animal-shaped & colorful Balloons + Juicy Fruit Smash mode
 *  2. BabyPhoneGame     — Chunky 0–9 Toy Phone + Ringing Animal Video Calls + Call Mama / Dada!
 *  3. DrumPianoRoomGame — Chunky Rainbow Baby Piano + Playable 4-Piece Toddler Drum Kit
 *  4. FireworksShowGame — Multi-Touch 60 FPS Glowing Fireworks Night Sky (Tap & Drag)
 */

import confetti from 'canvas-confetti';
import { BaseGameScene } from './BaseGameScene';
import { TouchBurstManager } from '../components/TouchBurstManager';
import { getAnimalSvg } from '../learning/LessonArt';
import { ANIMAL_FRIENDS, t } from '../learning/curriculum';
import { appPrefs } from '../state/AppPreferences';

// ============================================================================
// ARCADE 1: BALLOON POP & FRUIT SMASH
// ============================================================================
export class BalloonFruitGame extends BaseGameScene {
  public readonly id = 'balloon_fruit';
  public readonly title = 'Balloons & Fruit Smash';
  public readonly subtitle = 'Pop Balloons & Squish Fruit!';
  public readonly icon = '🎈';
  public readonly themeColor = '#FF595E';
  public readonly songFile = 'songs/happy_and_you_know_it.mp3';
  public readonly songLabel = 'Happy Balloon Party';

  private mode: 'balloons' | 'fruit' = 'balloons';
  private spawnTimer: number | null = null;
  private noteIdx = 0;
  private readonly scale = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];

  private readonly balloons = [
    { icon: '🐶', color: '#FF595E', en: 'Red', fr: 'Rouge' },
    { icon: '🐱', color: '#FF9F1C', en: 'Orange', fr: 'Orange' },
    { icon: '🐥', color: '#FFCA3A', en: 'Yellow', fr: 'Jaune' },
    { icon: '🐸', color: '#52B788', en: 'Green', fr: 'Vert' },
    { icon: '🐳', color: '#1982C4', en: 'Blue', fr: 'Bleu' },
    { icon: '🦄', color: '#9D4EDD', en: 'Purple', fr: 'Violet' },
  ];

  private readonly fruits = [
    { icon: '🍎', color: '#EF233C', en: 'Apple', fr: 'Pomme' },
    { icon: '🍌', color: '#FFD166', en: 'Banana', fr: 'Banane' },
    { icon: '🍓', color: '#FF4D6D', en: 'Strawberry', fr: 'Fraise' },
    { icon: '🍉', color: '#06D6A0', en: 'Watermelon', fr: 'Pastèque' },
    { icon: '🍊', color: '#FF9F1C', en: 'Orange', fr: 'Orange' },
    { icon: '🍇', color: '#7209B7', en: 'Grapes', fr: 'Raisin' },
  ];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['boing.mp3', 'splash.mp3', 'bubbles.mp3', ...this.scale.map(n => `glock_${n}.mp3`)];
  }

  protected renderStageHtml(): string {
    return `
      <div class="arc-mode-bar">
        <button class="arc-mode-btn active" data-mode="balloons">🎈 BALLOONS</button>
        <button class="arc-mode-btn" data-mode="fruit">🍓 FRUIT SMASH</button>
      </div>
      <div class="arc-banner" id="bf-banner">🎈 POP!</div>
      <div class="bf-playfield" id="bf-playfield"></div>
    `;
  }

  protected bindStageEvents(): void {
    this.stageEl.querySelectorAll('.arc-mode-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.mode = btn.getAttribute('data-mode') === 'fruit' ? 'fruit' : 'balloons';
        this.stageEl.querySelectorAll('.arc-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
        this.playEffect('chime.mp3', 0.7);
        this.refreshPlayfield();
      });
    });
  }

  protected onActivate(): void {
    this.refreshPlayfield();
  }

  protected onDeactivate(): void {
    if (this.spawnTimer !== null) {
      clearInterval(this.spawnTimer);
      this.spawnTimer = null;
    }
    const field = this.stageEl.querySelector('#bf-playfield');
    if (field) field.innerHTML = '';
  }

  private refreshPlayfield(): void {
    if (this.spawnTimer !== null) {
      clearInterval(this.spawnTimer);
      this.spawnTimer = null;
    }
    const field = this.stageEl.querySelector('#bf-playfield') as HTMLElement;
    const banner = this.stageEl.querySelector('#bf-banner') as HTMLElement;
    field.innerHTML = '';

    if (this.mode === 'balloons') {
      banner.textContent = appPrefs.get().language === 'fr' ? '🎈 ÉCLATE LES BALLONS !' : '🎈 POP THE BALLOONS!';
      for (let i = 0; i < 5; i++) {
        this.safeTimeout(() => this.spawnBalloon(), i * 280);
      }
      this.spawnTimer = window.setInterval(() => {
        if (this.isActive && this.mode === 'balloons' && field.querySelectorAll('.arc-balloon').length < 7) {
          this.spawnBalloon();
        }
      }, 950);
    } else {
      banner.textContent = appPrefs.get().language === 'fr' ? '🍓 ÉCRASE LES FRUITS !' : '🍓 SMASH THE FRUIT!';
      field.innerHTML = `<div class="fruit-grid">${this.fruits.map((f, idx) => `
        <button class="fruit-smash-card" data-idx="${idx}" style="--fruit-color:${f.color}">
          <span class="fruit-emoji">${f.icon}</span>
          <span class="fruit-name">${appPrefs.get().language === 'fr' ? f.fr : f.en}</span>
        </button>
      `).join('')}</div>`;

      field.querySelectorAll('.fruit-smash-card').forEach(card => {
        card.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          const pe = e as PointerEvent;
          const f = this.fruits[parseInt(card.getAttribute('data-idx') || '0', 10)];
          if (!f) return;

          card.classList.remove('fruit-squish');
          void (card as HTMLElement).offsetWidth;
          card.classList.add('fruit-squish');

          const note = this.scale[this.noteIdx++ % this.scale.length];
          this.playEffect('splash.mp3', 0.85, 1.15);
          this.engine.playGlockNote(note, { volume: 0.75 });
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 18, f.color);

          const word = appPrefs.get().language === 'fr' ? f.fr : f.en;
          banner.textContent = `${f.icon} ${word}!`;
          this.speech.speak(word);
        });
      });
    }
  }

  private spawnBalloon(): void {
    if (!this.isActive || this.mode !== 'balloons') return;
    const field = this.stageEl.querySelector('#bf-playfield') as HTMLElement;
    const banner = this.stageEl.querySelector('#bf-banner') as HTMLElement;
    const meta = this.balloons[Math.floor(Math.random() * this.balloons.length)];

    const el = document.createElement('button');
    el.className = 'arc-balloon';
    el.style.left = `${8 + Math.random() * 72}%`;
    el.style.setProperty('--bal-color', meta.color);
    el.innerHTML = `<span class="bal-face">${meta.icon}</span><span class="bal-knot"></span><span class="bal-string"></span>`;

    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const pe = e as PointerEvent;
      const note = this.scale[this.noteIdx++ % this.scale.length];
      this.playEffect('boing.mp3', 0.8, 1.35);
      this.engine.playGlockNote(note, { volume: 0.85 });
      this.bursts.spawnBurst(pe.clientX, pe.clientY, 16, meta.color);
      const word = appPrefs.get().language === 'fr' ? meta.fr : meta.en;
      banner.textContent = `🎈 ${word}!`;
      this.speech.speak(word);
      el.classList.add('popped');
      this.safeTimeout(() => el.remove(), 160);
    });

    field.appendChild(el);
    this.safeTimeout(() => { if (el.parentNode) el.remove(); }, 8500);
  }
}

// ============================================================================
// ARCADE 2: BABY TOY PHONE (0–9 Keypad + Animal Video Calls + Call Mama/Dada!)
// ============================================================================
export class BabyPhoneGame extends BaseGameScene {
  public readonly id = 'baby_phone';
  public readonly title = 'Baby Toy Phone';
  public readonly subtitle = 'Call Animals, Mama & Dada!';
  public readonly icon = '📱';
  public readonly themeColor = '#4361EE';
  public readonly songFile = 'songs/baby_bumblebee.mp3';
  public readonly songLabel = 'Toy Phone Melody';

  private dialed = '';
  private isCalling = false;

  private readonly numWordsEn = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  private readonly numWordsFr = ['Zéro', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf'];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return ['cow.mp3', 'dog.mp3', 'meow.mp3', 'duck.mp3', 'laugh.mp3', 'chime.mp3'];
  }

  protected onActivate(): void {
    // Keep Toy Phone quiet by default until baby presses play or calls someone (cleaner for calls!)
    this.stopThemeSong();
  }

  protected renderStageHtml(): string {
    const keyColors = ['#FF595E', '#FF924C', '#FFCA3A', '#8AC926', '#52B788', '#1982C4', '#4361EE', '#7209B7', '#F72585', '#00B4D8'];
    return `
      <div class="baby-phone-shell">
        <!-- Pretend Video Call Screen -->
        <div class="phone-screen" id="phone-screen">
          <div class="phone-screen-idle" id="phone-screen-content">
            <span class="phone-idle-emoji">📞</span>
            <span class="phone-dial-readout" id="phone-dial-readout">123</span>
          </div>
        </div>

        <!-- Quick Contacts: Call Mama, Call Dada & Animal Friends -->
        <div class="phone-contacts-row">
          <button class="phone-contact-btn contact-mama" data-contact="mama">👩<span>Mama</span></button>
          <button class="phone-contact-btn contact-dada" data-contact="dada">👨<span>Dada</span></button>
          <button class="phone-contact-btn" data-contact="dog">🐶<span>Dog</span></button>
          <button class="phone-contact-btn" data-contact="cat">🐱<span>Cat</span></button>
          <button class="phone-contact-btn" data-contact="cow">🐮<span>Cow</span></button>
          <button class="phone-contact-btn" data-contact="duck">🦆<span>Duck</span></button>
        </div>

        <!-- Giant 0–9 Rainbow Keypad -->
        <div class="phone-keypad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d, idx) => `
            <button class="phone-key-btn" data-digit="${d}" style="--key-color:${keyColors[idx]}">${d}</button>
          `).join('')}
          <button class="phone-key-btn phone-call-btn" id="phone-btn-call" aria-label="Call">📞</button>
          <button class="phone-key-btn" data-digit="0" style="--key-color:${keyColors[9]}">0</button>
          <button class="phone-key-btn phone-end-btn" id="phone-btn-end" aria-label="Hang Up">🔴</button>
        </div>
      </div>
    `;
  }

  protected bindStageEvents(): void {
    const screenContent = this.stageEl.querySelector('#phone-screen-content') as HTMLElement;

    const showIdle = () => {
      this.isCalling = false;
      screenContent.className = 'phone-screen-idle';
      screenContent.innerHTML = `<span class="phone-idle-emoji">📞</span><span class="phone-dial-readout">${this.dialed || '123'}</span>`;
    };

    const startCall = (contactId: string, x: number, y: number) => {
      this.isCalling = true;
      const lang = appPrefs.get().language;
      this.engine.duckMusic(2200);
      this.engine.playPhoneRing();
      this.bursts.spawnBurst(x, y, 14, '#06D6A0');

      // Show Ringing state
      screenContent.className = 'phone-screen-calling';
      screenContent.innerHTML = `<span class="phone-ring-icon">📱</span><span class="phone-call-text">${lang === 'fr' ? 'Ça sonne...' : 'Ring, ring...'}</span>`;

      this.safeTimeout(() => {
        if (!this.isCalling) return;
        if (contactId === 'mama' || contactId === 'dada') {
          const isMama = contactId === 'mama';
          const title = isMama ? (lang === 'fr' ? 'Maman !' : 'Mama!') : (lang === 'fr' ? 'Papa !' : 'Dada!');
          const fallback = isMama
            ? (lang === 'fr' ? 'Coucou Valeria ! Maman t aime !' : 'Hi Valeria! Mama loves you!')
            : (lang === 'fr' ? 'Coucou Valeria ! Papa t aime !' : 'Hi Valeria! Dada loves you!');
          screenContent.className = 'phone-screen-active pop-bounce';
          screenContent.innerHTML = `<span class="phone-caller-emoji">${isMama ? '👩💖' : '👨💖'}</span><span class="phone-call-text">${title}</span>`;
          this.speech.speakForKey(contactId, fallback);
          if (!appPrefs.get().bedtimeMode) {
            confetti({ particleCount: 28, spread: 55, origin: { y: 0.35 } });
          }
        } else {
          const animal = ANIMAL_FRIENDS.find(a => a.id === contactId) || ANIMAL_FRIENDS[1];
          screenContent.className = 'phone-screen-active pop-bounce';
          screenContent.innerHTML = `<div class="phone-caller-svg">${getAnimalSvg(animal.id)}</div><span class="phone-call-text">${t(animal.label, lang)}: ${t(animal.soundWord, lang)}</span>`;
          this.playEffect(animal.sfx, 0.92);
          this.safeTimeout(() => {
            if (this.isCalling) {
              this.speech.speakForKey(animal.id, `${lang === 'fr' ? 'Allô !' : 'Hello!'} ${t(animal.spoken, lang)}`);
            }
          }, 550);
        }
      }, 720);
    };

    // Number keys 0-9
    this.stageEl.querySelectorAll('.phone-key-btn[data-digit]').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const digit = parseInt(btn.getAttribute('data-digit') || '0', 10);
        this.dialed = (this.dialed + digit).slice(-5);
        this.engine.playPhoneTone(digit);
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 8, '#FFD166');
        const word = appPrefs.get().language === 'fr' ? this.numWordsFr[digit] : this.numWordsEn[digit];
        this.speech.speak(word);
        showIdle();
      });
    });

    // Quick contacts
    this.stageEl.querySelectorAll('.phone-contact-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const cid = btn.getAttribute('data-contact') || 'dog';
        startCall(cid, pe.clientX, pe.clientY);
      });
    });

    // Green Call Button -> Calls a random smiling animal!
    this.stageEl.querySelector('#phone-btn-call')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const pe = e as PointerEvent;
      const pool = ['mama', 'dada', 'dog', 'cat', 'cow', 'duck'];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      startCall(pick, pe.clientX, pe.clientY);
    });

    // Red Hang Up Button
    this.stageEl.querySelector('#phone-btn-end')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.dialed = '';
      this.speech.stop();
      this.playEffect('boing.mp3', 0.6, 0.85);
      showIdle();
    });
  }
}

// ============================================================================
// ARCADE 3: BABY DRUM KIT & PIANO ROOM
// ============================================================================
export class DrumPianoRoomGame extends BaseGameScene {
  public readonly id = 'drum_piano';
  public readonly title = 'Drums & Baby Piano';
  public readonly subtitle = 'Bang Drums & Play Piano!';
  public readonly icon = '🥁';
  public readonly themeColor = '#FF9F1C';
  public readonly songFile = 'songs/abc_song.mp3';
  public readonly songLabel = 'Music Room Jam';

  private roomMode: 'drums' | 'piano' = 'drums';

  private readonly pianoKeys = [
    { note: 'C4', label: 'Do', color: '#FF595E' },
    { note: 'D4', label: 'Re', color: '#FF924C' },
    { note: 'E4', label: 'Mi', color: '#FFCA3A' },
    { note: 'G4', label: 'Sol', color: '#52B788' },
    { note: 'A4', label: 'La', color: '#1982C4' },
    { note: 'C5', label: 'Do', color: '#7209B7' },
    { note: 'D5', label: 'Re', color: '#F72585' },
  ];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return this.pianoKeys.map(k => `piano_${k.note}.mp3`);
  }

  protected onActivate(): void {
    // Keep music off initially so baby hears pure drum hits & piano notes (can toggle play anytime!)
    this.stopThemeSong();
  }

  protected renderStageHtml(): string {
    return `
      <div class="arc-mode-bar">
        <button class="arc-mode-btn active" data-room="drums">🥁 DRUM KIT</button>
        <button class="arc-mode-btn" data-room="piano">🎹 BABY PIANO</button>
      </div>
      <div class="music-room-stage" id="music-room-stage"></div>
    `;
  }

  protected bindStageEvents(): void {
    this.stageEl.querySelectorAll('.arc-mode-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.roomMode = btn.getAttribute('data-room') === 'piano' ? 'piano' : 'drums';
        this.stageEl.querySelectorAll('.arc-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
        this.renderRoom();
      });
    });
    this.renderRoom();
  }

  private renderRoom(): void {
    const stage = this.stageEl.querySelector('#music-room-stage') as HTMLElement;
    if (this.roomMode === 'drums') {
      stage.innerHTML = `
        <div class="drum-kit-grid">
          <button class="drum-pad pad-cymbal" data-drum="cymbal" style="--pad-bg:#FFCA3A">
            <span class="drum-emoji">✨</span>
            <strong>CYMBAL</strong>
          </button>
          <button class="drum-pad pad-snare" data-drum="snare" style="--pad-bg:#4CC9F0">
            <span class="drum-emoji">⚡</span>
            <strong>SNARE</strong>
          </button>
          <button class="drum-pad pad-bongo" data-drum="bongo" style="--pad-bg:#52B788">
            <span class="drum-emoji">🪘</span>
            <strong>BONGO</strong>
          </button>
          <button class="drum-pad pad-kick" data-drum="kick" style="--pad-bg:#FF595E">
            <span class="drum-emoji">🥁</span>
            <strong>BOOM KICK</strong>
          </button>
        </div>
      `;

      stage.querySelectorAll('.drum-pad').forEach(pad => {
        pad.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          const pe = e as PointerEvent;
          const drum = (pad.getAttribute('data-drum') || 'kick') as 'kick' | 'snare' | 'bongo' | 'cymbal';
          this.engine.playDrumHit(drum);
          pad.classList.remove('pop-bounce');
          void (pad as HTMLElement).offsetWidth;
          pad.classList.add('pop-bounce');
          const colors: Record<string, string> = { kick: '#FF595E', snare: '#4CC9F0', bongo: '#52B788', cymbal: '#FFCA3A' };
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 16, colors[drum]);
        });
      });
    } else {
      stage.innerHTML = `
        <div class="baby-piano-frame">
          <div class="piano-top-speaker">🎹 🎶 🎹</div>
          <div class="baby-piano-keys">
            ${this.pianoKeys.map(k => `
              <button class="baby-piano-key" data-note="${k.note}" style="--key-color:${k.color}">
                <span class="piano-key-note">${k.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      stage.querySelectorAll('.baby-piano-key').forEach(key => {
        key.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          const pe = e as PointerEvent;
          const note = key.getAttribute('data-note') || 'C4';
          const meta = this.pianoKeys.find(k => k.note === note);
          this.engine.playInstrumentNote('piano', note, { volume: 0.95 });
          key.classList.add('pressed');
          this.safeTimeout(() => key.classList.remove('pressed'), 180);
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 12, meta?.color || '#FFD166');
        });
      });
    }
  }
}

// ============================================================================
// ARCADE 4: MULTI-TOUCH FIREWORKS SHOW (Tap & Drag Glowing Night Sky)
// ============================================================================
interface FwSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export class FireworksShowGame extends BaseGameScene {
  public readonly id = 'fireworks_show';
  public readonly title = 'Fireworks Show';
  public readonly subtitle = 'Tap & Drag Night Sky!';
  public readonly icon = '🎆';
  public readonly themeColor = '#7209B7';
  public readonly songFile = 'songs/brahms_lullaby.mp3';
  public readonly songLabel = 'Starry Night Music';

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private sparks: FwSpark[] = [];
  private rafId = 0;
  private resizeFn: (() => void) | null = null;
  private lastDragBurst = 0;
  private readonly colors = ['#FF595E', '#FFCA3A', '#4CC9F0', '#06D6A0', '#FF6B8B', '#C77DFF', '#FFFFFF'];
  private readonly chimes = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    super(container, bursts);
    this.initScene();
  }

  protected getPreloadAssets(): string[] {
    return this.chimes.map(n => `glock_${n}.mp3`);
  }

  protected renderStageHtml(): string {
    return `
      <div class="fireworks-wrap">
        <canvas class="fireworks-canvas" id="fireworks-canvas"></canvas>
        <div class="fireworks-hint" id="fireworks-hint">🎆 TAP OR DRAG FOR FIREWORKS!</div>
      </div>
    `;
  }

  protected bindStageEvents(): void {
    this.canvas = this.stageEl.querySelector('#fireworks-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    const hint = this.stageEl.querySelector('#fireworks-hint') as HTMLElement;

    const launchAt = (clientX: number, clientY: number, loud: boolean) => {
      if (hint) hint.style.opacity = '0';
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      this.spawnFirework(x, y);
      if (loud) {
        this.engine.playFireworkBurst();
      }
      const note = this.chimes[Math.floor(Math.random() * this.chimes.length)];
      this.engine.playGlockNote(note, { volume: 0.7 });
      this.ensureLoop();
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      launchAt(e.clientX, e.clientY, true);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (e.buttons === 0 && e.pressure === 0) return;
      const now = Date.now();
      if (now - this.lastDragBurst > 160) {
        this.lastDragBurst = now;
        launchAt(e.clientX, e.clientY, false);
      }
    });
  }

  protected onActivate(): void {
    const resize = () => {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.max(1, rect.width * dpr);
      this.canvas.height = Math.max(1, rect.height * dpr);
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    };
    resize();
    this.resizeFn = resize;
    window.addEventListener('resize', resize);

    // Launch one welcoming firework burst!
    this.safeTimeout(() => {
      const rect = this.canvas.getBoundingClientRect();
      this.spawnFirework(rect.width * 0.5, rect.height * 0.42);
      this.ensureLoop();
    }, 300);
  }

  protected onDeactivate(): void {
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.sparks = [];
    if (this.resizeFn) {
      window.removeEventListener('resize', this.resizeFn);
      this.resizeFn = null;
    }
  }

  private spawnFirework(x: number, y: number): void {
    const baseColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    const accentColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    const count = 28;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
      const speed = 2.2 + Math.random() * 5.2;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 3 === 0 ? accentColor : baseColor,
        size: 3.5 + Math.random() * 4.5,
        life: 0,
        maxLife: 38 + Math.floor(Math.random() * 20),
      });
    }
    // Cap total sparks for rock-solid 60 FPS on iPhone
    if (this.sparks.length > 220) {
      this.sparks.splice(0, this.sparks.length - 220);
    }
  }

  private ensureLoop(): void {
    if (this.rafId) return;
    const tick = () => {
      if (!this.isActive) {
        this.rafId = 0;
        return;
      }
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.fillStyle = 'rgba(11, 8, 38, 0.22)';
      this.ctx.fillRect(0, 0, rect.width, rect.height);

      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy = s.vy * 0.96 + 0.08;

        if (s.life >= s.maxLife) {
          this.sparks.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, 1 - s.life / s.maxLife);
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = s.color;
        this.ctx.shadowColor = s.color;
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.size * alpha + 1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      if (this.sparks.length > 0) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        this.rafId = 0;
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }
}
