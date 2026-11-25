/**
 * SleepyTimer.ts
 * Gentle "Sleepy Bye-Bye" Session Timer for Toddlers.
 * Instead of an abrupt lockout that causes tears, a cozy animated Sleepy Bear
 * glides in, yawns, waves "Bye-bye! Night-night!" (EN / FR), and plays a soft lullaby chime.
 */

import { AudioEngine } from '../audio/AudioEngine';
import { SpeechHelper } from '../learning/SpeechHelper';
import { appPrefs } from '../state/AppPreferences';

export class SleepyTimer {
  private container: HTMLElement;
  private engine: AudioEngine;
  private speech: SpeechHelper;
  private onSleepStart: () => void;
  private onWakeUp: () => void;

  private overlayEl!: HTMLElement;
  private endTimeMs: number | null = null;
  private checkInterval: number | null = null;
  private isSleeping: boolean = false;
  private listeners: Set<(remainingSec: number | null) => void> = new Set();

  // Parent 2-second hold to wake up
  private holdStart: number = 0;
  private holdRaf: number = 0;

  constructor(
    container: HTMLElement,
    callbacks: { onSleepStart: () => void; onWakeUp: () => void }
  ) {
    this.container = container;
    this.engine = AudioEngine.getInstance();
    this.speech = SpeechHelper.getInstance();
    this.onSleepStart = callbacks.onSleepStart;
    this.onWakeUp = callbacks.onWakeUp;

    this.renderOverlay();
  }

