import { useState, useEffect, useCallback, useRef } from 'react';
import { ventasService } from '../../services/ventas';
import { clp, formatFecha } from '../../utils/format';
import { METODOS_PAGO } from '../../constants/metodoPago';
import BadgeDiferencia from './BadgeDiferencia';

export default function TabHistorial() {
  const [turnos, setTurnos]           = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [pagina, setPagina]           = useState(1);
  const [hayMas, setHayMas]           = useState(true);
  const sentinelRef                   = useRef(null);

  const cargarPagina = useCallback(async (pag) => {
    if (pag === 1) setCargando(true);
    else setCargandoMas(true);
    try {
      const res = await ventasService.historialTurnos(pag);
      const { results, next } = res.data;
      setTurnos(prev => pag === 1 ? results : [...prev, ...results]);
      setHayMas(!!next);
      setPagina(pag);
    } catch {
      // error silenciado — no bloquea la UI
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  }, []);

  useEffect(() => { cargarPagina(1); }, [cargarPagina]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hayMas || cargandoMas) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) cargarPagina(pagina + 1); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hayMas, cargandoMas, pagina, cargarPagina]);

  if (cargando) return <div className="p-8 text-center text-gray-400">Cargando historial...</div>;

  if (turnos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-400 font-semibold text-sm">No hay cierres registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Cajero</th>
              <th className="px-4 py-3 text-left">Apertura</th>
              <th className="px-4 py-3 text-left">Cierre</th>
              <th className="px-4 py-3 text-right">Total ventas</th>
              <th className="px-4 py-3 text-left">Por método</th>
              <th className="px-4 py-3 text-right">Efect. esperado</th>
              <th className="px-4 py-3 text-right">Diferencia arqueo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {turnos.map(t => {
              const cierreAjeno = t.cerrado_por_nombre && t.cerrado_por_nombre !== t.cajero_nombre;
              const metodos = t.totales_por_metodo ?? {};
              return (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-black text-gray-700">#{t.folio}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700 font-semibold">{t.cajero_nombre ?? '—'}</span>
                    {cierreAjeno && (
                      <span className="block text-amber-700 font-bold text-xs bg-amber-50 px-1.5 py-0.5 rounded-md mt-0.5 w-fit">
                        cerrado: {t.cerrado_por_nombre}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatFecha(t.fecha_apertura)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatFecha(t.fecha_cierre)}</td>
                  <td className="px-4 py-3 text-right font-black text-gray-800">{clp(t.total_ventas)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {Object.entries(metodos).map(([metodo, total]) => (
                        <span key={metodo} className="text-xs text-gray-500 whitespace-nowrap">
                          {METODOS_PAGO[metodo]?.icon ?? '💰'} {clp(total)}
                        </span>
                      ))}
                      {Object.keys(metodos).length === 0 && (
                        <span className="text-xs text-gray-300">Sin ventas</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 font-semibold">{clp(t.efectivo_esperado)}</td>
                  <td className="px-4 py-3 text-right">
                    <BadgeDiferencia diferencia={t.diferencia_arqueo} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div ref={sentinelRef} className="py-4 text-center">
          {cargandoMas && <span className="text-xs text-gray-400">Cargando más...</span>}
          {!hayMas && turnos.length > 0 && (
            <span className="text-xs text-gray-300">— Fin del historial —</span>
          )}
        </div>
      </div>
    </div>
  );
}
