import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotificacion } from '../hooks/useNotificacion';
import { usePermisos } from '../hooks/usePermisos';
import { useSugerencias } from '../hooks/useSugerencias';
import CodigoBarrasField from './form/CodigoBarrasField';
import SugerenciasInput from './form/SugerenciasInput';
import ProveedoresManager from './form/ProveedoresManager';
import { productosService } from '../services/productos';
import { categoriasService } from '../services/categorias';

export default function FormularioProducto({ usuario }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const { notificacion, mostrar } = useNotificacion();
  const { esAdmin, esSupervisor } = usePermisos(usuario);
  const puedeEditar    = esSupervisor(); // ADMIN + SUPERVISOR pueden editar campos de precio/stock
  const puedeEditarTodo = esAdmin();     // Solo ADMIN puede editar código de barras

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(esEdicion);
  const [modalCatAbierto, setModalCatAbierto] = useState(false);
  const [nuevaCat, setNuevaCat] = useState({ nombre: '', codigo: '' });
  const [marcasExistentes, setMarcasExistentes] = useState([]);
  const [proveedoresExistentes, setProveedoresExistentes] = useState([]);

  const [formulario, setFormulario] = useState({
    nombre: '', marca: '', categoria: '', precio: '', tipo_venta: 'UNIDAD',
    codigo_barras: '', stock: '', umbral_stock: '5', proveedores: '',
  });

  const sugerenciasMarca = useSugerencias(marcasExistentes, formulario.marca);

  const cargarCategorias = async () => {
    const resCat = await categoriasService.listar();
    setCategorias(resCat.data);
    return resCat.data;
  };

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        await cargarCategorias();
        const resTodos = await productosService.listar();

        const marcasUnicas = [...new Set(resTodos.data.map(p => p.marca).filter(Boolean))];
        setMarcasExistentes(marcasUnicas.sort());

        const todosProveedores = resTodos.data
          .map(p => p.proveedores).filter(Boolean)
          .flatMap(p => p.split(',').map(s => s.trim())).filter(Boolean);
        setProveedoresExistentes([...new Set(todosProveedores)].sort());

        if (esEdicion) {
          const resProd = await productosService.obtener(id);
          const p = resProd.data;
          const stockInicial  = p.tipo_venta === 'UNIDAD' ? Math.round(p.stock) : p.stock;
          const umbralInicial = p.umbral_stock !== undefined
            ? (p.tipo_venta === 'UNIDAD' ? Math.round(p.umbral_stock) : p.umbral_stock)
            : '5';
          setFormulario({
            nombre: p.nombre, marca: p.marca || '', categoria: p.categoria,
            precio: p.precio, tipo_venta: p.tipo_venta,
            codigo_barras: p.codigo_barras || '', stock: stockInicial,
            umbral_stock: umbralInicial, proveedores: p.proveedores || '',
          });
        }
      } catch {
        mostrar('Error al cargar la información', 'error');
        setTimeout(() => navigate('/inventario'), 1500);
      } finally {
        setCargando(false);
      }
    };
    inicializarDatos();
  }, [id, esEdicion, navigate]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === 'categoria' && value === 'NUEVA_CAT') {
      setModalCatAbierto(true);
      return;
    }
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const buscarMaestro = async (codigo) => {
    if (!codigo?.trim()) return;
    try {
      const res = await productosService.consultarMaestro(codigo);
      if (res.data) {
        const { nombre_estandarizado, marca, categoria: catNombre } = res.data;
        // Intentar mapear la categoría del maestro a una categoría cargada (por nombre)
        const catEncontrada = catNombre
          ? categorias.find(c => c.nombre.toLowerCase() === catNombre.toLowerCase())
          : null;

        setFormulario(prev => {
          const updNombre    = nombre_estandarizado && !prev.nombre;
          const updMarca     = marca && !prev.marca;
          const updCategoria = catEncontrada && !prev.categoria;
          if (updNombre || updMarca || updCategoria) {
            mostrar('¡Sugerencia encontrada en catálogo global!', 'success');
            return {
              ...prev,
              nombre:    updNombre    ? nombre_estandarizado : prev.nombre,
              marca:     updMarca     ? marca                : prev.marca,
              categoria: updCategoria ? catEncontrada.id     : prev.categoria,
            };
          }
          return prev;
        });
      }
    } catch { /* 404 → producto nuevo, sin datos globales */ }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    let stockFinal  = parseFloat(formulario.stock)        || 0;
    let umbralFinal = parseFloat(formulario.umbral_stock) || 0;
    if (formulario.tipo_venta === 'UNIDAD') {
      stockFinal  = Math.round(stockFinal);
      umbralFinal = Math.round(umbralFinal);
    } else {
      stockFinal  = Math.round(stockFinal  * 100) / 100;
      umbralFinal = Math.round(umbralFinal * 100) / 100;
    }
    const payload = {
      ...formulario,
      precio:        parseInt(formulario.precio),
      stock:         stockFinal,
      umbral_stock:  umbralFinal,
      codigo_barras: formulario.codigo_barras.trim() || null,
      marca:         formulario.marca.trim()         || null,
      proveedores:   formulario.proveedores.trim()   || null,
    };
    try {
      if (esEdicion) {
        await productosService.actualizar(id, payload);
        mostrar('Producto actualizado exitosamente', 'success');
      } else {
        await productosService.crear(payload);
        mostrar('Producto creado exitosamente', 'success');
      }
      setTimeout(() => navigate('/inventario'), 1500);
    } catch {
      mostrar('Error al guardar el producto. Verifique los datos.', 'error');
    }
  };

  const guardarNuevaCategoria = async (e) => {
    e.preventDefault();
    try {
      const res = await categoriasService.crear({ nombre: nuevaCat.nombre });
      await cargarCategorias();
      setFormulario(prev => ({ ...prev, categoria: res.data.id }));
      setModalCatAbierto(false);
      setNuevaCat({ nombre: '', codigo: '' });
      mostrar('Categoría creada con éxito', 'success');
    } catch {
      mostrar('Error al crear. El nombre de la categoría probablemente ya existe.', 'error');
    }
  };

  if (cargando) return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;

  return (
    <div className="p-6 h-full flex justify-center bg-[var(--color-fondo)] overflow-y-auto relative transition-colors duration-500">

      {notificacion.visible && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 p-8 rounded-lg shadow-md w-full max-w-2xl h-fit">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          {esEdicion ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h2>

        <form onSubmit={guardarProducto} className="space-y-5">
          <CodigoBarrasField
            value={formulario.codigo_barras}
            onChange={(valor) => setFormulario(prev => ({ ...prev, codigo_barras: valor }))}
            onBlur={() => buscarMaestro(formulario.codigo_barras)}
            onScan={(codigo) => {
              setFormulario(prev => ({ ...prev, codigo_barras: codigo }));
              buscarMaestro(codigo);
            }}
            disabled={!puedeEditarTodo}
          />

          <SugerenciasInput
            label="Marca *"
            name="marca"
            value={formulario.marca}
            onChange={(valor) => setFormulario(prev => ({ ...prev, marca: valor }))}
            sugerencias={sugerenciasMarca}
            onSeleccionar={(item) => setFormulario(prev => ({ ...prev, marca: item }))}
            placeholder="Ej: Coca-Cola, Soprole..."
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Producto *</label>
            <input required type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio}
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría *</label>
            <select required name="categoria" value={formulario.categoria} onChange={manejarCambio}
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Seleccione...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre} ({cat.codigo})</option>
              ))}
              <option value="NUEVA_CAT" className="font-bold text-blue-600 bg-blue-50">
                ➕ Crear nueva categoría...
              </option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio (CLP) *</label>
              <input disabled={!puedeEditar} required type="number" min="0" name="precio"
                value={formulario.precio} onChange={manejarCambio}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo Venta *</label>
              <select disabled={!puedeEditar} name="tipo_venta" value={formulario.tipo_venta} onChange={manejarCambio}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500">
                <option value="UNIDAD">Unidad</option>
                <option value="GRANEL">Granel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock Actual {formulario.tipo_venta !== 'UNIDAD' && '(Kilos, max 2 decimales)'}
              </label>
              <input disabled={!puedeEditar} type="number"
                step={formulario.tipo_venta === 'UNIDAD' ? '1' : '0.01'}
                name="stock" value={formulario.stock} onChange={manejarCambio}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Umbral Alerta Mínima</label>
              <input disabled={!puedeEditar} type="number"
                step={formulario.tipo_venta === 'UNIDAD' ? '1' : '0.01'} min="0"
                name="umbral_stock" value={formulario.umbral_stock} onChange={manejarCambio}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Proveedores (Opcional)</label>
            <ProveedoresManager
              proveedores={formulario.proveedores}
              onChange={(valor) => setFormulario(prev => ({ ...prev, proveedores: valor }))}
              proveedoresExistentes={proveedoresExistentes}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
            <button type="button" onClick={() => navigate('/inventario')}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded hover:bg-gray-300 transition">
              Cancelar
            </button>
            <button type="submit" disabled={!puedeEditar && esEdicion}
              className="bg-[#91cf5b] hover:bg-[#7ab848] text-white font-bold py-2 px-6 rounded transition disabled:opacity-50">
              Guardar Producto
            </button>
          </div>
        </form>
      </div>

      {/* Modal creación rápida de categoría */}
      {modalCatAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Nueva Categoría</h3>
            <form onSubmit={guardarNuevaCategoria}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required autoFocus type="text" value={nuevaCat.nombre}
                  onChange={(e) => setNuevaCat({ ...nuevaCat, nombre: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button"
                  onClick={() => { setModalCatAbierto(false); setFormulario(prev => ({ ...prev, categoria: '' })); }}
                  className="px-4 py-2 bg-gray-200 rounded font-bold hover:bg-gray-300 transition">
                  Cancelar
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
