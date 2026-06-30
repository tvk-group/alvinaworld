/* ALVINA World — service worker for PWA install */
const CACHE_NAME = 'alvinaworld-pwa-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/assets/web-app-manifest.json',
  '/styles.css',
  '/app.js',
  '/i18n.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/alvina-hero.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        return response;
      }).catch(function () {
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return Response.error();
      });
    })
  );
});
