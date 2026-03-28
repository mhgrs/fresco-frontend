import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage({ usuario }) {
  useEffect(() => {
    document.title = "Fresco - Sistema de Ventas Moderno";
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] text-gray-800 font-sans selection:bg-[#91cf5b] selection:text-white flex flex-col transition-colors duration-500">
      
      {/* Header / Barra Superior */}
      <header className="sticky top-0 z-50 bg-[var(--color-fondo)]/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Izquierda: Logo */}
          <div className="text-3xl font-black text-[#91cf5b] tracking-tighter">
            Fresco
          </div>
          
          {/* Centro: Links de Navegación */}
          <nav className="hidden md:flex space-x-8 text-sm font-bold text-gray-600">
            <a href="#productos" className="hover:text-[#91cf5b] transition-colors">Productos</a>
            <a href="#clientes" className="hover:text-[#91cf5b] transition-colors">Clientes</a>
            <a href="#documentacion" className="hover:text-[#91cf5b] transition-colors">Documentación</a>
            <a href="#nosotros" className="hover:text-[#91cf5b] transition-colors">Nosotros</a>
          </nav>

          {/* Derecha: Botón de Acción Dinámico */}
          <div>
            {usuario ? (
              <Link to="/dashboard" className="bg-[#91cf5b] hover:bg-[#7ab848] text-white px-6 py-2 rounded-full font-bold shadow-md transition-all active:scale-95 inline-block">
                Ir al Dashboard
              </Link>
            ) : (
              <Link to="/fresco-login" className="bg-[#91cf5b] hover:bg-[#7ab848] text-white px-6 py-2 rounded-full font-bold shadow-md transition-all active:scale-95 inline-block">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* Hero Section - Énfasis en la compañía */}
        <section className="py-24 px-6 text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            El sistema de ventas <br className="hidden md:block" /> 
            <span className="text-[#91cf5b]">Fresco</span> y moderno.
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-3xl mx-auto mb-10">
            Lleva la gestión de tu inventario y punto de venta al siguiente nivel. Diseñado para ser rápido, minimalista y completamente seguro.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to={usuario ? "/dashboard" : "/fresco-login"} className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all active:scale-95">
              Comenzar a vender
            </Link>
            <a href="#caracteristicas" className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold text-lg shadow-sm transition-all active:scale-95">
              Conoce más
            </a>
          </div>
        </section>

        {/* Clientes Section */}
        <section id="clientes" className="py-16 bg-white/60 border-y border-gray-200">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Empresas que confían en nosotros</p>
            <div className="flex justify-center items-center opacity-70 hover:opacity-100 transition-opacity duration-300">
              <span className="text-3xl font-black text-gray-800 tracking-tighter">Raíces de Numpay</span>
            </div>
          </div>
        </section>

        {/* Características PWA */}
        <section id="caracteristicas" className="py-24 px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                Lleva tu negocio en el bolsillo.
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Fresco no es solo una página web, es una <strong>Aplicación Web Progresiva (PWA)</strong>. Esto significa que se adapta perfectamente a cualquier dispositivo, ofreciendo una experiencia nativa sin instalaciones complicadas.
              </p>
              <ul className="space-y-5 mt-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-[#91cf5b]/20 text-[#7ab848] p-2 rounded-full mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Adaptabilidad Total</h4>
                    <p className="text-sm text-gray-500 mt-1">Úsalo en tu computadora, tablet o teléfono móvil. Se ajusta a cualquier tamaño de pantalla de manera natural.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-[#91cf5b]/20 text-[#7ab848] p-2 rounded-full mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Offline First</h4>
                    <p className="text-sm text-gray-500 mt-1">Sigue registrando ventas y agregando productos incluso si pierdes tu conexión a internet temporalmente.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Decoración Visual Abstracta */}
            <div className="md:w-1/2 w-full">
              <div className="bg-[var(--color-tarjeta)] backdrop-blur-sm border border-gray-200 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
                
                <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center justify-between">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-6 bg-[#91cf5b] rounded-full"></div>
                </div>
                <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-gray-800 pb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-black text-[#91cf5b] mb-4">Fresco</h3>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              El sistema de punto de venta que se adapta a tu ritmo, pensado para que la operación de tu negocio sea fluida y segura.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-gray-100">Empresa</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a></li>
              <li><a href="#clientes" className="hover:text-white transition-colors">Clientes</a></li>
              <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-gray-100">Servicios</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Punto de Venta</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Inventario Inteligente</a></li>
              <li><a href="#" className="hover:text-white transition-colors">App Móvil (PWA)</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-gray-100">Recursos</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#documentacion" className="hover:text-white transition-colors">Documentación</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Acerca de</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Fresco. Todos los derechos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Términos de servicio</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}