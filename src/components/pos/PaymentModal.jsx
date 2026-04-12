import { useState, useEffect } from 'react';

const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'ANOTADO'];

/**
 * Modal de cobro. Gestiona internamente el método de pago y el efectivo recibido.
 * Props:
 *   total        — número (total del carrito sin redondear)
 *   onConfirmar  — (metodoPago, totalRedondeado) => void
 *   onCerrar     — () => void
 *   procesando   — boolean
 */
export default function PaymentModal({ total, carrito = [], onConfirmar, onCerrar, procesando }) {
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [efectivoRecibido, setEfectivoRecibido] = useState('');
  
  const [imprimirBoleta, setImprimirBoleta] = useState(() => {
    const guardado = localStorage.getItem('pos_imprimir_boleta');
    return guardado !== null ? JSON.parse(guardado) : true; // true por defecto la primera vez
  });

  useEffect(() => {
    localStorage.setItem('pos_imprimir_boleta', JSON.stringify(imprimirBoleta));
  }, [imprimirBoleta]);

  const totalRedondeado =
    metodoPago === 'EFECTIVO' ? Math.round(total / 10) * 10 : total;

  // Calcular billetes sugeridos dinámicos (Mejora 6 Avanzada)
  const calcularBilletes = (monto) => {
    const base = [1000, 2000, 5000, 10000, 20000];
    let sugerencias = base.filter(b => b > monto);
    
    if (sugerencias.length < 3) {
      const m1 = Math.ceil(monto / 1000) * 1000;
      const m5 = Math.ceil(monto / 5000) * 5000;
      const m10 = Math.ceil(monto / 10000) * 10000;
      const extra = [m1, m5, m10, m10 + 10000, m10 + 20000].filter(v => v > monto);
      sugerencias = [...new Set([...sugerencias, ...extra])].sort((a,b) => a - b);
    }
    return sugerencias.slice(0, 3);
  };
  
  const billetesSugeridos = calcularBilletes(totalRedondeado);

  const vuelto = (parseFloat(efectivoRecibido) || 0) - totalRedondeado;

  const handleConfirmar = () => onConfirmar(metodoPago, totalRedondeado, imprimirBoleta);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-[var(--color-fondo)] border border-white/50 rounded-2xl sm:rounded-3xl m-5 p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onCerrar();
          }
          if (e.key === 'Enter' && !procesando && !(metodoPago === 'EFECTIVO' && vuelto < 0)) {
            handleConfirmar();
          }
          if (e.ctrlKey && e.key.toLowerCase() === 'e' && metodoPago === 'EFECTIVO') {
            e.preventDefault();
            setEfectivoRecibido(totalRedondeado.toString());
          }
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center mb-4 flex-none">
          <h2 className="text-xl font-bold text-gray-800">Procesar Pago</h2>
          {metodoPago === 'EFECTIVO' && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold">
              Atajo Exacto: Ctrl + E
            </span>
          )}
        </div>

        <div className="text-center mb-4 bg-white/60 p-3 rounded-xl shadow-inner border border-white/60 flex-none">
          <p className="text-gray-500 font-medium uppercase text-xs tracking-wider">Monto Total</p>
          <p className="text-3xl font-black text-gray-900 mt-1">${totalRedondeado}</p>
          {metodoPago === 'EFECTIVO' && total !== totalRedondeado && (
            <p className="text-[10px] sm:text-sm text-gray-500 mt-2 font-medium">
              Monto original: ${total} (Redondeado)
            </p>
          )}
        </div>

        {/* Resumen de la Venta (Lista de productos) */}
        {carrito.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto custom-scrollbar flex-none">
            {carrito.map(item => (
              <div key={item.id} className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                <span className="truncate pr-2">
                  <span className="font-bold text-gray-800 mr-1">{item.tipo_venta === 'UNIDAD' ? item.cantidad : Number(item.cantidad).toFixed(2)}x</span> 
                  {item.nombre}
                </span>
                <span className="font-bold text-gray-800">${Math.round(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>
        )}

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

            <div className="flex gap-2 mt-3 sm:mt-4">
              <button
                onClick={() => setEfectivoRecibido(totalRedondeado.toString())}
                className="flex-1 bg-green-100 text-green-800 font-bold py-2 rounded-lg text-xs sm:text-sm hover:bg-green-200 transition active:scale-95"
              >
                Exacto
              </button>
              {billetesSugeridos.map(billete => (
                <button
                  key={billete}
                  onClick={() => setEfectivoRecibido(billete.toString())}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-200 transition active:scale-95"
                >
                  ${billete}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Checkbox Imprimir Boleta */}
        <div className="mb-4 flex items-center justify-center gap-2 flex-none">
          <input
            type="checkbox"
            id="imprimirBoleta"
            checked={imprimirBoleta}
            onChange={(e) => setImprimirBoleta(e.target.checked)}
            className="w-4 h-4 text-[#91cf5b] focus:ring-[#91cf5b] border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="imprimirBoleta" className="text-sm text-gray-700 font-bold cursor-pointer select-none">
            Imprimir comprobante
          </label>
        </div>

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
