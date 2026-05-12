/**
 * ARWE — Story Engine
 * State machine managing phase transitions and event triggers
 */

import { memory } from './entityMemory.js';
import { audio } from './audioSystem.js';

class StoryEngine {
  constructor() {
    this.phase = 1;
    this.listeners = {};
    this._timers = [];
    this._intervals = [];
    this._phaseStartTime = Date.now();
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => { // returns unsubscribe fn
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  start() {
    this.phase = memory.currentPhase;
    this._startEventLoop();
    this._startIdleDetector();
  }

  _startEventLoop() {
    // Check conditions every second
    const interval = setInterval(() => {
      if (window.ARWE_PAUSED) return;

      const t = memory.sessionTime;
      const clicks = memory.clickCount;
      const idle = memory.idleTime;

      // --- Phase 1 → 2 transition (after 90 seconds or 10+ clicks) ---
      if (this.phase === 1 && (t >= 90 || clicks >= 10)) {
        if (memory.triggerEvent('phase2_trigger')) {
          this.transitionToPhase(2);
        }
      }

      // --- Phase 2 → 3 transition (after 5 min or heavy interaction) ---
      if (this.phase === 2 && (t >= 300 || clicks >= 40)) {
        if (memory.triggerEvent('phase3_trigger')) {
          this.transitionToPhase(3);
        }
      }

      // --- Idle detection ---
      if (idle > 60 && !memory.hasTriggeredEvent(`idle_60_${Math.floor(t / 60)}`)) {
        if (memory.triggerEvent(`idle_60_${Math.floor(t / 60)}`)) {
          this.emit('idle:60', { idle });
        }
      }

      if (idle > 90) {
        if (memory.triggerEvent(`idle_90_${Math.floor(t / 90)}`)) {
          this.emit('idle:90', { idle });
        }
      }

      // --- Click milestones ---
      if (clicks === 20 && memory.triggerEvent('click_20')) {
        this.emit('click:20', { clicks });
      }
      if (clicks === 50 && memory.triggerEvent('click_50')) {
        this.emit('click:50', { clicks });
      }

      // --- Glitch stab random trigger ---
      if (this.phase >= 2 && Math.random() < 0.008) {
        this.emit('glitch:stab', {});
        audio.playGlitchStab(0.5 + Math.random() * 0.5);
      }

      // --- Whisper trigger in Phase 2+ ---
      if (this.phase >= 2 && Math.random() < 0.004) {
        this.emit('audio:whisper', {});
        audio.playWhisper();
      }

    }, 1000);
    this._intervals.push(interval);
  }

  _startIdleDetector() {
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    const reset = () => memory.resetIdle();
    events.forEach(e => document.addEventListener(e, reset, { passive: true }));
  }

  transitionToPhase(newPhase) {
    if (newPhase <= this.phase) return;
    console.log(`[STORY] Transitioning: Phase ${this.phase} → ${newPhase}`);
    const prev = this.phase;
    this.phase = newPhase;
    memory.setPhase(newPhase);
    this._phaseStartTime = Date.now();
    this.emit('phase:transition', { from: prev, to: newPhase });
  }

  // Force skip to phase (for testing / secret routes)
  forcePhase(n) {
    this.transitionToPhase(n);
  }

  // Random glitch event (triggered externally)
  triggerRandomGlitch() {
    const types = ['text', 'visual', 'audio', 'cursor'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.emit('glitch:random', { type });
  }

  destroy() {
    this._intervals.forEach(clearInterval);
    this._timers.forEach(clearTimeout);
  }
}

export const storyEngine = new StoryEngine();
