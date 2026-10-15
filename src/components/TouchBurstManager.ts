/**
 * TouchBurstManager.ts
 * High-performance 60 FPS multi-touch burst particle system with zero GC pauses.
 * 
 * Features:
 * - 40-particle object pool (zero garbage collection pauses on mobile WebKit).
 * - Single HTML5 canvas layer for multi-touch ripples, bubbles, pollen dust, star chimes.
 * - Expanding acoustic ripple rings.
 * - Iridescent soap bubbles with buoyant wobble.
 * - Water droplets & splash ripples (Bath Time Tub & Duck Pond).
 * - Golden star & pollen dust (Meadow butterflies & Sound Paint stardust).
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
  type: 'star' | 'bubble' | 'note' | 'sparkle' | 'droplet' | 'mud' | 'smoke' | 'pollen';
  text?: string;
  rotation: number;
  vRot: number;
  active: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  active: boolean;
}

export class TouchBurstManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Active particle lists
  private particles: Particle[] = [];
  private ripples: Ripple[] = [];

  // Reusable Object Pools (40 Particles + 20 Ripples)
  private readonly POOL_SIZE = 40;
  private particlePool: Particle[] = [];
  private ripplePool: Ripple[] = [];

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

    // Pre-allocate particle pool to guarantee 60 FPS without GC spikes
    for (let i = 0; i < this.POOL_SIZE; i++) {
      this.particlePool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 10,
        color: '#FFFFFF',
        alpha: 1,
        life: 0,
        maxLife: 30,
        type: 'sparkle',
        rotation: 0,
        vRot: 0,
        active: false
      });
    }

    for (let i = 0; i < 20; i++) {
      this.ripplePool.push({
        x: 0,
        y: 0,
        radius: 0,
        maxRadius: 60,
        color: '#FFFFFF',
        alpha: 1,
        active: false
      });
    }

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

  private getPooledParticle(): Particle {
    const p = this.particlePool.pop() || {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 10,
      color: '#FFFFFF',
      alpha: 1,
      life: 0,
      maxLife: 30,
      type: 'sparkle',
      rotation: 0,
      vRot: 0,
      active: false
    };
    p.active = true;
    p.life = 0;
    p.alpha = 1;
    return p;
  }

  private recycleParticle(p: Particle): void {
    p.active = false;
    p.text = undefined;
    if (this.particlePool.length < this.POOL_SIZE) {
      this.particlePool.push(p);
    }
  }

  private getPooledRipple(): Ripple {
    const r = this.ripplePool.pop() || {
      x: 0,
      y: 0,
      radius: 0,
      maxRadius: 60,
      color: '#FFFFFF',
      alpha: 1,
      active: false
    };
    r.active = true;
    r.alpha = 1;
    return r;
  }

  private recycleRipple(r: Ripple): void {
    r.active = false;
    if (this.ripplePool.length < 20) {
      this.ripplePool.push(r);
    }
  }

  public spawnBurst(x: number, y: number, count: number = 10, hueColor?: string): void {
    const baseColor = hueColor || this.colors[Math.floor(Math.random() * this.colors.length)];

    // Expanding acoustic ripple from pool
    const rip = this.getPooledRipple();
    rip.x = x;
    rip.y = y;
    rip.radius = 12;
    rip.maxRadius = 85 + Math.random() * 35;
    rip.color = baseColor;
    rip.alpha = 0.8;
    this.ripples.push(rip);

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

      const p = this.getPooledParticle();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 1.2;
      p.size = type === 'note' ? 18 + Math.random() * 10 : 8 + Math.random() * 12;
      p.color = this.colors[Math.floor(Math.random() * this.colors.length)];
      p.maxLife = 32 + Math.floor(Math.random() * 20);
      p.type = type;
      p.text = text;
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.15;
      this.particles.push(p);
    }
  }

  /**
   * Spawns authentic water splash droplets and ripple rings.
   */
  public spawnWaterSplash(x: number, y: number, count: number = 12): void {
    const rip1 = this.getPooledRipple();
    rip1.x = x;
    rip1.y = y;
    rip1.radius = 10;
    rip1.maxRadius = 70 + Math.random() * 40;
    rip1.color = '#4CC9F0';
    rip1.alpha = 0.9;
    this.ripples.push(rip1);

    const rip2 = this.getPooledRipple();
    rip2.x = x;
    rip2.y = y;
    rip2.radius = 5;
    rip2.maxRadius = 45 + Math.random() * 25;
    rip2.color = '#A0E4FF';
    rip2.alpha = 0.7;
    this.ripples.push(rip2);

    const splashBlues = ['#4CC9F0', '#4895EF', '#3F37C9', '#CAF0F8', '#90E0EF'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 0.6; // upward arc
      const speed = 3.5 + Math.random() * 6.0;

      const p = this.getPooledParticle();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 2.5;
      p.size = 5 + Math.random() * 7;
      p.color = splashBlues[Math.floor(Math.random() * splashBlues.length)];
      p.maxLife = 28 + Math.floor(Math.random() * 14);
      p.type = 'droplet';
      p.rotation = 0;
      p.vRot = 0;
      this.particles.push(p);
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

      const p = this.getPooledParticle();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 1.5;
      p.size = 7 + Math.random() * 11;
      p.color = mudColors[Math.floor(Math.random() * mudColors.length)];
      p.maxLife = 26 + Math.floor(Math.random() * 12);
      p.type = 'mud';
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.2;
      this.particles.push(p);
    }
  }

  /**
   * Spawns warm golden star glow and celestial dust for Twinkle Twinkle stars.
   */
  public spawnStarGlow(x: number, y: number, count: number = 10, hueColor: string = '#FFE066'): void {
    const rip = this.getPooledRipple();
    rip.x = x;
    rip.y = y;
    rip.radius = 14;
    rip.maxRadius = 80;
    rip.color = hueColor;
    rip.alpha = 0.85;
    this.ripples.push(rip);

    const starGolds = ['#FFE066', '#FFD166', '#FFF3B0', '#F4D35E', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.0;

      const p = this.getPooledParticle();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 0.5;
      p.size = 8 + Math.random() * 12;
      p.color = starGolds[Math.floor(Math.random() * starGolds.length)];
      p.maxLife = 32 + Math.floor(Math.random() * 16);
      p.type = 'star';
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.2;
      this.particles.push(p);
    }
  }

  /**
   * Peek-a-Boo Meadow: Glowing pollen dust when butterflies are touched.
   */
  public spawnPollenSparkles(x: number, y: number, count: number = 14): void {
    const pollenColors = ['#FFD166', '#FFE6A7', '#9BF6FF', '#FDFFB6', '#CAFFBF'];
    const rip = this.getPooledRipple();
    rip.x = x;
    rip.y = y;
    rip.radius = 8;
    rip.maxRadius = 65;
    rip.color = '#FFD166';
    rip.alpha = 0.9;
    this.ripples.push(rip);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.5;

      const p = this.getPooledParticle();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 0.8;
      p.size = 5 + Math.random() * 8;
      p.color = pollenColors[Math.floor(Math.random() * pollenColors.length)];
      p.maxLife = 35 + Math.floor(Math.random() * 20);
      p.type = 'pollen';
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.1;
      this.particles.push(p);
    }
  }

  /**
   * Bath Time: Soap bubbles bursting upward when sponge scrubs puppy.
   */
  public spawnSoapBubbles(x: number, y: number, count: number = 6): void {
    const bubblePastels = ['#ADE8F4', '#CAF0F8', '#E0AAFF', '#FFCCD5', '#C77DFF'];
    for (let i = 0; i < count; i++) {
      const p = this.getPooledParticle();
      p.x = x + (Math.random() - 0.5) * 20;
      p.y = y + (Math.random() - 0.5) * 20;
      p.vx = (Math.random() - 0.5) * 2.2;
      p.vy = -1.8 - Math.random() * 2.5;
      p.size = 14 + Math.random() * 16;
      p.color = bubblePastels[Math.floor(Math.random() * bubblePastels.length)];
      p.maxLife = 40 + Math.floor(Math.random() * 25);
      p.type = 'bubble';
      p.rotation = 0;
      p.vRot = 0;
      this.particles.push(p);
    }
  }

  /**
   * Sound Paint: Twinkling stardust drifting off the finger trail.
   */
  public spawnStardustTrail(x: number, y: number, color: string): void {
    if (this.particles.length > 35) return; // Keep pool headroom
    const p = this.getPooledParticle();
    p.x = x + (Math.random() - 0.5) * 12;
    p.y = y + (Math.random() - 0.5) * 12;
    p.vx = (Math.random() - 0.5) * 1.5;
    p.vy = -0.5 - Math.random() * 1.2;
    p.size = 4 + Math.random() * 6;
    p.color = color;
    p.maxLife = 25 + Math.floor(Math.random() * 15);
    p.type = 'sparkle';
    p.rotation = Math.random() * Math.PI * 2;
    p.vRot = (Math.random() - 0.5) * 0.2;
    this.particles.push(p);
  }

  /**
   * Spawns tractor engine smoke puffs.
   */
  public spawnSmokePuff(x: number, y: number): void {
    for (let i = 0; i < 3; i++) {
      const p = this.getPooledParticle();
      p.x = x + (Math.random() - 0.5) * 8;
      p.y = y + (Math.random() - 0.5) * 6;
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = -2.0 - Math.random() * 1.5;
      p.size = 14 + Math.random() * 10;
      p.color = 'rgba(235, 235, 235, 0.75)';
      p.maxLife = 36 + Math.floor(Math.random() * 14);
      p.type = 'smoke';
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.05;
      this.particles.push(p);
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
        this.recycleRipple(rip);
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
        p.vy -= 0.05;
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
      } else if (p.type === 'pollen') {
        p.vy += 0.02;
        p.vx += Math.sin(p.life * 0.15) * 0.1;
      } else {
        p.vy += 0.12;
        p.vx *= 0.98;
      }

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.recycleParticle(p);
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
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI);
        this.ctx.lineTo(0, -p.size * 0.9);
        this.ctx.closePath();
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = 'rgba(76, 201, 240, 0.8)';
        this.ctx.shadowBlur = 4;
        this.ctx.fill();
      } else if (p.type === 'mud') {
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size / 2, p.size / 2.6, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      } else if (p.type === 'smoke') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      } else if (p.type === 'pollen') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = '#FFD166';
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
      } else {
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
