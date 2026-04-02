import { useState, useEffect } from 'react';
import api from '../services/api';

export default function GestorCategorias({ usuario }) {
  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState({ id: null, nombre: '', codigo: '' });
  
  const [confirmarEliminar, setConfirmarEliminar] = useState({ visible: false, id: null, nombre: '' });
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ visible: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: '' }), 3000);
  };

  const cargarCategorias = async () => {
    try {
      const res = await api.get('inventario/categorias/');
      setCategorias(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { cargarCategorias(); }, []);

  const manejarCambio = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const guardarCategoria = async (e) => {
    e.preventDefault();
    try {
      if (formulario.id) {
        // Usamos PATCH en lugar de PUT para modificaciones parciales
        await api.patch(`inventario/categorias/${formulario.id}/`, { nombre: formulario.nombre, codigo: formulario.codigo.toUpperCase() });
        mostrarNotificacion('Categoría actualizada exitosamente', 'success');
      } else {
        await api.post('inventario/categorias/', { nombre: formulario.nombre, codigo: formulario.codigo.toUpperCase() });
        mostrarNotificacion('Categoría creada exitosamente', 'success');
      }
      setFormulario({ id: null, nombre: '', codigo: '' });
      cargarCategorias();
    } catch (error) {
      mostrarNotificacion('Error: El código (3 letras) debe ser único.', 'error');
    }
  };

  const editar = (cat) => setFormulario({ id: cat.id, nombre: cat.nombre, codigo: cat.codigo });

  const intentarEliminar = (cat) => {
    if (!usuario?.roles.includes('ADMIN') && !usuario?.roles.includes('SUPERVISOR')) {
      mostrarNotificacion('No tienes los permisos', 'error');
      return;
    }
    setConfirmarEliminar({ visible: true, id: cat.id, nombre: cat.nombre });
  };

  const ejecutarEliminacion = async () => {
    try {
      await api.delete(`inventario/categorias/${confirmarEliminar.id}/`);
      mostrarNotificacion('Categoría eliminada', 'success');
      setConfirmarEliminar({ visible: false, id: null, nombre: '' });
      cargarCategorias();
    } catch (error) {
      mostrarNotificacion('No se puede eliminar porque tiene productos asociados', 'error');
      setConfirmarEliminar({ visible: false, id: null, nombre: '' });
    }
  };

  return (
    <div className="p-6 h-full w-full max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 bg-[var(--color-fondo)] relative overflow-hidden transition-colors duration-500">
      
      {/* Toast Notification */}
      {notificacion.visible && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      {/* Modal Confirmar Eliminación (IN-APP) */}
      {confirmarEliminar.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl text-center">
            <h3 className="text-xl font-bold mb-2 text-red-600">¿Eliminar Categoría?</h3>
            <p className="text-gray-600 mb-6">Está a punto de borrar <strong>{confirmarEliminar.nombre}</strong>.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setConfirmarEliminar({ visible: false, id: null, nombre: '' })} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-800 transition">Cancelar</button>
              <button onClick={ejecutarEliminacion} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full md:w-1/3 bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">{formulario.id ? 'Editar' : 'Nueva'} Categoría</h2>
        <form onSubmit={guardarCategoria} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input required type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Código (3 Letras)</label>
            <input required type="text" maxLength="3" name="codigo" value={formulario.codigo} onChange={manejarCambio} className="mt-1 w-full p-2 border rounded uppercase focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex space-x-2 pt-2">
            {formulario.id && (
              <button type="button" onClick={() => setFormulario({ id: null, nombre: '', codigo: '' })} className="flex-1 bg-gray-200 py-2 rounded font-bold text-gray-700 hover:bg-gray-300 transition">Cancelar</button>
            )}
            <button type="submit" className="flex-1 text-white py-2 rounded font-bold bg-[#91cf5b] hover:bg-[#7ab848] transition">Guardar</button>
          </div>
        </form>
      </div>

      <div className="w-full md:w-2/3 bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/60 backdrop-blur-md sticky top-0 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categorias.map(cat => (
                <tr key={cat.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{cat.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{cat.codigo}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.nombre}</td>
                  <td className="px-6 py-4 text-center flex justify-center space-x-4">
                    <button onClick={() => editar(cat)} title="Editar" className="text-blue-600 hover:text-blue-900 transition-transform hover:scale-110">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={() => intentarEliminar(cat)} title="Eliminar" className="text-red-500 hover:text-red-700 transition-transform hover:scale-110">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
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