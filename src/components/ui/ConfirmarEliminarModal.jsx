export default function ConfirmarEliminarModal({ mensaje, onConfirmar, onCancelar, cargando = false, errorMensaje = '' }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl text-center">
        <h3 className="text-xl font-bold mb-2 text-red-600">¿Confirmar Eliminación?</h3>
        <p className="text-gray-600 mb-4">{mensaje}</p>
        {errorMensaje && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {errorMensaje}
          </p>
        )}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-800 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition disabled:opacity-50"
          >
            {cargando ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
