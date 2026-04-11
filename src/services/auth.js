import api from './api';

export const authService = {
  verificarCorreo:       (email)           => api.post('inventario/auth/verificar-correo/', { email }),
  registro:              (datos)           => api.post('inventario/auth/registro/', datos),
  verificarEmail:        (token)           => api.post(`inventario/auth/verificar-email/${token}/`),
  solicitarResetPassword:(email)           => api.post('inventario/auth/recuperar-password/', { email }),
  confirmarResetPassword:(token, password) => api.post('inventario/auth/reset-password/', { token, nueva_password: password }),
};
