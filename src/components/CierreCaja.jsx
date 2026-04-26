import { useState, useEffect, useCallback } from 'react';
import { ventasService } from '../services/ventas';

// ── Helpers ───────────────────────────────────────────────────────────────────
function clp(n) {
  if (n === undefined || n === null) return '$0';
  return `$${Number(n).toLocaleString('es-CL')}`;
}

function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const CONCEPTOS = [
  { value: 'cambio',      label: 'Cambio / vuelto adicional' },
  { value: 'proveedor',   label: 'Pago a proveedor' },
  { value: 'traslado',    label: 'Traslado a caja fuerte' },
  { value: 'fondo_extra', label: 'Fondo adicional' },
  { value: 'devolucion',  label: 'Devolución a cliente' },
  { value: 'otro',        label: 'Otro' },
];

const METODO_ICONS = {
  EFECTIVO:      '💵',
  TARJETA:       '💳',
  TRANSFERENCIA: '🏦',
  ANOTADO:       '📝',
};

// ── Semáforo arqueo ───────────────────────────────────────────────────────────
function Semaforo({ diferencia }) {
  const abs = Math.abs(diferencia);
  if (abs === 0)    return <span className="text-green-600 font-black">Sin diferencia</span>;
  if (abs <= 500)   return <span className="text-yellow-600 font-black">{clp(diferencia)} (diferencia menor)</span>;
  return <span className="text-red-600 font-black">{clp(diferencia)} (diferencia significativa)</span>;
}

