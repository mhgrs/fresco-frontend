import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sincronizarVentas } from './syncVentas';

// Storage en memoria para no tocar localStorage real
function makeStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    _get: (k) => JSON.parse(store[k] ?? 'null'),
  };
}

const venta = (id, total = 1000) => ({
  offline_id: id,
  total,
  metodo_pago: 'EFECTIVO',
  detalles: [],
});

describe('sincronizarVentas', () => {
  it('no hace nada si la cola está vacía', async () => {
    const storage = makeStorage({ ventas_offline: '[]' });
    const crearVenta = vi.fn();
    const result = await sincronizarVentas({ storage, crearVenta });
    expect(crearVenta).not.toHaveBeenCalled();
    expect(result).toEqual({ exitosas: 0, fallidas: 0 });
  });

  it('envía cada venta al backend sin offline_id', async () => {
    const v1 = venta('id-1');
    const storage = makeStorage({ ventas_offline: JSON.stringify([v1]) });
    const crearVenta = vi.fn().mockResolvedValue({});

    await sincronizarVentas({ storage, crearVenta });

    expect(crearVenta).toHaveBeenCalledOnce();
    const payloadEnviado = crearVenta.mock.calls[0][0];
    expect(payloadEnviado.offline_id).toBeUndefined();
    expect(payloadEnviado.total).toBe(1000);
  });

  it('elimina la venta de la cola tras sincronizarla', async () => {
    const v1 = venta('id-1');
    const storage = makeStorage({ ventas_offline: JSON.stringify([v1]) });
    const crearVenta = vi.fn().mockResolvedValue({});

    await sincronizarVentas({ storage, crearVenta });

    expect(storage._get('ventas_offline')).toEqual([]);
  });

  it('reporta exitosas y fallidas correctamente', async () => {
    const storage = makeStorage({
      ventas_offline: JSON.stringify([venta('ok'), venta('fail')]),
    });
    const crearVenta = vi.fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('Red caída'));

    const result = await sincronizarVentas({ storage, crearVenta });

    expect(result).toEqual({ exitosas: 1, fallidas: 1 });
  });

  it('la venta fallida se mantiene en la cola', async () => {
    const v1 = venta('ok');
    const v2 = venta('fail');
    const storage = makeStorage({ ventas_offline: JSON.stringify([v1, v2]) });
    const crearVenta = vi.fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('error'));

    await sincronizarVentas({ storage, crearVenta });

    const cola = storage._get('ventas_offline');
    expect(cola).toHaveLength(1);
    expect(cola[0].offline_id).toBe('fail');
  });

  it('sincroniza múltiples ventas en orden', async () => {
    const ventas = [venta('a', 100), venta('b', 200), venta('c', 300)];
    const storage = makeStorage({ ventas_offline: JSON.stringify(ventas) });
    const crearVenta = vi.fn().mockResolvedValue({});

    const result = await sincronizarVentas({ storage, crearVenta });

    expect(crearVenta).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ exitosas: 3, fallidas: 0 });
    expect(storage._get('ventas_offline')).toEqual([]);
  });
});
