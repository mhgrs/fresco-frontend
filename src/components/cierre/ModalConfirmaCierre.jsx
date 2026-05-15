import { useState } from 'react';
import { ventasService } from '../../services/ventas';
import { formatCLP } from '../../utils/format';
import Modal from '../ui/Modal';
import Semaforo from './Semaforo';

export default function ModalConfirmaCierre({ reporte, turno, onClose, onSuccess }) {
  const [fondoContado, setFondoContado] = useState('');
  const [notas, setNotas]               = useState('');
  const [cerrando, setCerrando]         = useState(false);
  const [error, setError]               = useState('');

  const efectivoEsperado = reporte?.efectivo_esperado ?? 0;
  const contado    = parseInt(fondoContado, 10) || 0;
  const diferencia = contado - efectivoEsperado;
  const hayConteo  = fondoContado !== '';

  const handleCerrar = async () => {
    setCerrando(true);
    setError('');
    try {
      await ventasService.cerrarTurno(turno.id, hayConteo ? contado : efectivoEsperado, notas);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cerrar el turno.');
      setCerrando(false);
    }
  };

  return (
    <Modal onClose={onClose} closeOnOverlay={false}>
      <h3 className="text-xl font-black text-gray-900 mb-1">Cerrar turno #{turno.folio}</h3>
      <p className="text-sm text-gray-400 mb-5">Confirma el arqueo antes de cerrar.</p>

      <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Fondo apertura</span>
          <span className="font-bold">{formatCLP(reporte?.fondo_apertura)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Ventas en efectivo</span>
          <span className="font-bold text-green-700">+{formatCLP(reporte?.efectivo_ventas)}</span>
        </div>
        {reporte?.total_ingresos_mov > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Ingresos manuales</span>
            <span className="font-bold text-green-700">+{formatCLP(reporte.total_ingresos_mov)}</span>
          </div>
        )}
        {reporte?.total_retiros_mov > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Retiros</span>
            <span className="font-bold text-red-600">−{formatCLP(reporte.total_retiros_mov)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
          <span className="font-bold text-gray-700">Efectivo esperado</span>
          <span className="font-black text-blue-700">{formatCLP(efectivoEsperado)}</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Efectivo contado
        </label>
        <input
          type="number" min="0"
          value={fondoContado}
          onChange={e => setFondoContado(e.target.value)}
          placeholder={String(efectivoEsperado)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
          autoFocus
        />
        {hayConteo && (
          <p className="text-xs mt-1.5">
            Diferencia: <Semaforo diferencia={diferencia} />
          </p>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Notas del cierre
        </label>
        <textarea
          rows={2}
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Observaciones del turno..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600 font-semibold mb-3">{error}</p>}

      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-2.5 bg-gray-100 rounded-full font-bold text-gray-700 hover:bg-gray-200 transition-all text-sm">
          Volver
        </button>
        <button onClick={handleCerrar} disabled={cerrando}
          className="flex-1 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-700 transition-all text-sm active:scale-95 disabled:opacity-50">
          {cerrando ? 'Cerrando...' : 'Cerrar turno'}
        </button>
      </div>
    </Modal>
  );
}