// ── Modal Confirmar Cierre ────────────────────────────────────────────────────
function ModalCierre({ reporte, turno, onClose, onSuccess }) {
  const [fondoContado, setFondoContado] = useState('');
  const [notas, setNotas]               = useState('');
  const [cerrando, setCerrando]         = useState(false);
  const [error, setError]               = useState('');

  const efectivoEsperado = reporte?.efectivo_esperado ?? 0;
  const contado    = parseInt(fondoContado, 10) || 0;
  const diferencia = contado - efectivoEsperado;
  const hayConteo  = fondoContado !== '';

  const handleCerrar = async () => {
    setCerrando(true);
    setError('');
    try {
      await ventasService.cerrarTurno(turno.id, hayConteo ? contado : efectivoEsperado, notas);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cerrar el turno.');
      setCerrando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-xl font-black text-gray-900 mb-1">Cerrar turno #{turno.folio}</h3>
        <p className="text-sm text-gray-400 mb-5">Confirma el arqueo antes de cerrar.</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Fondo apertura</span>
            <span className="font-bold">{clp(reporte?.fondo_apertura)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ventas en efectivo</span>
            <span className="font-bold text-green-700">+{clp(reporte?.efectivo_ventas)}</span>
          </div>
          {reporte?.total_ingresos_mov > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Ingresos manuales</span>
              <span className="font-bold text-green-700">+{clp(reporte.total_ingresos_mov)}</span>
            </div>
          )}
          {reporte?.total_retiros_mov > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Retiros</span>
              <span className="font-bold text-red-600">−{clp(reporte.total_retiros_mov)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
            <span className="font-bold text-gray-700">Efectivo esperado</span>
            <span className="font-black text-blue-700">{clp(efectivoEsperado)}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Efectivo contado (opcional)
          </label>
          <input
            type="number" min="0"
            value={fondoContado}
            onChange={e => setFondoContado(e.target.value)}
            placeholder={String(efectivoEsperado)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
            autoFocus
          />
          {hayConteo && (
            <p className="text-xs mt-1.5">
              Diferencia: <Semaforo diferencia={diferencia} />
            </p>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Notas del cierre (opcional)
          </label>
          <textarea
            rows={2}
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Observaciones del turno..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600 font-semibold mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 rounded-full font-bold text-gray-700 hover:bg-gray-200 transition-all text-sm">
            Volver
          </button>
          <button onClick={handleCerrar} disabled={cerrando}
            className="flex-1 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-700 transition-all text-sm active:scale-95 disabled:opacity-50">
            {cerrando ? 'Cerrando...' : 'Cerrar turno'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vista sin turno ───────────────────────────────────────────────────────────
function SinTurno({ onTurnoAbierto }) {
  const [fondo, setFondo]       = useState('');
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError]       = useState('');

  const handleAbrir = async (e) => {
    e.preventDefault();
    const monto = parseInt(fondo, 10) || 0;
    if (monto < 0) { setError('El fondo no puede ser negativo.'); return; }
    setAbriendo(true);
    setError('');
    try {
      const res = await ventasService.abrirTurno(monto);
      onTurnoAbierto(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al abrir el turno.');
      setAbriendo(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-[var(--color-tarjeta)] border border-white/60 rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-1">Sin turno activo</h2>
        <p className="text-sm text-gray-400 mb-6">Abre un turno para comenzar a registrar ventas y movimientos.</p>

        <form onSubmit={handleAbrir} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Fondo inicial (CLP)
            </label>
            <input
              type="number" min="0"
              value={fondo}
              onChange={e => setFondo(e.target.value)}
              placeholder="Ej: 50000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white text-center text-lg font-black"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-red-600 font-semibold text-center">{error}</p>}

          <button type="submit" disabled={abriendo}
            className="w-full py-3 bg-gray-900 hover:bg-gray-700 text-white font-black rounded-full transition-all active:scale-95 disabled:opacity-50">
            {abriendo ? 'Abriendo...' : 'Abrir turno'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Tarjeta KPI ───────────────────────────────────────────────────────────────
function KPICard({ label, valor, color, sub }) {
  const colores = {
    yellow: 'bg-yellow-50/80 border-yellow-100 text-yellow-900 text-yellow-600',
    green:  'bg-green-50/80 border-green-100 text-green-900 text-green-600',
    red:    'bg-red-50/80 border-red-100 text-red-900 text-red-600',
    blue:   'bg-blue-50/80 border-blue-100 text-blue-900 text-blue-600',
    purple: 'bg-purple-50/80 border-purple-100 text-purple-900 text-purple-600',
  };
  const [bg, , txt, lbl] = colores[color]?.split(' ') ?? ['bg-gray-50/80', '', 'text-gray-900', 'text-gray-600'];
  return (
    <div className={`${bg} border rounded-2xl p-5 flex flex-col justify-between shadow-inner`} style={{ borderColor: undefined }}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${lbl ?? 'text-gray-500'}`}>{label}</p>
      <p className={`text-3xl font-black ${txt}`}>{valor}</p>
      {sub && <p className={`text-xs mt-2 font-medium ${lbl ?? 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
}

// ── Tab: Turno (KPIs + desglose + cerrar) ─────────────────────────────────────
function TabTurno({ turno, reporte, onSolicitarCierre }) {
  return (
    <div id="reporte-imprimible" className="space-y-6">
      {/* Encabezado del turno */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wide">Turno abierto</span>
            <span className="text-xs text-gray-400 font-semibold">#{turno.folio}</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {turno.cajero_nombre && <span>{turno.cajero_nombre} · </span>}
            Apertura: {formatFecha(turno.fecha_apertura)}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full hover:bg-gray-50 transition-all flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            onClick={onSolicitarCierre}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold rounded-full transition-all active:scale-95">
            Cerrar turno →
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard color="yellow" label="Fondo apertura"    valor={clp(reporte?.fondo_apertura)}    sub="Efectivo inicial" />
        <KPICard color="green"  label="Ventas totales"    valor={clp(reporte?.total_ventas)}       sub={`${reporte?.cantidad_transacciones ?? 0} transacciones`} />
        <KPICard color="green"  label="Efectivo ventas"   valor={clp(reporte?.efectivo_ventas)}    sub="Solo pagos en efectivo" />
        <KPICard color="blue"   label="Efectivo esperado" valor={clp(reporte?.efectivo_esperado)}  sub="Fondo + efectivo + movimientos" />
      </div>

      {(reporte?.total_ingresos_mov > 0 || reporte?.total_retiros_mov > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <KPICard color="green"  label="Ingresos manuales" valor={clp(reporte?.total_ingresos_mov)} sub="Entradas no relacionadas a ventas" />
          <KPICard color="red"    label="Retiros"            valor={clp(reporte?.total_retiros_mov)}  sub="Salidas de efectivo del turno" />
        </div>
      )}

      {/* Desglose por método de pago */}
      {reporte?.desglose?.length > 0 && (
        <div>
          <h3 className="text-base font-black text-gray-800 mb-3">Desglose por método de pago</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reporte.desglose.map(item => (
              <div key={item.metodo_pago}
                className="flex justify-between items-center p-4 bg-white/70 rounded-xl border border-white/80 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{METODO_ICONS[item.metodo_pago] ?? '💰'}</span>
                  <span className="font-bold text-gray-700 text-sm capitalize">
                    {item.metodo_pago.toLowerCase()}
                  </span>
                </div>
                <span className="text-xl font-black text-gray-900">{clp(item.total_metodo)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reporte?.desglose?.length === 0 && (
        <div className="bg-gray-50 p-5 rounded-xl text-center text-gray-400 font-medium text-sm">
          No hay ventas registradas en este turno todavía.
        </div>
      )}
    </div>
  );
}

// ── Historial de cierres ──────────────────────────────────────────────────────
function TabHistorial() {
  const [turnos, setTurnos]     = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    ventasService.historialTurnos()
      .then(res => setTurnos(res.data.filter(t => t.estado === 'cerrado')))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

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
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Folio</th>
            <th className="px-4 py-3 text-left">Cajero</th>
            <th className="px-4 py-3 text-left">Apertura</th>
            <th className="px-4 py-3 text-left">Cierre</th>
            <th className="px-4 py-3 text-right">Fondo apertura</th>
            <th className="px-4 py-3 text-right">Fondo cierre</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {turnos.map(t => {
            const diferencia = t.fondo_cierre != null
              ? parseInt(t.fondo_cierre) - parseInt(t.fondo_apertura)
              : null;
            return (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-black text-gray-700">#{t.folio}</td>
                <td className="px-4 py-3 text-gray-600">{t.cajero_nombre ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatFecha(t.fecha_apertura)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatFecha(t.fecha_cierre)}</td>
                <td className="px-4 py-3 text-right font-semibold">{clp(t.fondo_apertura)}</td>
                <td className="px-4 py-3 text-right">
                  {t.fondo_cierre != null ? (
                    <span className={`font-black ${diferencia === 0 ? 'text-green-600' : Math.abs(diferencia) <= 500 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {clp(t.fondo_cierre)}
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
const TABS = [
  { id: 'turno',       label: 'Turno' },
  { id: 'historial',   label: 'Historial' },
];

export default function CierreCaja() {
  const [cargando, setCargando]       = useState(true);
  const [turno, setTurno]             = useState(null);
  const [reporte, setReporte]         = useState(null);
  const [tabActiva, setTabActiva]     = useState('turno');
  const [modalCierre, setModalCierre] = useState(false);

  const cargarEstado = useCallback(async () => {
    setCargando(true);
    try {
      const [resTurno, resReporte] = await Promise.all([
        ventasService.turnoActivo(),
        ventasService.reporteZ(),
      ]);
      setTurno(resTurno.data);
      setReporte(resReporte.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setTurno(null);
        try {
          const resReporte = await ventasService.reporteZ();
          setReporte(resReporte.data);
        } catch { /* sin reporte previo, ok */ }
      } else {
        setTurno(null);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarEstado(); }, [cargarEstado]);

  const handleTurnoAbierto = () => {
    cargarEstado();
    setTabActiva('turno');
  };

  const handleCierreConfirmado = () => {
    setModalCierre(false);
    setTurno(null);
    setReporte(null);
    cargarEstado();
    setTabActiva('turno');
  };

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse" />
        <div className="h-10 bg-gray-100 rounded-2xl w-72 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const hayTurno = !!turno;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto min-h-full bg-[var(--color-fondo)] transition-colors duration-500">

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Apertura y Cierre de Caja</h1>
        {reporte?.fecha && (
          <p className="text-gray-400 text-sm font-medium mt-0.5">
            {reporte.fecha}{reporte.cajero ? ` · ${reporte.cajero}` : ''}
          </p>
        )}
      </div>

      {/* Sin turno activo: mostrar pantalla de apertura directamente */}
      {!hayTurno ? (
        <SinTurno onTurnoAbierto={handleTurnoAbierto} />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  tabActiva === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido del tab */}
          <div className="bg-[var(--color-tarjeta)] backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-5 sm:p-7">
            {tabActiva === 'turno' && (
              <TabTurno
                turno={turno}
                reporte={reporte}
                onSolicitarCierre={() => setModalCierre(true)}
              />
            )}

            {tabActiva === 'historial' && (
              <TabHistorial />
            )}
          </div>
        </>
      )}

      {/* Modal cierre */}
      {modalCierre && turno && (
        <ModalCierre
          turno={turno}
          reporte={reporte}
          onClose={() => setModalCierre(false)}
          onSuccess={handleCierreConfirmado}
        />
      )}

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body > *:not(#root) { display: none; }
          nav, header, button, .no-print { display: none !important; }
          #reporte-imprimible {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #000;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
