import { useState, useEffect, useMemo } from 'react';
import type { Cliente, Producto } from './types';
import { getAsignacionesPorCliente, getAsignacionesPorNombreCliente } from '../../services/ventasService';

// Hook para gestionar asignaciones
export const useAsignaciones = (clienteSeleccionado: Cliente | null) => {
  const [asignacion, setAsignacion] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipoFlor, setFiltroTipoFlor] = useState<string>("");

  // Cargar asignación al seleccionar cliente
  useEffect(() => {
    const cargarAsignacion = async () => {
      // Reiniciar estados al cambiar de cliente
      setAsignacion(null);
      setError(null);
      
      // Si no hay cliente seleccionado, no hacer nada más
      if (!clienteSeleccionado) {
        return;
      }
      
      try {
        setLoading(true);
        
        let respuesta;
        const nombreCliente = clienteSeleccionado.NombreCliente || clienteSeleccionado.nombre || clienteSeleccionado.label;
        
        // Intentar primero buscar por nombre si está disponible
        if (nombreCliente) {
          console.log("Buscando asignaciones por nombre de cliente:", nombreCliente);
          try {
            respuesta = await getAsignacionesPorNombreCliente(nombreCliente);
            console.log("Respuesta de asignaciones por nombre para cliente " + nombreCliente + ":", respuesta);
          } catch (error) {
            console.warn("Error al buscar por nombre, intentando con ID", error);
            // Si falla la búsqueda por nombre, usar el método por ID como respaldo
            const clienteId = clienteSeleccionado.id || clienteSeleccionado.value;
            if (!clienteId) {
              throw new Error("No se pudo determinar el ID del cliente seleccionado");
            }
            
            respuesta = await getAsignacionesPorCliente(clienteId);
            console.log("Respuesta de asignaciones por ID para cliente " + clienteId + ":", respuesta);
          }
        } else {
          // Si no tenemos nombre, buscar por ID
          const clienteId = clienteSeleccionado.id || clienteSeleccionado.value;
          console.log("Cargando asignaciones por ID para cliente:", clienteId, clienteSeleccionado);
          
          if (!clienteId) {
            throw new Error("No se pudo determinar el ID del cliente seleccionado");
          }
          
          respuesta = await getAsignacionesPorCliente(clienteId);
          console.log("Respuesta de asignaciones para cliente " + clienteId + ":", respuesta);
        }
        
        if (respuesta === null || respuesta === undefined) {
          throw new Error("No se recibieron datos de asignaciones");
        }
        
        // Verificar si hay datos de asignación
        if (Array.isArray(respuesta)) {
          if (respuesta.length === 0) {
            setError("El cliente no tiene asignaciones disponibles");
            return;
          }
          
          // Verificar si los elementos del array tienen productos o recetas
          const tieneProductos = respuesta.some(item => 
            (item.productos && item.productos.length > 0) || 
            (item.recetas && item.recetas.length > 0)
          );
          
          if (!tieneProductos) {
            setError("Las asignaciones del cliente no contienen productos");
            return;
          }
        } else if (typeof respuesta === 'object') {
          // Verificar si el objeto tiene productos o recetas
          const tieneProductos = 
            (respuesta.productos && respuesta.productos.length > 0) || 
            (respuesta.recetas && respuesta.recetas.length > 0);
            
          if (!tieneProductos) {
            setError("Las asignaciones del cliente no contienen productos");
            return;
          }
        }
        
        setAsignacion(respuesta);
        
      } catch (error: any) {
        console.error("Error al cargar asignación:", error);
        setError(`Error al cargar productos asignados al cliente: ${error.message || "Verifica si el cliente tiene asignaciones creadas."}`);
        
        // Mostrar mensaje específico para el caso 404 o no hay asignaciones
        if (error.message && error.message.includes("404")) {
          setError("El cliente no tiene asignaciones disponibles o el servicio no está disponible. Consulta con el administrador.");
        } else if (error.message && error.message.includes("no tiene asignaciones")) {
          setError("El cliente seleccionado no tiene productos asignados. Debe crear asignaciones primero.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    cargarAsignacion();
  }, [clienteSeleccionado]);

  return {
    asignacion,
    setAsignacion,
    loading,
    error,
    setError,
    filtroTipoFlor,
    setFiltroTipoFlor
  };
};
