import { useState, useEffect } from 'react';
import { ventasService } from '../services/ventas';
import ChartModal from './reportes/ChartModal';
import TarjetaMetrica from './reportes/TarjetaMetrica';

export default function Reportes() {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState('rendimiento');
  const [chartConfig, setChartConfig] = useState(null);

  useEffect(() => {
    ventasService.metricas()
      .then(res => setMetricas(res.data))
      .catch(err => console.error("Error al obtener métricas:", err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="w-full sm:w-1/2">
            <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-3/4 mb-3 animate-pulse"></div>
            <div className="h-4 sm:h-5 bg-gray-100 rounded-lg w-1/2 animate-pulse"></div>
          </div>
          <div className="w-full sm:w-auto flex gap-2">
            <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/40 backdrop-blur-sm border border-gray-100 p-6 rounded-3xl h-36 flex flex-col justify-between animate-pulse shadow-sm">
              <div className="flex justify-between items-start">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              </div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 h-64 bg-white/40 backdrop-blur-sm border border-gray-100 rounded-3xl animate-pulse shadow-sm"></div>
      </div>
    );
  }
  if (!metricas)  return <div className="p-10 text-center text-red-500">Error al cargar los datos.</div>;

  const formatCurrency = (value) =>
    typeof value !== 'number' ? '$0' : `$${new Intl.NumberFormat('es-CL').format(value)}`;

  const handleVentasHoyClick = () => {
    const fullHoursData = Array.from({ length: 24 }, (_, i) => ({ fecha: `${i}:00`, total: 0, tx_count: 0 }));
    metricas.ventas_por_hora_hoy?.forEach(item => {
      if (fullHoursData[item.hora]) {
        fullHoursData[item.hora].total = item.total;
        fullHoursData[item.hora].tx_count = item.tx_count;
      }
    });
    setChartConfig({ data: fullHoursData, xKey: 'fecha', yKey: 'total', lineDataKey: 'tx_count', title: 'Ventas de Hoy por Hora', barName: 'Ventas', lineName: 'Transacciones', color: '#82ca9d' });
  };

  const handleVentasMesClick = () =>
    setChartConfig({ data: metricas.historico_diario_mes, xKey: 'fecha', yKey: 'total', lineDataKey: 'tx_count', title: 'Ventas Diarias del Mes', barName: 'Ventas', lineName: 'Transacciones', color: '#8884d8' });

  const handleVentasHistoricasClick = () =>
    setChartConfig({ data: metricas.historico_semanal, xKey: 'fecha', yKey: 'total', lineDataKey: 'tx_count', title: 'Ventas Semanales (Histórico)', barName: 'Ventas', lineName: 'Transacciones', color: '#a368d8' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)] relative overflow-hidden transition-colors duration-500">

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

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in{animation:fadeIn 0.4s ease-out forwards}`}</style>

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
                            <td className="px-6 py-4"><p className="text-sm font-bold text-gray-800">{dia.fecha}</p></td>
                            <td className="px-6 py-4 text-right text-base font-black text-[#91cf5b]">{formatCurrency(dia.total)}</td>
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
              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">⭐</span> Más Vendidos</h3>
                <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm overflow-hidden p-2 h-full">
                  {!metricas.top_productos?.length ? (
                    <div className="p-6 text-center text-gray-500">Aún no hay ventas registradas.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200/50">
                        <thead className="bg-white/40"><tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cant</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-200/50">
                          {metricas.top_productos.map((prod, idx) => (
                            <tr key={idx} className="hover:bg-white/60 transition-colors">
                              <td className="px-4 py-3"><p className="text-sm font-bold text-gray-800 line-clamp-1">{prod.producto_nombre}</p><p className="text-[10px] text-gray-500 font-mono mt-0.5">{prod.producto_sku}</p></td>
                              <td className="px-4 py-3 text-center"><span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-1 rounded-lg">{parseFloat(prod.cantidad_vendida)}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">📉</span> Menos Vendidos</h3>
                <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm overflow-hidden p-2 h-full">
                  {!metricas.bottom_productos?.length ? (
                    <div className="p-6 text-center text-gray-500">Aún no hay ventas registradas.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200/50">
                        <thead className="bg-white/40"><tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cant</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-200/50">
                          {metricas.bottom_productos.map((prod, idx) => (
                            <tr key={idx} className="hover:bg-white/60 transition-colors">
                              <td className="px-4 py-3"><p className="text-sm font-bold text-gray-800 line-clamp-1">{prod.producto_nombre}</p><p className="text-[10px] text-gray-500 font-mono mt-0.5">{prod.producto_sku}</p></td>
                              <td className="px-4 py-3 text-center"><span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-1 rounded-lg">{parseFloat(prod.cantidad_vendida)}</span></td>
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
