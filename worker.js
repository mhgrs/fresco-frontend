const BACKEND = 'https://pos-system-wfog.onrender.com';
const PROXY_PREFIXES = ['/api/', '/fresco-admin/', '/static/'];

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

    return env.ASSETS.fetch(request);
  },
};
