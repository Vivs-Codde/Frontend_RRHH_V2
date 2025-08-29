import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

export async function getAllRoles() {
  const response = await fetch(API_ENDPOINTS.ROLES.LIST, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener roles');
  return response.json();
}

export async function createRole(name) {
  const response = await fetch(API_ENDPOINTS.ROLES.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Error al crear rol');
  return response.json();
}
