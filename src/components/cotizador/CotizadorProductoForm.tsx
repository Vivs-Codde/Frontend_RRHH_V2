import React, { useState } from "react";
import type { Producto } from "../../types/producto";
import ProductoFormCotizador from "../forms/ProductoFormCotizador";

interface CotizadorProductoFormProps {
  onSubmit: (data: any) => void;
  initialData?: Producto | null;
}

const CotizadorProductoForm: React.FC<CotizadorProductoFormProps> = ({
  onSubmit,
  initialData,
}) => {
  // Cargar datos iniciales desde localStorage si existen
  // Solo inicializar una vez al montar el componente
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("cotizacionProducto");
    return saved ? JSON.parse(saved) : initialData || null;
  });

  // Evitar actualizar initialData en cada render, solo al montar

  // Manejar cambios en el formulario con optimización
  const handleFormChange = React.useCallback((data: any) => {
    // Verificar si los datos han cambiado realmente para evitar actualizaciones innecesarias
    const currentDataString = localStorage.getItem("cotizacionProducto");
    const currentData = currentDataString ? JSON.parse(currentDataString) : null;
    
    let updatedData = { ...data };

    if (currentData) {
      // Mantener las flores y otros datos importantes si existen
      updatedData = {
        ...updatedData,
        flores: currentData.flores || [],
        cbsItems: currentData.cbsItems || [],
        bqtItems: currentData.bqtItems || [],
        id: currentData.id || Date.now(),
        timestamp: currentData.timestamp || new Date().toISOString(),
      };
    } else {
      // Si no hay datos previos, inicializar con valores por defecto
      updatedData = {
        ...updatedData,
        flores: [],
        cbsItems: [],
        bqtItems: [],
        id: Date.now(),
        timestamp: new Date().toISOString(),
      };
    }

    // Obtener datos de análisis del producto si existen (solo si es necesario)
    try {
      const analisisProducto = localStorage.getItem('analisisProducto');
      if (analisisProducto) {
        const analisisData = JSON.parse(analisisProducto);
        // Agregar los datos de análisis al producto
        updatedData = {
          ...updatedData,
          analisisProducto: analisisData
        };
      }
    } catch (error) {
      console.warn('[CotizadorProductoForm] Error al leer análisis del producto:', error);
    }
    // localStorage y notificamos al padre (Cotizador) con los datos.
    try {
      localStorage.setItem("cotizacionProducto", JSON.stringify(updatedData));
      
    } catch (e) {
      console.warn('[CotizadorProductoForm] Error guardando en localStorage', e);
    }

    // Notificar al componente padre
    onSubmit(updatedData);
  }, [onSubmit]); // Dependencies del useCallback
return (
  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col gap-6 border-2 border-emerald-600">
    <ProductoFormCotizador
      onSubmit={handleFormChange}
      initialData={formData}
    />
  </div>
);
};

export default CotizadorProductoForm;
