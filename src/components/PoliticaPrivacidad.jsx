import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PrivacidadContenido from './legal/PrivacidadContenido';

export default function PoliticaPrivacidad() {
  useEffect(() => { document.title = 'Política de Privacidad — Fresco POS'; }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <div className="mb-8">
          <Link to="/" className="text-[#91cf5b] font-bold text-sm hover:underline">← Volver al inicio</Link>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-400 mb-8">Última actualización: abril de 2025 · Conforme a la Ley 19.628 (Chile)</p>
        <PrivacidadContenido />
      </div>
    </div>
  );
}
