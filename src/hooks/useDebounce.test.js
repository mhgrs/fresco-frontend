import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('devuelve el valor inicial de inmediato', () => {
  const { result } = renderHook(() => useDebounce('hola', 300));
  expect(result.current).toBe('hola');
});

test('no actualiza el valor antes de que pase el delay', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: 'inicial' },
  });

  rerender({ value: 'nuevo' });
  act(() => { vi.advanceTimersByTime(200); });

  expect(result.current).toBe('inicial');
});

test('actualiza el valor después de que pasa el delay', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: 'inicial' },
  });

  rerender({ value: 'nuevo' });
  act(() => { vi.advanceTimersByTime(300); });

  expect(result.current).toBe('nuevo');
});

test('cancela el timer anterior si el valor cambia antes del delay', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: 'a' },
  });

  rerender({ value: 'b' });
  act(() => { vi.advanceTimersByTime(200); });
  rerender({ value: 'c' });
  act(() => { vi.advanceTimersByTime(300); });

  expect(result.current).toBe('c');
});
