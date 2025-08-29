import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

export async function updateRolePermissions(roleId, permissions) {
  const response = await fetch(API_ENDPOINTS.ROLES_PERMISOS.UPDATE(roleId), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ permissions }),
  });
  if (!response.ok) throw new Error('Error al actualizar permisos');
  return response.json();
}

// Nueva función para obtener todos los permisos
export async function getAllPermissions() {
  const response = await fetch(API_ENDPOINTS.TIPOS.LIST, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener permisos');
  return response.json();
}

// Obtener permisos asignados a un rol específico
export async function getPermissionsByRole(roleId) {
  const response = await fetch(API_ENDPOINTS.ROLES_PERMISOS.LIST(roleId), {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener permisos del rol');
  return response.json();
}

// Crear un nuevo permiso
export async function createPermission(name, module, action) {
  const response = await fetch(API_ENDPOINTS.TIPOS.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, module, action }),
  });
  if (!response.ok) throw new Error('Error al crear permiso');
  return response.json();
}
