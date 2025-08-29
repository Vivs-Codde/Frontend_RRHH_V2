import type { Categoria, CreateCategoriaRequest, UpdateCategoriaRequest } from '../types/categoria';
import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

function mapBackendToCategoria(data: any): Categoria {
  return {
    id: data.id,
    tipo: data.tipo,
    nombreCategoria: data.nombreCategoria,
  };
}

export const categoriaService = {
  async getAll(): Promise<Categoria[]> {
    const response = await fetch(API_ENDPOINTS.CATEGORIAS.LIST, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener categorías');
    const data = await response.json();
    return Array.isArray(data)
      ? data.map(mapBackendToCategoria)
      : (data.results || []).map(mapBackendToCategoria);
  },

  async getById(id: number): Promise<Categoria | null> {
    const response = await fetch(`${API_ENDPOINTS.CATEGORIAS.LIST}/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return mapBackendToCategoria(data);
  },

  async create(categoriaData: CreateCategoriaRequest): Promise<Categoria> {
    const payload = {
      tipo: categoriaData.tipo,
      nombreCategoria: categoriaData.nombreCategoria,
    };
    const response = await fetch(API_ENDPOINTS.CATEGORIAS.CREATE, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al crear categoría');
    const data = await response.json();
    return mapBackendToCategoria(data);
  },

  async update(id: number, categoriaData: UpdateCategoriaRequest): Promise<Categoria> {
    const payload = {
      tipo: categoriaData.tipo,
      nombreCategoria: categoriaData.nombreCategoria,
    };
    const response = await fetch(API_ENDPOINTS.CATEGORIAS.UPDATE(id), {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al actualizar categoría');
    const data = await response.json();
    return mapBackendToCategoria(data);
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(API_ENDPOINTS.CATEGORIAS.DELETE(id), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar categoría');
  },
};
