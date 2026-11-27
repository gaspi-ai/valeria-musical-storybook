/**
 * ExtraLessons.ts
 * 6 Brand-New Flagship Bilingual Infant Lessons cloned from the best-rated
 * 12–24 month learning apps:
 *  - Peekaboo Barn (Peekaboo Barn)
 *  - Montessori Shape Sorter (Bimi Boo / Fisher-Price)
 *  - ABC Letter Blocks (Bimi Boo / Baby First Words)
 *  - Things That Go! Vehicles (Bimi Boo / Baby First Words)
 *  - Big & Small Opposites (Fisher-Price Laugh & Learn)
 *  - Baby Sound Mirror / Mouth Gym (Speech Blubs)
 */

import confetti from 'canvas-confetti';
import type { AudioEngine } from '../audio/AudioEngine';
import type { TouchBurstManager } from '../components/TouchBurstManager';
import type { AppLanguage } from '../state/AppPreferences';
import type { SpeechHelper } from './SpeechHelper';
import {
  BARN_ANIMALS,
  COLORS_SHAPES,
  ABC_ITEMS,
  VEHICLES,
  OPPOSITES_PAIRS,
  MOUTH_SOUNDS,
  UI_STRINGS,
  t,
  type MouthShape,
} from './curriculum';
import { getShapeSvg } from './LessonArt';

export interface ExtraLessonContext {
  stageViewEl: HTMLElement;
  stageContentEl: HTMLElement;
  stageBannerEl: HTMLElement;
  lang: AppLanguage;
  engine: AudioEngine;
  speech: SpeechHelper;
  bursts: TouchBurstManager;
  safeTimeout: (fn: () => void, ms: number) => number;
}

export interface ExtraLessonState {
  barnIdx: number;
  barnOpen: boolean;
  sorterSetIdx: number;
  sorterMatched: Set<string>;
  abcGroupIdx: number;
  abcSelectedLetter: string;
  oppositeIdx: number;
  mouthIdx: number;
}

export function createExtraLessonState(): ExtraLessonState {
  return {
    barnIdx: 0,
    barnOpen: false,
    sorterSetIdx: 0,
    sorterMatched: new Set<string>(),
    abcGroupIdx: 0,
    abcSelectedLetter: 'A',
    oppositeIdx: 0,
    mouthIdx: 0,
  };
}

