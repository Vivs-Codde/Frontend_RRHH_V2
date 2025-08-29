import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import WizardColor from "../../components/wizards/WizardColor";
import { getColores, deleteColor, toggleColorStatus } from "../../services/coloresService";
import type { Color as ColorType } from "../../services/coloresService";
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

const Color: React.FC = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [colores, setColores] = useState<ColorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editColor, setEditColor] = useState<ColorType | null>(null);
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

  // Crear refs para los campos del formulario de color
  const nombreColor = React.useRef<HTMLInputElement>(null);
  const codigoColor = React.useRef<HTMLInputElement>(null);
  const mainContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    if (mainContainerRef.current) {
      setContainerHeight(mainContainerRef.current.offsetHeight);
    }
  }, [colores.length, perPage, loading]);
  
  // Configuración de columnas para la tabla genérica
  const columns: TableColumn[] = [
    { 
      key: "color", 
      label: "Color",
      render: (value, row) => (
        <div className="flex items-center">
          <div 
            className="w-6 h-6 mr-2 rounded-full" 
            style={{ backgroundColor: row.codigo || '#FFFFFF' }}
          ></div>
          <span>{value}</span>
        </div>
      ),
    },
    { key: "codigo", label: "Código Hexadecimal" },
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

  // Cargar colores
  useEffect(() => {
    fetchColores();
  }, [refreshTrigger]);

  const fetchColores = () => {
    setLoading(true);
    getColores()
      .then((response) => {
        setColores(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setError("");
      })
      .catch(() => setError("Error al cargar los colores"))
      .finally(() => setLoading(false));
  };

  // Cambiar estado de color
  const handleStatusChange = async (color: ColorType) => {
    if (!color.id) return;
    setStatusLoading((prev) => ({ ...prev, [color.id!]: true }));
    try {
      await toggleColorStatus(color.id);
      // Actualizar el estado en la UI
      color.estado = !color.estado;
      setColores((prev) =>
        prev.map((c) =>
          c.id === color.id ? { ...c, estado: color.estado } : c
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado del color");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [color.id!]: false }));
    }
  };

  // Filtrar y paginar colores
  const filteredColores = colores.filter((color: ColorType) =>
    color.color?.toLowerCase().includes(search.toLowerCase()) ||
    color.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación de colores filtrados
  const paginatedColores = filteredColores.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Llamar esto después de agregar o editar un color
  const handleColorAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenWizard = () => {
    setEditColor(null);
    setWizardOpen(true);
  };

  // Abrir wizard en modo edición
  const handleEditColor = (color: ColorType) => {
    setEditColor(color);
    setWizardOpen(true);
  };

  // Función para eliminar color
  const handleDeleteColor = (id: number) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };
  
  // Confirmar eliminación de color
  const confirmDelete = async () => {
    if (deletingId) {
      setLoading(true);
      try {
        await deleteColor(deletingId);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        setError("Error al eliminar el color");
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

  // Verificar permiso para eliminar color
  const canDeleteColor = userPermissions.some(
    (p) => p.action === "eliminar" && p.module === "color"
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
                  placeholder="Buscar color..."
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
                  Gestión de Colores
                </h3>
              </div>
              {/* Botón agregar solo en móvil */}
              {isMobile && (
                <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setEditColor(null);
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
                    Agregar Color
                  </button>
                </div>
              )}
            </div>

            {/* Tabla genérica (solo en pantallas medianas o grandes) */}
            <div className="hidden sm:block">
              <GenericTable
                data={paginatedColores}
                columns={columns}
                loading={loading}
                error={error}
                onEdit={handleEditColor}
                onDelete={canDeleteColor ? handleDeleteColor : undefined}
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
                    : "No hay colores registrados"
                }
                actionColumnLabel="Acciones"
              />
            </div>

            {/* Cards (solo en móviles) */}
            <div className="block sm:hidden">
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    Cargando colores...
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">{error}</div>
                ) : filteredColores.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {search ? "No se encontraron resultados" : "No hay colores registrados"}
                  </div>
                ) : (
                  paginatedColores.map((color: ColorType, idx: number) => (
                    <div
                      key={color.id || idx}
                      className="bg-white shadow rounded-lg p-4"
                    >
                      <div className="flex flex-col items-center gap-1 mb-2">
                        <div 
                          className="w-12 h-12 rounded-full mb-2" 
                          style={{ backgroundColor: color.codigo || '#FFFFFF' }}
                        ></div>
                        <h4
                          className="font-semibold text-lg text-fuchsia-700 text-center break-words w-full"
                          style={{ wordBreak: "break-word" }}
                        >
                          {color.color}
                        </h4>
                        <p className="text-xs text-gray-500 text-center w-full">
                          {color.codigo}
                        </p>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                          onClick={() => handleEditColor(color)}
                          title="Editar"
                          style={{ background: "#fff" }}
                        >
                          <Edit2 size={18} color="#cc3399" />
                        </button>
                        {canDeleteColor && (
                          <button
                            className="text-red-600 hover:text-red-800 p-2 rounded-full border border-red-200 bg-white"
                            onClick={() => handleDeleteColor(color.id!)}
                            title="Eliminar"
                          >
                            <Trash2 size={18} color="#dc2626" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {/* Paginación para móviles */}
                {!loading && !error && filteredColores.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                      >
                        {t("common.previous")}
                      </button>
                      <span className="text-sm">
                        {t("common.page", {
                          current: page,
                          total: totalPages || 1,
                        })}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages || totalPages === 0}
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                      >
                        {t("common.next")}
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
              <WizardColor
                showWizard={wizardOpen}
                setShowWizard={setWizardOpen}
                refs={{
                  nombreColor,
                  codigoColor
                }}
                handleAutoSave={handleAutoSave}
                onCreated={handleColorAdded}
                editColor={editColor}
                onClose={() => {
                  if (isMobile) setWizardOpen(false);
                  setEditColor(null);
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
                <div className="text-gray-700 mb-6">¿Está seguro de eliminar este color? Esta acción no se puede deshacer.</div>
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

export default Color;
