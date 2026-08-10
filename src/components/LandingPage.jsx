import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const WSP = 'https://wa.me/56987268235?text=Hola%2C%20quiero%20información%20sobre%20Fresco%20POS';

function IconWsp() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function LandingPage({ usuario }) {
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
            <a href="#contacto"        className="hover:text-[#91cf5b] transition-colors">Contacto</a>
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
            <a href="#contacto"
              className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold text-lg shadow-sm transition-all active:scale-95">
              Solicitar acceso
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

        {/* ── Contacto ───────────────────────────────────────────────────── */}
        <section id="contacto" className="py-24 px-6 bg-white/50 border-y border-gray-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-lg text-gray-500 mb-10">
              Escríbenos por WhatsApp y te activamos la cuenta en minutos.<br />
              Sin contratos ni tarjeta de crédito.
            </p>
            <a
              href={WSP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5a] text-white px-8 py-4 rounded-full font-black text-lg shadow-lg transition-all active:scale-95">
              <IconWsp />
              Solicitar acceso
            </a>
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
                a: 'Sí. Escríbenos por WhatsApp y lo activamos en minutos, sin burocracia.',
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
              <li><a href="#contacto"        className="hover:text-white transition-colors">Contacto</a></li>
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

    </div>
  );
}
