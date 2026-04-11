import { useState } from 'react';
import { useSugerencias } from '../../hooks/useSugerencias';

/**
 * Gestiona la lista de proveedores de un producto:
 * input con autocompletado + botón Agregar + tags con botón quitar.
 *
 * Props:
 *   proveedores          — string  (comma-separated: "Soprole, Coca-Cola")
 *   onChange             — (nuevosProveedores: string) => void
 *   proveedoresExistentes — string[]  (lista global para autocompletado)
 */
export default function ProveedoresManager({ proveedores, onChange, proveedoresExistentes }) {
  const [input, setInput] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const sugerencias = useSugerencias(proveedoresExistentes, input);

  const lista = proveedores
    ? proveedores.split(',').map(p => p.trim()).filter(Boolean)
    : [];

  const agregar = () => {
    const trimmed = input.trim();
    if (!trimmed || lista.includes(trimmed)) return;
    onChange([...lista, trimmed].join(', '));
    setInput('');
  };

  const quitar = (item) => {
    onChange(lista.filter(p => p !== item).join(', '));
  };

  return (
    <div>
      <div className="relative">
        <div className="flex mt-1">
          <input
            type="text"
            value={input}
            autoComplete="off"
            placeholder="Ej: Soprole, Coca-Cola..."
            onChange={(e) => { setInput(e.target.value); setMostrar(true); }}
            onFocus={() => setMostrar(true)}
            onBlur={() => setTimeout(() => setMostrar(false), 200)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }}
            className="w-full p-2 border border-r-0 rounded-l focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={agregar}
            className="bg-gray-200 px-4 rounded-r border border-gray-300 font-bold hover:bg-gray-300 text-gray-700 transition"
          >
            Agregar
          </button>
        </div>

        {mostrar && sugerencias.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto custom-scrollbar">
            {sugerencias.map((item, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-[#91cf5b] hover:text-white cursor-pointer transition-colors text-sm text-gray-700"
                onClick={() => { setInput(item); setMostrar(false); }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {lista.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 p-2 bg-gray-50 rounded-lg border border-gray-100 min-h-[40px]">
          {lista.map((prov, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm border border-blue-200"
            >
              {prov}
              <button
                type="button"
                onClick={() => quitar(prov)}
                className="ml-2 text-blue-500 hover:text-red-500 font-bold text-base leading-none focus:outline-none"
                title="Quitar"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
