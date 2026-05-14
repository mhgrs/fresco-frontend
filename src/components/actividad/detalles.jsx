import { formatCLP, fmtFecha, fmtHora, fmtFechaHora } from '../../utils/format';
import { METODOS_PAGO } from '../../constants/metodoPago';
import { TIPO_MOV } from './utils';

export function DetalleVenta({ venta }) {
  const metodo = METODOS_PAGO[venta.metodo_pago] || { label: venta.metodo_pago, cls: 'bg-gray-100 text-gray-600' };
  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap items-center">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${metodo.cls}`}>{metodo.label}</span>
        <span className="text-xs font-bold text-gray-400">{fmtFechaHora(venta.fecha)}</span>
        {venta.cajero_nombre && (
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
            {venta.cajero_nombre}
          </span>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {venta.detalles?.map((d, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-semibold text-gray-800">{d.producto_nombre}</p>
              <p className="text-xs text-gray-400 font-mono">{d.producto_sku}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-xs text-gray-400">
                {parseFloat(d.cantidad) % 1 === 0 ? parseFloat(d.cantidad) : parseFloat(d.cantidad).toFixed(3)} × {formatCLP(d.precio_unitario)}
              </p>
              <p className="text-sm font-black text-gray-700">{formatCLP(d.subtotal)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-200">
        <span className="font-bold text-gray-600">Total</span>
        <span className="text-lg font-black text-gray-800">{formatCLP(venta.total)}</span>
      </div>
    </div>
  );
}

export function DetalleTurno({ turno }) {
  const abierto = turno.estado === 'abierto';
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Cajero</span>
          <span className="font-bold text-gray-800">{turno.cajero_nombre || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Apertura</span>
          <span className="font-bold text-gray-800">{fmtFechaHora(turno.fecha_apertura)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Cierre</span>
          <span className={`font-bold ${abierto ? 'text-green-600' : 'text-gray-800'}`}>
            {abierto ? 'Turno activo' : fmtFechaHora(turno.fecha_cierre)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Fondo apertura</span>
          <span className="font-bold text-gray-800">{formatCLP(turno.fondo_apertura)}</span>
        </div>
        {turno.fondo_cierre != null && (
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Fondo cierre</span>
            <span className="font-bold text-gray-800">{formatCLP(turno.fondo_cierre)}</span>
          </div>
        )}
        {turno.cerrado_por_nombre && turno.cerrado_por_nombre !== turno.cajero_nombre && (
          <div className="flex justify-between pt-2 border-t border-amber-100">
            <span className="text-amber-600 font-medium">Cerrado por</span>
            <span className="font-bold text-amber-700">{turno.cerrado_por_nombre}</span>
          </div>
        )}
        {turno.notas && (
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Notas</span>
            <span className="font-semibold text-gray-700 text-right max-w-[60%]">{turno.notas}</span>
          </div>
        )}
      </div>

      {turno.movimientos?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Movimientos de caja</p>
          <div className="divide-y divide-gray-100">
            {turno.movimientos.map((m, i) => {
              const cfg = TIPO_MOV[m.tipo] || { label: m.tipo, cls: 'bg-gray-100 text-gray-600' };
              return (
                <div key={i} className="flex items-start justify-between py-2.5 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.cls}`}>{cfg.label}</span>
                      <span className="text-xs text-gray-500">{m.concepto_display}</span>
                    </div>
                    {m.descripcion && <p className="text-xs text-gray-400 mt-0.5 truncate">{m.descripcion}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{m.registrado_por_nombre} · {fmtHora(m.fecha)}</p>
                  </div>
                  <span className="font-black text-gray-800 flex-shrink-0">{formatCLP(m.monto)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {turno.movimientos?.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Sin movimientos de caja en este turno.</p>
      )}

      {turno.desglose?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ventas por método de pago</p>
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            {turno.desglose.map((d, i) => {
              const cfg = METODOS_PAGO[d.metodo_pago] || { label: d.metodo_pago, cls: 'bg-gray-100 text-gray-600' };
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.cls}`}>{cfg.label}</span>
                  <span className="font-black text-gray-800">{formatCLP(d.total)}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-500 font-medium">Total ventas</span>
              <span className="font-black text-gray-900">
                {formatCLP(turno.desglose.reduce((s, d) => s + d.total, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
      {turno.desglose?.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">Sin ventas registradas en este turno.</p>
      )}
    </div>
  );
}

export function DetalleMovCaja({ mov }) {
  const cfg = TIPO_MOV[mov.tipo] || { label: mov.tipo, cls: 'bg-gray-100 text-gray-600' };
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Tipo</span>
        <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${cfg.cls}`}>{cfg.label}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Concepto</span>
        <span className="font-bold text-gray-800">{mov.concepto_display}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Monto</span>
        <span className="font-black text-gray-800 text-base">{formatCLP(mov.monto)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Registrado por</span>
        <span className="font-bold text-gray-800">{mov.registrado_por_nombre || '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Fecha y hora</span>
        <span className="font-bold text-gray-800">{fmtFechaHora(mov.fecha)}</span>
      </div>
      {mov.turno_folio && (
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Turno</span>
          <span className="font-bold text-gray-800">#{mov.turno_folio}</span>
        </div>
      )}
      {mov.descripcion && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-gray-500 font-medium mb-1">Descripción</p>
          <p className="text-gray-700 font-semibold">{mov.descripcion}</p>
        </div>
      )}
    </div>
  );
}

export function DetalleMovInv({ mov }) {
  const cfg = TIPO_MOV[mov.tipo] || { label: mov.tipo, cls: 'bg-gray-100 text-gray-600' };
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Producto</span>
        <div className="text-right">
          <p className="font-bold text-gray-800">{mov.producto_nombre}</p>
          <p className="text-xs text-gray-400 font-mono">{mov.producto_sku}</p>
        </div>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Tipo</span>
        <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${cfg.cls}`}>{cfg.label}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Cantidad</span>
        <span className="font-black text-gray-800">
          {mov.tipo === 'RETIRO' || mov.tipo === 'retiro' ? '−' : '+'}
          {parseFloat(mov.cantidad) % 1 === 0 ? parseFloat(mov.cantidad) : parseFloat(mov.cantidad).toFixed(3)}
          {mov.producto_tipo_venta === 'GRANEL' ? ' kg' : ' und.'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Realizado por</span>
        <span className="font-bold text-gray-800">{mov.usuario || '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 font-medium">Fecha y hora</span>
        <span className="font-bold text-gray-800">{mov.fecha}</span>
      </div>
      {mov.motivo && (
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Motivo</span>
          <span className="font-bold text-gray-800 capitalize">{mov.motivo.toLowerCase()}</span>
        </div>
      )}
      {mov.descripcion && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-gray-500 font-medium mb-1">Descripción</p>
          <p className="text-gray-700 font-semibold">{mov.descripcion}</p>
        </div>
      )}
    </div>
  );
}
