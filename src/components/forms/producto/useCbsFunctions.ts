import type { ProductoFormData } from "../../../types/producto";

/**
 * Funciones específicas para el manejo de productos CBS (Consumer Bounch)
 */
export const useCbsFunctions = (
  cbsItems: any[],
  setCbsItems: React.Dispatch<React.SetStateAction<any[]>>,
  formData: ProductoFormData,
  variedades: any[]
) => {
  
  // Función para agregar ítem a la lista CBS
  const handleAddCbsItem = (validateTallos: (fieldErrors: any) => boolean) => {
    // Para CBS, validar solo los tallos
    if (!validateTallos({ tallos: formData.tallos })) {
      return;
    }

    const variedadNombre = variedades.find(
      (v) => v.id === formData.variedad
    )?.name;

    // En CBS, la subcategoría es fija para todos los items
    // Incluir el precio total del elemento si está disponible en formData
    const newItem = {
      subcategoria: formData.subcategoria,
      variedad: variedadNombre || formData.variedad,
      color: formData.color,
      calibre: formData.calibre,
      tallos: Number(formData.tallos) || 0,
      precioTotal: formData.precioTotal || null, // Guardar el precio total calculado
    };

    const updatedCbsItems = [...cbsItems, newItem];
    setCbsItems(updatedCbsItems);

    // Guardar ítems CBS en localStorage
    localStorage.setItem("cbsItems", JSON.stringify(updatedCbsItems));

    // Devolver los campos a resetear, manteniendo la subcategoría
    return { variedad: "", color: "", calibre: "", tallos: "" };
  };

  // Función para eliminar ítem de la lista CBS
  const handleRemoveCbsItem = (index: number) => {
    const updatedCbsItems = cbsItems.filter((_, i) => i !== index);
    setCbsItems(updatedCbsItems);

    // Actualizar localStorage
    localStorage.setItem("cbsItems", JSON.stringify(updatedCbsItems));
  };

  // Función para limpiar los items CBS
  const clearCbsItems = () => {
    localStorage.removeItem("cbsItems");
    setCbsItems([]);
  };

  return {
    handleAddCbsItem,
    handleRemoveCbsItem,
    clearCbsItems
  };
};
