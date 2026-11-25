/**
 * sw.js
 * Lightweight Offline-First Service Worker for Valeria's Musical Storybook.
 * - Precaches the core app shell on install.
 * - Uses cache-first + background populate for audio and Lottie assets so
 *   visited scenes work reliably offline (flights, car rides, iPhone Home Screen).
 */

const CACHE_NAME = 'valeria-storybook-v5';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first with offline fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static assets, audio, and animations: cache-first, populate cache on miss
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Avoid caching partial (206) range responses which Cache API rejects
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
