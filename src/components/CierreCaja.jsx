import { useState, useEffect, useCallback } from 'react';
import { ventasService } from '../services/ventas';
import { logInfo } from '../utils/logger';
import ModalConfirmaCierre from './cierre/ModalConfirmaCierre';
import ResumenTurno from './cierre/ResumenTurno';
import TabHistorial from './cierre/TabHistorial';
import TurnoAjeno from './cierre/TurnoAjeno';
import SinTurno from './cierre/SinTurno';

const TABS = [
  { id: 'turno',     label: 'Turno' },
  { id: 'historial', label: 'Historial' },
];

export default function CierreCaja({ usuario }) {
  const [cargando, setCargando]       = useState(true);
  const [turno, setTurno]             = useState(null);
  const [reporte, setReporte]         = useState(null);
  const [tabActiva, setTabActiva]     = useState('turno');
  const [modalCierre, setModalCierre] = useState(false);

  const cargarEstado = useCallback(async () => {
    setCargando(true);
    try {
      const [resTurno, resReporte] = await Promise.all([
        ventasService.turnoActivo(),
        ventasService.reporteZ(),
      ]);
      setTurno(resTurno.data);
      setReporte(resReporte.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setTurno(null);
        try {
          const resReporte = await ventasService.reporteZ();
          setReporte(resReporte.data);
        } catch (err) { logInfo('CierreCaja.reporteZ', err); }
      } else {
        setTurno(null);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarEstado(); }, [cargarEstado]);

  const handleTurnoAbierto = () => {
    cargarEstado();
    setTabActiva('turno');
  };

  const handleCierreConfirmado = () => {
    setModalCierre(false);
    setTurno(null);
    setReporte(null);
    cargarEstado();
    setTabActiva('turno');
  };

  if (cargando) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse" />
        <div className="h-10 bg-gray-100 rounded-2xl w-72 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const hayTurno   = !!turno;
  const turnoAjeno = hayTurno && turno.cajero_id != null && turno.cajero_id !== usuario?.id;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto min-h-full bg-[var(--color-fondo)] transition-colors duration-500">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Apertura y Cierre de Caja</h1>
        {reporte?.fecha && (
          <p className="text-gray-400 text-sm font-medium mt-0.5">
            {reporte.fecha}{reporte.cajero ? ` · ${reporte.cajero}` : ''}
          </p>
        )}
      </div>

      {turnoAjeno ? (
        <TurnoAjeno turno={turno} reporte={reporte} onCerrado={handleTurnoAbierto} />
      ) : !hayTurno ? (
        <SinTurno onTurnoAbierto={handleTurnoAbierto} />
      ) : (
        <>
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  tabActiva === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-[var(--color-tarjeta)] backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-5 sm:p-7">
            {tabActiva === 'turno' && (
              <ResumenTurno
                turno={turno}
                reporte={reporte}
                onSolicitarCierre={() => setModalCierre(true)}
              />
            )}
            {tabActiva === 'historial' && <TabHistorial />}
          </div>
        </>
      )}

      {modalCierre && turno && (
        <ModalConfirmaCierre
          turno={turno}
          reporte={reporte}
          onClose={() => setModalCierre(false)}
          onSuccess={handleCierreConfirmado}
        />
      )}

      <style>{`
        @media print {
          body > *:not(#root) { display: none; }
          nav, header, button, .no-print { display: none !important; }
          #reporte-imprimible {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #000;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
