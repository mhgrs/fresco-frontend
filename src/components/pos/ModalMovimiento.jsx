import { useState } from 'react';
import { ventasService } from '../../services/ventas';

const CONCEPTOS = [
  { value: 'cambio',      label: 'Cambio / vuelto adicional' },
  { value: 'proveedor',   label: 'Pago a proveedor' },
  { value: 'traslado',    label: 'Traslado a caja fuerte' },
  { value: 'fondo_extra', label: 'Fondo adicional' },
  { value: 'devolucion',  label: 'Devolución a cliente' },
  { value: 'otro',        label: 'Otro' },
];

export default function ModalMovimiento({ tipo: tipoProp, onClose, onSuccess }) {
  const [form, setForm] = useState({ tipo: tipoProp, concepto: 'otro', descripcion: '', monto: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const monto = parseInt(form.monto, 10);
    if (!monto || monto <= 0) { setError('Ingresa un monto válido.'); return; }
    setEnviando(true);
    setError('');
    try {
      await ventasService.registrarMovimiento({
        tipo:        form.tipo,
        concepto:    form.concepto,
        descripcion: form.descripcion,
        monto,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.monto?.[0] || 'Error al registrar.');
      setEnviando(false);
    }
  };

  const esIngreso = form.tipo === 'ingreso';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-xl font-black text-gray-900 mb-5">
          {esIngreso ? '+ Registrar Ingreso' : '− Registrar Retiro'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toggle tipo */}
          <div className="flex bg-gray-100 rounded-full p-1 text-sm">
            {['ingreso', 'retiro'].map(t => (
              <button
                key={t} type="button"
                onClick={() => setForm(f => ({ ...f, tipo: t }))}
                className={`flex-1 py-1.5 rounded-full font-bold transition-all capitalize ${
                  form.tipo === t ? 'bg-white shadow text-gray-900' : 'text-gray-400'
                }`}
              >
                {t === 'ingreso' ? '↓ Ingreso' : '↑ Retiro'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Concepto</label>
            <select value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white">
              {CONCEPTOS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</label>
            <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Detalle adicional..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monto (CLP)</label>
            <input type="number" min="1" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} placeholder="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white" autoFocus />
          </div>

          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-full font-bold text-gray-700 hover:bg-gray-200 transition-all text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={enviando} className={`flex-1 py-2.5 rounded-full font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-50 ${esIngreso ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {enviando ? 'Registrando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}