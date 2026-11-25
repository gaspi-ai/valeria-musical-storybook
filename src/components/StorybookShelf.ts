/**
 * StorybookShelf.ts
 * Phase 3: Visual, Toddler-Friendly Picture-Book Home Shelf.
 * Provides oversized, colorful cards for switching between all 9 Storybook Scenes,
 * the Little Learner Studio (EN/FR), and the Toddler Songs Jukebox.
 * Automatically hidden when Infant Lock is active.
 */

import { AudioEngine } from '../audio/AudioEngine';
import { appPrefs } from '../state/AppPreferences';
import type { StorybookScene } from '../scenes/SceneManager';

export interface ShelfCallbacks {
  onSelectScene: (sceneId: string) => void;
  onOpenLearning: () => void;
  onOpenJukebox: () => void;
}

export class StorybookShelf {
  private container: HTMLElement;
  private scenes: StorybookScene[];
  private callbacks: ShelfCallbacks;
  private engine: AudioEngine;
  private overlayEl!: HTMLElement;

  constructor(container: HTMLElement, scenes: StorybookScene[], callbacks: ShelfCallbacks) {
    this.container = container;
    this.scenes = scenes;
    this.callbacks = callbacks;
    this.engine = AudioEngine.getInstance();
    this.render();
  }

  private render(): void {
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'storybook-shelf-overlay';
    this.overlayEl.style.display = 'none';
    this.container.appendChild(this.overlayEl);
    this.renderContent();
  }

  private renderContent(): void {
    const isFr = appPrefs.get().language === 'fr';
    const activeSceneId = appPrefs.get().lastScene;

    this.overlayEl.innerHTML = `
      <div class="shelf-sheet">
        <header class="shelf-header">
          <div>
            <h2>📚 ${isFr ? 'Bibliothèque de Valeria' : "Valeria's Storybook Shelf"}</h2>
            <p>${isFr ? 'Choisis une histoire, une leçon ou une chanson !' : 'Pick a story, a learning lesson, or a song!'}</p>
          </div>
          <button class="shelf-close-btn" id="shelf-close-btn" aria-label="Close">✕</button>
        </header>

        <div class="shelf-featured-row">
          <button class="shelf-feature-card feat-learn" id="shelf-open-learn">
            <span class="feat-icon">🎓</span>
            <div class="feat-text">
              <strong>${isFr ? 'Atelier Petit Explorateur' : 'Little Learner Studio'}</strong>
              <span>${isFr ? '6 leçons (EN / FR)' : '6 Gentle 1-Year-Old Lessons'}</span>
            </div>
          </button>

          <button class="shelf-feature-card feat-songs" id="shelf-open-songs">
            <span class="feat-icon">🎶</span>
            <div class="feat-text">
              <strong>${isFr ? 'Jukebox Chansons' : 'Toddler Songs Jukebox'}</strong>
              <span>${isFr ? '6 chansons animées' : '6 Animated Sing-Alongs'}</span>
            </div>
          </button>
        </div>

        <div class="shelf-scenes-grid">
          ${this.scenes
            .map(
              (s) => `
            <button class="shelf-scene-card ${s.id === activeSceneId ? 'active' : ''}" data-scene-id="${s.id}" style="--scene-tint: ${s.themeColor}">
              <span class="shelf-scene-icon">${s.icon}</span>
              <span class="shelf-scene-title">${s.title}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this.overlayEl.querySelector('#shelf-close-btn')?.addEventListener('click', () => {
      this.close();
    });

    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) this.close();
    });

    this.overlayEl.querySelector('#shelf-open-learn')?.addEventListener('click', () => {
      this.engine.playSound('chime.mp3', { volume: 0.7 });
      this.close();
      this.callbacks.onOpenLearning();
    });

    this.overlayEl.querySelector('#shelf-open-songs')?.addEventListener('click', () => {
      this.engine.playSound('chime.mp3', { volume: 0.7 });
      this.close();
      this.callbacks.onOpenJukebox();
    });

    this.overlayEl.querySelectorAll('.shelf-scene-card').forEach((card) => {
      card.addEventListener('click', () => {
        const sceneId = card.getAttribute('data-scene-id');
        if (!sceneId) return;
        this.engine.playSound('chime.mp3', { volume: 0.7 });
        this.close();
        this.callbacks.onSelectScene(sceneId);
      });
    });
  }

  public open(): void {
    this.renderContent();
    this.overlayEl.style.display = 'flex';
  }

  public close(): void {
    this.overlayEl.style.display = 'none';
  }
}
