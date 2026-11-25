/**
 * SongsTheater.ts
 * Brand-new, rebuilt-from-scratch Interactive Songs Theater for Valeria's Musical Storybook.
 *
 * Features:
 * - Zero noisy failover loops — 100% routed through AudioEngine's Master Compressor & Volume.
 * - Rich interactive SVG animations & click/tap reactions inside every single song.
 * - Smooth beat-synced stage bounce, Play/Pause, Next Song, and EN/FR language support.
 * - Discreet 2-second hold / double-tap exit so 1-year-olds stay safely inside the theater.
 */

import confetti from 'canvas-confetti';
import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import { SpeechHelper } from '../learning/SpeechHelper';
import { getAnimalSvg, getWordSvg } from '../learning/LessonArt';
import { appPrefs, type AppLanguage } from '../state/AppPreferences';
import { t } from '../learning/curriculum';
import { THEATER_SONGS, type TheaterSong, type TheaterSongId } from './SongCatalog';

export class SongsTheater {
  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;
  private speech: SpeechHelper;
  private onBackToStorybook: () => void;

  private element!: HTMLElement;
  private hubEl!: HTMLElement;
  private stageEl!: HTMLElement;
  private stageCanvasEl!: HTMLElement;
  private titleBadgeEl!: HTMLElement;
  private playBtnEl!: HTMLButtonElement;

  // Discreet Exit
  private exitBtn!: HTMLElement;
  private exitRing!: SVGCircleElement;
  private holdStart = 0;
  private holdRaf = 0;
  private lastTap = 0;

  // State
  private isOpen = false;
  private activeSong: TheaterSong | null = null;
  private isPlaying = false;
  private beatInterval: number | null = null;
  private timeouts: Set<number> = new Set();

  // ABC block rotation offset
  private abcOffset = 0;

  constructor(
    container: HTMLElement,
    bursts: TouchBurstManager,
    onBackToStorybook: () => void
  ) {
    this.container = container;
    this.bursts = bursts;
    this.engine = AudioEngine.getInstance();
    this.speech = SpeechHelper.getInstance();
    this.onBackToStorybook = onBackToStorybook;

    this.renderShell();
    this.bindShellEvents();

    appPrefs.subscribe(() => {
      if (!this.isOpen) return;
      this.renderHubCards();
      if (this.activeSong) {
        this.titleBadgeEl.textContent = `${this.activeSong.icon} ${t(this.activeSong.title, this.lang)}`;
      }
    });
  }

  private get lang(): AppLanguage {
    return appPrefs.get().language;
  }

