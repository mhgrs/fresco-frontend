import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function FormularioProducto({ usuario }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const isBodega = usuario?.rol === 'BODEGA';

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(esEdicion);
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });
  
  // Estado para creación de categoría in-app
  const [modalCatAbierto, setModalCatAbierto] = useState(false);
  const [nuevaCat, setNuevaCat] = useState({ nombre: '', codigo: '' });

  const [formulario, setFormulario] = useState({
    nombre: '', categoria: '', precio: '', tipo_venta: 'UNIDAD', codigo_barras: '', stock: '', umbral_stock: '5'
  });

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ visible: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: '' }), 3000);
  };

  const cargarCategorias = async () => {
    const resCat = await api.get('inventario/categorias/');
    setCategorias(resCat.data);
    return resCat.data;
  };

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        await cargarCategorias();
        if (esEdicion) {
          const resProd = await api.get(`inventario/productos/${id}/`);
          const p = resProd.data;
          setFormulario({
            nombre: p.nombre,
            categoria: p.categoria,
            precio: p.precio,
            tipo_venta: p.tipo_venta,
            codigo_barras: p.codigo_barras || '',
            stock: p.stock,
            umbral_stock: p.umbral_stock !== undefined ? p.umbral_stock : '5'
          });
        }
      } catch (error) {
        mostrarNotificacion('Error al cargar la información', 'error');
        setTimeout(() => navigate('/inventario'), 1500);
      } finally {
        setCargando(false);
      }
    };
    inicializarDatos();
  }, [id, esEdicion, navigate]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    // Si se selecciona la opción de crear nueva categoría en el select
    if (name === 'categoria' && value === 'NUEVA_CAT') {
      setModalCatAbierto(true);
      return;
    }
    setFormulario({ ...formulario, [name]: value });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    
    // Validación estricta de stock para base de datos
    let stockFinal = parseFloat(formulario.stock) || 0;
    let umbralFinal = parseFloat(formulario.umbral_stock) || 0;
    if (formulario.tipo_venta === 'UNIDAD') {
        stockFinal = Math.round(stockFinal); // Sin decimales
        umbralFinal = Math.round(umbralFinal);
    } else {
        stockFinal = Math.round(stockFinal * 100) / 100; // 2 decimales para inventario
        umbralFinal = Math.round(umbralFinal * 100) / 100;
    }

    const payload = {
      ...formulario,
      precio: parseInt(formulario.precio),
      stock: stockFinal,
      umbral_stock: umbralFinal,
      codigo_barras: formulario.codigo_barras.trim() || null
    };

    try {
      if (esEdicion) {
        await api.put(`inventario/productos/${id}/`, payload);
        mostrarNotificacion('Producto actualizado exitosamente', 'success');
      } else {
        await api.post('inventario/productos/', payload);
        mostrarNotificacion('Producto creado exitosamente', 'success');
      }
      setTimeout(() => navigate('/inventario'), 1500);
    } catch (error) {
      mostrarNotificacion('Error al guardar el producto. Verifique los datos.', 'error');
    }
  };

  const guardarNuevaCategoria = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('inventario/categorias/', { nombre: nuevaCat.nombre, codigo: nuevaCat.codigo.toUpperCase() });
      await cargarCategorias();
      setFormulario({ ...formulario, categoria: res.data.id }); // Autoseleccionar la nueva
      setModalCatAbierto(false);
      setNuevaCat({ nombre: '', codigo: '' });
      mostrarNotificacion('Categoría creada con éxito', 'success');
    } catch (error) {
      mostrarNotificacion('Error: Asegure que el código sea único (3 letras)', 'error');
    }
  };

  if (cargando) return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;

  return (
    <div className="p-6 h-full flex justify-center bg-[var(--color-fondo)] overflow-y-auto relative transition-colors duration-500">
      
      {notificacion.visible && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 p-8 rounded-lg shadow-md w-full max-w-2xl h-fit">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          {esEdicion ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h2>
        
        <form onSubmit={guardarProducto} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Producto *</label>
            <input required type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría *</label>
            <select required name="categoria" value={formulario.categoria} onChange={manejarCambio} className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Seleccione...</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre} ({cat.codigo})</option>)}
              {/* Opción integrada para crear nueva categoría */}
              <option value="NUEVA_CAT" className="font-bold text-blue-600 bg-blue-50">➕ Crear nueva categoría...</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio (CLP) *</label>
              <input disabled={isBodega} required type="number" min="0" name="precio" value={formulario.precio} onChange={manejarCambio} className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo Venta *</label>
              <select disabled={isBodega} name="tipo_venta" value={formulario.tipo_venta} onChange={manejarCambio} className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500">
                <option value="UNIDAD">Unidad</option>
                <option value="GRANEL">Granel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock Actual {formulario.tipo_venta === 'UNIDAD' ? '' : '(Kilos, max 2 decimales)'}
              </label>
              <input 
                disabled={isBodega}
                type="number" 
                step={formulario.tipo_venta === 'UNIDAD' ? '1' : '0.01'} 
                name="stock" 
                value={formulario.stock} 
                onChange={manejarCambio} 
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Umbral Alerta Mínima
              </label>
              <input 
                disabled={isBodega}
                type="number" 
                step={formulario.tipo_venta === 'UNIDAD' ? '1' : '0.01'} 
                min="0" 
                name="umbral_stock" 
                value={formulario.umbral_stock} 
                onChange={manejarCambio} 
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cód. Barras</label>
            <input disabled={isBodega} type="text" name="codigo_barras" value={formulario.codigo_barras} onChange={manejarCambio} className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="Opcional" />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
            <button type="button" onClick={() => navigate('/inventario')} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded hover:bg-gray-300 transition">
              Cancelar
            </button>
            <button type="submit" className="bg-[#91cf5b] hover:bg-[#7ab848] text-white font-bold py-2 px-6 rounded  transition">
              Guardar Producto
            </button>
          </div>
        </form>
      </div>

      {/* Modal Creación Rápida Categoría (Totalmente In-App) */}
      {modalCatAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Nueva Categoría</h3>
            <form onSubmit={guardarNuevaCategoria}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required autoFocus type="text" value={nuevaCat.nombre} onChange={(e) => setNuevaCat({...nuevaCat, nombre: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Código (3 letras)</label>
                <input required type="text" maxLength="3" value={nuevaCat.codigo} onChange={(e) => setNuevaCat({...nuevaCat, codigo: e.target.value})} className="w-full p-2 border rounded uppercase focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => { setModalCatAbierto(false); setFormulario({...formulario, categoria: ''}); }} className="px-4 py-2 bg-gray-200 rounded font-bold hover:bg-gray-300 transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}