/**
 * Hook para verificar permisos del usuario actual.
 *
 * Nueva API (Feature 2 — permisos flexibles):
 *   tiene('pos.realizar_venta')   — verifica un permiso específico por código
 *
 * API legacy (compatibilidad durante migración):
 *   esAdmin()      → tiene('equipo.gestionar_roles')
 *   esSupervisor() → tiene('ventas.ver_todas')
 *   esCajero()     → tiene('pos.realizar_venta')
 *   esBodega()     → tiene('inventario.ver')
 */
export function usePermisos(usuario) {
  const tiene = (codigo) =>
    !!(usuario?.is_superuser || usuario?.permisos?.includes(codigo));

  const esAdmin      = () => tiene('equipo.gestionar_roles');
  const esSupervisor = () => tiene('ventas.ver_todas');
  const esCajero     = () => tiene('pos.realizar_venta');
  const esBodega     = () => tiene('inventario.ver');

  return { tiene, esAdmin, esSupervisor, esCajero, esBodega };
}
