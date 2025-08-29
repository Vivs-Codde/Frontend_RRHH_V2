import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
// import ClienteStepsHeader from "../../components/ClienteStepsHeader";
import WizartCooler from "../../components/wizards/WizartCooler";
import { getCoolers, updateCoolerStatus } from "../../services/entidadesService";
import { API_ENDPOINTS, getAuthHeaders } from "../../constants/api";

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

const Cooler: React.FC = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [coolers, setCoolers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editCooler, setEditCooler] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>({});
  const [cargueras, setCargueras] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    setWizardOpen(!isMobile ? true : false);
  }, [isMobile]);

  // Crear refs para los campos del formulario de cooler
  const nombreCooler = React.useRef<HTMLInputElement>(null);
  const codigoCooler = React.useRef<HTMLInputElement>(null);
const mainContainerRef = React.useRef<HTMLDivElement>(null);
const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

useEffect(() => {
  if (mainContainerRef.current) {
    setContainerHeight(mainContainerRef.current.offsetHeight);
  }
}, [coolers.length, perPage, loading]);
  // Configuración de columnas para la tabla genérica - centradas como el original
  const coolersColumns: TableColumn[] = [
    { 
      key: 'codigo', 
      label: t("common.cooler.code"),
      render: (value, row) => value || row.code || '',
      width: '25%',
      align: 'center'
    },
    { 
      key: 'nombre', 
      label: t("common.cooler.name"),
      render: (value, row) => value || row.name || '',
      width: '50%',
      align: 'center'
    },
    {
      key: "estado",
      label: t("common.status", "Estado"),
      width: "15%",
      align: "center",
      render: (value, row) => (
        <div className="flex items-center gap-2 justify-center">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={value === 1 || value === true}
              onChange={() => handleStatusChange(row)}
              disabled={statusLoading[row.id]}
            />
            <div
              className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                value === 1 || value === true
                  ? "peer-checked:bg-[#cc3399] bg-[#cc3399]"
                  : "peer-checked:bg-gray-300 bg-gray-300"
              }`}
            ></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
          </label>
          <span
            className={`ml-2 text-xs font-medium ${
              value === 1 || value === true ? "text-green-700" : "text-gray-500"
            }`}
          >
            {value === 1 || value === true ? t("common.active", "Activo") : t("common.inactive", "Inactivo")}
          </span>
        </div>
      ),
    },
  ];

  const fetchCoolers = () => {
    setLoading(true);
    getCoolers()
      .then((data) => {
        setCoolers(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(() => setError(t("common.cooler.error")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoolers();
  }, []);

  // Obtener cargueras al montar
  useEffect(() => {
    fetch(API_ENDPOINTS.CARGUERAS.LIST, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setCargueras(Array.isArray(data) ? data : []))
      .catch(() => setCargueras([]));
  }, []);

  // Llamar esto después de agregar un cooler
  const handleCoolerAdded = () => {
    fetchCoolers();
  };

  const handleOpenWizard = () => {
    setEditCooler(null);
    setWizardOpen(true);
  };

  // Abrir wizard en modo edición
  const handleEditCooler = (cooler: any) => {
    setEditCooler(cooler);
    setWizardOpen(true);
  };

  // Manejar eliminación de cooler
  const handleDeleteCooler = (id: number) => {
    if (window.confirm(t("common.cooler.confirmDelete"))) {
      setCoolers(coolers.filter(c => c.id !== id));
    }
  };

  // Cambiar estado de cooler
  const handleStatusChange = async (cooler: any) => {
    setStatusLoading((prev) => ({ ...prev, [cooler.id]: true }));
    try {
      await updateCoolerStatus(cooler.id, !(cooler.estado === 1 || cooler.estado === true));
      cooler.estado = !(cooler.estado === 1 || cooler.estado === true);
      setCoolers((prev) =>
        prev.map((c) =>
          c.id === cooler.id ? { ...c, estado: cooler.estado } : c
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado del cooler");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [cooler.id]: false }));
    }
  };

  // Filtrar coolers basado en búsqueda
  const filteredCoolers = coolers.filter(cooler =>
    (cooler.nombre || cooler.name || '')?.toLowerCase().includes(search.toLowerCase()) ||
    (cooler.codigo || cooler.code || '')?.toLowerCase().includes(search.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredCoolers.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedCoolers = filteredCoolers.slice(startIndex, startIndex + perPage);

  // Opcional: función para guardar datos al salir del campo
  const handleAutoSave = () => {
    // Aquí puedes manejar el guardado si lo necesitas
  };

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
                    placeholder={t("common.cooler.search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                  />
                </div>
                <div className="flex-1 flex justify-center items-center order-1 sm:order-2">
                  <h3 className="text-xl font-semibold text-gray-800 text-center">
                    {t("common.cooler.title")}
                  </h3>
                </div>
                {/* Solo mostrar el botón agregar en mobile o si el wizard está cerrado en desktop */}
                {isMobile || !wizardOpen ? (
                  <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        setEditCooler(null);
                        setWizardOpen(true);
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
                      {t("common.cooler.add")}
                    </button>
                  </div>
                ) : null}
              </div>
              <GenericTable
                data={paginatedCoolers}
                columns={coolersColumns}
                loading={loading}
                error={error}
                onEdit={handleEditCooler}
                showActions={true}
                hideSearch={true}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                perPage={perPage}
                setPerPage={setPerPage}
                showPagination={true}
                emptyMessage={t("common.cooler.noData")}
                actionColumnLabel={t("common.cooler.actions")}
              />
            </div>
          </div>
          {/* Cards para mobile */}
          <div className="block sm:hidden w-full">
            <div className="bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full">
              <div className="w-full flex justify-center items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 text-center w-full" style={{ letterSpacing: 0.5 }}>
                  {t("common.cooler.title")}
                </h3>
              </div>
              <div className="flex flex-col mb-2 gap-2 w-full">
                <input
                  type="text"
                  placeholder={t("common.cooler.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                />
                <button
                  onClick={() => {
                    setEditCooler(null);
                    setWizardOpen(true);
                  }}
                  className="w-full px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                  style={{
                    background: "#cc3399",
                    color: "#fff",
                    fontFamily:
                      "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                  }}
                >
                  <Plus size={20} />
                  {t("common.cooler.add")}
                </button>
              </div>
              {/* Cards con scroll */}
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500">{t("common.loading")}</p>
                ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
                ) : paginatedCoolers.length === 0 ? (
                  <p className="text-center text-gray-500">{t("common.cooler.noData")}</p>
                ) : (
                  paginatedCoolers.map((cooler) => (
                    <div key={cooler.id} className="bg-white shadow rounded-lg p-4 relative">
                      <div className="flex flex-col gap-1 mb-2">
                        <h4 className="font-semibold text-lg text-pink-700">{cooler.nombre || cooler.name}</h4>
                        <p className="text-xs text-gray-500">{cooler.codigo || cooler.code}</p>
                        <div className="flex flex-col items-center justify-center mt-2">
                          <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={cooler.estado === 1 || cooler.estado === true}
                                onChange={() => handleStatusChange(cooler)}
                                disabled={statusLoading[cooler.id]}
                              />
                              <div
                                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                                  cooler.estado === 1 || cooler.estado === true
                                    ? "peer-checked:bg-[#cc3399] bg-[#cc3399]"
                                    : "peer-checked:bg-gray-300 bg-gray-300"
                                }`}
                              ></div>
                              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                            </label>
                            <span
                              className={`ml-2 text-xs font-medium ${
                                cooler.estado === 1 || cooler.estado === true ? "text-green-700" : "text-gray-500"
                              }`}
                            >
                              {cooler.estado === 1 || cooler.estado === true ? t("common.active", "Activo") : t("common.inactive", "Inactivo")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="absolute bottom-2 right-2"
                        onClick={() => handleEditCooler(cooler)}
                        aria-label={t("common.edit")}
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
         <div className={!isMobile ? "w-[400px] flex-shrink-0 h-[calc(100vh-100px)] overflow-auto ml-6" : wizardOpen ? "w-full md:w-[400px] flex-shrink-0" : "hidden"}>
            <WizartCooler
              showWizard={wizardOpen || !isMobile}
              setShowWizard={setWizardOpen}
              refs={{ nombreCooler, codigoCooler }}
              handleAutoSave={handleAutoSave}
              onCreated={handleCoolerAdded}
              editCooler={editCooler}
              onClose={() => {
                if (isMobile) setWizardOpen(false);
                setEditCooler(null);
              }}
              hideCloseButton={!isMobile}
              selectCarguera={true}
              cargueras={cargueras}
              tableHeight={containerHeight}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cooler;
