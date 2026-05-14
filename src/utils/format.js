// Formatea un valor numérico como moneda CLP. Redondea antes de formatear.
// Usar para mostrar totales de ventas, precios, métricas.
export const formatCLP = (v) =>
  `$${new Intl.NumberFormat('es-CL').format(Math.round(Number(v) || 0))}`;

// Variante null-safe sin redondeo. Usar en CierreCaja donde los valores
// pueden venir null/undefined del backend y el redondeo no aplica al arqueo.
export function clp(n) {
  if (n === undefined || n === null) return '$0';
  return `$${Number(n).toLocaleString('es-CL')}`;
}

export function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CL');
}

export function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

export function fmtFechaHora(iso) {
  return `${fmtFecha(iso)} ${fmtHora(iso)}`;
}

// Formato largo con nombre de mes. Usar cuando hay espacio para fecha completa.
export function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
