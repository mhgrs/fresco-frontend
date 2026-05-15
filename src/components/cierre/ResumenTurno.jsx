import { formatCLP, fmtFechaLarga } from '../../utils/format';
import { METODOS_PAGO } from '../../constants/metodoPago';
import KPICard from './KPICard';

export default function ResumenTurno({ turno, reporte, onSolicitarCierre }) {
  return (
    <div id="reporte-imprimible" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wide">Turno abierto</span>
            <span className="text-xs text-gray-400 font-semibold">#{turno.folio}</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {turno.cajero_nombre && <span>{turno.cajero_nombre} · </span>}
            Apertura: {fmtFechaLarga(turno.fecha_apertura)}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full hover:bg-gray-50 transition-all flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            onClick={onSolicitarCierre}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold rounded-full transition-all active:scale-95">
            Cerrar turno →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard color="yellow" label="Fondo apertura"    valor={formatCLP(reporte?.fondo_apertura)}    sub="Efectivo inicial" />
        <KPICard color="green"  label="Ventas totales"    valor={formatCLP(reporte?.total_ventas)}       sub={`${reporte?.cantidad_transacciones ?? 0} transacciones`} />
        <KPICard color="green"  label="Efectivo ventas"   valor={formatCLP(reporte?.efectivo_ventas)}    sub="Solo pagos en efectivo" />
        <KPICard color="blue"   label="Efectivo esperado" valor={formatCLP(reporte?.efectivo_esperado)}  sub="Fondo + efectivo + movimientos" />
      </div>

      {(reporte?.total_ingresos_mov > 0 || reporte?.total_retiros_mov > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <KPICard color="green" label="Ingresos manuales" valor={formatCLP(reporte?.total_ingresos_mov)} sub="Entradas no relacionadas a ventas" />
          <KPICard color="red"   label="Retiros"            valor={formatCLP(reporte?.total_retiros_mov)}  sub="Salidas de efectivo del turno" />
        </div>
      )}

      {reporte?.desglose?.length > 0 && (
        <div>
          <h3 className="text-base font-black text-gray-800 mb-3">Desglose por método de pago</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reporte.desglose.map(item => (
              <div key={item.metodo_pago}
                className="flex justify-between items-center p-4 bg-white/70 rounded-xl border border-white/80 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{METODOS_PAGO[item.metodo_pago]?.icon ?? '💰'}</span>
                  <span className="font-bold text-gray-700 text-sm capitalize">
                    {item.metodo_pago.toLowerCase()}
                  </span>
                </div>
                <span className="text-xl font-black text-gray-900">{formatCLP(item.total_metodo)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reporte?.desglose?.length === 0 && (
        <div className="bg-gray-50 p-5 rounded-xl text-center text-gray-400 font-medium text-sm">
          No hay ventas registradas en este turno todavía.
        </div>
      )}
    </div>
  );
}
