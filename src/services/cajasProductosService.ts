import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';
import type { CajaProductoResponse } from '../types/ventas';

// Obtener cajas asociadas a un producto
export const getCajasProducto = async (producto_id: number): Promise<CajaProductoResponse> => {
  try {
    const url = API_ENDPOINTS.CAJAS_PRODUCTOS.LIST_PRODUCT(producto_id);
    
    console.log(`Consultando API para cajas del producto ${producto_id}: ${url}`);
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error HTTP ${response.status} al obtener cajas:`, errorText);
      throw new Error(`Error al obtener cajas para el producto: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Respuesta API cajasProductos:", data);
    
    return data;
  } catch (error: any) {
    console.error("Error al obtener cajas para el producto:", error);
    throw error;
  }
};
