const CACHE_NAME = 'dilshan-gps-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './DILGPS.png',
  './firebase-app.js',
  './firebase-firestore.js'
];

// ඇප් එක මුලින්ම ලෝඩ් වන විට ෆයිල් ටික මෙමරියට ගැනීම
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// ඉන්ටර්නෙට් නැතිව ඕපන් කරන විට මෙමරියෙන් ඇප් එක ලෝඩ් කර දීම
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
