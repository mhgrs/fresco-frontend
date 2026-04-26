import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Maneja la ruta /unirse/:codigo
 * - Sin sesión: guarda el código en localStorage y redirige a registro.
 * - Con sesión + sin empresa: redirige a onboarding con el código en la URL.
 * - Con sesión + con empresa: redirige al dashboard.
 */
export default function PaginaUnirse({ usuario }) {
  const { codigo } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (codigo) {
      localStorage.setItem('invitacion_codigo', codigo.toUpperCase());
    }

    if (!usuario) {
      navigate('/registro', { replace: true });
    } else if (!usuario.empresa) {
      navigate(`/onboarding?codigo=${codigo}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, []);

  return null;
}
