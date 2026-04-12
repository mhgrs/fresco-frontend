import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = () => {
    try {
      const ventas = JSON.parse(localStorage.getItem('ventas_offline')) || [];
      setPendingCount(ventas.length);
    } catch (e) {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('ventas_offline_updated', updatePendingCount);

    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('ventas_offline_updated', updatePendingCount);
    };
  }, []);

  return { isOnline, pendingCount, updatePendingCount };
}