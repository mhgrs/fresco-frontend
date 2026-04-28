import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { usuariosService } from './services/usuarios';
import { sincronizarVentas } from './utils/syncVentas';
import RutasPublicas from './router/RutasPublicas';
import RutasAutenticadas from './router/RutasAutenticadas';
import SyncFeedback from './components/ui/SyncFeedback';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sincronizando, setSincronizando] = useState(false);
  const [errorServidor, setErrorServidor] = useState(false);

  // Banner global de error 500
  useEffect(() => {
    const handler = () => {
      setErrorServidor(true);
      setTimeout(() => setErrorServidor(false), 5000);
    };
    window.addEventListener('errorServidor', handler);
    return () => window.removeEventListener('errorServidor', handler);
  }, []);

  // Sesión expirada: limpiar usuario y volver al login sin recargar la página
  useEffect(() => {
    const handler = () => manejarCerrarSesion();
    window.addEventListener('sesionExpirada', handler);
    return () => window.removeEventListener('sesionExpirada', handler);
  }, []);

  // Variables de tema global
  useEffect(() => {
    document.documentElement.style.setProperty('--color-fondo', '#fcfbf7');
    document.documentElement.style.setProperty('--color-tarjeta', 'rgba(250, 250, 250, 0.38)');
  }, []);

  const cargarUsuario = useCallback(async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    try {
      const response = await usuariosService.me();
      const userData = { ...response.data, roles: response.data.roles || [] };
      setUsuario(userData);
      localStorage.setItem('usuario', JSON.stringify(userData));
    } catch (error) {
      if (!error.response || !navigator.onLine) {
        const cache = localStorage.getItem('usuario');
        if (cache) {
          const parsed = JSON.parse(cache);
          setUsuario({ ...parsed, roles: Array.isArray(parsed.roles) ? parsed.roles : [] });
        }
      }
    }
    setVerificandoSesion(false);
  }, []);

  useEffect(() => { cargarUsuario(); }, [cargarUsuario]);

  const manejarCerrarSesion = async () => {
    try { await usuariosService.logout(); } catch { /* continuar aunque falle */ }
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  // Sync offline → online
  useEffect(() => {
    const _sincronizar = async () => {
      setSincronizando(true);
      const { exitosas } = await sincronizarVentas();
      setSincronizando(false);
      if (exitosas > 0) window.dispatchEvent(new Event('ventasSincronizadas'));
    };
    const handleOnline  = () => { setIsOnline(true); _sincronizar(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (navigator.onLine && usuario) _sincronizar();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [usuario]);

  if (verificandoSesion) {
    return (
      <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center text-gray-500 font-medium transition-colors duration-500">
        Cargando aplicación...
      </div>
    );
  }

  const handleLogin = (u) => setUsuario({ ...u, roles: u.roles || [] });

  return (
    <BrowserRouter>
      {errorServidor && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center text-sm font-bold py-2 px-4 shadow-lg">
          El servidor tuvo un problema inesperado. Por favor intenta de nuevo en unos momentos.
        </div>
      )}

        {/* Componentes UI Globales (Sync) */}
        <SyncFeedback />

      {!usuario ? (
        <RutasPublicas onLogin={handleLogin} />
      ) : (
        <RutasAutenticadas
          usuario={usuario}
          isOnline={isOnline}
          sincronizando={sincronizando}
          cerrarSesion={manejarCerrarSesion}
          cargarUsuario={cargarUsuario}
        />
      )}
    </BrowserRouter>
  );
}
