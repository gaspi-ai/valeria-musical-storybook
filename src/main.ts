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
  private floatingJukeboxBtn!: HTMLElement;
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

    // 4. Dedicated Songs Jukebox (Toddler Jukebox & Fullscreen Animated Theater)
    this.songsJukebox = new SongsJukebox(this.appRoot, () => {
      this.handleExitJukebox();
    });
    this.createFloatingJukeboxButton();

    // 5. Subtle 3-Second Hold / 2-Finger Parent Gate & Settings Modal
    this.parentGate = new ParentGate(this.appRoot, {
      onSceneChange: (sceneId) => {
        this.switchScene(sceneId);
      },
      onAudioModeChange: (mode) => this.setAudioMode(mode),
      onInstrumentChange: (inst) => this.setInstrument(inst),
      onOpenJukebox: () => this.openJukebox()
    });

    // Sync SceneManager events back to Parent Gate
    this.sceneManager.onSceneChange((sceneId) => {
      this.parentGate.setScene(sceneId);
    });

    // 6. Preload Audio in Background
    this.engine.preloadAll().catch(console.warn);

    // 7. Graceful "Tap to Play" Audio Unlock Screen
    new IntroScreen(this.appRoot, this.bursts, () => {
      this.startApp();
    });
  }

  /**
   * Starts the initial scene once audio is unlocked.
   */
  private startApp(): void {
    this.sceneManager.switchScene('wheels');
    this.ensemble.start();
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
   * Opens the Songs Jukebox and stops storybook scene audio and animations.
   */
  public openJukebox(): void {
    this.ensemble.stop();
    this.sceneManager.deactivateActiveScene();
    this.engine.stopAllAudio();
    this.floatingJukeboxBtn.style.display = 'none';
    this.songsJukebox.openJukebox();
  }

  /**
   * Called when returning from Jukebox to Storybook.
   */
  private handleExitJukebox(): void {
    this.floatingJukeboxBtn.style.display = 'flex';
    this.engine.stopAllAudio();
    this.sceneManager.activateActiveScene();
    const activeId = this.sceneManager.getActiveSceneId();
    if (activeId === 'wheels') {
      this.ensemble.start();
    }
  }

  /**
   * Hardware Lockout: Prevents pinch-zoom, pull-refresh, context menu, text selection.
   * Gracefully permits touch scrolling inside the parent settings modal and Jukebox.
   */
  private setupHardwareLockout(): void {
    // Prevent right-click context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });

    // Helper to check if any settings, guide modal, or Jukebox is open
    const isInteractiveOverlayOpen = (): boolean => {
      const activeModal = document.querySelector('.parent-modal-overlay:not([style*="display: none"])');
      const activeJukebox = document.querySelector('.toddler-jukebox-container:not([style*="display: none"])');
      return !!activeModal || !!activeJukebox;
    };

    // Prevent multi-touch browser zooming (pinch-to-zoom) outside modal & jukebox
    window.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement | null;
      if (isInteractiveOverlayOpen() || (target && target.closest('.parent-modal-overlay, .guide-overlay, .parent-modal-card, .parent-controls-wrap, .floating-jukebox-btn, .toddler-jukebox-container'))) {
        return; // Allow touch in modal / jukebox
      }
      if (e.touches.length > 1) {
        // Allow toddler multi-touch in app, but prevent browser zoom
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      // Allow native finger scrolling inside the parent modal or jukebox grid
      const target = e.target as HTMLElement | null;
      if (isInteractiveOverlayOpen() || (target && target.closest('.parent-modal-overlay, .guide-overlay, .parent-modal-card, .parent-controls-wrap, .toddler-jukebox-container, .jukebox-grid-view'))) {
        return; // Allow native finger scrolling
      }
      // Prevent pull-to-refresh and window bouncing on toddler storybook screen
      e.preventDefault();
    }, { passive: false });

    // Global multi-touch burst reaction: Any tap or slap anywhere spawns sparkles!
    window.addEventListener('pointerdown', (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.parent-modal-card, .parent-modal-overlay, .parent-controls-wrap, .floating-jukebox-btn, .toddler-jukebox-container')) {
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
