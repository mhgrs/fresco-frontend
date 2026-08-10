import { useState, useEffect } from 'react';
import { suscripcionService } from '../../services/suscripcion';

const BADGE = {
  activa:     'bg-green-100 text-green-700',
  vencida:    'bg-red-100 text-red-700',
  suspendida: 'bg-yellow-100 text-yellow-700',
};

function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

const WA_URL = 'https://wa.me/56987268235?text=' + encodeURIComponent('Hola, quiero más información sobre los planes de Fresco POS.');

export default function PortalSuscripcion() {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    suscripcionService.obtenerEstado()
      .then(res => setEstado(res.data))
      .catch(() => setError('No se pudo cargar la información de tu plan.'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="p-8 text-center text-gray-500">Cargando plan...</div>;

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">{error}</div>
  );

  const planActual = estado?.plan;
  const uso = estado?.uso;
  const porcentajeUso = uso ? Math.min(100, Math.round((uso.productos_activos / uso.max_productos) * 100)) : 0;
  const esGratis = planActual?.nombre === 'gratis';

  return (
    <div className="space-y-6 pb-6">

      {/* Plan actual */}
      <div className="bg-[var(--color-tarjeta)] border border-white/60 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Plan actual</p>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-3xl font-black text-gray-900">{planActual?.nombre_display ?? '—'}</h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BADGE[estado?.estado] ?? 'bg-gray-100 text-gray-600'}`}>
            {estado?.estado_display ?? '—'}
          </span>
        </div>
        {!esGratis && estado?.fecha_vencimiento && (
          <p className="text-sm text-gray-500 mb-4">
            Vence el <strong>{formatFecha(estado.fecha_vencimiento)}</strong>
            {' · '}{estado.modalidad === 'anual' ? 'Pago anual' : 'Pago mensual'}
          </p>
        )}

        {/* Barra de uso de productos */}
        {uso && (
          <div className={!esGratis && estado?.fecha_vencimiento ? '' : 'mt-4'}>
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
              <span>Productos activos</span>
              <span>{uso.productos_activos} / {uso.max_productos}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${porcentajeUso >= 90 ? 'bg-red-500' : porcentajeUso >= 70 ? 'bg-yellow-400' : 'bg-[#91cf5b]'}`}
                style={{ width: `${porcentajeUso}%` }}
              />
            </div>
            {porcentajeUso >= 90 && (
              <p className="text-xs text-red-600 font-semibold mt-1">
                Estás cerca del límite. Contáctanos para ampliar tu plan.
              </p>
            )}
          </div>
        )}
      </div>

      {/* CTA WhatsApp */}
      <div className="bg-[#91cf5b]/10 border border-[#91cf5b]/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="flex-1">
          <h3 className="text-lg font-black text-gray-900 mb-1">¿Quieres cambiar tu plan?</h3>
          <p className="text-sm text-gray-600">
            Escríbenos por WhatsApp y te ayudamos a elegir el plan que mejor se adapta a tu negocio.
          </p>
        </div>
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5c] text-white font-bold text-sm px-6 py-3 rounded-full transition-all active:scale-95 shadow-md">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Contactar por WhatsApp
        </a>
      </div>

    </div>
  );
}
