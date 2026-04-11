import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { usuariosService } from '../services/usuarios';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      // El backend espera 'username', que es el email
      const response = await usuariosService.login({ username: email, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      const userResponse = await usuariosService.me();
      onLogin(userResponse.data);

    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión. Revisa tus credenciales.');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-fondo)] p-4 transition-colors duration-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-[#91cf5b] tracking-tighter mb-2">Fresco</h1>
          <h2 className="text-xl font-bold text-gray-800">Iniciar Sesión</h2>
          
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition text-gray-800 font-medium" 
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm font-bold bg-red-100 text-red-800 border border-red-200 text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={cargando} 
              className="w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-black text-lg py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Links de registro y recuperación */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100 space-y-3">
            <p className="text-sm text-gray-600">
              ¿Eres nuevo aquí?{' '}
              <Link to="/registro" className="font-bold text-[#91cf5b] hover:underline">
                Crea una cuenta
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link to="/recuperar-contrasena" className="font-bold text-gray-500 hover:text-[#91cf5b] hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
