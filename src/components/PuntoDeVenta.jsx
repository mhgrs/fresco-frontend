import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function PuntoDeVenta() {
  const [catalogo, setCatalogo] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [efectivoRecibido, setEfectivoRecibido] = useState('');
  const [procesando, setProcesando] = useState(false);
  
  // Notificaciones In-App
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });

  const inputBusquedaRef = useRef(null);

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ visible: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: '' }), 3000);
  };

  const cargarProductos = async () => {
    try {
      const respuesta = await api.get('inventario/productos/');
      const activos = respuesta.data.filter(producto => producto.esta_activo === true);
      setCatalogo(activos);
      localStorage.setItem('catalogo_offline', JSON.stringify(activos));
    } catch (error) {
      const cache = localStorage.getItem('catalogo_offline');
      if (cache) {
        setCatalogo(JSON.parse(cache));
        mostrarNotificacion('Sin conexión. Usando catálogo local.', 'warning');
      } else {
        mostrarNotificacion('Error conectando al servidor y no hay caché local', 'error');
      }
    }
  };

  useEffect(() => {
    cargarProductos();
    inputBusquedaRef.current?.focus();
  }, []);

  // Capturar tipeo global para enfocar automáticamente el buscador
  useEffect(() => {
    const manejarTipeoGlobal = (e) => {
      // Si el modal de cobro está abierto, no intervenimos
      if (modalAbierto) return;
      // Si el usuario ya está escribiendo en otro input (ej. cantidad en carrito)
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      // Si es una tecla normal (letra, número, símbolo) y no un atajo de teclado
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        inputBusquedaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', manejarTipeoGlobal);
    return () => window.removeEventListener('keydown', manejarTipeoGlobal);
  }, [modalAbierto]);

  useEffect(() => {
    if (!terminoBusqueda.trim()) {
      setResultadosBusqueda([]);
      return;
    }
    const termino = terminoBusqueda.toLowerCase();
    const coincidenciaExacta = catalogo.find(
      p => p.codigo_barras === termino || p.sku.toLowerCase() === termino
    );

    if (coincidenciaExacta && termino.length >= 6) {
      agregarAlCarrito(coincidenciaExacta);
      setTerminoBusqueda('');
      return;
    }

    const resultados = catalogo.filter(
      p => p.nombre.toLowerCase().includes(termino) || p.sku.toLowerCase().includes(termino)
    );
    setResultadosBusqueda(resultados);
  }, [terminoBusqueda, catalogo]);

  const agregarAlCarrito = (producto) => {
    setCarrito(actual => {
      const existe = actual.find(item => item.id === producto.id);
      if (existe) {
        return actual.map(item =>
          item.id === producto.id ? { ...item, cantidad: Number(item.cantidad) + 1 } : item,
        );
      }
      return [...actual, { ...producto, cantidad: 1 }];
    });
    setTerminoBusqueda('');
    inputBusquedaRef.current?.focus();
  };

  // Manejo directo de input editable en carrito
  const cambiarCantidadDirecta = (id, valor) => {
    setCarrito(actual => actual.map(item => 
      item.id === id ? { ...item, cantidad: valor } : item
    ));
  };

  // Validación estricta al perder el foco (onBlur)
  const validarCantidad = (id, tipoVenta) => {
    setCarrito(actual => actual.map(item => {
      if (item.id === id) {
        let val = parseFloat(item.cantidad);
        if (isNaN(val) || val <= 0) val = 1;

        if (tipoVenta === 'GRANEL') {
           val = Number(val.toFixed(3)); // 3 decimales requeridos para granel
        } else {
           val = Math.round(val); // Enteros para unidad sin decimales
        }
        // Asegurar que el valor no sea 0 o negativo después de la corrección
        if (val <= 0) val = 1;
        return { ...item, cantidad: val };
      }
      return item;
    }));
  };

  const actualizarCantidadBotones = (id, delta, tipoVenta) => {
    setCarrito(actual => actual.map(item => {
      if (item.id === id) {
        let nueva = Number(item.cantidad) + delta;

        if (tipoVenta === 'GRANEL') nueva = Number(nueva.toFixed(3));
        else nueva = Math.round(nueva);
        
        if (nueva <= 0) return item;
        return { ...item, cantidad: nueva };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id) => setCarrito(actual => actual.filter(item => item.id !== id));

  const vaciarCarrito = () => {
    setCarrito([]);
    inputBusquedaRef.current?.focus();
  };

  const total = Math.round(carrito.reduce((acc, item) => acc + (item.precio * (Number(item.cantidad) || 0)), 0));
  const totalRedondeado = metodoPago === 'EFECTIVO' ? Math.round(total / 10) * 10 : total;
  const vuelto = (parseFloat(efectivoRecibido) || 0) - totalRedondeado;

  const procesarVenta = async () => {
    if (carrito.length === 0) return;
    setProcesando(true);

    const payloadVenta = {
      total: totalRedondeado,
      metodo_pago: metodoPago,
      detalles: carrito.map(item => ({
        producto: item.id,
        cantidad: Number(item.cantidad) || 1,
        precio_unitario: item.precio,
        subtotal: Math.round(item.precio * (Number(item.cantidad) || 1))
      }))
    };

    try {
      await api.post('inventario/ventas/', payloadVenta);
      mostrarNotificacion('Venta registrada exitosamente', 'success');
      setCarrito([]);
      setModalAbierto(false);
      setEfectivoRecibido('');
      setMetodoPago('EFECTIVO');
      cargarProductos(); // Recargar stock real
    } catch (error) {
      // Si el error es de red o no hay conexión explícita
      if (!error.response || !navigator.onLine) {
        const ventasOffline = JSON.parse(localStorage.getItem('ventas_offline')) || [];
        ventasOffline.push(payloadVenta);
        localStorage.setItem('ventas_offline', JSON.stringify(ventasOffline));
        mostrarNotificacion('Sin conexión: Venta guardada para sincronizar luego', 'warning');
        setCarrito([]);
        setModalAbierto(false);
        setEfectivoRecibido('');
        setMetodoPago('EFECTIVO');
      } else {
        mostrarNotificacion('Error al registrar la venta', 'error');
      }
    } finally {
      setProcesando(false);
      inputBusquedaRef.current?.focus();
    }
  };

  return (
    // CONTENEDORES ESTRICTOS: h-full y overflow-hidden previenen que el botón se esconda
    <div className="flex h-full w-full bg-gray-100 font-sans relative overflow-hidden">
      
      {/* Notificación Toast */}
      {notificacion.visible && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      {/* Panel Izquierdo */}
      <div className="w-2/3 p-4 flex flex-col h-full overflow-hidden">
        <div className="mb-4 flex-none">
          <input
            ref={inputBusquedaRef}
            type="text"
            className="w-full p-4 text-lg border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Escanee código de barras o busque por nombre/SKU..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          {resultadosBusqueda.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {resultadosBusqueda.map(prod => (
                <button
                  key={prod.id}
                  onClick={() => agregarAlCarrito(prod)}
                  className="bg-white p-4 rounded-xl shadow border border-gray-200 text-left h-32 flex flex-col justify-between active:scale-95 transition-transform"
                >
                  <div>
                    <span className="text-xs text-gray-400 block">{prod.sku}</span>
                    <span className="font-semibold text-gray-800 line-clamp-2">{prod.nombre}</span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-blue-600 font-bold">${prod.precio}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Stock: {prod.tipo_venta === 'UNIDAD' ? Math.round(prod.stock) : Number(prod.stock).toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">Esperando escaneo o búsqueda...</div>
          )}
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col shadow-lg h-full overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex-none flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-700">Carrito</h2>
          {carrito.length > 0 && (
            <button onClick={vaciarCarrito} title="Vaciar todo el carrito" className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Vaciar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {carrito.map(item => (
            <div key={item.id} className="flex flex-col xl:flex-row justify-between xl:items-center p-3 border border-gray-100 rounded-lg shadow-sm gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm line-clamp-1">{item.nombre}</h3>
                <div className="text-xs text-gray-500">${item.precio} {item.tipo_venta === 'GRANEL' ? '/ Kg' : 'c/u'}</div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button onClick={() => actualizarCantidadBotones(item.id, item.tipo_venta === 'GRANEL' ? -0.1 : -1, item.tipo_venta)} className="bg-gray-200 w-8 h-8 rounded text-gray-700 font-bold hover:bg-gray-300">-</button>
                <input 
                  type="number"
                  value={item.cantidad}
                  onChange={(e) => cambiarCantidadDirecta(item.id, e.target.value)}
                  onBlur={() => validarCantidad(item.id, item.tipo_venta)}
                  step={item.tipo_venta === 'GRANEL' ? '0.001' : '1'}
                  min="0"
                  className="w-16 text-center text-sm font-medium border rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button onClick={() => actualizarCantidadBotones(item.id, item.tipo_venta === 'GRANEL' ? 0.1 : 1, item.tipo_venta)} className="bg-gray-200 w-8 h-8 rounded text-gray-700 font-bold hover:bg-gray-300">+</button>
              </div>

              <div className="text-right xl:w-20 flex flex-col items-end">
                <div className="font-bold text-gray-800">${Math.round(item.precio * (Number(item.cantidad) || 0))}</div>
                <button onClick={() => eliminarDelCarrito(item.id)} className="text-xs text-red-500 hover:text-red-700 mt-1 font-semibold">Quitar</button>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENEDOR FLEX-NONE para garantizar que el botón Cobrar NUNCA se esconda */}
        <div className="p-6 bg-gray-50 border-t flex-none">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg text-gray-600 font-semibold">Total</span>
            <span className="text-3xl font-black text-gray-900">${total}</span>
          </div>
          <button 
            onClick={() => setModalAbierto(true)}
            disabled={carrito.length === 0}
            className={`w-full py-4 rounded-xl text-white font-bold text-xl transition-all shadow-md ${carrito.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'}`}
          >
            COBRAR
          </button>
        </div>
      </div>

      {/* Modal de Pago */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 lg:p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Procesar Pago</h2>
            <div className="text-center mb-6">
              <p className="text-gray-500 font-medium">Monto Total</p>
              <p className="text-4xl font-black text-gray-800">${total}</p>
            </div>

            {/* Ajuste de texto para evitar desbordamientos en TRANSFERENCIA */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].map(m => (
                <button
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`p-2 text-xs lg:text-sm font-bold rounded-lg border-2 break-words flex items-center justify-center text-center transition-colors ${metodoPago === m ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {m === 'TRANSFERENCIA' ? 'TRANSF.' : m}
                </button>
              ))}
            </div>

            {metodoPago === 'EFECTIVO' && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm text-gray-600 mb-2 font-semibold">Efectivo Recibido:</label>
                <input
                  type="number"
                  autoFocus
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xl font-bold text-gray-800"
                  value={efectivoRecibido}
                  onChange={(e) => setEfectivoRecibido(e.target.value)}
                />
                <div className={`mt-3 text-lg font-bold flex justify-between ${vuelto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>Vuelto:</span> 
                  <span>${vuelto >= 0 ? vuelto : 0}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setModalAbierto(false)} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700 transition">Cancelar</button>
              <button 
                onClick={procesarVenta}
                disabled={procesando || (metodoPago === 'EFECTIVO' && vuelto < 0)}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-white transition disabled:opacity-50"
              >
                {procesando ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}