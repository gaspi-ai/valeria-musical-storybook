/**
 * main.ts
 * Mobile-First Interactive Musical Storybook Application Entry Point.
 * Designed for Toddlers Aged 11 to 24 Months.
 * Inspired by Duck Duck Moose ("Wheels on the Bus" & "Musical Me").
 */

import './style.css';
import { AudioEngine } from './audio/AudioEngine';
import type { InstrumentType } from './audio/AudioEngine';
import { TouchBurstManager } from './components/TouchBurstManager';
import { ParentGate } from './components/ParentGate';
import { IntroScreen } from './components/IntroScreen';
import { SceneManager } from './scenes/SceneManager';
import {
  WheelsBusGame,
  OldMacDonaldGame,
  ItsyBitsyGame,
  TwinkleStarGame,
  RowBoatGame,
  RainbowXylophoneGame,
} from './games/GameScenes';
import { SongsJukebox } from './components/SongsJukebox';
import { LearningStudio } from './components/LearningStudio';
import { StorybookShelf } from './components/StorybookShelf';
import { SleepyTimer } from './components/SleepyTimer';
import { appPrefs } from './state/AppPreferences';

class ToddlerStorybookApp {
  private appRoot: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;
  private sceneManager: SceneManager;

  private wheelsScene: WheelsBusGame;
  private musicalMeScene: RainbowXylophoneGame;
  private oldMacDonaldScene: OldMacDonaldGame;
  private itsyBitsyScene: ItsyBitsyGame;
  private twinkleStarScene: TwinkleStarGame;
  private rowBoatScene: RowBoatGame;

  private songsJukebox: SongsJukebox;
  private learningStudio: LearningStudio;
  private storybookShelf: StorybookShelf;
  private sleepyTimer: SleepyTimer;
  private floatingJukeboxBtn!: HTMLElement;
  private floatingLearnBtn!: HTMLElement;
  private floatingShelfBtn!: HTMLElement;
  private parentGate: ParentGate;

  constructor() {
    this.appRoot = document.getElementById('app') as HTMLElement;
    this.engine = AudioEngine.getInstance();
    this.sceneManager = SceneManager.getInstance();

    // 1. High-Performance Multi-Touch Burst Particle Canvas
    this.bursts = new TouchBurstManager(this.appRoot);

    // 2. Hardware Touch Lockout & Global Multi-Touch Slap Handler
    this.setupHardwareLockout();

    // 3. Initialize All 6 Rebuilt Flagship Musical Games (Studio Audio Discipline: Zero Noisy Loops!)
    this.wheelsScene = new WheelsBusGame(this.appRoot, this.bursts);
    this.oldMacDonaldScene = new OldMacDonaldGame(this.appRoot, this.bursts);
    this.itsyBitsyScene = new ItsyBitsyGame(this.appRoot, this.bursts);
    this.twinkleStarScene = new TwinkleStarGame(this.appRoot, this.bursts);
    this.rowBoatScene = new RowBoatGame(this.appRoot, this.bursts);
    this.musicalMeScene = new RainbowXylophoneGame(this.appRoot, this.bursts);

    // Register with SceneManager
    this.sceneManager.registerScene(this.wheelsScene);
    this.sceneManager.registerScene(this.oldMacDonaldScene);
    this.sceneManager.registerScene(this.itsyBitsyScene);
    this.sceneManager.registerScene(this.twinkleStarScene);
    this.sceneManager.registerScene(this.rowBoatScene);
    this.sceneManager.registerScene(this.musicalMeScene);

    // 4. Dedicated Songs Jukebox & Little Learner Studio (EN / FR)
    this.songsJukebox = new SongsJukebox(this.appRoot, () => {
      this.handleExitJukebox();
    });
    this.learningStudio = new LearningStudio(this.appRoot, this.bursts, () => {
      this.handleExitLearningStudio();
    });
    this.createFloatingJukeboxButton();
    this.createFloatingLearnButton();
    this.createFloatingShelfButton();

    // 4b. Visual Storybook Home Shelf & Gentle Sleepy Bye-Bye Timer
    this.storybookShelf = new StorybookShelf(this.appRoot, this.sceneManager.getScenes(), {
      onSelectScene: (sceneId) => this.switchScene(sceneId),
      onOpenLearning: () => this.openLearningStudio(),
      onOpenJukebox: () => this.openJukebox()
    });

    this.sleepyTimer = new SleepyTimer(this.appRoot, {
      onSleepStart: () => {
        this.songsJukebox.closeJukebox();
        this.learningStudio.closeStudio();
        this.storybookShelf.close();
        this.sceneManager.deactivateActiveScene();
        this.engine.stopAllAudio();
      },
      onWakeUp: () => {
        this.sceneManager.activateActiveScene();
      }
    });

    // 5. Subtle 3-Second Hold / 2-Finger Parent Gate & Settings Modal
    this.parentGate = new ParentGate(this.appRoot, {
      onSceneChange: (sceneId) => {
        this.switchScene(sceneId);
      },
      onAudioModeChange: (mode) => this.setAudioMode(mode),
      onInstrumentChange: (inst) => this.setInstrument(inst),
      onInfantLockChange: (locked) => this.handleInfantLockChange(locked),
      onBedtimeModeChange: (enabled) => this.applyBedtimeMode(enabled),
      onSessionTimerChange: (mins) => this.sleepyTimer.setMinutes(mins),
      onOpenJukebox: () => this.openJukebox(),
      onOpenLearning: () => this.openLearningStudio()
    });

    this.sleepyTimer.subscribe((remainingSec) => {
      this.parentGate.updateTimerBadge(remainingSec);
    });

    // Apply persisted calm/bedtime visual mode immediately
    this.applyBedtimeMode(appPrefs.get().bedtimeMode);

    // Apply persisted instrument preference
    this.musicalMeScene.setInstrument(appPrefs.get().instrument);

    // Sync SceneManager events back to Parent Gate & Preferences
    this.sceneManager.onSceneChange((sceneId) => {
      this.parentGate.setScene(sceneId);
      appPrefs.update({ lastScene: sceneId });
    });

    // 6. Graceful "Tap to Play" Audio Unlock Screen (Audio preloads lazily per scene after unlock)
    new IntroScreen(this.appRoot, this.bursts, () => {
      this.startApp();
    });
  }

