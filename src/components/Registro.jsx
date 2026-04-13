import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth';

export default function Registro() {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    telefono: '',
    nacionalidad: 'Chile',
    direccion: '',
    acepta_terminos: false,
  });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    document.title = "Registro - Fresco";
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const verificarCorreo = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });
    try {
      const res = await authService.verificarCorreo(formData.email);
      if (res.data.existe) {
        setMensaje({ tipo: 'error', texto: 'Este correo ya tiene una cuenta asociada. Inicia sesión.' });
      } else {
        setPaso(2);
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Ocurrió un error al verificar el correo.' });
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
      return;
    }

    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { confirm_password, ...datosEnviar } = formData;
      const res = await authService.registro(datosEnviar);
      setMensaje({ tipo: 'success', texto: res.data.mensaje || 'Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta.' });
      setFormData({
        first_name: '', last_name: '', email: '', password: '', confirm_password: '',
        telefono: '', nacionalidad: 'Chile', direccion: '', acepta_terminos: false,
      });
      setPaso(1);
    } catch (error) {
      let errorText = 'Ocurrió un error al registrar. Por favor intenta de nuevo.';
      if (error.response?.data) {
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
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 relative">
        {/* Botón volver atrás si estamos en paso 2 y no ha finalizado con éxito */}
        {paso === 2 && mensaje.tipo !== 'success' && (
           <button 
             onClick={() => setPaso(1)} 
             className="absolute top-6 left-6 text-gray-400 hover:text-gray-800 transition"
             title="Volver"
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
           </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#91cf5b] tracking-tighter mb-2">Fresco</h1>
          <h2 className="text-xl font-bold text-gray-800">Crea tu cuenta</h2>
          <p className="text-sm text-gray-500 mt-1">{paso === 1 ? "Comencemos con tu correo electrónico" : "Completa tus datos para finalizar"}</p>
        </div>

        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-lg text-sm font-semibold ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {mensaje.texto}
          </div>
        )}

        {paso === 1 && mensaje.tipo !== 'success' && (
          <form onSubmit={verificarCorreo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
              <input type="email" name="email" required autoFocus value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" placeholder="ejemplo@correo.com" />
            </div>
            
            <button type="submit" disabled={cargando || !formData.email} className="w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 mt-4">
              {cargando ? 'Verificando...' : 'Continuar'}
            </button>
          </form>
        )}

        {paso === 2 && mensaje.tipo !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input type="text" name="first_name" required autoFocus value={formData.first_name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label><input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label><input type="password" name="password" required minLength="8" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirmar *</label><input type="password" name="confirm_password" required minLength="8" value={formData.confirm_password} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">País</label><select name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition bg-white"><option value="Chile">Chile</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label><input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label><input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#91cf5b] focus:border-transparent outline-none transition" /></div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="acepta_terminos"
                required
                checked={formData.acepta_terminos}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#91cf5b] focus:ring-[#91cf5b] flex-shrink-0"
              />
              <span className="text-sm text-gray-600">
                He leído y acepto los{' '}
                <Link to="/terminos" target="_blank" className="text-[#91cf5b] hover:underline font-semibold">
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacidad" target="_blank" className="text-[#91cf5b] hover:underline font-semibold">
                  Política de Privacidad
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={cargando || !formData.acepta_terminos}
              className="w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {cargando ? 'Registrando...' : 'Registrarme'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600 font-medium">
            ¿Ya tienes una cuenta? <Link to="/fresco-login" className="text-[#91cf5b] hover:underline font-bold">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}