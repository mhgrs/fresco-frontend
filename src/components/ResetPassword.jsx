import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [estado, setEstado] = useState('inicial'); // inicial | cargando | exito | error
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEstado('cargando');
    try {
      await authService.confirmarResetPassword(token, password);
      setEstado('exito');
      setTimeout(() => navigate('/fresco-login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'El enlace es inválido o ha expirado.');
      setEstado('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-fondo)] p-4 transition-colors duration-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-[#91cf5b] tracking-tighter mb-2">Fresco</h1>
          <h2 className="text-xl font-bold text-gray-800">Nueva Contraseña</h2>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full border border-gray-100">
          {estado === 'exito' ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">¡Contraseña actualizada!</h3>
              <p className="text-gray-600 text-sm mb-4">Serás redirigido al inicio de sesión en unos segundos.</p>
              <Link to="/fresco-login" className="text-sm font-bold text-[#91cf5b] hover:underline">
                Ir ahora →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition text-gray-800 font-medium"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  required
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition text-gray-800 font-medium"
                  placeholder="Repite la contraseña"
                />
              </div>

              {(error || estado === 'error') && (
                <div className="p-3 rounded-xl text-sm font-bold bg-red-100 text-red-800 border border-red-200 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={estado === 'cargando'}
                className="w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-black text-lg py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {estado === 'cargando' ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
