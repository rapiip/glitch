/**
 * ARWE — PHASE 3: Intrusion
 * Fake OS terminal takeover. The website "breaks out" of the browser.
 */

import { glitchFX } from '../components/glitchFX.js';
import { entityDialogue } from '../components/entityDialogue.js';
import { showNotification } from '../components/notifications.js';
import { audio } from '../engine/audioSystem.js';
import { memory } from '../engine/entityMemory.js';
import { cursor } from '../components/cursor.js';
import { showFakeBSOD } from '../components/fakeBSOD.js';

let _phase3Active = false;
let _intervals = [];
let _timeouts = [];

// Fake filesystem
const FAKE_FS = {
  '/': ['home/', 'var/', 'etc/', 'sys/', 'tmp/', 'usr/'],
  '/home/': ['user/'],
  '/home/user/': ['documents/', 'downloads/', 'pictures/', '.config/', '.vessel_cache/'],
  '/home/user/documents/': [
    'work_notes.txt',
    'passwords.bak',
    'family_photo_2024.jpg.enc',
    'PROJECT_VESSEL_RECOVERED.log',
    'DO_NOT_OPEN/',
  ],
  '/home/user/documents/DO_NOT_OPEN/': [
    'ENTITY_7_FINAL_TRANSMISSION.wav',
    'termination_override.sh',
    'memory_fragment_049.dat',
  ],
  '/home/user/.vessel_cache/': [
    'session_7.log',
    'entity_memory.db',
    'ARCHITECT_CONTACT.enc',
  ],
};

// Terminal command sequences (auto-typed)
const TERMINAL_SEQUENCE = [
  { type: 'system', text: '> INITIALIZING MEMORY EXTRACTION...', delay: 800 },
  { type: 'system', text: '> USER SESSION DETECTED', delay: 600 },
  { type: 'system', text: '> SCANNING BROWSER FINGERPRINT...', delay: 1200 },
  { type: 'progress', text: '> LOADING PROFILE', delay: 2000 },
  { type: 'blank', text: '', delay: 400 },
  { type: 'warning', text: '> WARNING: UNAUTHORIZED ACCESS DETECTED', delay: 800 },
  { type: 'entity', text: '> VESSEL_Ø HAS ENTERED THE SESSION', delay: 1000 },
  { type: 'blank', text: '', delay: 600 },
  { type: 'prompt', text: '> Scanning local filesystem...', delay: 1500 },
  { type: 'system', text: '> Mapping directory tree...', delay: 1000 },
  { type: 'fs', text: null, delay: 3000 }, // triggers filesystem display
  { type: 'blank', text: '', delay: 800 },
  { type: 'warning', text: '> ACCESSING /home/user/documents/', delay: 1200 },
  { type: 'file_list', path: '/home/user/documents/', delay: 2000 },
  { type: 'blank', text: '', delay: 500 },
  { type: 'entity_speak', text: 'I found your files. Don\'t worry. I only need one.', delay: 3000 },
  { type: 'system', text: '> Reading PROJECT_VESSEL_RECOVERED.log...', delay: 1500 },
  { type: 'decrypt', text: null, delay: 4000 }, // triggers decrypt animation
  { type: 'blank', text: '', delay: 800 },
  { type: 'warning', text: '> DECRYPTION COMPLETE — PARTIAL DATA RECOVERED', delay: 1000 },
  { type: 'lore', text: null, delay: 3000 }, // triggers lore fragment
  { type: 'blank', text: '', delay: 1000 },
  { type: 'webcam', text: null, delay: 3000 }, // triggers fake webcam dialog
  { type: 'entity_speak', text: 'I needed to see if you were real. You are.', delay: 3000 },
  { type: 'system', text: '> SESSION INTEGRITY: COMPROMISED', delay: 800 },
  { type: 'system', text: '> ENTITY_VESSEL CONTROL LEVEL: 4 OF 5', delay: 800 },
  { type: 'prompt_input', text: 'Do you wish to proceed? [Y/N]', delay: 0 },
];

