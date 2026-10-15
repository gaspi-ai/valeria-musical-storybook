/**
 * ParentGate.ts
 * Subtle Parent Gate, Infant Screen Lock, & Hardware Lockout Guide.
 * 
 * Protects against accidental scene exits and provides:
 * - Screen Wake Lock (keeps iPhone/Android screen from sleeping).
 * - Infant Lock Mode (ghosted gate, extended 5s hold, full-screen lock).
 * - Step-by-step Guided Access instructions for iPhone 12 Pro.
 */

import { AudioEngine } from '../audio/AudioEngine';
import type { InstrumentType } from '../audio/AudioEngine';

export interface ParentGateCallbacks {
  onSceneChange: (scene: string) => void;
  onAudioModeChange: (mode: 'song' | 'ensemble' | 'free') => void;
  onInstrumentChange: (inst: InstrumentType) => void;
}

export class ParentGate {
  private container: HTMLElement;
  private callbacks: ParentGateCallbacks;
  private engine: AudioEngine;

  private gateWrap!: HTMLElement;
  private gateButton!: HTMLElement;
  private quickLockBtn!: HTMLElement;
  private progressRing!: SVGCircleElement;
  private modalOverlay!: HTMLElement;
  private guideModalOverlay!: HTMLElement;
  private toastEl!: HTMLElement;

  private holdStartTime: number = 0;
  private animFrameId: number = 0;
  private holdDurationMs: number = 3000; // 3-second hold (5s in infant lock)

  private isInfantLockActive: boolean = false;
  private wakeLockSentinel: unknown = null;

  private currentScene: string = 'wheels';
  private currentAudioMode: 'song' | 'ensemble' | 'free' = 'song';
  private currentInstrument: InstrumentType = 'marimba';

  constructor(container: HTMLElement, callbacks: ParentGateCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.engine = AudioEngine.getInstance();

    this.render();
    this.bindEvents();
    this.initWakeLock();
  }

