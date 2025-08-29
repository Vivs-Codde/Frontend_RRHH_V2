
import { API_PRODUCTOS_BUSCAR_POR_FLORES } from '../constants/apiCultivo';

// Buscar productos por descripción usando la API de flores
export const buscarProductosPorDescripcion = async (descripcion) => {
  const url = `${API_PRODUCTOS_BUSCAR_POR_FLORES}?descripcion=${encodeURIComponent(descripcion)}`;
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('Error al buscar productos');
  return await response.json();
};
import { API_ENDPOINTS, getAuthHeaders, API_CONFIG } from '../constants/api';

export const getAsignaciones = async () => {
  const response = await fetch(API_ENDPOINTS.ASIGNACIONES.LIST, {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  if (!response.ok) throw new Error('Error al obtener asignaciones');
  return await response.json();
};

// POST para crear asignación
export const crearAsignacion = async (data) => {
  const response = await fetch(API_ENDPOINTS.ASIGNACIONES.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al crear asignación');
  return await response.json();
};
// PUT para actualizar asignación
export const actualizarAsignacion = async (id, data) => {
  const url = API_ENDPOINTS.ASIGNACIONES.UPDATE(id);
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al actualizar asignación');
  return await response.json();
};