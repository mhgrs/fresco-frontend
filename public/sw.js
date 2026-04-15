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

// Limpieza de cachés antiguos al actualizar la app + recarga forzada de clientes
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const hayVersionAntigua = cacheNames.some(n => !cacheWhitelist.includes(n));
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheWhitelist.includes(cacheName)) return caches.delete(cacheName);
          })
        ).then(() => hayVersionAntigua);
      })
      .then(hayVersionAntigua => clients.claim().then(() => hayVersionAntigua))
      .then(hayVersionAntigua => {
        if (!hayVersionAntigua) return;
        // Si se eliminaron cachés viejos, recargar todas las pestañas abiertas
        // para que carguen el JS nuevo en lugar del build cacheado.
        return clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then(clientList => {
            clientList.forEach(client => client.navigate(client.url));
          });
      })
  );
});