import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/auth';

export default function VerificarEmail() {
  const { token } = useParams();
  const [estado, setEstado] = useState('inicial'); // inicial, cargando, exito, error
  const [mensaje, setMensaje] = useState('');

  const handleVerificar = async () => {
    setEstado('cargando');
    setMensaje('Verificando tu correo electrónico...');
    try {
      // Cambiamos a un método POST para evitar que los clientes de correo "visiten" el link y lo invaliden.
      const res = await authService.verificarEmail(token);
      setEstado('exito');
      setMensaje(res.data.mensaje);
    } catch (err) {
      setEstado('error');
      setMensaje(err.response?.data?.error || 'Ocurrió un error al verificar tu correo. Es posible que el enlace ya se haya usado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-fondo)] p-4 transition-colors duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
        <h1 className="text-4xl font-black text-[#91cf5b] tracking-tighter mb-6">Fresco</h1>
        
        {estado === 'inicial' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificar tu Correo</h2>
            <p className="text-gray-600 mb-6">Haz clic en el botón para confirmar tu cuenta y activar tu acceso.</p>
            <button onClick={handleVerificar} className="inline-block w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95">
              Verificar mi cuenta
            </button>
          </div>
        )}

        {estado === 'cargando' && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#91cf5b] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">{mensaje}</p>
          </div>
        )}

        {estado === 'exito' && (
          <div>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Correo Verificado!</h2>
            <p className="text-gray-600 mb-6">{mensaje}</p>
            <Link to="/fresco-login" className="inline-block w-full bg-[#91cf5b] hover:bg-[#7ab848] text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95">Ir a Iniciar Sesión</Link>
          </div>
        )}

        {estado === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Verificación</h2>
            <p className="text-gray-600 mb-6">{mensaje}</p>
            <Link to="/registro" className="inline-block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95">Volver al Registro</Link>
          </div>
        )}
      </div>
    </div>
  );
}