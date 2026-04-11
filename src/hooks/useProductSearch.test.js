import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductSearch } from './useProductSearch';

const catalogo = [
  { id: 1, nombre: 'Leche Entera',  sku: 'LCH001', codigo_barras: '7801234567890' },
  { id: 2, nombre: 'Pan Molde',     sku: 'PAN001', codigo_barras: '7809876543210' },
  { id: 3, nombre: 'Jugo Naranja',  sku: 'JUG001', codigo_barras: '7805555555555' },
];

test('resultados inicia vacío', () => {
  const { result } = renderHook(() => useProductSearch(catalogo, vi.fn()));
  expect(result.current.resultados).toEqual([]);
  expect(result.current.termino).toBe('');
});

test('buscar por nombre devuelve coincidencias parciales', async () => {
  const { result } = renderHook(() => useProductSearch(catalogo, vi.fn()));
  act(() => result.current.setTermino('leche'));
  await waitFor(() => expect(result.current.resultados).toHaveLength(1));
  expect(result.current.resultados[0].id).toBe(1);
});

test('búsqueda es case-insensitive', async () => {
  const { result } = renderHook(() => useProductSearch(catalogo, vi.fn()));
  act(() => result.current.setTermino('PAN'));
  await waitFor(() => expect(result.current.resultados).toHaveLength(1));
  expect(result.current.resultados[0].id).toBe(2);
});

test('buscar por SKU devuelve el producto correcto', async () => {
  const { result } = renderHook(() => useProductSearch(catalogo, vi.fn()));
  act(() => result.current.setTermino('JUG'));
  await waitFor(() => expect(result.current.resultados).toHaveLength(1));
  expect(result.current.resultados[0].id).toBe(3);
});

test('limpiar el término vacía los resultados', async () => {
  const { result } = renderHook(() => useProductSearch(catalogo, vi.fn()));
  act(() => result.current.setTermino('leche'));
  await waitFor(() => expect(result.current.resultados).toHaveLength(1));
  act(() => result.current.setTermino(''));
  await waitFor(() => expect(result.current.resultados).toHaveLength(0));
});

test('coincidencia exacta por código de barras llama onExactMatch y limpia el término', async () => {
  const onExactMatch = vi.fn();
  const { result } = renderHook(() => useProductSearch(catalogo, onExactMatch));
  act(() => result.current.setTermino('7801234567890'));
  await waitFor(() => {
    expect(onExactMatch).toHaveBeenCalledWith(catalogo[0]);
    expect(result.current.termino).toBe('');
  });
});

test('coincidencia exacta por SKU con menos de 6 chars NO dispara onExactMatch', async () => {
  const onExactMatch = vi.fn();
  const catalogoCorto = [{ id: 1, nombre: 'Test', sku: 'AB123', codigo_barras: null }];
  const { result } = renderHook(() => useProductSearch(catalogoCorto, onExactMatch));
  act(() => result.current.setTermino('ab123'));
  await waitFor(() => expect(result.current.resultados).toHaveLength(1));
  expect(onExactMatch).not.toHaveBeenCalled();
});

test('inputRef existe', () => {
  const { result } = renderHook(() => useProductSearch(catalogo, vi.fn()));
  expect(result.current.inputRef).toBeDefined();
  expect(result.current.inputRef.current).toBeNull(); // sin DOM montado
});
