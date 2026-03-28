import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PuntoDeVenta from './components/PuntoDeVenta';
import CierreCaja from './components/CierreCaja';
import CatalogoProductos from './components/CatalogoProductos';
import FormularioProducto from './components/FormularioProducto';
import GestorCategorias from './components/GestorCategorias';
import AlertasInventario from './components/AlertasInventario';
import api from './services/api';

// Contenedor que da el efecto "Pantalla Completa" pero permite volver atrás
function ModuleLayout({ children, isOnline = true, sincronizando = false }) {
  useEffect(() => {
    document.title = "Fresco";
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-fondo)] transition-colors duration-500">
      <header className="bg-[#91cf5b] text-white h-12 flex items-center px-4 shadow-md">
        <Link to="/" title="Volver al Dashboard" className="text-white/80 hover:text-white flex items-center justify-center bg-black/10 hover:bg-black/20 p-2 rounded transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        </Link>
        <div className="ml-auto flex items-center gap-3 font-black tracking-wider">
          {sincronizando && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded animate-pulse">Sincronizando...</span>}
          {!isOnline && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded shadow-sm">Modo Offline</span>}
          Fresco
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

function LandingPage() {
  useEffect(() => {
    document.title = "Raíces de Numpay";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-fondo)] p-6 text-center relative transition-colors duration-500">
      <h1 className="text-5xl font-black text-[#91cf5b] mb-4 tracking-tighter">Raíces de Numpay</h1>
      <p className="text-xl text-gray-600 font-medium mb-8">Nuestra página web estará disponible pronto.</p>
      <div className="w-16 h-1 bg-[#91cf5b] mx-auto rounded-full"></div>
      
      <Link to="/fresco-login" className="absolute bottom-6 right-6 text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium">
        Fresco
      </Link>
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

  // Variables globales de tema preparadas para un futuro selector
  useEffect(() => {
    document.documentElement.style.setProperty('--color-fondo', '#fcfbf7'); // Crema muy claro
    document.documentElement.style.setProperty('--color-tarjeta', 'rgba(250, 250, 250, 0.38)'); // Blanco levemente transparente
  }, []);

  useEffect(() => {
    const cargarUsuario = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await api.get('inventario/usuarios/me/');
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
    };
    cargarUsuario();
  }, []);

  const manejarCerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');
    delete api.defaults.headers.common['Authorization'];
  };

  // Interceptor para manejar la expiración del token
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        // Si el error es 401 y no es la solicitud de refresh token y no hemos reintentado
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // Marcar la solicitud como reintentada
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error("No refresh token available.");
            }

            // Intentar obtener un nuevo access token usando el refresh token
            // Usamos axios.post directamente y la baseURL de nuestra instancia 'api'
            const response = await axios.post(`${api.defaults.baseURL}token/refresh/`, {
              refresh: refreshToken
            });

            const newAccessToken = response.data.access;
            localStorage.setItem('access_token', newAccessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // Reintentar la solicitud original con el nuevo token
            return api(originalRequest);
          } catch (refreshError) {
            console.error("Error al refrescar el token o refresh token inválido:", refreshError);
            // Si el refresh falla, cerrar sesión
            manejarCerrarSesion();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Función de limpieza para remover el interceptor cuando el componente se desmonte
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [usuario]); // Dependencia en usuario para asegurar que el interceptor se reconfigure si el usuario cambia

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
          
          await api.post('inventario/ventas/', payload);
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

  if (!usuario) {
    return (
      <BrowserRouter>
        <Routes>
          {/* Ruta secreta para los empleados */}
          <Route path="/fresco-login" element={<Login onLogin={setUsuario} />} />
          {/* Landing Page pública temporal */}
          <Route path="/" element={<LandingPage />} />
          {/* Redirección al Admin de Django */}
          <Route path="/fresco-admin/*" element={<AdminRedirect />} />
          {/* Redirigir cualquier otra ruta inventada a la página principal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal: Dashboard sin el botón de volver atrás */}
        <Route path="/" element={<Dashboard usuario={usuario} cerrarSesion={manejarCerrarSesion} />} />
        
        {/* Si un empleado logueado entra al login por error, lo mandamos al Dashboard */}
        <Route path="/fresco-login" element={<Navigate to="/" replace />} />

        {/* Redirección al Admin de Django para usuarios logueados */}
        <Route path="/fresco-admin/*" element={<AdminRedirect />} />

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO')) && (
          <Route path="/pos" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><PuntoDeVenta /></ModuleLayout>} />
        )}
        
        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
          <Route path="/inventario" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><CatalogoProductos usuario={usuario} /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
          <Route path="/inventario/nuevo" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><FormularioProducto usuario={usuario} /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
          <Route path="/inventario/editar/:id" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><FormularioProducto usuario={usuario} /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR')) && (
          <Route path="/categorias" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><GestorCategorias usuario={usuario} /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR')) && (
          <Route path="/reportes" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><CierreCaja /></ModuleLayout>} />
        )}

        {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
          <Route path="/alertas" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><AlertasInventario /></ModuleLayout>} />
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}