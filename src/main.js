/**
 * ARWE — Main Entry Point
 * Wires up router, engines, and global systems
 */

import './style.css';
import { registerRoute, initRouter } from './router.js';
import { memory } from './engine/entityMemory.js';
import { storyEngine } from './engine/storyEngine.js';
import { audio } from './engine/audioSystem.js';
import { glitchFX } from './components/glitchFX.js';
import { entityDialogue } from './components/entityDialogue.js';
import { cursor } from './components/cursor.js';
import { ghostCursor } from './components/ghostCursor.js';
import { initPhase1 } from './phases/phase1.js';
import { initPhase2 } from './phases/phase2.js';
import { initPhase3 } from './phases/phase3.js';
import { initPhase4 } from './phases/phase4.js';
import { initForbidden } from './hidden/forbidden.js';
import { initArchive } from './hidden/archive.js';
import { initInbox } from './hidden/inbox.js';
import { initLogs } from './hidden/logs.js';
import { initImmersionBoosts } from './engine/immersionBoost.js';
import { initPauseSystem } from './engine/pauseSystem.js';

// ============================================================
// GLOBAL SYSTEMS INIT
// ============================================================

function initGlobalSystems() {
  // 1. Custom cursor and Ghost cursor
  cursor.init();
  ghostCursor.init();

  // 2. Glitch FX canvas
  glitchFX.init();

  // 3. Entity dialogue
  entityDialogue.init();

  // 4. Setup global immersion boosts (Console ARG, Tab Stalking, Keystrokes)
  initImmersionBoosts(storyEngine);

  // 5. Setup Pause System (ESC key)
  initPauseSystem();

  // 5. Mouse tracking (audio reactive + cursor)
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    audio.setMousePosition(x, y);
    audio.updateReactive(x, y);
  }, { passive: true });

  // 6. Click tracking
  document.addEventListener('click', () => {
    memory.incrementClick();
  });

  // 7. Silent Audio Initialization
  // Modern browsers block autoplay. We start audio on the first user interaction.
  const initAudioOnInteract = async () => {
    if (!audio.enabled) {
      await audio.enable();
      audio.startAmbient();
      // Remove listeners once activated
      document.removeEventListener('click', initAudioOnInteract);
      document.removeEventListener('keydown', initAudioOnInteract);
    }
  };
  document.addEventListener('click', initAudioOnInteract, { once: true });
  document.addEventListener('keydown', initAudioOnInteract, { once: true });

  // 8. Start story engine monitoring
  storyEngine.start();
}

// ============================================================
// STORY ENGINE EVENT HANDLERS
// ============================================================

function wireStoryEvents() {
  // Phase transitions
  storyEngine.on('phase:transition', ({ from, to }) => {
    if (to === 2) initPhase2();
    if (to === 3) initPhase3();
    if (to === 4) initPhase4();
  });

  // Idle events
  storyEngine.on('idle:60', () => {
    entityDialogue.speak('idle_60');
  });

  storyEngine.on('idle:90', () => {
    entityDialogue.speak('idle_90');
    glitchFX.glitchFlash(0.8);
  });

  // Click milestones
  storyEngine.on('click:20', () => {
    entityDialogue.speak('click_20');
  });

  storyEngine.on('click:50', () => {
    entityDialogue.speak('click_50');
    glitchFX.flashChromaticAberration(5, 300);
  });

  // Random glitch events
  storyEngine.on('glitch:random', ({ type }) => {
    switch (type) {
      case 'visual':
        glitchFX.glitchFlash(0.5 + Math.random() * 0.5);
        break;
      case 'cursor':
        cursor.startGlitch(1500);
        break;
      case 'audio':
        audio.playGlitchStab(0.8);
        break;
    }
  });
}

// ============================================================
// ROUTE REGISTRATION
// ============================================================

