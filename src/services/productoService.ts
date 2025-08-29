import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';
import type { Producto, ProductoFormData } from '../types/producto';

export const productoService = {
  // Buscar productos por flores con múltiples filtros
  buscarPorFlores: async (params: { 
    estado?: boolean,
    categoria?: string,
    tipos_flores?: string,
    variedades_flores?: string,
    colores_flores?: string,
    calibres_flores?: string,
    min_tallos?: number,
    max_tallos?: number
    precioTotal?: number
    
  } = {}): Promise<Producto[]> => {
    try {
      let url = `${API_ENDPOINTS.PRODUCTOS.LIST}?combinacion_exacta=false&include_stats=false`;
      
      // Agregar todos los parámetros disponibles
      if (typeof params.estado === 'boolean') {
        url += `&estado=${params.estado}`;
      }
      if (params.categoria) {
        url += `&categoria=${encodeURIComponent(params.categoria)}`;
      }
      if (params.tipos_flores) {
        url += `&tipos_flores=${encodeURIComponent(params.tipos_flores)}`;
      }
      if (params.variedades_flores) {
        url += `&variedades_flores=${encodeURIComponent(params.variedades_flores)}`;
      }
      if (params.colores_flores) {
        url += `&colores_flores=${encodeURIComponent(params.colores_flores)}`;
      }
      if (params.calibres_flores) {
        url += `&calibres_flores=${encodeURIComponent(params.calibres_flores)}`;
      }
      if (params.min_tallos) {
        url += `&min_tallos=${params.min_tallos}`;
      }
      if (params.max_tallos) {
        url += `&max_tallos=${params.max_tallos}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Error al buscar productos');
      }
      const data = await response.json();
      if (data && Array.isArray(data.productos)) {
        return data.productos.map((item: any) => ({
          id: item.id,
          SKU: item.sku,
          nombreProducto: item.nombre,
          descripcion: item.descripcion,
          resumen: item.resumen, // Agregamos el campo resumen
          categoria: item.categoria,
          estado: item.estado !== undefined ? (item.estado ? 1 : 0) : 1,
          flores: item.flores, // Incluir la propiedad flores
          precioTotal: item.precioTotal || null, // Incluir precio total
        }));
      }
      return [];
    } catch (error) {
      console.error('Error en buscarPorFlores productos:', error);
      return [];
    }
  },
  // Obtener todos los productos usando la nueva API de búsqueda por flores
  getAll: async (): Promise<Producto[]> => {
    try {
      const url = `${API_ENDPOINTS.PRODUCTOS.LIST}?combinacion_exacta=false&include_stats=false`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para ver los productos.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar los productos`);
      }

      const data = await response.json();
      

      // Extraer el array de productos de la respuesta
      if (data && Array.isArray(data.productos)) {
        // Mapear los campos para que coincidan con Producto y exponer todos los datos relevantes
        return data.productos.map((item: any) => ({
          id: item.id,
          SKU: item.sku,
          nombreProducto: item.nombre,
          descripcion: item.descripcion,
          resumen: item.resumen, // Agregamos el campo resumen
          categoria: item.categoria,
          estado: item.estado,
          flores: item.flores,
          coincidencia: item.coincidencia,
          vendedor: item.vendedor,
          precioTotal: item.precioTotal,
          created_at: item.created_at,
          updated_at: item.updated_at,
          // Puedes agregar más campos si los necesitas
        }));
      }
      return [];
    } catch (error) {
      console.error('Error en getAll productos (por flores):', error);
      throw error;
    }
  },

  // Crear un nuevo producto
  create: async (data: ProductoFormData): Promise<Producto> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCTOS.CREATE}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para crear productos.');
        }
        if (response.status === 422) {
          const errorData = await response.json().catch(() => ({}));
          const errors = errorData.errors || {};
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(errorMessages || 'Datos de producto inválidos.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo crear el producto`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en create producto:', error);
      throw error;
    }
  },

  // Crear un nuevo producto completo
  createCompleto: async (data: any): Promise<any> => {
    try {
      // Asegurarnos que se incluya el campo resumen correctamente
      if (data.resumen) {
        console.log('Enviando producto con resumen:', data.resumen);
      }
      
      // Verificamos que las flores tengan precios individuales
      if (data.flores && Array.isArray(data.flores)) {
        // Transformar los precios para asegurarnos que todos son numéricos o null
        data.flores = data.flores.map(flor => {
          // Variable para almacenar el precio que podría ser numérico o null
          let precioIndividual: number | null = null;
          
          if (flor.precios !== undefined && flor.precios !== null) {
            // Si hay precio específico para la flor, usarlo
            precioIndividual = Number(flor.precios);
          } else if (data.precioTotal && data.flores) {
            // Si no hay precio específico pero hay precio total, calcular proporcionalmente
            const totalTallos = data.flores.reduce((sum, f) => sum + (Number(f.tallos) || 0), 0);
            if (totalTallos > 0) {
              const precioPorTallo = Number(data.precioTotal) / totalTallos;
              precioIndividual = precioPorTallo * (Number(flor.tallos) || 0);
            }
          }
          
          // Asegurarnos de que el precio está en el pivot
          return {
            ...flor,
            precios: precioIndividual !== null ? Number(precioIndividual) : null,
            // Asegurar que existe un objeto pivot con el precio
            pivot: {
              ...(flor.pivot || {}),
              tallos: Number(flor.tallos) || 0,
              orden: flor.orden || 1,
              precios: precioIndividual !== null ? Number(precioIndividual) : null
            }
          };
        });
      }
      
      
      // Preparar los headers incluyendo Content-Type
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      };
      
      // Log final antes de envia
      
      const response = await fetch(`${API_ENDPOINTS.PRODUCTOS.CREATE_COMPLET}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear producto completo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createCompleto producto:', error);
      throw error;
    }
  },

  // Actualizar un producto existente
  update: async (id: number, data: ProductoFormData): Promise<Producto> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCTOS.UPDATE(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para actualizar productos.');
        }
        if (response.status === 404) {
          throw new Error('El producto no fue encontrado.');
        }
        if (response.status === 422) {
          const errorData = await response.json().catch(() => ({}));
          const errors = errorData.errors || {};
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(errorMessages || 'Datos de producto inválidos.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo actualizar el producto`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en update producto:', error);
      throw error;
    }
  },

  // Eliminar un producto
  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCTOS.DELETE(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para eliminar productos.');
        }
        if (response.status === 404) {
          throw new Error('El producto no fue encontrado.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo eliminar el producto`);
      }
    } catch (error) {
      console.error('Error en delete producto:', error);
      throw error;
    }
  },

  // Obtener un producto por ID
  // Actualizar estado de un producto
  updateStatus: async (id: number, estado: boolean): Promise<void> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCTOS.UPDATE_STATUS(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para actualizar el estado de productos.');
        }
        if (response.status === 404) {
          throw new Error('El producto no fue encontrado.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo actualizar el estado del producto`);
      }
    } catch (error) {
      console.error('Error en updateStatus producto:', error);
      throw error;
    }
  },
};
