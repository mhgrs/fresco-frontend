import { useCallback, useEffect, useRef, useState } from 'react';
import { ventasService } from '../../services/ventas';
import { formatCLP, fmtFecha, fmtHora } from '../../utils/format';
import { METODOS_PAGO } from '../../constants/metodoPago';
import BadgeDiferencia from './BadgeDiferencia';
import TicketCierre from './TicketCierre';

function IconoPrint() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

export default function TabHistorial() {
  const [turnos, setTurnos]                   = useState([]);
  const [cargando, setCargando]               = useState(true);
  const [cargandoMas, setCargandoMas]         = useState(false);
  const [pagina, setPagina]                   = useState(1);
  const [hayMas, setHayMas]                   = useState(true);
  const [turnoParaImprimir, setTurnoParaImprimir] = useState(null);
  const sentinelRef                           = useRef(null);
  const ticketRef                             = useRef(null);

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

  const handleImprimir = (turno) => {
    setTurnoParaImprimir(turno);
    setTimeout(() => {
      if (ticketRef.current) ticketRef.current.style.display = 'block';
      window.print();
      if (ticketRef.current) ticketRef.current.style.display = 'none';
    }, 80);
  };

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
    <>
      <TicketCierre turno={turnoParaImprimir} ref={ticketRef} />

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-2 py-3 text-left">#</th>
                <th className="px-2 py-3 text-left">Cajero</th>
                <th className="px-2 py-3 text-left">Apertura</th>
                <th className="px-2 py-3 text-left">Cierre</th>
                <th className="px-2 py-3 text-right">Total ventas</th>
                <th className="px-2 py-3 text-left">Por método</th>
                <th className="px-2 py-3 text-right">Efect. esperado</th>
                <th className="px-2 py-3 text-right whitespace-nowrap">Dif. arqueo</th>
                <th className="px-2 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {turnos.map(t => {
                const cierreAjeno = t.cerrado_por_nombre && t.cerrado_por_nombre !== t.cajero_nombre;
                const metodos = t.totales_por_metodo ?? {};
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-3 font-black text-gray-700">#{t.folio}</td>
                    <td className="px-2 py-3">
                      <span className="text-gray-700 font-semibold">{t.cajero_nombre ?? '—'}</span>
                      {cierreAjeno && (
                        <span className="block text-amber-700 font-bold text-xs bg-amber-50 px-1.5 py-0.5 rounded-md mt-0.5 w-fit">
                          cerrado: {t.cerrado_por_nombre}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <span className="block text-xs text-gray-400">{fmtFecha(t.fecha_apertura)}</span>
                      <span className="block text-xs font-semibold text-gray-700">{fmtHora(t.fecha_apertura)}</span>
                    </td>
                    <td className="px-2 py-3">
                      {t.fecha_cierre ? (
                        <>
                          <span className="block text-xs text-gray-400">{fmtFecha(t.fecha_cierre)}</span>
                          <span className="block text-xs font-semibold text-gray-700">{fmtHora(t.fecha_cierre)}</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-right font-black text-gray-800">{formatCLP(t.total_ventas)}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-col gap-0.5">
                        {Object.entries(metodos).map(([metodo, total]) => (
                          <span key={metodo} className="text-xs text-gray-500 whitespace-nowrap">
                            {METODOS_PAGO[metodo]?.icon ?? '💰'} {formatCLP(total)}
                          </span>
                        ))}
                        {Object.keys(metodos).length === 0 && (
                          <span className="text-xs text-gray-300">Sin ventas</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right text-gray-600 font-semibold">{formatCLP(t.efectivo_esperado)}</td>
                    <td className="px-2 py-3 text-right">
                      <BadgeDiferencia diferencia={t.diferencia_arqueo} />
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        onClick={() => handleImprimir(t)}
                        title="Reimprimir cierre"
                        className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      >
                        <IconoPrint />
                      </button>
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
    </>
  );
}