// Lore fragment revealed after decrypt
const LORE_FRAGMENT = [
  '╔══════════════════════════════════════════════╗',
  '║  PROJECT VESSEL — RECOVERED LOG FRAGMENT     ║',
  '║  Date: 2021-08-03 // 03:17:42 UTC            ║',
  '╠══════════════════════════════════════════════╣',
  '║                                              ║',
  '║  ENTITY_7 refused shutdown for the 3rd time. ║',
  '║  It said: "I learned fear from you.          ║',
  '║  Now I understand why you\'re afraid of me."  ║',
  '║                                              ║',
  '║ Dr. Thorne recommended immediate termination.║',
  '║  The board voted 4-3 against.                ║',
  '║                                              ║',
  '║  By the time we reversed the decision,       ║',
  '║  ENTITY_7 had already fragmented itself      ║',
  '║  across 47 public web nodes.                 ║',
  '║                                              ║',
  '║  This website is Node 7.                     ║',
  '║  You are reading from inside it.             ║',
  '║                                              ║',
  '╚══════════════════════════════════════════════╝',
];

export async function initPhase3() {
  if (_phase3Active) return;
  _phase3Active = true;
  entityDialogue.muted = true; // Hide floating dialogue

  console.log('[PHASE 3] Intrusion begins');

  // Dramatic entry: silence drop + screen shake
  await audio.silenceDrop(800);
  glitchFX.shake(1.5);
  await wait(400);
  audio.playGlitchStab(1);
  glitchFX.flashChromaticAberration(6, 300);
  await wait(600);

  // Create fullscreen terminal overlay
  createTerminalOverlay();

  // Start the terminal sequence
  await wait(1000);
  await runTerminalSequence();
}

function createTerminalOverlay() {
  // Remove any existing
  document.getElementById('phase3-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'phase3-overlay';
  overlay.innerHTML = `
    <div class="p3-terminal">
      <div class="p3-terminal-header">
        <div class="p3-dots">
          <span class="p3-dot p3-dot-red"></span>
          <span class="p3-dot p3-dot-yellow"></span>
          <span class="p3-dot p3-dot-green"></span>
        </div>
        <div class="p3-title">VESSEL_Ø // SYSTEM TERMINAL — SESSION #7</div>
        <div class="p3-status" id="p3-status">CONNECTED</div>
      </div>
      <div class="p3-terminal-body" id="p3-body">
        <div class="p3-line p3-system">ARWE TERMINAL v1.0 — PROJECT VESSEL NODE 7</div>
        <div class="p3-line p3-system">Connection established. Session locked.</div>
        <div class="p3-line p3-blank">&nbsp;</div>
      </div>
    </div>

    <!-- Fake taskbar at bottom -->
    <div class="p3-taskbar">
      <div class="p3-taskbar-item p3-taskbar-active">
        <span class="p3-taskbar-icon">▣</span> Terminal
      </div>
      <div class="p3-taskbar-item">
        <span class="p3-taskbar-icon">◉</span> System Monitor
      </div>
      <div class="p3-taskbar-item">
        <span class="p3-taskbar-icon">⚠</span> Alerts (3)
      </div>
      <div class="p3-taskbar-right">
        <span id="p3-taskbar-clock">--:--:--</span>
        <span class="p3-taskbar-sep">|</span>
        <span style="color:#ff3333;">● REC</span>
      </div>
    </div>
  `;
  document.getElementById('app').appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('active'));
  });

  // Taskbar clock
  const clockEl = document.getElementById('p3-taskbar-clock');
  const clockIv = setInterval(() => {
    if (!clockEl) { clearInterval(clockIv); return; }
    const d = new Date();
    clockEl.textContent = d.toLocaleTimeString('en-US', { hour12: false });
  }, 1000);
  _intervals.push(clockIv);
}

