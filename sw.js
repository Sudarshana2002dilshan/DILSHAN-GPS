const CACHE_NAME = 'dilshan-gps-v15'; // අංකය v15 කලා පරණ මතකය මැකෙන්න
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './DILGPS.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => { if (key !== CACHE_NAME) { return caches.delete(key); } }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});