  /**
   * Starts the initial scene once audio is unlocked.
   */
  private async startApp(): Promise<void> {
    const prefs = appPrefs.get();
    this.engine.setMasterVolume(prefs.masterVolume);
    const validIds = new Set(this.sceneManager.getScenes().map(s => s.id));
    const initialScene = validIds.has(prefs.lastScene) ? prefs.lastScene : 'wheels';
    await this.sceneManager.switchScene(initialScene);

    // Restore infant lock state if previously active
    if (prefs.infantLock) {
      this.parentGate.toggleInfantLock();
    }
  }

  private applyBedtimeMode(enabled: boolean): void {
    document.body.classList.toggle('bedtime-mode', enabled);
    this.engine.setBedtimeMode(enabled);
  }

  private handleInfantLockChange(locked: boolean): void {
    // Hide exposed floating SONGS, LEARN & SHELF buttons while Infant Lock is active
    const displayVal = locked ? 'none' : 'flex';
    if (this.floatingJukeboxBtn) {
      this.floatingJukeboxBtn.style.display = displayVal;
    }
    if (this.floatingLearnBtn) {
      this.floatingLearnBtn.style.display = displayVal;
    }
    if (this.floatingShelfBtn) {
      this.floatingShelfBtn.style.display = displayVal;
    }
  }

  /**
   * Seamlessly switches between any of the 6 rebuilt musical games.
   */
  public async switchScene(sceneId: string): Promise<void> {
    this.engine.stopAllAudio();
    await this.sceneManager.switchScene(sceneId);
  }

  /**
   * Changes Audio Mode between Studio Song (music on) and Free Play (music off).
   */
  public setAudioMode(mode: 'song' | 'ensemble' | 'free'): void {
    if (mode === 'free') {
      this.engine.stopVocalTrack();
      this.engine.pauseSongTrack();
    } else {
      this.sceneManager.activateActiveScene();
    }
  }

  public setInstrument(inst: InstrumentType): void {
    this.musicalMeScene.setInstrument(inst);
  }

