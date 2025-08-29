/**
 * Este archivo proporciona utilidades para ayudar con la migración a TypeScript
 * en los servicios de API.
 */
import { ApiResponse } from '../types/common';

/**
 * Envoltorio seguro para peticiones fetch
 * @param url URL de la petición
 * @param options Opciones de fetch
 * @returns Respuesta procesada
 */
export async function safeFetch<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    
    // Para respuestas no-JSON
    if (!response.headers.get('content-type')?.includes('application/json')) {
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Operación exitosa' : 'Error en la solicitud',
      };
    }
    
    // Para respuestas JSON
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? data : undefined,
      error: !response.ok ? data : undefined,
      message: data.message || (response.ok ? 'Operación exitosa' : 'Error en la solicitud'),
    };
  } catch (error) {
    console.error('Error en la petición fetch:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Error desconocido'),
      message: error instanceof Error ? error.message : 'Error desconocido en la solicitud',
    };
  }
}

/**
 * Gestor de errores para servicios API
 * @param error Error capturado
 * @param defaultMessage Mensaje por defecto si no se puede determinar
 * @returns Mensaje de error formateado
 */
export function handleApiError(error: unknown, defaultMessage = 'Error en la solicitud'): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    // @ts-ignore - Ignoramos el error de tipado aquí durante la migración
    const message = error.message || error.error || error.errorMessage;
    if (message && typeof message === 'string') {
      return message;
    }
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
}
