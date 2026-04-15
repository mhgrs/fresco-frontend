import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { suscripcionService } from '../../services/suscripcion';

const BADGE = {
  activa:     'bg-green-100 text-green-700',
  vencida:    'bg-red-100 text-red-700',
  suspendida: 'bg-yellow-100 text-yellow-700',
};

const ESTADO_PAGO = {
  pagado:    { cls: 'bg-green-100 text-green-700',  label: 'Pagado' },
  pendiente: { cls: 'bg-yellow-100 text-yellow-700', label: 'Pendiente' },
  fallido:   { cls: 'bg-red-100 text-red-700',       label: 'Fallido' },
  anulado:   { cls: 'bg-gray-100 text-gray-500',     label: 'Anulado' },
};

function formatCLP(n) {
  return n === 0 ? 'Gratis' : `$${Number(n).toLocaleString('es-CL')}`;
}

function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TOAST_CONFIG = {
  ok:       { tipo: 'success', icono: '✓', texto: 'Pago recibido. Tu plan ha sido actualizado.' },
  error:    { tipo: 'error',   icono: '✗', texto: 'El pago no pudo procesarse. Intenta nuevamente.' },
  pendiente:{ tipo: 'warning', icono: '⏳', texto: 'El pago está siendo procesado. Te notificaremos por email.' },
};

