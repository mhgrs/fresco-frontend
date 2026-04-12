import { useState } from 'react';

const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'ANOTADO'];

/**
 * Modal de cobro. Gestiona internamente el método de pago y el efectivo recibido.
 * Props:
 *   total        — número (total del carrito sin redondear)
 *   onConfirmar  — (metodoPago, totalRedondeado) => void
 *   onCerrar     — () => void
 *   procesando   — boolean
 */
export default function PaymentModal({ total, onConfirmar, onCerrar, procesando }) {
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [efectivoRecibido, setEfectivoRecibido] = useState('');

  const totalRedondeado =
    metodoPago === 'EFECTIVO' ? Math.round(total / 10) * 10 : total;
  const vuelto = (parseFloat(efectivoRecibido) || 0) - totalRedondeado;

  const handleConfirmar = () => onConfirmar(metodoPago, totalRedondeado);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-[var(--color-fondo)] border border-white/50 rounded-2xl sm:rounded-3xl m-5 p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex-none">Procesar Pago</h2>

        <div className="text-center mb-4 bg-white/60 p-3 rounded-xl shadow-inner border border-white/60 flex-none">
          <p className="text-gray-500 font-medium uppercase text-xs tracking-wider">Monto Total</p>
          <p className="text-3xl font-black text-gray-900 mt-1">${totalRedondeado}</p>
          {metodoPago === 'EFECTIVO' && total !== totalRedondeado && (
            <p className="text-[10px] sm:text-sm text-gray-500 mt-2 font-medium">
              Monto original: ${total} (Redondeado)
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 flex-none">
          {METODOS_PAGO.map(m => (
            <button
              key={m}
              onClick={() => setMetodoPago(m)}
              className={`p-2 text-[10px] sm:text-sm font-bold rounded-lg sm:rounded-xl border-2 flex items-center justify-center text-center transition-all duration-200 ${
                metodoPago === m
                  ? 'border-[#91cf5b] bg-white text-[#7ab848] shadow-md sm:shadow-lg scale-105'
                  : 'border-gray-200/80 bg-white/60 text-gray-600 hover:bg-white hover:border-gray-300'
              }`}
            >
              {m === 'TRANSFERENCIA' ? (
                <>
                  <span className="hidden sm:inline">TRANSFERENCIA</span>
                  <span className="sm:hidden">TRANSF.</span>
                </>
              ) : m}
            </button>
          ))}
        </div>

        {metodoPago === 'EFECTIVO' && (
          <div className="mb-4 bg-white/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/60 flex-none">
            <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 font-semibold">
              Efectivo Recibido:
            </label>
            <input
              type="number"
              autoFocus
              className="w-full p-2 sm:p-3 border border-gray-300/80 bg-white/80 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#91cf5b] text-lg sm:text-2xl font-bold text-gray-800"
              value={efectivoRecibido}
              onChange={(e) => setEfectivoRecibido(e.target.value)}
            />
            <div
              className={`mt-3 sm:mt-4 text-base sm:text-2xl font-bold flex justify-between ${
                vuelto >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>Vuelto:</span>
              <span>${vuelto >= 0 ? vuelto : 0}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3 sm:space-x-4 mt-auto pt-2 flex-none">
          <button
            onClick={onCerrar}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-sm sm:text-base text-gray-700 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={procesando || (metodoPago === 'EFECTIVO' && vuelto < 0)}
            className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl font-bold py-3 text-sm sm:text-base text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {procesando ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
}
