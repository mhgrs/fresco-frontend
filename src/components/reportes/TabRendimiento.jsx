import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import TarjetaMetrica from './TarjetaMetrica';
import TooltipArea from './TooltipArea';
import { formatCLP } from '../../utils/format';
import { METODOS_PAGO } from '../../constants/metodoPago';

export default function TabRendimiento({
  metricas, desgloseOrdenado, totalDesglose, tendencia7d, datos30d, tieneTurno,
  onVentasHoyClick, onVentasMesClick, onVentasHistoricasClick,
}) {
  const ticketHoy = metricas.tx_hoy > 0 ? Math.round(metricas.ventas_hoy / metricas.tx_hoy) : 0;
  const ticketMes = metricas.tx_mes > 0 ? Math.round(metricas.ventas_mes / metricas.tx_mes) : 0;

  const handleVentasHoyClick = () => {
    const full = Array.from({ length: 24 }, (_, i) => ({ fecha: `${i}:00`, total: 0, tx_count: 0 }));
    metricas.ventas_por_hora_hoy?.forEach(h => {
      full[h.hora].total    = h.total;
      full[h.hora].tx_count = h.tx_count;
    });
    onVentasHoyClick({ data: full, xKey: 'fecha', yKey: 'total', lineDataKey: 'tx_count', title: 'Ventas de Hoy por Hora', barName: 'Ventas', lineName: 'Transacciones', color: '#82ca9d' });
  };

  return (
    <div className="space-y-8 anim-fade pb-8">
      <section>
        <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2">
          <span className="text-2xl">📈</span> Métricas de Ventas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TarjetaMetrica
            titulo="Ventas Hoy" valor={formatCLP(metricas.ventas_hoy)}
            subtitulo={`${metricas.tx_hoy || 0} transacciones`} color="green"
            onClick={handleVentasHoyClick} disabled={Number(metricas.ventas_hoy) <= 0}
            icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <TarjetaMetrica
            titulo="Ventas este Mes" valor={formatCLP(metricas.ventas_mes)}
            subtitulo={`${metricas.tx_mes || 0} transacciones`} color="blue"
            onClick={onVentasMesClick} disabled={Number(metricas.ventas_mes) <= 0}
            tendencia={tendencia7d}
            icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <TarjetaMetrica
            titulo="Ingresos Históricos" valor={formatCLP(metricas.ventas_historicas)}
            subtitulo={`${metricas.tx_historicas || 0} transacciones en total`} color="purple"
            onClick={onVentasHistoricasClick} disabled={Number(metricas.ventas_historicas) <= 0}
            icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <TarjetaMetrica
            titulo="Venta Promedio Hoy" valor={formatCLP(ticketHoy)}
            subtitulo={`Mes: ${formatCLP(ticketMes)} / transacción`} color="orange"
            disabled={ticketHoy <= 0}
            icono={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          />
        </div>
      </section>

      {desgloseOrdenado.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2">
            <span className="text-2xl">💳</span> Métodos de Pago
            {tieneTurno && (
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Turno activo</span>
            )}
          </h3>
          <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {desgloseOrdenado.map(m => {
                const cfg = METODOS_PAGO[m.metodo_pago] || { label: m.metodo_pago, bg: 'bg-gray-400', text: 'text-gray-700', light: 'bg-gray-50' };
                const pct = totalDesglose > 0 ? Math.round((Number(m.total_metodo) / totalDesglose) * 100) : 0;
                return (
                  <div key={m.metodo_pago} className={`${cfg.light} rounded-2xl p-4`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${cfg.bg} text-white`}>{pct}%</span>
                    </div>
                    <p className="text-xl font-black text-gray-800 mb-2">{formatCLP(m.total_metodo)}</p>
                    <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${cfg.bg} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-right text-xs text-gray-400 font-medium mt-4 pr-1">
              Total del período: <span className="font-black text-gray-600">{formatCLP(totalDesglose)}</span>
            </p>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-lg font-bold text-gray-700 mb-4 px-1 flex items-center gap-2">
          <span className="text-2xl">📅</span> Tendencia — Últimos 30 Días
        </h3>
        <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/60 rounded-3xl shadow-sm p-4 sm:p-6">
          {datos30d.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">Sin datos en los últimos 30 días.</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datos30d} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#91cf5b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#91cf5b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => v.slice(0, 5)} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${new Intl.NumberFormat('es-CL').format(v)}`} tick={{ fontSize: 11, fill: '#9ca3af' }} width={82} axisLine={false} tickLine={false} />
                  <Tooltip content={<TooltipArea />} cursor={{ stroke: '#91cf5b', strokeWidth: 1, strokeDasharray: '4 2' }} />
                  <Area type="monotone" dataKey="total" stroke="#91cf5b" strokeWidth={2.5} fill="url(#gradVentas)" dot={false} activeDot={{ r: 5, fill: '#91cf5b', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {datos30d.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4 max-h-52 overflow-y-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...datos30d].reverse().map((dia, idx) => (
                    <tr key={idx} className="hover:bg-white/60 transition-colors">
                      <td className="px-4 py-2.5 text-sm font-semibold text-gray-600">{dia.fecha}</td>
                      <td className="px-4 py-2.5 text-right text-sm font-black text-[#91cf5b]">{formatCLP(dia.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
