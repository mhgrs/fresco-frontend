import React, { useState, useEffect, useCallback } from 'react';
import { ventasService } from '../services/ventas';
import { productosService } from '../services/productos';

const formatCLP = (v) =>
  `$${new Intl.NumberFormat('es-CL').format(Math.round(Number(v) || 0))}`;

function hoy() { return new Date().toISOString().slice(0, 10); }

function fmtFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CL');
}
function fmtHora(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}
function fmtFechaHora(iso) {
  return `${fmtFecha(iso)} ${fmtHora(iso)}`;
}

const METODOS_PAGO = {
  EFECTIVO:      { label: 'Efectivo',      cls: 'bg-green-100 text-green-700' },
  TARJETA:       { label: 'Tarjeta',       cls: 'bg-blue-100 text-blue-700' },
  TRANSFERENCIA: { label: 'Transferencia', cls: 'bg-purple-100 text-purple-700' },
  ANOTADO:       { label: 'Anotado',       cls: 'bg-orange-100 text-orange-700' },
};

const TIPO_MOV = {
  ingreso: { label: 'Ingreso', cls: 'bg-green-100 text-green-700' },
  retiro:  { label: 'Retiro',  cls: 'bg-red-100 text-red-600' },
  INGRESO: { label: 'Ingreso', cls: 'bg-green-100 text-green-700' },
  RETIRO:  { label: 'Retiro',  cls: 'bg-red-100 text-red-600' },
};

// ── Filas vacías ──────────────────────────────────────────────────────────────

function FilaVacia({ msg }) {
  return (
    <tr>
      <td colSpan={10} className="py-16 text-center text-gray-400 font-medium">
        {msg}
      </td>
    </tr>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

// ── Modal detalle ─────────────────────────────────────────────────────────────

function DetalleModal({ detalle, onClose }) {
  if (!detalle) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-black text-gray-800">{detalle.titulo}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-4">
          {detalle.cargando ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            detalle.contenido
          )}
        </div>
      </div>
    </div>
  );
}

// ── Contenido de detalle por tipo ─────────────────────────────────────────────

