const CACHE_NAME = "portfolio-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/script.js",
  "./manifest.json",
  "./images/profile.jpg",
  "./images/project1.jpg",
  "./images/project2.jpg",
  "./images/gallery1.jpg",
  "./images/gallery2.jpg",
  "./images/gallery3.jpg",
  "./images/gallery4.jpg",
  "./images/gallery5.jpg",
  "./images/gallery6.jpg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Install — i-cache lahat
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
      .catch((err) => console.warn("Cache error:", err))
  );
  self.skipWaiting();
});

// Activate — linisin ang lumang cache
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first, tapos network
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).catch(() => caches.match("./index.html"));
    })
  );
});
