import api from './api';

export const usuariosService = {
  login:          (datos)        => api.post('inventario/usuarios/login/', datos),
  me:             ()             => api.get('inventario/usuarios/me/'),
  listarEquipo:   ()             => api.get('inventario/usuarios/'),
  actualizarRoles:(id, roles)    => api.patch(`inventario/usuarios/${id}/`, { roles }),
  listarRoles:    ()             => api.get('inventario/roles/'),
};
