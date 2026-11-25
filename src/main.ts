/**
 * main.ts
 * Mobile-First Interactive Musical Storybook Application Entry Point.
 * Designed for Toddlers Aged 11 to 24 Months.
 * Inspired by Duck Duck Moose ("Wheels on the Bus" & "Musical Me").
 */

import './style.css';
import { AudioEngine } from './audio/AudioEngine';
import type { InstrumentType } from './audio/AudioEngine';
import { AcousticEnsemble } from './audio/AcousticEnsemble';
import { TouchBurstManager } from './components/TouchBurstManager';
import { ParentGate } from './components/ParentGate';
import { IntroScreen } from './components/IntroScreen';
import { SceneManager } from './scenes/SceneManager';
import { WheelsScene } from './scenes/WheelsScene';
import { MusicalMeScene } from './scenes/MusicalMeScene';
import { OldMacDonaldScene } from './scenes/OldMacDonaldScene';
import { ItsyBitsySpiderScene } from './scenes/ItsyBitsySpiderScene';
import { TwinkleLittleStarScene } from './scenes/TwinkleLittleStarScene';
import { RowYourBoatScene } from './scenes/RowYourBoatScene';
import { BathTimeScene } from './scenes/BathTimeScene';
import { PeekabooMeadowScene } from './scenes/PeekabooMeadowScene';
import { SoundPaintScene } from './scenes/SoundPaintScene';
import { SongsJukebox } from './components/SongsJukebox';
import { LearningStudio } from './components/LearningStudio';
import { StorybookShelf } from './components/StorybookShelf';
import { SleepyTimer } from './components/SleepyTimer';
import { appPrefs } from './state/AppPreferences';

class ToddlerStorybookApp {
  private appRoot: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;
  private ensemble: AcousticEnsemble;
  private sceneManager: SceneManager;

  private wheelsScene: WheelsScene;
  private musicalMeScene: MusicalMeScene;
  private oldMacDonaldScene: OldMacDonaldScene;
  private itsyBitsyScene: ItsyBitsySpiderScene;
  private twinkleStarScene: TwinkleLittleStarScene;
  private rowBoatScene: RowYourBoatScene;
  private bathTimeScene: BathTimeScene;
  private peekabooMeadowScene: PeekabooMeadowScene;
  private soundPaintScene: SoundPaintScene;

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
    this.ensemble = new AcousticEnsemble(this.engine);
    this.sceneManager = SceneManager.getInstance();

    // 1. High-Performance Multi-Touch Burst Particle Canvas
    this.bursts = new TouchBurstManager(this.appRoot);

    // 2. Hardware Touch Lockout & Global Multi-Touch Slap Handler
    this.setupHardwareLockout();

    // 3. Initialize All 9 Interactive Storybook Scenes
    this.wheelsScene = new WheelsScene(this.appRoot, this.bursts, this.ensemble);
    this.musicalMeScene = new MusicalMeScene(this.appRoot, this.bursts);
    this.oldMacDonaldScene = new OldMacDonaldScene(this.appRoot, this.bursts);
    this.itsyBitsyScene = new ItsyBitsySpiderScene(this.appRoot, this.bursts);
    this.twinkleStarScene = new TwinkleLittleStarScene(this.appRoot, this.bursts);
    this.rowBoatScene = new RowYourBoatScene(this.appRoot, this.bursts);
    this.bathTimeScene = new BathTimeScene(this.appRoot, this.bursts);
    this.peekabooMeadowScene = new PeekabooMeadowScene(this.appRoot, this.bursts);
    this.soundPaintScene = new SoundPaintScene(this.appRoot, this.bursts);

