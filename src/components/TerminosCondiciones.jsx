import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TerminosCondiciones() {
  useEffect(() => { document.title = 'Términos y Condiciones — Fresco POS'; }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <div className="mb-8">
          <Link to="/" className="text-[#91cf5b] font-bold text-sm hover:underline">← Volver al inicio</Link>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Términos y Condiciones</h1>
        <p className="text-sm text-gray-400 mb-8">Última actualización: abril de 2025</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">1. Aceptación de los términos</h2>
            <p>Al registrarte y usar <strong>Fresco POS</strong> ("el Servicio"), aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de ellos, no debes usar el Servicio.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">2. Descripción del servicio</h2>
            <p>Fresco POS es un sistema de punto de venta (POS) en la nube, disponible como servicio de suscripción (SaaS), dirigido a pequeños y medianos comercios en Chile. El acceso se otorga según el plan contratado (Gratis, Básico, Pro o Empresa).</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">3. Planes y facturación</h2>
            <p>Los planes de pago se cobran mensual o anualmente en pesos chilenos (CLP). Los precios pueden ajustarse anualmente según el IPC, con aviso previo de 30 días. Los pagos se procesan a través de Flow.cl. El plan Gratis no requiere tarjeta de crédito y no tiene límite de tiempo, pero está sujeto a restricciones de funcionalidades.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">4. Cancelación y datos</h2>
            <p>Puedes cancelar tu suscripción en cualquier momento desde el portal de tu cuenta. Al cancelar, tu plan se reducirá automáticamente al plan Gratis. Tus datos serán conservados durante 90 días calendario tras la inactividad completa, luego de los cuales podrán ser eliminados definitivamente.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">5. Uso aceptable</h2>
            <p>No está permitido usar el Servicio para actividades ilegales, revender el acceso sin autorización, o intentar vulnerar la seguridad de la plataforma. Fresco se reserva el derecho de suspender cuentas que infrinjan estas normas.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">6. Limitación de responsabilidad</h2>
            <p>Fresco POS no es responsable por pérdidas de datos derivadas de fuerza mayor, uso indebido de credenciales o interrupciones del servicio de terceros (proveedor de nube, pasarela de pago). El servicio se ofrece "tal como está".</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">7. Ley aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia se someterá a los tribunales ordinarios de justicia de la ciudad de Santiago.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-800 mb-2">8. Contacto</h2>
            <p>Para consultas sobre estos términos, escríbenos a <a href="mailto:hola@frescopos.cl" className="text-[#91cf5b] hover:underline">hola@frescopos.cl</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
