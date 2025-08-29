
import React, { useEffect, useState } from "react";
// Eliminada importación de XLSX ya que no se utiliza
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import { Edit2, Eye } from "lucide-react";
import MaterialViewModal from "./MaterialViewModal";
// @ts-ignore
import excelIcon from "../../assets/exel.jpg";
import FormMateria from "./FormMaterial";
import { getMateriales, createMaterial, patchEstadoMaterial } from "../../services/materialesService";
import { useTranslation } from "react-i18next";
// Utiliza el servicio centralizado para obtener materiales paginados y filtrados desde el backend
async function fetchMaterialesApi({ search = "", page = 1, perPage = 10, estado }: { search?: string; page?: number; perPage?: number; estado?: boolean }) {
  // Solo pasar search, page y perPage. No enviar estado al backend
  const params: any = { search, page, perPage };
  return await getMateriales(params);
}
function MaterialesPage() {
  // Estados para tabla y formulario
  const [showForm, setShowForm] = useState(false);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [totalMateriales, setTotalMateriales] = useState<number>(0);
  const [totalMaterialesAbsoluto, setTotalMaterialesAbsoluto] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("todos"); // "todos", "activos", "inactivos"
  const { t } = useTranslation();
  // Columnas para la tabla
  const [estadoLoading, setEstadoLoading] = useState<{[id: number]: boolean}>({});

  // Estado para el preview de imagen
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState<{x: number, y: number}>({x: 0, y: 0});

  const [editMaterial, setEditMaterial] = useState<any | null>(null);
  const [viewMaterial, setViewMaterial] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const columns: TableColumn[] = [
    {
      key: "imagen_url",
      label: t("imagen") || "Imagen",
      sortable: false,
      width: "1%",
      align: "left",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (value: string, row: any) => (
        value ? (
          <img
            src={value}
            alt={row.nombre || "imagen"}
            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: "1px solid #eee" }}
            onMouseEnter={e => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setPreviewImg(value);
              setPreviewPos({ x: rect.right + 10, y: rect.top });
            }}
            onMouseLeave={() => {
              setPreviewImg(null);
            }}
            title={row.nombre || "imagen"}
          />
        ) : null
      ),
    },
    { key: "sku", label: "SKU", sortable: true, width: "5%", align: "center", cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm" },
    { key: "nombre", label: t("nombre"), sortable: true, width: "10%", align: "left", cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm" },
    { key: "descripcion", label: t("descripcion"), sortable: true, width: "10%", align: "left", cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm" },
    { key: "marca", label: t("marca"), sortable: true, width: "10%", align: "left", cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm" },
    {
      key: "estado",
      label: t("estado"),
      sortable: true,
      width: "8%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (value: boolean, row: any) => (
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!value}
            disabled={!!estadoLoading[row.id]}
            onChange={async () => {
              setEstadoLoading((prev) => ({ ...prev, [row.id]: true }));
              try {
                await patchEstadoMaterial(row.id, !value);
                setMateriales((prev) => prev.map((mat) =>
                  mat.id === row.id ? { ...mat, estado: !value } : mat
                ));
              } catch (e) {
                alert("Error al cambiar el estado");
              } finally {
                setEstadoLoading((prev) => ({ ...prev, [row.id]: false }));
              }
            }}
          />
          <div
            className={`w-11 h-6 ${value ? "bg-[#cc3399]" : "bg-gray-300"} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full transition-colors duration-200`}
          ></div>
          <div
            className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${value ? "translate-x-5" : ""}`}
          ></div>
        </label>
      ),
    },
   
  ];


  // Cargar materiales desde la API con paginación, búsqueda y filtro de estado
  // Obtener el total absoluto de materiales sin filtros
  const fetchTotalMaterialesAbsoluto = async () => {
    try {
      // Petición sin filtros ni estado
      const data = await getMateriales();
      if (typeof data.total === "number") {
        setTotalMaterialesAbsoluto(data.total);
      } else if (Array.isArray(data.data)) {
        setTotalMaterialesAbsoluto(data.data.length);
      }
    } catch {
      setTotalMaterialesAbsoluto(0);
    }
  };

  const fetchMateriales = async () => {
    setLoading(true);
    try {
      const params: any = {
        search,
        page,
        perPage,
      };
      const data = await fetchMaterialesApi(params);
      setMateriales(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.last_page || data.total_pages || 1);
      // Guardar el total real de elementos en la base
      if (typeof data.total === "number") {
        setTotalMateriales(data.total);
      } else if (Array.isArray(data.data)) {
        setTotalMateriales(data.data.length);
      }
    } catch {
      setMateriales([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriales();
    // eslint-disable-next-line
  }, [search, page, perPage, estadoFiltro]);

  // Solo una vez al montar el componente, obtener el total absoluto
  useEffect(() => {
    fetchTotalMaterialesAbsoluto();
  }, []);

  // Filtrar activos/inactivos/todos en el frontend
  let paginatedMateriales = materiales;
  if (estadoFiltro === "activos") {
    paginatedMateriales = materiales.filter((m) => m.estado === true || m.estado === 1);
  } else if (estadoFiltro === "inactivos") {
    paginatedMateriales = materiales.filter((m) => m.estado === false || m.estado === 0);
  }
  const totalFilteredPages = totalPages;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Modal flotante de preview de imagen */}
      {previewImg && (
        <div
          style={{
            position: "absolute",
            left: previewPos.x,
            top: previewPos.y,
            zIndex: 9999,
            background: "rgba(255,255,255,0.98)",
            border: "1px solid #ccc",
            borderRadius: 10,
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
            padding: 8,
            pointerEvents: "none"
          }}
        >
          <img
            src={previewImg}
            alt="preview"
            style={{ maxWidth: 320, maxHeight: 320, borderRadius: 8, display: "block" }}
          />
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-xl" style={{ fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
        <div className="px-2 py-1 sm:px-8" style={{ background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)" }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
                <span role="img" aria-label="tools">🛠️</span>
                {t("materiales")}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
              {!showForm && (
                <>
                  <select
                    value={estadoFiltro}
                    onChange={(e) => {
                      setEstadoFiltro(e.target.value);
                      setPage(1);
                    }}
                    className="w-full sm:w-40 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
                    style={{ minWidth: 0 }}
                  >
                    <option value="todos">{t("todos")}</option>
                    <option value="activos">{t("activos")}</option>
                    <option value="inactivos">{t("inactivos")}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={t("buscar")}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full sm:w-64 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
                    style={{ minWidth: 0 }}
                  />
                </>
              )}
              <button
                onClick={() => {
                  setEditMaterial(null); // Limpiar edición
                  setShowForm((prev) => {
                    const next = !prev;
                    if (next) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    return next;
                  });
                }}
                className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                style={{ background: "#cc3399", color: "#fff", fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}
              >
                {showForm ? t("verTabla") : t("agregar")}
              </button>
            </div>
          </div>
        </div>
        <div className="block sm:flex sm:flex-row sm:items-center transition-all duration-300">
          <div className="transition-all duration-300 w-full">
            {!showForm && (
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "80vh" }}>
                <div className="relative">
                  
                  <GenericTable
                    data={paginatedMateriales}
                    columns={columns}
                    error=""
                    showActions={false}
                    hideSearch={true}
                    page={page}
                    setPage={setPage}
                    totalPages={totalFilteredPages}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    showPagination={true}
                    emptyMessage={search ? "No hay resultados" : "No hay materiales registrados."}
                    actionColumnLabel="Acciones"
                  />
                </div>
              </div>
            )}
            {showForm && (
              <div className="mb-8 mt-6 overflow-y-auto max-h-[80vh]">
                <FormMateria
                  key={editMaterial ? editMaterial.id : 'new'}
                  material={editMaterial}
                  onSaved={() => {
                    setEditMaterial(null);
                    fetchMateriales();
                  }}
                  onCancel={() => {
                    setEditMaterial(null);
                    setShowForm(false);
                  }}
                />
              </div>
            )}
            {/* Modal para ver detalles del material o paquete */}
            {showViewModal && viewMaterial && (
              <MaterialViewModal material={viewMaterial} onClose={() => setShowViewModal(false)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialesPage;
