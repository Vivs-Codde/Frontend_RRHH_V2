import { useState, useEffect, useRef } from 'react';
import { precioService } from '../services/precioService';
import type { PrecioItem } from '../services/precioService';


interface UsePreciosVentaProps {
  categoria?: string;
  medida?: string;
  tallos?: string | number;
}

export const usePreciosVenta = ({ 
  categoria, 
  medida, 
  tallos 
}: UsePreciosVentaProps) => {
  const [precioUnitario, setPrecioUnitario] = useState<string | null>(null);
  const [precioTotal, setPrecioTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Normaliza la categoría para que coincida con el formato de la API
  // Ahora recibimos directamente la subcategoría, así que necesitamos:
  // 1. Para "Assorted" o "Rainbow", usar la segunda palabra en adelante
  // 2. Normalizar la primera letra a mayúscula para el formato que espera la API
  const normalizarCategoria = (cat?: string): string | undefined => {
    if (!cat) return undefined;
    
    // Para categorías que vienen directamente como string
    if (typeof cat === 'string') {
      // Si la subcategoría comienza con "Assorted" o "Rainbow", tomar desde la segunda palabra
      if (cat.startsWith('Assorted') || cat.startsWith('Rainbow')) {
        // Dividir por espacios y tomar desde la segunda palabra
        const palabras = cat.split(' ');
        if (palabras.length > 1) {
          // Unir desde la segunda palabra
          const segundaParte = palabras.slice(1).join(' ');
          
          // Normalizar la primera letra de la segunda parte
          const normalizado = segundaParte.charAt(0).toUpperCase() + segundaParte.slice(1);
          return normalizado;
        }
      }
    }
    
    // Para el caso normal, convertir primera letra a mayúscula
    const normalizado = cat.charAt(0).toUpperCase() + cat.slice(1);
    return normalizado;
  };

  // Ref para el timeout de debounce
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Limpiamos el timeout anterior si existe
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    const fetchPrecio = async () => {
      
      if (!categoria) {
        setPrecioUnitario(null);
        setPrecioTotal(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const categoriaApi = normalizarCategoria(categoria);
        
        // Si no hay una categoría normalizada, no hacemos la búsqueda
        if (!categoriaApi) {
          setPrecioUnitario(null);
          setPrecioTotal(null);
          setLoading(false);
          return;
        }
        
        // Buscar el precio según la categoría y medida
        const precio = await precioService.getPrecioEspecifico(categoriaApi, medida);
        
        setPrecioUnitario(precio);
        
        // Calcular el precio total si hay tallos y precio unitario
        if (precio && tallos) {
          const cantidad = Number(tallos);
          const unitario = Number(precio);
          
          if (!isNaN(cantidad) && !isNaN(unitario)) {
            const total = cantidad * unitario;
            setPrecioTotal(total);
          } else {
            setPrecioTotal(null);
          }
        } else {
          setPrecioTotal(null);
        }
      } catch (err) {
        setError('Error al obtener el precio');
        setPrecioUnitario(null);
        setPrecioTotal(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce de 300ms para evitar muchas llamadas a la API
    
    debounceTimeout.current = setTimeout(() => {
     
      fetchPrecio();
    }, 300);

    // Limpieza del efecto
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [categoria, medida, tallos]);
  
  // Este efecto es solo para debug y verificar que los valores están llegando al hook
  useEffect(() => {
  }, [categoria, medida, tallos, precioUnitario, precioTotal]);

  return {
    precioUnitario,
    precioTotal,
    loading,
    error
  };
};
