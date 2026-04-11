import { ROLES } from '../constants/roles';

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
 *   if (tiene(ROLES.ADMIN, ROLES.BODEGA)) { ... }  // cualquiera de esos roles
 */
export function usePermisos(usuario) {
  // Verifica si el usuario tiene al menos uno de los roles indicados
  const tiene = (...roles) =>
    roles.some(r => usuario?.roles?.includes(r)) || usuario?.is_superuser;

  const esAdmin      = () => tiene(ROLES.ADMIN);
  const esSupervisor = () => tiene(ROLES.ADMIN, ROLES.SUPERVISOR);
  const esCajero     = () => tiene(ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CAJERO);
  const esBodega     = () => tiene(ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CAJERO, ROLES.BODEGA);

  return { tiene, esAdmin, esSupervisor, esCajero, esBodega };
}
