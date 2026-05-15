export const formatCLP = (v) =>
  `$${new Intl.NumberFormat('es-CL').format(Math.round(Number(v) || 0))}`;

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
export function fmtFechaLarga(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
