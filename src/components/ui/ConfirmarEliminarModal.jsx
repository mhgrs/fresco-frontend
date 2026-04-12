/**
 * Modal genérico de confirmación de borrado.
 *
 * Props:
 *   mensaje     — string  (ej: "¿Eliminar el producto X?")
 *   onConfirmar — () => void
 *   onCancelar  — () => void
 */
export default function ConfirmarEliminarModal({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl text-center">
        <h3 className="text-xl font-bold mb-2 text-red-600">¿Confirmar Eliminación?</h3>
        <p className="text-gray-600 mb-6">{mensaje}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancelar}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-800 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
