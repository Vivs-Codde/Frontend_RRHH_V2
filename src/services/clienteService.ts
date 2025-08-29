import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';


export const getClientes = async ({ search = '', page = 1, per_page = 10 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (page) params.append('page', String(page));
  if (per_page) params.append('per_page', String(per_page));
  const url = `${API_ENDPOINTS.CLIENTES.LIST}?${params.toString()}`;
  return fetchClienteAPI(url, { method: 'GET' }, 'Error al obtener clientes');
};

export const createCliente = async (data: any) => {
  return fetchClienteAPI(
    API_ENDPOINTS.CLIENTES.CREATE, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    },
    'Error al crear cliente'
  );
};

export const updateCliente = async (id: number | string, data: any) => {
  return fetchClienteAPI(
    API_ENDPOINTS.CLIENTES.UPDATE(id), 
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    },
    'Error al actualizar cliente'
  );
};

export const deleteCliente = async (id: number | string) => {
  return fetchClienteAPI(
    API_ENDPOINTS.CLIENTES.DELETE(id), 
    { method: 'DELETE' },
    'Error al eliminar cliente'
  );
};

export const toggleClienteStatus = async (id: number | string, currentStatus: boolean | number) => {
  return fetchClienteAPI(
    `${API_ENDPOINTS.CLIENTES.UPDATE(id)}/status`, 
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: !(currentStatus === 1 || currentStatus === true) })
    },
    'Error al cambiar estado'
  );
};

export const updateClienteOrden = async (id: number | string, orden: number) => {
  return fetchClienteAPI(
    `${API_ENDPOINTS.CLIENTES.UPDATE(id)}/orden`, 
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orden })
    },
    'Error al actualizar el orden'
  );
};

// Función reutilizable para realizar peticiones
export const fetchClienteAPI = async (url: string, options: RequestInit = {}, errorMsg: string = 'Error en la petición') => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders()
    }
  });
  
  if (!response.ok) {
    throw new Error(errorMsg);
  }
  
  return await response.json();
};

// Funciones para obtener entidades relacionadas con clientes
export const getLocaciones = async () => {
  return fetchClienteAPI(
    API_ENDPOINTS.LOCACIONES.LIST, 
    { method: 'GET' },
    'Error al obtener locaciones'
  );
};

export const getVendedores = async () => {
  return fetchClienteAPI(
    API_ENDPOINTS.VENDEDORES.LIST, 
    { method: 'GET' },
    'Error al obtener vendedores'
  );
};

export const getCoolers = async () => {
  return fetchClienteAPI(
    API_ENDPOINTS.COOLERS.LIST, 
    { method: 'GET' },
    'Error al obtener coolers'
  );
};

export const getCargueras = async () => {
  return fetchClienteAPI(
    API_ENDPOINTS.CARGUERAS.LIST, 
    { method: 'GET' },
    'Error al obtener cargueras'
  );
};

export const getPaises = async () => {
  return fetchClienteAPI(
    API_ENDPOINTS.PAISES.LIST, 
    { method: 'GET' },
    'Error al obtener países'
  );
};
