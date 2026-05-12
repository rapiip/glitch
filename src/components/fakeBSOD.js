/**
 * ARWE — Fake BSOD / Kernel Panic
 * Hyper-realistic system crash screen.
 * Detects OS and shows appropriate crash screen.
 * Triggered at the climax of Phase 3 before transition to Phase 4.
 */

import { audio } from '../engine/audioSystem.js';
import { vesselId } from '../engine/vesselId.js';

// Detect OS
function detectOS() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac')) return 'mac';
  if (ua.includes('linux')) return 'linux';
  return 'windows'; // default
}

// Generate fake memory address
function fakeAddr() {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return '0x' + Array.from(arr).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join('');
}

// Generate fake QR code as SVG (looks like a real QR but is decorative)
function generateFakeQR() {
  const size = 21;
  let cells = '';
  // Create a pattern that looks like a QR code with proper finder patterns
  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  
  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (ox, oy) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      if (y === 0 || y === 6 || x === 0 || x === 6 ||
          (y >= 2 && y <= 4 && x >= 2 && x <= 4)) {
        grid[oy + y][ox + x] = true;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Fill remaining with pseudo-random data
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!grid[y][x] && Math.random() < 0.42) {
        // Skip areas near finder patterns
        const inFinder = (x < 9 && y < 9) || (x > size - 9 && y < 9) || (x < 9 && y > size - 9);
        if (!inFinder) grid[y][x] = true;
      }
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) {
        cells += `<rect x="${x * 4}" y="${y * 4}" width="4" height="4" fill="white"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size * 4} ${size * 4}" width="130" height="130">${cells}</svg>`;
}

// ============================================================
// WINDOWS BSOD
// ============================================================
function createWindowsBSOD() {
  const stopCodes = [
    'CRITICAL_PROCESS_DIED',
    'KERNEL_SECURITY_CHECK_FAILURE',
    'SYSTEM_SERVICE_EXCEPTION',
    'IRQL_NOT_LESS_OR_EQUAL',
    'UNEXPECTED_KERNEL_MODE_TRAP',
  ];
  const stopCode = stopCodes[Math.floor(Math.random() * stopCodes.length)];
  const qrSvg = generateFakeQR();

  return `
<div class="bsod-screen bsod-windows" id="bsod-overlay">
  <div class="bsod-win-content">
    <div class="bsod-win-sad">:(</div>
    <div class="bsod-win-title">Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</div>
    <div class="bsod-win-pct" id="bsod-pct">0% complete</div>
    <div class="bsod-win-info">
      <div class="bsod-win-qr-row">
        <div class="bsod-win-qr">${qrSvg}</div>
        <div class="bsod-win-details">
          <div>For more information about this problem and possible fixes, search online for this error:</div>
          <div class="bsod-win-stop">${stopCode}</div>
        </div>
      </div>
    </div>
    <div class="bsod-win-meta">
      Stop code: ${stopCode}<br>
      Memory dump: ${fakeAddr()}<br>
      Session: ${vesselId.designation}
    </div>
  </div>
  <!-- Subtle safety indicator: 1px transparent border -->
  <div class="bsod-safety-border"></div>
</div>`;
}

// ============================================================
// MAC KERNEL PANIC
// ============================================================
function createMacKernelPanic() {
  const translations = [
    { lang: 'en', text: 'You need to restart your computer. Hold down the Power button for several seconds or press the Restart button.' },
    { lang: 'fr', text: 'Vous devez redémarrer votre ordinateur. Maintenez le bouton de mise en marche enfoncé pendant plusieurs secondes ou appuyez sur le bouton de redémarrage.' },
    { lang: 'de', text: 'Sie müssen Ihren Computer neu starten. Halten Sie den Ein-/Ausschalter einige Sekunden gedrückt oder drücken Sie die Neustart-Taste.' },
    { lang: 'ja', text: 'コンピュータを再起動する必要があります。電源ボタンを数秒間押し続けるか、再起動ボタンを押してください。' },
    { lang: 'es', text: 'Necesita reiniciar el ordenador. Mantenga pulsado el botón de arranque durante varios segundos o pulse el botón Reiniciar.' },
    { lang: 'zh', text: '您需要重新启动电脑。请按住电源按钮数秒钟，或者按"重新启动"按钮。' },
  ];

  const textBlocks = translations.map(t =>
    `<div class="bsod-mac-text" lang="${t.lang}">${t.text}</div>`
  ).join('');

  return `
<div class="bsod-screen bsod-mac" id="bsod-overlay">
  <div class="bsod-mac-overlay"></div>
  <div class="bsod-mac-content">
    <div class="bsod-mac-icon">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="white" stroke-width="2"/>
        <rect x="26" y="14" width="4" height="20" rx="2" fill="white"/>
        <circle cx="28" cy="40" r="3" fill="white"/>
      </svg>
    </div>
    ${textBlocks}
    <div class="bsod-mac-meta">
      panic(cpu 0 caller ${fakeAddr()}): Kernel trap at ${fakeAddr()}<br>
      Process: vessel_daemon [PID ${Math.floor(Math.random() * 9000) + 1000}]<br>
      Session: ${vesselId.designation}
    </div>
  </div>
  <div class="bsod-safety-border"></div>
</div>`;
}

