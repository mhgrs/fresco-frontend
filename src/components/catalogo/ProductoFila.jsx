/**
 * Fila de la tabla de catálogo de productos.
 *
 * Props:
 *   producto        — objeto producto
 *   puedeAcceder    — boolean (esBodega): muestra botones de ajuste y edición
 *   puedeGestionar  — boolean (esSupervisor): muestra toggle visibilidad y eliminar
 *   onAjustar(producto)
 *   onEditar(id)
 *   onToggleEstado(id, estadoActual)
 *   onEliminar(id, nombre)
 */
export default function ProductoFila({ producto: prod, puedeAcceder, puedeGestionar, onAjustar, onEditar, onToggleEstado, onEliminar }) {
  return (
    <tr className={`hover:bg-white/40 transition-colors ${!prod.esta_activo ? 'opacity-60 bg-gray-50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{prod.sku}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${!prod.esta_activo ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {prod.nombre}
          </span>
          {!prod.esta_activo && (
            <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              Oculto
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{prod.marca}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-medium">${prod.precio}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${prod.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {prod.tipo_venta === 'UNIDAD' ? `${Math.round(prod.stock)} u` : `${parseFloat(prod.stock)} kg`}
        </span>
      </td>
      <td className="px-6 py-4">
        {prod.proveedores && (
          <div className="flex flex-wrap gap-1">
            {prod.proveedores.split(',').map((prov, i) => (
              <span key={i} className="text-[10px] px-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold shadow-sm whitespace-nowrap">
                {prov.trim()}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex justify-center space-x-4">
        {puedeAcceder && (
          <button onClick={() => onAjustar(prod)} title="Ajustar Stock" className="text-purple-600 hover:text-purple-900 transition-transform hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        )}
        {puedeAcceder && (
          <button onClick={() => onEditar(prod.id)} title="Editar" className="text-[#91cf5b] hover:text-[#7ab848] transition-transform hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
        {puedeGestionar && (
          <button
            onClick={() => onToggleEstado(prod.id, prod.esta_activo)}
            title={prod.esta_activo ? 'Ocultar' : 'Hacer visible'}
            className={`${prod.esta_activo ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'} transition-transform hover:scale-110`}
          >
            {prod.esta_activo
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            }
          </button>
        )}
        {puedeGestionar && (
          <button onClick={() => onEliminar(prod.id, prod.nombre)} title="Eliminar" className="text-red-500 hover:text-red-700 transition-transform hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
}
