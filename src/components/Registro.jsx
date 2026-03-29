import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Registro() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    telefono: '',
    nacionalidad: '',
    direccion: ''
  });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    document.title = "Registro - Fresco";
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const res = await api.post('inventario/auth/registro/', formData);
      setMensaje({ tipo: 'success', texto: res.data.mensaje || 'Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta.' });
      setFormData({
        first_name: '', last_name: '', email: '', password: '', telefono: '', nacionalidad: '', direccion: ''
      });
    } catch (error) {
      let errorText = 'Ocurrió un error al registrar. Por favor intenta de nuevo.';
      if (error.response?.data) {
          // Toma el primer error de validación que mande Django
          const firstKey = Object.keys(error.response.data)[0];
          const firstError = error.response.data[firstKey];
          errorText = `${firstKey === 'email' ? 'Correo' : firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
      }
      setMensaje({ tipo: 'error', texto: errorText });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-fondo)] p-4 transition-colors duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#91cf5b] tracking-tighter mb-2">Fresco</h1>
          <h2 className="text-xl font-bold text-gray-800">Crea tu cuenta</h2>
          <p className="text-sm text-gray-500 mt-1">Únete para empezar a gestionar tu negocio</p>
        </div>

        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-lg text-sm font-semibold ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label><input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label><input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label><input type="password" name="password" required minLength="8" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label><input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label><input type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label><input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>

          <button type="submit" disabled={cargando || mensaje.tipo === 'success'} className="w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 mt-4">
            {cargando ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600 font-medium">
            ¿Ya tienes una cuenta? <Link to="/fresco-login" className="text-[#91cf5b] hover:underline font-bold">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}