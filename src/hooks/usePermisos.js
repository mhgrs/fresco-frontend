/**
 * Hook para verificar permisos del usuario actual.
 *
 * Uso:
 *   const { tiene, esAdmin, esSupervisor, esCajero, esBodega } = usePermisos(usuario);
 *
 *   if (esAdmin()) { ... }
 *   if (esSupervisor()) { ... }    // ADMIN o SUPERVISOR
 *   if (esCajero()) { ... }        // ADMIN, SUPERVISOR o CAJERO
 *   if (esBodega()) { ... }        // ADMIN, SUPERVISOR, CAJERO o BODEGA
 *   if (tiene('ADMIN', 'BODEGA')) { ... }  // cualquiera de esos roles
 */
export function usePermisos(usuario) {
  // Verifica si el usuario tiene al menos uno de los roles indicados
  const tiene = (...roles) =>
    roles.some(r => usuario?.roles?.includes(r)) || usuario?.is_superuser;

  const esAdmin      = () => tiene('ADMIN');
  const esSupervisor = () => tiene('ADMIN', 'SUPERVISOR');
  const esCajero     = () => tiene('ADMIN', 'SUPERVISOR', 'CAJERO');
  const esBodega     = () => tiene('ADMIN', 'SUPERVISOR', 'CAJERO', 'BODEGA');

  return { tiene, esAdmin, esSupervisor, esCajero, esBodega };
}
