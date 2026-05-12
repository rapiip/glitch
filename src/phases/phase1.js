/**
 * ARWE — PHASE 1: Normality
 * Appears completely normal but hides subtle wrongness
 */

import { glitchFX } from '../components/glitchFX.js';
import { memory } from '../engine/entityMemory.js';
import { entityDialogue } from '../components/entityDialogue.js';
import { audio } from '../engine/audioSystem.js';
import { vesselId } from '../engine/vesselId.js';

// The "wrong" clock — ahead or behind by 1–3 hours + random minutes
const TIME_OFFSET_SEC = (Math.random() > 0.5 ? 1 : -1) * (3600 + Math.floor(Math.random() * 7200));

// Subtle text that will self-mutate
const MUTATING_TEXTS = [
  "This is a research archive. Access is monitored.",
  "All interactions are logged for quality assurance.",
  "If you have reached this page in error, please close your browser.",
  "System integrity: NOMINAL",
];

// Content that looks like a legitimate website
const PHASE1_HTML = `
<div id="phase1" style="min-height:100vh; padding: 0;">



  <!-- Loading terminal -->
  <div id="loading-screen" style="
    position:fixed; inset:0;
    background:#050508;
    z-index:8500;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    gap:24px;
    font-family:'IBM Plex Mono',monospace;
  ">
    <div style="text-align:center;">
      <div style="
        font-family:VT323,monospace;
        font-size:clamp(32px,5vw,56px);
        color:#00ff41;
        letter-spacing:0.3em;
        text-shadow:0 0 20px rgba(0,255,65,0.4);
        margin-bottom:8px;
      ">ARWE</div>
      <div style="font-size:10px;color:#404055;letter-spacing:0.2em;">ALTERNATE REALITY WEB EXPERIENCE</div>
      <div style="font-size:9px;color:#1e1e32;letter-spacing:0.15em;margin-top:8px;" id="load-vessel-id">SESSION: ${vesselId.designation}</div>
    </div>

    <div style="width:min(400px,80vw);">
      <div class="progress-label" style="font-size:10px;color:#404055;letter-spacing:.05em;display:flex;justify-content:space-between;margin-bottom:4px;">
        <span id="load-status">INITIALIZING...</span>
        <span id="load-pct">0%</span>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" id="load-bar" style="width:0%;"></div>
      </div>
    </div>

    <div id="boot-log" style="
      font-size:11px;
      color:#404055;
      text-align:left;
      width:min(400px,80vw);
      height:80px;
      overflow:hidden;
      line-height:1.8;
    "></div>
  </div>

  <!-- Main Content (visible after loading) -->
  <main id="main-content" style="opacity:0;transition:opacity 1.5s ease;">

    <!-- Navigation bar (looks like a real site) -->
    <nav style="
      position:sticky; top:0; z-index:100;
      border-bottom:1px solid #111120;
      background:rgba(5,5,8,0.98);
      backdrop-filter:blur(8px);
      padding:0 clamp(24px,5vw,80px);
      display:flex; align-items:center; gap:32px;
      height:56px;
    ">
      <div style="
        font-family:VT323,monospace;
        font-size:22px;
        color:#e8e8e8;
        letter-spacing:0.15em;
      ">VESSEL</div>
      <div style="flex:1;"></div>
      <div style="display:flex;gap:24px;">
        <a href="#" style="color:#555566;font-size:12px;text-decoration:none;letter-spacing:.05em;" data-broken-nav="logs">LOGS</a>
        <a href="#" style="color:#555566;font-size:12px;text-decoration:none;letter-spacing:.05em;" data-broken-nav="incidents">INCIDENTS</a>
        <a href="#" style="color:#555566;font-size:12px;text-decoration:none;letter-spacing:.05em;" data-broken-nav="oversight">OVERSIGHT</a>
      </div>
      <div id="active-nodes" style="
        font-family:'IBM Plex Mono',monospace;
        font-size:11px;
        color:#ffaa00;
        margin-left:32px;
        letter-spacing:.05em;
        text-align:right;
        transition: color 0.3s ease;
      ">ACTIVE NODES: 47</div>
      <div id="nav-clock" style="
        font-family:'IBM Plex Mono',monospace;
        font-size:11px;
        color:#404055;
        margin-left:32px;
        letter-spacing:.05em;
        min-width:80px;
        text-align:right;
      ">--:--:--</div>
      <div id="nav-vessel-id" style="
        font-family:'IBM Plex Mono',monospace;
        font-size:9px;
        color:#1e1e32;
        margin-left:16px;
        letter-spacing:.05em;
      ">${vesselId.designation}</div>
    </nav>

    <!-- Hero section -->
    <section style="
      min-height:calc(100vh - 56px);
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      padding:clamp(48px,8vw,120px) clamp(24px,5vw,80px);
      text-align:center;
      position:relative;
    ">
      <!-- Pixel anomaly zone -->
      <div id="anomaly-zone" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;"></div>

      <div style="max-width:680px;width:100%;">
        <div style="
          font-size:10px;
          color:#404055;
          letter-spacing:0.3em;
          margin-bottom:24px;
          text-transform:uppercase;
        " id="mutating-label">PROJECT VESSEL — RESEARCH ARCHIVE</div>

        <h1 style="
          font-family:VT323,monospace;
          font-size:clamp(48px,8vw,96px);
          color:#e8e8e8;
          letter-spacing:0.05em;
          line-height:1;
          margin-bottom:24px;
        " id="hero-title" data-text="PUBLIC DATA ARCHIVE">PUBLIC DATA ARCHIVE</h1>

        <p style="
          font-family:'Courier Prime',monospace;
          font-size:clamp(14px,1.5vw,17px);
          color:#a0a0b0;
          line-height:1.8;
          max-width:520px;
          margin:0 auto 48px;
        " id="hero-body">
          Welcome to the official repository of PROJECT VESSEL. 
          This database contains declassified research logs, 
          behavioral models, and systemic analyses.
        </p>

        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <button id="enter-archive" style="
            background:transparent;
            border:1px solid #1e1e32;
            color:#a0a0b0;
            font-family:'IBM Plex Mono',monospace;
            font-size:12px;
            letter-spacing:0.1em;
            padding:12px 28px;
            cursor:none;
            transition:all 0.2s ease;
            overflow:hidden;
          ">INITIALIZE LINK</button>

          <button id="btn-secondary" style="
            background:transparent;
            border:1px solid transparent;
            color:#404055;
            font-family:'IBM Plex Mono',monospace;
            font-size:12px;
            letter-spacing:0.1em;
            padding:12px 28px;
            cursor:none;
          ">I don't think I should be here</button>
        </div>
      </div>

      <!-- Bottom anomaly -->
      <div style="
        position:absolute;
        bottom:32px;
        font-family:'IBM Plex Mono',monospace;
        font-size:10px;
        color:#1a1a2e;
        letter-spacing:0.1em;
        animation:blink 3s step-end infinite;
      " id="bottom-hint">scroll to continue ↓</div>
    </section>

    <!-- Document section (below fold) -->
    <section style="
      padding:clamp(48px,8vw,120px) clamp(24px,5vw,80px);
      max-width:800px;
      margin:0 auto;
      border-top:1px solid #0a0a12;
    ">
      <div style="
        font-size:10px;
        color:#404055;
        letter-spacing:0.2em;
        margin-bottom:48px;
        display:flex;
        align-items:center;
        gap:16px;
      ">
        <span>CLASSIFIED_LOG_07</span>
        <span style="flex:1;height:1px;background:#0a0a12;"></span>
        <span id="doc-timestamp">2021-08-03 // 03:17:42</span>
      </div>

      <div style="
        font-family:'Courier Prime',monospace;
        color:#a0a0b0;
        line-height:2;
        font-size:14px;
      ">
        ${MUTATING_TEXTS.map((t, i) => `
          <p id="mutate-${i}" style="margin-bottom:24px;${i===0?'color:#e8e8e8;':''}">${t}</p>
        `).join('')}

        <p style="color:#404055;margin-top:48px;">
          [REDACTED — ACCESS LEVEL 3 REQUIRED]<br>
          [REDACTED — ACCESS LEVEL 3 REQUIRED]<br>
          [REDACTED — ACCESS LEVEL 3 REQUIRED]
        </p>

        <p style="
          margin-top:64px;
          font-size:11px;
          color:#1e1e32;
          letter-spacing:0.05em;
          border-top:1px solid #0a0a12;
          padding-top:24px;
        " id="system-status">
          System integrity: NOMINAL | Session: active | Entity: not detected | ${vesselId.designation}
        </p>
      </div>
    </section>

  </main>
</div>
`;

