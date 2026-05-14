import { useState, useEffect } from 'react';
import { ventasService } from '../services/ventas';
import { productosService } from '../services/productos';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import ChartModal from './reportes/ChartModal';
import TarjetaMetrica from './reportes/TarjetaMetrica';
import { formatCLP } from '../utils/format';
import { METODOS_PAGO } from '../constants/metodoPago';

function TooltipArea({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200">
      <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
      <p className="text-base font-black text-[#91cf5b]">{formatCLP(payload[0]?.value)}</p>
    </div>
  );
}

export default function Reportes() {
  const [metricas, setMetricas]   = useState(null);
  const [reporteZ, setReporteZ]   = useState(null);
  const [cargando, setCargando]   = useState(true);
  const [tabActiva, setTabActiva] = useState('rendimiento');
  const [chartConfig, setChartConfig] = useState(null);
  const [stockBajoModal, setStockBajoModal] = useState(false);
  const [productosStockBajo, setProductosStockBajo] = useState(null);
  const [cargandoStockBajo, setCargandoStockBajo] = useState(false);

  useEffect(() => {
    Promise.all([
      ventasService.metricas(),
      ventasService.reporteZ().catch(() => null),
    ])
      .then(([metRes, zRes]) => {
        setMetricas(metRes.data);
        if (zRes) setReporteZ(zRes.data);
      })
      .catch(err => console.error('Error al obtener métricas:', err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="w-full sm:w-1/2">
            <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-3/4 mb-3 animate-pulse" />
            <div className="h-4 sm:h-5 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
          </div>
          <div className="w-full sm:w-auto flex gap-2">
            <div className="h-10 bg-gray-200 rounded-xl w-36 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-xl w-36 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/40 border border-gray-100 p-6 rounded-3xl h-36 animate-pulse shadow-sm" />
          ))}
        </div>
        <div className="mt-8 h-72 bg-white/40 border border-gray-100 rounded-3xl animate-pulse shadow-sm" />
      </div>
    );
  }

  if (!metricas) return <div className="p-10 text-center text-red-500">Error al cargar los datos.</div>;

  // ── Cómputos derivados ────────────────────────────���───────────────────────
  const ticketHoy = metricas.tx_hoy > 0
    ? Math.round(metricas.ventas_hoy / metricas.tx_hoy) : 0;

  const ticketMes = metricas.tx_mes > 0
    ? Math.round(metricas.ventas_mes / metricas.tx_mes) : 0;

  const hoy7d  = metricas.historico_diario.slice(0, 7).reduce((s, d) => s + Number(d.total || 0), 0);
  const ant7d  = metricas.historico_diario.slice(7, 14).reduce((s, d) => s + Number(d.total || 0), 0);
  const pct7d  = ant7d > 0 ? Math.round(((hoy7d - ant7d) / ant7d) * 100) : null;
  const tendencia7d = pct7d !== null ? { pct: pct7d, positivo: pct7d >= 0 } : null;

  const datos30d = [...metricas.historico_diario].reverse(); // cronológico para el gráfico

  const totalDesglose = reporteZ?.desglose?.reduce((s, m) => s + Number(m.total_metodo || 0), 0) || 0;
  const desgloseOrdenado = reporteZ?.desglose
    ? [...reporteZ.desglose].sort((a, b) => Number(b.total_metodo) - Number(a.total_metodo))
    : [];

  // ── Handler stock bajo ────────────────────────────────────────────────────
  const handleStockBajoClick = async () => {
    setStockBajoModal(true);
    if (productosStockBajo) return;
    setCargandoStockBajo(true);
    try {
      const res = await productosService.listarStockBajo();
      setProductosStockBajo(res.data?.results ?? res.data ?? []);
    } catch {
      setProductosStockBajo([]);
    } finally {
      setCargandoStockBajo(false);
    }
  };

  // ── Handlers para modales ─────────────────────────────────────────────────
  const handleVentasHoyClick = () => {
    const full = Array.from({ length: 24 }, (_, i) => ({ fecha: `${i}:00`, total: 0, tx_count: 0 }));
    metricas.ventas_por_hora_hoy?.forEach(h => {
      full[h.hora].total    = h.total;
      full[h.hora].tx_count = h.tx_count;
    });
    setChartConfig({ data: full, xKey: 'fecha', yKey: 'total', lineDataKey: 'tx_count', title: 'Ventas de Hoy por Hora', barName: 'Ventas', lineName: 'Transacciones', color: '#82ca9d' });
  };

  const handleVentasMesClick = () =>
    setChartConfig({ data: metricas.historico_diario_mes, xKey: 'fecha', yKey: 'total', lineDataKey: 'tx_count', title: 'Ventas Diarias del Mes', barName: 'Ventas', lineName: 'Transacciones', color: '#8884d8' });

  const handleVentasHistoricasClick = () =>
    setChartConfig({ data: metricas.historico_semanal, xKey: 'fecha', yKey: 'total', lineDataKey: 'tx_count', title: 'Ventas Semanales (Histórico)', barName: 'Ventas', lineName: 'Transacciones', color: '#a368d8' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)] relative transition-colors duration-500">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.anim-fade{animation:fadeIn 0.4s ease-out forwards}`}</style>

      {/* Cabecera y Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">Reportes del Negocio</h1>
          <p className="text-gray-500 mt-1 font-medium">Visualiza el rendimiento de tus ventas e inventario.</p>
        </div>
        <div className="flex bg-gray-200/60 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['rendimiento', 'inventario'].map(tab => (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${tabActiva === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'rendimiento' ? 'Rendimiento de Ventas' : 'Estado de Inventario'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">

        {/* ── TAB: RENDIMIENTO ──────────────────────────���────────────────── */}
        {tabActiva === 'rendimiento' && (
          <div className="space-y-8 anim-fade pb-8">

            {/* Tarjetas de métricas */}
            <section>
              <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2">
                <span className="text-2xl">📈</span> Métricas de Ventas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <TarjetaMetrica
                  titulo="Ventas Hoy"
                  valor={formatCLP(metricas.ventas_hoy)}
                  subtitulo={`${metricas.tx_hoy || 0} transacciones`}
                  color="green"
                  onClick={handleVentasHoyClick}
                  disabled={Number(metricas.ventas_hoy) <= 0}
                  icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <TarjetaMetrica
                  titulo="Ventas este Mes"
                  valor={formatCLP(metricas.ventas_mes)}
                  subtitulo={`${metricas.tx_mes || 0} transacciones`}
                  color="blue"
                  onClick={handleVentasMesClick}
                  disabled={Number(metricas.ventas_mes) <= 0}
                  tendencia={tendencia7d}
                  icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
                <TarjetaMetrica
                  titulo="Ingresos Históricos"
                  valor={formatCLP(metricas.ventas_historicas)}
                  subtitulo={`${metricas.tx_historicas || 0} transacciones en total`}
                  color="purple"
                  onClick={handleVentasHistoricasClick}
                  disabled={Number(metricas.ventas_historicas) <= 0}
                  icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
                <TarjetaMetrica
                  titulo="Venta Promedio Hoy"
                  valor={formatCLP(ticketHoy)}
                  subtitulo={`Mes: ${formatCLP(ticketMes)} / transacción`}
                  color="orange"
                  disabled={ticketHoy <= 0}
                  icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                />
              </div>
            </section>

            {/* Desglose de métodos de pago */}
            {desgloseOrdenado.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2">
                  <span className="text-2xl">💳</span> Métodos de Pago
                  {reporteZ?.tiene_turno && (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Turno activo</span>
                  )}
                </h3>
                <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {desgloseOrdenado.map(m => {
                      const cfg  = METODOS_PAGO[m.metodo_pago] || { label: m.metodo_pago, bg: 'bg-gray-400', text: 'text-gray-700', light: 'bg-gray-50' };
                      const pct  = totalDesglose > 0 ? Math.round((Number(m.total_metodo) / totalDesglose) * 100) : 0;
                      return (
                        <div key={m.metodo_pago} className={`${cfg.light} rounded-2xl p-4`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${cfg.bg} text-white`}>{pct}%</span>
                          </div>
                          <p className="text-xl font-black text-gray-800 mb-2">{formatCLP(m.total_metodo)}</p>
                          <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                            <div className={`h-full ${cfg.bg} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-right text-xs text-gray-400 font-medium mt-4 pr-1">
                    Total del período: <span className="font-black text-gray-600">{formatCLP(totalDesglose)}</span>
                  </p>
                </div>
              </section>
            )}

            {/* Gráfico de tendencia 30 días */}
            <section>
              <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2">
                <span className="text-2xl">📅</span> Tendencia — Últimos 30 Días
              </h3>
              <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm p-4 sm:p-6">
                {datos30d.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-400">Sin datos en los últimos 30 días.</div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={datos30d} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#91cf5b" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#91cf5b" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="fecha"
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          tickFormatter={v => v.slice(0, 5)}
                          interval="preserveStartEnd"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={v => `$${new Intl.NumberFormat('es-CL').format(v)}`}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          width={82}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<TooltipArea />} cursor={{ stroke: '#91cf5b', strokeWidth: 1, strokeDasharray: '4 2' }} />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#91cf5b"
                          strokeWidth={2.5}
                          fill="url(#gradVentas)"
                          dot={false}
                          activeDot={{ r: 5, fill: '#91cf5b', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Tabla resumen debajo del gráfico */}
                {datos30d.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4 max-h-52 overflow-y-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {[...datos30d].reverse().map((dia, idx) => (
                          <tr key={idx} className="hover:bg-white/60 transition-colors">
                            <td className="px-4 py-2.5 text-sm font-semibold text-gray-600">{dia.fecha}</td>
                            <td className="px-4 py-2.5 text-right text-sm font-black text-[#91cf5b]">{formatCLP(dia.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ── TAB: INVENTARIO ────────────────────────────────────────────── */}
        {tabActiva === 'inventario' && (
          <div className="space-y-8 anim-fade pb-8">
            <section>
              <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2">
                <span className="text-2xl">📦</span> Estado General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TarjetaMetrica
                  titulo="Alertas de Stock"
                  valor={metricas.productos_stock_bajo}
                  subtitulo="Productos por debajo del umbral mínimo"
                  color="yellow"
                  onClick={metricas.productos_stock_bajo > 0 ? handleStockBajoClick : undefined}
                  disabled={metricas.productos_stock_bajo === 0}
                  icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
                <TarjetaMetrica
                  titulo="Capital en Inventario"
                  valor={formatCLP(metricas.valor_inventario)}
                  subtitulo="Dinero retenido en mercadería activa"
                  color="purple"
                  icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                />
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Más vendidos */}
              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2">
                  <span className="text-2xl">⭐</span> Más Vendidos
                </h3>
                <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm overflow-hidden p-2 h-full">
                  {!metricas.top_productos?.length ? (
                    <div className="p-6 text-center text-gray-500">Aún no hay ventas registradas.</div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200/50">
                      <thead className="bg-white/40">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Unid.</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Recaudado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50">
                        {metricas.top_productos.map((prod, idx) => (
                          <tr key={idx} className="hover:bg-white/60 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-gray-800 line-clamp-1">{prod.producto_nombre}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{prod.producto_sku}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-1 rounded-lg">
                                {parseFloat(prod.cantidad_vendida)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-black text-gray-700">
                              {formatCLP(prod.total_recaudado)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              {/* Menos vendidos */}
              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2">
                  <span className="text-2xl">📉</span> Menos Vendidos
                </h3>
                <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm overflow-hidden p-2 h-full">
                  {!metricas.bottom_productos?.length ? (
                    <div className="p-6 text-center text-gray-500">Aún no hay ventas registradas.</div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200/50">
                      <thead className="bg-white/40">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Unid.</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Recaudado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50">
                        {metricas.bottom_productos.map((prod, idx) => (
                          <tr key={idx} className="hover:bg-white/60 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-gray-800 line-clamp-1">{prod.producto_nombre}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{prod.producto_sku}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-1 rounded-lg">
                                {parseFloat(prod.cantidad_vendida)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-black text-gray-700">
                              {formatCLP(prod.total_recaudado)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      {/* Modal: productos con stock bajo */}
      {stockBajoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setStockBajoModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h2 className="text-lg font-black text-gray-800">Stock Bajo</h2>
                  <p className="text-xs text-gray-400 font-medium">
                    {cargandoStockBajo ? 'Cargando...' : `${productosStockBajo?.length ?? 0} producto${productosStockBajo?.length !== 1 ? 's' : ''} bajo el umbral`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStockBajoModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {cargandoStockBajo ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : !productosStockBajo?.length ? (
                <div className="p-10 text-center text-gray-400 font-medium">No hay productos con stock bajo.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Producto</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Umbral</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {productosStockBajo.map(p => {
                      const stockNum   = parseFloat(p.stock);
                      const umbralNum  = parseFloat(p.umbral_stock);
                      const critico    = stockNum === 0;
                      return (
                        <tr key={p.id} className="hover:bg-yellow-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{p.nombre}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{p.sku}</p>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`text-sm font-black px-2 py-1 rounded-lg ${critico ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                              {stockNum % 1 === 0 ? stockNum : stockNum.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-semibold text-gray-400">
                            {umbralNum % 1 === 0 ? umbralNum : umbralNum.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <ChartModal config={chartConfig} onClose={() => setChartConfig(null)} />
    </div>
  );
}
