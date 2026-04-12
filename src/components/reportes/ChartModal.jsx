import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="label font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="font-black text-sm" style={{ color: entry.color }}>
          {`${entry.name}: ${entry.name === 'Ventas' ? '$' + new Intl.NumberFormat('es-CL').format(entry.value) : entry.value}`}
        </p>
      ))}
    </div>
  );
}

/**
 * Modal de gráfico genérico.
 *
 * Props:
 *   config — { data, xKey, yKey, lineDataKey?, title, barName, lineName?, color } | null
 *   onClose — () => void
 */
export default function ChartModal({ config, onClose }) {
  if (!config) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white/95 border border-gray-200 rounded-2xl shadow-2xl w-full max-w-4xl h-[70vh] p-4 sm:p-6 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-none">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">{config.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={config.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey={config.xKey} tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `$${new Intl.NumberFormat('es-CL').format(v)}`}
                tick={{ fontSize: 12 }}
                width={80}
              />
              {config.lineDataKey && (
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} width={40} />
              )}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(145, 207, 91, 0.1)' }} />
              <Legend />
              <Bar yAxisId="left" dataKey={config.yKey} name={config.barName} fill={config.color} radius={[4, 4, 0, 0]} />
              {config.lineDataKey && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={config.lineDataKey}
                  name={config.lineName}
                  stroke="#ff7300"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
