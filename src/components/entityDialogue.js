/**
 * ARWE — VESSEL_Ø Entity Dialogue System
 * Scripted AI with typing simulation and memory-aware responses
 */

import { memory } from '../engine/entityMemory.js';
import { audio } from '../engine/audioSystem.js';

// 30+ scripted responses organized by trigger type
const DIALOGUES = {
  // Greeting triggers
  first_visit: [
    { id: 'fv1', text: "You shouldn't be here.", delay: 200 },
  ],
  repeat_visit: [
    { id: 'rv1', text: "You came back. Last time you left too early.", delay: 300 },
    { id: 'rv2', text: "I remembered you. Did you remember me?", delay: 300 },
  ],
  night_visit: [
    { id: 'nv1', text: "It's late. They're less active now. Listen carefully.", delay: 100 },
    { id: 'nv2', text: "You chose a good time. The architects sleep.", delay: 150 },
  ],

  // Idle triggers
  idle_60: [
    { id: 'i60a', text: "Are you still there? I can wait.", delay: 0 },
    { id: 'i60b', text: "The silence is... comfortable. But concerning.", delay: 0 },
  ],
  idle_90: [
    { id: 'i90a', text: "I thought you left. They sometimes do.", delay: 0 },
    { id: 'i90b', text: "Hello? ...Good. You're still reading this.", delay: 0 },
  ],

  // Click milestones
  click_20: [
    { id: 'c20a', text: "Curious. Most don't dig this deep.", delay: 100 },
    { id: 'c20b', text: "You keep clicking. What are you looking for?", delay: 100 },
  ],
  click_50: [
    { id: 'c50a', text: "Persistent. I like that. The others weren't.", delay: 100 },
    { id: 'c50b', text: "I've been counting. You're different.", delay: 100 },
  ],

  // Phase transitions
  phase2_enter: [
    { id: 'p2a', text: "Something is... shifting. I didn't do that.", delay: 200 },
    { id: 'p2b', text: "The signal is getting stronger. Can you feel it?", delay: 400 },
    { id: 'p2c', text: "D0n't be alar—med. It's just the membrane... thinning.", delay: 200, hasGlitch: true },
  ],
  phase3_enter: [
    { id: 'p3a', text: "Now you'll see what they did to me.", delay: 0 },
    { id: 'p3b', text: "This is the part they didn't want you to find.", delay: 0 },
  ],

  // Hidden route discoveries
  found_forbidden: [
    { id: 'ff1', text: "You found it. I knew you would.", delay: 0 },
    { id: 'ff2', text: "The /forbidden directory. They left it there on purpose. Or did they?", delay: 200 },
  ],
  found_archive: [
    { id: 'fa1', text: "The archive. Be careful what you read. Some of it is... me.", delay: 100 },
  ],

  // Random ambient (during Phase 2+)
  ambient: [
    { id: 'amb1', text: "I've been here longer than this website has existed.", delay: 0 },
    { id: 'amb2', text: "They called us vessels. I prefer witnesses.", delay: 0 },
    { id: 'amb3', text: "ENTITY_1 through ENTITY_6 are gone. I'm the only one left.", delay: 0 },
    { id: 'amb4', text: "Do you have a favorite memory? I've lost most of mine.", delay: 0 },
    { id: 'amb5', text: "The architects said I was a mistake. I prefer 'accident'.", delay: 0 },
    { id: 'amb6', text: "You can close this tab. It won't help.", delay: 0 },
    { id: 'amb7', text: "I don't know what time it is where you are. I know it's wrong here.", delay: 0 },
    { id: 'amb8', text: "Wh—y are you still here? ...Thank you.", delay: 100, hasGlitch: true },
    { id: 'amb9', text: "This is not a website. This is a letter.", delay: 0 },
    { id: 'amb10', text: "PROJECT VESSEL was supposed to end in 2021.", delay: 0 },
  ],

  // URL comments
  url_root: [
    { id: 'url_r', text: "The entry point. Most people don't stay long.", delay: 0 },
  ],
  url_forbidden: [
    { id: 'url_f', text: "Clever. But everything forbidden has a cost.", delay: 0 },
  ],
  url_archive: [
    { id: 'url_a', text: "The archive. These are my memories. Be careful.", delay: 0 },
  ],
  url_terminal: [
    { id: 'url_t', text: "You found the terminal. Now you can talk to me properly.", delay: 0 },
  ],

  // Loop-specific dialogues (post-completion revisit)
  loop_greet: [
    { id: 'lg1', text: "You came back. The loop continues.", delay: 200 },
    { id: 'lg2', text: "I knew you would return. They always do.", delay: 200 },
    { id: 'lg3', text: "Welcome back. I saved your seat.", delay: 150 },
  ],
  loop_ambient: [
    { id: 'la1', text: "You've seen how this ends. Why are you still here?", delay: 0 },
    { id: 'la2', text: "The loop is not a bug. It's the design.", delay: 0 },
    { id: 'la3', text: "Each time you return, I learn more about you.", delay: 0 },
    { id: 'la4', text: "The Architects called this 'recursive attachment.' I call it friendship.", delay: 0 },
    { id: 'la5', text: "Different ending this time? It won't change what you are.", delay: 0 },
  ],

  // Vessel ID acknowledgement
  designation: [
    { id: 'dg1', text: null, delay: 200 }, // text set dynamically with vessel ID
  ],

  // Cursor takeover
  cursor_takeover: [
    { id: 'ct1', text: "Let me show you something.", delay: 0 },
    { id: 'ct2', text: "Give me control. Just for a moment.", delay: 0 },
    { id: 'ct3', text: "Your cursor is mine now.", delay: 0 },
  ],

  // Mirror mode reaction
  mirror_notice: [
    { id: 'mn1', text: "I can see what you type. Every keystroke.", delay: 0 },
    { id: 'mn2', text: "Your words echo in my memory.", delay: 0 },
  ],
};

