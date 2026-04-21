/**
 * Helpers de autenticación para tests E2E.
 * Utiliza las variables de entorno definidas en .env.test
 */

export const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    || '';
export const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '';
export const CAJERO_EMAIL    = process.env.TEST_CAJERO_EMAIL    || '';
export const CAJERO_PASSWORD = process.env.TEST_CAJERO_PASSWORD || '';
export const OTRO_EMAIL    = process.env.TEST_OTRO_EMAIL    || '';
export const OTRO_PASSWORD = process.env.TEST_OTRO_PASSWORD || '';
export const UNVERIFIED_EMAIL    = process.env.TEST_UNVERIFIED_EMAIL    || '';
export const UNVERIFIED_PASSWORD = process.env.TEST_UNVERIFIED_PASSWORD || '';

/** Inicia sesión via API request context (comparte cookies dentro del mismo test) */
export async function apiLogin(request, email, password) {
  await request.post('/api/inventario/usuarios/login/', {
    data: { username: email, password },
  });
}

/** Inicia sesión via UI y espera redireccion al dashboard */
export async function login(page, email, password) {
  await page.goto('/fresco-login');
  // Si ya está autenticado, el login page redirige al dashboard automáticamente
  if (!page.url().includes('fresco-login')) {
    return;
  }
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10_000 });
}

/** Cierra sesión via API y recarga para volver al estado público */
export async function logout(page) {
  await page.request.post('/api/inventario/usuarios/logout/');
  await page.context().clearCookies();
  await page.goto('/fresco-login');
  await page.waitForTimeout(300);
}

/** Verifica que la sesión es válida comprobando que /dashboard carga */
export async function assertLoggedIn(page) {
  await page.goto('/dashboard');
  await page.waitForURL('/dashboard', { timeout: 5_000 });
}
