import { useState } from 'react';
import { ventasService } from '../../services/ventas';
import { formatCLP, fmtFechaLarga } from '../../utils/format';
import Semaforo from './Semaforo';

export default function TurnoAjeno({ turno, reporte, onCerrado }) {
  const [fondoCierre, setFondoCierre] = useState('');
  const [notas, setNotas]             = useState('');
  const [cerrando, setCerrando]       = useState(false);
  const [error, setError]             = useState('');

  const efectivoEsperado = reporte?.efectivo_esperado ?? 0;
  const contado    = parseInt(fondoCierre, 10) || 0;
  const hayConteo  = fondoCierre !== '';
  const diferencia = contado - efectivoEsperado;

  const handleCerrar = async (e) => {
    e.preventDefault();
    setCerrando(true);
    setError('');
    try {
      await ventasService.cerrarTurno(
        turno.id,
        hayConteo ? contado : efectivoEsperado,
        notas,
      );
      localStorage.removeItem('turno_cache');
      onCerrado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cerrar el turno.');
      setCerrando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-amber-50 border border-amber-200 rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-black text-amber-900">Turno abierto por otro cajero</h2>
            <p className="text-sm text-amber-700 font-medium">
              Hay un turno activo de <span className="font-black">{turno.cajero_nombre || 'un cajero anterior'}</span>
            </p>
          </div>
        </div>

        <div className="bg-white/70 rounded-2xl p-4 mb-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Turno</span>
            <span className="font-bold text-gray-800">#{turno.folio}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Apertura</span>
            <span className="font-bold text-gray-800">{fmtFechaLarga(turno.fecha_apertura)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fondo apertura</span>
            <span className="font-bold text-gray-800">{formatCLP(turno.fondo_apertura)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2">
            <span className="text-gray-500">Efectivo esperado</span>
            <span className="font-black text-blue-700">{formatCLP(efectivoEsperado)}</span>
          </div>
        </div>

        <form onSubmit={handleCerrar} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Efectivo contado
            </label>
            <input
              type="number" min="0"
              value={fondoCierre}
              onChange={e => setFondoCierre(e.target.value)}
              placeholder={String(efectivoEsperado)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
            {hayConteo && (
              <p className="text-xs mt-1.5">
                Diferencia: <Semaforo diferencia={diferencia} />
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Notas del cierre
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Observaciones..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

          <button type="submit" disabled={cerrando}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-full transition-all active:scale-95 disabled:opacity-50 text-sm">
            {cerrando ? 'Cerrando...' : `Cerrar turno de ${turno.cajero_nombre || 'cajero anterior'} y abrir el mío`}
          </button>
        </form>
      </div>
    </div>
  );
}
