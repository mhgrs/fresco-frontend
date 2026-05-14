import CartItem from './CartItem';

export default function CartPanel({
  carrito, totalCarrito,
  onCambiarCantidad, onValidarCantidad, onActualizarBotones, onQuitar,
  onVaciar, onCobrar,
}) {
  return (
    <div className="w-5/12 bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl flex flex-col shadow-2xl h-full overflow-hidden">
      <div className="pt-2 pl-3 flex-none flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-2xl font-bold text-gray-800 truncate">Venta Actual</h2>
        </div>
        <div className="flex gap-2 pr-2 self-end sm:self-auto">
          {carrito.length > 0 && (
            <button
              onClick={onVaciar}
              title="Vaciar todo el carrito"
              className="text-[10px] sm:text-xs text-red-500 hover:bg-red-100 hover:text-red-600 font-bold flex items-center transition-colors p-1 sm:p-2 rounded-lg"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Vaciar
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 sm:px-6 space-y-2 sm:space-y-3 custom-scrollbar">
        {carrito.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500">
            <p className="font-medium text-xs sm:text-base">El carrito está vacío.</p>
          </div>
        ) : carrito.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onCambiarCantidad={onCambiarCantidad}
            onValidarCantidad={onValidarCantidad}
            onActualizarBotones={onActualizarBotones}
            onQuitar={onQuitar}
          />
        ))}
      </div>

      <div className="p-3 sm:p-6 bg-white/60 border-t border-white/80 flex-none">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <span className="text-sm sm:text-lg text-gray-600 font-semibold">Total</span>
          <span className="text-xl sm:text-4xl font-black text-gray-900 truncate" title={`$${totalCarrito}`}>
            ${totalCarrito}
          </span>
        </div>
        <button
          onClick={onCobrar}
          disabled={carrito.length === 0}
          className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-xl transition-all shadow-md sm:shadow-lg ${
            carrito.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#91cf5b] hover:bg-[#7ab848] hover:shadow-xl active:scale-95'
          }`}
        >
          COBRAR
        </button>
      </div>
    </div>
  );
}
