import { API_ENDPOINTS, getAuthHeaders, API_CONFIG } from '../constants/api';

// --- CARGUERAS ---
export async function getCargueras() {
  const response = await fetch(API_ENDPOINTS.CARGUERAS.LIST, {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  if (!response.ok) throw new Error('Error al obtener cargueras');
  return response.json();
}

export async function createCarguera(data) {
  const response = await fetch(API_ENDPOINTS.CARGUERAS.CREATE, {
    headers: getAuthHeaders(),
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al crear carguera');
  return response.json();
}

export async function updateCargueraStatus(id: number, estado: boolean) {
  const response = await fetch(API_ENDPOINTS.CARGUERAS.UPDATE_STATUS(id), {
    headers: getAuthHeaders(),
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) throw new Error('Error al actualizar estado de carguera');
  return response.json();
}

// --- COOLERS ---
export async function getCoolers() {
  const response = await fetch(API_ENDPOINTS.COOLERS.LIST, {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  if (!response.ok) throw new Error('Error al obtener coolers');
  return response.json();
}

export async function createCooler(data) {
  const response = await fetch(API_ENDPOINTS.COOLERS.CREATE, {
    headers: getAuthHeaders(),
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al crear cooler');
  return response.json();
}

export async function updateCoolerStatus(id: number, estado: boolean) {
  const response = await fetch(API_ENDPOINTS.COOLERS.UPDATE_STATUS(id), {
    headers: getAuthHeaders(),
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) throw new Error('Error al actualizar estado de cooler');
  return response.json();
}

// --- LOCACIONES ---
export async function getLocaciones() {
  const response = await fetch(API_ENDPOINTS.LOCACIONES.LIST, {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  if (!response.ok) throw new Error('Error al obtener locaciones');
  return response.json();
}

export async function createLocacion(data) {
  const response = await fetch(API_ENDPOINTS.LOCACIONES.CREATE, {
    headers: getAuthHeaders(),
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = null;
    }
    // Always throw backend error message if present
    if (errorData && errorData.message) {
      const error: Error & { errors?: any } = new Error(errorData.message);
      error.name = 'BackendError';
      error.errors = errorData.errors;
      throw error;
    }
    throw new Error('Error al crear locación');
  }
  return response.json();
}

export async function updateLocacionStatus(id: number, estado: boolean) {
  const response = await fetch(API_ENDPOINTS.LOCACIONES.UPDATE_STATUS(id), {
    headers: getAuthHeaders(),
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) throw new Error('Error al actualizar estado de locación');
  return response.json();
}

// --- VENDEDORES ---
export async function getVendedores() {
  const response = await fetch(API_ENDPOINTS.VENDEDORES.LIST, {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  if (!response.ok) throw new Error('Error al obtener vendedores');
  return response.json();
}

// --- TRANSPORTISTAS ---
export async function getTransportistas() {
  const response = await fetch(API_ENDPOINTS.TRANSPORTISTAS.LIST, {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  if (!response.ok) throw new Error('Error al obtener transportistas');
  return response.json();
}

export async function createVendedor(data) {
  const response = await fetch(API_ENDPOINTS.VENDEDORES.CREATE, {
    headers: getAuthHeaders(),
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    // Intentamos obtener más información sobre el error
    const errorData = await response.json().catch(() => null);
    console.error('Error en createVendedor:', response.status, errorData);
    throw new Error(errorData?.message || 'Error al crear vendedor');
  }
  
  return response.json();
}

export async function updateVendedorStatus(id: number, estado: boolean) {
  const response = await fetch(API_ENDPOINTS.VENDEDORES.UPDATE_STATUS(id), {
    headers: getAuthHeaders(),
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) throw new Error('Error al actualizar estado de vendedor');
  return response.json();
}

// --- PAISES ---
export async function getPaises() {
  const response = await fetch(API_ENDPOINTS.PAISES.LIST, {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  if (!response.ok) throw new Error('Error al obtener países');
  return response.json();
}

export async function createPais(data) {
  const response = await fetch(API_ENDPOINTS.PAISES.CREATE, {
    headers: getAuthHeaders(),
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = null;
    }
    // Si el backend envía errores específicos, los lanzamos
    if (errorData && errorData.message) {
      const error: Error & { errors?: any } = new Error(errorData.message);
      error.name = 'BackendError';
      error.errors = errorData.errors;
      throw error;
    }
    throw new Error('Error al crear país');
  }
  return response.json();
}

export async function updatePaisStatus(id: number, estado: boolean) {
  const response = await fetch(API_ENDPOINTS.PAISES.UPDATE_STATUS(id), {
    headers: getAuthHeaders(),
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) throw new Error('Error al actualizar estado de país');
  return response.json();
}
