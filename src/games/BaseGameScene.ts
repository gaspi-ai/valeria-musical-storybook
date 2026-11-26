/**
 * BaseGameScene.ts
 * Clean, leak-proof base class for all rebuilt Musical Storybook Games.
 *
 * Studio Audio Discipline:
 * - Zero noisy synthetic background loops or overlapping grooves.
 * - Each game owns ONE accurate studio nursery rhyme MP3 (`songFile`).
 * - Interactive toy taps smoothly duck the song via `playEffect()` so every
 *   animal sound, horn, or chime sounds crystal clear and musical.
 */

import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import { SpeechHelper } from '../learning/SpeechHelper';
import { appPrefs } from '../state/AppPreferences';
import type { StorybookScene } from '../scenes/SceneManager';

export abstract class BaseGameScene implements StorybookScene {
  public abstract readonly id: string;
  public abstract readonly title: string;
  public abstract readonly subtitle: string;
  public abstract readonly icon: string;
  public abstract readonly themeColor: string;
  public abstract readonly songFile: string;
  public abstract readonly songLabel: string;
  protected readonly autoStartMusic: boolean = true;

  protected container: HTMLElement;
  protected bursts: TouchBurstManager;
  protected engine: AudioEngine;
  protected speech: SpeechHelper;

  public element!: HTMLElement;
  protected stageEl!: HTMLElement;
  protected musicBtnEl!: HTMLButtonElement;

  protected isActive: boolean = false;
  protected isMusicOn: boolean = false;
  private timeouts: Set<number> = new Set();

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    this.container = container;
    this.bursts = bursts;
    this.engine = AudioEngine.getInstance();
    this.speech = SpeechHelper.getInstance();
  }

  protected initScene(): void {
    this.element = document.createElement('div');
    this.element.className = `storybook-scene pro-game-scene game-${this.id}`;
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <div class="pro-game-stage" id="stage-${this.id}">
        ${this.renderStageHtml()}
      </div>

      <div class="pro-game-music-bar">
        <button class="pro-music-toggle-btn" id="music-btn-${this.id}" aria-label="Play or Pause ${this.songLabel}">
          <span class="music-btn-icon">🎵</span>
          <span class="music-btn-label">${this.songLabel}</span>
          <span class="music-btn-state">▶</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.element);
    this.stageEl = this.element.querySelector(`#stage-${this.id}`) as HTMLElement;
    this.musicBtnEl = this.element.querySelector(`#music-btn-${this.id}`) as HTMLButtonElement;

    this.musicBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleThemeSong();
    });

    // Keep music button UI 100% synced whenever AudioEngine stops music (e.g. opening Shelf or Menu)
    this.engine.onVocalStop(() => {
      if (this.isMusicOn) {
        this.isMusicOn = false;
        this.updateMusicButton();
      }
    });

    // Live-update localized labels when EN/FR language toggles
    appPrefs.subscribe(() => {
      if (this.isActive) {
        this.onLanguageChange();
      }
    });

    this.bindStageEvents();
  }

  protected abstract renderStageHtml(): string;
  protected abstract bindStageEvents(): void;
  protected getPreloadAssets(): string[] {
    return [];
  }
  protected onActivate(): void {}
  protected onDeactivate(): void {}
  protected onLanguageChange(): void {}

  protected safeTimeout(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.timeouts.delete(id);
      if (this.isActive) fn();
    }, ms);
    this.timeouts.add(id);
    return id;
  }

  protected clearTimeouts(): void {
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
  }

  /**
   * Plays a crisp SFX while smoothly ducking the background song so nothing clashes.
   */
  protected playEffect(sfx: string, volume: number = 0.88, pitch: number = 1.0): void {
    if (this.isMusicOn) {
      this.engine.duckMusic(1000);
    }
    this.engine.playSound(sfx, { volume, pitch });
  }

  public async startThemeSong(): Promise<void> {
    if (!this.isActive) return;
    this.isMusicOn = true;
    this.updateMusicButton();
    const ok = await this.engine.playVocalTrack(this.songFile, () => {
      this.isMusicOn = false;
      this.updateMusicButton();
    }, true);
    if (!ok) {
      this.isMusicOn = false;
      this.updateMusicButton();
    }
  }

  public stopThemeSong(): void {
    this.isMusicOn = false;
    this.engine.stopVocalTrack();
    this.updateMusicButton();
  }

  public async toggleThemeSong(): Promise<void> {
    if (this.isMusicOn) {
      this.stopThemeSong();
    } else {
      await this.startThemeSong();
    }
  }

  private updateMusicButton(): void {
    if (!this.musicBtnEl) return;
    this.musicBtnEl.classList.toggle('playing', this.isMusicOn);
    const stateEl = this.musicBtnEl.querySelector('.music-btn-state');
    if (stateEl) stateEl.textContent = this.isMusicOn ? '⏸' : '▶';
  }

  public activate(): void {
    this.isActive = true;
    this.element.style.display = 'flex';
    this.updateMusicButton();
    // Lazy-load only this scene's crisp SFX
    for (const asset of this.getPreloadAssets()) {
      this.engine.loadBuffer(asset).catch(() => {});
    }
    this.onActivate();
    // Auto-start theme song ONLY for games that want it and when not in Free Play (SFX-only) mode
    if (this.autoStartMusic && appPrefs.get().audioMode !== 'free') {
      this.startThemeSong();
    } else {
      this.isMusicOn = false;
      this.updateMusicButton();
    }
  }

  public deactivate(): void {
    this.isActive = false;
    this.clearTimeouts();
    this.stopThemeSong();
    this.speech.stop();
    this.onDeactivate();
    this.element.style.display = 'none';
  }
}
