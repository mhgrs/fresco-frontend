import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { usuariosService } from './services/usuarios';
import { sincronizarVentas } from './utils/syncVentas';
import { logInfo } from './utils/logger';
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
    try { await usuariosService.logout(); } catch (err) { logInfo('App.logout', err); }
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  // Ref para que los efectos de abajo siempre invoquen la versión más reciente
  // de sincronizar sin necesitar re-registrar los listeners.
  const sincronizarRef = useRef(null);
  const sincronizar = useCallback(async () => {
    const cola = JSON.parse(localStorage.getItem('ventas_offline') || '[]');
    if (cola.length === 0) return;           // nada que enviar
    setSincronizando(true);
    await sincronizarVentas();               // ventasSincronizadas se despacha internamente
    setSincronizando(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  sincronizarRef.current = sincronizar;

  // Sync: evento online (corte de red) + visibilitychange (volver a la pestaña)
  useEffect(() => {
    const run = () => sincronizarRef.current?.();
    const handleOnline   = () => { setIsOnline(true); run(); };
    const handleOffline  = () => setIsOnline(false);
    // visibilitychange cubre el caso donde la red nunca cayó pero el backend
    // estuvo caído; al volver a la pestaña se intenta de nuevo.
    const handleVisible  = () => { if (document.visibilityState === 'visible') run(); };

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisible);
    if (navigator.onLine && usuario) run();

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [usuario]);

  // Reintento periódico cada 60 s mientras hay ventas en cola.
  // Cubre caídas del backend donde navigator.onLine nunca cambia (ej. deploy de Render).
  useEffect(() => {
    if (!usuario) return;
    const id = setInterval(() => sincronizarRef.current?.(), 60_000);
    return () => clearInterval(id);
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
