import React from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import AsyncSelect from "react-select/async";
import { useFormPaqueteLogic } from "./formPaqueteLogic";
import { API_ENDPOINTS } from "../../constants/api";
interface FormPaqueteProps {
  onSaved?: (nuevoPaquete?: any) => void;
  paquete?: any;
  onCancel?: () => void;
}

type ClienteOption = { value: string; label: string } | null;

const FormPaquete = ({ onSaved, paquete, onCancel }: FormPaqueteProps) => {

  const {
    form,
    setForm,
    loading,
    setLoading,
    showForm,
    setShowForm,
    editId,
    setEditId,
    successMessage,
    setSuccessMessage,
    duplicateError,
    setDuplicateError,
    skuNumber,
    setSkuNumber,
    search,
    setSearch,
    categorias,
    setCategorias,
    subcategorias,
    setSubcategorias,
    materiales,
    setMateriales,
    materialesBusqueda,
    setMaterialesBusqueda,
    materialesFiltrados,
    setMaterialesFiltrados,
    materialesSeleccionados,
    setMaterialesSeleccionados,
    t,
    handleChange,
    handleSubmit,
    handleMaterialImagenChange,
    checkDuplicatePaqueteName,
    calcularSiguienteSKU,
  } = useFormPaqueteLogic(paquete, onSaved);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-0 sm:p-1 flex flex-col gap-0 mb-0"
    >
      {/* SKU y Estado arriba del contenedor rosado */}
      <div className="w-full flex items-center justify-between mt-0 mb-0">
        <div>
          <span className="font-mono text-xl text-pink-700">SKU:</span>
          <span className="font-mono text-xl text-pink-700 ml-2">
            {editId && paquete && (paquete.sku || paquete.SKU) ? (paquete.sku || paquete.SKU) : (form.sku || "")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-pink-700">
            {t("estado")}
          </span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              name="estado"
              className="sr-only peer"
              checked={form.estado}
              onChange={handleChange}
            />
            <div
              className={`w-11 h-6 ${
                form.estado ? "bg-[#cc3399]" : "bg-gray-300"
              } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full transition-colors duration-200`}
            ></div>
            <div
              className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                form.estado ? "translate-x-5" : ""
              }`}
            ></div>
          </label>
        </div>
      </div>

      {/* Sección 1: datos básicos del paquete */}
      <div className="border border-pink-200 rounded-lg py-6 px-2 mb-2">
      
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
          {/* Cliente (AsyncSelect) */}
          <div className="col-span-1 flex flex-col">
            <label
              htmlFor="cliente"
              className="mb-1 text-sm font-medium required"
              style={{ color: '#cc3399' }}
            >
              {t("cliente")} *
            </label>
            {/* Mostrar el nombre del cliente como texto si está en edición, si no AsyncSelect */}
            {editId && paquete ? (
              <input
                type="text"
                className="w-full text-sm px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa] text-gray-700"
                value={paquete.NombreCliente || paquete.nombreCliente || paquete.cliente || ""}
                disabled
                readOnly
                style={{ minHeight: 40 }}
              />
            ) : (
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={async (inputValue) => {
                  try {
                    const res = await fetch(
                      `${API_ENDPOINTS.CLIENTES.LIST}?search=${encodeURIComponent(
                        inputValue
                      )}`
                    );
                    const data = await res.json();
                    const clientes = Array.isArray(data)
                      ? data
                      : data?.data || [];
                    return clientes.map((cli) => ({
                      value:
                        cli.id?.toString() ||
                        cli.id ||
                        cli.codcustomer ||
                        cli.NombreCliente,
                      label:
                        cli.NombreCliente ||
                        cli.nombre ||
                        cli.razon_social ||
                        cli.codcustomer ||
                        cli.id,
                      raw: cli,
                    }));
                  } catch {
                    return [];
                  }
                }}
                value={form.cliente}
                onChange={(selected) => {
                  setForm((prev) => ({ ...prev, cliente: selected }));
                }}
                isDisabled={loading}
                placeholder={t("buscar")}
                classNamePrefix="react-select"
                className="w-full text-sm px-2 py-1 border-2 border-white focus:border-[#3b82f6] rounded-md bg-white"
                menuPortalTarget={
                  typeof window !== "undefined" ? window.document.body : undefined
                }
                menuPosition="fixed"
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                required
              />
            )}
          </div>
          {/* Categoría (multiselect) */}
          <div className="col-span-1 flex flex-col">
            <label
              htmlFor="categoria"
              className="mb-1 text-sm font-medium required"
              style={{ color: '#cc3399' }}
            >
              {t("categoria")} *
            </label>
            <Select
              isMulti
              name="categoria"
              options={[
                { value: "general", label: "General" },
                ...categorias.map((cat: any) => ({
                  value:
                    cat.id?.toString() ||
                    cat.nombreCategoria ||
                    cat.name ||
                    cat.descripcion ||
                    "",
                  label:
                    (cat.tipo ? `${cat.tipo} | ` : "") +
                    (cat.nombreCategoria ||
                      cat.name ||
                      cat.descripcion ||
                      cat.id ||
                      ""),
                })),
              ]}
              value={
                Array.isArray(form.categoria)
                  ? form.categoria.map((cat) => {
                      const val = String(cat).toLowerCase();
                      if (val === "general")
                        return { value: "general", label: "General" };
                      const found = categorias.find((c: any) => {
                        return (
                          c.id?.toString().toLowerCase() === val ||
                          (c.nombreCategoria &&
                            c.nombreCategoria.toLowerCase() === val) ||
                          (c.name && c.name.toLowerCase() === val) ||
                          (c.descripcion && c.descripcion.toLowerCase() === val)
                        );
                      });
                      if (found) {
                        return {
                          value:
                            found.id?.toString() ||
                            found.nombreCategoria ||
                            found.name ||
                            found.descripcion ||
                            "",
                          label:
                            (found.tipo ? `${found.tipo} | ` : "") +
                            (found.nombreCategoria ||
                              found.name ||
                              found.descripcion ||
                              found.id ||
                              ""),
                        };
                      }
                      return { value: val, label: val };
                    })
                  : []
              }
              onChange={(selected) => {
                let arr = Array.isArray(selected)
                  ? selected.map((opt) => opt.value)
                  : [];
                if (arr.includes("general")) arr = ["general"];
                setForm((prev: any) => ({ ...prev, categoria: arr }));
              }}
              placeholder={t("buscar")}
              isDisabled={loading || !!editId}
              classNamePrefix="react-select"
              className="w-full text-sm px-2 py-1 border-2 border-white focus:border-[#3b82f6] rounded-md bg-white"
              menuPortalTarget={
                typeof window !== "undefined" ? window.document.body : undefined
              }
              menuPosition="fixed"
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          {/* Subcategoría (multiselect) */}
          <div className="col-span-1 flex flex-col">
            <label
              htmlFor="subcategoria"
              className="mb-1 text-sm font-medium required"
              style={{ color: '#cc3399' }}
            >
              {t("subcategoria")} *
            </label>
            <CreatableSelect
              isMulti
              name="subcategoria"
              options={subcategorias.map((s: any) => {
                if (typeof s === "string") return { value: s, label: s };
                if (typeof s === "object" && s !== null) {
                  return {
                    value:
                      s.id?.toString() ||
                      s.name ||
                      s.nombre ||
                      s.descripcion ||
                      "",
                    label:
                      s.name ||
                      s.nombre ||
                      s.nombreTipoVariedad ||
                      s.descripcion ||
                      s.id ||
                      "",
                  };
                }
                return { value: String(s), label: String(s) };
              })}
              value={
                Array.isArray(form.subcategoria)
                  ? form.subcategoria.map((s: any) => {
                      // Buscar el objeto en subcategorias
                      const found = subcategorias.find((sub: any) => {
                        if (typeof sub === "string") return sub === s;
                        if (typeof sub === "object" && sub !== null) {
                          return (
                            sub.id?.toString() === s ||
                            sub.name === s ||
                            sub.nombre === s ||
                            sub.nombreTipoVariedad === s ||
                            sub.descripcion === s
                          );
                        }
                        return false;
                      });
                      if (found) {
                        if (typeof found === "string")
                          return { value: found, label: found };
                        return {
                          value:
                            found.id?.toString() ||
                            found.name ||
                            found.nombre ||
                            found.nombreTipoVariedad ||
                            found.descripcion ||
                            String(s),
                          label:
                            found.name ||
                            found.nombre ||
                            found.nombreTipoVariedad ||
                            found.descripcion ||
                            String(s),
                        };
                      }
                      // Si no se encuentra, mostrar el valor crudo
                      return { value: String(s), label: String(s) };
                    })
                  : []
              }
              onChange={(selected) => {
                const arr = Array.isArray(selected)
                  ? selected.map((opt) => String(opt.value))
                  : [];
                setForm((prev: any) => ({ ...prev, subcategoria: arr }));
              }}
              onCreateOption={(inputValue) => {
                setForm((prev: any) => ({
                  ...prev,
                  subcategoria: Array.isArray(prev.subcategoria)
                    ? [...prev.subcategoria, inputValue]
                    : [inputValue],
                }));
              }}
              isDisabled={
                loading ||
                !form.categoria ||
                (Array.isArray(form.categoria) && form.categoria.length === 0) || !!editId
              }
              classNamePrefix="react-select"
              className="w-full text-sm px-2 py-1 border-2 border-white focus:border-[#3b82f6] rounded-md bg-white"
              menuPortalTarget={
                typeof window !== "undefined" ? window.document.body : undefined
              }
              menuPosition="fixed"
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          {/* Nombre */}
          <div className="col-span-1 flex flex-col">
            <label
              htmlFor="nombre"
              className="mb-1 text-sm font-medium required"
              style={{ color: '#cc3399' }}
            >
              {t("nombre")} *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder={t("paquete")}
              readOnly={!!editId}
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Selección de materiales */}
      <div className="border border-pink-200 rounded-lg py-6 px-2 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col border border-pink-500 rounded-lg bg-white overflow-hidden">
            <div className="bg-pink-50 p-3 sm:p-4 border-b border-pink-200">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-center">
                {t('materiales') || 'Materiales'}
              </h4>
              <div className="text-xs text-gray-500 text-center mt-1">
                {materialesFiltrados.length} {t('materiales')?.toLowerCase() || 'materiales'}
              </div>
            </div>
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex flex-col gap-2 items-stretch relative">
                <input
                  type="text"
                  className="border border-pink-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 mb-2"
                  placeholder={t('buscar') + ' material'}
                  value={materialesBusqueda}
                  onChange={e => setMaterialesBusqueda(e.target.value)}
                  disabled={false}
                />
                <div className="flex flex-col gap-0 max-h-64 overflow-y-auto border border-black rounded bg-white shadow-sm z-10 relative">
                  {materialesFiltrados.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-2">
                      {t('sin_materiales')}
                    </div>
                  )}
                  {(() => {
                    let clienteNombre = "";
                    if (form.cliente && typeof form.cliente === "object" && form.cliente.label) {
                      clienteNombre = String(form.cliente.label).toLowerCase().replace(/\s+/g, "").trim();
                    }
                    const sortedMateriales = [...materialesFiltrados].sort((a, b) => {
                      const marcaA = (a.marca || "").toLowerCase().replace(/\s+/g, "").trim();
                      const marcaB = (b.marca || "").toLowerCase().replace(/\s+/g, "").trim();
                      if (clienteNombre) {
                        const aIsCliente = marcaA === clienteNombre;
                        const bIsCliente = marcaB === clienteNombre;
                        if (aIsCliente && !bIsCliente) return -1;
                        if (!aIsCliente && bIsCliente) return 1;
                      }
                      return 0;
                    });
                    return (
                      <div className="flex flex-col gap-0">
                        {sortedMateriales.map((mat, idx) => (
                          <>
                            <div
                              key={mat.id}
                              className="flex items-center justify-between px-2 py-1 hover:bg-pink-100 cursor-pointer"
                              onClick={() => {
                                setMaterialesSeleccionados(prev => [...prev, { ...mat, cantidad: 1 }]);
                                setMaterialesBusqueda("");
                              }}
                            >
                              <span className="text-sm text-gray-800">
                                {mat.nombre || mat.descripcion}
                                {mat.marca ? (
                                  <span className="text-xs text-gray-500 ml-2">- {mat.marca}</span>
                                ) : null}
                              </span>
                            </div>
                            {idx < sortedMateriales.length - 1 && (
                              <div className="border-b border-gray-200 mx-2"></div>
                            )}
                          </>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col border border-blue-400 rounded-lg bg-white overflow-hidden">
            <div className="bg-blue-50 p-3 sm:p-4 border-b border-blue-200">
              <h4 className="text-sm sm:text-base font-semibold text-blue-700 text-center">{t('seleccionados') || 'Seleccionados'}</h4>
              <div className="text-xs text-gray-500 text-center mt-1">
                {materialesSeleccionados.length} {t('materiales')?.toLowerCase() || 'materiales'}
              </div>
            </div>
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto" style={{ maxHeight: 440, minHeight: 80 }}>
              {materialesSeleccionados.length === 0 ? (
                <div className="text-xs text-gray-400 text-center">
                  {t('sin_materiales')}
                </div>
              ) : (
                <>
                  {/* Encabezados de columnas */}
                  <div className="grid grid-cols-5 gap-2 px-3 py-2 mb-2 bg-blue-100 rounded font-semibold text-xs text-blue-700">
                    <div className="col-span-1">{t('materiales') || 'Material'}</div>
                    <div className="text-center">{t('cantidad') || 'Cantidad'}</div>
                    <div className="text-center">{t('precioUnitario') || 'Precio unitario'}</div>
                    <div className="text-center">{t('total') || 'Total'}</div>
                    <div className="text-center"></div>
                  </div>
                  {/* Items de materiales */}
                  {materialesSeleccionados.map((mat, idx) => (
                    <div key={mat.id} className="grid grid-cols-5 gap-2 items-center border rounded px-3 py-2 mb-2 bg-white shadow-sm">
                      <span className="col-span-1 text-[11px] text-gray-800 text-left">{mat.nombre || mat.descripcion}</span>
                                           <div className="flex justify-center">
                        <input
                          type="number"
                          min={1}
                          className="border border-blue-400 bg-blue-50 rounded px-2 py-1 w-16 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                          style={{ width: 60 }}
                          value={mat.cantidad || 1}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setMaterialesSeleccionados(prev => prev.map((m, i) => i === idx ? { ...m, cantidad: val } : m));
                          }}
                          title="Cantidad"
                        />
                      </div>

                      <span className="text-xs text-green-700 font-semibold w-20 text-right">
                        $ {mat.precioUnitario?.toFixed(2) || (mat.precio?.toFixed?.(2) || mat.precio || "0.00")}
                      </span>

                      <span className="text-xs text-gray-700 font-semibold text-center">
                        $ {(
                          (mat.cantidad || 1) * (mat.precioUnitario ?? mat.precio ?? 0)
                        ).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className="text-[10px] w-5 h-5 flex items-center justify-center text-white font-semibold p-0 rounded-full leading-none mx-auto"
                        style={{ background: "#cc3399" }}
                        onClick={() => setMaterialesSeleccionados(prev => prev.filter((_, i) => i !== idx))}
                        title="Quitar"
                      >✕</button>
                    </div>
                  ))}
                </>
              )}
            </div>
            {/* Total de materiales seleccionados fuera del área con scroll */}
            {materialesSeleccionados.length > 0 && (
              <div className="w-full text-right px-20 mt-4">
                <span className="text-base font-bold text-blue-700">
                  {t("total_materiales")} $ {typeof form.precioTotal === "number" ? form.precioTotal.toFixed(2) : Number(form.precioTotal || 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensaje de error de nombre duplicado sobre los botones */}
      {duplicateError && (
        <div className="w-full mb-4 text-center text-red-600 font-semibold bg-red-50 border border-red-200 rounded p-2">
          {duplicateError}
        </div>
      )}
      {/* Sección: Botones */}
      <div className="w-full flex justify-end gap-4">
        <button
          type="button"
          style={{ background: "#cc3399", color: "#fff" }}
          className="px-4 py-2 rounded font-medium transition-colors"
          onClick={() => {
            if (onCancel) onCancel();
          }}
          disabled={loading}
        >
          {t("cancelar") || "Cancelar"}
        </button>
        {!duplicateError && (
          <button
            type="submit"
            style={{ background: "#cc3399", color: "#fff" }}
            className="px-4 py-2 rounded font-medium transition-colors"
            disabled={loading}
          >
            {loading ? "Guardando..." : editId ? "Actualizar" : t("guardar") || "Guardar"}
          </button>
        )}
      </div>
    </form>
  );
};

export default FormPaquete;
