/**
 * LearningStudio.ts
 * Phase 2: "Little Learner Studio" — Bilingual (English & Français) Learning Lessons
 * crafted specifically for 1-year-olds (12 to 24 months).
 *
 * Zero-failure developmental design:
 * - Oversized, palm-tolerant touch targets (>= 120px)
 * - Immediate warm voice modeling + real acoustic sound feedback
 * - Gentle "Find It!" discovery mode with wiggle-glow cue (never a red X or buzzer)
 * - Discreet 2-second hold / double-tap exit so toddlers stay safely inside the lesson
 */

import confetti from 'canvas-confetti';
import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from './TouchBurstManager';
import { appPrefs, type AppLanguage } from '../state/AppPreferences';
import {
  LESSONS_META,
  WORD_CATEGORIES,
  FIRST_WORDS,
  ANIMAL_FRIENDS,
  COLORS_SHAPES,
  BODY_PARTS,
  COUNTING_WORDS,
  COUNTING_THEMES,
  EMOTIONS,
  UI_STRINGS,
  t,
  type LessonId,
  type LessonCardMeta,
  type WordCategoryId,
  type WordItem,
  type BodyPartItem,
} from '../learning/curriculum';
import {
  getWordSvg,
  getAnimalSvg,
  getShapeSvg,
  getBodyBearSvg,
  getEmotionSvg,
} from '../learning/LessonArt';
import {
  createExtraLessonState,
  renderPeekabooBarn,
  renderShapeSorter,
  renderAbcPhonics,
  renderVehiclesGo,
  renderOppositesPlay,
  renderMouthGym,
  type ExtraLessonContext,
  type ExtraLessonState,
} from '../learning/ExtraLessons';
import { SpeechHelper } from '../learning/SpeechHelper';

export class LearningStudio {
  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;
  private speech: SpeechHelper;
  private onBackToStorybook: () => void;

  private element!: HTMLElement;
  private hubViewEl!: HTMLElement;
  private stageViewEl!: HTMLElement;
  private stageContentEl!: HTMLElement;
  private stageBannerEl!: HTMLElement;
  private coPlayTipBarEl!: HTMLElement;
  private showCoPlayTip: boolean = false;

  // Discreet Parent Exit (2s hold or double-tap)
  private exitBtn!: HTMLElement;
  private exitProgressRing!: SVGCircleElement;
  private holdStartTime: number = 0;
  private holdAnimFrame: number = 0;
  private lastTapTime: number = 0;

  // State
  private isOpen: boolean = false;
  private activeLesson: LessonId | null = null;
  private activeTimeouts: Set<number> = new Set();

  // Per-lesson interactive state
  private firstWordsCategory: WordCategoryId = 'everyday';
  private firstWordsIdx: number = 0;
  private firstWordsMode: 'focus' | 'explore' | 'find' = 'explore';
  private firstWordsTargetId: string = 'ball';

  private countingThemeIdx: number = 0;
  private countingCurrent: number = 0;

  private emotionIdx: number = 0;
  private extraState: ExtraLessonState = createExtraLessonState();

  constructor(
    container: HTMLElement,
    bursts: TouchBurstManager,
    onBackToStorybook: () => void
  ) {
    this.container = container;
    this.bursts = bursts;
    this.engine = AudioEngine.getInstance();
    this.speech = SpeechHelper.getInstance();
    this.onBackToStorybook = onBackToStorybook;

    this.renderShell();
    this.bindShellEvents();

    // Live re-render labels when language changes from ParentGate or Studio pill
    appPrefs.subscribe(() => {
      if (!this.isOpen) return;
      this.renderHubCards();
      this.updateLangPills();
      if (this.activeLesson) {
        this.renderActiveLesson();
      }
    });
  }

  private get lang(): AppLanguage {
    return appPrefs.get().language;
  }

