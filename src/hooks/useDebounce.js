import { useState, useEffect } from 'react';

/**
 * Devuelve una versión "debounced" del valor: solo se actualiza después de
 * que hayan pasado `delay` ms sin que `value` cambie.
 * @param {*} value - Valor a debouncear
 * @param {number} delay - Milisegundos de espera
 * @returns El valor debounced
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
