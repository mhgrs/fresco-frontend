import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PuntoDeVenta from './components/PuntoDeVenta';
import CierreCaja from './components/CierreCaja';
import Reportes from './components/Reportes';
import CatalogoProductos from './components/CatalogoProductos';
import FormularioProducto from './components/FormularioProducto';
import GestorCategorias from './components/GestorCategorias';
import AlertasInventario from './components/AlertasInventario';
import LandingPage from './components/LandingPage';
import Registro from './components/Registro';
import VerificarEmail from './components/VerificarEmail';
import OnboardingEmpresa from './components/OnboardingEmpresa';
import GestionEmpresa from './components/GestionEmpresa'; // NUEVO
import MovimientosInventario from './components/MovimientosInventario'; // NUEVO
import api from './services/api';
import { usuariosService } from './services/usuarios';
import { ventasService } from './services/ventas';

// Contenedor que da el efecto "Pantalla Completa" pero permite volver atrás
function ModuleLayout({ children, isOnline = true, sincronizando = false, usuario }) {
  useEffect(() => {
    document.title = "Fresco";
  }, []);

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const fechaCapitalizada = fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-fondo)] transition-colors duration-500 font-sans">
      <header className="px-4 sm:px-6 py-4 lg:px-8 flex-none z-20">
        <div className="max-w-[1400px] mx-auto flex flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-[#91cf5b] tracking-tight">
                Fresco
              </h1>
              {sincronizando && <span className="text-[10px] sm:text-xs bg-blue-500 text-white px-2 py-1 rounded-full animate-pulse font-bold tracking-wider uppercase shadow-sm">Sincronizando...</span>}
              {!isOnline && <span className="text-[10px] sm:text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold tracking-wider uppercase shadow-sm">Offline</span>}
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium truncate">
              {fechaCapitalizada}
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-1 sm:mt-0 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center bg-[var(--color-tarjeta)] backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/60">
               <span className="text-sm font-bold text-gray-700">
                 {usuario?.empresa_nombre || 'Mi Empresa'}
               </span>
            </div>

            <Link 
              to="/dashboard"
              className="p-3 rounded-full backdrop-blur-md border shadow-sm transition-all bg-[var(--color-tarjeta)] border-white/60 text-gray-600 hover:bg-white hover:text-gray-800 flex items-center justify-center active:scale-95"
              title="Volver al Dashboard"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

// Helper function para obtener la URL base del backend para el panel de administración
const getDjangoAdminBaseUrl = () => {
  if (api.defaults.baseURL) {
    let baseUrl = api.defaults.baseURL;
    // Aseguramos que la URL termine con '/' para una manipulación consistente
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    // Si la URL termina con '/api/', la reemplazamos por '/'
    if (baseUrl.endsWith('/api/')) {
      return baseUrl.replace('/api/', '/');
    }
    // Si no termina con '/api/', asumimos que ya es la URL base del dominio
    return baseUrl;
  }
  return 'http://localhost:8000/'; // Fallback para desarrollo local si no hay baseURL configurada
};

// Componente para saltar del Frontend (Vercel) al Backend (Render/Localhost)
function AdminRedirect() {
  useEffect(() => {
    const backendBaseUrl = getDjangoAdminBaseUrl();
    window.location.replace(`${backendBaseUrl}fresco-admin/`);
  }, []);
  
  return <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center text-gray-500 font-medium">Redirigiendo a Administración...</div>;
}


