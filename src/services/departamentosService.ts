import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

export interface Departamento {
  id?: number;
  nombre: string;
  color: string;
  estado: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DepartamentosResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Departamento[];
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
 * Obtener lista paginada de departamentos
 */
export async function getDepartamentos(params: { page?: number; per_page?: number; estado?: boolean } = {}): Promise<DepartamentosResponse> {
  const url = new URL(API_ENDPOINTS.DEPARTAMENTOS.LIST);
  
  // Añadir parámetros a la URL si existen
  if (params.page) url.searchParams.append('page', String(params.page));
  if (params.per_page) url.searchParams.append('per_page', String(params.per_page));
  if (params.estado !== undefined) url.searchParams.append('estado', String(params.estado));
  
  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener departamentos');
  }
  
  return response.json();
}

/**
 * Crear un nuevo departamento
 */
export async function createDepartamento(departamentoData: Omit<Departamento, 'id' | 'created_at' | 'updated_at'>): Promise<Departamento> {
  const response = await fetch(API_ENDPOINTS.DEPARTAMENTOS.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(departamentoData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear departamento');
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Actualizar un departamento existente
 */
export async function updateDepartamento(id: number, departamentoData: Partial<Departamento>): Promise<Departamento> {
  const response = await fetch(API_ENDPOINTS.DEPARTAMENTOS.UPDATE(id), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(departamentoData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al actualizar departamento con ID ${id}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Eliminar un departamento
 */
export async function deleteDepartamento(id: number): Promise<any> {
  const response = await fetch(API_ENDPOINTS.DEPARTAMENTOS.DELETE(id), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al eliminar departamento con ID ${id}`);
  }
  
  return response.json();
}

/**
 * Cambiar estado de un departamento
 */
export async function toggleDepartamentoStatus(id: number): Promise<Departamento> {
  const response = await fetch(API_ENDPOINTS.DEPARTAMENTOS.UPDATE_STATUS(id), {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al cambiar estado del departamento con ID ${id}`);
  }
  
  const data = await response.json();
  return data.data || data;
}
