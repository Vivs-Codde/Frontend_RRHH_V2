import type { Caja, CajaRequest } from '../types/caja';
import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

function mapBackendToCaja(data: any): Caja {
  return {
    id: data.id,
    name: data.nombre,
    large: data.largo,
    wide: data.ancho,
    hide: data.profundidad,
    equivalent: data.equivalencia,
    weight: data.peso,
    status: typeof data.estado === 'boolean' ? data.estado : Boolean(data.estado),
    fechaCreacion: data.created_at,
    fechaActualizacion: data.updated_at,
  };
}

export const cajaService = {
  async getAll(): Promise<Caja[]> {
    const response = await fetch(`${API_ENDPOINTS.CAJAS.LIST}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener cajas');
    const data = await response.json();
    return Array.isArray(data)
      ? data.map(mapBackendToCaja)
      : (data.results || []).map(mapBackendToCaja);
  },

  async getById(id: number): Promise<Caja | null> {
    const response = await fetch(`${API_ENDPOINTS.CAJAS.LIST}/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return mapBackendToCaja(data);
  },

  async create(cajaData: CajaRequest): Promise<Caja> {
    const payload = {
      nombre: cajaData.name,
      largo: cajaData.large,
      ancho: cajaData.wide,
      profundidad: cajaData.hide,
      equivalencia: cajaData.equivalent,
      peso: cajaData.weight,
      estado: cajaData.status,
    };
    const response = await fetch(`${API_ENDPOINTS.CAJAS.CREATE}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al crear caja');
    const data = await response.json();
    return mapBackendToCaja(data);
  },

  async update(id: number, cajaData: CajaRequest): Promise<Caja> {
    const payload = {
      nombre: cajaData.name,
      largo: cajaData.large,
      ancho: cajaData.wide,
      profundidad: cajaData.hide,
      equivalencia: cajaData.equivalent,
      peso: cajaData.weight,
      estado: cajaData.status,
    };
    const response = await fetch(`${API_ENDPOINTS.CAJAS.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al actualizar caja');
    const data = await response.json();
    return mapBackendToCaja(data);
  },

  async updateStatus(id: number, status: boolean): Promise<void> {
    const response = await fetch(API_ENDPOINTS.CAJAS.UPDATE_STATUS(id), {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado: status }),
    });
    if (!response.ok) throw new Error('Error al actualizar el estado de la caja');
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.CAJAS.DELETE(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar caja');
  },
};
