// Fuente única de verdad para los medios de pago disponibles en el sistema.
// Cada componente importa las propiedades que necesita (.cls, .bg/.text/.light, .icon, .label).
export const METODOS_PAGO = {
  EFECTIVO: {
    label: 'Efectivo',
    cls:   'bg-green-100 text-green-700',
    bg:    'bg-green-500',
    text:  'text-green-700',
    light: 'bg-green-50',
    icon:  '💵',
  },
  TARJETA: {
    label: 'Tarjeta',
    cls:   'bg-blue-100 text-blue-700',
    bg:    'bg-blue-500',
    text:  'text-blue-700',
    light: 'bg-blue-50',
    icon:  '💳',
  },
  TRANSFERENCIA: {
    label: 'Transferencia',
    cls:   'bg-purple-100 text-purple-700',
    bg:    'bg-purple-500',
    text:  'text-purple-700',
    light: 'bg-purple-50',
    icon:  '🏦',
  },
  ANOTADO: {
    label: 'Anotado',
    cls:   'bg-orange-100 text-orange-700',
    bg:    'bg-orange-400',
    text:  'text-orange-700',
    light: 'bg-orange-50',
    icon:  '📝',
  },
};

export const METODOS_KEYS = Object.keys(METODOS_PAGO);