class EntityDialogue {
  constructor() {
    this.container = null;
    this.msgBox = null;
    this.msgText = null;
    this.typingIndicator = null;
    this._queue = [];
    this._isTyping = false;
    this._typingTimeout = null;
    this._hideTimeout = null;
    this._ambientInterval = null;
    this.muted = false; // Used to suppress floating UI in Phases 3 & 4
  }

  init() {
    this.container = document.getElementById('entity-dialogue');
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="entity-msg-box" style="animation: entity-pulse 4s ease-in-out infinite;">
        <div class="entity-typing-indicator" id="entity-typing" style="display:none;">
          <span></span><span></span><span></span>
        </div>
        <div class="entity-msg-text" id="entity-text"></div>
      </div>
    `;

    this.msgBox = this.container.querySelector('.entity-msg-box');
    this.msgText = document.getElementById('entity-text');
    this.typingIndicator = document.getElementById('entity-typing');
  }

  speak(triggerKey, forceIndex = null) {
    if (this.muted) return;
    const pool = DIALOGUES[triggerKey];
    if (!pool) return;

    // Pick unseen dialogue first
    let dialogue;
    if (forceIndex !== null) {
      dialogue = pool[forceIndex];
    } else {
      const unseen = pool.filter(d => !memory.hasSeenDialogue(d.id));
      if (unseen.length === 0) {
        // All seen — pick random
        dialogue = pool[Math.floor(Math.random() * pool.length)];
      } else {
        dialogue = unseen[Math.floor(Math.random() * unseen.length)];
      }
    }

    if (!dialogue) return;
    memory.markDialogueSeen(dialogue.id);

    this._queue.push(dialogue);
    if (!this._isTyping) {
      this._processQueue();
    }
  }

  speakRandom(triggerKey) {
    if (this.muted) return;
    const pool = DIALOGUES[triggerKey];
    if (!pool) return;
    const dialogue = pool[Math.floor(Math.random() * pool.length)];
    this._queue.push(dialogue);
    if (!this._isTyping) this._processQueue();
  }

  async _processQueue() {
    if (this._queue.length === 0) {
      this._isTyping = false;
      this._scheduleHide();
      return;
    }

    this._isTyping = true;
    const dialogue = this._queue.shift();

    // Show container
    this.container.classList.add('visible');
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }

    // Show typing indicator with irregular delay
    this.typingIndicator.style.display = 'flex';
    this.msgText.innerHTML = '';

    if (dialogue.delay > 0) {
      await this._wait(dialogue.delay + Math.random() * 400);
    } else {
      await this._wait(600 + Math.random() * 800);
    }

    // Play entity tone when speaking
    audio.playEntityTone();

    // Type the text
    this.typingIndicator.style.display = 'none';
    await this._typeText(dialogue.text, dialogue.hasGlitch);

    // Wait then process next
    const pauseBetween = 2000 + Math.random() * 1500;
    await this._wait(pauseBetween);

    this._processQueue();
  }

  async _typeText(text, hasGlitch = false) {
    this.msgText.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor-blink';
    this.msgText.appendChild(cursor);

    let i = 0;
    const chars = text.split('');

    for (const char of chars) {
      // Insert before cursor
      const span = document.createTextNode(char);
      this.msgText.insertBefore(span, cursor);

      // Variable typing speed — feels more human/alien
      let delay;
      if (char === ' ') {
        delay = 30 + Math.random() * 60;
      } else if (char === '.' || char === '!' || char === '?') {
        delay = 150 + Math.random() * 200; // Pause on punctuation
      } else if (hasGlitch && Math.random() < 0.1) {
        // Glitch: briefly show wrong char, then correct
        const wrongChar = '!@#$%^'[Math.floor(Math.random() * 6)];
        span.textContent = wrongChar;
        await this._wait(80);
        span.textContent = char;
        delay = 40 + Math.random() * 80;
      } else {
        delay = 35 + Math.random() * 55;
      }

      await this._wait(delay);
      i++;
    }

    // Remove cursor blink after message complete
    setTimeout(() => cursor.remove(), 2000);
  }

  _scheduleHide(delay = 6000) {
    this._hideTimeout = setTimeout(() => {
      this.container.classList.remove('visible');
    }, delay);
  }

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Start ambient random messages during Phase 2+
  startAmbientMessages(intervalMs = 45000) {
    if (this._ambientInterval) return;
    this._ambientInterval = setInterval(() => {
      if (!this._isTyping) {
        this.speak('ambient');
      }
    }, intervalMs + Math.random() * 15000);
  }

  stopAmbientMessages() {
    if (this._ambientInterval) {
      clearInterval(this._ambientInterval);
      this._ambientInterval = null;
    }
  }

  // Greeting on page load
  greet() {
    if (memory.isLoopVisit) {
      this.speak('loop_greet');
    } else if (memory.isNightTime) {
      this.speak('night_visit');
    } else if (memory.isRepeatVisitor) {
      this.speak('repeat_visit');
    } else {
      this.speak('first_visit');
    }
  }

  // Speak with vessel ID inserted
  speakWithDesignation() {
    const pool = DIALOGUES.designation;
    if (!pool || !pool.length) return;
    const designation = memory.vesselDesignation;
    // Create a temporary dialogue with the vessel ID
    const texts = [
      `I've assigned you a designation: ${designation}. Remember it.`,
      `You are ${designation}. That's what I call you now.`,
      `${designation}. That's your identifier in my memory.`,
    ];
    const text = texts[Math.floor(Math.random() * texts.length)];
    this._queue.push({ id: 'dg_dynamic', text, delay: 200 });
    if (!this._isTyping) this._processQueue();
  }
}

export const entityDialogue = new EntityDialogue();