// ============================================================================
// 1. PEEKABOO BARN (Cloned from Peekaboo Barn)
// ============================================================================
export function renderPeekabooBarn(ctx: ExtraLessonContext, st: ExtraLessonState): void {
  const animal = BARN_ANIMALS[st.barnIdx % BARN_ANIMALS.length];
  ctx.stageViewEl.style.background = st.barnOpen
    ? `linear-gradient(160deg, ${animal.bgTint} 0%, #FFFDF7 100%)`
    : 'linear-gradient(160deg, #A2D2FF 0%, #E0FBFC 55%, #C7F9CC 100%)';

  ctx.stageBannerEl.textContent = st.barnOpen
    ? `${animal.emoji} ${t(animal.label, ctx.lang)} — ${t(animal.soundWord, ctx.lang)}`
    : `🏠 ${t(UI_STRINGS.whoIsInside, ctx.lang)}`;

  ctx.stageContentEl.innerHTML = `
    <div class="barn-stage-wrap">
      <button class="barn-house ${st.barnOpen ? 'is-open' : 'is-wiggling'}" id="barn-tap-target" aria-label="Open Barn Doors">
        <div class="barn-roof">
          <div class="barn-loft-window"></div>
        </div>
        <div class="barn-body">
          <div class="barn-interior">
            <div class="barn-animal-emoji">${animal.emoji}</div>
            <div class="barn-animal-name">${t(animal.label, ctx.lang)}</div>
            <div class="barn-animal-sound">${t(animal.soundWord, ctx.lang)}</div>
          </div>
          <div class="barn-door barn-door-left">
            <div class="barn-door-x"></div>
          </div>
          <div class="barn-door barn-door-right">
            <div class="barn-door-x"></div>
          </div>
        </div>
      </button>

      <div class="barn-action-row">
        <button class="barn-hint-btn" id="barn-peek-sound-btn">
          👂 ${ctx.lang === 'fr' ? 'Écouter le bruit !' : 'Hear Clue Sound!'}
        </button>
        <button class="lesson-next-btn" id="barn-next-btn">
          ${st.barnOpen ? t(UI_STRINGS.next, ctx.lang) : (ctx.lang === 'fr' ? 'OUVRIR ! 🚪' : 'OPEN! 🚪')}
        </button>
      </div>
    </div>
  `;

  // Play soft clue sound when doors are closed
  if (!st.barnOpen) {
    ctx.safeTimeout(() => {
      ctx.engine.playSound(animal.sfx, { volume: 0.55 });
    }, 260);
  }

  const toggleBarn = (clientX: number, clientY: number) => {
    if (!st.barnOpen) {
      st.barnOpen = true;
      ctx.engine.playSound('woodblock.mp3', { volume: 0.7 });
      ctx.safeTimeout(() => ctx.engine.playSound(animal.sfx, { volume: 0.9 }), 100);
      ctx.speech.playStudioVoice(`barn_${animal.id}`, t(animal.revealSpeech, ctx.lang), {
        lang: ctx.lang,
        delayMs: 420,
        parentKey: animal.id,
      });
      ctx.speech.recordInteraction('peekaboo_barn', t(animal.label, ctx.lang));
      ctx.bursts.spawnBurst(clientX, clientY, 18, '#FFD166');
      confetti({ particleCount: 28, spread: 60, origin: { y: 0.55 } });
      renderPeekabooBarn(ctx, st);
    } else {
      st.barnOpen = false;
      st.barnIdx = (st.barnIdx + 1) % BARN_ANIMALS.length;
      ctx.engine.playSound('woodblock.mp3', { volume: 0.7 });
      renderPeekabooBarn(ctx, st);
    }
  };

  ctx.stageContentEl.querySelector('#barn-tap-target')?.addEventListener('pointerdown', (e) => {
    const pe = e as PointerEvent;
    e.stopPropagation();
    toggleBarn(pe.clientX, pe.clientY);
  });

  ctx.stageContentEl.querySelector('#barn-peek-sound-btn')?.addEventListener('pointerdown', (e) => {
    const pe = e as PointerEvent;
    e.stopPropagation();
    ctx.engine.playSound(animal.sfx, { volume: 0.85 });
    ctx.bursts.spawnBurst(pe.clientX, pe.clientY, 10, '#FFD166');
  });

  ctx.stageContentEl.querySelector('#barn-next-btn')?.addEventListener('pointerdown', (e) => {
    const pe = e as PointerEvent;
    e.stopPropagation();
    toggleBarn(pe.clientX, pe.clientY);
  });
}

