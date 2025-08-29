import type { ProductoFormData, Producto } from "../types/producto";

// Tipos para el centralizador
export interface ItemBase {
  subcategoria: string;
  calibre: string;
  tallos: string | number;
}

export interface GenerateResumenOptions {
  categoria: string;
  nombre: string;
  items: ItemBase[];
  allCalibres: any[];
  tiposVariedad: any[];
  subcatName?: string;
}

export interface CheckDuplicateOptions {
  categoria: string;
  currentResumen: string;
  products: any[];
  initialId?: string;
  validCategories: string[];
}

// Función para normalizar strings
export const normalize = (str: string): string =>
  str.toLowerCase().replace(/\s+/g, " ").trim();

// Función centralizada para agrupar items por subcategoría y calibre
export const groupItemsBySubcatAndCalibre = (
  items: ItemBase[],
  tiposVariedad: any[],
  allCalibres: any[]
): Map<string, { abreviatura: string; calibre: string; tallos: number }> => {
  const groupMap = new Map();
  
  items.forEach((item) => {
    const subcat = tiposVariedad.find((t) => t.id === item.subcategoria);
    const abreviatura = subcat?.abreviatura || "";
    const cal = allCalibres?.find((c) => c.id_calibre === item.calibre);
    const calibre = cal?.nombre_calibre_tipo ? cal.nombre_calibre_tipo.replace(/\s/g, "") : "";
    const key = `${abreviatura}|${calibre}`;
    const tallos = Number(item.tallos) || 0;
    
    if (!groupMap.has(key)) {
      groupMap.set(key, { abreviatura, calibre, tallos });
    } else {
      groupMap.get(key).tallos += tallos;
    }
  });
  
  return groupMap;
};

// Función centralizada para generar resumen de BQT/CBS
export const generateResumen = (options: GenerateResumenOptions): string => {
  const { categoria, nombre, items, allCalibres, tiposVariedad, subcatName } = options;
  
  if (!items || items.length === 0) return nombre || "";

  const nombreFinal = nombre && nombre.trim() !== "" ? nombre : "";

  if (categoria === "CBS") {
    // Lógica específica para CBS
    const subcatNameFinal = subcatName || (() => {
      if (items.length === 0) return "";
      const subcatId = items[0].subcategoria;
      const subcat = tiposVariedad.find((t) => t.id === subcatId);
      return subcat?.name || "";
    })();

    // Calibres para CBS
    const calibresArr = items
      .map((item) => {
        const cal = allCalibres?.find((c) => c.id_calibre === item.calibre);
        return cal?.nombre_calibre_tipo
          ? cal.nombre_calibre_tipo.replace(/\s/g, "")
          : "";
      })
      .filter(Boolean);

    // Suma tallos
    const totalTallos = items.reduce(
      (sum, item) => sum + (Number(item.tallos) || 0),
      0
    );

    return `CBS ${nombreFinal} ${subcatNameFinal} ${calibresArr.join("/")} ${totalTallos}st`;
  }

  if (categoria === "BQT") {
    // Lógica específica para BQT
    const groupMap = groupItemsBySubcatAndCalibre(items, tiposVariedad, allCalibres);

    // Si todos los grupos tienen el mismo número de tallos, se puede agrupar
    const tallosSet = new Set(Array.from(groupMap.values()).map((g) => g.tallos));
    let subcats, calibresArr, totalTallos;
    
    if (tallosSet.size === 1) {
      // Agrupar abreviaturas y calibres únicos
      subcats = Array.from(groupMap.values()).map((g) => g.abreviatura).filter(Boolean).join("&");
      calibresArr = Array.from(groupMap.values()).map((g) => g.calibre).filter(Boolean).join("/");
      totalTallos = Array.from(groupMap.values())[0].tallos * groupMap.size;
    } else {
      // No agrupar, mostrar todos
      subcats = Array.from(groupMap.values()).map((g) => g.abreviatura).filter(Boolean).join("&");
      calibresArr = Array.from(groupMap.values()).map((g) => g.calibre).filter(Boolean).join("/");
      totalTallos = Array.from(groupMap.values()).reduce((sum, g) => sum + g.tallos, 0);
    }

    return `BQT ${nombreFinal} ${subcats} ${calibresArr} ${totalTallos}st`;
  }

  return nombreFinal;
};

