import { useState } from 'react';

/**
 * Input de texto con lista desplegable de sugerencias.
 * El estado de visibilidad del dropdown se gestiona internamente.
 *
 * Props:
 *   label        — texto del label (opcional)
 *   name         — name del input (opcional, para formularios nativos)
 *   value        — valor del input
 *   onChange     — (valor: string) => void  — se llama al escribir
 *   sugerencias  — string[]  — lista de sugerencias a mostrar
 *   onSeleccionar — (item: string) => void  — se llama al hacer clic en una sugerencia
 *   placeholder  — string
 *   required     — boolean (opcional)
 *   disabled     — boolean (opcional)
 *   autoComplete — string (opcional, por defecto 'off')
 *   onKeyDown    — función (opcional)
 *   className    — clases extra para el wrapper (opcional)
 */
export default function SugerenciasInput({
  label,
  name,
  value,
  onChange,
  sugerencias,
  onSeleccionar,
  placeholder,
  required = false,
  disabled = false,
  autoComplete = 'off',
  onKeyDown,
  className = '',
}) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type="text"
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setMostrar(true); }}
        onFocus={() => setMostrar(true)}
        onBlur={() => setTimeout(() => setMostrar(false), 200)}
        onKeyDown={onKeyDown}
        className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
      {mostrar && sugerencias.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto custom-scrollbar">
          {sugerencias.map((item, idx) => (
            <li
              key={idx}
              className="px-4 py-2 hover:bg-[#91cf5b] hover:text-white cursor-pointer transition-colors text-sm text-gray-700"
              onClick={() => { onSeleccionar(item); setMostrar(false); }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
