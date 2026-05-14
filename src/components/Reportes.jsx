import { useState, useEffect } from 'react';
import { ventasService } from '../services/ventas';
import ChartModal from './reportes/ChartModal';
import TabRendimiento from './reportes/TabRendimiento';
import TabInventario from './reportes/TabInventario';
import ModalStockBajo from './reportes/ModalStockBajo';
import { logError } from '../utils/logger';

export default function Reportes() {
  const [metricas, setMetricas]         = useState(null);
  const [reporteZ, setReporteZ]         = useState(null);
  const [cargando, setCargando]         = useState(true);
  const [tabActiva, setTabActiva]       = useState('rendimiento');
  const [chartConfig, setChartConfig]   = useState(null);
  const [stockBajoOpen, setStockBajoOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      ventasService.metricas(),
      ventasService.reporteZ().catch(() => null),
    ])
      .then(([metRes, zRes]) => {
        setMetricas(metRes.data);
        if (zRes) setReporteZ(zRes.data);
      })
      .catch(err => logError('Reportes', err))
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

  const ticketHoy7d  = metricas.historico_diario.slice(0, 7).reduce((s, d) => s + Number(d.total || 0), 0);
  const ant7d        = metricas.historico_diario.slice(7, 14).reduce((s, d) => s + Number(d.total || 0), 0);
  const pct7d        = ant7d > 0 ? Math.round(((ticketHoy7d - ant7d) / ant7d) * 100) : null;
  const tendencia7d  = pct7d !== null ? { pct: pct7d, positivo: pct7d >= 0 } : null;
  const datos30d     = [...metricas.historico_diario].reverse();
  const totalDesglose   = reporteZ?.desglose?.reduce((s, m) => s + Number(m.total_metodo || 0), 0) || 0;
  const desgloseOrdenado = reporteZ?.desglose
    ? [...reporteZ.desglose].sort((a, b) => Number(b.total_metodo) - Number(a.total_metodo))
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)] relative transition-colors duration-500">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.anim-fade{animation:fadeIn 0.4s ease-out forwards}`}</style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">Reportes del Negocio</h1>
          <p className="text-gray-500 mt-1 font-medium">Visualiza el rendimiento de tus ventas e inventario.</p>
        </div>
        <div className="flex bg-gray-200/60 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['rendimiento', 'inventario'].map(tab => (
            <button key={tab} onClick={() => setTabActiva(tab)}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${tabActiva === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab === 'rendimiento' ? 'Rendimiento de Ventas' : 'Estado de Inventario'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {tabActiva === 'rendimiento' && (
          <TabRendimiento
            metricas={metricas}
            desgloseOrdenado={desgloseOrdenado}
            totalDesglose={totalDesglose}
            tendencia7d={tendencia7d}
            datos30d={datos30d}
            tieneTurno={reporteZ?.tiene_turno}
            onVentasHoyClick={setChartConfig}
            onVentasMesClick={() => setChartConfig({ data: metricas.historico_diario_mes, xKey: 'fecha', yKey: 'total', lineDataKey: 'tx_count', title: 'Ventas Diarias del Mes', barName: 'Ventas', lineName: 'Transacciones', color: '#8884d8' })}
            onVentasHistoricasClick={() => setChartConfig({ data: metricas.historico_semanal, xKey: 'fecha', yKey: 'total', lineDataKey: 'tx_count', title: 'Ventas Semanales (Histórico)', barName: 'Ventas', lineName: 'Transacciones', color: '#a368d8' })}
          />
        )}
        {tabActiva === 'inventario' && (
          <TabInventario
            metricas={metricas}
            onStockBajoClick={() => setStockBajoOpen(true)}
          />
        )}
      </div>

      <ModalStockBajo open={stockBajoOpen} onClose={() => setStockBajoOpen(false)} />
      <ChartModal config={chartConfig} onClose={() => setChartConfig(null)} />
    </div>
  );
}
