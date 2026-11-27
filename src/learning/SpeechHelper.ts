/**
 * SpeechHelper.ts
 * Studio Human Neural Voice Player (English & Français) + Local Learning Stats.
 *
 * Priority order (ZERO robotic AI bot voice!):
 *  1. Mom/Dad's custom recorded voice clip in ParentVoiceStore (if recorded)
 *  2. Pre-generated Studio Human Neural Voice MP3 (`audio/voices/<en|fr>/<key>.mp3`)
 *     routed through AudioEngine's exclusive voice bus (auto-ducks music, never overlaps!)
 *  3. Graceful Web Speech fallback only if a clip isn't available offline
 */

import { AudioEngine } from '../audio/AudioEngine';
import { appPrefs, type AppLanguage } from '../state/AppPreferences';
import type { LessonId } from './curriculum';
import { ParentVoiceStore } from './ParentVoiceStore';

const STATS_KEY = 'valeria_learning_stats_v1';

export interface LearningStats {
  totalTaps: number;
  byLesson: Partial<Record<LessonId, number>>;
  recentWords: string[];
}

export interface StudioVoiceOptions {
  lang?: AppLanguage;
  slow?: boolean;
  delayMs?: number;
  parentKey?: string;
}

export class SpeechHelper {
  private static instance: SpeechHelper;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private pendingTimer: number | null = null;

  // Map short scene/contact voice keys to their generated studio MP3 filenames
  private static readonly VOICE_KEY_ALIASES: Record<string, string> = {
    cow: 'animal_cow',
    dog: 'animal_dog',
    cat: 'animal_cat',
    duck: 'animal_duck',
    monkey: 'animal_monkey',
    sheep: 'animal_sheep',
    mama: 'fw_mama',
    call_mama: 'fw_mama',
    dada: 'fw_dada',
    call_dada: 'fw_dada',
    great_job: 'ui_yay',
  };

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.refreshVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        this.refreshVoices();
      });
    }
  }

  public static getInstance(): SpeechHelper {
    if (!SpeechHelper.instance) {
      SpeechHelper.instance = new SpeechHelper();
    }
    return SpeechHelper.instance;
  }

  private refreshVoices(): void {
    try {
      this.cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch {
      this.cachedVoices = [];
    }
  }

  private cancelPending(): void {
    if (this.pendingTimer !== null) {
      window.clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }

  /**
   * Plays a warm, real studio human voice MP3 (or Mom/Dad's recorded clip) on an
   * exclusive monophonic channel. Cancels any pending delayed voice immediately so
   * rapid toddler taps NEVER clash or overlap!
   */
  public playStudioVoice(
    voiceKey: string,
    fallbackText: string,
    opts: StudioVoiceOptions = {}
  ): void {
    this.cancelPending();
    const engine = AudioEngine.getInstance();
    engine.stopVoiceClip();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }

    const run = async () => {
      this.pendingTimer = null;
      const lang = opts.lang || appPrefs.get().language;

      // 1. Custom Parent Voice recording takes #1 priority if Mom/Dad recorded it
      const parentLookupKey = opts.parentKey || voiceKey;
      if (parentLookupKey) {
        const store = ParentVoiceStore.getInstance();
        if (store.hasClip(parentLookupKey)) {
          engine.duckMusic(2200);
          const played = await store.playClip(parentLookupKey);
          if (played) return;
        }
      }

      // 2. Real Studio Human Neural Voice MP3 (with alias mapping for scene/contact keys)
      const resolvedKey = SpeechHelper.VOICE_KEY_ALIASES[voiceKey] || voiceKey;
      const clipPath = `voices/${lang}/${resolvedKey}.mp3`;
      const rate = opts.slow ? 0.80 : 1.0;
      const playedStudio = await engine.playVoiceClip(clipPath, { rate, volume: 1.0 });
      if (playedStudio) return;

      // 3. Offline fallback only if MP3 couldn't load
      this.speakFallback(fallbackText, lang, opts.slow ? 0.72 : 0.88);
    };

    if (opts.delayMs && opts.delayMs > 0) {
      this.pendingTimer = window.setTimeout(() => {
        run().catch(() => {});
      }, opts.delayMs);
    } else {
      run().catch(() => {});
    }
  }

  /**
   * Backwards-compatible speak helper (uses Web Speech fallback when no studio key is given).
   */
  public speak(text: string, langOverride?: AppLanguage, rateOverride?: number): void {
    this.cancelPending();
    AudioEngine.getInstance().stopVoiceClip();
    const lang = langOverride || appPrefs.get().language;
    this.speakFallback(text, lang, rateOverride);
  }

  private speakFallback(text: string, lang: AppLanguage, rateOverride?: number): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
      utter.rate = typeof rateOverride === 'number' ? rateOverride : 0.88;
      utter.pitch = 1.12;
      utter.volume = Math.max(0.25, appPrefs.get().masterVolume * appPrefs.get().sfxVolume);

      if (this.cachedVoices.length === 0) {
        this.refreshVoices();
      }

      const preferredNames =
        lang === 'fr'
          ? ['Amélie', 'Amelie', 'Audrey', 'Marie', 'Thomas', 'Denise', 'Natural']
          : ['Samantha', 'Karen', 'Nicky', 'Victoria', 'Aria', 'Ava', 'Natural'];

      const matchingLang = this.cachedVoices.filter((v) =>
        v.lang.toLowerCase().startsWith(lang)
      );

      const preferred =
        matchingLang.find((v) => preferredNames.some((n) => v.name.includes(n))) ||
        matchingLang[0];

      if (preferred) {
        utter.voice = preferred;
      }

      AudioEngine.getInstance().duckMusic(1800);
      window.speechSynthesis.speak(utter);
    } catch {
      // Gracefully ignore speech errors on restricted devices
    }
  }

  public stop(): void {
    this.cancelPending();
    AudioEngine.getInstance().stopVoiceClip();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  /**
   * Plays a parent's custom recorded voice clip for `key` if one exists in IndexedDB;
   * otherwise falls back to studio human voice or speech synthesis.
   */
  public async speakForKey(key: string, fallbackText: string, langOverride?: AppLanguage): Promise<void> {
    this.playStudioVoice(key, fallbackText, { lang: langOverride, parentKey: key });
  }

  public getStats(): LearningStats {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { totalTaps: 0, byLesson: {}, recentWords: [] };
    }
    try {
      const raw = window.localStorage.getItem(STATS_KEY);
      if (!raw) return { totalTaps: 0, byLesson: {}, recentWords: [] };
      const parsed = JSON.parse(raw) as Partial<LearningStats>;
      return {
        totalTaps: parsed.totalTaps || 0,
        byLesson: parsed.byLesson || {},
        recentWords: parsed.recentWords || [],
      };
    } catch {
      return { totalTaps: 0, byLesson: {}, recentWords: [] };
    }
  }

  public recordInteraction(lessonId: LessonId, wordLabel: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const stats = this.getStats();
      stats.totalTaps += 1;
      stats.byLesson[lessonId] = (stats.byLesson[lessonId] || 0) + 1;
      const clean = wordLabel.trim();
      if (clean && stats.recentWords[0] !== clean) {
        stats.recentWords = [clean, ...stats.recentWords.filter((w) => w !== clean)].slice(0, 12);
      }
      window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // Ignore storage quota errors
    }
  }

  public resetStats(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(STATS_KEY);
    } catch {}
  }
}
