import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Filtra `lista` con debounce basándose en `termino`.
 * Devuelve el arreglo de sugerencias filtradas.
 *
 * @param {string[]} lista   Lista completa de opciones
 * @param {string}   termino Texto tecleado por el usuario
 * @param {number}   delay   Milisegundos de debounce (por defecto 200)
 * @returns {string[]} Sugerencias que coinciden con el término
 */
export function useSugerencias(lista, termino, delay = 200) {
  const [sugerencias, setSugerencias] = useState([]);
  const debouncedTermino = useDebounce(termino, delay);

  useEffect(() => {
    if (debouncedTermino.trim()) {
      const t = debouncedTermino.toLowerCase();
      setSugerencias(lista.filter(item => item.toLowerCase().includes(t)));
    } else {
      setSugerencias([]);
    }
  }, [debouncedTermino, lista]);

  return sugerencias;
}
