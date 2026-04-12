import React, { useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { sincronizarVentas } from '../../utils/syncVentas';

export default function NetworkStatusIndicator() {
  const { isOnline, pendingCount } = useNetworkStatus();
  const [showModal, setShowModal] = useState(false);

  // Si está online y no hay pendientes, no mostramos nada para mantener la interfaz limpia
  if (isOnline && pendingCount === 0) return null;

  const ventasOffline = JSON.parse(localStorage.getItem('ventas_offline')) || [];

  const descartarVenta = (id) => {
    if (!window.confirm('¿Seguro que deseas descartar esta venta atascada? Se perderá el registro.')) return;
    const filtradas = ventasOffline.filter(v => v.offline_id !== id);
    localStorage.setItem('ventas_offline', JSON.stringify(filtradas));
    window.dispatchEvent(new Event('ventas_offline_updated'));
    if (filtradas.length === 0) setShowModal(false);
  };

  return (
    <>
      <button 
        onClick={() => pendingCount > 0 && setShowModal(true)}
        disabled={pendingCount === 0 && isOnline}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isOnline ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer shadow-sm ring-2 ring-yellow-400' : 'bg-red-100 text-red-800 cursor-pointer hover:bg-red-200 shadow-sm'}`}
        title={pendingCount > 0 ? "Ver ventas pendientes" : "Sin conexión"}
      >
        {!isOnline ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l16 16" />
            </svg>
            <span>Modo Offline</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Cola Atascada</span>
          </>
        )}
        
        {pendingCount > 0 && (
          <span className="ml-2 bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold text-black">
            {pendingCount}
          </span>
        )}
      </button>

      {showModal && pendingCount > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 text-left">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Ventas en Cola ({pendingCount})</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Estas ventas no han podido sincronizarse. Puede deberse a un error de conexión inestable o problemas en el servidor.
            </p>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {ventasOffline.map(v => (
                <div key={v.offline_id} className="border border-red-200 bg-red-50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">${v.total}</p>
                    <p className="text-xs text-gray-600 mt-1">{v.detalles.length} producto(s) • {v.metodo_pago}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">ID: {v.offline_id.substring(0, 8)}...</p>
                  </div>
                  <button onClick={() => descartarVenta(v.offline_id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow transition-colors">
                    Descartar
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => { sincronizarVentas(); setShowModal(false); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow"
              >
                Forzar Reintento Global
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}