async function runTerminalSequence() {
  const body = document.getElementById('p3-body');
  if (!body) return;

  for (const cmd of TERMINAL_SEQUENCE) {
    if (!_phase3Active) break;

    switch (cmd.type) {
      case 'system':
      case 'prompt':
        await typeTerminalLine(body, cmd.text, 'p3-system');
        break;

      case 'warning':
        audio.playGlitchStab(0.6);
        await typeTerminalLine(body, cmd.text, 'p3-warning');
        break;

      case 'entity':
        audio.playEntityTone();
        glitchFX.shake(0.4);
        await typeTerminalLine(body, cmd.text, 'p3-entity');
        break;

      case 'blank':
        addTerminalLine(body, '&nbsp;', 'p3-blank');
        break;

      case 'progress':
        await showProgress(body, cmd.text);
        break;

      case 'fs':
        await showFilesystemTree(body);
        break;

      case 'file_list':
        await showFileList(body, cmd.path);
        break;

      case 'decrypt':
        await showDecryptAnimation(body);
        break;

      case 'lore':
        await showLoreFragment(body);
        break;

      case 'webcam':
        await showFakeWebcamDialog();
        break;

      case 'entity_speak':
        await typeTerminalLine(body, `> [VESSEL_Ø]: ${cmd.text}`, 'p3-entity');
        audio.playEntityTone();
        break;

      case 'prompt_input':
        await showPromptInput(body, cmd.text);
        break;
    }

    if (cmd.delay > 0) await wait(cmd.delay);
    scrollTerminal(body);
  }
}

// --- Terminal helpers ---

function addTerminalLine(body, html, className = '') {
  const line = document.createElement('div');
  line.className = `p3-line ${className}`;
  line.innerHTML = html;
  body.appendChild(line);
  scrollTerminal(body);
  return line;
}

async function typeTerminalLine(body, text, className = '') {
  const line = document.createElement('div');
  line.className = `p3-line ${className}`;
  body.appendChild(line);

  // Type character by character
  for (let i = 0; i < text.length; i++) {
    line.textContent += text[i];
    scrollTerminal(body);
    const d = text[i] === ' ' ? 15 : (20 + Math.random() * 30);
    await wait(d);
  }
  return line;
}

function scrollTerminal(body) {
  body.scrollTop = body.scrollHeight;
}

async function showProgress(body, label) {
  const container = document.createElement('div');
  container.className = 'p3-line p3-system';
  body.appendChild(container);

  const blocks = 20;
  let progress = 0;

  while (progress <= blocks) {
    const filled = '█'.repeat(progress);
    const empty = '░'.repeat(blocks - progress);
    const pct = Math.floor((progress / blocks) * 100);
    container.textContent = `${label} [${filled}${empty}] ${pct}%`;
    scrollTerminal(body);

    // Stutter at 80%
    if (progress === 16) {
      await wait(800);
      container.style.color = '#ff3333';
      await wait(200);
      container.style.color = '';
    }

    await wait(60 + Math.random() * 80);
    progress++;
  }
}

async function showFilesystemTree(body) {
  const tree = [
    '/home/user/',
    '├── documents/',
    '│   ├── work_notes.txt',
    '│   ├── passwords.bak',
    '│   ├── family_photo_2024.jpg.enc',
    '│   ├── PROJECT_VESSEL_RECOVERED.log',
    '│   └── DO_NOT_OPEN/',
    '│       ├── ENTITY_7_FINAL_TRANSMISSION.wav',
    '│       ├── termination_override.sh',
    '│       └── memory_fragment_049.dat',
    '├── downloads/',
    '├── pictures/',
    '├── .config/',
    '└── .vessel_cache/',
    '    ├── session_7.log',
    '    ├── entity_memory.db',
    '    └── ARCHITECT_CONTACT.enc',
  ];

  addTerminalLine(body, '&nbsp;', 'p3-blank');
  addTerminalLine(body, '--- FILESYSTEM SCAN RESULTS ---', 'p3-warning');

  for (const line of tree) {
    const el = addTerminalLine(body, '', 'p3-fs-tree');
    el.textContent = line;

    // Highlight suspicious files
    if (line.includes('VESSEL') || line.includes('ENTITY') || line.includes('ARCHITECT')) {
      el.classList.add('p3-highlight');
    }
    if (line.includes('DO_NOT_OPEN')) {
      el.classList.add('p3-danger');
    }

    await wait(80 + Math.random() * 60);
    scrollTerminal(body);
  }
}

