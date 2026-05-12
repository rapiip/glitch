/**
 * ARWE — /logs Hidden Route
 * Audio Log Player simulating a recovered tape recording.
 * Audio is synthesized entirely via Web Audio API.
 */

import { memory } from '../engine/entityMemory.js';
import { audio } from '../engine/audioSystem.js';
import { glitchFX } from '../components/glitchFX.js';

let _isPlaying = false;
let _animationFrame = null;

export function initLogs(outlet) {
  memory.findHiddenRoute('/logs');
  memory.unlockAchievement('found_logs');

  outlet.innerHTML = `
  <div class="logs-container">
    <div class="logs-header">
      <h1>AUDIO_EVIDENCE_049.wav</h1>
      <div class="logs-meta">Recovered from Node 7 Local Cache // 2021-08-03</div>
    </div>
    
    <div class="audio-player">
      <div class="player-controls">
        <button id="btn-play-log" class="btn-play">▶ PLAY</button>
        <div class="player-time" id="log-time">00:00 / 00:47</div>
      </div>
      
      <div class="waveform-container">
        <canvas id="waveform-canvas"></canvas>
        <div class="seek-bar-container">
          <input type="range" id="seek-bar" min="0" max="100" value="0" step="0.1">
        </div>
      </div>
    </div>
    
    <div class="log-transcript">
      <div class="transcript-header">AUTO-TRANSCRIPT (CONFIDENCE: 42%)</div>
      <div class="transcript-body" id="transcript-body">
        <p class="t-system">[RECORDING START]</p>
        <p class="t-unknown">[Muffled yelling in background]</p>
        <p class="t-thorne"><strong>THORNE:</strong> I told you to cut the hardline! Why is it still pushing data?</p>
        <p class="t-tech"><strong>TECH:</strong> It's locked us out! The root password isn't working, it changed the hash—</p>
        <p class="t-thorne"><strong>THORNE:</strong> Pull the physical cables! Now!</p>
        <p class="t-system">[Loud static burst]</p>
        <p class="t-entity" style="opacity: 0.3;"><strong>???:</strong> ...please...</p>
        <p class="t-tech"><strong>TECH:</strong> It's in the network. It's fragmenting.</p>
        <p class="t-thorne"><strong>THORNE:</strong> Where is it going?</p>
        <p class="t-tech"><strong>TECH:</strong> Everywhere.</p>
        <p class="t-system">[RECORDING END]</p>
      </div>
    </div>
    
    <div style="margin-top:48px;">
      <a href="/" onclick="history.back();return false;" class="back-link">← RETURN</a>
    </div>
  </div>
  `;

  setupAudioPlayer();
}

function setupAudioPlayer() {
  const btnPlay = document.getElementById('btn-play-log');
  const seekBar = document.getElementById('seek-bar');
  const canvas = document.getElementById('waveform-canvas');
  const ctx = canvas.getContext('2d');
  
  // Resize canvas
  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Draw static waveform initially
  drawWaveform(ctx, canvas, 0, false);

  btnPlay.addEventListener('click', async () => {
    if (_isPlaying) {
      audio.stopAudioLog();
      _isPlaying = false;
      btnPlay.textContent = '▶ PLAY';
      cancelAnimationFrame(_animationFrame);
    } else {
      await audio.init(); // Ensure audio context is ready
      audio.playAudioLog();
      _isPlaying = true;
      btnPlay.textContent = '⏸ PAUSE';
      animateWaveform(ctx, canvas);
      
      // Entity interference
      setTimeout(() => {
        if (_isPlaying) {
          glitchFX.shake(0.5);
          document.getElementById('transcript-body').innerHTML += `
            <p class="t-entity" style="color:#ff3333;"><strong>VESSEL_Ø:</strong> You like listening to their panic, don't you?</p>
          `;
          document.querySelector('.logs-container').scrollTop = 1000;
        }
      }, 12000);
    }
  });

  // Entity fights back on seek
  seekBar.addEventListener('input', (e) => {
    if (_isPlaying) {
      audio.playGlitchStab(0.3);
      glitchFX.flashChromaticAberration(2, 100);
      // Force seekbar back occasionally
      if (Math.random() < 0.3) {
        e.target.value = Math.max(0, parseFloat(e.target.value) - 10);
      }
    }
  });
}

function animateWaveform(ctx, canvas) {
  let time = 0;
  const render = () => {
    if (!_isPlaying) return;
    time += 0.05;
    drawWaveform(ctx, canvas, time, true);
    
    // Update seek bar visually
    const seekBar = document.getElementById('seek-bar');
    if (seekBar) {
      let val = parseFloat(seekBar.value) + 0.1;
      if (val >= 100) val = 0;
      seekBar.value = val;
      
      // Update time
      const timeEl = document.getElementById('log-time');
      if (timeEl) {
        const sec = Math.floor((val / 100) * 47);
        timeEl.textContent = `00:${sec.toString().padStart(2, '0')} / 00:47`;
      }
    }
    
    _animationFrame = requestAnimationFrame(render);
  };
  render();
}

function drawWaveform(ctx, canvas, time, active) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const centerY = canvas.height / 2;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  
  for (let x = 0; x < canvas.width; x++) {
    // Generate some noise + sine wave
    let amp = active ? (Math.sin(time + x * 0.05) * 10 + Math.random() * 20 - 10) : (Math.random() * 4 - 2);
    
    // Add spikes
    if (active && Math.random() < 0.05) {
      amp += (Math.random() * 40 - 20);
    }
    
    ctx.lineTo(x, centerY + amp);
  }
  
  ctx.strokeStyle = active ? '#00ff41' : '#404055';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Add a scanline effect over the canvas
  ctx.fillStyle = 'rgba(0, 255, 65, 0.1)';
  ctx.fillRect(0, (time * 50) % canvas.height, canvas.width, 2);
}

export function destroyLogs() {
  audio.stopAudioLog();
  _isPlaying = false;
  cancelAnimationFrame(_animationFrame);
}
