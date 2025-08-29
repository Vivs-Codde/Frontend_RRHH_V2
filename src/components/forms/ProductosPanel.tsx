import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { productoService } from "../../services/productoService";
import { API_ENDPOINTS } from "../../constants/api";
import {
  API_CULTIVO_COMBO_TIPO_VARIEDAD_API,
  API_CULTIVO_COMBO_VARIEDAD_API,
  API_CULTIVO_COMBO_CALIBRE_API,
  API_CULTIVO_COMBO_COLOR_API
} from "../../constants/apiCultivo";
import ProductosTable from "./ProductosTable";


interface ProductosPanelProps {
  onExport?: (productosFiltrados: any[]) => void;
}

const ProductosPanel: React.FC<ProductosPanelProps> = ({ onExport }) => {
  const { t } = useTranslation();
  // Filtros y opciones
  const [tiposVariedadOptions, setTiposVariedadOptions] = useState<any[]>([]);
  const [variedadesOptions, setVariedadesOptions] = useState<any[]>([]);
  const [calibresOptions, setCalibresOptions] = useState<any[]>([]);
  const [categoriasOptions, setCategoriasOptions] = useState<any[]>([]);
  const [coloresOptions, setColoresOptions] = useState<any[]>([]);

  // Estados de filtros
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<any[]>([]);
  const [tiposFloresFiltro, setTiposFloresFiltro] = useState<any[]>([]);
  const [variedadesFiltro, setVariedadesFiltro] = useState<any[]>([]);
  const [coloresFiltro, setColoresFiltro] = useState<any[]>([]);
  const [calibresFiltro, setCalibresFiltro] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [productosAll, setProductosAll] = useState<any[]>([]); // todos los productos originales
  const [productos, setProductos] = useState<any[]>([]); // productos filtrados y paginados
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Cargar opciones de selects
  useEffect(() => {
    fetch(API_ENDPOINTS.CATEGORIAS.LIST, { headers: { accept: "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        const categorias = Array.isArray(data) ? data : data.data;
        setCategoriasOptions(Array.isArray(categorias) ? categorias : []);
      })
      .catch(() => setCategoriasOptions([]));
    fetch(API_CULTIVO_COMBO_TIPO_VARIEDAD_API)
      .then((res) => res.json())
      .then((data) => setTiposVariedadOptions(data.data || []))
      .catch(() => setTiposVariedadOptions([]));
    fetch(API_CULTIVO_COMBO_VARIEDAD_API)
      .then((res) => res.json())
      .then((data) => setVariedadesOptions(data.data || []))
      .catch(() => setVariedadesOptions([]));
    fetch(API_CULTIVO_COMBO_CALIBRE_API)
      .then((res) => res.json())
      .then((data) => setCalibresOptions(data.data || []))
      .catch(() => setCalibresOptions([]));
    fetch(API_CULTIVO_COMBO_COLOR_API)
      .then((res) => res.json())
      .then((data) => setColoresOptions(data.data || []))
      .catch(() => setColoresOptions([]));
  }, []);


  // Cargar productos originales con filtros (solo cuando cambian los filtros)
  useEffect(() => {
    setLoading(true);
    const searchParams: any = {};
    if (estadoFiltro === "activos") searchParams.estado = true;
    if (estadoFiltro === "inactivos") searchParams.estado = false;
    if (categoriaFiltro.length > 0) searchParams.categoria = categoriaFiltro.map((c: any) => c.value).join(",");
    if (tiposFloresFiltro.length > 0) searchParams.tipos_flores = tiposFloresFiltro.map((c: any) => c.value).join(",");
    if (variedadesFiltro.length > 0) searchParams.variedades_flores = variedadesFiltro.map((c: any) => c.value).join(",");
    if (coloresFiltro.length > 0) searchParams.colores_flores = coloresFiltro.map((c: any) => c.value).join(",");
    if (calibresFiltro.length > 0) searchParams.calibres_flores = calibresFiltro.map((c: any) => c.value).join(",");
    productoService.buscarPorFlores(searchParams)
      .then((data: any[]) => {
        setProductosAll(Array.isArray(data) ? data : []);
        setPage(1); // Reiniciar página al cambiar filtros
      })
      .catch(() => {
        setProductosAll([]);
        setPage(1);
      })
      .finally(() => setLoading(false));
  }, [estadoFiltro, categoriaFiltro, tiposFloresFiltro, variedadesFiltro, coloresFiltro, calibresFiltro]);

  // Filtrado y paginación local
  useEffect(() => {
    let filtered = productosAll;
    if (search) {
      filtered = productosAll.filter((p) =>
        [
          p.SKU,
          p.nombreProducto,
          p.descripcion,
          p.categoria,
          p.estado?.toString(),
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }
    const total = filtered.length;
    setTotalPages(Math.max(1, Math.ceil(total / perPage)));
    const start = (page - 1) * perPage;
    const end = start + perPage;
    setProductos(filtered.slice(start, end));
  }, [productosAll, search, page, perPage]);

  return (
    <div>
      {/* Filtros avanzados y botón de exportar en la misma fila */}
      <div className="mb-4 bg-gray-50 p-3 rounded flex flex-wrap gap-2 items-end justify-between">
        <div className="flex flex-wrap gap-2 items-end">
          <select
            value={estadoFiltro}
            onChange={(e) => { setEstadoFiltro(e.target.value); setPage(1); }}
            className="min-w-0 sm:w-40 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
          >
            <option value="todos">{t("todos")}</option>
            <option value="activos">{t("active")}</option>
            <option value="inactivos">{t("inactive")}</option>
          </select>
          <Select
            isMulti
            options={categoriasOptions.map((cat: any) => ({ value: cat.nombreCategoria, label: cat.nombreCategoria }))}
            value={categoriaFiltro}
            onChange={(selected) => { setCategoriaFiltro(selected ? selected.slice() : []); setPage(1); }}
            placeholder={t("category")}
            classNamePrefix="react-select"
            menuPortalTarget={typeof window !== "undefined" ? window.document.body : undefined}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
          <Select
            isMulti
            options={tiposVariedadOptions.map((tipo: any) => ({ value: tipo.name, label: tipo.name }))}
            value={tiposFloresFiltro}
            onChange={(selected) => { setTiposFloresFiltro(selected ? selected.slice() : []); setPage(1); }}
            placeholder={t("tipo")}
            classNamePrefix="react-select"
            menuPortalTarget={typeof window !== "undefined" ? window.document.body : undefined}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
          <Select
            isMulti
            options={variedadesOptions.map((variedad: any) => ({ value: variedad.name, label: variedad.name }))}
            value={variedadesFiltro}
            onChange={(selected) => { setVariedadesFiltro(selected ? selected.slice() : []); setPage(1); }}
            placeholder={t("variedad")}
            classNamePrefix="react-select"
            menuPortalTarget={typeof window !== "undefined" ? window.document.body : undefined}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
          <Select
            isMulti
            options={coloresOptions.map((color: any) => ({ value: color.name, label: color.name }))}
            value={coloresFiltro}
            onChange={(selected) => { setColoresFiltro(selected ? selected.slice() : []); setPage(1); }}
            placeholder={t("color")}
            classNamePrefix="react-select"
            menuPortalTarget={typeof window !== "undefined" ? window.document.body : undefined}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
          <Select
            isMulti
            options={calibresOptions.map((calibre: any) => ({ value: calibre.nombre_calibre_tipo, label: calibre.nombre_calibre_tipo }))}
            value={calibresFiltro}
            onChange={(selected) => { setCalibresFiltro(selected ? selected.slice() : []); setPage(1); }}
            placeholder={t("grado")}
            classNamePrefix="react-select"
            menuPortalTarget={typeof window !== "undefined" ? window.document.body : undefined}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-0 sm:w-64 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
          />
          <button
            onClick={() => {
              setCategoriaFiltro([]);
              setTiposFloresFiltro([]);
              setVariedadesFiltro([]);
              setColoresFiltro([]);
              setCalibresFiltro([]);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center bg-[#cc3399] text-white"
            style={{ background: '#cc3399' }}
            title={t("productos.clearFilters") || "Limpiar filtros"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12zM10 11v6m4-6v6" /></svg>
          </button>
        </div>
        {onExport && (
          <button
            onClick={() => onExport(productos)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            style={{ background: '#cc3399' }}
          >
            Exportar Excel
          </button>
        )}
      </div>
      {/* Tabla de productos */}
      <ProductosTable
        productos={productos}
        loading={loading}
        error={""}
        search={search}
        setSearch={setSearch}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        perPage={perPage}
        setPerPage={setPerPage}
      />
    </div>
  );
};

export default ProductosPanel;
