import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

export interface Color {
  id?: number;
  color: string;
  codigo: string;
  estado: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ColoresResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Color[];
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
 * Obtener lista paginada de colores
 */
export async function getColores(params: { page?: number; per_page?: number; estado?: boolean } = {}): Promise<ColoresResponse> {
  const url = new URL(API_ENDPOINTS.COLORES.LIST);
  
  // Añadir parámetros a la URL si existen
  if (params.page) url.searchParams.append('page', String(params.page));
  if (params.per_page) url.searchParams.append('per_page', String(params.per_page));
  if (params.estado !== undefined) url.searchParams.append('estado', String(params.estado));
  
  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener colores');
  }
  
  return response.json();
}

/**
 * Crear un nuevo color
 */
export async function createColor(colorData: Omit<Color, 'id' | 'created_at' | 'updated_at'>): Promise<Color> {
  const response = await fetch(API_ENDPOINTS.COLORES.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(colorData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear color');
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Actualizar un color existente
 */
export async function updateColor(id: number, colorData: Partial<Color>): Promise<Color> {
  const response = await fetch(API_ENDPOINTS.COLORES.UPDATE(id), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(colorData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al actualizar color con ID ${id}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Eliminar un color
 */
export async function deleteColor(id: number): Promise<any> {
  const response = await fetch(API_ENDPOINTS.COLORES.DELETE(id), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al eliminar color con ID ${id}`);
  }
  
  return response.json();
}

/**
 * Cambiar estado de un color
 */
export async function toggleColorStatus(id: number): Promise<Color> {
  const response = await fetch(API_ENDPOINTS.COLORES.UPDATE_STATUS(id), {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al cambiar estado del color con ID ${id}`);
  }
  
  const data = await response.json();
  return data.data || data;
}