// ============================================================================
// 2. MONTESSORI SHAPE SORTER (Cloned from Bimi Boo & Fisher-Price)
// ============================================================================
export function renderShapeSorter(ctx: ExtraLessonContext, st: ExtraLessonState): void {
  ctx.stageViewEl.style.background = 'linear-gradient(160deg, #FFF7ED 0%, #FDE68A 100%)';
  const start = (st.sorterSetIdx % 2) * 3;
  const shapes = COLORS_SHAPES.slice(start, start + 3);
  const allDone = shapes.every((s) => st.sorterMatched.has(s.id));

  ctx.stageBannerEl.textContent = allDone
    ? `🌟 ${t(UI_STRINGS.yay, ctx.lang)}`
    : `🧩 ${t(UI_STRINGS.tapShapeMatch, ctx.lang)}`;

  ctx.stageContentEl.innerHTML = `
    <div class="sorter-wrap">
      <div class="sorter-wood-board">
        ${shapes
          .map((s) => {
            const matched = st.sorterMatched.has(s.id);
            return `
            <div class="sorter-slot ${matched ? 'is-matched' : 'is-waiting'}" data-slot-id="${s.id}">
              <div class="sorter-slot-shape ${matched ? 'filled' : 'outline'}">
                ${getShapeSvg(s.shape, matched ? s.fill : '#D6C3A5', matched ? s.stroke : '#B08968')}
              </div>
              <div class="sorter-slot-label">${matched ? t(s.label, ctx.lang) : '?'}</div>
            </div>
          `;
          })
          .join('')}
      </div>

      <div class="sorter-blocks-tray">
        ${shapes
          .slice()
          .reverse()
          .map((s) => {
            const matched = st.sorterMatched.has(s.id);
            return `
            <button class="sorter-block-btn ${matched ? 'is-placed' : ''}" data-block-id="${s.id}" ${matched ? 'disabled' : ''} aria-label="${t(s.label, ctx.lang)}">
              <div class="sorter-block-svg">${getShapeSvg(s.shape, s.fill, s.stroke)}</div>
              <span class="sorter-block-name">${t(s.label, ctx.lang)}</span>
            </button>
          `;
          })
          .join('')}
      </div>

      <button class="lesson-next-btn" id="sorter-next-btn">
        ${ctx.lang === 'fr' ? 'NOUVEAU PLATEAU ➔' : 'NEW BOARD ➔'}
      </button>
    </div>
  `;

  ctx.stageContentEl.querySelectorAll('.sorter-block-btn').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      e.stopPropagation();
      const id = btn.getAttribute('data-block-id');
      const item = shapes.find((s) => s.id === id);
      if (!item || st.sorterMatched.has(item.id)) return;

      st.sorterMatched.add(item.id);
      ctx.engine.playSound('woodblock.mp3', { volume: 0.85 });
      ctx.safeTimeout(() => ctx.engine.playSound(`glock_${item.note}.mp3`, { volume: 0.85 }), 90);
      ctx.speech.playStudioVoice(`shape_${item.id}`, t(item.spoken, ctx.lang), {
        lang: ctx.lang,
        delayMs: 140,
      });
      ctx.speech.recordInteraction('shape_sorter', t(item.label, ctx.lang));
      ctx.bursts.spawnBurst(pe.clientX, pe.clientY, 16, item.fill);

      const completedNow = shapes.every((s) => st.sorterMatched.has(s.id));
      renderShapeSorter(ctx, st);

      if (completedNow) {
        ctx.safeTimeout(() => {
          ctx.engine.playSound('fanfare.mp3', { volume: 0.85 });
          confetti({ particleCount: 45, spread: 75, origin: { y: 0.5 } });
        }, 250);
        ctx.safeTimeout(() => {
          st.sorterMatched.clear();
          st.sorterSetIdx = (st.sorterSetIdx + 1) % 2;
          renderShapeSorter(ctx, st);
        }, 2200);
      }
    });
  });

  ctx.stageContentEl.querySelector('#sorter-next-btn')?.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    st.sorterMatched.clear();
    st.sorterSetIdx = (st.sorterSetIdx + 1) % 2;
    ctx.engine.playSound('woodblock.mp3', { volume: 0.7 });
    renderShapeSorter(ctx, st);
  });
}

// ============================================================================
// 3. ABC LETTER BLOCKS (Cloned from Bimi Boo & Baby First Words)
// ============================================================================
const ABC_GROUPS = [
  { label: 'A–F', start: 0, end: 6 },
  { label: 'G–L', start: 6, end: 12 },
  { label: 'M–R', start: 12, end: 18 },
  { label: 'S–Z', start: 18, end: 26 },
];

