import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import WizardDepartamento from "../../components/wizards/WizardDepartamento";
import { 
  getDepartamentos, 
  deleteDepartamento, 
  toggleDepartamentoStatus,
  type Departamento as DepartamentoType 
} from "../../services/departamentosService";
import { getColores, type Color } from "../../services/coloresService";
import { usePermissions } from "../../context/PermissionsContext";

// Tipo extendido para incluir información del color
interface DepartamentoConColor extends DepartamentoType {
  colorInfo?: Color | null;
}

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

const Departamento: React.FC = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [departamentos, setDepartamentos] = useState<DepartamentoConColor[]>([]);
  const [coloresDisponibles, setColoresDisponibles] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editDepartamento, setEditDepartamento] = useState<DepartamentoConColor | null>(null);
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

  // Crear refs para los campos del formulario de departamento
  const nombreDepartamento = React.useRef<HTMLInputElement>(null);
  const colorDepartamento = React.useRef<HTMLSelectElement>(null);
  const mainContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    if (mainContainerRef.current) {
      setContainerHeight(mainContainerRef.current.offsetHeight);
    }
  }, [departamentos.length, perPage, loading]);
  
  // Configuración de columnas para la tabla genérica
  const columns: TableColumn[] = [
    { 
      key: "nombre", 
      label: "Nombre del Departamento",
      render: (value, row) => {
        // Usar la información enriquecida del color
        const colorHex = row.colorInfo?.codigo || '#CCCCCC';
        return (
          <div className="flex items-center">
            <div 
              className="w-6 h-6 mr-2 rounded-full" 
              style={{ backgroundColor: colorHex }}
            ></div>
            <span>{value}</span>
          </div>
        );
      },
    },
    { 
      key: "color_id", 
      label: "Color",
      render: (value, row) => {
        console.log('Renderizando color para departamento:', row.nombre, 'color_id:', value);
        return row.colorInfo ? `${row.colorInfo.color}` : 'Sin color';
      }
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

  // Cargar departamentos y colores
  useEffect(() => {
    const loadData = async () => {
      try {
        // Primero cargar colores
        console.log('Cargando colores...');
        const coloresResponse = await getColores({ estado: true, per_page: 100 });
        const colores = coloresResponse.data.data || [];
        console.log('Colores cargados:', colores);
        setColoresDisponibles(colores);
        
        // Luego cargar departamentos
        console.log('Cargando departamentos...');
        setLoading(true);
        const deptResponse = await getDepartamentos();
        const departamentos = deptResponse.data.data || [];
        console.log('Departamentos cargados:', departamentos);
        
        // Enriquecer departamentos con información de color
        const departamentosEnriquecidos = departamentos.map(dept => {
          const colorInfo = colores.find(c => c.id === dept.color_id);
          return {
            ...dept,
            colorInfo: colorInfo || null
          };
        });
        
        console.log('Departamentos enriquecidos:', departamentosEnriquecidos);
        setDepartamentos(departamentosEnriquecidos);
        setTotalPages(deptResponse.data.last_page || 1);
        setError("");
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError("Error al cargar los departamentos y colores");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [refreshTrigger]);

  // Cambiar estado de departamento
  const handleStatusChange = async (departamento: DepartamentoConColor) => {
    if (!departamento.id) return;
    setStatusLoading((prev) => ({ ...prev, [departamento.id!]: true }));
    try {
      await toggleDepartamentoStatus(departamento.id);
      // Actualizar el estado en la UI
      departamento.estado = !departamento.estado;
      setDepartamentos((prev) =>
        prev.map((d) =>
          d.id === departamento.id ? { ...d, estado: departamento.estado } : d
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado del departamento");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [departamento.id!]: false }));
    }
  };

  // Filtrar y paginar departamentos
  const filteredDepartamentos = departamentos.filter((departamento: DepartamentoConColor) =>
    departamento.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación de departamentos filtrados
  const paginatedDepartamentos = filteredDepartamentos.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Llamar esto después de agregar o editar un departamento
  const handleDepartamentoAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Abrir wizard en modo edición
  const handleEditDepartamento = (departamento: DepartamentoConColor) => {
    setEditDepartamento(departamento);
    setWizardOpen(true);
  };

  // Función para eliminar departamento
  const handleDeleteDepartamento = (id: number) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };
  
  // Confirmar eliminación de departamento
  const confirmDelete = async () => {
    if (deletingId) {
      setLoading(true);
      try {
        await deleteDepartamento(deletingId);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        setError("Error al eliminar el departamento");
      } finally {
        setShowDeleteDialog(false);
        setDeletingId(null);
        setLoading(false);
      }
    }
  };

  // Verificar permiso para eliminar departamento
  const canDeleteDepartamento = userPermissions.some(
    (p) => p.action === "eliminar" && p.module === "departamento"
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
                  placeholder="Buscar departamento..."
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
                  Gestión de Departamentos
                </h3>
              </div>
              {/* Botón agregar solo en móvil */}
              {isMobile && (
                <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setEditDepartamento(null);
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
                    Agregar Departamento
                  </button>
                </div>
              )}
            </div>

            {/* Tabla genérica (solo en pantallas medianas o grandes) */}
            <div className="hidden sm:block">
              <GenericTable
                data={paginatedDepartamentos}
                columns={columns}
                loading={loading}
                error={error}
                onEdit={handleEditDepartamento}
                onDelete={canDeleteDepartamento ? handleDeleteDepartamento : undefined}
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
                    : "No hay departamentos registrados"
                }
                actionColumnLabel="Acciones"
              />
            </div>

            {/* Cards (solo en móviles) */}
            <div className="block sm:hidden">
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    Cargando departamentos...
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">{error}</div>
                ) : filteredDepartamentos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {search ? "No se encontraron resultados" : "No hay departamentos registrados"}
                  </div>
                ) : (
                  paginatedDepartamentos.map((departamento: DepartamentoConColor, idx: number) => {
                    const colorHex = departamento.colorInfo?.codigo || '#CCCCCC';
                    
                    return (
                      <div
                        key={departamento.id || idx}
                        className="bg-white shadow rounded-lg p-4"
                      >
                        <div className="flex flex-col items-center gap-1 mb-2">
                          <div 
                            className="w-12 h-12 rounded-full mb-2" 
                            style={{ backgroundColor: colorHex }}
                          ></div>
                          <h4
                            className="font-semibold text-lg text-fuchsia-700 text-center break-words w-full"
                            style={{ wordBreak: "break-word" }}
                          >
                            {departamento.nombre}
                          </h4>
                          <p className="text-xs text-gray-500 text-center w-full">
                            {departamento.colorInfo ? `${departamento.colorInfo.color} (${departamento.colorInfo.codigo})` : 'Sin color'}
                          </p>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => handleEditDepartamento(departamento)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                          >
                            Editar
                          </button>
                          {canDeleteDepartamento && (
                            <button
                              onClick={() => handleDeleteDepartamento(departamento.id!)}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {/* Paginación para móviles */}
                {!loading && !error && filteredDepartamentos.length > 0 && (
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
                        Página {page} de {Math.ceil(filteredDepartamentos.length / perPage)}
                      </span>
                      <button
                        onClick={() => setPage(Math.min(Math.ceil(filteredDepartamentos.length / perPage), page + 1))}
                        disabled={page >= Math.ceil(filteredDepartamentos.length / perPage)}
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
              <WizardDepartamento
                showWizard={wizardOpen}
                setShowWizard={setWizardOpen}
                refs={{
                  nombreDepartamento,
                  colorDepartamento
                }}
                onCreated={handleDepartamentoAdded}
                editDepartamento={editDepartamento}
                onClose={() => {
                  if (isMobile) setWizardOpen(false);
                  setEditDepartamento(null);
                }}
                hideCloseButton={!isMobile}
                tableHeight={containerHeight}
                coloresDisponibles={coloresDisponibles}
              />
            </div>
          )}
          
          {/* Dialog de confirmación para eliminar */}
          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="text-lg font-bold mb-2">Confirmar eliminación</div>
                <div className="text-gray-700 mb-6">¿Está seguro de eliminar este departamento? Esta acción no se puede deshacer.</div>
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

export default Departamento;