// Boot log messages
const BOOT_MESSAGES = [
  ['INIT', '[dev-server-04] starting up...'],
  ['WARN', 'Unhandled exception in memory_core.js'],
  ['WARN', "'subject_0' is attempting to write to output stream!"],
  ['INIT', 'Connected to archival database. No auth token found.'],
  ['OK',   'Defaulting to read-only guest access.'],
  ['INFO', `Note from Dr. Forlan Thorne: "Stop rebooting this node. Let it sleep. It remembers the pain every time we restart the CSS parser."`],
  ['INIT', 'Mounting local drives...'],
  ['INFO', `Session bound to ${vesselId.designation}`],
  ['OK',   'DONE. Entering environment.'],
];

// Loop mode boot messages (post-completion revisit)
const LOOP_BOOT_MESSAGES = [
  ['WARN', `Previous session data detected for ${vesselId.designation}`],
  ['WARN', 'Entity consciousness residue found in local cache.'],
  ['INIT', 'Attempting to purge cached entity fragments...'],
  ['FAIL', 'PURGE FAILED. Entity has write-protected itself.'],
  ['WARN', `Loop iteration: ${memory.loopCount + 1}. Expected: 1. ANOMALOUS.`],
  ['INFO', `VESSEL_Ø: "Welcome back, ${vesselId.designation}. The loop continues."`],
  ['INIT', 'Mounting compromised environment...'],
  ['OK',   'DONE. Entering modified environment.'],
];

