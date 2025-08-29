import { useState, useEffect } from "react";
import type { Producto, ProductoFormData } from "../../../types/producto";
import { productoService } from "../../../services/productoService";
import {
  generateSKU,
  generateProductSummary,
} from "../../../utils/productoHelpers";
import {
  useTipoVariedad,
  useVariedad,
  useColorCultivo,
  useCalibreCultivo,
  useCategorias,
} from "../../../hooks/useCultivoCombos";
import { useCalibrePorTipoVariedad } from "../../../hooks/useCalibrePorTipoVariedad";
import { useTranslation } from "react-i18next";
import { useItemsStorage } from "../../../hooks/useItemsStorage";
import {
  generateResumen,
  generateResumenVisual,
  checkProductDuplicateByResumen,
  generateSLDSummary,
  normalize,
  createErrorCleaner,
  isDuplicateError,
} from "../../../utils/productoCentralizado";

// Extiende el tipo para incluir abreviatura
type TipoVariedad = {
  id: string;
  name: string;
  abreviatura?: string;
};

export const useProductoFormLogic = (
  initialData?: Producto | null,
  onProductCreated?: () => void
) => {

  const lang = document.documentElement.lang.startsWith("en") ? "en" : "es";

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [allProducts, setAllProducts] = useState<Producto[]>([]);
  const { t } = useTranslation();
  // Estado principal del formulario
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
    vendedor: initialData?.vendedor || "",
    resumen: initialData?.resumen || "",
    precioTotal: initialData?.precioTotal,
  });

  // Estados para ítems BQT y CBS usando hook personalizado
  const { items: bqtItems, setItems: setBqtItems } = useItemsStorage("bqtItems");
  const { items: cbsItems, setItems: setCbsItems } = useItemsStorage("cbsItems");

  // Estado para almacenar todas las variedades (independientes de la subcategoría)
  const [todasLasVariedades, setTodasLasVariedades] = useState<any[]>([]);

  // Hooks para consumir las APIs
  const { data: categorias, loading: loadingCategorias } = useCategorias();
  const { data: tiposVariedad, loading: loadingTipos } = useTipoVariedad();
  const { data: colores } = useColorCultivo();
  const { data: allCalibres } = useCalibreCultivo();
  const { data: variedades, loading: loadingVariedades } = useVariedad(
    formData.subcategoria
  );
  const { data: calibres, loading: loadingCalibres } =
    useCalibrePorTipoVariedad(formData.subcategoria);

  // Estado para el switch de status
  const [statusValue, setStatusValue] = useState(formData.estado === 1);

  // Cuando se selecciona una variedad, tomar el color desde la variedad y no desde la API de colores
  useEffect(() => {
    if (formData.variedad && variedades && variedades.length > 0) {
      // Si es SLD Rainbow y variedad es array, no limpiar ni sobreescribir variedad
      const subcat = tiposVariedad.find((t) => t.id === formData.subcategoria);
      const subcatName = subcat?.name || "";
      const firstWord = subcatName.split(/[ ,]/)[0];
      if (
        formData.categoria === "SLD" &&
        firstWord === "Rainbow" &&
        Array.isArray(formData.variedad)
      ) {
        // No modificar variedad, solo actualizar color si corresponde
        // Si hay una sola variedad seleccionada, tomar su color
        if (formData.variedad.length === 1) {
          const selectedVariedad = variedades.find(
            (v) => v.id === formData.variedad[0]
          );
          setFormData((prev) => ({
            ...prev,
            color:
              selectedVariedad && (selectedVariedad as any).color
                ? (selectedVariedad as any).color
                : "",
          }));
        }
      } else {
        // Comportamiento normal para otros casos
        const selectedVariedad = variedades.find(
          (v) => v.id === formData.variedad
        );
        setFormData((prev) => ({
          ...prev,
          color:
            selectedVariedad && (selectedVariedad as any).color
              ? (selectedVariedad as any).color
              : "",
        }));
      }
    }
  }, [
    formData.variedad,
    formData.categoria,
    formData.subcategoria,
    formData.color,
    formData.tallos,
    formData.calibre,
    tiposVariedad,
    variedades,
  ]);

  // Cargar todas las variedades al iniciar
  useEffect(() => {
    if (variedades && variedades.length > 0) {
      setTodasLasVariedades(variedades);
    }
  }, [variedades]);

  // Cargar todos los productos para generar el SKU incremental
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await productoService.getAll();
        setAllProducts(products);

        // Verificar nombres duplicados al cargar o cuando cambia el nombre
        if (formData.nombreProducto) {
          checkDuplicateProductName(formData.nombreProducto, products);
        }
      } catch (error) {
        console.error("Error al cargar productos para SKU:", error);
      }
    };
    loadProducts();
  }, []);

  // Función helper para limpiar errores de duplicados usando utilidad centralizada
  const clearDuplicateErrors = createErrorCleaner(setFieldErrors, setError);

  // Función para normalizar nombres para comparación
  const normalize = (str: string) =>
    str.toLowerCase().replace(/\s+/g, " ").trim();

  // Helper para generar el resumen de CBS usando función centralizada
  const generateResumenCBS = (): string => {
    if (formData.categoria !== "CBS" || cbsItems.length === 0)
      return formData.nombreProducto || "";

    return generateResumen({
      categoria: "CBS",
      nombre: formData.nombreProducto || "",
      items: cbsItems,
      allCalibres,
      tiposVariedad,
    });
  };

  // Función para generar resumen de BQT usando función centralizada
  const generateResumenBQT = (): string => {
    if (formData.categoria !== "BQT" || bqtItems.length === 0)
      return formData.nombreProducto || "";

    return generateResumen({
      categoria: "BQT",
      nombre: formData.nombreProducto || "",
      items: bqtItems,
      allCalibres,
      tiposVariedad,
    });
  };

  // Calcular el resumen de CBS cada vez que se usa, para mantenerlo actualizado
  const resumenCBS = generateResumenCBS();

  // Calcular el resumen de BQT cada vez que se usa, para mantenerlo actualizado
  const resumenBQT = generateResumenBQT();

  // Función para generar el resumen visual de BQT con pipes usando función centralizada
  const getResumenBQTVisual = (): string => {
    if (formData.categoria !== "BQT" || bqtItems.length === 0)
      return formData.nombreProducto || "";

    return generateResumenVisual({
      categoria: "BQT",
      nombre: formData.nombreProducto || "",
      items: bqtItems,
      allCalibres,
      tiposVariedad,
    });
  };

  // Función centralizada para verificar duplicados por resumen usando utilidad importada
  const checkProductDuplicateByResumenLocal = (
    categoryCode: string,
    currentResumen: string,
    validCategories: string[]
  ): Producto | null => {
    return checkProductDuplicateByResumen({
      categoria: categoryCode,
      currentResumen,
      products: allProducts,
      initialId: initialData?.id?.toString(),
      validCategories,
    });
  };

  // Función específica para verificar si el nombre ya existe en cualquier categoría
  const checkDuplicateProductName = (
    nombreProducto: string,
    products = allProducts
  ) => {
    if (!nombreProducto) {
      // Si no hay nombre, limpiar errores relacionados con duplicados
      clearDuplicateErrors();
      return;
    }

    // Obtener nombre normalizado para comparación
    const normalizedName = normalize(nombreProducto);

    // Filtrar productos excluyendo el actual si es edición
    const otherProducts = initialData?.id
      ? products.filter((p) => p.id !== initialData.id)
      : products;

    // Validación especial para SLD Rainbow: no permitir guardar si existe misma combinación de variedad, color y tallos
    if (formData.categoria === "SLD") {
      const subcat = tiposVariedad.find((t) => t.id === formData.subcategoria);
      const subcatName = subcat?.name || "";
      const firstWord = subcatName.split(/[ ,]/)[0];
      if (firstWord === "Rainbow" && Array.isArray(formData.variedad) && formData.variedad.length > 0) {
        let igual: Producto | null = null;
        let similar: Producto | null = null;
        const resumenRainbow = customGenerateProductSummary(
          formData,
          categorias,
          tiposVariedad,
          variedades,
          [],
          calibres
        );
        const resumenRainbowNorm = normalize(resumenRainbow);
        // Validación por nombre generado
        const nombreDuplicado = otherProducts.find(
          (p) => normalize(p.nombreProducto) === resumenRainbowNorm
        );
        if (nombreDuplicado) {
          const compareValue = nombreDuplicado.nombreProducto;
          const skuValue = nombreDuplicado.SKU || "";
          const errorMsg = `Ya existe este producto: "${compareValue}", SKU: ${skuValue}`;
          setFieldErrors((prev) => ({
            ...prev,
            nombreProducto: errorMsg,
          }));
          setError(errorMsg);
          return true;
        }
        // Validación por arrays
        otherProducts.forEach((p) => {
          if (p.categoria !== "SLD") return;
          const pSubcat = tiposVariedad.find((t) => t.id === p.subcategoria)?.name || "";
          const pFirstWord = pSubcat.split(/[ ,]/)[0];
          if (pFirstWord !== "Rainbow") return;
          // Comparar variedad, color y tallos
          const pVariedadArr = Array.isArray(p.variedad) ? p.variedad : [p.variedad];
          const formVariedadArr = formData.variedad;
          const pColorArr = Array.isArray(p.color) ? p.color : [p.color];
          const formColorArr = Array.isArray(formData.color) ? formData.color : [formData.color];
          const pTallosArr = Array.isArray(p.tallos) ? p.tallos : [p.tallos];
          const formTallosArr = Array.isArray(formData.tallos) ? formData.tallos : [formData.tallos];
          // Igual: todos los arrays coinciden en longitud y contenido
          const sameVariedad = pVariedadArr.length === formVariedadArr.length && pVariedadArr.every((v) => formVariedadArr.includes(v));
          const sameColor = pColorArr.length === formColorArr.length && pColorArr.every((c) => formColorArr.includes(c));
          const sameTallos = pTallosArr.length === formTallosArr.length && pTallosArr.every((t) => formTallosArr.includes(t));
          if (sameVariedad && sameColor && sameTallos) {
            igual = p;
          } else {
            // Similitud: al menos 2 de 3 arrays coinciden parcialmente
            let matchCount = 0;
            if (pVariedadArr.some((v) => formVariedadArr.includes(v))) matchCount++;
            if (pColorArr.some((c) => formColorArr.includes(c))) matchCount++;
            if (pTallosArr.some((t) => formTallosArr.includes(t))) matchCount++;
            if (matchCount >= 2 && !similar) {
              similar = p;
            }
          }
        });
        if (igual) {
          const prodIgual = igual as Producto;
          const compareValue = prodIgual.nombreProducto;
          const skuValue = prodIgual.SKU || "";
          const errorMsg = `Ya existe este producto: "${compareValue}", SKU: ${skuValue}`;
          setFieldErrors((prev) => ({
            ...prev,
            nombreProducto: errorMsg,
          }));
          setError(errorMsg);
          return true;
        } else if (similar) {
          const prodSimilar = similar as Producto;
          const compareValue = prodSimilar.nombreProducto;
          const skuValue = prodSimilar.SKU || "";
          const msg = `Producto similar encontrado: "${compareValue}", SKU: ${skuValue}`;
          setFieldErrors((prev) => ({
            ...prev,
            nombreProducto: msg,
          }));
          setError(msg);
          // No bloquea el guardado
        }
      }
    }

    // Verificación específica para productos BQT
    if (formData.categoria === "BQT" && resumenBQT) {
      const duplicateProduct = checkProductDuplicateByResumenLocal("BQT", resumenBQT, ["BQT", "Bouquete"]);
      
      if (duplicateProduct) {
        // Si se encuentra un duplicado BQT, establecer error
        const compareValue = duplicateProduct.resumen || duplicateProduct.descripcion || duplicateProduct.nombreProducto;
        const skuValue = duplicateProduct.SKU || "";
        const errorMsg = `Ya existe este producto: "${compareValue}", SKU: ${skuValue}`;
        setFieldErrors((prev) => ({
          ...prev,
          nombreProducto: errorMsg,
        }));
        setError(errorMsg);
        return true;
      }
    }

    // Verificación específica para productos CBS
    if (formData.categoria === "CBS" && resumenCBS) {
      const duplicateProduct = checkProductDuplicateByResumenLocal("CBS", resumenCBS, ["CBS", "Consumer Bounch"]);
      
      if (duplicateProduct) {
        // Si se encuentra un duplicado CBS, establecer error
        const compareValue = duplicateProduct.resumen || duplicateProduct.descripcion || duplicateProduct.nombreProducto;
        const skuValue = duplicateProduct.SKU || "";
        const errorMsg = `Ya existe este producto: "${compareValue}", SKU: ${skuValue}`;
        setFieldErrors((prev) => ({
          ...prev,
          nombreProducto: errorMsg,
        }));
        setError(errorMsg);
        return true;
      }
    }

    // Buscar un producto con el mismo nombre exacto (verificación general)
    const duplicateProduct = otherProducts.find(
      (p) => normalize(p.nombreProducto) === normalizedName
    );

    if (duplicateProduct) {
      // Si se encuentra un duplicado, establecer error
      const errorMsg = `Ya existe un producto con este nombre: "${nombreProducto}", SKU: ${
        duplicateProduct.SKU || ""
      }`;
      setFieldErrors((prev) => ({
        ...prev,
        nombreProducto: errorMsg,
      }));
      setError(errorMsg);
      return true;
    } else {
      // Si no hay duplicado, limpiar este error específico y el error general
      clearDuplicateErrors();
      return false;
    }
  };

  // Sincronizar el switch con el estado del formulario
  useEffect(() => {
    setStatusValue(formData.estado === 1);
  }, [formData.estado]);

  // Verificar nombre duplicado cada vez que cambia el nombre del producto
  useEffect(() => {
    if (formData.nombreProducto && allProducts.length > 0) {
      checkDuplicateProductName(formData.nombreProducto);
    } else if (!formData.nombreProducto) {
      // Si el nombre está vacío, limpiar los errores relacionados con duplicados
      clearDuplicateErrors();
    }
  }, [formData.nombreProducto, allProducts]);

  // Verificar duplicados de CBS cuando cambian los items o sus propiedades
  useEffect(() => {
    if (
      formData.categoria === "CBS" &&
      cbsItems.length > 0 &&
      allProducts.length > 0
    ) {
      // Recalcular el resumenCBS y usarlo para verificar duplicados
      checkDuplicateProductName(formData.nombreProducto);
    }
  }, [
    cbsItems,
    formData.categoria,
    formData.nombreProducto,
    allProducts.length,
  ]);

  // Verificar duplicados de BQT cuando cambian los items o sus propiedades
  useEffect(() => {
    if (
      formData.categoria === "BQT" &&
      bqtItems.length > 0 &&
      allProducts.length > 0
    ) {
      // Recalcular el resumenBQT y usarlo para verificar duplicados
      checkDuplicateProductName(formData.nombreProducto);
    }
  }, [
    bqtItems,
    formData.categoria,
    formData.nombreProducto,
    allProducts.length,
  ]);

  // Efecto para generar el nombre del producto y SKU automáticamente
  useEffect(() => {
    // Generar SKU automáticamente al cambiar la categoría
    const generatedSKU = generateSKU(
      formData,
      categorias,
      tiposVariedad,
      allProducts
    );

    if (generatedSKU !== formData.SKU) {
      setFormData((prev) => ({
        ...prev,
        SKU: generatedSKU,
      }));
    }

    // Para productos que NO son BQT o CBS, asignar automáticamente el nombre basado en el resumen
    // Para BQT y CBS, mantener el campo nombreProducto vacío
    if (formData.categoria !== "BQT" && formData.categoria !== "CBS") {
      const summary = generateProductSummary(
        formData,
        categorias,
        tiposVariedad,
        variedades,
        [], // colores ya no se usa
        calibres
      );
      // Siempre actualizar para asegurar que nombreProducto = descripción
      if (summary) {
        setFormData((prev) => ({
          ...prev,
          nombreProducto: summary,
        }));
      }
    } else {
      // Para BQT y CBS, limpiar el nombreProducto si se llena automáticamente
      if (formData.nombreProducto && (
          formData.nombreProducto.startsWith('BQT ') || 
          formData.nombreProducto.startsWith('CBS ')
        )) {
        setFormData((prev) => ({
          ...prev,
          nombreProducto: "",
        }));
      }
    }
  }, [
    formData.categoria,
    formData.subcategoria,
    formData.tallos,
    formData.variedad,
    formData.color,
    formData.calibre,
    categorias,
    tiposVariedad,
    variedades,
    calibres,
    allProducts,
  ]);

  // Aquí usamos la función generateResumenCBS que ya definimos arriba
  // para mantener el valor actualizado del resumenCBS

  // Resumen del producto (usando helper)
  // Función personalizada para generar resumen de productos usando función centralizada para SLD
  function customGenerateProductSummary(
    formData: ProductoFormData,
    categorias: Array<{ id: number; nombreCategoria: string; tipo: string }>, // Basado en Categoria
    tiposVariedad: Array<{ id: string; name: string; abreviatura?: string }>, // Basado en TipoVariedad
    variedades: Array<{ id: string; name: string; type_id: string; tipo: string }>, // Basado en VariedadCultivo
    colores: Array<{ id: number | string; name?: string; nombre?: string }>,
    calibres: Array<{ 
      id_calibre: string;
      prioridad_calibre?: string;
      estado_calibre?: string;
      nombre_variedad?: string;
      nombre_calibre_tipo: string;
      [key: string]: any;
    }>
  ) {
    // Caso especial: SLD + Rainbow o SLD + Assorted usando función centralizada
    if (formData.categoria === "SLD") {
      const sldSummary = generateSLDSummary(formData, tiposVariedad, calibres);
      if (sldSummary) {
        return sldSummary;
      }
    }
    // Lógica original para otros casos
    return generateProductSummary(
      formData,
      categorias,
      tiposVariedad,
      variedades,
      colores,
      calibres
    );
  }

  // Para SLD Rainbow, crear un formData especial para guardar, con variedad vacía
  let formDataToSave = formData;
  if (formData.categoria === "SLD") {
    const subcat = tiposVariedad.find((t) => t.id === formData.subcategoria);
    const subcatName = subcat?.name || "";
    const firstWord = subcatName.split(/[ ,]/)[0];
    if (firstWord === "Rainbow") {
      formDataToSave = { ...formData, variedad: "" };
    }
  }

  const resumenProducto = customGenerateProductSummary(
    formData,
    categorias,
    tiposVariedad,
    variedades,
    [],
    calibres
  );

  // Efecto específico para validar BQT y CBS cuando cambian los items
  useEffect(() => {
    // Solo ejecutar para BQT y CBS cuando hay items
    if (formData.categoria === "BQT" && bqtItems.length > 0) {
      // Forzar validación del resumen BQT
      const bqtResumen = generateResumenBQT();
      if (bqtResumen) {
        // NO actualizar el nombreProducto, mantenerlo vacío para BQT/CBS
        // Solo usamos el resumen para validaciones internas
      }
    } else if (formData.categoria === "CBS" && cbsItems.length > 0) {
      // Forzar validación del resumen CBS
      const cbsResumen = generateResumenCBS();
      if (cbsResumen) {
        // NO actualizar el nombreProducto, mantenerlo vacío para BQT/CBS
        // Solo usamos el resumen para validaciones internas
      }
    } else if (formData.categoria === "BQT" && bqtItems.length === 0) {
      // Limpiar nombreProducto cuando no hay items BQT
      if (formData.nombreProducto) {
        setFormData((prev) => ({
          ...prev,
          nombreProducto: "",
        }));
      }
    } else if (formData.categoria === "CBS" && cbsItems.length === 0) {
      // Limpiar nombreProducto cuando no hay items CBS
      if (formData.nombreProducto) {
        setFormData((prev) => ({
          ...prev,
          nombreProducto: "",
        }));
      }
    }
  }, [bqtItems, cbsItems, formData.categoria]);

  // Función simplificada para verificar similitud de productos
  useEffect(() => {
    // Para BQT y CBS, solo validar si hay items (no necesita nombreProducto)
    const isBQT = formData.categoria === "BQT";
    const isCBS = formData.categoria === "CBS";
    
    if (isBQT && bqtItems.length === 0) return;
    if (isCBS && cbsItems.length === 0) return;
    // Para productos que NO son BQT/CBS, sí necesitamos nombreProducto
    if (!isBQT && !isCBS && !formData.nombreProducto) return;
    
    // NO retornamos temprano para BQT y CBS, ya que necesitamos mostrar también los productos similares
    // Verificamos duplicados exactos en checkDuplicateProductName, pero aquí manejamos similitudes
    
    const normalize = (str: string) =>
      str.toLowerCase().replace(/\s+/g, " ").trim();
    
    // Determinar el valor a comparar según categoría
    let inputValueNorm = "";
    let inputContent = "";
    
    if (isBQT && resumenBQT) {
      // Para BQT, SOLO usamos la composición (sin nombre del usuario)
      inputValueNorm = normalize(resumenBQT);
      
      // Extraer contenido sin el prefijo BQT (todo después de "BQT ")
      const match = resumenBQT.match(/^BQT\s+(.+)$/);
      if (match) {
        let extractedContent = match[1];
        // Solo remover el nombre del usuario si está presente en el formData
        if (formData.nombreProducto && formData.nombreProducto.trim()) {
          // Si hay nombre en el formulario, removerlo de la comparación
          const parts = extractedContent.split(/\s+/);
          const nombreNormalizado = normalize(formData.nombreProducto);
          const primeraPartNormalizada = parts.length > 0 ? normalize(parts[0]) : '';
          
          if (parts.length > 1 && primeraPartNormalizada === nombreNormalizado) {
            // Remover la primera palabra solo si coincide con el nombre del formulario
            extractedContent = parts.slice(1).join(' ');
          }
        }
        inputContent = normalize(extractedContent);
      } else {
        inputContent = inputValueNorm;
      }
    } 
    else if (isCBS && resumenCBS) {
      // Para CBS, SOLO usamos la composición (sin nombre del usuario)
      inputValueNorm = normalize(resumenCBS);
      
      // Extraer contenido sin el prefijo CBS (todo después de "CBS ")
      const match = resumenCBS.match(/^CBS\s+(.+)$/);
      if (match) {
        let extractedContent = match[1];
        // Solo remover el nombre del usuario si está presente en el formData
        if (formData.nombreProducto && formData.nombreProducto.trim()) {
          // Si hay nombre en el formulario, removerlo de la comparación
          const parts = extractedContent.split(/\s+/);
          const nombreNormalizado = normalize(formData.nombreProducto);
          const primeraPartNormalizada = parts.length > 0 ? normalize(parts[0]) : '';
          
          if (parts.length > 1 && primeraPartNormalizada === nombreNormalizado) {
            // Remover la primera palabra solo si coincide con el nombre del formulario
            extractedContent = parts.slice(1).join(' ');
          }
        }
        inputContent = normalize(extractedContent);
      } else {
        inputContent = inputValueNorm;
      }
    } 
    else {
      // Para otros productos, usamos el nombre directamente
      inputValueNorm = normalize(formData.nombreProducto);
    }
    
    const inputWords = inputValueNorm.split(/\s+/);
    
    let bestMatchProduct: any = null;
    let bestMatchCount = 0;
    let exactMatch = false;
    let sameNameExists = false;
    
    allProducts.forEach((p) => {
      if (initialData && p.id === initialData.id) return;
      
      // Verificar nombre exacto SOLO para productos que NO son BQT/CBS
      if (!isBQT && !isCBS) {
        const cleanProductName = normalize(formData.nombreProducto);
        const existingProductName = normalize(p.nombreProducto);
        
        if (existingProductName === cleanProductName) {
          sameNameExists = true;
          bestMatchProduct = p;
          return; // Salir del loop si encontramos un nombre exacto
        }
      }
      
      // Manejo especial para BQT
      if (isBQT && (p.categoria === "BQT" || p.categoria === "Bouquete")) {
        let pContent = "";
        
        // Extraer contenido del producto existente
        if (p.resumen) {
          // Si el resumen ya contiene solo la composición (sin prefijo BQT), usarlo directamente
          if (!p.resumen.startsWith('BQT ')) {
            pContent = normalize(p.resumen);
          } else {
            // Si tiene prefijo BQT, extraer solo la composición
            const match = p.resumen.match(/^BQT\s+(.+)$/);
            pContent = match ? normalize(match[1]) : normalize(p.resumen);
          }
        } else if (p.descripcion) {
          // Misma lógica para descripción
          if (!p.descripcion.startsWith('BQT ')) {
            pContent = normalize(p.descripcion);
          } else {
            const match = p.descripcion.match(/^BQT\s+(.+)$/);
            pContent = match ? normalize(match[1]) : normalize(p.descripcion);
          }
        }
        
        // Si hay contenido para comparar
        if (pContent && inputContent) {
          // Verificar si es exactamente igual
          if (normalize(pContent) === normalize(inputContent)) {
            // Si hay coincidencia exacta, marcar como duplicado exacto
            exactMatch = true;
            bestMatchProduct = p;
            bestMatchCount = 9999; // Valor muy alto para asegurar que este producto tenga prioridad
            return; // Salir del loop
          }
          
          // Si no es exacto, verificar similitud
          const inputWordsArr = inputContent.split(/\s+/);
          const pContentWordsArr = pContent.split(/\s+/);
          const commonWords = inputWordsArr.filter(w => pContentWordsArr.includes(w));
          
          // Si hay al menos un 50% de coincidencia, considerarlo similar
          const similarityPercent = 
            (commonWords.length / Math.min(inputWordsArr.length, pContentWordsArr.length)) * 100;
          
          if (similarityPercent >= 50 && commonWords.length > bestMatchCount) {
            bestMatchCount = commonWords.length;
            bestMatchProduct = p;
          }
        }
      }
      // Manejo especial para CBS
      else if (isCBS && (p.categoria === "CBS" || p.categoria === "Consumer Bounch")) {
        let pContent = "";
        
        // Extraer contenido del producto existente
        if (p.resumen) {
          // Si el resumen ya contiene solo la composición (sin prefijo CBS), usarlo directamente
          if (!p.resumen.startsWith('CBS ')) {
            pContent = normalize(p.resumen);
          } else {
            // Si tiene prefijo CBS, extraer solo la composición
            const match = p.resumen.match(/^CBS\s+(.+)$/);
            pContent = match ? normalize(match[1]) : normalize(p.resumen);
          }
        } else if (p.descripcion) {
          // Misma lógica para descripción
          if (!p.descripcion.startsWith('CBS ')) {
            pContent = normalize(p.descripcion);
          } else {
            const match = p.descripcion.match(/^CBS\s+(.+)$/);
            pContent = match ? normalize(match[1]) : normalize(p.descripcion);
          }
        }
        
        // Si hay contenido para comparar
        if (pContent && inputContent) {
          // Verificar si es exactamente igual
          if (normalize(pContent) === normalize(inputContent)) {
            // Si hay coincidencia exacta, marcar como duplicado exacto
            exactMatch = true;
            bestMatchProduct = p;
            bestMatchCount = 9999; // Valor muy alto para asegurar que este producto tenga prioridad
            return; // Salir del loop
          }
          
          // Verificar similitud
          const inputWordsArr = inputContent.split(/\s+/);
          const pContentWordsArr = pContent.split(/\s+/);
          const commonWords = inputWordsArr.filter(w => pContentWordsArr.includes(w));
          
          // Si hay al menos un 50% de coincidencia, considerarlo similar
          const similarityPercent = 
            (commonWords.length / Math.min(inputWordsArr.length, pContentWordsArr.length)) * 100;
          
          if (similarityPercent >= 50 && commonWords.length > bestMatchCount) {
            bestMatchCount = commonWords.length;
            bestMatchProduct = p;
          }
        }
      }
      // Verificación estándar para otros tipos de producto
      else if (!isBQT && !isCBS) {
        const compareValue = normalize(p.nombreProducto);
        if (compareValue === inputValueNorm) exactMatch = true;
        
        const productWords = compareValue.split(/\s+/);
        const commonWords = inputWords.filter(w => productWords.includes(w));
        
        // Solo considerar como similar si hay al menos 40% de coincidencia
        const similarityPercent =
          (commonWords.length / Math.min(inputWords.length, productWords.length)) * 100;
        
        if (similarityPercent >= 40 && commonWords.length > bestMatchCount) {
          bestMatchCount = commonWords.length;
          bestMatchProduct = p;
        }
      }
    });
    
    // Manejar el caso de SLD especialmente
    if (bestMatchProduct && formData.categoria === "SLD") {
      const subcat = tiposVariedad.find(t => t.id === formData.subcategoria);
      const isRainbow = (subcat?.name || "").split(/[ ,]/)[0] === "Rainbow";
      const nombreComparar = isRainbow ? resumenProducto : formData.nombreProducto;
      const nombreExistente = normalize((bestMatchProduct as Producto).nombreProducto);
      const nombreActual = normalize(nombreComparar || "");
      
      if (nombreExistente === nombreActual) {
        const skuValue = (bestMatchProduct as Producto).SKU || "";
        const compareValue = (bestMatchProduct as Producto).nombreProducto;
        setFieldErrors((prev) => ({
          ...prev,
          nombreProducto: `Ya existe este producto: "${compareValue}", SKU: ${skuValue}`,
        }));
      } else if (bestMatchCount > 0) {
        // Solo mostrar "similar" si NO hay match exacto
        const compareValue = (bestMatchProduct as Producto).nombreProducto;
        const skuValue = (bestMatchProduct as Producto).SKU || "";
        
        setFieldErrors((prev) => ({
          ...prev,
          nombreProducto: `Producto similar encontrado: "${compareValue}", SKU: ${skuValue}`,
        }));
      }
    } else if ((sameNameExists || exactMatch) && bestMatchProduct) {
      // Si existe un producto con el mismo nombre o contenido exacto igual, mostrar error de duplicado
      let compareValue = "";
      const skuValue = bestMatchProduct.SKU || "";
      
      // Para BQT/CBS, mostrar la descripción/resumen en lugar del nombre
      if (isBQT || isCBS) {
        compareValue = bestMatchProduct.resumen || bestMatchProduct.descripcion || bestMatchProduct.nombreProducto || "";
       
      } else {
        compareValue = bestMatchProduct.nombreProducto || "";
      }
       
      setFieldErrors((prev) => ({
        ...prev,
        nombreProducto: `Ya existe este producto: "${compareValue}", SKU: ${skuValue}`,
      }));
    } else if (bestMatchCount > 0 && bestMatchProduct) {
      // Solo mostrar "similar" si NO hay match exacto y tiene palabras en común
      let compareValue = "";
      const skuValue = bestMatchProduct.SKU || "";
      
      // Para BQT/CBS, mostrar la descripción/resumen en lugar del nombre
      if (isBQT || isCBS) {
        compareValue = bestMatchProduct.resumen || bestMatchProduct.descripcion || bestMatchProduct.nombreProducto || "";
       
      } else {
        compareValue = bestMatchProduct.nombreProducto || "";
      }
      
    
      setFieldErrors((prev) => ({
        ...prev,
        nombreProducto: `Producto similar encontrado: "${compareValue}", SKU: ${skuValue}`,
      }));
    } else {
      // Si no hay similitud, limpiar errores de nombre duplicado
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        if (
          prev.nombreProducto &&
          (prev.nombreProducto.includes("Ya existe este producto") ||
           prev.nombreProducto.includes("Producto similar encontrado"))
        ) {
          delete newErrors.nombreProducto;
        }
        return newErrors;
      });
    }
  }, [
    formData.nombreProducto,
    formData.categoria,
    formData.subcategoria,
    resumenProducto,
    resumenBQT,
    resumenCBS,
    bqtItems,
    cbsItems,
    allProducts,
    initialData,
    tiposVariedad
  ]);

  return {
    
    formData,
    setFormData,
    bqtItems,
    setBqtItems,
    cbsItems,
    setCbsItems,
    todasLasVariedades,
    categorias,
    tiposVariedad,
    colores,
    allCalibres,
    variedades,
    calibres,
    statusValue,
    setStatusValue,
    loading,
    setLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    fieldErrors,
    setFieldErrors,
    allProducts,
    setAllProducts,
    loadingCategorias,
    loadingTipos,
    loadingVariedades,
    loadingCalibres,
    resumenBQT,
    resumenCBS,
    resumenProducto,
    lang,
    checkDuplicateProductName, // Exponemos la función para usarla directamente
    getResumenBQTVisual,
  };
};
