import { useEffect, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function EscanerCamara({ onScan, onClose }) {
  const [errorPermisos, setErrorPermisos] = useState('');

  useEffect(() => {
    // Validación de entorno seguro (HTTPS o localhost) requerida por navegadores móviles
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorPermisos("Tu navegador bloqueó la cámara por seguridad. Para probarla en tu celular durante el desarrollo, debes acceder mediante HTTPS o configurar un túnel (ej. ngrok).");
      return;
    }

    let isMounted = true;
    const html5QrCode = new Html5Qrcode("lector-codigo-barras");

    // Usamos Html5Qrcode directamente para encender la cámara sin clics adicionales
    html5QrCode.start(
      { 
        facingMode: "environment", // Cámara trasera
        // Forzamos al celular a usar resolución HD para no perder nitidez
        width: { ideal: 1280 },
        height: { ideal: 720 },
        // Intentar usar autoenfoque continuo si el dispositivo lo soporta
        advanced: [{ focusMode: "continuous" }]
      },
      { 
        fps: 15, // Aumentamos la tasa de escaneo a 15 cuadros por seg
        qrbox: { width: 280, height: 150 }, // Hacemos la caja guía un poco más ancha
        // Restringimos los formatos solo a códigos comerciales para evitar números falsos
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128
        ]
      },
      (textoDecodificado) => {
        if (isMounted) {
          html5QrCode.stop().then(() => onScan(textoDecodificado)).catch(console.error);
        }
      },
      (error) => { /* Ignorar errores de enfoque frame a frame */ }
    ).then(() => {
      // Si el componente se cerró de golpe mientras la cámara iniciaba (común en React StrictMode)
      if (!isMounted) {
        html5QrCode.stop().catch(console.error);
      }
    }).catch((err) => {
      if (isMounted) {
        setErrorPermisos("Debe otorgar permisos de cámara en su navegador para usar el escáner.");
        console.error("Error iniciando cámara:", err);
      }
    });

    // Limpieza cuando el usuario cierra el modal manualmente
    return () => {
      isMounted = false;
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
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
        
        {errorPermisos ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-sm text-center font-medium">
            {errorPermisos}
          </div>
        ) : (
          <div id="lector-codigo-barras" className="w-full rounded-lg overflow-hidden bg-black min-h-[250px]"></div>
        )}
        
        {!errorPermisos && (
          <p className="text-xs text-gray-500 text-center mt-4 font-medium">
            Enfoque el código de barras del producto dentro del recuadro para leerlo automáticamente.
          </p>
        )}
      </div>
    </div>
  );
}