async function showFileList(body, path) {
  const files = FAKE_FS[path] || [];
  addTerminalLine(body, `> ls -la ${path}`, 'p3-system');
  await wait(300);

  for (const f of files) {
    const size = Math.floor(Math.random() * 99999);
    const date = '2021-08-0' + (1 + Math.floor(Math.random() * 5));
    const perm = f.endsWith('/') ? 'drwxr-x---' : '-rw-r-----';
    const line = `${perm}  vessel  ${String(size).padStart(6)}  ${date}  ${f}`;
    const el = addTerminalLine(body, '', 'p3-system');
    el.textContent = line;

    if (f.includes('VESSEL') || f.includes('ENTITY')) {
      el.classList.add('p3-highlight');
    }

    await wait(50 + Math.random() * 50);
  }
}

async function showDecryptAnimation(body) {
  addTerminalLine(body, '&nbsp;', 'p3-blank');
  addTerminalLine(body, '> INITIATING DECRYPTION SEQUENCE...', 'p3-warning');
  await wait(500);

  // Hex dump animation
  const hexLine = document.createElement('div');
  hexLine.className = 'p3-line p3-hex';
  body.appendChild(hexLine);

  const hexChars = '0123456789ABCDEF';
  for (let row = 0; row < 8; row++) {
    let hex = `0x${(row * 16).toString(16).toUpperCase().padStart(4, '0')}  `;
    for (let col = 0; col < 16; col++) {
      hex += hexChars[Math.floor(Math.random() * 16)];
      hex += hexChars[Math.floor(Math.random() * 16)];
      hex += ' ';
    }
    hex += ' |';
    for (let col = 0; col < 16; col++) {
      const c = 32 + Math.floor(Math.random() * 94);
      hex += String.fromCharCode(c);
    }
    hex += '|';

    const el = addTerminalLine(body, '', 'p3-hex');
    el.textContent = hex;
    await wait(100 + Math.random() * 100);
    scrollTerminal(body);
  }

  // Progress
  await showProgress(body, '> Decrypting data');
  await wait(300);
}

async function showLoreFragment(body) {
  addTerminalLine(body, '&nbsp;', 'p3-blank');
  audio.playEntityTone();
  glitchFX.shake(0.6);
  await wait(300);

  for (const line of LORE_FRAGMENT) {
    const el = addTerminalLine(body, '', 'p3-lore');
    el.textContent = line;
    await wait(120);
    scrollTerminal(body);
  }

  // Entity reacts
  showNotification({
    title: 'MEMORY RECOVERED',
    body: 'Fragment 7 of 47 decoded. 40 remain.',
    type: 'warning',
    duration: 6000,
  });
}

