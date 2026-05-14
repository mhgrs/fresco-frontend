import { formatCLP, fmtFecha, fmtHora } from '../../utils/format';
import { TIPO_MOV } from './utils';
import FilaVacia from './FilaVacia';

export default function TabMovCaja({ movCaja, onRowClick }) {
  return (
    <table className="min-w-full divide-y divide-gray-100">
      <thead className="bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <tr>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha y Hora</th>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Concepto</th>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Realizado por</th>
          <th className="px-5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">N° Turno</th>
          <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Monto</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {movCaja.length === 0
          ? <FilaVacia msg="No hay movimientos de caja en este período." />
          : movCaja.map(m => {
              const cfg = TIPO_MOV[m.tipo] || { label: m.tipo, cls: 'bg-gray-100 text-gray-600' };
              return (
                <tr key={m.id} onClick={() => onRowClick(m)}
                  className="hover:bg-white/60 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold text-gray-700">{fmtFecha(m.fecha)}</p>
                    <p className="text-xs text-gray-400">{fmtHora(m.fecha)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.cls}`}>{cfg.label}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 font-medium">{m.concepto_display}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-700">{m.registrado_por_nombre || '—'}</td>
                  <td className="px-5 py-3 text-center text-sm font-bold text-gray-500">
                    {m.turno_folio ? `#${m.turno_folio}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-black text-gray-800">{formatCLP(m.monto)}</td>
                </tr>
              );
            })
        }
      </tbody>
    </table>
  );
}
