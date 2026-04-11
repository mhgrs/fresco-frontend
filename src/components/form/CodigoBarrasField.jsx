import { useState } from 'react';
import EscanerCamara from '../EscanerCamara';

/**
 * Campo de código de barras con botón de escáner integrado.
 * Gestiona internamente el estado del modal del escáner.
 *
 * Props:
 *   value    — string
 *   onChange — (valor: string) => void  — se llama al escribir
 *   onBlur   — () => void               — se llama al salir del input (útil para buscar en maestro)
 *   onScan   — (codigo: string) => void — se llama al completar un escaneo
 *   disabled — boolean
 */
export default function CodigoBarrasField({ value, onChange, onBlur, onScan, disabled }) {
  const [escanerAbierto, setEscanerAbierto] = useState(false);

  const handleScan = (codigo) => {
    setEscanerAbierto(false);
    onScan(codigo);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cód. Barras (Escanea primero para autocompletar)
        </label>
        <div className="flex mt-1">
          <input
            type="text"
            name="codigo_barras"
            value={value}
            disabled={disabled}
            placeholder="Escanear o escribir..."
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className="w-full p-2 border border-r-0 rounded-l focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setEscanerAbierto(true)}
            title="Escanear con cámara"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-r border border-gray-300 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {escanerAbierto && (
        <EscanerCamara
          onScan={handleScan}
          onClose={() => setEscanerAbierto(false)}
        />
      )}
    </>
  );
}
