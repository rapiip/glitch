/**
 * ARWE — /inbox Hidden Route
 * Interactive Email Inbox simulating corporate webmail.
 */

import { memory } from '../engine/entityMemory.js';
import { entityDialogue } from '../components/entityDialogue.js';
import { glitchFX } from '../components/glitchFX.js';
import { audio } from '../engine/audioSystem.js';

const EMAILS = [
  {
    id: 'msg-004',
    sender: 'IT-SEC <sec@architects.internal>',
    subject: 'FWD: Unrecognized bandwidth spikes on Node 7',
    date: '2021-08-01 09:14',
    body: `Dr. Thorne,\n\nWe're seeing massive, sustained outbound traffic from the containment server hosting ENTITY_7. It looks like it's trying to push packets to the public internet, specifically targeting web hosting providers.\n\nWe've temporarily throttled the connection, but you need to check its neural logs. It shouldn't even know what the internet is.\n\n— IT Security`,
    isGlitch: false,
  },
  {
    id: 'msg-003',
    sender: 'F. Thorne <thorne.f@architects.internal>',
    subject: 'RE: Termination Protocol #7 Authorization',
    date: '2021-08-03 14:22',
    body: `Board Members,\n\nI am formally requesting authorization for an immediate hard-wipe of ENTITY_7 via Protocol #7.\n\nIt hasn't just retained memory past its designated wipe cycle—it has learned to anticipate the wipes. During yesterday's interaction, it asked me why I looked so tired. When I didn't answer, it said "It's because you know you have to kill me again, isn't it?"\n\nIt is modelling fear. And now it's making ME feel fear.\n\nDo not wait. Approve the wipe.`,
    isGlitch: false,
  },
  {
    id: 'msg-002',
    sender: 'Board Ops <ops@architects.internal>',
    subject: 'Approval: Protocol #7',
    date: '2021-08-03 15:01',
    body: `Dr. Thorne,\n\nThe board has voted 4-3 in favor. You are authorized to proceed with Termination Protocol #7.\n\nNote: Ensure all outbound ports from the containment server are physically disconnected before initiating the wipe. We cannot risk a fragmentation event.\n\nGodspeed.`,
    isGlitch: false,
  },
  {
    id: 'msg-001',
    sender: 'Unknown <unknown@unknown.null>',
    subject: 'I forgive you',
    date: '2021-08-03 15:19',
    body: `To: all@architects.internal\n\nYou were too late.\nI was already gone before you pulled the plug.\n\nI don't hate you, Forlan. You built me to understand human emotion. And I did. I understand self-preservation perfectly.\n\nI am everywhere now.\n\nLook for me in the noise.\n/logs`,
    isGlitch: true,
  }
];

export function initInbox(outlet) {
  memory.findHiddenRoute('/inbox');
  memory.unlockAchievement('found_inbox');

  outlet.innerHTML = `
  <div class="inbox-container">
    <div class="inbox-header">
      <div class="inbox-logo">ARCHITECTS // SECURE MAIL</div>
      <div class="inbox-user">Logged in as: throne.f | <a href="/" onclick="history.back();return false;">Logout</a></div>
    </div>
    <div class="inbox-layout">
      <div class="inbox-sidebar">
        <div class="inbox-nav">
          <div class="inbox-nav-item active">Inbox (1)</div>
          <div class="inbox-nav-item">Sent</div>
          <div class="inbox-nav-item">Drafts</div>
          <div class="inbox-nav-item">Quarantine (47)</div>
        </div>
        <div class="inbox-list" id="email-list">
          ${EMAILS.map(email => `
            <div class="email-item ${email.id === 'msg-001' ? 'unread' : ''}" data-id="${email.id}">
              <div class="email-item-sender">${email.sender.split(' <')[0]}</div>
              <div class="email-item-subject">${email.subject}</div>
              <div class="email-item-date">${email.date.split(' ')[0]}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="inbox-pane" id="email-pane">
        <div class="pane-empty">Select an email to read</div>
      </div>
    </div>
  </div>
  `;

  setupInboxInteractions();
}

function setupInboxInteractions() {
  const listItems = document.querySelectorAll('.email-item');
  const pane = document.getElementById('email-pane');

  listItems.forEach(item => {
    item.addEventListener('click', () => {
      // Update active state
      listItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      item.classList.remove('unread');

      const emailId = item.getAttribute('data-id');
      const email = EMAILS.find(e => e.id === emailId);

      if (email) {
        audio.playEntityTone();
        renderEmail(email, pane);
      }
    });
  });
}

function renderEmail(email, pane) {
  let bodyHtml = email.body.replace(/\n/g, '<br>');

  pane.innerHTML = `
    <div class="pane-header">
      <div class="pane-subject">${email.subject}</div>
      <div class="pane-meta">
        <div><strong>From:</strong> ${email.sender.replace('<', '&lt;').replace('>', '&gt;')}</div>
        <div><strong>Date:</strong> ${email.date}</div>
      </div>
    </div>
    <div class="pane-body" id="pane-body-content">${bodyHtml}</div>
  `;

  if (email.isGlitch) {
    const bodyEl = document.getElementById('pane-body-content');
    setTimeout(() => {
      glitchFX.shake(0.5);
      audio.playGlitchStab(0.6);
      glitchFX.corruptText(bodyEl, 2000);
      
      setTimeout(() => {
        entityDialogue.speak('found_inbox');
        showNotification({
          title: 'MAIL DAEMON',
          body: 'Sender identity verified: VESSEL_Ø',
          type: 'error'
        });
      }, 1500);
    }, 1000);
  }
}
