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
    
    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || !devices.length) {
          throw new Error("No se encontraron cámaras en el dispositivo.");
        }

        // Priorizar cámaras con 'back' o 'rear' en la etiqueta. Si no, usar la última de la lista.
        const rearCamera = devices.find(d => d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('back'));
        const cameraId = rearCamera ? rearCamera.id : devices[devices.length - 2].id;

        await html5QrCode.start(
          cameraId, // Usar el ID de la cámara trasera encontrada
          { 
            fps: 15,
            qrbox: { width: 280, height: 150 },
            videoConstraints: {
              width: { ideal: 1280 },
              height: { ideal: 1080 },
              advanced: [{ focusMode: "continuous" }]
            },
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
          (error) => { /* Ignorar errores de enfoque */ }
        );
      } catch (err) {
        if (isMounted) {
          setErrorPermisos("No se pudo iniciar la cámara. Asegúrese de dar permisos.");
          console.error("Error iniciando cámara:", err);
        }
      }
    };

    startScanner();

    // Limpieza cuando el usuario cierra el modal manualmente
    return () => {
      isMounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Fallo al detener el escáner.", err));
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