import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Login({ onLogin }) {
  const [credenciales, setCredenciales] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    document.title = "Fresco";
  }, []);

  const manejarCambio = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value.trim() });
  };

  const procesarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Petición real al backend para obtener tokens JWT
      const response = await api.post('token/', {
        username: credenciales.username,
        password: credenciales.password
      });

      // Guardamos tokens y configuramos Axios para enviar el token en cada petición
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      // Solicitamos los datos del usuario logueado
      const userResponse = await api.get('inventario/usuarios/me/');
      localStorage.setItem('usuario', JSON.stringify(userResponse.data));
      onLogin(userResponse.data);
    } catch (err) {
      console.error(err);
      setError('Credenciales inválidas o error en el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center p-4 transition-colors duration-500">
      <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 p-8 rounded-xl shadow-lg max-w-sm w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-[#91cf5b] tracking-tight">Fresco</h1>
          <p className="text-gray-500 mt-2"></p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={procesarLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Usuario</label>
            <input 
              type="text" 
              name="username" 
              value={credenciales.username} 
              onChange={manejarCambio} 
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent"
              placeholder="Ej: admin o caja"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              value={credenciales.password} 
              onChange={manejarCambio} 
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-bold py-3 px-4 rounded transition disabled:opacity-50"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
