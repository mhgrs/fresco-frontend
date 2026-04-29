import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificacion } from '../hooks/useNotificacion';
import { useCarrito } from '../hooks/useCarrito';
import { useProductSearch } from '../hooks/useProductSearch';
import CartItem from './pos/CartItem';
import PaymentModal from './pos/PaymentModal';
import { productosService } from '../services/productos';
import { ventasService } from '../services/ventas';
import TicketImpresion from './pos/TicketImpresion';
import NetworkStatusIndicator from './ui/NetworkStatusIndicator';

export default function PuntoDeVenta({ usuario }) {
  const navigate = useNavigate();
  const [catalogo, setCatalogo] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalSuspendidasAbierto, setModalSuspendidasAbierto] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [ticketVenta, setTicketVenta] = useState(null);
  const { notificacion, mostrar } = useNotificacion();
  // 'verificando' | 'abierto' | 'cerrado'
  const [estadoCaja, setEstadoCaja] = useState('verificando');

  const {
    carrito,
    ultimoAgregado,
    agregar,
    cambiarCantidad,
    validarCantidad,
    actualizarCantidadBotones,
    quitarItem,
    vaciar,
    totalCarrito,
    ventasSuspendidas,
    suspenderVenta,
    retomarVenta,
    eliminarSuspendida
  } = useCarrito(usuario?.id);

  const { termino, setTermino, resultados, inputRef } = useProductSearch(catalogo, agregar);

  const cargarProductos = useCallback(async () => {
    try {
      const respuesta = await productosService.listar();
      const activos = respuesta.data.filter(p => p.esta_activo === true);
      setCatalogo(activos);
      localStorage.setItem('catalogo_offline', JSON.stringify(activos));
    } catch {
      const cache = localStorage.getItem('catalogo_offline');
      if (cache) {
        setCatalogo(JSON.parse(cache));
        mostrar('Sin conexión. Usando catálogo local.', 'warning');
      } else {
        mostrar('Error conectando al servidor y no hay caché local', 'error');
      }
    }
  }, [mostrar]);

  const tieneCierreCaja = usuario?.plan?.tiene_cierre_caja;

  useEffect(() => {
    // Plan Gratis: no requiere turno abierto, el POS funciona directamente
    if (!tieneCierreCaja) {
      setEstadoCaja('abierto');
      return;
    }
    ventasService.turnoActivo()
      .then(() => setEstadoCaja('abierto'))
      .catch(() => setEstadoCaja('cerrado'));
  }, [tieneCierreCaja]);

  // Enfocar el buscador solo al montar el componente
  useEffect(() => {
    inputRef.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    cargarProductos();
    const onSincronizacion = () => cargarProductos();
    window.addEventListener('ventasSincronizadas', onSincronizacion);
    return () => window.removeEventListener('ventasSincronizadas', onSincronizacion);
  }, [cargarProductos]);

  // Reiniciar la selección del teclado cuando cambian los resultados
  useEffect(() => {
    setSelectedIndex(-1);
  }, [resultados]);

  const handleAgregar = useCallback((prod) => {
    agregar(prod);
    setTermino('');
    inputRef.current?.focus();
  }, [agregar, setTermino, inputRef]);

  // Atajos de Teclado del Punto de Venta (Mejora 3)
  useEffect(() => {
    const manejarAtajos = (e) => {
      if (estadoCaja !== 'abierto') return; // Bloquear atajos si no hay turno activo

      // Permitir que Escape cierre modales
      if (modalAbierto) {
        if (e.key === 'Escape') setModalAbierto(false);
        return;
      }
      if (modalSuspendidasAbierto) {
        if (e.key === 'Escape') setModalSuspendidasAbierto(false);
        return;
      }

      // F2 o Ctrl+B para enfocar el buscador y limpiarlo
      if (e.key === 'F2' || (e.ctrlKey && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        setTermino('');
        inputRef.current?.focus();
        return;
      }

      // F12 para abrir modal de pago directo
      if (e.key === 'F12') {
        e.preventDefault();
        if (carrito.length > 0) setModalAbierto(true);
        return;
      }

      // Escape limpia el buscador si está abierto
      if (e.key === 'Escape') {
        setTermino('');
        inputRef.current?.focus();
        return;
      }

      // Flechas para navegar por la grilla de productos
      if (resultados.length > 0) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          setSelectedIndex(prev => (prev < resultados.length - 1 ? prev + 1 : prev));
          return;
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
          return;
        }
      }

      // Enter ejecuta acciones contextuales
      if (e.key === 'Enter') {
        if (resultados.length > 0 && selectedIndex >= 0) {
          e.preventDefault();
          handleAgregar(resultados[selectedIndex]);
          return;
        }
        // Auto-agregar si solo hay un resultado (ideal para escáner físico de código de barras)
        if (resultados.length === 1) {
          e.preventDefault();
          handleAgregar(resultados[0]);
          return;
        }
        // Si el buscador está vacío y hay carrito, abre el pago
        if (!termino.trim() && carrito.length > 0) {
          e.preventDefault();
          setModalAbierto(true);
          return;
        }
      }

      // Auto-focus al escribir cualquier letra/número si no está enfocado ya
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', manejarAtajos);
    return () => window.removeEventListener('keydown', manejarAtajos);
  }, [estadoCaja, modalAbierto, modalSuspendidasAbierto, termino, carrito.length, resultados, selectedIndex, handleAgregar, setTermino, inputRef]);

  const handleVaciar = () => {
    vaciar();
    inputRef.current?.focus();
  };

  const handleSuspender = () => {
    if (suspenderVenta()) {
      mostrar('Venta pausada temporalmente', 'warning');
      inputRef.current?.focus();
    } else {
      mostrar('Límite de 3 ventas en espera alcanzado', 'error');
    }
  };

  const handleRetomar = (id) => {
    if (carrito.length > 0) {
      if (!window.confirm('Tienes productos en la venta actual. ¿Deseas reemplazarlos? (Se perderán si no los pausas primero)')) return;
    }
    retomarVenta(id);
    setModalSuspendidasAbierto(false);
    mostrar('Venta restaurada exitosamente', 'success');
    inputRef.current?.focus();
  };

  const procesarVenta = async (metodoPago, totalRedondeado, imprimirTicket = true) => {
    if (carrito.length === 0) return;

    const payloadVenta = {
      offline_id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      total: totalRedondeado,
      metodo_pago: metodoPago,
      detalles: carrito.map(item => ({
        producto: item.id,
        cantidad: Number(item.cantidad) || 1,
        precio_unitario: item.precio,
        subtotal: Math.round(item.precio * (Number(item.cantidad) || 1)),
      })),
    };

    // ACTUALIZACIÓN OPTIMISTA (Fondo Inmediato)
    // 1. Descontar el stock localmente para que el cajero vea el catálogo actualizado al instante
    const snapshotCatalogo = [...catalogo];
    const nuevoCatalogo = catalogo.map(prod => {
      const itemVendido = carrito.find(c => c.id === prod.id);
      if (itemVendido) return { ...prod, stock: prod.stock - itemVendido.cantidad };
      return prod;
    });
    setCatalogo(nuevoCatalogo);
    localStorage.setItem('catalogo_offline', JSON.stringify(nuevoCatalogo));

    // 2. Preparar el ticket de impresión
    const ticketData = {
      ...payloadVenta,
      fecha: new Date().toLocaleString('es-CL'),
      detalles: carrito.map(item => ({
        nombre: item.nombre,
        cantidad: Number(item.cantidad) || 1,
        precio_unitario: item.precio,
        subtotal: Math.round(item.precio * (Number(item.cantidad) || 1)),
      }))
    };
    setTicketVenta(ticketData);

    // 3. Limpiar UI instantáneamente sin esperar al servidor
    vaciar();
    setModalAbierto(false);
    mostrar('Venta procesada exitosamente', 'success');
    inputRef.current?.focus();

    // Disparar impresión del ticket térmico
    if (imprimirTicket) {
      setTimeout(() => {
        window.print();
      }, 150);
    }

    try {
      const payloadAEnviar = { ...payloadVenta };
      delete payloadAEnviar.offline_id;
      // 3. Petición en segundo plano (Fire and Forget)
      await ventasService.crear(payloadAEnviar);
    } catch (error) {
      if (!error.response || !navigator.onLine) {
        const ventasOffline = JSON.parse(localStorage.getItem('ventas_offline')) || [];
        ventasOffline.push(payloadVenta);
        localStorage.setItem('ventas_offline', JSON.stringify(ventasOffline));
        window.dispatchEvent(new Event('ventas_offline_updated'));

        mostrar('Sin conexión: Venta guardada para sincronizar luego', 'warning');
      } else {
        // Error del servidor: revertir actualización optimista de stock
        setCatalogo(snapshotCatalogo);
        localStorage.setItem('catalogo_offline', JSON.stringify(snapshotCatalogo));
        const errorData = error.response?.data;
        console.error('❌ Detalle del error del backend:', errorData);
        let msgError = 'Error al registrar la venta';
        if (errorData) {
          if (typeof errorData === 'object' && !errorData.error) {
            msgError = 'Error de validación (Revisa la consola)';
          } else if (errorData.error) {
            msgError = errorData.error;
          }
        }
        mostrar(msgError, 'error');
      }
    }
  };

  return (
    <>
    <div className="flex h-full w-full max-w-[1400px] mx-auto bg-[var(--color-fondo)] font-sans relative overflow-hidden transition-colors duration-500 p-2 sm:p-4 gap-2 sm:gap-4 flex-row">

      {/* Notificación Toast */}
      {notificacion.visible && (
        <div className={`fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-[100] px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-2xl font-bold transition-all flex items-center gap-2 sm:gap-3 ${notificacion.tipo === 'success' ? 'bg-green-600 text-white' : notificacion.tipo === 'warning' ? 'bg-yellow-500 text-gray-900' : 'bg-red-600 text-white'}`}>
          {notificacion.tipo === 'success' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
          {notificacion.tipo === 'warning' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          {notificacion.tipo === 'error' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>}
          <span className="whitespace-nowrap">{notificacion.mensaje}</span>
        </div>
      )}

      {/* Panel Izquierdo — Búsqueda */}
      <div className="w-7/12 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-2 sm:mb-4 flex-none">
          <div className="flex gap-2 items-center">
            <NetworkStatusIndicator />
          </div>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => ventasSuspendidas.length === 0 ? handleSuspender() : setModalSuspendidasAbierto(true)} 
              disabled={ventasSuspendidas.length === 0 && carrito.length === 0}
              title={ventasSuspendidas.length === 0 ? "Pausar venta actual" : "Ventas en espera"} 
              className={`flex items-center transition backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 gap-1.5 ${
                ventasSuspendidas.length === 0 && carrito.length === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white/90 hover:bg-white cursor-pointer text-gray-700'
              }`}
            >
              <span className={`text-base leading-none ${ventasSuspendidas.length === 0 && carrito.length === 0 ? 'opacity-50' : ''}`}>⏱️</span>
              <span className="text-sm font-bold hidden sm:block">{ventasSuspendidas.length === 0 ? 'Pausar' : 'En Espera'}</span>
              {ventasSuspendidas.length > 0 && <span className="bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md">{ventasSuspendidas.length}</span>}
            </button>
            <Link to="/inventario" title="Ir al Catálogo" className="flex items-center bg-white/90 hover:bg-white transition backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 gap-1.5">
              <span className="text-base leading-none">🏷️</span>
              <span className="text-sm font-bold text-gray-700 hidden sm:block">Catálogo</span>
            </Link>
            {tieneCierreCaja && (
              <Link to="/movimientos-caja" title="Ir a Movimientos de Caja" className="flex items-center justify-center bg-white/90 hover:bg-white transition backdrop-blur-md p-1.5 sm:p-2 rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </Link>
            )}
            {tieneCierreCaja && (
              <Link to="/cierre-caja" title="Ir a Cierre de Caja" className="flex items-center justify-center bg-white/90 hover:bg-white transition backdrop-blur-md p-1.5 sm:p-2 rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </Link>
            )}
          </div>
        </div>

        <div className="mb-2 sm:mb-4 flex-none relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 shadow-sm p-3 sm:p-4 pl-9 sm:pl-12 text-xs sm:text-base rounded-xl sm:rounded-2xl h-12 sm:h-16 focus:outline-none focus:ring-[#91cf5b] focus:border-[#91cf5b] transition-all"
            placeholder="Buscar..."
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2 pb-2 sm:pb-4 custom-scrollbar">
          {resultados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
              {resultados.map((prod, index) => (
                <button
                  key={prod.id}
                  onClick={() => handleAgregar(prod)}
                  className={`bg-[var(--color-tarjeta)] backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg text-left h-28 sm:h-36 flex flex-col justify-between transition-all group ${
                    selectedIndex === index
                      ? 'ring-4 ring-[#91cf5b] border-transparent scale-[1.02] z-10'
                      : 'border border-white/60 hover:-translate-y-1 hover:shadow-xl hover:border-[#91cf5b]/50 active:scale-95'
                  }`}
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
              <div
                key={ultimoAgregado.timestamp}
                className="bg-white/80 backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/60 w-full max-w-lg flex flex-col"
                style={{ animation: 'fadeInCard 0.4s ease-out forwards' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="text-left">
                    <p className="text-[8px] sm:text-xs text-green-600 font-bold uppercase tracking-wider">Agregado</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 line-clamp-2">{ultimoAgregado.nombre}</h3>
                    <p className="text-xs sm:text-xs text-gray-400 mt-1 font-mono">{ultimoAgregado.sku}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-2xl sm:text-5xl font-black text-[#91cf5b]">${ultimoAgregado.precio}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center pb-[5%]">
              <svg className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-sm sm:text-xl font-bold text-gray-500">Esperando productos</h3>
              <p className="text-xs sm:text-sm mt-1 hidden sm:block">Usa el escáner o el buscador para empezar a vender.</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho — Carrito */}
      <div className="w-5/12 bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl flex flex-col shadow-2xl h-full overflow-hidden">
        <div className="pt-2 pl-3 flex-none flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-2xl font-bold text-gray-800 truncate">Venta Actual</h2>
          </div>
          <div className="flex gap-2 pr-2 self-end sm:self-auto">
            {carrito.length > 0 && (
              <button
                onClick={handleVaciar}
                title="Vaciar todo el carrito"
                className="text-[10px] sm:text-xs text-red-500 hover:bg-red-100 hover:text-red-600 font-bold flex items-center transition-colors p-1 sm:p-2 rounded-lg"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Vaciar
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 sm:px-6 space-y-2 sm:space-y-3 custom-scrollbar">
          {carrito.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-gray-500">
              <p className="font-medium text-xs sm:text-base">El carrito está vacío.</p>
            </div>
          )}
          {carrito.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onCambiarCantidad={cambiarCantidad}
              onValidarCantidad={validarCantidad}
              onActualizarBotones={actualizarCantidadBotones}
              onQuitar={quitarItem}
            />
          ))}
        </div>

        {/* Pie — total y botón cobrar */}
        <div className="p-3 sm:p-6 bg-white/60 border-t border-white/80 flex-none">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <span className="text-sm sm:text-lg text-gray-600 font-semibold">Total</span>
            <span className="text-xl sm:text-4xl font-black text-gray-900 truncate" title={`$${totalCarrito}`}>
              ${totalCarrito}
            </span>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            disabled={carrito.length === 0}
            className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-xl transition-all shadow-md sm:shadow-lg ${
              carrito.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#91cf5b] hover:bg-[#7ab848] hover:shadow-xl active:scale-95'
            }`}
          >
            COBRAR
          </button>
        </div>
      </div>

      {modalAbierto && (
        <PaymentModal
          total={totalCarrito}
          carrito={carrito}
          onConfirmar={procesarVenta}
          onCerrar={() => setModalAbierto(false)}
          procesando={false}
        />
      )}

      {/* Modal Ventas Suspendidas */}
      {modalSuspendidasAbierto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-fondo)] border border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200/60 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-3xl drop-shadow-sm">⏱️</span> Ventas en Espera ({ventasSuspendidas.length}/3)
              </h2>
              <button onClick={() => setModalSuspendidasAbierto(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {carrito.length > 0 && ventasSuspendidas.length < 3 && (
              <button 
                onClick={() => { handleSuspender(); setModalSuspendidasAbierto(false); }} 
                className="w-full mb-3 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold py-2.5 rounded-xl transition shadow-sm border border-orange-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pausar Venta Actual
              </button>
            )}

            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
              {ventasSuspendidas.map(venta => (
                <div key={venta.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">{venta.referencia}</span>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">{venta.carrito.length} producto(s) • Pausada a las {venta.fecha}</p>
                    </div>
                    <span className="text-lg sm:text-xl font-black text-gray-900">${venta.total}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => eliminarSuspendida(venta.id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2 rounded-lg text-xs sm:text-sm transition-colors">
                      Descartar
                    </button>
                    <button onClick={() => handleRetomar(venta.id)} className="flex-1 bg-[#91cf5b] text-white hover:bg-[#7ab848] font-bold py-2 rounded-lg text-xs sm:text-sm transition-colors shadow-sm">
                      Retomar Venta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bloqueo: sin turno activo */}
      {estadoCaja !== 'abierto' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
            {estadoCaja === 'verificando' ? (
              <>
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#91cf5b] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-medium text-sm">Verificando turno...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Caja cerrada</h2>
                <p className="text-gray-500 text-sm mb-6 font-medium">
                  No hay un turno abierto. Abre un turno en Apertura y Cierre de Caja para comenzar a vender.
                </p>
                <button
                  onClick={() => navigate('/cierre-caja')}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-700 text-white font-black rounded-full transition-all active:scale-95"
                >
                  Ir a Cierre de Caja
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    
    <TicketImpresion venta={ticketVenta} />
    </>
  );
}
