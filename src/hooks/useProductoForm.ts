import { useState, useEffect } from "react";
import { Producto, ProductoFormData } from "../types/producto";
import { productoService } from "../services/productoService";
import { generateSKU, generateProductSummary } from "../utils/productoHelpers";

export const useProductoForm = (
  initialData?: Producto | null,
  onProductCreated?: () => void
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [allProducts, setAllProducts] = useState<Producto[]>([]);

  const [formData, setFormData] = useState<ProductoFormData>({
    nombreProducto: initialData?.nombreProducto || "",
    SKU: initialData?.SKU || "",
    categoria: initialData?.categoria || "",
    subcategoria: initialData?.subcategoria || "",
    variedad: initialData?.variedad || "",
    color: initialData?.color || "",
    tallos: initialData?.tallos || "",
    calibre: initialData?.calibre || "",
    estado: initialData?.estado ?? 1,
  });

  // Estado para ítems BQT
  const [bqtItems, setBqtItems] = useState<any[]>([]);

  // Estado para almacenar todas las variedades (independientes de la subcategoría)
  const [todasLasVariedades, setTodasLasVariedades] = useState<any[]>([]);

  // Estado para el switch de status
  const [statusValue, setStatusValue] = useState(formData.estado === 1);

  // Cargar todos los productos para generar el SKU incremental
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await productoService.getAll();
        setAllProducts(products);
      } catch (error) {
        console.error("Error al cargar productos para SKU:", error);
      }
    };
    loadProducts();
  }, []);

  // Sincronizar el switch con el estado del formulario
  useEffect(() => {
    setStatusValue(formData.estado === 1);
  }, [formData.estado]);

  // Cargar ítems BQT desde localStorage al iniciar
  useEffect(() => {
    const storedBqtItems = localStorage.getItem("bqtItems");
    if (storedBqtItems) {
      setBqtItems(JSON.parse(storedBqtItems));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Si cambia la subcategoría, limpiar la variedad
      if (name === "subcategoria") {
        newData.variedad = "";
      }
      return newData;
    });
  };

  // Función para agregar ítem a la lista BQT
  const handleAddBqtItem = () => {
    if (!formData.subcategoria || !formData.variedad || !formData.color || !formData.calibre || !formData.tallos) {
      return;
    }

    const variedadNombre = todasLasVariedades.find(
      (v) => v.id === formData.variedad
    )?.name;

    

    const newItem = {
      subcategoria: formData.subcategoria,
      variedad: variedadNombre || formData.variedad, // Guardar el nombre directamente
      color: formData.color,
      calibre: formData.calibre,
      tallos: Number(formData.tallos) || 0,
    };

    const updatedBqtItems = [...bqtItems, newItem];
    setBqtItems(updatedBqtItems);

    // Guardar ítems BQT en localStorage
    localStorage.setItem("bqtItems", JSON.stringify(updatedBqtItems));

    // Limpiar campos del formulario
    setFormData((prev) => ({
      ...prev,
      subcategoria: "",
      variedad: "",
      color: "",
      calibre: "",
      tallos: "",
    }));
  };

  // Función para eliminar ítem de la lista BQT
  const handleRemoveBqtItem = (index: number) => {
    const updatedBqtItems = bqtItems.filter((_, i) => i !== index);
    setBqtItems(updatedBqtItems);

    // Actualizar localStorage
    localStorage.setItem("bqtItems", JSON.stringify(updatedBqtItems));
  };

  // Efecto para validar en tiempo real si el nombre del producto ya existe
  useEffect(() => {
    if (formData.nombreProducto) {
      const existingProduct = allProducts.find(
        (p) =>
          p.nombreProducto.toLowerCase().trim() ===
            formData.nombreProducto.toLowerCase().trim() &&
          (!initialData || p.id !== initialData.id) // Excluir el producto actual si estamos editando
      );

      if (existingProduct) {
        setFieldErrors((prev) => ({
          ...prev,
          nombreProducto: "Ya existe un producto con este nombre",
        }));
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nombreProducto;
          return newErrors;
        });
      }
    }
  }, [formData.nombreProducto, allProducts, initialData]);

  // Generar SKU y nombre de producto 
  const generateProductFormData = (
    formData: ProductoFormData,
    categorias: any[],
    tiposVariedad: any[],
    allProducts: Producto[],
    variedades: any[],
    colores: any[],
    calibres: any[]
  ) => {
    // Generar SKU automáticamente
    const generatedSKU = generateSKU(
      formData,
      categorias,
      tiposVariedad,
      allProducts
    );

    // Generar resumen de producto
    const productSummary = generateProductSummary(
      formData,
      categorias,
      tiposVariedad,
      variedades,
      colores,
      calibres
    );

    return {
      generatedSKU,
      productSummary
    };
  };

  // Crear resumen para productos BQT
  const createBqtSummary = (
    nombreProducto: string,
    bqtItems: any[],
    tiposVariedad: any[],
    allCalibres: any[]
  ) => {
    if (bqtItems.length === 0) return nombreProducto || "";
    
    // Iniciales subcategoría
    const subcats = bqtItems.map(item => {
      const subcat = tiposVariedad.find(t => t.id === item.subcategoria);
      return subcat?.name ? subcat.name.charAt(0).toUpperCase() : "";
    }).filter(Boolean).join("&");
    
    // Calibres
    const calibresStr = bqtItems.map(item => {
      const cal = allCalibres?.find(c => c.id_calibre === item.calibre);
      return cal?.nombre_calibre_tipo ? cal.nombre_calibre_tipo.replace(/\s/g, "") : "";
    }).filter(Boolean).join("&");
    
    // Suma tallos
    const totalTallos = bqtItems.reduce((sum, item) => sum + (Number(item.tallos) || 0), 0);
    
    return `BQT ${nombreProducto || ""} ${subcats}/${calibresStr}/${totalTallos}st`;
  };

  return {
    loading,
    setLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    fieldErrors,
    setFieldErrors,
    formData,
    setFormData,
    allProducts,
    setAllProducts,
    bqtItems,
    setBqtItems,
    todasLasVariedades,
    setTodasLasVariedades,
    statusValue,
    setStatusValue,
    handleChange,
    handleAddBqtItem,
    handleRemoveBqtItem,
    generateProductFormData,
    createBqtSummary
  };
};

export default useProductoForm;
