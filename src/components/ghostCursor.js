/**
 * ARWE — Ghost Cursor Component
 * An illusion of a second user/entity sharing the screen.
 * Appears when the real user is idle, moves towards buttons,
 * and darts away when the real user moves their mouse.
 */

class GhostCursor {
  constructor() {
    this.el = null;
    this.idleTimer = null;
    this.isIdle = false;
    this.x = -100;
    this.y = -100;
    this.targetX = -100;
    this.targetY = -100;
    this.moveInterval = null;
    this.lastRealMouseX = 0;
    this.lastRealMouseY = 0;
  }

  init() {
    // Create the ghost cursor element
    this.el = document.createElement('div');
    this.el.className = 'ghost-cursor';
    this.el.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3.5L20 12L11 15L8 22L4 3.5Z" fill="#ff3333" stroke="#ff3333" stroke-width="1" stroke-linejoin="round"/>
      </svg>
    `;
    document.body.appendChild(this.el);

    // Track real mouse to determine idle state
    document.addEventListener('mousemove', (e) => {
      this.lastRealMouseX = e.clientX;
      this.lastRealMouseY = e.clientY;
      this.resetIdle();
    }, { passive: true });

    // Track clicks
    document.addEventListener('mousedown', () => this.resetIdle(), { passive: true });
    
    // Start animation loop
    requestAnimationFrame(() => this.animate());
    
    // Start idle timer initially
    this.resetIdle();
  }

  resetIdle() {
    if (this.isIdle) {
      this.isIdle = false;
      this.dartAway();
    }
    
    clearTimeout(this.idleTimer);
    
    // Appear after 12-25 seconds of inactivity
    const idleDelay = 12000 + Math.random() * 13000;
    this.idleTimer = setTimeout(() => this.becomeActive(), idleDelay);
  }

  becomeActive() {
    this.isIdle = true;
    
    // Start from a random edge of the screen
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) { this.x = Math.random() * window.innerWidth; this.y = -50; } // top
    else if (edge === 1) { this.x = window.innerWidth + 50; this.y = Math.random() * window.innerHeight; } // right
    else if (edge === 2) { this.x = Math.random() * window.innerWidth; this.y = window.innerHeight + 50; } // bottom
    else { this.x = -50; this.y = Math.random() * window.innerHeight; } // left
    
    this.el.style.opacity = '0.7';
    this.el.style.transition = 'none'; // Will be animated manually via requestAnimationFrame
    
    this.pickNewTarget();
    
    // Change targets every few seconds
    if (this.moveInterval) clearInterval(this.moveInterval);
    this.moveInterval = setInterval(() => {
      if (this.isIdle) this.pickNewTarget();
    }, 2000 + Math.random() * 3000);
  }

  pickNewTarget() {
    // 50% chance to target a random button or link, 50% chance to target a random spot near center
    if (Math.random() < 0.5) {
      const interactables = Array.from(document.querySelectorAll('button, a, input'));
      if (interactables.length > 0) {
        const target = interactables[Math.floor(Math.random() * interactables.length)];
        const rect = target.getBoundingClientRect();
        this.targetX = rect.left + rect.width / 2;
        this.targetY = rect.top + rect.height / 2;
        return;
      }
    }
    
    // Random spot near center
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    this.targetX = cx + (Math.random() * 400 - 200);
    this.targetY = cy + (Math.random() * 300 - 150);
  }

  dartAway() {
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
    }
    
    // Dart towards the nearest edge rapidly
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    
    this.targetX = this.x > cx ? window.innerWidth + 100 : -100;
    this.targetY = this.y > cy ? window.innerHeight + 100 : -100;
    
    // Hide quickly
    this.el.style.transition = 'opacity 0.3s ease';
    this.el.style.opacity = '0';
  }

  animate() {
    if (window.ARWE_PAUSED) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    if (this.isIdle) {
      // Smooth interpolation towards target (easing)
      this.x += (this.targetX - this.x) * 0.02; // Slower, more deliberate
      this.y += (this.targetY - this.y) * 0.02;
      this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    } else {
      // Darting away very fast
      this.x += (this.targetX - this.x) * 0.15;
      this.y += (this.targetY - this.y) * 0.15;
      this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

export const ghostCursor = new GhostCursor();