  private renderOverlay(): void {
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'sleepy-byebye-overlay';
    this.overlayEl.style.display = 'none';

    this.overlayEl.innerHTML = `
      <div class="sleepy-stars">
        <span class="s-star s1">✦</span>
        <span class="s-star s2">⭐</span>
        <span class="s-star s3">🌙</span>
        <span class="s-star s4">✧</span>
      </div>

      <div class="sleepy-card">
        <div class="sleepy-bear-art">
          <svg viewBox="0 0 220 220" class="sleepy-bear-svg">
            <!-- Nightcap -->
            <path d="M 62 70 Q 110 10 170 46 L 156 84 Z" fill="#4361EE" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/>
            <circle cx="172" cy="46" r="14" fill="#FFD166"/>
            <!-- Ears -->
            <circle cx="64" cy="84" r="24" fill="#C68642" stroke="#8D5524" stroke-width="5"/>
            <circle cx="156" cy="84" r="24" fill="#C68642" stroke="#8D5524" stroke-width="5"/>
            <!-- Head -->
            <circle cx="110" cy="126" r="64" fill="#C68642" stroke="#8D5524" stroke-width="6"/>
            <ellipse cx="110" cy="146" rx="34" ry="26" fill="#FDE2C4"/>
            <!-- Peaceful closed eyes -->
            <path d="M 76 116 Q 88 128 100 116" fill="none" stroke="#1D3557" stroke-width="5" stroke-linecap="round"/>
            <path d="M 120 116 Q 132 128 144 116" fill="none" stroke="#1D3557" stroke-width="5" stroke-linecap="round"/>
            <!-- Cute nose & peaceful smile -->
            <ellipse cx="110" cy="138" rx="12" ry="9" fill="#3D2B1F"/>
            <path d="M 98 154 Q 110 164 122 154" fill="none" stroke="#3D2B1F" stroke-width="4" stroke-linecap="round"/>
            <!-- Rosy cheeks -->
            <circle cx="72" cy="136" r="10" fill="#FF758F" opacity="0.45"/>
            <circle cx="148" cy="136" r="10" fill="#FF758F" opacity="0.45"/>
            <!-- Floating Zzz -->
            <text x="164" y="102" font-size="24" font-weight="900" fill="#FFE066" class="sleepy-zzz">Zzz</text>
          </svg>
        </div>

        <h2 class="sleepy-title" id="sleepy-title">Bye-bye! Time to rest! 🌙</h2>
        <p class="sleepy-subtitle" id="sleepy-subtitle">Sweet dreams, little explorer ✨</p>

        <button class="sleepy-wake-btn" id="sleepy-wake-btn">
          <span class="wake-progress-bar" id="wake-progress-bar"></span>
          <span class="wake-btn-text">Parents: Hold 2s to Resume</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.overlayEl);

    const wakeBtn = this.overlayEl.querySelector('#sleepy-wake-btn') as HTMLElement;
    const bar = this.overlayEl.querySelector('#wake-progress-bar') as HTMLElement;

    const startHold = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.holdStart = Date.now();

      const tick = () => {
        const pct = Math.min(1, (Date.now() - this.holdStart) / 2000);
        bar.style.width = `${pct * 100}%`;
        if (pct >= 1) {
          cancelAnimationFrame(this.holdRaf);
          bar.style.width = '0%';
          this.wakeUp();
        } else {
          this.holdRaf = requestAnimationFrame(tick);
        }
      };
      this.holdRaf = requestAnimationFrame(tick);
    };

    const cancelHold = () => {
      cancelAnimationFrame(this.holdRaf);
      bar.style.width = '0%';
    };

    wakeBtn.addEventListener('pointerdown', startHold);
    wakeBtn.addEventListener('pointerup', cancelHold);
    wakeBtn.addEventListener('pointercancel', cancelHold);
    wakeBtn.addEventListener('pointerleave', cancelHold);
  }

  public setMinutes(minutes: number): void {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (minutes <= 0) {
      this.endTimeMs = null;
      this.notify(null);
      return;
    }

    this.endTimeMs = Date.now() + minutes * 60 * 1000;
    this.notify(minutes * 60);

    this.checkInterval = window.setInterval(() => {
      if (!this.endTimeMs) return;
      const remainingMs = this.endTimeMs - Date.now();
      if (remainingMs <= 0) {
        this.triggerSleep();
      } else {
        this.notify(Math.ceil(remainingMs / 1000));
      }
    }, 1000);
  }

  public getRemainingSeconds(): number | null {
    if (!this.endTimeMs) return null;
    return Math.max(0, Math.ceil((this.endTimeMs - Date.now()) / 1000));
  }

  public subscribe(cb: (remainingSec: number | null) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(remainingSec: number | null): void {
    for (const cb of this.listeners) cb(remainingSec);
  }

  private triggerSleep(): void {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.endTimeMs = null;
    this.notify(null);
    this.isSleeping = true;

    const isFr = appPrefs.get().language === 'fr';
    const titleEl = this.overlayEl.querySelector('#sleepy-title');
    const subEl = this.overlayEl.querySelector('#sleepy-subtitle');
    if (titleEl) {
      titleEl.textContent = isFr ? 'Au revoir ! Fais dodo ! 🌙' : 'Bye-bye! Time to rest! 🌙';
    }
    if (subEl) {
      subEl.textContent = isFr ? 'Fais de beaux rêves, petit trésor ✨' : 'Sweet dreams, little explorer ✨';
    }

    this.onSleepStart();
    this.overlayEl.style.display = 'flex';

    // Gentle descending music box lullaby notes + soothing voice
    const notes = ['C6', 'G5', 'E5', 'C5'];
    notes.forEach((n, idx) => {
      window.setTimeout(() => {
        if (this.isSleeping) {
          this.engine.playMusicBoxNote(n, { volume: 0.55 });
        }
      }, idx * 450);
    });

    window.setTimeout(() => {
      if (this.isSleeping) {
        this.speech.speak(
          isFr ? 'Au revoir ! Petit ours fait dodo. Bonne nuit !' : 'Bye-bye! Little bear is going to sleep. Night night!'
        );
      }
    }, 800);
  }

  public wakeUp(): void {
    this.isSleeping = false;
    this.overlayEl.style.display = 'none';
    this.speech.stop();
    this.onWakeUp();
  }
}
