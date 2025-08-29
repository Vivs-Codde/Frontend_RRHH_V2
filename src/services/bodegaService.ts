import type { Bodega, CreateBodegaRequest, UpdateBodegaRequest } from '../types/bodega';
import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

function mapBackendToBodega(data: any): Bodega {
  return {
    id: data.id,
    codigo: data.codigo,
    nombre: data.nombre,
    status: data.estado, // backend: estado (boolean)
    fechaCreacion: data.created_at,
    fechaActualizacion: data.updated_at,
  };
}

export const bodegaService = {
  async getAll(): Promise<Bodega[]> {
    const response = await fetch(API_ENDPOINTS.BODEGAS.LIST, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener bodegas');
    const data = await response.json();
    return Array.isArray(data)
      ? data.map(mapBackendToBodega)
      : (data.results || []).map(mapBackendToBodega); // handle paginated or direct array
  },

  async getById(id: number): Promise<Bodega | null> {
    const response = await fetch(`${API_ENDPOINTS.BODEGAS.LIST}/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return mapBackendToBodega(data);
  },

  async create(bodegaData: CreateBodegaRequest): Promise<Bodega> {
    const payload = {
      codigo: bodegaData.codigo,
      nombre: bodegaData.nombre,
      estado: bodegaData.status, // backend expects 'estado'
    };
    const response = await fetch(API_ENDPOINTS.BODEGAS.CREATE, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al crear bodega');
    const data = await response.json();
    return mapBackendToBodega(data);
  },

  async update(id: number, bodegaData: UpdateBodegaRequest): Promise<Bodega> {
    const payload = {
      codigo: bodegaData.codigo,
      nombre: bodegaData.nombre,
      estado: bodegaData.status,
    };
    const response = await fetch(API_ENDPOINTS.BODEGAS.UPDATE(id), {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al actualizar bodega');
    const data = await response.json();
    return mapBackendToBodega(data);
  },

  async updateStatus(id: number, status: boolean): Promise<void> {
    const response = await fetch(API_ENDPOINTS.BODEGAS.UPDATE_STATUS(id), {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado: status }),
    });
    if (!response.ok) throw new Error('Error al actualizar el estado de la bodega');
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(API_ENDPOINTS.BODEGAS.DELETE(id), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar bodega');
  },
};
