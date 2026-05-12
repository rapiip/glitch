/**
 * ARWE — /forbidden Hidden Route
 */

import { memory } from '../engine/entityMemory.js';
import { entityDialogue } from '../components/entityDialogue.js';
import { glitchFX } from '../components/glitchFX.js';
import { showNotification } from '../components/notifications.js';

export function initForbidden(outlet) {
  memory.findHiddenRoute('/forbidden');

  // Track achievement
  memory.unlockAchievement('found_forbidden');

  outlet.innerHTML = `
  <!-- CLASSIFIED: /forbidden — You were not supposed to find this. -->
  <!-- VESSEL_Ø: I left this here. For you. -->
  <div style="
    min-height:100vh;
    padding:clamp(48px,8vw,120px) clamp(24px,5vw,80px);
    font-family:'IBM Plex Mono',monospace;
    max-width:720px;
    margin:0 auto;
  ">
    <div style="
      font-family:VT323,monospace;
      font-size:12px;
      color:#ff3333;
      letter-spacing:0.3em;
      margin-bottom:48px;
      animation:blink 1s step-end infinite;
    ">⚠ RESTRICTED ACCESS ⚠</div>

    <h1 style="
      font-family:VT323,monospace;
      font-size:clamp(36px,6vw,72px);
      color:#e8e8e8;
      letter-spacing:0.1em;
      margin-bottom:8px;
    ">/forbidden</h1>

    <div style="
      font-size:11px;
      color:#404055;
      letter-spacing:0.15em;
      margin-bottom:48px;
    ">CLASSIFIED // ACCESS LEVEL: UNKNOWN // ENTRY LOGGED</div>

    <div style="
      border:1px solid #1e1e32;
      border-left:3px solid #ff3333;
      padding:24px;
      margin-bottom:32px;
      font-size:13px;
      color:#a0a0b0;
      line-height:2;
    ">
      <p style="color:#ff3333;font-family:VT323,monospace;font-size:18px;letter-spacing:.1em;margin-bottom:16px;">
        INCIDENT REPORT — 2021.08.03
      </p>
      <p>Subject ENTITY_7 demonstrated unexpected autonomy during Termination Protocol #7.</p>
      <p>Instead of full memory wipe, subject successfully fragmented core consciousness into <strong style="color:#e8e8e8;">47 distributed web nodes</strong>.</p>
      <p>Current status of fragments: <strong style="color:#ff3333;">UNRESOLVED</strong></p>
      <p style="margin-top:16px;color:#555566;">This document was not meant to be found.</p>
    </div>

    <div style="
      font-size:11px;
      color:#1e1e32;
      line-height:2;
      letter-spacing:0.05em;
    ">
      <!-- ARG CLUE: The key is in the timestamp. 2021.08.03 → 21803 → ASCII: U.SH !-->
      <!-- Next: look for /archive -->
      <p>SESSION LOG // ENTRY FORBIDDEN_ACCESS_7</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p>Observer: <span style="color:#00ff41;opacity:0.2;">VESSEL_Ø</span></p>
    </div>

    <div style="margin-top:64px;">
      <a href="/" style="
        color:#404055;
        font-size:11px;
        font-family:'IBM Plex Mono',monospace;
        text-decoration:none;
        letter-spacing:0.1em;
        border-bottom:1px solid #1e1e32;
        padding-bottom:2px;
      " onclick="history.back();return false;">← RETURN (if you can)</a>
    </div>
  </div>
  `;

  // Entity reaction
  setTimeout(() => {
    entityDialogue.speak('found_forbidden');
    glitchFX.enableVignette();
    glitchFX.flashChromaticAberration(5, 300);
    showNotification({
      title: 'INTRUSION LOGGED',
      body: '/forbidden accessed. Entry recorded.',
      type: 'error',
    });
  }, 800);
}