  private safeTimeout(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.activeTimeouts.delete(id);
      if (this.isOpen) fn();
    }, ms);
    this.activeTimeouts.add(id);
    return id;
  }

  private clearTimeouts(): void {
    this.activeTimeouts.forEach(id => clearTimeout(id));
    this.activeTimeouts.clear();
  }

  private renderShell(): void {
    this.element = document.createElement('div');
    this.element.className = 'learning-studio-container';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- 1. LESSON HUB VIEW -->
      <div class="learning-hub-view" id="learning-hub-view">
        <header class="learning-hub-header">
          <button class="learning-back-btn" id="btn-learning-back" aria-label="Back to Storybook">
            <span>⬅️</span>
            <span id="learning-back-label">${t(UI_STRINGS.backToStorybook, this.lang)}</span>
          </button>

          <div class="learning-lang-toggle" role="group" aria-label="Language">
            <button class="lang-pill ${this.lang === 'en' ? 'active' : ''}" data-lang="en">🇬🇧 EN</button>
            <button class="lang-pill ${this.lang === 'fr' ? 'active' : ''}" data-lang="fr">🇫🇷 FR</button>
          </div>
        </header>

        <div class="learning-hub-hero">
          <h1 id="learning-hub-title">🎓 ${t(UI_STRINGS.studioTitle, this.lang)}</h1>
          <p id="learning-hub-subtitle">${t(UI_STRINGS.studioSubtitle, this.lang)}</p>
        </div>

        <div class="learning-cards-grid" id="learning-cards-grid"></div>
      </div>

      <!-- 2. FULLSCREEN LESSON STAGE -->
      <div class="learning-stage-view" id="learning-stage-view" style="display: none;">
        <div class="learning-stage-top">
          <div class="learning-stage-banner" id="learning-stage-banner"></div>

          <div class="learning-stage-controls">
            <button class="stage-tip-btn" id="stage-tip-btn" aria-label="Parent Co-Play Tip" title="Parent Co-Play Tip">
              💡
            </button>

            <button class="stage-lang-btn" id="stage-lang-btn" aria-label="Switch Language">
              ${this.lang === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>

            <div class="theater-exit-btn learning-exit-btn" id="learning-exit-btn" role="button" aria-label="Hold 2s or double-tap to exit lesson">
              <svg class="exit-ring-svg" viewBox="0 0 44 44">
                <circle class="exit-ring-bg" cx="22" cy="22" r="18" />
                <circle class="exit-ring-progress" cx="22" cy="22" r="18" />
              </svg>
              <div class="exit-icon-inner">
                <span class="exit-icon">✕</span>
                <span class="exit-label">HOLD</span>
              </div>
            </div>
          </div>
        </div>

        <div class="coplay-tip-bar" id="coplay-tip-bar" style="display: none;"></div>

        <div class="learning-stage-content" id="learning-stage-content"></div>
      </div>
    `;

    this.container.appendChild(this.element);

    this.hubViewEl = this.element.querySelector('#learning-hub-view') as HTMLElement;
    this.stageViewEl = this.element.querySelector('#learning-stage-view') as HTMLElement;
    this.stageContentEl = this.element.querySelector('#learning-stage-content') as HTMLElement;
    this.stageBannerEl = this.element.querySelector('#learning-stage-banner') as HTMLElement;
    this.coPlayTipBarEl = this.element.querySelector('#coplay-tip-bar') as HTMLElement;
    this.exitBtn = this.element.querySelector('#learning-exit-btn') as HTMLElement;
    this.exitProgressRing = this.exitBtn.querySelector('.exit-ring-progress') as SVGCircleElement;

    const circumference = 2 * Math.PI * 18;
    this.exitProgressRing.style.strokeDasharray = `${circumference}`;
    this.exitProgressRing.style.strokeDashoffset = `${circumference}`;

    this.renderHubCards();
  }

  private renderHubCards(): void {
    const grid = this.element.querySelector('#learning-cards-grid') as HTMLElement;
    const titleEl = this.element.querySelector('#learning-hub-title') as HTMLElement;
    const subEl = this.element.querySelector('#learning-hub-subtitle') as HTMLElement;
    const backLbl = this.element.querySelector('#learning-back-label') as HTMLElement;

    if (titleEl) titleEl.textContent = `🎓 ${t(UI_STRINGS.studioTitle, this.lang)}`;
    if (subEl) subEl.textContent = t(UI_STRINGS.studioSubtitle, this.lang);
    if (backLbl) backLbl.textContent = t(UI_STRINGS.backToStorybook, this.lang);

    grid.innerHTML = LESSONS_META.map(
      (lesson) => `
      <button class="learning-card" data-lesson-id="${lesson.id}" style="--lesson-color: ${lesson.themeColor}; --lesson-accent: ${lesson.accentColor}">
        ${lesson.badge ? `<span class="learning-card-badge">${t(lesson.badge, this.lang)}</span>` : ''}
        <div class="learning-card-icon">${lesson.icon}</div>
        <div class="learning-card-title">${t(lesson.title, this.lang)}</div>
        <div class="learning-card-subtitle">${t(lesson.subtitle, this.lang)}</div>
      </button>
    `
    ).join('');

    grid.querySelectorAll('.learning-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const pe = e as MouseEvent;
        const id = card.getAttribute('data-lesson-id') as LessonId;
        if (!id) return;
        card.classList.add('squash-bounce');
        this.engine.playSound('chime.mp3', { volume: 0.75 });
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 12, '#FFD166');
        this.safeTimeout(() => {
          card.classList.remove('squash-bounce');
          this.openLesson(id);
        }, 160);
      });
    });
  }

  private updateLangPills(): void {
    this.element.querySelectorAll('.lang-pill').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === this.lang);
    });
    const stageBtn = this.element.querySelector('#stage-lang-btn');
    if (stageBtn) {
      stageBtn.textContent = this.lang === 'en' ? '🇬🇧 EN' : '🇫🇷 FR';
    }
  }

  private bindShellEvents(): void {
    // Back to Storybook
    const backBtn = this.element.querySelector('#btn-learning-back') as HTMLElement;
    backBtn.addEventListener('click', () => {
      this.engine.playSound('woodblock.mp3', { volume: 0.7 });
      this.closeStudio();
      this.onBackToStorybook();
    });

    // Hub Language Pills
    this.element.querySelectorAll('.lang-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const lang = pill.getAttribute('data-lang') === 'fr' ? 'fr' : 'en';
        appPrefs.update({ language: lang });
        this.engine.playSound('chime.mp3', { volume: 0.6 });
        this.speech.playStudioVoice('ui_lang', lang === 'fr' ? 'Français !' : 'English!', { lang });
      });
    });

    // Stage Parent Co-Play Tip toggle
    const tipBtn = this.element.querySelector('#stage-tip-btn') as HTMLElement;
    tipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showCoPlayTip = !this.showCoPlayTip;
      this.updateCoPlayTip();
      this.engine.playSound('woodblock.mp3', { volume: 0.55 });
    });

    // Stage quick language toggle
    const stageLangBtn = this.element.querySelector('#stage-lang-btn') as HTMLElement;
    stageLangBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const next: AppLanguage = this.lang === 'en' ? 'fr' : 'en';
      appPrefs.update({ language: next });
      this.engine.playSound('chime.mp3', { volume: 0.6 });
      this.speech.playStudioVoice('ui_lang', next === 'fr' ? 'Français !' : 'English!', { lang: next });
    });

    // Discreet Exit (2-Second Hold OR Double-Tap)
    const circumference = 2 * Math.PI * 18;
    const startHold = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - this.lastTapTime < 380) {
        this.cancelHold();
        this.closeLesson();
        return;
      }
      this.lastTapTime = now;
      this.holdStartTime = now;
      this.exitBtn.classList.add('holding');

      const update = () => {
        const elapsed = Date.now() - this.holdStartTime;
        const progress = Math.min(1.0, elapsed / 2000);
        this.exitProgressRing.style.strokeDashoffset = `${circumference * (1 - progress)}`;
        if (progress >= 1.0) {
          this.cancelHold();
          this.closeLesson();
        } else {
          this.holdAnimFrame = requestAnimationFrame(update);
        }
      };
      this.holdAnimFrame = requestAnimationFrame(update);
    };

    const cancel = () => this.cancelHold();
    this.exitBtn.addEventListener('pointerdown', startHold);
    this.exitBtn.addEventListener('pointerup', cancel);
    this.exitBtn.addEventListener('pointercancel', cancel);
    this.exitBtn.addEventListener('pointerleave', cancel);
  }

  private cancelHold(): void {
    cancelAnimationFrame(this.holdAnimFrame);
    this.exitBtn.classList.remove('holding');
    const circumference = 2 * Math.PI * 18;
    this.exitProgressRing.style.strokeDashoffset = `${circumference}`;
  }

  public openStudio(): void {
    this.isOpen = true;
    this.activeLesson = null;
    this.element.style.display = 'block';
    this.hubViewEl.style.display = 'flex';
    this.stageViewEl.style.display = 'none';
    this.renderHubCards();
    this.updateLangPills();
    // Preload common acoustic SFX used across lessons
    this.preloadLessonAudio();
  }

  public closeStudio(): void {
    this.isOpen = false;
    this.closeLesson();
    this.speech.stop();
    this.clearTimeouts();
    this.element.style.display = 'none';
  }

  private preloadLessonAudio(): void {
    const sounds = [
      'chime.mp3', 'boing.mp3', 'laugh.mp3', 'squeak.mp3', 'woodblock.mp3',
      'fanfare.mp3', 'horn_car.mp3', 'horn_bulb.mp3', 'door_bell.mp3',
      'bubbles.mp3', 'snore.mp3', 'splash.mp3', 'rain.mp3', 'slide_whistle.mp3', 'crystal_ping.mp3',
      'cow.mp3', 'dog.mp3', 'meow.mp3', 'duck.mp3', 'sheep.mp3', 'monkey.mp3', 'elephant.mp3', 'cuckoo.mp3',
      'marimba_C4.mp3', 'marimba_D4.mp3', 'marimba_E4.mp3', 'marimba_G4.mp3', 'marimba_A4.mp3',
      'glock_C5.mp3', 'glock_D5.mp3', 'glock_E5.mp3', 'glock_G5.mp3', 'glock_A5.mp3', 'glock_C6.mp3',
    ];
    for (const s of sounds) {
      this.engine.loadBuffer(s).catch(() => {});
    }
  }

  private getLessonMeta(id: LessonId): LessonCardMeta {
    return LESSONS_META.find((l) => l.id === id) || LESSONS_META[0];
  }

  private updateCoPlayTip(): void {
    const tipBtn = this.element.querySelector('#stage-tip-btn');
    tipBtn?.classList.toggle('active', this.showCoPlayTip);
    if (!this.activeLesson || !this.showCoPlayTip) {
      this.coPlayTipBarEl.style.display = 'none';
      return;
    }
    const meta = this.getLessonMeta(this.activeLesson);
    this.coPlayTipBarEl.style.display = 'block';
    this.coPlayTipBarEl.textContent = `💡 ${t(meta.coPlayTip, this.lang)}`;
  }

  private getExtraContext(): ExtraLessonContext {
    return {
      stageViewEl: this.stageViewEl,
      stageContentEl: this.stageContentEl,
      stageBannerEl: this.stageBannerEl,
      lang: this.lang,
      engine: this.engine,
      speech: this.speech,
      bursts: this.bursts,
      safeTimeout: (fn, ms) => this.safeTimeout(fn, ms),
    };
  }

  public openLesson(lessonId: LessonId): void {
    this.clearTimeouts();
    this.speech.stop();
    this.activeLesson = lessonId;
    this.showCoPlayTip = false;
    this.hubViewEl.style.display = 'none';
    this.stageViewEl.style.display = 'flex';

    // Reset lesson-specific states cleanly
    this.firstWordsCategory = 'everyday';
    this.firstWordsIdx = 0;
    this.firstWordsMode = 'explore';
    this.countingCurrent = 0;
    this.emotionIdx = 0;
    this.extraState = createExtraLessonState();

    this.updateCoPlayTip();
    this.renderActiveLesson();
  }

  public closeLesson(): void {
    this.clearTimeouts();
    this.speech.stop();
    this.activeLesson = null;
    this.showCoPlayTip = false;
    this.coPlayTipBarEl.style.display = 'none';
    this.stageContentEl.innerHTML = '';
    this.stageViewEl.style.background = '';
    this.stageViewEl.style.display = 'none';
    if (this.isOpen) {
      this.hubViewEl.style.display = 'flex';
    }
  }

  private renderActiveLesson(): void {
    if (!this.activeLesson) return;
    this.updateCoPlayTip();
    switch (this.activeLesson) {
      case 'first_words':
        this.renderFirstWordsLesson();
        break;
      case 'peekaboo_barn':
        renderPeekabooBarn(this.getExtraContext(), this.extraState);
        break;
      case 'animal_friends':
        this.renderAnimalFriendsLesson();
        break;
      case 'shape_sorter':
        renderShapeSorter(this.getExtraContext(), this.extraState);
        break;
      case 'colors_shapes':
        this.renderColorsShapesLesson();
        break;
      case 'abc_phonics':
        renderAbcPhonics(this.getExtraContext(), this.extraState);
        break;
      case 'vehicles_go':
        renderVehiclesGo(this.getExtraContext());
        break;
      case 'body_parts':
        this.renderBodyPartsLesson();
        break;
      case 'counting_1_5':
        this.renderCountingLesson();
        break;
      case 'opposites_play':
        renderOppositesPlay(this.getExtraContext(), this.extraState);
        break;
      case 'mouth_gym':
        renderMouthGym(this.getExtraContext(), this.extraState);
        break;
      case 'emotions':
        this.renderEmotionsLesson();
        break;
    }
  }

  // =========================================================================
  // LESSON 1: FIRST WORDS (24 Words, 4 Categories, 1-Card Focus + Explore + Find It!)
  // =========================================================================
  private renderWordArt(word: WordItem): string {
    if (word.emoji) {
      return `<div class="word-emoji-art" aria-hidden="true">${word.emoji}</div>`;
    }
    return getWordSvg(word.id);
  }

  private renderFirstWordsLesson(): void {
    this.stageViewEl.style.background = 'linear-gradient(160deg, #FFF5F5 0%, #FFE3E3 100%)';

    const catWords = FIRST_WORDS.filter((w) => w.category === this.firstWordsCategory);
    const safeWords = catWords.length > 0 ? catWords : FIRST_WORDS;

    const categoryTabsHtml = `
      <div class="fw-cat-row">
        ${WORD_CATEGORIES.map(
          (c) => `
          <button class="fw-cat-pill ${c.id === this.firstWordsCategory ? 'active' : ''}" data-cat-id="${c.id}">
            ${c.icon} ${t(c.label, this.lang)}
          </button>
        `
        ).join('')}
      </div>
    `;

    const modeTabsHtml = `
      <div class="fw-mode-row">
        <button class="fw-mode-pill ${this.firstWordsMode === 'focus' ? 'active' : ''}" data-mode="focus">
          🃏 ${t(UI_STRINGS.focusMode, this.lang)}
        </button>
        <button class="fw-mode-pill ${this.firstWordsMode === 'explore' ? 'active' : ''}" data-mode="explore">
          ✨ ${t(UI_STRINGS.exploreMode, this.lang)}
        </button>
        <button class="fw-mode-pill ${this.firstWordsMode === 'find' ? 'active' : ''}" data-mode="find">
          🔍 ${t(UI_STRINGS.findMode, this.lang)}
        </button>
      </div>
    `;

    // MODE A: Calm 1-Card Flashcard Focus (Their First Words style)
    if (this.firstWordsMode === 'focus') {
      const word = safeWords[this.firstWordsIdx % safeWords.length];
      this.stageBannerEl.textContent = `🃏 ${t(word.label, this.lang)}`;

      this.stageContentEl.innerHTML = `
        ${categoryTabsHtml}
        ${modeTabsHtml}

        <button class="giant-word-card focus-single-card" id="fw-focus-card" data-word-id="${word.id}" style="--card-accent: ${word.color}">
          <div class="word-art-wrap focus-art">${this.renderWordArt(word)}</div>
          <div class="word-label focus-label">${t(word.label, this.lang)}</div>
        </button>

        <div class="fw-focus-controls">
          <button class="mouth-pill-btn slow-btn" id="fw-slow-btn">${t(UI_STRINGS.hearSlow, this.lang)}</button>
          <button class="lesson-next-btn" id="fw-next-btn">${t(UI_STRINGS.next, this.lang)}</button>
        </div>
      `;

      const speakWord = (slow: boolean, x: number, y: number) => {
        const cardEl = this.stageContentEl.querySelector('#fw-focus-card') as HTMLElement | null;
        if (cardEl) {
          cardEl.classList.remove('pop-bounce');
          void cardEl.offsetWidth;
          cardEl.classList.add('pop-bounce');
        }
        this.engine.playSound(word.sfx, { volume: 0.75 });
        this.bursts.spawnBurst(x, y, 14, word.color);
        this.speech.recordInteraction('first_words', t(word.label, this.lang));
        this.speech.playStudioVoice(`fw_${word.id}`, t(word.spoken, this.lang), {
          lang: this.lang,
          slow,
          delayMs: 140,
          parentKey: word.id === 'mama' ? 'call_mama' : word.id === 'dada' ? 'call_dada' : word.id,
        });
      };

      this.stageContentEl.querySelector('#fw-focus-card')?.addEventListener('pointerdown', (e) => {
        const pe = e as PointerEvent;
        e.stopPropagation();
        speakWord(false, pe.clientX, pe.clientY);
      });
      this.stageContentEl.querySelector('#fw-slow-btn')?.addEventListener('pointerdown', (e) => {
        const pe = e as PointerEvent;
        e.stopPropagation();
        speakWord(true, pe.clientX, pe.clientY);
      });
      this.stageContentEl.querySelector('#fw-next-btn')?.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.firstWordsIdx = (this.firstWordsIdx + 1) % safeWords.length;
        this.engine.playSound('chime.mp3', { volume: 0.7 });
        this.renderFirstWordsLesson();
      });

      this.bindFirstWordsTabs();
      return;
    }

    // MODE B & C: 2-Card Explore or Find It!
    const idxA = (this.firstWordsIdx * 2) % safeWords.length;
    const idxB = (idxA + 1) % safeWords.length;
    const pair = [safeWords[idxA], safeWords[idxB]];

    if (this.firstWordsMode === 'find') {
      const target = pair[Math.random() > 0.5 ? 0 : 1];
      this.firstWordsTargetId = target.id;
      this.stageBannerEl.textContent = `🔍 ${t(target.findPrompt, this.lang)}`;
      this.speech.playStudioVoice(`fw_find_${target.id}`, t(target.findPrompt, this.lang), {
        lang: this.lang,
        delayMs: 220,
      });
    } else {
      this.stageBannerEl.textContent = `🍎 ${t(this.getLessonMeta('first_words').title, this.lang)}`;
    }

    this.stageContentEl.innerHTML = `
      ${categoryTabsHtml}
      ${modeTabsHtml}

      <div class="fw-cards-pair">
        ${pair
          .map(
            (w) => `
          <button class="giant-word-card" data-word-id="${w.id}" style="--card-accent: ${w.color}">
            <div class="word-art-wrap">${this.renderWordArt(w)}</div>
            <div class="word-label">${t(w.label, this.lang)}</div>
          </button>
        `
          )
          .join('')}
      </div>

      <button class="lesson-next-btn" id="fw-next-btn">${t(UI_STRINGS.next, this.lang)}</button>
    `;

    this.bindFirstWordsTabs();

    // Next pair
    this.stageContentEl.querySelector('#fw-next-btn')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.firstWordsIdx = (this.firstWordsIdx + 1) % Math.ceil(safeWords.length / 2);
      this.engine.playSound('chime.mp3', { volume: 0.7 });
      this.renderFirstWordsLesson();
    });

    // Giant word card taps
    this.stageContentEl.querySelectorAll('.giant-word-card').forEach((card) => {
      card.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const wordId = card.getAttribute('data-word-id')!;
        const word = pair.find((w) => w.id === wordId);
        if (!word) return;

        card.classList.remove('pop-bounce');
        void (card as HTMLElement).offsetWidth;
        card.classList.add('pop-bounce');

        this.engine.playSound(word.sfx, { volume: 0.85 });
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 14, word.color);
        this.speech.recordInteraction('first_words', t(word.label, this.lang));

        if (this.firstWordsMode === 'find') {
          if (word.id === this.firstWordsTargetId) {
            this.stageBannerEl.textContent = `🌟 ${t(UI_STRINGS.yay, this.lang)}`;
            this.engine.playSound('fanfare.mp3', { volume: 0.65 });
            this.speech.playStudioVoice('ui_yay', t(UI_STRINGS.yay, this.lang), {
              lang: this.lang,
              delayMs: 180,
              parentKey: 'great_job',
            });
            if (!appPrefs.get().bedtimeMode) {
              confetti({ particleCount: 40, spread: 65, origin: { y: 0.65 } });
            }
            this.safeTimeout(() => {
              this.firstWordsIdx = (this.firstWordsIdx + 1) % Math.ceil(safeWords.length / 2);
              this.renderFirstWordsLesson();
            }, 1900);
          } else {
            const targetWord = pair.find((w) => w.id === this.firstWordsTargetId)!;
            this.speech.playStudioVoice(`fw_find_${targetWord.id}`, t(targetWord.findPrompt, this.lang), {
              lang: this.lang,
              delayMs: 180,
            });
            const targetEl = this.stageContentEl.querySelector(`[data-word-id="${this.firstWordsTargetId}"]`);
            targetEl?.classList.add('gentle-hint-glow');
            this.safeTimeout(() => targetEl?.classList.remove('gentle-hint-glow'), 1400);
          }
        } else {
          this.stageBannerEl.textContent = `✨ ${t(word.label, this.lang)}!`;
          this.speech.playStudioVoice(`fw_${word.id}`, t(word.spoken, this.lang), {
            lang: this.lang,
            delayMs: 120,
            parentKey: word.id === 'mama' ? 'call_mama' : word.id === 'dada' ? 'call_dada' : word.id,
          });
        }
      });
    });
  }

  private bindFirstWordsTabs(): void {
    this.stageContentEl.querySelectorAll('.fw-cat-pill').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const cat = btn.getAttribute('data-cat-id') as WordCategoryId;
        if (!cat) return;
        this.firstWordsCategory = cat;
        this.firstWordsIdx = 0;
        this.engine.playSound('woodblock.mp3', { volume: 0.65 });
        this.renderFirstWordsLesson();
      });
    });

    this.stageContentEl.querySelectorAll('.fw-mode-pill').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const m = btn.getAttribute('data-mode');
        this.firstWordsMode = m === 'find' ? 'find' : m === 'focus' ? 'focus' : 'explore';
        this.firstWordsIdx = 0;
        this.engine.playSound('woodblock.mp3', { volume: 0.7 });
        this.renderFirstWordsLesson();
      });
    });
  }

  // =========================================================================
  // LESSON 2: ANIMAL FRIENDS & SOUNDS (Look -> Tap -> Hear -> Imitate)
  // =========================================================================
  private renderAnimalFriendsLesson(): void {
    this.stageViewEl.style.background = 'linear-gradient(160deg, #E8F8EE 0%, #B7E4C7 100%)';
    this.stageBannerEl.textContent = `🐮 ${t(this.getLessonMeta('animal_friends').title, this.lang)}`;

    this.stageContentEl.innerHTML = `
      <div class="animal-grid-6">
        ${ANIMAL_FRIENDS.map(
          (a) => `
          <button class="animal-learn-card" data-animal-id="${a.id}" style="--card-accent: ${a.color}">
            <div class="animal-art-wrap">${getAnimalSvg(a.id)}</div>
            <div class="animal-card-label">${t(a.label, this.lang)}</div>
            <div class="animal-sound-pill">${t(a.soundWord, this.lang)}</div>
          </button>
        `
        ).join('')}
      </div>
    `;

    this.stageContentEl.querySelectorAll('.animal-learn-card').forEach((card) => {
      card.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const id = card.getAttribute('data-animal-id')!;
        const animal = ANIMAL_FRIENDS.find((a) => a.id === id);
        if (!animal) return;

        card.classList.remove('pop-bounce');
        void (card as HTMLElement).offsetWidth;
        card.classList.add('pop-bounce');

        this.stageBannerEl.textContent = `${t(animal.label, this.lang)} — ${t(animal.soundWord, this.lang)}`;
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 16, animal.color);
        this.speech.recordInteraction('animal_friends', t(animal.label, this.lang));

        // 1. Play real acoustic animal sound immediately (exclusive channel so animals never clash!)
        this.engine.playSound(animal.sfx, { volume: 0.88 });
        // 2. Follow with studio human voice (or Mom/Dad's recorded voice) via cancellable delay
        this.speech.playStudioVoice(`animal_${animal.id}`, t(animal.spoken, this.lang), {
          lang: this.lang,
          delayMs: 520,
          parentKey: animal.id,
        });
      });
    });
  }

  // =========================================================================
  // LESSON 3: COLORS & GIANT SHAPES (Pop & Glow)
  // =========================================================================
  private renderColorsShapesLesson(): void {
    this.stageViewEl.style.background = 'linear-gradient(160deg, #FFFDF0 0%, #FFF3B0 100%)';
    this.stageBannerEl.textContent = `⭐ ${t(this.getLessonMeta('colors_shapes').title, this.lang)}`;

    this.stageContentEl.innerHTML = `
      <div class="shapes-grid-6">
        ${COLORS_SHAPES.map(
          (s) => `
          <button class="shape-learn-card" data-shape-id="${s.id}" style="--card-accent: ${s.fill}">
            <div class="shape-art-wrap">${getShapeSvg(s.shape, s.fill, s.stroke)}</div>
            <div class="shape-card-label">${t(s.label, this.lang)}</div>
          </button>
        `
        ).join('')}
      </div>
    `;

    this.stageContentEl.querySelectorAll('.shape-learn-card').forEach((card) => {
      card.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const id = card.getAttribute('data-shape-id')!;
        const item = COLORS_SHAPES.find((s) => s.id === id);
        if (!item) return;

        card.classList.remove('pop-bounce');
        void (card as HTMLElement).offsetWidth;
        card.classList.add('pop-bounce');

        // Flood stage background with a gentle pastel color wash
        this.stageViewEl.style.background = `radial-gradient(circle at 50% 45%, #FFFFFF 0%, ${item.bgTint} 60%, ${item.fill}55 100%)`;
        this.stageBannerEl.textContent = `✨ ${t(item.label, this.lang)}!`;

        this.engine.playGlockNote(item.note, { volume: 0.85 });
        this.bursts.spawnStarGlow(pe.clientX, pe.clientY, 16, item.fill);
        this.speech.playStudioVoice(`shape_${item.id}`, t(item.spoken, this.lang), {
          lang: this.lang,
          delayMs: 110,
        });
        this.speech.recordInteraction('colors_shapes', t(item.label, this.lang));
      });
    });
  }

  // =========================================================================
  // LESSON 4: MY BODY PARTS (Interactive Baby Bear)
  // =========================================================================
  private renderBodyPartsLesson(): void {
    this.stageViewEl.style.background = 'linear-gradient(160deg, #E0FBFC 0%, #ADE8F4 100%)';
    this.stageBannerEl.textContent = `🐻 ${t(UI_STRINGS.tapAnyPart, this.lang)}`;

    this.stageContentEl.innerHTML = `
      <div class="body-bear-stage">
        <div class="body-bear-wrap" id="body-bear-wrap">
          ${getBodyBearSvg(this.lang)}
        </div>
        <div class="body-part-pills">
          ${(Object.keys(BODY_PARTS) as BodyPartItem['id'][]).map((partId) => {
            const p = BODY_PARTS[partId];
            return `<button class="body-pill-btn" data-part="${partId}" style="--pill-color: ${p.color}">${t(p.label, this.lang)}</button>`;
          }).join('')}
        </div>
      </div>
    `;

    const triggerPart = (partId: BodyPartItem['id'], x: number, y: number) => {
      const part = BODY_PARTS[partId];
      if (!part) return;

      const svgPart = this.stageContentEl.querySelector(`.body-part-zone[data-part="${partId}"]`);
      if (svgPart) {
        svgPart.classList.remove('part-wiggle');
        void (svgPart as HTMLElement).getBoundingClientRect();
        svgPart.classList.add('part-wiggle');
      }

      this.stageBannerEl.textContent = `🐻 ${t(part.label, this.lang)}!`;
      this.engine.playSound(part.sfx, { volume: 0.8 });
      this.bursts.spawnBurst(x, y, 14, part.color);
      this.speech.playStudioVoice(`body_${partId}`, t(part.spoken, this.lang), {
        lang: this.lang,
        delayMs: 140,
        parentKey: partId,
      });
      this.speech.recordInteraction('body_parts', t(part.label, this.lang));
    };

    this.stageContentEl.querySelectorAll('.body-part-zone').forEach((zone) => {
      zone.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const partId = zone.getAttribute('data-part') as BodyPartItem['id'];
        triggerPart(partId, pe.clientX, pe.clientY);
      });
    });

    this.stageContentEl.querySelectorAll('.body-pill-btn').forEach((pill) => {
      pill.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        const partId = pill.getAttribute('data-part') as BodyPartItem['id'];
        triggerPart(partId, pe.clientX, pe.clientY);
      });
    });
  }

  // =========================================================================
  // LESSON 5: COUNTING 1 TO 5 (Tap to Count with Ascending Marimba)
  // =========================================================================
  private renderCountingLesson(): void {
    const theme = COUNTING_THEMES[this.countingThemeIdx % COUNTING_THEMES.length];
    const scale = ['C4', 'D4', 'E4', 'G4', 'A4'];

    this.stageViewEl.style.background = 'linear-gradient(160deg, #F3E8FF 0%, #DDD6FE 100%)';
    this.stageBannerEl.textContent = `🎈 ${t(UI_STRINGS.tapToCount, this.lang)}`;

    this.stageContentEl.innerHTML = `
      <div class="counting-stage">
        <div class="counting-number-hero" id="counting-number-hero">
          ${this.countingCurrent > 0 ? this.countingCurrent : '1 – 5'}
        </div>

        <div class="counting-items-row">
          ${[1, 2, 3, 4, 5]
            .map(
              (num) => `
            <button class="counting-item-btn ${num <= this.countingCurrent ? 'counted' : ''}" data-num="${num}" style="--item-color: ${theme.color}">
              <span class="counting-emoji">${theme.emoji}</span>
              <span class="counting-badge">${num}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this.stageContentEl.querySelectorAll('.counting-item-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        if (btn.classList.contains('counted')) {
          // Gentle replay of that number
          const n = parseInt(btn.getAttribute('data-num') || '1', 10);
          this.engine.playInstrumentNote('marimba', scale[n - 1] || 'C4', { volume: 0.85 });
          this.speech.playStudioVoice(`num_${n}`, t(COUNTING_WORDS[n], this.lang), {
            lang: this.lang,
            delayMs: 80,
          });
          this.bursts.spawnBurst(pe.clientX, pe.clientY, 10, theme.color);
          return;
        }

        // Increment count sequentially regardless of which balloon the 1-year-old taps!
        this.countingCurrent = Math.min(5, this.countingCurrent + 1);
        const count = this.countingCurrent;

        btn.classList.add('counted', 'pop-bounce');
        const badge = btn.querySelector('.counting-badge');
        if (badge) badge.textContent = `${count}`;

        const hero = this.stageContentEl.querySelector('#counting-number-hero') as HTMLElement;
        if (hero) {
          hero.textContent = `${count}`;
          hero.classList.remove('pop-bounce');
          void hero.offsetWidth;
          hero.classList.add('pop-bounce');
        }

        this.stageBannerEl.textContent = `${theme.emoji} ${t(COUNTING_WORDS[count], this.lang)}`;
        this.engine.playInstrumentNote('marimba', scale[count - 1] || 'A4', { volume: 0.9 });
        this.bursts.spawnBurst(pe.clientX, pe.clientY, 14, theme.color);
        this.speech.playStudioVoice(`num_${count}`, t(COUNTING_WORDS[count], this.lang), {
          lang: this.lang,
          delayMs: 80,
        });
        this.speech.recordInteraction('counting_1_5', `${count}`);

        if (count >= 5) {
          this.engine.playSound('fanfare.mp3', { volume: 0.7 });
          if (!appPrefs.get().bedtimeMode) {
            confetti({ particleCount: 55, spread: 75, origin: { y: 0.6 } });
          }
          this.safeTimeout(() => {
            this.countingCurrent = 0;
            this.countingThemeIdx = (this.countingThemeIdx + 1) % COUNTING_THEMES.length;
            this.renderCountingLesson();
          }, 2200);
        }
      });
    });
  }

  // =========================================================================
  // LESSON 6: EMOTIONS & PEEK-A-BOO FACES
  // =========================================================================
  private renderEmotionsLesson(): void {
    const emotion = EMOTIONS[this.emotionIdx % EMOTIONS.length];
    this.stageViewEl.style.background = emotion.bgGradient;
    this.stageBannerEl.textContent = `😊 ${t(emotion.label, this.lang)}`;

    this.stageContentEl.innerHTML = `
      <div class="emotion-stage">
        <button class="emotion-hero-btn" id="emotion-hero-btn" aria-label="${t(emotion.label, this.lang)}">
          ${getEmotionSvg(emotion.id)}
          <span class="emotion-hero-label">${t(emotion.label, this.lang)}</span>
        </button>

        <div class="emotion-dots-row">
          ${EMOTIONS.map(
            (em, idx) => `
            <button class="emotion-dot-btn ${idx === this.emotionIdx ? 'active' : ''}" data-em-idx="${idx}">
              ${t(em.label, this.lang)}
            </button>
          `
          ).join('')}
        </div>
      </div>
    `;

    const playCurrentEmotion = (x: number, y: number) => {
      const em = EMOTIONS[this.emotionIdx % EMOTIONS.length];
      this.engine.playSound(em.sfx, { volume: 0.8 });
      this.bursts.spawnBurst(x, y, 16, '#FFD166');
      this.speech.playStudioVoice(`emo_${em.id}`, t(em.spoken, this.lang), {
        lang: this.lang,
        delayMs: 180,
      });
      this.speech.recordInteraction('emotions', t(em.label, this.lang));
    };

    const heroBtn = this.stageContentEl.querySelector('#emotion-hero-btn') as HTMLElement;
    heroBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const pe = e as PointerEvent;
      // Cycle to next joyful face on tap!
      this.emotionIdx = (this.emotionIdx + 1) % EMOTIONS.length;
      this.renderEmotionsLesson();
      playCurrentEmotion(pe.clientX, pe.clientY);
    });

    this.stageContentEl.querySelectorAll('.emotion-dot-btn').forEach((dot) => {
      dot.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const pe = e as PointerEvent;
        this.emotionIdx = parseInt(dot.getAttribute('data-em-idx') || '0', 10);
        this.renderEmotionsLesson();
        playCurrentEmotion(pe.clientX, pe.clientY);
      });
    });
  }
}
