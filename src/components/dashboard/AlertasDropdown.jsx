import { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';

function formatEdadCache(ms) {
  if (!ms) return null;
  const min = Math.round(ms / 60000);
  if (min < 1) return 'hace menos de 1 min';
  if (min === 1) return 'hace 1 min';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  return `hace ${h}h`;
}

export default function AlertasDropdown({ alertas, cacheMs = null }) {
  const [mostrar, setMostrar] = useState(false);
  const ref = useRef(null);
  const cerrar = useCallback(() => setMostrar(false), []);
  useClickOutside(ref, cerrar);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setMostrar(prev => !prev)}
        className={`relative p-3 rounded-full backdrop-blur-md border shadow-sm transition-all ${mostrar ? 'bg-white border-gray-200 text-[#91cf5b]' : 'bg-[var(--color-tarjeta)] border-white/60 text-gray-600 hover:bg-white hover:text-[#91cf5b]'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {alertas.length > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow border-2 border-white">
            {alertas.length}
          </span>
        )}
      </button>

      {mostrar && (
        <div className="absolute right-0 mt-3 w-[70vw] sm:w-80 max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform origin-top-right transition-all z-50">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800 text-sm">Alertas Recientes</span>
              {alertas.length > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                  {alertas.length} Novedades
                </span>
              )}
            </div>
            {cacheMs !== null && (
              <p className="text-[10px] text-amber-600 font-semibold mt-1">
                Sin conexión · Actualizado {formatEdadCache(cacheMs)}
              </p>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {alertas.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm font-medium">
                Todo está bajo control. No hay alertas de stock. 🎉
              </div>
            ) : (
              alertas.slice(0, 4).map(alerta => (
                <div key={alerta.id} className="p-4 border-b border-gray-50 hover:bg-red-50/50 transition-colors flex justify-between items-center group">
                  <div className="pr-4">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{alerta.nombre}</p>
                    <p className="text-xs text-red-500 font-medium mt-0.5">
                      Stock actual: {alerta.tipo_venta === 'UNIDAD' ? Math.round(alerta.stock) : Number(alerta.stock).toFixed(2)}
                    </p>
                  </div>
                  <span className="w-2 h-2 bg-red-500 rounded-full group-hover:scale-150 transition-transform"></span>
                </div>
              ))
            )}
          </div>
          {alertas.length > 0 && (
            <Link
              to="/alertas"
              className="block p-3 text-center text-sm font-bold text-[#91cf5b] hover:bg-[#91cf5b] hover:text-white transition-colors"
              onClick={() => setMostrar(false)}
            >
              Ver todas las alertas →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
