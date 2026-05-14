import TarjetaMetrica from './TarjetaMetrica';
import { formatCLP } from '../../utils/format';

export default function TabInventario({ metricas, onStockBajoClick }) {
  return (
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
            onClick={metricas.productos_stock_bajo > 0 ? onStockBajoClick : undefined}
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
  );
}
