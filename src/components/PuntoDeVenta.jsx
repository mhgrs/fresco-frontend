import { useState, useEffect, useCallback } from 'react';
import { useNotificacion } from '../hooks/useNotificacion';
import { useCarrito } from '../hooks/useCarrito';
import { useProductSearch } from '../hooks/useProductSearch';
import CartItem from './pos/CartItem';
import PaymentModal from './pos/PaymentModal';
import { productosService } from '../services/productos';
import { ventasService } from '../services/ventas';

export default function PuntoDeVenta() {
  const [catalogo, setCatalogo] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const { notificacion, mostrar } = useNotificacion();

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
  } = useCarrito();

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

  useEffect(() => {
    cargarProductos();
    inputRef.current?.focus();
    const onSincronizacion = () => cargarProductos();
    window.addEventListener('ventasSincronizadas', onSincronizacion);
    return () => window.removeEventListener('ventasSincronizadas', onSincronizacion);
  }, [cargarProductos, inputRef]);

  // Capturar tipeo global para enfocar automáticamente el buscador
  useEffect(() => {
    const manejarTipeoGlobal = (e) => {
      if (modalAbierto) return;
      if (e.key === 'F2') {
        e.preventDefault();
        setTermino('');
        inputRef.current?.focus();
        return;
      }
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', manejarTipeoGlobal);
    return () => window.removeEventListener('keydown', manejarTipeoGlobal);
  }, [modalAbierto, setTermino, inputRef]);

  const handleAgregar = (prod) => {
    agregar(prod);
    setTermino('');
    inputRef.current?.focus();
  };

  const handleVaciar = () => {
    vaciar();
    inputRef.current?.focus();
  };

  const procesarVenta = async (metodoPago, totalRedondeado) => {
    if (carrito.length === 0) return;
    setProcesando(true);

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

    try {
      const payloadAEnviar = { ...payloadVenta };
      delete payloadAEnviar.offline_id;
      await ventasService.crear(payloadAEnviar);
      mostrar('Venta registrada exitosamente', 'success');
      vaciar();
      setModalAbierto(false);
      cargarProductos();
    } catch (error) {
      if (!error.response || !navigator.onLine) {
        const ventasOffline = JSON.parse(localStorage.getItem('ventas_offline')) || [];
        ventasOffline.push(payloadVenta);
        localStorage.setItem('ventas_offline', JSON.stringify(ventasOffline));

        // Descontar el stock de manera optimista del catálogo en memoria
        const nuevoCatalogo = catalogo.map(prod => {
          const itemVendido = carrito.find(c => c.id === prod.id);
          if (itemVendido) return { ...prod, stock: prod.stock - itemVendido.cantidad };
          return prod;
        });
        setCatalogo(nuevoCatalogo);
        localStorage.setItem('catalogo_offline', JSON.stringify(nuevoCatalogo));

        mostrar('Sin conexión: Venta guardada para sincronizar luego', 'warning');
        vaciar();
        setModalAbierto(false);
      } else {
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
    } finally {
      setProcesando(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-full w-full max-w-[1400px] mx-auto bg-[var(--color-fondo)] font-sans relative overflow-hidden transition-colors duration-500 p-2 sm:p-4 gap-2 sm:gap-4 flex-row">

      {/* Notificación Toast */}
      {notificacion.visible && (
        <div className={`absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-2xl font-bold transition-all flex items-center gap-2 sm:gap-3 ${notificacion.tipo === 'success' ? 'bg-green-600 text-white' : notificacion.tipo === 'warning' ? 'bg-yellow-500 text-gray-900' : 'bg-red-600 text-white'}`}>
          {notificacion.tipo === 'success' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
          {notificacion.tipo === 'warning' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          {notificacion.tipo === 'error' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>}
          <span className="whitespace-nowrap">{notificacion.mensaje}</span>
        </div>
      )}

      {/* Panel Izquierdo — Búsqueda */}
      <div className="w-7/12 flex flex-col h-full overflow-hidden">
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
              {resultados.map(prod => (
                <button
                  key={prod.id}
                  onClick={() => handleAgregar(prod)}
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
              <div
                key={ultimoAgregado.timestamp}
                className="bg-white/80 backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/60 w-full max-w-lg flex flex-col"
                style={{ animation: 'fadeInCard 0.4s ease-out forwards' }}
              >
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
          <h2 className="text-sm sm:text-2xl font-bold text-gray-800 truncate">Venta Actual</h2>
          {carrito.length > 0 && (
            <button
              onClick={handleVaciar}
              title="Vaciar todo el carrito"
              className="text-[10px] sm:text-xs text-red-500 hover:bg-red-100 hover:text-red-600 font-bold flex items-center transition-colors p-1 sm:p-2 rounded-lg self-end sm:self-auto"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          onConfirmar={procesarVenta}
          onCerrar={() => setModalAbierto(false)}
          procesando={procesando}
        />
      )}
    </div>
  );
}
