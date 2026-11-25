/**
 * AppPreferences.ts
 * Lightweight, localStorage-backed user preferences store for Valeria's Musical Storybook.
 * Persists volume, language (English / French), instrument, audio mode, infant lock, and last scene.
 */

import type { InstrumentType } from '../audio/AudioEngine';

export type AppLanguage = 'en' | 'fr';
export type AudioMode = 'song' | 'ensemble' | 'free';

export interface PreferencesState {
  language: AppLanguage;
  masterVolume: number;
  audioMode: AudioMode;
  instrument: InstrumentType;
  infantLock: boolean;
  bedtimeMode: boolean;
  lastScene: string;
}

const STORAGE_KEY = 'valeria_storybook_prefs_v1';

const DEFAULT_PREFS: PreferencesState = {
  language: 'en',
  masterVolume: 0.85,
  audioMode: 'ensemble',
  instrument: 'marimba',
  infantLock: false,
  bedtimeMode: false,
  lastScene: 'wheels',
};

type PrefListener = (state: Readonly<PreferencesState>) => void;

class AppPreferencesStore {
  private state: PreferencesState;
  private listeners: Set<PrefListener> = new Set();

  constructor() {
    this.state = this.load();
  }

  private load(): PreferencesState {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_PREFS };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PREFS };
      const parsed = JSON.parse(raw) as Partial<PreferencesState>;
      return {
        language: parsed.language === 'fr' ? 'fr' : 'en',
        masterVolume:
          typeof parsed.masterVolume === 'number' && !Number.isNaN(parsed.masterVolume)
            ? Math.max(0, Math.min(1, parsed.masterVolume))
            : DEFAULT_PREFS.masterVolume,
        audioMode:
          parsed.audioMode === 'song' || parsed.audioMode === 'ensemble' || parsed.audioMode === 'free'
            ? parsed.audioMode
            : DEFAULT_PREFS.audioMode,
        instrument: typeof parsed.instrument === 'string' ? (parsed.instrument as InstrumentType) : DEFAULT_PREFS.instrument,
        infantLock: Boolean(parsed.infantLock),
        bedtimeMode: Boolean(parsed.bedtimeMode),
        lastScene: typeof parsed.lastScene === 'string' && parsed.lastScene.length > 0 ? parsed.lastScene : DEFAULT_PREFS.lastScene,
      };
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }

  private save(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore storage quota / private mode errors
    }
  }

  public get(): Readonly<PreferencesState> {
    return this.state;
  }

  public update(patch: Partial<PreferencesState>): void {
    this.state = { ...this.state, ...patch };
    this.save();
    for (const cb of this.listeners) {
      cb(this.state);
    }
  }

  public subscribe(cb: PrefListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

export const appPrefs = new AppPreferencesStore();
