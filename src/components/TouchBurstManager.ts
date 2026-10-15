/**
 * TouchBurstManager.ts
 * High-performance 60 FPS multi-touch burst particle system.
 * 
 * Supports up to 5 concurrent touches with:
 * - Expanding acoustic ripple rings
 * - Shimmering golden stars & constellation dust
 * - Floating musical notes (♪, ♫, ♬)
 * - Translucent wobbling soap bubbles
 * - Water droplets & splash ripples (Duck pond, River, Rain)
 * - Mud splatters (Pig mud puddle)
 * - Tractor smoke puffs
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
  type: 'star' | 'bubble' | 'note' | 'sparkle' | 'droplet' | 'mud' | 'smoke';
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

    // Expanding acoustic ripple
    this.ripples.push({
      x,
      y,
      radius: 12,
      maxRadius: 85 + Math.random() * 35,
      color: baseColor,
      alpha: 0.8
    });

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
        vy: Math.sin(angle) * speed - 1.2,
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

  /**
   * Spawns authentic water splash droplets and ripple rings.
   */
  public spawnWaterSplash(x: number, y: number, count: number = 14): void {
    // Water ripple
    this.ripples.push({
      x,
      y,
      radius: 10,
      maxRadius: 70 + Math.random() * 40,
      color: '#4CC9F0',
      alpha: 0.9
    });
    this.ripples.push({
      x,
      y,
      radius: 5,
      maxRadius: 45 + Math.random() * 25,
      color: '#A0E4FF',
      alpha: 0.7
    });

    const splashBlues = ['#4CC9F0', '#4895EF', '#3F37C9', '#CAF0F8', '#90E0EF'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 0.6; // upward arc
      const speed = 3.5 + Math.random() * 6.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 5 + Math.random() * 7,
        color: splashBlues[Math.floor(Math.random() * splashBlues.length)],
        alpha: 0.95,
        life: 0,
        maxLife: 30 + Math.floor(Math.random() * 15),
        type: 'droplet',
        rotation: 0,
        vRot: 0
      });
    }
  }

  /**
   * Spawns mud splatter droplets for the Pig rolling in the farm puddle.
   */
  public spawnMudSplatter(x: number, y: number, count: number = 10): void {
    const mudColors = ['#6F4E37', '#8B5A2B', '#A0522D', '#5C4033', '#CD853F'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 2.0 + Math.random() * 4.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 7 + Math.random() * 11,
        color: mudColors[Math.floor(Math.random() * mudColors.length)],
        alpha: 1.0,
        life: 0,
        maxLife: 28 + Math.floor(Math.random() * 14),
        type: 'mud',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }
  }

  /**
   * Spawns warm golden star glow and celestial dust for Twinkle Twinkle stars.
   */
  public spawnStarGlow(x: number, y: number, count: number = 12, hueColor: string = '#FFE066'): void {
    this.ripples.push({
      x,
      y,
      radius: 14,
      maxRadius: 90,
      color: hueColor,
      alpha: 0.85
    });

    const starGolds = ['#FFE066', '#FFD166', '#FFF3B0', '#F4D35E', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 8 + Math.random() * 12,
        color: starGolds[Math.floor(Math.random() * starGolds.length)],
        alpha: 1.0,
        life: 0,
        maxLife: 35 + Math.floor(Math.random() * 20),
        type: 'star',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }
  }

  /**
   * Spawns tractor engine smoke puffs.
   */
  public spawnSmokePuff(x: number, y: number): void {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -2.0 - Math.random() * 1.5,
        size: 14 + Math.random() * 10,
        color: 'rgba(235, 235, 235, 0.75)',
        alpha: 0.85,
        life: 0,
        maxLife: 40 + Math.floor(Math.random() * 15),
        type: 'smoke',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.05
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

    // Update & Render Ripples
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

    // Update & Render Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      if (p.type === 'bubble') {
        p.vy -= 0.06;
        p.vx += Math.sin(p.life * 0.2) * 0.15;
      } else if (p.type === 'smoke') {
        p.vy -= 0.04;
        p.vx += 0.05;
        p.size += 0.25;
      } else if (p.type === 'droplet') {
        p.vy += 0.35; // Water droplet gravity
        p.vx *= 0.96;
      } else if (p.type === 'mud') {
        p.vy += 0.3;
        p.vx *= 0.95;
      } else {
        p.vy += 0.14;
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

        this.ctx.beginPath();
        this.ctx.arc(-p.size / 6, -p.size / 6, p.size / 6, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fill();
      } else if (p.type === 'star') {
        this.drawStar(0, 0, 5, p.size / 2, p.size / 4, p.color);
      } else if (p.type === 'droplet') {
        // Teardrop shape for water
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI);
        this.ctx.lineTo(0, -p.size * 0.9);
        this.ctx.closePath();
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = 'rgba(76, 201, 240, 0.8)';
        this.ctx.shadowBlur = 4;
        this.ctx.fill();
      } else if (p.type === 'mud') {
        // Blobby organic mud splatter
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size / 2, p.size / 2.6, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      } else if (p.type === 'smoke') {
        // Fluffy soft smoke circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
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
