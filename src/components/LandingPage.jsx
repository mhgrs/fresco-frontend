import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLANES } from '../constants/planes';

function formatPrecio(n) {
  return n === 0 ? 'Gratis' : `$${n.toLocaleString('es-CL')}`;
}

export default function LandingPage({ usuario }) {
  const [anual, setAnual] = useState(false);
  const [contactoAbierto, setContactoAbierto] = useState(false);
  const [formContacto, setFormContacto] = useState({ nombre: '', email: '', empresa: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleContacto = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await fetch('/api/inventario/usuarios/contacto/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formContacto),
      });
      setEnviado(true);
      setTimeout(() => { setContactoAbierto(false); setEnviado(false); setFormContacto({ nombre: '', email: '', empresa: '', mensaje: '' }); }, 3000);
    } catch {
      // silencioso — el email igual se intenta
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    document.title = 'Fresco — Sistema POS para tu negocio';
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] text-gray-800 font-sans selection:bg-[#91cf5b] selection:text-white flex flex-col transition-colors duration-500">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[var(--color-fondo)] backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-3xl font-black text-[#91cf5b] tracking-tighter">Fresco</div>

          <nav className="hidden md:flex space-x-8 text-sm font-bold text-gray-600">
            <a href="#caracteristicas" className="hover:text-[#91cf5b] transition-colors">Características</a>
            <a href="#precios"         className="hover:text-[#91cf5b] transition-colors">Precios</a>
            <a href="#faq"             className="hover:text-[#91cf5b] transition-colors">FAQ</a>
          </nav>

          <div>
            {usuario ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-600 hidden sm:block">
                  Hola, {usuario.nombre || usuario.username}
                </span>
                <Link to="/dashboard"
                  className="bg-[#91cf5b] hover:bg-[#7ab848] text-white px-6 py-2 rounded-full font-bold shadow-md transition-all active:scale-95">
                  Ir al Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/fresco-login"
                  className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link to="/registro"
                  className="bg-[#91cf5b] hover:bg-[#7ab848] text-white px-5 py-2 rounded-full text-sm font-bold shadow-md transition-all active:scale-95">
                  Comenzar gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            Vende más,<br className="hidden md:block" />
            <span className="text-[#91cf5b]"> gestiona menos.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-3xl mx-auto mb-10">
            Punto de venta, inventario y reportes en una sola aplicación. Sin instalaciones, desde cualquier dispositivo. Empieza gratis hoy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to={usuario ? '/dashboard' : '/registro'}
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all active:scale-95">
              Empezar gratis — sin tarjeta
            </Link>
            <a href="#precios"
              className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold text-lg shadow-sm transition-all active:scale-95">
              Ver planes
            </a>
          </div>
          <p className="mt-5 text-xs text-gray-400 font-medium">
            Plan Gratis permanente · Sin compromisos · Actualiza cuando quieras
          </p>
        </section>

        {/* ── Clientes ───────────────────────────────────────────────────── */}
        <section className="py-12 bg-white/60 border-y border-gray-200">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
              Negocios que confían en Fresco
            </p>
            <div className="flex justify-center items-center gap-12 flex-wrap opacity-60">
              <span className="text-2xl font-black text-gray-700 tracking-tighter">Raíces de Numpay</span>
            </div>
          </div>
        </section>

        {/* ── Características ────────────────────────────────────────────── */}
        <section id="caracteristicas" className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
              Todo lo que tu negocio necesita
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Sin módulos de pago extra. Sin letra chica. Todo incluido según tu plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icono: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                titulo: 'Punto de Venta',
                texto: 'Cobra con efectivo, tarjeta o transferencia. Escanea barcodes, aplica descuentos y emite el comprobante en segundos.',
              },
              {
                icono: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                titulo: 'Control de Inventario',
                texto: 'Conoce tu stock en tiempo real. Alertas automáticas cuando un producto llega al mínimo. Ingresos y retiros con trazabilidad completa.',
              },
              {
                icono: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                titulo: 'Reportes y Cierre de Caja',
                texto: 'Ventas por período, productos más vendidos y cuadratura de turno (Z). Toma decisiones con datos reales de tu negocio.',
              },
              {
                icono: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                titulo: 'Funciona en cualquier dispositivo',
                texto: 'Aplicación Web Progresiva (PWA): instálala en tu celular, tablet o PC sin pasar por la App Store. Actualizaciones automáticas.',
              },
              {
                icono: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                titulo: 'Multi-usuario con roles',
                texto: 'Asigna roles de ADMIN, SUPERVISOR, CAJERO o BODEGA. Cada persona accede solo a lo que necesita para operar.',
                texto: 'Asigna permisos específicos a tu equipo. Cada persona accede solo a lo que necesita para operar.',
              },
              {
                icono: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                ),
                titulo: 'Modo Offline',
                texto: 'Sin internet? Sin problema. Fresco sigue operando y sincroniza las ventas automáticamente cuando recuperas la conexión.',
              },
            ].map((f) => (
              <div key={f.titulo}
                className="bg-[var(--color-tarjeta)] backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#91cf5b]/15 text-[#5a9e2f] rounded-xl flex items-center justify-center mb-4">
                  {f.icono}
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{f.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Precios ────────────────────────────────────────────────────── */}
        <section id="precios" className="py-24 px-6 bg-white/50 border-y border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                Planes simples y transparentes
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                Precios en CLP. Sin costos ocultos. Cancela cuando quieras.
              </p>

              {/* Toggle mensual / anual */}
              <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setAnual(false)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!anual ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  Mensual
                </button>
                <button
                  onClick={() => setAnual(true)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${anual ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  Anual
                  <span className="bg-[#91cf5b] text-white text-[10px] font-black px-2 py-0.5 rounded-full">−2%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLANES.map((plan) => (
                <div key={plan.nombre}
                  className={`relative rounded-2xl p-6 flex flex-col border transition-all ${
                    plan.destacado
                      ? 'bg-gray-900 text-white border-gray-900 shadow-2xl scale-105'
                      : 'bg-[var(--color-tarjeta)] border-white/60 shadow-sm'
                  }`}>

                  {plan.destacado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#91cf5b] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        Más popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className={`font-black text-xl mb-1 ${plan.destacado ? 'text-white' : 'text-gray-900'}`}>
                      {plan.nombre}
                    </h3>
                    <p className={`text-xs leading-relaxed ${plan.destacado ? 'text-gray-400' : 'text-gray-500'}`}>
                      {plan.descripcion}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className={`text-4xl font-black ${plan.destacado ? 'text-white' : 'text-gray-900'}`}>
                      {plan.precio_mensual === null 
                        ? 'A convenir'
                        : plan.precio_mensual === 0
                          ? 'Gratis'
                          : formatPrecio(anual
                            ? Math.round(plan.precio_anual / 12)
                            : plan.precio_mensual)
                      }
                    </div>
                    {plan.precio_mensual !== null && plan.precio_mensual > 0 && (
                      <div className={`text-xs mt-1 ${plan.destacado ? 'text-gray-400' : 'text-gray-400'}`}>
                        {anual
                          ? `${formatPrecio(plan.precio_anual)}/año · Ahorra 2%`
                          : 'por mes · ajuste anual por IPC'}
                      </div>
                    )}
                    {plan.precio_mensual === null && (
                      <div className={`text-xs mt-1 ${plan.destacado ? 'text-gray-400' : 'text-gray-400'}`}>
                        Precio personalizado según acuerdo
                      </div>
                    )}
                  </div>

                  <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${plan.destacado ? 'text-gray-400' : 'text-gray-400'}`}>
                    {plan.productos === null ? 'Ilimitados' : plan.productos.toLocaleString('es-CL')} productos · {plan.usuarios} {plan.usuarios === 1 ? 'usuario' : 'usuarios'}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.caracteristicas.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#91cf5b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={plan.destacado ? 'text-gray-300' : 'text-gray-600'}>{c}</span>
                      </li>
                    ))}
                    {plan.bloqueadas.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm opacity-40">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className={plan.destacado ? 'text-gray-400' : 'text-gray-400'}>{c}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.ctaLink ? (
                    <Link to={plan.ctaLink}
                      className={`text-center py-3 rounded-full font-bold text-sm transition-all active:scale-95 ${
                        plan.destacado
                          ? 'bg-[#91cf5b] hover:bg-[#7ab848] text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}>
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      onClick={() => setContactoAbierto(true)}
                      className="text-center py-3 rounded-full font-bold text-sm transition-all active:scale-95 bg-gray-900 hover:bg-gray-800 text-white">
                      {plan.cta}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-8">
              Los precios son en CLP e incluyen IVA. El precio mensual puede ajustarse anualmente según el IPC, con aviso previo de 30 días.
            </p>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: '¿El plan Gratis tiene límite de tiempo?',
                a: 'No. El plan Gratis es permanente. Puedes usarlo con hasta 10 productos sin fecha de vencimiento. Cuando tu negocio crezca, puedes actualizar a un plan de pago en cualquier momento.',
              },
              {
                q: '¿Qué pasa si llego al límite de productos?',
                a: 'Fresco te avisa cuando te acercas al límite. Al alcanzarlo, no podrás agregar nuevos productos pero las ventas de los productos existentes siguen funcionando con normalidad. El negocio nunca se detiene.',
              },
              {
                q: '¿Puedo cambiar de plan en cualquier momento?',
                a: 'Sí. Puedes subir o bajar de plan cuando quieras desde la configuración de tu cuenta. Si pagas anual y cambias antes, se aplica un crédito proporcional.',
              },
              {
                q: '¿Qué métodos de pago aceptan?',
                a: 'Aceptamos tarjetas de débito y crédito, y transferencia bancaria. Todos los cobros son en CLP.',
              },
              {
                q: '¿Mis datos están seguros?',
                a: 'Sí. Toda la información se transmite cifrada (HTTPS), los datos se almacenan en servidores seguros y Fresco cumple con la Ley 19.628 de protección de datos personales de Chile. Nunca vendemos tu información a terceros.',
              },
              {
                q: '¿Funciona sin internet?',
                a: 'Fresco es una PWA con modo offline. Puedes seguir registrando ventas sin conexión y los datos se sincronizan automáticamente cuando se restablece internet.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-[var(--color-tarjeta)] border border-white/60 rounded-2xl p-6 shadow-sm cursor-pointer">
                <summary className="font-black text-gray-900 list-none flex justify-between items-center gap-4">
                  {q}
                  <svg className="w-5 h-5 flex-shrink-0 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA final ──────────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-gray-900 text-white text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Empieza hoy, gratis.
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Crea tu cuenta en menos de 2 minutos y lleva el control de tu negocio desde el primer día.
          </p>
          <Link to={usuario ? '/dashboard' : '/registro'}
            className="inline-block bg-[#91cf5b] hover:bg-[#7ab848] text-white px-10 py-4 rounded-full font-black text-lg shadow-lg transition-all active:scale-95">
            Crear cuenta gratis
          </Link>
          <p className="mt-4 text-xs text-gray-600">Sin tarjeta de crédito · Sin contratos</p>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-gray-800 pb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-black text-[#91cf5b] mb-3">Fresco</h3>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Sistema POS en la nube para comercios chilenos. Rápido, simple y sin instalaciones.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-100">Producto</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#caracteristicas" className="hover:text-white transition-colors">Características</a></li>
              <li><a href="#precios"         className="hover:text-white transition-colors">Precios</a></li>
              <li><a href="#faq"             className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-100">Empresa</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-100">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Términos de Servicio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} Fresco. Todos los derechos reservados.</p>
          <p className="mt-2 md:mt-0">Hecho en Chile 🇨🇱</p>
        </div>
      </footer>

      {/* ── Modal Contacto Empresa ───────────────────────────────────────── */}
      {contactoAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setContactoAbierto(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-gray-900 mb-1">Plan Empresa</h3>
            <p className="text-sm text-gray-500 mb-5">Cuéntanos sobre tu negocio y te contactamos con una propuesta.</p>

            {enviado ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✓</div>
                <p className="font-bold text-gray-900">¡Mensaje enviado!</p>
                <p className="text-sm text-gray-500 mt-1">Te contactaremos pronto a <strong>{formContacto.email}</strong></p>
              </div>
            ) : (
              <form onSubmit={handleContacto} className="space-y-3">
                <input
                  required placeholder="Tu nombre"
                  value={formContacto.nombre}
                  onChange={e => setFormContacto(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#91cf5b]"
                />
                <input
                  required type="email" placeholder="Correo electrónico"
                  value={formContacto.email}
                  onChange={e => setFormContacto(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#91cf5b]"
                />
                <input
                  required placeholder="Nombre del negocio"
                  value={formContacto.empresa}
                  onChange={e => setFormContacto(p => ({ ...p, empresa: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#91cf5b]"
                />
                <textarea
                  rows={3} placeholder="¿Cuántas sucursales? ¿Alguna consulta adicional? (opcional)"
                  value={formContacto.mensaje}
                  onChange={e => setFormContacto(p => ({ ...p, mensaje: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#91cf5b] resize-none"
                />
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setContactoAbierto(false)}
                    className="flex-1 py-2.5 bg-gray-100 rounded-full font-bold text-sm text-gray-700 hover:bg-gray-200 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={enviando}
                    className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-full font-bold text-sm transition-all disabled:opacity-50">
                    {enviando ? 'Enviando...' : 'Enviar consulta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
