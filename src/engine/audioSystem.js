/**
 * ARWE — Audio System
 * Web Audio API — all sounds generated in-browser
 * No actual audio files required for core experience
 */

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = false;
    this.nodes = {};
    this.mouseX = 0.5;
    this.mouseY = 0.5;
  }

  async enable() {
    if (this.enabled) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime); // Max volume
      this.masterGain.connect(this.ctx.destination);
      this.enabled = true;
      console.log('[AUDIO] System initialized, state:', this.ctx.state);
    } catch (e) {
      console.error('[AUDIO] Failed to initialize:', e);
    }
  }

  disable() {
    if (!this.enabled) return;
    this.stopAll();
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    setTimeout(() => {
      this.ctx.close();
      this.enabled = false;
    }, 600);
  }

  setMousePosition(x, y) {
    this.mouseX = x; // 0–1
    this.mouseY = y; // 0–1
    if (this.nodes.ambientPanner) {
      this.nodes.ambientPanner.pan.value = (x - 0.5) * 0.6;
    }
  }

  // --- Ambient Industrial Hum ---
  startAmbient() {
    if (!this.enabled || this.nodes.ambient) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner();

    osc1.type = 'sawtooth';
    osc1.frequency.value = 130; // Much more audible base

    osc2.type = 'sine';
    osc2.frequency.value = 220; // Electrical hum

    osc3.type = 'square';
    osc3.frequency.value = 360; // High frequency whine

    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 2;

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 2);

    panner.pan.value = 0;

    [osc1, osc2, osc3].forEach(o => o.connect(filter));
    filter.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(this.masterGain);

    [osc1, osc2, osc3].forEach(o => o.start());

    // Subtle LFO modulation on osc1 freq
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.1; // Very slow
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfo.start();

    this.nodes.ambient = { osc1, osc2, osc3, gainNode, filter, panner, lfo };
    this.nodes.ambientPanner = panner;
  }

  stopAmbient() {
    if (!this.nodes.ambient) return;
    const { osc1, osc2, osc3, gainNode, lfo } = this.nodes.ambient;
    gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    setTimeout(() => {
      try { [osc1, osc2, osc3, lfo].forEach(o => o.stop()); } catch {}
    }, 600);
    delete this.nodes.ambient;
    delete this.nodes.ambientPanner;
  }

  // --- Glitch Stab (short noise burst) ---
  playGlitchStab(intensity = 1) {
    if (!this.enabled) return;
    const duration = 0.05 + Math.random() * 0.15;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Colored noise — more aggressive
      data[i] = (Math.random() * 2 - 1) * intensity;
      if (i > 0) data[i] = data[i] * 0.7 + data[i - 1] * 0.3;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.5 * intensity, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800 + Math.random() * 2000;
    filter.Q.value = 0.5;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start();
    source.stop(this.ctx.currentTime + duration);
  }

  // --- Whisper (reversed-feel pink noise) ---
  playWhisper() {
    if (!this.enabled) return;
    const duration = 2.5 + Math.random() * 2;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    // Pink noise approximation
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0+b1+b2+b3+b4+b5+b6+white*0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime + duration - 0.5);
    gainNode.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400 + Math.random() * 1200;
    filter.Q.value = 2;

    // Pitch modulation for "reversed" feel
    const conv = this.ctx.createConvolver();

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start();
    source.stop(this.ctx.currentTime + duration);
  }

  // --- Entity Voice (distorted tones) ---
  playEntityTone() {
    if (!this.enabled) return;
    const freqs = [110, 140, 180, 220, 280, 330];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const distortion = this.ctx.createWaveShaper();

    // Create distortion curve
    const k = 400;
    const n = 256;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
    }
    distortion.curve = curve;

    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    const duration = 0.3 + Math.random() * 0.4;
    gainNode.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(distortion);
    distortion.connect(gainNode);
    gainNode.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  async silenceDrop(duration = 1500) {
    if (!this.enabled || !this.masterGain) return;
    const prev = this.masterGain.gain.value || 1.0;
    this.masterGain.gain.setValueAtTime(prev, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    await new Promise(r => setTimeout(r, duration));
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(prev, this.ctx.currentTime + 0.5);
  }

  // --- Reactive Audio (mouse-driven pitch shift) ---
  updateReactive(x, y) {
    if (!this.enabled || !this.nodes.ambient) return;
    // Mouse Y controls filter cutoff subtly
    const freq = 100 + y * 150;
    this.nodes.ambient.filter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.5);
  }

  // --- Audio Log (Synthesized Tape Recorder Effect) ---
  playAudioLog() {
    if (!this.enabled) return;
    this.stopAudioLog();

    const bufferSize = this.ctx.sampleRate * 47; // 47 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate static + muffled talking
    let phase = 0;
    for (let i = 0; i < bufferSize; i++) {
      // Base static noise
      let val = (Math.random() * 2 - 1) * 0.1;

      // Simulate muffled speech using low-frequency modulation
      const timeInSec = i / this.ctx.sampleRate;
      
      // Muffled speech burst
      const isBurst = Math.sin(timeInSec * 2) > 0.5 && Math.random() > 0.1;
      if (isBurst) {
        phase += 0.02 + (Math.random() * 0.05);
        // Formant-like sine waves (vowels)
        const f1 = Math.sin(phase) * 0.4;
        const f2 = Math.sin(phase * 2.5) * 0.15;
        
        // Add crackle
        if (Math.random() < 0.005) {
          val += (Math.random() * 2 - 1) * 0.6;
        }

        val += (f1 + f2) * 0.5;
      } else {
        // Ambient hiss
        val *= 0.5;
      }
      
      data[i] = val;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = false;

    // Telephone / Tape effect filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1.5;

    // Slight distortion
    const distortion = this.ctx.createWaveShaper();
    const curve = new Float32Array(400);
    for (let i = 0; i < 400; i++) {
      const x = (i * 2) / 400 - 1;
      curve[i] = (Math.PI + 5) * x / (Math.PI + 5 * Math.abs(x));
    }
    distortion.curve = curve;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.4;

    source.connect(filter);
    filter.connect(distortion);
    distortion.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start();
    this.nodes.audioLog = { source, filter, gainNode };
  }

  stopAudioLog() {
    if (this.nodes.audioLog) {
      try { this.nodes.audioLog.source.stop(); } catch (e) {}
      this.nodes.audioLog.source.disconnect();
      this.nodes.audioLog = null;
    }
  }

  stopAll() {
    this.stopAmbient();
    this.stopAudioLog();
  }
}

export const audio = new AudioSystem();
