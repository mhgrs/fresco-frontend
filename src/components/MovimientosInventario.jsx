import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotificacion } from '../hooks/useNotificacion';
import { useDebounce } from '../hooks/useDebounce';
import { productosService } from '../services/productos';
import { logError } from '../utils/logger';

export default function MovimientosInventario({ usuario }) {
  const location = useLocation();
  const productoPreseleccionado = location.state?.productoPreseleccionado || null;

  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState('registro');

  const { notificacion, mostrar } = useNotificacion();

  const [formularioGlobal, setFormularioGlobal] = useState({ tipo: 'INGRESO', motivo: 'MERMA', descripcion: '' });
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);

  const [seleccionados, setSeleccionados] = useState(
    productoPreseleccionado ? [{ producto: productoPreseleccionado, cantidad: '' }] : []
  );
  const [procesando, setProcesando] = useState(false);
  const debouncedBusqueda = useDebounce(busqueda, 250);
  const agregandoRef = useRef(false);

  const cargarDatos = async () => {
    try {
      const [resProd, resMov] = await Promise.all([
        productosService.listar(),
        productosService.movimientos()
      ]);
      setProductos(resProd.data.filter(p => p.esta_activo));
      setMovimientos(resMov.data);
    } catch (error) {
      logError('MovimientosInventario', error);
      mostrar('Error al cargar los datos', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Limpiar resultados inmediatamente al borrar el campo
  useEffect(() => {
    if (!busqueda.trim()) setResultadosBusqueda([]);
  }, [busqueda]);

  // Buscador debounced: evita duplicados por escritura rápida / lector de barras
  useEffect(() => {
    if (!debouncedBusqueda.trim()) {
      setResultadosBusqueda([]);
      return;
    }
    const term = debouncedBusqueda.toLowerCase().trim();

    // Autocompletado exacto (ideal para lectores de códigos de barra)
    const coincidenciaExacta = productos.find(
      p => (p.codigo_barras && p.codigo_barras.toLowerCase() === term) || p.sku.toLowerCase() === term
    );

    if (coincidenciaExacta && term.length >= 4) {
      if (!agregandoRef.current) {
        agregandoRef.current = true;
        setSeleccionados(prev => {
          if (!prev.find(s => s.producto.id === coincidenciaExacta.id)) {
            return [...prev, { producto: coincidenciaExacta, cantidad: '' }];
          }
          return prev;
        });
        setBusqueda('');
        setTimeout(() => { agregandoRef.current = false; }, 400);
      }
      return;
    }

    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.codigo_barras && p.codigo_barras.toLowerCase().includes(term))
    );
    setResultadosBusqueda(filtrados);
  }, [debouncedBusqueda, productos]);

  const agregarProducto = (prod) => {
    setSeleccionados(prev => {
      if (!prev.find(s => s.producto.id === prod.id)) {
        return [...prev, { producto: prod, cantidad: '' }];
      }
      return prev;
    });
    setBusqueda('');
  };

  const removerProducto = (id) => {
    setSeleccionados(prev => prev.filter(s => s.producto.id !== id));
  };

  const actualizarCantidad = (id, valor) => {
    setSeleccionados(prev => prev.map(s => s.producto.id === id ? { ...s, cantidad: valor } : s));
  };

  const guardarMovimiento = async (e) => {
    e.preventDefault();
    if (seleccionados.length === 0) {
      mostrar('Debes agregar al menos un producto', 'error');
      return;
    }
    
    // Validación obligatoria de descripción si el motivo es OTRO
    if (formularioGlobal.tipo === 'RETIRO' && formularioGlobal.motivo === 'OTRO' && !formularioGlobal.descripcion.trim()) {
      mostrar('La descripción es obligatoria cuando el motivo de retiro es "Otro".', 'error');
      return;
    }

    // Validar ítem por ítem: separar válidos de inválidos sin bloquear el lote
    const validos = [];
    const omitidos = [];
    for (const item of seleccionados) {
      const cant = parseFloat(String(item.cantidad).replace(',', '.'));
      if (!item.cantidad || isNaN(cant) || cant <= 0) {
        omitidos.push(`${item.producto.nombre} (cantidad inválida)`);
        continue;
      }
      if (formularioGlobal.tipo === 'RETIRO' && cant > parseFloat(item.producto.stock)) {
        omitidos.push(`${item.producto.nombre} (stock insuficiente: ${parseFloat(item.producto.stock)})`);
        continue;
      }
      validos.push({ item, cant });
    }

    if (validos.length === 0) {
      mostrar(omitidos[0] || 'No hay ítems válidos para procesar', 'error');
      return;
    }

    setProcesando(true);
    try {
      const resultados = await Promise.allSettled(
        validos.map(({ item, cant }) =>
          productosService.ajustarStock(item.producto.id, {
            tipo: formularioGlobal.tipo,
            cantidad: cant,
            motivo: formularioGlobal.tipo === 'RETIRO' ? formularioGlobal.motivo : null,
            descripcion: formularioGlobal.tipo === 'RETIRO' ? formularioGlobal.descripcion : null,
          })
        )
      );

      const idsExitosos = resultados
        .map((r, i) => r.status === 'fulfilled' ? validos[i].item.producto.id : null)
        .filter(Boolean);
      const nombresApiFallidos = resultados
        .map((r, i) => r.status === 'rejected' ? validos[i].item.producto.nombre : null)
        .filter(Boolean);

      cargarDatos();

      const todosFallidos = [...omitidos, ...nombresApiFallidos];

      if (idsExitosos.length > 0 && todosFallidos.length === 0) {
        mostrar('Todos los movimientos registrados exitosamente', 'success');
        setSeleccionados([]);
        setFormularioGlobal({ ...formularioGlobal, descripcion: '' });
        setTabActiva('historial');
      } else if (idsExitosos.length > 0) {
        mostrar(`${idsExitosos.length} registrado(s). Sin registrar: ${todosFallidos.join(' | ')}`, 'error');
        setSeleccionados(prev => prev.filter(s => !idsExitosos.includes(s.producto.id)));
      } else {
        const primerApiError = resultados.find(r => r.status === 'rejected');
        mostrar(primerApiError?.reason?.response?.data?.error || `Sin registrar: ${todosFallidos.join(' | ')}`, 'error');
      }
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="p-6 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)] relative overflow-hidden transition-colors duration-500">
      {notificacion.visible && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Movimientos de Inventario</h1>
      </div>

      <div className="flex border-b border-gray-200 mb-6 flex-none">
        <button onClick={() => setTabActiva('registro')} className={`py-2 px-4 text-sm font-semibold transition-colors ${tabActiva === 'registro' ? 'border-b-2 border-[#91cf5b] text-[#91cf5b]' : 'text-gray-500 hover:text-gray-700'}`}>
          Registrar Movimiento
        </button>
        <button onClick={() => setTabActiva('historial')} className={`py-2 px-4 text-sm font-semibold transition-colors ${tabActiva === 'historial' ? 'border-b-2 border-[#91cf5b] text-[#91cf5b]' : 'text-gray-500 hover:text-gray-700'}`}>
          Historial de Movimientos
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {cargando ? (
           <div className="p-8 text-center text-gray-500 font-medium">Cargando...</div>
        ) : tabActiva === 'registro' ? (
          <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
            
            {/* Columna Izquierda: Buscador y Formulario Global */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              {/* 1. Selector Ingreso / Retiro — siempre primero */}
              <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 p-6 rounded-lg shadow-sm">
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button type="button" onClick={() => setFormularioGlobal({ ...formularioGlobal, tipo: 'INGRESO' })} className={`flex-1 py-2 font-bold rounded-md transition ${formularioGlobal.tipo === 'INGRESO' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Ingreso (+)</button>
                  <button type="button" onClick={() => setFormularioGlobal({ ...formularioGlobal, tipo: 'RETIRO' })} className={`flex-1 py-2 font-bold rounded-md transition ${formularioGlobal.tipo === 'RETIRO' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Retiro (-)</button>
                </div>
              </div>

              {/* 2. Buscador — siempre segundo, dropdown flota sobre el resto */}
              <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 p-6 rounded-lg shadow-sm relative z-10">
                <label className="block text-sm font-bold text-gray-700 mb-2">Buscar Producto</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#91cf5b]"
                    placeholder="Nombre, SKU o Cód. de barras..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                  {(resultadosBusqueda.length > 0 || (busqueda.trim() && resultadosBusqueda.length === 0)) && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                      {resultadosBusqueda.map(prod => (
                        <li key={prod.id} onClick={() => agregarProducto(prod)} className="px-4 py-2 hover:bg-[#91cf5b] hover:text-white cursor-pointer transition-colors group">
                          <p className="text-sm font-bold">{prod.nombre}</p>
                          <div className="flex justify-between mt-0.5">
                            <p className="text-xs font-mono opacity-70">{prod.sku}</p>
                            <p className="text-xs font-semibold group-hover:text-white text-blue-600 shrink-0 ml-2">Stock: {prod.tipo_venta === 'UNIDAD' ? Math.round(prod.stock) : Number(prod.stock).toFixed(2)}</p>
                          </div>
                        </li>
                      ))}
                      {busqueda.trim() && resultadosBusqueda.length === 0 && <li className="px-4 py-3 text-center text-sm text-gray-500">No hay coincidencias.</li>}
                    </ul>
                  )}
                </div>
              </div>

              {/* 3. Formulario de motivo/descripción — solo en RETIRO */}
              {formularioGlobal.tipo === 'RETIRO' && (
                <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 p-6 rounded-lg shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del Retiro</label>
                      <select required value={formularioGlobal.motivo} onChange={(e) => setFormularioGlobal({...formularioGlobal, motivo: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 bg-white">
                        <option value="MERMA">Merma</option><option value="DANADO">Dañado</option>
                        <option value="CFECHA">Cambio por caducado</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción {formularioGlobal.motivo === 'OTRO' && <span className="text-red-500 font-black">*</span>}
                      </label>
                      <input type="text" maxLength="100" value={formularioGlobal.descripcion} onChange={(e) => setFormularioGlobal({...formularioGlobal, descripcion: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500" placeholder="Ej: Retiro por donación..." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Lista de Productos a Mover (Carrito) */}
            <div className="w-full md:w-2/3 bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-white/40 flex justify-between items-center">
                 <h3 className="font-bold text-gray-800 text-lg">Productos a Procesar ({seleccionados.length})</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                 {seleccionados.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400 font-medium text-center">
                       Busca y selecciona productos a la izquierda<br/>para agregarlos a esta lista.
                    </div>
                 )}
                 {seleccionados.map(item => (
                    <div key={item.producto.id} className="flex items-center gap-4 bg-white p-3 rounded border border-gray-200 shadow-sm">
                       <div className="flex-1">
                          <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.producto.nombre}</p>
                          <p className="text-xs text-gray-500">Stock actual: {item.producto.tipo_venta === 'UNIDAD' ? Math.round(item.producto.stock) : Number(item.producto.stock).toFixed(2)}</p>
                       </div>
                       <div className="w-32">
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Cantidad a mover</label>
                          <input type="number" min={item.producto.tipo_venta === 'UNIDAD' ? "1" : "0.001"} step={item.producto.tipo_venta === 'UNIDAD' ? '1' : 'any'} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#91cf5b] font-bold" placeholder="0" value={item.cantidad} onChange={(e) => actualizarCantidad(item.producto.id, e.target.value)} />
                       </div>
                       <button onClick={() => removerProducto(item.producto.id)} className="text-red-400 hover:text-red-600 p-2" title="Quitar">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                    </div>
                 ))}
              </div>
              <div className="p-4 border-t border-gray-200 bg-white/60">
                 <button onClick={guardarMovimiento} disabled={seleccionados.length === 0 || procesando} className={`w-full py-3 text-white rounded font-bold transition shadow-md ${formularioGlobal.tipo === 'INGRESO' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    {procesando ? 'Procesando...' : 'Registrar Movimientos'}
                 </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 rounded-lg shadow-md flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white/60 sticky top-0 shadow-sm backdrop-blur-md">
                  <tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th><th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th><th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Detalles</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movimientos.map(mov => (<tr key={mov.id} className="hover:bg-white/40 transition-colors"><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{mov.fecha}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{mov.usuario}</td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-gray-900">{mov.producto_nombre}</div><div className="text-xs text-gray-500 font-mono">{mov.producto_sku}</div></td><td className="px-6 py-4 whitespace-nowrap text-center"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${mov.tipo === 'INGRESO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{mov.tipo}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-700">{mov.tipo === 'INGRESO' ? '+' : '-'}{mov.producto_tipo_venta === 'UNIDAD' ? Math.round(mov.cantidad) : Number(mov.cantidad).toFixed(2)}</td><td className="px-6 py-4 text-sm text-gray-600">{mov.tipo === 'RETIRO' && (<><span className="font-semibold text-gray-800">{mov.motivo}</span>{mov.descripcion && <span className="block text-xs mt-0.5 text-gray-500 truncate max-w-xs" title={mov.descripcion}>{mov.descripcion}</span>}</>)}</td></tr>))}
                  {movimientos.length === 0 && (<tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">No hay movimientos registrados.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}