import { API_ENDPOINTS, getAuthHeaders, API_BASE_URL } from '../constants/api';

// Obtener lista de ventas
export const getVentas = async ({ search = '', page = 1, per_page = 10 } = {}) => {

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (page) params.append('page', String(page));
  if (per_page) params.append('per_page', String(per_page));
  
  const url = `${API_ENDPOINTS.VENTAS.LIST}?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      method: 'GET',
    });
    
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    throw error;
  }
};

// Crear nueva venta
export const crearVenta = async (data) => {
  // Consumir la API real directamente

  const url = API_ENDPOINTS.VENTAS.CREATE;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      let errorMsg = 'Error al crear venta';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorJson = await response.json();
          errorMsg = errorJson.error || errorJson.message || JSON.stringify(errorJson);
        } else {
          errorMsg = await response.text();
        }
      } catch (err) {
        // Si falla el parseo, dejar mensaje genérico
      }
      throw new Error(errorMsg);
    }
    
    return response.json();
  } catch (error) {
    console.error("Error al crear venta:", error);
    throw error;
  }
};

// Obtener asignaciones por cliente
export const getAsignacionesPorCliente = async (clienteId) => {
  if (!clienteId) {
    console.log("No se proporcionó ID de cliente");
    throw new Error("Se requiere un ID de cliente para obtener las asignaciones");
  }
  
  // Usar el endpoint principal de la API
  const url = `${API_ENDPOINTS.ASIGNACIONES.LIST}?cliente_id=${clienteId}`;
  
  try {
    console.log(`Obteniendo asignaciones para el cliente ${clienteId} desde: ${url}`);
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      method: 'GET',
    });
    
    if (!response.ok) {
      // Si el primer endpoint falla, intentar con uno alternativo
      console.warn(`Error en endpoint principal: ${response.status} ${response.statusText}`);
      
      // Intentar con endpoint alternativo
      const alternativeUrl = `${API_BASE_URL}/api/clientes/${clienteId}/asignaciones`;
      console.log(`Intentando endpoint alternativo: ${alternativeUrl}`);
      
      const alternativeResponse = await fetch(alternativeUrl, {
        headers: getAuthHeaders(),
        method: 'GET',
      });
      
      if (!alternativeResponse.ok) {
        throw new Error(`Error al obtener asignaciones: ${alternativeResponse.status} ${alternativeResponse.statusText}`);
      }
      
      const data = await alternativeResponse.json();
      console.log("Asignaciones obtenidas desde endpoint alternativo:", data);
      return data;
    }
    
    const data = await response.json();
    console.log("Asignaciones obtenidas correctamente:", data);
    
    // Verificar si los datos tienen formato válido
    if (data === null || data === undefined || 
        (Array.isArray(data) && data.length === 0)) {
      throw new Error("El cliente no tiene asignaciones disponibles");
    }
    
    return data;
  } catch (error) {
    console.error("Error al obtener asignaciones del cliente:", error);
    throw new Error(`No se pudieron obtener las asignaciones del cliente: ${error.message}`);
  }
};

// Obtener asignaciones por nombre de cliente
export const getAsignacionesPorNombreCliente = async (nombreCliente) => {
  if (!nombreCliente) {
    console.log("No se proporcionó nombre de cliente");
    throw new Error("Se requiere el nombre del cliente para obtener las asignaciones");
  }
  
  // Codificar el nombre para la URL
  const nombreClienteEncoded = encodeURIComponent(nombreCliente);
  
  // Usar el endpoint que permite búsqueda por nombre de cliente
  const url = `${API_ENDPOINTS.ASIGNACIONES.LIST}?cliente=${nombreClienteEncoded}`;
  
  try {
    console.log(`Obteniendo asignaciones para el cliente "${nombreCliente}" desde: ${url}`);
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      method: 'GET',
    });
    
    if (!response.ok) {
      console.warn(`Error al buscar por nombre: ${response.status} ${response.statusText}`);
      throw new Error(`Error al obtener asignaciones: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Asignaciones obtenidas por nombre de cliente:", data);
    
    // Verificar si los datos tienen formato válido
    if (data === null || data === undefined || 
        (Array.isArray(data) && data.length === 0)) {
      throw new Error(`No se encontraron asignaciones para el cliente "${nombreCliente}"`);
    }
    
    return data;
  } catch (error) {
    console.error("Error al obtener asignaciones por nombre de cliente:", error);
    throw new Error(`No se pudieron obtener las asignaciones del cliente "${nombreCliente}": ${error.message}`);
  }
};

// Obtener marcaciones de un cliente
export const getMarcacionesCliente = async (clienteId) => {
  if (!clienteId) {
    console.log("No se proporcionó ID de cliente");
    throw new Error("Se requiere un ID de cliente para obtener las marcaciones");
  }
  
  const url = `${API_BASE_URL}/api/clientes/${clienteId}/marcaciones/count`;
  
  try {
    console.log(`Obteniendo marcaciones para el cliente ${clienteId} desde: ${url}`);
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener marcaciones: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Marcaciones obtenidas correctamente:", data);
    
    return data;
  } catch (error) {
    console.error("Error al obtener marcaciones:", error);
    throw error;
  }
};

// Actualizar venta
export const actualizarVenta = async (id, data) => {
  const url = API_ENDPOINTS.VENTAS.UPDATE(id);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Error al actualizar venta');
  return response.json();
};

// Eliminar venta
export const eliminarVenta = async (id) => {
  const url = API_ENDPOINTS.VENTAS.DELETE(id);
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) throw new Error('Error al eliminar venta');
  return response.json();
};
