import { useState, useEffect, useCallback } from 'react';
import { ventasService } from '../services/ventas';
import { productosService } from '../services/productos';
import { hoy } from './actividad/utils';
import DetalleModal from './actividad/DetalleModal';
import { DetalleVenta, DetalleTurno, DetalleMovCaja, DetalleMovInv } from './actividad/detalles';
import TabVentas from './actividad/TabVentas';
import TabTurnos from './actividad/TabTurnos';
import TabMovCaja from './actividad/TabMovCaja';
import TabMovInv from './actividad/TabMovInv';
import { fmtHora } from '../utils/format';

function Skeleton() {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

const META_INIT = { page: 1, total: 0, hasMore: false };

function parsePaged(response) {
  const data = response.data;
  if (data && typeof data === 'object' && 'results' in data) {
    return { items: data.results ?? [], total: data.count ?? 0, hasMore: !!data.next };
  }
  const items = data ?? [];
  return { items, total: items.length, hasMore: false };
}

export default function ActividadNegocio() {
  const [fechaDesde, setFechaDesde] = useState(hoy());
  const [fechaHasta, setFechaHasta] = useState(hoy());
  const [tabActiva, setTabActiva]   = useState('ventas');
  const [cargando, setCargando]     = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [detalle, setDetalle]       = useState(null);
  const [errorFecha, setErrorFecha] = useState('');

  const [ventas,  setVentas]  = useState([]);
  const [turnos,  setTurnos]  = useState([]);
  const [movCaja, setMovCaja] = useState([]);
  const [movInv,  setMovInv]  = useState([]);

  const [ventasMeta,  setVentasMeta]  = useState(META_INIT);
  const [turnosMeta,  setTurnosMeta]  = useState(META_INIT);
  const [movCajaMeta, setMovCajaMeta] = useState(META_INIT);

  const buscar = useCallback(async () => {
    if (fechaDesde > fechaHasta) {
      setErrorFecha('La fecha "Desde" no puede ser posterior a "Hasta".');
      return;
    }
    setErrorFecha('');
    setCargando(true);
    const params = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
    const [r1, r2, r3, r4] = await Promise.allSettled([
      ventasService.listarHistorial(params),
      ventasService.listarTurnos(params),
      ventasService.listarMovimientosCaja(params),
      productosService.listarMovimientos(params),
    ]);
    if (r1.status === 'fulfilled') {
      const { items, total, hasMore } = parsePaged(r1.value);
      setVentas(items); setVentasMeta({ page: 1, total, hasMore });
    }
    if (r2.status === 'fulfilled') {
      const { items, total, hasMore } = parsePaged(r2.value);
      setTurnos(items); setTurnosMeta({ page: 1, total, hasMore });
    }
    if (r3.status === 'fulfilled') {
      const { items, total, hasMore } = parsePaged(r3.value);
      setMovCaja(items); setMovCajaMeta({ page: 1, total, hasMore });
    }
    if (r4.status === 'fulfilled') setMovInv(r4.value.data ?? []);
    setCargando(false);
  }, [fechaDesde, fechaHasta]);

  const cargarMas = useCallback(async () => {
    setCargandoMas(true);
    const params = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
    try {
      if (tabActiva === 'ventas' && ventasMeta.hasMore) {
        const nextPage = ventasMeta.page + 1;
        const res = await ventasService.listarHistorial({ ...params, page: nextPage });
        const { items, total, hasMore } = parsePaged(res);
        setVentas(prev => [...prev, ...items]);
        setVentasMeta({ page: nextPage, total, hasMore });
      } else if (tabActiva === 'turnos' && turnosMeta.hasMore) {
        const nextPage = turnosMeta.page + 1;
        const res = await ventasService.listarTurnos({ ...params, page: nextPage });
        const { items, total, hasMore } = parsePaged(res);
        setTurnos(prev => [...prev, ...items]);
        setTurnosMeta({ page: nextPage, total, hasMore });
      } else if (tabActiva === 'movcaja' && movCajaMeta.hasMore) {
        const nextPage = movCajaMeta.page + 1;
        const res = await ventasService.listarMovimientosCaja({ ...params, page: nextPage });
        const { items, total, hasMore } = parsePaged(res);
        setMovCaja(prev => [...prev, ...items]);
        setMovCajaMeta({ page: nextPage, total, hasMore });
      }
    } finally {
      setCargandoMas(false);
    }
  }, [tabActiva, fechaDesde, fechaHasta, ventasMeta, turnosMeta, movCajaMeta]);

  useEffect(() => { buscar(); }, []);

  useEffect(() => {
    if (!detalle || detalle.tipo !== 'turno' || !detalle.cargando) return;
    ventasService.obtenerTurno(detalle.id)
      .then(res => setDetalle(prev => ({
        ...prev, cargando: false,
        contenido: <DetalleTurno turno={res.data} />,
      })))
      .catch(() => setDetalle(null));
  }, [detalle]);

  const abrirVenta   = (v) => setDetalle({ tipo: 'venta',   titulo: `Venta — ${fmtHora(v.fecha)}`,                  cargando: false, contenido: <DetalleVenta venta={v} /> });
  const abrirTurno   = (t) => setDetalle({ tipo: 'turno',   titulo: `Turno #${t.folio} — ${t.cajero_nombre || ''}`, id: t.id, cargando: true, contenido: null });
  const abrirMovCaja = (m) => setDetalle({ tipo: 'movcaja', titulo: `Movimiento de Caja — Turno #${m.turno_folio}`, cargando: false, contenido: <DetalleMovCaja mov={m} /> });
  const abrirMovInv  = (m) => setDetalle({ tipo: 'movinv',  titulo: `Movimiento de Inventario`,                     cargando: false, contenido: <DetalleMovInv mov={m} /> });

  const TABS = [
    { key: 'ventas',  label: 'Ventas',             count: ventas.length,   total: ventasMeta.total,  hasMore: ventasMeta.hasMore },
    { key: 'turnos',  label: 'Turnos de Caja',     count: turnos.length,   total: turnosMeta.total,  hasMore: turnosMeta.hasMore },
    { key: 'movcaja', label: 'Mov. de Caja',       count: movCaja.length,  total: movCajaMeta.total, hasMore: movCajaMeta.hasMore },
    { key: 'movinv',  label: 'Mov. de Inventario', count: movInv.length,   total: movInv.length,     hasMore: false },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)] transition-colors duration-500">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.anim-fade{animation:fadeIn 0.3s ease-out forwards}`}</style>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">Actividad del Negocio</h1>
        <p className="text-gray-500 mt-1 font-medium">Monitorea ventas, caja e inventario en un solo lugar.</p>
      </div>

      <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-sm p-4 sm:p-5 mb-5 flex flex-col sm:flex-row gap-3 items-end flex-shrink-0">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Desde</label>
          <input type="date" value={fechaDesde} max={fechaHasta}
            onChange={e => setFechaDesde(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold focus:ring-2 focus:ring-[#91cf5b] outline-none transition" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hasta</label>
          <input type="date" value={fechaHasta} min={fechaDesde} max={hoy()}
            onChange={e => setFechaHasta(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold focus:ring-2 focus:ring-[#91cf5b] outline-none transition" />
        </div>
        <button onClick={buscar} disabled={cargando}
          className="px-6 py-3 bg-[#91cf5b] hover:bg-[#7ab848] text-white font-black rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap">
          {cargando ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {errorFecha && (
        <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
          {errorFecha}
        </p>
      )}

      <div className="flex gap-1 bg-gray-200/60 p-1 rounded-2xl mb-5 overflow-x-auto flex-shrink-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTabActiva(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${tabActiva === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
            {!cargando && (
              <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${tabActiva === t.key ? 'bg-[#91cf5b] text-white' : 'bg-gray-300 text-gray-600'}`}>
                {t.hasMore ? `${t.count} / ${t.total}` : t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-sm overflow-hidden anim-fade flex flex-col">
        {cargando ? <Skeleton /> : (
          <>
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
              {tabActiva === 'ventas'  && <TabVentas  ventas={ventas}   onRowClick={abrirVenta} />}
              {tabActiva === 'turnos'  && <TabTurnos  turnos={turnos}   onRowClick={abrirTurno} />}
              {tabActiva === 'movcaja' && <TabMovCaja movCaja={movCaja} onRowClick={abrirMovCaja} />}
              {tabActiva === 'movinv'  && <TabMovInv  movInv={movInv}   onRowClick={abrirMovInv} />}
            </div>

            {TABS.find(t => t.key === tabActiva)?.hasMore && (
              <div className="flex-none border-t border-gray-100 px-6 py-3 flex items-center justify-between bg-white/60">
                <span className="text-xs text-gray-400 font-medium">
                  Mostrando {TABS.find(t => t.key === tabActiva)?.count} de {TABS.find(t => t.key === tabActiva)?.total} resultados
                </span>
                <button
                  onClick={cargarMas}
                  disabled={cargandoMas}
                  className="px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {cargandoMas ? 'Cargando…' : 'Cargar más'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <DetalleModal detalle={detalle} onClose={() => setDetalle(null)} />
    </div>
  );
}
