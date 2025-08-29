import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2 } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import WizardLineaAerea from "../../components/wizards/lineasaereas/WizardLineaAerea";
import { useLineaAereaFormRefs } from "../../hooks/useLineaAereaFormRefs";
import { lineaAereaService } from "../../services/lineaAereaService";
import type { LineaAerea } from "../../types/lineaAerea";

// Hook para detectar si es móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

const LineasAereasPage: React.FC = () => {
  const { t } = useTranslation();
  const [lineasAereas, setLineasAereas] = useState<LineaAerea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editLineaAerea, setEditLineaAerea] = useState<LineaAerea | null>(null);
  const isMobile = useIsMobile();
  const [showWizard, setShowWizard] = useState(!isMobile ? true : false);

  useEffect(() => {
    setShowWizard(!isMobile ? true : false);
  }, [isMobile]);

  // Refs para el formulario
  const formRefs = useLineaAereaFormRefs();

  // Cargar líneas aéreas con paginación real
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
const mainContainerRef = React.useRef<HTMLDivElement>(null);
const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

useEffect(() => {
  if (mainContainerRef.current) {
    setContainerHeight(mainContainerRef.current.offsetHeight);
  }
}, [lineasAereas.length, perPage, loading]);
  const loadLineasAereas = async () => {
    try {
      setLoading(true);
      setError("");
      // Usar el servicio centralizado con paginación
      const response = await lineaAereaService.getPaged({
        page,
        per_page: perPage,
        search,
      });
      // La API debe retornar { data, total, last_page, current_page }
      const data = response.data || response;
      setTotalItems(response.total || data.length);
      setTotalPages(response.last_page || 1);
      // Mapear los datos al formato esperado por la tabla
      const mapped = data.map((item: any) => {
        let status = "inactive";
        if (item.estado !== undefined) {
          status = item.estado === 1 ? "active" : "inactive";
        } else if (item.status) {
          if (typeof item.status === "string") {
            if (["Activo", "active", "ACTIVO", "ACTIVE"].includes(item.status)) status = "active";
            else status = "inactive";
          } else {
            status = item.status ? "active" : "inactive";
          }
        }
        return {
          id: item.id,
          code: item.codigo || item.code,
          name: item.nombre || item.name,
          status,
          createdAt: item.created_at || item.createdAt,
          updatedAt: item.updated_at || item.updatedAt
        };
      });
      setLineasAereas(mapped);
    } catch (err: any) {
      console.error("Error al cargar líneas aéreas:", err);
      setError(err.message || "Error al cargar las líneas aéreas");
      setLineasAereas([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos iniciales y cuando cambian page/perPage/search
  useEffect(() => {
    loadLineasAereas();
  }, [page, perPage, search]);

  // Filtrar líneas aéreas por búsqueda
  // Ya no se filtra en frontend, la API lo hace
  // const filteredLineasAereas = lineasAereas;

  // Manejar edición
  const handleEdit = (lineaAerea: LineaAerea) => {
    setEditLineaAerea(lineaAerea);
    setShowWizard(true);
  };

  // Cambiar estado de línea aérea
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>({});
  const handleStatusChange = async (lineaAerea: any) => {
    setStatusLoading((prev) => ({ ...prev, [lineaAerea.id]: true }));
    try {
      await lineaAereaService.updateStatus(lineaAerea.id, lineaAerea.status !== "active");
      const newStatus = lineaAerea.status === "active" ? "inactive" : "active";
      setLineasAereas((prev) =>
        prev.map((l) =>
          l.id === lineaAerea.id ? { ...l, status: newStatus } : l
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado de la línea aérea");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [lineaAerea.id]: false }));
    }
  };

  // Manejar creación/actualización exitosa
  const handleLineaAereaCreated = () => {
    loadLineasAereas();
    setEditLineaAerea(null);
    // No cerrar el wizard automáticamente en móvil, igual que Locations
  };

  // Manejar cierre del wizard
  const handleCloseWizard = () => {
    if (isMobile) setShowWizard(false);
    setEditLineaAerea(null);
  };

  // Definir las columnas de la tabla
  const columns: TableColumn[] = [
    {
      key: "code",
      label: t("code"),
      sortable: true,
      width: "20%",
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: "name",
      label: t("name"),
      sortable: true,
      width: "60%"
    },
    {
      key: "status",
      label: t("status"),
      sortable: true,
      width: "20%",
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2 justify-center">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={value === "active"}
              onChange={() => handleStatusChange(row)}
              disabled={statusLoading[row.id]}
            />
            <div
              className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                value === "active"
                  ? "peer-checked:bg-[#cc3399] bg-[#cc3399]"
                  : "peer-checked:bg-gray-300 bg-gray-300"
              }`}
            ></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
          </label>
          <span
            className={`ml-2 text-xs font-medium ${
              value === "active" ? "text-green-700" : "text-gray-500"
            }`}
          >
            {value === "active" ? t("active") : t("inactive")}
          </span>
        </div>
      ),
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-full pl-0 pr-4">
        <div className={`flex ${!isMobile ? "flex-row" : "flex-col"} flex-wrap relative`}>
         <div
  className="bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full h-full min-h-full flex flex-col"
  ref={mainContainerRef}
>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-start order-2 sm:order-1">
                <input
                  type="text"
                  placeholder={t("searchPlaceholderA")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                />
              </div>
              {/* Título centrado */}
              <div className="flex-1 flex justify-center items-center order-1 sm:order-2">
                <h3 className="text-xl font-semibold text-gray-800 text-center">
                  {t("titleA")}
                </h3>
              </div>
              {/* Botón agregar solo en móvil */}
              {isMobile && (
                <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setEditLineaAerea(null);
                      setShowWizard(true);
                    }}
                    className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                    style={{
                      background: "#cc3399",
                      color: "#fff",
                      fontFamily:
                        "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                    }}
                  >
                    <Plus size={20} />
                    {t("add")}
                  </button>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Tabla de líneas aéreas (desktop) */}
            <div className="hidden sm:block">
              <GenericTable
                data={lineasAereas}
                columns={columns}
                loading={loading}
                error={error}
                onEdit={handleEdit}
                showActions={true}
                search={search}
                setSearch={setSearch}
                hideSearch={true}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                perPage={perPage}
                setPerPage={setPerPage}
                showPagination={true}
                emptyMessage={t("common.noResults")}
                actionColumnLabel={t("actions")}
              />
            </div>
            {/* Cards para mobile */}
            <div className="block sm:hidden">
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500">{t("common.loading")}</p>
                ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
                ) : lineasAereas.length === 0 ? (
                  <p className="text-center text-gray-500">{t("emptyMessage")}</p>
                ) : (
                  lineasAereas.map((lineaAerea) => (
                    <div key={lineaAerea.id} className="bg-white shadow rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h4 className="font-semibold text-lg text-pink-700">{lineaAerea.name}</h4>
                          <p className="text-xs text-gray-500">{lineaAerea.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={lineaAerea.status === "active"}
                              onChange={() => handleStatusChange(lineaAerea)}
                              disabled={statusLoading[lineaAerea.id]}
                            />
                            <div
                              className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                                lineaAerea.status === "active"
                                  ? "peer-checked:bg-[#cc3399] bg-[#cc3399]"
                                  : "peer-checked:bg-gray-300 bg-gray-300"
                              }`}
                            ></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                          </label>
                          <span
                            className={`ml-2 text-xs font-medium ${
                              lineaAerea.status === "active" ? "text-green-700" : "text-gray-500"
                            }`}
                          >
                            {lineaAerea.status === "active" ? t("active") : t("inactive")}
                          </span>
                        </div>
                        <button
                          onClick={() => handleEdit(lineaAerea)}
                          className="text-pink-700 hover:text-pink-900 p-2 rounded-full border border-pink-200 bg-white"
                          title={t("common.edit")}
                          style={{ background: "#fff" }}
                        >
                          <Edit2 size={18} color="#cc3399" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Paginación para mobile */}
            {totalPages > 1 && (
              <div className="block sm:hidden mt-4">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded button-icon-no-bg border border-gray-300 bg-white disabled:opacity-50"
                    style={{ color: page === 1 ? "#ccc" : "#e83e8c" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm px-3">
                    {t("page", { current: page, total: totalPages })}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded button-icon-no-bg border border-gray-300 bg-white disabled:opacity-50"
                    style={{ color: page === totalPages ? "#ccc" : "#e83e8c" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="ml-2 px-2 py-1 border rounded text-sm"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          {/* Wizard Component visible según pantalla */}
          {showWizard && (
           <div className="w-full md:w-[400px] flex-shrink-0 h-full flex ml-4">
              <WizardLineaAerea
                showWizard={showWizard}
                setShowWizard={setShowWizard}
                refs={formRefs}
                onCreated={handleLineaAereaCreated}
                editLineaAerea={editLineaAerea}
                onClose={handleCloseWizard}
                hideCloseButton={!isMobile}
                 tableHeight={containerHeight}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LineasAereasPage;