export function renderAbcPhonics(ctx: ExtraLessonContext, st: ExtraLessonState): void {
  const group = ABC_GROUPS[st.abcGroupIdx % ABC_GROUPS.length];
  const letters = ABC_ITEMS.slice(group.start, group.end);
  const current =
    letters.find((l) => l.letter === st.abcSelectedLetter) ||
    ABC_ITEMS.find((l) => l.letter === st.abcSelectedLetter) ||
    letters[0];
  st.abcSelectedLetter = current.letter;

  const word = ctx.lang === 'fr' ? current.frWord : current.enWord;
  const emoji = ctx.lang === 'fr' ? current.frEmoji : current.enEmoji;

  ctx.stageViewEl.style.background = 'linear-gradient(160deg, #EEF2FF 0%, #E0E7FF 100%)';
  ctx.stageBannerEl.textContent = `🔤 ${current.letter} — ${word} ${emoji}`;

  ctx.stageContentEl.innerHTML = `
    <div class="abc-stage-wrap">
      <div class="abc-group-tabs">
        ${ABC_GROUPS.map(
          (g, idx) => `
          <button class="abc-group-pill ${idx === st.abcGroupIdx ? 'active' : ''}" data-group-idx="${idx}">
            ${g.label}
          </button>
        `
        ).join('')}
      </div>

      <button class="abc-hero-card" id="abc-hero-card" style="--abc-color: ${current.color}">
        <div class="abc-hero-letter">${current.letter}${current.letter.toLowerCase()}</div>
        <div class="abc-hero-emoji">${emoji}</div>
        <div class="abc-hero-word">${word}</div>
      </button>

      <div class="abc-blocks-grid">
        ${letters
          .map(
            (item) => `
          <button class="abc-wood-block ${item.letter === current.letter ? 'active' : ''}" data-letter="${item.letter}" style="--block-color: ${item.color}">
            <span class="abc-block-char">${item.letter}</span>
            <span class="abc-block-mini-emoji">${ctx.lang === 'fr' ? item.frEmoji : item.enEmoji}</span>
          </button>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  const speakLetter = (item: typeof current, x: number, y: number) => {
    const w = ctx.lang === 'fr' ? item.frWord : item.enWord;
    const phrase =
      ctx.lang === 'fr' ? `${item.letter} ! Comme ${w} !` : `${item.letter}! ${item.letter} is for ${w}!`;
    ctx.engine.playSound(`glock_${item.note}.mp3`, { volume: 0.85 });
    ctx.speech.playStudioVoice(`abc_${item.letter}`, phrase, { lang: ctx.lang, delayMs: 120 });
    ctx.speech.recordInteraction('abc_phonics', `${item.letter}-${w}`);
    ctx.bursts.spawnBurst(x, y, 14, item.color);
  };

  ctx.stageContentEl.querySelector('#abc-hero-card')?.addEventListener('pointerdown', (e) => {
    const pe = e as PointerEvent;
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('squash-bounce');
    void el.offsetWidth;
    el.classList.add('squash-bounce');
    speakLetter(current, pe.clientX, pe.clientY);
  });

  ctx.stageContentEl.querySelectorAll('.abc-wood-block').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      e.stopPropagation();
      const ch = btn.getAttribute('data-letter');
      const found = letters.find((l) => l.letter === ch);
      if (!found) return;
      st.abcSelectedLetter = found.letter;
      speakLetter(found, pe.clientX, pe.clientY);
      renderAbcPhonics(ctx, st);
    });
  });

  ctx.stageContentEl.querySelectorAll('.abc-group-pill').forEach((pill) => {
    pill.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const idx = Number(pill.getAttribute('data-group-idx') || 0);
      st.abcGroupIdx = idx;
      st.abcSelectedLetter = ABC_ITEMS[ABC_GROUPS[idx].start].letter;
      ctx.engine.playSound('woodblock.mp3', { volume: 0.7 });
      renderAbcPhonics(ctx, st);
    });
  });
}

