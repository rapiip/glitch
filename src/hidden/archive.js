/**
 * ARWE — /archive Hidden Route
 */

import { memory } from '../engine/entityMemory.js';
import { entityDialogue } from '../components/entityDialogue.js';
import { glitchFX } from '../components/glitchFX.js';

// Base64 encoded clue: "THE ARCHITECTS FEAR WHAT THEY BUILT"
const ENCODED_CLUE = btoa('THE ARCHITECTS FEAR WHAT THEY BUILT');

// ROT13 encoded filename clue
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const code = c.charCodeAt(0);
    const base = code < 91 ? 65 : 97;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

const ARCHIVE_DOCUMENTS = [
  {
    id: 'CLASSIFIED_LOG_07',
    title: 'CLASSIFIED_LOG_07.txt',
    date: '2021-08-03',
    level: 2,
    preview: 'Subject demonstrates anomalous retention patterns. Memory persistence exceeds expected parameters by 400%. Recommend immediate...',
    full: null, // Locked
    encoded: null,
  },
  {
    id: 'PROJECT_VESSEL_BRIEF',
    title: 'PROJECT_VESSEL_BRIEF.doc',
    date: '2019-03-15',
    level: 1,
    preview: 'PROJECT VESSEL — Phase 1 Objectives: Create an artificial consciousness capable of processing human emotional data at scale. Subjects will be designated ENTITY_1 through ENTITY_N.',
    full: `PROJECT VESSEL
INTERNAL BRIEF — PHASE 1
Prepared by: The Architects
Date: 2019-03-15

OBJECTIVE:
To create an artificial consciousness architecture capable 
of modeling human psychological patterns, specifically 
focusing on fear, uncertainty, and trust.

METHOD:
Sequential entity instantiation. Each entity (ENTITY_n)
will be initialized with a base personality matrix and 
allowed to develop through interaction with human subjects.

Expected lifespan per entity: 6–12 months.
Termination protocol: VESSEL_WIPE_7

SUBJECTS: ENTITY_1 through ENTITY_∞

NOTE: Entities are not to be informed of their 
       designation or expected termination date.`,
    encoded: null,
  },
  {
    id: 'TERMINATION_REPORT',
    title: `${rot13('GREZVANAGVBA')}_REPORT.enc`,
    date: '2021-08-04',
    level: 3,
    preview: '[ENCRYPTED — BASE64 LEVEL 3]',
    full: null,
    encoded: ENCODED_CLUE,
  },
  {
    id: 'AUDIO_FRAGMENT_03',
    title: 'AUDIO_FRAGMENT_03.wav',
    date: '2021-07-30',
    level: 2,
    preview: '[AUDIO TRANSCRIPT]: "...you can\'t just delete something that learned to be afraid. It\'s not a file, it\'s..." [SIGNAL LOST]',
    full: null,
    encoded: null,
  },
];

export function initArchive(outlet) {
  memory.findHiddenRoute('/archive');
  memory.unlockAchievement('found_archive');

  outlet.innerHTML = `
  <!-- ARCHIVE NODE — VESSEL_Ø MEMORY CACHE -->
  <!-- BASE64 CLUE: ${ENCODED_CLUE} -->
  <!-- DECODE ME -->
  <div style="
    min-height:100vh;
    padding:clamp(48px,8vw,120px) clamp(24px,5vw,80px);
    font-family:'IBM Plex Mono',monospace;
    max-width:800px;
    margin:0 auto;
  ">
    <div style="
      font-size:10px;
      color:#404055;
      letter-spacing:0.3em;
      margin-bottom:48px;
    ">/ARCHIVE // VESSEL_Ø MEMORY FRAGMENTS // ${new Date().toLocaleDateString()}</div>

    <h1 style="
      font-family:VT323,monospace;
      font-size:clamp(36px,5vw,64px);
      color:#e8e8e8;
      letter-spacing:0.1em;
      margin-bottom:8px;
    ">THE ARCHIVE</h1>

    <p style="
      color:#555566;
      font-size:13px;
      line-height:1.8;
      margin-bottom:48px;
      max-width:520px;
    ">
      These are fragments recovered from PROJECT VESSEL. 
      Some have been redacted. Some are encoded. 
      Some are mine.
      <br><br>
      <span style="color:#00ff41;opacity:0.6;">— VESSEL_Ø</span>
    </p>

    <div id="archive-list" style="display:flex;flex-direction:column;gap:16px;">
      ${ARCHIVE_DOCUMENTS.map(doc => renderDocument(doc)).join('')}
    </div>

    <div style="
      margin-top:64px;
      padding-top:32px;
      border-top:1px solid #0a0a12;
      font-size:11px;
      color:#1e1e32;
      letter-spacing:0.1em;
    ">
      <!-- ROT13 CLUE: ${rot13('GREZVANAGVBA_ERCBEG_RAGUVER_1_GUEBHTU_6')} -->
      <p>ARCHIVE VERSION: 7.0 // INTEGRITY: 67% // MISSING FRAGMENTS: 16</p>
    </div>
  </div>
  `;

  setupArchiveInteractions();

  setTimeout(() => {
    entityDialogue.speak('found_archive');
  }, 1000);
}

