import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

/**
 * Obtiene los permisos de un rol por su ID
 * @param roleId ID del rol
 * @returns {Promise<{ permisos: string[] }>} Permisos del rol
 */
export async function getRolePermissions(roleId: number): Promise<{ permisos: string[] }> {
  const response = await fetch(API_ENDPOINTS.ROLES_PERMISOS.UPDATE(roleId), {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener permisos del rol');
  return response.json();
}