// Función centralizada para generar resumen visual de BQT con pipes
export const generateResumenVisual = (options: GenerateResumenOptions): string => {
  const { categoria, nombre, items, allCalibres, tiposVariedad } = options;
  
  if (categoria !== "BQT" || !items || items.length === 0) return nombre || "";

  const nombreFinal = nombre && nombre.trim() !== "" ? nombre : "";
  const groupMap = groupItemsBySubcatAndCalibre(items, tiposVariedad, allCalibres);

  // Si todos los grupos tienen el mismo número de tallos, se puede agrupar
  const tallosSet = new Set(Array.from(groupMap.values()).map((g) => g.tallos));
  let subcats, calibresArr, totalTallos;
  
  if (tallosSet.size === 1) {
    // Agrupar abreviaturas y calibres únicos
    subcats = Array.from(groupMap.values()).map((g) => g.abreviatura).filter(Boolean).join("&");
    calibresArr = Array.from(groupMap.values()).map((g) => g.calibre).filter(Boolean).join("/");
    totalTallos = Array.from(groupMap.values())[0].tallos * groupMap.size;
  } else {
    // No agrupar, mostrar todos
    subcats = Array.from(groupMap.values()).map((g) => g.abreviatura).filter(Boolean).join("&");
    calibresArr = Array.from(groupMap.values()).map((g) => g.calibre).filter(Boolean).join("/");
    totalTallos = Array.from(groupMap.values()).reduce((sum, g) => sum + g.tallos, 0);
  }

  return `BQT | ${nombreFinal} | ${subcats} | ${calibresArr} | ${totalTallos}st`;
};

// Función centralizada para verificar duplicados por resumen
export const checkProductDuplicateByResumen = (options: CheckDuplicateOptions): any | null => {
  const { categoria, currentResumen, products, initialId, validCategories } = options;
  
  // Extraer la parte descriptiva relevante del resumen actual
  let currentContent = "";
  
  if (currentResumen.includes(' ')) {
    // Dividimos en partes: primero quitamos el prefijo de categoría
    const withoutPrefix = currentResumen.substring(categoria.length).trim();
    
    // Si hay un espacio, tomamos la primera palabra como nombre y el resto como contenido
    if (withoutPrefix.includes(' ')) {
      const partes = withoutPrefix.split(' ');
      const nombre = partes[0];
      currentContent = withoutPrefix.substring(nombre.length).trim();
    }
  }
  
  if (!currentContent) {
    return null;
  }
  
  // Buscar un producto con la misma composición
  return products.find((p) => {
    // Si estamos editando y el producto es el mismo, no es un duplicado
    if (initialId && p.id === initialId) return false;
    
    // Verificar que el producto sea de la categoría adecuada
    if (!validCategories.includes(p.categoria)) return false;
    
    // Extraer el contenido de comparación del producto de manera más directa
    let existingContent = "";
    
    // Primero intentar usar el campo resumen si existe
    if (p.resumen && p.resumen.includes(' ')) {
      const withoutPrefix = p.resumen.substring(categoria.length).trim();
      if (withoutPrefix.includes(' ')) {
        const partes = withoutPrefix.split(' ');
        const nombre = partes[0];
        existingContent = withoutPrefix.substring(nombre.length).trim();
      }
    }
    
    // Si no hay resumen, intentar con descripción
    if (!existingContent && p.descripcion && p.descripcion.includes(' ')) {
      const withoutPrefix = p.descripcion.substring(categoria.length).trim();
      if (withoutPrefix.includes(' ')) {
        const partes = withoutPrefix.split(' ');
        const nombre = partes[0];
        existingContent = withoutPrefix.substring(nombre.length).trim();
      }
    }
    
    // Comparación final
    const coinciden = normalize(existingContent) === normalize(currentContent);
    
    return coinciden;
  }) || null;
};

