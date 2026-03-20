import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard({ usuario, cerrarSesion }) {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    if (usuario.rol === 'ADMIN') {
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
  }, [usuario.rol]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Raíces de Numpay</h1>
            <p className="text-gray-600 mt-1">Usuario activo: <span className="font-bold">{usuario.nombre}</span> ({usuario.rol})</p>
          </div>
          <button onClick={cerrarSesion} title="Cerrar Sesión" className=" hover:bg-red-200 text-red-600 p-3 rounded-full transition flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Módulo accesible para todos */}
          <Link to="/pos" className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center border-t-4 border-blue-500">
            <span className="text-5xl mb-4">💰</span>
            <h2 className="text-xl font-bold text-gray-800">Punto de Venta</h2>
            <p className="text-gray-500 mt-2 text-sm">Abrir caja y procesar ventas</p>
          </Link>

          {/* Módulos exclusivos de ADMIN */}
          {usuario.rol === 'ADMIN' && (
            <>
              <Link to="/inventario" className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center border-t-4 border-green-500">
                <span className="text-5xl mb-4">📦</span>
                <h2 className="text-xl font-bold text-gray-800">Catálogo de Productos</h2>
                <p className="text-gray-500 mt-2 text-sm">Gestionar inventario y precios</p>
              </Link>

              <Link to="/categorias" className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center border-t-4 border-purple-500">
                <span className="text-5xl mb-4">🏷️</span>
                <h2 className="text-xl font-bold text-gray-800">Categorías</h2>
                <p className="text-gray-500 mt-2 text-sm">Administrar rubros de productos</p>
              </Link>

              <Link to="/reportes" className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center border-t-4 border-gray-800">
                <span className="text-5xl mb-4">📊</span>
                <h2 className="text-xl font-bold text-gray-800">Reporte Z</h2>
                <p className="text-gray-500 mt-2 text-sm">Cierre de caja y transacciones</p>
              </Link>

              <Link to="/alertas" className="relative bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center border-t-4 border-yellow-500">
                {alertas.length > 0 && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                    {alertas.length}
                  </span>
                )}
                <span className="text-5xl mb-4">⚠️</span>
                <h2 className="text-xl font-bold text-gray-800">Alertas Stock</h2>
                <p className="text-gray-500 mt-2 text-sm">Productos bajo umbral</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
