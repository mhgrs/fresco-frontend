import { useState, useEffect } from 'react';

/**
 * Gestiona el estado del carrito de venta y todas sus operaciones.
 * Persiste automáticamente los datos en localStorage, aislado por usuarioId.
 */
export function useCarrito(usuarioId) {
  const uidKey = String(usuarioId ?? '');

  // Inicialización lazy: solo restaura si los datos pertenecen al mismo usuario
  const [carrito, setCarrito] = useState(() => {
    try {
      if (!uidKey) return [];
      const savedUid = localStorage.getItem('pos_usuario_id');
      if (savedUid !== uidKey) return [];
      const guardado = localStorage.getItem('pos_carrito');
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  const [ultimoAgregado, setUltimoAgregado] = useState(() => {
    try {
      if (!uidKey) return null;
      const savedUid = localStorage.getItem('pos_usuario_id');
      if (savedUid !== uidKey) return null;
      const guardado = localStorage.getItem('pos_ultimo_agregado');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const [ventasSuspendidas, setVentasSuspendidas] = useState(() => {
    try {
      if (!uidKey) return [];
      const savedUid = localStorage.getItem('pos_usuario_id');
      if (savedUid !== uidKey) return [];
      const guardadas = localStorage.getItem('pos_ventas_suspendidas');
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });

  // Actualizar la marca de usuario cuando cambia
  useEffect(() => {
    if (uidKey) localStorage.setItem('pos_usuario_id', uidKey);
  }, [uidKey]);

  // Efectos para sincronizar estado hacia el localStorage
  useEffect(() => {
    localStorage.setItem('pos_carrito', JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    if (ultimoAgregado) {
      localStorage.setItem('pos_ultimo_agregado', JSON.stringify(ultimoAgregado));
    } else {
      localStorage.removeItem('pos_ultimo_agregado');
    }
  }, [ultimoAgregado]);

  useEffect(() => {
    localStorage.setItem('pos_ventas_suspendidas', JSON.stringify(ventasSuspendidas));
  }, [ventasSuspendidas]);

  const agregar = (producto) => {
    setCarrito(actual => {
      const existe = actual.find(item => item.id === producto.id);
      if (existe) {
        return actual.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: Number(item.cantidad) + 1 }
            : item
        );
      }
      return [...actual, { ...producto, cantidad: 1 }];
    });
    setUltimoAgregado({ ...producto, timestamp: Date.now() });
  };

  const cambiarCantidad = (id, valor) => {
    setCarrito(actual =>
      actual.map(item => (item.id === id ? { ...item, cantidad: valor } : item))
    );
  };

  const validarCantidad = (id, tipoVenta) => {
    setCarrito(actual =>
      actual.map(item => {
        if (item.id !== id) return item;
        let val = parseFloat(item.cantidad);
        if (isNaN(val) || val <= 0) val = 1;
        if (tipoVenta === 'GRANEL') val = Number(val.toFixed(3));
        else val = Math.round(val);
        if (val <= 0) val = 1;
        return { ...item, cantidad: val };
      })
    );
  };

  const actualizarCantidadBotones = (id, delta, tipoVenta) => {
    setCarrito(actual =>
      actual.map(item => {
        if (item.id !== id) return item;
        let nueva = Number(item.cantidad) + delta;
        if (tipoVenta === 'GRANEL') nueva = Number(nueva.toFixed(3));
        else nueva = Math.round(nueva);
        if (nueva <= 0) return item;
        return { ...item, cantidad: nueva };
      })
    );
  };

  const quitarItem = (id) =>
    setCarrito(actual => actual.filter(item => item.id !== id));

  const vaciar = () => {
    setCarrito([]);
    setUltimoAgregado(null);
  };

  const totalCarrito = Math.round(
    carrito.reduce((acc, item) => acc + item.precio * (Number(item.cantidad) || 0), 0)
  );

  const suspenderVenta = () => {
    if (carrito.length === 0) return false;
    if (ventasSuspendidas.length >= 3) return false;

    const nuevaSuspendida = {
      id: Date.now().toString(),
      referencia: `Turno ${ventasSuspendidas.length + 1}`,
      carrito: [...carrito],
      total: totalCarrito,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setVentasSuspendidas([...ventasSuspendidas, nuevaSuspendida]);
    vaciar();
    return true;
  };

  const retomarVenta = (id) => {
    const venta = ventasSuspendidas.find(v => v.id === id);
    if (!venta) return false;

    setCarrito(venta.carrito);
    setUltimoAgregado(null);
    setVentasSuspendidas(ventasSuspendidas.filter(v => v.id !== id));
    return true;
  };

  const eliminarSuspendida = (id) => {
    setVentasSuspendidas(ventasSuspendidas.filter(v => v.id !== id));
  };

  return {
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
    eliminarSuspendida,
  };
}
