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
import { WheelsScene } from './scenes/WheelsScene';
import { MusicalMeScene } from './scenes/MusicalMeScene';

class ToddlerStorybookApp {
  private appRoot: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;
  private ensemble: AcousticEnsemble;

  private wheelsScene: WheelsScene;
  private musicalMeScene: MusicalMeScene;
  private parentGate: ParentGate;
  private currentSceneName: 'wheels' | 'musical_me' = 'wheels';

  constructor() {
    this.appRoot = document.getElementById('app') as HTMLElement;
    this.engine = AudioEngine.getInstance();
    this.ensemble = new AcousticEnsemble(this.engine);

    // 1. High-Performance Multi-Touch Burst Particle Canvas
    this.bursts = new TouchBurstManager(this.appRoot);

    // 2. Hardware Touch Lockout & Global Multi-Touch Slap Handler
    this.setupHardwareLockout();

    // 3. Initialize Interactive Scenes
    this.wheelsScene = new WheelsScene(this.appRoot, this.bursts, this.ensemble);
    this.musicalMeScene = new MusicalMeScene(this.appRoot, this.bursts);

    // 4. Subtle 3-Second Hold Parent Gate & Settings Modal
    this.parentGate = new ParentGate(this.appRoot, {
      onSceneChange: (scene) => this.switchScene(scene),
      onAudioModeChange: (mode) => this.setAudioMode(mode),
      onInstrumentChange: (inst) => this.setInstrument(inst)
    });

    // 5. Preload Audio in Background
    this.engine.preloadAll().catch(console.warn);

    // 6. Graceful "Tap to Play" Audio Unlock Screen
    new IntroScreen(this.appRoot, this.bursts, () => {
      this.startApp();
    });
  }

  /**
   * Starts the initial scene once audio is unlocked.
   */
  private startApp(): void {
    this.wheelsScene.activate();
    this.ensemble.start();
  }

  /**
   * Switches between "Wheels on the Bus" and "Musical Me".
   */
  public switchScene(scene: 'wheels' | 'musical_me'): void {
    if (this.currentSceneName === scene) return;

    if (this.currentSceneName === 'wheels') {
      this.wheelsScene.deactivate();
      this.ensemble.stop();
    } else {
      this.musicalMeScene.deactivate();
    }

    this.currentSceneName = scene;
    this.parentGate.setScene(scene);

    if (scene === 'wheels') {
      this.wheelsScene.activate();
      this.ensemble.start();
    } else {
      this.musicalMeScene.activate();
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
      this.ensemble.start();
    } else {
      this.engine.pauseSongTrack();
      this.ensemble.stop();
    }
  }

  public setInstrument(inst: InstrumentType): void {
    this.musicalMeScene.setInstrument(inst);
  }

  /**
   * Hardware Lockout: Prevents pinch-zoom, pull-refresh, context menu, text selection.
   * Gracefully permits touch scrolling inside the parent settings modal.
   */
  private setupHardwareLockout(): void {
    // Prevent right-click context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });

    // Prevent multi-touch browser zooming (pinch-to-zoom) outside modal
    window.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.parent-modal-card, .parent-modal-body, .parent-modal-overlay')) {
        return; // Allow touch in modal
      }
      if (e.touches.length > 1) {
        // Allow toddler multi-touch in app, but prevent browser zoom
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      // Allow native finger scrolling inside the parent modal
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.parent-modal-card, .parent-modal-body, .parent-modal-overlay')) {
        return;
      }
      // Prevent pull-to-refresh and window bouncing on toddler storybook screen
      e.preventDefault();
    }, { passive: false });

    // Global multi-touch burst reaction: Any tap or slap anywhere spawns sparkles!
    window.addEventListener('pointerdown', (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      // Do not spawn bursts over parent settings modal
      if (target && target.closest('.parent-modal-card, .parent-modal-overlay')) {
        return;
      }
      // Small sparkle if tapping outside interactables
      if (target && (target.tagName === 'CANVAS' || target.id === 'app')) {
        this.bursts.spawnBurst(e.clientX, e.clientY, 8, '#FFD166');
      }
    });
  }
}

// Bootstrap application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new ToddlerStorybookApp();
});
