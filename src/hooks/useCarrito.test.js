import { renderHook, act } from '@testing-library/react';
import { useCarrito } from './useCarrito';

const prod = (id, precio = 100, tipo_venta = 'UNIDAD') => ({
  id,
  nombre: `Producto ${id}`,
  precio,
  tipo_venta,
  sku: `SKU${id}`,
});

test('carrito inicia vacío', () => {
  const { result } = renderHook(() => useCarrito());
  expect(result.current.carrito).toEqual([]);
  expect(result.current.totalCarrito).toBe(0);
});

test('agregar un producto nuevo lo agrega con cantidad 1', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1)));
  expect(result.current.carrito).toHaveLength(1);
  expect(result.current.carrito[0].cantidad).toBe(1);
});

test('agregar el mismo producto incrementa la cantidad', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1)));
  act(() => result.current.agregar(prod(1)));
  expect(result.current.carrito).toHaveLength(1);
  expect(result.current.carrito[0].cantidad).toBe(2);
});

test('agregar registra ultimoAgregado con timestamp', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1)));
  expect(result.current.ultimoAgregado?.id).toBe(1);
  expect(result.current.ultimoAgregado?.timestamp).toBeDefined();
});

test('quitarItem elimina el producto del carrito', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1)));
  act(() => result.current.agregar(prod(2)));
  act(() => result.current.quitarItem(1));
  expect(result.current.carrito).toHaveLength(1);
  expect(result.current.carrito[0].id).toBe(2);
});

test('cambiarCantidad actualiza el valor directamente', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1)));
  act(() => result.current.cambiarCantidad(1, '5'));
  expect(result.current.carrito[0].cantidad).toBe('5');
});

test('validarCantidad redondea a entero para UNIDAD', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1, 100, 'UNIDAD')));
  act(() => result.current.cambiarCantidad(1, '2.7'));
  act(() => result.current.validarCantidad(1, 'UNIDAD'));
  expect(result.current.carrito[0].cantidad).toBe(3);
});

test('validarCantidad mantiene 3 decimales para GRANEL', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1, 100, 'GRANEL')));
  act(() => result.current.cambiarCantidad(1, '1.5678'));
  act(() => result.current.validarCantidad(1, 'GRANEL'));
  expect(result.current.carrito[0].cantidad).toBe(1.568);
});

test('validarCantidad corrige valor inválido a 1', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1)));
  act(() => result.current.cambiarCantidad(1, 'abc'));
  act(() => result.current.validarCantidad(1, 'UNIDAD'));
  expect(result.current.carrito[0].cantidad).toBe(1);
});

test('actualizarCantidadBotones no baja de 1', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1)));
  act(() => result.current.actualizarCantidadBotones(1, -1, 'UNIDAD'));
  expect(result.current.carrito[0].cantidad).toBe(1);
});

test('vaciar limpia el carrito y ultimoAgregado', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1)));
  act(() => result.current.vaciar());
  expect(result.current.carrito).toEqual([]);
  expect(result.current.ultimoAgregado).toBeNull();
});

test('totalCarrito calcula precio × cantidad correctamente', () => {
  const { result } = renderHook(() => useCarrito());
  act(() => result.current.agregar(prod(1, 1000)));
  act(() => result.current.agregar(prod(2, 500)));
  act(() => result.current.actualizarCantidadBotones(2, 1, 'UNIDAD'));
  // prod1: 1×1000=1000, prod2: 2×500=1000, total=2000
  expect(result.current.totalCarrito).toBe(2000);
});
