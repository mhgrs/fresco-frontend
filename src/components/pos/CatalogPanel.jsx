import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import NetworkStatusIndicator from '../ui/NetworkStatusIndicator';

export default function CatalogPanel({
  termino, setTermino, resultados, inputRef, selectedIndex,
  ultimoAgregado, ventasSuspendidas, carrito,
  onProductClick, onSuspender, onAbrirSuspendidas, tieneCierreCaja,
}) {
  const cardRefs = useRef([]);

  useEffect(() => {
    if (selectedIndex >= 0 && cardRefs.current[selectedIndex]) {
      cardRefs.current[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const hayEspera = ventasSuspendidas.length > 0;
  const suspendDisabled = !hayEspera && carrito.length === 0;

  return (
    <div className="w-7/12 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-2 sm:mb-4 flex-none">
        <div className="flex gap-2 items-center ml-2">
          <NetworkStatusIndicator />
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={hayEspera ? onAbrirSuspendidas : onSuspender}
            disabled={suspendDisabled}
            title={!hayEspera ? 'Pausar venta actual' : 'Ventas en espera'}
            className={`flex items-center  transition backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 gap-1.5 ${
              suspendDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white/90 hover:bg-white cursor-pointer text-gray-700'
            }`}
          >
            <span className={`text-base leading-none  ${suspendDisabled ? 'opacity-50' : ''}`}>⏱️</span>
            <span className="text-sm font-bold hidden sm:block">{!hayEspera ? 'Pausar' : 'En Espera'}</span>
            {hayEspera && (
              <span className="bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md">
                {ventasSuspendidas.length}
              </span>
            )}
          </button>
          <Link to="/inventario" title="Ir al Catálogo"
            className="flex items-center bg-white/90 hover:bg-white transition backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 gap-1.5">
            <span className="text-base leading-none">🏷️</span>
            <span className="text-sm font-bold text-gray-700 hidden sm:block">Catálogo</span>
          </Link>
          {tieneCierreCaja && (
            <Link to="/movimientos-caja" title="Ir a Movimientos de Caja"
              className="flex items-center justify-center bg-white/90 hover:bg-white transition backdrop-blur-md p-1.5 sm:p-2 rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </Link>
          )}
          {tieneCierreCaja && (
            <Link to="/cierre-caja" title="Ir a Cierre de Caja"
              className="flex items-center justify-center bg-white/90 hover:bg-white transition backdrop-blur-md p-1.5 sm:p-2 rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-gray-900 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-2 sm:mb-4 flex-none relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 shadow-sm p-3 sm:p-4 pl-9 sm:pl-12 text-xs sm:text-base rounded-xl sm:rounded-2xl h-12 sm:h-16 focus:outline-none focus:ring-[#91cf5b] focus:border-[#91cf5b] transition-all"
          placeholder="Buscar..."
          value={termino}
          onChange={e => setTermino(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Grilla de productos / estados */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2 pb-2 sm:pb-4 custom-scrollbar">
        {resultados.length > 0 ? (
          <div className="grid grid-cols-1 p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
            {resultados.map((prod, index) => (
              <button
                key={prod.id}
                ref={el => { cardRefs.current[index] = el; }}
                onClick={() => onProductClick(prod)}
                className={`bg-[var(--color-tarjeta)] backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg text-left h-28 sm:h-36 flex flex-col justify-between transition-all group ${
                  selectedIndex === index
                    ? 'outline outline-4 outline-[#91cf5b] border-transparent scale-[1.02] z-10'
                    : 'border border-white/60 hover:-translate-y-1 hover:shadow-xl hover:border-[#91cf5b]/50 active:scale-95'
                }`}
              >
                <div>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono block truncate">{prod.sku}</span>
                  <span className="font-bold text-xs sm:text-base text-gray-800 line-clamp-2 leading-tight mt-0.5 sm:mt-1">{prod.nombre}</span>
                </div>
                <div className="flex justify-between items-end mt-1 sm:mt-2">
                  <span className="text-[#91cf5b] font-black text-sm sm:text-lg">${prod.precio}</span>
                  <span className="text-[9px] sm:text-xs bg-gray-100 text-gray-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md font-semibold whitespace-nowrap">
                    Stock: {prod.tipo_venta === 'UNIDAD' ? Math.round(prod.stock) : Number(prod.stock).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : ultimoAgregado ? (
          <div className="h-full flex items-center justify-center pb-[5%] px-2">
            <style>{`@keyframes fadeInCard{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div
              key={ultimoAgregado.timestamp}
              className="bg-white/80 backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/60 w-full max-w-lg flex flex-col"
              style={{ animation: 'fadeInCard 0.4s ease-out forwards' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="text-left">
                  <p className="text-[8px] sm:text-xs text-green-600 font-bold uppercase tracking-wider">Agregado</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 line-clamp-2">{ultimoAgregado.nombre}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{ultimoAgregado.sku}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-2xl sm:text-5xl font-black text-[#91cf5b]">${ultimoAgregado.precio}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center pb-[5%]">
            <svg className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-sm sm:text-xl font-bold text-gray-500">Esperando productos</h3>
            <p className="text-xs sm:text-sm mt-1 hidden sm:block">Usa el escáner o el buscador para empezar a vender.</p>
          </div>
        )}
      </div>
    </div>
  );
}
