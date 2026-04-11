import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productosService } from '../services/productos';
import { useClickOutside } from '../hooks/useClickOutside';

export default function Dashboard({ usuario, cerrarSesion }) {
  const [alertas, setAlertas] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const dropdownRef = useRef(null);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const ajustesRef = useRef(null);
  const [submenuActivo, setSubmenuActivo] = useState(null);

  useEffect(() => {
    document.title = "Fresco";

    if (usuario.roles?.includes('ADMIN') || usuario.is_superuser) {
      productosService.listarStockBajo()
        .then(res => {
          const alertas = Array.isArray(res.data) ? res.data : res.data.results ?? [];
          setAlertas(alertas);
          localStorage.setItem('alertas_offline', JSON.stringify(alertas));
        })
        .catch(err => {
          console.error("Error cargando alertas:", err);
          const cache = localStorage.getItem('alertas_offline');
          if (cache) {
            setAlertas(JSON.parse(cache));
          }
        });
    }
  }, [usuario.roles, usuario.is_superuser]);

  const cerrarNotificaciones = useCallback(() => setMostrarNotificaciones(false), []);
  const cerrarAjustes = useCallback(() => setMostrarAjustes(false), []);
  useClickOutside(dropdownRef, cerrarNotificaciones);
  useClickOutside(ajustesRef, cerrarAjustes);

/*  */  // Obtener fecha actual formateada
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const fechaCapitalizada = fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1);

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] py-6 lg:py-6 px-6 lg:px-16 xl:px-24 transition-colors duration-500 font-sans">
      <div className="max-w-6xl mx-auto relative">
        
        {/* Encabezado Superior */}
        <div className="flex flex-row justify-between items-start md:items-center mb-10 md:mb-12 gap-4 relative z-20">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-[#91cf5b] tracking-widest uppercase mb-1">Fresco</h1>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight truncate">
              Hola, {(usuario.nombre || usuario.username).split(' ')[0]} 👋
            </h2> 
            <p className="text-gray-500 text-xs md:text-base mt-1 md:mt-2 font-medium truncate">
              {fechaCapitalizada}
            </p>
          </div>
          
          {/* Acciones Superiores */}
          <div className="flex items-center gap-2 mt-3 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center bg-[var(--color-tarjeta)] backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/60">
               <span className="text-sm font-bold text-gray-700">
                 {usuario.empresa_nombre || 'Mi Empresa'}
               </span>
            </div>

            {/* Notificaciones (Campana) */}
            {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)} 
                  className={`relative p-3 rounded-full backdrop-blur-md border shadow-sm transition-all ${mostrarNotificaciones ? 'bg-white border-gray-200 text-[#91cf5b]' : 'bg-[var(--color-tarjeta)] border-white/60 text-gray-600 hover:bg-white hover:text-[#91cf5b]'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  {alertas.length > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow border-2 border-white">
                      {alertas.length}
                    </span>
                  )}
                </button>

                {/* Desplegable de Alertas */}
                {mostrarNotificaciones && (
                  <div className="absolute right-0  mt-3 w-[70vw] sm:w-80 max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform origin-top-right transition-all z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <span className="font-bold text-gray-800 text-sm">Alertas Recientes</span>
                      {alertas.length > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">{alertas.length} Novedades</span>}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {alertas.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm font-medium">Todo está bajo control. No hay alertas de stock. 🎉</div>
                      ) : (
                        alertas.slice(0, 4).map(alerta => (
                          <div key={alerta.id} className="p-4 border-b border-gray-50 hover:bg-red-50/50 transition-colors flex justify-between items-center group">
                            <div className="pr-4">
                              <p className="text-sm font-bold text-gray-800 line-clamp-1">{alerta.nombre}</p>
                              <p className="text-xs text-red-500 font-medium mt-0.5">Stock actual: {alerta.tipo_venta === 'UNIDAD' ? Math.round(alerta.stock) : Number(alerta.stock).toFixed(2)}</p>
                            </div>
                            <span className="w-2 h-2 bg-red-500 rounded-full group-hover:scale-150 transition-transform"></span>
                          </div>
                        ))
                      )}
                    </div>
                    {alertas.length > 0 && (
                      <Link to="/alertas" className="block p-3 text-center text-sm font-bold text-[#91cf5b] hover:bg-[#91cf5b] hover:text-white transition-colors" onClick={() => setMostrarNotificaciones(false)}>
                        Ver todas las alertas →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Botón de Ajustes (Engranaje) */}
            <div className="relative" ref={ajustesRef}>
              <button 
                onClick={() => setMostrarAjustes(!mostrarAjustes)}
                className={`p-3 rounded-full backdrop-blur-md border shadow-sm transition-all ${mostrarAjustes ? 'bg-white border-gray-200 text-gray-800' : 'bg-[var(--color-tarjeta)] border-white/60 text-gray-600 hover:bg-white hover:text-gray-800'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>

              {/* Desplegable de Ajustes */}
              {mostrarAjustes && (
                <div className="absolute right-0 mt-3 w-48 sm:w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform origin-top-right transition-all z-50">
                  <div className="p-2">
                    {/* Aquí se agregarán más opciones en el futuro */}
                    <button 
                      onClick={cerrarSesion} 
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {(!usuario.roles || usuario.roles.length === 0) && (
          <div className="mb-8 bg-white/60 backdrop-blur border border-yellow-200 p-5 rounded-2xl shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-full"><svg className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg></div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-gray-800">Sin permisos asignados</h3>
                <div className="mt-1 text-sm text-gray-600 font-medium"><p>Pide a un administrador de tu empresa que te asigne un rol (ej. CAJERO o ADMIN) para acceder a los módulos.</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Grid Principal de Módulos */}
        {!submenuActivo ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"> 
            
            {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO')) && (
              <button onClick={() => setSubmenuActivo('caja')} className="text-left relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Caja</h2>
                  <p className="text-gray-500 text-sm font-medium">Punto de venta y cierre de turno.</p>
                </div>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </button>
            )}

            {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
              <Link to="/inventario" className="relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Catálogo e Inventario</h2>
                  <p className="text-gray-500 text-sm font-medium">Agrega productos, precios y categorías.</p>
                </div>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </Link>
            )}
            
            {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('BODEGA')) && (
              <Link to="/inventario/movimientos" className="relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Movimientos</h2>
                  <p className="text-gray-500 text-sm font-medium">Ingresos y retiros de inventario.</p>
                </div>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </Link>
            )}

            {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR')) && (
              <Link to="/reportes" className="relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Reportes del Negocio</h2>
                  <p className="text-gray-500 text-sm font-medium">Estadísticas, ventas e inventario.</p>
                </div>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </Link>
            )}

            {(usuario.roles?.includes('ADMIN') || usuario.is_superuser) && (
              <Link to="/configuracion" className="relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Administración</h2>
                  <p className="text-gray-500 text-sm font-medium">Gestiona usuarios y configuración.</p>
                </div>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </Link>
            )}
          </div>
        ) : submenuActivo === 'caja' ? (
          <div className="animate-fade-in">
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
            
            <div className="flex items-center mb-6 gap-4 relative z-20">
              <button onClick={() => setSubmenuActivo(null)} className="p-3 bg-white/80 hover:bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 transition-all flex items-center justify-center active:scale-95" title="Volver al inicio">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              </button>
              <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Módulo de Caja</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Selecciona una operación para continuar.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO')) && (
                <Link to="/pos" className="relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Punto de Venta</h2>
                    <p className="text-gray-500 text-sm font-medium">Registrar y procesar ventas rápidas.</p>
                  </div>
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
                    <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </Link>
              )}

              {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO')) && (
                <Link to="/cierre-caja" className="relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Cierre de Caja</h2>
                    <p className="text-gray-500 text-sm font-medium">Cuadratura y reporte de turno (Z).</p>
                  </div>
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
                    <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </Link>
              )}
            </div>
          </div>
        ) : submenuActivo === 'administracion' ? (
          <div className="animate-fade-in">
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
            
            <div className="flex items-center mb-6 gap-4 relative z-20">
              <button onClick={() => setSubmenuActivo(null)} className="p-3 bg-white/80 hover:bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 transition-all flex items-center justify-center active:scale-95" title="Volver al inicio">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              </button>
              <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Módulo de Administración</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Gestiona reportes y el equipo de trabajo.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR')) && (
                <Link to="/reportes" className="relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Reportes del Negocio</h2>
                    <p className="text-gray-500 text-sm font-medium">Estadísticas, ventas e inventario.</p>
                  </div>
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
                    <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </Link>
              )}
              {(usuario.roles?.includes('ADMIN') || usuario.is_superuser) && (
                <Link to="/configuracion" className="relative bg-[var(--color-tarjeta)] backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/60 hover:shadow-2xl hover:border-[#91cf5b]/50 transition-all group flex flex-col justify-between h-52 overflow-hidden hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#91cf5b]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white text-[#91cf5b] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#91cf5b] group-hover:text-white transition-colors duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Equipo</h2>
                    <p className="text-gray-500 text-sm font-medium">Gestiona usuarios y permisos.</p>
                  </div>
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-[#91cf5b] relative z-10">
                    <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </Link>
              )}
            </div>
          </div>
        ) : null }
      </div>
    </div>
  );
}
