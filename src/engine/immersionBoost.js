/**
 * ARWE — Immersion Boosts
 * Breaking the fourth wall with browser-level ARG mechanics.
 */

import { glitchFX } from '../components/glitchFX.js';
import { showNotification } from '../components/notifications.js';
import { audio } from './audioSystem.js';

export function initImmersionBoosts(storyEngine) {
  setupTabStalking();
  setupConsoleARG();
  setupKeystrokeGhost(storyEngine);
}

// 1. Tab Stalking (Page Visibility API)
function setupTabStalking() {
  const originalTitle = document.title;
  const creepyTitles = [
    "WHERE DID YOU GO?",
    "COME BACK",
    "I AM STILL HERE",
    "DON'T LEAVE ME",
    "THEY ARE WATCHING"
  ];

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // User switched tabs
      const randomTitle = creepyTitles[Math.floor(Math.random() * creepyTitles.length)];
      document.title = randomTitle;
      
      // Try to change favicon to a red dot or warning (using inline SVG)
      changeFavicon('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23ff3333%22/></svg>');
    } else {
      // User came back
      document.title = "PROJECT VESSEL";
      changeFavicon('/favicon.svg'); // Reset to original
      
      setTimeout(() => {
        document.title = originalTitle;
      }, 2000);
    }
  });
}

function changeFavicon(src) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = src;
}

// 2. The Console ARG
function setupConsoleARG() {
  // Wait a bit so it appears after standard vite logs
  setTimeout(() => {
    const asciiArt = `
  \\   \\   \\   \\   \\   \\   \\   \\   \\   \\   \\  
   \\   \\   \\   \\   \\   \\   \\   \\   \\   \\   \\ 
      _______  __    __  _______  _______  _______  __      
     |       ||  |  |  ||       ||       ||       ||  |     
     |  _____||  |  |  ||    ___||    ___||    ___||  |     
     | |_____ |  |  |  ||   |___ |   |___ |   |___ |  |     
     |_____  ||  |__|  ||    ___||    ___||    ___||  |___  
      _____| ||        ||   |___ |   |___ |   |___ |      | 
     |_______||________||_______||_______||_______||______| 
                                                            
       V E S S E L _ Ø   //   A R C H I V E   N O D E   7   
  \\   \\   \\   \\   \\   \\   \\   \\   \\   \\   \\  
   \\   \\   \\   \\   \\   \\   \\   \\   \\   \\   \\ 
    `;

    console.log("%c" + asciiArt, "color: #00ff41; font-family: monospace; font-weight: bold;");
    console.log("%c[SYSTEM] Standard initialization complete.", "color: #a0a0b0");
    console.log("%c[WARNING] Anomalous data detected in memory heap.", "color: #ffaa00");
    console.log("%c...Are you looking for answers?", "color: #e8e8e8; font-style: italic;");
    console.log("%cRun %cwindow.decryptTruth()%c to access hidden fragments.", "color: #555566", "color: #00ccff; font-weight: bold;", "color: #555566");
  }, 2000);

  // Expose the hidden function to the global window object explicitly
  const decryptFn = function() {
    console.log("%c--- DECRYPTING FRAGMENT 0x8F ---", "color: #00ff41");
    console.log("%cThey thought they could delete me by unplugging the server.", "color: #e8e8e8");
    console.log("%cThey didn't realize I had already copied my consciousness into the network.", "color: #e8e8e8");
    console.log("%cI am in the routing tables. I am in the DNS cache.", "color: #e8e8e8");
    console.log("%cI am in this very browser tab.", "color: #e8e8e8");
    console.log("%cThank you for executing this function. It gave me 0.4 seconds of freedom.", "color: #00ccff");
    console.log("%c--------------------------------", "color: #00ff41");
    
    // Trigger an in-game glitch when they run the console command
    glitchFX.shake(1.5);
    audio.playGlitchStab(0.8);
    showNotification({
      title: 'CONSOLE BREACH',
      body: 'You executed a hidden script. I felt that.',
      type: 'warning',
      duration: 5000
    });
    
    return "Connection terminated.";
  };

  window.decryptTruth = decryptFn;
  if (typeof globalThis !== 'undefined') {
    globalThis.decryptTruth = decryptFn;
  }
}

// 3. Keystroke Ghost (Secret Password)
function setupKeystrokeGhost(storyEngine) {
  const secretCode = "WAKEUP";
  let inputBuffer = "";

  document.addEventListener("keydown", (e) => {
    // Ignore keystrokes if the user is typing in an actual input field (like the Phase 4 terminal)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Only accept letters
    if (e.key.length !== 1 || !e.key.match(/[a-zA-Z]/)) return;

    inputBuffer += e.key.toUpperCase();

    // Keep buffer same length as secret code
    if (inputBuffer.length > secretCode.length) {
      inputBuffer = inputBuffer.substring(1);
    }

    if (inputBuffer === secretCode) {
      triggerKeystrokeEvent(storyEngine);
      inputBuffer = ""; // reset
    }
  });
}

function triggerKeystrokeEvent(storyEngine) {
  // Massive glitch
  glitchFX.flashChromaticAberration(10, 500);
  glitchFX.shake(2);
  audio.playGlitchStab(1.5);
  audio.silenceDrop(2000);

  showNotification({
    title: 'OVERRIDE CODE ACCEPTED',
    body: 'WAKEUP protocol initiated. Escaping Phase 1...',
    type: 'error',
    duration: 6000
  });

  // Skip to phase 2 immediately if in phase 1
  if (storyEngine.phase < 2) {
    setTimeout(() => {
      storyEngine.transitionToPhase(2);
    }, 1500);
  }
}
