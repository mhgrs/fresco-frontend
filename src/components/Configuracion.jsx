import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usuariosService } from '../services/usuarios';
import { empresasService } from '../services/empresas';
import { ROLES } from '../constants/roles';
import PortalSuscripcion from './suscripcion/PortalSuscripcion';

// ── Tab Perfil ─────────────────────────────────────────────────────────────────

function TabPerfil({ usuario }) {
  const [form, setForm] = useState({
    first_name:   usuario.first_name   || '',
    last_name:    usuario.last_name    || '',
    telefono:     usuario.telefono     || '',
    nacionalidad: usuario.nacionalidad || '',
    direccion:    usuario.direccion    || '',
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje]     = useState(null);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await usuariosService.actualizarPerfil(form);
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al guardar.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-lg">
      {mensaje && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          mensaje.tipo === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {mensaje.tipo === 'success' ? '✓' : '✗'} {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre
            </label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Tu nombre"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Apellido
            </label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Tu apellido"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Correo electrónico
          </label>
          <input
            value={usuario.email || ''}
            disabled
            className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">El correo no se puede modificar.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Teléfono
          </label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="+56 9 1234 5678"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nacionalidad
            </label>
            <input
              name="nacionalidad"
              value={form.nacionalidad}
              onChange={handleChange}
              placeholder="Ej. Chilena"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Dirección
            </label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Tu dirección"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-gray-900 hover:bg-gray-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Tab Equipo (solo ADMIN) ────────────────────────────────────────────────────

function TabEquipo() {
  const [equipo, setEquipo]               = useState([]);
  const [rolesDisponibles, setRolesDisp]  = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [error, setError]                 = useState('');
  const [codigoInvitacion, setCodigo]     = useState('');
  const [generandoCodigo, setGenerando]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [resEquipo, resRoles] = await Promise.all([
          usuariosService.listarEquipo(),
          usuariosService.listarRoles(),
        ]);
        setRolesDisp(resRoles.data.filter(r => r.nombre !== ROLES.ADMIN));
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

  const generarCodigo = async () => {
    setGenerando(true);
    try {
      const res = await empresasService.generarCodigo();
      setCodigo(res.data.codigo);
    } catch (err) {
      alert('Error al generar código: ' + (err.response?.data?.error || 'Error desconocido'));
    } finally {
      setGenerando(false);
    }
  };

  if (cargando) return <div className="text-center p-8 text-gray-400">Cargando equipo...</div>;
  if (error)    return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      {/* Invitaciones */}
      <div className="bg-white/60 p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-base font-bold text-gray-800 mb-3">Invitar colaborador</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-500 max-w-md">
            Genera un código de un solo uso para que un nuevo empleado se una a tu empresa.
            El empleado debe registrarse primero y luego usar este código.
          </p>
          {codigoInvitacion ? (
            <div className="bg-gray-100 border border-gray-300 px-6 py-2 rounded-xl text-2xl font-black tracking-widest text-gray-800 shadow-inner select-all">
              {codigoInvitacion}
            </div>
          ) : (
            <button
              onClick={generarCodigo}
              disabled={generandoCodigo}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {generandoCodigo ? 'Generando...' : 'Generar código'}
            </button>
          )}
        </div>
      </div>

      {/* Gestión de roles */}
      <div className="bg-white/60 p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-base font-bold text-gray-800 mb-4">Gestionar roles</h3>
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
                      <div className="text-sm font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-4">
                        {rolesDisponibles.map(rol => (
                          <label key={rol.nombre} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-[#91cf5b] focus:ring-[#7ab848] cursor-pointer"
                              checked={user.roles.includes(rol.nombre)}
                              onChange={e => handleCheckbox(user.id, rol.nombre, e.target.checked)}
                            />
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
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function Configuracion({ usuario }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = (usuario.roles || []).includes('ADMIN') || usuario.is_superuser;

  const TABS = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'pagos',  label: 'Pagos'  },
    ...(isAdmin ? [{ id: 'equipo', label: 'Equipo' }] : []),
  ];

  const tabParam = searchParams.get('tab');
  const tabActiva = TABS.find(t => t.id === tabParam) ? tabParam : 'perfil';
  const setTab = (id) => setSearchParams({ tab: id }, { replace: true });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Configuración</h1>

      {/* Pestañas */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold transition-colors relative ${
              tabActiva === tab.id
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {tabActiva === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#91cf5b] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tabActiva === 'perfil' && <TabPerfil usuario={usuario} />}
      {tabActiva === 'pagos'  && <PortalSuscripcion />}
      {tabActiva === 'equipo' && isAdmin && <TabEquipo />}
    </div>
  );
}
