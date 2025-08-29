import type { ProductoFormData } from "../../../types/producto";
import { productoService } from "../../../services/productoService";
import productos from "../../../i18n/productos";

/**
 * Hook para manejar la lógica de envío del formulario
 */
export const useProductoSubmit = (
  formData: ProductoFormData,
  bqtItems: any[],
  cbsItems: any[], // Agregamos los items de CBS
  resumenProducto: string,
  resumenBQT: string,
  resumenCBS: string, // Agregamos el resumen de CBS
  categorias: any[],
  tiposVariedad: any[],
  variedades: any[],
  allCalibres: any[],
  setFormData: React.Dispatch<React.SetStateAction<ProductoFormData>>,
  setBqtItems: React.Dispatch<React.SetStateAction<any[]>>,
  setCbsItems: React.Dispatch<React.SetStateAction<any[]>>, // Agregamos el setter de CBS
  setAllProducts: React.Dispatch<React.SetStateAction<any[]>>,
  setStatusValue: React.Dispatch<React.SetStateAction<boolean>>,
  setFieldErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onProductCreated?: () => void
) => {
  
  const submitForm = async () => {
    const lang = document.documentElement.lang.startsWith("en") ? "en" : "es";
    
    // Preparar los datos del producto a enviar
    let productToSubmit = {...formData};
    
    // Lógica específica por categoría para el campo nombreProducto
    if (formData.categoria === "CBS") {
      // Para CBS: En este caso queremos usar el resumenCBS que ya incluye el nombre
      // No hacemos nada aquí, se maneja más abajo al construir dataToSend
    } else if (formData.categoria !== "BQT") {
      // Para otras categorías (que no son BQT ni CBS), usar siempre el resumen como nombre
      productToSubmit.nombreProducto = resumenProducto;
    }
    // Si la subcategoría (por nombre) empieza con 'Assorted' o 'Rainbow', limpiar variedad
    let subcatName = "";
    if (productToSubmit.subcategoria) {
      // Buscar el nombre de la subcategoría por ID
      const subcatObj = tiposVariedad.find((t) => t.id === productToSubmit.subcategoria || t.id === Number(productToSubmit.subcategoria));
      subcatName = subcatObj?.name || subcatObj?.nombre || "";
      if (subcatName.startsWith("Assorted") || subcatName.startsWith("Rainbow")) {
        productToSubmit.variedad = "";
      }
    }
    setLoading(true);
    setError("");

    try {
      // Buscar el nombre de la categoría
      const categoriaObj = categorias.find((c) => c.tipo === formData.categoria);
      const nombreCategoria = categoriaObj?.nombreCategoria || formData.categoria;

      // Para productos no-BQT, construimos una única flor
      type FlorItem = {
        variedad: string;
        tipo: string;
        color: string;
        calibre: string;
        tallos: number;
        orden: number;
        precios?: number | null; // Agregamos precios individuales para cada flor (puede ser null)
        pivot?: {
          tallos: number;
          orden: number;
          precios?: number | null;
        };
      };
      
      let flores: FlorItem[] = [];
      
      // Helper para obtener nombre por id, con soporte especial para calibre
      const getNombre = (arr, id, key = 'name') => {
        if (!arr) return id;
        // Si es calibre, buscar por id_calibre y devolver nombre_calibre_tipo
        if (key === 'nombre_calibre_tipo') {
          const found = arr.find((el) => el.id_calibre === id || el.id === id);
          return found?.nombre_calibre_tipo || id;
        }
        const found = arr.find((el) => el.id === id);
        return found?.[key] || id;
      };

      if (formData.categoria === "BQT") {
        // Para BQT, guardar nombres en vez de ids
        flores = bqtItems.map((item, index) => {
          // Calcular precio por tallo si existe un precio total
          const precioIndividual = item.precios 
            ? Number(item.precios) 
            : (formData.precioTotal ? Number(formData.precioTotal) / bqtItems.reduce((sum, i) => sum + (Number(i.tallos) || 0), 0) : null);
          
          return {
            variedad: getNombre(variedades, item.variedad),
            tipo: getNombre(tiposVariedad, item.subcategoria),
            color: item.color,
            calibre: getNombre(allCalibres, item.calibre, 'nombre_calibre_tipo'),
            tallos: Number(item.tallos) || 0,
            orden: index + 1,
            precios: precioIndividual, // Asegurar que siempre tenga un valor numérico o null
          };
        });
      } else if (formData.categoria === "CBS") {
        // Para CBS, similar a BQT
        flores = cbsItems.map((item, index) => {
          // Calcular precio por tallo si existe un precio total
          const precioIndividual = item.precios 
            ? Number(item.precios) 
            : (formData.precioTotal ? Number(formData.precioTotal) / cbsItems.reduce((sum, i) => sum + (Number(i.tallos) || 0), 0) : null);
          
          return {
            variedad: getNombre(variedades, item.variedad),
            tipo: getNombre(tiposVariedad, item.subcategoria),
            color: item.color,
            calibre: getNombre(allCalibres, item.calibre, 'nombre_calibre_tipo'),
            tallos: Number(item.tallos) || 0,
            orden: index + 1,
            precios: precioIndividual, // Asegurar que siempre tenga un valor numérico o null
          };
        });
      } else {
        // Para productos normales, guardar nombres en vez de ids
        // SLD Rainbow: variedad debe ir vacía
        let variedadValue = "";
        if (productToSubmit.categoria === "SLD") {
          const subcatObj = tiposVariedad.find((t) => t.id === productToSubmit.subcategoria || t.id === Number(productToSubmit.subcategoria));
          const subcatName = subcatObj?.name || subcatObj?.nombre || "";
          const firstWord = subcatName.split(/[ ,]/)[0];
          if (firstWord === "Rainbow") {
            variedadValue = "";
          } else {
            variedadValue = typeof productToSubmit.variedad === "string" ? productToSubmit.variedad : (getNombre(variedades, productToSubmit.variedad) || "");
          }
        } else {
          variedadValue = typeof productToSubmit.variedad === "string" ? productToSubmit.variedad : (getNombre(variedades, productToSubmit.variedad) || "");
        }
        // Asegurémonos de que el precio unitario sea un número válido
        const precioUnitario = productToSubmit.precioTotal && Number(productToSubmit.tallos) > 0 
          ? Number(productToSubmit.precioTotal) / Number(productToSubmit.tallos) 
          : null;
          
        flores = [{
          variedad: variedadValue,
          tipo: getNombre(tiposVariedad, productToSubmit.subcategoria),
          color: productToSubmit.color,
          calibre: getNombre(allCalibres, productToSubmit.calibre, 'nombre_calibre_tipo'),
          tallos: Number(productToSubmit.tallos) || 0,
          orden: 1,
          precios: precioUnitario, // Calculamos el precio unitario
        }];
      }

      // Determinar el nombre y descripción según el tipo de producto
      let productName = productToSubmit.nombreProducto;
      let productDescription;
      
      if (formData.categoria === "BQT") {
        productDescription = resumenBQT;
      } else if (formData.categoria === "CBS") {
        // Para CBS, usar el resumen específico de CBS para la descripción
        productDescription = resumenCBS;
        
        // Si el usuario ha proporcionado un nombre, usarlo; de lo contrario, usar el resumen
        // Ahora el nombre es siempre requerido para CBS
        productName = productToSubmit.nombreProducto && productToSubmit.nombreProducto.trim() !== "" 
          ? productToSubmit.nombreProducto 
          : resumenCBS;
      } else {
        // Para productos no-BQT/CBS, asegurar que el nombre y descripción sean iguales
        productName = resumenProducto;
        productDescription = resumenProducto;
      }
      
      let resumen = "";
      
      if (formData.categoria === "BQT") {
        // Para BQT, extraer SOLO la parte de la composición (tipo, calibre, tallos)
        const resumenCompleto = resumenBQT;
        
        // Primero eliminamos el prefijo "BQT"
        let procesado = resumenCompleto.replace(/^BQT\s+/, '');
        
        // Luego eliminamos el nombre del producto si existe
        if (formData.nombreProducto && formData.nombreProducto.trim() !== '') {
          procesado = procesado.replace(formData.nombreProducto + ' ', '');
        }
        
        // Ahora solo debería quedar la parte de composición (RO&SP 50cm/50cm 10st)
        resumen = procesado.trim();
        
      } else if (formData.categoria === "CBS") {
        // Para CBS, extraer SOLO la parte de la composición (tipo, calibre, tallos)
        const resumenCompleto = resumenCBS;
        
        // Primero eliminamos el prefijo "CBS"
        let procesado = resumenCompleto.replace(/^CBS\s+/, '');
        
        // Luego eliminamos el nombre del producto si existe
        if (formData.nombreProducto && formData.nombreProducto.trim() !== '') {
          procesado = procesado.replace(formData.nombreProducto + ' ', '');
        }
        
        // Ahora solo debería quedar la parte de composición
        resumen = procesado.trim();
      } else {
        // Para productos normales, extraer solo la parte relevante sin el prefijo de categoría
        // y sin el nombre del producto si existe
        const match = resumenProducto.match(/^([A-Z]{2,3})\s+(?:[^\s]+\s+)?(.+)$/i);
        resumen = match ? match[2] : resumenProducto;
      }
      
      const dataToSend = {
        sku: formData.SKU,
        nombre: productName,
        descripcion: productDescription,
        resumen: resumen, // Solo contiene la parte específica (RO&SP 50cm/50cm 10st)
        categoria: nombreCategoria,
        flores,
        vendedor: formData.vendedor || null,
        // Incluir precioTotal si existe
        precioTotal: formData.precioTotal ? Number(formData.precioTotal).toFixed(2) : null,
        // Nuevos campos de parámetros
        ancho: formData.ancho ? Number(formData.ancho) : null,
        alto: formData.alto ? Number(formData.alto) : null,
        peso: formData.peso ? Number(formData.peso) : null,
        largo: (() => {
          // Debug: log calibre values before extracting largo
          
          // Para BQT y CBS: buscar el mayor calibre (como número)
          let maxLargo = null;
          // Extrae el número del label del calibre (nombre_calibre_tipo) usando el ID
          const getCalibreLabel = (id) => {
            if (!id) return '';
            const found = allCalibres?.find(c => c.id_calibre === id || c.id === id);
            return found?.nombre_calibre_tipo || id;
          };
          const extraerNumero = (valor) => {
            if (valor == null) return null;
            if (typeof valor === 'number') return valor;
            // Si es string, buscar el número más grande
            const matches = String(valor).match(/\d+(?:\.\d+)?/g);
            if (!matches) return null;
            return Math.max(...matches.map(Number));
          };
          if (formData.categoria === "BQT" && Array.isArray(bqtItems) && bqtItems.length > 0) {
            maxLargo = bqtItems.reduce((max, item) => {
              const label = getCalibreLabel(item.calibre);
              const n = extraerNumero(label);
              return n !== null && n > max ? n : max;
            }, 0);
            return maxLargo || null;
          }
          if (formData.categoria === "CBS" && Array.isArray(cbsItems) && cbsItems.length > 0) {
            maxLargo = cbsItems.reduce((max, item) => {
              const label = getCalibreLabel(item.calibre);
              const n = extraerNumero(label);
              return n !== null && n > max ? n : max;
            }, 0);
            return maxLargo || null;
          }
          // Para otros: usar calibre del formData
          const label = getCalibreLabel(formData.calibre);
          const n = extraerNumero(label);
          return n || null;
        })(),
      };

      // Asegurarnos de que las flores tienen precios individuales cuando corresponda
      if (flores && Array.isArray(flores)) {
        
        // Verificar que todas las flores tienen un precio individual
        const floresSinPrecio = flores.filter(flor => flor.precios === null || flor.precios === undefined);
        
        if (floresSinPrecio.length > 0) {
          
          // Si hay un precio total, distribuirlo proporcionalmente entre las flores sin precio
          if (formData.precioTotal) {
            const precioTotal = Number(formData.precioTotal);
            const totalTallos = flores.reduce((sum, flor) => sum + flor.tallos, 0);
            
            if (totalTallos > 0) {
              const precioPorTallo = precioTotal / totalTallos;
              
              // Actualizar las flores sin precio
              flores = flores.map(flor => ({
                ...flor,
                precios: flor.precios !== null && flor.precios !== undefined ? flor.precios : precioPorTallo
              }));
            }
          }
        }
        
        // Modificar la estructura para incluir los precios en el pivot
        // Esto es necesario porque el backend espera los precios en el pivot
        flores = flores.map(flor => ({
          ...flor,
          // Agregar un objeto pivot explícito si no existe
          pivot: {
            tallos: flor.tallos,
            orden: flor.orden,
            precios: flor.precios // Incluir precios en el pivot
          }
        }));
        
        // Actualizar el objeto dataToSend con las flores actualizadas
        dataToSend.flores = flores;
      }
      
    

      // Consumir la nueva API
      await productoService.createCompleto(dataToSend);

      // Limpiar el almacenamiento local
      localStorage.removeItem("bqtItems");
      localStorage.removeItem("cbsItems");

      // Limpiar el estado de items
      setBqtItems([]);
      setCbsItems([]);

      // Actualizar la lista de productos después de guardar
      const updatedProducts = await productoService.getAll();
      setAllProducts(updatedProducts);

      // Notificar creación sin recargar tabla
      if (onProductCreated) {
        onProductCreated();
      }

      // Limpiar el formulario para permitir agregar otro producto
      setFormData({
        nombreProducto: "",
        SKU: "",
        categoria: "",
        subcategoria: "",
        variedad: "",
        color: "",
        tallos: "",
        calibre: "",
        estado: 1,
        vendedor: "",
        resumen: "",
        precioTotal: undefined,
      });
      setStatusValue(true); // Reset del switch a activo
      setFieldErrors({}); // Limpiar errores

      // Mostrar mensaje de éxito temporal
      setError("");
      setSuccessMessage(productos[lang].successCreate);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      return true;
    } catch (err: any) {
      console.error("Error al guardar producto:", err);
      
      // Si hay una respuesta detallada, intentar extraer más información
      if (err.response) {
        try {
          const responseData = await err.response.json();
          console.error("Respuesta de error del servidor:", responseData);
          
          // Si hay errores de validación específicos del campo
          if (responseData.errors) {
            const errorMessages = Object.entries(responseData.errors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join('; ');
            setError(`Errores de validación: ${errorMessages}`);
            return false;
          }
        } catch (parseError) {
          console.error("No se pudo parsear la respuesta de error:", parseError);
        }
      }
      
      setError(err.message || productos[lang].errorGeneral);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitForm
  };
};
