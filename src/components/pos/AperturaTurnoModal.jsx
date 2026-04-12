import React, { useState } from 'react';

export default function AperturaTurnoModal({ onGuardar }) {
  const [monto, setMonto] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const valor = parseInt(monto, 10);
    if (!isNaN(valor) && valor >= 0) {
      onGuardar(valor);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-gray-800">Apertura de Turno</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Ingresa el fondo de caja (sencillo) con el que inicias las ventas el día de hoy.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400 font-bold">$</span>
            <input type="number" autoFocus required min="0" className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 pl-10 pr-4 text-3xl font-black text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95">
              Iniciar Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}