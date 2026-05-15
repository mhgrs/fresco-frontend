import { forwardRef } from 'react';
import { formatCLP, fmtFecha, fmtHora } from '../../utils/format';
import { METODOS_PAGO } from '../../constants/metodoPago';

const LINEA = '─────────────────────────';

function Fila({ label, valor, bold = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
      <span>{label}</span>
      <span style={{ fontWeight: bold ? 'bold' : 'normal' }}>{valor}</span>
    </div>
  );
}

const TicketCierre = forwardRef(function TicketCierre({ turno }, ref) {
  if (!turno) return null;

  const usuario       = JSON.parse(localStorage.getItem('usuario') || '{}');
  const empresaNombre = usuario.empresa_nombre || 'Mi Empresa';

  const metodos       = turno.totales_por_metodo ?? {};
  const movimientos   = turno.movimientos ?? [];
  const ingresos      = movimientos.filter(m => m.tipo === 'ingreso');
  const retiros       = movimientos.filter(m => m.tipo === 'retiro');
  const diferencia    = turno.diferencia_arqueo;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #ticket-cierre, #ticket-cierre * { visibility: visible; }
          #ticket-cierre {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          @page { margin: 0; }
        }
      `}</style>

      <div
        id="ticket-cierre"
        ref={ref}
        style={{
          width: '80mm',
          padding: '4mm',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#000',
          background: '#fff',
          display: 'none',
        }}
        className="print:block"
      >
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {empresaNombre}
          </div>
          <div>CIERRE DE TURNO</div>
          <div>Folio #{turno.folio}</div>
        </div>

        <div>{LINEA}</div>

        {/* Apertura */}
        <div style={{ margin: '4px 0' }}>
          <div style={{ fontWeight: 'bold' }}>APERTURA</div>
          <Fila label="Fecha"  valor={fmtFecha(turno.fecha_apertura)} />
          <Fila label="Hora"   valor={fmtHora(turno.fecha_apertura)} />
          <Fila label="Cajero" valor={turno.cajero_nombre ?? '—'} />
          <Fila label="Fondo"  valor={formatCLP(turno.fondo_apertura)} />
        </div>

        <div>{LINEA}</div>

        {/* Cierre */}
        <div style={{ margin: '4px 0' }}>
          <div style={{ fontWeight: 'bold' }}>CIERRE</div>
          <Fila label="Fecha"       valor={fmtFecha(turno.fecha_cierre)} />
          <Fila label="Hora"        valor={fmtHora(turno.fecha_cierre)} />
          {turno.cerrado_por_nombre && turno.cerrado_por_nombre !== turno.cajero_nombre && (
            <Fila label="Cerrado por" valor={turno.cerrado_por_nombre} />
          )}
        </div>

        <div>{LINEA}</div>

        {/* Ventas por método */}
        <div style={{ margin: '4px 0' }}>
          <div style={{ fontWeight: 'bold' }}>VENTAS POR MÉTODO</div>
          {Object.entries(metodos).length === 0 ? (
            <div>Sin ventas registradas</div>
          ) : (
            Object.entries(metodos).map(([metodo, total]) => (
              <Fila
                key={metodo}
                label={METODOS_PAGO[metodo]?.label ?? metodo}
                valor={formatCLP(total)}
              />
            ))
          )}
          <div style={{ borderTop: '1px dashed #000', marginTop: '3px', paddingTop: '2px' }}>
            <Fila label="TOTAL VENTAS" valor={formatCLP(turno.total_ventas)} bold />
          </div>
        </div>

        {/* Movimientos — solo si hay alguno */}
        {movimientos.length > 0 && (
          <>
            <div>{LINEA}</div>
            <div style={{ margin: '4px 0' }}>
              <div style={{ fontWeight: 'bold' }}>MOVIMIENTOS DE CAJA</div>
              {ingresos.map((m, i) => (
                <Fila
                  key={i}
                  label={`+ ${m.concepto_display}`}
                  valor={formatCLP(m.monto)}
                />
              ))}
              {retiros.map((m, i) => (
                <Fila
                  key={i}
                  label={`- ${m.concepto_display}`}
                  valor={formatCLP(m.monto)}
                />
              ))}
            </div>
          </>
        )}

        <div>{LINEA}</div>

        {/* Arqueo */}
        <div style={{ margin: '4px 0' }}>
          <div style={{ fontWeight: 'bold' }}>ARQUEO DE CAJA</div>
          <Fila label="Efectivo esperado" valor={formatCLP(turno.efectivo_esperado)} />
          {turno.fondo_cierre != null && (
            <Fila label="Contado en caja" valor={formatCLP(turno.fondo_cierre)} />
          )}
          {diferencia != null && (
            <Fila
              label="Diferencia"
              valor={`${diferencia >= 0 ? '+' : ''}${formatCLP(diferencia)}`}
              bold
            />
          )}
        </div>

        {/* Notas */}
        {turno.notas && (
          <>
            <div>{LINEA}</div>
            <div style={{ margin: '4px 0' }}>
              <div style={{ fontWeight: 'bold' }}>NOTAS</div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>{turno.notas}</div>
            </div>
          </>
        )}

        <div>{LINEA}</div>
        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '10px' }}>
          frescopos.cl
        </div>
      </div>
    </>
  );
});

export default TicketCierre;
