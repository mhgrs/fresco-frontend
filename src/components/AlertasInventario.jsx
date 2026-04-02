import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AlertasInventario() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('inventario/productos/')
      .then(res => {
        const bajoUmbral = res.data.filter(p => p.esta_activo && parseFloat(p.stock) <= parseFloat(p.umbral_stock));
        setAlertas(bajoUmbral);
      })
      .catch(err => console.error("Error cargando alertas:", err))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="p-6 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)] relative overflow-hidden transition-colors duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Alertas de Inventario</h1>
      </div>
      
      <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 rounded-lg shadow-md flex-1 overflow-hidden flex flex-col">
        {cargando ? (
          <div className="p-8 text-center text-gray-500 font-medium">Cargando alertas...</div>
        ) : alertas.length === 0 ? (
          <div className="p-8 text-center text-green-700 font-medium text-lg">No hay alertas de stock bajo. ¡Todo está en orden!</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/20">
            {alertas.map(prod => (
              <div key={prod.id} className="flex justify-between items-center p-5 border border-red-200 bg-red-50/80 rounded-lg shadow-sm hover:shadow transition">
                <div>
                  <h3 className="font-bold text-red-800 text-lg">{prod.nombre}</h3>
                  <p className="text-sm text-red-600">SKU: {prod.sku}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-sm text-gray-600 font-semibold">Stock Actual: <span className="text-red-600 font-black text-xl ml-2">{prod.tipo_venta === 'UNIDAD' ? Math.round(prod.stock) : Number(prod.stock).toFixed(2)}</span></p>
                  <p className="text-xs text-gray-500 mt-1">Umbral mínimo: {prod.tipo_venta === 'UNIDAD' ? Math.round(prod.umbral_stock) : Number(prod.umbral_stock).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}