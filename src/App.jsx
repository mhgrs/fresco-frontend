import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
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
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-gray-900 text-white h-14 flex items-center px-4 shadow-md">
        <Link to="/" title="Volver al Dashboard" className="text-gray-300 hover:text-white flex items-center justify-center bg-gray-800 p-2 rounded transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        </Link>
        <div className="ml-auto flex items-center gap-3 font-black tracking-wider">
          {sincronizando && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded animate-pulse">Sincronizando...</span>}
          {!isOnline && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded shadow-sm">Modo Offline</span>}
          Raíces de Numpay
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    const sincronizarVentas = async () => {
      const ventasOffline = JSON.parse(localStorage.getItem('ventas_offline')) || [];
      if (ventasOffline.length === 0) return;

      setSincronizando(true);
      const ventasRestantes = [];

      for (const venta of ventasOffline) {
        try {
          await api.post('ventas/', venta);
        } catch (error) {
          console.error('Error sincronizando venta', error);
          ventasRestantes.push(venta);
        }
      }

      localStorage.setItem('ventas_offline', JSON.stringify(ventasRestantes));
      setSincronizando(false);
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

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal: Dashboard sin el botón de volver atrás */}
        <Route path="/" element={<Dashboard usuario={usuario} cerrarSesion={() => setUsuario(null)} />} />
        
        {/* Rutas Módulo: Envueltas en el ModuleLayout (Pantalla Completa + Botón Atrás) */}
        <Route path="/pos" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><PuntoDeVenta /></ModuleLayout>} />
        
        {/* Rutas exclusivas ADMIN */}
        {usuario.rol === 'ADMIN' ? (
          <>
            <Route path="/inventario" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><CatalogoProductos /></ModuleLayout>} />
            <Route path="/inventario/nuevo" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><FormularioProducto /></ModuleLayout>} />
            <Route path="/inventario/editar/:id" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><FormularioProducto /></ModuleLayout>} />
            <Route path="/categorias" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><GestorCategorias /></ModuleLayout>} />
            <Route path="/reportes" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><CierreCaja /></ModuleLayout>} />
            <Route path="/alertas" element={<ModuleLayout isOnline={isOnline} sincronizando={sincronizando}><AlertasInventario /></ModuleLayout>} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}