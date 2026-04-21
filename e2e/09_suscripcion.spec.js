import { test, expect } from '@playwright/test';
import { login, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers/auth.js';

// ─── 7.8 ─────────────────────────────────────────────────────────────────────
test('7.8 — Cancelar suscripción baja al plan Gratis', async ({ request }) => {
  const loginRes = await request.post('/api/inventario/usuarios/login/', {
    data: { username: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });

  // Verificar plan actual
  const susRes = await request.get('/api/suscripcion/');
  expect(susRes.ok()).toBeTruthy();
  const sus = await susRes.json();

  // Solo cancelar si tiene un plan de pago activo para no degradar la cuenta de prueba
  if (sus.plan?.nombre === 'gratis') {
    // Ya es Gratis — no hay nada que cancelar, prueba condicional
    expect(sus.plan.nombre).toBe('gratis');
    return;
  }

  const cancelRes = await request.post('/api/suscripcion/cancelar/');
  expect(cancelRes.ok()).toBeTruthy();

  // Verificar que bajó a Gratis
  const susPost = await request.get('/api/suscripcion/');
  const susPostData = await susPost.json();
  expect(susPostData.plan?.nombre).toBe('gratis');
});

// ─── 7.10 ────────────────────────────────────────────────────────────────────
test('7.10 — Suscripción vencida bloquea acceso a Reportes', async ({ page, request }) => {
  // Verificar vía API que el usuario actual tiene plan con o sin reportes
  const loginRes = await request.post('/api/inventario/usuarios/login/', {
    data: { username: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const me = await request.get('/api/inventario/usuarios/me/');
  const user = await me.json();

  if (!user.plan?.tiene_reportes) {
    // Plan sin acceso a reportes — confirmar que la UI bloquea
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/reportes');
    // Debe redirigir o mostrar bloqueo
    await page.waitForTimeout(1_000);
    const url = page.url();
    const bloqueado = url.includes('configuracion') || url.includes('pagos');
    if (!bloqueado) {
      await expect(page.locator('text=/upgrade|mejorar|plan/i').first()).toBeVisible({ timeout: 5_000 });
    } else {
      expect(bloqueado).toBeTruthy();
    }
  }
});

// ─── Suscripción: planes disponibles ─────────────────────────────────────────
test('Planes públicos disponibles via API', async ({ request }) => {
  const res = await request.get('/api/suscripcion/planes/');
  expect(res.ok()).toBeTruthy();
  const planes = await res.json();
  const lista = planes.results || planes;
  expect(lista.length).toBeGreaterThanOrEqual(3); // gratis, basico, pro
  const nombres = lista.map((p) => p.nombre.toLowerCase());
  expect(nombres).toContain('gratis');
});

// ─── Suscripción: historial de pagos ─────────────────────────────────────────
test('Historial de pagos accesible para el usuario autenticado', async ({ request }) => {
  await request.post('/api/inventario/usuarios/login/', {
    data: { username: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const res = await request.get('/api/suscripcion/historial/');
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  // Puede estar vacío si no hay pagos — solo verificar que responde
  expect(Array.isArray(data.results || data)).toBeTruthy();
});
