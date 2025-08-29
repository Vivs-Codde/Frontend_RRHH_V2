import type { ProductoFormData } from "../../../types/producto";

/**
 * Funciones específicas para el manejo de productos BQT
 */
export const useBqtFunctions = (
  bqtItems: any[],
  setBqtItems: React.Dispatch<React.SetStateAction<any[]>>,
  formData: ProductoFormData,
  variedades: any[]
) => {
  
  // Función para agregar ítem a la lista BQT
  const handleAddBqtItem = (validateTallos: (fieldErrors: any) => boolean) => {
    // Para BQT, no requerir los campos del select
    if (!validateTallos({ tallos: formData.tallos })) {
      return;
    }

    const variedadNombre = variedades.find(
      (v) => v.id === formData.variedad
    )?.name;

    // Incluir el precio total del elemento si está disponible en formData
    const newItem = {
      subcategoria: formData.subcategoria,
      variedad: variedadNombre || formData.variedad, // Guardar el nombre directamente
      color: formData.color,
      calibre: formData.calibre,
      tallos: Number(formData.tallos) || 0,
      precioTotal: formData.precioTotal || null, // Guardar el precio total calculado
    };

    const updatedBqtItems = [...bqtItems, newItem];
    setBqtItems(updatedBqtItems);

    // Guardar ítems BQT en localStorage
    localStorage.setItem("bqtItems", JSON.stringify(updatedBqtItems));

    return { subcategoria: "", variedad: "", color: "", calibre: "", tallos: "" };
  };

  // Función para eliminar ítem de la lista BQT
  const handleRemoveBqtItem = (index: number) => {
    const updatedBqtItems = bqtItems.filter((_, i) => i !== index);
    setBqtItems(updatedBqtItems);

    // Actualizar localStorage
    localStorage.setItem("bqtItems", JSON.stringify(updatedBqtItems));
  };

  // Función para limpiar los items BQT
  const clearBqtItems = () => {
    localStorage.removeItem("bqtItems");
    setBqtItems([]);
  };

  return {
    handleAddBqtItem,
    handleRemoveBqtItem,
    clearBqtItems
  };
};
