import { useEffect, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// Este componente ha sido reescrito para máxima simplicidad y robustez.
// Se encarga de la selección de cámara, permisos y limpieza de forma automática.

export default function EscanerCamara({ onScan, onClose }) {
  const [error, setError] = useState('');

  useEffect(() => {
    // Un "flag" para prevenir operaciones asíncronas en un componente desmontado.
    let isMounted = true;
    
    // El ID del elemento donde se renderizará el video de la cámara.
    const scannerElementId = "lector-codigo-barras";

    // Instanciamos el escáner.
    const html5QrCode = new Html5Qrcode(scannerElementId);
    
    const startScanner = async () => {
      try {
        // 1. Pedir permisos y obtener la lista de cámaras disponibles.
        const devices = await Html5Qrcode.getCameras();
        if (!devices || !devices.length) {
          throw new Error("No se encontraron cámaras en el dispositivo.");
        }

        let cameraId;
        // 2. Selección inteligente de la cámara trasera.
        if (devices.length === 1) {
          // Si solo hay una cámara, no hay elección.
          cameraId = devices[0].id;
        } else {
          // Si hay múltiples cámaras, intentamos encontrar la que NO es frontal.
          // Esto es más fiable que buscar "back" o "trasera", que depende del idioma.
          const rearCandidates = devices.filter(device => 
            !device.label.toLowerCase().includes('front') && 
            !device.label.toLowerCase().includes('frontal')
          );

          if (rearCandidates.length > 0) {
            // Si tenemos candidatas, usamos la ÚLTIMA de la lista.
            // En teléfonos modernos, la última suele ser la principal y de mejor calidad.
            cameraId = rearCandidates[rearCandidates.length - 1].id;
          } else {
            // Como último recurso (ej: nombres de cámara extraños), usamos la última de la lista completa.
            cameraId = devices[devices.length - 1].id;
          }
        }

        // 3. Configuración para el escáner.
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
          ],
          videoConstraints: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "environment", // Como fallback para navegadores que lo prefieran.
          }
        };

        // 4. Callback de éxito.
        const onScanSuccess = (decodedText) => {
          if (isMounted) {
            // Detenemos la cámara y LUEGO llamamos a la función del padre.
            html5QrCode.stop()
              .then(() => onScan(decodedText))
              .catch(err => {
                console.error("Error al detener el escáner después del éxito:", err);
                // Igualmente llamamos a onScan, porque el código ya se leyó.
                onScan(decodedText);
              });
          }
        };

        // 5. Iniciar el escáner.
        await html5QrCode.start(
          cameraId, // La forma más directa de seleccionar una cámara es por su ID.
          config,
          onScanSuccess,
          (errorMessage) => { /* Ignorar errores de "no se encontró código" para no spamear la consola. */ }
        );

      } catch (err) {
        if (isMounted) {
          console.error("Error al iniciar el escáner:", err);
          if (err.name === "NotAllowedError") {
            setError("Debe otorgar permisos de cámara para usar esta función.");
          } else {
            setError("No se pudo iniciar la cámara. Verifique los permisos y la configuración de su navegador.");
          }
        }
      }
    };

    startScanner();

    // 6. Función de limpieza. Es crucial.
    // Se ejecuta cuando el componente se desmonta (ej: al cerrar el modal).
    return () => {
      isMounted = false;
      // Verificamos si el escáner está activo antes de intentar detenerlo.
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(err => console.error("Fallo al detener el escáner al cerrar.", err));
      }
    };
    // El array de dependencias vacío asegura que este efecto se ejecute solo una vez.
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-2xl relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Escanear Código de Barras</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-full p-2 transition" title="Cerrar cámara">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        ) : (
          <>
            <div id="lector-codigo-barras" className="w-full rounded-lg overflow-hidden bg-black min-h-[250px]"></div>
            <p className="text-xs text-gray-500 text-center mt-4 font-medium">
              Apunte la cámara al código de barras del producto.
            </p>
          </>
        )}
      </div>
    </div>
  );
}