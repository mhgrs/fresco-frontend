import api from './api';

export const ventasService = {
  crear:    (datos) => api.post('inventario/ventas/', datos),
  reporteZ: ()      => api.get('inventario/ventas/reporte_z/'),
  metricas: ()      => api.get('inventario/ventas/metricas/'),
};
