export default function VentasSuspendidasModal({
  isOpen, onClose, ventasSuspendidas, carrito,
  onSuspenderYCerrar, onRetomar, onEliminar,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-fondo)] border border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200/60 pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl drop-shadow-sm">⏱️</span>
            Ventas en Espera ({ventasSuspendidas.length}/3)
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {carrito.length > 0 && ventasSuspendidas.length < 3 && (
          <button
            onClick={onSuspenderYCerrar}
            className="w-full mb-3 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold py-2.5 rounded-xl transition shadow-sm border border-orange-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pausar Venta Actual
          </button>
        )}

        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {ventasSuspendidas.map(venta => (
            <div key={venta.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {venta.referencia}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
                    {venta.carrito.length} producto(s) · Pausada a las {venta.fecha}
                  </p>
                </div>
                <span className="text-lg sm:text-xl font-black text-gray-900">${venta.total}</span>
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => onEliminar(venta.id)}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2 rounded-lg text-xs sm:text-sm transition-colors">
                  Descartar
                </button>
                <button onClick={() => onRetomar(venta.id)}
                  className="flex-1 bg-[#91cf5b] text-white hover:bg-[#7ab848] font-bold py-2 rounded-lg text-xs sm:text-sm transition-colors shadow-sm">
                  Retomar Venta
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
