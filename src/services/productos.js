import api from './api';

export const productosService = {
  // Sin parámetros → devuelve todos los productos (compatible con POS y usos legacy).
  // Con parámetros (search, categoria, page) → devuelve respuesta paginada {count, results, next, previous}.
  listar: (params = {}) => {
    const tieneParams = Object.keys(params).length > 0;
    const finalParams = tieneParams ? params : { todos: '1' };
    return api.get('inventario/productos/', { params: finalParams });
  },

  // Alias explícito: siempre devuelve todos sin paginar (para alertas, dashboard).
  listarTodos:      ()          => api.get('inventario/productos/', { params: { todos: '1' } }),
  // Solo los productos activos con stock ≤ umbral (filtrado en backend).
  listarStockBajo:  ()          => api.get('inventario/productos/', { params: { stock_bajo: '1', todos: '1' } }),
  obtener:          (id)        => api.get(`inventario/productos/${id}/`),
  crear:            (datos)     => api.post('inventario/productos/', datos),
  actualizar:       (id, datos) => api.patch(`inventario/productos/${id}/`, datos),
  eliminar:         (id)        => api.delete(`inventario/productos/${id}/`),
  ajustarStock:     (id, datos) => api.post(`inventario/productos/${id}/ajustar_stock/`, datos),
  movimientos:      ()          => api.get('inventario/productos/movimientos/'),
  // _silenciarError500: true → el interceptor no dispara el banner de error global
  // (el maestro es una consulta opcional: si falla, la UI lo silencia)
  consultarMaestro: (codigo)    => api.get(`inventario/maestro/${codigo}/`, { _silenciarError500: true }),
};
