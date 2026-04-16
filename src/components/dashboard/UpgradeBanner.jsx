import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PLANES } from '../../constants/planes';

const planesDePago = PLANES.filter(p => p.precio_mensual > 0);

function getPlanFeature(plan) {
  switch(plan.nombre) {
    case 'Básico':
      return 'Accede a reportes detallados y control de turnos de caja.';
    case 'Pro':
      return 'Gestiona tu equipo con roles avanzados y movimientos de inventario.';
    case 'Empresa':
      return 'Ideal para equipos grandes con mayor volumen de productos y usuarios.';
    default:
      return 'Accede a más funciones con un plan de pago.';
  }
}

export default function UpgradeBanner({ usuario }) {
  // El banner se muestra a todos los usuarios que NO están en un plan de pago.
  // Esto incluye a los del plan 'Gratis' y a aquellos cuyo plan no esté definido.
  const esPlanDePago = planesDePago.some(p => p.nombre === usuario?.plan?.nombre);

  const [planIndex, setPlanIndex] = useState(0);

  useEffect(() => {
    // No iniciar el carrusel si el banner no se va a mostrar.
    if (esPlanDePago) return;

    const timer = setInterval(() => {
      setPlanIndex(prev => (prev + 1) % planesDePago.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [esPlanDePago]);

  // Si el usuario ya tiene un plan de pago, no se muestra el banner.
  if (esPlanDePago) {
    return null;
  }

  const planActual = planesDePago[planIndex];

  return (
    <div className="mt-12 bg-gray-900 text-white shadow-md rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
      <div className="w-full">
        <h3 className="text-2xl font-black tracking-tight">Desbloquea todo el potencial de Fresco</h3>
        <div key={planIndex} className="animate-fade-in h-12 flex items-center">
          <p className="text-gray-400 max-w-lg">
            <span className="font-bold text-white">{planActual.nombre}:</span> {getPlanFeature(planActual)}
          </p>
        </div>
      </div>
      <Link
        to="/configuracion?tab=pagos"
        className="bg-[#7ab848] hover:bg-[#91cf5b] text-white px-8 py-3 rounded-full font-bold text-base shadow-lg transition-all active:scale-95 whitespace-nowrap flex-shrink-0"
        style={{
          animation: 'fadeIn 0.3s ease-out 100ms forwards, pulse-grow 2.5s ease-in-out infinite 1.5s'
        }}
      >     
        Ver Planes
      </Link>
    </div>
  );
}