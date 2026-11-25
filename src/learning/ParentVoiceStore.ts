/**
 * ParentVoiceStore.ts
 * Local IndexedDB + MediaRecorder store allowing parents to record their own
 * warm voices for Valeria's favorite words & celebrations (100% private, offline).
 * iOS Safari compatible (auto-detects supported audio/mp4 or audio/webm MIME type).
 */

import { AudioEngine } from '../audio/AudioEngine';

export interface VoiceSlotMeta {
  key: string;
  labelEn: string;
  labelFr: string;
  emoji: string;
}

export const PARENT_VOICE_SLOTS: VoiceSlotMeta[] = [
  { key: 'great_job', labelEn: 'Yay! Good job!', labelFr: 'Bravo ! Super !', emoji: '🌟' },
  { key: 'ball', labelEn: 'Ball', labelFr: 'Balle', emoji: '⚽' },
  { key: 'apple', labelEn: 'Apple', labelFr: 'Pomme', emoji: '🍎' },
  { key: 'cow', labelEn: 'Cow (Moo!)', labelFr: 'Vache (Meuh !)', emoji: '🐮' },
  { key: 'dog', labelEn: 'Puppy (Woof!)', labelFr: 'Chien (Ouaf !)', emoji: '🐶' },
  { key: 'cat', labelEn: 'Kitty (Meow!)', labelFr: 'Chat (Miaou !)', emoji: '🐱' },
  { key: 'duck', labelEn: 'Duck (Quack!)', labelFr: 'Canard (Coin !)', emoji: '🦆' },
  { key: 'nose', labelEn: 'Nose (Boop!)', labelFr: 'Le Nez', emoji: '🐻' },
];

const DB_NAME = 'valeria_parent_voices_db';
const STORE_NAME = 'clips';

export class ParentVoiceStore {
  private static instance: ParentVoiceStore;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private recordedKeys: Set<string> = new Set();
  private activeRecorder: MediaRecorder | null = null;
  private activeStream: MediaStream | null = null;
  private currentPlaybackEl: HTMLAudioElement | null = null;

  private constructor() {
    this.refreshRecordedKeys().catch(() => {});
  }

  public static getInstance(): ParentVoiceStore {
    if (!ParentVoiceStore.instance) {
      ParentVoiceStore.instance = new ParentVoiceStore();
    }
    return ParentVoiceStore.instance;
  }

  public isRecordingSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof MediaRecorder !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia
    );
  }

  private openDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.dbPromise;
  }

  public async refreshRecordedKeys(): Promise<Set<string>> {
    try {
      const db = await this.openDb();
      const keys = await new Promise<string[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).getAllKeys();
        req.onsuccess = () => resolve((req.result || []).map(String));
        req.onerror = () => reject(req.error);
      });
      this.recordedKeys = new Set(keys);
    } catch {
      this.recordedKeys = new Set();
    }
    return this.recordedKeys;
  }

  public hasClip(key: string): boolean {
    return this.recordedKeys.has(key);
  }

  public async saveClip(key: string, blob: Blob): Promise<void> {
    const db = await this.openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    this.recordedKeys.add(key);
  }

  public async deleteClip(key: string): Promise<void> {
    const db = await this.openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    this.recordedKeys.delete(key);
  }

  public async playClip(key: string): Promise<boolean> {
    if (!this.recordedKeys.has(key)) return false;
    try {
      const db = await this.openDb();
      const blob = await new Promise<Blob | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result as Blob | undefined);
        req.onerror = () => reject(req.error);
      });
      if (!blob) return false;

      if (this.currentPlaybackEl) {
        this.currentPlaybackEl.pause();
        this.currentPlaybackEl = null;
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = Math.max(0.25, AudioEngine.getInstance().getMasterVolume());
      this.currentPlaybackEl = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (this.currentPlaybackEl === audio) {
          this.currentPlaybackEl = null;
        }
      };
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Records a short voice clip (up to maxDurationMs, default 3.2s) and stores it locally.
   */
  public async startRecording(
    key: string,
    maxDurationMs: number = 3200,
    onAutoStop?: () => void
  ): Promise<void> {
    this.stopRecording();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.activeStream = stream;

    // Pick iOS Safari-friendly MIME type when available
    const mimeCandidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', ''];
    const mimeType = mimeCandidates.find(m => !m || MediaRecorder.isTypeSupported(m)) || '';

    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    this.activeRecorder = recorder;
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/mp4' });
      this.cleanupStream();
      if (blob.size > 200) {
        await this.saveClip(key, blob).catch(() => {});
      }
      onAutoStop?.();
    };

    recorder.start();
    window.setTimeout(() => {
      if (this.activeRecorder === recorder && recorder.state === 'recording') {
        recorder.stop();
      }
    }, maxDurationMs);
  }

  public stopRecording(): void {
    if (this.activeRecorder && this.activeRecorder.state === 'recording') {
      try {
        this.activeRecorder.stop();
      } catch {}
    }
    this.activeRecorder = null;
  }

  private cleanupStream(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(t => t.stop());
      this.activeStream = null;
    }
  }
}
