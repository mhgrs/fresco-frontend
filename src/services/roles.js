import api from './api';

export const rolesService = {
  listar:            ()          => api.get('inventario/roles/'),
  crear:             (datos)     => api.post('inventario/roles/', datos),
  actualizar:        (id, datos) => api.patch(`inventario/roles/${id}/`, datos),
  eliminar:          (id)        => api.delete(`inventario/roles/${id}/`),
  listarDisponibles: ()          => api.get('inventario/permisos-disponibles/'),
};
