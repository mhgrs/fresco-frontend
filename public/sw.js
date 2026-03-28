const CACHE_NAME = 'fresco-pos-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalación: Guardar archivos básicos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Interceptar peticiones para servir desde caché si estamos offline
self.addEventListener('fetch', event => {
  // No interceptamos llamadas a la API, dejamos que Axios y App.jsx manejen los datos offline
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response; // Devuelve la versión en caché
        
        return fetch(event.request).then(response => {
          // Guardar archivos nuevos (JS, CSS empaquetados por Vite) en caché dinámicamente
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return response;
        });
      }).catch(() => {
        // Si todo falla (offline) y es una petición de navegación (cambio de ruta en React), devolver index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Limpieza de cachés antiguos al actualizar la app
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheWhitelist.indexOf(cacheName) === -1) return caches.delete(cacheName);
      })
    ))
  );
});