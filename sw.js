// ============================================================
// SERVICE WORKER — Checklist Pisos
// ============================================================
// IMPORTANTE: cada vez que subas cambios de código, incrementa
// este número de versión. Es lo que fuerza a los móviles de tus
// usuarios (o al tuyo) a descargar la versión nueva en vez de
// seguir usando la copia guardada en caché.
//
//   const VERSION = 'v1';   →   const VERSION = 'v5';
//
// ============================================================
const VERSION = 'v8';
const CACHE_NAME = `checklist-pisos-${VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
];

// ── INSTALL: descarga y guarda en caché la nueva versión ──────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// ── ACTIVATE: borra cachés antiguas de versiones anteriores ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('checklist-pisos-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: red primero (para tener siempre lo último si hay
//    conexión), y si falla, se sirve la copia en caché (offline) ──
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── MENSAJE desde la app: aplicar la actualización al instante ──
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
