import { API_BASE_URL, getAuthHeaders,API_ENDPOINTS} from '../constants/api';

// Endpoints específicos para precios - Movido desde api.ts
export const PRECIOS_ENDPOINTS = {
  LIST: `${API_BASE_URL}/api/ven-precios`,
  GET_BY_FILTERS: (categoria?: string, medida?: string) => {
    let url = `${API_BASE_URL}/api/ven-precios`;
    const params = new URLSearchParams();
    
    // Agregar los parámetros que estén presentes
    if (categoria) params.append('categoria', categoria.toLowerCase());
    if (medida) params.append('medida', medida);
    
    // Agregar los parámetros a la URL
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }
};

export interface PrecioItem {
  Id: number;
  Categoria: string;
  Medida: string | null;
  Precio: string;
  preciosDesglose?: string;
  preciosEQR?: string;
}
export const createPrecio = async (nuevoPrecio: PrecioItem): Promise<PrecioItem | null> => {
  try {
    // Crear copia del objeto para no modificar el original
    const precioFormatted = {
      ...nuevoPrecio,
      Precio: parseFloat(nuevoPrecio.Precio) || 0, // Convertir a número si es posible
      preciosDesglose: nuevoPrecio.preciosDesglose || "",
      preciosEQR: nuevoPrecio.preciosEQR || ""
    };

    const response = await fetch(API_ENDPOINTS.PRECIOS.CREATE, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(precioFormatted),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: No se pudo crear el precio`);
    }
  } catch (error) {
    return null;
  }
}
//Editar precio
export const updatePrecio = async (id: number, precioActualizado: PrecioItem): Promise<PrecioItem | null> => {
  try {
    // Usamos el endpoint correcto de la API para actualizar precio
    const response = await fetch(API_ENDPOINTS.PRECIOS.UPDATE(id), {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      // Formateamos el cuerpo de la solicitud según el formato esperado por la API
      body: JSON.stringify({
        Categoria: precioActualizado.Categoria,
        Medida: precioActualizado.Medida,
        Precio: parseFloat(precioActualizado.Precio) || 0, // Convertir a número si es posible
        preciosDesglose: precioActualizado.preciosDesglose || "",
        preciosEQR: precioActualizado.preciosEQR || ""
      }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      // Intentar obtener el mensaje de error detallado
      try {
        const errorData = await response.text();
        console.error("Error actualizando precio:", errorData);
        throw new Error(`Error ${response.status}: No se pudo actualizar el precio. ${errorData}`);
      } catch (e) {
        throw new Error(`Error ${response.status}: No se pudo actualizar el precio`);
      }
    }
  } catch (error) {
    console.error("Error en updatePrecio:", error);
    return null;
  }
}

export const precioService = {
  // Obtener todos los precios
  getAllPrecios: async (): Promise<PrecioItem[]> => {
    try {
      const response = await fetch(PRECIOS_ENDPOINTS.LIST, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar los precios`);
      }

        return await response.json();
      } catch (error) {
        return [];
    }
  },

  // Obtener precios filtrados por categoría y/o medida
  getPreciosFiltered: async (categoria?: string, medida?: string): Promise<PrecioItem[]> => {
    try {
      const url = PRECIOS_ENDPOINTS.GET_BY_FILTERS(categoria, medida);

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar los precios filtrados`);
      }

        const data = await response.json();
        return data;
    } catch (error) {
      return [];
    }
  },

  // Obtener precio específico por categoría y medida
  // Aquí la categoría realmente es la subcategoría del formulario (Roses, Carnations, etc.)
  getPrecioEspecifico: async (categoria: string, medida?: string): Promise<string | null> => {
    try {
      
      // Primero intentar con una llamada directa si tenemos ambos parámetros
      if (categoria && medida) {
        // Usar la función existente para construir la URL correctamente
        const url = PRECIOS_ENDPOINTS.GET_BY_FILTERS(categoria, medida);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 0) {
            return data[0].Precio;
          } else {
          }
        } else {
          try {
              const errorText = await response.text();
          } catch(e) {
          }
        }
      }
      
      // Si la llamada directa falló o no teníamos ambos parámetros, usar el método normal
      const precios = await precioService.getPreciosFiltered(categoria, medida);
      
      if (precios.length > 0) {
        // Si encontró un precio específico para la categoría y medida
        return precios[0].Precio;
      }
      
      // Si no encontró con la medida, buscar solo por categoría (para cuando medida es null)
      if (medida) {
        const preciosSoloCategoria = await precioService.getPreciosFiltered(categoria);
        
        if (preciosSoloCategoria.length > 0) {
          return preciosSoloCategoria[0].Precio;
        }
      }
      
      // Último intento: probar con la categoría en minúsculas
      const preciosCategoriaMinuscula = await precioService.getPreciosFiltered(categoria.toLowerCase());
      
      if (preciosCategoriaMinuscula.length > 0) {
        return preciosCategoriaMinuscula[0].Precio;
      }
      
   
      return null;
    } catch (error) {
      return null;
    }
  }
};
