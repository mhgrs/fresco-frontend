import { useNavigate } from 'react-router-dom';

/**
 * Botón que navega a la vista anterior en el historial del navegador.
 * Si no hay historial (acceso directo, pestaña nueva), va al fallback.
 *
 * Props:
 *   fallback  — ruta a usar si no hay historial (default: '/dashboard')
 *   className — clases adicionales para el botón
 *   title     — tooltip (default: 'Volver')
 */
export default function BotonVolver({ fallback = '/dashboard', className = '', title = 'Volver' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-3 rounded-full backdrop-blur-md border shadow-sm transition-all bg-[var(--color-tarjeta)] border-white/60 text-gray-600 hover:bg-white hover:text-gray-800 flex items-center justify-center active:scale-95 ${className}`}
      title={title}
    >
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
}
