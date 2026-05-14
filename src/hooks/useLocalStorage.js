export function useLocalStorage(key) {
  const get = (fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const set = (value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const remove = () => {
    localStorage.removeItem(key);
  };

  return { get, set, remove };
}
