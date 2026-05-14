import { useNavigate } from 'react-router-dom';

export default function CajaCerradaOverlay({ estadoCaja }) {
  const navigate = useNavigate();

  if (estadoCaja === 'abierto') return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
        {estadoCaja === 'verificando' ? (
          <>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#91cf5b] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-sm">Verificando turno...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Caja cerrada</h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">
              No hay un turno abierto. Abre un turno en Apertura y Cierre de Caja para comenzar a vender.
            </p>
            <button
              onClick={() => navigate('/cierre-caja')}
              className="w-full py-3 bg-gray-900 hover:bg-gray-700 text-white font-black rounded-full transition-all active:scale-95"
            >
              Ir a Cierre de Caja
            </button>
          </>
        )}
      </div>
    </div>
  );
}