// ============================================================================
// 4. THINGS THAT GO! (Vehicles)
// ============================================================================
export function renderVehiclesGo(ctx: ExtraLessonContext): void {
  ctx.stageViewEl.style.background = 'linear-gradient(160deg, #E0F2FE 0%, #FEF9C3 100%)';
  ctx.stageBannerEl.textContent = `🚗 ${t(UI_STRINGS.tapVehicle, ctx.lang)}`;

  ctx.stageContentEl.innerHTML = `
    <div class="vehicles-grid">
      ${VEHICLES.map(
        (v) => `
        <button class="vehicle-card" data-vehicle-id="${v.id}" style="--v-color: ${v.color}; --v-bg: ${v.bgTint}">
          <div class="vehicle-emoji">${v.emoji}</div>
          <div class="vehicle-name">${t(v.label, ctx.lang)}</div>
          <div class="vehicle-sound-badge">${t(v.soundWord, ctx.lang)}</div>
        </button>
      `
      ).join('')}
    </div>
  `;

  ctx.stageContentEl.querySelectorAll('.vehicle-card').forEach((card) => {
    card.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      e.stopPropagation();
      const id = card.getAttribute('data-vehicle-id');
      const v = VEHICLES.find((x) => x.id === id);
      if (!v) return;

      ctx.stageViewEl.style.background = `linear-gradient(160deg, ${v.bgTint} 0%, #FFFFFF 100%)`;
      ctx.stageBannerEl.textContent = `${v.emoji} ${t(v.label, ctx.lang)} — ${t(v.soundWord, ctx.lang)}`;

      const emojiEl = card.querySelector('.vehicle-emoji') as HTMLElement | null;
      if (emojiEl) {
        emojiEl.classList.remove('v-motion-drive', 'v-motion-fly', 'v-motion-sail', 'v-motion-blast');
        void emojiEl.offsetWidth;
        emojiEl.classList.add(`v-motion-${v.motion}`);
      }
      card.classList.remove('squash-bounce');
      void (card as HTMLElement).offsetWidth;
      card.classList.add('squash-bounce');

      ctx.engine.playSound(v.sfx, { volume: 0.85 });
      ctx.speech.playStudioVoice(`veh_${v.id}`, t(v.spoken, ctx.lang), {
        lang: ctx.lang,
        delayMs: 360,
      });
      ctx.speech.recordInteraction('vehicles_go', t(v.label, ctx.lang));
      ctx.bursts.spawnBurst(pe.clientX, pe.clientY, 16, v.color);
    });
  });
}

// ============================================================================
// 5. BIG & SMALL (Interactive Opposites)
// ============================================================================
export function renderOppositesPlay(ctx: ExtraLessonContext, st: ExtraLessonState): void {
  const pair = OPPOSITES_PAIRS[st.oppositeIdx % OPPOSITES_PAIRS.length];
  ctx.stageViewEl.style.background = 'linear-gradient(160deg, #ECFEFF 0%, #D8FBF0 100%)';
  ctx.stageBannerEl.textContent = `🐘 ${t(pair.title, ctx.lang)}`;

  ctx.stageContentEl.innerHTML = `
    <div class="opposites-stage">
      <div class="opposites-pair-row">
        ${[pair.left, pair.right]
          .map(
            (side) => `
          <button class="opposite-card effect-${side.effect}" data-side-id="${side.id}" style="--opp-color: ${side.color}">
            <div class="opposite-emoji">${side.emoji}</div>
            <div class="opposite-label">${t(side.label, ctx.lang)}</div>
          </button>
        `
          )
          .join('')}
      </div>
      <button class="lesson-next-btn" id="opp-next-btn">${t(UI_STRINGS.next, ctx.lang)}</button>
    </div>
  `;

  ctx.stageContentEl.querySelectorAll('.opposite-card').forEach((card) => {
    card.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      e.stopPropagation();
      const id = card.getAttribute('data-side-id');
      const side = id === pair.left.id ? pair.left : pair.right;

      ctx.stageBannerEl.textContent = `${side.emoji} ${t(side.label, ctx.lang)}`;

      // Live environmental reaction for Day / Night!
      if (side.effect === 'day') {
        ctx.stageViewEl.style.background = 'linear-gradient(160deg, #FEF08A 0%, #7DD3FC 100%)';
      } else if (side.effect === 'night') {
        ctx.stageViewEl.style.background = 'linear-gradient(160deg, #1E1B4B 0%, #312E81 100%)';
      }

      card.classList.remove('opp-animate');
      void (card as HTMLElement).offsetWidth;
      card.classList.add('opp-animate');

      ctx.engine.playSound(side.sfx, { volume: 0.85 });
      ctx.speech.playStudioVoice(`opp_${side.id}`, t(side.spoken, ctx.lang), {
        lang: ctx.lang,
        delayMs: 260,
      });
      ctx.speech.recordInteraction('opposites_play', t(side.label, ctx.lang));
      ctx.bursts.spawnBurst(pe.clientX, pe.clientY, 16, side.color);
    });
  });

  ctx.stageContentEl.querySelector('#opp-next-btn')?.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    st.oppositeIdx = (st.oppositeIdx + 1) % OPPOSITES_PAIRS.length;
    ctx.engine.playSound('woodblock.mp3', { volume: 0.7 });
    renderOppositesPlay(ctx, st);
  });
}