// Función centralizada para manejar la lógica de SLD Rainbow/Assorted
export const generateSLDSummary = (
  formData: ProductoFormData,
  tiposVariedad: any[],
  calibres: any[]
): string => {
  if (formData.categoria !== "SLD") return "";
  
  const subcat = tiposVariedad.find((t) => t.id === formData.subcategoria);
  const subcatName = subcat?.name || "";
  
  if (subcatName.includes("Rainbow")) {
    // Nombre base: SLD + subcatName (ya incluye "Rainbow Roses")
    let base = `SLD ${subcatName}`;
    
    // Colores: del campo color como string separado por comas
    let coloresArr: string[] = [];
    if (formData.color && typeof formData.color === 'string') {
      coloresArr = formData.color.split(',').map(c => c.trim()).filter(c => c);
    }
    
    // Tallos: array o string
    let tallosArr: string[] = [];
    if (Array.isArray(formData.tallos)) {
      tallosArr = formData.tallos.map((t) => String(t));
    } else if (formData.tallos) {
      tallosArr = [String(formData.tallos)];
    }
    
    // Calibre
    let calibreLabel = "";
    if (formData.calibre) {
      const cal = calibres?.find((c) => c.id_calibre === formData.calibre);
      calibreLabel = cal ? cal.nombre_calibre_tipo : formData.calibre;
    }
    
    // Construir resumen: SLD Rainbow Roses Red/Blue/Yellow 25st 6 cm
    const colorStr = coloresArr.join('/');
    const tallosStr = tallosArr.map(t => `${t}st`).join('/');
    
    return `${base} ${colorStr} ${tallosStr} ${calibreLabel}`.trim();
    
  } else if (subcatName.includes("Assorted")) {
    // Nombre base: SLD + subcatName (ej: "SLD Assorted Roses")
    let base = `SLD ${subcatName}`;
    
    // Color: del campo color (solo uno para Assorted)
    let colorStr = "";
    if (formData.color && typeof formData.color === 'string') {
      colorStr = formData.color.trim();
    }
    
    // Tallos
    let tallosStr = "";
    if (formData.tallos) {
      tallosStr = `${formData.tallos}st`;
    }
    
    // Calibre
    let calibreLabel = "";
    if (formData.calibre) {
      const cal = calibres?.find((c) => c.id_calibre === formData.calibre);
      calibreLabel = cal ? cal.nombre_calibre_tipo : formData.calibre;
    }
    
    // Construir resumen: SLD Assorted Roses Bi - Color Peach 25st 2 cm
    return `${base} ${colorStr} ${tallosStr} ${calibreLabel}`.trim();
  }
  
  return "";
};

// Función centralizada para extraer contenido de productos para comparación
export const extractProductContent = (
  product: any,
  categoria: string,
  isForComparison: boolean = false
): string => {
  let content = "";
  
  // Usar resumen primero, luego descripción
  const sourceText = product.resumen || product.descripcion || "";
  
  if (sourceText && sourceText.includes(' ')) {
    const withoutPrefix = sourceText.substring(categoria.length).trim();
    if (withoutPrefix.includes(' ')) {
      const partes = withoutPrefix.split(' ');
      const nombre = partes[0];
      content = withoutPrefix.substring(nombre.length).trim();
    }
  }
  
  return isForComparison ? normalize(content) : content;
};

// Función centralizada para detectar similitudes entre productos
export const findSimilarProducts = (
  inputContent: string,
  products: any[],
  categoria: string,
  validCategories: string[],
  initialId?: string,
  similarityThreshold: number = 50
): { exactMatch: any | null; similarMatch: any | null; matchCount: number } => {
  let exactMatch: any | null = null;
  let similarMatch: any | null = null;
  let bestMatchCount = 0;
  
  const inputContentNorm = normalize(inputContent);
  const inputWordsArr = inputContentNorm.split(/\s+/);
  
  products.forEach((p) => {
    if (initialId && p.id === initialId) return;
    if (!validCategories.includes(p.categoria)) return;
    
    const pContent = extractProductContent(p, categoria, true);
    
    if (pContent) {
      // Verificar si es exactamente igual
      if (pContent === inputContentNorm) {
        exactMatch = p;
        return;
      }
      
      // Verificar similitud
      const pContentWordsArr = pContent.split(/\s+/);
      const commonWords = inputWordsArr.filter(w => pContentWordsArr.includes(w));
      
      const similarityPercent = 
        (commonWords.length / Math.min(inputWordsArr.length, pContentWordsArr.length)) * 100;
      
      if (similarityPercent >= similarityThreshold && commonWords.length > bestMatchCount) {
        bestMatchCount = commonWords.length;
        similarMatch = p;
      }
    }
  });
  
  return { exactMatch, similarMatch, matchCount: bestMatchCount };
};

// Función helper para verificar si un error es de tipo duplicado
export const isDuplicateError = (errorMessage: string): boolean => {
  return errorMessage.includes("Ya existe un producto con este nombre") ||
         errorMessage.includes("Ya existe este producto") ||
         errorMessage.includes("Ya existe un producto BQT con") ||
         errorMessage.includes("Ya existe un producto CBS con") ||
         errorMessage.includes("Producto similar encontrado");
};

// Función helper para crear un limpiador de errores de duplicados
export const createErrorCleaner = (
  setFieldErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>,
  setError: React.Dispatch<React.SetStateAction<string>>
) => {
  return () => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (prev.nombreProducto && isDuplicateError(prev.nombreProducto)) {
        delete newErrors.nombreProducto;
        setError(""); // Limpiar también el error general
      }
      return newErrors;
    });
  };
};