export default function PortalSuscripcion() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resultadoPago = searchParams.get('pago'); // 'ok' | 'error' | 'pendiente' | null

  const [estado, setEstado]       = useState(null);
  const [planes, setPlanes]       = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [modalidad, setModalidad] = useState('mensual');
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);
  const [toast, setToast]         = useState(resultadoPago ? TOAST_CONFIG[resultadoPago] ?? null : null);
  const [mensaje, setMensaje]     = useState(null);
  const historialRef              = useRef(null);

  // Limpiar ?pago= de la URL y auto-scroll al historial
  useEffect(() => {
    if (!resultadoPago) return;
    // Borrar param de la URL para que no reaparezca en refresh
    setSearchParams(prev => { prev.delete('pago'); return prev; }, { replace: true });
    // Auto-scroll al historial después de que cargue
    const timer = setTimeout(() => {
      historialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
    // Auto-dismiss toast a los 7 segundos
    const dismiss = setTimeout(() => setToast(null), 7000);
    return () => { clearTimeout(timer); clearTimeout(dismiss); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargar = async () => {
    try {
      const [resEstado, resPlanes, resHistorial] = await Promise.all([
        suscripcionService.obtenerEstado(),
        suscripcionService.listarPlanes(),
        suscripcionService.obtenerHistorial(),
      ]);
      setEstado(resEstado.data);
      setPlanes(resPlanes.data.filter(p => p.nombre !== 'gratis'));
      setHistorial(resHistorial.data);
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo cargar la información de tu plan.' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const iniciarPago = async (plan) => {
    setProcesando(true);
    try {
      const res = await suscripcionService.iniciarPago(plan.nombre, modalidad);
      window.location.href = res.data.redirect_url;
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar el pago.';
      setMensaje({ tipo: 'error', texto: msg });
      setProcesando(false);
    }
  };

  const cancelarSuscripcion = async () => {
    setProcesando(true);
    try {
      await suscripcionService.cancelar();
      setMensaje({ tipo: 'success', texto: 'Suscripción cancelada. Ahora estás en el plan Gratis.' });
      setConfirmarCancelar(false);
      await cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al cancelar.' });
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center text-gray-500">Cargando plan...</div>;

  const planActual = estado?.plan;
  const uso = estado?.uso;
  const porcentajeUso = uso ? Math.min(100, Math.round((uso.productos_activos / uso.max_productos) * 100)) : 0;
  const esGratis = planActual?.nombre === 'gratis';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-black text-gray-900">Mi Suscripción</h1>

      {/* Toast flotante resultado del pago */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-semibold text-sm max-w-sm w-full transition-all animate-in slide-in-from-bottom-4 ${
          toast.tipo === 'success' ? 'bg-green-600 text-white' :
          toast.tipo === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-red-600 text-white'
        }`}>
          <span className="text-xl">{toast.icono}</span>
          <span className="flex-1">{toast.texto}</span>
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 text-lg leading-none">✕</button>
        </div>
      )}

      {/* Banner de acciones internas (cancelar, errores de carga) */}
      {mensaje && (
        <div className={`px-5 py-4 rounded-xl font-semibold text-sm flex items-center gap-3 ${
          mensaje.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          mensaje.tipo === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {mensaje.tipo === 'success' ? '✓' : mensaje.tipo === 'warning' ? '⏳' : '✗'}
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} className="ml-auto opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Plan actual */}
      <div className="bg-[var(--color-tarjeta)] border border-white/60 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Plan actual</p>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-gray-900">{planActual?.nombre_display ?? '—'}</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BADGE[estado?.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                {estado?.estado_display ?? '—'}
              </span>
            </div>
            {!esGratis && estado?.fecha_vencimiento && (
              <p className="text-sm text-gray-500 mt-1">
                Próximo cobro: <strong>{formatFecha(estado.fecha_proximo_cobro)}</strong>
                {' · '}{estado.modalidad === 'anual' ? 'Pago anual' : 'Pago mensual'}
                {' · '}{formatCLP(estado.precio_pagado)}
              </p>
            )}
          </div>
          {!esGratis && (
            <button
              onClick={() => setConfirmarCancelar(true)}
              className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
              disabled={procesando}>
              Cancelar suscripción
            </button>
          )}
        </div>

        {/* Barra de uso de productos */}
        {uso && (
          <div>
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
                Estás cerca del límite. Actualiza tu plan para agregar más productos.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Planes disponibles para upgrade */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-black text-gray-900">Planes disponibles</h2>
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 text-sm">
            <button
              onClick={() => setModalidad('mensual')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${modalidad === 'mensual' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Mensual
            </button>
            <button
              onClick={() => setModalidad('anual')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${modalidad === 'anual' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Anual
              <span className="bg-[#91cf5b] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">−8%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {planes.map(plan => {
            const esPlanActual = planActual?.nombre === plan.nombre;
            const precio = modalidad === 'anual'
              ? Math.round(plan.precio_anual / 12)
              : plan.precio_mensual;

            return (
              <div key={plan.nombre}
                className={`rounded-2xl p-5 border flex flex-col gap-4 transition-all ${
                  esPlanActual
                    ? 'border-[#91cf5b] bg-[#91cf5b]/5 shadow-md'
                    : 'border-gray-200 bg-white'
                }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black text-gray-900 text-lg">{plan.nombre_display}</h3>
                    {esPlanActual && (
                      <span className="text-[10px] font-black bg-[#91cf5b] text-white px-2 py-0.5 rounded-full">Actual</span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {formatCLP(precio)}
                    {precio > 0 && <span className="text-xs font-medium text-gray-400">/mes</span>}
                  </div>
                  {modalidad === 'anual' && (
                    <p className="text-xs text-gray-400">{formatCLP(plan.precio_anual)}/año</p>
                  )}
                </div>
                <ul className="text-xs text-gray-600 space-y-1 flex-1">
                  <li>✓ {plan.max_productos.toLocaleString('es-CL')} productos</li>
                  <li>✓ {plan.max_usuarios} usuarios</li>
                  <li>✓ Reportes y Cierre de Caja</li>
                </ul>
                <button
                  onClick={() => iniciarPago(plan)}
                  disabled={esPlanActual || procesando}
                  className={`py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                    esPlanActual
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'bg-gray-900 hover:bg-gray-700 text-white'
                  } disabled:opacity-50`}>
                  {esPlanActual ? 'Plan actual' : procesando ? 'Redirigiendo...' : 'Seleccionar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de pagos */}
      {historial.length > 0 && (
        <div ref={historialRef}>
          <h2 className="text-lg font-black text-gray-900 mb-4">Historial de pagos</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Modalidad</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historial.map(p => {
                  const est = ESTADO_PAGO[p.estado] ?? ESTADO_PAGO.pendiente;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">{formatFecha(p.fecha_creacion)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{p.plan_nombre}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{p.modalidad}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCLP(p.monto)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${est.cls}`}>{est.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal confirmar cancelación */}
      {confirmarCancelar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-2">¿Cancelar suscripción?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Tu plan pasará a <strong>Gratis</strong> inmediatamente. Podrás seguir usando los productos actuales
              hasta el límite de 10. No se realizarán más cobros.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmarCancelar(false)}
                className="px-5 py-2 bg-gray-100 rounded-full font-bold text-gray-700 hover:bg-gray-200 transition-all">
                Mantener plan
              </button>
              <button
                onClick={cancelarSuscripcion}
                disabled={procesando}
                className="px-5 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all disabled:opacity-50">
                {procesando ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
