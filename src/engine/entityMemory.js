/**
 * ARWE — Entity Memory System
 * Manages VESSEL_Ø's "memory" via sessionStorage & localStorage
 * All data is local — no server, no tracking
 */

import { vesselId } from './vesselId.js';

const MEMORY_KEY = 'vessel_memory';
const PERSIST_KEY = 'vessel_persist';

const defaults = {
  // Session-specific
  sessionStart: Date.now(),
  visitCount: 0,
  clickCount: 0,
  idleStart: Date.now(),
  currentPhase: 1,
  pathHistory: [],
  dialoguesSeen: [],
  eventsTriggered: [],
  puzzleSolved: false,
  endingReached: null,

  // Persistent (localStorage)
  totalVisits: 0,
  firstVisitTime: null,
  hiddenRoutesFound: [],
  achievementsUnlocked: [],
  endingsReached: [],
  hasCompletedOnce: false,
  loopCount: 0,
};

class EntityMemory {
  constructor() {
    this._session = null;
    this._persist = null;
    this.init();
  }

  init() {
    // Persistent memory (across sessions)
    const raw = localStorage.getItem(PERSIST_KEY);
    this._persist = raw ? JSON.parse(raw) : {
      totalVisits: 0,
      firstVisitTime: Date.now(),
      hiddenRoutesFound: [],
      achievementsUnlocked: [],
      endingsReached: [],
      hasCompletedOnce: false,
      loopCount: 0,
    };
    // Ensure new fields exist on old saves
    if (!this._persist.endingsReached) this._persist.endingsReached = [];
    if (this._persist.hasCompletedOnce === undefined) this._persist.hasCompletedOnce = false;
    if (this._persist.loopCount === undefined) this._persist.loopCount = 0;
    this._persist.totalVisits++;
    this._savePersist();

    // Session memory
    const sraw = sessionStorage.getItem(MEMORY_KEY);
    if (sraw) {
      this._session = JSON.parse(sraw);
      this._session.visitCount++;
    } else {
      this._session = {
        sessionStart: Date.now(),
        visitCount: 1,
        clickCount: 0,
        idleStart: Date.now(),
        currentPhase: 1,
        pathHistory: [],
        dialoguesSeen: [],
        eventsTriggered: [],
        puzzleSolved: false,
        endingReached: null,
      };
    }
    this._saveSession();
  }

  // --- Getters ---
  get sessionTime() {
    return Math.floor((Date.now() - this._session.sessionStart) / 1000);
  }
  get clickCount() { return this._session.clickCount; }
  get visitCount() { return this._session.visitCount; }
  get totalVisits() { return this._persist.totalVisits; }
  get currentPhase() { return this._session.currentPhase; }
  get pathHistory() { return this._session.pathHistory; }
  get isRepeatVisitor() { return this._session.visitCount > 1 || this._persist.totalVisits > 1; }
  get isNightTime() {
    const h = new Date().getHours();
    return h >= 0 && h < 5;
  }
  get idleTime() {
    return Math.floor((Date.now() - this._session.idleStart) / 1000);
  }
  /** True if user has completed the experience at least once before */
  get isLoopVisit() {
    return this._persist.hasCompletedOnce;
  }
  /** Number of times the user has completed the full experience */
  get loopCount() {
    return this._persist.loopCount;
  }
  /** List of endings the user has reached */
  get endingsReached() {
    return this._persist.endingsReached || [];
  }
  /** The vessel designation */
  get vesselDesignation() {
    return vesselId.designation;
  }

  // --- Setters / Actions ---
  incrementClick() {
    this._session.clickCount++;
    this._session.idleStart = Date.now(); // reset idle on click
    this._saveSession();
  }

  resetIdle() {
    this._session.idleStart = Date.now();
    this._saveSession();
  }

  setPhase(phase) {
    this._session.currentPhase = phase;
    this._saveSession();
  }

  addPath(path) {
    if (!this._session.pathHistory.includes(path)) {
      this._session.pathHistory.push(path);
      this._saveSession();
    }
  }

  markDialogueSeen(id) {
    if (!this._session.dialoguesSeen.includes(id)) {
      this._session.dialoguesSeen.push(id);
      this._saveSession();
    }
    return true;
  }

  hasSeenDialogue(id) {
    return this._session.dialoguesSeen.includes(id);
  }

  triggerEvent(id) {
    if (!this._session.eventsTriggered.includes(id)) {
      this._session.eventsTriggered.push(id);
      this._saveSession();
      return true; // first time
    }
    return false;
  }

  hasTriggeredEvent(id) {
    return this._session.eventsTriggered.includes(id);
  }

  findHiddenRoute(route) {
    if (!this._persist.hiddenRoutesFound.includes(route)) {
      this._persist.hiddenRoutesFound.push(route);
      this._savePersist();
    }
  }

  hasFoundRoute(route) {
    return this._persist.hiddenRoutesFound.includes(route);
  }

  unlockAchievement(id) {
    if (!this._persist.achievementsUnlocked.includes(id)) {
      this._persist.achievementsUnlocked.push(id);
      this._savePersist();
      return true;
    }
    return false;
  }

  solvePuzzle() {
    this._session.puzzleSolved = true;
    this._saveSession();
  }

  setEnding(endingId) {
    this._session.endingReached = endingId;
    this._saveSession();
    // Also persist the ending for loop detection
    if (!this._persist.endingsReached) this._persist.endingsReached = [];
    if (!this._persist.endingsReached.includes(endingId)) {
      this._persist.endingsReached.push(endingId);
    }
    this._persist.hasCompletedOnce = true;
    this._persist.loopCount = (this._persist.loopCount || 0) + 1;
    this._savePersist();
  }

  // --- Private ---
  _saveSession() {
    sessionStorage.setItem(MEMORY_KEY, JSON.stringify(this._session));
  }

  _savePersist() {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(this._persist));
  }

  // Debug — only accessible via console
  dump() {
    return {
      session: this._session,
      persist: this._persist,
      computed: {
        sessionTime: this.sessionTime,
        idleTime: this.idleTime,
        isRepeatVisitor: this.isRepeatVisitor,
        isNightTime: this.isNightTime,
      }
    };
  }
}

export const memory = new EntityMemory();
