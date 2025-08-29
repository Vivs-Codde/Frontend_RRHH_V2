import { useState, useEffect } from 'react';
import { getMarcacionesCliente } from '../../services/ventasService';
import type { Cliente } from './types';
import type { Marcacion, MarcacionesResponse } from '../../types/ventas';

// Hook para gestionar marcaciones de cliente
export const useMarcacionesCliente = (cliente: Cliente | null) => {
  const [marcaciones, setMarcaciones] = useState<Marcacion[]>([]);
  const [marcacionSeleccionada, setMarcacionSeleccionada] = useState<Marcacion | null>(null);
  const [loadingMarcaciones, setLoadingMarcaciones] = useState<boolean>(false);
  const [errorMarcaciones, setErrorMarcaciones] = useState<string | null>(null);
  const [totalMarcaciones, setTotalMarcaciones] = useState<number>(0);

  // Cargar marcaciones al seleccionar cliente
  useEffect(() => {
    const cargarMarcaciones = async () => {
      // Reiniciar estados
      setMarcaciones([]);
      setMarcacionSeleccionada(null);
      setErrorMarcaciones(null);
      setTotalMarcaciones(0);
      
      if (!cliente || !cliente.id) {
        return;
      }
      
      try {
        setLoadingMarcaciones(true);
        const respuesta = await getMarcacionesCliente(cliente.id);
        
        // Verificar la estructura de la respuesta
        if (respuesta && respuesta.marcaciones) {
          setMarcaciones(respuesta.marcaciones || []);
          setTotalMarcaciones(respuesta.marcaciones_count || respuesta.marcaciones.length || 0);
          
          // Si hay marcaciones, seleccionar la primera por defecto
          if (respuesta.marcaciones.length > 0) {
            setMarcacionSeleccionada(respuesta.marcaciones[0]);
          }
        } else {
          console.log("La respuesta no tiene el formato esperado:", respuesta);
          setErrorMarcaciones("No se pudieron cargar las marcaciones correctamente");
        }
      } catch (error: any) {
        console.error("Error al cargar marcaciones:", error);
        setErrorMarcaciones(`Error al cargar marcaciones: ${error.message || "Error desconocido"}`);
      } finally {
        setLoadingMarcaciones(false);
      }
    };
    
    cargarMarcaciones();
  }, [cliente]);
  
  // Manejar selección de marcación
  const handleMarcacionChange = (marcacion: Marcacion | null) => {
    setMarcacionSeleccionada(marcacion);
  };
  
  // Opciones para el selector de marcaciones
  const marcacionesOptions = marcaciones.map(marcacion => ({
    value: marcacion.id,
    label: marcacion.nombre || `Marcación ${marcacion.id}`,
    ...marcacion
  }));

  return {
    marcaciones,
    marcacionSeleccionada,
    loadingMarcaciones,
    errorMarcaciones,
    totalMarcaciones,
    marcacionesOptions,
    handleMarcacionChange
  };
};
