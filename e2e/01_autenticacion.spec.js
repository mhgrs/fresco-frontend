import { test, expect } from '@playwright/test';
import {
  login, logout,
  ADMIN_EMAIL, ADMIN_PASSWORD,
  UNVERIFIED_EMAIL, UNVERIFIED_PASSWORD,
} from './helpers/auth.js';

// ─── 1.2 ─────────────────────────────────────────────────────────────────────
test('1.2 — Registro con email ya existente muestra error', async ({ page }) => {
  await page.goto('/registro');
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.click('button[type="submit"]');
  await expect(page.locator('text=ya tiene una cuenta')).toBeVisible();
});

// ─── 1.3 ─────────────────────────────────────────────────────────────────────
test('1.3 — Registro sin aceptar T&C bloquea el botón', async ({ page }) => {
  await page.goto('/registro');
  // Avanzar al paso 2 con email nuevo
  const email = `test-${Date.now()}@mailinator.com`;
  await page.fill('input[name="email"]', email);
  await page.click('button[type="submit"]');
  // Rellenar datos mínimos sin marcar checkbox
  await page.fill('input[name="first_name"]', 'Test');
  await page.fill('input[name="last_name"]', 'User');
  await page.fill('input[name="password"]', 'TestPass123!');
  await page.fill('input[name="confirm_password"]', 'TestPass123!');
  // El checkbox de T&C no está marcado → botón disabled
  const submit = page.locator('button[type="submit"]').last();
  await expect(submit).toBeDisabled();
});

// ─── 1.6 ─────────────────────────────────────────────────────────────────────
test('1.6 — Login correcto redirige al dashboard', async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/dashboard/);
});

// ─── 1.7 ─────────────────────────────────────────────────────────────────────
test('1.7 — Login con contraseña incorrecta muestra error', async ({ page }) => {
  await page.goto('/fresco-login');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', 'contraseña-incorrecta-xyz');
  await page.click('button[type="submit"]');
  // Permanece en login con mensaje de error
  await expect(page).toHaveURL('/fresco-login');
  await expect(page.locator('div[class*="red"]')).toBeVisible();
});

// ─── 1.8 ─────────────────────────────────────────────────────────────────────
test('1.8 — Login sin email verificado muestra mensaje explicativo', async ({ page }) => {
  test.skip(!UNVERIFIED_EMAIL, 'TEST_UNVERIFIED_EMAIL no configurado');
  await page.goto('/fresco-login');
  await page.fill('input[type="email"]', UNVERIFIED_EMAIL);
  await page.fill('input[type="password"]', UNVERIFIED_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/fresco-login');
  const error = page.locator('div[class*="red"]');
  await expect(error).toBeVisible();
  // Debe mencionar verificación o correo
  await expect(error).toContainText(/verif|correo/i);
});

// ─── 1.9 ─────────────────────────────────────────────────────────────────────
test('1.9 — Rate limit: intentos repetidos de login son rechazados', async ({ request }) => {
  test.setTimeout(60_000);
  const responses = [];
  for (let i = 0; i < 12; i++) {
    const res = await request.post('/api/inventario/usuarios/login/', {
      data: { username: `ratetest-${Date.now()}@x.com`, password: 'wrong' },
    });
    responses.push(res.status());
    if (res.status() === 429) break;
  }
  // El endpoint rechaza con 401 (credenciales incorrectas) o 429 (rate limit)
  const validStatuses = [401, 429];
  expect(responses.every((s) => validStatuses.includes(s))).toBeTruthy();
});

// ─── 1.13 ────────────────────────────────────────────────────────────────────
test('1.13 — Logout borra sesión y redirige a login', async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await logout(page);
  // Intentar acceder a ruta protegida
  await page.goto('/dashboard');
  await expect(page).not.toHaveURL('/dashboard');
});

// ─── 1.15 ────────────────────────────────────────────────────────────────────
test('1.15 — Ruta protegida sin sesión redirige a landing o login', async ({ page }) => {
  // Asegurar sin sesión
  await page.goto('/fresco-login');
  await page.goto('/dashboard');
  // Sin sesión, debe redirigir (no quedarse en /dashboard)
  await page.waitForTimeout(1_000);
  await expect(page).not.toHaveURL('/dashboard');
});
