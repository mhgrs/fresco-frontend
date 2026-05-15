import React from 'react';
import { formatCLP } from '../../utils/format';
import { METODOS_PAGO } from '../../constants/metodoPago';

export default function TicketImpresion({ venta }) {
  if (!venta) return null;

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  return (
    <>
      <style>
        {`
          @media print {
            /* Ocultar todos los elementos de la aplicación */
            body * {
              visibility: hidden;
            }
            /* Mostrar únicamente el ticket y sus hijos */
            #ticket-impresion, #ticket-impresion * {
              visibility: visible;
            }
            /* Posicionar el ticket en la esquina superior izquierda del papel */
            #ticket-impresion {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
              margin: 0;
              padding: 0;
            }
            /* Quitar márgenes por defecto del navegador */
            @page {
              margin: 0;
            }
          }
        `}
      </style>
      
      <div id="ticket-impresion" className="hidden print:block text-black font-mono text-sm bg-white" style={{ width: '80mm', padding: '4mm' }}>
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold uppercase mb-1">{usuario.empresa_nombre || 'Mi Empresa'}</h2>
          <p className="text-xs">Comprobante de Venta</p>
          <p className="text-xs">{venta.fecha}</p>
        </div>

        <div className="border-t border-b border-black border-dashed py-2 mb-2">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left pb-1 w-8">Cant</th>
                <th className="text-left pb-1">Descripción</th>
                <th className="text-right pb-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.map((item, idx) => (
                <tr key={idx}>
                  <td className="align-top pr-1">
                    {parseFloat(item.cantidad) % 1 === 0
                      ? parseFloat(item.cantidad)
                      : parseFloat(item.cantidad).toFixed(3)}
                  </td>
                  <td className="align-top pr-1 leading-tight">
                    <span>{item.nombre}</span>
                    <span className="block text-gray-500">{formatCLP(item.precio_unitario)} c/u</span>
                  </td>
                  <td className="align-top text-right">{formatCLP(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between font-bold text-base mb-4">
          <span>TOTAL:</span>
          <span>{formatCLP(venta.total)}</span>
        </div>

        <div className="text-xs mb-6">
          <p>Pago: {METODOS_PAGO[venta.metodo_pago]?.label || venta.metodo_pago}</p>
          {venta.offline_id && <p>Ref: {venta.offline_id.substring(0, 8)}</p>}
        </div>

        <div className="text-center text-xs mt-4 mb-8">
          <p>¡Gracias por su preferencia!</p>
        </div>
      </div>
    </>
  );
}