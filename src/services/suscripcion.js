import api from './api';

export const suscripcionService = {
  obtenerEstado:  ()                      => api.get('suscripcion/'),
  listarPlanes:   ()                      => api.get('suscripcion/planes/'),
  iniciarPago:    (plan, modalidad)       => api.post('suscripcion/pagar/', { plan, modalidad }),
  obtenerHistorial: ()                    => api.get('suscripcion/historial/'),
  cancelar:       ()                      => api.post('suscripcion/cancelar/'),
};
