import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
// import ClienteStepsHeader from "../../components/ClienteStepsHeader";
import WizardPais from "../../components/wizards/WizartPais";
import { getPaises, updatePaisStatus } from "../../services/entidadesService";
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

const Pais: React.FC = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [paises, setPaises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editPais, setEditPais] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>(
    {}
  );
  const userPermissions = usePermissions();
  const isMobile = useIsMobile();

  useEffect(() => {
    setWizardOpen(!isMobile ? true : false);
  }, [isMobile]);

  // Crear refs para los campos del formulario de país
  const nombrePais = React.useRef<HTMLInputElement>(null);
  const codsriPais = React.useRef<HTMLInputElement>(null);
  const paraisofiscalPais = React.useRef<HTMLInputElement>(null);
  const codpfPais = React.useRef<HTMLInputElement>(null);
const mainContainerRef = React.useRef<HTMLDivElement>(null);
const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
useEffect(() => {
  if (mainContainerRef.current) {
    setContainerHeight(mainContainerRef.current.offsetHeight);
  }
}, [paises.length, perPage, loading]);
  // Configuración de columnas para la tabla genérica
  const paisesColumns: TableColumn[] = [
    { key: "nombre", label: t("common.countries.name") },
    { key: "codsri", label: t("common.countries.sriCode") },
    {
      key: "paraisofiscal",
      label: t("common.countries.taxHaven"),
      render: (value: boolean) =>
        value ? t("common.countries.yes") : t("common.countries.no"),
    },
    { key: "codpf", label: t("common.countries.pfCode") },
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

  // Solo cargar países
  useEffect(() => {
    fetchPaises();
  }, []);

  const fetchPaises = () => {
    setLoading(true);
    getPaises()
      .then((data) => {
        setPaises(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(() => setError(t("common.countries.error")))
      .finally(() => setLoading(false));
  };

  // Cambiar estado de país
  const handleStatusChange = async (pais: any) => {
    setStatusLoading((prev) => ({ ...prev, [pais.id]: true }));
    try {
      await updatePaisStatus(
        pais.id,
        !(pais.estado === 1 || pais.estado === true)
      );
      pais.estado = !(pais.estado === 1 || pais.estado === true);
      setPaises((prev) =>
        prev.map((p) =>
          p.id === pais.id ? { ...p, estado: pais.estado } : p
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado del país");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [pais.id]: false }));
    }
  };

  // Filtrar y paginar países
  const filteredPaises = paises.filter((p) =>
    p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    p.codsri?.toLowerCase().includes(search.toLowerCase()) ||
    p.codpf?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPaises.length / perPage);
  const paginatedPaises = filteredPaises.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Llamar esto después de agregar un país
  const handlePaisAdded = () => {
    fetchPaises();
  };

  const handleOpenWizard = () => {
    setEditPais(null);
    setWizardOpen(true);
  };

  // Abrir wizard en modo edición
  const handleEditPais = (pais: any) => {
    setEditPais(pais);
    setWizardOpen(true);
  };

  // Función para eliminar país (placeholder)
  const handleDeletePais = (id: number) => {
    // Implementar lógica de eliminación aquí
    console.log("Delete pais:", id);
  };

  // Opcional: función para guardar datos al salir del campo
  const handleAutoSave = () => {
    // Aquí puedes manejar el guardado si lo necesitas
  };

  // Verificar permiso para eliminar país
  const canDeletePais = userPermissions.some(
    (p) => p.action === "eliminar" && p.module === "pais"
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
                  placeholder={t("common.countries.search")}
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
                  {t("common.countries.title")}
                </h3>
              </div>
              {/* Botón agregar solo en móvil */}
              {isMobile && (
                <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setEditPais(null);
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
                    {t("common.countries.add")}
                  </button>
                </div>
              )}
            </div>

            {/* Tabla genérica (solo en pantallas medianas o grandes) */}
            <div className="hidden sm:block">
              <GenericTable
                data={paginatedPaises}
                columns={paisesColumns}
                loading={loading}
                error={error}
                onEdit={handleEditPais}
                onDelete={canDeletePais ? handleDeletePais : undefined}
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
                    ? t("common.noResults")
                    : t("common.countries.noData")
                }
                actionColumnLabel={t("common.countries.actions")}
              />
            </div>

            {/* Cards (solo en móviles) */}
            <div className="block sm:hidden">
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    {t("common.countries.loading")}
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">{error}</div>
                ) : paginatedPaises.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {search ? t("common.noResults") : t("common.countries.noData")}
                  </div>
                ) : (
                  paginatedPaises.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="bg-white shadow rounded-lg p-4"
                    >
                      <div className="flex flex-col items-center gap-1 mb-2">
                        <h4
                          className="font-semibold text-lg text-fuchsia-700 text-center break-words w-full"
                          style={{ wordBreak: "break-word" }}
                        >
                          {p.nombre}
                        </h4>
                        <p className="text-xs text-gray-500 text-center w-full">
                          {p.codsri}
                        </p>
                      </div>
                      <div className="text-sm mb-2 text-center">
                        <p>
                          <strong>{t("common.countries.cardTaxHaven")}</strong>{" "}
                          {p.paraisofiscal
                            ? t("common.countries.yes")
                            : t("common.countries.no")}
                        </p>
                        <p>
                          <strong>{t("common.countries.cardPfCode")}</strong>{" "}
                          {p.codpf}
                        </p>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                          onClick={() => handleEditPais(p)}
                          title={t("common.edit")}
                          style={{ background: "#fff" }}
                        >
                          <Edit2 size={18} color="#cc3399" />
                        </button>
                        {canDeletePais && (
                          <button
                            className="text-red-600 hover:text-red-800 p-2 rounded-full border border-red-200 bg-white"
                            onClick={() => handleDeletePais(p.id)}
                            title={t("common.delete")}
                          >
                            <Trash2 size={18} color="#dc2626" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {/* Paginación para móviles */}
                {!loading && !error && filteredPaises.length > 0 && (
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
              <WizardPais
                showWizard={wizardOpen}
                setShowWizard={setWizardOpen}
                refs={{
                  nombrePais: nombrePais,
                  codsriPais: codsriPais,
                  paraisofiscalPais: paraisofiscalPais,
                  codpfPais: codpfPais,
                }}
                handleAutoSave={handleAutoSave}
                onCreated={handlePaisAdded}
                editPais={editPais}
                onClose={() => {
                  if (isMobile) setWizardOpen(false);
                  setEditPais(null);
                }}
                hideCloseButton={!isMobile}
                 tableHeight={containerHeight}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pais;
