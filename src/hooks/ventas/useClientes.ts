import { useState, useEffect, useMemo } from 'react';
import { getClientes } from '../../services/clienteService';
import { getAsignacionesPorCliente, getAsignacionesPorNombreCliente } from '../../services/ventasService';
import type { Cliente } from './types';
import { useVendedoresCache } from '../../hooks/useVendedor';

// Hook para gestionar clientes
export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar clientes al iniciar
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        setLoading(true);
        const respuesta = await getClientes({});
        const data = respuesta.data || respuesta || [];
        setClientes(data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        setError("Error al cargar clientes");
      } finally {
        setLoading(false);
      }
    };
    
    cargarClientes();
  }, []);

  // Opciones para el select de clientes
  const clienteOptions = useMemo(() => {
    return clientes.map(cliente => ({
      value: cliente.id,
      label: cliente.NombreCliente || cliente.nombre,
      ...cliente
    }));
  }, [clientes]);

  // Obtener caché de vendedores
  const { getVendedorById, loading: loadingVendedores } = useVendedoresCache();

  // Manejar selección de cliente
  const handleClienteChange = (selected: Cliente | null) => {
    if (selected && selected.vendedor_id) {
      // Asignar información del vendedor desde el caché
      const vendedorInfo = getVendedorById(selected.vendedor_id);
      if (vendedorInfo) {
        selected.vendedor = {
          id: vendedorInfo.id,
          nombre: vendedorInfo.nombre,
          apellido: vendedorInfo.apellido
        };
      }
    }
    
    setClienteSeleccionado(selected);
    setError(null);
  };

  return {
    clientes,
    clienteSeleccionado,
    setClienteSeleccionado,
    loading,
    error,
    setError,
    clienteOptions,
    handleClienteChange,
  };
};
