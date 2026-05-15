import { useCallback, useMemo } from 'react';

export function useLocalStorage(key) {
  const get = useCallback((fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }, [key]);

  const set = useCallback((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key]);

  const remove = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return useMemo(() => ({ get, set, remove }), [get, set, remove]);
}
