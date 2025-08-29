import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Producto } from "../../types/producto";
import SearchableSelect from "../SearchableSelect";

import BqtItemList from "./BqtItemList";
// Componentes y hooks modularizados
import {
  ClassificationFormCotizador,
  ProductHeader,
  ActionButtons,
  Notifications,
  useProductoFormLogic,
  useBqtFunctions,
  useProductoValidation,
  useProductoSubmit,
} from "./producto";

import { useCbsFunctions } from "./producto/useCbsFunctions";

interface ProductoFormCotizadorProps {
  onSubmit: (data: any) => void;
  initialData?: Producto | null;
  onCancel?: () => void;
  onProductCreated?: () => void;
}

const ProductoFormCotizador: React.FC<ProductoFormCotizadorProps> = ({
  onSubmit,
  initialData,
  onCancel,
  onProductCreated,
}) => {

  // Estado para mostrar/ocultar acordeón de parámetros
  const [showParametros, setShowParametros] = React.useState(false);

  // Usar hooks para obtener la lógica del formulario
  const { t } = useTranslation();

  // Obtener el estado y la lógica del formulario (versión cotizador)
  const formLogic = useProductoFormLogic(initialData, onProductCreated);

  const {
    formData,
    setFormData,
    bqtItems,
    setBqtItems,
    cbsItems,
    setCbsItems,
    todasLasVariedades,
  } = formLogic;

  // Notificar al padre cuando los datos cambien con guardado en localStorage
  // Evitar llamadas repetidas a onSubmit comparando el formData previo.
  const prevFormDataRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!(formData && Object.keys(formData).length > 0)) return;

    const formDataString = JSON.stringify(formData);
    if (prevFormDataRef.current === formDataString) {
      // No hay cambios reales: evitar re-notificar
      return;
    }
    prevFormDataRef.current = formDataString;

    // Guardar datos de análisis en localStorage si están disponibles
    const { resumenBQT, resumenCBS } = formLogic;
    try {
      if (formData.categoria === "BQT" && resumenBQT) {
        const analisisBQT = {
          resumen: resumenBQT,
          contenidoNormalizado: resumenBQT.replace(/^BQT\s+[^\s]+\s+/, ''),
          timestamp: new Date().toISOString(),
          tipo: 'BQT'
        };
        localStorage.setItem('analisisProducto', JSON.stringify(analisisBQT));
      } else if (formData.categoria === "CBS" && resumenCBS) {
        const analisisCBS = {
          resumen: resumenCBS,
          contenidoNormalizado: resumenCBS.replace(/^CBS\s+[^\s]+\s+/, ''),
          timestamp: new Date().toISOString(),
          tipo: 'CBS'
        };
        localStorage.setItem('analisisProducto', JSON.stringify(analisisCBS));
      }
    } catch (e) {
      console.warn('[ProductoFormCotizador] Error guardando analisis en localStorage', e);
    }

    // Debounce para evitar demasiadas llamadas
    const timeoutId = setTimeout(() => {
      onSubmit(formData);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData, onSubmit, formLogic.resumenBQT, formLogic.resumenCBS]);

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
    checkDuplicateProductName,
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
        const { API_ENDPOINTS, getAuthHeaders } = await import(
          "../../constants/api"
        );
        const res = await fetch(API_ENDPOINTS.VENDEDORES.LIST, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
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
    // Limpiar el formulario
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

  // Manejador del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "categoria" && value === "CBS") {
      setCbsItems([]);
      localStorage.removeItem("cbsItems");
    }

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
      if (name === "subcategoria") {
        newData.variedad = "";
        const subcatObj = tiposVariedad.find((t) => t.id === value);
        const subcatName = subcatObj?.name || "";
        if (subcatName.includes("Assorted") || subcatName.includes("Rainbow")) {
          newData.color = "";
        }
      }

      // Para productos que NO son BQT ni CBS, actualizar automáticamente el nombreProducto
      if (
        newData.categoria &&
        newData.categoria !== "BQT" &&
        newData.categoria !== "CBS"
      ) {
        if (
          newData.categoria &&
          newData.subcategoria &&
          newData.tallos &&
          newData.calibre
        ) {
          const subcatName = tiposVariedad.find((t) => t.id === newData.subcategoria)?.name || "";
          const calibreName = calibres.find((c) => String(c.id_calibre) === String(newData.calibre))?.nombre_calibre_tipo || "";
          newData.nombreProducto = `${newData.categoria} ${subcatName} ${newData.tallos} ${calibreName}`;
        }
      }

      return newData;
    });
  };

  // Efecto para calcular el precio total del bouquet
  React.useEffect(() => {
    if (formData.categoria === "BQT" && bqtItems.length > 0) {
      let totalBouquet = 0;
      bqtItems.forEach(item => {
        if (item.precioTotal) {
          totalBouquet += parseFloat(item.precioTotal);
        }
      });
      if (totalBouquet > 0) {
        setFormData(prev => ({
          ...prev,
          precioTotal: totalBouquet
        }));
      }
     
    } else if (formData.categoria === "CBS" && cbsItems.length > 0) {
      let totalBunch = 0;
      cbsItems.forEach(item => {
        if (item.precioTotal) {
          totalBunch += parseFloat(item.precioTotal);
        }
      });
      if (totalBunch > 0) {
        setFormData(prev => ({
          ...prev,
          precioTotal: totalBunch
        }));
      }
      
    }
  }, [bqtItems, cbsItems, formData.categoria]);

  // Efecto para ocultar el error automáticamente
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Eliminar la propiedad nombreProducto del objeto fieldErrors
  const { nombreProducto, ...fieldErrorsSinNombre } = fieldErrors;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col gap-1">
      {/* Notificaciones */}
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

      {/* Formulario sin submit para cotizador */}
      <div className="flex flex-col gap-1 mb-2">
        {/* Sección de clasificación */}
        <ClassificationFormCotizador
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

        {/* Sección de BQT Items - Ahora con formato de tabla completa */}
        {formData.categoria === "BQT" && (
          <div className="w-full bg-gray-50 rounded-lg shadow-md p-3 border border-gray-200 mt-2">
            <h4 className="text-base font-semibold mb-3 px-2" style={{ color: "#cc3399" }}>
              {lang === "en" ? "BQT Items" : "Ítems del BQT"}
            </h4>
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
        )}

        {/* Sección de CBS Items - También con formato de tabla completa */}
        {formData.categoria === "CBS" && (
          <div className="w-full bg-gray-50 rounded-lg shadow-md p-3 border border-gray-200 mt-2">
            <h4 className="text-base font-semibold mb-3 px-2" style={{ color: "#cc3399" }}>
              {lang === "en" ? "CBS Items" : "Ítems del CBS"}
            </h4>
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
        )}

        {/* Parámetros igual que ProductoForm */}
        <div className="rounded-lg border border-orange-200 mt-2" style={{ boxShadow: '0 0 0 1px #fbbf24', background: '#fff', backgroundColor: '#fff' }}>
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-2 focus:outline-none bg-white"
            onClick={() => setShowParametros((prev: boolean) => !prev)}
            aria-expanded={showParametros}
            style={{ fontWeight: 600, color: '#cc3399', fontSize: '1rem', background: '#fff', backgroundColor: '#fff' }}
          >
            {t('parametros', 'Parámetros')}
            <span style={{ color: '#b9881dff', fontSize: '1em' }}>{showParametros ? '▲' : '▼'}</span>
          </button>
          {showParametros && (
            <div className="px-4 pb-1 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <div>
                  <label htmlFor="ancho" className="block text-xs font-medium text-pink-700 mb-1">Ancho</label>
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
                  <label htmlFor="alto" className="block text-xs font-medium text-pink-700 mb-1">Alto</label>
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
                  <label htmlFor="peso" className="block text-xs font-medium text-pink-700 mb-1">Peso</label>
                  <input
                    type="number"
                    id="peso"
                    name="peso"
                    min="0"
                    step="any"
                    className="w-full border border-gray-300 rounded bg-gray-50 px-3 py-2 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-200"
                    value={formData.peso || ""}
                    onChange={handleChange}
                    placeholder="Ej: 1.5"
                    style={{ minHeight: '40px' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de coincidencia/similitud debajo de ambas columnas, ocupando todo el ancho, con borde gris */}
        {fieldErrors.nombreProducto &&
          (() => {
            const skuMatch = fieldErrors.nombreProducto.match(/SKU: ([^\s\n]+)/);
            const skuValue = skuMatch ? skuMatch[1] : null;
            const mensajeSinSku = skuValue
              ? fieldErrors.nombreProducto.replace(/,? ?SKU: [^\s\n]+/, "")
              : fieldErrors.nombreProducto;
            return (
              <div className="w-full border border-gray-300 rounded-lg bg-white py-2 px-4 mt-2 mb-1">
                <div
                  className={`text-center text-base font-semibold ${
                    mensajeSinSku.includes("Ya existe este producto")
                      ? "text-red-600"  /* Rojo para productos existentes/idénticos */
                      : "text-amber-600"  /* Naranja/ámbar para productos similares */
                  }`}
                >
                  {mensajeSinSku}
                </div>
              </div>
            );
          })()}

        {!fieldErrors.nombreProducto && formData.categoria !== "BQT" && formData.categoria !== "CBS" && (
          <ActionButtons
            onCancel={handleCancel}
            loading={loading}
            lang={lang}
            initialData={initialData}

          />
        )}
      </div>
    </div>
  );
};

export default ProductoFormCotizador;
