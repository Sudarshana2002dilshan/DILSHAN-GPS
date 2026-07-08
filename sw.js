// සෑම අප්ඩේට් එකකදීම මේ කැෂේ නම (v4, v5 ලෙස) මාරු කරන්න
const CACHE_NAME = 'dilshan-gps-v6'; 
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './DILGPS.png',
  './firebase-app.js',
  './firebase-firestore.js'
];

// ඇප් එකේ ෆයිල් ටික ෆෝන් එකේ සේව් කරගැනීම
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // අලුත් කෝඩ් එකක් ආ සැනින් පරණ එක මඟහැර ක්‍රියාත්මක වීම
  );
});

// පරණ Cache දත්ත ස්වයංක්‍රීයවම මකා දැමීම
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Old Cache Automatically Deleted:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Offline අවස්ථාවලදී සේව් කරගත් ෆයිල් ලබාදීම
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
