import { useState, useEffect } from 'react';
import { getCajasProducto } from '../../services/cajasProductosService';
import type { Producto, CajaProducto, CajaProductoResponse, TipoCaja } from '../../types/ventas';

export const useTipoCaja = (productoSeleccionado: Producto | null) => {
  // Estados
  const [tipoCaja, setTipoCaja] = useState<TipoCaja>('solida');
  const [cajasProducto, setCajasProducto] = useState<CajaProducto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [loadingCajas, setLoadingCajas] = useState<boolean>(false);
  const [errorCajas, setErrorCajas] = useState<string | null>(null);

  // Opciones para el selector de tipo de caja
  const tipoCajaOptions = [
    { value: 'solida', label: 'Sólida (un solo producto)' },
    { value: 'mixta', label: 'Mixta (varios productos de una categoría)' }
  ];

  // Obtener cajas cuando se selecciona un producto sólido
  useEffect(() => {
    const fetchCajasParaProducto = async () => {
      if (tipoCaja !== 'solida' || !productoSeleccionado?.id) {
        setCajasProducto([]);
        return;
      }

      try {
        setLoadingCajas(true);
        setErrorCajas(null);
        
        console.log(`Obteniendo cajas para producto ID: ${productoSeleccionado.id}`);
        const response = await getCajasProducto(productoSeleccionado.id);
        
        // Verificar detalladamente la estructura de la respuesta
        if (response) {
          console.log("Respuesta completa:", JSON.stringify(response));
          
          if (response.cajas && Array.isArray(response.cajas)) {
            console.log(`Se encontraron ${response.cajas.length} cajas para el producto`);
            setCajasProducto(response.cajas);
          } else {
            console.warn("La propiedad 'cajas' no es un array o no existe:", response);
            setCajasProducto([]);
          }
        } else {
          console.warn("La respuesta de la API es undefined o null");
          setCajasProducto([]);
        }
      } catch (error: any) {
        console.error("Error al obtener cajas para el producto:", error);
        setErrorCajas("No se pudieron cargar las cajas para este producto. Por favor intente nuevamente.");
        setCajasProducto([]);
      } finally {
        setLoadingCajas(false);
      }
    };

    fetchCajasParaProducto();
  }, [tipoCaja, productoSeleccionado?.id]);

  // Actualizar categoría seleccionada cuando se selecciona un producto
  useEffect(() => {
    if (productoSeleccionado?.categoria && tipoCaja === 'mixta') {
      setCategoriaSeleccionada(productoSeleccionado.categoria);
    } else if (tipoCaja !== 'mixta') {
      setCategoriaSeleccionada(null);
    }
  }, [productoSeleccionado, tipoCaja]);

  // Verificar si un producto puede ser añadido según el tipo de caja y categoría
  const validarProducto = (producto: Producto): boolean => {
    if (tipoCaja === 'solida') {
      // En modo sólido solo puede haber un producto seleccionado
      return true;
    } else {
      // En modo mixto, verificar que sea de la misma categoría
      if (!categoriaSeleccionada) {
        // Si no hay categoría seleccionada aún, cualquier producto es válido
        return true;
      }
      // Si ya hay categoría seleccionada, verificar que coincida
      return producto.categoria === categoriaSeleccionada;
    }
  };

  // Mensaje de error si un producto no cumple con las restricciones
  const getMensajeErrorProducto = (producto: Producto): string | null => {
    if (tipoCaja === 'solida') {
      return null;
    } else if (categoriaSeleccionada && producto.categoria !== categoriaSeleccionada) {
      return `Solo puede seleccionar productos de la categoría "${categoriaSeleccionada}"`;
    }
    return null;
  };

  return {
    tipoCaja,
    setTipoCaja,
    tipoCajaOptions,
    cajasProducto,
    categoriaSeleccionada,
    loadingCajas,
    errorCajas,
    validarProducto,
    getMensajeErrorProducto
  };
};
