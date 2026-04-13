import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BotonVolver from './BotonVolver';

/**
 * Layout de módulo: header con nombre de empresa + botón volver al dashboard.
 *
 * Props:
 *   children
 *   usuario
 *   isOnline     — boolean (default true)
 *   sincronizando — boolean (default false)
 */
export default function ModuleLayout({ children, isOnline = true, sincronizando = false, usuario, fallback = '/dashboard' }) {
  useEffect(() => {
    document.title = "Fresco";
  }, []);

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const fechaCapitalizada = fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-fondo)] transition-colors duration-500 font-sans">
      <header className="px-4 sm:px-6 py-4 lg:px-8 flex-none z-20">
        <div className="max-w-[1400px] mx-auto flex flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <BotonVolver title="Volver" fallback={fallback} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
              <Link to="/dashboard" title="Ir al Inicio" className="hover:opacity-80 transition-opacity">
                <h1 className="text-2xl md:text-3xl font-black text-[#91cf5b] tracking-tight">Fresco</h1>
              </Link>
              {sincronizando && (
                <span className="text-[10px] sm:text-xs bg-blue-500 text-white px-2 py-1 rounded-full animate-pulse font-bold tracking-wider uppercase shadow-sm">
                  Sincronizando...
                </span>
              )}
              {!isOnline && (
                <span className="text-[10px] sm:text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold tracking-wider uppercase shadow-sm">
                  Offline
                </span>
              )}
              </div>
              <p className="text-gray-500 text-xs md:text-sm font-medium truncate">{fechaCapitalizada}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1 sm:mt-0 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center bg-[var(--color-tarjeta)] backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/60">
              <span className="text-sm font-bold text-gray-700">{usuario?.empresa_nombre || 'Mi Empresa'}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
