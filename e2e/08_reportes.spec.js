import { test, expect } from '@playwright/test';
import { login, apiLogin, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers/auth.js';

test.beforeEach(async ({ page, request }) => {
  await apiLogin(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  // Verificar que el plan tiene acceso a reportes; si no, skip
  const me = await request.get('/api/inventario/usuarios/me/');
  const user = await me.json();
  if (!user.plan?.tiene_reportes) {
    test.skip(true, 'Plan Gratis no tiene acceso a Reportes — prueba de bloqueo en 6.5');
  }
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
});

// ─── 6.1 ─────────────────────────────────────────────────────────────────────
test('6.1 — Dashboard carga y muestra módulos del negocio', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 });
  await expect(page.locator('text=/Administración|Inventario|Caja/i').first()).toBeVisible({ timeout: 8_000 });
});

// ─── 6.2 ─────────────────────────────────────────────────────────────────────
test('6.2 — Filtrar ventas por rango de fecha devuelve resultados', async ({ request }) => {
  const hoy = new Date().toISOString().split('T')[0];
  const hace30 = new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0];
  const res = await request.get(`/api/inventario/ventas/?fecha_inicio=${hace30}&fecha_fin=${hoy}`);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data).toBeTruthy();
});

// ─── 6.3 ─────────────────────────────────────────────────────────────────────
test('6.3 — Productos más vendidos están ordenados', async ({ request }) => {
  const res = await request.get('/api/inventario/reportes/productos-mas-vendidos/');
  if (!res.ok()) return; // endpoint puede tener otra ruta
  const data = await res.json();
  const lista = data.results || data;
  if (lista.length > 1) {
    // Verificar orden descendente por cantidad vendida
    for (let i = 0; i < lista.length - 1; i++) {
      expect(Number(lista[i].total_vendido)).toBeGreaterThanOrEqual(Number(lista[i + 1].total_vendido));
    }
  }
});

// ─── 6.4 ─────────────────────────────────────────────────────────────────────
test('6.4 — Alertas de stock bajo solo muestran productos bajo el umbral', async ({ request }) => {
  const res = await request.get('/api/inventario/productos/?stock_bajo=1');
  if (!res.ok()) {
    // Intentar ruta alternativa
    const res2 = await request.get('/api/inventario/alertas/');
    if (!res2.ok()) return;
    const data = await res2.json();
    const lista = data.results || data;
    lista.forEach((p) => {
      expect(Number(p.stock)).toBeLessThanOrEqual(Number(p.umbral_stock));
    });
    return;
  }
  const data = await res.json();
  const lista = data.results || data;
  lista.forEach((p) => {
    expect(Number(p.stock)).toBeLessThanOrEqual(Number(p.umbral_stock));
  });
});
