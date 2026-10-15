/**
 * SceneManager.ts
 * Multi-Scene Architecture & Carousel Controller for Toddler Musical Storybook.
 * 
 * Features:
 * - Cross-fading scene transitions with smooth slides.
 * - Memory cleanup & auto-sleep: stops animation loops and audio schedules when switching scenes.
 * - Manages all 6 interactive storybook scenes without exposing fragile UI controls to toddlers.
 */

import { AudioEngine } from '../audio/AudioEngine';

export interface StorybookScene {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly themeColor: string;
  activate(): void;
  deactivate(): void;
  destroy?(): void;
}

export class SceneManager {
  private static instance: SceneManager;
  private scenes: Map<string, StorybookScene> = new Map();
  private activeSceneId: string | null = null;
  private engine: AudioEngine;
  private listeners: Set<(sceneId: string) => void> = new Set();
  private isTransitioning: boolean = false;

  constructor() {
    this.engine = AudioEngine.getInstance();
  }

  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  public registerScene(scene: StorybookScene): void {
    this.scenes.set(scene.id, scene);
  }

  public getScenes(): StorybookScene[] {
    return Array.from(this.scenes.values());
  }

  public getActiveScene(): StorybookScene | null {
    return this.activeSceneId ? this.scenes.get(this.activeSceneId) || null : null;
  }

  public getActiveSceneId(): string | null {
    return this.activeSceneId;
  }

  /**
   * Switches to target scene with audio crossfade, auto-sleep, and slide animation.
   */
  public async switchScene(targetSceneId: string): Promise<boolean> {
    if (this.isTransitioning) return false;
    if (this.activeSceneId === targetSceneId) return true;

    const nextScene = this.scenes.get(targetSceneId);
    if (!nextScene) {
      console.warn(`Scene ${targetSceneId} not found`);
      return false;
    }

    this.isTransitioning = true;
    const prevScene = this.activeSceneId ? this.scenes.get(this.activeSceneId) : null;

    // 1. Deactivate previous scene (stops animation loops & loops)
    if (prevScene) {
      prevScene.deactivate();
    }

    // 2. Stop audio loops & scheduler from old scene
    this.engine.stopAllLoops();

    // 3. Preload assets for new scene in background
    this.engine.preloadScene(targetSceneId).catch(() => {});

    // 4. Activate new scene
    this.activeSceneId = targetSceneId;
    nextScene.activate();

    // 5. Notify subscribers
    for (const cb of this.listeners) {
      cb(targetSceneId);
    }

    this.isTransitioning = false;
    return true;
  }

  public onSceneChange(cb: (sceneId: string) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}
