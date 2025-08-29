/**
 * Tipos comunes utilizados en toda la aplicación
 */

/**
 * Representa una respuesta genérica de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | Error;
  status?: number;
}

/**
 * Opciones comunes para paginación
 */
export interface PaginationOptions {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

/**
 * Respuesta paginada desde el servidor
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

/**
 * Estado genérico (activo/inactivo)
 */
export enum Status {
  Inactive = 0,
  Active = 1
}

/**
 * Datos comunes para entidades básicas
 */
export interface BaseEntity {
  id: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  estado?: Status;
}

/**
 * Opciones para componentes Select
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * Posibles respuestas para acciones
 */
export type ActionResult = {
  success: boolean;
  message?: string;
  data?: any;
};

/**
 * Función para obtener un mensaje de error amigable
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ocurrió un error desconocido';
}
