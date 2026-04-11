import { useEffect } from 'react';

/**
 * Dispara `callback` cuando el usuario hace clic fuera del elemento referenciado.
 * @param {React.RefObject} ref - Ref del elemento contenedor
 * @param {Function} callback - Función a llamar al hacer clic fuera
 */
export function useClickOutside(ref, callback) {
  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
}
