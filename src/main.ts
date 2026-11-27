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
  MagicBubblePopGame,
  SurpriseEggsGame,
  PeekabooBoxesGame,
} from './games/GameScenes';
import {
  BalloonFruitGame,
  BabyPhoneGame,
  DrumPianoRoomGame,
  FireworksShowGame,
} from './games/ArcadeGames';
import { SongsTheater } from './songs/SongsTheater';
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
  private bubblePopScene: MagicBubblePopGame;
  private surpriseEggsScene: SurpriseEggsGame;
  private peekabooBoxesScene: PeekabooBoxesGame;
  private balloonFruitScene: BalloonFruitGame;
  private babyPhoneScene: BabyPhoneGame;
  private drumPianoScene: DrumPianoRoomGame;
  private fireworksScene: FireworksShowGame;

  private songsTheater: SongsTheater;
  private learningStudio: LearningStudio;
  private storybookShelf: StorybookShelf;
  private sleepyTimer: SleepyTimer;
  private topNavBar!: HTMLElement;
  private parentGate: ParentGate;

  constructor() {
    this.appRoot = document.getElementById('app') as HTMLElement;
    this.engine = AudioEngine.getInstance();
    this.sceneManager = SceneManager.getInstance();

    // 1. High-Performance Multi-Touch Burst Particle Canvas
    this.bursts = new TouchBurstManager(this.appRoot);

    // 2. Hardware Touch Lockout & Global Multi-Touch Slap Handler
    this.setupHardwareLockout();

    // 3. Initialize All 9 Rebuilt Flagship Musical Games (Studio Audio Discipline: Zero Noisy Loops!)
    this.wheelsScene = new WheelsBusGame(this.appRoot, this.bursts);
    this.oldMacDonaldScene = new OldMacDonaldGame(this.appRoot, this.bursts);
    this.itsyBitsyScene = new ItsyBitsyGame(this.appRoot, this.bursts);
    this.twinkleStarScene = new TwinkleStarGame(this.appRoot, this.bursts);
    this.rowBoatScene = new RowBoatGame(this.appRoot, this.bursts);
    this.musicalMeScene = new RainbowXylophoneGame(this.appRoot, this.bursts);
    this.bubblePopScene = new MagicBubblePopGame(this.appRoot, this.bursts);
    this.surpriseEggsScene = new SurpriseEggsGame(this.appRoot, this.bursts);
    this.peekabooBoxesScene = new PeekabooBoxesGame(this.appRoot, this.bursts);
    this.balloonFruitScene = new BalloonFruitGame(this.appRoot, this.bursts);
    this.babyPhoneScene = new BabyPhoneGame(this.appRoot, this.bursts);
    this.drumPianoScene = new DrumPianoRoomGame(this.appRoot, this.bursts);
    this.fireworksScene = new FireworksShowGame(this.appRoot, this.bursts);

    // Register with SceneManager
    this.sceneManager.registerScene(this.wheelsScene);
    this.sceneManager.registerScene(this.oldMacDonaldScene);
    this.sceneManager.registerScene(this.itsyBitsyScene);
    this.sceneManager.registerScene(this.twinkleStarScene);
    this.sceneManager.registerScene(this.rowBoatScene);
    this.sceneManager.registerScene(this.musicalMeScene);
    this.sceneManager.registerScene(this.bubblePopScene);
    this.sceneManager.registerScene(this.surpriseEggsScene);
    this.sceneManager.registerScene(this.peekabooBoxesScene);
    this.sceneManager.registerScene(this.balloonFruitScene);
    this.sceneManager.registerScene(this.babyPhoneScene);
    this.sceneManager.registerScene(this.drumPianoScene);
    this.sceneManager.registerScene(this.fireworksScene);

    // 4. Brand-New Interactive Songs Theater & Little Learner Studio (EN / FR)
    this.songsTheater = new SongsTheater(this.appRoot, this.bursts, () => {
      this.handleExitJukebox();
    });
    this.learningStudio = new LearningStudio(this.appRoot, this.bursts, () => {
      this.handleExitLearningStudio();
    });
    this.createTopNavBar();

    // 4b. Visual Storybook Home Shelf & Gentle Sleepy Bye-Bye Timer
    this.storybookShelf = new StorybookShelf(this.appRoot, this.sceneManager.getScenes(), {
      onSelectScene: (sceneId) => this.switchScene(sceneId),
      onOpenLearning: () => this.openLearningStudio(),
      onOpenJukebox: () => this.openJukebox()
    });

    this.sleepyTimer = new SleepyTimer(this.appRoot, {
      onSleepStart: () => {
        this.songsTheater.closeTheater();
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
    this.engine.setMusicVolume(prefs.musicVolume);
    this.engine.setSfxVolume(prefs.sfxVolume);
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
    // Hide the top-left navigation pills while Infant Lock is active
    if (this.topNavBar) {
      this.topNavBar.style.display = locked ? 'none' : 'flex';
    }
  }

  /**
   * Seamlessly switches between any of the 13 rebuilt musical games.
   */
  public async switchScene(sceneId: string): Promise<void> {
    this.engine.stopAllAudio();
    await this.sceneManager.switchScene(sceneId);
  }

  /**
   * Changes Audio Mode between Music On and Free Play (SFX Only) without re-activating scene timers.
   */
  public setAudioMode(mode: 'song' | 'ensemble' | 'free'): void {
    const active = this.sceneManager.getActiveScene() as { startThemeSong?: () => void; stopThemeSong?: () => void } | null;
    if (mode === 'free') {
      active?.stopThemeSong?.();
      this.engine.stopVocalTrack();
      this.engine.pauseSongTrack();
    } else {
      active?.startThemeSong?.();
    }
  }

  public setInstrument(inst: InstrumentType): void {
    this.musicalMeScene.setInstrument(inst);
  }

  /**
   * Clean, non-overlapping top-left navigation bar (Songs, Learn, Games Shelf)
   * engineered for iPhone SE (375px), iPhone 12-16 Pro, and iPad safe areas.
   */
  private createTopNavBar(): void {
    this.topNavBar = document.createElement('div');
    this.topNavBar.className = 'top-nav-pills';

    const songsBtn = document.createElement('button');
    songsBtn.className = 'nav-pill nav-pill-songs';
    songsBtn.setAttribute('aria-label', 'Open Musical Songs Theater');
    songsBtn.innerHTML = `<span>🎶</span><span>SONGS</span>`;
    songsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openJukebox();
    });

    const learnBtn = document.createElement('button');
    learnBtn.className = 'nav-pill nav-pill-learn';
    learnBtn.setAttribute('aria-label', 'Open Little Learner Studio');
    learnBtn.innerHTML = `<span>🎓</span><span>LEARN</span>`;
    learnBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openLearningStudio();
    });

    const shelfBtn = document.createElement('button');
    shelfBtn.className = 'nav-pill nav-pill-shelf';
    shelfBtn.setAttribute('aria-label', 'Open Storybook Games Shelf');
    shelfBtn.innerHTML = `<span>📚</span>`;
    shelfBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.engine.stopAllAudio();
      this.storybookShelf.open();
    });

    this.topNavBar.appendChild(songsBtn);
    this.topNavBar.appendChild(learnBtn);
    this.topNavBar.appendChild(shelfBtn);
    this.appRoot.appendChild(this.topNavBar);
  }

  /**
   * Opens the Musical Songs Theater and stops active game audio.
   */
  public openJukebox(): void {
    this.learningStudio.closeStudio();
    this.storybookShelf.close();
    this.sceneManager.deactivateActiveScene();
    this.engine.stopAllAudio();
    this.topNavBar.style.display = 'none';
    this.songsTheater.openTheater();
  }

  private handleExitJukebox(): void {
    this.topNavBar.style.display = appPrefs.get().infantLock ? 'none' : 'flex';
    this.engine.stopAllAudio();
    this.sceneManager.activateActiveScene();
  }

  public openLearningStudio(): void {
    this.songsTheater.closeTheater();
    this.storybookShelf.close();
    this.sceneManager.deactivateActiveScene();
    this.engine.stopAllAudio();
    this.topNavBar.style.display = 'none';
    this.learningStudio.openStudio();
  }

  private handleExitLearningStudio(): void {
    this.topNavBar.style.display = appPrefs.get().infantLock ? 'none' : 'flex';
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

    // Helper to check if any settings, guide modal, Songs Theater, Learning Studio, or Shelf is open
    const isInteractiveOverlayOpen = (): boolean => {
      const activeModal = document.querySelector('.parent-modal-overlay:not([style*="display: none"])');
      const activeSongs = document.querySelector('.songs-theater-container:not([style*="display: none"])');
      const activeLearning = document.querySelector('.learning-studio-container:not([style*="display: none"])');
      const activeShelf = document.querySelector('.storybook-shelf-overlay:not([style*="display: none"])');
      return !!activeModal || !!activeSongs || !!activeLearning || !!activeShelf;
    };

    // Prevent multi-touch browser zooming (pinch-to-zoom) outside modal & overlays
    window.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement | null;
      if (isInteractiveOverlayOpen() || (target && target.closest('.parent-modal-overlay, .guide-overlay, .parent-modal-card, .parent-controls-wrap, .top-nav-pills, .songs-theater-container, .learning-studio-container, .storybook-shelf-overlay, .sleepy-byebye-overlay'))) {
        return;
      }
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      const target = e.target as HTMLElement | null;
      if (isInteractiveOverlayOpen() || (target && target.closest('.parent-modal-overlay, .guide-overlay, .parent-modal-card, .parent-controls-wrap, .top-nav-pills, .songs-theater-container, .songs-hub-view, .learning-studio-container, .learning-hub-view, .storybook-shelf-overlay, .shelf-sheet'))) {
        return;
      }
      e.preventDefault();
    }, { passive: false });

    // Global multi-touch burst reaction: Any tap or slap anywhere spawns sparkles!
    window.addEventListener('pointerdown', (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.parent-modal-card, .parent-modal-overlay, .parent-controls-wrap, .top-nav-pills, .songs-theater-container, .learning-studio-container, .storybook-shelf-overlay, .sleepy-byebye-overlay')) {
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
