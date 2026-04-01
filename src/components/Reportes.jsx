import { useState, useEffect } from 'react';
import api from '../services/api';

function TarjetaMetrica({ titulo, valor, subtitulo, icono, color }) {
  const colores = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  };
  const theme = colores[color] || colores.blue;

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/80 p-5 sm:p-6 rounded-3xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
      <div className={`p-3 rounded-2xl ${theme} flex-shrink-0 shadow-inner`}>
        {icono}
      </div>
      <div>
        <p className="text-xs sm:text-sm font-bold text-gray-500 leading-tight uppercase tracking-wider">{titulo}</p>
        <p className="text-2xl sm:text-4xl font-black text-gray-800 mt-1 tracking-tight">{valor}</p>
        {subtitulo && <p className="text-xs text-gray-400 mt-2 font-medium">{subtitulo}</p>}
      </div>
    </div>
  );
}

export default function Reportes() {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('inventario/ventas/metricas/')
      .then(res => setMetricas(res.data))
      .catch(err => console.error("Error al obtener métricas:", err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="p-10 text-center text-gray-500 font-medium">Calculando inteligencia de negocio...</div>;
  if (!metricas) return <div className="p-10 text-center text-red-500">Error al cargar los datos.</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto bg-[var(--color-fondo)] custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-10 pb-10">
        
        <div className="mb-8 border-b border-gray-200/50 pb-4">
          <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">Reportes del Negocio</h1>
          <p className="text-gray-500 mt-1 font-medium">Visualiza el rendimiento de tus ventas e inventario.</p>
        </div>

        {/* Categoría: Ventas */}
        <section>
          <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">📈</span> Rendimiento de Ventas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <TarjetaMetrica titulo="Ventas este Mes" valor={`$${metricas.ventas_mes}`} subtitulo={`${metricas.tx_mes} transacciones realizadas`} color="green" icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} />
            <TarjetaMetrica titulo="Ingresos Históricos" valor={`$${metricas.ventas_historicas}`} subtitulo="Total histórico de la empresa" color="blue" icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>} />
          </div>
        </section>

        {/* Categoría: Inventario */}
        <section>
          <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">📦</span> Estado del Inventario</h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <TarjetaMetrica titulo="Capital en Inventario" valor={`$${metricas.valor_inventario}`} subtitulo="Dinero retenido en mercadería activa." color="purple" icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>} />
          </div>
        </section>

        {/* Categoría: Top Productos */}
        <section>
          <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2"><span className="text-2xl">⭐</span> Ranking: Top 5 Productos</h3>
          <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm overflow-hidden p-2">
            {metricas.top_productos.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Aún no hay ventas registradas.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/50">
                  <thead className="bg-white/40">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad Vendida</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Recaudado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {metricas.top_productos.map((prod, idx) => (
                      <tr key={idx} className="hover:bg-white/60 transition-colors">
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-gray-800">{prod.producto_nombre}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{prod.producto_sku}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="bg-gray-100 text-gray-700 text-sm font-bold px-3 py-1.5 rounded-lg">{parseFloat(prod.cantidad_vendida)}</span>
                        </td>
                        <td className="px-6 py-5 text-right text-lg font-black text-[#91cf5b]">
                          ${prod.total_recaudado}
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
  );
}