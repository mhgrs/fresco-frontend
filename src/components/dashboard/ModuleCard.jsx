import { Link } from 'react-router-dom';

/**
 * Tarjeta de módulo reutilizable para el Dashboard.
 * Si se provee `to`, renderiza un Link. Si se provee `onClick`, un button.
 * Con `bloqueado=true` muestra un badge de upgrade y estilos atenuados.
 *
 * Props: to?, onClick?, titulo, descripcion, icono, bloqueado?
 */
export default function ModuleCard({ to, onClick, titulo, descripcion, icono, bloqueado = false }) {
  const inner = (
    <>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 ${bloqueado ? 'bg-gray-200/40' : 'bg-[#91cf5b]/10'}`} />
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl shadow-sm border flex items-center justify-center mb-4 transition-colors duration-300 ${
          bloqueado
            ? 'bg-gray-100 text-gray-300 border-gray-100'
            : 'bg-white text-[#91cf5b] border-gray-100 group-hover:bg-[#91cf5b] group-hover:text-white'
        }`}>
          {icono}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className={`text-xl font-bold ${bloqueado ? 'text-gray-400' : 'text-gray-800'}`}>{titulo}</h2>
          {bloqueado && (
            <span className="text-[10px] font-black bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Upgrade
            </span>
          )}
        </div>
        <p className={`text-sm font-medium ${bloqueado ? 'text-gray-300' : 'text-gray-500'}`}>{descripcion}</p>
      </div>
      <div className={`flex justify-end relative z-10 transition-opacity ${bloqueado ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {bloqueado ? (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-[#91cf5b] transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        )}
      </div>
    </>
  );

  const cls = bloqueado
    ? 'relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-100 transition-all group flex flex-col justify-between h-52 overflow-hidden text-left opacity-70 hover:opacity-90 cursor-pointer'
    : 'relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1 text-left';

  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}
