/**
 * ARWE — Glitch FX System
 * Visual effects: CRT, chromatic aberration, text corruption,
 * pixel anomalies, screen shake, scanlines
 */

class GlitchFX {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.scanlineEl = document.getElementById('scanline-overlay');
    this.vignetteEl = document.getElementById('vignette-overlay');
    this.noiseEl = document.getElementById('noise-overlay');
    this.chromaticEl = document.getElementById('chromatic-overlay');
    this._activeEffects = new Set();
    this._animFrame = null;
    this._pixelAnomalies = [];
    this._textCorruptIntervals = [];
  }

  init() {
    this.canvas = document.getElementById('glitch-canvas');
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext('2d');
    }
    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
    });

    // Animate noise overlay
    this._animateNoise();
  }

  // --- CRT Effects ---
  enableScanlines() {
    this.scanlineEl?.classList.add('active');
  }
  disableScanlines() {
    this.scanlineEl?.classList.remove('active');
  }

  enableVignette() {
    this.vignetteEl?.classList.add('active');
  }

  enableCRT() {
    this.enableScanlines();
    this.enableVignette();
    document.body.classList.add('crt-active');
    this.noiseEl?.classList.add('active');
  }

  // --- Chromatic Aberration (Canvas-based) ---
  flashChromaticAberration(intensity = 3, duration = 150) {
    if (!this.ctx) return;
    this.canvas.style.opacity = '1';

    const w = this.canvas.width;
    const h = this.canvas.height;
    const startTime = performance.now();

    const draw = (now) => {
      const elapsed = now - startTime;
      if (elapsed >= duration) {
        this.ctx.clearRect(0, 0, w, h);
        this.canvas.style.opacity = '0';
        return;
      }

      this.ctx.clearRect(0, 0, w, h);
      const progress = elapsed / duration;
      const offset = intensity * (1 - progress);

      // Red channel — shifted left
      this.ctx.fillStyle = `rgba(255, 0, 0, 0.08)`;
      this.ctx.fillRect(-offset, 0, w, h);

      // Cyan channel — shifted right
      this.ctx.fillStyle = `rgba(0, 255, 255, 0.08)`;
      this.ctx.fillRect(offset, 0, w, h);

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  // --- Screen Shake ---
  shake(intensity = 1) {
    const body = document.body;
    body.style.transition = 'none';
    let start = null;
    const duration = 300;

    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      if (elapsed >= duration) {
        body.style.transform = '';
        return;
      }
      const decay = 1 - elapsed / duration;
      const x = (Math.random() * 2 - 1) * 4 * intensity * decay;
      const y = (Math.random() * 2 - 1) * 2 * intensity * decay;
      body.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  // --- Text Corruption ---
  corruptText(element, duration = 2000) {
    if (!element) return;
    const originalText = element.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>/\\|`~';
    let iterations = 0;
    const maxIterations = Math.floor(duration / 50);

    const interval = setInterval(() => {
      iterations++;
      if (iterations >= maxIterations) {
        element.textContent = originalText;
        clearInterval(interval);
        return;
      }
      const progress = iterations / maxIterations;
      element.textContent = originalText
        .split('')
        .map((char, i) => {
          if (char === ' ' || char === '\n') return char;
          if (i < originalText.length * progress) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
    }, 50);
    this._textCorruptIntervals.push(interval);
    return () => clearInterval(interval);
  }

  // --- Subtle Text Mutation (Phase 1 — very subtle) ---
  subtleMutate(element, charIndex, duration = 200) {
    if (!element) return;
    const text = element.textContent;
    if (charIndex >= text.length) return;

    const chars = '!@#$%^&*<>/\\|1234567890';
    const original = text[charIndex];
    let count = 0;
    const max = Math.floor(duration / 80);

    const iv = setInterval(() => {
      count++;
      if (count >= max) {
        element.textContent = text;
        clearInterval(iv);
        return;
      }
      const arr = text.split('');
      arr[charIndex] = chars[Math.floor(Math.random() * chars.length)];
      element.textContent = arr.join('');
    }, 80);
  }

  // --- Pixel Anomaly (Phase 1 subtle) ---
  spawnPixelAnomaly() {
    const el = document.createElement('div');
    el.className = 'pixel-anomaly';
    el.style.left = `${Math.random() * 95}vw`;
    el.style.top = `${Math.random() * 95}vh`;

    // Random color
    const colors = ['#00ff41', '#ff3333', '#0088ff', '#ffaa00'];
    el.style.background = colors[Math.floor(Math.random() * colors.length)];

    // Random size (1–4px)
    const size = 1 + Math.floor(Math.random() * 3);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    document.getElementById('app').appendChild(el);
    this._pixelAnomalies.push(el);

    // Remove after animation cycle
    setTimeout(() => {
      el.remove();
      this._pixelAnomalies = this._pixelAnomalies.filter(p => p !== el);
    }, 6000);
  }

  // --- Screen Tear Simulation ---
  screenTear() {
    const duration = 100 + Math.random() * 200;
    const outlet = document.getElementById('router-outlet');
    if (!outlet) return;

    const lineY = 20 + Math.random() * 60; // % from top
    outlet.style.clipPath = `polygon(0 0, 100% 0, 100% ${lineY}%, 0 ${lineY}%)`;
    outlet.style.transform = `translateX(${(Math.random() * 2 - 1) * 6}px)`;

    setTimeout(() => {
      outlet.style.clipPath = '';
      outlet.style.transform = '';
    }, duration);
  }

  // --- Scrollbar self-move ---
  selfScroll() {
    const amount = (Math.random() * 2 - 1) * 80;
    window.scrollBy({ top: amount, behavior: 'smooth' });
    setTimeout(() => {
      window.scrollBy({ top: -amount, behavior: 'smooth' });
    }, 800);
  }

  // --- Noise animation (internal) ---
  _animateNoise() {
    if (!this.noiseEl) return;

    // Generate noise using SVG filter via CSS custom property
    const animate = () => {
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      if (this.noiseEl) {
        this.noiseEl.style.backgroundPosition = `${x}% ${y}%`;
      }
      setTimeout(() => requestAnimationFrame(animate), 100);
    };
    animate();
  }

  // --- Glitch flash (full-screen visual distortion) ---
  glitchFlash(intensity = 1) {
    this.flashChromaticAberration(3 * intensity, 200);
    if (intensity > 0.7) this.shake(intensity);
    if (intensity > 0.5) this.screenTear();
  }
}

export const glitchFX = new GlitchFX();
