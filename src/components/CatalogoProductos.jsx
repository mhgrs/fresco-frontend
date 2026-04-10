import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificacion } from '../hooks/useNotificacion';
import { usePermisos } from '../hooks/usePermisos';
import { productosService } from '../services/productos';
import { categoriasService } from '../services/categorias';

export default function CatalogoProductos({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [debouncedTermino, setDebouncedTermino] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('TODOS');

  const [confirmarEliminar, setConfirmarEliminar] = useState({ visible: false, id: null, nombre: '' });

  const navigate = useNavigate();
  const { notificacion, mostrar } = useNotificacion();
  const { esSupervisor, esBodega } = usePermisos(usuario);

  const [paginaActual, setPaginaActual] = useState(1);
  const PAGE_SIZE = 50;

  const [configOrden, setConfigOrden] = useState({ clave: null, direccion: 'asc' });

  // Cargar categorías una sola vez al montar el componente
  useEffect(() => {
    categoriasService.listar()
      .then(res => setCategorias(res.data))
      .catch(console.error);
  }, []);

  // Cargar productos cuando cambian los filtros o la página
  useEffect(() => {
    const params = { page: paginaActual };
    if (debouncedTermino.trim()) params.search = debouncedTermino.trim();
    if (categoriaActiva !== 'TODOS') params.categoria = categoriaActiva;

    productosService.listar(params)
      .then(res => {
        // listar() con params devuelve {count, results, next, previous}
        setProductos(res.data.results);
        setTotalCount(res.data.count);
      })
      .catch(console.error);
  }, [paginaActual, debouncedTermino, categoriaActiva]);

  // Resetear la página a 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedTermino, categoriaActiva]);

  // Debounce de 300ms para el buscador (evita llamadas al servidor en cada tecla)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedTermino(terminoBusqueda), 300);
    return () => clearTimeout(id);
  }, [terminoBusqueda]);

  const alternarEstado = async (id, estadoActual) => {
    if (!esSupervisor()) { mostrar('No tienes permisos para esta acción.', 'error'); return; }
    try {
      const res = await productosService.actualizar(id, { esta_activo: !estadoActual });
      mostrar(`Producto ${estadoActual ? 'oculto' : 'visible'}`, 'success');
      setProductos(productos.map(p => p.id === id ? res.data : p));
    } catch {
      mostrar('Error al actualizar el estado', 'error');
    }
  };

  const ejecutarEliminacion = async () => {
    try {
      await productosService.eliminar(confirmarEliminar.id);
      mostrar('Producto eliminado permanentemente', 'success');
      setProductos(productos.filter(p => p.id !== confirmarEliminar.id));
      setTotalCount(c => c - 1);
      setConfirmarEliminar({ visible: false, id: null, nombre: '' });
    } catch {
      mostrar('No se puede eliminar porque tiene historial de ventas', 'error');
      setConfirmarEliminar({ visible: false, id: null, nombre: '' });
    }
  };

  const abrirModalAjuste = (producto) => {
    if (!esBodega()) { mostrar('No tienes los permisos', 'error'); return; }
    navigate('/inventario/movimientos', { state: { productoPreseleccionado: producto } });
  };

  const intentarEditar = (id) => {
    if (!esSupervisor()) { mostrar('No tienes los permisos', 'error'); return; }
    navigate(`/inventario/editar/${id}`);
  };

  const intentarNuevo = (e) => {
    if (!esBodega()) { e.preventDefault(); mostrar('No tienes los permisos', 'error'); }
  };

  // Ordenamiento client-side sobre los productos de la página actual
  const solicitarOrden = (clave) => {
    setConfigOrden(prev => ({
      clave,
      direccion: prev.clave === clave && prev.direccion === 'asc' ? 'desc' : 'asc',
    }));
  };

  const productosOrdenados = [...productos].sort((a, b) => {
    if (!configOrden.clave) return 0;
    let vA = a[configOrden.clave];
    let vB = b[configOrden.clave];
    if (configOrden.clave === 'precio' || configOrden.clave === 'stock') {
      vA = parseFloat(vA); vB = parseFloat(vB);
    } else {
      vA = (vA || '').toString().toLowerCase();
      vB = (vB || '').toString().toLowerCase();
    }
    if (vA < vB) return configOrden.direccion === 'asc' ? -1 : 1;
    if (vA > vB) return configOrden.direccion === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPaginas = Math.ceil(totalCount / PAGE_SIZE);
  const inicioRango = (paginaActual - 1) * PAGE_SIZE + 1;
  const finRango = Math.min(paginaActual * PAGE_SIZE, totalCount);

  const renderIconoOrden = (clave) => {
    if (configOrden.clave !== clave) return <span className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>;
    return configOrden.direccion === 'asc'
      ? <span className="ml-1 text-[#91cf5b] font-black">↑</span>
      : <span className="ml-1 text-[#91cf5b] font-black">↓</span>;
  };

  return (
    <div className="p-6 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)] relative overflow-hidden transition-colors duration-500">

      {/* Toast */}
      {notificacion.visible && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {confirmarEliminar.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl text-center">
            <h3 className="text-xl font-bold mb-2 text-red-600">¿Eliminar Producto?</h3>
            <p className="text-gray-600 mb-6">Está a punto de borrar permanentemente <strong>{confirmarEliminar.nombre}</strong>. Esta acción no se puede deshacer.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setConfirmarEliminar({ visible: false, id: null, nombre: '' })} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-800 transition">Cancelar</button>
              <button onClick={ejecutarEliminacion} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mx-auto items-center mb-6 w-full">
        <h1 className="text-2xl font-bold text-gray-800">Catálogo de Productos</h1>
        <div className="flex items-center space-x-2">
          {esSupervisor() && (
            <Link to="/categorias" title="Administrar Categorías" className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 px-3 py-2 rounded shadow-sm transition flex items-center justify-center">
              <span className="text-lg">🏷️</span>
            </Link>
          )}
          <Link to="/inventario/nuevo" onClick={intentarNuevo} className="bg-[#91cf5b] hover:bg-[#7ab848] text-white px-4 py-2 rounded font-bold shadow transition flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Buscador — filtra en el servidor al dejar de tipear */}
      <div className="mb-3 flex-none">
        <input
          type="text"
          placeholder="Buscar por nombre, SKU, marca, código de barras o proveedor..."
          className="w-full py-2 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91cf5b] focus:border-[#91cf5b] transition-colors text-gray-700"
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
        />
      </div>

      {/* Pestañas de Categorías */}
      <div className="flex space-x-2 mb-3 overflow-x-auto pb-1 flex-none custom-scrollbar">
        <button
          onClick={() => setCategoriaActiva('TODOS')}
          className={`px-3 py-1 text-sm rounded-full font-bold whitespace-nowrap transition-colors ${categoriaActiva === 'TODOS' ? 'bg-[#91cf5b] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
        >
          Todos
        </button>
        {categorias.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`px-3 py-1 text-sm rounded-full font-bold whitespace-nowrap transition-colors ${categoriaActiva === cat.id ? 'bg-[#91cf5b] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 rounded-lg shadow-md flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {productos.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No se encontraron productos.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/60 sticky top-0 z-10 shadow-sm backdrop-blur-md">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => solicitarOrden('nombre')}>
                    Producto {renderIconoOrden('nombre')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => solicitarOrden('marca')}>
                    Marca {renderIconoOrden('marca')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => solicitarOrden('precio')}>
                    Precio {renderIconoOrden('precio')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => solicitarOrden('stock')}>
                    Stock {renderIconoOrden('stock')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Proveedores</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosOrdenados.map(prod => (
                  <tr key={prod.id} className={`hover:bg-white/40 transition-colors ${!prod.esta_activo ? 'opacity-60 bg-gray-200/50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{prod.sku}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {prod.nombre} {!prod.esta_activo && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded ml-2">Inactivo</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{prod.marca}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-medium">${prod.precio}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${prod.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {prod.tipo_venta === 'UNIDAD' ? `${Math.round(prod.stock)} u` : `${parseFloat(prod.stock)} kg`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {prod.proveedores && (
                        <div className="flex flex-wrap gap-1">
                          {prod.proveedores.split(',').map((prov, i) => (
                            <span key={i} className="text-[10px] px-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold shadow-sm whitespace-nowrap">
                              {prov.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex justify-center space-x-4">
                      {esBodega() && (
                        <button onClick={() => abrirModalAjuste(prod)} title="Ajustar Stock" className="text-purple-600 hover:text-purple-900 transition-transform hover:scale-110">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        </button>
                      )}
                      {esBodega() && (
                        <button onClick={() => intentarEditar(prod.id)} title="Editar" className="text-[#91cf5b] hover:text-[#7ab848] transition-transform hover:scale-110">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                      {esSupervisor() && (
                        <button onClick={() => alternarEstado(prod.id, prod.esta_activo)} title={prod.esta_activo ? 'Ocultar' : 'Hacer visible'} className={`${prod.esta_activo ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'} transition-transform hover:scale-110`}>
                          {prod.esta_activo
                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          }
                        </button>
                      )}
                      {esSupervisor() && (
                        <button onClick={() => setConfirmarEliminar({ visible: true, id: prod.id, nombre: prod.nombre })} title="Eliminar" className="text-red-500 hover:text-red-700 transition-transform hover:scale-110">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Controles de Paginación */}
        {totalPaginas > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-3 bg-white/60 backdrop-blur-md border-t border-gray-200 flex-none gap-2">
            <span className="text-sm text-gray-700 font-medium">
              Mostrando {inicioRango} a {finRango} de {totalCount} resultados
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm font-bold text-gray-700 flex items-center bg-gray-100 rounded border border-gray-200">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
