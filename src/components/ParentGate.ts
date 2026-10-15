/**
 * ParentGate.ts
 * Subtle 3-Second Hold Parent Gate & Modal for Toddler Lockout UX.
 * 
 * Prevents 11-24 month toddlers from accidentally exiting scenes or changing settings.
 * Features an SVG circular progress ring that fills smoothly during continuous 3s hold.
 */

import { AudioEngine } from '../audio/AudioEngine';
import type { InstrumentType } from '../audio/AudioEngine';

export interface ParentGateCallbacks {
  onSceneChange: (scene: 'wheels' | 'musical_me') => void;
  onAudioModeChange: (mode: 'song' | 'ensemble' | 'free') => void;
  onInstrumentChange: (inst: InstrumentType) => void;
}

export class ParentGate {
  private container: HTMLElement;
  private callbacks: ParentGateCallbacks;
  private engine: AudioEngine;

  private gateButton!: HTMLElement;
  private progressRing!: SVGCircleElement;
  private modalOverlay!: HTMLElement;

  private holdStartTime: number = 0;
  private animFrameId: number = 0;
  private readonly HOLD_DURATION_MS = 2500; // 2.5 seconds hold

  private currentScene: 'wheels' | 'musical_me' = 'wheels';
  private currentAudioMode: 'song' | 'ensemble' | 'free' = 'song';
  private currentInstrument: InstrumentType = 'marimba';

  constructor(container: HTMLElement, callbacks: ParentGateCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.engine = AudioEngine.getInstance();

    this.render();
    this.bindEvents();
  }

  private render(): void {
    // 1. Subtle Top Corner Lock/Settings Button with SVG Progress Ring
    this.gateButton = document.createElement('div');
    this.gateButton.className = 'parent-gate-btn';
    this.gateButton.setAttribute('role', 'button');
    this.gateButton.setAttribute('aria-label', 'Parent Gate - Hold for 3 seconds');
    this.gateButton.title = 'Parents: Hold for 3 seconds';

    this.gateButton.innerHTML = `
      <svg class="gate-ring-svg" viewBox="0 0 48 48">
        <circle class="gate-ring-bg" cx="24" cy="24" r="20" />
        <circle class="gate-ring-progress" cx="24" cy="24" r="20" />
      </svg>
      <div class="gate-icon-inner">
        <span class="gate-lock-icon">🔒</span>
        <span class="gate-hold-hint">HOLD</span>
      </div>
    `;

    this.progressRing = this.gateButton.querySelector('.gate-ring-progress') as SVGCircleElement;
    const circumference = 2 * Math.PI * 20;
    this.progressRing.style.strokeDasharray = `${circumference}`;
    this.progressRing.style.strokeDashoffset = `${circumference}`;

    this.container.appendChild(this.gateButton);

    // 2. Parent Settings Modal
    this.modalOverlay = document.createElement('div');
    this.modalOverlay.className = 'parent-modal-overlay';
    this.modalOverlay.style.display = 'none';

    this.modalOverlay.innerHTML = `
      <div class="parent-modal-card">
        <div class="parent-modal-header">
          <h2>👨‍👩‍👧 Grown-Ups Menu</h2>
          <button class="parent-close-btn" aria-label="Close">✕</button>
        </div>

        <div class="parent-modal-body">
          <!-- Scene Selector -->
          <div class="parent-section">
            <label class="parent-label">Choose Storybook Scene:</label>
            <div class="parent-btn-group">
              <button class="scene-select-btn ${this.currentScene === 'wheels' ? 'active' : ''}" data-scene="wheels">
                🚌 Wheels on the Bus
              </button>
              <button class="scene-select-btn ${this.currentScene === 'musical_me' ? 'active' : ''}" data-scene="musical_me">
                🌸 Musical Me Garden
              </button>
            </div>
          </div>

          <!-- Audio Mode Selector -->
          <div class="parent-section">
            <label class="parent-label">Audio & Music Mode:</label>
            <div class="parent-btn-group">
              <button class="mode-select-btn ${this.currentAudioMode === 'song' ? 'active' : ''}" data-mode="song">
                🎵 Studio Song
              </button>
              <button class="mode-select-btn ${this.currentAudioMode === 'ensemble' ? 'active' : ''}" data-mode="ensemble">
                🎸 Live Acoustic Band
              </button>
              <button class="mode-select-btn ${this.currentAudioMode === 'free' ? 'active' : ''}" data-mode="free">
                🎈 Free Play Sounds
              </button>
            </div>
          </div>

          <!-- Musical Me Instrument Selector -->
          <div class="parent-section">
            <label class="parent-label">Acoustic Instrument:</label>
            <div class="parent-btn-group">
              <button class="inst-select-btn ${this.currentInstrument === 'marimba' ? 'active' : ''}" data-inst="marimba">
                🪵 Marimba
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'glock' ? 'active' : ''}" data-inst="glock">
                🔔 Glockenspiel
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'piano' ? 'active' : ''}" data-inst="piano">
                🎹 Grand Piano
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'musicbox' ? 'active' : ''}" data-inst="musicbox">
                🎼 Music Box
              </button>
            </div>
          </div>

          <!-- Volume Controls & Fullscreen -->
          <div class="parent-section parent-slider-row">
            <label class="parent-label">Master Volume:</label>
            <div class="volume-slider-wrap">
              <span>🔈</span>
              <input type="range" class="volume-slider" min="0" max="1" step="0.05" value="0.85" />
              <span>🔊</span>
            </div>
          </div>

          <div class="parent-section parent-actions-row">
            <button class="fullscreen-toggle-btn">
              📺 Toggle Fullscreen
            </button>
          </div>

          <!-- Toddler Safe Tip -->
          <div class="parent-tip-card">
            💡 <strong>Toddler Tip:</strong> Enable iOS "Guided Access" or Android "App Pinning" in device settings to prevent accidental app exits!
          </div>
        </div>

        <div class="parent-modal-footer">
          <button class="parent-resume-btn">✨ Save & Back to Storybook ✨</button>
        </div>
      </div>
    `;

    this.container.appendChild(this.modalOverlay);
  }

