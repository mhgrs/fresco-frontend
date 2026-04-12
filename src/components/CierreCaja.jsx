import { useState, useEffect } from 'react';
import { ventasService } from '../services/ventas';

export default function CierreCaja() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [fondoCaja] = useState(() => {
    try {
      const hoy = new Date().toLocaleDateString('es-CL');
      const fondoGuardado = JSON.parse(localStorage.getItem('pos_fondo_caja'));
      return fondoGuardado && fondoGuardado.fecha === hoy ? fondoGuardado.monto : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    ventasService.reporteZ()
      .then(res => setReporte(res.data))
      .catch(err => console.error("Error al obtener reporte Z:", err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-full flex flex-col bg-[var(--color-fondo)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
          <div className="w-full sm:w-1/2">
            <div className="h-10 bg-gray-200 rounded-lg w-2/3 mb-2 animate-pulse"></div>
            <div className="h-5 bg-gray-100 rounded-lg w-1/2 animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-xl w-full sm:w-40 animate-pulse"></div>
        </div>
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl overflow-hidden flex-1 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="bg-gray-100/50 h-32 rounded-2xl border border-gray-200 animate-pulse" key={i}></div>
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="h-20 bg-gray-100/50 rounded-xl border border-gray-200 animate-pulse" key={i}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!reporte) return <div className="p-10 text-center text-red-500">Error al generar el reporte.</div>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-full flex flex-col bg-[var(--color-fondo)] transition-colors duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">Cierre de Caja (Z)</h1>
          <p className="text-gray-500 mt-1 font-medium">Fecha de operación (Hora Chile): {reporte.fecha}</p>
        </div>
        <button onClick={() => window.print()} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 shadow-md w-full sm:w-auto justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Imprimir Z
        </button>
      </div>

      <div className="bg-[var(--color-tarjeta)] backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl overflow-hidden flex-1">
        <div className="p-6 sm:p-8">
          
          {/* Resumen de Flujos de Dinero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-yellow-50/80 p-5 rounded-2xl border border-yellow-100 shadow-inner flex flex-col justify-between">
              <div><p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1 flex items-center gap-2"><span className="text-lg">🪙</span> Fondo Inicial</p>
              <p className="text-3xl lg:text-4xl font-black text-yellow-900">${fondoCaja}</p></div>
              <p className="text-xs text-yellow-700 mt-2 font-medium">Apertura de turno</p>
            </div>

            <div className="bg-green-50/80 p-5 rounded-2xl border border-green-100 shadow-inner flex flex-col justify-between">
              <div><p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1 flex items-center gap-2"><span className="text-lg">⬇️</span> Ventas</p>
              <p className="text-3xl lg:text-4xl font-black text-green-900">${reporte.total_ingresos}</p></div>
              <p className="text-xs text-green-700 mt-2 font-medium">De {reporte.cantidad_transacciones} transacciones</p>
            </div>
            
            <div className="bg-red-50/80 p-5 rounded-2xl border border-red-100 shadow-inner flex flex-col justify-between">
              <div><p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-2"><span className="text-lg">⬆️</span> Egresos</p>
              <p className="text-3xl lg:text-4xl font-black text-red-900">${reporte.total_egresos}</p></div>
              <p className="text-xs text-red-700 mt-2 font-medium">Retiros de caja</p>
            </div>

            <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-100 shadow-inner flex flex-col justify-between">
              <div><p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Efectivo en Gaveta</p>
              <p className="text-3xl lg:text-4xl font-black text-blue-900">${fondoCaja + reporte.total_ingresos - reporte.total_egresos}</p></div>
              <p className="text-xs text-blue-700 mt-2 font-medium">Fondo + Ventas - Egresos</p>
            </div>
          </div>

          {/* Desglose de Métodos de Pago */}
          <h3 className="text-lg font-bold border-b border-gray-200/60 pb-2 mb-4 text-gray-800">Detalle de Ingresos por Método de Pago</h3>
          
          {reporte.desglose.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500 font-medium">No hay ventas registradas el día de hoy.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reporte.desglose.map((item) => (
                <div key={item.metodo_pago} className="flex justify-between items-center p-5 bg-white/60 rounded-xl border border-white/80 shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      {item.metodo_pago === 'EFECTIVO' ? '💵' : item.metodo_pago === 'TARJETA' ? '💳' : item.metodo_pago === 'ANOTADO' ? '📝' : '🏦'}
                    </div>
                    <span className="font-bold text-gray-700">{item.metodo_pago}</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900">${item.total_metodo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
