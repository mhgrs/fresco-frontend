import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { empresasService } from '../services/empresas';

export default function OnboardingEmpresa({ onCompletado, cerrarSesion }) {
  const [searchParams] = useSearchParams();
  const [modo, setModo] = useState('crear'); // 'crear' | 'unirse'
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Configurar Empresa - Fresco";

    // Código desde el link de invitación (?codigo=) o localStorage
    const codigoUrl = searchParams.get('codigo');
    const codigoGuardado = localStorage.getItem('invitacion_codigo');
    const codigoInicial = (codigoUrl || codigoGuardado || '').toUpperCase();
    if (codigoInicial) {
      setCodigo(codigoInicial);
      setModo('unirse');
      localStorage.removeItem('invitacion_codigo');
    }
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setCargando(true); setError('');
    try {
      await empresasService.crear({ nombre: nombreEmpresa });
      // Si tiene éxito, llamamos a la función para recargar el perfil del usuario
      onCompletado();
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error al crear la empresa.');
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async (e) => {
    e.preventDefault();
    setCargando(true); setError('');
    try {
      await empresasService.unirse({ codigo: codigo.toUpperCase() });
      onCompletado();
    } catch (err) {
      setError(err.response?.data?.error || 'El código de invitación es inválido o ha expirado.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-fondo)] p-4 transition-colors duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#91cf5b] tracking-tighter mb-2">Fresco</h1>
          <h2 className="text-xl font-bold text-gray-800">Casi terminamos</h2>
          <p className="text-sm text-gray-500 mt-2">Para comenzar a usar el sistema, necesitas crear una empresa o unirte a una existente.</p>
        </div>

        {/* Selector de Modo (Tabs) */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button onClick={() => { setModo('crear'); setError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${modo === 'crear' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Crear Nueva
          </button>
          <button onClick={() => { setModo('unirse'); setError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${modo === 'unirse' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Unirme con Código
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm font-bold bg-red-100 text-red-800 border border-red-200 text-center">
            {error}
          </div>
        )}

        {modo === 'crear' ? (
          <form onSubmit={handleCrear} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de tu Empresa / Negocio</label>
              <input type="text" required autoFocus placeholder="Ej. Abarrotes Don Juan" value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition text-gray-800 font-medium text-lg placeholder-gray-400" />
            </div>
            <button type="submit" disabled={cargando || !nombreEmpresa.trim()} className="w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-black text-lg py-4 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4">
              {cargando ? 'Creando...' : 'Crear y Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUnirse} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Código de Invitación</label>
              <input type="text" required autoFocus placeholder="Ej. X8A9B2C3" maxLength="8" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition text-gray-800 font-black tracking-widest text-center text-2xl uppercase placeholder-gray-300" autoComplete="off" />
              <p className="text-xs text-gray-500 mt-3 text-center">Pídele al Administrador que comparta el enlace de invitación o el código.</p>
            </div>
            <button type="submit" disabled={cargando || codigo.length < 6} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-black text-lg py-4 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4">
              {cargando ? 'Verificando...' : 'Unirme y Continuar'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <button onClick={cerrarSesion} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}