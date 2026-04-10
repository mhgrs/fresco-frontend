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
  baseURL: baseURL,
});

// Interceptor de respuesta: maneja automáticamente la renovación del access token.
// Cuando el backend responde con 401 (token vencido), este interceptor:
//   1. Toma el refresh token del localStorage
//   2. Pide un nuevo access token al backend
//   3. Reintenta la petición original con el token nuevo
// Si el refresh también falla, limpia la sesión y redirige al login.
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Error 500+: fallo interno del servidor.
    // Disparamos un evento global para que App.jsx pueda mostrar un aviso al usuario.
    if (error.response?.status >= 500) {
      window.dispatchEvent(new CustomEvent('errorServidor', {
        detail: { status: error.response.status }
      }));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No hay refresh token.');

        // Usamos axios directamente (no la instancia 'api') para evitar
        // que este mismo interceptor intercepte la petición de refresco
        // y entre en un bucle infinito.
        const response = await axios.post(`${baseURL}token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // El refresh token también venció o es inválido: forzar logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('usuario');
        delete api.defaults.headers.common['Authorization'];
        // Redirigir al login sin usar React Router (estamos fuera de componentes)
        window.location.href = '/fresco-login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
