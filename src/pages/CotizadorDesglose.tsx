import React, { useState } from "react";
import { guardarCotizacionesMasivas, crearProductoConPaquete, IProductoConPaquete } from "../services/cotizacionService";
import { useTipoVariedad, useCalibreCultivo, useVariedad } from "../hooks/useCultivoCombos";
import { useTranslation } from "react-i18next";
// Vista de desglose de cotización
interface CotizadorDesgloseProps {
  onClose?: () => void;
}
const CotizadorDesglose: React.FC<CotizadorDesgloseProps> = ({ onClose }) => {
  const { t } = useTranslation();
  // Estado para manejar proceso de guardado
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{success?: boolean; message?: string}>({});
  
  // Ajuste para manejar datos de cotizacionProducto con estructura diferente
  const [flores, setFlores] = useState(() => {
    const producto = JSON.parse(localStorage.getItem("cotizacionProducto") || "null");
    // 1) Si es CBS, usar cbsItems
    if (producto?.categoria === "CBS" && Array.isArray(producto.cbsItems) && producto.cbsItems.length > 0) {
      
      return producto.cbsItems.map((item: any) => ({
        variedad: item.variety || item.Variety || item.variedad || "",
        tipo: item.tipo || item.type || "bunch",
        color: item.color || item.Color || "",
        calibre: item.caliber || item.Caliber || item.calibre || "",
        tallos: parseInt(item.stems ?? item.Stems ?? item.tallos ?? 0, 10) || 0,
        precios: parseFloat(item.precioTotal ?? item.price ?? item.Price ?? item.precio ?? 0) || 0
      }));
    }

    // 1.b) También comprobar si hay una clave separada 'cbsItems' en localStorage (legacy)
    try {
      const externalCbs = JSON.parse(localStorage.getItem('cbsItems') || 'null');
      if (producto?.categoria === "CBS" && Array.isArray(externalCbs) && externalCbs.length > 0) {
       
        return externalCbs.map((item: any) => ({
          variedad: item.variety || item.Variety || item.variedad || "",
          tipo: item.tipo || item.type || "bunch",
          color: item.color || item.Color || "",
          calibre: item.caliber || item.Caliber || item.calibre || "",
          tallos: parseInt(item.stems ?? item.Stems ?? item.tallos ?? 0, 10) || 0,
          precios: parseFloat(item.precioTotal ?? item.price ?? item.Price ?? item.precio ?? 0) || 0
        }));
      }
    } catch (e) {
      // ignore parse errors
    }

    // 2) Si existe bqtItems dentro del producto
    if (Array.isArray(producto?.bqtItems) && producto.bqtItems.length > 0) {
      return producto.bqtItems.map((item: any) => ({
        variedad: item.variedad || item.variety || item.nombre || "",
        tipo: item.subcategoria || item.tipo || item.type || "BQT",
        color: item.color || "",
        calibre: item.calibre || item.caliber || "",
        tallos: parseInt(item.tallos ?? item.stems ?? 0, 10) || 0,
        precios: parseFloat(item.precioTotal ?? item.precio ?? item.precios ?? 0) || 0
      }));
    }

    // 3) También comprobar si hay una clave separada 'bqtItems' en localStorage (legacy)
    try {
      const externalBqt = JSON.parse(localStorage.getItem('bqtItems') || 'null');
      if (Array.isArray(externalBqt) && externalBqt.length > 0) {
        return externalBqt.map((item: any) => ({
          variedad: item.variedad || item.variety || item.nombre || "",
          tipo: item.subcategoria || item.tipo || 'BQT',
          color: item.color || "",
          calibre: item.calibre || item.caliber || "",
          tallos: parseInt(item.tallos ?? item.stems ?? 0, 10) || 0,
          precios: parseFloat(item.precioTotal ?? item.precio ?? item.precios ?? 0) || 0
        }));
      }
    } catch (e) {
      // ignore parse errors
    }

    // 4) Si es BQT o tiene flores directamente bajo 'flores'
    if (Array.isArray(producto?.flores) && producto.flores.length > 0) {
      return producto.flores;
    }

    // 4.b) Caso SLD: construir flores a partir de campos del producto
    if (producto?.categoria === 'SLD') {
      // soportar variedad como array o valor simple
      const variedades = producto.variedad || producto.variedades || producto.variedadSeleccionada || [];
      if (Array.isArray(variedades) && variedades.length > 0) {
        return variedades.map((v: any) => ({
          variedad: typeof v === 'string' ? v : v.nombre || v.label || '',
          tipo: producto.subcategoria || producto.tipo || '',
          color: producto.color || '',
          calibre: producto.calibre || producto.caliber || '',
          tallos: parseInt(producto.tallos ?? producto.stems ?? 0, 10) || 0,
          precios: parseFloat(producto.precioTotal ?? producto.precio ?? producto.precios ?? 0) || 0
        }));
      }

      if (producto.variedad || producto.nombreProducto || producto.nombre) {
        return [{
          variedad: producto.variedad || producto.nombreProducto || producto.nombre || '',
          tipo: producto.subcategoria || producto.tipo || '',
          color: producto.color || '',
          calibre: producto.calibre || producto.caliber || '',
          tallos: parseInt(producto.tallos ?? producto.stems ?? 0, 10) || 0,
          precios: parseFloat(producto.precioTotal ?? producto.precio ?? producto.precios ?? 0) || 0
        }];
      }
    }

    return []; // Retornar array vacío si no hay flores
  });

  // Leer producto y paquete desde localStorage para usar en hooks
  const producto = JSON.parse(localStorage.getItem("cotizacionProducto") || "null");

  // Estado para los datos de análisis del producto
  const [analisisProducto, setAnalisisProducto] = useState(() => {
    try {
      // Primero intentar desde el producto guardado
      if (producto?.analisisProducto) {
        return producto.analisisProducto;
      }
      
      // Si no está en el producto, buscar en localStorage separado
      const analisis = localStorage.getItem('analisisProducto');
      if (analisis) {
        const analisisData = JSON.parse(analisis);
        return analisisData;
      }
      
      return null;
    } catch (error) {
      console.warn("[CotizadorDesglose] Error al cargar análisis del producto:", error);
      return null;
    }
  });

  const [paquete, setPaquete] = useState(() => {
    return JSON.parse(localStorage.getItem("cotizacionPaquete") || "null");
  });

  // Cargar combos para resolver ids -> nombres cuando corresponda
  const { data: tiposVariedad } = useTipoVariedad();
  const { data: calibres } = useCalibreCultivo();

  // Cargar variedades para la subcategoria actual (si está disponible)
  const { data: variedadesCombo } = useVariedad(producto?.subcategoria || undefined);

  // Resolver nombre legible de variedad
  const resolveVariedadName = (variedad: any) => {
    if (variedad === null || variedad === undefined) return variedad;
    // Si variedad es un objeto con name, devolver el nombre
    if (typeof variedad === 'object') {
      return variedad.name || '';
    }
    // Si es string no numérica, ya es nombre
    if (typeof variedad === 'string' && isNaN(Number(variedad))) return variedad;
    // Buscar en el combo por id/value
    const key = String(variedad);
    const found = Array.isArray(variedadesCombo)
      ? variedadesCombo.find((v: any) => String(v.id) === key || String(v.value) === key || String(v.id_variedad) === key)
      : undefined;
    return found?.name || String(variedad);
  };

  // Resolver nombres legibles para tipo y calibre en flores (si vienen como IDs)
  const resolveTipoName = (tipo: any) => {
    if (!tipo && tipo !== 0) return tipo;
    const found = Array.isArray(tiposVariedad)
      ? tiposVariedad.find((t: any) => String(t.id) === String(tipo) || String(t.id) === String(tipo))
      : undefined;
    return found?.name || tipo;
  };

  const resolveCalibreName = (cal: any) => {
    if (!cal && cal !== 0) return cal;
    const found = Array.isArray(calibres)
      ? calibres.find((c: any) => String(c.id_calibre) === String(cal) || String(c.id) === String(cal))
      : undefined;
    return found?.nombre_calibre_tipo || cal;
  };

  // Helper para obtener tallos de forma consistente de distintos posibles campos
  const getTallos = (flor: any) => {
    const raw = flor?.tallos ?? flor?.stems ?? flor?.Stems ?? flor?.count ?? flor?.pivot?.tallos ?? 0;
    const n = typeof raw === 'string' ? parseInt(raw.replace(/[^0-9\-]/g, ''), 10) : Number(raw);
    return Number.isFinite(n) && !isNaN(n) ? Math.max(0, n) : 0;
  };

  const handleInputChange = (idx: number, nuevoPrecio: string) => {
    setFlores((prevFlores) => {
      const updatedFlores = [...prevFlores];
      const flor = updatedFlores[idx];
      const tallos = getTallos(flor);
      const precio = parseFloat(flor.precios || flor.price || flor.Price || 0);
      const nuevoPrecioNum = parseFloat(nuevoPrecio) || 0;
      updatedFlores[idx] = {
        ...flor,
        nuevoPrecio,
        nuevoSubtotal: (nuevoPrecioNum * tallos).toFixed(2)
      };
      return updatedFlores;
    });
  };
  // Calcular precio total original: preferir valor guardado en localStorage
  const precioTotalFloresOriginal = (() => {
    try {
      const stored = producto?.precioTotal ?? producto?.priceTotal ?? producto?.precio_total ?? null;
      if (typeof stored === 'number' && !isNaN(stored)) return stored;
      if (typeof stored === 'string' && stored.trim() !== '') {
        const n = parseFloat(stored.replace(/[^0-9\.-]/g, ''));
        if (!isNaN(n)) return n;
      }
    } catch (e) {
      // ignore
    }
    // fallback: calcular a partir de flores (legacy)
    return flores.reduce((total: number, flor: any) => {
      const tallos = getTallos(flor);
      const precio = parseFloat(flor.precios || flor.price || flor.Price || 0) || 0;
      return total + (precio * tallos);
    }, 0);
  })();

  // Calcular precio total nuevo: sumar SOLO lo ingresado en 'nuevoPrecio' * tallos
  const precioTotalFloresNuevo = flores.reduce((total: number, flor: any) => {
    const tallos = getTallos(flor);
    const nuevoPrecio = parseFloat(flor.nuevoPrecio ?? '') || 0; // si no se ingresó, 0
    return total + (nuevoPrecio * tallos);
  }, 0);

  // Calcular total de materiales a nivel de componente (reactivo) para mostrar en la UI
  const precioTotalMaterialesComponent = (paquete && Array.isArray(paquete.materiales))
    ? paquete.materiales.reduce((total: number, mat: any) => {
        const cantidad = parseFloat(mat.cantidad_material ?? mat.cantidad ?? 1) || 1;
        const precio = parseFloat(mat.precio) || 0;
        return total + (precio * cantidad);
      }, 0)
    : 0;

  // Total combinado (flores nuevo + materiales) para mostrar al usuario
  const precioTotalCombinado = Number((precioTotalFloresNuevo + precioTotalMaterialesComponent).toFixed(2));

  // Cálculo de rentabilidad basado en costos totales
  const calcularRentabilidadTotal = (costoOriginal: number, costoNuevo: number): string => {
    if (costoOriginal <= 0) {
      return "El costo original debe ser mayor que cero.";
    }
    const rentabilidad = ((costoNuevo - costoOriginal) / costoOriginal) * 100;
    return `${rentabilidad.toFixed(2)}%`;
  };

  // Función para guardar en la base de datos
  const handleGuardarCotizaciones = async () => {
    setIsSaving(true);
    setSaveStatus({});
    
    try {
      // Calcular rentabilidad antes de proceder
      const rentabilidadPorcentaje = precioTotalFloresOriginal > 0 
        ? ((precioTotalFloresNuevo - precioTotalFloresOriginal) / precioTotalFloresOriginal) * 100
        : 0;
      
      // Validar que la rentabilidad no sea negativa
      if (rentabilidadPorcentaje < 0) {
        setSaveStatus({
          success: false,
          message: `${t("rentabilidadNegativa")} (${rentabilidadPorcentaje.toFixed(2)}%).`
        });
        setIsSaving(false);
        return;
      }
      
      // Obtener datos desde localStorage
      const productoData = JSON.parse(localStorage.getItem("cotizacionProducto") || "null");
      const paqueteData = JSON.parse(localStorage.getItem("cotizacionPaquete") || "null");
      const clientesData = JSON.parse(localStorage.getItem("cotizacionClientes") || "[]");
      const vendedorData = JSON.parse(localStorage.getItem("cotizacionVendedor") || "null");
      
      // Agregar log para debugging
      console.debug("[CotizadorDesglose] Datos cargados:", {
        producto: productoData,
        paquete: paqueteData,
        clientes: clientesData,
        vendedor: vendedorData
      });
      
      // Validar que tengamos los datos necesarios
      if (!productoData || !paqueteData || !clientesData.length || !vendedorData) {
        setSaveStatus({
          success: false, 
          message: "Faltan datos necesarios para guardar la cotización"
        });
        setIsSaving(false);
        return;
      }
      
      // Calcular precios totales para los productos y paquetes
      const precioTotalFlores = flores.reduce((total: number, flor: any) => {
  const tallos = getTallos(flor);
  const nuevoPrecio = parseFloat(flor.nuevoPrecio) || 0;
  return total + (nuevoPrecio * tallos);
      }, 0);
      
      const precioTotalMateriales = paquete.materiales.reduce((total: number, mat: any) => {
        const cantidad = parseFloat(mat.cantidad_material ?? mat.cantidad ?? 1) || 1;
        const precio = parseFloat(mat.precio) || 0;
        return total + (precio * cantidad);
      }, 0);
      
      // Calcular rentabilidad
      const precioTotalOriginal = productoData?.precioTotal || 0;
      // ...existing code...
      // Aquí va la lógica de guardar en base de datos...
      // Si el guardado fue exitoso, limpiar localStorage y los estados locales:
      localStorage.removeItem("cotizacionProducto");
      localStorage.removeItem("cotizacionPaquete");
      localStorage.removeItem("cotizacionClientes");
      localStorage.removeItem("cotizacionVendedor");
      localStorage.removeItem("analisisProducto");
      localStorage.removeItem("cbsItems");
      localStorage.removeItem("bqtItems");
      setFlores([]);
      setPaquete(null);
      setAnalisisProducto(null);
      // Si tienes más estados relacionados, límpialos aquí también
      const rentabilidad = precioTotalOriginal > 0 
        ? ((precioTotalFlores - precioTotalOriginal) / precioTotalOriginal) * 100
        : 0;
      
      // Preparar estructura del producto con paquete usando la nueva API


  // Resolver nombres legibles para tipo y calibre en flores (si vienen como IDs)
  const resolveTipoName = (tipo: any) => {
    if (!tipo && tipo !== 0) return tipo;
    const found = Array.isArray(tiposVariedad)
      ? tiposVariedad.find((t: any) => String(t.id) === String(tipo) || String(t.id) === String(tipo))
      : undefined;
    return found?.name || tipo;
  };

  const resolveCalibreName = (cal: any) => {
    if (!cal && cal !== 0) return cal;
    const found = Array.isArray(calibres)
      ? calibres.find((c: any) => String(c.id_calibre) === String(cal) || String(c.id) === String(cal))
      : undefined;
    return found?.nombre_calibre_tipo || cal;
  };

      const resolveVariedadName = (variedad: any) => {
        if (variedad === null || variedad === undefined) return variedad;
        // If variedad is an object with name/label fields, return the human name
        if (typeof variedad === 'object') {
          return (variedad as any).name || (variedad as any).label || (variedad as any).valor || (variedad as any).variedad || '';
        }

        // If it's a non-numeric string, assume it's already a name
        if (typeof variedad === 'string' && isNaN(Number(variedad))) return variedad;

        // Otherwise try to resolve from variedadesCombo by id/value
        const key = String(variedad);
        const found = Array.isArray(variedadesCombo)
          ? variedadesCombo.find((v: any) => String(v.id) === key || String((v as any).value) === key || String((v as any).id_variedad) === key)
          : undefined;

        return found?.name || (found as any)?.label || (found as any)?.valor || (found as any)?.variedad || String(variedad);
      };

      const floresParaEnviar = Array.isArray(flores)
        ? flores.map((flor: any) => ({
            variedad: resolveVariedadName(flor.variedad),
            tipo: resolveTipoName(flor.tipo || flor.subcategoria),
            calibre: resolveCalibreName(flor.calibre),
            color: flor.color || "",
            precios: parseFloat(flor.nuevoPrecio || flor.precios) || 0,
            tallos: getTallos(flor)
          }))
        : [];

      // Construir un payload limpio y compatible con el formato esperado
      // Preferir precioTotal guardado en el producto; si no existe, usar el calculado (original)
      const precioTotalProductoOriginal = (() => {
        const stored = productoData?.precioTotal ?? productoData?.priceTotal ?? productoData?.precio_total ?? null;
        if (typeof stored === 'number' && !isNaN(stored)) return Number(stored.toFixed(2));
        if (typeof stored === 'string' && stored.trim() !== '') {
          const n = parseFloat(stored.replace(/[^0-9\.-]/g, ''));
          if (!isNaN(n)) return Number(n.toFixed(2));
        }
        return Number((precioTotalFloresOriginal || 0).toFixed(2));
      })();

      // Resolver descripcion y resumen de forma robusta
      const resolvedDescripcion = (productoData?.descripcion && String(productoData.descripcion).trim() !== '')
        ? String(productoData.descripcion)
        : (productoData?.resumen && String(productoData.resumen).trim() !== '')
          ? String(productoData.resumen)
          : (productoData?.nombreProducto || productoData?.nombre || '');

      let resolvedResumen = (productoData?.resumen && String(productoData.resumen).trim() !== '')
        ? String(productoData.resumen)
        : (productoData?.descripcion && String(productoData.descripcion).trim() !== '')
          ? String(productoData.descripcion)
          : (productoData?.nombreProducto || productoData?.nombre || '');

      // Para BQT/CBS queremos mostrar el análisis si existe
      if ((productoData?.categoria === 'BQT' || productoData?.categoria === 'CBS' || productoData?.categoria === 'Bouquete' || productoData?.categoria === 'Consumer Bounch') && analisisProducto) {
        if (analisisProducto.resumen) {
          resolvedResumen = analisisProducto.resumen;
        }
        // Para CBS también mostrar contenidoNormalizado si existe
        if (productoData?.categoria === 'CBS' && analisisProducto.contenidoNormalizado) {
          resolvedResumen = analisisProducto.contenidoNormalizado;
        }
      }

    // Preparar SKUs reutilizables para producto y paquete
    const productSku = productoData.SKU || productoData.sku || `SR${String(Date.now()).slice(-6)}`;
    const packageSku = paqueteData.SKU || paqueteData.sku || `PAQ${String(Date.now()).slice(-6)}`;

    const productoConPaquete: IProductoConPaquete = {
        producto: {
      sku: productSku,
          categoria: productoData.categoria || "Solido",
          subcategoria: productoData.subcategoria || "",
          nombre: productoData.nombreProducto || productoData.nombre || "",
          // Si hay análisis (BQT/CBS), usar los valores derivados de la imagen:
          // - descripcion <- resumen generado (analisisProducto.resumen)
          // - resumen <- contenido normalizado (analisisProducto.contenidoNormalizado)
          descripcion: analisisProducto?.resumen ?? resolvedDescripcion,
          largo: productoData.largo || null,
          vendedor: vendedorData?.label || vendedorData?.nombre || '',
          ancho: productoData.ancho || null,
          alto: productoData.alto || null,
          peso: productoData.peso || null,
      // Usar el costo total calculado a partir de los nuevos precios de flores
      precioTotal: Number((precioTotalFlores || 0).toFixed(2)),
          estadoProceso: productoData.estadoProceso || "Pendiente",
          origen: "Cotizador",
          resumen: analisisProducto?.contenidoNormalizado ?? resolvedResumen,
          flores: Array.isArray(floresParaEnviar)
            ? floresParaEnviar.map((f: any) => ({
                variedad: f.variedad || "",
                tipo: f.tipo || "",
                calibre: f.calibre || "",
                color: f.color || "",
                precios: Number((parseFloat(f.precios) || 0).toFixed(2)),
                tallos: f.tallos ?? 0
              }))
            : [],
          // Agregar datos de análisis si están disponibles
          ...(analisisProducto && {
            analisisProducto: {
              tipo: analisisProducto.tipo,
              resumen: analisisProducto.resumen,
              contenidoNormalizado: analisisProducto.contenidoNormalizado,
              timestamp: analisisProducto.timestamp
            }
          })
        },
        paquete: {
          sku: paqueteData.SKU || paqueteData.sku || `PAQ${String(Date.now()).slice(-6)}`,
          tipo: paqueteData.id ? 'existente' : 'nuevo',
          ...(paqueteData.id ? { paquete_id: Number(paqueteData.id) } : {}),
          categoria: paqueteData.categoria || productoData.categoria || null,
          subcategoria: paqueteData.subcategoria || productoData.subcategoria || null,
          precioTotal: Number((precioTotalMateriales || 0).toFixed(2)),
          nombre: paqueteData.nombre || paqueteData.nombreCliente || null,
          nombreCliente: clientesData[0]?.label || null,
          estadoProceso: paqueteData.estadoProceso || "borrador",
          origen: paqueteData.origen || "Cotizador",
          materiales: Array.isArray(paqueteData.materiales)
            ? paqueteData.materiales.map((mat: any) => ({
                material_id: mat.material_id || mat.id,
                cantidad: parseFloat(mat.cantidad_material ?? mat.cantidad ?? 1)
              }))
            : []
        },
        receta: {
          // SKU de receta formado por SKU producto + '_' + SKU paquete
          sku: `${productSku}${packageSku}`,
          // Precio de receta = costo total flores (nuevo) + total materiales
          precio: Number(((precioTotalFlores || 0) + (precioTotalMateriales || 0)).toFixed(2)),
          estadoProceso: paqueteData.estadoProceso || "pendiente",
          origen: "Cotizador"
        }
      };
      
      // Helper: sanitize payload — trim strings and remove null/empty fields
      const sanitize = (obj: any) => {
        const seen = new WeakSet();
        const cleaned = JSON.parse(JSON.stringify(obj, (k, v) => {
          // Remove null/undefined/empty-string
          if (v === null || v === undefined) return undefined;
          if (typeof v === 'string') {
            const t = v.trim();
            if (t === '') return undefined;
            return t;
          }
          return v;
        }));
        // Remove empty objects or arrays recursively
        const prune = (o: any) => {
          if (o && typeof o === 'object') {
            if (seen.has(o)) return o;
            seen.add(o);
            if (Array.isArray(o)) {
              return o.map(prune).filter((x: any) => x !== undefined && !(typeof x === 'object' && Object.keys(x).length === 0));
            }
            Object.keys(o).forEach(k => {
              o[k] = prune(o[k]);
              if (o[k] === undefined || (typeof o[k] === 'object' && o[k] !== null && Object.keys(o[k]).length === 0)) {
                delete o[k];
              }
            });
            return o;
          }
          return o;
        };
        return prune(cleaned);
      };

      // Guardamos los resultados para cada cliente
      const resultados: any[] = [];
      let errores = 0;
      
      // Procesar cada cliente
      for (const cliente of clientesData) {
        try {
          // Ajustar datos específicos para este cliente
          const clienteData: IProductoConPaquete = {
            producto: {
              ...productoConPaquete.producto,
              // Asegurar que los campos requeridos estén presentes
              sku: productoConPaquete.producto.sku || `SKU${Date.now()}`,
              estadoProceso: "Pendiente",
              origen: "Cotizador"
            },
            paquete: {
              ...productoConPaquete.paquete,
              nombreCliente: cliente.label || "Cliente sin especificar",
              // Asegurar que tipo está correctamente definido
              tipo: productoConPaquete.paquete.tipo || "existente",
              // Asegurar que origen está presente
              origen: "Cotizador"
            },
            receta: {
              ...productoConPaquete.receta,
              sku: productoConPaquete.receta?.sku || `REC${Date.now()}`,
              estadoProceso: "Pendiente",
              origen: "Cotizador"
            },
            cliente_id: Number(cliente.value),
            vendedor_id: Number(vendedorData?.value)
          };
          
          // Sanitize payload to remove empty fields and trim strings
          const payloadToSend = sanitize(clienteData);

          // Llamar a la nueva API
          const resultado = await crearProductoConPaquete(payloadToSend);
          resultados.push(resultado);
        } catch (clienteError: any) {
          console.error(`[CotizadorDesglose] Error al guardar para cliente ${cliente.label}:`, clienteError);
          // Si el servicio adjuntó detalles de validación, muéstralos
          const validation = clienteError?.details || clienteError?.response || null;
          if (validation) {
            console.error(`[CotizadorDesglose] Detalles de validación para ${cliente.label}:`, validation);
          }
          // Añadir al arreglo de resultados con detalles para su inspección
          resultados.push({ error: true, cliente: cliente.label, message: clienteError.message, details: validation });
          errores++;
        }
      }
      
      if (errores === 0) {
        setSaveStatus({
          success: true,
          message: `Se han guardado ${clientesData.length} cotizaciones exitosamente`
        });
        // Regresar a la vista anterior si onClose está definido
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 1200); // Espera breve para mostrar el mensaje
        }
      } else if (errores < clientesData.length) {
        setSaveStatus({
          success: true,
          message: `Se guardaron ${clientesData.length - errores} cotizaciones, pero ${errores} fallaron`
        });
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      } else {
        setSaveStatus({
          success: false,
          message: `No se pudo guardar ninguna cotización`
        });
      }
      // Limpiar todos los datos relevantes del localStorage después de guardar
      localStorage.removeItem("cotizacionProducto");
      localStorage.removeItem("cotizacionPaquete");
      localStorage.removeItem("cotizacionClientes");
      localStorage.removeItem("cotizacionVendedor");
      localStorage.removeItem("analisisProducto");
      localStorage.removeItem("bqtItems");
      localStorage.removeItem("cbsItems");
    } catch (error: any) {
      console.error("[CotizadorDesglose] Error al guardar cotizaciones:", error);
      // Mostrar un mensaje más descriptivo
      setSaveStatus({
        success: false,
        message: `Error al guardar: ${error.message || "Error desconocido"}. Por favor, contacte a soporte técnico.`
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto">
    
      
      {/* Mensajes de estado */}
      {saveStatus.message && (
        <div className={`p-4 mb-6 rounded text-center ${saveStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {saveStatus.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Sección Producto */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 w-full h-full">
          <h3 className="text-lg font-bold text-yellow-700 mb-2 text-center">{t("vegetable")}-{t("flowers")}</h3>
          <div className="mt-4">
          
              <div className="w-full overflow-x-auto">
                <table className="min-w-[600px] w-full text-xs mt-2 border">
              <thead>
                <tr className="bg-yellow-100">
                   <th className="px-2 py-1">{t("tipe")}</th>
                  <th className="px-2 py-1">{t("variety")}</th>
                  <th className="px-2 py-1">{t("color")}</th>
                  <th className="px-2 py-1">{t("calibre")}</th>
                  <th className="px-2 py-1">{t("tallos")}</th>
                  <th className="px-2 py-1">{t("costo_unitario")}</th>
                  <th className="px-2 py-1">{t("nuevo_precio")}</th>
                  <th className="px-2 py-1">{t("nuevo_subtotal")}</th>
                </tr>
              </thead>
              <tbody>
                {flores.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-2">No hay flores para mostrar</td>
                  </tr>
                ) : flores.map((flor: any, idx: number) => {
                  const tallos = getTallos(flor);
                  const costoUnitario = parseFloat(flor.precios ?? flor.price ?? flor.Price ?? 0) || 0;
                  return (
                    <tr key={idx}>
                        <td className="px-2 py-1">{resolveTipoName(flor.tipo || flor.subcategoria) || '-'}</td>
                      <td className="px-2 py-1">{resolveVariedadName(flor.variedad) || '-'}</td>
                      
                        <td className="px-2 py-1">{flor.color || '-'}</td>
                        <td className="px-2 py-1 text-center">{resolveCalibreName(flor.calibre) || '-'}</td>
                      <td className="px-2 py-1 text-center">{tallos}</td>
                      <td className="px-2 py-1 text-center">${costoUnitario.toFixed(2)}</td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          className="border rounded px-1 py-0.5 text-center"
                          placeholder={t("nuevo_precio")}
                          onChange={(e) => handleInputChange(idx, e.target.value)}
                          value={flor.nuevoPrecio ?? ""}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">{flor.nuevoSubtotal || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}></td>
                  <td className="px-2 py-1 text-center font-bold text-yellow-700" style={{background:'#fffbe6'}}>
                    Total:<br />
                    <span>${precioTotalFloresOriginal.toFixed(2)}</span>
                  </td>
                  <td></td>
                  <td className="px-2 py-1 text-center font-bold text-yellow-700" style={{background:'#fffbe6'}}>
                    Total:<br />
                    <span>${precioTotalFloresNuevo.toFixed(2)}</span>
                  </td>
                </tr>
               
              </tfoot>
                </table>
              </div>
           
          </div>
          
        </div>
        {/* Sección Paquete */}
        
        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200 w-full h-full">
          <h3 className="text-lg font-bold text-pink-700 mb-2 text-center">{t("package")}: {(paquete && paquete.nombre) ? paquete.nombre : "-"}</h3>
          {paquete ? (
            <>
              <div className="mt-4">
               
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-[600px] w-full text-xs mt-2 border">
                  <thead>
                    <tr className="bg-pink-100">
                      <th className="px-2 py-1">SKU</th>
                      <th className="px-2 py-1">Descripción</th>
                      <th className="px-2 py-1">Marca</th>
                      <th className="px-2 py-1">Cantidad</th>
                      <th className="px-2 py-1">Precio</th>
                      <th className="px-2 py-1">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paquete.materiales.map((mat: any, idx: number) => {
                      const cantidad = parseFloat(mat.cantidad_material ?? mat.cantidad ?? 1) || 1;
                      const precio = parseFloat(mat.precio) || 0;
                      return (
                        <tr key={idx}>
                          <td className="px-2 py-1">{mat.sku}</td>
                          <td className="px-2 py-1">{mat.descripcion}</td>
                          <td className="px-2 py-1">{mat.marca}</td>
                          <td className="px-2 py-1 text-center">{cantidad}</td>
                          <td className="px-2 py-1 text-center">${precio.toFixed(2)}</td>
                          <td className="px-2 py-1 text-center">${(precio * cantidad).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-pink-50">
                      <td colSpan={5} className="px-2 py-1 text-right font-bold text-pink-700">{t("total")}:</td>
                      <td className="px-2 py-1 text-center font-bold text-pink-700">
                        ${paquete.materiales.reduce((total: number, mat: any) => {
                          const cantidad = parseFloat(mat.cantidad_material ?? mat.cantidad ?? 1) || 1;
                          const precio = parseFloat(mat.precio) || 0;
                          return total + (precio * cantidad);
                        }, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                  </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-sm">No hay datos de paquete.</div>
          )}
        </div>
      </div>
       <div className="bg-blue-100 rounded-lg p-4 border border-blue-200 w-full h-full">
              <p><b>{t("costo_paquete")}:</b> ${precioTotalMaterialesComponent.toFixed(2)}</p>
              <p>
                <b>{t("rentabilidad")}:</b> ${ (precioTotalFloresNuevo - precioTotalFloresOriginal).toFixed(2) } / 
                <span className={
                  precioTotalFloresOriginal > 0 && ((precioTotalFloresNuevo - precioTotalFloresOriginal) / precioTotalFloresOriginal) * 100 < 0
                    ? "text-red-600 font-bold" 
                    : "text-green-600 font-bold"
                }>
                  {calcularRentabilidadTotal(precioTotalFloresOriginal, precioTotalFloresNuevo)}
                </span>
                {precioTotalFloresOriginal > 0 && ((precioTotalFloresNuevo - precioTotalFloresOriginal) / precioTotalFloresOriginal) * 100 < 0 && (
                  <span className="block text-red-600 text-sm mt-1">
                    ⚠️ {t("rentabilidadNegativa")}
                  </span>
                )}
                <br />
               
              </p>
              <p><b>{t("costo_total")}:</b> ${precioTotalCombinado.toFixed(2)}</p>
            </div>
      {/* Sección de clientes */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200 hidden  ">
        <h3 className="text-lg font-bold text-blue-700 mb-2 text-center">Clientes y Vendedor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-700">Clientes:</h4>
            <div className="mt-2 bg-white p-3 rounded border border-blue-100">
              {(() => {
                try {
                  const clientes = JSON.parse(localStorage.getItem("cotizacionClientes") || "[]");
                  if (clientes.length === 0) return <p className="text-gray-500">No hay clientes seleccionados</p>;
                  
                  return (
                    <ul className="list-disc pl-5">
                      {clientes.map((cliente: any, idx: number) => (
                        <li key={idx} className="text-sm">{cliente.label}</li>
                      ))}
                    </ul>
                  );
                } catch (e) {
                  return <p className="text-red-500">Error al cargar clientes</p>;
                }
              })()}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700">Vendedor:</h4>
            <div className="mt-2 bg-white p-3 rounded border border-blue-100">
              {(() => {
                try {
                  const vendedor = JSON.parse(localStorage.getItem("cotizacionVendedor") || "null");
                  return vendedor ? (
                    <p>{vendedor.label}</p>
                  ) : (
                    <p className="text-gray-500">No hay vendedor seleccionado</p>
                  );
                } catch (e) {
                  return <p className="text-red-500">Error al cargar vendedor</p>;
                }
              })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Sección de análisis del producto */}
      {analisisProducto && (
        <div className="mt-8 bg-purple-50 rounded-lg p-4 border border-purple-200 hidden">
          <h3 className="text-lg font-bold text-purple-700 mb-2 text-center">Análisis del Producto</h3>
          <div className="bg-white p-4 rounded border border-purple-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Información del Análisis:</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Tipo:</span> {analisisProducto.tipo}</p>
                  <p><span className="font-medium">Fecha:</span> {new Date(analisisProducto.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Resumen Generado:</h4>
                <div className="bg-purple-50 p-3 rounded text-sm">
                  {analisisProducto.resumen}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-purple-700 mb-2">Contenido Normalizado:</h4>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                {analisisProducto.contenidoNormalizado}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Botones de acción */}
      <div className="mt-8 flex justify-end gap-4">
        {(() => {
          const rentabilidadNegativa = precioTotalFloresOriginal > 0 && 
            ((precioTotalFloresNuevo - precioTotalFloresOriginal) / precioTotalFloresOriginal) * 100 < 0;
          
          return (
            <button
              onClick={handleGuardarCotizaciones}
              disabled={isSaving || rentabilidadNegativa}
              className={`px-6 py-2 rounded transition-colors ${
                isSaving || rentabilidadNegativa 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-pink-600 hover:bg-pink-700'
              } text-white`}
              style={!isSaving && !rentabilidadNegativa ? {background:'#ec4899'} : {}}
              title={rentabilidadNegativa ? t("rentabilidadNegativa") : ""}
            >
              {isSaving ? 'Guardando...' : t("save")}
            </button>
          );
        })()}
      </div>
    </div>
  );
};

export default CotizadorDesglose;