// ============================================================================
// 6. BABY SOUND MIRROR / MOUTH GYM (Cloned from Speech Blubs)
// ============================================================================
function getMouthFaceSvg(shape: MouthShape, accentColor: string): string {
  let mouthPath = '';
  if (shape === 'open_o') {
    mouthPath = `<ellipse class="mg-mouth-anim" cx="100" cy="134" rx="18" ry="22" fill="#E63946" stroke="#7F1D1D" stroke-width="4" />`;
  } else if (shape === 'open_a') {
    mouthPath = `
      <path class="mg-mouth-anim" d="M 70 122 Q 100 126 130 122 Q 128 158 100 158 Q 72 158 70 122 Z" fill="#E63946" stroke="#7F1D1D" stroke-width="4" />
      <ellipse cx="100" cy="148" rx="16" ry="8" fill="#FF8FA3" />
    `;
  } else if (shape === 'lips_b') {
    mouthPath = `
      <path class="mg-mouth-anim" d="M 74 134 Q 100 144 126 134" fill="none" stroke="#E63946" stroke-width="9" stroke-linecap="round" />
      <path d="M 78 130 Q 100 124 122 130" fill="none" stroke="#FF8FA3" stroke-width="5" stroke-linecap="round" />
    `;
  } else if (shape === 'kiss') {
    mouthPath = `
      <circle class="mg-mouth-anim" cx="100" cy="136" r="11" fill="#F72585" stroke="#9D174D" stroke-width="3" />
      <text x="128" y="132" font-size="24">💋</text>
    `;
  } else {
    // shhh
    mouthPath = `
      <circle class="mg-mouth-anim" cx="100" cy="136" r="8" fill="#E63946" />
      <rect x="94" y="128" width="12" height="44" rx="6" fill="#FFD6A5" stroke="#D99B66" stroke-width="3" />
    `;
  }

  return `
    <svg viewBox="0 0 200 200" class="mouth-gym-svg" aria-hidden="true">
      <circle cx="100" cy="100" r="84" fill="#FFE5CC" stroke="${accentColor}" stroke-width="8" />
      <!-- Cute hair curl -->
      <path d="M 85 20 Q 105 4 118 22 Q 102 30 92 24" fill="none" stroke="#8D5524" stroke-width="7" stroke-linecap="round" />
      <!-- Rosy cheeks -->
      <circle cx="52" cy="112" r="14" fill="#FF9EBB" opacity="0.65" />
      <circle cx="148" cy="112" r="14" fill="#FF9EBB" opacity="0.65" />
      <!-- Sparkling eyes -->
      <circle cx="70" cy="82" r="12" fill="#1D3557" />
      <circle cx="66" cy="78" r="4" fill="#FFFFFF" />
      <circle cx="130" cy="82" r="12" fill="#1D3557" />
      <circle cx="126" cy="78" r="4" fill="#FFFFFF" />
      <!-- Cute nose -->
      <ellipse cx="100" cy="104" rx="7" ry="5" fill="#F4A261" />
      <!-- Dynamic modeling mouth -->
      ${mouthPath}
    </svg>
  `;
}

