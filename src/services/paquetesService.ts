
import { API_ENDPOINTS, getAuthHeaders, API_CONFIG } from '../constants/api';

// Utilidad para manejar errores y timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = API_CONFIG.TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Listar paquetes
/**
 * Obtiene paquetes con filtros y paginación.
 * @param params { busqueda?: string; limit?: number; offset?: number }
 */
export async function getPaquetes(params?: { busqueda?: string; limit?: number; offset?: number }) {
  const query = new URLSearchParams();
  if (params?.busqueda) query.append('busqueda', params.busqueda);
  if (params?.limit !== undefined) query.append('limit', String(params.limit));
  if (params?.offset !== undefined) query.append('offset', String(params.offset));
  let url = API_ENDPOINTS.PAQUETES.LIST;
  if (query.toString()) url += `?${query.toString()}`;
  const response = await fetchWithTimeout(
    url,
    { headers: getAuthHeaders() }
  );
  if (!response.ok) throw new Error('Error al obtener paquetes');
  return response.json();
}

// Crear paquete
export async function createPaquete(data: {
  categoria: string;
  subcategoria: string;
  SKU: string;
  nombre: string;
  nombreCliente: string;
  estado: boolean;
  precioTotal: number;
  materiales: { material_id: number; cantidad: number }[];
}) {
  const response = await fetchWithTimeout(
    API_ENDPOINTS.PAQUETES.CREATE,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) throw new Error('Error al crear paquete');
  return response.json();
}

// Actualizar paquete
export async function updatePaquete(id: number, data: Partial<{
  categoria: string;
  subcategoria: string;
  SKU: string;
  nombre: string;
  nombreCliente: string;
  estado: boolean;
  precioTotal: number;
  materiales: { material_id: number; cantidad: number }[];
}>) {
  const response = await fetchWithTimeout(
    API_ENDPOINTS.PAQUETES.UPDATE(id),
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) throw new Error('Error al actualizar paquete');
  return response.json();
}

// Eliminar paquete
export async function deletePaquete(id: number) {
  const response = await fetchWithTimeout(
    API_ENDPOINTS.PAQUETES.DELETE(id),
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );
  if (!response.ok) throw new Error('Error al eliminar paquete');
  return response.json();
}

// Actualizar estado de paquete
export async function updatePaqueteStatus(id: number, estado: boolean) {
  const response = await fetchWithTimeout(
    API_ENDPOINTS.PAQUETES.UPDATE_STATUS(id),
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado }),
    }
  );
  if (!response.ok) throw new Error('Error al actualizar estado del paquete');
  return response.json();
}
