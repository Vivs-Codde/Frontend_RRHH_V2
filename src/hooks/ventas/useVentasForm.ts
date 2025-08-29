import { useState, useEffect } from 'react';
import { useClientes } from './useClientes';
import { useAsignaciones } from './useAsignaciones';
import { useProductosVenta } from './useProductosVenta';
import { useMarcacionesCliente } from './useMarcacionesCliente';
import { useTipoCaja } from './useTipoCaja';
import { crearVenta } from '../../services/ventasService';
import type { VentaData, TipoCaja } from '../../types/ventas';

export const useVentasForm = (onGuardar: (venta?: any) => void) => {
  const { 
    clienteSeleccionado, 
    clienteOptions, 
    handleClienteChange, 
    loading: loadingClientes, 
    error: errorClientes, 
    setError: setErrorClientes 
  } = useClientes();
  
  const { 
    asignacion, 
    loading: loadingAsignaciones, 
    error: errorAsignaciones, 
    filtroTipoFlor, 
    setFiltroTipoFlor 
  } = useAsignaciones(clienteSeleccionado);
  
  const {
    marcaciones,
    marcacionSeleccionada,
    loadingMarcaciones,
    errorMarcaciones,
    totalMarcaciones,
    marcacionesOptions,
    handleMarcacionChange
  } = useMarcacionesCliente(clienteSeleccionado);
  
  const { 
    itemsVenta, 
    setItemsVenta, 
    productoSeleccionado, 
    cantidad, 
    setCantidad, 
    precio, 
    setPrecio, 
    precioVenta,
    setPrecioVenta,
    floresDetalle,
    setFloresDetalle,
    observacion, 
    setObservacion, 
    totalVenta, 
    costoTotalUnidad,
    setCostoTotalUnidad,
    handleProductoChange,
    handlePrecioFlor, 
    handleAgregarItem: addItem, 
    handleEliminarItem, 
    procesarProductosOptions,
    obtenerNumeroTallos,
    obtenerCostoMateriales
  } = useProductosVenta();
  
  const {
    tipoCaja,
    setTipoCaja,
    tipoCajaOptions,
    cajasProducto,
    categoriaSeleccionada,
    loadingCajas,
    errorCajas,
    validarProducto,
    getMensajeErrorProducto
  } = useTipoCaja(productoSeleccionado);
  
  // Estados adicionales
  const [fechaEntrega, setFechaEntrega] = useState<string>("");
  const [mostrarDetalleCliente, setMostrarDetalleCliente] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Procesar opciones de productos
  const productosOptions = procesarProductosOptions(asignacion);
  
  // Manejar error unificado
  const errorUnificado = error || errorClientes || errorAsignaciones || errorMarcaciones || errorCajas;
  
  // Función para agregar item con validación según tipo de caja
  const handleAgregarItem = () => {
    // Validar según tipo de caja
    if (!productoSeleccionado) {
      setError("Debe seleccionar un producto");
      return;
    }
    
    // Validar si el producto cumple las restricciones del tipo de caja
    if (tipoCaja === 'solida' && itemsVenta.length > 0) {
      setError("En tipo de caja 'Sólida' solo puede agregar un producto");
      return;
    }
    
    // Validar categoría para caja mixta
    if (tipoCaja === 'mixta') {
      const errorMsg = getMensajeErrorProducto(productoSeleccionado);
      if (errorMsg) {
        setError(errorMsg);
        return;
      }
    }
    
    // Si pasa todas las validaciones, agregar el item
    addItem(setError);
  };
  
  // Vaciar items al cambiar tipo de caja
  useEffect(() => {
    if (itemsVenta.length > 0) {
      setItemsVenta([]);
    }
  }, [tipoCaja]);
  
  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteSeleccionado) {
      setError("Debe seleccionar un cliente");
      return;
    }
    
    if (itemsVenta.length === 0) {
      setError("Debe agregar al menos un producto");
      return;
    }
    
    if (!fechaEntrega) {
      setError("Debe seleccionar una fecha de entrega");
      return;
    }
    
    try {
      setLoading(true);
      
      const ventaData: VentaData = {
        cliente_id: clienteSeleccionado.id,
        fecha_entrega: fechaEntrega,
        items: itemsVenta.map(item => ({
          producto_id: item.producto.id,
          receta_id: item.producto.receta?.id,
          cantidad: item.cantidad,
          precio: item.precio,
          observacion: item.observacion
        })),
        total: totalVenta
      };
      
      const response = await crearVenta(ventaData);
      onGuardar(response);
    } catch (error) {
      console.error("Error al crear venta:", error);
      setError("Error al guardar la venta");
    } finally {
      setLoading(false);
    }
  };
  
  return {
    // Estados
    clienteSeleccionado,
    clienteOptions,
    asignacion,
    productosOptions,
    itemsVenta,
    productoSeleccionado,
    cantidad,
    precio,
    precioVenta,
    floresDetalle,
    observacion,
    totalVenta,
    costoTotalUnidad,
    fechaEntrega,
    mostrarDetalleCliente,
    loading: loading || loadingClientes || loadingAsignaciones || loadingMarcaciones || loadingCajas,
    error: errorUnificado,
    filtroTipoFlor,
    marcaciones,
    marcacionSeleccionada,
    totalMarcaciones,
    marcacionesOptions,
    tipoCaja,
    tipoCajaOptions,
    cajasProducto,
    categoriaSeleccionada,
    loadingCajas,
    errorCajas,
    
    // Funciones de actualización
    handleClienteChange,
    handleProductoChange,
    handlePrecioFlor,
    setCantidad,
    setPrecio,
    setPrecioVenta,
    setFloresDetalle,
    setObservacion,
    setCostoTotalUnidad,
    setFechaEntrega,
    setMostrarDetalleCliente,
    setFiltroTipoFlor,
    setError,
    handleMarcacionChange,
    setTipoCaja,
    obtenerNumeroTallos,
    obtenerCostoMateriales,
    
    // Funciones de acción
    handleAgregarItem,
    handleEliminarItem,
    handleSubmit
  };
};
