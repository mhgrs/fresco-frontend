import axios from 'axios';

if (!import.meta.env.VITE_API_URL) {
  console.warn(
    '[api] La variable VITE_API_URL no está configurada.\n' +
    'Usando fallback: http://localhost:8000/api/\n' +
    'Para producción, define VITE_API_URL en tu archivo .env o en el dashboard de Vercel.'
  );
}

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL,
  // Imprescindible para que el navegador envíe y reciba las cookies HttpOnly
  // en peticiones cross-origin (frontend en Vercel → backend en Render).
  withCredentials: true,
});

// ── Interceptor de respuesta ──────────────────────────────────────────────────
// Cuando el backend responde con 401 (access token vencido), este interceptor:
//   1. Llama a POST /api/token/refresh/ — el navegador envía la cookie de refresh
//      automáticamente; el backend responde con una nueva cookie de access.
//   2. Reintenta la petición original (el navegador ya tiene la nueva cookie).
//   3. Si el refresh también falla (sesión expirada), redirige al login.
//
// Los tokens NUNCA son visibles para JavaScript: viven en cookies HttpOnly.
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status >= 500) {
      window.dispatchEvent(new CustomEvent('errorServidor', {
        detail: { status: error.response.status },
      }));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // El navegador envía la cookie fresco_refresh automáticamente.
        // Si el refresh es exitoso, el backend establece una nueva cookie fresco_access.
        await axios.post(`${baseURL}token/refresh/`, null, { withCredentials: true });

        // Reintentar la petición original; el navegador ya tiene la nueva cookie.
        return api(originalRequest);
      } catch {
        // El refresh también falló → sesión completamente expirada.
        window.location.href = '/fresco-login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
