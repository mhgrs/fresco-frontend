import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState('inicial'); // inicial | cargando | enviado
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado('cargando');
    setError('');
    try {
      await authService.solicitarResetPassword(email.trim().toLowerCase());
      setEstado('enviado');
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setEstado('inicial');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-fondo)] p-4 transition-colors duration-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-[#91cf5b] tracking-tighter mb-2">Fresco</h1>
          <h2 className="text-xl font-bold text-gray-800">Recuperar Contraseña</h2>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full border border-gray-100">
          {estado === 'enviado' ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Revisa tu correo</h3>
              <p className="text-gray-600 text-sm mb-6">
                Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link to="/fresco-login" className="text-sm font-bold text-[#91cf5b] hover:underline">
                Volver a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-gray-600">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition text-gray-800 font-medium"
                  placeholder="tu@email.com"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl text-sm font-bold bg-red-100 text-red-800 border border-red-200 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={estado === 'cargando'}
                className="w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-black text-lg py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {estado === 'cargando' ? 'Enviando...' : 'Enviar enlace'}
              </button>

              <div className="text-center pt-2">
                <Link to="/fresco-login" className="text-sm text-gray-500 hover:text-gray-700">
                  ← Volver a Iniciar Sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
