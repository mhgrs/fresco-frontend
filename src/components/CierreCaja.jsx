import { useState, useEffect } from 'react';
import api from '../services/api';

export default function CierreCaja() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerReporte = async () => {
      try {
        const respuesta = await api.get('inventario/ventas/reporte_z/');
        setReporte(respuesta.data);
      } catch (error) {
        console.error("Error al obtener reporte:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerReporte();
  }, []);

  if (cargando) return <div className="p-10 text-center">Cargando reporte...</div>;
  if (!reporte) return <div className="p-10 text-center text-red-500">Error al cargar datos.</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto min-h-full bg-[var(--color-fondo)] transition-colors duration-500">
      <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-800 text-white p-6">
          <h1 className="text-2xl font-bold">Reporte - Cierre de Turno</h1>
          <p className="text-gray-300">Fecha Comercial: {reporte.fecha}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50/80 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold mb-1">Total Ingresos</p>
              <p className="text-3xl font-black text-blue-900">${reporte.total_ingresos}</p>
            </div>
            <div className="bg-white/60 p-4 rounded-lg border border-white/60">
              <p className="text-sm text-gray-600 font-semibold mb-1">Transacciones</p>
              <p className="text-3xl font-black text-gray-800">{reporte.cantidad_transacciones}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-700">Desglose por Método de Pago</h3>
          
          {reporte.desglose.length === 0 ? (
            <p className="text-gray-500 italic">No hay ventas registradas el día de hoy.</p>
          ) : (
            <div className="space-y-3">
              {reporte.desglose.map((item) => (
                <div key={item.metodo_pago} className="flex justify-between items-center p-3 bg-white/60 rounded border border-white/40">
                  <span className="font-semibold text-gray-700">{item.metodo_pago}</span>
                  <span className="text-lg font-bold">${item.total_metodo}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-4 border-t flex justify-end">
             <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2 rounded font-bold hover:bg-gray-700">
               Imprimir Reporte
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
