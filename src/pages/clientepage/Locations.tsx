import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
// import ClienteStepsHeader from "../../components/ClienteStepsHeader";
import WizartLocation from "../../components/wizards/WizartLocation";
import { getLocaciones, updateLocacionStatus } from "../../services/entidadesService";
import { API_ENDPOINTS } from "../../constants/api";

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

const Locations: React.FC = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [locaciones, setLocaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editLocation, setEditLocation] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>(
    {}
  );
  const isMobile = useIsMobile();

  // El wizard solo se abre al presionar el botón agregar o editar

  // Crear refs para los campos del formulario de location
  const nombreLocation = React.useRef<HTMLInputElement>(null);
  const codigoLocation = React.useRef<HTMLInputElement>(null);

  // Configuración de columnas para la tabla genérica - centradas como el original
  const handleStatusChange = async (location: any) => {
    setStatusLoading((prev) => ({ ...prev, [location.id]: true }));
    try {
      await updateLocacionStatus(location.id, !(location.estado === 1 || location.estado === true));
      location.estado = !(location.estado === 1 || location.estado === true);
      setLocaciones((prev) =>
        prev.map((l) =>
          l.id === location.id ? { ...l, estado: location.estado } : l
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado de la locación");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [location.id]: false }));
    }
  };

  const locationsColumns: TableColumn[] = [
    {
      key: "codigolocacion",
      label: t("code"),
      render: (value, row) => value || row.codigo || row.code || "",
      width: "25%",
      align: "left",
    },
    {
    key: "moneda",
    label: t("moneda"),
    render: (value, row) => value || row.moneda || row.cambioMoneda || "",
    width: "15%",
    align: "left",
  },
  {
    key: "metodoPago",
    label: t("metodo_pago"),
    render: (value, row) => value || row.metodoPago || "",
    width: "20%",
    align: "left",
  },
   {
    key: "porcentaje",
    label: t("porcentaje"),
    render: (value, row) => (value !== undefined ? `${value}` : ""),
    width: "10%",
    align: "left",
  },
    {
      key: "nombre",
      label: t("location"),
      render: (value, row) => value || row.name || "",
      width: "40%",
      align: "left",
    },
    {
      key: "estado",
      label: t("common.status", "Estado"),
      width: "20%",
      align: "left",
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
            {value === 1 || value === true ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      ),
    },
  ];

  const fetchLocaciones = () => {
    setLoading(true);
    getLocaciones()
      .then((data) => {
        setLocaciones(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(() => setError(t("common.locations.error")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLocaciones();
  }, []);

  // Llamar esto después de agregar una locación
  const handleLocationAdded = () => {
    fetchLocaciones();
  };

  const handleOpenWizard = () => {
    setEditLocation(null);
    setWizardOpen(true);
  };

  // Abrir wizard en modo edición
  const handleEditLocation = (location: any) => {
    setEditLocation(location);
    setWizardOpen(true);
  };

  // Filtrar locations basado en búsqueda
  const filteredLocations = locaciones.filter(
    (location) =>
      (location.nombre || location.name || "")
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      (location.codigolocacion || location.codigo || location.code || "")
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredLocations.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedLocations = filteredLocations.slice(
    startIndex,
    startIndex + perPage
  );

  // Opcional: función para guardar datos al salir del campo
  const handleAutoSave = () => {
    // Aquí puedes manejar el guardado si lo necesitas
  };

  // Ref para el contenedor principal de la tabla y controles
  const mainContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  // Actualizar la altura cada vez que cambie la paginación o el número de registros
  useEffect(() => {
    if (mainContainerRef.current) {
      setContainerHeight(mainContainerRef.current.offsetHeight);
    }
  }, [paginatedLocations.length, perPage, loading]);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-full pl-0 pr-4">
        <div className={`flex ${!isMobile ? "flex-row items-stretch" : "flex-col"} flex-wrap relative`}>
          <div className="bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full h-full min-h-full flex flex-col" ref={mainContainerRef}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-start order-2 sm:order-1">
                <input
                  type="text"
                  placeholder={t("search_location")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                />
              </div>
              <div className="flex-1 flex justify-center items-center order-1 sm:order-2">
                <h3 className="text-xl font-semibold text-gray-800 text-center">
                  {t("title_location")}
                </h3>
              </div>
              {/* Botón agregar (siempre visible, como en vendedores) */}
              <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                <button
                  onClick={() => {
                    setEditLocation(null);
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
                  <Plus size={20} color="#fff" />
                  {t("add")}
                </button>
              </div>
            </div>

            {/* Tabla Genérica (desktop) */}
            <div className="hidden sm:block">
              <GenericTable
                data={paginatedLocations}
                columns={locationsColumns}
                loading={loading}
                error={error}
                onEdit={handleEditLocation}
                showActions={true}
                hideSearch={true}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                perPage={perPage}
                setPerPage={setPerPage}
                showPagination={true}
                emptyMessage={t("common.locations.noData")}
                actionColumnLabel={t("actions")}
              />
            </div>
            {/* Cards para mobile */}
            <div className="block sm:hidden">
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500">
                    {t("common.loading")}
                  </p>
                ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
                ) : paginatedLocations.length === 0 ? (
                  <p className="text-center text-gray-500">
                    {t("common.locations.noData")}
                  </p>
                ) : (
                  paginatedLocations.map((location) => (
                    <div
                      key={location.id}
                      className="bg-white shadow rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h4 className="font-semibold text-lg text-pink-700">
                            {location.nombre || location.name || ""}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {location.codigolocacion ||
                              location.codigo ||
                              location.code ||
                              ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleEditLocation(location)}
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
          </div>
          {/* Wizard solo aparece al presionar agregar o editar, y no toma el tamaño de la tabla */}
          {wizardOpen && (
            <div className="w-full md:w-[400px] flex-shrink-0 h-[calc(100vh-100px)] overflow-auto">
              <WizartLocation
                showWizard={wizardOpen}
                setShowWizard={setWizardOpen}
                refs={{ nombreLocation, codigoLocation }}
                handleAutoSave={handleAutoSave}
                onCreated={handleLocationAdded}
                editLocation={editLocation}
                
                onClose={() => {
                  if (isMobile) setWizardOpen(false);
                  setEditLocation(null);
                }}
                hideCloseButton={false} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Locations;
