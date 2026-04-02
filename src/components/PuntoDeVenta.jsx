import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function PuntoDeVenta() {
  const [catalogo, setCatalogo] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [ultimoAgregado, setUltimoAgregado] = useState(null);
  
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

    // Auto-recargar el catálogo sin intervención del usuario cuando el internet vuelve y finaliza la sincronización
    const onSincronizacion = () => cargarProductos();
    window.addEventListener('ventasSincronizadas', onSincronizacion);
    return () => window.removeEventListener('ventasSincronizadas', onSincronizacion);
  }, []);

  // Capturar tipeo global para enfocar automáticamente el buscador
  useEffect(() => {
    const manejarTipeoGlobal = (e) => {
      // Si el modal de cobro está abierto, no intervenimos
      if (modalAbierto) return;

      // Atajo F2: Limpiar y enfocar buscador
      if (e.key === 'F2') {
        e.preventDefault();
        setTerminoBusqueda('');
        inputBusquedaRef.current?.focus();
        return;
      }

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
    // Se le agrega un timestamp para forzar que la animación se repita incluso si escaneas el mismo producto
    setUltimoAgregado({ ...producto, timestamp: Date.now() });
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
    setUltimoAgregado(null);
    inputBusquedaRef.current?.focus();
  };

  const total = Math.round(carrito.reduce((acc, item) => acc + (item.precio * (Number(item.cantidad) || 0)), 0));
  const totalRedondeado = metodoPago === 'EFECTIVO' ? Math.round(total / 10) * 10 : total;
  const vuelto = (parseFloat(efectivoRecibido) || 0) - totalRedondeado;

  const procesarVenta = async () => {
    if (carrito.length === 0) return;
    setProcesando(true);

    const payloadVenta = {
      // ID único temporal por si la venta se queda en memoria
      offline_id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
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
      const payloadAEnviar = { ...payloadVenta };
      delete payloadAEnviar.offline_id; // Limpiamos para el backend
      await api.post('inventario/ventas/', payloadAEnviar);
      mostrarNotificacion('Venta registrada exitosamente', 'success');
      setCarrito([]);
      setUltimoAgregado(null);
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
        
        // Descontar el stock de manera "optimista" del catálogo en memoria
        const nuevoCatalogo = catalogo.map(prod => {
          const itemVendido = carrito.find(c => c.id === prod.id);
          if (itemVendido) {
            return { ...prod, stock: prod.stock - itemVendido.cantidad };
          }
          return prod;
        });
        setCatalogo(nuevoCatalogo);
        localStorage.setItem('catalogo_offline', JSON.stringify(nuevoCatalogo));

        mostrarNotificacion('Sin conexión: Venta guardada para sincronizar luego', 'warning');
        setCarrito([]);
        setUltimoAgregado(null);
        setModalAbierto(false);
        setEfectivoRecibido('');
        setMetodoPago('EFECTIVO');
      } else {
        // Leemos el error exacto enviado por el backend
        const errorData = error.response?.data;
        console.error("❌ Detalle del error del backend:", errorData);
        
        let msgError = "Error al registrar la venta";
        if (errorData) {
          if (typeof errorData === 'object' && !errorData.error) {
             msgError = "Error de validación (Revisa la consola)";
          } else if (errorData.error) {
             msgError = errorData.error;
          }
        }
        mostrarNotificacion(msgError, 'error');
      }
    } finally {
      setProcesando(false);
      inputBusquedaRef.current?.focus();
    }
  };

  return (
    // CONTENEDORES ESTRICTOS: h-full y overflow-hidden previenen que el botón se esconda
    <div className="flex h-full w-full max-w-[1400px] mx-auto bg-[var(--color-fondo)] font-sans relative overflow-hidden transition-colors duration-500 p-2 sm:p-4 gap-2 sm:gap-4 flex-row">
      
      {/* Notificación Toast */}
      {notificacion.visible && (
        <div className={`absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-2xl font-bold transition-all flex items-center gap-2 sm:gap-3 ${notificacion.tipo === 'success' ? 'bg-green-600 text-white' : notificacion.tipo === 'warning' ? 'bg-yellow-500 text-gray-900' : 'bg-red-600 text-white'}`}>
          {notificacion.tipo === 'success' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
          {notificacion.tipo === 'warning' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
          {notificacion.tipo === 'error' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>}
          <span className="whitespace-nowrap">{notificacion.mensaje}</span>
        </div>
      )}

      {/* Panel Izquierdo */}
      <div className="w-7/12 flex flex-col h-full overflow-hidden">
        <div className="mb-2 sm:mb-4 flex-none relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            ref={inputBusquedaRef}
            type="text"
            className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 shadow-sm p-3 sm:p-4 pl-9 sm:pl-12 text-xs sm:text-base rounded-xl sm:rounded-2xl h-12 sm:h-16 focus:outline-none focus:ring-[#91cf5b] focus:border-[#91cf5b] transition-all"
            placeholder="Buscar..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2 pb-2 sm:pb-4 custom-scrollbar">
          {resultadosBusqueda.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
              {resultadosBusqueda.map(prod => (
                <button
                  key={prod.id}
                  onClick={() => agregarAlCarrito(prod)}
                  className="bg-[var(--color-tarjeta)] backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border border-white/60 text-left h-28 sm:h-36 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:border-[#91cf5b]/50 active:scale-95 transition-all group"
                >
                  <div>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-mono block truncate">{prod.sku}</span>
                    <span className="font-bold text-xs sm:text-base text-gray-800 line-clamp-2 leading-tight mt-0.5 sm:mt-1">{prod.nombre}</span>
                  </div>
                  <div className="flex justify-between items-end mt-1 sm:mt-2">
                    <span className="text-[#91cf5b] font-black text-sm sm:text-lg">${prod.precio}</span>
                    <span className="text-[9px] sm:text-xs bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md font-semibold whitespace-nowrap">
                      Stk: {prod.tipo_venta === 'UNIDAD' ? Math.round(prod.stock) : Number(prod.stock).toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : ultimoAgregado ? (
            <div className="h-full flex items-center justify-center pb-[5%] px-2">
              <style>{`
                @keyframes fadeInCard {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              <div key={ultimoAgregado.timestamp} className="bg-white/80 backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/60 w-full max-w-lg flex flex-col" style={{ animation: 'fadeInCard 0.4s ease-out forwards' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="text-left">
                    <p className="text-[10px] sm:text-xs text-green-600 font-bold uppercase tracking-wider">Agregado</p>
                    <h3 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 line-clamp-2">{ultimoAgregado.nombre}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 font-mono">{ultimoAgregado.sku}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-3xl sm:text-5xl font-black text-[#91cf5b]">${ultimoAgregado.precio}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center pb-[5%]">
              <svg className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <h3 className="text-sm sm:text-xl font-bold text-gray-500">Esperando productos</h3>
              <p className="text-xs sm:text-sm mt-1 hidden sm:block">Usa el escáner o el buscador para empezar a vender.</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="w-5/12 bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl flex flex-col shadow-2xl h-full overflow-hidden">
        <div className="pt-2 pl-3 flex-none flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-2">
          <h2 className="text-sm sm:text-2xl font-bold text-gray-800 truncate">Venta Actual</h2>
          {carrito.length > 0 && (
            <button onClick={vaciarCarrito} title="Vaciar todo el carrito" className="text-[10px] sm:text-xs text-red-500 hover:bg-red-100 hover:text-red-600 font-bold flex items-center transition-colors p-1 sm:p-2 rounded-lg self-end sm:self-auto">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Vaciar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 sm:px-6 space-y-2 sm:space-y-3 custom-scrollbar">
          {carrito.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-gray-500">
              <p className="font-medium text-xs sm:text-base">El carrito está vacío.</p>
            </div>
          )}
          {carrito.map(item => (
            <div key={item.id} className="flex flex-col xl:flex-row xl:items-center p-2 sm:p-3 bg-white/60 rounded-lg sm:rounded-xl shadow-sm border border-white/80 gap-2 sm:gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-xs sm:text-sm text-gray-800 line-clamp-2 sm:line-clamp-1 leading-tight">{item.nombre}</h3>
                <p className="text-[9px] sm:text-xs text-gray-500 font-medium mt-0.5">${item.precio} {item.tipo_venta === 'GRANEL' ? '/ Kg' : 'c/u'}</p>
              </div>
              
              <div className="flex items-center justify-between xl:justify-end w-full xl:w-auto gap-2">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button onClick={() => actualizarCantidadBotones(item.id, item.tipo_venta === 'GRANEL' ? -0.1 : -1, item.tipo_venta)} className="bg-gray-200 w-6 h-6 sm:w-7 sm:h-7 rounded-md text-gray-700 font-bold hover:bg-gray-300 transition-colors flex items-center justify-center leading-none">-</button>
                  <input 
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidadDirecta(item.id, e.target.value)}
                    onBlur={() => validarCantidad(item.id, item.tipo_venta)}
                    step={item.tipo_venta === 'GRANEL' ? '0.001' : '1'}
                    min="0"
                    className="w-12 sm:w-16 text-center border-0 shadow-inner bg-white/80 text-xs sm:text-sm font-bold border rounded-md py-1 px-0 sm:px-1 focus:outline-none focus:ring-1 focus:ring-[#91cf5b]"
                  />
                  <button onClick={() => actualizarCantidadBotones(item.id, item.tipo_venta === 'GRANEL' ? 0.1 : 1, item.tipo_venta)} className="bg-gray-200 w-6 h-6 sm:w-7 sm:h-7 rounded-md text-gray-700 font-bold hover:bg-gray-300 transition-colors flex items-center justify-center leading-none">+</button>
                </div>

                <div className="text-right w-16 sm:w-20 flex items-center justify-end gap-1 sm:gap-2">
                  <div className="font-black text-gray-800 text-xs sm:text-base truncate">${Math.round(item.precio * (Number(item.cantidad) || 0))}</div>
                  <button onClick={() => eliminarDelCarrito(item.id)} className="text-gray-400 hover:text-red-500 p-1" title="Quitar del carrito">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENEDOR FLEX-NONE para garantizar que el botón Cobrar NUNCA se esconda */}
        <div className="p-3 sm:p-6 bg-white/60 border-t border-white/80 flex-none">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <span className="text-sm sm:text-lg text-gray-600 font-semibold">Total</span>
            <span className="text-xl sm:text-4xl font-black text-gray-900 truncate" title={`$${total}`}>${total}</span>
          </div>
          <button 
            onClick={() => setModalAbierto(true)}
            disabled={carrito.length === 0}
            className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-xl transition-all shadow-md sm:shadow-lg ${carrito.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#91cf5b] hover:bg-[#7ab848] hover:shadow-xl active:scale-95'}`}
          >
            COBRAR
          </button>
        </div>
      </div>

      {/* Modal de Pago */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--color-fondo)] border border-white/50 rounded-2xl sm:rounded-3xl m-5 p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex-none">Procesar Pago</h2>
            <div className="text-center mb-4 bg-white/60 p-3 rounded-xl shadow-inner border border-white/60 flex-none">
              <p className="text-gray-500 font-medium uppercase text-xs tracking-wider">Monto Total</p>
              <p className="text-3xl font-black text-gray-900 mt-1">${totalRedondeado}</p>
              {metodoPago === 'EFECTIVO' && total !== totalRedondeado && (
                <p className="text-[10px] sm:text-sm text-gray-500 mt-2 font-medium">Monto original: ${total} (Redondeado)</p>
              )}
            </div>

            {/* Ajuste de texto para evitar desbordamientos en TRANSFERENCIA */}
            <div className="grid grid-cols-2  gap-2 sm:gap-3 mb-4 flex-none">
              {['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'ANOTADO'].map(m => (
                <button
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`p-2 text-[10px] sm:text-sm font-bold rounded-lg sm:rounded-xl border-2 flex items-center justify-center text-center transition-all duration-200 ${metodoPago === m ? 'border-[#91cf5b] bg-white text-[#7ab848] shadow-md sm:shadow-lg scale-105' : 'border-gray-200/80 bg-white/60 text-gray-600 hover:bg-white hover:border-gray-300'}`}
                >
                  {m === 'TRANSFERENCIA' ? <span className="hidden sm:inline">TRANSFERENCIA</span> : m}{m === 'TRANSFERENCIA' && <span className="sm:hidden">TRANSF.</span>}
                </button>
              ))}
            </div>

            {metodoPago === 'EFECTIVO' && (
              <div className="mb-4 bg-white/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/60 flex-none">
                <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 font-semibold">Efectivo Recibido:</label>
                <input
                  type="number"
                  autoFocus
                  className="w-full p-2 sm:p-3 border border-gray-300/80 bg-white/80 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#91cf5b] text-lg sm:text-2xl font-bold text-gray-800"
                  value={efectivoRecibido}
                  onChange={(e) => setEfectivoRecibido(e.target.value)}
                />
                <div className={`mt-3 sm:mt-4 text-base sm:text-2xl font-bold flex justify-between ${vuelto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>Vuelto:</span> 
                  <span>${vuelto >= 0 ? vuelto : 0}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-3 sm:space-x-4 mt-auto pt-2 flex-none">
              <button onClick={() => setModalAbierto(false)} className="flex-1  py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-sm sm:text-base text-gray-700 transition">Cancelar</button>
              <button 
                onClick={procesarVenta}
                disabled={procesando || (metodoPago === 'EFECTIVO' && vuelto < 0)}
                className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl font-bold py-3 text-sm sm:text-base text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {procesando ? 'Procesando...' : 'Confirmar Venta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}