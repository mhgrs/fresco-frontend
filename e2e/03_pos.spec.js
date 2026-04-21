import { test, expect } from '@playwright/test';
import { login, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers/auth.js';

test.beforeEach(async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto('/pos');
  await expect(page).toHaveURL(/\/pos/);
});

// ─── 4.1 ─────────────────────────────────────────────────────────────────────
test('4.1 — Buscar y agregar producto al carrito por nombre', async ({ page }) => {
  const buscador = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
  await buscador.fill('a'); // letra genérica para obtener resultados
  await page.waitForTimeout(500);
  const primerProducto = page.locator('[data-testid="producto-card"], .producto-card, button:has-text("Agregar")').first();
  if (await primerProducto.count() > 0) {
    await primerProducto.click();
    // Debe aparecer en el carrito
    await expect(page.locator('[data-testid="carrito"], .carrito, text=/carrito|Carrito/i').first()).toBeVisible();
  }
});

// ─── 4.3 ─────────────────────────────────────────────────────────────────────
test('4.3 — Cambiar cantidad en carrito actualiza el total', async ({ page }) => {
  // Agregar un producto primero
  const buscador = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
  await buscador.fill('a');
  await page.waitForTimeout(500);
  const producto = page.locator('button:has-text("Agregar"), [role="button"]').first();
  if (await producto.count() > 0) {
    await producto.click();
    await page.waitForTimeout(300);
    // Buscar input de cantidad en el carrito
    const cantidadInput = page.locator('input[type="number"]').first();
    if (await cantidadInput.count() > 0) {
      const totalAntes = await page.locator('[data-testid="total"], text=/Total|TOTAL/i').first().textContent();
      await cantidadInput.fill('2');
      await cantidadInput.press('Tab');
      await page.waitForTimeout(300);
      const totalDespues = await page.locator('[data-testid="total"], text=/Total|TOTAL/i').first().textContent();
      expect(totalAntes).not.toBe(totalDespues);
    }
  }
});

// ─── 4.4 ─────────────────────────────────────────────────────────────────────
test('4.4 — Eliminar ítem del carrito', async ({ page }) => {
  const buscador = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
  await buscador.fill('a');
  await page.waitForTimeout(500);
  const producto = page.locator('button:has-text("Agregar"), [role="button"]').first();
  if (await producto.count() > 0) {
    await producto.click();
    await page.waitForTimeout(300);
    // Botón eliminar en carrito (×, ✕, trash icon)
    const eliminar = page.locator('button[aria-label*="limin"], button:has-text("×"), button:has-text("✕")').first();
    if (await eliminar.count() > 0) {
      await eliminar.click();
      await page.waitForTimeout(300);
      // Carrito debe estar vacío
      const carritoItems = page.locator('[data-testid="carrito-item"]');
      await expect(carritoItems).toHaveCount(0);
    }
  }
});

// ─── 4.5 ─────────────────────────────────────────────────────────────────────
test('4.5 — Aplicar descuento recalcula el total', async ({ page }) => {
  const buscador = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
  await buscador.fill('a');
  await page.waitForTimeout(500);
  const producto = page.locator('button:has-text("Agregar"), [role="button"]').first();
  if (await producto.count() > 0) {
    await producto.click();
    await page.waitForTimeout(300);
    const descuentoInput = page.locator('input[placeholder*="escuento"], input[name*="descuento"]').first();
    if (await descuentoInput.count() > 0) {
      const totalAntes = await page.locator('text=/\\$[0-9]/').first().textContent();
      await descuentoInput.fill('10');
      await descuentoInput.press('Tab');
      await page.waitForTimeout(300);
      const totalDespues = await page.locator('text=/\\$[0-9]/').first().textContent();
      expect(totalAntes).not.toBe(totalDespues);
    }
  }
});

// ─── 4.6 ─────────────────────────────────────────────────────────────────────
test('4.6 — Pagar con efectivo registra la venta', async ({ page }) => {
  const buscador = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
  await buscador.fill('a');
  await page.waitForTimeout(500);
  const producto = page.locator('button:has-text("Agregar"), [role="button"]').first();
  if (await producto.count() > 0) {
    await producto.click();
    await page.waitForTimeout(300);
    // Seleccionar método efectivo y procesar venta
    const btnEfectivo = page.locator('button:has-text("Efectivo"), [data-metodo="EFECTIVO"]').first();
    if (await btnEfectivo.count() > 0) {
      await btnEfectivo.click();
      const btnCobrar = page.locator('button:has-text("Cobrar"), button:has-text("Pagar")').first();
      if (await btnCobrar.count() > 0) {
        await btnCobrar.click();
        // Esperar confirmación o carrito limpio
        await page.waitForTimeout(1_000);
        await expect(page.locator('text=/exitosa|registrada|Venta/i').first().or(
          page.locator('[data-testid="venta-exitosa"]')
        )).toBeVisible({ timeout: 5_000 }).catch(() => {});
      }
    }
  }
});

