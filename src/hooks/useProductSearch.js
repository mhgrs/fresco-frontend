import { useState, useEffect, useRef } from 'react';

/**
 * Gestiona la búsqueda de productos sobre un catálogo en memoria.
 * - Coincidencia exacta por código de barras o SKU (≥6 chars): llama a `onExactMatch`
 *   y limpia el campo automáticamente.
 * - Búsqueda difusa: filtra por nombre y SKU.
 *
 * @param {Array}    catalogo      Lista de productos activos
 * @param {Function} onExactMatch  Callback a llamar cuando hay coincidencia exacta
 * @returns {{ termino, setTermino, resultados, inputRef }}
 */
export function useProductSearch(catalogo, onExactMatch) {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);
  const inputRef = useRef(null);

  // Usamos una ref para que el callback siempre apunte a la versión más reciente
  // sin necesitar incluirlo en las dependencias del efecto.
  const onExactMatchRef = useRef(onExactMatch);
  useEffect(() => {
    onExactMatchRef.current = onExactMatch;
  });

  useEffect(() => {
    if (!termino.trim()) {
      setResultados([]);
      return;
    }
    const t = termino.toLowerCase();
    const exacta = catalogo.find(
      p => p.codigo_barras === t || p.sku.toLowerCase() === t
    );
    if (exacta && t.length >= 6) {
      onExactMatchRef.current(exacta);
      setTermino('');
      inputRef.current?.focus();
      return;
    }
    setResultados(
      catalogo.filter(
        p => p.nombre.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)
      )
    );
  }, [termino, catalogo]);

  return { termino, setTermino, resultados, inputRef };
}
