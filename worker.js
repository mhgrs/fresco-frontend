const BACKEND = 'https://pos-system-wfog.onrender.com';
const PROXY_PREFIXES = ['/api/', '/fresco-admin/', '/static/'];
// Archivos que NUNCA deben cachearse en el browser para que los updates lleguen de inmediato
const NO_CACHE_PATHS = new Set(['/', '/index.html', '/sw.js']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const shouldProxy = PROXY_PREFIXES.some(p => url.pathname.startsWith(p));

    if (shouldProxy) {
      const target = new Request(BACKEND + url.pathname + url.search, {
        method: request.method,
        headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      });
      return fetch(target);
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
