import { useState } from 'react';

/**
 * Gestiona el estado del carrito de venta y todas sus operaciones.
 * No tiene dependencias externas — funciona con cualquier lista de productos.
 */
export function useCarrito() {
  const [carrito, setCarrito] = useState([]);
  const [ultimoAgregado, setUltimoAgregado] = useState(null);

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
  };
}