  /**
   * Floating "🎶 SONGS" button on main screen to quickly jump to Jukebox.
   */
  private createFloatingJukeboxButton(): void {
    this.floatingJukeboxBtn = document.createElement('button');
    this.floatingJukeboxBtn.className = 'floating-jukebox-btn';
    this.floatingJukeboxBtn.setAttribute('aria-label', 'Open Toddler Songs Jukebox');
    this.floatingJukeboxBtn.innerHTML = `
      <span class="btn-note-icon">🎶</span>
      <span class="btn-text">SONGS</span>
    `;
    this.floatingJukeboxBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openJukebox();
    });
    this.appRoot.appendChild(this.floatingJukeboxBtn);
  }

  /**
   * Floating "🎓 LEARN" button on main screen to open the 1-Year-Old Bilingual Learning Studio.
   */
  private createFloatingLearnButton(): void {
    this.floatingLearnBtn = document.createElement('button');
    this.floatingLearnBtn.className = 'floating-learn-btn';
    this.floatingLearnBtn.setAttribute('aria-label', 'Open Little Learner Studio');
    this.floatingLearnBtn.innerHTML = `
      <span class="btn-note-icon">🎓</span>
      <span class="btn-text">LEARN</span>
    `;
    this.floatingLearnBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openLearningStudio();
    });
    this.appRoot.appendChild(this.floatingLearnBtn);
  }

  /**
   * Floating "📚" button to open the visual Storybook Home Shelf.
   */
  private createFloatingShelfButton(): void {
    this.floatingShelfBtn = document.createElement('button');
    this.floatingShelfBtn.className = 'floating-shelf-btn';
    this.floatingShelfBtn.setAttribute('aria-label', 'Open Storybook Shelf');
    this.floatingShelfBtn.innerHTML = `<span>📚</span>`;
    this.floatingShelfBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.storybookShelf.open();
    });
    this.appRoot.appendChild(this.floatingShelfBtn);
  }

  /**
   * Opens the Songs Jukebox and stops storybook scene audio and animations.
   */
  public openJukebox(): void {
    this.learningStudio.closeStudio();
    this.storybookShelf.close();
    this.sceneManager.deactivateActiveScene();
    this.engine.stopAllAudio();
    this.floatingJukeboxBtn.style.display = 'none';
    this.floatingLearnBtn.style.display = 'none';
    this.floatingShelfBtn.style.display = 'none';
    this.songsJukebox.openJukebox();
  }

  private handleExitJukebox(): void {
    const showFloating = appPrefs.get().infantLock ? 'none' : 'flex';
    this.floatingJukeboxBtn.style.display = showFloating;
    this.floatingLearnBtn.style.display = showFloating;
    this.floatingShelfBtn.style.display = showFloating;
    this.engine.stopAllAudio();
    this.sceneManager.activateActiveScene();
  }

  public openLearningStudio(): void {
    this.songsJukebox.closeJukebox();
    this.storybookShelf.close();
    this.sceneManager.deactivateActiveScene();
    this.engine.stopAllAudio();
    this.floatingJukeboxBtn.style.display = 'none';
    this.floatingLearnBtn.style.display = 'none';
    this.floatingShelfBtn.style.display = 'none';
    this.learningStudio.openStudio();
  }

  private handleExitLearningStudio(): void {
    const showFloating = appPrefs.get().infantLock ? 'none' : 'flex';
    this.floatingJukeboxBtn.style.display = showFloating;
    this.floatingLearnBtn.style.display = showFloating;
    this.floatingShelfBtn.style.display = showFloating;
    this.engine.stopAllAudio();
    this.sceneManager.activateActiveScene();
  }

  /**
   * Hardware Lockout: Prevents pinch-zoom, pull-refresh, context menu, text selection.
   * Gracefully permits touch scrolling inside the parent settings modal and Jukebox.
   */
  private setupHardwareLockout(): void {
    // Prevent right-click context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });

    // Helper to check if any settings, guide modal, Jukebox, Learning Studio, or Shelf is open
    const isInteractiveOverlayOpen = (): boolean => {
      const activeModal = document.querySelector('.parent-modal-overlay:not([style*="display: none"])');
      const activeJukebox = document.querySelector('.toddler-jukebox-container:not([style*="display: none"])');
      const activeLearning = document.querySelector('.learning-studio-container:not([style*="display: none"])');
      const activeShelf = document.querySelector('.storybook-shelf-overlay:not([style*="display: none"])');
      return !!activeModal || !!activeJukebox || !!activeLearning || !!activeShelf;
    };

    // Prevent multi-touch browser zooming (pinch-to-zoom) outside modal & overlays
    window.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement | null;
      if (isInteractiveOverlayOpen() || (target && target.closest('.parent-modal-overlay, .guide-overlay, .parent-modal-card, .parent-controls-wrap, .floating-jukebox-btn, .floating-learn-btn, .floating-shelf-btn, .toddler-jukebox-container, .learning-studio-container, .storybook-shelf-overlay, .sleepy-byebye-overlay'))) {
        return;
      }
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      const target = e.target as HTMLElement | null;
      if (isInteractiveOverlayOpen() || (target && target.closest('.parent-modal-overlay, .guide-overlay, .parent-modal-card, .parent-controls-wrap, .toddler-jukebox-container, .jukebox-grid-view, .learning-studio-container, .learning-hub-view, .storybook-shelf-overlay, .shelf-sheet'))) {
        return;
      }
      e.preventDefault();
    }, { passive: false });

    // Global multi-touch burst reaction: Any tap or slap anywhere spawns sparkles!
    window.addEventListener('pointerdown', (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.parent-modal-card, .parent-modal-overlay, .parent-controls-wrap, .floating-jukebox-btn, .floating-learn-btn, .floating-shelf-btn, .toddler-jukebox-container, .learning-studio-container, .storybook-shelf-overlay, .sleepy-byebye-overlay')) {
        return;
      }
      // Sparkle if tapping empty scene background
      if (target && (target.tagName === 'CANVAS' || target.id === 'app' || target.classList.contains('storybook-scene'))) {
        this.bursts.spawnBurst(e.clientX, e.clientY, 8, '#FFD166');
      }
    });
  }
}

// Bootstrap application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new ToddlerStorybookApp();
});

// Register offline-first Service Worker for iPhone/iPad PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Ignore SW registration failure on unsupported/insecure contexts
    });
  });
}
