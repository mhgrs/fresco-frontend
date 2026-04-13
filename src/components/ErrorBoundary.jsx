import { Component } from 'react';

/**
 * Error Boundary global — captura excepciones de cualquier componente hijo
 * y muestra una pantalla de recuperación en lugar de la pantalla blanca.
 *
 * Uso: envolver <App /> en main.jsx con <ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // En producción aquí iría Sentry.captureException(error, { extra: info })
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center font-sans">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Algo salió mal</h1>
        <p className="text-gray-500 text-sm mb-6 max-w-sm">
          Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-full text-sm hover:bg-gray-700 transition-all active:scale-95"
          >
            Recargar página
          </button>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/dashboard'; }}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-full text-sm hover:bg-gray-200 transition-all active:scale-95"
          >
            Ir al inicio
          </button>
        </div>
        {import.meta.env.DEV && (
          <details className="mt-6 text-left max-w-lg w-full">
            <summary className="text-xs text-gray-400 cursor-pointer font-medium">Detalle del error (solo en desarrollo)</summary>
            <pre className="mt-2 text-xs text-red-700 bg-red-50 p-3 rounded-xl overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
