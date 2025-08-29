import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';
import type { LineaAerea, LineaAereaFormData } from '../types/lineaAerea';

export const lineaAereaService = {
  // Obtener todas las líneas aéreas
  getAll: async (): Promise<LineaAerea[]> => {
    try {
      const response = await fetch(API_ENDPOINTS.LINEAS_AEREAS.LIST, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Error al obtener líneas aéreas');
      }
      return await response.json();
    } catch (err) {
      console.error('Error en getAll líneas aéreas:', err);
      throw err;
    }
  },
  getPaged: async (params: { page?: number; per_page?: number; search?: string; estado?: number }): Promise<any> => {
    try {
      const url = new URL(API_ENDPOINTS.LINEAS_AEREAS.LIST);
      if (params.page) url.searchParams.append('page', params.page.toString());
      if (params.per_page) url.searchParams.append('per_page', params.per_page.toString());
      if (params.search) url.searchParams.append('search', params.search);
      if (params.estado !== undefined) url.searchParams.append('estado', params.estado.toString());
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Error al obtener líneas aéreas');
      }
      return await response.json();
    } catch (err) {
      console.error('Error en getPaged líneas aéreas:', err);
      throw err;
    }
  },

  // Crear una nueva línea aérea
  create: async (data: LineaAereaFormData): Promise<LineaAerea> => {
    try {
      // Adaptar el payload a la API real
      const payload = {
        nombre: data.name,
        codigo: data.code,
        estado: data.status === "Activo" ? true : false,
      };
      const response = await fetch(API_ENDPOINTS.LINEAS_AEREAS.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al crear línea aérea');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en create línea aérea:', error);
      throw error;
    }
  },

  // Actualizar una línea aérea existente
  update: async (id: number, data: LineaAereaFormData): Promise<LineaAerea> => {
    try {
      // Adaptar el payload igual que en create
      const payload = {
        nombre: data.name,
        codigo: data.code,
        estado: data.status === "active" ? true : false,
      };
      const response = await fetch(API_ENDPOINTS.LINEAS_AEREAS.UPDATE(id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar línea aérea');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en update línea aérea:', error);
      throw error;
    }
  },

  // Obtener una línea aérea por ID
  getById: async (id: number): Promise<LineaAerea> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.LINEAS_AEREAS}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener línea aérea');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getById línea aérea:', error);
      throw error;
    }
  },

  // Cambiar estado de línea aérea
  updateStatus: async (id: number, estado: boolean): Promise<void> => {
    try {
      const response = await fetch(API_ENDPOINTS.LINEAS_AEREAS.UPDATE_STATUS(id), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado }),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar estado de línea aérea');
      }
    } catch (error) {
      console.error('Error en updateStatus línea aérea:', error);
      throw error;
    }
  },
};
