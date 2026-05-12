/**
 * ARWE — Custom Cursor System
 * Square cursor with intentional lag (Phase 1 psychological effect)
 * + Cursor Autonomy: entity can take over the cursor
 */

import { audio } from '../engine/audioSystem.js';

class CursorSystem {
  constructor() {
    this.el = null;
    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.delay = 80; // ms lag — feels "watched"
    this._frame = null;
    this._lagFactor = 0.12; // 0 = max lag, 1 = instant
    this._glitchActive = false;
    this._positions = []; // Trail for ghost cursor

    // Autonomy state
    this._autonomous = false;
    this._autoTargetX = 0;
    this._autoTargetY = 0;
    this._autoStrength = 0.85; // How hard entity pulls (0-1)
    this._autoCallback = null;
    this._autoTimeout = null;
    this._resistAmount = 0;
  }

  init() {
    this.el = document.getElementById('cursor-trail');
    if (!this.el) return;

    document.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
      this._positions.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      if (this._positions.length > 20) this._positions.shift();

      // Track resist amount during autonomy
      if (this._autonomous) {
        const dx = e.movementX || 0;
        const dy = e.movementY || 0;
        // Boost the resist gained per movement so user has more power
        this._resistAmount += Math.sqrt(dx * dx + dy * dy) * 2.0;
      }
    });

    document.addEventListener('mousedown', () => {
      this.el.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
      this.el.classList.remove('clicking');
    });

    this._animate();
  }

  _animate() {
    if (this._autonomous) {
      // Entity controls cursor — blend between user target and entity target
      // Higher resist amount = higher user weight (capped at 0.95 = 95% control)
      const userWeight = Math.min(0.95, this._resistAmount * 0.002);
      
      // Entity weight decreases slightly as user fights
      const entityWeight = Math.max(0.05, this._autoStrength - (userWeight * 0.5));

      // Normalize weights so they always add up to 1.0 for correct interpolation
      const totalWeight = userWeight + entityWeight;
      const normUserWeight = userWeight / totalWeight;
      const normEntityWeight = entityWeight / totalWeight;

      const blendX = this.targetX * normUserWeight + this._autoTargetX * normEntityWeight;
      const blendY = this.targetY * normUserWeight + this._autoTargetY * normEntityWeight;

      // Slower interpolation = more "rubbery/elastic" tug-of-war feel
      this.currentX += (blendX - this.currentX) * 0.08;
      this.currentY += (blendY - this.currentY) * 0.08;

      // Check if cursor reached target
      const dist = Math.sqrt(
        (this.currentX - this._autoTargetX) ** 2 +
        (this.currentY - this._autoTargetY) ** 2
      );

      // Only auto-click if we reached it AND entity still has majority control
      if (dist < 12 && this._autoCallback && normEntityWeight > 0.55) {
        const cb = this._autoCallback;
        this._autoCallback = null;
        cb();
      }

      // Decay resist over time so entity pulls again if user stops moving
      this._resistAmount *= 0.88;
    } else {
      // Normal: lerp toward target position with intentional lag
      this.currentX += (this.targetX - this.currentX) * this._lagFactor;
      this.currentY += (this.targetY - this.currentY) * this._lagFactor;
    }

    if (this._glitchActive) {
      const jitterX = (Math.random() * 2 - 1) * 4;
      const jitterY = (Math.random() * 2 - 1) * 4;
      this.el.style.left = `${this.currentX + jitterX}px`;
      this.el.style.top = `${this.currentY + jitterY}px`;
    } else {
      this.el.style.left = `${this.currentX}px`;
      this.el.style.top = `${this.currentY}px`;
    }

    this._frame = requestAnimationFrame(() => this._animate());
  }

  // Increase lag (Phase 2 effect)
  setLag(factor) {
    this._lagFactor = Math.max(0.01, Math.min(1, factor));
  }

  // Glitch the cursor position randomly
  startGlitch(duration = 2000) {
    this._glitchActive = true;
    this.el.classList.add('glitched');
    setTimeout(() => {
      this._glitchActive = false;
      this.el.classList.remove('glitched');
    }, duration);
  }

  // ============================================================
  // CURSOR AUTONOMY — Entity takes over the cursor
  // ============================================================

  /**
   * Entity takes over the cursor and moves it to a target element.
   * @param {string|Element} target - CSS selector or DOM element to move to
   * @param {Object} options
   * @param {boolean} options.click - Whether to simulate a click (default: true)
   * @param {number} options.strength - How hard entity pulls 0-1 (default: 0.85)
   * @param {number} options.timeout - Max ms before giving up (default: 6000)
   * @returns {Promise<boolean>} - Whether the takeover succeeded
   */
  takeover(target, options = {}) {
    const { click = true, strength = 0.85, timeout = 6000 } = options;

    return new Promise((resolve) => {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) { resolve(false); return; }

      const rect = el.getBoundingClientRect();
      this._autoTargetX = rect.left + rect.width / 2;
      this._autoTargetY = rect.top + rect.height / 2;
      this._autoStrength = strength;
      this._autonomous = true;
      this._resistAmount = 0;

      // Visual indicator that entity has control
      if (this.el) {
        this.el.classList.add('autonomous');
      }

      // Subtle audio cue
      audio.playEntityTone();

      // On arrival, click and release
      this._autoCallback = () => {
        if (click) {
          // Visual click effect
          if (this.el) {
            this.el.classList.add('clicking');
            setTimeout(() => this.el.classList.remove('clicking'), 150);
          }
          // Dispatch actual click on the target element
          el.dispatchEvent(new MouseEvent('click', {
            bubbles: true, cancelable: true,
            clientX: this._autoTargetX,
            clientY: this._autoTargetY,
          }));
        }
        this._releaseAutonomy();
        resolve(true);
      };

      // Timeout failsafe
      this._autoTimeout = setTimeout(() => {
        this._releaseAutonomy();
        resolve(false);
      }, timeout);
    });
  }

  /**
   * Entity moves cursor to multiple targets in sequence.
   * @param {Array} targets - Array of { selector, click, delay }
   */
  async takeoverSequence(targets) {
    for (const t of targets) {
      const success = await this.takeover(t.selector || t.element, {
        click: t.click !== false,
        strength: t.strength || 0.85,
        timeout: t.timeout || 5000,
      });
      if (t.delay) await new Promise(r => setTimeout(r, t.delay));
    }
  }

  _releaseAutonomy() {
    this._autonomous = false;
    this._autoCallback = null;
    this._resistAmount = 0;
    if (this._autoTimeout) {
      clearTimeout(this._autoTimeout);
      this._autoTimeout = null;
    }
    if (this.el) {
      this.el.classList.remove('autonomous');
    }
  }

  // "Duplicate" cursor effect — spawn ghost cursors
  spawnGhostCursor(count = 1) {
    for (let i = 0; i < count; i++) {
      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position: fixed;
        width: 12px;
        height: 12px;
        border: 1px solid rgba(255, 51, 51, 0.4);
        pointer-events: none;
        z-index: 9998;
        left: ${this.currentX + (Math.random() * 2 - 1) * 30}px;
        top: ${this.currentY + (Math.random() * 2 - 1) * 30}px;
        transform: translate(-50%, -50%);
        transition: opacity 1s ease;
      `;
      document.body.appendChild(ghost);

      // Fade ghost out
      setTimeout(() => {
        ghost.style.opacity = '0';
        setTimeout(() => ghost.remove(), 1000);
      }, 1000 + Math.random() * 1000);
    }
  }

  destroy() {
    if (this._frame) cancelAnimationFrame(this._frame);
    this._releaseAutonomy();
  }
}

export const cursor = new CursorSystem();
