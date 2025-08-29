import type { ProductoFormData } from "../../../types/producto";
import productos from "../../../i18n/productos";

/**
 * Funciones de validación para el formulario de productos
 */
export const useProductoValidation = (lang: 'en' | 'es') => {

  // Validar campo de tallos
  const validateTallos = (fieldErrors: { [key: string]: string }) => {
    let isValid = true;
    if (!fieldErrors.tallos) {
      if (!fieldErrors.tallos || Number(fieldErrors.tallos) <= 0) {
        fieldErrors.tallos = "El número de tallos debe ser mayor a cero";
        isValid = false;
      }
    }
    return isValid;
  };
  
  // Validar formulario completo
  const validateForm = (
    formData: ProductoFormData, 
    fieldErrors: { [key: string]: string },
    setFieldErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>,
    setError: React.Dispatch<React.SetStateAction<string>>,
    tiposVariedad: any[] = []
  ) => {
    // Función para verificar si es Assorted o Rainbow (incluyendo SLD Rainbow)
    const isAssortedOrRainbow = () => {
      if (!formData.subcategoria) return false;
      const subcatObj = tiposVariedad.find((t) => t.id === formData.subcategoria);
      const subcatName = subcatObj?.name || "";
      return subcatName.includes("Assorted") || subcatName.includes("Rainbow");
    };

    // Validar campos requeridos solo si NO es BQT ni CBS
    if (formData.categoria !== "BQT" && formData.categoria !== "CBS") {
      const newFieldErrors: { [key: string]: string } = {};
      if (!formData.subcategoria) newFieldErrors.subcategoria = "Campo requerido";
      
      // No requerir variedad si es Assorted o Rainbow
      if (!isAssortedOrRainbow() && !formData.variedad) {
        newFieldErrors.variedad = "Campo requerido";
      }
      
      if (!formData.color) newFieldErrors.color = "Campo requerido";
      if (!formData.calibre) newFieldErrors.calibre = "Campo requerido";
      if (!formData.tallos) newFieldErrors.tallos = "Campo requerido";
      // Validar que tallos sea mayor a cero SOLO si no es BQT
      if (formData.tallos && Number(formData.tallos) <= 0) {
        newFieldErrors.tallos = "El valor debe ser mayor a cero";
      }
      // Eliminar mensajes de error si el campo ya está lleno
      Object.keys(newFieldErrors).forEach((key) => {
        // Usar type assertion para permitir acceso indexado a formData
        if ((formData as Record<string, any>)[key]) {
          delete newFieldErrors[key];
        }
      });
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
        setError("Todos los campos del producto son obligatorios.");
        setTimeout(() => setError("") , 3000);
        return false;
      } else {
        // Limpiar errores si todos los campos están llenos
        setFieldErrors((prev) => {
          const clean = { ...prev };
          delete clean.subcategoria;
          delete clean.variedad;
          delete clean.color;
          delete clean.calibre;
          delete clean.tallos;
          return clean;
        });
      }
    }

    // Validar vendedor (siempre obligatorio para todas las categorías)
    if (!formData.vendedor || formData.vendedor.trim() === "") {
      setFieldErrors((prev) => ({ ...prev, vendedor: "Campo requerido" }));
      setError("El vendedor es obligatorio.");
      setTimeout(() => setError(""), 3000);
      return false;
    } else {
      // Limpiar error de vendedor si está lleno
      setFieldErrors((prev) => {
        const clean = { ...prev };
        delete clean.vendedor;
        return clean;
      });
    }

    // No permitir guardar si hay error de nombre duplicado exacto
    // Verificar primero si hay algún error relacionado con el nombre del producto
    if (fieldErrors.nombreProducto) {
      // Verificaciones adicionales para detectar duplicados con mayor precisión
      if (
        fieldErrors.nombreProducto.includes("Ya existe un producto con este nombre") ||
        fieldErrors.nombreProducto.includes("Ya existe este producto")
      ) {
        console.error("Validación: se encontró un producto con nombre duplicado", fieldErrors.nombreProducto);
        setError(fieldErrors.nombreProducto);
        return false;
      }
      
      // Para productos similares, solo mostrar advertencia pero permitir guardar
      if (fieldErrors.nombreProducto.includes("Producto similar encontrado")) {
        console.warn("Validación: se encontró un producto similar", fieldErrors.nombreProducto);
        setError(fieldErrors.nombreProducto);
        // No retornar false para permitir el guardado con la advertencia
      }
    }
    
    // No permitir guardar si hay error de nombre exacto en otras categorías (pero permitir si es solo similar)
    if (
      formData.categoria !== "BQT" &&
      fieldErrors.nombreProducto &&
      (fieldErrors.nombreProducto.startsWith("Ya existe un producto con este nombre") ||
       fieldErrors.nombreProducto.startsWith("Ya existe este producto"))
    ) {
      setError(fieldErrors.nombreProducto);
      setTimeout(() => setError("") , 3000);
      return false;
    }

    // Verificar nombre en productos BQT o CBS
    if ((formData.categoria === "BQT" || formData.categoria === "CBS") && 
        (!formData.nombreProducto || formData.nombreProducto.trim() === "")) {
      const newFieldErrors: { [key: string]: string } = {};
      // Acceder a las traducciones con seguridad de tipos
      const langKey = (lang === 'en' || lang === 'es') ? lang : 'es';
      newFieldErrors.nombreProducto = productos[langKey].errorFieldRequired;
      setFieldErrors(newFieldErrors);
      setError(productos[langKey].errorRequired);
      setTimeout(() => setError("") , 3000);
      return false;
    }
    
    return true;
  };

  return {
    validateTallos,
    validateForm
  };
};
