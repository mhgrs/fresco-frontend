import api from './api';

export const empresasService = {
  crear:          (datos) => api.post('inventario/empresas/', datos),
  unirse:         (datos) => api.post('inventario/empresas/unirse/', datos),
  generarCodigo:  ()      => api.post('inventario/empresas/generar_codigo/'),
};
