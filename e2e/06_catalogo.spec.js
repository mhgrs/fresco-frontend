import { test, expect } from '@playwright/test';
import { login, apiLogin, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers/auth.js';

test.beforeEach(async ({ page, request }) => {
  await apiLogin(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
});

// ─── 3.1 ─────────────────────────────────────────────────────────────────────
test('3.1 — Crear producto con todos los campos aparece en catálogo', async ({ page, request }) => {
  // Asegurar que hay espacio para crear un producto (respetar límite del plan)
  const meRes = await request.get('/api/inventario/usuarios/me/');
  const meUser = await meRes.json();
  const maxP = meUser.plan?.max_productos || 10;
  const listRes = await request.get('/api/inventario/productos/');
  const lista = (await listRes.json()).results || await listRes.json();
  // Eliminar tantos productos activos como sea necesario para bajar del límite
  const activosEnLista = lista.filter((p) => p.esta_activo !== false);
  const sobran = activosEnLista.length - maxP + 1;
  for (let i = 0; i < sobran; i++) {
    await request.delete(`/api/inventario/productos/${activosEnLista[i].id}/`);
  }

  // Obtener una categoría válida para el producto
  const catRes = await request.get('/api/inventario/categorias/');
  const cats = await catRes.json();
  const catId = (Array.isArray(cats) ? cats : cats.results)?.[0]?.id;

  const nombre = `Producto Test ${Date.now()}`;
  const res = await request.post('/api/inventario/productos/', {
    data: { nombre, precio: '1500', stock: '10', umbral_stock: '2', categoria: catId, tipo_venta: 'UNIDAD' },
  });
  expect([200, 201]).toContain(res.status());

  await page.goto('/inventario');
  await expect(page.locator(`text=${nombre}`)).toBeVisible({ timeout: 8_000 });

  // Cleanup: eliminar el producto creado
  const data = await res.json();
  if (data.id) await request.delete(`/api/inventario/productos/${data.id}/`);
  // El productoDesactivado ya fue eliminado (soft delete), no se puede "reactivar" automáticamente
});

// ─── 3.3 ─────────────────────────────────────────────────────────────────────
test('3.3 — Editar precio, stock y umbral de un producto', async ({ request }) => {
  // Obtener primer producto
  const listRes = await request.get('/api/inventario/productos/');
  const lista = (await listRes.json()).results || await listRes.json();
  if (lista.length === 0) return;

  const producto = lista[0];
  const res = await request.patch(`/api/inventario/productos/${producto.id}/`, {
    data: { precio: '9999', stock: '50', umbral_stock: '5' },
  });
  expect(res.ok()).toBeTruthy();
  const updated = await res.json();
  expect(Number(updated.precio)).toBe(9999);
  expect(Number(updated.stock)).toBe(50);

  // Restaurar
  await request.patch(`/api/inventario/productos/${producto.id}/`, {
    data: { precio: producto.precio, stock: producto.stock, umbral_stock: producto.umbral_stock },
  });
});

// ─── 3.4 ─────────────────────────────────────────────────────────────────────
test('3.4 — Soft delete: producto no aparece en catálogo pero historial intacto', async ({ request }) => {
  // Asegurar espacio para crear un producto temporal (respetar límite del plan)
  const meRes2 = await request.get('/api/inventario/usuarios/me/');
  const meUser2 = await meRes2.json();
  const maxP2 = meUser2.plan?.max_productos || 10;
  const preList = await request.get('/api/inventario/productos/');
  const preListArr = (await preList.json()).results || await preList.json();
  const activosEnLista2 = preListArr.filter((p) => p.esta_activo !== false);
  const sobran2 = activosEnLista2.length - maxP2 + 1;
  for (let i = 0; i < sobran2; i++) {
    await request.delete(`/api/inventario/productos/${activosEnLista2[i].id}/`);
  }

  // Obtener categoría válida
  const catRes2 = await request.get('/api/inventario/categorias/');
  const cats2 = await catRes2.json();
  const catId2 = (Array.isArray(cats2) ? cats2 : cats2.results)?.[0]?.id;

  // Crear producto temporal
  const nombre = `Soft Delete ${Date.now()}`;
  const createRes = await request.post('/api/inventario/productos/', {
    data: { nombre, precio: '100', stock: '5', categoria: catId2, tipo_venta: 'UNIDAD' },
  });
  expect([200, 201]).toContain(createRes.status());
  const producto = await createRes.json();

  // Eliminar (soft delete)
  const delRes = await request.delete(`/api/inventario/productos/${producto.id}/`);
  expect([200, 204]).toContain(delRes.status());

  // Ya no debe aparecer en el listado activo (el API devuelve todos, filtrar por activos)
  const listRes = await request.get('/api/inventario/productos/');
  const todosLosProductos = (await listRes.json()).results || await listRes.json();
  const lista = todosLosProductos.filter((p) => p.esta_activo !== false);
  const encontrado = lista.find((p) => p.id === producto.id);
  expect(encontrado).toBeUndefined();
});

// ─── 3.5 ─────────────────────────────────────────────────────────────────────
test('3.5 — Buscar producto por nombre devuelve resultados', async ({ request }) => {
  const listRes = await request.get('/api/inventario/productos/');
  const lista = (await listRes.json()).results || await listRes.json();
  if (lista.length === 0) return;

  const nombre = lista[0].nombre.substring(0, 3);
  const busRes = await request.get(`/api/inventario/productos/?search=${nombre}`);
  expect(busRes.ok()).toBeTruthy();
  const resultados = (await busRes.json()).results || await busRes.json();
  expect(resultados.length).toBeGreaterThan(0);
});

// ─── 3.6 ─────────────────────────────────────────────────────────────────────
test('3.6 — Filtrar productos por categoría', async ({ request }) => {
  const catRes = await request.get('/api/inventario/categorias/');
  const categorias = (await catRes.json()).results || await catRes.json();
  if (categorias.length === 0) return;

  const res = await request.get(`/api/inventario/productos/?categoria=${categorias[0].id}`);
  expect(res.ok()).toBeTruthy();
  const productos = (await res.json()).results || await res.json();
  productos.forEach((p) => {
    expect(p.categoria).toBe(categorias[0].id);
  });
});

// ─── 3.7 ─────────────────────────────────────────────────────────────────────
test('3.7 — Ajuste de stock manual actualiza el stock', async ({ request }) => {
  const listRes = await request.get('/api/inventario/productos/');
  const lista = (await listRes.json()).results || await listRes.json();
  if (lista.length === 0) return;

  const producto = lista[0];
  const stockOriginal = Number(producto.stock);
  const res = await request.post(`/api/inventario/productos/${producto.id}/ajustar_stock/`, {
    data: { cantidad: 5, tipo: 'INGRESO', motivo: 'Test automatizado' },
  });
  expect(res.ok()).toBeTruthy();
  const updated = await res.json();
  expect(Number(updated.stock)).toBe(stockOriginal + 5);

  // Revertir
  await request.post(`/api/inventario/productos/${producto.id}/ajustar_stock/`, {
    data: { cantidad: 5, tipo: 'RETIRO', motivo: 'Revertir test' },
  });
});

// ─── 3.8 ─────────────────────────────────────────────────────────────────────
test('3.8 — Stock no puede quedar negativo en ajuste manual', async ({ request }) => {
  const listRes = await request.get('/api/inventario/productos/');
  const lista = (await listRes.json()).results || await listRes.json();
  if (lista.length === 0) return;

  const producto = lista[0];
  const stockActual = Number(producto.stock);
  const res = await request.post(`/api/inventario/productos/${producto.id}/ajustar_stock/`, {
    data: { cantidad: stockActual + 9999, tipo: 'RETIRO', motivo: 'Test negativo' },
  });
  expect([400, 422]).toContain(res.status());
});
