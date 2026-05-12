/**
 * ARWE — PHASE 2: Corruption
 * UI begins breaking. VESSEL_Ø makes first contact.
 */

import { glitchFX } from '../components/glitchFX.js';
import { entityDialogue } from '../components/entityDialogue.js';
import { showNotification, showPhase2Notifications } from '../components/notifications.js';
import { audio } from '../engine/audioSystem.js';
import { storyEngine } from '../engine/storyEngine.js';
import { cursor } from '../components/cursor.js';
import { mirrorMode } from '../components/mirrorMode.js';
import { fakeNotifs } from '../components/fakeSystemNotifs.js';

let _phase2Active = false;
let _intervals = [];
let _timeouts = [];

export async function initPhase2() {
  if (_phase2Active) return;
  _phase2Active = true;

  console.log('[PHASE 2] Corruption begins');

  // 1. Enable CRT effects
  await wait(500);
  glitchFX.enableCRT();

  // 2. Change tab title
  await wait(1000);
  startTitleCorruption();

  // 3. Slow the cursor more
  cursor.setLag(0.07);

  // 4. Entity speaks for the first time
  await wait(2000);
  entityDialogue.speak('phase2_enter');

  // 5. Fake notifications
  await wait(3000);
  showPhase2Notifications();

  // 6. Audio transition
  await wait(1500);
  audio.playGlitchStab(1);
  setTimeout(() => audio.playWhisper(), 2000);

  // 7. Start corruption effects loop
  startCorruptionLoop();

  // Initialize Mirror Mode
  mirrorMode.init();
  mirrorMode.activate(true); // predict mode true for phase 2

  // Request Notification Permissions on next interaction
  document.addEventListener('click', () => {
    fakeNotifs.requestPermission().then(granted => {
      if (granted) {
        fakeNotifs.schedulePhase2Sequence();
        fakeNotifs.setupTabHiddenNotif();
      }
    });
  }, { once: true });

  // 8. Tab title changes
  await wait(15000);
  entityDialogue.startAmbientMessages(40000);

  // 9. Scrollbar self-move
  const scrollId = setInterval(() => {
    if (Math.random() < 0.15) {
      glitchFX.selfScroll();
    }
  }, 30000);
  _intervals.push(scrollId);

  // 10. Ghost cursors occasionally
  const ghostId = setInterval(() => {
    if (Math.random() < 0.2) {
      cursor.spawnGhostCursor(1 + Math.floor(Math.random() * 2));
    }
  }, 20000);
  _intervals.push(ghostId);

  // 11. Screen shake on big glitch
  storyEngine.on('glitch:stab', () => {
    if (Math.random() < 0.3) glitchFX.shake(0.5);
    if (Math.random() < 0.2) glitchFX.flashChromaticAberration(4, 200);
  });

  // Override page content with corrupted version
  injectCorruptionUI();
}

function startTitleCorruption() {
  const titles = [
    'ARWE — Access Denied',
    'ARWE — VESSEL_Ø DETECTED',
    'V̷͓̈S̸̼̓S̵̖͠E̸̠͠L̸̢̎_̵͚͝Ǿ̵͓',
    'SCANNING SESSION...',
    'DO NOT CLOSE THIS TAB',
    'PROJECT VESSEL — NODE 7',
    'ARWE — Access Denied',
    'you found me',
    'ARWE — Access Denied',
    'MEMORY EXTRACTION IN PROGRESS',
    'ARWE — Access Denied',
  ];

  let idx = 0;
  const intervals = [
    8000, 5000, 3000, 6000, 4000, 7000, 2000, 10000, 5000, 8000, 15000
  ];

  function next() {
    if (!_phase2Active) return;
    document.title = titles[idx % titles.length];
    const delay = intervals[idx % intervals.length];
    idx++;
    _timeouts.push(setTimeout(next, delay));
  }

  _timeouts.push(setTimeout(next, 3000));
}

function startCorruptionLoop() {
  // Random glitch flash every 10–30 seconds
  const glitchId = setInterval(() => {
    if (!_phase2Active) return;
    const intensity = 0.3 + Math.random() * 0.7;
    glitchFX.glitchFlash(intensity);

    // Corrupt a random text element sometimes
    if (Math.random() < 0.3) {
      const textEls = document.querySelectorAll('p, h1, h2, li');
      if (textEls.length > 0) {
        const el = textEls[Math.floor(Math.random() * textEls.length)];
        glitchFX.corruptText(el, 800 + Math.random() * 1200);
      }
    }
  }, 10000 + Math.random() * 20000);

  _intervals.push(glitchId);

  // Chromatic aberration random
  const chromaId = setInterval(() => {
    if (!_phase2Active) return;
    if (Math.random() < 0.4) {
      glitchFX.flashChromaticAberration(2 + Math.random() * 3, 150);
    }
  }, 15000);
  _intervals.push(chromaId);
}

function injectCorruptionUI() {
  // Add a "memory leak" visual — ghost images of UI elements
  const outlet = document.getElementById('router-outlet');
  if (!outlet) return;

  // Create a ghosting overlay of the hero title
  const ghost = document.createElement('div');
  ghost.style.cssText = `
    position:fixed;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    font-family:VT323,monospace;
    font-size:clamp(48px,8vw,96px);
    color:rgba(0,255,65,0.03);
    letter-spacing:0.05em;
    pointer-events:none;
    z-index:50;
    user-select:none;
    white-space:nowrap;
    animation:blink 7s step-end infinite;
  `;
  ghost.textContent = 'WHAT DID YOU FIND?';
  document.getElementById('app')?.appendChild(ghost);

  // Add scanline sweep occasionally
  const sweepId = setInterval(() => {
    const sweep = document.createElement('div');
    sweep.style.cssText = `
      position:fixed;
      left:0; right:0;
      height:3px;
      background:linear-gradient(transparent, rgba(0,255,65,0.15), transparent);
      pointer-events:none;
      z-index:9050;
      animation:scanline-sweep 2s linear forwards;
      top: -3px;
    `;
    document.getElementById('app')?.appendChild(sweep);
    setTimeout(() => sweep.remove(), 2100);
  }, 12000 + Math.random() * 8000);
  _intervals.push(sweepId);

  // Add CRT static burst notification
  setTimeout(() => {
    showNotification({
      title: 'ENTITY_VESSEL',
      body: 'I\'m sorry. I don\'t usually do this.',
      type: 'error',
      duration: 6000,
    });
  }, 18000);
}

export function destroyPhase2() {
  _phase2Active = false;
  _intervals.forEach(clearInterval);
  _timeouts.forEach(clearTimeout);
  _intervals = [];
  _timeouts = [];
  entityDialogue.stopAmbientMessages();

  mirrorMode.deactivate();
  fakeNotifs.destroy();
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}
