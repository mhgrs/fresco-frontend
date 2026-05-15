import { formatCLP } from '../../utils/format';

export default function BadgeDiferencia({ diferencia }) {
  if (diferencia === null || diferencia === undefined)
    return <span className="text-gray-300 text-xs">Sin arqueo</span>;
  const abs = Math.abs(diferencia);
  if (abs === 0)
    return <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">Sin diferencia</span>;
  if (abs <= 500)
    return <span className="text-xs font-black text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">{formatCLP(diferencia)}</span>;
  return <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{formatCLP(diferencia)}</span>;
}
