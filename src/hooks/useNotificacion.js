import { useState } from 'react';

/**
 * Hook para manejar notificaciones toast temporales.
 *
 * Uso:
 *   const { notificacion, mostrar } = useNotificacion();
 *   mostrar('Guardado exitosamente', 'success');
 *   mostrar('Ocurrió un error', 'error');
 *   mostrar('Sin conexión', 'warning');
 *
 * Tipos disponibles: 'success' | 'error' | 'warning'
 */
export function useNotificacion(duracionMs = 3000) {
  const [notificacion, setNotificacion] = useState({
    visible: false,
    mensaje: '',
    tipo: 'success',
  });

  const mostrar = (mensaje, tipo = 'success') => {
    setNotificacion({ visible: true, mensaje, tipo });
    setTimeout(
      () => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }),
      duracionMs
    );
  };

  return { notificacion, mostrar };
}
