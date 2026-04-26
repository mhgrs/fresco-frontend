/**
 * Tarjeta de métrica para el panel de Reportes.
 *
 * Props:
 *   titulo    — string
 *   valor     — string | number
 *   subtitulo — string (opcional)
 *   icono     — ReactNode
 *   color     — 'green' | 'blue' | 'purple' | 'yellow' | 'orange'
 *   onClick   — () => void (opcional; convierte la tarjeta en botón)
 *   disabled  — boolean (default false)
 *   tendencia — { pct: number, positivo: boolean } | null  (badge opcional)
 */
export default function TarjetaMetrica({ titulo, valor, subtitulo, icono, color, onClick, disabled = false, tendencia = null }) {
  const colores = {
    green:  'bg-green-50 text-green-600 border-green-100',
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    orange: 'bg-orange-50 text-orange-500 border-orange-100',
  };
  const theme = colores[color] || colores.blue;
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      className={`bg-white/60 backdrop-blur-md border border-white/80 p-5 sm:p-6 rounded-3xl shadow-sm flex items-start gap-4 transition-transform text-left w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#91cf5b]' : ''}`}
    >
      <div className={`p-3 rounded-2xl ${theme} flex-shrink-0 shadow-inner`}>
        {icono}
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-bold text-gray-500 leading-tight uppercase tracking-wider">{titulo}</p>
        <p className="text-2xl sm:text-4xl font-black text-gray-800 mt-1 tracking-tight">{valor}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {subtitulo && <p className="text-xs text-gray-400 font-medium">{subtitulo}</p>}
          {tendencia !== null && (
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${tendencia.positivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {tendencia.positivo ? '▲' : '▼'} {Math.abs(tendencia.pct)}% vs sem. ant.
            </span>
          )}
        </div>
      </div>
    </Component>
  );
}
