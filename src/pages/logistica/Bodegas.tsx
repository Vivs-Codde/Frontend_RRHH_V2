import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2 } from "lucide-react";
import Layout from "../../components/Layout";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import { WizardBodega } from "../../components/wizards/bodegas/WizardBodega";
import { useBodegaFormRefs } from "../../hooks/useBodegaFormRefs";
import { bodegaService } from "../../services/bodegaService";
import type { Bodega } from "../../types/bodega";

const BodegasPage: React.FC = () => {
  const { t } = useTranslation();
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showWizard, setShowWizard] = useState(false);
  const [editBodega, setEditBodega] = useState<Bodega | null>(null);
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>({});

  // Refs para el formulario
  const formRefs = useBodegaFormRefs();

  // Filtrar bodegas
  const filteredBodegas = bodegas.filter((bodega) =>
    bodega.codigo.toLowerCase().includes(search.toLowerCase()) ||
    bodega.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredBodegas.length / perPage);
  const paginatedBodegas = filteredBodegas.slice(
    (page - 1) * perPage,
    page * perPage
  );
const mainContainerRef = React.useRef<HTMLDivElement>(null);
const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

useEffect(() => {
  if (mainContainerRef.current) {
    setContainerHeight(mainContainerRef.current.offsetHeight);
  }
}, [bodegas.length, perPage, loading]);
  // Configuración de columnas
  const columns: TableColumn[] = [
    {
      key: "codigo",
      label: t("code"),
      sortable: true,
      width: "25%",
      align: "center" as const
    },
    {
      key: "nombre",
      label: t("name"),
      sortable: true,
      width: "50%",
      align: "center" as const
    },
    {
      key: "status",
      label: t("status"),
      sortable: true,
      width: "25%",
      align: "center" as const,
      render: (value: boolean, row: Bodega) => (
        <div className="flex items-center gap-2 justify-center">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!value}
              onChange={() => handleStatusChange(row)}
              disabled={statusLoading[row.id]}
            />
            <div
              className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                value
                  ? 'peer-checked:bg-[#cc3399] bg-[#cc3399]'
                  : 'peer-checked:bg-gray-300 bg-gray-300'
              }`}
            ></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
          </label>
          <span
            className={`ml-2 text-xs font-medium ${
              value ? 'text-green-700' : 'text-gray-500'
            }`}
          >
            {value ? t("active") : t("inactive")}
          </span>
        </div>
      )
    }
  ];

  // Cargar bodegas
  const loadBodegas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await bodegaService.getAll();
      setBodegas(data); // status como booleano
    } catch (err: any) {
      console.error("Error al cargar bodegas:", err);
      setError(err.message || "Error al cargar las bodegas");
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadBodegas();
  }, []);

  // Manejar creación
  const handleCreate = () => {
    setEditBodega(null);
    setShowWizard(true);
  };

  // Manejar edición (igual que aerolíneas: sin loading, usa datos ya cargados)
  const handleEdit = (bodega: Bodega) => {
    setEditBodega(bodega);
    setShowWizard(true);
  };

  // Cambiar estado de bodega
  const handleStatusChange = async (bodega: Bodega) => {
    setStatusLoading((prev) => ({ ...prev, [bodega.id]: true }));
    try {
      await bodegaService.updateStatus(bodega.id, !bodega.status);
      setBodegas((prev) =>
        prev.map((b) =>
          b.id === bodega.id ? { ...b, status: !bodega.status } : b
        )
      );
    } catch (e) {
      alert('Error al cambiar el estado de la bodega');
    } finally {
      setStatusLoading((prev) => ({ ...prev, [bodega.id]: false }));
    }
  };

  // Manejar eliminación
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar esta bodega?")) {
      return;
    }

    try {
      await bodegaService.delete(id);
      await loadBodegas();
    } catch (error) {
      console.error("Error deleting bodega:", error);
      alert("Error al eliminar la bodega");
    }
  };

  // Manejar creación/actualización exitosa
  const handleBodegaCreated = () => {
    loadBodegas();
    setEditBodega(null);
  };

  // Manejar cierre del wizard
  const handleCloseWizard = () => {
    setShowWizard(false);
    setEditBodega(null);
  };

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

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-full pl-0 pr-4">
        <div className={`flex ${!isMobile ? "flex-row items-start min-h-screen" : "flex-col"} flex-wrap relative`}>
          {/* Tabla desktop */}
          <div className={!isMobile ? "hidden sm:block flex-1 max-w-[calc(100%-400px)]" : "hidden sm:block w-full"}>
            <div
  className="bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full h-full min-h-full flex flex-col"
  ref={mainContainerRef}
>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-start order-2 sm:order-1">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholderB")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                  />
                </div>
                <div className="flex-1 flex justify-center items-center order-1 sm:order-2">
                  <h3 className="text-xl font-semibold text-gray-800 text-center">
                    {t("titleB")}
                  </h3>
                </div>
                {/* Solo mostrar el botón agregar en mobile */}
                {isMobile ? (
                  <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                    <button
                      onClick={handleCreate}
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
                ) : null}
              </div>
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              <GenericTable
                data={paginatedBodegas}
                columns={columns}
                loading={loading}
                error={error}
                onEdit={handleEdit}
                onDelete={undefined}
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
          </div>
          {/* Cards para mobile */}
          <div className="block sm:hidden w-full">
            <div className="bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full">
              <div className="w-full flex justify-center items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 text-center w-full" style={{ letterSpacing: 0.5 }}>
                  {t("titleB")}
                </h3>
              </div>
              <div className="flex flex-col mb-2 gap-2 w-full">
                <input
                  type="text"
                  placeholder={t("searchPlaceholderB")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                />
                <button
                  onClick={handleCreate}
                  className="w-full px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
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
              {/* Cards con scroll */}
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500">{t("common.loading")}</p>
                ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
                ) : paginatedBodegas.length === 0 ? (
                  <p className="text-center text-gray-500">{t("emptyMessage")}</p>
                ) : (
                  paginatedBodegas.map((bodega) => (
                    <div key={bodega.id} className="bg-white shadow rounded-lg p-4 relative">
                      <div className="flex flex-col gap-1 mb-2">
                        <h4 className="font-semibold text-lg text-pink-700">{bodega.nombre}</h4>
                        <p className="text-xs text-gray-500">{bodega.codigo}</p>
                        <div className="flex flex-col items-center justify-center mt-2">
                          <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={!!bodega.status}
                                onChange={() => handleStatusChange(bodega)}
                                disabled={statusLoading[bodega.id]}
                              />
                              <div
                                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                                  bodega.status
                                    ? 'peer-checked:bg-[#cc3399] bg-[#cc3399]'
                                    : 'peer-checked:bg-gray-300 bg-gray-300'
                                }`}
                              ></div>
                              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                            </label>
                            <span
                              className={`ml-2 text-xs font-medium ${
                                bodega.status ? 'text-green-700' : 'text-gray-500'
                              }`}
                            >
                              {bodega.status ? t("active") : t("inactive")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="absolute bottom-2 right-2"
                        onClick={() => handleEdit(bodega)}
                        aria-label={t("edit")}
                        style={{ color: "#cc3399", background: "none", border: "none" }}
                      >
                        <Edit2 size={22} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Wizard siempre presente al lado de la tabla en desktop */}
         <div className={!isMobile ? "w-[400px] flex-shrink-0 h-[calc(100vh-100px)] overflow-auto ml-6" : showWizard ? "w-full md:w-[400px] flex-shrink-0" : "hidden"}>
            <WizardBodega
              showWizard={showWizard || !isMobile}
              setShowWizard={setShowWizard}
              refs={formRefs}
              onCreated={handleBodegaCreated}
              editBodega={editBodega}
              onClose={handleCloseWizard}
              hideCloseButton={!isMobile}
              tableHeight={containerHeight} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BodegasPage;
