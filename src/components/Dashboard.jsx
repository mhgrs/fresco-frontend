import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard({ usuario, cerrarSesion }) {
  const [alertas, setAlertas] = useState([]);
  const [codigoInvitacion, setCodigoInvitacion] = useState('');
  const [generandoCodigo, setGenerandoCodigo] = useState(false);

  useEffect(() => {
    document.title = "Fresco";

    if (usuario.roles?.includes('ADMIN')) {
      api.get('inventario/productos/')
        .then(res => {
          const bajoUmbral = res.data.filter(p => p.esta_activo && parseFloat(p.stock) <= parseFloat(p.umbral_stock));
          setAlertas(bajoUmbral);
          localStorage.setItem('alertas_offline', JSON.stringify(bajoUmbral));
        })
        .catch(err => {
          console.error("Error cargando alertas:", err);
          const cache = localStorage.getItem('alertas_offline');
          if (cache) {
            setAlertas(JSON.parse(cache));
          }
        });
    }
  }, [usuario.roles]);

  const generarCodigo = async () => {
    setGenerandoCodigo(true);
    try {
      const res = await api.post('inventario/empresas/generar_codigo/');
      setCodigoInvitacion(res.data.codigo);
    } catch (error) {
      alert("Error al generar código: " + (error.response?.data?.error || "Error desconocido"));
    } finally {
      setGenerandoCodigo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-8 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-3xl font-black text-[#91cf5b]">Fresco</h1> 
            <p className="text-gray-600 text-xs mt-1">
              Usuario activo: <span className="font-bold">{usuario.nombre || usuario.username}</span>
            </p>
          </div>
          <button onClick={cerrarSesion} title="Cerrar Sesión" className=" hover:bg-red-200 text-red-600 p-3 rounded-full transition flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"> 
          {(!usuario.roles || usuario.roles.length === 0) && (
            <div className="col-span-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded shadow-sm">
              <p className="font-bold text-sm">Tu usuario no tiene permisos asignados.</p>
              <p className="text-xs mt-1">
                Para acceder a los módulos, un administrador debe ingresar al
                <a href="/fresco-admin" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline"> panel de administración </a>
                y asignarte un rol (ej. ADMIN).
              </p>
            </div>
          )}

           {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
            <Link to="/alertas" className="relative border-0 bg-[var(--color-tarjeta)] backdrop-blur-sm border  p-3 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center text-center aspect-square">
              {alertas.length > 0 && (
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                  {alertas.length}
                </span>
              )}
              <span className="text-4xl mb-2">⚠️</span>
              <h2 className="text-base font-bold text-gray-800 leading-tight">Alertas Stock</h2>
              <p className="text-gray-500 mt-1 text-xs">Productos bajo umbral</p>
            </Link>
          )}
          
          {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO')) && (
            <Link to="/pos" className="bg-[var(--color-tarjeta)] border-0 backdrop-blur-sm border  p-3 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center text-center  aspect-square">
              <span className="text-4xl mb-2">💰</span>
              <h2 className="text-base font-bold text-gray-800 leading-tight">Punto de Venta</h2>
              <p className="text-gray-500 mt-1 text-xs">Abrir caja y procesar ventas</p>
            </Link>
          )}

          {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR') || usuario.roles?.includes('CAJERO') || usuario.roles?.includes('BODEGA')) && (
            <Link to="/inventario" className="bg-[var(--color-tarjeta)] border-0 backdrop-blur-sm border  p-3 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center text-center  aspect-square">
              <span className="text-4xl mb-2">📦</span>
              <h2 className="text-base font-bold text-gray-800 leading-tight">Catálogo de Productos</h2>
              <p className="text-gray-500 mt-1 text-xs">Gestionar inventario y precios</p>
            </Link>
          )}

          {(usuario.roles?.includes('ADMIN') || usuario.roles?.includes('SUPERVISOR')) && (
            <Link to="/reportes" className="bg-[var(--color-tarjeta)] border-0 backdrop-blur-sm border  p-3 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center text-center  aspect-square">
              <span className="text-4xl mb-2">📊</span>
              <h2 className="text-base font-bold text-gray-800 leading-tight">Reporte</h2>
              <p className="text-gray-500 mt-1 text-xs">Cierre de caja y transacciones</p>
            </Link>
          )}

          {usuario.roles?.includes('ADMIN') && (
            <a href="/fresco-admin" target="_blank" rel="noopener noreferrer" className="bg-[var(--color-tarjeta)] border-0 backdrop-blur-sm border p-3 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center text-center aspect-square">
              <span className="text-4xl mb-2">⚙️</span>
              <h2 className="text-base font-bold text-gray-800 leading-tight">Panel Admin</h2>
              <p className="text-gray-500 mt-1 text-xs">Gestionar usuarios y sistema</p>
            </a>
          )}

        </div>

        {/* Panel Administrativo Rápido */}
        {usuario.roles?.includes('ADMIN') && (
          <div className="mt-8 bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800">Invitar Empleados</h3>
              <p className="text-sm text-gray-500 mt-1">Genera un código de un solo uso para que tu personal se una a esta empresa.</p>
            </div>
            <div className="flex items-center">
              {codigoInvitacion ? (
                <div className="bg-gray-100 border border-gray-300 px-6 py-2 rounded-xl text-2xl font-black tracking-widest text-gray-800 shadow-inner select-all" title="Copiar este código">
                  {codigoInvitacion}
                </div>
              ) : (
                <button onClick={generarCodigo} disabled={generandoCodigo} className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50">
                  {generandoCodigo ? 'Generando...' : 'Generar Código'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
