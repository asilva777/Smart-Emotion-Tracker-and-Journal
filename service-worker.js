const CACHE_NAME = 'emotional-wellness-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(c =>
      c.addAll(ASSETS)
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(resp => resp ||
      fetch(event.request).then(r => {
        return caches.open(CACHE_NAME).then(c => {
          c.put(event.request, r.clone());
          return r;
        });
      }).catch(() => caches.match('/index.html'))
    )
  );
});
