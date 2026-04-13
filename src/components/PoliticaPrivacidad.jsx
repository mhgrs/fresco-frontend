import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PoliticaPrivacidad() {
  useEffect(() => { document.title = 'Política de Privacidad — Fresco POS'; }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <div className="mb-8">
          <Link to="/" className="text-[#91cf5b] font-bold text-sm hover:underline">← Volver al inicio</Link>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-400 mb-8">Última actualización: abril de 2025 · Conforme a la Ley 19.628 (Chile)</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">1. Responsable del tratamiento</h2>
            <p>Fresco POS, operado como servicio SaaS desde Chile, es el responsable del tratamiento de los datos personales recogidos a través de <strong>frescopos.cl</strong>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Datos de cuenta:</strong> nombre, apellido, correo electrónico, teléfono, dirección.</li>
              <li><strong>Datos del negocio:</strong> nombre de la empresa, productos, categorías, ventas y movimientos de caja.</li>
              <li><strong>Datos de uso:</strong> métricas de uso del servicio (frecuencia, funcionalidades utilizadas) con fines de mejora.</li>
              <li><strong>Datos de pago:</strong> historial de transacciones procesadas por Flow.cl. No almacenamos datos de tarjetas de crédito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">3. Finalidad del tratamiento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Proveer y mejorar el Servicio.</li>
              <li>Enviar comunicaciones transaccionales (confirmaciones, alertas de cuenta).</li>
              <li>Análisis agregado y anónimo de uso para desarrollo del producto.</li>
              <li>Cumplimiento de obligaciones legales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">4. Base legal</h2>
            <p>El tratamiento se basa en el consentimiento otorgado al aceptar estos términos (Art. 4 Ley 19.628) y en la ejecución del contrato de servicio.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">5. Compartición de datos</h2>
            <p>No vendemos ni cedemos tus datos personales a terceros. Solo los compartimos con proveedores de infraestructura esenciales (Supabase para base de datos, Render para servidor, Resend para emails) bajo acuerdos de confidencialidad. Flow.cl procesa los pagos bajo su propia política de privacidad.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">6. Conservación de datos</h2>
            <p>Tus datos se conservan mientras tengas una cuenta activa. Tras la eliminación o inactividad prolongada (más de 90 días), los datos serán eliminados definitivamente, salvo obligación legal de retención.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">7. Tus derechos</h2>
            <p>Conforme a la Ley 19.628, tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos. Para ejercerlos, escríbenos a <a href="mailto:hola@frescopos.cl" className="text-[#91cf5b] hover:underline">hola@frescopos.cl</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">8. Seguridad</h2>
            <p>Aplicamos medidas técnicas razonables (HTTPS, tokens JWT en cookies HttpOnly, acceso restringido por roles) para proteger tus datos. Ningún sistema es 100% seguro; te recomendamos usar contraseñas robustas y no compartir tus credenciales.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">9. Cambios a esta política</h2>
            <p>Podemos actualizar esta política notificándote por correo electrónico con al menos 15 días de anticipación.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
