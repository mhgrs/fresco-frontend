import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { productosService } from '../services/productos';
import { useClickOutside } from '../hooks/useClickOutside';
import ModuleCard from './dashboard/ModuleCard';
import AlertasDropdown from './dashboard/AlertasDropdown';
import OnboardingChecklist from './dashboard/OnboardingChecklist';
import UpgradeBanner from './dashboard/UpgradeBanner';

const MODULOS_VALIDOS = ['caja', 'inventario', 'administracion'];

export default function Dashboard({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [alertas, setAlertas] = useState([]);
  const [alertasCacheMs, setAlertasCacheMs] = useState(null);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const ajustesRef = useRef(null);

  // El submenu activo se sincroniza con el parámetro ?module= de la URL.
  // Esto permite que navigate(-1) desde cualquier módulo restaure el submenu correcto.
  const moduloParam = searchParams.get('module');
  const submenuActivo = MODULOS_VALIDOS.includes(moduloParam) ? moduloParam : null;

  const abrirSubmenu = (modulo) => navigate(`/dashboard?module=${modulo}`);
  const cerrarSubmenu = () => navigate('/dashboard');

  useEffect(() => {
    document.title = "Fresco";
    if (usuario.roles?.includes('ADMIN') || usuario.is_superuser) {
      productosService.listarStockBajo()
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
          setAlertas(data);
          setAlertasCacheMs(null);
          localStorage.setItem('alertas_offline', JSON.stringify(data));
          localStorage.setItem('alertas_offline_ts', Date.now().toString());
        })
        .catch(() => {
          const cache = localStorage.getItem('alertas_offline');
          if (cache) {
            setAlertas(JSON.parse(cache));
            const ts = localStorage.getItem('alertas_offline_ts');
            setAlertasCacheMs(ts ? Date.now() - parseInt(ts) : null);
          }
        });
    }
  }, [usuario.roles, usuario.is_superuser]);

  const cerrarAjustes = useCallback(() => setMostrarAjustes(false), []);
  useClickOutside(ajustesRef, cerrarAjustes);

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const fechaCapitalizada = fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1);

  // Iconos reutilizables
  const IconoCaja       = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
  const IconoInventario = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
  const IconoCatalogo   = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
  const IconoMovimientos = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
  const IconoReportes   = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  const IconoAdmin      = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const IconoPOS        = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  const IconoCierre     = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
  const IconoEquipo     = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  const IconoMovCaja    = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
  const IconoHistorial  = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
  const IconoActividad  = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

  const roles = usuario.roles || [];
  const isCajero     = roles.includes('ADMIN') || roles.includes('SUPERVISOR') || roles.includes('CAJERO');
  const isBodega     = isCajero || roles.includes('BODEGA');
  const isSupervisor = roles.includes('ADMIN') || roles.includes('SUPERVISOR');
  const isAdmin      = roles.includes('ADMIN') || usuario.is_superuser;

  const botonVolver = (
    <button
      onClick={cerrarSubmenu}
      className="p-3 bg-white/80 hover:bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 transition-all flex items-center justify-center active:scale-95 flex-shrink-0"
      title="Volver al inicio"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] transition-colors duration-500 font-sans flex flex-col">
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .animate-fade-in{animation:fadeIn 0.3s ease-out forwards}
        @keyframes pulse-grow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
      <div className="max-w-6xl w-full mx-auto relative flex-1 flex flex-col p-6 lg:p-8">

        {/* Encabezado */}
        <div className="flex flex-row justify-between items-start md:items-center mb-10 md:mb-12 gap-4 relative z-20">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-[#91cf5b] tracking-widest uppercase mb-1">Fresco</h1>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight truncate">
              Hola, {(usuario.nombre || usuario.username).split(' ')[0]} 👋
            </h2>
            <p className="text-gray-500 text-xs md:text-base mt-1 md:mt-2 font-medium truncate">{fechaCapitalizada}</p>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center bg-[var(--color-tarjeta)] backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/60">
              <span className="text-sm font-bold text-gray-700">{usuario.empresa_nombre || 'Mi Empresa'}</span>
            </div>

            {/* Campana de alertas: solo usuarios con cualquier rol */}
            {roles.length > 0 && (
              <AlertasDropdown alertas={alertas} cacheMs={alertasCacheMs} />
            )}

            {/* Menú de usuario */}
            <div className="relative" ref={ajustesRef}>
              <button
                onClick={() => setMostrarAjustes(!mostrarAjustes)}
                className={`p-3 rounded-full backdrop-blur-md border shadow-sm transition-all ${mostrarAjustes ? 'bg-white border-gray-200 text-gray-800' : 'bg-[var(--color-tarjeta)] border-white/60 text-gray-600 hover:bg-white hover:text-gray-800'}`}
                title={mostrarAjustes ? 'Cerrar menú' : 'Menú'}
              >
                {mostrarAjustes ? (
                  /* X cuando el menú está abierto */
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  /* Tres líneas (menú hamburger) cuando está cerrado */
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              {mostrarAjustes && (
                <div className="absolute right-0 mt-3 w-52 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden origin-top-right z-50">
                  <div className="p-2">
                    <Link
                      to="/configuracion"
                      onClick={() => setMostrarAjustes(false)}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configuración
                    </Link>
                    <div className="my-1 h-px bg-gray-100" />
                    <button
                      onClick={cerrarSesion}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenedor de contenido que crece para empujar el banner hacia abajo */}
        <div className="flex-1">
        {(!roles || roles.length === 0) && (
          <div className="mb-8 bg-white/60 backdrop-blur border border-yellow-200 p-5 rounded-2xl shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-full">
                <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-gray-800">Sin permisos asignados</h3>
                <p className="mt-1 text-sm text-gray-600 font-medium">Pide a un administrador de tu empresa que te asigne un rol (ej. CAJERO o ADMIN) para acceder a los módulos.</p>
              </div>
            </div>
          </div>
        )}

        {/* Grid principal */}
        {!submenuActivo ? (
          <>
          {isAdmin && <OnboardingChecklist />}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {isCajero    && <ModuleCard onClick={() => abrirSubmenu('caja')} titulo="Caja" descripcion="Punto de venta y cierre de turno." icono={IconoCaja} />}
            {isBodega    && <ModuleCard onClick={() => abrirSubmenu('inventario')} titulo="Inventario" descripcion="Catálogo de productos y stock." icono={IconoInventario} />}
            {(isSupervisor || isAdmin) && <ModuleCard onClick={() => abrirSubmenu('administracion')} titulo="Administración" descripcion="Reportes y gestión de equipo." icono={IconoAdmin} />}
          </div>
          </>

        ) : submenuActivo === 'caja' ? (
          <div className="animate-fade-in ">
            <div className="flex items-center gap-4 mb-6 relative z-20">
              {botonVolver}
              <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">Módulo de Caja</h2>
                <p className="text-sm text-gray-500 font-medium">Selecciona una operación para continuar.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {isCajero && <ModuleCard to="/pos" titulo="Punto de Venta" descripcion="Registrar y procesar ventas rápidas." icono={IconoPOS} />}
              {isCajero && (usuario.plan?.tiene_cierre_caja
                ? <ModuleCard to="/cierre-caja" titulo="Apertura y Cierre de Caja" descripcion="Gestión de turno, movimientos y cuadratura." icono={IconoCierre} />
                : <ModuleCard to="/configuracion?tab=pagos" titulo="Apertura y Cierre de Caja" descripcion="Disponible desde el plan Básico." icono={IconoCierre} bloqueado />
              )}
              {isCajero && (usuario.plan?.tiene_cierre_caja
                ? <ModuleCard to="/movimientos-caja" titulo="Movimientos de Caja" descripcion="Registrar ingresos y retiros de efectivo." icono={IconoMovCaja} />
                : <ModuleCard to="/configuracion?tab=pagos" titulo="Movimientos de Caja" descripcion="Disponible desde el plan Básico." icono={IconoMovCaja} bloqueado />
              )}
            </div>
          </div>

        ) : submenuActivo === 'inventario' ? (
          <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-6 relative z-20">
              {botonVolver}
              <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">Módulo de Inventario</h2>
                <p className="text-sm text-gray-500 font-medium">Gestiona tu catálogo de productos y controla el stock.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {isBodega && <ModuleCard to="/inventario" titulo="Catálogo de Productos" descripcion="Agrega productos, precios y categorías." icono={IconoCatalogo} />}
              {isBodega && (usuario.plan?.tiene_movimientos_inventario
                ? <ModuleCard to="/inventario/movimientos" titulo="Movimientos" descripcion="Ingresos y retiros de inventario." icono={IconoMovimientos} />
                : <ModuleCard to="/configuracion?tab=pagos" titulo="Movimientos" descripcion="Disponible desde el plan Pro." icono={IconoMovimientos} bloqueado />
              )}
            </div>
          </div>

        ) : submenuActivo === 'administracion' ? (
          <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-6 relative z-20">
              {botonVolver}
              <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">Módulo de Administración</h2>
                <p className="text-sm text-gray-500 font-medium">Reportes, historial y gestión del equipo.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {isSupervisor && (usuario.plan?.tiene_reportes
                ? <ModuleCard to="/reportes" titulo="Reportes del Negocio" descripcion="Estadísticas, ventas e inventario." icono={IconoReportes} />
                : <ModuleCard to="/configuracion?tab=pagos" titulo="Reportes del Negocio" descripcion="Disponible desde el plan Básico." icono={IconoReportes} bloqueado />
              )}
              {isSupervisor && <ModuleCard to="/actividad" titulo="Actividad del Negocio" descripcion="Ventas, caja e inventario en un solo lugar." icono={IconoActividad} />}
              {isAdmin && <ModuleCard to="/equipo" titulo="Gestión de Equipo" descripcion="Gestiona usuarios y roles." icono={IconoEquipo} />}
            </div>
          </div>
        ) : null}
        </div>
        <div className="px-6">
          <UpgradeBanner usuario={usuario} />
        </div>
      </div>
    </div>
  );
}
