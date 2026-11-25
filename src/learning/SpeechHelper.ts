/**
 * SpeechHelper.ts
 * Warm, toddler-paced bilingual speech synthesis (English & Français) + local learning stats.
 */

import { appPrefs, type AppLanguage } from '../state/AppPreferences';
import type { LessonId } from './curriculum';
import { ParentVoiceStore } from './ParentVoiceStore';

const STATS_KEY = 'valeria_learning_stats_v1';

export interface LearningStats {
  totalTaps: number;
  byLesson: Partial<Record<LessonId, number>>;
  recentWords: string[];
}

export class SpeechHelper {
  private static instance: SpeechHelper;
  private cachedVoices: SpeechSynthesisVoice[] = [];

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

  public speak(text: string, langOverride?: AppLanguage): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const lang = langOverride || appPrefs.get().language;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
      utter.rate = 0.88;  // Clear, gentle pace for a 1-year-old
      utter.pitch = 1.18; // Warm, friendly caregiver tone
      utter.volume = Math.max(0.25, appPrefs.get().masterVolume);

      if (this.cachedVoices.length === 0) {
        this.refreshVoices();
      }

      const preferredNames =
        lang === 'fr'
          ? ['Amélie', 'Amelie', 'Audrey', 'Marie', 'Thomas', 'Denise', 'Natural']
          : ['Samantha', 'Karen', 'Nicky', 'Victoria', 'Aria', 'Zira', 'Natural'];

      const matchingLang = this.cachedVoices.filter(v =>
        v.lang.toLowerCase().startsWith(lang)
      );

      const preferred =
        matchingLang.find(v => preferredNames.some(n => v.name.includes(n))) ||
        matchingLang[0];

      if (preferred) {
        utter.voice = preferred;
      }

      window.speechSynthesis.speak(utter);
    } catch {
      // Gracefully ignore speech errors on restricted devices
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  /**
   * Plays a parent's custom recorded voice clip for `key` if one exists in IndexedDB;
   * otherwise falls back seamlessly to warm bilingual speech synthesis.
   */
  public async speakForKey(key: string, fallbackText: string, langOverride?: AppLanguage): Promise<void> {
    const store = ParentVoiceStore.getInstance();
    if (store.hasClip(key)) {
      const played = await store.playClip(key);
      if (played) return;
    }
    this.speak(fallbackText, langOverride);
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

  public resetStats(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(STATS_KEY);
    } catch {}
  }

  public recordInteraction(lessonId: LessonId, wordLabel?: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(STATS_KEY);
      const stats: LearningStats = raw
        ? JSON.parse(raw)
        : { totalTaps: 0, byLesson: {}, recentWords: [] };

      stats.totalTaps = (stats.totalTaps || 0) + 1;
      stats.byLesson = stats.byLesson || {};
      stats.byLesson[lessonId] = (stats.byLesson[lessonId] || 0) + 1;

      if (wordLabel) {
        stats.recentWords = [wordLabel, ...(stats.recentWords || []).filter(w => w !== wordLabel)].slice(0, 12);
      }

      window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // Ignore storage quota errors
    }
  }
}
