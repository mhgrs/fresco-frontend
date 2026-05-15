import { useState, useEffect } from 'react';
import { rolesService } from '../../services/roles';
import { useNotificacion } from '../../hooks/useNotificacion';

const MODULO_LABELS = {
  POS:           'Punto de Venta',
  CAJA:          'Caja / Turno',
  INVENTARIO:    'Inventario',
  CATEGORIAS:    'Categorías',
  ALERTAS:       'Alertas',
  VENTAS:        'Ventas',
  REPORTES:      'Reportes',
  EQUIPO:        'Equipo',
  CONFIGURACION: 'Configuración',
};

function agruparPorModulo(permisos) {
  return permisos.reduce((acc, p) => {
    if (!acc[p.modulo]) acc[p.modulo] = [];
    acc[p.modulo].push(p);
    return acc;
  }, {});
}

function FormularioRol({ permisosDisponibles, rolInicial, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(rolInicial?.nombre || '');
  const [seleccionados, setSeleccionados] = useState(
    new Set(rolInicial?.permisos || [])
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const porModulo = agruparPorModulo(permisosDisponibles);

  const togglePermiso = (codigo) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      next.has(codigo) ? next.delete(codigo) : next.add(codigo);
      return next;
    });
  };

  const toggleModulo = (modulo) => {
    const codigos = (porModulo[modulo] || []).map(p => p.codigo);
    const todosSeleccionados = codigos.every(c => seleccionados.has(c));
    setSeleccionados(prev => {
      const next = new Set(prev);
      codigos.forEach(c => todosSeleccionados ? next.delete(c) : next.add(c));
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) { setError('El nombre del rol es requerido.'); return; }
    setGuardando(true);
    setError('');
    try {
      await onGuardar({ nombre: nombre.trim(), permisos: [...seleccionados] });
    } catch (err) {
      setError(err.response?.data?.nombre?.[0] || err.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Nombre del rol
        </label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Ej. Vendedor, Supervisor de Tienda..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
          maxLength={50}
        />
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Permisos</p>
        <div className="space-y-4">
          {Object.entries(porModulo).map(([modulo, perms]) => {
            const codigos = perms.map(p => p.codigo);
            const todos = codigos.every(c => seleccionados.has(c));
            const algunos = !todos && codigos.some(c => seleccionados.has(c));
            return (
              <div key={modulo} className="border border-gray-100 rounded-xl p-3">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={todos}
                    ref={el => { if (el) el.indeterminate = algunos; }}
                    onChange={() => toggleModulo(modulo)}
                    className="h-4 w-4 rounded border-gray-300 text-[#91cf5b] focus:ring-[#7ab848]"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    {MODULO_LABELS[modulo] || modulo}
                  </span>
                </label>
                <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {perms.map(p => (
                    <label key={p.codigo} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={seleccionados.has(p.codigo)}
                        onChange={() => togglePermiso(p.codigo)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-[#91cf5b] focus:ring-[#7ab848]"
                      />
                      <span className="text-sm text-gray-600">{p.descripcion}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="bg-gray-900 hover:bg-gray-700 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : rolInicial ? 'Guardar cambios' : 'Crear rol'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-full text-sm transition-all active:scale-95"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function GestorRoles() {
  const [roles, setRoles]                       = useState([]);
  const [permisosDisponibles, setPermisos]      = useState([]);
  const [cargando, setCargando]                 = useState(true);
  const [creando, setCreando]                   = useState(false);
  const [editandoId, setEditandoId]             = useState(null);
  const [confirmandoEliminarId, setConfirmando] = useState(null);
  const { notificacion, mostrar }               = useNotificacion();

  const cargar = async () => {
    try {
      const [resRoles, resPermisos] = await Promise.all([
        rolesService.listar(),
        rolesService.listarDisponibles(),
      ]);
      setRoles(resRoles.data);
      setPermisos(resPermisos.data);
    } catch {
      mostrar('No se pudieron cargar los roles.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleCrear = async (datos) => {
    await rolesService.crear(datos);
    mostrar('Rol creado correctamente.', 'success');
    setCreando(false);
    cargar();
  };

  const handleActualizar = async (id, datos) => {
    await rolesService.actualizar(id, datos);
    mostrar('Rol actualizado.', 'success');
    setEditandoId(null);
    cargar();
  };

  const handleEliminar = async (id) => {
    try {
      await rolesService.eliminar(id);
      mostrar('Rol eliminado.', 'success');
      setConfirmando(null);
      cargar();
    } catch (err) {
      mostrar(err.response?.data?.error || 'No se pudo eliminar el rol.', 'error');
      setConfirmando(null);
    }
  };

  if (cargando) return <div className="p-6 text-center text-gray-400">Cargando roles...</div>;

  return (
    <div className="space-y-4">
      {notificacion.visible && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      {/* Lista de roles existentes */}
      {roles.map(rol => (
        <div key={rol.id} className="bg-white/60 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {editandoId === rol.id ? (
            <div className="p-5">
              <p className="text-sm font-bold text-gray-700 mb-4">Editando rol: {rol.nombre}</p>
              <FormularioRol
                permisosDisponibles={permisosDisponibles}
                rolInicial={{ nombre: rol.nombre, permisos: rol.permisos }}
                onGuardar={(datos) => handleActualizar(rol.id, datos)}
                onCancelar={() => setEditandoId(null)}
              />
            </div>
          ) : (
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900">{rol.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {rol.permisos.length} permiso{rol.permisos.length !== 1 ? 's' : ''}
                  {rol.permisos.length > 0 && (
                    <span className="ml-1 text-gray-300">
                      · {rol.permisos.slice(0, 3).join(', ')}{rol.permisos.length > 3 ? '...' : ''}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {confirmandoEliminarId === rol.id ? (
                  <>
                    <span className="text-sm text-gray-500 self-center">¿Eliminar?</span>
                    <button
                      onClick={() => handleEliminar(rol.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setConfirmando(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditandoId(rol.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmando(rol.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Formulario de creación */}
      {creando ? (
        <div className="bg-white/60 rounded-2xl border border-[#91cf5b] shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 mb-4">Nuevo rol</p>
          <FormularioRol
            permisosDisponibles={permisosDisponibles}
            rolInicial={null}
            onGuardar={handleCrear}
            onCancelar={() => setCreando(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setCreando(true)}
          className="w-full border-2 border-dashed border-gray-200 hover:border-[#91cf5b] text-gray-400 hover:text-[#91cf5b] font-bold py-3 rounded-2xl text-sm transition-all"
        >
          + Crear nuevo rol
        </button>
      )}
    </div>
  );
}
