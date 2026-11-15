// CAMPUSHOP Lightweight PWA Service Worker for Offline Fallback & Add to Home Screen Support
const CACHE_NAME = 'campushop-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through fetch requests with network-first strategy
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
