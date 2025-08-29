import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../constants/api';



// Interfaz para la cotización
export interface ICotizacion {
  id?: number;
  cliente_id?: number | string;
  vendedor_id?: number | string;
  fecha?: string;
  estado?: string;
  producto?: any;
  paquete?: any;
  precio_total?: number;
  rentabilidad?: string | number;
  comentarios?: string;
  clientes?: any[];
}

// Interfaz para la creación integrada de producto con paquete
export interface IProductoConPaquete {
  producto: {
    sku?: string;
    categoria?: string;
    subcategoria?: string;
    nombre?: string;
    descripcion?: string;
    largo?: number;
    ancho?: number;
    alto?: number;
    peso?: number;
    precioTotal?: number;
    estadoProceso?: string;
    origen?: string;
    resumen?: string;
    vendedor?: string;
    flores?: Array<{
      variedad?: string;
      tipo?: string;
      calibre?: string;
      color?: string;
      precios?: number;
    }>;
  };
  paquete: {
    sku?: string;
    tipo?: 'existente' | 'nuevo';  // Indicar si es un paquete existente o nuevo
    paquete_id?: number;           // Solo para paquetes existentes
    categoria?: string;
    subcategoria?: string;
    precioTotal?: number;
    nombre?: string;
    nombreCliente?: string;
    estadoProceso?: string;
    origen?: string;
    materiales?: Array<{
      material_id: number;
      cantidad: number;
    }>;
  };
  receta?: {
    sku?: string;
    precio?: number;
    estadoProceso?: string;
    origen?: string;
  };
  // Campos adicionales para la cotización
  cliente_id?: number | string;
  vendedor_id?: number | string;
  [key: string]: any; // Para permitir propiedades adicionales
}

/**
 * Guardar una cotización en la base de datos
 */
export const guardarCotizacion = async (cotizacion: ICotizacion) => {
  try {
  const COTIZACION_ENDPOINTS = API_ENDPOINTS.COTIZACION;
  const response = await fetch(COTIZACION_ENDPOINTS.CREATE, {
      method: 'POST',
      headers: {
    ...getAuthHeaders(),
      },
      body: JSON.stringify(cotizacion)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al guardar la cotización');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en guardarCotizacion:', error);
    throw error;
  }
};

/**
 * Guardar cotizaciones masivas para múltiples clientes
 */
export const guardarCotizacionesMasivas = async (cotizaciones: ICotizacion[]) => {
  try {
  const COTIZACION_ENDPOINTS = API_ENDPOINTS.COTIZACION;
  // If the API doesn't expose a dedicated bulk endpoint, fall back to the standard create endpoint
  const GUARDAR_MASIVO = (COTIZACION_ENDPOINTS as any).GUARDAR_MASIVO || COTIZACION_ENDPOINTS.CREATE;
  const response = await fetch(GUARDAR_MASIVO, {
      method: 'POST',
      headers: {
    ...getAuthHeaders(),
      },
      body: JSON.stringify({ cotizaciones })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al guardar las cotizaciones');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en guardarCotizacionesMasivas:', error);
    throw error;
  }
};

/**
 * Obtener todas las cotizaciones
 */
export const obtenerCotizaciones = async () => {
  try {
    const COTIZACION_ENDPOINTS = API_ENDPOINTS.COTIZACION;
    const response = await fetch(COTIZACION_ENDPOINTS.LIST, {
      headers: {
        ...getAuthHeaders()
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las cotizaciones');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerCotizaciones:', error);
    throw error;
  }
};

/**
 * Obtener una cotización por ID
 */
export const obtenerCotizacionPorId = async (id: number | string) => {
  try {
    const COTIZACION_ENDPOINTS = API_ENDPOINTS.COTIZACION;
    // API does not define a GET helper for single resource; use the UPDATE(id) pattern which points to the same resource path
    const GET_ENDPOINT = (COTIZACION_ENDPOINTS as any).GET || COTIZACION_ENDPOINTS.UPDATE;
    const response = await fetch(GET_ENDPOINT(id), {
      headers: {
        ...getAuthHeaders()
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener la cotización');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error en obtenerCotizacionPorId(${id}):`, error);
    throw error;
  }
};

/**
 * Actualizar una cotización existente
 */
export const actualizarCotizacion = async (id: number | string, cotizacion: ICotizacion) => {
  try {
  const COTIZACION_ENDPOINTS = API_ENDPOINTS.COTIZACION;
  const response = await fetch(COTIZACION_ENDPOINTS.UPDATE(id), {
      method: 'PUT',
      headers: {
    ...getAuthHeaders(),
      },
      body: JSON.stringify(cotizacion)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar la cotización');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error en actualizarCotizacion(${id}):`, error);
    throw error;
  }
};

/**
 * Eliminar una cotización
 */
export const eliminarCotizacion = async (id: number | string) => {
  try {
    const COTIZACION_ENDPOINTS = API_ENDPOINTS.COTIZACION;
    const response = await fetch(COTIZACION_ENDPOINTS.DELETE(id), {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la cotización');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error en eliminarCotizacion(${id}):`, error);
    throw error;
  }
};

/**
 * Crear producto con paquete para cotización en una sola llamada API
 * @param data Datos del producto, paquete y receta integrados
 */
export const crearProductoConPaquete = async (data: IProductoConPaquete) => {
  try {
    // Log completo para debugging de la estructura exacta que enviamos
  const COTIZACION_ENDPOINTS = API_ENDPOINTS.COTIZACION;
    const headers = {
      ...getAuthHeaders(),
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    const response = await fetch(COTIZACION_ENDPOINTS.CREATE, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    // Si la respuesta no es OK, intentar obtener el mensaje de error
    if (!response.ok) {
      // Comprobar primero el tipo de contenido de la respuesta
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        // Si es JSON, intentamos procesarlo y adjuntar detalles para debugging
        const errorData = await response.json();
        console.error('API validation error:', errorData);
        const err = new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        // attach full error payload so callers can inspect validation messages
        // @ts-ignore
        err.details = errorData;
        throw err;
      } else {
        // Si no es JSON, solo devolvemos el texto del error
        const errorText = await response.text();
        console.error('Respuesta no-JSON del servidor:', errorText);
        throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
      }
    }
    
    // Si la respuesta es OK, devolver el JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.warn('Respuesta no-JSON recibida:', text);
      return { message: 'Operación completada', text };
    }
  } catch (error) {
    console.error('Error en crearProductoConPaquete:', error);
    throw error;
  }
};
