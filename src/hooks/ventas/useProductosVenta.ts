import { useState, useMemo, useEffect } from 'react';
import type { Producto, ItemVenta } from './types';

// Hook para gestionar productos en la venta
export const useProductosVenta = () => {
  // Estados para items de venta
  const [itemsVenta, setItemsVenta] = useState<ItemVenta[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [precio, setPrecio] = useState<number>(0); // Precio de transferencia
  const [precioVenta, setPrecioVenta] = useState<number>(0); // Precio de venta por tallo
  const [floresDetalle, setFloresDetalle] = useState<Array<any>>([]);
  const [observacion, setObservacion] = useState<string>("");
  const [costoTotalUnidad, setCostoTotalUnidad] = useState<number>(0); // Costo total de la caja
  
  // Calcular el total de la venta
  const totalVenta = useMemo(() => {
    return itemsVenta.reduce((total, item) => total + (item.cantidad * (item.precioTotal || item.precio)), 0);
  }, [itemsVenta]);
  
  // Extraer número de tallos del resumen o de las flores
  const obtenerNumeroTallos = (producto: Producto): number => {
    let totalTallos = 0;
    
    // Primero intentar extraer del resumen (formato "Roses 40cm/50cm/50cm 20st")
    if (producto.resumen && producto.resumen.includes('st')) {
      const match = producto.resumen.match(/(\d+)st/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    // Si no se encuentra en el resumen, buscar en las flores
    if (producto.flores && Array.isArray(producto.flores)) {
      producto.flores.forEach((flor: any) => {
        if (flor.pivot && flor.pivot.tallos) {
          totalTallos += flor.pivot.tallos;
        }
      });
      
      return totalTallos > 0 ? totalTallos : 1; // Si hay flores pero no tienen tallos, devolver 1
    }
    
    return 1; // Por defecto 1 tallo si no hay información
  };
  
  // Obtener costo de materiales del paquete
  const obtenerCostoMateriales = (producto: Producto): number => {
    if (producto.receta?.paquete?.precioTotal) {
      return parseFloat(producto.receta.paquete.precioTotal);
    }
    return 0;
  };
  
  // Procesar detalle de flores para el producto seleccionado
  useEffect(() => {
    if (!productoSeleccionado) {
      setFloresDetalle([]);
      return;
    }
    
    // Extraer las flores con sus tallos
    const flores = productoSeleccionado.flores || [];
    const detalleFlores = flores.map((flor: any) => ({
      id: flor.id,
      variedad: flor.variedad,
      tipo: flor.tipo,
      color: flor.color,
      calibre: flor.calibre,
      tallos: flor.pivot?.tallos || 0,
      precioVentaTallo: parseFloat(flor.precios || '0')
    }));
    
    setFloresDetalle(detalleFlores);
    
    // Establecer el precio de transferencia del producto
    setPrecio(productoSeleccionado.precio || 0);
    
    // Calcular precio de venta inicial (promedio del precio de transferencia por tallo)
    const numTallos = obtenerNumeroTallos(productoSeleccionado);
    const precioInicial = numTallos > 0 ? (productoSeleccionado.precio || 0) / numTallos : 0;
    setPrecioVenta(precioInicial);
    
  }, [productoSeleccionado]);

  // Manejar selección de producto
  const handleProductoChange = (selected: Producto | null) => {
    setProductoSeleccionado(selected);
    if (!selected) {
      setPrecio(0);
      setPrecioVenta(0);
      setFloresDetalle([]);
    }
  };
  
  // Actualizar precio por tallo para una flor específica
  const handlePrecioFlor = (id: number, nuevoPrecio: number) => {
    setFloresDetalle(flores => 
      flores.map(flor => 
        flor.id === id ? { ...flor, precioVentaTallo: nuevoPrecio } : flor
      )
    );
  };
  
  // Agregar item a la venta
  const handleAgregarItem = (errorCallback: (msg: string) => void) => {
    if (!productoSeleccionado) {
      errorCallback("Seleccione un producto");
      return;
    }
    
    if (cantidad <= 0) {
      errorCallback("La cantidad debe ser mayor a 0");
      return;
    }
    
    if (precio <= 0) {
      errorCallback("El precio de transferencia debe ser mayor a 0");
      return;
    }
    
    if (precioVenta <= 0) {
      errorCallback("El precio de venta debe ser mayor a 0");
      return;
    }
    
    // Obtener número de tallos
    const numeroDeTallos = obtenerNumeroTallos(productoSeleccionado);
    
    // Obtener costo de materiales
    const costoMateriales = obtenerCostoMateriales(productoSeleccionado);
    
    // Calcular el precio total de venta correctamente
    // 1. Precio base (precio de transferencia)
    const precioBase = parseFloat(productoSeleccionado.precioTotal || "0");
    
    // 2. Calcular el total por flores basado en detalles de flores
    const totalFlores = floresDetalle.length > 0
      ? floresDetalle.reduce((sum, flor) => sum + (flor.precioVentaTallo * flor.tallos), 0)
      : (precioVenta * numeroDeTallos); // Si no hay detalles específicos, usar el cálculo general
    
    // 3. Precio del paquete si existe
    const precioPaquete = parseFloat(productoSeleccionado.receta?.paquete?.precioTotal || "0");
    
    // 4. Calcular precio total sumando solo Total por flores + Costo del paquete
    const nuevoPrecioTotal = totalFlores + precioPaquete;
    
    // 5. Verificar que el nuevo precio total no sea menor al precio base de transferencia
    const precioTotal = nuevoPrecioTotal > precioBase ? nuevoPrecioTotal : precioBase;
    
    const nuevoItem: ItemVenta = {
      id: Date.now(),
      producto: productoSeleccionado,
      cantidad: cantidad,
      precio: precio, // Precio de transferencia
      precioVenta: precioVenta, // Precio de venta por tallo
      numeroDeTallos: numeroDeTallos,
      costoMateriales: costoMateriales,
      precioTotal: precioTotal, // Precio total calculado
      subtotal: cantidad * precioTotal, // Subtotal = cantidad * precioTotal
      observacion: observacion,
      floresDetalle: floresDetalle.length > 0 ? floresDetalle : undefined
    };
    
    setItemsVenta([...itemsVenta, nuevoItem]);
    setProductoSeleccionado(null);
    setCantidad(1);
    setPrecio(0);
    setPrecioVenta(0);
    setFloresDetalle([]);
    setObservacion("");
    errorCallback("");
  };
  
  // Eliminar item de la venta
  const handleEliminarItem = (id: number) => {
    setItemsVenta(itemsVenta.filter(item => item.id !== id));
  };

  // Procesar opciones de productos
  const procesarProductosOptions = (asignacion: any): Producto[] => {
    if (!asignacion) {
      return [];
    }
    
    let recetas: any[] = [];
    
    try {
      // Detectar formato de la respuesta API
      if (Array.isArray(asignacion)) {
        // Intentar diferentes estructuras posibles en el array
        for (const item of asignacion) {
          if (item?.recetas && Array.isArray(item.recetas)) {
            recetas = item.recetas;
            break;
          }
        }
        
        // Si no encontramos recetas, buscar productos
        if (recetas.length === 0) {
          for (const item of asignacion) {
            if (item?.productos && Array.isArray(item.productos)) {
              recetas = item.productos;
              break;
            }
          }
        }
        
        // Si aún no hay recetas, tratar cada elemento como un producto
        if (recetas.length === 0 && asignacion[0]?.producto) {
          recetas = asignacion;
        }
        
      } else if (typeof asignacion === 'object') {
        // Buscar recetas directamente
        if (asignacion.recetas && Array.isArray(asignacion.recetas)) {
          recetas = asignacion.recetas;
        } 
        // Buscar en productos si no hay recetas
        else if (asignacion.productos && Array.isArray(asignacion.productos)) {
          recetas = asignacion.productos;
        } 
        // Buscar si hay un campo cliente_id y recetas[] como en la API real
        else if (asignacion.cliente_id && Array.isArray(asignacion.recetas)) {
          recetas = asignacion.recetas;
        }
      }
      
      if (!Array.isArray(recetas) || recetas.length === 0) {
        return [];
      }
      
      // Crear un mapa para evitar productos duplicados
      const productosMap = new Map();
      
      recetas.forEach((receta: any, index: number) => {
        try {
          // Intentar extraer el producto de diferentes estructuras posibles
          const producto = receta?.producto || receta;
          
          if (!producto) {
            return; // continuar con el siguiente
          }
          
          const id = producto.id || producto.producto_id;
          if (!id) {
            return; // continuar con el siguiente
          }
          
          if (productosMap.has(id)) {
            return; // continuar con el siguiente
          }
          
          const precio = parseFloat(receta.receta?.precio || producto.precio || producto.precioTotal || "0");
          const descripcion = producto.descripcion || producto.nombre || "Producto";
          const sku = producto.sku || "Sin SKU";
          
          // Extraer información de flores si existe
          const flores = receta.flores || producto.flores || [];
          const tiposFlores = flores.map((f: any) => f.tipo).filter(Boolean);
          
          productosMap.set(id, {
            value: id,
            label: `${descripcion} (${sku})`,
            ...producto,
            receta: receta,
            flores: flores,
            tiposFlores: tiposFlores,
            precio: precio
          });
        } catch (err) {
          console.error(`Error procesando producto #${index}:`, err);
        }
      });
      
      return Array.from(productosMap.values());
    } catch (error) {
      console.error("Error al procesar los productos:", error);
      return [];
    }
  };

  return {
    itemsVenta,
    setItemsVenta,
    productoSeleccionado,
    setProductoSeleccionado,
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
    handleAgregarItem,
    handleEliminarItem,
    procesarProductosOptions,
    obtenerNumeroTallos,
    obtenerCostoMateriales
  };
};
