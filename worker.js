const BACKEND = 'https://pos-system-production-2606.up.railway.app';
const PROXY_PREFIXES = ['/api/', '/fresco-admin/', '/static/'];
// Archivos que NUNCA deben cachearse en el browser para que los updates lleguen de inmediato
const NO_CACHE_PATHS = new Set(['/', '/index.html', '/sw.js']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const shouldProxy = PROXY_PREFIXES.some(p => url.pathname.startsWith(p));

    if (shouldProxy) {
      const response = await fetch(BACKEND + url.pathname + url.search, {
        method: request.method,
        headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'manual',
      });

      // Si el backend redirige usando su propia URL (Railway), reescribir al dominio público
      // para que el navegador no quede apuntando directamente al backend.
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('Location');
        if (location && location.startsWith(BACKEND)) {
          const headers = new Headers(response.headers);
          headers.set('Location', location.replace(BACKEND, url.origin));
          return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
        }
      }

      return response;
    }

    const response = await env.ASSETS.fetch(request);

    if (NO_CACHE_PATHS.has(url.pathname)) {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return new Response(response.body, { status: response.status, headers });
    }

    return response;
  },
};