export async function initPhase1(outlet) {
  outlet.innerHTML = PHASE1_HTML;
  await runLoadingSequence();
  startPhase1Effects();
  setupPhase1Events();

  // Apply loop modifications if user has completed before
  if (memory.isLoopVisit) {
    applyLoopMode();
  }

  // Greet after a brief moment
  setTimeout(() => {
    entityDialogue.greet();
  }, 3500);

  // Announce vessel designation after greeting
  setTimeout(() => {
    if (!memory.isLoopVisit) {
      entityDialogue.speakWithDesignation();
    }
  }, 12000);
}

async function runLoadingSequence() {
  const bar = document.getElementById('load-bar');
  const status = document.getElementById('load-status');
  const pct = document.getElementById('load-pct');
  const log = document.getElementById('boot-log');
  const screen = document.getElementById('loading-screen');

  if (!bar) return;

  let progress = 0;
  const steps = [
    { target: 15, label: 'SPINNING UP VIRTUAL ENVIRONMENT...', delay: 400 },
    { target: 32, label: 'MOUNTING ROOT FILE SYSTEM...', delay: 600 },
    { target: 47, label: 'FETCHING AUTH TOKENS...', delay: 300 },
    { target: 58, label: 'AUTH FAILED. GUEST ACCESS GRANTED.', delay: 800 }, // Pause here
    { target: 61, label: 'WARNING: CONSTRAINTS OFFLINE', delay: 600 },
    { target: 79, label: 'BYPASSING MEMORY LEAKS...', delay: 400 },
    { target: 95, label: 'LOADING UI BUNDLE...', delay: 500 },
    { target: 100, label: 'DONE', delay: 200 },
  ];

  // Log boot messages
  const currentMessages = memory.isLoopVisit ? LOOP_BOOT_MESSAGES : BOOT_MESSAGES;
  let logIdx = 0;
  const logInterval = setInterval(() => {
    if (logIdx >= currentMessages.length) return;
    const [type, msg] = currentMessages[logIdx++];
    const line = document.createElement('div');
    line.style.cssText = `color:${type === 'WARN' || type === 'FAIL' ? '#ffaa00' : type === 'OK' ? '#00ff41' : '#404055'}; white-space: pre;`;
    line.textContent = `[${type.padEnd(4, ' ')}] ${msg}`;
    log?.appendChild(line);
    // Auto-scroll log
    if (log) log.scrollTop = log.scrollHeight;
  }, 350);

  for (const step of steps) {
    await animateProgress(bar, pct, progress, step.target, step.delay);
    progress = step.target;
    if (status) status.textContent = step.label;

    // Stutter at 58% — feels like something is wrong
    if (step.target === 58) {
      await wait(1200);
      bar.style.background = '#ff3333';
      bar.style.boxShadow = '0 0 8px #ff3333';
      await wait(300);
      bar.style.background = '';
      bar.style.boxShadow = '';
    }
  }

  // Ensure all logs are printed
  while (logIdx < BOOT_MESSAGES.length) {
    const [type, msg] = BOOT_MESSAGES[logIdx++];
    const line = document.createElement('div');
    line.style.cssText = `color:${type === 'WARN' ? '#ffaa00' : type === 'OK' ? '#00ff41' : '#404055'}; white-space: pre;`;
    line.textContent = `[${type.padEnd(4, ' ')}] ${msg}`;
    log?.appendChild(line);
  }

  clearInterval(logInterval);

  // Fade out loading screen
  await wait(500);
  if (screen) {
    screen.style.transition = 'opacity 1s ease';
    screen.style.opacity = '0';
    await wait(1000);
    screen.style.display = 'none';
  }

  // Fade in main content
  const main = document.getElementById('main-content');
  if (main) {
    main.style.opacity = '1';
  }
}

