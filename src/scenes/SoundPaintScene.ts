/**
 * SoundPaintScene.ts
 * Scene C: "Sound Paint / Finger Trail" (Open-Ended Synesthetic Canvas).
 * 
 * Features:
 * - Deep midnight blue velvet canvas with zero rules, ideal for infant palm & finger exploration.
 * - Multi-Touch Polyphony supporting up to 5 concurrent fingers, each assigned a distinct pastel watercolor hue.
 * - Glowing fluid watercolor ribbons with Bezier curve smoothing & radial stardust particles.
 * - Pitch & Velocity Mapping:
 *   - Y-Axis: Bottom = deep resonant C3/E3 harp & cello; Top = sparkling high C6 glockenspiel chimes.
 *   - Velocity: Fast strokes trigger bright acoustic arpeggios; slow touches sustain warm cello drone chords.
 * - Self-Cleaning: trails dissolve into twinkling stardust over 2.5 seconds to prevent visual clutter.
 * - Strict 60 FPS frame rate on mobile Safari WebKit & Chrome Android.
 */

import { AudioEngine } from '../audio/AudioEngine';
import { TouchBurstManager } from '../components/TouchBurstManager';
import type { StorybookScene } from './SceneManager';

interface TrailPoint {
  x: number;
  y: number;
  time: number;
  vx: number;
  vy: number;
  speed: number;
}

interface ActivePointer {
  id: number;
  color: string;
  points: TrailPoint[];
  lastNoteTime: number;
  lastDroneTime: number;
  isLingering: boolean;
  lingerStartTime: number;
}

export class SoundPaintScene implements StorybookScene {
  public readonly id = 'sound_paint';
  public readonly title = 'Sound Paint / Finger Trail';
  public readonly subtitle = 'Open-Ended Synesthetic Canvas';
  public readonly icon = '🎨';
  public readonly themeColor = '#3A0CA3';

  private container: HTMLElement;
  private bursts: TouchBurstManager;
  private engine: AudioEngine;

  public element!: HTMLElement;
  private isActive: boolean = false;

  // Canvas
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animFrameId: number = 0;

  // Active multi-touch pointers (up to 5 concurrent fingers)
  private activePointers: Map<number, ActivePointer> = new Map();

  // Completed strokes fading out (Self-cleaning over 2.5s)
  private fadingStrokes: Array<{ color: string; points: TrailPoint[]; birthTime: number }> = [];

  // 5 distinct pastel watercolor colors per finger
  private readonly fingerColors = [
    '#FF6B6B', // Finger 1: Coral Rose
    '#4ECDC4', // Finger 2: Aqua Mint
    '#FFD166', // Finger 3: Golden Sun
    '#A06CD5', // Finger 4: Lavender Violet
    '#FF9F1C'  // Finger 5: Peach Tangerine
  ];

  // Scale mappings by Y-axis depth
  // Top: C6, A5, G5, E5 (glockenspiel)
  // Mid: C5, A4, G4, E4 (harp)
  // Bottom: C3, E3, G2, C2 (cello)
  private readonly topChimes = ['C6', 'A5', 'G5', 'E5'];
  private readonly midHarp = ['C5', 'A4', 'G4', 'E4'];
  private readonly bottomCello = ['C3', 'E3', 'G2', 'C2'];

  constructor(container: HTMLElement, bursts: TouchBurstManager) {
    this.container = container;
    this.bursts = bursts;
    this.engine = AudioEngine.getInstance();

    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.element = document.createElement('div');
    this.element.className = 'storybook-scene scene-sound-paint';
    this.element.style.display = 'none';

    this.element.innerHTML = `
      <!-- Deep Midnight Blue Velvet Canvas -->
      <div class="velvet-canvas-bg">
        <div class="velvet-radial-glow"></div>
        <div class="ambient-stars-twinkle">
          <span class="amb-star as1">✦</span>
          <span class="amb-star as2">✧</span>
          <span class="amb-star as3">✦</span>
          <span class="amb-star as4">✧</span>
        </div>
      </div>

      <!-- Fluid Watercolor Ribbon Canvas -->
      <canvas class="sound-paint-canvas" id="sound-paint-canvas"></canvas>

      <!-- Center Toddler Invitation Hint (Fades on First Touch) -->
      <div class="paint-canvas-hint" id="paint-canvas-hint">
        <div class="hint-sparkle">✨</div>
        <div class="hint-text">DRAG FINGERS TO HEAR MUSIC! 🎶</div>
      </div>

      <!-- Toddler Bottom Quick Tappers (>= 56px, Safe-Area Padded) -->
      <div class="soundpaint-toddler-bar">
        <button class="paint-quick-btn btn-clear" id="btn-clear-canvas">
          <span class="btn-icon">✨</span>
          <span class="btn-text">CLEAR</span>
        </button>
        <button class="paint-quick-btn btn-cello" id="btn-drone-cello">
          <span class="btn-icon">🎻</span>
          <span class="btn-text">CELLO</span>
        </button>
        <button class="paint-quick-btn btn-harp" id="btn-pluck-harp">
          <span class="btn-icon">🪕</span>
          <span class="btn-text">HARP</span>
        </button>
        <button class="paint-quick-btn btn-bells" id="btn-chime-bells">
          <span class="btn-icon">🔔</span>
          <span class="btn-text">BELLS</span>
        </button>
      </div>
    `;

    this.container.appendChild(this.element);

    this.canvas = this.element.querySelector('#sound-paint-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: true })!;
  }

  private bindEvents(): void {
    const hintEl = this.element.querySelector('#paint-canvas-hint') as HTMLElement;

    // Multi-touch pointer events on canvas
    this.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      if (hintEl) hintEl.style.opacity = '0';
      this.handlePointerDown(e);
    });

