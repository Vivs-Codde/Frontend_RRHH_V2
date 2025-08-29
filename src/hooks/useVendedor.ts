import { useState, useEffect } from 'react';
import { getVendedores } from '../services/entidadesService';

export interface Vendedor {
  id: number;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  comision?: number;
  codigo?: string;
  status?: number;
}

/**
 * Hook personalizado para obtener información de un vendedor por su ID
 * @param vendedorId ID del vendedor a consultar
 */
export const useVendedor = (vendedorId: number | undefined | null) => {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const obtenerVendedor = async () => {
      // Si no hay ID de vendedor, no hacer nada
      if (!vendedorId) {
        setVendedor(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Obtener todos los vendedores
        const respuesta = await getVendedores();
        
        if (respuesta && Array.isArray(respuesta)) {
          // Buscar el vendedor por ID
          const vendedorEncontrado = respuesta.find(v => v.id === vendedorId);
          
          if (vendedorEncontrado) {
            setVendedor(vendedorEncontrado);
          } else {
            console.log(`No se encontró vendedor con ID ${vendedorId}`);
            setVendedor(null);
          }
        } else {
          console.error("Respuesta de API no válida:", respuesta);
          setError("Error en formato de respuesta de API");
        }
      } catch (err: any) {
        console.error("Error al obtener vendedor:", err);
        setError(`Error al obtener datos del vendedor: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };
    
    obtenerVendedor();
  }, [vendedorId]);
  
  return {
    vendedor,
    nombreCompleto: vendedor ? `${vendedor.nombre} ${vendedor.apellido || ''}`.trim() : null,
    loading,
    error
  };
};

/**
 * Hook para manejar un caché de vendedores y mejorar el rendimiento
 */
export const useVendedoresCache = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cacheLoaded, setCacheLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar el caché de vendedores una vez
  useEffect(() => {
    const cargarVendedores = async () => {
      if (cacheLoaded) return;
      
      try {
        setLoading(true);
        const respuesta = await getVendedores();
        
        if (respuesta && Array.isArray(respuesta)) {
          setVendedores(respuesta);
          setCacheLoaded(true);
        } else {
          setError("Error en formato de respuesta de API");
        }
      } catch (err: any) {
        setError(`Error al cargar vendedores: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };
    
    cargarVendedores();
  }, [cacheLoaded]);
  
  // Función para obtener un vendedor por ID desde el caché
  const getVendedorById = (id: number | undefined | null): Vendedor | null => {
    if (!id) return null;
    return vendedores.find(v => v.id === id) || null;
  };
  
  return {
    vendedores,
    getVendedorById,
    loading,
    error,
    cacheLoaded
  };
};
