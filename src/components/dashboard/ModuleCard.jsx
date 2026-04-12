import { Link } from 'react-router-dom';

/**
 * Tarjeta de módulo reutilizable para el Dashboard.
 * Si se provee `to`, renderiza un Link. Si se provee `onClick`, un button.
 *
 * Props: to?, onClick?, titulo, descripcion, icono
 */
export default function ModuleCard({ to, onClick, titulo, descripcion, icono }) {
  const inner = (
    <>
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
      <div className="relative z-10">
        <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
          {icono}
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">{titulo}</h2>
        <p className="text-gray-500 text-sm font-medium">{descripcion}</p>
      </div>
      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
        <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </>
  );

  const cls = "relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1 text-left";

  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}
