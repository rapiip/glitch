/**
 * ARWE — Mirror Mode
 * Entity echoes what the user types — reversed, distorted, as if it's reading their mind.
 * In Phase 2+, predict mode shows ghost text BEFORE user finishes typing.
 */

import { audio } from '../engine/audioSystem.js';
import { glitchFX } from './glitchFX.js';

// Common words the "entity" might predict
const PREDICTIONS = [
  'help', 'why', 'who', 'what', 'how', 'stop', 'no', 'yes',
  'leave', 'scared', 'afraid', 'watching', 'please', 'hello',
  'vessel', 'entity', 'exit', 'escape', 'real', 'fake',
];

class MirrorMode {
  constructor() {
    this.active = false;
    this.buffer = '';
    this.echoEl = null;
    this.ghostEl = null;
    this.fadeTimeout = null;
    this.predictMode = false;
    this._boundOnKey = this._onKey.bind(this);
    this._keystrokeCount = 0;
    this._lastPrediction = '';
  }

  init() {
    // Create the main echo element (reversed text)
    this.echoEl = document.createElement('div');
    this.echoEl.id = 'mirror-echo';
    this.echoEl.className = 'mirror-echo';
    document.getElementById('app')?.appendChild(this.echoEl);

    // Create the ghost prediction element
    this.ghostEl = document.createElement('div');
    this.ghostEl.id = 'mirror-ghost';
    this.ghostEl.className = 'mirror-ghost';
    document.getElementById('app')?.appendChild(this.ghostEl);
  }

  activate(predictMode = false) {
    if (this.active) return;
    this.active = true;
    this.predictMode = predictMode;
    document.addEventListener('keydown', this._boundOnKey, { passive: true });
  }

  deactivate() {
    this.active = false;
    this.buffer = '';
    document.removeEventListener('keydown', this._boundOnKey);
    if (this.echoEl) this.echoEl.classList.remove('visible');
    if (this.ghostEl) this.ghostEl.classList.remove('visible');
  }

  _onKey(e) {
    if (!this.active) return;
    // Don't capture in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    // Ignore modifier keys, function keys, etc.
    if (e.key.length !== 1) return;

    this.buffer += e.key;
    this._keystrokeCount++;

    // Cap buffer length
    if (this.buffer.length > 50) {
      this.buffer = this.buffer.substring(this.buffer.length - 50);
    }

    this._showEcho();

    // Prediction mode (Phase 2+): occasionally show "predicted" text
    if (this.predictMode && this._keystrokeCount % 8 === 0) {
      this._showPrediction();
    }

    // Trigger glitch on every 15th keystroke
    if (this._keystrokeCount % 15 === 0) {
      glitchFX.flashChromaticAberration(2, 100);
    }
  }

  _showEcho() {
    if (!this.echoEl) return;

    const distorted = this._distort(this.buffer);
    this.echoEl.textContent = distorted;
    this.echoEl.classList.add('visible');

    // Randomize position occasionally
    if (Math.random() < 0.2 || this._keystrokeCount <= 1) {
      const positions = [
        { top: '15%', left: '5%', ta: 'left' },
        { top: '20%', right: '5%', left: 'auto', ta: 'right' },
        { top: '70%', left: '8%', ta: 'left' },
        { top: '75%', right: '8%', left: 'auto', ta: 'right' },
        { top: '50%', left: '50%', ta: 'center' },
      ];
      const pos = positions[Math.floor(Math.random() * positions.length)];
      this.echoEl.style.top = pos.top;
      this.echoEl.style.left = pos.left || '';
      this.echoEl.style.right = pos.right || '';
      this.echoEl.style.textAlign = pos.ta;
    }

    // Subtle entity tone on certain keystrokes
    if (Math.random() < 0.08) {
      audio.playEntityTone();
    }

    // Fade out after inactivity
    clearTimeout(this.fadeTimeout);
    this.fadeTimeout = setTimeout(() => {
      this.echoEl.classList.remove('visible');
      this.buffer = '';
    }, 4000);
  }

  _showPrediction() {
    if (!this.ghostEl) return;

    // Pick a "predicted" word that somewhat matches what user is typing
    const lastChars = this.buffer.slice(-3).toLowerCase();
    let prediction = PREDICTIONS.find(w => w.startsWith(lastChars));
    if (!prediction || prediction === this._lastPrediction) {
      prediction = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
    }
    this._lastPrediction = prediction;

    // Show prediction near cursor or random position
    this.ghostEl.textContent = `> ${prediction.toUpperCase()}...`;
    this.ghostEl.classList.add('visible');
    this.ghostEl.style.top = `${30 + Math.random() * 40}%`;
    this.ghostEl.style.left = `${20 + Math.random() * 60}%`;

    // Brief audio
    audio.playEntityTone();

    setTimeout(() => {
      this.ghostEl.classList.remove('visible');
    }, 2000 + Math.random() * 1500);
  }

  _distort(text) {
    const reversed = text.split('').reverse().join('');
    const glitchChars = '░▒▓█▀▄▌▐╠╣╬║╗╝╚╔';

    return reversed.split('').map(c => {
      if (c === ' ') return ' ';
      // 20% chance to replace with glitch char
      if (Math.random() < 0.2) {
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      // 10% chance to uppercase/lowercase flip
      if (Math.random() < 0.1) {
        return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
      }
      return c;
    }).join('');
  }
}

export const mirrorMode = new MirrorMode();
