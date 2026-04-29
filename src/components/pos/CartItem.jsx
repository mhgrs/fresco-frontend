/**
 * Fila de un producto en el carrito de venta.
 * Props:
 *   item                  — objeto del carrito ({ id, nombre, precio, tipo_venta, cantidad })
 *   onCambiarCantidad     — (id, valor) => void
 *   onValidarCantidad     — (id, tipoVenta) => void  (se llama al perder el foco)
 *   onActualizarBotones   — (id, delta, tipoVenta) => void
 *   onQuitar              — (id) => void
 */
export default function CartItem({
  item,
  onCambiarCantidad,
  onValidarCantidad,
  onActualizarBotones,
  onQuitar,
}) {
  const delta = item.tipo_venta === 'GRANEL' ? 0.1 : 1;

  return (
    <div className="flex flex-col xl:flex-row xl:items-center p-2 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl shadow-sm border border-white/80 gap-2 sm:gap-3">
      <div className="flex-1">
        <h3 className="font-bold text-xs sm:text-sm text-gray-800 line-clamp-2 sm:line-clamp-1 leading-tight">
          {item.nombre}
        </h3>
        <p className="text-[9px] sm:text-xs text-gray-500 font-medium mt-0.5">
          <span>${item.precio} {item.tipo_venta === 'GRANEL' ? '/ Kg' : 'c/u'}</span>
          {item.marca && <span className="font-semibold text-gray-600"> · {item.marca}</span>}
        </p>
      </div>

      <div className="flex items-center justify-between xl:justify-end w-full xl:w-auto gap-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => onActualizarBotones(item.id, -delta, item.tipo_venta)}
            className="bg-gray-200 w-6 h-6 sm:w-7 sm:h-7 rounded-md text-gray-700 font-bold hover:bg-gray-300 transition-colors flex items-center justify-center leading-none"
          >
            -
          </button>
          <input
            type="number"
            value={item.cantidad}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') { onCambiarCantidad(item.id, val); return; }
              if (Number(val) < 0) return;
              if (item.tipo_venta === 'GRANEL') {
                const dot = val.indexOf('.');
                if (dot !== -1 && val.length - dot - 1 > 3) return;
              }
              onCambiarCantidad(item.id, val);
            }}
            onBlur={() => onValidarCantidad(item.id, item.tipo_venta)}
            step={item.tipo_venta === 'GRANEL' ? '0.001' : '1'}
            min="0"
            className="w-12 sm:w-16 text-center border-0 shadow-inner bg-white/80 text-xs sm:text-sm font-bold border rounded-md py-1 px-0 sm:px-1 focus:outline-none focus:ring-1 focus:ring-[#91cf5b]"
          />
          <button
            onClick={() => onActualizarBotones(item.id, delta, item.tipo_venta)}
            className="bg-gray-200 w-6 h-6 sm:w-7 sm:h-7 rounded-md text-gray-700 font-bold hover:bg-gray-300 transition-colors flex items-center justify-center leading-none"
          >
            +
          </button>
        </div>

        <div className="text-right w-16 sm:w-20 flex items-center justify-end gap-1 sm:gap-2">
          <div className="font-black text-gray-800 text-xs sm:text-base truncate">
            ${Math.round(item.precio * (Number(item.cantidad) || 0))}
          </div>
          <button
            onClick={() => onQuitar(item.id)}
            className="text-gray-400 hover:text-red-500 p-1"
            title="Quitar del carrito"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
