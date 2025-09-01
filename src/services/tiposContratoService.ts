import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

export interface TipoContrato {
  id?: number;
  tipo: string;
  estado: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TiposContratoResponse {
  success: boolean;
  data: {
    current_page: number;
    data: TipoContrato[];
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
 * Obtener lista paginada de tipos de contrato
 */
export async function getTiposContrato(params: { page?: number; per_page?: number; estado?: boolean } = {}): Promise<TiposContratoResponse> {
  const url = new URL(API_ENDPOINTS.TIPOS_CONTRATO.LIST);
  
  // Añadir parámetros a la URL si existen
  if (params.page) url.searchParams.append('page', String(params.page));
  if (params.per_page) url.searchParams.append('per_page', String(params.per_page));
  if (params.estado !== undefined) url.searchParams.append('estado', String(params.estado));
  
  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener tipos de contrato');
  }
  
  return response.json();
}

/**
 * Crear un nuevo tipo de contrato
 */
export async function createTipoContrato(tipoContratoData: Omit<TipoContrato, 'id' | 'created_at' | 'updated_at'>): Promise<TipoContrato> {
  const response = await fetch(API_ENDPOINTS.TIPOS_CONTRATO.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tipoContratoData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear tipo de contrato');
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Actualizar un tipo de contrato existente
 */
export async function updateTipoContrato(id: number, tipoContratoData: Partial<TipoContrato>): Promise<TipoContrato> {
  const response = await fetch(API_ENDPOINTS.TIPOS_CONTRATO.UPDATE(id), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(tipoContratoData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al actualizar tipo de contrato con ID ${id}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Eliminar un tipo de contrato
 */
export async function deleteTipoContrato(id: number): Promise<any> {
  const response = await fetch(API_ENDPOINTS.TIPOS_CONTRATO.DELETE(id), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al eliminar tipo de contrato con ID ${id}`);
  }
  
  return response.json();
}

/**
 * Cambiar estado de un tipo de contrato
 */
export async function toggleTipoContratoStatus(id: number): Promise<TipoContrato> {
  const response = await fetch(API_ENDPOINTS.TIPOS_CONTRATO.UPDATE_STATUS(id), {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al cambiar estado del tipo de contrato con ID ${id}`);
  }
  
  const data = await response.json();
  return data.data || data;
}
