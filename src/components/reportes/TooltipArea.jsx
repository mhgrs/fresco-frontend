import { formatCLP } from '../../utils/format';

export default function TooltipArea({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200">
      <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
      <p className="text-base font-black text-[#91cf5b]">{formatCLP(payload[0]?.value)}</p>
    </div>
  );
}
