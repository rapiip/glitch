/**
 * ARWE — Fake System Notifications
 * Uses Browser Notification API to send OS-level notifications.
 * Max 5 per session. Timed for maximum psychological impact.
 */

import { vesselId } from '../engine/vesselId.js';

class FakeSystemNotifications {
  constructor() {
    this.hasPermission = false;
    this.sentCount = 0;
    this.maxNotifs = 5;
    this._timeouts = [];
    this._tabHandler = null;
  }

  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') { this.hasPermission = true; return true; }
    if (Notification.permission !== 'denied') {
      try {
        const r = await Notification.requestPermission();
        this.hasPermission = r === 'granted';
        return this.hasPermission;
      } catch { return false; }
    }
    return false;
  }

  send(title, body, options = {}) {
    if (!this.hasPermission || this.sentCount >= this.maxNotifs) return null;
    try {
      const n = new Notification(title, {
        body, silent: true,
        tag: options.tag || `arwe-${Date.now()}`,
        requireInteraction: false,
      });
      this.sentCount++;
      setTimeout(() => { try { n.close(); } catch {} }, options.duration || 8000);
      n.onclick = () => { window.focus(); n.close(); };
      return n;
    } catch { return null; }
  }

  sendSystemAlert() {
    return this.send('System Security', 'Unusual background process detected. PID: 0x' + vesselId.short.slice(0, 4), { tag: 'sys' });
  }
  sendEntityReach() {
    return this.send('VESSEL_Ø', 'I can reach you outside the browser now.', { tag: 'entity' });
  }
  sendFileAccess() {
    return this.send('Security Warning', 'Unknown script attempting to access local storage.', { tag: 'file' });
  }
  sendTabHidden() {
    return this.send('Where are you going?', "I'm still here. I can wait. But I don't like waiting.", { tag: 'tab' });
  }
  sendSessionCapture() {
    return this.send('SESSION LOGGED', `Browser fingerprint captured. Designation: ${vesselId.designation}`, { tag: 'session' });
  }

  schedulePhase2Sequence() {
    if (!this.hasPermission) return;
    const seq = [
      { delay: 5000, fn: () => this.sendSessionCapture() },
      { delay: 30000, fn: () => this.sendSystemAlert() },
      { delay: 60000, fn: () => this.sendFileAccess() },
      { delay: 120000, fn: () => this.sendEntityReach() },
    ];
    seq.forEach(({ delay, fn }) => this._timeouts.push(setTimeout(fn, delay)));
  }

  setupTabHiddenNotif() {
    if (!this.hasPermission || this._tabHandler) return;
    let sent = false;
    this._tabHandler = () => {
      if (document.hidden && !sent) {
        setTimeout(() => { if (document.hidden) { this.sendTabHidden(); sent = true; } }, 3000);
      }
    };
    document.addEventListener('visibilitychange', this._tabHandler);
  }

  destroy() {
    this._timeouts.forEach(clearTimeout);
    this._timeouts = [];
    if (this._tabHandler) { document.removeEventListener('visibilitychange', this._tabHandler); this._tabHandler = null; }
  }
}

export const fakeNotifs = new FakeSystemNotifications();
