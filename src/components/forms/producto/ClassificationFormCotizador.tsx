import React, { useEffect } from "react";
import { Tag } from "lucide-react";
import SearchableSelect from "../../SearchableSelect";
import type { ProductoFormData } from "../../../types/producto";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { usePreciosVenta } from "../../../hooks/usePreciosVenta";
interface ClassificationFormProps {
  formData: ProductoFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  fieldErrors: { [key: string]: string };
  loading: boolean;
  lang: string;
  categorias: any[];
  tiposVariedad: any[]; //Subcategorias
  variedades: any[];
  calibres: any[];
  colores: any[]; // Agregamos colores para el select
  loadingCategorias: boolean;
  loadingTipos: boolean;
  loadingVariedades: boolean;
  loadingCalibres: boolean;
  handleAddBqtItem?: () => void;
  cbsItems?: any[]; // Para deshabilitar subcategoría si hay items CBS
  setFormData?: (fn: (prev: ProductoFormData) => ProductoFormData) => void;
  vendedores?: { id: string; nombre: string }[];
}

const ClassificationFormCotizador: React.FC<ClassificationFormProps> = ({
  formData,
  handleChange,
  fieldErrors,
  loading,
  lang,
  categorias = [],
  tiposVariedad = [],
  variedades = [],
  calibres = [],
  colores = [], // Agregamos colores
  loadingCategorias,
  loadingTipos,
  loadingVariedades,
  loadingCalibres,
  handleAddBqtItem,
  cbsItems = [], // Valor por defecto como array vacío
  setFormData,
  vendedores = [],
}) => {
  const { t } = useTranslation();

  // Obtener subcategoría y calibre para buscar precios
  const subcategoria =
    tiposVariedad.find((t) => t.id === formData.subcategoria)?.name || "";
  // Buscar el calibre correctamente
  const calibreTxt =
    calibres.find((c) => String(c.id_calibre) === String(formData.calibre))
      ?.nombre_calibre_tipo || "";
  // Encontrar la subcategoría completa para mostrar más información
  const subcategoriaCompleta = tiposVariedad.find(
    (t) => t.id === formData.subcategoria
  );

  // Normalizar el formato de medida para que coincida con la API
  const normalizarMedida = (medida: string): string => {
    if (!medida) return "";

    // Convertir todo a mayúsculas para comparación
    const medidaUpperCase = medida.toUpperCase();

    // Caso 1: Si ya está en formato "XX CM", simplemente devolver
    if (/^\d+\s*CM$/.test(medidaUpperCase)) {
      return medidaUpperCase;
    }

    // Caso 2: Si contiene un número seguido de CM, extraer y formatear como "XX CM"
    const match = medidaUpperCase.match(/(\d+)\s*CM/);
    if (match) {
      return `${match[1]} CM`;
    }

    // Caso 3: Buscar cualquier número en la cadena y asumir que son centímetros
    const numericMatch = medida.match(/(\d+)/);
    if (numericMatch) {
      return `${numericMatch[1]} CM`;
    }

    // Caso 4: Si no hay números pero hay palabras que indican tamaño, intentar mapear
    const sizeMap: Record<string, string> = {
      SHORT: "40 CM",
      MEDIUM: "50 CM",
      LONG: "60 CM",
      "EXTRA LONG": "70 CM",
      "SUPER LONG": "80 CM",
      CORTO: "40 CM",
      MEDIANO: "50 CM",
      LARGO: "60 CM",
    };

    for (const [key, value] of Object.entries(sizeMap)) {
      if (medidaUpperCase.includes(key)) {
        return value;
      }
    }

    // Si no se pudo normalizar, devolver la medida original
    return medida;
  };

  const medidaNormalizada = calibreTxt ? normalizarMedida(calibreTxt) : "";
 

  // Usar el hook para obtener precios - Usar subcategoria en lugar de categoria
  const {
    precioUnitario,
    precioTotal,
    loading: loadingPrecios,
  } = usePreciosVenta({
    categoria: subcategoria, // Usar subcategoria en lugar de categoria
    medida: medidaNormalizada, // El grado/calibre normalizado
    tallos: formData.tallos,
  });
  // Función para verificar si la subcategoría es Assorted o Rainbow
  const isAssortedOrRainbow = () => {
    if (!formData.subcategoria) return false;
    const subcatObj = tiposVariedad.find((t) => t.id === formData.subcategoria);
    const subcatName = subcatObj?.name || "";
    return subcatName.includes("Assorted") || subcatName.includes("Rainbow");
  };

  // Función para verificar si es SDL Rainbow (necesita multiselect)
  const isSDLRainbow = () => {
    const isSDL = formData.categoria === "SLD";
    const hasSubcat = !!formData.subcategoria;

    if (!hasSubcat || !isSDL) {
      return false;
    }

    const subcatObj = tiposVariedad.find((t) => t.id === formData.subcategoria);
    const subcatName = subcatObj?.name || "";
    const hasRainbow = subcatName.includes("Rainbow");

    return hasRainbow;
  };

  // Filtrar subcategorías para ocultar Rainbow si la categoría es SLD
  const filteredTiposVariedad =
    formData.categoria === "SLD"
      ? tiposVariedad.filter((t) => !t.name.includes("Rainbow"))
      : tiposVariedad;

  // Actualizar el precio total en el formulario cuando cambie
  useEffect(() => {
    if (precioTotal !== null && setFormData) {
     
      setFormData((prev) => {
        const newData = {
          ...prev,
          precioTotal: precioTotal,
        };
        
        return newData;
      });
    } else {
      console.log("⚠️ ClassificationForm - No se actualiza el formulario:", {
        precioTotal,
        setFormDataExiste: !!setFormData,
      });
    }
  }, [precioTotal, setFormData]);
  return (
    <div
      className="rounded-xl px-3 py-4 sm:p-6 border"
      style={{ borderColor: "#bcdcff", background: "#fff" }}
    >
      <h3
        className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2"
        style={{ color: "#3b82f6" }}
      >
        <Tag size={18} className="text-blue-600 sm:w-5 sm:h-5" />
        {t("classification")}
      </h3>

      <div className="flex flex-row gap-4 mb-4 items-center">
        {/* Campo categoría */}
        <div className="w-55">
          <label className="block text-xs font-medium mb-1" style={{ color: "#cc3399" }}>{t("category_p")} *</label>
          <SearchableSelect
            name="categoria"
            options={categorias.map((c) => ({
              id: c.tipo,
              name: c.tipo === "BQT" ? "BQT | Bouquete" : `${c.tipo} | ${c.nombreCategoria}`,
            }))}
            value={formData.categoria}
            onChange={(value) => {
              handleChange({ target: { name: "categoria", value } } as any);
              handleChange({ target: { name: "nombreProducto", value: "" } } as any);
              if (setFormData) {
                setFormData((prev) => ({ ...prev, precioTotal: 0 }));
              }
            }}
            placeholder={t("buscar_categoria")}
            disabled={loading || loadingCategorias}
            className="w-full text-sm px-2 py-1"
          />
          {fieldErrors["categoria"] && <div className="text-red-500 text-xs mt-1">{fieldErrors["categoria"]}</div>}
        </div>
        {/* Input de nombre solo visible para BQT y CBS */}
        {(formData.categoria === "BQT" || formData.categoria === "CBS") && (
          <div className="w-48">
            <label className="block text-xs font-medium mb-1" style={{ color: "#cc3399" }}>{t("nombre_p")} *</label>
            <input
              name="nombreProducto"
              type="text"
              value={formData.nombreProducto}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium${fieldErrors["nombreProducto"] ? " border-red-500 focus:ring-red-500" : " border-gray-300 focus:ring-gray-400"}`}
              placeholder={t("nombre_p")}
              style={{ minWidth: 0, minHeight: "40px" }}
            />
          </div>
        )}
      </div>

      {/* Primera fila: Subcategoría, Variedad, Color */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3">
        {/* Subcategoría */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#cc3399" }}
          >
            {t("subcategoria")} *
          </label>
          <SearchableSelect
            name="subcategoria"
            options={filteredTiposVariedad.map((t) => ({
              id: t.id,
              name: t.abreviatura ? `${t.abreviatura} | ${t.name}` : t.name,
            }))}
            value={formData.subcategoria}
            onChange={(value) =>
              handleChange({
                target: { name: "subcategoria", value },
              } as any)
            }
            placeholder={t("buscar_subcategoria")}
            disabled={
              loading ||
              loadingTipos ||
              (formData.categoria === "CBS" && cbsItems?.length > 0)
            }
            className="w-full"
          />
          {fieldErrors["subcategoria"] && (
            <div className="text-red-500 text-xs mt-1">
              {fieldErrors["subcategoria"]}
            </div>
          )}
        </div>
        {/* Campo variedad - se oculta si es Assorted o Rainbow (incluyendo SLD Rainbow) */}
        {!isAssortedOrRainbow() && !isSDLRainbow() ? (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#cc3399" }}
            >
              {t("variedad")} *
            </label>
            {/* Multiselect solo si SLD y Rainbow */}
            {formData.categoria === "SLD" &&
            (() => {
              const subcatName =
                tiposVariedad.find((t) => t.id === formData.subcategoria)
                  ?.name || "";
              // Toma la primera palabra antes de un espacio o coma
              const firstWord = subcatName.split(/[ ,]/)[0];
              return firstWord === "Rainbow";
            })() ? (
              <Select
                isMulti
                name="variedad"
                options={variedades.map((v) => ({
                  value: v.id,
                  label: v.name,
                  color: v.color,
                }))}
                value={
                  Array.isArray(formData.variedad)
                    ? variedades
                        .filter((v) => formData.variedad.includes(v.id))
                        .map((v) => ({
                          value: v.id,
                          label: v.name,
                          color: v.color,
                        }))
                    : []
                }
                onChange={(selected) => {
                  const selectedVariedades = selected
                    ? selected.map((s) => s.value)
                    : [];
                  handleChange({
                    target: {
                      name: "variedad",
                      value: selectedVariedades,
                    },
                  } as any);
                }}
                isDisabled={
                  loading || loadingVariedades || !formData.subcategoria
                }
                className="w-full"
                placeholder={
                  lang === "en" ? "Search variety..." : "Buscar variedad..."
                }
              />
            ) : (
              <SearchableSelect
                name="variedad"
                options={variedades.map((v) => ({ id: v.id, name: v.name }))}
                value={formData.variedad}
                onChange={(value) =>
                  handleChange({ target: { name: "variedad", value } } as any)
                }
                placeholder={t("buscar_variedad")}
                disabled={
                  loading || loadingVariedades || !formData.subcategoria
                }
                className="w-full"
              />
            )}
            {fieldErrors["variedad"] && (
              <div className="text-red-500 text-xs mt-1">
                {fieldErrors["variedad"]}
              </div>
            )}
          </div>
        ) : (
          <div className="hidden sm:block"></div>
        )}

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#cc3399" }}
          >
            {t("color")} *
          </label>
          {/* Lógica de color: SLD Rainbow tiene prioridad, luego Assorted/Rainbow de otras categorías */}
          {isSDLRainbow() ? (
            <Select
              isMulti
              name="color"
              options={colores.map((c) => ({ value: c.name, label: c.name }))}
              value={(() => {
                if (!formData.color) return [];
                const colorsArray = formData.color
                  .split(",")
                  .map((c) => c.trim());
                return colorsArray.map((c) => ({ value: c, label: c }));
              })()}
              onChange={(selected) => {
                const colorsString = selected
                  ? selected.map((s) => s.value).join(",")
                  : "";
                handleChange({
                  target: {
                    name: "color",
                    value: colorsString,
                  },
                } as any);
              }}
              isDisabled={loading}
              className="w-full"
              placeholder={t("buscar_color")}
            />
          ) : isAssortedOrRainbow() ? (
            <SearchableSelect
              name="color"
              options={colores.map((c) => ({ id: c.id, name: c.name }))}
              value={(() => {
                // Buscar el color por nombre para obtener su ID para el SearchableSelect
                const colorObj = colores.find((c) => c.name === formData.color);
                return colorObj ? colorObj.id : "";
              })()}
              onChange={(value) => {
                // Buscar el nombre del color por ID y guardar el nombre
                const colorObj = colores.find((c) => c.id === value);
                const colorName = colorObj ? colorObj.name : "";
                handleChange({
                  target: {
                    name: "color",
                    value: colorName,
                  },
                } as any);
              }}
              placeholder={t("buscar_color")}
              disabled={loading}
              className="w-full"
            />
          ) : (
            <input
              name="color"
              type="text"
              value={formData.color}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              placeholder={lang === "en" ? "Color" : "Color"}
              style={{ minWidth: 0, minHeight: "40px" }}
            />
          )}
          {fieldErrors["color"] && (
            <div className="text-red-500 text-xs mt-1">
              {fieldErrors["color"]}
            </div>
          )}
        </div>
      </div>

      {/* Segunda fila: Grado, Tallos, Precio Total y botón de agregar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
        {/* Grado */}
        <div className="sm:col-span-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#cc3399" }}
          >
            {t("grado")} *
          </label>
          <SearchableSelect
            name="calibre"
            options={calibres.map((c) => ({
              id: c.id_calibre,
              name: c.nombre_calibre_tipo,
            }))}
            value={formData.calibre}
            onChange={(value) =>
              handleChange({ target: { name: "calibre", value } } as any)
            }
            placeholder={t("buscar_grado")}
            disabled={loading || loadingCalibres}
            className="w-full"
          />
          {fieldErrors["calibre"] && (
            <div className="text-red-500 text-xs mt-1">
              {fieldErrors["calibre"]}
            </div>
          )}
        </div>
        
        {/* Campo Tallos */}
        <div className="sm:col-span-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#cc3399" }}
          >
            {t("tallos")} *
          </label>
          {formData.categoria === "SLD" && (() => {
            const subcatName = tiposVariedad.find((t) => t.id === formData.subcategoria)?.name || "";
            const firstWord = subcatName.split(/[ ,]/)[0];
            return firstWord === "Rainbow";
          })() ? (
            <Select
              isMulti
              name="tallos"
              options={[{ value: "20", label: "20" }, { value: "25", label: "25" }]}
              value={Array.isArray(formData.tallos) ? formData.tallos.map((t) => ({ value: String(t), label: String(t) })) : []}
              onChange={(selected) => {
                const tallosSeleccionados = selected ? selected.map((s) => s.value) : [];
                handleChange({ target: { name: "tallos", value: tallosSeleccionados } } as any);
              }}
              isDisabled={loading}
              className="w-full"
              placeholder={lang === "en" ? "Select" : "Seleccionar"}
            />
          ) : (
            <input
              name="tallos"
              type="number"
              value={formData.tallos}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              placeholder={t("tallos")}
              style={{ minWidth: 0, minHeight: "40px" }}
              min={1}
            />
          )}
          {fieldErrors["tallos"] && (
            <div className="text-red-500 text-xs mt-1">
              {fieldErrors["tallos"]}
            </div>
          )}
        </div>
        
        {/* Campo Precio Total */}
        <div className="sm:col-span-3">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#cc3399" }}
          >
            {t("precioTotal", "Precio Total")} {precioUnitario ? `(${precioUnitario} c/u)` : ""}
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              id="precioTotal"
              name="precioTotal"
              className={`w-full border rounded bg-gray-50 px-2 py-2 text-sm focus:ring-1 focus:ring-pink-200${loadingPrecios ? " opacity-70" : ""}`}
               value={
    formData.precioTotal !== null && formData.precioTotal !== undefined
      ? Number(formData.precioTotal).toFixed(2)
      : ""
  }
              readOnly
              placeholder="Ej: 10.00"
              style={{ minHeight: "40px", borderColor: precioTotal !== null ? "#10b981" : "#e5e7eb" }}
            />
            {loadingPrecios && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <div className="h-4 w-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Botón "+" solo para BQT o CBS */}
        <div className="sm:col-span-1 flex items-end">
          {(formData.categoria === "BQT" || formData.categoria === "CBS") && (
            <button
              type="button"
              style={{ backgroundColor: "#cc3399" }}
              onClick={() => {
                if (formData.categoria === "BQT") {
                  const subcatName = tiposVariedad.find((t) => t.id === formData.subcategoria)?.name || "";
                  if (subcatName.toLowerCase().includes("rainbow")) {
                    const currentCalibre = formData.calibre;
                    if (typeof handleAddBqtItem === "function") {
                      handleAddBqtItem();
                      setTimeout(() => {
                        if (typeof setFormData === "function") {
                          setFormData((prev) => {
                            const subcatName = tiposVariedad.find((t) => t.id === prev.subcategoria)?.name || "";
                            if (subcatName.toLowerCase().includes("rainbow")) {
                              return { ...prev, calibre: currentCalibre, subcategoria: prev.subcategoria };
                            } else {
                              return { ...prev, calibre: currentCalibre, subcategoria: "" };
                            }
                          });
                        } else if (formData.calibre !== currentCalibre) {
                          handleChange({ target: { name: "calibre", value: currentCalibre } } as any);
                        }
                      }, 0);
                    }
                    return;
                  }
                }
                if (typeof handleAddBqtItem === "function") {
                  handleAddBqtItem();
                }
              }}
              className="w-full h-10 rounded bg-pink-500 text-white font-bold text-2xl hover:bg-pink-600 focus:outline-none flex items-center justify-center"
              title={lang === "en" ? "Add to list" : "Agregar a la lista"}
              disabled={loading}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassificationFormCotizador;