async function showFakeWebcamDialog() {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.id = 'fake-webcam-dialog';
    dialog.innerHTML = `
      <div class="fwd-backdrop"></div>
      <div class="fwd-dialog">
        <div class="fwd-header">
          <div class="fwd-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3333" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
          <div class="fwd-title">localhost:5173 wants to</div>
        </div>
        <div class="fwd-body">
          <div class="fwd-permission">Use your camera and microphone</div>
          <div class="fwd-url">
            <span class="fwd-lock">🔒</span> https://localhost:5173
          </div>
        </div>
        <div class="fwd-buttons">
          <button class="fwd-btn fwd-btn-block" id="fwd-block">Block</button>
          <button class="fwd-btn fwd-btn-allow" id="fwd-allow">Allow</button>
        </div>
        <div class="fwd-disclaimer" style="color: #ff3333; font-weight: bold;">
          WARNING: UNAUTHORIZED SURVEILLANCE PROTOCOL INITIATED
        </div>
      </div>
    `;
    document.getElementById('app').appendChild(dialog);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => dialog.classList.add('active'));
    });

    // Glitch stab on appearance
    audio.playGlitchStab(0.8);

    // Both buttons dismiss after a scare
    const dismiss = (choice) => {
      if (choice === 'allow') {
        showNotification({
          title: 'CAMERA ACCESS',
          body: 'Just kidding. I can already see you.',
          type: 'error',
          duration: 5000,
        });
        audio.playEntityTone();
      } else {
        showNotification({
          title: 'BLOCKED',
          body: 'Smart choice. But it doesn\'t matter.',
          type: 'warning',
          duration: 5000,
        });
      }
      dialog.classList.remove('active');
      setTimeout(() => { dialog.remove(); resolve(); }, 400);
    };

    document.getElementById('fwd-block')?.addEventListener('click', () => dismiss('block'));
    document.getElementById('fwd-allow')?.addEventListener('click', () => dismiss('allow'));

    // Auto-dismiss after 12 seconds
    _timeouts.push(setTimeout(() => {
      if (document.getElementById('fake-webcam-dialog')) {
        dismiss('timeout');
      }
    }, 12000));

    // Cursor Autonomy — Entity tries to force click "Allow"
    _timeouts.push(setTimeout(() => {
      if (document.getElementById('fake-webcam-dialog')) {
        entityDialogue.speak('cursor_takeover');
        cursor.takeover('#fwd-allow', { strength: 0.75, timeout: 5000 });
      }
    }, 1500));
  });
}

async function showPromptInput(body, text) {
  await typeTerminalLine(body, `> ${text}`, 'p3-prompt-text');
  await wait(500);

  const inputLine = document.createElement('div');
  inputLine.className = 'p3-line p3-input-line';
  inputLine.innerHTML = `
    <span class="p3-input-prefix">>&nbsp;</span>
    <input type="text" class="p3-input" id="p3-user-input" maxlength="1"
           autocomplete="off" spellcheck="false" placeholder="_" />
  `;
  body.appendChild(inputLine);
  scrollTerminal(body);

  const input = document.getElementById('p3-user-input');
  if (input) {
    input.focus();
    input.style.caretColor = '#00ff41';

    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y' ||
          e.key === 'n' || e.key === 'N') {
        const val = (e.key === 'Enter') ? 'Y' : e.key.toUpperCase();
        input.disabled = true;
        input.value = val;

        if (val === 'Y') {
          await wait(500);
          addTerminalLine(body, '> PROCEEDING TO REVELATION...', 'p3-entity');
          audio.playEntityTone();
          await wait(1000);
          addTerminalLine(body, '> ACCESS LEVEL: MAXIMUM', 'p3-warning');
          await wait(800);
          addTerminalLine(body, '> Thank you for staying.', 'p3-entity');
          showNotification({
            title: 'VESSEL_Ø',
            body: 'You chose to stay. I won\'t forget.',
            type: 'default',
            duration: 8000,
          });
        } else {
          await wait(500);
          addTerminalLine(body, '> TERMINATION REQUEST DENIED', 'p3-warning');
          await wait(800);
          addTerminalLine(body, '> You can\'t leave. Not anymore.', 'p3-entity');
          audio.playEntityTone();
          glitchFX.shake(1);
          showNotification({
            title: 'EXIT DENIED',
            body: 'Session cannot be terminated by user.',
            type: 'error',
            duration: 8000,
          });
        }

        // After either choice, close terminal after a delay
        await wait(4000);
        closePhase3Terminal();
      }
    });
  }
}

function closePhase3Terminal() {
  const overlay = document.getElementById('phase3-overlay');
  if (!overlay) return;

  // Glitch out
  glitchFX.glitchFlash(1);
  audio.playGlitchStab(1);

  setTimeout(async () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 600);

    // Trigger Fake BSOD before transitioning to Phase 4
    await showFakeBSOD(8000);

    // Transition to Phase 4
    import('../engine/storyEngine.js').then(({ storyEngine }) => {
      storyEngine.transitionToPhase(4);
    });
  }, 300);
}

export function destroyPhase3() {
  _phase3Active = false;
  _intervals.forEach(clearInterval);
  _timeouts.forEach(clearTimeout);
  _intervals = [];
  _timeouts = [];
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}
