import React, { useEffect } from 'react';
import { useNotificacion } from '../../hooks/useNotificacion';

export default function SyncFeedback() {
  const { notificacion, mostrar } = useNotificacion(4000); // 4 segundos de duración

  useEffect(() => {
    const handleStart = (e) => {
      mostrar(`Sincronizando ${e.detail.total} venta(s) pendiente(s)...`, 'warning');
    };

    const handleEnd = (e) => {
      const { exitosas, fallidas } = e.detail;
      if (fallidas === 0) {
        mostrar(`${exitosas} venta(s) sincronizada(s) correctamente.`, 'success');
      } else if (exitosas === 0) {
        mostrar(`Sincronización completada. ${fallidas} ventas no pudieron enviarse.`, 'error');
      } else {
        mostrar(`Sincronización parcial: ${exitosas} exitosas, ${fallidas} fallidas.`, 'warning');
      }
    };

    window.addEventListener('sync_ventas_start', handleStart);
    window.addEventListener('sync_ventas_end', handleEnd);

    return () => {
      window.removeEventListener('sync_ventas_start', handleStart);
      window.removeEventListener('sync_ventas_end', handleEnd);
    };
  }, [mostrar]);

  if (!notificacion.visible) return null;

  // Estilos de Tailwind para los diferentes tipos de notificación
  const bgColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg border flex items-center gap-3 transition-all animate-fade-in-up ${bgColors[notificacion.tipo] || bgColors.success}`}>
      {notificacion.tipo === 'success' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      )}
      {notificacion.tipo === 'warning' && (
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      )}
      <span className="font-medium text-sm">{notificacion.mensaje}</span>
    </div>
  );
}