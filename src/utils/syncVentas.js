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

  let exitosas = 0;
  let fallidas = 0;

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
    } catch {
      fallidas++;
    }
  }

  return { exitosas, fallidas };
}
