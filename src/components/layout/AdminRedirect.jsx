import { useEffect } from 'react';

export default function AdminRedirect() {
  useEffect(() => {
    // /fresco-admin/ siempre está disponible en el mismo dominio:
    // Cloudflare Worker lo proxea al backend automáticamente.
    window.location.href = '/fresco-admin/';
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center text-gray-500 font-medium">
      Redirigiendo a Administración...
    </div>
  );
}
