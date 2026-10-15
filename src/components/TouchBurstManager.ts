/**
 * TouchBurstManager.ts
 * High-performance 60 FPS multi-touch burst particle system.
 * 
 * Anchored directly to touch coordinates (pointerdown / pointermove).
 * Spawns:
 * - Expanding acoustic ripple rings
 * - Shimmering golden stars
 * - Floating musical notes (♪, ♫, ♬)
 * - Translucent wobbling soap bubbles
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'star' | 'bubble' | 'note' | 'sparkle';
  text?: string;
  rotation: number;
  vRot: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export class TouchBurstManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private ripples: Ripple[] = [];
  private isRunning: boolean = false;
  private animationId: number = 0;

  private readonly colors: string[] = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#F78C6B', '#A06CD5', '#FF9F1C'
  ];
  private readonly notes: string[] = ['♪', '♫', '♬', '♩', '✨', '⭐'];

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'touch-burst-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '999';

    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: true })!;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.start();
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  public spawnBurst(x: number, y: number, count: number = 12, hueColor?: string): void {
    const baseColor = hueColor || this.colors[Math.floor(Math.random() * this.colors.length)];

    // 1. Add expanding acoustic ripple
    this.ripples.push({
      x,
      y,
      radius: 12,
      maxRadius: 85 + Math.random() * 35,
      color: baseColor,
      alpha: 0.8
    });

    // 2. Add particles (stars, bubbles, musical notes)
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = 2.5 + Math.random() * 4.5;
      const typeRand = Math.random();

      let type: 'star' | 'bubble' | 'note' | 'sparkle' = 'sparkle';
      let text: string | undefined = undefined;

      if (typeRand < 0.3) {
        type = 'note';
        text = this.notes[Math.floor(Math.random() * this.notes.length)];
      } else if (typeRand < 0.6) {
        type = 'bubble';
      } else if (typeRand < 0.85) {
        type = 'star';
      }

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2, // bias upward
        size: type === 'note' ? 18 + Math.random() * 10 : 8 + Math.random() * 12,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        alpha: 1.0,
        life: 0,
        maxLife: 35 + Math.floor(Math.random() * 25),
        type,
        text,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15
      });
    }
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = () => {
      this.updateAndRender();
      if (this.isRunning) {
        this.animationId = requestAnimationFrame(loop);
      }
    };
    this.animationId = requestAnimationFrame(loop);
  }

  public stop(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
  }

  private updateAndRender(): void {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Render & Update Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += (rip.maxRadius - rip.radius) * 0.12;
      rip.alpha -= 0.025;

      if (rip.alpha <= 0 || rip.radius >= rip.maxRadius - 2) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = rip.color;
      this.ctx.lineWidth = 3.5 * rip.alpha;
      this.ctx.globalAlpha = rip.alpha;
      this.ctx.stroke();
    }

    // Render & Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      if (p.type === 'bubble') {
        p.vy -= 0.06; // Floating upward buoyancy
        p.vx += Math.sin(p.life * 0.2) * 0.15; // Gentle wobble
      } else {
        p.vy += 0.14; // Light gravity for stars/notes
        p.vx *= 0.98;
      }

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.alpha;

      if (p.type === 'note' && p.text) {
        this.ctx.font = `bold ${p.size}px "Outfit", "Comic Sans MS", sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowBlur = 6;
        this.ctx.fillText(p.text, 0, 0);
      } else if (p.type === 'bubble') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        this.ctx.fill();
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Bubble highlight reflection
        this.ctx.beginPath();
        this.ctx.arc(-p.size / 6, -p.size / 6, p.size / 6, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fill();
      } else if (p.type === 'star') {
        this.drawStar(0, 0, 5, p.size / 2, p.size / 4, p.color);
      } else {
        // Sparkling dot
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    this.ctx.globalAlpha = 1.0;
  }

  private drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string): void {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
    this.ctx.shadowBlur = 8;
    this.ctx.fill();
  }
}
