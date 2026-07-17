const CACHE_NAME = 'dilshan-gps-v2';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'DILGPS.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
