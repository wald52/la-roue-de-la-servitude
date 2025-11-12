// ============================
// 🔧 SERVICE WORKER OPTIMISÉ
// ============================

const CACHE_NAME = 'laroue-v3';
const OFFLINE_URL = '/larouedelaservitude/offline.html';

// Liste des fichiers mis en cache
const ASSETS_TO_CACHE = [
  '/larouedelaservitude/',
  '/larouedelaservitude/index.html',
  '/larouedelaservitude/center.png',
  '/larouedelaservitude/wheel-spin.mp3',
  '/larouedelaservitude/coin.mp3',
  '/larouedelaservitude/icons/favicon-192x192.png',
  '/larouedelaservitude/icons/favicon-512x512.png',
  OFFLINE_URL
];

// Fichiers exclus du cache (jamais enregistrés)
const EXCLUDED_FROM_CACHE = [
  '/larouedelaservitude/buttons.html', // 🚫 Ne pas mettre en cache
  '/.netlify/functions/sendFeedback'   // 🚫 Fonction serveur
];

// ============================
// 📦 INSTALLATION
// ============================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ============================
// 🚀 ACTIVATION (nettoyage anciens caches)
// ============================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ============================
// 🌐 FETCH : gestion du cache dynamique
// ============================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1️⃣ Si le fichier est exclu → ne jamais le mettre en cache
  if (EXCLUDED_FROM_CACHE.some(ex => url.pathname.includes(ex))) {
    event.respondWith(fetch(request).catch(() => new Response('')));
    return;
  }

  // 2️⃣ Sinon : cache-first avec fallback réseau
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((networkResponse) => {
          // Vérifie que la réponse est valide et qu’on peut la mettre en cache
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });

          return networkResponse;
        })
        .catch(() => {
          // Si la ressource est indisponible → affiche la page offline
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// ============================
// 📡 MISE À JOUR AUTOMATIQUE DES BOUTONS
// ============================
self.addEventListener('message', (event) => {
  if (event.data === 'refresh-buttons') {
    // Supprime buttons.html du cache pour forcer le rechargement
    caches.open(CACHE_NAME).then(cache => {
      cache.delete('/larouedelaservitude/buttons.html');
    });
  }
});
