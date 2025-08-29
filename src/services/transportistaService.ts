import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';
import type { Transportista } from '../types/transportista';

export const transportistaService = {
  getAll: async (): Promise<Transportista[]> => {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSPORTISTAS.LIST);
      if (!response.ok) throw new Error('Error al obtener transportistas');
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        placa: item.placa,
        propietario: item.propietario,
        modelo: item.modelo,
        ci: item.CI || item.ci || '',
        chofer: item.chofer,
        licencia: item.licencia,
        status: item.estado === 1 ? 'Activo' : 'Inactivo',
        fechaCreacion: item.created_at,
        fechaActualizacion: item.updated_at,
      }));
    } catch (e) {
      throw new Error('No se pudo cargar la lista de transportistas');
    }
  },

  getById: async (id: number): Promise<Transportista | null> => {
    const response = await fetch(API_ENDPOINTS.TRANSPORTISTAS.UPDATE(id));
    if (!response.ok) return null;
    const item = await response.json();
    return {
      id: item.id,
      placa: item.placa,
      propietario: item.propietario,
      modelo: item.modelo,
      ci: item.CI || item.ci || '',
      chofer: item.chofer,
      licencia: item.licencia,
      status: item.estado === 1 ? 'Activo' : 'Inactivo',
      pais: item.pais || '',
      fechaCreacion: item.created_at,
      fechaActualizacion: item.updated_at,
    };
  },

  create: async (transportista: any): Promise<Transportista> => {
    const payload = {
      ...transportista,
      estado: transportista.estado,
      CI: transportista.CI,
      //pais: 'Ecuador', // Forzar país a Ecuador para cumplir con la API
    };
    
    const response = await fetch(API_ENDPOINTS.TRANSPORTISTAS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error detalle backend:', errorText);
      throw new Error('Error al crear transportista');
    }
    const item = await response.json();
    return {
      id: item.id,
      placa: item.placa,
      propietario: item.propietario,
      modelo: item.modelo,
      ci: item.CI || item.ci || '',
      chofer: item.chofer,
      licencia: item.licencia,
      status: item.estado === true || item.estado === 1 ? 'Activo' : 'Inactivo',
      pais: item.pais || '',
      fechaCreacion: item.created_at,
      fechaActualizacion: item.updated_at,
    };
  },

  update: async (id: number, transportista: Partial<Transportista>): Promise<Transportista> => {
    // Adaptar el payload para coincidir con la API backend
    const payload = {
      ...transportista,
      estado: transportista.status === 'Activo' ? true : false,
      CI: transportista.ci || '',
    };
    const response = await fetch(API_ENDPOINTS.TRANSPORTISTAS.UPDATE(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al actualizar transportista');
    const item = await response.json();
    return {
      id: item.id,
      placa: item.placa,
      propietario: item.propietario,
      modelo: item.modelo,
      ci: item.CI || item.ci || '',
      chofer: item.chofer,
      licencia: item.licencia,
      status: item.estado === true || item.estado === 1 ? 'Activo' : 'Inactivo',
      pais: item.pais || '',
      fechaCreacion: item.created_at,
      fechaActualizacion: item.updated_at,
    };
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(API_ENDPOINTS.TRANSPORTISTAS.DELETE(id), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar transportista');
  },

    updateStatus: async (id: number, estado: boolean): Promise<void> => {
    const response = await fetch(API_ENDPOINTS.TRANSPORTISTAS.UPDATE_STATUS(id), {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });
    if (!response.ok) {
      console.error('Error en actualizacion de estado:', response.status);
      const errorText = await response.text().catch(() => null);
      console.error('Detalle del error:', errorText);
      throw new Error('Error al actualizar estado de transportista');
    }
  },
};
