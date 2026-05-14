export default function KPICard({ label, valor, color, sub }) {
  const colores = {
    yellow: 'bg-yellow-50/80 border-yellow-100 text-yellow-900 text-yellow-600',
    green:  'bg-green-50/80 border-green-100 text-green-900 text-green-600',
    red:    'bg-red-50/80 border-red-100 text-red-900 text-red-600',
    blue:   'bg-blue-50/80 border-blue-100 text-blue-900 text-blue-600',
    purple: 'bg-purple-50/80 border-purple-100 text-purple-900 text-purple-600',
  };
  const [bg, , txt, lbl] = colores[color]?.split(' ') ?? ['bg-gray-50/80', '', 'text-gray-900', 'text-gray-600'];
  return (
    <div className={`${bg} border rounded-2xl p-5 flex flex-col justify-between shadow-inner`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${lbl ?? 'text-gray-500'}`}>{label}</p>
      <p className={`text-3xl font-black ${txt}`}>{valor}</p>
      {sub && <p className={`text-xs mt-2 font-medium ${lbl ?? 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
}