function DetalleVenta({ venta }) {
  const metodo = METODOS_PAGO[venta.metodo_pago] || { label: venta.metodo_pago, cls: 'bg-gray-100 text-gray-600' };
  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap items-center">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${metodo.cls}`}>{metodo.label}</span>
        <span className="text-xs font-bold text-gray-400">{fmtFechaHora(venta.fecha)}</span>
        {venta.cajero_nombre && (
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
            {venta.cajero_nombre}
          </span>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {venta.detalles?.map((d, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-semibold text-gray-800">{d.producto_nombre}</p>
              <p className="text-xs text-gray-400 font-mono">{d.producto_sku}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-xs text-gray-400">
                {parseFloat(d.cantidad) % 1 === 0 ? parseFloat(d.cantidad) : parseFloat(d.cantidad).toFixed(3)} × {formatCLP(d.precio_unitario)}
              </p>
              <p className="text-sm font-black text-gray-700">{formatCLP(d.subtotal)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-200">
        <span className="font-bold text-gray-600">Total</span>
        <span className="text-lg font-black text-gray-800">{formatCLP(venta.total)}</span>
      </div>
    </div>
  );
}

function DetalleTurno({ turno }) {
  const abierto = turno.estado === 'abierto';
  return (
    <div className="space-y-4">
      {/* Cabecera turno */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Cajero</span>
          <span className="font-bold text-gray-800">{turno.cajero_nombre || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Apertura</span>
          <span className="font-bold text-gray-800">{fmtFechaHora(turno.fecha_apertura)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Cierre</span>
          <span className={`font-bold ${abierto ? 'text-green-600' : 'text-gray-800'}`}>
            {abierto ? 'Turno activo' : fmtFechaHora(turno.fecha_cierre)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Fondo apertura</span>
          <span className="font-bold text-gray-800">{formatCLP(turno.fondo_apertura)}</span>
        </div>
        {turno.fondo_cierre != null && (
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Fondo cierre</span>
            <span className="font-bold text-gray-800">{formatCLP(turno.fondo_cierre)}</span>
          </div>
        )}
        {turno.notas && (
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Notas</span>
            <span className="font-semibold text-gray-700 text-right max-w-[60%]">{turno.notas}</span>
          </div>
        )}
      </div>

      {/* Movimientos del turno */}
      {turno.movimientos?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Movimientos de caja</p>
          <div className="divide-y divide-gray-100">
            {turno.movimientos.map((m, i) => {
              const cfg = TIPO_MOV[m.tipo] || { label: m.tipo, cls: 'bg-gray-100 text-gray-600' };
              return (
                <div key={i} className="flex items-start justify-between py-2.5 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.cls}`}>{cfg.label}</span>
                      <span className="text-xs text-gray-500">{m.concepto_display}</span>
                    </div>
                    {m.descripcion && <p className="text-xs text-gray-400 mt-0.5 truncate">{m.descripcion}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{m.registrado_por_nombre} · {fmtHora(m.fecha)}</p>
                  </div>
                  <span className="font-black text-gray-800 flex-shrink-0">{formatCLP(m.monto)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {turno.movimientos?.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Sin movimientos de caja en este turno.</p>
      )}
    </div>
  );
}

function DetalleMovCaja({ mov }) {
  const cfg = TIPO_MOV[mov.tipo] || { label: mov.tipo, cls: 'bg-gray-100 text-gray-600' };
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Tipo</span>
        <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${cfg.cls}`}>{cfg.label}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Concepto</span>
        <span className="font-bold text-gray-800">{mov.concepto_display}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Monto</span>
        <span className="font-black text-gray-800 text-base">{formatCLP(mov.monto)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Registrado por</span>
        <span className="font-bold text-gray-800">{mov.registrado_por_nombre || '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Fecha y hora</span>
        <span className="font-bold text-gray-800">{fmtFechaHora(mov.fecha)}</span>
      </div>
      {mov.turno_folio && (
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Turno</span>
          <span className="font-bold text-gray-800">#{mov.turno_folio}</span>
        </div>
      )}
      {mov.descripcion && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-gray-500 font-medium mb-1">Descripción</p>
          <p className="text-gray-700 font-semibold">{mov.descripcion}</p>
        </div>
      )}
    </div>
  );
}

function DetalleMovInv({ mov }) {
  const cfg = TIPO_MOV[mov.tipo] || { label: mov.tipo, cls: 'bg-gray-100 text-gray-600' };
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Producto</span>
        <div className="text-right">
          <p className="font-bold text-gray-800">{mov.producto_nombre}</p>
          <p className="text-xs text-gray-400 font-mono">{mov.producto_sku}</p>
        </div>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Tipo</span>
        <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${cfg.cls}`}>{cfg.label}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Cantidad</span>
        <span className="font-black text-gray-800">
          {mov.tipo === 'RETIRO' || mov.tipo === 'retiro' ? '−' : '+'}
          {parseFloat(mov.cantidad) % 1 === 0 ? parseFloat(mov.cantidad) : parseFloat(mov.cantidad).toFixed(3)}
          {mov.producto_tipo_venta === 'GRANEL' ? ' kg' : ' und.'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Realizado por</span>
        <span className="font-bold text-gray-800">{mov.usuario || '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Fecha y hora</span>
        <span className="font-bold text-gray-800">{mov.fecha}</span>
      </div>
      {mov.motivo && (
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Motivo</span>
          <span className="font-bold text-gray-800 capitalize">{mov.motivo.toLowerCase()}</span>
        </div>
      )}
      {mov.descripcion && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-gray-500 font-medium mb-1">Descripción</p>
          <p className="text-gray-700 font-semibold">{mov.descripcion}</p>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ActividadNegocio() {
  const [fechaDesde, setFechaDesde] = useState(hoy());
  const [fechaHasta, setFechaHasta] = useState(hoy());
  const [tabActiva, setTabActiva]   = useState('ventas');
  const [cargando, setCargando]     = useState(true);
  const [detalle, setDetalle]       = useState(null);

  const [ventas,    setVentas]    = useState([]);
  const [turnos,    setTurnos]    = useState([]);
  const [movCaja,   setMovCaja]   = useState([]);
  const [movInv,    setMovInv]    = useState([]);

  const buscar = useCallback(async () => {
    setCargando(true);
    const params = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
    const [r1, r2, r3, r4] = await Promise.allSettled([
      ventasService.listarHistorial(params),
      ventasService.listarTurnos(params),
      ventasService.listarMovimientosCaja(params),
      productosService.listarMovimientos(params),
    ]);
    if (r1.status === 'fulfilled') setVentas(r1.value.data?.results ?? r1.value.data ?? []);
    if (r2.status === 'fulfilled') setTurnos(r2.value.data?.results ?? r2.value.data ?? []);
    if (r3.status === 'fulfilled') setMovCaja(r3.value.data?.results ?? r3.value.data ?? []);
    if (r4.status === 'fulfilled') setMovInv(r4.value.data ?? []);
    setCargando(false);
  }, [fechaDesde, fechaHasta]);

  useEffect(() => { buscar(); }, []);

  // Fetch turno detalle al hacer click
  useEffect(() => {
    if (!detalle || detalle.tipo !== 'turno' || !detalle.cargando) return;
    ventasService.obtenerTurno(detalle.id)
      .then(res => setDetalle(prev => ({
        ...prev, cargando: false,
        contenido: <DetalleTurno turno={res.data} />,
      })))
      .catch(() => setDetalle(null));
  }, [detalle]);

  const abrirVenta = (v) => setDetalle({
    tipo: 'venta', titulo: `Venta — ${fmtHora(v.fecha)}`,
    cargando: false, contenido: <DetalleVenta venta={v} />,
  });

  const abrirTurno = (t) => setDetalle({
    tipo: 'turno', titulo: `Turno #${t.folio} — ${t.cajero_nombre || ''}`,
    id: t.id, cargando: true, contenido: null,
  });

  const abrirMovCaja = (m) => setDetalle({
    tipo: 'movcaja', titulo: `Movimiento de Caja — Turno #${m.turno_folio}`,
    cargando: false, contenido: <DetalleMovCaja mov={m} />,
  });

  const abrirMovInv = (m) => setDetalle({
    tipo: 'movinv', titulo: `Movimiento de Inventario`,
    cargando: false, contenido: <DetalleMovInv mov={m} />,
  });

  const TABS = [
    { key: 'ventas',    label: 'Ventas',              count: ventas.length },
    { key: 'turnos',    label: 'Turnos de Caja',      count: turnos.length },
    { key: 'movcaja',   label: 'Mov. de Caja',        count: movCaja.length },
    { key: 'movinv',    label: 'Mov. de Inventario',  count: movInv.length },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)] transition-colors duration-500">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.anim-fade{animation:fadeIn 0.3s ease-out forwards}`}</style>

      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">Actividad del Negocio</h1>
        <p className="text-gray-500 mt-1 font-medium">Monitorea ventas, caja e inventario en un solo lugar.</p>
      </div>

      {/* Filtro de fechas */}
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-200/60 p-1 rounded-2xl mb-5 overflow-x-auto flex-shrink-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTabActiva(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${tabActiva === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
            {!cargando && (
              <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${tabActiva === t.key ? 'bg-[#91cf5b] text-white' : 'bg-gray-300 text-gray-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-sm overflow-hidden anim-fade">
        {cargando ? <Skeleton /> : (
          <div className="overflow-x-auto overflow-y-auto max-h-[55vh] custom-scrollbar">

            {/* ── Ventas ── */}
            {tabActiva === 'ventas' && (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white/60 backdrop-blur-md sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha y Hora</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Método</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cajero</th>
                    <th className="px-5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Productos</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ventas.length === 0
                    ? <FilaVacia msg="No hay ventas en este período." />
                    : ventas.map(v => {
                        const m = METODOS_PAGO[v.metodo_pago] || { label: v.metodo_pago, cls: 'bg-gray-100 text-gray-600' };
                        return (
                          <tr key={v.id} onClick={() => abrirVenta(v)}
                            className="hover:bg-white/60 transition-colors cursor-pointer">
                            <td className="px-5 py-3">
                              <p className="text-sm font-bold text-gray-700">{fmtFecha(v.fecha)}</p>
                              <p className="text-xs text-gray-400">{fmtHora(v.fecha)}</p>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${m.cls}`}>{m.label}</span>
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-gray-600">{v.cajero_nombre || '—'}</td>
                            <td className="px-5 py-3 text-center text-sm font-bold text-gray-600">{v.detalles?.length ?? 0}</td>
                            <td className="px-5 py-3 text-right text-sm font-black text-gray-800">{formatCLP(v.total)}</td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            )}

            {/* ── Turnos de Caja ── */}
            {tabActiva === 'turnos' && (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white/60 backdrop-blur-md sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Folio</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cajero</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Apertura</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cierre</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Fondo Apertura</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Fondo Cierre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {turnos.length === 0
                    ? <FilaVacia msg="No hay turnos en este período." />
                    : turnos.map(t => (
                        <tr key={t.id} onClick={() => abrirTurno(t)}
                          className="hover:bg-white/60 transition-colors cursor-pointer">
                          <td className="px-5 py-3 text-sm font-black text-gray-700">#{t.folio}</td>
                          <td className="px-5 py-3 text-sm font-semibold text-gray-700">{t.cajero_nombre || '—'}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${t.estado === 'abierto' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {t.estado === 'abierto' ? 'Activo' : 'Cerrado'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-sm font-bold text-gray-700">{fmtFecha(t.fecha_apertura)}</p>
                            <p className="text-xs text-gray-400">{fmtHora(t.fecha_apertura)}</p>
                          </td>
                          <td className="px-5 py-3">
                            {t.fecha_cierre
                              ? <><p className="text-sm font-bold text-gray-700">{fmtFecha(t.fecha_cierre)}</p><p className="text-xs text-gray-400">{fmtHora(t.fecha_cierre)}</p></>
                              : <span className="text-xs text-green-600 font-bold">En curso</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-black text-gray-800">{formatCLP(t.fondo_apertura)}</td>
                          <td className="px-5 py-3 text-right text-sm font-black">
                            {t.fondo_cierre != null
                              ? <span className="text-gray-800">{formatCLP(t.fondo_cierre)}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            )}

            {/* ── Movimientos de Caja ── */}
            {tabActiva === 'movcaja' && (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white/60 backdrop-blur-md sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha y Hora</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Concepto</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Realizado por</th>
                    <th className="px-5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">N° Turno</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {movCaja.length === 0
                    ? <FilaVacia msg="No hay movimientos de caja en este período." />
                    : movCaja.map(m => {
                        const cfg = TIPO_MOV[m.tipo] || { label: m.tipo, cls: 'bg-gray-100 text-gray-600' };
                        return (
                          <tr key={m.id} onClick={() => abrirMovCaja(m)}
                            className="hover:bg-white/60 transition-colors cursor-pointer">
                            <td className="px-5 py-3">
                              <p className="text-sm font-bold text-gray-700">{fmtFecha(m.fecha)}</p>
                              <p className="text-xs text-gray-400">{fmtHora(m.fecha)}</p>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.cls}`}>{cfg.label}</span>
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-600 font-medium">{m.concepto_display}</td>
                            <td className="px-5 py-3 text-sm font-semibold text-gray-700">{m.registrado_por_nombre || '—'}</td>
                            <td className="px-5 py-3 text-center text-sm font-bold text-gray-500">
                              {m.turno_folio ? `#${m.turno_folio}` : '—'}
                            </td>
                            <td className="px-5 py-3 text-right text-sm font-black text-gray-800">{formatCLP(m.monto)}</td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            )}

            {/* ── Movimientos de Inventario ── */}
            {tabActiva === 'movinv' && (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white/60 backdrop-blur-md sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha y Hora</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Producto</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Cantidad</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Realizado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {movInv.length === 0
                    ? <FilaVacia msg="No hay movimientos de inventario en este período." />
                    : movInv.map(m => {
                        const cfg = TIPO_MOV[m.tipo] || { label: m.tipo, cls: 'bg-gray-100 text-gray-600' };
                        const cant = parseFloat(m.cantidad);
                        return (
                          <tr key={m.id} onClick={() => abrirMovInv(m)}
                            className="hover:bg-white/60 transition-colors cursor-pointer">
                            <td className="px-5 py-3">
                              <p className="text-sm font-bold text-gray-700">{m.fecha.split(' ')[0]}</p>
                              <p className="text-xs text-gray-400">{m.fecha.split(' ')[1]}</p>
                            </td>
                            <td className="px-5 py-3">
                              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{m.producto_nombre}</p>
                              <p className="text-xs text-gray-400 font-mono">{m.producto_sku}</p>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.cls}`}>{cfg.label}</span>
                            </td>
                            <td className="px-5 py-3 text-center text-sm font-black text-gray-700">
                              {(m.tipo === 'RETIRO' || m.tipo === 'retiro') ? '−' : '+'}
                              {cant % 1 === 0 ? cant : cant.toFixed(3)}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-gray-700">{m.usuario || '—'}</td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            )}

          </div>
        )}
      </div>

      <DetalleModal detalle={detalle} onClose={() => setDetalle(null)} />
    </div>
  );
}
