import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usuariosService } from '../services/usuarios';
import PortalSuscripcion from './suscripcion/PortalSuscripcion';

// ── Tab Perfil ─────────────────────────────────────────────────────────────────

function TabPerfil({ usuario }) {
  const [form, setForm] = useState({
    first_name:   usuario.first_name   || '',
    last_name:    usuario.last_name    || '',
    telefono:     usuario.telefono     || '',
    nacionalidad: usuario.nacionalidad || '',
    direccion:    usuario.direccion    || '',
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje]     = useState(null);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await usuariosService.actualizarPerfil(form);
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al guardar.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-lg">
      {mensaje && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          mensaje.tipo === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {mensaje.tipo === 'success' ? '✓' : '✗'} {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre
            </label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Tu nombre"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Apellido
            </label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Tu apellido"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Correo electrónico
          </label>
          <input
            value={usuario.email || ''}
            disabled
            className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">El correo no se puede modificar.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Teléfono
          </label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="+56 9 1234 5678"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nacionalidad
            </label>
            <input
              name="nacionalidad"
              value={form.nacionalidad}
              onChange={handleChange}
              placeholder="Ej. Chilena"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Dirección
            </label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Tu dirección"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#91cf5b] bg-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-gray-900 hover:bg-gray-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function Configuracion({ usuario }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = (usuario.roles || []).includes('ADMIN') || usuario.is_superuser;

  const TABS = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'pagos',  label: 'Suscripción'  },
  ];

  const tabParam   = searchParams.get('tab');
  const hasPago    = searchParams.get('pago') !== null;
  const tabActiva  = TABS.find(t => t.id === tabParam) ? tabParam : (hasPago ? 'pagos' : 'perfil');
  const setTab     = (id) => setSearchParams({ tab: id }, { replace: true });

  return (
    <div className="p-6 max-w-4xl mx-auto h-full flex flex-col">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Configuración</h1>

      {/* Pestañas */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold transition-colors relative ${
              tabActiva === tab.id
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {tabActiva === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#91cf5b] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto -mx-6 px-6 custom-scrollbar">
        {tabActiva === 'perfil' && <TabPerfil usuario={usuario} />}
        {tabActiva === 'pagos'  && <PortalSuscripcion />}
      </div>
    </div>
  );
}
