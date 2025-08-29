import { useState, useEffect } from 'react';
import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';

export interface Ubicacion {
  id: number;
  nombre: string;
  latitud?: string;
  longitud?: string;
  direccion?: string;
}

export interface Vendedor {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  ubicacion?: string;
}

export interface Carguera {
  id: number;
  nombre: string;
  ruc?: string;
  tipo?: string;
  representante?: string;
  telefono?: string;
  email?: string;
}

export interface Pais {
  id: number;
  nombre: string;
  codigo?: string;
  continente?: string;
}

export const useApiData = () => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cargueras, setCargueras] = useState<Carguera[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState({
    ubicaciones: false,
    vendedores: false,
    cargueras: false,
    paises: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Función genérica para hacer fetch
  const fetchData = async <T>(url: string, setter: (data: T[]) => void, loadingKey: keyof typeof loading) => {
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    setError(null);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
     
      
      // Verificar si la respuesta tiene la estructura esperada
      const items = Array.isArray(data) ? data : (data.data || data.items || []);
      setter(items);
    } catch (error) {
      console.error(`Error al obtener datos de ${url}:`, error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setter([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Cargar ubicaciones
  const loadUbicaciones = () => {
    fetchData<Ubicacion>(API_ENDPOINTS.LOCACIONES.LIST, setUbicaciones, 'ubicaciones');
  };
  // Cargar vendedores
  const loadVendedores = () => {
    fetchData<Vendedor>(API_ENDPOINTS.VENDEDORES.LIST, setVendedores, 'vendedores');
  };
  // Cargar cargueras
  const loadCargueras = () => {
    fetchData<Carguera>(API_ENDPOINTS.CARGUERAS.LIST, setCargueras, 'cargueras');
  };
  // Cargar países
  const loadPaises = () => {
    fetchData<Pais>(API_ENDPOINTS.PAISES.LIST, setPaises, 'paises');
  };

  // Efecto para cargar todos los datos al montar el hook
  useEffect(() => {
    loadUbicaciones();
    loadVendedores();
    loadCargueras();
    loadPaises();
  }, []);

  // Función para recargar todos los datos
  const refetchAll = () => {
    loadUbicaciones();
    loadVendedores();
    loadCargueras();
    loadPaises();
  };

  return {
    ubicaciones,
    vendedores,
    cargueras,
    paises,
    loading,
    error,
    refetchAll,
    loadUbicaciones,
    loadVendedores,
    loadCargueras,
    loadPaises,
  };
};
