const CACHE_NAME = 'fresco-pos-cache-v5';
const urlsToCache = [
  '/'
];

// Instalación: Guardar archivos básicos en caché
self.addEventListener('install', event => {
  // Forzar al Service Worker a activarse inmediatamente sin esperar a que se cierren las pestañas
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Usamos add individual con catch para que si un archivo falla, el SW se instale de todos modos
        return Promise.allSettled(urlsToCache.map(url => cache.add(url).catch(err => console.log('Fallo al cachear predeterminado:', url))));
      })
  );
});

// Interceptar peticiones con estrategia "Network First" (Red primero, caché como respaldo)
self.addEventListener('fetch', event => {
  // No interceptamos llamadas a la API, dejamos que Axios y App.jsx manejen los datos offline
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la red responde correctamente, actualizamos la caché dinámica
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        // Si no hay red (offline), buscamos en la caché
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          
          // Si es navegación y no está en caché, devolvemos el index principal
          if (event.request.mode === 'navigate') {
            return caches.match('/').then(res => {
               return res || new Response('Aplicación Offline', { status: 503, statusText: 'Service Unavailable' });
            });
          }
          return new Response('', { status: 408, statusText: 'Request Timeout' });
        });
      })
  );
});

// Limpieza de cachés antiguos al actualizar la app
self.addEventListener('activate', event => {
  // Tomar el control de los clientes de inmediato
  event.waitUntil(clients.claim());

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheWhitelist.indexOf(cacheName) === -1) return caches.delete(cacheName);
      })
    ))
  );
});