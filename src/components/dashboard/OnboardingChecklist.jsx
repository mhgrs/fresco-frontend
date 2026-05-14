import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PASOS = [
  {
    id: 'primer_producto',
    titulo: 'Agrega tu primer producto',
    descripcion: 'Crea un producto con nombre, precio y stock inicial.',
    ruta: '/inventario/nuevo',
    cta: 'Crear producto',
  },
  {
    id: 'primera_venta',
    titulo: 'Registra tu primera venta',
    descripcion: 'Abre el Punto de Venta y procesa una venta de prueba.',
    ruta: '/pos',
    cta: 'Ir al POS',
  },
 /*  {
    id: 'configurar_empresa',
    titulo: 'Configura tu empresa',
    descripcion: 'Agrega el logo y los datos fiscales de tu negocio.',
    ruta: '/configuracion',
    cta: 'Ir a configuración',
  }, */
];

const KEY = 'onboarding_completados';

function leerCompletados() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export default function OnboardingChecklist() {
  const navigate = useNavigate();
  const [completados, setCompletados] = useState(leerCompletados);
  const [cerrado, setCerrado] = useState(() => localStorage.getItem('onboarding_cerrado') === '1');

  const pendientes = PASOS.filter(p => !completados.includes(p.id));

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(completados));
  }, [completados]);

  if (cerrado || pendientes.length === 0) return null;

  const marcar = (id) => {
    setCompletados(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const cerrar = () => {
    setCerrado(true);
    localStorage.setItem('onboarding_cerrado', '1');
  };

  const progreso = Math.round((completados.length / PASOS.length) * 100);

  return (
    <div className="mb-8 bg-white rounded-2xl border border-[#91cf5b]/30 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#91cf5b]/10 to-transparent border-b border-[#91cf5b]/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#91cf5b] flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Primeros pasos</h3>
            <p className="text-xs text-gray-500">{completados.length} de {PASOS.length} completados</p>
          </div>
        </div>
        <button onClick={cerrar} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100" title="Ocultar">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-1 bg-[#91cf5b] transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>

      {/* Lista de pasos */}
      <ul className="divide-y divide-gray-50">
        {PASOS.map((paso) => {
          const hecho = completados.includes(paso.id);
          return (
            <li key={paso.id} className={`flex items-center gap-4 px-5 py-3.5 ${hecho ? 'opacity-50' : ''}`}>
              <button
                onClick={() => marcar(paso.id)}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  hecho
                    ? 'bg-[#91cf5b] border-[#91cf5b]'
                    : 'border-gray-300 hover:border-[#91cf5b]'
                }`}
                title={hecho ? 'Marcar como pendiente' : 'Marcar como completado'}
              >
                {hecho && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${hecho ? 'line-through text-gray-400' : 'text-gray-800'}`}>{paso.titulo}</p>
                <p className="text-xs text-gray-500 mt-0.5">{paso.descripcion}</p>
              </div>
              {!hecho && (
                <button
                  onClick={() => { marcar(paso.id); navigate(paso.ruta); }}
                  className="text-xs font-semibold text-[#91cf5b] hover:text-[#7ab848] whitespace-nowrap transition flex-shrink-0"
                >
                  {paso.cta} →
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