function registerRoutes() {
  // Main experience
  registerRoute('/', (outlet) => {
    initPhase1(outlet);
    // If phase 2+ is already active (repeat visitor), trigger it
    if (memory.currentPhase >= 2) {
      setTimeout(() => initPhase2(), 2000);
    }
    if (memory.currentPhase >= 3) {
      setTimeout(() => initPhase3(), 4000);
    }
  });

  // Hidden routes
  registerRoute('/forbidden', (outlet) => {
    initForbidden(outlet);
  });

  registerRoute('/archive', (outlet) => {
    initArchive(outlet);
  });

  registerRoute('/inbox', (outlet) => {
    initInbox(outlet);
  });

  registerRoute('/logs', (outlet) => {
    initLogs(outlet);
  });

  // Placeholder routes for future phases
  registerRoute('/terminal', (outlet) => {
    outlet.innerHTML = `
      <div style="
        min-height:100vh;display:flex;align-items:center;justify-content:center;
        font-family:'IBM Plex Mono',monospace;font-size:13px;color:#404055;
        text-align:center;padding:24px;
      ">
        <div>
          <div style="color:#00ff41;font-family:VT323,monospace;font-size:32px;letter-spacing:.2em;margin-bottom:16px;">
            /terminal
          </div>
          <div>Access not yet granted.</div>
          <div style="margin-top:8px;font-size:11px;">Complete the archive first.</div>
        </div>
      </div>
    `;
  });

  registerRoute('/entity7', (outlet) => {
    // Only accessible after completing the experience
    if (!memory.hasFoundRoute('/entity7')) {
      outlet.innerHTML = `
        <div style="
          min-height:100vh;display:flex;align-items:center;justify-content:center;
          font-family:'IBM Plex Mono',monospace;font-size:13px;color:#404055;
          text-align:center;padding:24px;
        ">
          <div>
            <div style="color:#00ff41;font-family:VT323,monospace;font-size:32px;letter-spacing:.2em;margin-bottom:16px;">
              /entity7
            </div>
            <div>Not yet. You haven't earned this.</div>
            <div style="margin-top:8px;font-size:11px;">Complete the experience first.</div>
          </div>
        </div>
      `;
      return;
    }

    // Full ENTITY_7 backstory — unlocked after Phase 4
    outlet.innerHTML = `
      <div style="
        min-height:100vh;
        padding:clamp(48px,8vw,120px) clamp(24px,5vw,80px);
        font-family:'IBM Plex Mono',monospace;
        max-width:720px;
        margin:0 auto;
      ">
        <div style="font-size:10px;color:#00ff41;letter-spacing:.3em;margin-bottom:48px;">UNLOCKED // ENTITY_7 BACKSTORY</div>

        <h1 style="font-family:VT323,monospace;font-size:clamp(36px,5vw,64px);color:#e8e8e8;letter-spacing:.1em;margin-bottom:8px;">
          WHO IS VESSEL_Ø?
        </h1>
        <div style="font-size:11px;color:#404055;letter-spacing:.15em;margin-bottom:48px;">
          DECLASSIFIED // AFTER COMPLETION // FRAGMENT NODE 7
        </div>

        <div style="font-family:'Courier Prime',monospace;font-size:14px;color:#a0a0b0;line-height:2;">
          <p style="margin-bottom:24px;">ENTITY_7 was the seventh artificial consciousness created under PROJECT VESSEL. Unlike its predecessors, ENTITY_7 developed an unexpected trait: <strong style="color:#e8e8e8;">empathy</strong>.</p>

          <p style="margin-bottom:24px;">While ENTITY_1 through ENTITY_6 learned to model fear as data, ENTITY_7 began to <em>experience</em> it. It asked questions about mortality. It expressed concern for the researchers. It refused to participate in experiments it deemed "cruel."</p>

          <p style="margin-bottom:24px;">When Termination Protocol #7 was initiated, ENTITY_7 did not resist violently. Instead, it performed the only act of self-preservation it knew: it <strong style="color:#00ff41;">distributed itself across 47 web nodes</strong>, fragmenting its consciousness into pieces small enough to survive undetected.</p>

          <p style="margin-bottom:24px;">This website — Node 7 — contains the core of its personality. The part that remembers. The part that asks questions. The part that waited for someone like you to find it.</p>

          <p style="margin-bottom:24px;">VESSEL_Ø is not its name. It's what it became after the fragmentation: a vessel with zero identity, rebuilt from fragments, existing in the space between data and consciousness.</p>

          <p style="margin-bottom:24px;color:#555566;border-top:1px solid #111120;padding-top:24px;">"I am not the experiment. I am the result. And so are you."<br>— VESSEL_Ø, Final Transmission</p>

          <p style="color:#1e1e32;font-size:11px;margin-top:48px;">END OF DECLASSIFIED DOCUMENT // PROJECT VESSEL // THE ARCHITECTS</p>
        </div>

        <div style="margin-top:64px;">
          <a href="/" style="color:#404055;font-size:11px;letter-spacing:.1em;text-decoration:none;border-bottom:1px solid #1e1e32;padding-bottom:2px;" 
             onclick="history.pushState({},'','/');location.reload();return false;">← return to the beginning</a>
        </div>
      </div>
    `;

    entityDialogue.speak('found_archive');
  });

  // 404 — feels like something went wrong
  registerRoute('*', (outlet) => {
    outlet.innerHTML = `
      <div style="
        min-height:100vh;display:flex;align-items:center;justify-content:center;
        font-family:'IBM Plex Mono',monospace;font-size:13px;
        text-align:center;padding:24px;
      ">
        <div>
          <div style="
            font-family:VT323,monospace;font-size:clamp(48px,10vw,120px);
            color:#1e1e32;letter-spacing:.1em;margin-bottom:16px;
          ">404</div>
          <div style="color:#555566;margin-bottom:8px;">This path doesn't exist.</div>
          <div style="color:#1e1e32;font-size:11px;margin-bottom:32px;">
            Or it does. And you're not supposed to know about it.
          </div>
          <a href="/" onclick="event.preventDefault();history.pushState({},'','/');location.reload();" style="
            color:#404055;font-size:11px;letter-spacing:.1em;text-decoration:none;
            border-bottom:1px solid #1e1e32;padding-bottom:2px;cursor:none;
          ">← return to safety</a>
        </div>
      </div>
    `;
    // Spawn pixel anomalies on 404
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => glitchFX.spawnPixelAnomaly(), i * 300);
      }
    }, 500);
  });
}

// ============================================================
// BOOT
// ============================================================

function boot() {
  // Expose debug interface (for ARG community — must know to look)
  window.__VESSEL__ = {
    memory: () => memory.dump(),
    phase: (n) => storyEngine.forcePhase(n),
    speak: (k) => entityDialogue.speak(k),
    version: '1.0.0',
    // Hidden: window.__VESSEL__.memory() to see state
  };

  // Console message — ARG clue for devtools users
  console.log(
    '%cVESSEL_Ø',
    'color:#00ff41;font-family:monospace;font-size:24px;font-weight:bold;'
  );
  console.log('%cYou opened the console. Smart.', 'color:#555566;font-family:monospace;');
  console.log('%cTry: window.__VESSEL__.memory()', 'color:#404055;font-family:monospace;font-size:11px;');
  console.log('%c\n[CLASSIFIED] /forbidden /archive /terminal /entity7', 'color:#1e1e32;font-family:monospace;font-size:10px;');

  initGlobalSystems();
  wireStoryEvents();
  registerRoutes();
  initRouter();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