  private safeTimeout(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.timeouts.delete(id);
      if (this.isOpen) fn();
    }, ms);
    this.timeouts.add(id);
    return id;
  }

  private clearTimers(): void {
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
    if (this.beatInterval !== null) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
  }

  private renderShell(): void {
    this.element = document.createElement('div');
    this.element.className = 'songs-theater-container';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- 1. SONG SELECTION HUB -->
      <div class="songs-hub-view" id="songs-hub-view">
        <header class="songs-hub-header">
          <button class="songs-back-btn" id="btn-songs-back">
            <span>⬅️</span>
            <span id="songs-back-text">STORYBOOK</span>
          </button>
          <div class="songs-hub-heading">
            <h1 id="songs-hub-title">🎶 Musical Songs Theater</h1>
            <p id="songs-hub-sub">Tap any song to dance, tap & play!</p>
          </div>
        </header>

        <div class="songs-hub-grid" id="songs-hub-grid"></div>
      </div>

      <!-- 2. FULLSCREEN INTERACTIVE SONG STAGE -->
      <div class="songs-stage-view" id="songs-stage-view" style="display: none;">
        <div class="songs-stage-topbar">
          <div class="songs-title-badge" id="songs-title-badge">🎶 Song</div>

          <div class="songs-exit-wrap">
            <div class="songs-exit-btn" id="songs-exit-btn" role="button" aria-label="Hold 2s or double-tap to exit song">
              <svg class="songs-exit-svg" viewBox="0 0 44 44">
                <circle class="songs-exit-bg" cx="22" cy="22" r="18" />
                <circle class="songs-exit-ring" cx="22" cy="22" r="18" />
              </svg>
              <div class="songs-exit-inner">
                <span>✕</span>
                <small>HOLD</small>
              </div>
            </div>
          </div>
        </div>

        <div class="songs-stage-canvas" id="songs-stage-canvas"></div>

        <div class="songs-stage-controls">
          <button class="songs-ctrl-btn" id="songs-play-btn" aria-label="Play or Pause">⏸ Pause</button>
          <button class="songs-ctrl-btn songs-next-btn" id="songs-next-btn" aria-label="Next Song">Next Song ⏭</button>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    this.hubEl = this.element.querySelector('#songs-hub-view') as HTMLElement;
    this.stageEl = this.element.querySelector('#songs-stage-view') as HTMLElement;
    this.stageCanvasEl = this.element.querySelector('#songs-stage-canvas') as HTMLElement;
    this.titleBadgeEl = this.element.querySelector('#songs-title-badge') as HTMLElement;
    this.playBtnEl = this.element.querySelector('#songs-play-btn') as HTMLButtonElement;
    this.exitBtn = this.element.querySelector('#songs-exit-btn') as HTMLElement;
    this.exitRing = this.exitBtn.querySelector('.songs-exit-ring') as SVGCircleElement;

    const circ = 2 * Math.PI * 18;
    this.exitRing.style.strokeDasharray = `${circ}`;
    this.exitRing.style.strokeDashoffset = `${circ}`;

    this.renderHubCards();
  }

  private renderHubCards(): void {
    const isFr = this.lang === 'fr';
    const title = this.element.querySelector('#songs-hub-title');
    const sub = this.element.querySelector('#songs-hub-sub');
    const backTxt = this.element.querySelector('#songs-back-text');
    if (title) title.textContent = isFr ? '🎶 Théâtre Musical' : '🎶 Musical Songs Theater';
    if (sub) sub.textContent = isFr ? 'Touche une chanson pour danser et jouer !' : 'Tap any song to dance, tap & play!';
    if (backTxt) backTxt.textContent = isFr ? 'HISTOIRES' : 'STORYBOOK';

    const grid = this.element.querySelector('#songs-hub-grid') as HTMLElement;
    grid.innerHTML = THEATER_SONGS.map(song => `
      <button class="theater-song-card" data-song-id="${song.id}" style="--card-color:${song.themeColor}; background:${song.bgGradient}">
        <span class="ts-card-icon">${song.icon}</span>
        <strong class="ts-card-title">${t(song.title, this.lang)}</strong>
        <span class="ts-card-sub">${t(song.subtitle, this.lang)}</span>
        <span class="ts-card-pill">▶ PLAY</span>
      </button>
    `).join('');

    grid.querySelectorAll('.theater-song-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const me = e as MouseEvent;
        const id = card.getAttribute('data-song-id') as TheaterSongId;
        if (!id) return;
        card.classList.add('pop-bounce');
        this.engine.playSound('chime.mp3', { volume: 0.75 });
        this.bursts.spawnBurst(me.clientX, me.clientY, 14, '#FFD166');
        this.safeTimeout(() => {
          card.classList.remove('pop-bounce');
          this.openSong(id);
        }, 150);
      });
    });
  }

  private bindShellEvents(): void {
    this.element.querySelector('#btn-songs-back')?.addEventListener('click', () => {
      this.engine.playSound('woodblock.mp3', { volume: 0.7 });
      this.closeTheater();
      this.onBackToStorybook();
    });

    this.playBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePlayPause();
    });

    this.element.querySelector('#songs-next-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.activeSong) return;
      const idx = THEATER_SONGS.findIndex(s => s.id === this.activeSong!.id);
      const next = THEATER_SONGS[(idx + 1) % THEATER_SONGS.length];
      this.openSong(next.id);
    });

    // Tap anywhere on empty stage background for musical sparkles
    this.stageCanvasEl.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      if (pe.target === this.stageCanvasEl && this.activeSong) {
        const notes = ['C5', 'D5', 'E5', 'G5', 'A5'];
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.engine.playGlockNote(note, { volume: 0.55 });
        this.bursts.spawnStarGlow(pe.clientX, pe.clientY, 10, this.activeSong.sparkleColor);
      }
    });

    // Discreet Exit (2s hold or double-tap)
    const circ = 2 * Math.PI * 18;
    const startHold = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - this.lastTap < 380) {
        this.cancelHold();
        this.closeSong();
        return;
      }
      this.lastTap = now;
      this.holdStart = now;

      const tick = () => {
        const pct = Math.min(1, (Date.now() - this.holdStart) / 2000);
        this.exitRing.style.strokeDashoffset = `${circ * (1 - pct)}`;
        if (pct >= 1) {
          this.cancelHold();
          this.closeSong();
        } else {
          this.holdRaf = requestAnimationFrame(tick);
        }
      };
      this.holdRaf = requestAnimationFrame(tick);
    };

    const cancel = () => this.cancelHold();
    this.exitBtn.addEventListener('pointerdown', startHold);
    this.exitBtn.addEventListener('pointerup', cancel);
    this.exitBtn.addEventListener('pointercancel', cancel);
    this.exitBtn.addEventListener('pointerleave', cancel);
  }

  private cancelHold(): void {
    cancelAnimationFrame(this.holdRaf);
    const circ = 2 * Math.PI * 18;
    this.exitRing.style.strokeDashoffset = `${circ}`;
  }

  public openTheater(): void {
    this.isOpen = true;
    this.activeSong = null;
    this.element.style.display = 'block';
    this.hubEl.style.display = 'flex';
    this.stageEl.style.display = 'none';
    this.renderHubCards();
    // Preload crisp interactive stage SFX
    ['chime.mp3', 'boing.mp3', 'laugh.mp3', 'woodblock.mp3', 'sheep.mp3', 'duck.mp3', 'splash.mp3', 'snore.mp3', 'squeak.mp3'].forEach(s => {
      this.engine.loadBuffer(s).catch(() => {});
    });
  }

  public closeTheater(): void {
    this.isOpen = false;
    this.closeSong();
    this.engine.stopAllAudio();
    this.element.style.display = 'none';
  }

  public async openSong(songId: TheaterSongId): Promise<void> {
    const song = THEATER_SONGS.find(s => s.id === songId);
    if (!song) return;

    this.clearTimers();
    this.speech.stop();
    this.activeSong = song;
    this.hubEl.style.display = 'none';
    this.stageEl.style.display = 'flex';
    this.stageEl.style.background = song.bgGradient;
    this.titleBadgeEl.textContent = `${song.icon} ${t(song.title, this.lang)}`;

    this.buildInteractiveStage(song);

    // Start exact studio song via AudioEngine (single channel, compressor + master volume!)
    this.isPlaying = true;
    this.updatePlayBtn();
    await this.engine.playVocalTrack(song.audioFile, undefined, true);
    this.startBeatPulse(song.bpm);
  }

  public closeSong(): void {
    this.clearTimers();
    this.isPlaying = false;
    this.activeSong = null;
    this.engine.stopAllAudio();
    this.speech.stop();
    this.stageCanvasEl.innerHTML = '';
    this.stageEl.style.display = 'none';
    if (this.isOpen) {
      this.hubEl.style.display = 'flex';
    }
  }

  private async togglePlayPause(): Promise<void> {
    if (!this.activeSong) return;
    if (this.isPlaying) {
      this.isPlaying = false;
      this.engine.stopVocalTrack();
      if (this.beatInterval !== null) {
        clearInterval(this.beatInterval);
        this.beatInterval = null;
      }
    } else {
      this.isPlaying = true;
      await this.engine.playVocalTrack(this.activeSong.audioFile, undefined, true);
      this.startBeatPulse(this.activeSong.bpm);
    }
    this.updatePlayBtn();
  }

  private updatePlayBtn(): void {
    this.playBtnEl.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
  }

  private startBeatPulse(bpm: number): void {
    if (this.beatInterval !== null) clearInterval(this.beatInterval);
    const ms = Math.round((60 / bpm) * 1000);
    this.beatInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      const hero = this.stageCanvasEl.querySelector('.beat-hero') as HTMLElement | null;
      if (hero) {
        hero.classList.remove('beat-bob');
        void hero.offsetWidth;
        hero.classList.add('beat-bob');
      }
    }, ms);
  }

  // =========================================================================
  // 6 RICH INTERACTIVE SONG STAGES
  // =========================================================================
  private buildInteractiveStage(song: TheaterSong): void {
    if (song.id === 'happy_clap') {
      this.stageCanvasEl.innerHTML = `
        <div class="ts-stage-happy">
          <div class="ts-sun-top" id="ts-happy-sun">${getWordSvg('sun')}</div>
          <button class="ts-hero-actor beat-hero" id="ts-clap-bear">
            <div class="ts-bear-emoji">🐻</div>
            <div class="ts-clap-hands">👏</div>
            <span class="ts-action-tag">TAP TO CLAP!</span>
          </button>
          <div class="ts-friends-row">
            <button class="ts-mini-actor" data-sfx="boing.mp3" data-label="Hop!">🐸<span>HOP!</span></button>
            <button class="ts-mini-actor" data-sfx="laugh.mp3" data-label="Giggle!">🐰<span>GIGGLE!</span></button>
            <button class="ts-mini-actor" data-sfx="chime.mp3" data-label="Sparkle!">🦋<span>FLY!</span></button>
          </div>
        </div>
      `;

      const bear = this.stageCanvasEl.querySelector('#ts-clap-bear') as HTMLElement;
      bear.addEventListener('pointerdown', (e) => {
        const pe = e as PointerEvent;
        this.engine.duckMusic(700);
        this.engine.playSound('woodblock.mp3', { volume: 0.9, pitch: 1.25 });
        this.safeTimeout(() => this.engine.playSound('woodblock.mp3', { volume: 0.9, pitch: 1.4 }), 150);
        bear.classList.remove('pop-bounce');
        void bear.offsetWidth;
        bear.classList.add('pop-bounce');
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 16, '#FF6B6B');
        if (!appPrefs.get().bedtimeMode) {
          confetti({ particleCount: 22, spread: 55, origin: { y: 0.55 } });
        }
      });

      this.stageCanvasEl.querySelector('#ts-happy-sun')?.addEventListener('pointerdown', (e) => {
        const pe = e as PointerEvent;
        this.engine.playSound('chime.mp3', { volume: 0.85 });
        this.bursts.spawnStarGlow(pe.clientX, pe.clientY, 14, '#FFD166');
      });

      this.stageCanvasEl.querySelectorAll('.ts-mini-actor').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
          const pe = e as PointerEvent;
          const sfx = btn.getAttribute('data-sfx') || 'boing.mp3';
          this.engine.duckMusic(700);
          this.engine.playSound(sfx, { volume: 0.85 });
          btn.classList.remove('pop-bounce');
          void (btn as HTMLElement).offsetWidth;
          btn.classList.add('pop-bounce');
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 12, '#06D6A0');
        });
      });
    } else if (song.id === 'mary_lamb') {
      this.stageCanvasEl.innerHTML = `
        <div class="ts-stage-lamb">
          <button class="ts-lamb-hero beat-hero" id="ts-lamb-btn">
            <div class="ts-lamb-svg-wrap">${getAnimalSvg('sheep')}</div>
            <span class="ts-action-tag">PET THE LAMB! 🐑</span>
          </button>
          <div class="ts-flowers-row">
            ${['C5', 'D5', 'E5', 'G5'].map((n, i) => `
              <button class="ts-bloom-flower" data-note="${n}">
                <span>${['🌸', '🌼', '🌷', '🌺'][i]}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      const lamb = this.stageCanvasEl.querySelector('#ts-lamb-btn') as HTMLElement;
      lamb.addEventListener('pointerdown', (e) => {
        const pe = e as PointerEvent;
        this.engine.duckMusic(900);
        this.engine.playSound('sheep.mp3', { volume: 0.92 });
        lamb.classList.remove('pop-bounce');
        void lamb.offsetWidth;
        lamb.classList.add('pop-bounce');
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 16, '#52B788');
      });

      this.stageCanvasEl.querySelectorAll('.ts-bloom-flower').forEach(fl => {
        fl.addEventListener('pointerdown', (e) => {
          const pe = e as PointerEvent;
          const note = fl.getAttribute('data-note') || 'C5';
          this.engine.playGlockNote(note, { volume: 0.85 });
          fl.classList.remove('pop-bounce');
          void (fl as HTMLElement).offsetWidth;
          fl.classList.add('pop-bounce');
          this.bursts.spawnPollenSparkles(pe.clientX, pe.clientY, 12);
        });
      });
    } else if (song.id === 'abc_blocks') {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const colors = ['#FF595E', '#FF924C', '#FFCA3A', '#52B788', '#1982C4', '#9D4EDD'];
      const notes = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];

      const renderBlocks = () => {
        const slice = Array.from({ length: 6 }, (_, i) => alphabet[(this.abcOffset + i) % alphabet.length]);
        this.stageCanvasEl.innerHTML = `
          <div class="ts-stage-abc">
            <div class="ts-abc-grid beat-hero">
              ${slice.map((letter, idx) => `
                <button class="ts-abc-block" data-letter="${letter}" data-note="${notes[idx]}" style="--block-color:${colors[idx]}">
                  ${letter}
                </button>
              `).join('')}
            </div>
            <button class="ts-abc-more-btn" id="ts-abc-more">MORE LETTERS ➔</button>
          </div>
        `;

        this.stageCanvasEl.querySelectorAll('.ts-abc-block').forEach(blk => {
          blk.addEventListener('pointerdown', (e) => {
            const pe = e as PointerEvent;
            const letter = blk.getAttribute('data-letter') || 'A';
            const note = blk.getAttribute('data-note') || 'C5';
            this.engine.duckMusic(750);
            this.engine.playInstrumentNote('marimba', note, { volume: 0.9 });
            this.speech.speak(letter);
            blk.classList.remove('pop-bounce');
            void (blk as HTMLElement).offsetWidth;
            blk.classList.add('pop-bounce');
            this.bursts.spawnBurst(pe.clientX, pe.clientY, 14, '#FFD166');
          });
        });

        this.stageCanvasEl.querySelector('#ts-abc-more')?.addEventListener('pointerdown', () => {
          this.abcOffset = (this.abcOffset + 6) % alphabet.length;
          this.engine.playSound('chime.mp3', { volume: 0.75 });
          renderBlocks();
        });
      };
      renderBlocks();
    } else if (song.id === 'five_ducks') {
      this.stageCanvasEl.innerHTML = `
        <div class="ts-stage-ducks">
          <div class="ts-ducks-pond beat-hero">
            ${[1, 2, 3, 4, 5].map(num => `
              <button class="ts-duck-toy" data-num="${num}">
                <div class="ts-duck-art">${getAnimalSvg('duck')}</div>
                <span class="ts-duck-num">${num}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      this.stageCanvasEl.querySelectorAll('.ts-duck-toy').forEach(duck => {
        duck.addEventListener('pointerdown', (e) => {
          const pe = e as PointerEvent;
          this.engine.duckMusic(800);
          this.engine.playSound('duck.mp3', { volume: 0.9, pitch: 0.95 + Math.random() * 0.2 });
          this.engine.playSound('splash.mp3', { volume: 0.65 });
          duck.classList.remove('duck-dive');
          void (duck as HTMLElement).offsetWidth;
          duck.classList.add('duck-dive');
          this.bursts.spawnWaterSplash(pe.clientX, pe.clientY, 16);
        });
      });
    } else if (song.id === 'baby_bee') {
      this.stageCanvasEl.innerHTML = `
        <div class="ts-stage-bee">
          <div class="ts-flying-bee beat-hero" id="ts-flying-bee">🐝</div>
          <div class="ts-bee-flowers">
            ${[
              { icon: '🌻', note: 'C5', x: 20, y: 24 },
              { icon: '🌸', note: 'E5', x: 78, y: 24 },
              { icon: '🌺', note: 'G5', x: 22, y: 74 },
              { icon: '🌷', note: 'C6', x: 76, y: 74 },
            ].map(f => `
              <button class="ts-bee-flower" data-note="${f.note}" data-x="${f.x}" data-y="${f.y}" style="left:${f.x}%; top:${f.y}%;">
                ${f.icon}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      const bee = this.stageCanvasEl.querySelector('#ts-flying-bee') as HTMLElement;
      this.stageCanvasEl.querySelectorAll('.ts-bee-flower').forEach(fl => {
        fl.addEventListener('pointerdown', (e) => {
          const pe = e as PointerEvent;
          const x = fl.getAttribute('data-x') || '50';
          const y = fl.getAttribute('data-y') || '50';
          const note = fl.getAttribute('data-note') || 'C5';
          bee.style.left = `${x}%`;
          bee.style.top = `${y}%`;
          this.engine.playGlockNote(note, { volume: 0.85 });
          this.engine.playSound('squeak.mp3', { volume: 0.55, pitch: 1.4 });
          fl.classList.remove('pop-bounce');
          void (fl as HTMLElement).offsetWidth;
          fl.classList.add('pop-bounce');
          this.bursts.spawnPollenSparkles(pe.clientX, pe.clientY, 14);
        });
      });
    } else {
      // Brahms' Lullaby (Rocking Moon & Twinkling Stars)
      this.stageCanvasEl.innerHTML = `
        <div class="ts-stage-lullaby">
          <button class="ts-lullaby-moon beat-hero" id="ts-lullaby-moon">
            ${getWordSvg('moon')}
          </button>
          <div class="ts-lullaby-stars">
            ${[
              { note: 'C5', x: 18, y: 24 },
              { note: 'E5', x: 80, y: 22 },
              { note: 'G5', x: 22, y: 72 },
              { note: 'C6', x: 78, y: 70 },
              { note: 'A5', x: 50, y: 82 },
            ].map(s => `
              <button class="ts-lullaby-star" data-note="${s.note}" style="left:${s.x}%; top:${s.y}%;">⭐</button>
            `).join('')}
          </div>
        </div>
      `;

      const moon = this.stageCanvasEl.querySelector('#ts-lullaby-moon') as HTMLElement;
      moon.addEventListener('pointerdown', (e) => {
        const pe = e as PointerEvent;
        this.engine.playSound('snore.mp3', { volume: 0.65 });
        this.engine.playMusicBoxNote('C5', { volume: 0.7 });
        moon.classList.remove('pop-bounce');
        void moon.offsetWidth;
        moon.classList.add('pop-bounce');
        this.bursts.spawnStarGlow(pe.clientX, pe.clientY, 16, '#FFE066');
      });

      this.stageCanvasEl.querySelectorAll('.ts-lullaby-star').forEach(st => {
        st.addEventListener('pointerdown', (e) => {
          const pe = e as PointerEvent;
          const note = st.getAttribute('data-note') || 'C5';
          this.engine.playMusicBoxNote(note, { volume: 0.85 });
          st.classList.remove('pop-bounce');
          void (st as HTMLElement).offsetWidth;
          st.classList.add('pop-bounce');
          this.bursts.spawnStarGlow(pe.clientX, pe.clientY, 12, '#FFE066');
        });
      });
    }
  }
}
