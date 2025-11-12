// Nom du cache
const CACHE_NAME = "roue-servitude-v2";

// Liste des fichiers à mettre en cache (hors réseau)
const ASSETS = [
  "/larouedelaservitude/",
  "/larouedelaservitude/index.html",
  "/larouedelaservitude/icons/favicon-192x192.png",
  "/larouedelaservitude/icons/favicon-512x512.png",
  "/larouedelaservitude/center.png",
  "/larouedelaservitude/wheel-spin.mp3",
  "/larouedelaservitude/coin.mp3"
];

// Installation du service worker
self.addEventListener("install", (event) => {
  console.log("📦 Installation du Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Mise en cache des fichiers essentiels");
      return cache.addAll(ASSETS);
    })
  );
});

// Nettoyage des anciennes versions du cache
self.addEventListener("activate", (event) => {
  console.log("🧹 Activation du Service Worker et nettoyage des anciens caches");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

// Gestion des requêtes réseau
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 🔒 On ne met PAS en cache :
  // - buttons.html
  // - les fonctions Netlify (/.netlify/functions/)
  // - les requêtes API externes
  // - GitHub, Netlify, ou tout autre domaine externe
  if (
    url.includes("buttons.html") ||
    url.includes("/.netlify/functions/") ||
    url.startsWith("https://api.") ||
    url.includes("github.com") ||
    url.includes("netlify.app")
  ) {
    return; // Laisse passer sans toucher
  }

  // 🧩 Réponse depuis le cache, sinon depuis le réseau
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // On ne met en cache que les requêtes "GET" et "same-origin"
          if (
            event.request.method === "GET" &&
            event.request.url.startsWith(self.location.origin)
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // 🚨 En cas d’erreur réseau, on renvoie une version hors ligne si possible
          if (event.request.mode === "navigate") {
            return caches.match("/larouedelaservitude/index.html");
          }
        });
    })
  );
});

