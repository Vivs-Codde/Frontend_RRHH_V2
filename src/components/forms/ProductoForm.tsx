import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Producto } from "../../types/producto";
import SearchableSelect from "../SearchableSelect";

import BqtItemList from "./BqtItemList";
// Componentes y hooks modularizados
import {
  ProductHeader,
  ClassificationForm,
  ActionButtons,
  Notifications,
  useProductoFormLogic,
  useBqtFunctions,
  useProductoValidation,
  useProductoSubmit,
} from "./producto";
import { useCbsFunctions } from "./producto/useCbsFunctions";

interface ProductoFormProps {
  onSubmit: (data: any) => void;
  initialData?: Producto | null;
  onCancel?: () => void;
  onProductCreated?: () => void;
  hideButtons?: boolean; // Prop para ocultar los botones
}

const ProductoForm: React.FC<ProductoFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
  onProductCreated,
  hideButtons = false,
}) => {

  // Estado para mostrar/ocultar acordeón de parámetros
  const [showParametros, setShowParametros] = React.useState(false);

  // Usar hooks para obtener la lógica del formulario
  const { t } = useTranslation();

  // Obtener el estado y la lógica del formulario
  const formLogic = useProductoFormLogic(initialData, onProductCreated);

  const {
    formData,
    setFormData,
    bqtItems,
    setBqtItems,
    cbsItems,
    setCbsItems, // Agregamos los items de CBS
    todasLasVariedades,
  } = formLogic;

  // Notificar al padre cuando los datos cambien (solo si es cotizador)
  useEffect(() => {
    // Solo ejecutar si hideButtons está activado (modo cotizador)
    if (hideButtons && formData) {
      onSubmit(formData);
    }
  }, [formData, hideButtons, onSubmit]);

  const {
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
    checkDuplicateProductName, // Agregamos la función para verificar duplicados
  } = formLogic;

  // Estado para vendedores
  const [vendedores, setVendedores] = React.useState<
    { id: string; nombre: string }[]
  >([]);

  // Estado para colores de la API
  const [coloresApi, setColoresApi] = React.useState<
    { id: string; name: string }[]
  >([]);

  // Fetch vendedores al montar
  React.useEffect(() => {
    async function fetchVendedores() {
      try {
        // Importar constantes de API
        const { API_ENDPOINTS, getAuthHeaders } = await import(
          "../../constants/api"
        );
        const res = await fetch(API_ENDPOINTS.VENDEDORES.LIST, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        // Filtrar solo los vendedores activos (estado === 1 o true)
        const activos = Array.isArray(data)
          ? data.filter((v: any) => v.estado === 1 || v.estado === true)
          : [];
        setVendedores(
          activos.map((v: any) => ({ id: String(v.id), nombre: v.nombre }))
        );
      } catch (e) {
        setVendedores([]);
      }
    }
    fetchVendedores();
  }, []);

  // Fetch colores de la API
  React.useEffect(() => {
    async function fetchColores() {
      try {
        const { API_CULTIVO_COMBO_COLOR_API } = await import(
          "../../constants/apiCultivo"
        );
        const res = await fetch(API_CULTIVO_COMBO_COLOR_API);
        const response = await res.json();
        // La respuesta tiene formato { data: ColorCultivo[] }
        const data = response.data || [];
        setColoresApi(
          Array.isArray(data)
            ? data.map((c: any) => ({ id: String(c.id), name: c.name }))
            : []
        );
      } catch (e) {
        console.error("Error fetching colores:", e);
        setColoresApi([]);
      }
    }
    fetchColores();
  }, []);

  // Obtener las funciones de validación
  const validation = useProductoValidation(lang);

  // Manejo personalizado para el botón cancelar
  const handleCancel = () => {
    if (formData.categoria === "BQT") {
      localStorage.removeItem("bqtItems");
      setBqtItems([]);
    } else if (formData.categoria === "CBS") {
      localStorage.removeItem("cbsItems");
      setCbsItems([]);
    }
    // Limpiar el formulario pero permanecer en la vista
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
      ancho: "",
      alto: "",
      peso: "",
    });
    setStatusValue(true);
    setFieldErrors({});
    setError("");
    setSuccessMessage("");
    // Si hay callback externo, llamarlo
    if (onCancel) onCancel();
  };

  // Funciones específicas para BQT
  const { handleAddBqtItem, handleRemoveBqtItem, clearBqtItems } =
    useBqtFunctions(bqtItems, setBqtItems, formData, variedades);

  // Funciones específicas para CBS
  const { handleAddCbsItem, handleRemoveCbsItem, clearCbsItems } =
    useCbsFunctions(cbsItems, setCbsItems, formData, variedades);

  // Función para añadir un item BQT o CBS con validación
  const addBqtItem = () => {
    // Para BQT o CBS, validar tallos
    if (
      (formData.categoria === "BQT" || formData.categoria === "CBS") &&
      (!formData.tallos || Number(formData.tallos) <= 0)
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        tallos: t("tallos_mayor"),
      }));
      return;
    } else if (formData.categoria !== "BQT" && formData.categoria !== "CBS") {
      // Para otras categorías, los campos son requeridos
      if (
        !formData.subcategoria ||
        !formData.variedad ||
        !formData.color ||
        !formData.calibre ||
        !formData.tallos
      ) {
        return;
      }
    }

    let newFormData;
    if (formData.categoria === "BQT") {
      newFormData = handleAddBqtItem((errors) =>
        validation.validateTallos(errors)
      );
      // Si la subcategoría contiene 'rainbow', preserva subcategoría y calibre
      const subcatName =
        tiposVariedad.find((t) => t.id === formData.subcategoria)?.name || "";
      if (subcatName.toLowerCase().includes("rainbow")) {
        setFormData((prev) => ({
          ...prev,
          subcategoria: prev.subcategoria,
          calibre: prev.calibre,
          tallos: "",
          variedad: "",
          color: "",
        }));
        return;
      }
    } else if (formData.categoria === "CBS") {
      newFormData = handleAddCbsItem((errors) =>
        validation.validateTallos(errors)
      );
    } else {
      newFormData = handleAddBqtItem((errors) =>
        validation.validateTallos(errors)
      );
    }
    if (newFormData) {
      setFormData((prev) => ({
        ...prev,
        ...newFormData,
      }));
    }
  };

  // Funciones para submit
  const { submitForm } = useProductoSubmit(
    formData,
    bqtItems,
    cbsItems, // Agregamos los items de CBS
    resumenProducto,
    resumenBQT,
    resumenCBS,
    categorias,
    tiposVariedad,
    variedades,
    allCalibres,
    setFormData,
    setBqtItems,
    setCbsItems, // Agregamos el setter de CBS
    setAllProducts,
    setStatusValue,
    setFieldErrors,
    setError,
    setSuccessMessage,
    setLoading,
    onProductCreated
  );

  // Manejador del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Si es cambio de categoría a CBS, limpiar los items de CBS
    if (name === "categoria" && value === "CBS") {
      setCbsItems([]);
      localStorage.removeItem("cbsItems");
    }

    // Si es CBS y cambia la subcategoría, actualizar todos los items existentes
    if (
      formData.categoria === "CBS" &&
      name === "subcategoria" &&
      cbsItems.length > 0
    ) {
      const updatedItems = cbsItems.map((item) => ({
        ...item,
        subcategoria: value,
      }));
      setCbsItems(updatedItems);
      localStorage.setItem("cbsItems", JSON.stringify(updatedItems));
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Si cambia la subcategoría, limpiar la variedad
      if (name === "subcategoria") {
        newData.variedad = "";
        // Si la nueva subcategoría es Assorted o Rainbow, también limpiar el color
        const subcatObj = tiposVariedad.find((t) => t.id === value);
        const subcatName = subcatObj?.name || "";
        if (subcatName.includes("Assorted") || subcatName.includes("Rainbow")) {
          newData.color = "";
        }
      }

      // Para productos que NO son BQT ni CBS, actualizar automáticamente el nombreProducto con el resumen
      if (
        newData.categoria &&
        newData.categoria !== "BQT" &&
        newData.categoria !== "CBS"
      ) {
        // Solo actualizar si hay suficientes datos para generar un resumen
        if (
          newData.categoria &&
          newData.subcategoria &&
          newData.tallos &&
          newData.calibre
        ) {
          // Usar la misma lógica que en customGenerateProductSummary
          const subcat = tiposVariedad.find(
            (t) => t.id === newData.subcategoria
          );
          const subcatName = subcat?.name || "";

          if (
            newData.categoria === "SLD" &&
            subcatName.includes("Assorted") &&
            newData.color
          ) {
            // Para SLD Assorted con color
            let base = `SLD ${subcatName}`;
            let colorStr = newData.color.trim();
            let tallosStr = `${newData.tallos}st`;
            let calibreLabel = "";
            if (newData.calibre) {
              const cal = calibres?.find(
                (c) => c.id_calibre === newData.calibre
              );
              calibreLabel = cal ? cal.nombre_calibre_tipo : newData.calibre;
            }
            newData.nombreProducto =
              `${base} ${colorStr} ${tallosStr} ${calibreLabel}`.trim();
          } else if (
            newData.categoria === "SLD" &&
            subcatName.includes("Rainbow") &&
            newData.color
          ) {
            // Para SLD Rainbow con colores múltiples
            let base = `SLD ${subcatName}`;
            let coloresArr = newData.color
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c);
            let colorStr = coloresArr.join("/");
            let tallosArr = Array.isArray(newData.tallos)
              ? newData.tallos
              : [newData.tallos];
            let tallosStr = tallosArr.map((t) => `${t}st`).join("/");
            let calibreLabel = "";
            if (newData.calibre) {
              const cal = calibres?.find(
                (c) => c.id_calibre === newData.calibre
              );
              calibreLabel = cal ? cal.nombre_calibre_tipo : newData.calibre;
            }
            newData.nombreProducto =
              `${base} ${colorStr} ${tallosStr} ${calibreLabel}`.trim();
          }
        }
      }

      return newData;
    });
  };

  // Efecto para calcular el precio total del bouquet sumando los precios de todos los items
  React.useEffect(() => {
    // Solo calcular para BQT y CBS
    if (formData.categoria === "BQT" && bqtItems.length > 0) {
      // Calcular la suma de los precios de todos los items para BQT
      let totalBouquet = 0;
      
      bqtItems.forEach(item => {
        if (item.precioTotal) {
          totalBouquet += Number(item.precioTotal);
        }
      });
      
      // Actualizar el precio total en el formulario
      if (totalBouquet > 0) {
        setFormData(prev => ({
          ...prev,
          precioTotal: totalBouquet
        }));
      }
      
    } else if (formData.categoria === "CBS" && cbsItems.length > 0) {
      // Calcular la suma de los precios de todos los items para CBS
      let totalBunch = 0;
      
      cbsItems.forEach(item => {
        if (item.precioTotal) {
          totalBunch += Number(item.precioTotal);
        }
      });
      
      // Actualizar el precio total en el formulario
      if (totalBunch > 0) {
        setFormData(prev => ({
          ...prev,
          precioTotal: totalBunch
        }));
      }
      
    }
  }, [bqtItems, cbsItems, formData.categoria]);


  // Efecto para ocultar el error automáticamente después de 5 segundos
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Validación en el submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Verificar duplicados directamente usando la función dedicada
    const isDuplicate = checkDuplicateProductName(formData.nombreProducto);
    if (
      isDuplicate ||
      (fieldErrors.nombreProducto &&
        (fieldErrors.nombreProducto.includes(
          "Ya existe un producto con este nombre"
        ) ||
          fieldErrors.nombreProducto.includes("Ya existe este producto")))
    ) {
      // Si hay un error de nombre duplicado, mostrar el mensaje y detener el envío
      const errorMsg = `No se puede guardar. ${
        fieldErrors.nombreProducto || "Producto duplicado"
      }`;
      setError(errorMsg);
      // No limpiar errores ni mensajes previos si hay duplicado
      return;
    }
    
    // Si es un producto similar, mostrar advertencia pero permitir guardar
    if (
      fieldErrors.nombreProducto &&
      fieldErrors.nombreProducto.includes("Producto similar encontrado")
    ) {
      // Solo mostrar la advertencia pero no detener el envío
      const warningMsg = `Advertencia: ${fieldErrors.nombreProducto}`;
      setError(warningMsg);
      // No retornamos para permitir que continúe el guardado
    }

    // Validar el formulario antes de enviar
    if (
      !validation.validateForm(
        formData,
        fieldErrors,
        setFieldErrors,
        setError,
        tiposVariedad
      )
    ) {
      return;
    }

    // Limpiar errores y mensajes previos SOLO si no hay coincidencia exacta o similitud
    if (
      !(
        fieldErrors.nombreProducto &&
        (fieldErrors.nombreProducto.includes(
          "Ya existe un producto con este nombre"
        ) ||
          fieldErrors.nombreProducto.includes("Ya existe este producto") ||
          fieldErrors.nombreProducto.includes("Producto similar encontrado"))
      )
    ) {
      setFieldErrors({});
      setError("");
      setSuccessMessage("");
    }

    // Enviar formulario
    const success = await submitForm();
    if (success) {
      // Limpiar todos los campos del formulario
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
        ancho: "",
        alto: "",
        peso: "",
      });
      setFieldErrors({});
      setError("");
      setSuccessMessage("Producto guardado correctamente");
      // No llamar a onSubmit() para evitar salir del formulario
    }
  };

  // Eliminar la propiedad nombreProducto del objeto fieldErrors para evitar error de tipo
  const { nombreProducto, ...fieldErrorsSinNombre } = fieldErrors;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col gap-1">
      {/* Encabezado de estado: SKU, nombre, switch activo, notificaciones */}
      <div className="w-full flex flex-col">
        <Notifications error={error} successMessage={successMessage} />
        <ProductHeader
          formData={formData}
          fieldErrors={fieldErrorsSinNombre}
          statusValue={statusValue}
          setStatusValue={setStatusValue}
          setFormData={setFormData}
          loading={loading}
          lang={lang}
          resumenProducto={resumenProducto}
          resumenBQT={resumenBQT}
          resumenCBS={resumenCBS}
          getResumenBQTVisual={formLogic.getResumenBQTVisual}
        />
      </div>

      {/* Formulario envuelve columnas, mensaje y botones */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-1 mb-2">
        <div className="flex flex-row gap-2 items-start">
          {/* Columna izquierda: clasificación/formulario */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <ClassificationForm
              formData={formData}
              handleChange={handleChange}
              fieldErrors={fieldErrors}
              loading={loading}
              lang={lang}
              categorias={categorias}
              tiposVariedad={tiposVariedad}
              variedades={variedades}
              calibres={calibres}
              colores={coloresApi}
              loadingCategorias={loadingCategorias}
              loadingTipos={loadingTipos}
              loadingVariedades={loadingVariedades}
              loadingCalibres={loadingCalibres}
              handleAddBqtItem={addBqtItem}
              cbsItems={cbsItems}
              setFormData={setFormData}
              vendedores={vendedores}
            />
            {/* Bloque de parámetros como acordeón, borde verde, fondo blanco, labels cereza y campos compactos */}
            <div className="rounded-lg border border-orange-200 mt-0" style={{ boxShadow: '0 0 0 1px #fbbf24', background: '#fff', backgroundColor: '#fff' }}>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2 focus:outline-none bg-white"
                onClick={() => setShowParametros((prev: boolean) => !prev)}
                aria-expanded={showParametros}
                style={{ fontWeight: 600, color: '#cc3399', fontSize: '1rem', background: '#fff', backgroundColor: '#fff' }}
              >
                {t('parametros', 'Parámetros')}
                <span style={{ color: '#b9881dff', fontSize: '1 em' }}>{showParametros ? '▲' : '▼'}</span>
              </button>
              {showParametros && (
                <div className="px-4 pb-1 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <div>
                      <label className="block text-xs font-semibold mb-1" htmlFor="ancho" style={{ color: '#cc3399' }}>{t('ancho', 'Ancho (cm)')}</label>
                      <input
                        type="number"
                        id="ancho"
                        name="ancho"
                        min="0"
                        step="any"
                        className="w-full border border-gray-300 rounded bg-gray-50 px-3 py-2 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-200"
                        value={formData.ancho || ""}
                        onChange={handleChange}
                        placeholder="Ej: 5"
                        style={{ minHeight: '40px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" htmlFor="alto" style={{ color: '#cc3399' }}>{t('alto', 'Alto (cm)')}</label>
                      <input
                        type="number"
                        id="alto"
                        name="alto"
                        min="0"
                        step="any"
                        className="w-full border border-gray-300 rounded bg-gray-50 px-3 py-2 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-200"
                        value={formData.alto || ""}
                        onChange={handleChange}
                        placeholder="Ej: 20"
                        style={{ minHeight: '40px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" htmlFor="peso" style={{ color: '#cc3399' }}>{t('peso', 'Peso (kg)')}</label>
                      <input
                        type="number"
                        id="peso"
                        name="peso"
                        min="0"
                        step="any"
                        className="w-full border border-gray-300 rounded bg-gray-50 px-3 py-2 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-200"
                        value={formData.peso || ""}
                        onChange={handleChange}
                        placeholder="Ej: 0.5"
                        style={{ minHeight: '40px' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Columna derecha: wizard lateral con scroll si hay 4 o más ítems, solo visible si categoría es BQT o CBS */}
          {formData.categoria === "BQT" && (
            <div
              className="w-full sm:w-[400px] xl:w-[440px] flex-shrink-0 bg-gray-50 rounded-lg shadow-lg p-2 sm:p-4 h-fit self-start border border-gray-200 mt-1 sm:mt-0"
              style={{
                maxWidth: "100%",
                overflowY: bqtItems.length >= 4 ? "auto" : "hidden",
              }}
            >
              <h4
                className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center"
                style={{ color: "#cc3399" }}
              >
                {lang === "en" ? "BQT Items" : "Ítems del BQT"}
              </h4>
              {/* Responsive: Card en mobile, tabla en desktop */}
              <div>
                <div className="block sm:hidden">
                  <BqtItemList
                    items={bqtItems}
                    tiposVariedad={tiposVariedad}
                    variedades={variedades}
                    colores={colores || []}
                    calibres={allCalibres || []}
                    lang={lang}
                    onRemove={handleRemoveBqtItem}
                    showHeaders={false}
                    compact={true}
                  />
                </div>
                <div className="hidden sm:block">
                  <BqtItemList
                    items={bqtItems}
                    tiposVariedad={tiposVariedad}
                    variedades={variedades}
                    colores={colores || []}
                    calibres={allCalibres || []}
                    lang={lang}
                    onRemove={handleRemoveBqtItem}
                    showHeaders={true}
                    compact={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Panel para CBS - Consumer Bounch */}
          {formData.categoria === "CBS" && (
            <div
              className="w-full sm:w-[400px] xl:w-[440px] flex-shrink-0 bg-gray-50 rounded-lg shadow-lg p-2 sm:p-4 h-fit self-start border border-gray-200 mt-1 sm:mt-0"
              style={{
                maxWidth: "100%",
                overflowY: cbsItems.length >= 4 ? "auto" : "hidden",
              }}
            >
              <h4
                className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center"
                style={{ color: "#cc3399" }}
              >
                {lang === "en" ? "CBS Items" : "Ítems del CBS"}
              </h4>
              {/* Responsive: Card en mobile, tabla en desktop */}
              <div>
                <div className="block sm:hidden">
                  <BqtItemList
                    items={cbsItems}
                    tiposVariedad={tiposVariedad}
                    variedades={variedades}
                    colores={colores || []}
                    calibres={allCalibres || []}
                    lang={lang}
                    onRemove={handleRemoveCbsItem}
                    showHeaders={false}
                    compact={true}
                  />
                </div>
                <div className="hidden sm:block">
                  <BqtItemList
                    items={cbsItems}
                    tiposVariedad={tiposVariedad}
                    variedades={variedades}
                    colores={colores || []}
                    calibres={allCalibres || []}
                    lang={lang}
                    onRemove={handleRemoveCbsItem}
                    showHeaders={true}
                    compact={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de coincidencia/similitud debajo de ambas columnas, ocupando todo el ancho, con borde gris */}
        {fieldErrors.nombreProducto &&
          (() => {
            // Extraer SKU del mensaje si existe
            const skuMatch =
              fieldErrors.nombreProducto.match(/SKU: ([^\s\n]+)/);
            const skuValue = skuMatch ? skuMatch[1] : null;
            const mensajeSinSku = skuValue
              ? fieldErrors.nombreProducto.replace(/,? ?SKU: [^\s\n]+/, "")
              : fieldErrors.nombreProducto;
            return (
              <div className="w-full border border-gray-300 rounded-lg bg-white py-1 px-4 mt-2 mb-1">
                <div className="flex items-center gap-2">
                  {/* Mensaje - 80% del ancho */}
                  <div
                    className={`flex-1 text-center text-base font-semibold ${
                      mensajeSinSku.includes("Ya existe este producto")
                        ? "text-red-600"
                        : mensajeSinSku.includes("Producto similar encontrado")
                        ? "text-orange-600"
                        : "text-pink-600"
                    }`}
                  >
                    {skuValue && (
                      <div className="mb-2">
                        SKU: <span className="font-bold">{skuValue}</span>
                      </div>
                    )}
                    <div>{mensajeSinSku}</div>
                  </div>

                  {/* Campo vendedor - 20% del ancho */}
                  <div className="w-1/5 min-w-[200px]">
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "#cc3399" }}
                    >
                      {t("vendedor")} *
                    </label>
                    <SearchableSelect
                      name="vendedor"
                      options={vendedores.map((v) => ({
                        id: v.id,
                        name: v.nombre,
                      }))}
                      value={(() => {
                        const selected = vendedores.find(
                          (v) => v.nombre === formData.vendedor
                        );
                        return selected ? selected.id : "";
                      })()}
                      onChange={(value) => {
                        const vendedorObj = vendedores.find(
                          (v) => v.id === value
                        );
                        const nombre = vendedorObj ? vendedorObj.nombre : "";
                        handleChange({
                          target: {
                            name: "vendedor",
                            value: nombre,
                          },
                        } as any);
                      }}
                      placeholder={t("common.selectOption", "Seleccionar...")}
                      disabled={loading}
                      className="w-full"
                    />
                    {fieldErrors["vendedor"] && (
                      <div className="text-red-500 text-sm mt-1">
                        {fieldErrors["vendedor"]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Campo vendedor cuando NO hay mensaje de error de producto */}
        {!fieldErrors.nombreProducto && (
          <div className="w-full flex justify-end mt-0.5">
            <div className="w-64">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#cc3399" }}
              >
                {t("vendedor")} *
              </label>
              <SearchableSelect
                name="vendedor"
                options={vendedores.map((v) => ({ id: v.id, name: v.nombre }))}
                value={(() => {
                  const selected = vendedores.find(
                    (v) => v.nombre === formData.vendedor
                  );
                  return selected ? selected.id : "";
                })()}
                onChange={(value) => {
                  const vendedorObj = vendedores.find((v) => v.id === value);
                  const nombre = vendedorObj ? vendedorObj.nombre : "";
                  handleChange({
                    target: {
                      name: "vendedor",
                      value: nombre,
                    },
                  } as any);
                }}
                placeholder={t("common.selectOption", "Seleccionar...")}
                disabled={loading}
                className="w-full"
              />
              {fieldErrors["vendedor"] && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors["vendedor"]}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones alineados a la derecha debajo del mensaje, dentro del form */}
        {!hideButtons && (
          <div className="w-full flex justify-end gap-2 mt-1">
            <ActionButtons
              loading={loading}
              onCancel={handleCancel}
              lang={lang}
              initialData={initialData}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductoForm;