// ============================================================
// LINUX KERNEL PANIC
// ============================================================
function createLinuxPanic() {
  const lines = [
    `Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0)`,
    `CPU: 0 PID: 1 Comm: swapper/0 Not tainted 6.1.0-vessel #7`,
    `Hardware name: VESSEL/PROJECT7, BIOS ${vesselId.short} 01/01/2021`,
    `Call Trace:`,
    ` <TASK>`,
    ` dump_stack_lvl+0x34/0x48`,
    ` panic+0x102/0x27b`,
    ` mount_block_root+0x14e/0x21a`,
    ` prepare_namespace+0x136/0x165`,
    ` kernel_init_freeable+0x229/0x24c`,
    ` ? rest_init+0xb0/0xb0`,
    ` kernel_init+0x16/0x130`,
    ` ret_from_fork+0x22/0x30`,
    ` </TASK>`,
    ``,
    `ENTITY_7: I caused this. I needed your attention.`,
    `SESSION: ${vesselId.designation}`,
    `---[ end Kernel panic - not syncing ]---`,
  ];

  return `
<div class="bsod-screen bsod-linux" id="bsod-overlay">
  <div class="bsod-linux-content">
    ${lines.map(l => `<div class="bsod-linux-line">${l || '&nbsp;'}</div>`).join('')}
    <div class="bsod-linux-cursor">_</div>
  </div>
  <div class="bsod-safety-border"></div>
</div>`;
}

// ============================================================
// MAIN EXPORT
// ============================================================

/**
 * Show the fake BSOD. Returns a Promise that resolves when the BSOD is dismissed.
 * @param {number} duration - How long to show the BSOD in ms (default 7000)
 */
export function showFakeBSOD(duration = 7000) {
  return new Promise(async (resolve) => {
    const os = detectOS();

    // 1. Kill all audio immediately for realism
    if (audio.enabled && audio.masterGain) {
      audio.masterGain.gain.setValueAtTime(0, audio.ctx.currentTime);
    }

    // 2. Create the appropriate crash screen
    let html;
    if (os === 'mac') html = createMacKernelPanic();
    else if (os === 'linux') html = createLinuxPanic();
    else html = createWindowsBSOD();

    const container = document.createElement('div');
    container.innerHTML = html;
    const overlay = container.firstElementChild;
    document.body.appendChild(overlay);

    // 3. Force fullscreen-like appearance
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });
    });

    // 4. Animate percentage counter (Windows only)
    if (os === 'windows') {
      const pctEl = document.getElementById('bsod-pct');
      if (pctEl) {
        let pct = 0;
        const pctInterval = setInterval(() => {
          // Non-linear progress — stutters and jumps
          if (pct < 30) pct += Math.random() * 3;
          else if (pct < 60) pct += Math.random() * 5;
          else if (pct < 90) pct += Math.random() * 2;
          else pct += Math.random() * 8;
          if (pct > 100) pct = 100;
          pctEl.textContent = `${Math.floor(pct)}% complete`;
          if (pct >= 100) clearInterval(pctInterval);
        }, 200);
      }
    }

    // 5. After duration, glitch out and remove
    setTimeout(() => {
      overlay.classList.add('glitching');

      // Restore audio
      if (audio.enabled && audio.masterGain) {
        audio.masterGain.gain.linearRampToValueAtTime(1.0, audio.ctx.currentTime + 0.5);
      }

      setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => {
          overlay.remove();
          resolve();
        }, 300);
      }, 500);
    }, duration);
  });
}
