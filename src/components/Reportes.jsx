import { useState, useEffect } from 'react';
import api from '../services/api';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ChartModal({ config, onClose }) {
  if (!config) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="label font-bold text-gray-700 mb-1">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-black text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.name === 'Ventas' ? '$' + new Intl.NumberFormat('es-CL').format(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white/95 border border-gray-200 rounded-2xl shadow-2xl w-full max-w-4xl h-[70vh] p-4 sm:p-6 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-none">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">{config.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={config.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey={config.xKey} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tickFormatter={(value) => `$${new Intl.NumberFormat('es-CL').format(value)}`} tick={{ fontSize: 12 }} width={80} />
              {config.lineDataKey && (
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} width={40} />
              )}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(145, 207, 91, 0.1)' }} />
              <Legend />
              <Bar yAxisId="left" dataKey={config.yKey} name={config.barName} fill={config.color} radius={[4, 4, 0, 0]} />
              {config.lineDataKey && (
                <Line yAxisId="right" type="monotone" dataKey={config.lineDataKey} name={config.lineName} stroke="#ff7300" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 4 }} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function TarjetaMetrica({ titulo, valor, subtitulo, icono, color, onClick, disabled = false }) {
  const colores = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  };
  const theme = colores[color] || colores.blue;
  const Component = onClick ? 'button' : 'div';

  return (
    <Component 
      onClick={onClick}
      disabled={disabled}
      className={`bg-white/60 backdrop-blur-md border border-white/80 p-5 sm:p-6 rounded-3xl shadow-sm flex items-start gap-4 transition-transform text-left w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#91cf5b]' : ''}`}
    >
      <div className={`p-3 rounded-2xl ${theme} flex-shrink-0 shadow-inner`}>
        {icono}
      </div>
      <div>
        <p className="text-xs sm:text-sm font-bold text-gray-500 leading-tight uppercase tracking-wider">{titulo}</p>
        <p className="text-2xl sm:text-4xl font-black text-gray-800 mt-1 tracking-tight">{valor}</p>
        {subtitulo && <p className="text-xs text-gray-400 mt-2 font-medium">{subtitulo}</p>}
      </div>
    </Component>
  );
}

export default function Reportes() {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState('rendimiento');
  const [chartConfig, setChartConfig] = useState(null);

  useEffect(() => {
    api.get('inventario/ventas/metricas/')
      .then(res => setMetricas(res.data))
      .catch(err => console.error("Error al obtener métricas:", err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="p-10 text-center text-gray-500 font-medium">Calculando inteligencia de negocio...</div>;
  if (!metricas) return <div className="p-10 text-center text-red-500">Error al cargar los datos.</div>;

  const handleVentasHoyClick = () => {
    const fullHoursData = Array.from({ length: 24 }, (_, i) => ({ fecha: `${i}:00`, total: 0, tx_count: 0 }));
    metricas.ventas_por_hora_hoy?.forEach(item => {
      if (fullHoursData[item.hora]) {
        fullHoursData[item.hora].total = item.total;
        fullHoursData[item.hora].tx_count = item.tx_count;
      }
    });

    setChartConfig({
      data: fullHoursData,
      xKey: 'fecha',
      yKey: 'total',
      lineDataKey: 'tx_count',
      title: 'Ventas de Hoy por Hora',
      barName: 'Ventas',
      lineName: 'Transacciones',
      color: '#82ca9d'
    });
  };

  const handleVentasMesClick = () => {
    setChartConfig({
      data: metricas.historico_diario_mes,
      xKey: 'fecha',
      yKey: 'total',
      lineDataKey: 'tx_count',
      title: 'Ventas Diarias del Mes',
      barName: 'Ventas',
      lineName: 'Transacciones',
      color: '#8884d8'
    });
  };

  const handleVentasHistoricasClick = () => {
    setChartConfig({
      data: metricas.historico_semanal,
      xKey: 'fecha',
      yKey: 'total',
      lineDataKey: 'tx_count',
      title: 'Ventas Semanales (Histórico)',
      barName: 'Ventas',
      lineName: 'Transacciones',
      color: '#a368d8'
    });
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0';
    return `$${new Intl.NumberFormat('es-CL').format(value)}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-[var(--color-fondo)] relative overflow-hidden transition-colors duration-500">
      
      {/* Cabecera y Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">Reportes del Negocio</h1>
          <p className="text-gray-500 mt-1 font-medium">Visualiza el rendimiento de tus ventas e inventario.</p>
        </div>
        
        {/* Selector de Pestañas */}
        <div className="flex bg-gray-200/60 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button 
            onClick={() => setTabActiva('rendimiento')} 
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${tabActiva === 'rendimiento' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Rendimiento de Ventas
          </button>
          <button 
            onClick={() => setTabActiva('inventario')} 
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${tabActiva === 'inventario' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Estado de Inventario
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        `}</style>

        {tabActiva === 'rendimiento' && (
          <div className="space-y-8 animate-fade-in pb-8">
            <section>
              <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">📈</span> Métricas de Ventas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <TarjetaMetrica titulo="Ventas Hoy" valor={formatCurrency(metricas.ventas_hoy)} subtitulo={`${metricas.tx_hoy || 0} transacciones realizadas`} color="green" onClick={handleVentasHoyClick} disabled={Number(metricas.ventas_hoy) <= 0} icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} />
                <TarjetaMetrica titulo="Ventas este Mes" valor={formatCurrency(metricas.ventas_mes)} subtitulo={`${metricas.tx_mes || 0} transacciones realizadas`} color="blue" onClick={handleVentasMesClick} disabled={Number(metricas.ventas_mes) <= 0} icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>} />
                <TarjetaMetrica titulo="Ingresos Históricos" valor={formatCurrency(metricas.ventas_historicas)} subtitulo={`${metricas.tx_historicas || 0} transacciones en total`} color="purple" onClick={handleVentasHistoricasClick} disabled={Number(metricas.ventas_historicas) <= 0} icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>} />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">📅</span> Histórico de los Últimos 30 Días</h3>
              <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm overflow-hidden p-2">
                {metricas.historico_diario.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No hay historial de ventas en los últimos 30 días.</div>
                ) : (
                  <div className="overflow-x-auto max-h-96 custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200/50">
                      <thead className="bg-white/40 sticky top-0">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Recaudado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50">
                        {metricas.historico_diario.map((dia, idx) => (
                          <tr key={idx} className="hover:bg-white/60 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-800">{dia.fecha}</p>
                            </td>
                            <td className="px-6 py-4 text-right text-base font-black text-[#91cf5b]">
                              {formatCurrency(dia.total)}
                            </td>
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

        {tabActiva === 'inventario' && (
          <div className="space-y-8 animate-fade-in pb-8">
            <section>
              <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">📦</span> Estado General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <TarjetaMetrica titulo="Alertas de Stock" valor={metricas.productos_stock_bajo} subtitulo="Productos por debajo del umbral mínimo" color="yellow" icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>} />
                <TarjetaMetrica titulo="Capital en Inventario" valor={`$${metricas.valor_inventario}`} subtitulo="Dinero retenido en mercadería activa" color="purple" icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>} />
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Categoría: Top Productos */}
              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">⭐</span> Más Vendidos</h3>
                <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm overflow-hidden p-2 h-full">
                  {!metricas.top_productos || metricas.top_productos.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Aún no hay ventas registradas.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200/50">
                        <thead className="bg-white/40">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cant</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50">
                          {metricas.top_productos.map((prod, idx) => (
                            <tr key={idx} className="hover:bg-white/60 transition-colors">
                              <td className="px-4 py-3">
                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{prod.producto_nombre}</p>
                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{prod.producto_sku}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-1 rounded-lg">{parseFloat(prod.cantidad_vendida)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              {/* Categoría: Menos Productos */}
              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">📉</span> Menos Vendidos</h3>
                <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm overflow-hidden p-2 h-full">
                  {!metricas.bottom_productos || metricas.bottom_productos.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Aún no hay ventas registradas.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200/50">
                        <thead className="bg-white/40">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cant</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50">
                          {metricas.bottom_productos.map((prod, idx) => (
                            <tr key={idx} className="hover:bg-white/60 transition-colors">
                              <td className="px-4 py-3">
                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{prod.producto_nombre}</p>
                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{prod.producto_sku}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-1 rounded-lg">{parseFloat(prod.cantidad_vendida)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      <ChartModal config={chartConfig} onClose={() => setChartConfig(null)} />
    </div>
  );
}