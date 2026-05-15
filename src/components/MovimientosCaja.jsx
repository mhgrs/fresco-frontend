import { useState, useEffect, useCallback } from 'react';
import { ventasService } from '../services/ventas';
import ModalMovimiento from './pos/ModalMovimiento';
import { formatCLP } from '../utils/format';
import { logError } from '../utils/logger';

export default function MovimientosCaja() {
  const [cargando, setCargando] = useState(true);
  const [turno, setTurno] = useState(null);
  const [reporte, setReporte] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [tabActiva, setTabActiva] = useState('movimientos'); // 'movimientos' | 'historial'
  
  const [modalMovimiento, setModalMovimiento] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const cargarEstado = useCallback(async () => {
    setCargando(true);
    try {
      const resTurno = await ventasService.turnoActivo();
      setTurno(resTurno.data);
      const resReporte = await ventasService.reporteZ();
      setReporte(resReporte.data);
    } catch (err) {
      setTurno(null);
      setReporte(null);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarHistorial = useCallback(async () => {
    setCargando(true);
    try {
      const res = await ventasService.listarMovimientos?.() || { data: [] };
      setHistorial(res.data);
    } catch (err) {
      logError('MovimientosCaja', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (tabActiva === 'movimientos') {
      cargarEstado();
    } else {
      cargarHistorial();
    }
  }, [tabActiva, cargarEstado, cargarHistorial]);

  const handleMovimientoOk = () => {
    setModalMovimiento(null);
    cargarEstado();
  };

  const handleEliminar = async (id) => {
    setEliminando(id);
    try {
      await ventasService.eliminarMovimiento(id);
      cargarEstado();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar.');
    } finally {
      setEliminando(null);
    }
  };

  const movimientos = reporte?.movimientos ?? [];
  const totalIngresos = reporte?.total_ingresos_mov ?? 0;
  const totalRetiros  = reporte?.total_retiros_mov  ?? 0;
  const balance       = totalIngresos - totalRetiros;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto min-h-full bg-[var(--color-fondo)] transition-colors duration-500">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Movimientos de Caja</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Registra ingresos y retiros de efectivo no vinculados a ventas</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
        <button onClick={() => setTabActiva('movimientos')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tabActiva === 'movimientos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Turno Actual</button>
        <button onClick={() => setTabActiva('historial')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tabActiva === 'historial' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Historial General</button>
      </div>

      <div className="bg-[var(--color-tarjeta)] backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-5 sm:p-7 min-h-[400px]">
        {cargando ? (
          <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Cargando datos...</div>
        ) : tabActiva === 'movimientos' ? (
          !turno ? (
             <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Caja Cerrada</h3>
                <p className="text-gray-500 mt-2 font-medium">Abre un turno en el módulo de Cierre de Caja para registrar movimientos.</p>
             </div>
          ) : (
             <>
                <div className="flex flex-wrap gap-3 mb-6">
                  <button onClick={() => setModalMovimiento('ingreso')} className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all active:scale-95 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg> Registrar Ingreso</button>
                  <button onClick={() => setModalMovimiento('retiro')} className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all active:scale-95 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg> Registrar Retiro</button>
                </div>
                {(totalIngresos > 0 || totalRetiros > 0) && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Total ingresos</p>
                      <p className="text-2xl font-black text-green-700">{formatCLP(totalIngresos)}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Total retiros</p>
                      <p className="text-2xl font-black text-red-600">{formatCLP(totalRetiros)}</p>
                    </div>
                    <div className={`rounded-2xl p-4 text-center border ${balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Balance del Turno</p>
                      <p className={`text-2xl font-black ${balance >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>{balance >= 0 ? '+' : ''}{formatCLP(balance)}</p>
                    </div>
                  </div>
                )}
                {movimientos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-gray-400 font-semibold text-sm">No hay movimientos registrados en este turno.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-50">
                      {movimientos.map(m => (
                        <div key={m.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${m.tipo === 'ingreso' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <span className={`text-sm font-black ${m.tipo === 'ingreso' ? 'text-green-700' : 'text-red-600'}`}>{m.tipo === 'ingreso' ? '↓' : '↑'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${m.tipo === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.tipo === 'ingreso' ? 'Ingreso' : 'Retiro'}</span>
                              <span className="text-sm font-semibold text-gray-700">{m.concepto}</span>
                            </div>
                            {m.descripcion && <p className="text-xs text-gray-400 mt-0.5 truncate">{m.descripcion}</p>}
                            <p className="text-xs text-gray-300 mt-0.5">{m.hora}</p>
                          </div>
                          <span className={`text-lg font-black tabular-nums ${m.tipo === 'ingreso' ? 'text-green-700' : 'text-red-600'}`}>{m.tipo === 'ingreso' ? '+' : '−'}{formatCLP(m.monto)}</span>
                          <button onClick={() => handleEliminar(m.id)} disabled={eliminando === m.id} className="p-1.5 text-gray-200 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-40 flex-shrink-0" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </>
          )
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {historial.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium">El historial está vacío o no se ha encontrado conexión con la base de datos.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Fecha/Hora</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Concepto</th>
                    <th className="px-4 py-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {historial.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                       <td className="px-4 py-3 text-gray-600">{m.fecha || m.hora}</td>
                       <td className="px-4 py-3"><span className={`text-xs font-black px-2 py-0.5 rounded-full ${m.tipo === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.tipo === 'ingreso' ? 'Ingreso' : 'Retiro'}</span></td>
                       <td className="px-4 py-3 text-gray-700">{m.concepto}</td>
                       <td className={`px-4 py-3 text-right font-black ${m.tipo === 'ingreso' ? 'text-green-700' : 'text-red-600'}`}>{m.tipo === 'ingreso' ? '+' : '−'}{formatCLP(m.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {modalMovimiento && (
        <ModalMovimiento
          tipo={modalMovimiento}
          onClose={() => setModalMovimiento(null)}
          onSuccess={handleMovimientoOk}
        />
      )}
    </div>
  );
}