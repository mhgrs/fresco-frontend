import { useState, useEffect, useCallback } from 'react';
import { useNotificacion } from '../hooks/useNotificacion';
import { useCarrito } from '../hooks/useCarrito';
import { useProductSearch } from '../hooks/useProductSearch';
import { useLocalStorage } from '../hooks/useLocalStorage';
import CatalogPanel from './pos/CatalogPanel';
import CartPanel from './pos/CartPanel';
import PaymentModal from './pos/PaymentModal';
import VentasSuspendidasModal from './pos/VentasSuspendidasModal';
import CajaCerradaOverlay from './pos/CajaCerradaOverlay';
import TicketImpresion from './pos/TicketImpresion';
import { productosService } from '../services/productos';
import { ventasService } from '../services/ventas';
import { logError } from '../utils/logger';

export default function PuntoDeVenta({ usuario }) {
  const [catalogo, setCatalogo]                   = useState([]);
  const [modalAbierto, setModalAbierto]             = useState(false);
  const [modalSuspendidas, setModalSuspendidas]     = useState(false);
  const [selectedIndex, setSelectedIndex]           = useState(-1);
  const [ticketVenta, setTicketVenta]               = useState(null);
  const [estadoCaja, setEstadoCaja]                 = useState('verificando');
  const { notificacion, mostrar }                   = useNotificacion();

  const catalogoStorage    = useLocalStorage('catalogo_offline');
  const ventasOfflineStore = useLocalStorage('ventas_offline');

  const {
    carrito, ultimoAgregado,
    agregar, cambiarCantidad, validarCantidad, actualizarCantidadBotones,
    quitarItem, vaciar, totalCarrito,
    ventasSuspendidas, suspenderVenta, retomarVenta, eliminarSuspendida,
  } = useCarrito(usuario?.id);

  const { termino, setTermino, resultados, inputRef } = useProductSearch(catalogo, agregar);

  const tieneCierreCaja = usuario?.plan?.tiene_cierre_caja;

  const cargarProductos = useCallback(async () => {
    try {
      const respuesta = await productosService.listar();
      const activos = respuesta.data.filter(p => p.esta_activo === true);
      setCatalogo(activos);
      catalogoStorage.set(activos);
    } catch {
      const cache = catalogoStorage.get();
      if (cache) {
        setCatalogo(cache);
        mostrar('Sin conexión. Usando catálogo local.', 'warning');
      } else {
        mostrar('Error conectando al servidor y no hay caché local', 'error');
      }
    }
  }, [mostrar, catalogoStorage]);

  useEffect(() => {
    if (!tieneCierreCaja) { setEstadoCaja('abierto'); return; }
    ventasService.turnoActivo()
      .then(() => setEstadoCaja('abierto'))
      .catch(() => setEstadoCaja('cerrado'));
  }, [tieneCierreCaja]);

  useEffect(() => { inputRef.current?.focus(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    cargarProductos();
    const onSync = () => cargarProductos();
    window.addEventListener('ventasSincronizadas', onSync);
    return () => window.removeEventListener('ventasSincronizadas', onSync);
  }, [cargarProductos]);

  useEffect(() => { setSelectedIndex(-1); }, [resultados]);

  const handleAgregar = useCallback((prod) => {
    agregar(prod);
    setTermino('');
    inputRef.current?.focus();
  }, [agregar, setTermino, inputRef]);

  useEffect(() => {
    const manejarAtajos = (e) => {
      if (estadoCaja !== 'abierto') return;
      if (modalAbierto)    { if (e.key === 'Escape') setModalAbierto(false);    return; }
      if (modalSuspendidas){ if (e.key === 'Escape') setModalSuspendidas(false); return; }
      if (e.key === 'F2' || (e.ctrlKey && e.key.toLowerCase() === 'b')) {
        e.preventDefault(); setTermino(''); inputRef.current?.focus(); return;
      }
      if (e.key === 'F12') { e.preventDefault(); if (carrito.length > 0) setModalAbierto(true); return; }
      if (e.key === 'Escape') { setTermino(''); inputRef.current?.focus(); return; }
      if (resultados.length > 0) {
        const w = window.innerWidth;
        const cols = w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 640 ? 2 : 1;
        if (e.key === 'ArrowRight') {
          e.preventDefault(); setSelectedIndex(prev => Math.min(prev < 0 ? 0 : prev + 1, resultados.length - 1)); return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault(); setSelectedIndex(prev => Math.max(prev < 0 ? 0 : prev - 1, 0)); return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault(); setSelectedIndex(prev => { const next = (prev < 0 ? 0 : prev) + cols; return next < resultados.length ? next : prev < 0 ? 0 : prev; }); return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault(); setSelectedIndex(prev => { const next = (prev < 0 ? 0 : prev) - cols; return next >= 0 ? next : prev < 0 ? 0 : prev; }); return;
        }
      }
      if (e.key === 'Enter') {
        if (resultados.length > 0 && selectedIndex >= 0) { e.preventDefault(); handleAgregar(resultados[selectedIndex]); return; }
        if (resultados.length === 1)                      { e.preventDefault(); handleAgregar(resultados[0]); return; }
        if (!termino.trim() && carrito.length > 0)        { e.preventDefault(); setModalAbierto(true); return; }
      }
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) inputRef.current?.focus();
    };
    window.addEventListener('keydown', manejarAtajos);
    return () => window.removeEventListener('keydown', manejarAtajos);
  }, [estadoCaja, modalAbierto, modalSuspendidas, termino, carrito.length, resultados, selectedIndex, handleAgregar, setTermino, inputRef]);

  const handleVaciar = () => { vaciar(); inputRef.current?.focus(); };

  const handleSuspender = () => {
    if (suspenderVenta()) { mostrar('Venta pausada temporalmente', 'warning'); inputRef.current?.focus(); }
    else mostrar('Límite de 3 ventas en espera alcanzado', 'error');
  };

  const handleRetomar = (id) => {
    if (carrito.length > 0 && !window.confirm('Tienes productos en la venta actual. ¿Deseas reemplazarlos? (Se perderán si no los pausas primero)')) return;
    retomarVenta(id);
    setModalSuspendidas(false);
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

    const snapshotCatalogo = [...catalogo];
    const nuevoCatalogo = catalogo.map(prod => {
      const vendido = carrito.find(c => c.id === prod.id);
      return vendido ? { ...prod, stock: prod.stock - vendido.cantidad } : prod;
    });
    setCatalogo(nuevoCatalogo);
    catalogoStorage.set(nuevoCatalogo);

    setTicketVenta({
      ...payloadVenta,
      fecha: new Date().toLocaleString('es-CL'),
      detalles: carrito.map(item => ({
        nombre: item.nombre,
        cantidad: Number(item.cantidad) || 1,
        precio_unitario: item.precio,
        subtotal: Math.round(item.precio * (Number(item.cantidad) || 1)),
      })),
    });
    vaciar();
    setModalAbierto(false);
    mostrar('Venta procesada exitosamente', 'success');
    inputRef.current?.focus();
    if (imprimirTicket) setTimeout(() => window.print(), 150);

    try {
      const { offline_id, ...payloadSinId } = payloadVenta;
      await ventasService.crear(payloadSinId);
    } catch (error) {
      if (!error.response || !navigator.onLine) {
        const cola = ventasOfflineStore.get([]);
        cola.push(payloadVenta);
        ventasOfflineStore.set(cola);
        window.dispatchEvent(new Event('ventas_offline_updated'));
        mostrar('Sin conexión: Venta guardada para sincronizar luego', 'warning');
      } else {
        setCatalogo(snapshotCatalogo);
        catalogoStorage.set(snapshotCatalogo);
        const errorData = error.response?.data;
        logError('PuntoDeVenta', errorData);
        const msgError = errorData?.error ?? (typeof errorData === 'object' ? 'Error de validación (Revisa la consola)' : 'Error al registrar la venta');
        mostrar(msgError, 'error');
      }
    }
  };

  return (
    <>
      <div className="flex h-full w-full max-w-[1400px] mx-auto bg-[var(--color-fondo)] font-sans relative overflow-hidden transition-colors duration-500 p-2 sm:p-4 gap-2 sm:gap-4 flex-row">

        {notificacion.visible && (
          <div className={`fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-[100] px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-2xl font-bold transition-all flex items-center gap-2 sm:gap-3 ${notificacion.tipo === 'success' ? 'bg-green-600 text-white' : notificacion.tipo === 'warning' ? 'bg-yellow-500 text-gray-900' : 'bg-red-600 text-white'}`}>
            {notificacion.tipo === 'success' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            {notificacion.tipo === 'warning' && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            {notificacion.tipo === 'error'   && <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>}
            <span className="whitespace-nowrap">{notificacion.mensaje}</span>
          </div>
        )}

        <CatalogPanel
          termino={termino} setTermino={setTermino}
          resultados={resultados} inputRef={inputRef} selectedIndex={selectedIndex}
          ultimoAgregado={ultimoAgregado}
          ventasSuspendidas={ventasSuspendidas} carrito={carrito}
          onProductClick={handleAgregar}
          onSuspender={handleSuspender}
          onAbrirSuspendidas={() => setModalSuspendidas(true)}
          tieneCierreCaja={tieneCierreCaja}
        />

        <CartPanel
          carrito={carrito} totalCarrito={totalCarrito}
          onCambiarCantidad={cambiarCantidad}
          onValidarCantidad={validarCantidad}
          onActualizarBotones={actualizarCantidadBotones}
          onQuitar={quitarItem}
          onVaciar={handleVaciar}
          onCobrar={() => setModalAbierto(true)}
        />

        {modalAbierto && (
          <PaymentModal
            total={totalCarrito} carrito={carrito}
            onConfirmar={procesarVenta}
            onCerrar={() => setModalAbierto(false)}
            procesando={false}
          />
        )}

        <VentasSuspendidasModal
          isOpen={modalSuspendidas}
          onClose={() => setModalSuspendidas(false)}
          ventasSuspendidas={ventasSuspendidas}
          carrito={carrito}
          onSuspenderYCerrar={() => { handleSuspender(); setModalSuspendidas(false); }}
          onRetomar={handleRetomar}
          onEliminar={eliminarSuspendida}
        />

        <CajaCerradaOverlay estadoCaja={estadoCaja} />
      </div>

      <TicketImpresion venta={ticketVenta} />
    </>
  );
}
