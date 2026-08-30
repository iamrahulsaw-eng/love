/**
 * HIGH-PERFORMANCE ROMANTIC PARTICLES ENGINE (60 FPS & Lag-Free)
 * Optimized for mobile & desktop with zero heavy shadowBlur & pre-cached rendering.
 */

class RomanticCanvasFX {
  constructor() {
    this.canvas = document.getElementById('fx-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.stars = [];
    this.petals = [];
    this.sparkles = [];
    this.burstHearts = [];

    this.isMobile = window.innerWidth < 768;
    this.wind = 0.2;
    this.lastFrameTime = performance.now();
    this.mouseMoved = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
      this.resize();
    });

    // Lightweight stars count (low overhead)
    const starCount = this.isMobile ? 35 : 65;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.4 + 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        speed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: Math.random() > 0.4 ? '#ffd166' : '#ff85a2'
      });
    }

    // Lightweight falling petals count
    const petalCount = this.isMobile ? 12 : 22;
    for (let i = 0; i < petalCount; i++) {
      this.petals.push(this.createPetal(true));
    }

    // Throttled mouse sparkle
    let lastSparkleTime = 0;
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSparkleTime > 60) {
        lastSparkleTime = now;
        this.addSparkle(e.clientX, e.clientY);
      }
    }, { passive: true });

    // Touch tap sparkle
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.addSparkle(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createPetal(randomY = false) {
    return {
      x: Math.random() * (this.width + 60) - 30,
      y: randomY ? Math.random() * this.height : -25,
      size: Math.random() * 10 + 9,
      speedY: Math.random() * 0.9 + 0.6,
      speedX: Math.random() * 0.6 - 0.3,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() * 0.03 - 0.015),
      flip: Math.random() * Math.PI,
      flipSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.4 ? '#ff4d6d' : '#e01e37',
      opacity: Math.random() * 0.3 + 0.6
    };
  }

  addSparkle(x, y) {
    if (this.sparkles.length > 25) return;
    this.sparkles.push({
      x: x + (Math.random() * 16 - 8),
      y: y + (Math.random() * 16 - 8),
      size: Math.random() * 3 + 2,
      alpha: 1,
      decay: 0.04,
      color: Math.random() > 0.5 ? '#ffd166' : '#ff85a2'
    });
  }

  triggerHeartExplosion(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    const count = this.isMobile ? 16 : 28;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.burstHearts.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: Math.random() * 12 + 8,
        alpha: 1,
        decay: 0.02,
        color: ['#ff4d6d', '#ff85a2', '#ffd166', '#ffffff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 14, size / 14);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-5, -6, -10, -6, -10, 0);
    ctx.bezierCurveTo(-10, 5, -4, 9, 0, 13);
    ctx.bezierCurveTo(4, 9, 10, 5, 10, 0);
    ctx.bezierCurveTo(10, -6, 5, -6, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  drawPetalFast(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.scale(1, Math.sin(p.flip));
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
    ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);
    ctx.fill();

    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Twinkling Stars (Clean & Fast)
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.alpha += s.speed;
      if (s.alpha > 0.85 || s.alpha < 0.2) s.speed = -s.speed;

      this.ctx.globalAlpha = s.alpha;
      this.ctx.fillStyle = s.color;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 2. Draw Falling Petals (Fast bezier fills)
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.015) * this.wind;
      p.angle += p.rotSpeed;
      p.flip += p.flipSpeed;

      this.drawPetalFast(this.ctx, p);

      if (p.y > this.height + 30 || p.x < -40 || p.x > this.width + 40) {
        Object.assign(p, this.createPetal(false));
      }
    }

    // 3. Draw Sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const sp = this.sparkles[i];
      sp.alpha -= sp.decay;
      if (sp.alpha <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }
      this.ctx.globalAlpha = sp.alpha;
      this.ctx.fillStyle = sp.color;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 4. Draw Burst Hearts
    for (let i = this.burstHearts.length - 1; i >= 0; i--) {
      const h = this.burstHearts[i];
      h.x += h.vx;
      h.y += h.vy;
      h.vy += 0.15;
      h.alpha -= h.decay;

      if (h.alpha <= 0) {
        this.burstHearts.splice(i, 1);
        continue;
      }
      this.drawHeart(this.ctx, h.x, h.y, h.size, h.color, h.alpha);
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.romanticFX = new RomanticCanvasFX();
});
