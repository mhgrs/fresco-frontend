import { formatCLP, fmtFecha, fmtHora } from '../../utils/format';
import FilaVacia from './FilaVacia';

export default function TabTurnos({ turnos, onRowClick }) {
  return (
    <table className="min-w-full divide-y divide-gray-100">
      <thead className="bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <tr>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Folio</th>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cajero</th>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Apertura</th>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cierre</th>
          <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Fondo Apertura</th>
          <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Fondo Cierre</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {turnos.length === 0
          ? <FilaVacia msg="No hay turnos en este período." />
          : turnos.map(t => (
              <tr key={t.id} onClick={() => onRowClick(t)}
                className="hover:bg-white/60 transition-colors cursor-pointer">
                <td className="px-5 py-3 text-sm font-black text-gray-700">#{t.folio}</td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-700">{t.cajero_nombre || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${t.estado === 'abierto' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.estado === 'abierto' ? 'Activo' : 'Cerrado'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm font-bold text-gray-700">{fmtFecha(t.fecha_apertura)}</p>
                  <p className="text-xs text-gray-400">{fmtHora(t.fecha_apertura)}</p>
                </td>
                <td className="px-5 py-3">
                  {t.fecha_cierre
                    ? <><p className="text-sm font-bold text-gray-700">{fmtFecha(t.fecha_cierre)}</p><p className="text-xs text-gray-400">{fmtHora(t.fecha_cierre)}</p></>
                    : <span className="text-xs text-green-600 font-bold">En curso</span>
                  }
                </td>
                <td className="px-5 py-3 text-right text-sm font-black text-gray-800">{formatCLP(t.fondo_apertura)}</td>
                <td className="px-5 py-3 text-right text-sm font-black">
                  {t.fondo_cierre != null
                    ? <span className="text-gray-800">{formatCLP(t.fondo_cierre)}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
              </tr>
            ))
        }
      </tbody>
    </table>
  );
}