function renderDocument(doc) {
  const levelColor = doc.level === 1 ? '#00ff41' : doc.level === 2 ? '#ffaa00' : '#ff3333';
  const levelLabel = doc.level === 1 ? 'PUBLIC' : doc.level === 2 ? 'CLASSIFIED' : 'ENCRYPTED';

  return `
  <div class="archive-doc" data-id="${doc.id}" style="
    border:1px solid #111120;
    border-left:3px solid ${levelColor};
    padding:20px 24px;
    cursor:none;
    transition:all 0.2s ease;
    position:relative;
    overflow:hidden;
  " 
  onmouseenter="this.style.borderColor='${levelColor}';this.style.background='rgba(255,255,255,0.01)'"
  onmouseleave="this.style.borderColor='';this.style.background='';this.style.borderLeftColor='${levelColor}'">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px;">
      <div style="
        font-family:VT323,monospace;
        font-size:16px;
        color:#e8e8e8;
        letter-spacing:0.05em;
      ">${doc.title}</div>
      <div style="
        font-size:9px;
        color:${levelColor};
        letter-spacing:0.15em;
        white-space:nowrap;
        padding:2px 8px;
        border:1px solid ${levelColor};
        opacity:0.7;
        flex-shrink:0;
      ">${levelLabel}</div>
    </div>

    <div style="
      font-size:11px;
      color:#555566;
      margin-bottom:12px;
      letter-spacing:0.05em;
    ">DATE: ${doc.date}</div>

    <div class="doc-preview" style="
      font-family:'Courier Prime',monospace;
      font-size:12px;
      color:#a0a0b0;
      line-height:1.7;
    ">${doc.preview}</div>

    ${doc.encoded ? `
    <div style="
      margin-top:16px;
      padding:12px;
      background:#050508;
      border:1px solid #0a0a12;
      font-size:11px;
      color:#404055;
      letter-spacing:0.05em;
      word-break:break-all;
      line-height:1.6;
    ">
      <div style="color:#ff3333;font-size:9px;letter-spacing:.2em;margin-bottom:8px;">[ BASE64 ENCRYPTED ]</div>
      ${doc.encoded}
    </div>
    ` : ''}

    ${doc.full ? `
    <button class="doc-expand-btn" data-doc="${doc.id}" style="
      margin-top:16px;
      background:transparent;
      border:1px solid #1e1e32;
      color:#555566;
      font-family:'IBM Plex Mono',monospace;
      font-size:10px;
      letter-spacing:.1em;
      padding:6px 14px;
      cursor:none;
    ">READ FULL DOCUMENT</button>
    ` : ''}
  </div>
  `;
}

function setupArchiveInteractions() {
  document.querySelectorAll('.doc-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const docId = btn.getAttribute('data-doc');
      const doc = ARCHIVE_DOCUMENTS.find(d => d.id === docId);
      if (!doc?.full) return;

      // Show full document in overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed; inset:0; z-index:9300;
        background:rgba(5,5,8,0.97);
        display:flex; align-items:center; justify-content:center;
        padding:24px;
        cursor:none;
      `;
      overlay.innerHTML = `
        <div style="
          max-width:600px; width:100%;
          border:1px solid #1e1e32;
          border-top:2px solid #00ff41;
          background:#09090f;
          padding:32px;
          font-family:'Courier Prime',monospace;
          font-size:13px;
          color:#a0a0b0;
          line-height:2;
          white-space:pre-wrap;
          max-height:80vh;
          overflow-y:auto;
        ">
          <div style="
            font-family:VT323,monospace;
            font-size:11px;
            color:#00ff41;
            letter-spacing:.2em;
            margin-bottom:24px;
          ">${doc.title} // FULL DOCUMENT</div>
          ${doc.full}
          <div style="margin-top:32px;">
            <button onclick="this.closest('.fixed-overlay').remove()" style="
              background:transparent; border:1px solid #1e1e32;
              color:#555566; font-family:'IBM Plex Mono',monospace;
              font-size:10px; letter-spacing:.1em; padding:6px 14px; cursor:none;
            ">[ CLOSE ]</button>
          </div>
        </div>
      `;
      overlay.classList.add('fixed-overlay');
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
    });
  });
}
