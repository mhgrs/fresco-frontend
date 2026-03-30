import { useState, useEffect } from 'react';
import api from '../services/api';

function TabEquipo() {
  const [equipo, setEquipo] = useState([]);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [codigoInvitacion, setCodigoInvitacion] = useState('');
  const [generandoCodigo, setGenerandoCodigo] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resEquipo, resRoles] = await Promise.all([
          api.get('inventario/usuarios/'),
          api.get('inventario/roles/')
        ]);
        // Filtramos el rol 'ADMIN' para que no se pueda asignar/quitar fácilmente
        // La propiedad de 'ADMIN' se hereda al crear la empresa o debe ser asignada por un superuser.
        setRolesDisponibles(resRoles.data.filter(r => r.nombre !== 'ADMIN'));
        setEquipo(resEquipo.data);
      } catch (err) {
        setError('No se pudo cargar la información del equipo.');
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const handleRoleChange = async (userId, newRoles) => {
    const equipoOriginal = [...equipo];
    setEquipo(prev => prev.map(u => u.id === userId ? { ...u, roles: newRoles } : u));

    try {
      await api.patch(`inventario/usuarios/${userId}/`, { roles: newRoles });
    } catch (error) {
      console.error("Fallo al actualizar roles:", error);
      setEquipo(equipoOriginal); // Revertir en caso de error
      alert('Hubo un error al actualizar los roles.');
    }
  };

  const handleCheckboxChange = (userId, roleName, isChecked) => {
    const usuario = equipo.find(u => u.id === userId);
    if (!usuario) return;

    const newRoles = isChecked
      ? [...usuario.roles, roleName]
      : usuario.roles.filter(r => r !== roleName);
    
    handleRoleChange(userId, newRoles);
  };

  const generarCodigo = async () => {
    setGenerandoCodigo(true);
    try {
      const res = await api.post('inventario/empresas/generar_codigo/');
      setCodigoInvitacion(res.data.codigo);
    } catch (error) {
      alert("Error al generar código: " + (error.response?.data?.error || "Error desconocido"));
    } finally {
      setGenerandoCodigo(false);
    }
  };

  if (cargando) return <div className="text-center p-8">Cargando equipo...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-10">
      {/* Sección de Invitaciones */}
      <div className="bg-white/60 p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Invitar equipo de trabajo</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 max-w-md">
            Genera un código de un solo uso para que un nuevo empleado se una a tu empresa. El empleado deberá registrarse primero y luego usar este código.
          </p>
          <div className="flex items-center">
            {codigoInvitacion ? (
              <div className="bg-gray-100 border border-gray-300 px-6 py-2 rounded-xl text-2xl font-black tracking-widest text-gray-800 shadow-inner select-all" title="Copiar este código">
                {codigoInvitacion}
              </div>
            ) : (
              <button onClick={generarCodigo} disabled={generandoCodigo} className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap">
                {generandoCodigo ? 'Generando...' : 'Generar Código'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Gestión de Equipo */}
      <div className="bg-white/60 p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Gestionar Equipo</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles Asignados</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipo.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      {rolesDisponibles.map(rol => (
                        <label key={rol.nombre} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-[#91cf5b] focus:ring-[#7ab848] cursor-pointer"
                            checked={user.roles.includes(rol.nombre)}
                            onChange={(e) => handleCheckboxChange(user.id, rol.nombre, e.target.checked)}
                          />
                          <span>{rol.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function GestionEmpresa({ usuario }) {
  const [tabActiva, setTabActiva] = useState('equipo');

  return (
    <div className="p-6 h-full flex flex-col bg-[var(--color-fondo)] relative overflow-hidden transition-colors duration-500">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Panel admin</h1>
      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setTabActiva('equipo')} className={`py-2 px-4 text-sm font-semibold transition-colors ${tabActiva === 'equipo' ? 'border-b-2 border-[#91cf5b] text-[#91cf5b]' : 'text-gray-500 hover:text-gray-700'}`}>
          Equipo de Trabajo
        </button>
        {/* <button onClick={() => setTabActiva('general')} className={`py-2 px-4 text-sm font-semibold transition-colors ${tabActiva === 'general' ? 'border-b-2 border-[#91cf5b] text-[#91cf5b]' : 'text-gray-500 hover:text-gray-700'}`}>
          General (Próximamente)
        </button> */}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tabActiva === 'equipo' && <TabEquipo />}
      </div>
    </div>
  );
}