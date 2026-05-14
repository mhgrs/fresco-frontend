import { useState } from 'react';
import { ventasService } from '../../services/ventas';

export default function SinTurno({ onTurnoAbierto }) {
  const [fondo, setFondo]       = useState('');
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError]       = useState('');

  const handleAbrir = async (e) => {
    e.preventDefault();
    const monto = parseInt(fondo, 10) || 0;
    if (monto < 0) { setError('El fondo no puede ser negativo.'); return; }
    setAbriendo(true);
    setError('');
    try {
      const res = await ventasService.abrirTurno(monto);
      onTurnoAbierto(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al abrir el turno.');
      setAbriendo(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-[var(--color-tarjeta)] border border-white/60 rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-1">Sin turno activo</h2>
        <p className="text-sm text-gray-400 mb-6">Abre un turno para comenzar a registrar ventas y movimientos.</p>

        <form onSubmit={handleAbrir} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Fondo inicial (CLP)
            </label>
            <input
              type="number" min="0"
              value={fondo}
              onChange={e => setFondo(e.target.value)}
              placeholder="Ej: 50000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white text-center text-lg font-black"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-red-600 font-semibold text-center">{error}</p>}

          <button type="submit" disabled={abriendo}
            className="w-full py-3 bg-gray-900 hover:bg-gray-700 text-white font-black rounded-full transition-all active:scale-95 disabled:opacity-50">
            {abriendo ? 'Abriendo...' : 'Abrir turno'}
          </button>
        </form>
      </div>
    </div>
  );
}
