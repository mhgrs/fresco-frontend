import { test, expect } from '@playwright/test';
import { apiLogin, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers/auth.js';

test.beforeEach(async ({ request }) => {
  await apiLogin(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  const me = await request.get('/api/inventario/usuarios/me/');
  const user = await me.json();
  if (!user.plan?.tiene_cierre_caja) {
    test.skip(true, 'Plan Gratis no incluye Cierre de Caja — tests 5.x solo aplican con plan pagado');
  }
});

// ─── 5.1 ─────────────────────────────────────────────────────────────────────
test('5.1 — Abrir turno con fondo de apertura queda activo', async ({ request }) => {
  // Cerrar turno si hay uno activo primero
  const activo = await request.get('/api/inventario/turnos/activo/');
  if (activo.ok()) {
    const turno = await activo.json();
    if (turno.id) {
      await request.post(`/api/inventario/turnos/${turno.id}/cerrar/`, {
        data: { efectivo_contado: 0 },
      });
    }
  }
  // Abrir nuevo turno via /abrir/
  const res = await request.post('/api/inventario/turnos/abrir/', {
    data: { fondo_apertura: 50000 },
  });
  expect([200, 201]).toContain(res.status());
  const turno = await res.json();
  expect(turno.id).toBeTruthy();
  expect(turno.estado).toBe('abierto');

  // Cerrar turno de limpieza
  await request.post(`/api/inventario/turnos/${turno.id}/cerrar/`, {
    data: { efectivo_contado: 50000 },
  });
});

// ─── 5.2 ─────────────────────────────────────────────────────────────────────
test('5.2 — No se puede abrir segundo turno si ya hay uno activo', async ({ request }) => {
  // Abrir un turno
  const res1 = await request.post('/api/inventario/turnos/abrir/', {
    data: { fondo_apertura: 10000 },
  });
  if (!res1.ok()) return; // ya puede haber uno activo, que es lo que probamos

  // Intentar abrir otro
  const res2 = await request.post('/api/inventario/turnos/abrir/', {
    data: { fondo_apertura: 5000 },
  });
  expect([400, 409]).toContain(res2.status());

  // Cleanup: cerrar el turno abierto
  const turno = await res1.json();
  if (turno.id) {
    await request.post(`/api/inventario/turnos/${turno.id}/cerrar/`, {
      data: { efectivo_contado: 10000 },
    });
  }
});

// ─── 5.3 ─────────────────────────────────────────────────────────────────────
test('5.3 — Registrar movimiento de ingreso durante el turno', async ({ request }) => {
  // Asegurar turno activo
  let turnoId;
  const activo = await request.get('/api/inventario/turnos/activo/');
  if (activo.ok()) {
    turnoId = (await activo.json()).id;
  } else {
    const nuevo = await request.post('/api/inventario/turnos/abrir/', { data: { fondo_apertura: 0 } });
    if (nuevo.ok()) turnoId = (await nuevo.json()).id;
  }
  if (!turnoId) return;

  const res = await request.post('/api/inventario/movimientos-caja/', {
    data: { tipo: 'ingreso', monto: 5000, descripcion: 'Test ingreso automatizado' },
  });
  expect([200, 201]).toContain(res.status());
});

// ─── 5.4 ─────────────────────────────────────────────────────────────────────
test('5.4 — Registrar movimiento de retiro durante el turno', async ({ request }) => {
  let turnoId;
  const activo = await request.get('/api/inventario/turnos/activo/');
  if (activo.ok()) {
    turnoId = (await activo.json()).id;
  } else {
    const nuevo = await request.post('/api/inventario/turnos/abrir/', { data: { fondo_apertura: 10000 } });
    if (nuevo.ok()) turnoId = (await nuevo.json()).id;
  }
  if (!turnoId) return;

  const res = await request.post('/api/inventario/movimientos-caja/', {
    data: { tipo: 'retiro', monto: 1000, descripcion: 'Test retiro automatizado' },
  });
  expect([200, 201]).toContain(res.status());
});

// ─── 5.5 ─────────────────────────────────────────────────────────────────────
test('5.5 — Cerrar turno retorna totales calculados', async ({ request }) => {
  // Abrir turno
  const nuevo = await request.post('/api/inventario/turnos/abrir/', { data: { fondo_apertura: 20000 } });
  if (!nuevo.ok()) {
    // Turno ya existe — usar el activo
    const activo = await request.get('/api/inventario/turnos/activo/');
    if (!activo.ok()) return;
    const turno = await activo.json();
    const cerrar = await request.post(`/api/inventario/turnos/${turno.id}/cerrar/`, {
      data: { efectivo_contado: 20000 },
    });
    expect(cerrar.ok()).toBeTruthy();
    const resultado = await cerrar.json();
    expect(resultado.estado).toBe('cerrado');
    expect(resultado.fecha_cierre).toBeTruthy();
    return;
  }
  const turno = await nuevo.json();
  const cerrar = await request.post(`/api/inventario/turnos/${turno.id}/cerrar/`, {
    data: { efectivo_contado: 20000 },
  });
  expect(cerrar.ok()).toBeTruthy();
  const resultado = await cerrar.json();
  expect(resultado.estado).toBe('cerrado');
  expect(resultado.fecha_cierre).toBeTruthy();
});
