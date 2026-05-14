export function hoy() { return new Date().toISOString().slice(0, 10); }

export const TIPO_MOV = {
  ingreso: { label: 'Ingreso', cls: 'bg-green-100 text-green-700' },
  retiro:  { label: 'Retiro',  cls: 'bg-red-100 text-red-600' },
  INGRESO: { label: 'Ingreso', cls: 'bg-green-100 text-green-700' },
  RETIRO:  { label: 'Retiro',  cls: 'bg-red-100 text-red-600' },
};
