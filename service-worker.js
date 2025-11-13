const CACHE_NAME = 'ma-pwa-cache-v1';
const urlsToCache = [
  '/larouedelaservitude/',
  '/larouedelaservitude/icons/icon-192x192.png',
  '/larouedelaservitude/icons/icon-512x512.png',
  '/larouedelaservitude/images/center3.avif',
  '/larouedelaservitude/audio/wheel-spin2.mp3',
  '/larouedelaservitude/audio/coin2.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            return new Response('Ressource non disponible hors-ligne.', {
              status: 404,
              statusText: 'Non trouvé dans le cache ou hors-ligne',
            });
          });
      })
  );
});
