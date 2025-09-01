import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import WizardTipoContrato from "../../components/wizards/WizardTipoContrato";
import { usePermissions } from "../../context/PermissionsContext";
import {
  getTiposContrato,
  deleteTipoContrato,
  toggleTipoContratoStatus,
} from "../../services/tiposContratoService";
import type { TipoContrato } from "../../services/tiposContratoService";
import type { TableColumn } from "../../components/GenericTable";

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

const TipoContrato: React.FC = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [tiposContrato, setTiposContrato] = useState<TipoContrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editTipoContrato, setEditTipoContrato] = useState<TipoContrato | null>(null);
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

  // Crear refs para los campos del formulario de tipo de contrato
  const tipoContrato = React.useRef<HTMLInputElement>(null);
  const mainContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    if (mainContainerRef.current) {
      setContainerHeight(mainContainerRef.current.offsetHeight);
    }
  }, [tiposContrato.length, perPage, loading]);
  
  // Configuración de columnas para la tabla genérica
  const columns: TableColumn[] = [
    { key: "tipo", label: "Tipo de Contrato" },
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

  // Cargar tipos de contrato
  useEffect(() => {
    fetchTiposContrato();
  }, [refreshTrigger]);

  const fetchTiposContrato = () => {
    setLoading(true);
    getTiposContrato()
      .then((response) => {
        setTiposContrato(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setError("");
      })
      .catch(() => setError("Error al cargar los tipos de contrato"))
      .finally(() => setLoading(false));
  };

  // Cambiar estado de tipo de contrato
  const handleStatusChange = async (tipoContrato: TipoContrato) => {
    if (!tipoContrato.id) return;
    setStatusLoading((prev) => ({ ...prev, [tipoContrato.id!]: true }));
    try {
      await toggleTipoContratoStatus(tipoContrato.id);
      // Actualizar el estado en la UI
      tipoContrato.estado = !tipoContrato.estado;
      setTiposContrato((prev) =>
        prev.map((tc) =>
          tc.id === tipoContrato.id ? { ...tc, estado: tipoContrato.estado } : tc
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado del tipo de contrato");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [tipoContrato.id!]: false }));
    }
  };

  // Filtrar y paginar tipos de contrato
  const filteredTiposContrato = tiposContrato.filter((tipo: TipoContrato) =>
    tipo.tipo?.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación de tipos de contrato filtrados
  const paginatedTiposContrato = filteredTiposContrato.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Llamar esto después de agregar o editar un tipo de contrato
  const handleTipoContratoAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenWizard = () => {
    setEditTipoContrato(null);
    setWizardOpen(true);
  };

  // Abrir wizard en modo edición
  const handleEditTipoContrato = (tipoContrato: TipoContrato) => {
    setEditTipoContrato(tipoContrato);
    setWizardOpen(true);
  };

  // Función para eliminar tipo de contrato
  const handleDeleteTipoContrato = (id: number) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };
  
  // Confirmar eliminación de tipo de contrato
  const confirmDelete = async () => {
    if (deletingId) {
      setLoading(true);
      try {
        await deleteTipoContrato(deletingId);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        setError("Error al eliminar el tipo de contrato");
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

  // Verificar permiso para eliminar tipo de contrato
  const canDeleteTipoContrato = userPermissions.some(
    (p) => p.action === "eliminar" && p.module === "tipo_contrato"
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
                  placeholder="Buscar tipo de contrato..."
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
                  Gestión de Tipos de Contrato
                </h3>
              </div>
              {/* Botón agregar solo en móvil */}
              {isMobile && (
                <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setEditTipoContrato(null);
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
                    Agregar Tipo de Contrato
                  </button>
                </div>
              )}
            </div>

            {/* Tabla genérica (solo en pantallas medianas o grandes) */}
            <div className="hidden sm:block">
              <GenericTable
                data={paginatedTiposContrato}
                columns={columns}
                loading={loading}
                error={error}
                onEdit={handleEditTipoContrato}
                onDelete={canDeleteTipoContrato ? handleDeleteTipoContrato : undefined}
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
                    : "No hay tipos de contrato registrados"
                }
                actionColumnLabel="Acciones"
              />
            </div>

            {/* Cards (solo en móviles) */}
            <div className="block sm:hidden">
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    Cargando tipos de contrato...
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">{error}</div>
                ) : filteredTiposContrato.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {search ? "No se encontraron resultados" : "No hay tipos de contrato registrados"}
                  </div>
                ) : (
                  paginatedTiposContrato.map((tipo: TipoContrato, idx: number) => (
                    <div
                      key={tipo.id || idx}
                      className="bg-white shadow rounded-lg p-4"
                    >
                      <div className="flex flex-col items-center gap-1 mb-2">
                        <h4
                          className="font-semibold text-lg text-fuchsia-700 text-center break-words w-full"
                          style={{ wordBreak: "break-word" }}
                        >
                          {tipo.tipo}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={tipo.estado === 1 || tipo.estado === true}
                              onChange={() => handleStatusChange(tipo)}
                              disabled={statusLoading[tipo.id!]}
                            />
                            <div
                              className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                                tipo.estado === 1 || tipo.estado === true
                                  ? "peer-checked:bg-[#cc3399] bg-[#cc3399]"
                                  : "peer-checked:bg-gray-300 bg-gray-300"
                              }`}
                            ></div>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                          </label>
                          <span
                            className={`ml-2 text-xs font-medium ${
                              tipo.estado === 1 || tipo.estado === true
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            {tipo.estado === 1 || tipo.estado === true
                              ? t("common.active", "Activo")
                              : t("common.inactive", "Inactivo")}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleEditTipoContrato(tipo)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                          Editar
                        </button>
                        {canDeleteTipoContrato && (
                          <button
                            onClick={() => handleDeleteTipoContrato(tipo.id!)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {/* Paginación para móviles */}
                {!loading && !error && filteredTiposContrato.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-gray-300 text-gray-600 rounded disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-1 bg-fuchsia-600 text-white rounded">
                        {page} de {Math.ceil(filteredTiposContrato.length / perPage)}
                      </span>
                      <button
                        onClick={() => setPage(Math.min(Math.ceil(filteredTiposContrato.length / perPage), page + 1))}
                        disabled={page === Math.ceil(filteredTiposContrato.length / perPage)}
                        className="px-3 py-1 bg-gray-300 text-gray-600 rounded disabled:opacity-50"
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
              <WizardTipoContrato
                showWizard={wizardOpen}
                setShowWizard={setWizardOpen}
                refs={{
                  tipoContrato
                }}
                handleAutoSave={handleAutoSave}
                onCreated={handleTipoContratoAdded}
                editTipoContrato={editTipoContrato}
                onClose={() => {
                  if (isMobile) setWizardOpen(false);
                  setEditTipoContrato(null);
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
                <div className="text-gray-700 mb-6">¿Está seguro de eliminar este tipo de contrato? Esta acción no se puede deshacer.</div>
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

export default TipoContrato;
