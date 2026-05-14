// En desarrollo: muestra contexto + error completo con stack trace.
// En producción: muestra solo el contexto para no exponer internos en la consola del navegador.
// Punto de extensión futuro: conectar a Sentry u otro servicio de monitoreo aquí.
export function logError(context, err) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, err);
  } else {
    console.error(`[${context}] Error inesperado.`);
  }
}
