import { useRef, useState } from 'react';
import { ventasService } from '../../services/ventas';
import { formatCLP } from '../../utils/format';
import Modal from '../ui/Modal';
import Semaforo from './Semaforo';
import TicketCierre from './TicketCierre';

export default function ModalConfirmaCierre({ reporte, turno, onClose, onSuccess }) {
  const [fondoContado, setFondoContado] = useState('');
  const [notas, setNotas]               = useState('');
  const [cerrando, setCerrando]         = useState(false);
  const [error, setError]               = useState('');
  const [turnoCerrado, setTurnoCerrado] = useState(null);
  const ticketRef                       = useRef(null);

  const efectivoEsperado = reporte?.efectivo_esperado ?? 0;
  const contado    = parseInt(fondoContado, 10) || 0;
  const diferencia = contado - efectivoEsperado;
  const hayConteo  = fondoContado !== '';

  const handleCerrar = async () => {
    setCerrando(true);
    setError('');
    try {
      const res = await ventasService.cerrarTurno(turno.id, hayConteo ? contado : efectivoEsperado, notas);
      localStorage.removeItem('turno_cache');
      setTurnoCerrado(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cerrar el turno.');
      setCerrando(false);
    }
  };

  const handleImprimir = () => {
    if (ticketRef.current) {
      ticketRef.current.style.display = 'block';
    }
    setTimeout(() => {
      window.print();
      if (ticketRef.current) {
        ticketRef.current.style.display = 'none';
      }
    }, 80);
  };

  // Estado post-cierre: mostrar opciones de imprimir y finalizar
  if (turnoCerrado) {
    return (
      <Modal onClose={() => { onSuccess(); }} closeOnOverlay={false}>
        <TicketCierre turno={turnoCerrado} ref={ticketRef} />

        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-900">Turno #{turnoCerrado.folio} cerrado</h3>
          <p className="text-sm text-gray-400 mt-1">¿Deseas imprimir el comprobante de cierre?</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleImprimir}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 rounded-full font-bold text-gray-700 hover:bg-gray-200 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir cierre
          </button>
          <button
            onClick={onSuccess}
            className="flex-1 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-700 transition-all text-sm active:scale-95"
          >
            Finalizar
          </button>
        </div>
      </Modal>
    );
  }

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
