import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

export interface Finca {
  id?: number;
  nombre: string;
  estado: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FincasResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Finca[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

/**
 * Obtener lista paginada de fincas
 */
export async function getFincas(params: { page?: number; per_page?: number; estado?: boolean } = {}): Promise<FincasResponse> {
  const url = new URL(API_ENDPOINTS.FINCAS.LIST);
  
  // Añadir parámetros a la URL si existen
  if (params.page) url.searchParams.append('page', String(params.page));
  if (params.per_page) url.searchParams.append('per_page', String(params.per_page));
  if (params.estado !== undefined) url.searchParams.append('estado', String(params.estado));
  
  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener fincas');
  }
  
  return response.json();
}

/**
 * Crear una nueva finca
 */
export async function createFinca(fincaData: Omit<Finca, 'id' | 'created_at' | 'updated_at'>): Promise<Finca> {
  const response = await fetch(API_ENDPOINTS.FINCAS.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(fincaData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear finca');
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Actualizar una finca existente
 */
export async function updateFinca(id: number, fincaData: Partial<Finca>): Promise<Finca> {
  const response = await fetch(API_ENDPOINTS.FINCAS.UPDATE(id), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(fincaData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al actualizar finca con ID ${id}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Eliminar una finca
 */
export async function deleteFinca(id: number): Promise<any> {
  const response = await fetch(API_ENDPOINTS.FINCAS.DELETE(id), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al eliminar finca con ID ${id}`);
  }
  
  return response.json();
}

/**
 * Cambiar estado de una finca
 */
export async function toggleFincaStatus(id: number): Promise<Finca> {
  const response = await fetch(API_ENDPOINTS.FINCAS.UPDATE_STATUS(id), {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al cambiar estado de la finca con ID ${id}`);
  }
  
  const data = await response.json();
  return data.data || data;
}