  private bindEvents(): void {
    const circumference = 2 * Math.PI * 20;

    // Press and hold logic
    const startHold = (e: PointerEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.holdStartTime = Date.now();
      this.gateButton.classList.add('holding');

      const updateProgress = () => {
        const elapsed = Date.now() - this.holdStartTime;
        const progress = Math.min(1.0, elapsed / this.HOLD_DURATION_MS);
        this.progressRing.style.strokeDashoffset = `${circumference * (1 - progress)}`;

        if (progress >= 1.0) {
          this.cancelHold();
          this.openModal();
        } else {
          this.animFrameId = requestAnimationFrame(updateProgress);
        }
      };

      this.animFrameId = requestAnimationFrame(updateProgress);
    };

    const cancelHold = () => {
      this.cancelHold();
    };

    this.gateButton.addEventListener('pointerdown', startHold);
    this.gateButton.addEventListener('pointerup', cancelHold);
    this.gateButton.addEventListener('pointercancel', cancelHold);
    this.gateButton.addEventListener('pointerleave', cancelHold);

    // Modal UI Handlers
    const closeBtn = this.modalOverlay.querySelector('.parent-close-btn') as HTMLElement;
    const resumeBtn = this.modalOverlay.querySelector('.parent-resume-btn') as HTMLElement;
    closeBtn.addEventListener('click', () => this.closeModal());
    resumeBtn.addEventListener('click', () => this.closeModal());

    // Scene Switch buttons
    const sceneBtns = this.modalOverlay.querySelectorAll('.scene-select-btn');
    sceneBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sceneBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const scene = btn.getAttribute('data-scene') as 'wheels' | 'musical_me';
        this.currentScene = scene;
        this.callbacks.onSceneChange(scene);
        this.engine.playSound('chime.mp3', { volume: 0.6 });
      });
    });

    // Audio Mode buttons
    const modeBtns = this.modalOverlay.querySelectorAll('.mode-select-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode') as 'song' | 'ensemble' | 'free';
        this.currentAudioMode = mode;
        this.callbacks.onAudioModeChange(mode);
        this.engine.playSound('boing.mp3', { volume: 0.5 });
      });
    });

    // Instrument buttons
    const instBtns = this.modalOverlay.querySelectorAll('.inst-select-btn');
    instBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        instBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const inst = btn.getAttribute('data-inst') as InstrumentType;
        this.currentInstrument = inst;
        this.callbacks.onInstrumentChange(inst);
        this.engine.playInstrumentNote(inst, 'C5', { volume: 0.7 });
      });
    });

    // Volume Slider
    const volSlider = this.modalOverlay.querySelector('.volume-slider') as HTMLInputElement;
    volSlider.addEventListener('input', () => {
      this.engine.setMasterVolume(parseFloat(volSlider.value));
    });

    // Fullscreen Toggle
    const fsBtn = this.modalOverlay.querySelector('.fullscreen-toggle-btn') as HTMLButtonElement;
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  private cancelHold(): void {
    cancelAnimationFrame(this.animFrameId);
    this.gateButton.classList.remove('holding');
    const circumference = 2 * Math.PI * 20;
    this.progressRing.style.strokeDashoffset = `${circumference}`;
  }

  public openModal(): void {
    this.engine.playSound('chime.mp3', { volume: 0.8 });
    this.modalOverlay.style.display = 'flex';
  }

  public closeModal(): void {
    this.modalOverlay.style.display = 'none';
  }

  public setScene(scene: 'wheels' | 'musical_me'): void {
    this.currentScene = scene;
    const sceneBtns = this.modalOverlay.querySelectorAll('.scene-select-btn');
    sceneBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-scene') === scene);
    });
  }
}
