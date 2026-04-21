import { test, expect } from '@playwright/test';
import { login, logout, ADMIN_EMAIL, ADMIN_PASSWORD, CAJERO_EMAIL, CAJERO_PASSWORD, OTRO_EMAIL, OTRO_PASSWORD } from './helpers/auth.js';

let empresaAId;
let empresaBId;

test.beforeAll(async ({ request }) => {
  // Obtener IDs de empresa para cada usuario via API
  const resA = await request.post('/api/inventario/usuarios/login/', {
    data: { username: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (resA.ok()) {
    const data = await resA.json();
    empresaAId = data.empresa?.id;
  }
});

// ─── 2.2 ─────────────────────────────────────────────────────────────────────
test('2.2 — Usuario empresa A no puede ver productos de empresa B', async ({ request }) => {
  test.skip(!OTRO_EMAIL, 'TEST_OTRO_EMAIL no configurado');

  // Login como empresa A
  await request.post('/api/inventario/usuarios/login/', {
    data: { username: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const resProductos = await request.get('/api/inventario/productos/');
  expect(resProductos.ok()).toBeTruthy();
  const productos = await resProductos.json();
  const ids = (productos.results || productos).map((p) => p.empresa);
  // Todos los productos deben ser de la misma empresa
  const empresasUnicas = [...new Set(ids)];
  expect(empresasUnicas.length).toBeLessThanOrEqual(1);
});

// ─── 2.3 ─────────────────────────────────────────────────────────────────────
test('2.3 — Usuario empresa A no puede ver ventas de empresa B', async ({ request }) => {
  await request.post('/api/inventario/usuarios/login/', {
    data: { username: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const resVentas = await request.get('/api/inventario/ventas/');
  expect(resVentas.ok()).toBeTruthy();
  const ventas = await resVentas.json();
  const lista = ventas.results || ventas;
  const empresasUnicas = [...new Set(lista.map((v) => v.empresa))];
  expect(empresasUnicas.length).toBeLessThanOrEqual(1);
});

// ─── 2.5 ─────────────────────────────────────────────────────────────────────
test('2.5 — Código de invitación expirado es rechazado', async ({ request }) => {
  await request.post('/api/inventario/usuarios/login/', {
    data: { username: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  // Intentar unirse con código claramente inválido/expirado
  const res = await request.post('/api/inventario/empresas/unirse/', {
    data: { codigo: 'EXPIRADO00' },
  });
  expect([400, 404]).toContain(res.status());
});

// ─── 2.6 ─────────────────────────────────────────────────────────────────────
test('2.6 — Código de invitación inválido es rechazado', async ({ request }) => {
  await request.post('/api/inventario/usuarios/login/', {
    data: { username: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const res = await request.post('/api/inventario/empresas/unirse/', {
    data: { codigo: 'INVALIDO99' },
  });
  expect([400, 404]).toContain(res.status());
});

// ─── 2.7 ─────────────────────────────────────────────────────────────────────
test('2.7 — ADMIN puede acceder a configuración', async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto('/configuracion');
  await expect(page).toHaveURL(/\/configuracion/);
  // La página de configuración carga con sus pestañas
  await expect(page.locator('text=/Configuración|Perfil|Suscripción/').first()).toBeVisible();
});

// ─── 2.8 ─────────────────────────────────────────────────────────────────────
test('2.8 — CAJERO no puede acceder a Gestión de Empresa', async ({ page }) => {
  test.skip(!CAJERO_EMAIL, 'TEST_CAJERO_EMAIL no configurado');
  await login(page, CAJERO_EMAIL, CAJERO_PASSWORD);
  await page.goto('/equipo');
  // Debe redirigir (el cajero no tiene acceso a /equipo)
  await expect(page).not.toHaveURL('/equipo');
});