export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sincronizando, setSincronizando] = useState(false);
  const [errorServidor, setErrorServidor] = useState(false);

  // Escuchar errores 500 del servidor disparados desde el interceptor de Axios
  useEffect(() => {
    const handler = () => {
      setErrorServidor(true);
      // El banner desaparece solo después de 5 segundos
      setTimeout(() => setErrorServidor(false), 5000);
    };
    window.addEventListener('errorServidor', handler);
    return () => window.removeEventListener('errorServidor', handler);
  }, []);

  // Variables globales de tema preparadas para un futuro selector
  useEffect(() => {
    document.documentElement.style.setProperty('--color-fondo', '#fcfbf7'); // Crema muy claro
    document.documentElement.style.setProperty('--color-tarjeta', 'rgba(250, 250, 250, 0.38)'); // Blanco levemente transparente
  }, []);

  // Lo extraemos a un useCallback para poder pasarlo al Onboarding y recargar al terminar
  const cargarUsuario = useCallback(async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await usuariosService.me();
          // Garantizamos que roles siempre sea un array para evitar errores
          const userData = { ...response.data, roles: response.data.roles || [] };
          setUsuario(userData);
          localStorage.setItem('usuario', JSON.stringify(userData));
        } catch (error) {
          // Si falla por falta de internet, intentar recuperar perfil desde caché
          if (!error.response || !navigator.onLine) {
            console.warn("Sin conexión al verificar sesión. Usando caché.");
            const cachedUser = localStorage.getItem('usuario'); // Esto podría tener la cadena 'rol' antigua
            if (cachedUser) {
              const parsedUser = JSON.parse(cachedUser);
              // Aseguramos que 'roles' sea un array, convirtiendo la cadena 'rol' antigua si es necesario
              setUsuario({ ...parsedUser, roles: Array.isArray(parsedUser.roles) ? parsedUser.roles : (parsedUser.rol ? [parsedUser.rol] : []) });
            }
          } else {
            console.error("Sesión expirada o inválida");
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('usuario');
            delete api.defaults.headers.common['Authorization'];
          }
        }
      }
      setVerificandoSesion(false);
  }, []);

  useEffect(() => {
    cargarUsuario();
  }, [cargarUsuario]);

  const manejarCerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');
    delete api.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    const sincronizarVentas = async () => {
      const ventasOffline = JSON.parse(localStorage.getItem('ventas_offline')) || [];
      if (ventasOffline.length === 0) return;

      setSincronizando(true);
      let exitosas = 0;

      for (const venta of ventasOffline) {
        try {
          // Remover el ID temporal antes de mandarlo al backend
          const payload = { ...venta };
          delete payload.offline_id;
          
          await ventasService.crear(payload);
          exitosas++;

          // Borrar del storage de a una. Así evitamos sobreescribir nuevas ventas hechas mientras sincronizaba
          const actuales = JSON.parse(localStorage.getItem('ventas_offline')) || [];
          const filtradas = actuales.filter(v => v.offline_id !== venta.offline_id);
          localStorage.setItem('ventas_offline', JSON.stringify(filtradas));
        } catch (error) {
          console.error('Error sincronizando venta', error);
        }
      }

      setSincronizando(false);
      
      // Si logramos sincronizar al menos una, notificamos al resto de la app
      if (exitosas > 0) {
        window.dispatchEvent(new Event('ventasSincronizadas'));
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      sincronizarVentas();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Intentar sincronizar cuando cargue la app por primera vez si hay internet
    if (navigator.onLine && usuario) sincronizarVentas();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [usuario]);

  if (verificandoSesion) {
    return <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center text-gray-500 font-medium transition-colors duration-500">Cargando aplicación...</div>;
  }

  return (
    <BrowserRouter>
      {/* Banner global de error de servidor — aparece en cualquier pantalla */}
      {errorServidor && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center text-sm font-bold py-2 px-4 shadow-lg">
          El servidor tuvo un problema inesperado. Por favor intenta de nuevo en unos momentos.
        </div>
      )}
      {!usuario ? (
        <Routes>
          {/* Ruta secreta para los empleados */}
          <Route path="/fresco-login" element={<Login onLogin={(u) => setUsuario({ ...u, roles: u.roles || [] })} />} />
          {/* Rutas Públicas de SaaS */}
          <Route path="/registro" element={<Registro />} />
          <Route path="/verificar-email/:token" element={<VerificarEmail />} />
          
          {/* Landing Page pública */}
          <Route path="/" element={<LandingPage usuario={null} />} />
          {/* Redirección al Admin de Django */}
          <Route path="/fresco-admin/*" element={<AdminRedirect />} />
          {/* Redirigir cualquier otra ruta inventada a la página principal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : !usuario.empresa ? (
        <Routes>
          <Route path="/onboarding" element={<OnboardingEmpresa onCompletado={cargarUsuario} cerrarSesion={manejarCerrarSesion} />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      ) : (
        <Routes>
        {/* Landing Page pública, ahora accesible incluso logueado (como portada) */}
        <Route path="/" element={<LandingPage usuario={usuario} />} />
        
        {/* Ruta principal del sistema: Dashboard */}
        <Route path="/dashboard" element={<Dashboard usuario={usuario} cerrarSesion={manejarCerrarSesion} />} />
        
        {/* Si un empleado logueado entra al login por error, lo mandamos directo a su Dashboard */}
        <Route path="/fresco-login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/registro" element={<Navigate to="/dashboard" replace />} />
        <Route path="/verificar-email/:token" element={<Navigate to="/dashboard" replace />} />

        {/* Redirección al Admin de Django para usuarios logueados */}
        <Route path="/fresco-admin/*" element={<AdminRedirect />} />

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO')) && (
          <Route path="/pos" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><PuntoDeVenta /></ModuleLayout>} />
        )}
        
        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
          <Route path="/inventario" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><CatalogoProductos usuario={usuario} /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
          <Route path="/inventario/nuevo" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><FormularioProducto usuario={usuario} /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
          <Route path="/inventario/editar/:id" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><FormularioProducto usuario={usuario} /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
          <Route path="/inventario/movimientos" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><MovimientosInventario usuario={usuario} /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR')) && (
          <Route path="/categorias" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><GestorCategorias usuario={usuario} /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR')) && (
          <Route path="/reportes" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><Reportes /></ModuleLayout>} />
        )}
        
        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO')) && (
          <Route path="/cierre-caja" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><CierreCaja /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
          <Route path="/alertas" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><AlertasInventario /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.is_superuser) && (
          <Route path="/configuracion" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario}><GestionEmpresa usuario={usuario} /></ModuleLayout>} />
        )}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      )}
    </BrowserRouter>
  );
}