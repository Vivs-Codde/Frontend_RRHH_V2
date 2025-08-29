
import React from "react";
import { useModalConfirm, ModalConfirm } from "./modalConfirmLogic";
import Select from "react-select";
import { useFormRecetasLogic, generarSkuReceta, generarRecetasPayload } from "./formRecetasLogic";
import type { CategoriaOption, TipoFlorOption } from "./formRecetasLogic";
// Importar sin tipos estrictos para permitir paquete_material_id
import * as recetasService from "../../services/recetasService";
import { getPaquetes } from "../../services/paquetesService";
import { Edit2, Eye, Trash2 } from "lucide-react";
import PaqueteViewModal from "../paquetes/PaqueteViewModal";
import { API_ENDPOINTS } from "../../constants/api";
import { useTranslation } from "react-i18next";
interface FormRecetasProps {
  onSaved?: () => void;
}
const FormRecetas: React.FC<FormRecetasProps> = ({ onSaved }) => {
  // Estado para mostrar el modal de omitidos
  const [showOmitidosModal, setShowOmitidosModal] = React.useState(false);
  // Para cerrar el modal tras un tiempo
  const omitidosTimeoutRef = React.useRef<any>(null);
  // Modal confirmación separado
  const { showModal, openModal, closeModal, handleAccept } = useModalConfirm(onSaved);
  const { t } = useTranslation();
  // Lógica principal del formulario (sin materiales)
  const {
    selectedIds,
    setSelectedIds,
    categoriaFiltro,
    setCategoriaFiltro,
    tipoFloresFiltro,
    setTipoFloresFiltro,
    productos,
    categorias,
    tiposFloresOptions,
    page,
    setPage,
    perPage,
    setPerPage,
    totalPages,
    totalProductos,
    handleCheck,
    handleCheckAll,
  } = useFormRecetasLogic(onSaved);

  // Estado para todos los productos filtrados (sin paginación)
  const [allFilteredProductos, setAllFilteredProductos] = React.useState<any[]>([]);

  // Estado para paquetes
  const [paquetes, setPaquetes] = React.useState<any[]>([]);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = React.useState<any[]>([]);
  // Estado para búsqueda de paquetes
  const [searchPaquete, setSearchPaquete] = React.useState("");
  // Estado para modal de ver paquete
  const [paqueteModal, setPaqueteModal] = React.useState<any | null>(null);
  // Estado para paginación de paquetes
  const [paquetePage, setPaquetePage] = React.useState(1);
  const [paquetePerPage, setPaquetePerPage] = React.useState(10);

  // Cargar todos los paquetes al montar
  React.useEffect(() => {
    async function fetchPaquetes() {
      try {
        const data = await getPaquetes();
        // Soportar diferentes formatos de respuesta
        if (Array.isArray(data)) {
          setPaquetes(data);
        } else if (Array.isArray(data.data)) {
          setPaquetes(data.data);
        } else if (Array.isArray(data.paquetes)) {
          setPaquetes(data.paquetes);
        } else {
          setPaquetes([]);
        }
      } catch {
        setPaquetes([]);
      }
    }
    fetchPaquetes();
  }, []);


  React.useEffect(() => {
    async function fetchAllFiltered() {
      try {
        const searchParams: Record<string, string | number | boolean> = {};
        searchParams.estado = true;
        if (categoriaFiltro.length > 0)
          searchParams.categoria = categoriaFiltro.map(c => c.value).join(",");
        if (tipoFloresFiltro.length > 0)
          searchParams.tipos_flores = tipoFloresFiltro.map(t => t.value).join(",");
        searchParams.perPage = 1000; // Sin paginación, máximo 1000
        searchParams.page = 1;
        const url = API_ENDPOINTS.PRODUCTOS.LIST + "?" + new URLSearchParams(searchParams as any);
        const res = await fetch(url, { headers: { accept: "application/json" } });
        const data = await res.json();
        const productos = Array.isArray(data.productos) ? data.productos : [];
        const mapped = productos.map((p: {
          sku?: string;
          SKU?: string;
          nombreProducto?: string;
          nombre?: string;
          descripcion?: string;
          categoria?: string;
          nombreCategoria?: string;
          [key: string]: any;
        }) => ({
          ...p,
          SKU: p.sku || p.SKU,
          nombreProducto: p.nombreProducto || p.nombre,
          descripcion: p.descripcion,
          categoria: p.categoria || p.nombreCategoria
        }));
        setAllFilteredProductos(mapped);
      } catch {
        setAllFilteredProductos([]);
      }
    }
    fetchAllFiltered();
  }, [categoriaFiltro, tipoFloresFiltro]);

  // Inicializar paquetes si es edición


  // Estado para búsqueda general
  const [search, setSearch] = React.useState("");

  // Filtrar productos según búsqueda general
  const filteredProductos = React.useMemo(() => {
    const searchText = search.toLowerCase();
    return productos.filter((p) => [
      p.nombreProducto,
      p.descripcion,
      p.categoria,
      p.subcategoria,
      p.variedad,
      p.color,
      p.SKU,
    ]
      .map((v) => (v ? v.toString().toLowerCase() : ""))
      .join(" ")
      .includes(searchText));
  }, [productos, search]);

  // Estado para feedback de guardado
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");
  const [saveSuccess, setSaveSuccess] = React.useState("");
  const [resultResumen, setResultResumen] = React.useState<{creados: any[], omitidos: any[]} | null>(null);

  // Lógica para guardar o editar receta
  const handleSaveReceta = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      // Usar la función para armar el array recetas en el formato correcto
      const recetas = generarRecetasPayload({
        productosSeleccionados: selectedIds,
        paquetesSeleccionados,
        productos: allFilteredProductos,
        paquetes,
      });
      const resp = await recetasService.createReceta({ recetas });
      // Guardar resumen de creados y omitidos si existen
      const creadosArr = Array.isArray(resp.creados) ? resp.creados : [];
      const omitidosArr = Array.isArray(resp.omitidos) ? resp.omitidos : [];
      setResultResumen({
        creados: creadosArr,
        omitidos: omitidosArr,
      });
      // Mostrar modal si hay omitidos o creados
      if (omitidosArr.length > 0 || creadosArr.length > 0) {
        setShowOmitidosModal(true);
        // Cerrar automáticamente tras 7 segundos
        if (omitidosTimeoutRef.current) clearTimeout(omitidosTimeoutRef.current);
        omitidosTimeoutRef.current = setTimeout(() => {
          setShowOmitidosModal(false);
          setResultResumen(null);
        }, 7000);
      }
      // Solo mostrar mensaje de éxito si hay creados y no omitidos
      if (creadosArr.length > 0 && omitidosArr.length === 0) {
        setSaveSuccess("Receta creada correctamente");
      } else {
        setSaveSuccess("");
      }
      limpiarFormulario();
      if (onSaved) onSaved();
    } catch (err) {
      // Mejorar mensaje de error para mostrar nombres
      let customError = "Error al guardar la receta: ";
      let msg = err && typeof err === 'object' && 'message' in err ? (err as Error).message : "";
      // Buscar coincidencia de IDs en el mensaje
      // Ejemplo: El paquete de materiales con ID 8 ya existe en el producto con ID 59
      const regex = /paquete(?: de materiales)? con ID (\d+)[^\d]+producto con ID (\d+)/i;
      const match = msg.match(regex);
      if (match) {
        const paqueteId = parseInt(match[1], 10);
        const productoId = parseInt(match[2], 10);
        // Buscar nombre del paquete
        const paquete = paquetes.find(p => (p.id || p.paquete_id) === paqueteId);
        const nombrePaquete = paquete ? (paquete.nombre || paquete.nombrePaquete || `ID ${paqueteId}`) : `ID ${paqueteId}`;
        // Buscar nombre del producto
        let producto = allFilteredProductos.find(p => p.id === productoId) || productos.find(p => p.id === productoId);
        const nombreProducto = producto ? (producto.nombreProducto || producto.nombre || producto.descripcion || `ID ${productoId}`) : `ID ${productoId}`;
        customError += `El paquete "${nombrePaquete}" ya existe en el producto "${nombreProducto}".`;
      } else {
        customError += msg;
      }
      setSaveError(customError);
    } finally {
      setSaving(false);
      closeModal();
    }
  };

  // ...existing code...
  // Función para limpiar paquetes y productos seleccionados
  const limpiarFormulario = () => {
    setPaquetesSeleccionados([]);
    setSelectedIds([]);
  };


  return (
    <div className="bg-white p-2 sm:p-4 lg:p-6 rounded-lg shadow-none w-full">
      <ModalConfirm
        show={showModal}
        onCancel={closeModal}
        onAccept={handleSaveReceta}
        productos={selectedIds.length}
        paquetes={paquetesSeleccionados.length}
      />

      {saving && <div className="text-sm text-blue-600 mb-2">Guardando receta...</div>}
      {saveError && <div className="text-sm text-red-600 mb-2">{saveError}</div>}
      {saveSuccess && <div className="text-sm text-green-600 mb-2">{saveSuccess}</div>}
      {/* Resumen de creados y omitidos */}
      {/* Modal para recetas omitidas (existentes) */}
      {showOmitidosModal && resultResumen && (resultResumen.omitidos.length > 0 || resultResumen.creados.length > 0) && (
        <div>
          <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50" style={{backdropFilter:'blur(8px)'}} onClick={e => {
            if (e.target === e.currentTarget) {
              setShowOmitidosModal(false);
              setResultResumen(null);
              if (omitidosTimeoutRef.current) clearTimeout(omitidosTimeoutRef.current);
            }
          }}>
            <div className="bg-white rounded-lg p-8 w-[98vw] max-w-4xl shadow-lg overflow-y-auto max-h-[95vh] border-2 border-pink-200 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-[#cc3399] mb-4">Resumen de recetas</h3>
              {resultResumen.creados.length > 0 && (
                <div className="mb-6 w-full">
                  <h4 className="text-lg font-bold text-green-700 mb-2">Recetas creadas:</h4>
                  <ul className="list-disc ml-6 mb-2">
                    {resultResumen.creados.map((r, idx) => (
                      <li key={idx} className="mb-1">
                        Producto: <b>{r.producto_nombre || r.producto_id || r.sku}</b> | Paquete: <b>{r.paquete_nombre || r.paquete_material_id}</b> {r.sku ? `| SKU: ${r.sku}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {resultResumen.omitidos.length > 0 && (
                <div className="mb-2 w-full">
                  <h4 className="text-lg font-bold text-[#cc3399] mb-2">Recetas existentes:</h4>
                  <ul className="list-disc ml-6 mb-2">
                    {resultResumen.omitidos.map((r, idx) => (
                      <li key={idx} className="mb-1">
                        Producto: <b>{r.producto_nombre || r.producto_id}</b> | Paquete: <b>{r.paquete_nombre || r.paquete_material_id}</b> {r.mensaje ? `| Motivo: ${r.mensaje}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                className="mt-4 px-6 py-3 text-white rounded-lg hover:bg-pink-700 transition-colors w-full sm:w-auto text-lg font-semibold"
                style={{ background: '#cc3399'}}
                onClick={() => {
                  setShowOmitidosModal(false);
                  setResultResumen(null);
                  if (omitidosTimeoutRef.current) clearTimeout(omitidosTimeoutRef.current);
                }}
              >Cerrar</button>
              <div className="mt-2 text-xs text-gray-500">Este mensaje se cerrará automáticamente en unos segundos.</div>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          openModal();
        }}
        className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 items-start"
        style={{ minHeight: '400px' }}
      >
        {/* Sección Productos */}
        <div className="flex flex-col gap-4 border border-pink-700 rounded-lg p-2 sm:p-4 lg:p-6 bg-white min-h-[350px]">
          <h4 className="text-lg font-semibold mb-2 text-[#cc3399] text-center">{t("productos")}</h4>
          <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 gap-2 md:flex md:flex-row md:items-end" style={{ flexWrap: 'wrap' }}>
            <div className="flex-1 min-w-[140px] flex-col hidden">
              <label className="block text-sm font-medium mb-1 text-[#cc3399]">{t("filtro_categoria")}</label>
              <Select
                isMulti
                options={categorias.map(cat => ({ value: cat.nombreCategoria, label: cat.nombreCategoria }))}
                value={categoriaFiltro}
                onChange={(newValue) => setCategoriaFiltro(newValue as CategoriaOption[])}
                placeholder="Seleccionar ..."
                classNamePrefix="react-select"
                menuPortalTarget={typeof window !== "undefined" ? window.document.body : undefined}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({
                    ...base,
                    minHeight: '36px',
                    borderColor: 'black',
                    boxShadow: 'none',
                    background: '#fff',
                  }),
                }}
                // isDisabled removed since modoEdicion no longer exists
              />
            </div>
            <div className="flex-1 min-w-[140px] flex-col justify-end hidden">
              <label className="block text-sm font-medium mb-1 text-[#cc3399]">{t("filtro_flores")}</label>
              <div className="flex items-center h-9">
                <Select
                  isMulti
                  options={tiposFloresOptions}
                  value={tipoFloresFiltro}
                  onChange={(newValue) => setTipoFloresFiltro(newValue as TipoFlorOption[])}
                  placeholder="Seleccionar ..."
                  classNamePrefix="react-select"
                  menuPortalTarget={typeof window !== "undefined" ? window.document.body : undefined}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base) => ({
                      ...base,
                      minHeight: '36px',
                      borderColor: 'black',
                      boxShadow: 'none',
                      background: '#fff',
                    }),
                  }}
                />
              </div>
            </div>
            <div className="flex-1 min-w-[160px] flex flex-col">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('buscar')}
                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-[#cc3399]"
                style={{ maxWidth: '100%', minWidth: '120px', background: '#fff', borderColor: 'black' }}
              />
            </div>
          </div>
          {/* Tabla de productos activos filtrados */}
          <div className="overflow-auto flex-1">
            {/* ...existing code for table and pagination... */}
            {(() => {
              // Filtrado y paginación de productos
              const filteredProductos = allFilteredProductos.filter(producto =>
                [
                  producto.categoria,
                  producto.nombreProducto,
                  producto.color,
                  producto.tallos,
                  producto.variedad,
                  producto.calibre,
                  producto.subcategoria,
                  producto.descripcion,
                  producto.estado?.toString(),
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(search.toLowerCase())
              );
              const totalPages = Math.max(1, Math.ceil(filteredProductos.length / perPage));
              const startIndex = (page - 1) * perPage;
              const endIndex = startIndex + perPage;
              const paginatedProductos = filteredProductos.slice(startIndex, endIndex);
              const handleCheckAllFiltered = () => {
                if (selectedIds.length === filteredProductos.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(filteredProductos.map(p => p.id));
                }
              };
              return (
                <>
                  <div className="mb-2 text-sm text-gray-700 font-medium">
                    {selectedIds.length} / {filteredProductos.length} {t("seleccionados")}
                  </div>
                  <table className="w-full border mt-2 text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-pink-500 text-amber-50">
                        <th className="p-2 text-left">
                          <input
                            type="checkbox"
                            checked={filteredProductos.length > 0 && selectedIds.length === filteredProductos.length}
                            ref={el => {
                              if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < filteredProductos.length;
                            }}
                            onChange={handleCheckAllFiltered}
                          />
                        </th>
                        <th className="p-2 text-left">{t("categoria")}</th>
                        <th className="p-2 text-left">{t("descripcion")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProductos.map(p => (
                        <tr key={p.id}>
                          <td className="p-2 border-b text-left">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(p.id)}
                              onChange={() => handleCheck(p.id)}
                              disabled={false}
                            />
                          </td>
                          <td className="p-2 border-b text-left">{p.categoria}</td>
                          <td className="p-2 border-b text-left">{p.descripcion}</td>
                        </tr>
                      ))}
                      {paginatedProductos.length === 0 && (
                        <tr><td colSpan={4} className="p-2 text-left text-gray-400">No hay productos</td></tr>
                      )}
                    </tbody>
                  </table>
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="p-1 rounded button-icon-no-bg"
                        style={{ color: page === 1 ? '#ccc' : '#e83e8c', background: 'transparent', border: 'none' }}
                        title="Anterior"
                      >
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>&#8592;</span>
                      </button>
                      <span className="text-sm">{t("pagina")} <b>{page}</b> {t("de")} <b>{totalPages}</b></span>
                      <button
                        type="button"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="p-1 rounded button-icon-no-bg"
                        style={{ color: (page === totalPages) ? '#ccc' : '#e83e8c', background: 'transparent', border: 'none' }}
                        title="Siguiente"
                      >
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>&#8594;</span>
                      </button>
                    </div>
                    <div className="flex items-center">
                      <select
                        className="ml-2 px-2 py-1 border rounded text-sm"
                        value={perPage}
                        onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="ml-2 text-sm">{t("por_pagina")}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        {/* Sección Paquetes con buscador */}
        <div className="flex flex-col gap-4 border border-blue-400 rounded-lg p-2 sm:p-4 lg:p-6 bg-white min-h-[350px]">
          <h4 className="text-lg font-semibold mb-1 text-[#cc3399] text-center">{t("paquete_materiales")}</h4>
          <div className="mb-4 flex flex-row gap-2 items-center">
            <input
              type="text"
              value={searchPaquete}
              onChange={e => setSearchPaquete(e.target.value)}
              placeholder={t('buscar') || 'Buscar paquete'}
              className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-[#cc3399]"
              style={{ maxWidth: '100%', minWidth: '120px', background: '#fff', borderColor: 'black' }}
            />
          </div>
          <div className="flex-1">
            {(() => {
              // Filtrado de paquetes por búsqueda (si hay texto, mostrar todos los resultados en una sola página)
              const paquetesFiltrados = paquetes.filter(pk => {
                const texto = searchPaquete.toLowerCase();
                return (
                  (pk.nombre || pk.nombrePaquete || "").toLowerCase().includes(texto)
                );
              });
              let paginatedPaquetes = paquetesFiltrados;
              let totalPaquetePages = 1;
              if (!searchPaquete) {
                totalPaquetePages = Math.max(1, Math.ceil(paquetesFiltrados.length / paquetePerPage));
                const startIndex = (paquetePage - 1) * paquetePerPage;
                const endIndex = startIndex + paquetePerPage;
                paginatedPaquetes = paquetesFiltrados.slice(startIndex, endIndex);
              } else {
                // Si hay búsqueda, mostrar todos los resultados en una sola página
                totalPaquetePages = 1;
                paginatedPaquetes = paquetesFiltrados;
              }
              // Selección múltiple
              const allSelected = paginatedPaquetes.length > 0 && paginatedPaquetes.every(pk => paquetesSeleccionados.some(p => (p.id || p.paquete_id) === (pk.id || pk.paquete_id)));
              const someSelected = paginatedPaquetes.some(pk => paquetesSeleccionados.some(p => (p.id || p.paquete_id) === (pk.id || pk.paquete_id)));
              const handleCheckAllPaquetes = () => {
                if (allSelected) {
                  setPaquetesSeleccionados(paquetesSeleccionados.filter(p => !paginatedPaquetes.some(pk => (p.id || p.paquete_id) === (pk.id || pk.paquete_id))));
                } else {
                  const nuevos = paginatedPaquetes.filter(pk => !paquetesSeleccionados.some(p => (p.id || p.paquete_id) === (pk.id || pk.paquete_id)))
                    .map(pk => ({ ...pk, cantidad: 1, precio: 0 }));
                  setPaquetesSeleccionados([...paquetesSeleccionados, ...nuevos]);
                }
              };
              return (
                <>
                  <table className="w-full border mt-2 text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-pink-500 text-amber-50">
                        <th className="p-2 text-left">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={el => {
                              if (el) el.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={handleCheckAllPaquetes}
                          />
                        </th>
                        <th className="p-2 text-left">{t("nombre")}</th>
                        <th className="p-2 text-center">{t("ver")}</th>
                        <th className="p-2 text-left hidden">{t("cantidad")}</th>
                        <th className="p-2 text-left hidden">{t("precio")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paquetes.length === 0 && (
                        <tr><td colSpan={5} className="p-2 text-center text-gray-400">No hay paquetes</td></tr>
                      )}
                      {paginatedPaquetes.map((pk, idx) => {
                        const seleccionado = paquetesSeleccionados.find(p => (p.id || p.paquete_id) === (pk.id || pk.paquete_id));
                        // Mostrar todos los SKUs combinados para cada producto seleccionado
                        let skuRecetas: string[] = [];
                        if (selectedIds.length > 0) {
                          skuRecetas = selectedIds.map(pid => {
                            const producto = allFilteredProductos.find(p => p.id === pid) || productos.find(p => p.id === pid);
                            return generarSkuReceta(producto, pk);
                          }).filter(sku => sku);
                        }
                        return (
                          <tr key={pk.id || pk.paquete_id}>
                            <td className="p-2 border-b text-left">
                              <input
                                type="checkbox"
                                checked={!!seleccionado}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  if (e.target.checked) {
                                    setPaquetesSeleccionados([
                                      ...paquetesSeleccionados,
                                      { ...pk, cantidad: 1, precio: 0 },
                                    ]);
                                  } else {
                                    setPaquetesSeleccionados(paquetesSeleccionados.filter(p => (p.id || p.paquete_id) !== (pk.id || pk.paquete_id)));
                                  }
                                }}
                              />
                            </td>
                            <td className="p-2 border-b text-left">
                              {pk.nombre || pk.nombrePaquete || `Paquete ${pk.id || pk.paquete_id}`}
                              {skuRecetas.length > 0 && (
                                <div className="text-xs text-blue-700 mt-1 hidden">
                                  
                                  {skuRecetas.map((sku, i) => {
                                    // Calcular suma para mostrar
                                    const producto = allFilteredProductos.find(p => p.id === selectedIds[i]) || productos.find(p => p.id === selectedIds[i]);
                                    const costoProducto = Number(producto?.precioTotal ?? 0);
                                    const costoPaquete = Number(pk.precioTotal ?? 0);
                                    const suma = costoProducto + costoPaquete;
                                    return (
                                      <span  key={sku} style={{ display: 'inline-block', marginRight: 8 }}>
                                        <b>{sku}</b>{i < skuRecetas.length - 1 ? ',' : ''}
                                        <span className="ml-1 text-green-700 hidden">[Suma: {suma} | prod.precioTotal: {producto?.precioTotal ?? 'null'} | pk.precioTotal: {pk.precioTotal ?? 'null'}]</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="border-b text-center">
                              <button type="button" className="text-pink-700 hover:text-pink-900" title="Ver detalles"
                                style={{ background: 'transparent', border: 'none' }}
                                onClick={() => setPaqueteModal(pk)}>
                                <Eye size={20} />
                              </button>
                            </td>
                            <td className="p-2 border-b text-left hidden">
                              {seleccionado ? (
                                <input
                                  type="number"
                                  value={seleccionado.cantidad}
                                  min={1}
                                  className="border rounded px-2 py-1 w-20"
                                  onChange={e => {
                                    const nuevaCantidad = e.target.value;
                                    setPaquetesSeleccionados(paquetesSeleccionados.map(p => (p.id || p.paquete_id) === (pk.id || pk.paquete_id) ? { ...p, cantidad: nuevaCantidad } : p));
                                  }}
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="p-2 border-b text-left hidden">
                              {seleccionado ? (
                                <input
                                  type="number"
                                  value={seleccionado.precio}
                                  min={0}
                                  className="border rounded px-2 py-1 w-20"
                                  onChange={e => {
                                    const nuevoPrecio = e.target.value;
                                    setPaquetesSeleccionados(paquetesSeleccionados.map(p => (p.id || p.paquete_id) === (pk.id || pk.paquete_id) ? { ...p, precio: nuevoPrecio } : p));
                                  }}
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Modal de ver paquete */}
                  {paqueteModal && (
                    <PaqueteViewModal
                      paquete={paqueteModal}
                      onClose={() => setPaqueteModal(null)}
                    />
                  )}
                  {/* Paginación de paquetes dentro del borde azul */}
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPaquetePage(paquetePage - 1)}
                        disabled={paquetePage === 1}
                        className="p-1 rounded button-icon-no-bg"
                        style={{ color: paquetePage === 1 ? '#ccc' : '#e83e8c', background: 'transparent', border: 'none' }}
                        title="Anterior"
                      >
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>&#8592;</span>
                      </button>
                      <span className="text-sm">{t("pagina")} <b>{paquetePage}</b> {t("de")} <b>{totalPaquetePages}</b></span>
                      <button
                        type="button"
                        onClick={() => setPaquetePage(paquetePage + 1)}
                        disabled={paquetePage === totalPaquetePages || !!searchPaquete}
                        className="p-1 rounded button-icon-no-bg"
                        style={{ color: (paquetePage === totalPaquetePages || !!searchPaquete) ? '#ccc' : '#e83e8c', background: 'transparent', border: 'none' }}
                        title="Siguiente"
                      >
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>&#8594;</span>
                      </button>
                    </div>
                    <div className="flex items-center">
                      <select
                        className="ml-2 px-2 py-1 border rounded text-sm"
                        value={paquetePerPage}
                        onChange={e => { setPaquetePerPage(Number(e.target.value)); setPaquetePage(1); }}
                        disabled={!!searchPaquete}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="ml-2 text-sm">{t("por_pagina")}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </form>
      {/* Botones cancelar y guardar */}
      <div className="w-full flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
        <button
          type="button"
          className="w-full sm:w-auto border text-white px-6 py-2 rounded-lg font-semibold"
          style={{ background: "#cc3399" }}
          onClick={openModal}
        >
          {t('guardar')}
        </button>
        <button
          type="button"
          className="w-full sm:w-auto bg-[#232c3d] text-white px-6 py-2 rounded-lg font-semibold"
          style={{ background: "#cc3399" }}
          onClick={limpiarFormulario}
        >
          {t('cancelar')}
        </button>
      </div>
    </div>
  );
};

export default FormRecetas;
