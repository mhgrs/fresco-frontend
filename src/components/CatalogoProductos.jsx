import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificacion } from '../hooks/useNotificacion';
import { usePermisos } from '../hooks/usePermisos';
import { useDebounce } from '../hooks/useDebounce';
import { productosService } from '../services/productos';
import { categoriasService } from '../services/categorias';
import ProductoFila from './catalogo/ProductoFila';
import ConfirmarEliminarModal from './ui/ConfirmarEliminarModal';

export default function CatalogoProductos({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('TODOS');
  const [confirmarEliminar, setConfirmarEliminar] = useState({ visible: false, id: null, nombre: '' });
  const [paginaActual, setPaginaActual] = useState(1);
  const [configOrden, setConfigOrden] = useState({ clave: null, direccion: 'asc' });

  const PAGE_SIZE = 50;
  const navigate = useNavigate();
  const { notificacion, mostrar } = useNotificacion();
  const { esSupervisor, esBodega } = usePermisos(usuario);
  const debouncedTermino = useDebounce(terminoBusqueda, 300);

  useEffect(() => {
    categoriasService.listar()
      .then(res => setCategorias(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params = { page: paginaActual };
    if (debouncedTermino.trim()) params.search = debouncedTermino.trim();
    if (categoriaActiva !== 'TODOS') params.categoria = categoriaActiva;
    productosService.listar(params)
      .then(res => { setProductos(res.data.results); setTotalCount(res.data.count); })
      .catch(console.error);
  }, [paginaActual, debouncedTermino, categoriaActiva]);

  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedTermino, categoriaActiva]);

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

      {notificacion.visible && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      {confirmarEliminar.visible && (
        <ConfirmarEliminarModal
          mensaje={<>Está a punto de borrar permanentemente <strong>{confirmarEliminar.nombre}</strong>. Esta acción no se puede deshacer.</>}
          onConfirmar={ejecutarEliminacion}
          onCancelar={() => setConfirmarEliminar({ visible: false, id: null, nombre: '' })}
        />
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

      <div className="mb-3 flex-none">
        <input
          type="text"
          placeholder="Buscar por nombre, SKU, marca, código de barras o proveedor..."
          className="w-full py-2 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91cf5b] focus:border-[#91cf5b] transition-colors text-gray-700"
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
        />
      </div>

      <div className="flex space-x-2 mb-3 overflow-x-auto pb-1 flex-none custom-scrollbar">
        <button onClick={() => setCategoriaActiva('TODOS')} className={`px-3 py-1 text-sm rounded-full font-bold whitespace-nowrap transition-colors ${categoriaActiva === 'TODOS' ? 'bg-[#91cf5b] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}>Todos</button>
        {categorias.map(cat => (
          <button key={cat.id} onClick={() => setCategoriaActiva(cat.id)} className={`px-3 py-1 text-sm rounded-full font-bold whitespace-nowrap transition-colors ${categoriaActiva === cat.id ? 'bg-[#91cf5b] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}>
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
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => solicitarOrden('nombre')}>Producto {renderIconoOrden('nombre')}</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => solicitarOrden('marca')}>Marca {renderIconoOrden('marca')}</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => solicitarOrden('precio')}>Precio {renderIconoOrden('precio')}</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none" onClick={() => solicitarOrden('stock')}>Stock {renderIconoOrden('stock')}</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Proveedores</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosOrdenados.map(prod => (
                  <ProductoFila
                    key={prod.id}
                    producto={prod}
                    puedeAcceder={esBodega()}
                    puedeGestionar={esSupervisor()}
                    onAjustar={abrirModalAjuste}
                    onEditar={intentarEditar}
                    onToggleEstado={alternarEstado}
                    onEliminar={(id, nombre) => setConfirmarEliminar({ visible: true, id, nombre })}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-3 bg-white/60 backdrop-blur-md border-t border-gray-200 flex-none gap-2">
            <span className="text-sm text-gray-700 font-medium">Mostrando {inicioRango} a {finRango} de {totalCount} resultados</span>
            <div className="flex space-x-2">
              <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm">Anterior</button>
              <span className="px-3 py-1 text-sm font-bold text-gray-700 flex items-center bg-gray-100 rounded border border-gray-200">Página {paginaActual} de {totalPaginas}</span>
              <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
