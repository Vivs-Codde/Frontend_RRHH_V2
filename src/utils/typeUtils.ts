/**
 * Utilidades para facilitar la migración a TypeScript
 */

/**
 * Tipo de utilidad para marcar variables que aún no tienen tipo definido
 * Usar solo durante la migración, luego reemplazar con tipos específicos
 */
export type Todo = any;

/**
 * Función auxiliar para tipar objetos desconocidos o complejos
 * @param obj El objeto que queremos tipar
 * @returns El mismo objeto pero con tipo asignado
 * @example const data = typedAs<User>(responseData);
 */
export function typedAs<T>(obj: unknown): T {
  return obj as T;
}

/**
 * Marca una función como que necesita ser tipada correctamente en el futuro
 * @param message Opcional: mensaje explicando qué se necesita
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function todoType(message?: string): any {
  // Esta función no hace nada en tiempo de ejecución
  // Solo es un marcador para revisiones futuras de código
  console.debug(`[TODO] Tipo pendiente: ${message || 'sin descripción'}`);
  return undefined;
}
