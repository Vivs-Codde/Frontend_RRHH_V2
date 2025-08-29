import { useState, useEffect } from "react";
import Select from "react-select";
import { exportToExcel } from "../../utils/excelUtils";
import { API_ENDPOINTS } from "../../constants/api";
import {
  API_CULTIVO_COMBO_TIPO_VARIEDAD_API,
  API_CULTIVO_COMBO_VARIEDAD_API,
  API_CULTIVO_COMBO_CALIBRE_API,
  API_CULTIVO_COMBO_COLOR_API,
} from "../../constants/apiCultivo";
import type {
  TipoVariedad,
  VariedadCultivo,
  CalibreCultivo,
  ComboColorCultivoResponse,
} from "../../constants/apiCultivo";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import ProductoForm from "../../components/forms/ProductoForm";
import type { Producto } from "../../types/producto";
import { productoService } from "../../services/productoService";
import ProductModal from "../../components/modals/ProductModal";
// @ts-ignore
import excelIcon from "../../assets/exel.jpg"; // Importar el ícono de Excel
function ProductosPage() {
  // Cargar opciones de selects de filtros avanzados y categorías desde la API
  useEffect(() => {
    // Categorías
    fetch(API_ENDPOINTS.CATEGORIAS.LIST, {
      headers: { accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const categorias = Array.isArray(data) ? data : data.data;
        setCategoriasOptions(Array.isArray(categorias) ? categorias : []);
      })
      .catch(() => setCategoriasOptions([]));
    // Tipos de variedad
    fetch(API_CULTIVO_COMBO_TIPO_VARIEDAD_API)
      .then((res) => res.json())
      .then((data) => setTiposVariedadOptions(data.data || []))
      .catch(() => setTiposVariedadOptions([]));
    // Variedades
    fetch(API_CULTIVO_COMBO_VARIEDAD_API)
      .then((res) => res.json())
      .then((data) => setVariedadesOptions(data.data || []))
      .catch(() => setVariedadesOptions([]));
    // Calibres
    fetch(API_CULTIVO_COMBO_CALIBRE_API)
      .then((res) => res.json())
      .then((data) => setCalibresOptions(data.data || []))
      .catch(() => setCalibresOptions([]));
    // Colores
    fetch(API_CULTIVO_COMBO_COLOR_API)
      .then((res) => res.json())
      .then((data: ComboColorCultivoResponse) =>
        setColoresOptions(data.data || [])
      )
      .catch(() => setColoresOptions([]));
  }, []);
  // Estados para selects de filtros avanzados
  const [tiposVariedadOptions, setTiposVariedadOptions] = useState<
    TipoVariedad[]
  >([]);
  const [variedadesOptions, setVariedadesOptions] = useState<VariedadCultivo[]>(
    []
  );
  const [calibresOptions, setCalibresOptions] = useState<CalibreCultivo[]>([]);
  // Estado para opciones de categorías
  const [categoriasOptions, setCategoriasOptions] = useState<
    { id: number; nombreCategoria: string }[]
  >([]);
  // Estado para opciones de colores
  const [coloresOptions, setColoresOptions] = useState<
    { id: string; name: string }[]
  >([]);
  // ...existing code...
  // Estado para el total absoluto de productos
  const [totalProductosAbsoluto, setTotalProductosAbsoluto] = useState(0);

  // Obtener el total absoluto de productos sin filtros
  useEffect(() => {
    async function fetchTotalProductosAbsoluto() {
      try {
        // Aquí debes usar el servicio que trae todos los productos sin filtros
        const data = await productoService.buscarPorFlores({});
        if (Array.isArray(data)) {
          setTotalProductosAbsoluto(data.length);
        } else {
          setTotalProductosAbsoluto(0);
        }
      } catch {
        setTotalProductosAbsoluto(0);
      }
    }
    fetchTotalProductosAbsoluto();
  }, []);

  // Función para exportar los productos a Excel (solo datos de texto)
  const handleExportExcel = () => {
    const exportData = sortedProductos.map((producto) => {
      let floresInfo = "";
      if (
        ["bouquete", "consumer bounch"].includes(
          producto.categoria?.toLowerCase?.()
        ) &&
        Array.isArray(producto.flores)
      ) {
        floresInfo = producto.flores
          .map(
            (flor) =>
              `Variedad: ${flor.variedad}, Tipo: ${flor.tipo}, Color: ${flor.color}, Calibre: ${flor.calibre}, Tallos: ${flor.pivot?.tallos}`
          )
          .join("\n"); // salto de línea para cada flor
      }

      return {
        SKU: producto.SKU,
        Nombre: producto.nombreProducto,
        Descripción: producto.descripcion,
        Categoría: producto.categoria,
        Estado: producto.estado === 1 ? t("active") : t("inactive"),
        Flores: floresInfo,
      };
    });

    // Definir anchos de columna para mejor visibilidad
    const columnWidths = [15, 30, 40, 20, 10, 60]; // SKU, Nombre, Descripción, Categoría, Estado, Flores

    // Nombre con lógica filtrados/totalBase
    const descargados = sortedProductos.length;
    const total = totalProductosAbsoluto;
    const fileName = `Reporte Productos (${descargados} de ${total}).xlsx`;
    
    // Usar la nueva utilidad de exportación
    exportToExcel(
      exportData,
      "Productos",
      fileName,
      "Reporte de Productos",
      columnWidths
    );
  };
  const { t } = useTranslation();
  const [productosList, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos"); // "todos", "activos", "inactivos"
  const [categoriaFiltro, setCategoriaFiltro] = useState<any[]>([]); // Multiselect
  const [tiposFloresFiltro, setTiposFloresFiltro] = useState<any[]>([]); // Multiselect
  const [variedadesFiltro, setVariedadesFiltro] = useState<any[]>([]); // Multiselect
  const [coloresFiltro, setColoresFiltro] = useState<any[]>([]); // Multiselect
  const [calibresFiltro, setCalibresFiltro] = useState<any[]>([]); // Multiselect
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editProducto, setEditProducto] = useState<Producto | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false); // Para mostrar/ocultar los filtros avanzados
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [showModal, setShowModal] = useState(false);

  // const formRefs = useProductoFormRefs();

  const columns: TableColumn[] = [
    {
      key: "SKU",
      label: t("sku"),
      sortable: true,
      width: "5%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
    },
    {
      key: "nombreProducto",
      label: t("name"),
      sortable: true,
      width: "22%",
      align: "left",
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-lg",
      render: (value: string) => (
        <div className="text-left text-lg" style={{ fontSize: "1rem" }}>
          {value}
        </div>
      ),
    },
    {
      key: "descripcion",
      label: t("descriptionp"),
      sortable: false,
      width: "35%",
      align: "left",
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-lg",
      render: (value: string) => (
        <div className="text-left text-sm" style={{ fontSize: "1rem" }}>
          {value}
        </div>
      ),
    },
    {
      key: "categoria",
      label: t("category"),
      sortable: true,
      width: "8%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
    },
    {
      key: "estado",
      label: t("status"),
      sortable: true,
      width: "8%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (value: number, row: Producto) => (
        <div className="flex items-center gap-2 justify-center">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={value === 1}
              onChange={() => handleStatusToggle(row.id, value)}
              disabled={updatingStatus.has(row.id)}
            />
            <div
              className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                value === 1
                  ? "peer-checked:bg-[#cc3399] bg-[#cc3399]"
                  : "peer-checked:bg-gray-300 bg-gray-300"
              }`}
            ></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
          </label>
          <span
            className={`ml-2 text-xs font-medium ${
              value === 1 ? "text-green-700" : "text-gray-500"
            }`}
          >
            {value === 1 ? t("active") : t("inactive")}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      sortable: false,
      width: "10%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (value: any, row: Producto) =>
        ["bouquete", "consumer bounch"].includes(
          row.categoria.toLowerCase()
        ) ? (
          <button
            onClick={() => handleViewProduct(row)}
            style={{ background: "#FFFFFF" }}
          >
            <Eye style={{ color: "#cc3399" }} size={20} />
          </button>
        ) : null,
    },
  ];

  const loadProductos = async () => {
    try {
      setLoading(true);
      // Preparar parámetros de búsqueda
      const searchParams: {
        estado?: boolean;
        categoria?: string;
        tipos_flores?: string;
        variedades_flores?: string;
        colores_flores?: string;
        calibres_flores?: string;
      } = {};

      // Agregar parámetros solo si tienen valor
      if (estadoFiltro === "activos") searchParams.estado = true;
      if (estadoFiltro === "inactivos") searchParams.estado = false;
      if (categoriaFiltro.length > 0)
        searchParams.categoria = categoriaFiltro
          .map((c: any) => c.value)
          .join(",");
      if (tiposFloresFiltro.length > 0)
        searchParams.tipos_flores = tiposFloresFiltro
          .map((c: any) => c.value)
          .join(",");
      if (variedadesFiltro.length > 0)
        searchParams.variedades_flores = variedadesFiltro
          .map((c: any) => c.value)
          .join(",");
      if (coloresFiltro.length > 0)
        searchParams.colores_flores = coloresFiltro
          .map((c: any) => c.value)
          .join(",");
      if (calibresFiltro.length > 0)
        searchParams.calibres_flores = calibresFiltro
          .map((c: any) => c.value)
          .join(",");

      const data = await productoService.buscarPorFlores(searchParams);

      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, [
    estadoFiltro,
    categoriaFiltro,
    tiposFloresFiltro,
    variedadesFiltro,
    coloresFiltro,
    calibresFiltro,
  ]);

  const filteredProductos = productosList.filter((producto) =>
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

  // Función para extraer el número del SKU para ordenamiento
  const extractSKUNumber = (sku: string): number => {
    // Buscar el número después del último guión
    const parts = sku.split("-");
    if (parts.length >= 2) {
      const numberPart = parts[parts.length - 1]; // Tomar la última parte después del guión
      const number = parseInt(numberPart) || 0;
      return number;
    }
    return 0;
  };

  // Ordenar por número de SKU de forma ascendente
  const sortedProductos = [...filteredProductos].sort((a, b) => {
    const numberA = extractSKUNumber(a.SKU);
    const numberB = extractSKUNumber(b.SKU);
    return numberA - numberB; // Orden ascendente (0001, 0002, 0003...)
  });

  const totalPages = Math.ceil(sortedProductos.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedProductos = sortedProductos.slice(startIndex, endIndex);

  const handleStatusToggle = async (id: number, currentStatus: number) => {
    try {
      // Agregar el ID al conjunto de productos que están siendo actualizados
      setUpdatingStatus((prev) => new Set(prev).add(id));

      // Convertir de número (0/1) a booleano
      const newStatus = currentStatus === 0;

      // Llamar al servicio para actualizar el estado
      await productoService.updateStatus(id, newStatus);

      // Actualizar el estado local del producto inmediatamente (optimistic update)
      setProductos((prevProductos) =>
        prevProductos.map((producto) =>
          producto.id === id
            ? { ...producto, estado: newStatus ? 1 : 0 }
            : producto
        )
      );
    } catch (err: any) {
      console.error("Error al actualizar estado del producto:", err);
    } finally {
      // Remover el ID del conjunto de productos que están siendo actualizados
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Cuando se crea o edita un producto, recargar la lista y cerrar el formulario
  const handleProductoCreated = async () => {
    await loadProductos();
    setEditProducto(null);
    setShowForm(false);
  };

  // Para nuevos productos: recargar directamente
  const handleProductCreated = async () => {
    await loadProductos();
  };

  const handleShowTable = async () => {
    // Al mostrar la tabla, recargar los datos
    await loadProductos();
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditProducto(null);
  };

  const handleViewProduct = (producto: Producto) => {
    setSelectedProduct(producto);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <div
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{
          fontFamily:
            "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
       <div
  className="px-2 py-2 sm:px-8"
  style={{
    background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)",
  }}
>
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
    <div className="min-w-0">
      <h2
        className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 min-w-0 truncate"
        style={{
          fontFamily:
            "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <span role="img" aria-label="flower" className="shrink-0">
  💐
</span>
        <span className="truncate">{t("titlep")}</span>
      </h2>
    </div>
    {/* Buscador y botón crear producto */}
    <div className="flex flex-wrap gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end min-w-0">
      {!showForm && (
        <>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value);
              setPage(1);
            }}
            className="flex-1 min-w-0 sm:w-40 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
          >
            <option value="todos">{t("todos")}</option>
            <option value="activos">{t("activos")}</option>
            <option value="inactivos">{t("inactivos")}</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
            style={{
              background: "#cc3399",
              color: "#fff",
              fontFamily:
                "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
            }}
            aria-label={t("productos.fileters")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 6h18M6 12h12M9 18h6"
              />
            </svg>
            <span className="sm:ml-1">{showFilters ? "▲" : "▼"}</span>
          </button>
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 min-w-0 sm:w-64 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
          />
        </>
      )}
      <button
        onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditProducto(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            setEditProducto(null);
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
        style={{
          background: "#cc3399",
          color: "#fff",
          fontFamily:
            "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        {showForm ? t("table") : t("add")}
      </button>
    </div>
  </div>
</div>
        {/* Panel de filtros avanzados */}
        {!showForm && (
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showFilters ? "max-h-96 py-4" : "max-h-0"
            }`}
          >
            <div className="px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
              {/* Filtro por categoría (multiselect) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("category_p").replace(/\s*\(.*\)/, "")}
                </label>
                <Select
                  isMulti
                  options={categoriasOptions.map((cat) => ({
                    value: cat.nombreCategoria,
                    label: cat.nombreCategoria,
                  }))}
                  value={categoriaFiltro}
                  onChange={(selected) => {
                    setCategoriaFiltro(selected ? selected.slice() : []);
                    setPage(1);
                  }}
                  placeholder=""
                  classNamePrefix="react-select"
                  menuPortalTarget={
                    typeof window !== "undefined"
                      ? window.document.body
                      : undefined
                  }
                  menuPosition="fixed"
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>

              {/* Filtro por tipo de flores (multiselect) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("tipo")}
                </label>
                <Select
                  isMulti
                  options={tiposVariedadOptions.map((tipo) => ({
                    value: tipo.name,
                    label: tipo.name,
                  }))}
                  value={tiposFloresFiltro}
                  onChange={(selected) => {
                    setTiposFloresFiltro(selected ? selected.slice() : []);
                    setPage(1);
                  }}
                  placeholder=""
                  classNamePrefix="react-select"
                  menuPortalTarget={
                    typeof window !== "undefined"
                      ? window.document.body
                      : undefined
                  }
                  menuPosition="fixed"
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>

              {/* Filtro por variedades (multiselect) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("variedad")}
                </label>
                <Select
                  isMulti
                  options={variedadesOptions.map((variedad) => ({
                    value: variedad.name,
                    label: variedad.name,
                  }))}
                  value={variedadesFiltro}
                  onChange={(selected) => {
                    setVariedadesFiltro(selected ? selected.slice() : []);
                    setPage(1);
                  }}
                  placeholder=""
                  classNamePrefix="react-select"
                  menuPortalTarget={
                    typeof window !== "undefined"
                      ? window.document.body
                      : undefined
                  }
                  menuPosition="fixed"
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>

              {/* Filtro por colores (multiselect manual) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("color")}
                </label>
                <Select
                  isMulti
                  options={coloresOptions.map((color) => ({
                    value: color.name,
                    label: color.name,
                  }))}
                  value={coloresFiltro}
                  onChange={(selected) => {
                    setColoresFiltro(selected ? selected.slice() : []);
                    setPage(1);
                  }}
                  placeholder=""
                  classNamePrefix="react-select"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => t("productos.noOptions")}
                  menuPortalTarget={
                    typeof window !== "undefined"
                      ? window.document.body
                      : undefined
                  }
                  menuPosition="fixed"
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>

              {/* Filtro por calibres (multiselect) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("grado")}
                </label>
                <Select
                  isMulti
                  options={calibresOptions.map((calibre) => ({
                    value: calibre.nombre_calibre_tipo,
                    label: calibre.nombre_calibre_tipo,
                  }))}
                  value={calibresFiltro}
                  onChange={(selected) => {
                    setCalibresFiltro(selected ? selected.slice() : []);
                    setPage(1);
                  }}
                  placeholder=""
                  classNamePrefix="react-select"
                  menuPortalTarget={
                    typeof window !== "undefined"
                      ? window.document.body
                      : undefined
                  }
                  menuPosition="fixed"
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>

              {/* Botón para limpiar filtros en la misma fila, con icono de borrador */}
              <div className="flex justify-end items-end pb-1">
                <button
                  onClick={() => {
                    setCategoriaFiltro([]);
                    setTiposFloresFiltro([]);
                    setVariedadesFiltro([]);
                    setColoresFiltro([]);
                    setCalibresFiltro([]);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                  style={{
                    background: "#cc3399",
                    color: "#fff",
                    fontFamily:
                      "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                  }}
                  title={t("productos.clearFilters") || "Limpiar filtros"}
                >
                  {/* Icono de basurero SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12zM10 11v6m4-6v6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Layout principal con formulario y tabla */}
        <div className="flex flex-row items-center transition-all duration-300">
          {/* Columna principal: Formulario y tabla */}
          <div className="flex-1 transition-all duration-300">
            {/* Tabla de Productos: visible solo si no se está mostrando el formulario */}
            <div
              className={`transition-all duration-300 ${
                showForm ? "max-h-0 overflow-hidden" : "max-h-none"
              } mt-0 block`}
              style={!showForm ? {} : {}}
            >
              <div
                className="space-y-4 overflow-y-auto"
                style={{ maxHeight: "80vh" }}
              >
                <div className="relative">
                  {/* Botón Excel en la esquina superior derecha, fuera de la tabla 
                  <button
                    onClick={handleExportExcel}
                    className="absolute top-1 right-2 flex items-center justify-center shadow-none"
                    style={{
                      border: "none",
                      boxShadow: "none",
                      background: "transparent",
                      outline: "none",
                      width: "48px",
                      height: "48px",
                      minWidth: "48px",
                      minHeight: "48px",
                      zIndex: 0,
                      padding: 0,
                      margin: 0,
                      display: "flex", // Asegura flexbox
                      alignItems: "center", // Centra verticalmente
                      justifyContent: "center", // Centra horizontalmente
                      WebkitTapHighlightColor: "transparent", // Quita highlight en mobile
                    }}
                    title="Exportar a Excel"
                  >
                    <img
                      src={excelIcon}
                      alt="Excel"
                      style={{
                        width: "32px", // Tamaño fijo o usa "80%" para responsivo
                        height: "32px",
                        objectFit: "contain",
                        display: "block",
                        margin: "auto", // Centra dentro del botón
                      }}
                    />
                  </button>*/}
                  <GenericTable
                    data={paginatedProductos}
                    columns={columns}
                    loading={loading}
                    error=""
                    showActions={false}
                    search={search}
                    setSearch={setSearch}
                    hideSearch={true}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    showPagination={true}
                    emptyMessage={search ? t("noResults") : t("noData")}
                    actionColumnLabel={t("actions")}
                  />
                </div>
              </div>
            </div>
            {/* Formulario de Producto */}
            <div
              className={`transition-all duration-300 ${
                showForm ? "max-h-none" : "max-h-0 overflow-hidden"
              }`}
              style={showForm ? { maxHeight: "80vh", overflowY: "auto" } : {}}
            >
              {showForm && (
                <div>
                  {/* Eliminar el botón/icono de cerrar, ya no es necesario */}
                  <ProductoForm
                    onSubmit={handleProductoCreated}
                    initialData={editProducto}
                    onCancel={handleCancelForm}
                    onProductCreated={handleProductCreated}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Modal para ver producto */}
        {showModal && selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default ProductosPage;
