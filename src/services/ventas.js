import api from './api';

export const ventasService = {
  // Ventas
  crear:           (datos)   => api.post('inventario/ventas/', datos),
  reporteZ:        ()        => api.get('inventario/ventas/reporte_z/'),
  metricas:        ()        => api.get('inventario/ventas/metricas/'),
  listarHistorial: (params)  => api.get('inventario/ventas/', { params }),

  // Turno de caja
  turnoActivo:  ()              => api.get('inventario/turnos/activo/'),
  abrirTurno:   (fondoApertura) => api.post('inventario/turnos/abrir/', { fondo_apertura: fondoApertura }),
  cerrarTurno:  (id, fondoCierre, notas) =>
    api.post(`inventario/turnos/${id}/cerrar/`, { fondo_cierre: fondoCierre, notas }),
  historialTurnos: () => api.get('inventario/turnos/'),

  // Movimientos de caja
  registrarMovimiento: (datos) => api.post('inventario/movimientos-caja/', datos),
  listarMovimientos:   (turnoId) =>
    api.get('inventario/movimientos-caja/', { params: { turno: turnoId } }),
  eliminarMovimiento:  (id) => api.delete(`inventario/movimientos-caja/${id}/`),
};
