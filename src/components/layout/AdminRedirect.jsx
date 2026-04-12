import { useEffect } from 'react';
import api from '../../services/api';

function getDjangoAdminBaseUrl() {
  if (api.defaults.baseURL) {
    let baseUrl = api.defaults.baseURL;
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    if (baseUrl.endsWith('/api/')) return baseUrl.replace('/api/', '/');
    return baseUrl;
  }
  return 'http://localhost:8000/';
}

/**
 * Redirige al panel de administración de Django en el backend.
 */
export default function AdminRedirect() {
  useEffect(() => {
    window.location.replace(`${getDjangoAdminBaseUrl()}fresco-admin/`);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center text-gray-500 font-medium">
      Redirigiendo a Administración...
    </div>
  );
}
