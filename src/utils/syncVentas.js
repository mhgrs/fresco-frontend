import { ventasService } from '../services/ventas';

// Mutex de módulo: impide que dos llamadas concurrentes (online + visibilitychange,
// reintento periódico, etc.) envíen la misma venta al backend al mismo tiempo.
let _corriendo = false;

/**
 * Sincroniza las ventas guardadas offline en localStorage con el backend.
 *
 * - Rechaza invocaciones concurrentes (lock de módulo) para evitar duplicados.
 * - Lee la cola de `ventas_offline` de localStorage.
 * - Envía cada venta incluyendo offline_id; el backend la usa para idempotencia.
 * - Las ventas enviadas exitosamente se eliminan de la cola de a una,
 *   para no sobreescribir nuevas ventas que pudieran llegar mientras sincroniza.
 *
 * @param {object} [overrides] - Inyecciones para tests (storage, api).
 * @param {object} [overrides.storage] - Objeto con getItem/setItem (default: localStorage).
 * @param {Function} [overrides.crearVenta] - Función que envía la venta al backend.
 * @returns {{ exitosas: number, fallidas: number }}
 */
export async function sincronizarVentas({ storage = localStorage, crearVenta = (v) => ventasService.crear(v) } = {}) {
  if (_corriendo) return { exitosas: 0, fallidas: 0 };
  _corriendo = true;

  try {
  const ventasOffline = JSON.parse(storage.getItem('ventas_offline')) || [];
  if (ventasOffline.length === 0) return { exitosas: 0, fallidas: 0 };

  // Emitir evento de inicio de sincronización
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync_ventas_start', { detail: { total: ventasOffline.length } }));
  }

  let exitosas = 0;
  let fallidas = 0;
  const errores = [];

  for (const venta of ventasOffline) {
    try {
      // offline_id se envía al backend para garantizar idempotencia:
      // si la venta ya existe, el backend devuelve 200 en lugar de crearla de nuevo.
      await crearVenta(venta);
      exitosas++;

      // Eliminar la venta sincronizada de la cola de a una
      const actuales = JSON.parse(storage.getItem('ventas_offline')) || [];
      const filtradas = actuales.filter(v => v.offline_id !== venta.offline_id);
      storage.setItem('ventas_offline', JSON.stringify(filtradas));
      // Disparar evento para que el NetworkStatusIndicator se actualice
      window.dispatchEvent(new Event('ventas_offline_updated'));
    } catch (err) {
      fallidas++;
      const detalle = err?.response?.data;
      const msgError = detalle?.error ?? detalle?.detail
        ?? (typeof detalle === 'object' && detalle !== null
            ? JSON.stringify(detalle)
            : String(err?.message ?? 'Error desconocido'));
      const status = err?.response?.status ?? null;
      errores.push({ offline_id: venta.offline_id, status, error: msgError });
      if (import.meta.env.DEV) {
        console.error(`[syncVentas] Venta ${venta.offline_id} falló (${status ?? 'sin respuesta'}):`, detalle ?? err?.message);
      }
    }
  }

  // Emitir eventos de fin de sincronización
  if (typeof window !== 'undefined') {
    // ventasSincronizadas recarga el catálogo del POS con stock actualizado.
    // Se despacha aquí (no solo en App.jsx) para que el botón manual del
    // NetworkStatusIndicator también actualice el stock en pantalla.
    if (exitosas > 0) window.dispatchEvent(new Event('ventasSincronizadas'));
    window.dispatchEvent(new CustomEvent('sync_ventas_end', { detail: { exitosas, fallidas, errores } }));
  }

  return { exitosas, fallidas };
  } finally {
    _corriendo = false;
  }
}
