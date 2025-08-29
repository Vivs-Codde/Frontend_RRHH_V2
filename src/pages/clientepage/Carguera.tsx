import React, { useEffect, useState } from "react";
import { Edit2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
// import ClienteStepsHeader from "../../components/ClienteStepsHeader";
import WizardCarguera from "../../components/wizards/WizardCarguera";
import { getCargueras, updateCargueraStatus } from "../../services/entidadesService";

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

// Hook para detectar si es pantalla grande (ejemplo: >=1200px)
function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(false);
  useEffect(() => {
    const check = () => setIsLarge(window.innerWidth >= 1200);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isLarge;
}

const Carguera: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isLargeScreen = useIsLargeScreen();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [cargueras, setCargueras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editCarguera, setEditCarguera] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>({});
  
  // Ya no se abre automáticamente el wizard en desktop

  // Crear refs para los campos del formulario de carguera
  const nombreCarguera = React.useRef<HTMLInputElement>(null);
  const rucCarguera = React.useRef<HTMLInputElement>(null);
  const contactoCarguera = React.useRef<HTMLInputElement>(null);
  const telefonoCarguera = React.useRef<HTMLInputElement>(null);
  const emailCarguera = React.useRef<HTMLInputElement>(null);
  const representanteCarguera = React.useRef<HTMLInputElement>(null);
  const origenCarguera = React.useRef<HTMLSelectElement>(null);
  const estadoCarguera = React.useRef<HTMLSelectElement>(null);

  // Configuración de columnas para la tabla genérica
  const carguerasColumns: TableColumn[] = [
    { key: 'nombre', label: t("form.name") },
    { key: 'ruc', label: t("form.ruc") },
    { key: 'contacto', label: t("form.contact") },
    { key: 'telefono', label: t("form.phone") },
    { key: 'email', label: t("form.email") },
    {
      key: "estado",
      label: t("form.status", "Estado"),
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

  const fetchCargueras = () => {
    setLoading(true);
    getCargueras()
      .then((data) => {
        setCargueras(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(() => setError(t("messages.error")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCargueras();
  }, []);

  const handleOpenWizard = () => {
    setEditCarguera(null);
    setWizardOpen(true);
  };

  // Abrir wizard en modo edición
  const handleEditCarguera = (carguera: any) => {
    setEditCarguera(carguera);
    setWizardOpen(true);
  };

  // Manejar eliminación de carguera
  const handleDeleteCarguera = (id: number) => {
    if (window.confirm(t("common.carguera.confirmDelete"))) {
      setCargueras(cargueras.filter(c => c.id !== id));
    }
  };

  // Cambiar estado de carguera
  const handleStatusChange = async (carguera: any) => {
    setStatusLoading((prev) => ({ ...prev, [carguera.id]: true }));
    try {
      await updateCargueraStatus(carguera.id, !(carguera.estado === 1 || carguera.estado === true));
      carguera.estado = !(carguera.estado === 1 || carguera.estado === true);
      setCargueras((prev) =>
        prev.map((c) =>
          c.id === carguera.id ? { ...c, estado: carguera.estado } : c
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado de la carguera");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [carguera.id]: false }));
    }
  };

  // Filtrar cargueras basado en búsqueda
  const filteredCargueras = cargueras.filter(carguera =>
    carguera.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    carguera.ruc?.toLowerCase().includes(search.toLowerCase()) ||
    carguera.tipo?.toLowerCase().includes(search.toLowerCase()) ||
    carguera.contacto?.toLowerCase().includes(search.toLowerCase()) ||
    carguera.telefono?.toLowerCase().includes(search.toLowerCase()) ||
    carguera.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredCargueras.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedCargueras = filteredCargueras.slice(startIndex, startIndex + perPage);

  // Opcional: función para guardar datos al salir del campo
  const handleAutoSave = () => {
    // Aquí puedes manejar el guardado si lo necesitas
  };

  // Manejar cierre del wizard
  const handleCloseWizard = () => {
    if (isMobile) setWizardOpen(false);
    setEditCarguera(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-full pl-0 pr-4">
        <div className={`flex ${isLargeScreen ? "flex-row items-start min-h-screen" : "flex-col"} flex-wrap relative gap-4`}>
          <div className={isLargeScreen
  ? wizardOpen
    ? "bg-white rounded-lg shadow-md p-4 flex-1 ml-0 max-w-[calc(100%-400px)] h-full min-h-full flex flex-col overflow-auto"
    : "bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full h-full min-h-full flex flex-col"
  : "bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full h-full min-h-full flex flex-col"
}>
            {/* ...existing code... */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
              {/* ...existing code... */}
              <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-start order-2 sm:order-1">
                <input
                  type="text"
                  placeholder={t("form.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                />
              </div>
              {/* Título centrado */}
              <div className="flex-1 flex justify-center items-center order-1 sm:order-2">
                <h3 className="text-xl font-semibold text-gray-800 text-center">
                  {t("form.title_carguera")}
                </h3>
              </div>
              {/* Botón agregar visible en todas las vistas */}
              <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                <button
                  onClick={() => {
                    setEditCarguera(null);
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
                  {t("form.add")}
                </button>
              </div>
            </div>
            {/* ...existing code... */}
            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {/* Tabla de cargueras (desktop) */}
            <div className="hidden sm:block">
              <GenericTable
                data={paginatedCargueras}
                columns={carguerasColumns}
                loading={loading}
                error={error}
                onEdit={handleEditCarguera}
                showActions={true}
                hideSearch={true}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                perPage={perPage}
                setPerPage={setPerPage}
                showPagination={true}
                emptyMessage={t("common.noResults")}
                actionColumnLabel={t("form.action")}
              />
            </div>
            {/* Cards para mobile */}
            <div className="block sm:hidden">
              {/* ...existing code... */}
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500">{t("common.loading")}</p>
                ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
                ) : paginatedCargueras.length === 0 ? (
                  <p className="text-center text-gray-500">{t("common.carguera.noData")}</p>
                ) : (
                  paginatedCargueras.map((carguera) => (
                    <div key={carguera.id} className="bg-white shadow rounded-lg p-4 relative">
                      <div className="flex flex-col gap-1 mb-2">
                        <h4 className="font-semibold text-lg text-pink-700">{carguera.nombre}</h4>
                        <p className="text-xs text-gray-500">{carguera.ruc}</p>
                        <p className="text-xs text-gray-500">{carguera.tipo}</p>
                        <p className="text-xs text-gray-500">{carguera.contacto}</p>
                        <p className="text-xs text-gray-500">{carguera.telefono}</p>
                        <p className="text-xs text-gray-500">{carguera.email}</p>
                        <div className="flex flex-col items-center justify-center mt-2">
                          <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={carguera.estado === 1 || carguera.estado === true}
                                onChange={() => handleStatusChange(carguera)}
                                disabled={statusLoading[carguera.id]}
                              />
                              <div
                                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                                  carguera.estado === 1 || carguera.estado === true
                                    ? "peer-checked:bg-[#cc3399] bg-[#cc3399]"
                                    : "peer-checked:bg-gray-300 bg-gray-300"
                                }`}
                              ></div>
                              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                            </label>
                            <span
                              className={`ml-2 text-xs font-medium ${
                                carguera.estado === 1 || carguera.estado === true ? "text-green-700" : "text-gray-500"
                              }`}
                            >
                              {carguera.estado === 1 || carguera.estado === true ? t("common.active", "Activo") : t("common.inactive", "Inactivo")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="absolute bottom-2 right-2"
                        onClick={() => handleEditCarguera(carguera)}
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
          {/* Wizard Component visible según pantalla */}
          {wizardOpen && (
            <div className={isLargeScreen ? "w-[400px] flex-shrink-0 h-[calc(100vh-100px)] overflow-auto" : "w-full md:w-[400px] flex-shrink-0"}>
              <WizardCarguera
                showWizard={wizardOpen}
                setShowWizard={setWizardOpen}
                refs={{
                  nombreCarguera,
                  rucCarguera,
                  contactoCarguera,
                  telefonoCarguera,
                  emailCarguera,
                  representanteCarguera,
                  origenCarguera,
                  estadoCarguera,
                }}
                handleAutoSave={handleAutoSave}
                onCreated={fetchCargueras}
                editCarguera={editCarguera}
                onClose={handleCloseWizard}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Carguera;
