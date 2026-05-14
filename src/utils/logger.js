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

// Para flujos donde el error es esperado y no interrumpe la UI.
// En producción solo deja traza del contexto, sin exponer el error.
export function logInfo(context, msg) {
  if (import.meta.env.DEV) {
    console.info(`[${context}]`, msg);
  }
}