    // Register with SceneManager
    this.sceneManager.registerScene(this.wheelsScene);
    this.sceneManager.registerScene(this.musicalMeScene);
    this.sceneManager.registerScene(this.oldMacDonaldScene);
    this.sceneManager.registerScene(this.itsyBitsyScene);
    this.sceneManager.registerScene(this.twinkleStarScene);
    this.sceneManager.registerScene(this.rowBoatScene);
    this.sceneManager.registerScene(this.bathTimeScene);
    this.sceneManager.registerScene(this.peekabooMeadowScene);
    this.sceneManager.registerScene(this.soundPaintScene);

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
        this.ensemble.stop();
        this.sceneManager.deactivateActiveScene();
        this.engine.stopAllAudio();
      },
      onWakeUp: () => {
        this.sceneManager.activateActiveScene();
        if (this.sceneManager.getActiveSceneId() === 'wheels') {
          this.setAudioMode(appPrefs.get().audioMode);
        }
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
    await this.sceneManager.switchScene(prefs.lastScene || 'wheels');

    // Apply persisted audio mode for initial scene
    if (this.sceneManager.getActiveSceneId() === 'wheels') {
      this.setAudioMode(prefs.audioMode);
    }

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
   * Seamlessly switches between any of the 9 scenes.
   */
  public async switchScene(sceneId: string): Promise<void> {
    this.ensemble.stop();
    this.engine.stopAllAudio();
    await this.sceneManager.switchScene(sceneId);
    if (sceneId === 'wheels') {
      this.ensemble.start();
    }
  }

  /**
   * Changes Audio Mode between Studio Song, Live Band, and Free Play.
   */
  public setAudioMode(mode: 'song' | 'ensemble' | 'free'): void {
    if (mode === 'song') {
      this.ensemble.stop();
      this.engine.playSongTrack();
    } else if (mode === 'ensemble') {
      this.engine.pauseSongTrack();
      if (this.sceneManager.getActiveSceneId() === 'wheels') {
        this.ensemble.start();
      }
    } else {
      this.engine.pauseSongTrack();
      this.ensemble.stop();
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
    this.ensemble.stop();
    this.sceneManager.deactivateActiveScene();
    this.engine.stopAllAudio();
    this.floatingJukeboxBtn.style.display = 'none';
    this.floatingLearnBtn.style.display = 'none';
    this.floatingShelfBtn.style.display = 'none';
    this.songsJukebox.openJukebox();
  }

  /**
   * Called when returning from Jukebox to Storybook.
   */
  private handleExitJukebox(): void {
    const showFloating = appPrefs.get().infantLock ? 'none' : 'flex';
    this.floatingJukeboxBtn.style.display = showFloating;
    this.floatingLearnBtn.style.display = showFloating;
    this.floatingShelfBtn.style.display = showFloating;
    this.engine.stopAllAudio();
    this.sceneManager.activateActiveScene();
    const activeId = this.sceneManager.getActiveSceneId();
    if (activeId === 'wheels') {
      this.setAudioMode(appPrefs.get().audioMode);
    }
  }

  /**
   * Opens the 1-Year-Old Bilingual Learning Studio.
   */
  public openLearningStudio(): void {
    this.songsJukebox.closeJukebox();
    this.storybookShelf.close();
    this.ensemble.stop();
    this.sceneManager.deactivateActiveScene();
    this.engine.stopAllAudio();
    this.floatingJukeboxBtn.style.display = 'none';
    this.floatingLearnBtn.style.display = 'none';
    this.floatingShelfBtn.style.display = 'none';
    this.learningStudio.openStudio();
  }

  /**
   * Called when returning from Learning Studio to Storybook.
   */
  private handleExitLearningStudio(): void {
    const showFloating = appPrefs.get().infantLock ? 'none' : 'flex';
    this.floatingJukeboxBtn.style.display = showFloating;
    this.floatingLearnBtn.style.display = showFloating;
    this.floatingShelfBtn.style.display = showFloating;
    this.engine.stopAllAudio();
    this.sceneManager.activateActiveScene();
    const activeId = this.sceneManager.getActiveSceneId();
    if (activeId === 'wheels') {
      this.setAudioMode(appPrefs.get().audioMode);
    }
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
