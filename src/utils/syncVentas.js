import { ventasService } from '../services/ventas';

/**
 * Sincroniza las ventas guardadas offline en localStorage con el backend.
 *
 * - Lee la cola de `ventas_offline` de localStorage.
 * - Intenta enviar cada venta al backend (omitiendo offline_id temporal).
 * - Las ventas enviadas exitosamente se eliminan de la cola de a una,
 *   para no sobreescribir nuevas ventas que pudieran llegar mientras sincroniza.
 *
 * @param {object} [overrides] - Inyecciones para tests (storage, api).
 * @param {object} [overrides.storage] - Objeto con getItem/setItem (default: localStorage).
 * @param {Function} [overrides.crearVenta] - Función que envía la venta al backend.
 * @returns {{ exitosas: number, fallidas: number }}
 */
export async function sincronizarVentas({ storage = localStorage, crearVenta = (v) => ventasService.crear(v) } = {}) {
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
      const payload = { ...venta };
      delete payload.offline_id;

      await crearVenta(payload);
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
}
