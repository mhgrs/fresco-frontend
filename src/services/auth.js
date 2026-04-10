import api from './api';

export const authService = {
  verificarCorreo: (email)  => api.post('inventario/auth/verificar-correo/', { email }),
  registro:        (datos)  => api.post('inventario/auth/registro/', datos),
  verificarEmail:  (token)  => api.post(`inventario/auth/verificar-email/${token}/`),
};
