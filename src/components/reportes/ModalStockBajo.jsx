import { useState, useEffect } from 'react';
import { productosService } from '../../services/productos';

export default function ModalStockBajo({ open, onClose }) {
  const [productos, setProductos] = useState(null);
  const [cargando, setCargando]   = useState(false);

  useEffect(() => {
    if (!open || productos !== null) return;
    setCargando(true);
    productosService.listarStockBajo()
      .then(res => setProductos(res.data?.results ?? res.data ?? []))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false));
  }, [open, productos]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h2 className="text-lg font-black text-gray-800">Stock Bajo</h2>
              <p className="text-xs text-gray-400 font-medium">
                {cargando
                  ? 'Cargando...'
                  : `${productos?.length ?? 0} producto${productos?.length !== 1 ? 's' : ''} bajo el umbral`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          {cargando ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !productos?.length ? (
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
                {productos.map(p => {
                  const stockNum  = parseFloat(p.stock);
                  const umbralNum = parseFloat(p.umbral_stock);
                  const critico   = stockNum === 0;
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
  );
}