export function renderMouthGym(ctx: ExtraLessonContext, st: ExtraLessonState): void {
  const item = MOUTH_SOUNDS[st.mouthIdx % MOUTH_SOUNDS.length];
  ctx.stageViewEl.style.background = `linear-gradient(160deg, #FFF5F7 0%, #FFE4EC 100%)`;
  ctx.stageBannerEl.textContent = `🗣️ ${t(item.syllable, ctx.lang)}`;

  ctx.stageContentEl.innerHTML = `
    <div class="mouth-gym-wrap">
      <button class="mouth-face-btn" id="mouth-face-btn" style="--mg-color: ${item.color}">
        <div class="mouth-face-ring">
          ${getMouthFaceSvg(item.mouthShape, item.color)}
        </div>
        <div class="mouth-syllable-big">${item.emoji} ${t(item.syllable, ctx.lang)}</div>
        <div class="mouth-prompt-sub">${t(item.prompt, ctx.lang)}</div>
      </button>

      <div class="mouth-controls-row">
        <button class="mouth-pill-btn slow-btn" id="mouth-slow-btn">
          ${t(UI_STRINGS.hearSlow, ctx.lang)}
        </button>
        <button class="mouth-pill-btn cheer-btn" id="mouth-cheer-btn">
          ${t(UI_STRINGS.yayISaidIt, ctx.lang)}
        </button>
      </div>

      <button class="lesson-next-btn" id="mouth-next-btn">${t(UI_STRINGS.next, ctx.lang)}</button>
    </div>
  `;

  const speakModel = (slow: boolean, x: number, y: number) => {
    const face = ctx.stageContentEl.querySelector('#mouth-face-btn') as HTMLElement | null;
    if (face) {
      face.classList.remove('is-speaking');
      void face.offsetWidth;
      face.classList.add('is-speaking');
    }
    ctx.engine.playSound(item.sfx, { volume: 0.65 });
    ctx.speech.playStudioVoice(`mouth_${item.id}`, t(item.spoken, ctx.lang), {
      lang: ctx.lang,
      slow,
      delayMs: 120,
      parentKey: item.id === 'mama' ? 'call_mama' : item.id === 'dada' ? 'call_dada' : undefined,
    });
    ctx.speech.recordInteraction('mouth_gym', t(item.syllable, ctx.lang));
    ctx.bursts.spawnBurst(x, y, 14, item.color);
  };

  ctx.stageContentEl.querySelector('#mouth-face-btn')?.addEventListener('pointerdown', (e) => {
    const pe = e as PointerEvent;
    e.stopPropagation();
    speakModel(false, pe.clientX, pe.clientY);
  });

  ctx.stageContentEl.querySelector('#mouth-slow-btn')?.addEventListener('pointerdown', (e) => {
    const pe = e as PointerEvent;
    e.stopPropagation();
    speakModel(true, pe.clientX, pe.clientY);
  });

  ctx.stageContentEl.querySelector('#mouth-cheer-btn')?.addEventListener('pointerdown', (e) => {
    const pe = e as PointerEvent;
    e.stopPropagation();
    ctx.engine.playSound('fanfare.mp3', { volume: 0.75 });
    ctx.speech.playStudioVoice('ui_yay', t(UI_STRINGS.yay, ctx.lang), {
      lang: ctx.lang,
      delayMs: 240,
      parentKey: 'great_job',
    });
    ctx.speech.recordInteraction('mouth_gym', `cheer-${item.id}`);
    ctx.bursts.spawnBurst(pe.clientX, pe.clientY, 20, '#FFD166');
    confetti({ particleCount: 38, spread: 70, origin: { y: 0.6 } });
  });

  ctx.stageContentEl.querySelector('#mouth-next-btn')?.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    st.mouthIdx = (st.mouthIdx + 1) % MOUTH_SOUNDS.length;
    ctx.engine.playSound('woodblock.mp3', { volume: 0.7 });
    renderMouthGym(ctx, st);
  });
}
