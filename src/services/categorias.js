import api from './api';

export const categoriasService = {
  listar:     ()          => api.get('inventario/categorias/'),
  crear:      (datos)     => api.post('inventario/categorias/', datos),
  actualizar: (id, datos) => api.patch(`inventario/categorias/${id}/`, datos),
  eliminar:   (id)        => api.delete(`inventario/categorias/${id}/`),
};
