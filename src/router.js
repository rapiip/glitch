/**
 * ARWE — SPA Router
 * History API-based router without any framework
 */

import { memory } from './engine/entityMemory.js';

const routes = {};
let currentRoute = null;
let outlet = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path, pushState = true) {
  if (pushState) {
    history.pushState({}, '', path);
  }
  resolveRoute(path);
}

function resolveRoute(path) {
  // Strip query/hash for matching
  const clean = path.split('?')[0].split('#')[0] || '/';

  // Track path in memory
  memory.addPath(clean);

  // Look for exact match first
  let handler = routes[clean];

  // Fallback to wildcard
  if (!handler) handler = routes['*'];

  if (handler) {
    currentRoute = clean;
    if (outlet) {
      outlet.innerHTML = '';
    }
    handler(outlet, clean);
  }
}

export function initRouter() {
  outlet = document.getElementById('router-outlet');

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    resolveRoute(window.location.pathname);
  });

  // Handle initial route
  resolveRoute(window.location.pathname);
}

export function getCurrentRoute() {
  return currentRoute;
}
