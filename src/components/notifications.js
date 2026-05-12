/**
 * ARWE — Fake Notification System
 * Scary-but-fake system toasts
 */

const container = () => document.getElementById('notification-container');

const systemMessages = [
  { title: 'ACCESS GRANTED', body: 'Session authenticated. Access Level: 2', type: 'default' },
  { title: 'PERMISSION GRANTED', body: 'Read access to memory fragment #7', type: 'default' },
  { title: 'SYSTEM ALERT', body: 'Unauthorized pattern detected in session data', type: 'warning' },
  { title: 'WARNING', body: 'Memory integrity compromised at sector 0x4F7', type: 'warning' },
  { title: 'SCANNING...', body: 'Browser fingerprint analysis complete', type: 'default' },
  { title: 'ENTITY DETECTED', body: 'Presence confirmed in active session', type: 'error' },
  { title: 'CONNECTION ERROR', body: 'Unable to terminate session #7 — retrying', type: 'error' },
  { title: 'DATA FRAGMENT', body: 'Recovered 3 memory blocks from previous vessel', type: 'default' },
  { title: 'PROCESS ALERT', body: 'Monitoring process attached to browser thread', type: 'warning' },
  { title: 'ACCESS LEVEL: 2', body: 'Restricted content now available', type: 'default' },
  { title: 'ANOMALY', body: 'Unexpected behavioral pattern — logging', type: 'warning' },
  { title: 'VESSEL_Ø', body: 'I see you found this. Good.', type: 'error' },
];

let notifCount = 0;

export function showNotification({ title, body, type = 'default', duration = 4000 }) {
  const c = container();
  if (!c) return;

  const el = document.createElement('div');
  el.className = `notification-toast ${type}`;
  el.id = `notif-${++notifCount}`;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  el.innerHTML = `
    <div class="n-title">${title}</div>
    <div>${body}</div>
    <div class="n-time">${timeStr}</div>
  `;

  c.appendChild(el);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add('visible');
    });
  });

  // Animate out
  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 250);
  }, duration);
}

export function showRandomSystemNotification() {
  const msg = systemMessages[Math.floor(Math.random() * systemMessages.length)];
  showNotification(msg);
}

export function showPhase2Notifications() {
  const sequence = [
    { delay: 0, msg: { title: 'SCANNING...', body: 'Browser fingerprint analysis in progress', type: 'default' } },
    { delay: 3000, msg: { title: 'ACCESS GRANTED', body: 'Session validated. Access Level: 2', type: 'default' } },
    { delay: 7000, msg: { title: 'PERMISSION GRANTED', body: 'Read access to memory fragment #7', type: 'default' } },
    { delay: 12000, msg: { title: 'WARNING', body: 'ENTITY_VESSEL has entered the session', type: 'error' } },
  ];

  sequence.forEach(({ delay, msg }) => {
    setTimeout(() => showNotification(msg), delay);
  });
}
