import { useState, useEffect } from 'react';
import api from '../services/api';
import { useLocation } from 'react-router-dom';

export default function MovimientosInventario({ usuario }) {
  const location = useLocation();
  const productoPreseleccionado = location.state?.productoPreseleccionado || null;

  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });
  
  const [tabActiva, setTabActiva] = useState('registro');

  const [formulario, setFormulario] = useState({
    producto_id: productoPreseleccionado?.id || '',
    tipo: 'INGRESO',
    cantidad: '',
    motivo: 'MERMA',
    descripcion: ''
  });

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ visible: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: '' }), 3000);
  };

  const cargarDatos = async () => {
    try {
      const [resProd, resMov] = await Promise.all([
        api.get('inventario/productos/'),
        api.get('inventario/productos/movimientos/')
      ]);
      setProductos(resProd.data.filter(p => p.esta_activo));
      setMovimientos(resMov.data);
    } catch (error) {
      console.error(error);
      mostrarNotificacion('Error al cargar los datos', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const guardarMovimiento = async (e) => {
    e.preventDefault();
    if (!formulario.producto_id) {
      mostrarNotificacion('Seleccione un producto', 'error');
      return;
    }

    try {
      await api.post(`inventario/productos/${formulario.producto_id}/ajustar_stock/`, {
        tipo: formulario.tipo,
        cantidad: formulario.cantidad,
        motivo: formulario.tipo === 'EGRESO' ? formulario.motivo : null,
        descripcion: formulario.tipo === 'EGRESO' ? formulario.descripcion : null
      });
      
      mostrarNotificacion('Movimiento registrado exitosamente', 'success');
      setFormulario({
        producto_id: '',
        tipo: 'INGRESO',
        cantidad: '',
        motivo: 'MERMA',
        descripcion: ''
      });
      cargarDatos(); // Recargar historial y listado de productos actualizado
      setTabActiva('historial');
    } catch (error) {
      mostrarNotificacion(error.response?.data?.error || 'Error al registrar el movimiento', 'error');
    }
  };

  const productoSeleccionado = productos.find(p => p.id === Number(formulario.producto_id));

  return (
    <div className="p-6 h-full w-full max-w-[1400px] mx-auto flex flex-col bg-[var(--color-fondo)] relative overflow-hidden transition-colors duration-500">
      {notificacion.visible && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-bold transition-all ${notificacion.tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notificacion.mensaje}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Movimientos de Inventario</h1>
      </div>

      <div className="flex border-b border-gray-200 mb-6 flex-none">
        <button onClick={() => setTabActiva('registro')} className={`py-2 px-4 text-sm font-semibold transition-colors ${tabActiva === 'registro' ? 'border-b-2 border-[#91cf5b] text-[#91cf5b]' : 'text-gray-500 hover:text-gray-700'}`}>
          Registrar Movimiento
        </button>
        <button onClick={() => setTabActiva('historial')} className={`py-2 px-4 text-sm font-semibold transition-colors ${tabActiva === 'historial' ? 'border-b-2 border-[#91cf5b] text-[#91cf5b]' : 'text-gray-500 hover:text-gray-700'}`}>
          Historial de Movimientos
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {cargando ? (
           <div className="p-8 text-center text-gray-500 font-medium">Cargando...</div>
        ) : tabActiva === 'registro' ? (
          <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 p-6 rounded-lg shadow-md max-w-2xl overflow-y-auto custom-scrollbar">
            <form onSubmit={guardarMovimiento} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                <select required name="producto_id" value={formulario.producto_id} onChange={manejarCambio} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#91cf5b] bg-white">
                  <option value="">Seleccione un producto...</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.tipo_venta === 'UNIDAD' ? Math.round(p.stock) : Number(p.stock).toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button type="button" onClick={() => setFormulario({ ...formulario, tipo: 'INGRESO' })} className={`flex-1 py-2 font-bold rounded-md transition ${formulario.tipo === 'INGRESO' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Ingreso (+)</button>
                <button type="button" onClick={() => setFormulario({ ...formulario, tipo: 'EGRESO' })} className={`flex-1 py-2 font-bold rounded-md transition ${formulario.tipo === 'EGRESO' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Egreso (-)</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad {productoSeleccionado?.tipo_venta === 'GRANEL' ? '(Kilos)' : '(Unidades)'}</label>
                <input required type="number" name="cantidad" min={productoSeleccionado?.tipo_venta === 'UNIDAD' ? "1" : "0.001"} step={productoSeleccionado?.tipo_venta === 'UNIDAD' ? '1' : 'any'} value={formulario.cantidad} onChange={manejarCambio} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#91cf5b]" placeholder="0" />
              </div>
              {formulario.tipo === 'EGRESO' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del Egreso</label>
                    <select required name="motivo" value={formulario.motivo} onChange={manejarCambio} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#91cf5b] bg-white">
                      <option value="MERMA">Merma</option><option value="DANADO">Dañado</option><option value="CONSUMO">Consumo interno</option><option value="OTRO">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional, máx 100 caract.)</label>
                    <input type="text" name="descripcion" maxLength="100" value={formulario.descripcion} onChange={manejarCambio} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#91cf5b]" placeholder="Detalles adicionales..." />
                  </div>
                </>
              )}
              <div className="flex justify-end pt-4 border-t">
                <button type="submit" className={`px-6 py-2 text-white rounded font-bold transition shadow-md ${formulario.tipo === 'INGRESO' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Registrar Movimiento</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-[var(--color-tarjeta)] backdrop-blur-md border border-white/50 rounded-lg shadow-md flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white/60 sticky top-0 shadow-sm backdrop-blur-md">
                  <tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th><th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th><th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Detalles</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movimientos.map(mov => (<tr key={mov.id} className="hover:bg-white/40 transition-colors"><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{mov.fecha}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{mov.usuario}</td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-gray-900">{mov.producto_nombre}</div><div className="text-xs text-gray-500 font-mono">{mov.producto_sku}</div></td><td className="px-6 py-4 whitespace-nowrap text-center"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${mov.tipo === 'INGRESO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{mov.tipo}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-700">{mov.tipo === 'INGRESO' ? '+' : '-'}{mov.producto_tipo_venta === 'UNIDAD' ? Math.round(mov.cantidad) : Number(mov.cantidad).toFixed(2)}</td><td className="px-6 py-4 text-sm text-gray-600">{mov.tipo === 'EGRESO' && (<><span className="font-semibold text-gray-800">{mov.motivo}</span>{mov.descripcion && <span className="block text-xs mt-0.5 text-gray-500 truncate max-w-xs" title={mov.descripcion}>{mov.descripcion}</span>}</>)}</td></tr>))}
                  {movimientos.length === 0 && (<tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">No hay movimientos registrados.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}