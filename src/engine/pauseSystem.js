/**
 * ARWE — Global Pause System
 * Suspends audio, CSS animations, story engine timers, and overlays a pause screen.
 */

import { audio } from './audioSystem.js';

let isPaused = false;
let pauseOverlay = null;
let styleTag = null;

export function initPauseSystem() {
  window.ARWE_PAUSED = false;

  document.addEventListener('keydown', (e) => {
    // We use the 'Escape' key to toggle pause
    if (e.key === 'Escape') {
      togglePause();
    }
  });
}

function togglePause() {
  isPaused = !isPaused;
  window.ARWE_PAUSED = isPaused;

  if (isPaused) {
    // 1. Suspend Audio Context completely
    if (audio.ctx && audio.ctx.state === 'running') {
      audio.ctx.suspend();
    }

    // 2. Inject global CSS to freeze all animations
    styleTag = document.createElement('style');
    styleTag.textContent = `* { animation-play-state: paused !important; }`;
    document.head.appendChild(styleTag);

    // 3. Create full-screen Pause Overlay
    pauseOverlay = document.createElement('div');
    pauseOverlay.innerHTML = `
      <div style="font-family:VT323,monospace;font-size:clamp(48px,8vw,80px);color:#e8e8e8;letter-spacing:0.2em;text-shadow:0 0 20px rgba(255,255,255,0.2);">
        [ PAUSED ]
      </div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#a0a0b0;margin-top:24px;letter-spacing:0.1em;">
        Simulation suspended. Press [ESC] to resume.
      </div>
    `;
    pauseOverlay.style.cssText = `
      position:fixed; inset:0; z-index:999999;
      background:rgba(2, 2, 4, 0.9); backdrop-filter:blur(8px);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      opacity:0; transition:opacity 0.2s ease;
    `;
    document.body.appendChild(pauseOverlay);

    // Fade in
    requestAnimationFrame(() => {
      pauseOverlay.style.opacity = '1';
    });
    
  } else {
    // 1. Resume Audio Context
    if (audio.ctx && audio.ctx.state === 'suspended') {
      audio.ctx.resume();
    }

    // 2. Remove CSS freeze
    if (styleTag) {
      styleTag.remove();
      styleTag = null;
    }

    // 3. Remove Overlay
    if (pauseOverlay) {
      pauseOverlay.style.opacity = '0';
      setTimeout(() => {
        if (pauseOverlay) pauseOverlay.remove();
        pauseOverlay = null;
      }, 200);
    }
  }
}
