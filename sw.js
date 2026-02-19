const CACHE_NAME = 'learnhub-v1';
const urlsToCache = ['/','index.html','styles.css','app.js','db.js','games.js','utils.js','data.json'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
