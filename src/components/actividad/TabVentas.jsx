import { formatCLP, fmtFecha, fmtHora } from '../../utils/format';
import { METODOS_PAGO } from '../../constants/metodoPago';
import FilaVacia from './FilaVacia';

export default function TabVentas({ ventas, onRowClick }) {
  return (
    <table className="min-w-full divide-y divide-gray-100">
      <thead className="bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <tr>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha y Hora</th>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Método</th>
          <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cajero</th>
          <th className="px-5 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Productos</th>
          <th className="px-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {ventas.length === 0
          ? <FilaVacia msg="No hay ventas en este período." />
          : ventas.map(v => {
              const m = METODOS_PAGO[v.metodo_pago] || { label: v.metodo_pago, cls: 'bg-gray-100 text-gray-600' };
              return (
                <tr key={v.id} onClick={() => onRowClick(v)}
                  className="hover:bg-white/60 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold text-gray-700">{fmtFecha(v.fecha)}</p>
                    <p className="text-xs text-gray-400">{fmtHora(v.fecha)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${m.cls}`}>{m.label}</span>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-600">{v.cajero_nombre || '—'}</td>
                  <td className="px-5 py-3 text-center text-sm font-bold text-gray-600">{v.detalles?.length ?? 0}</td>
                  <td className="px-5 py-3 text-right text-sm font-black text-gray-800">{formatCLP(v.total)}</td>
                </tr>
              );
            })
        }
      </tbody>
    </table>
  );
}
