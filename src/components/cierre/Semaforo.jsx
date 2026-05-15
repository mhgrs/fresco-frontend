import { formatCLP } from '../../utils/format';

export default function Semaforo({ diferencia }) {
  const abs = Math.abs(diferencia);
  if (abs === 0)    return <span className="text-green-600 font-black">Sin diferencia</span>;
  if (abs <= 500)   return <span className="text-yellow-600 font-black">{formatCLP(diferencia)} (diferencia menor)</span>;
  return <span className="text-red-600 font-black">{formatCLP(diferencia)} (diferencia significativa)</span>;
}
