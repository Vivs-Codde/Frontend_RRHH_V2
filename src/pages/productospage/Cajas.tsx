import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2 } from "lucide-react";
import Layout from "../../components/Layout";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import WizardCaja from "../../components/wizards/cajas/WizardCaja";
import { useCajaFormRefs } from "../../hooks/useCajaFormRefs";
import { cajaService } from "../../services/cajaService";
import type { Caja } from "../../types/caja";

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

const CajasPage: React.FC = () => {
  const { t } = useTranslation();
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10); // igual que bodegas
  const [showWizard, setShowWizard] = useState(false);
  const [editCaja, setEditCaja] = useState<Caja | null>(null);
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>(
    {}
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    setShowWizard(!isMobile ? true : false);
  }, [isMobile]);

  // Refs para el formulario
  const formRefs = useCajaFormRefs();

  // Definir las columnas de la tabla
  const columns: TableColumn[] = [
    {
      key: "name",
      label: t("name"),
      sortable: true,
      width: "20%"
    },
    {
      key: "large",
      label: t("large"),
      sortable: true,
      width: "12%",
      align: "center" as const,
      render: (value: number) => (
        <span className="font-medium">{value.toFixed(2)}</span>
      )
    },
    {
      key: "wide",
      label: t("wide"),
      sortable: true,
      width: "12%",
      align: "center" as const,
      render: (value: number) => (
        <span className="font-medium">{value.toFixed(2)}</span>
      )
    },
    {
      key: "hide",
      label: t("hide"),
      sortable: true,
      width: "12%",
      align: "center" as const,
      render: (value: number) => (
        <span className="font-medium">{value.toFixed(2)}</span>
      )
    },
    {
      key: "equivalent",
      label: t("equivalent"),
      sortable: true,
      width: "12%",
      align: "center" as const,
      render: (value: number) => (
        <span className="font-medium">{value.toFixed(3)}</span>
      )
    },
    {
      key: "weight",
      label: t("weight"),
      sortable: true,
      width: "12%",
      align: "center" as const,
      render: (value: number) => (
        <span className="font-medium">{value.toFixed(3)}</span>
      )
    },
    {
      key: "status",
      label: t("status"),
      sortable: true,
      width: "10%",
      render: (value: boolean, row: Caja) => (
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

  // Cargar cajas
  const loadCajas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await cajaService.getAll();
      setCajas(data);
    } catch (err: any) {
      console.error("Error al cargar cajas:", err);
      setError(err.message || "Error al cargar las cajas");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadCajas();
  }, []);

  // Filtrar cajas por búsqueda
  const filteredCajas = cajas.filter(caja =>
    caja.name.toLowerCase().includes(search.toLowerCase()) ||
    caja.large.toString().includes(search.toLowerCase()) ||
    caja.wide.toString().includes(search.toLowerCase()) ||
    caja.hide.toString().includes(search.toLowerCase()) ||
    caja.equivalent.toString().includes(search.toLowerCase()) ||
    caja.weight.toString().includes(search.toLowerCase()) ||
    (caja.status ? "activo" : "inactivo").includes(search.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredCajas.length / perPage);
  const paginatedCajas = filteredCajas.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Manejar edición
  const handleEdit = (caja: Caja) => {
    setEditCaja(caja);
    setShowWizard(true);
  };

  // Manejar eliminación
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta caja?")) {
      try {
        await cajaService.delete(id);
        loadCajas();
      } catch (err: any) {
        console.error("Error al eliminar caja:", err);
        setError(err.message || "Error al eliminar la caja");
      }
    }
  };

  // Cambiar estado de caja
  const handleStatusChange = async (caja: Caja) => {
    setStatusLoading((prev) => ({ ...prev, [caja.id]: true }));
    try {
      await cajaService.updateStatus(caja.id, !caja.status);
      setCajas((prev) =>
        prev.map((c) =>
          c.id === caja.id ? { ...c, status: !caja.status } : c
        )
      );
    } catch (e) {
      alert('Error al cambiar el estado de la caja');
    } finally {
      setStatusLoading((prev) => ({ ...prev, [caja.id]: false }));
    }
  };

  // Manejar creación/actualización exitosa
  const handleCajaCreated = () => {
    loadCajas();
    setEditCaja(null);
    // Solo cerrar el wizard en móvil, en desktop permanece abierto
    if (isMobile) setShowWizard(false);
    // En desktop, el wizard permanece abierto igual que en bodegas
  };

  // Manejar cierre del wizard
  const handleCloseWizard = () => {
    if (isMobile) setShowWizard(false);
    setEditCaja(null);
  };

  // Ref y altura para el contenedor principal de la tabla
  const mainContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState<number | undefined>(undefined);
  React.useEffect(() => {
    if (mainContainerRef.current) {
      setContainerHeight(mainContainerRef.current.offsetHeight);
    }
  }, [paginatedCajas.length, perPage, loading]);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-full pl-0 pr-4">
        <div className={`flex ${!isMobile ? "flex-row items-start min-h-screen" : "flex-col"} flex-wrap relative`}>
          {/* Tabla desktop */}
          <div ref={mainContainerRef} className={!isMobile ? "hidden sm:block flex-1 max-w-[calc(100%-400px)]" : "hidden sm:block w-full"}>
            <div className="bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-start order-2 sm:order-1">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholderC")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                  />
                </div>
                {/* Título centrado */}
                <div className="flex-1 flex justify-center items-center order-1 sm:order-2">
                  <h3 className="text-xl font-semibold text-gray-800 text-center">
                    {t("titleC")}
                  </h3>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {/* Tabla de cajas */}
              <GenericTable
                data={paginatedCajas}
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
                emptyMessage={t("emptyMessage")}
                actionColumnLabel={t("actions")}
              />
            </div>
          </div>

          {/* Cards para mobile */}
          {isMobile && (
            <div className="block sm:hidden w-full">
              <div className="bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full">
                <div className="w-full flex justify-center items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 text-center w-full" style={{ letterSpacing: 0.5 }}>
                    {t("titleC")}
                  </h3>
                </div>
                <div className="flex flex-col mb-2 gap-2 w-full">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholderC")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                  />
                  <button
                    onClick={() => {
                      setEditCaja(null);
                      setShowWizard(true);
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
                    {t("add")}
                  </button>
                </div>
                {/* Cards con scroll */}
                <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                  {loading ? (
                    <p className="text-center text-gray-500">{t("common.loading")}</p>
                  ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                  ) : paginatedCajas.length === 0 ? (
                    <p className="text-center text-gray-500">{t("emptyMessage")}</p>
                  ) : (
                    paginatedCajas.map((caja) => (
                      <div key={caja.id} className="bg-white shadow rounded-lg p-4 relative">
                        <div className="flex flex-col gap-1 mb-2">
                          <h4 className="font-semibold text-lg text-pink-700">{caja.name}</h4>
                          <p className="text-xs text-gray-500">{`${caja.large} x ${caja.wide} x ${caja.hide}`}</p>
                          <div className="flex flex-col items-center justify-center mt-2">
                            <div className="flex items-center gap-2">
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={!!caja.status}
                                  onChange={() => handleStatusChange(caja)}
                                  disabled={statusLoading[caja.id]}
                                />
                                <div
                                  className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                                    caja.status
                                      ? 'peer-checked:bg-[#cc3399] bg-[#cc3399]'
                                      : 'peer-checked:bg-gray-300 bg-gray-300'
                                  }`}
                                ></div>
                                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                              </label>
                              <span
                                className={`ml-2 text-xs font-medium ${
                                  caja.status ? 'text-green-700' : 'text-gray-500'
                                }`}
                              >
                                {caja.status ? t("active") : t("inactive")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          className="absolute bottom-2 right-2"
                          onClick={() => handleEdit(caja)}
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
          )}
          {/* Wizard siempre presente al lado de la tabla en desktop */}
          <div
            className={!isMobile ? "w-[400px] flex-shrink-0 h-[calc(100vh-100px)] overflow-auto ml-6" : showWizard ? "w-full md:w-[400px] flex-shrink-0" : "hidden"}
            style={!isMobile ? { height: 'calc(100vh - 100px)' } : {}}
          >
            <WizardCaja
              showWizard={showWizard || !isMobile}
              setShowWizard={setShowWizard}
              refs={formRefs}
              onCreated={handleCajaCreated}
              editCaja={editCaja}
              onClose={handleCloseWizard}
              hideCloseButton={!isMobile}
              tableHeight={!isMobile ? containerHeight : undefined}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CajasPage;