    this.canvas.addEventListener('pointermove', (e: PointerEvent) => {
      this.handlePointerMove(e);
    });

    this.canvas.addEventListener('pointerup', (e: PointerEvent) => {
      this.handlePointerUp(e);
    });

    this.canvas.addEventListener('pointercancel', (e: PointerEvent) => {
      this.handlePointerUp(e);
    });

    // Toddler Quick Buttons
    this.element.querySelector('#btn-clear-canvas')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.clearCanvasWithSparkle();
    });

    this.element.querySelector('#btn-drone-cello')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.engine.playCelloNote('C3', { volume: 0.9 });
      this.bursts.spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.7, 12, '#FF6B6B');
    });

    this.element.querySelector('#btn-pluck-harp')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.engine.playHarpNote('C5', { volume: 0.85 });
      this.bursts.spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 12, '#FFD166');
    });

    this.element.querySelector('#btn-chime-bells')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.engine.playGlockNote('C6', { volume: 0.9 });
      this.bursts.spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.3, 12, '#4ECDC4');
    });
  }

  private handlePointerDown(e: PointerEvent): void {
    if (this.activePointers.size >= 5) return; // Cap at 5 fingers

    // Assign color by pointer order
    const colorIndex = this.activePointers.size % this.fingerColors.length;
    const color = this.fingerColors[colorIndex];

    const point: TrailPoint = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      vx: 0,
      vy: 0,
      speed: 0
    };

    const pointer: ActivePointer = {
      id: e.pointerId,
      color,
      points: [point],
      lastNoteTime: Date.now(),
      lastDroneTime: 0,
      isLingering: false,
      lingerStartTime: Date.now()
    };

    this.activePointers.set(e.pointerId, pointer);

    // Initial touch sound mapped by vertical Y axis
    this.playMappedNote(e.clientX, e.clientY, 10);
    this.bursts.spawnStardustTrail(e.clientX, e.clientY, color);
  }

  private handlePointerMove(e: PointerEvent): void {
    const pointer = this.activePointers.get(e.pointerId);
    if (!pointer) return;

    const now = Date.now();
    const lastPoint = pointer.points[pointer.points.length - 1];

    if (lastPoint) {
      const dt = Math.max(1, now - lastPoint.time);
      const dx = e.clientX - lastPoint.x;
      const dy = e.clientY - lastPoint.y;
      const dist = Math.hypot(dx, dy);
      const speed = (dist / dt) * 1000; // pixels per sec

      const newPoint: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        time: now,
        vx: dx / dt,
        vy: dy / dt,
        speed
      };

      pointer.points.push(newPoint);

      // Keep stroke points bounded
      if (pointer.points.length > 60) {
        pointer.points.shift();
      }

      // Spawn drifting stardust particles
      this.bursts.spawnStardustTrail(e.clientX, e.clientY, pointer.color);

      // Pitch & Velocity Mapping:
      // Fast strokes trigger bright acoustic arpeggios
      // Slow lingering touches trigger and sustain cello drone chords
      if (speed > 400 && now - pointer.lastNoteTime > 120) {
        this.playMappedNote(e.clientX, e.clientY, speed);
        pointer.lastNoteTime = now;
        pointer.isLingering = false;
      } else if (speed < 90) {
        // Slow lingering touch
        if (!pointer.isLingering) {
          pointer.isLingering = true;
          pointer.lingerStartTime = now;
        } else if (now - pointer.lingerStartTime > 300 && now - pointer.lastDroneTime > 800) {
          // Warm resonant cello drone chord
          this.playCelloDrone(e.clientY);
          pointer.lastDroneTime = now;
        }
      } else if (now - pointer.lastNoteTime > 220) {
        this.playMappedNote(e.clientX, e.clientY, speed);
        pointer.lastNoteTime = now;
      }
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    const pointer = this.activePointers.get(e.pointerId);
    if (!pointer) return;

    // Transfer active stroke to fading strokes array (Self-Cleaning over 2.5s)
    if (pointer.points.length > 1) {
      this.fadingStrokes.push({
        color: pointer.color,
        points: [...pointer.points],
        birthTime: Date.now()
      });
    }

    this.activePointers.delete(e.pointerId);
  }

  /**
   * Pitch Mapping:
   * Vertical axis (Y) maps to pitch:
   * - Bottom (Y > 0.7): Deep, resonant C3/E3 harp & cello notes.
   * - Mid (0.35 <= Y <= 0.7): Warm A4/C5 harp & cello mid notes.
   * - Top (Y < 0.35): Sparkling high C6 glockenspiel chimes.
   */
  private playMappedNote(x: number, y: number, velocity: number): void {
    if (!this.isActive) return;

    const height = window.innerHeight || 844;
    const yPct = Math.max(0, Math.min(1, y / height));
    const vol = Math.min(1.0, 0.4 + (velocity / 1200) * 0.6);

    // Pan across stereo spectrum based on X
    const pan = (x / (window.innerWidth || 390)) * 2 - 1;

    if (yPct < 0.35) {
      // Top of screen: High glockenspiel bells & music box
      const idx = Math.floor((yPct / 0.35) * this.topChimes.length);
      const note = this.topChimes[Math.min(this.topChimes.length - 1, idx)];
      this.engine.playGlockNote(note, { volume: vol, pan });
      if (velocity > 600) {
        this.engine.playHarpNote('A6', { volume: vol * 0.7, pan });
      }
    } else if (yPct <= 0.7) {
      // Middle of screen: Plucked Harp & Nylon Guitar
      const idx = Math.floor(((yPct - 0.35) / 0.35) * this.midHarp.length);
      const note = this.midHarp[Math.min(this.midHarp.length - 1, idx)];
      this.engine.playHarpNote(note, { volume: vol, pan });
      if (velocity > 700) {
        this.engine.playGlockNote(note, { volume: vol * 0.5, pan });
      }
    } else {
      // Bottom of screen: Deep resonant Cello & Harp
      const idx = Math.floor(((yPct - 0.7) / 0.3) * this.bottomCello.length);
      const note = this.bottomCello[Math.min(this.bottomCello.length - 1, idx)];
      this.engine.playCelloNote(note, { volume: vol * 1.1, pan });
      this.engine.playHarpNote(note, { volume: vol * 0.8, pan });
    }
  }

  /**
   * Warm resonant cello drone chord sustained on lingering slow touch.
   */
  private playCelloDrone(y: number): void {
    if (!this.isActive) return;
    const height = window.innerHeight || 844;
    const yPct = y / height;
    if (yPct > 0.6) {
      this.engine.playCelloNote('C2', { volume: 0.85 });
      this.engine.playCelloNote('G2', { volume: 0.75, offset: 0.05 });
    } else {
      this.engine.playCelloNote('C3', { volume: 0.8 });
      this.engine.playCelloNote('E3', { volume: 0.7, offset: 0.05 });
    }
  }

  /**
   * Clear canvas with golden stardust burst.
   */
  private clearCanvasWithSparkle(): void {
    this.fadingStrokes = [];
    this.activePointers.forEach(p => (p.points = []));
    this.bursts.spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 24, '#FFD166');
    this.engine.playPeekabooFlourish();
  }

  /**
   * 60 FPS Fluid Watercolor Ribbon & Stardust Render Loop.
   */
  private startRenderLoop(): void {
    const canvas = this.canvas;
    const ctx = this.ctx;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const now = Date.now();

      // 1. Render Fading Strokes (Self-cleaning over 2.5 seconds = 2500ms)
      for (let i = this.fadingStrokes.length - 1; i >= 0; i--) {
        const stroke = this.fadingStrokes[i];
        const age = now - stroke.birthTime;
        const life = 2500;

        if (age >= life) {
          this.fadingStrokes.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, 1 - age / life);
        this.renderRibbon(stroke.points, stroke.color, alpha);
      }

      // 2. Render Active Fingers Strokes
      for (const pointer of this.activePointers.values()) {
        if (pointer.points.length >= 2) {
          this.renderRibbon(pointer.points, pointer.color, 0.95);
        }
      }

      this.animFrameId = requestAnimationFrame(render);
    };

    this.animFrameId = requestAnimationFrame(render);
  }

  /**
   * Renders smooth glowing watercolor ribbon with quadratic Bezier interpolation.
   */
  private renderRibbon(points: TrailPoint[], color: string, baseAlpha: number): void {
    if (points.length < 2) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer Soft Glow
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.globalAlpha = baseAlpha * 0.45;
    ctx.lineWidth = 32;

    this.drawCurvedPath(points);
    ctx.stroke();

    // Core Luminous Watercolor Ribbon
    ctx.shadowBlur = 6;
    ctx.globalAlpha = baseAlpha * 0.9;
    ctx.lineWidth = 14;

    this.drawCurvedPath(points);
    ctx.stroke();

    // Inner Bright Filament
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFFFFF';
    ctx.globalAlpha = baseAlpha * 0.85;
    ctx.lineWidth = 4;

    this.drawCurvedPath(points);
    ctx.stroke();

    ctx.restore();
  }

  private drawCurvedPath(points: TrailPoint[]): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    if (points.length > 1) {
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
    }
  }

  public activate(): void {
    this.isActive = true;
    this.element.style.display = 'block';
    this.startRenderLoop();
  }

  public deactivate(): void {
    this.isActive = false;
    this.element.style.display = 'none';
    cancelAnimationFrame(this.animFrameId);
    this.activePointers.clear();
    this.fadingStrokes = [];
  }
}
