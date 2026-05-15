import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuariosService } from '../services/usuarios';
import { empresasService } from '../services/empresas';
import { rolesService } from '../services/roles';
import { usePermisos } from '../hooks/usePermisos';
import { useNotificacion } from '../hooks/useNotificacion';

import GestorRoles from './equipo/GestorRoles';

export default function GestionEquipo({ usuario }) {
  const [tabActiva, setTabActiva]          = useState('equipo');
  const [equipo, setEquipo]               = useState([]);
  const [rolesDisponibles, setRolesDisp]  = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [error, setError]                 = useState('');
  const [codigoInvitacion, setCodigo]     = useState('');
  const [linkInvitacion, setLink]         = useState('');
  const [expiraEn, setExpiraEn]           = useState('');
  const [generandoCodigo, setGenerando]   = useState(false);
  const [copiado, setCopiado]             = useState('');
  const { notificacion, mostrar }         = useNotificacion();
  const { tiene }                         = usePermisos(usuario);

  useEffect(() => {
    (async () => {
      try {
        const [resEquipo, resRoles] = await Promise.all([
          usuariosService.listarEquipo(),
          rolesService.listar(),
        ]);
        setRolesDisp(resRoles.data);
        setEquipo(resEquipo.data);
      } catch {
        setError('No se pudo cargar la información del equipo.');
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const handleCheckbox = (userId, roleName, checked) => {
    const usuario = equipo.find(u => u.id === userId);
    if (!usuario) return;
    const newRoles = checked
      ? [...usuario.roles, roleName]
      : usuario.roles.filter(r => r !== roleName);
    setEquipo(prev => prev.map(u => u.id === userId ? { ...u, roles: newRoles } : u));
    usuariosService.actualizarRoles(userId, newRoles).catch(() => {
      setEquipo(prev => prev.map(u => u.id === userId ? { ...u, roles: usuario.roles } : u));
    });
  };

  const copiar = (texto, tipo) => {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(tipo);
      setTimeout(() => setCopiado(''), 2000);
    });
  };

  const generarCodigo = async () => {
    setGenerando(true);
    try {
      const res = await empresasService.generarCodigo();
      setCodigo(res.data.codigo);
      setLink(res.data.link);
      setExpiraEn(res.data.expira_en || '');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error desconocido';
      if (errorMsg.toLowerCase().includes('límite') || errorMsg.toLowerCase().includes('limit')) {
        mostrar(
          <span>
            Alcanzaste el límite de usuarios de tu plan. Actualiza tu plan en{' '}
            <Link to="/configuracion?tab=pagos" className="underline font-bold">
              suscripción
            </Link>{' '}
            para poder invitar a más colaboradores.
          </span>,
          'error'
        );
      } else {
        mostrar(errorMsg, 'error');
      }
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {notificacion.visible && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      <h1 className="text-2xl font-black text-gray-900 mb-4">Gestión de Equipo</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTabActiva('equipo')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tabActiva === 'equipo' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Equipo
        </button>
        {tiene('equipo.gestionar_roles') && (
          <button
            onClick={() => setTabActiva('roles')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tabActiva === 'roles' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Roles
          </button>
        )}
      </div>

      {tabActiva === 'roles' && tiene('equipo.gestionar_roles') && (
        <GestorRoles />
      )}

      {tabActiva === 'equipo' && (
      <>
      {cargando ? <div className="text-center p-8 text-gray-400">Cargando equipo...</div>
       : error ? <div className="text-center p-8 text-red-500">{error}</div>
       : (
        <div className="space-y-8">
          {/* Invitaciones */}
          <div className="bg-white/60 p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-base font-bold text-gray-800 mb-1">Invitar colaborador</h3>
            <p className="text-sm text-gray-500 mb-4">
              Genera un enlace de invitación para compartir con nuevos empleados. El enlace no tiene límite de usos y expira en 7 días.
            </p>

            {linkInvitacion ? (
              <div className="space-y-3">
                {/* Link */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 truncate font-mono">
                    {linkInvitacion}
                  </div>
                  <button
                    onClick={() => copiar(linkInvitacion, 'link')}
                    className="shrink-0 bg-[#91cf5b] hover:bg-[#7ab848] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 whitespace-nowrap"
                  >
                    {copiado === 'link' ? 'Copiado' : 'Copiar enlace'}
                  </button>
                </div>

                {/* Código manual */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-xl font-black tracking-widest text-gray-800 select-all">
                    {codigoInvitacion}
                  </div>
                  <button
                    onClick={() => copiar(codigoInvitacion, 'codigo')}
                    className="shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap"
                  >
                    {copiado === 'codigo' ? 'Copiado' : 'Copiar código'}
                  </button>
                </div>

                {expiraEn && (
                  <p className="text-xs text-gray-400">
                    Vence el{' '}
                    <span className="font-semibold text-gray-600">
                      {new Date(expiraEn).toLocaleString('es-CL', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </p>
                )}

                <button
                  onClick={() => { setCodigo(''); setLink(''); setExpiraEn(''); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Generar nuevo enlace
                </button>
              </div>
            ) : (
              <button
                onClick={generarCodigo}
                disabled={generandoCodigo}
                className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                {generandoCodigo ? 'Generando...' : 'Generar enlace de invitación'}
              </button>
            )}
          </div>

          {/* Gestión de roles */}
          {tiene('equipo.asignar_roles') && (
            <div className="bg-white/60 p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-base font-bold text-gray-800 mb-4">Asignar roles</h3>
              {equipo.length === 0 ? (
                <p className="text-sm text-gray-400">No hay otros usuarios en tu empresa todavía.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Roles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {equipo.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-4">
                              {rolesDisponibles.map(rol => (
                                <label key={rol.nombre} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#91cf5b] focus:ring-[#7ab848] cursor-pointer" checked={user.roles.includes(rol.nombre)} onChange={e => handleCheckbox(user.id, rol.nombre, e.target.checked)} />
                                  {rol.nombre}
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}