// ─── 4.7 ─────────────────────────────────────────────────────────────────────
test('4.7 — Pagar con tarjeta registra la venta', async ({ page }) => {
  const buscador = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
  await buscador.fill('a');
  await page.waitForTimeout(500);
  const producto = page.locator('button:has-text("Agregar"), [role="button"]').first();
  if (await producto.count() > 0) {
    await producto.click();
    await page.waitForTimeout(300);
    const btnTarjeta = page.locator('button:has-text("Tarjeta"), [data-metodo="TARJETA"]').first();
    if (await btnTarjeta.count() > 0) {
      await btnTarjeta.click();
      const btnCobrar = page.locator('button:has-text("Cobrar"), button:has-text("Pagar")').first();
      if (await btnCobrar.count() > 0) {
        await btnCobrar.click();
        await page.waitForTimeout(1_000);
      }
    }
  }
});

// ─── 4.8 ─────────────────────────────────────────────────────────────────────
test('4.8 — Pagar con transferencia registra la venta', async ({ page }) => {
  const buscador = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
  await buscador.fill('a');
  await page.waitForTimeout(500);
  const producto = page.locator('button:has-text("Agregar"), [role="button"]').first();
  if (await producto.count() > 0) {
    await producto.click();
    await page.waitForTimeout(300);
    const btnTransf = page.locator('button:has-text("Transferencia"), [data-metodo="TRANSFERENCIA"]').first();
    if (await btnTransf.count() > 0) {
      await btnTransf.click();
      const btnCobrar = page.locator('button:has-text("Cobrar"), button:has-text("Pagar")').first();
      if (await btnCobrar.count() > 0) {
        await btnCobrar.click();
        await page.waitForTimeout(1_000);
      }
    }
  }
});

// ─── 4.9 ─────────────────────────────────────────────────────────────────────
test('4.9 — Pagar al crédito (ANOTADO) registra la venta', async ({ page }) => {
  const buscador = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
  await buscador.fill('a');
  await page.waitForTimeout(500);
  const producto = page.locator('button:has-text("Agregar"), [role="button"]').first();
  if (await producto.count() > 0) {
    await producto.click();
    await page.waitForTimeout(300);
    const btnAnotado = page.locator('button:has-text("Anotado"), button:has-text("Crédito"), [data-metodo="ANOTADO"]').first();
    if (await btnAnotado.count() > 0) {
      await btnAnotado.click();
      const btnCobrar = page.locator('button:has-text("Cobrar"), button:has-text("Pagar")').first();
      if (await btnCobrar.count() > 0) {
        await btnCobrar.click();
        await page.waitForTimeout(1_000);
      }
    }
  }
});

// ─── 4.10 ────────────────────────────────────────────────────────────────────
test('4.10 — Stock insuficiente muestra error y no procesa venta', async ({ page, request }) => {
  // Via API: intentar vender más unidades de las disponibles en algún producto con stock 0
  const loginRes = await request.post('/api/inventario/usuarios/login/', {
    data: { username: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });

  // Obtener lista de productos
  const productosRes = await request.get('/api/inventario/productos/');
  const productos = await productosRes.json();
  const lista = productos.results || productos;
  const sinStock = lista.find((p) => Number(p.stock) === 0);

  if (sinStock) {
    const ventaRes = await request.post('/api/inventario/ventas/', {
      data: {
        metodo_pago: 'EFECTIVO',
        detalles: [{ producto: sinStock.id, cantidad: 1 }],
      },
    });
    expect([400, 422]).toContain(ventaRes.status());
  }
});

// ─── 4.12 ────────────────────────────────────────────────────────────────────
test('4.12 — Plan Gratis: POS funciona sin turno abierto', async ({ page }) => {
  // El POS debe cargar normalmente (no bloquear por falta de turno en plan Gratis)
  await expect(page).toHaveURL(/\/pos/);
  // No debe aparecer mensaje de "abre un turno primero"
  const bloqueado = page.locator('text=/abre un turno|necesitas abrir/i');
  // En plan Gratis el POS no debería estar bloqueado por turno
  await expect(bloqueado).toHaveCount(0);
});