  private render(): void {
    // 1. Controls Wrapper (Top Right)
    this.gateWrap = document.createElement('div');
    this.gateWrap.className = 'parent-controls-wrap';

    // Quick Infant Lock Button
    this.quickLockBtn = document.createElement('button');
    this.quickLockBtn.className = 'quick-infant-lock-btn';
    this.quickLockBtn.title = 'Quick Lock Screen for Infant';
    this.quickLockBtn.setAttribute('aria-label', 'Quick Lock Screen for Infant');
    this.quickLockBtn.innerHTML = `
      <span class="quick-lock-icon">🔒</span>
      <span class="quick-lock-label">LOCK</span>
    `;

    // Parent Gate Button with SVG Circular Progress Ring
    this.gateButton = document.createElement('div');
    this.gateButton.className = 'parent-gate-btn';
    this.gateButton.setAttribute('role', 'button');
    this.gateButton.setAttribute('aria-label', 'Parent Gate - Hold to open menu');
    this.gateButton.title = 'Parents: Hold to unlock';

    this.gateButton.innerHTML = `
      <svg class="gate-ring-svg" viewBox="0 0 48 48">
        <circle class="gate-ring-bg" cx="24" cy="24" r="20" />
        <circle class="gate-ring-progress" cx="24" cy="24" r="20" />
      </svg>
      <div class="gate-icon-inner">
        <span class="gate-lock-icon">⚙️</span>
        <span class="gate-hold-hint">HOLD</span>
      </div>
    `;

    this.gateWrap.appendChild(this.quickLockBtn);
    this.gateWrap.appendChild(this.gateButton);
    this.container.appendChild(this.gateWrap);

    this.progressRing = this.gateButton.querySelector('.gate-ring-progress') as SVGCircleElement;
    const circumference = 2 * Math.PI * 20;
    this.progressRing.style.strokeDasharray = `${circumference}`;
    this.progressRing.style.strokeDashoffset = `${circumference}`;

    // 2. Toast Notification Banner
    this.toastEl = document.createElement('div');
    this.toastEl.className = 'storybook-toast';
    this.container.appendChild(this.toastEl);

    // 3. Parent Settings Modal
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
          <!-- Infant Lock & Screen Lock Card -->
          <div class="parent-section parent-lock-feature-card">
            <div class="lock-feature-header">
              <span class="lock-feature-icon">🛡️</span>
              <div class="lock-feature-text">
                <h3>Infant Anti-Exit Lock</h3>
                <p>Prevent accidental app closing or switching on mobile.</p>
              </div>
            </div>

            <div class="lock-feature-actions">
              <button class="activate-infant-lock-btn" id="btn-toggle-infant-lock">
                🔒 Activate Infant Screen Lock
              </button>
              <button class="how-to-lock-guide-btn" id="btn-open-lock-guide">
                📱 iPhone 100% Lock Guide
              </button>
            </div>

            <div class="wake-lock-status-row">
              <span class="wake-lock-dot active"></span>
              <span class="wake-lock-label">Screen Keep-Awake: <strong>Active (Won't Sleep)</strong></span>
            </div>
          </div>

          <!-- Scene Selector Carousel / Grid -->
          <div class="parent-section">
            <label class="parent-label">Choose Storybook Scene (9 Scenes):</label>
            <div class="parent-btn-group scene-grid-6">
              <button class="scene-select-btn ${this.currentScene === 'wheels' ? 'active' : ''}" data-scene="wheels">
                <span class="scene-btn-icon">🚌</span>
                <span class="scene-btn-title">Wheels on the Bus</span>
              </button>
              <button class="scene-select-btn ${this.currentScene === 'musical_me' ? 'active' : ''}" data-scene="musical_me">
                <span class="scene-btn-icon">🌸</span>
                <span class="scene-btn-title">Musical Me Garden</span>
              </button>
              <button class="scene-select-btn ${this.currentScene === 'old_macdonald' ? 'active' : ''}" data-scene="old_macdonald">
                <span class="scene-btn-icon">🚜</span>
                <span class="scene-btn-title">Old MacDonald's Farm</span>
              </button>
              <button class="scene-select-btn ${this.currentScene === 'itsy_bitsy' ? 'active' : ''}" data-scene="itsy_bitsy">
                <span class="scene-btn-icon">🕷️</span>
                <span class="scene-btn-title">Itsy Bitsy Spider</span>
              </button>
              <button class="scene-select-btn ${this.currentScene === 'twinkle_star' ? 'active' : ''}" data-scene="twinkle_star">
                <span class="scene-btn-icon">⭐</span>
                <span class="scene-btn-title">Twinkle, Twinkle, Little Star</span>
              </button>
              <button class="scene-select-btn ${this.currentScene === 'row_boat' ? 'active' : ''}" data-scene="row_boat">
                <span class="scene-btn-icon">🛶</span>
                <span class="scene-btn-title">Row, Row, Row Your Boat</span>
              </button>
              <button class="scene-select-btn ${this.currentScene === 'bath_time' ? 'active' : ''}" data-scene="bath_time">
                <span class="scene-btn-icon">🛁</span>
                <span class="scene-btn-title">Bath Time Splash</span>
              </button>
              <button class="scene-select-btn ${this.currentScene === 'peekaboo_meadow' ? 'active' : ''}" data-scene="peekaboo_meadow">
                <span class="scene-btn-icon">🌸</span>
                <span class="scene-btn-title">Peek-a-Boo Meadow</span>
              </button>
              <button class="scene-select-btn ${this.currentScene === 'sound_paint' ? 'active' : ''}" data-scene="sound_paint">
                <span class="scene-btn-icon">🎨</span>
                <span class="scene-btn-title">Sound Paint Canvas</span>
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

          <!-- Acoustic Instrument Selector -->
          <div class="parent-section">
            <label class="parent-label">Acoustic Instrument Soundbank:</label>
            <div class="parent-btn-group inst-grid">
              <button class="inst-select-btn ${this.currentInstrument === 'marimba' ? 'active' : ''}" data-inst="marimba">
                🪵 Marimba
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'glock' ? 'active' : ''}" data-inst="glock">
                🔔 Glockenspiel
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'celesta' ? 'active' : ''}" data-inst="celesta">
                ✨ Celesta
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'piano' ? 'active' : ''}" data-inst="piano">
                🎹 Grand Piano
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'musicbox' ? 'active' : ''}" data-inst="musicbox">
                🎼 Music Box
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'harp' ? 'active' : ''}" data-inst="harp">
                🪕 Orchestral Harp
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'banjo' ? 'active' : ''}" data-inst="banjo">
                🪕 Banjo
              </button>
              <button class="inst-select-btn ${this.currentInstrument === 'nylon_guitar' ? 'active' : ''}" data-inst="nylon_guitar">
                🎸 Nylon Guitar
              </button>
            </div>
          </div>

          <!-- Volume Controls -->
          <div class="parent-section parent-slider-row">
            <label class="parent-label">Master Volume:</label>
            <div class="volume-slider-wrap">
              <span>🔈</span>
              <input type="range" class="volume-slider" min="0" max="1" step="0.05" value="0.85" />
              <span>🔊</span>
            </div>
          </div>

          <!-- Fullscreen Action -->
          <div class="parent-section parent-actions-row">
            <button class="fullscreen-toggle-btn">
              📺 Toggle Fullscreen View
            </button>
          </div>
        </div>

        <div class="parent-modal-footer">
          <button class="parent-resume-btn">✨ Save & Back to Storybook ✨</button>
        </div>
      </div>
    `;

    this.container.appendChild(this.modalOverlay);

    // 4. Dedicated iPhone 12 Pro Guided Access Illustrated Guide
    this.guideModalOverlay = document.createElement('div');
    this.guideModalOverlay.className = 'parent-modal-overlay guide-overlay';
    this.guideModalOverlay.style.display = 'none';

    this.guideModalOverlay.innerHTML = `
      <div class="parent-modal-card guide-card">
        <div class="parent-modal-header">
          <h2>📱 100% Mobile Infant Lock Guide</h2>
          <button class="guide-close-btn" aria-label="Close">✕</button>
        </div>

        <div class="parent-modal-body">
          <div class="guide-hero-banner">
            <span class="guide-hero-icon">🔒</span>
            <h4>Total Physical Lockout</h4>
            <p>Apple iOS restricts websites from disabling phone buttons directly. Apple designed <strong>Guided Access</strong> specifically so infants cannot exit!</p>
          </div>

          <div class="guide-steps-list">
            <div class="guide-step-item">
              <div class="step-badge">1</div>
              <div class="step-content">
                <strong>Triple-Click Side Button</strong>
                <p>On your iPhone 12 Pro (or iPad), quickly press the <strong>Side Power Button 3 times</strong>.</p>
              </div>
            </div>

            <div class="guide-step-item">
              <div class="step-badge">2</div>
              <div class="step-content">
                <strong>Tap "Start" (Top Right)</strong>
                <p>Guided Access turns on. The Home Bar, app switching, notifications, and power buttons are now <strong>100% disabled</strong>.</p>
              </div>
            </div>

            <div class="guide-step-item">
              <div class="step-badge">🎉</div>
              <div class="step-content">
                <strong>Hand Phone to Infant!</strong>
                <p>Your baby can slap, swipe, and tap anywhere. They <strong>cannot close the app</strong> or open any other app on the phone!</p>
              </div>
            </div>

            <div class="guide-step-item">
              <div class="step-badge">3</div>
              <div class="step-content">
                <strong>To Exit (Parents Only):</strong>
                <p>Double-click the Side Button with <strong>Face ID</strong> (or triple-click and enter your passcode).</p>
              </div>
            </div>
          </div>

          <div class="guide-setup-note">
            ⚙️ <strong>First-Time Setup (30 Seconds):</strong><br>
            If triple-clicking does nothing yet, open iPhone <strong>Settings > Accessibility > Guided Access</strong>, switch it <strong>ON</strong>, and enable <strong>Accessibility Shortcut</strong>!
          </div>
        </div>

        <div class="parent-modal-footer">
          <button class="guide-done-btn">✨ Got It! Start Safe Play ✨</button>
        </div>
      </div>
    `;

    this.container.appendChild(this.guideModalOverlay);
  }

  private bindEvents(): void {
    const circumference = 2 * Math.PI * 20;

    // Press and hold logic for parent gate
    const startHold = (e: PointerEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.holdStartTime = Date.now();
      this.gateButton.classList.add('holding');

      const updateProgress = () => {
        const elapsed = Date.now() - this.holdStartTime;
        const progress = Math.min(1.0, elapsed / this.holdDurationMs);
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

    // Simultaneous 2-Finger Tap Shortcut for Parents (Instant unlock)
    this.gateButton.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        e.stopPropagation();
        this.cancelHold();
        this.openModal();
      }
    }, { passive: false });

    // Global 2-finger tap on top-right quadrant
    window.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const cornerBoundary = window.innerWidth - 180;
        if (t1.clientX > cornerBoundary && t1.clientY < 180 && t2.clientX > cornerBoundary && t2.clientY < 180) {
          e.preventDefault();
          this.cancelHold();
          this.openModal();
        }
      }
    }, { passive: false });

    // Quick Lock Button on Main Screen
    this.quickLockBtn.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleInfantLock();
    });

    // Modal UI Handlers
    const closeBtn = this.modalOverlay.querySelector('.parent-close-btn') as HTMLElement;
    const resumeBtn = this.modalOverlay.querySelector('.parent-resume-btn') as HTMLElement;
    
    const handleSaveAndResume = (e?: Event) => {
      if (e && e.cancelable) e.preventDefault();
      this.closeModal();
      this.engine.playSound('chime.mp3', { volume: 0.7 });
      this.showToast('✨ Settings Saved! ✨');
    };
    resumeBtn.addEventListener('click', handleSaveAndResume);
    resumeBtn.addEventListener('touchend', handleSaveAndResume);
    closeBtn.addEventListener('click', () => this.closeModal());
    closeBtn.addEventListener('touchend', (e) => {
      if (e && e.cancelable) e.preventDefault();
      this.closeModal();
    });

    // Toggle Infant Lock inside modal
    const modalLockBtn = this.modalOverlay.querySelector('#btn-toggle-infant-lock') as HTMLElement;
    modalLockBtn.addEventListener('click', () => {
      this.toggleInfantLock();
      this.updateModalLockBtnState();
    });

    // Open Lock Guide inside modal
    const openGuideBtn = this.modalOverlay.querySelector('#btn-open-lock-guide') as HTMLElement;
    openGuideBtn.addEventListener('click', () => {
      this.openGuideModal();
    });

    // Close Lock Guide
    const guideCloseBtn = this.guideModalOverlay.querySelector('.guide-close-btn') as HTMLElement;
    const guideDoneBtn = this.guideModalOverlay.querySelector('.guide-done-btn') as HTMLElement;
    guideCloseBtn.addEventListener('click', () => this.closeGuideModal());
    guideCloseBtn.addEventListener('touchend', (e) => {
      if (e && e.cancelable) e.preventDefault();
      this.closeGuideModal();
    });

    const handleGuideDone = (e?: Event) => {
      if (e && e.cancelable) e.preventDefault();
      this.closeGuideModal();
      this.closeModal();
      this.showToast('🔒 Triple-click Side Button on iPhone for Total Lock!');
    };
    guideDoneBtn.addEventListener('click', handleGuideDone);
    guideDoneBtn.addEventListener('touchend', handleGuideDone);

    // Scene Switch buttons
    const sceneBtns = this.modalOverlay.querySelectorAll('.scene-select-btn');
    sceneBtns.forEach(btn => {
      const handleSelectScene = (e?: Event) => {
        if (e && e.cancelable && e.type === 'touchend') e.preventDefault();
        sceneBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const scene = btn.getAttribute('data-scene') || 'wheels';
        this.currentScene = scene;
        this.callbacks.onSceneChange(scene);
        this.engine.playSound('chime.mp3', { volume: 0.6 });
      };
      btn.addEventListener('click', handleSelectScene);
      btn.addEventListener('touchend', handleSelectScene);
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
      this.toggleFullscreen();
    });
  }

  /**
   * Toggles Infant Lock Mode (Screen WakeLock + Ghosted Parent Gate + 5s Hold)
   */
  public toggleInfantLock(): void {
    this.isInfantLockActive = !this.isInfantLockActive;

    if (this.isInfantLockActive) {
      this.holdDurationMs = 5000; // 5-second hold required to open menu
      this.gateWrap.classList.add('infant-locked');
      this.requestWakeLock();
      this.requestFullscreenSafe();
      this.engine.playSound('chime.mp3', { volume: 0.75 });
      this.showToast('🔒 Infant Lock Active! Triple-click Side Button on iPhone for Total Lock');
    } else {
      this.holdDurationMs = 2500;
      this.gateWrap.classList.remove('infant-locked');
      this.releaseWakeLock();
      this.engine.playSound('boing.mp3', { volume: 0.6 });
      this.showToast('🔓 Infant Lock Disabled');
    }

    this.updateModalLockBtnState();
  }

  private updateModalLockBtnState(): void {
    const btn = this.modalOverlay.querySelector('#btn-toggle-infant-lock') as HTMLElement;
    if (btn) {
      if (this.isInfantLockActive) {
        btn.innerHTML = '🔓 Infant Lock Active (Tap to Disable)';
        btn.classList.add('active-lock');
      } else {
        btn.innerHTML = '🔒 Activate Infant Screen Lock';
        btn.classList.remove('active-lock');
      }
    }
  }

  /**
   * Initializes Screen Wake Lock API so phone screen never dims or turns off.
   */
  private async initWakeLock(): Promise<void> {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isInfantLockActive) {
        this.requestWakeLock();
      }
    });
    await this.requestWakeLock();
  }

  private async requestWakeLock(): Promise<void> {
    try {
      const nav = navigator as unknown as { wakeLock?: { request: (type: string) => Promise<unknown> } };
      if (nav.wakeLock) {
        this.wakeLockSentinel = await nav.wakeLock.request('screen');
      }
    } catch {
      // ignore
    }
  }

  private releaseWakeLock(): void {
    if (this.wakeLockSentinel) {
      try {
        const sentinel = this.wakeLockSentinel as { release?: () => Promise<void> };
        if (sentinel.release) {
          sentinel.release().catch(() => {});
        }
      } catch {
        // ignore
      }
      this.wakeLockSentinel = null;
    }
  }

  private requestFullscreenSafe(): void {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  private showToast(message: string): void {
    this.toastEl.innerText = message;
    this.toastEl.classList.remove('visible');
    void this.toastEl.offsetWidth;
    this.toastEl.classList.add('visible');

    setTimeout(() => {
      this.toastEl.classList.remove('visible');
    }, 4200);
  }

  private cancelHold(): void {
    cancelAnimationFrame(this.animFrameId);
    this.gateButton.classList.remove('holding');
    const circumference = 2 * Math.PI * 20;
    this.progressRing.style.strokeDashoffset = `${circumference}`;
  }

  public openModal(): void {
    this.engine.playSound('chime.mp3', { volume: 0.8 });
    this.updateModalLockBtnState();
    this.modalOverlay.style.display = 'flex';
  }

  public closeModal(): void {
    this.modalOverlay.style.display = 'none';
  }

  public openGuideModal(): void {
    this.guideModalOverlay.style.display = 'flex';
  }

  public closeGuideModal(): void {
    this.guideModalOverlay.style.display = 'none';
  }

  public setScene(scene: string): void {
    this.currentScene = scene;
    const sceneBtns = this.modalOverlay.querySelectorAll('.scene-select-btn');
    sceneBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-scene') === scene);
    });
  }
}
