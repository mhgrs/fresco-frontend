import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function EscanerCamara({ onScan, onClose }) {
  useEffect(() => {
    // Configuramos el escáner de la cámara
    const scanner = new Html5QrcodeScanner(
      "lector-codigo-barras",
      {
        fps: 10, // Cuadros por segundo de lectura
        qrbox: { width: 250, height: 150 }, // Tamaño del cuadro de enfoque
        aspectRatio: 1.0,
      },
      false // verbose = false para no saturar la consola de logs
    );

    // Si la lectura es exitosa
    const manejarEscaneoExitoso = (textoDecodificado) => {
      scanner.clear(); // Apagamos y limpiamos el escáner
      onScan(textoDecodificado); // Enviamos el texto al componente padre
    };

    // Iniciamos la cámara en el div con id="lector-codigo-barras"
    scanner.render(manejarEscaneoExitoso, () => { /* Ignoramos errores continuos de enfoque */ });

    // Limpieza cuando el usuario cierra el modal manualmente
    return () => {
      scanner.clear().catch(error => console.error("Error deteniendo el escáner", error));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-2xl relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Escanear Código</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-full p-2 transition" title="Cerrar cámara">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div id="lector-codigo-barras" className="w-full rounded-lg overflow-hidden bg-black"></div>
        
        <p className="text-xs text-gray-500 text-center mt-4 font-medium">
          Enfoque el código de barras del producto dentro del recuadro para leerlo automáticamente.
        </p>
      </div>
    </div>
  );
}