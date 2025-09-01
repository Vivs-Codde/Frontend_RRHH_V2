import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import WizardFinca from "../../components/wizards/WizardFinca";
import { 
  getFincas, 
  deleteFinca, 
  toggleFincaStatus,
  type Finca as FincaType 
} from "../../services/fincasService";
import { usePermissions } from "../../context/PermissionsContext";

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

const Finca: React.FC = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [fincas, setFincas] = useState<FincaType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editFinca, setEditFinca] = useState<FincaType | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const userPermissions = usePermissions();
  const isMobile = useIsMobile();

  useEffect(() => {
    setWizardOpen(!isMobile ? true : false);
  }, [isMobile]);

  // Crear refs para los campos del formulario de finca
  const nombreFinca = React.useRef<HTMLInputElement>(null);
  const mainContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    if (mainContainerRef.current) {
      setContainerHeight(mainContainerRef.current.offsetHeight);
    }
  }, [fincas.length, perPage, loading]);
  
  // Configuración de columnas para la tabla genérica
  const columns: TableColumn[] = [
    { 
      key: "nombre", 
      label: "Nombre de la Finca",
    },
    {
      key: "estado",
      label: "Estado",
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
              disabled={statusLoading[row.id!]}
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
              value === 1 || value === true
                ? "text-green-700"
                : "text-gray-500"
            }`}
          >
            {value === 1 || value === true
              ? t("common.active", "Activo")
              : t("common.inactive", "Inactivo")}
          </span>
        </div>
      ),
    },
  ];

  // Cargar fincas
  useEffect(() => {
    fetchFincas();
  }, [refreshTrigger]);

  const fetchFincas = () => {
    setLoading(true);
    getFincas()
      .then((response) => {
        setFincas(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setError("");
      })
      .catch(() => setError("Error al cargar las fincas"))
      .finally(() => setLoading(false));
  };

  // Cambiar estado de finca
  const handleStatusChange = async (finca: FincaType) => {
    if (!finca.id) return;
    setStatusLoading((prev) => ({ ...prev, [finca.id!]: true }));
    try {
      await toggleFincaStatus(finca.id);
      // Actualizar el estado en la UI
      finca.estado = !finca.estado;
      setFincas((prev) =>
        prev.map((f) =>
          f.id === finca.id ? { ...f, estado: finca.estado } : f
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado de la finca");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [finca.id!]: false }));
    }
  };

  // Filtrar y paginar fincas
  const filteredFincas = fincas.filter((finca: FincaType) =>
    finca.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación de fincas filtradas
  const paginatedFincas = filteredFincas.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Llamar esto después de agregar o editar una finca
  const handleFincaAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Abrir wizard en modo edición
  const handleEditFinca = (finca: FincaType) => {
    setEditFinca(finca);
    setWizardOpen(true);
  };

  // Función para eliminar finca
  const handleDeleteFinca = (id: number) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };
  
  // Confirmar eliminación de finca
  const confirmDelete = async () => {
    if (deletingId) {
      setLoading(true);
      try {
        await deleteFinca(deletingId);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        setError("Error al eliminar la finca");
      } finally {
        setShowDeleteDialog(false);
        setDeletingId(null);
        setLoading(false);
      }
    }
  };

  // Opcional: función para guardar datos al salir del campo
  const handleAutoSave = () => {
    // Aquí puedes manejar el guardado si lo necesitas
  };

  // Verificar permiso para eliminar finca
  const canDeleteFinca = userPermissions.some(
    (p) => p.action === "eliminar" && p.module === "finca"
  );

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
                  placeholder="Buscar finca..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                />
              </div>
              <div className="flex-1 flex justify-center items-center order-1 sm:order-2">
                <h3 className="text-xl font-semibold text-gray-800 text-center">
                  Gestión de Fincas
                </h3>
              </div>
              {/* Botón agregar solo en móvil */}
              {isMobile && (
                <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setEditFinca(null);
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
                    Agregar Finca
                  </button>
                </div>
              )}
            </div>

            {/* Tabla genérica (solo en pantallas medianas o grandes) */}
            <div className="hidden sm:block">
              <GenericTable
                data={paginatedFincas}
                columns={columns}
                loading={loading}
                error={error}
                onEdit={handleEditFinca}
                onDelete={canDeleteFinca ? handleDeleteFinca : undefined}
                showActions={true}
                search={search}
                setSearch={(s) => {
                  setSearch(s);
                  setPage(1);
                }}
                hideSearch={true} // Ocultamos la búsqueda integrada porque usamos la de arriba
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                perPage={perPage}
                setPerPage={(n) => {
                  setPerPage(n);
                  setPage(1);
                }}
                showPagination={true}
                emptyMessage={
                  search
                    ? "No se encontraron resultados"
                    : "No hay fincas registradas"
                }
                actionColumnLabel="Acciones"
              />
            </div>

            {/* Cards (solo en móviles) */}
            <div className="block sm:hidden">
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    Cargando fincas...
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">{error}</div>
                ) : filteredFincas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {search ? "No se encontraron resultados" : "No hay fincas registradas"}
                  </div>
                ) : (
                  paginatedFincas.map((finca: FincaType, idx: number) => (
                    <div
                      key={finca.id || idx}
                      className="bg-white shadow rounded-lg p-4"
                    >
                      <div className="flex flex-col items-center gap-1 mb-2">
                        <h4
                          className="font-semibold text-lg text-fuchsia-700 text-center break-words w-full"
                          style={{ wordBreak: "break-word" }}
                        >
                          {finca.nombre}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-medium ${
                            finca.estado === true
                              ? "text-green-700"
                              : "text-gray-500"
                          }`}>
                            {finca.estado === true ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleEditFinca(finca)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                        >
                          Editar
                        </button>
                        {canDeleteFinca && (
                          <button
                            onClick={() => handleDeleteFinca(finca.id!)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {/* Paginación para móviles */}
                {!loading && !error && filteredFincas.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-1">
                        Página {page} de {Math.ceil(filteredFincas.length / perPage)}
                      </span>
                      <button
                        onClick={() => setPage(Math.min(Math.ceil(filteredFincas.length / perPage), page + 1))}
                        disabled={page >= Math.ceil(filteredFincas.length / perPage)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Wizard Component visible según pantalla */}
          {wizardOpen && (
           <div className="w-full md:w-[400px] flex-shrink-0 h-full flex ml-4">
              <WizardFinca
                showWizard={wizardOpen}
                setShowWizard={setWizardOpen}
                refs={{
                  nombreFinca
                }}
                handleAutoSave={handleAutoSave}
                onCreated={handleFincaAdded}
                editFinca={editFinca}
                onClose={() => {
                  if (isMobile) setWizardOpen(false);
                  setEditFinca(null);
                }}
                hideCloseButton={!isMobile}
                tableHeight={containerHeight}
              />
            </div>
          )}
          
          {/* Dialog de confirmación para eliminar */}
          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="text-lg font-bold mb-2">Confirmar eliminación</div>
                <div className="text-gray-700 mb-6">¿Está seguro de eliminar esta finca? Esta acción no se puede deshacer.</div>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                    onClick={() => {
                      confirmDelete();
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Finca;
