import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import Layout from "../../components/Layout";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import WizardTransportista from "../../components/wizards/transportistas/WizardTransportista";
import { useTransportistaFormRefs } from "../../hooks/useTransportistaFormRefs";
import { transportistaService } from "../../services/transportistaService";
import type { Transportista } from "../../types/transportista";

const TransportistasPage: React.FC = () => {
  const { t } = useTranslation();
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showWizard, setShowWizard] = useState(false);
  const [editTransportista, setEditTransportista] = useState<Transportista | null>(null);
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>({});

  // Refs para el formulario
  const formRefs = useTransportistaFormRefs();

  const [perPage, setPerPage] = useState(10);

  // Filtrar transportistas
  const filteredTransportistas = transportistas.filter((transportista) =>
    transportista.placa.toLowerCase().includes(search.toLowerCase()) ||
    transportista.propietario.toLowerCase().includes(search.toLowerCase()) ||
    transportista.chofer.toLowerCase().includes(search.toLowerCase()) ||
    transportista.modelo.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredTransportistas.length / perPage);
  const paginatedTransportistas = filteredTransportistas.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Configuración de columnas
  const columns: TableColumn[] = [
    {
      key: "placa",
      label: t("plate"),
      sortable: true,
      width: "15%"
    },
    {
      key: "propietario",
      label: t("owner"),
      sortable: true,
      width: "22%"
    },
    {
      key: "modelo",
      label: t("model"),
      sortable: true,
      width: "18%"
    },
    {
      key: "chofer",
      label: t("driver"),
      sortable: true,
      width: "22%"
    },
    {
      key: "status",
      label: t("status"),
      sortable: true,
      width: "23%",
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

  // Cargar transportistas
  const loadTransportistas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await transportistaService.getAll();
      // Normalizar status a 'active'/'inactive'
      const mapped = data.map((item: any) => {
        let status = "inactive";
        if (item.status !== undefined) {
          if (typeof item.status === "string") {
            if (["Activo", "active", "ACTIVO", "ACTIVE"].includes(item.status)) status = "active";
            else status = "inactive";
          } else {
            status = item.status ? "active" : "inactive";
          }
        }
        return {
          ...item,
          status,
        };
      });
      setTransportistas(mapped);
    } catch (err: any) {
      console.error("Error al cargar transportistas:", err);
      setError(err.message || "Error al cargar los transportistas");
      setTransportistas([]);
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadTransportistas();
  }, []);

  // Manejar creación
  const handleCreate = () => {
    setEditTransportista(null);
    setShowWizard(true);
  };

  // Manejar edición
  const handleEdit = (transportista: Transportista) => {
    setEditTransportista(transportista);
    setShowWizard(true);
  };

  // Manejar eliminación
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este transportista?")) {
      return;
    }

    try {
      await transportistaService.delete(id);
      await loadTransportistas();
    } catch (error) {
      console.error("Error deleting transportista:", error);
      alert("Error al eliminar el transportista");
    }
  };

  // Cambiar estado de transportista
  const handleStatusChange = async (transportista: Transportista) => {
    setStatusLoading((prev) => ({ ...prev, [transportista.id]: true }));
    try {
      await transportistaService.updateStatus(transportista.id, transportista.status !== "active");
      const newStatus = transportista.status === "active" ? "inactive" : "active";
      setTransportistas((prev) =>
        prev.map((t) =>
          t.id === transportista.id ? { ...t, status: newStatus } : t
        )
      );
    } catch (e) {
      alert('Error al cambiar el estado del transportista');
    } finally {
      setStatusLoading((prev) => ({ ...prev, [transportista.id]: false }));
    }
  };

  // Manejar creación/actualización exitosa
  const handleTransportistaCreated = () => {
    loadTransportistas();
    setEditTransportista(null);
  };

  // Manejar cierre del wizard
  const handleCloseWizard = () => {
    setShowWizard(false);
    setEditTransportista(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-full pl-0">
        <div className={`flex ${showWizard ? "flex-row items-start min-h-screen" : "flex-col"} w-full max-w-full gap-4`}>
          {/* Tabla desktop */}
          <div className={showWizard ? "sm:flex flex-1 max-w-[calc(100%-400px)] h-full min-h-full flex flex-col overflow-auto" : "hidden sm:block w-full"}>
            <div className={`bg-white shadow-md w-full h-full p-4 ${showWizard ? "md:rounded-r-none rounded-lg" : "rounded-lg"}`}>
              <div className="w-full flex justify-center items-center order-1 sm:order-2 mb-4">
                <h3 className="text-xl font-semibold text-gray-800 text-center w-full" style={{ letterSpacing: 0.5 }}>
                  {t("titlet")}
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2 w-full">
                <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-start order-2 sm:order-1">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholderT")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                  />
                </div>
                <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => setShowWizard(true)}
                    className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                    style={{
                      background: "#cc3399",
                      color: "#fff",
                      fontFamily:
                        "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                    }}
                  >
                    <Plus size={20} />
                    {t("addT")}
                  </button>
                </div>
              </div>
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              <GenericTable
                data={paginatedTransportistas}
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
          </div>
          {/* Cards para mobile */}
          <div className="block sm:hidden w-full">
            <div className="bg-white shadow-md w-full h-full p-4 rounded-lg">
              <div className="w-full flex justify-center items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 text-center w-full" style={{ letterSpacing: 0.5 }}>
                  Gestión de Transportistas
                </h3>
              </div>
              <div className="flex flex-col mb-2 gap-2 w-full">
                <input
                  type="text"
                  placeholder={t("searchPlaceholderT")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                />
                <button
                  onClick={() => setShowWizard(true)}
                  className="w-full px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                  style={{
                    background: "#cc3399",
                    color: "#fff",
                    fontFamily:
                      "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                  }}
                >
                  <Plus size={20} />
                  {t("addT")}
                </button>
              </div>
              {/* Cards con scroll */}
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500">{t("common.loading")}</p>
                ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
                ) : paginatedTransportistas.length === 0 ? (
                  <p className="text-center text-gray-500">{t("emptyMessage")}</p>
                ) : (
                  paginatedTransportistas.map((transportista) => (
                    <div key={transportista.id} className="bg-white shadow rounded-lg p-4 relative">
                      <div className="flex flex-col gap-1 mb-2">
                        <h4 className="font-semibold text-lg text-pink-700">{transportista.placa}</h4>
                        <p className="text-xs text-gray-500">{transportista.modelo}</p>
                        <p className="text-xs text-gray-500">{transportista.chofer}</p>
                        <p className="text-xs text-gray-500">{transportista.propietario}</p>
                        <div className="flex flex-col items-center justify-center mt-2">
                          <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={transportista.status === "active"}
                                onChange={() => handleStatusChange(transportista)}
                                disabled={statusLoading[transportista.id]}
                              />
                              <div
                                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                                  transportista.status === "active"
                                    ? "peer-checked:bg-[#cc3399] bg-[#cc3399]"
                                    : "peer-checked:bg-gray-300 bg-gray-300"
                                }`}
                              ></div>
                              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                            </label>
                            <span
                              className={`ml-2 text-xs font-medium ${
                                transportista.status === "active" ? "text-green-700" : "text-gray-500"
                              }`}
                            >
                              {transportista.status === "active" ? t("active") : t("inactive")}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Aquí podrías agregar botón de editar si lo necesitas */}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Wizard solo cuando está abierto */}
          {showWizard && (
            <div className="md:w-[400px] w-full flex-shrink-0 h-[calc(100vh-100px)] overflow-auto">
              <WizardTransportista
                showWizard={showWizard}
                setShowWizard={setShowWizard}
                refs={formRefs}
                onCreated={handleTransportistaCreated}
                editTransportista={editTransportista}
                onClose={handleCloseWizard}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TransportistasPage;
