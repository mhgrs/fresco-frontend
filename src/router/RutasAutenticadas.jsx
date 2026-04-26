import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import PuntoDeVenta from '../components/PuntoDeVenta';
import CierreCaja from '../components/CierreCaja';
import Reportes from '../components/Reportes';
import CatalogoProductos from '../components/CatalogoProductos';
import FormularioProducto from '../components/FormularioProducto';
import GestorCategorias from '../components/GestorCategorias';
import AlertasInventario from '../components/AlertasInventario';
import LandingPage from '../components/LandingPage';
import OnboardingEmpresa from '../components/OnboardingEmpresa';
import Configuracion from '../components/Configuracion';
import MovimientosInventario from '../components/MovimientosInventario';
import ModuleLayout from '../components/layout/ModuleLayout';
import AdminRedirect from '../components/layout/AdminRedirect';
import MovimientosCaja from '../components/MovimientosCaja';
import TerminosCondiciones from '../components/TerminosCondiciones';
import GestionEquipo from '../components/GestionEquipo';
import PoliticaPrivacidad from '../components/PoliticaPrivacidad';
import PaginaUnirse from '../components/PaginaUnirse';
import HistorialVentas from '../components/HistorialVentas';


/**
 * Guarda de plan: si el flag del plan es false redirige al portal de pagos.
 * Uso: <PlanGuard permite={usuario.plan?.tiene_reportes}><Reportes /></PlanGuard>
 */
function PlanGuard({ permite, children }) {
  if (!permite) return <Navigate to="/configuracion?tab=pagos" replace />;
  return children;
}

/**
 * Rutas para usuarios autenticados (con o sin empresa asignada).
 *
 * Props:
 *   usuario
 *   isOnline
 *   sincronizando
 *   cerrarSesion
 *   cargarUsuario — para que OnboardingEmpresa pueda recargar el perfil
 */
export default function RutasAutenticadas({ usuario, isOnline, sincronizando, cerrarSesion, cargarUsuario }) {
  // Usuario sin empresa: solo puede ir a onboarding
  if (!usuario.empresa) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingEmpresa onCompletado={cargarUsuario} cerrarSesion={cerrarSesion} />} />
        <Route path="/unirse/:codigo" element={<PaginaUnirse usuario={usuario} />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  const roles = usuario.roles || [];
  const isAdmin      = roles.includes('ADMIN') || usuario.is_superuser;
  const isSupervisor = isAdmin  || roles.includes('SUPERVISOR');
  const isCajero     = isSupervisor || roles.includes('CAJERO');
  const isBodega     = isCajero || roles.includes('BODEGA');

  const wrap = (child, fallback = '/dashboard') => (
    <ModuleLayout isOnline={isOnline} sincronizando={sincronizando} usuario={usuario} fallback={fallback}>
      {child}
    </ModuleLayout>
  );

  return (
    <Routes>
      <Route path="/" element={<LandingPage usuario={usuario} />} />
      <Route path="/dashboard" element={<Dashboard usuario={usuario} cerrarSesion={cerrarSesion} />} />

      {/* Redirigir rutas públicas si ya está logueado */}
      <Route path="/fresco-login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/registro" element={<Navigate to="/dashboard" replace />} />
      <Route path="/verificar-email/:token" element={<Navigate to="/dashboard" replace />} />

      <Route path="/fresco-admin/*" element={<AdminRedirect />} />

      {/* Caja */}
      {isCajero && <Route path="/pos" element={wrap(<PuntoDeVenta usuario={usuario} />, '/dashboard?module=caja')} />}
      {isCajero && <Route path="/cierre-caja" element={wrap(
        <PlanGuard permite={usuario.plan?.tiene_cierre_caja}>
          <CierreCaja />
        </PlanGuard>, '/dashboard?module=caja')} />}
      {isCajero && <Route path="/movimientos-caja" element={wrap(
        <PlanGuard permite={usuario.plan?.tiene_cierre_caja}>
          <MovimientosCaja />
        </PlanGuard>, '/dashboard?module=caja')} />}

      {/* Inventario */}
      {isBodega && <Route path="/inventario"             element={wrap(<CatalogoProductos usuario={usuario} />, '/dashboard?module=inventario')} />}
      {isBodega && <Route path="/inventario/nuevo"       element={wrap(<FormularioProducto usuario={usuario} />, '/inventario')} />}
      {isBodega && <Route path="/inventario/editar/:id"  element={wrap(<FormularioProducto usuario={usuario} />, '/inventario')} />}
      {isBodega && <Route path="/inventario/movimientos" element={wrap(
        <PlanGuard permite={usuario.plan?.tiene_movimientos_inventario}>
          <MovimientosInventario usuario={usuario} />
        </PlanGuard>, '/dashboard?module=inventario')} />}
      {isBodega && <Route path="/alertas"                element={wrap(<AlertasInventario />, '/dashboard')} />}

      {/* Administración */}
      {isSupervisor && <Route path="/categorias" element={wrap(<GestorCategorias usuario={usuario} />, '/inventario')} />}
      {isSupervisor && <Route path="/reportes" element={wrap(
        <PlanGuard permite={usuario.plan?.tiene_reportes}>
          <Reportes />
        </PlanGuard>, '/dashboard?module=administracion')} />}
      
      {isAdmin && <Route path="/equipo" element={wrap(<GestionEquipo />, '/dashboard?module=administracion')} />}
      {isSupervisor && <Route path="/ventas" element={wrap(<HistorialVentas />, '/dashboard?module=administracion')} />}
      <Route path="/unirse/:codigo" element={<Navigate to="/dashboard" replace />} />

      {/* Configuración — accesible para todos los usuarios autenticados */}
      <Route path="/configuracion" element={wrap(<Configuracion usuario={usuario} />, '/dashboard')} />

      {/* Suscripción — redirige a /configuracion?tab=pagos */}
      <Route path="/suscripcion" element={wrap(<Configuracion usuario={usuario} />, '/dashboard')} />

      {/* Páginas legales — accesibles con sesión iniciada */}
      <Route path="/terminos"   element={<TerminosCondiciones />} />
      <Route path="/privacidad" element={<PoliticaPrivacidad />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
