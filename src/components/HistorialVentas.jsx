import React, { useState, useEffect } from 'react';
import { ventasService } from '../services/ventas';
import { formatCLP } from '../utils/format';
import { METODOS_PAGO } from '../constants/metodoPago';

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

export default function HistorialVentas() {
  const [ventas, setVentas]         = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [fechaDesde, setFechaDesde] = useState(hoy());
  const [fechaHasta, setFechaHasta] = useState(hoy());
  const [expandida, setExpandida]   = useState(null);
  const [errorFecha, setErrorFecha] = useState('');

  const buscar = async () => {
    if (fechaDesde > fechaHasta) {
      setErrorFecha('La fecha "Desde" no puede ser posterior a "Hasta".');
      return;
    }
    setErrorFecha('');
    setCargando(true);
    try {
      const res = await ventasService.listarHistorial({
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
      });
      setVentas(res.data?.results ?? res.data ?? []);
    } catch {
      setVentas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { buscar(); }, []);

  const totalRecaudado = ventas.reduce((s, v) => s + Number(v.total), 0);
  const ventaPromedio  = ventas.length > 0 ? Math.round(totalRecaudado / ventas.length) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full w-full max-w-[1200px] mx-auto flex flex-col bg-[var(--color-fondo)] transition-colors duration-500">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.anim-fade{animation:fadeIn 0.4s ease-out forwards}`}</style>

      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-black text-gray-800 tracking-tight">Historial de Ventas</h1>
        <p className="text-gray-500 mt-1 font-medium">Consulta y filtra las ventas registradas por período.</p>
      </div>

      {/* Filtro de fechas */}
      <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-sm p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            max={fechaHasta}
            onChange={e => setFechaDesde(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold focus:ring-2 focus:ring-[#91cf5b] outline-none transition"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            min={fechaDesde}
            max={hoy()}
            onChange={e => setFechaHasta(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold focus:ring-2 focus:ring-[#91cf5b] outline-none transition"
          />
        </div>
        <button
          onClick={buscar}
          disabled={cargando}
          className="px-6 py-3 bg-[#91cf5b] hover:bg-[#7ab848] text-white font-black rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      {errorFecha && (
        <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
          {errorFecha}
        </p>
      )}

      {/* Resumen */}
      {!cargando && ventas.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6 anim-fade">
          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-sm p-4 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recaudado</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800 mt-1">{formatCLP(totalRecaudado)}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-sm p-4 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transacciones</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800 mt-1">{ventas.length}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-sm p-4 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Venta Promedio</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800 mt-1">{formatCLP(ventaPromedio)}</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="flex-1 bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : ventas.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-gray-500 font-medium">No se encontraron ventas en este período.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white/60 backdrop-blur-md sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Método</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Productos</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ventas.map(v => {
                  const metodo  = METODOS_PAGO[v.metodo_pago] || { label: v.metodo_pago, cls: 'bg-gray-100 text-gray-600' };
                  const abierta = expandida === v.id;
                  const fecha   = new Date(v.fecha);
                  return (
                    <React.Fragment key={v.id}>
                      <tr className={`transition-colors ${abierta ? 'bg-white/50' : 'hover:bg-white/40'}`}>
                        <td className="px-5 py-3">
                          <p className="text-sm font-bold text-gray-700">{fecha.toLocaleDateString('es-CL')}</p>
                          <p className="text-xs text-gray-400">{fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${metodo.cls}`}>{metodo.label}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-sm font-bold text-gray-600">{v.detalles?.length ?? 0}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-black text-gray-800">{formatCLP(v.total)}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {v.detalles?.length > 0 && (
                            <button
                              onClick={() => setExpandida(abierta ? null : v.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className={`w-4 h-4 transition-transform duration-200 ${abierta ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>

                      {abierta && (
                        <tr className="bg-gray-50/60">
                          <td colSpan={5} className="px-8 py-3">
                            <div className="divide-y divide-gray-100">
                              {v.detalles.map((d, i) => (
                                <div key={i} className="flex items-center justify-between py-2 text-sm text-gray-600">
                                  <div>
                                    <span className="font-semibold text-gray-800">{d.producto_nombre}</span>
                                    <span className="text-xs text-gray-400 font-mono ml-2">{d.producto_sku}</span>
                                  </div>
                                  <div className="flex items-center gap-6 flex-shrink-0">
                                    <span className="text-gray-400 text-xs">
                                      {parseFloat(d.cantidad) % 1 === 0
                                        ? parseFloat(d.cantidad)
                                        : parseFloat(d.cantidad).toFixed(3)
                                      } × {formatCLP(d.precio_unitario)}
                                    </span>
                                    <span className="font-black text-gray-700 w-24 text-right">{formatCLP(d.subtotal)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