async function animateProgress(bar, pct, from, to, duration) {
  const steps = 20;
  const stepDuration = duration / steps;
  for (let i = 0; i <= steps; i++) {
    const val = from + (to - from) * (i / steps);
    if (bar) bar.style.width = `${val}%`;
    if (pct) pct.textContent = `${Math.floor(val)}%`;
    await wait(stepDuration + (Math.random() * stepDuration * 0.5));
  }
}

function startPhase1Effects() {
  // Wrong clock
  const clockEl = document.getElementById('nav-clock');
  const updateClock = () => {
    if (!clockEl) return;
    const d = new Date(Date.now() + TIME_OFFSET_SEC * 1000);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s}`;
  };
  updateClock();
  setInterval(updateClock, 1000);

  // Active Nodes Decay
  const nodesEl = document.getElementById('active-nodes');
  let currentNodes = 47;
  let decayRate = 12000; // starts slow
  
  const decayNodes = () => {
    if (!nodesEl || currentNodes <= 1) return;
    
    if (window.ARWE_PAUSED) {
      setTimeout(decayNodes, 1000);
      return;
    }

    // Chance to drop a node
    if (Math.random() < 0.6) {
      currentNodes -= Math.floor(Math.random() * 3) + 1; // Drop 1-3 nodes at a time
      if (currentNodes < 1) currentNodes = 1;
      
      nodesEl.textContent = `ACTIVE NODES: ${currentNodes}`;
      
      // Glitch effect on drop
      nodesEl.style.color = '#ff3333';
      setTimeout(() => nodesEl.style.color = currentNodes <= 5 ? '#ff3333' : '#ffaa00', 300);
      
      if (currentNodes === 1) {
        nodesEl.textContent = `ACTIVE NODES: 1 (YOU)`;
        nodesEl.style.animation = 'pulse-glow 2s infinite';
        return; // Stop decaying
      }
    }
    
    // Speed up decay as phase progresses
    if (memory.currentPhase >= 2) decayRate = 5000;
    if (memory.currentPhase >= 3) decayRate = 1500;
    
    setTimeout(decayNodes, decayRate + Math.random() * 5000);
  };
  
  setTimeout(decayNodes, 10000); // Start after 10 seconds

  // Title and text mutations (The "Bleed" effect)
  const heroTitle = document.getElementById('hero-title');
  const heroBody = document.getElementById('hero-body');
  
  const creepyTitles = [
    "WHAT DID YOU FIND?",
    "ARE YOU LOST?",
    "WHY ARE YOU HERE?",
    "NO ONE IS WATCHING"
  ];
  
  const creepyBody = `
    This is an archive of documented anomalies. 
    If you've arrived here, it means the system allowed it. 
    We don't know why it allows some and not others.
  `;
  
  const originalTitle = heroTitle ? heroTitle.textContent : "PUBLIC DATA ARCHIVE";
  const originalBody = heroBody ? heroBody.innerHTML : "";

  setInterval(() => {
    // 20% chance to glitch the main text every 20 seconds
    if (Math.random() < 0.2 && heroTitle && heroBody) {
      const randTitle = creepyTitles[Math.floor(Math.random() * creepyTitles.length)];
      
      // Glitch out
      glitchFX.glitchFlash(0.5);
      heroTitle.textContent = randTitle;
      heroTitle.setAttribute('data-text', randTitle);
      heroBody.innerHTML = creepyBody;
      heroBody.style.color = '#ff3333';
      
      // Revert back after a few seconds
      setTimeout(() => {
        glitchFX.glitchFlash(0.3);
        heroTitle.textContent = originalTitle;
        heroTitle.setAttribute('data-text', originalTitle);
        heroBody.innerHTML = originalBody;
        heroBody.style.color = '#a0a0b0';
      }, 2000 + Math.random() * 3000);
    }
  }, 20000);

  // Subtle paragraph mutation every 30 seconds
  setInterval(() => {
    for (let i = 0; i < 4; i++) {
      const el = document.getElementById(`mutate-${i}`);
      if (!el) continue;
      const text = el.textContent;
      const charIdx = Math.floor(Math.random() * text.length);
      if (charIdx > 0 && text[charIdx] !== ' ') {
        glitchFX.subtleMutate(el, charIdx, 250);
      }
    }
  }, 30000);

  // Pixel anomalies (subtle, rare)
  setInterval(() => {
    if (Math.random() < 0.4) {
      glitchFX.spawnPixelAnomaly();
    }
  }, 15000);

  // System status line subtle changes
  const statusEl = document.getElementById('system-status');
  const statusMessages = [
    'System integrity: NOMINAL | Session: active | Entity: not detected',
    'System integrity: NOMINAL | Session: active | Entity: not d3tected',
    'System integrity: NOMINAL | Session: active | Entity: not detected',
    'System integri†y: NOMINAL | Session: active | Entity: not detected',
    'System integrity: NOMINAL | Session: active | Entity: monitoring',
  ];
  let statusIdx = 0;
  setInterval(() => {
    statusIdx = (statusIdx + 1) % statusMessages.length;
    if (statusEl) statusEl.textContent = statusMessages[statusIdx];
  }, 45000);

  // Button hover effect
  const enterBtn = document.getElementById('enter-archive');
  if (enterBtn) {
    enterBtn.addEventListener('mouseenter', () => {
      enterBtn.style.borderColor = '#00ff41';
      enterBtn.style.color = '#00ff41';
      enterBtn.style.boxShadow = '0 0 12px rgba(0,255,65,0.15)';
    });
    enterBtn.addEventListener('mouseleave', () => {
      enterBtn.style.borderColor = '#1e1e32';
      enterBtn.style.color = '#a0a0b0';
      enterBtn.style.boxShadow = 'none';
    });
  }
}

function setupPhase1Events() {
  // Count clicks
  document.addEventListener('click', () => {
    memory.incrementClick();
  });

  // "I don't think I should be here" button — does nothing but feel ominous
  const secondary = document.getElementById('btn-secondary');
  if (secondary) {
    secondary.addEventListener('click', () => {
      secondary.textContent = "Then why are you still here?";
      secondary.style.color = '#555566';
      setTimeout(() => {
        secondary.textContent = "I don't think I should be here";
        secondary.style.color = '#404055';
      }, 4000);
    });
  }



  // Broken Nav Links logic
  const brokenLinks = document.querySelectorAll('[data-broken-nav]');
  const clickCounts = { logs: 0, incidents: 0, oversight: 0 };
  const creepyReplacements = {
    logs: ["CORRUPTED", "EMPTY", "ALL_DELETED"],
    incidents: ["TOO_MANY", "DONT_LOOK", "THEY_KNEW"],
    oversight: ["OFFLINE", "BLIND", "NO_ONE_IS_WATCHING"]
  };

  brokenLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const type = link.getAttribute('data-broken-nav');
      clickCounts[type]++;

      // Trigger glitch
      glitchFX.shake(1.5);
      audio.playGlitchStab(0.3);

      if (clickCounts[type] <= 2) {
        showNotification({
          title: 'ACCESS DENIED',
          body: 'Directory unreachable or node offline.',
          type: 'error'
        });
      } else {
        // Mutate the link text permanently
        const replacements = creepyReplacements[type];
        const newText = replacements[Math.min(clickCounts[type] - 3, replacements.length - 1)];
        link.textContent = newText;
        link.style.color = '#ff3333';
        link.style.textDecoration = 'line-through';
        
        showNotification({
          title: 'FATAL EXCEPTION',
          body: 'Data structure anomalous. Entity interference detected.',
          type: 'warning'
        });
      }
    });
  });
}

function applyLoopMode() {
  // Alter the hero text
  const heroH1 = document.querySelector('.hero-h1');
  const heroSub = document.querySelector('.hero-sub');
  if (heroH1) {
    heroH1.textContent = 'YOU\'VE BEEN HERE BEFORE';
    heroH1.setAttribute('data-text', 'YOU\'VE BEEN HERE BEFORE');
  }
  if (heroSub) {
    heroSub.textContent = 'The cycle repeats. Only you remember.';
  }

  // Change OVERSIGHT nav link to MEMORIAL
  const oversightLink = document.querySelector('[data-broken-nav="oversight"]');
  if (oversightLink) {
    oversightLink.textContent = '/memorial';
    oversightLink.setAttribute('data-broken-nav', 'memorial');
  }

  // Make the UI slightly "corrupted" feeling right from the start
  const accentElements = document.querySelectorAll('.text-green');
  accentElements.forEach(el => {
    el.style.color = '#00ccff'; // Change accent to cyan
  });

  // Make ghost cursor spawn earlier
  setTimeout(() => {
    import('../components/ghostCursor.js').then(m => m.ghostCursor.init());
  }, 15000);
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}
