/**
 * ARWE — Vessel ID System
 * Generates a unique, persistent identifier for each visitor.
 * Displayed across the experience to create the feeling of being individually tracked.
 */

const VESSEL_ID_KEY = 'vessel_designation';
const VESSEL_CREATED_KEY = 'vessel_designation_created';

class VesselIdSystem {
  constructor() {
    this.id = null;
    this.createdAt = null;
    this._init();
  }

  _init() {
    const existing = localStorage.getItem(VESSEL_ID_KEY);
    if (existing) {
      this.id = existing;
      this.createdAt = parseInt(localStorage.getItem(VESSEL_CREATED_KEY) || Date.now());
    } else {
      this.id = this._generate();
      this.createdAt = Date.now();
      localStorage.setItem(VESSEL_ID_KEY, this.id);
      localStorage.setItem(VESSEL_CREATED_KEY, String(this.createdAt));
    }
  }

  _generate() {
    const arr = new Uint8Array(4);
    crypto.getRandomValues(arr);
    const hex1 = Array.from(arr.slice(0, 2))
      .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
      .join('');
    const hex2 = Array.from(arr.slice(2, 4))
      .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
      .join('');
    return `VSL-${hex1}-${hex2}`;
  }

  /** Full designation e.g. VSL-A7F2-9D1E */
  get designation() {
    return this.id;
  }

  /** Short hex e.g. A7F29D1E */
  get short() {
    return this.id.replace(/VSL-/g, '').replace(/-/g, '');
  }

  /** Numeric hash for seeding deterministic randomness per-user */
  get numericHash() {
    let h = 0;
    for (let i = 0; i < this.id.length; i++) {
      h = ((h << 5) - h + this.id.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  /** Days since first visit */
  get daysSinceCreation() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  }

  /** Format for terminal output */
  get terminalFormat() {
    return `SUBJECT_ID: ${this.id} // HASH: 0x${this.short} // CREATED: ${new Date(this.createdAt).toISOString().split('T')[0]}`;
  }
}

export const vesselId = new VesselIdSystem();
