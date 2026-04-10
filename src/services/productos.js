import api from './api';

export const productosService = {
  listar:          ()          => api.get('inventario/productos/'),
  obtener:         (id)        => api.get(`inventario/productos/${id}/`),
  crear:           (datos)     => api.post('inventario/productos/', datos),
  actualizar:      (id, datos) => api.patch(`inventario/productos/${id}/`, datos),
  eliminar:        (id)        => api.delete(`inventario/productos/${id}/`),
  ajustarStock:    (id, datos) => api.post(`inventario/productos/${id}/ajustar_stock/`, datos),
  movimientos:     ()          => api.get('inventario/productos/movimientos/'),
  consultarMaestro:(codigo)    => api.get(`inventario/maestro/${codigo}/`),
};
