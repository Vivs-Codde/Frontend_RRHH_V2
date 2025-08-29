import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus } from "lucide-react";
import WizardVendedor from "../../components/wizards/WizardVendedor";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import { getVendedores, updateVendedorStatus } from "../../services/entidadesService";

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

const Vendedor: React.FC = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editVendedor, setEditVendedor] = useState<any | null>(null);
  const [statusLoading, setStatusLoading] = useState<{ [id: number]: boolean }>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const isMobile = useIsMobile();

  // Refs para el formulario
  const nombreVendedor = React.useRef<HTMLInputElement>(null);
  const correoVendedor = React.useRef<HTMLInputElement>(null);
  const ubicacionVendedor = React.useRef<HTMLInputElement>(null);
  const telefonoVendedor = React.useRef<HTMLInputElement>(null);

  // Ref y altura para el contenedor principal
  const mainContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (mainContainerRef.current) {
      setContainerHeight(mainContainerRef.current.offsetHeight);
    }
  }, [vendedores.length, perPage, loading]);



  const fetchVendedores = () => {
    setLoading(true);
    getVendedores()
      .then((data) => {
        setVendedores(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(() => setError(t("common.salesperson.error")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVendedores();
  }, []);

  const handleVendedorAdded = () => {
    fetchVendedores();
  };

  const handleEditVendedor = (vendedor: any) => {
    setEditVendedor(vendedor);
    setWizardOpen(true);
  };

  const handleAutoSave = () => {};

  const handleStatusChange = async (vendedor: any) => {
    setStatusLoading((prev) => ({ ...prev, [vendedor.id]: true }));
    try {
      await updateVendedorStatus(vendedor.id, !(vendedor.estado === 1 || vendedor.estado === true));
      vendedor.estado = !(vendedor.estado === 1 || vendedor.estado === true);
      setVendedores((prev) =>
        prev.map((v) =>
          v.id === vendedor.id ? { ...v, estado: vendedor.estado } : v
        )
      );
    } catch (e) {
      alert("Error al cambiar el estado del vendedor");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [vendedor.id]: false }));
    }
  };

  // Filtrar y paginar
  const filteredVendedores = vendedores.filter((vendedor) => {
    const searchTerm = search.toLowerCase();
    return (
      (vendedor.nombre || vendedor.name || "").toLowerCase().includes(searchTerm) ||
      (vendedor.correo || vendedor.email || "").toLowerCase().includes(searchTerm) ||
      (vendedor.ubicacion || vendedor.location || "").toLowerCase().includes(searchTerm) ||
      (vendedor.telefono || vendedor.phone || "").toLowerCase().includes(searchTerm)
    );
  });
  const totalPages = Math.ceil(filteredVendedores.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedVendedores = filteredVendedores.slice(startIndex, startIndex + perPage);

  // Columnas para la tabla
  const columns: TableColumn[] = [
    {
      key: "nombre",
      label: t("name_salesperson"),
      render: (value, row) => row.nombre || row.name || "",
    },
    {
      key: "correo",
      label: t("email_salesperson"),
      render: (value, row) => row.correo || row.email || "",
    },
    {
      key: "ubicacion",
      label: t("location_salesperson"),
      render: (value, row) => row.ubicacion || row.location || "",
    },
    {
      key: "telefono",
      label: t("phone_salesperson"),
      render: (value, row) => row.telefono || row.phone || "",
    },
    {
      key: "estado",
      label: t("status"),
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

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-full pl-0 pr-4">
        <div className={`flex ${!isMobile ? "flex-row items-stretch" : "flex-col"} flex-wrap relative`}>
          <div className="bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full h-full min-h-full flex flex-col" ref={mainContainerRef}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-start order-2 sm:order-1">
                <input
                  type="text"
                  placeholder={t("search_salesperson")}
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
                  {t("title_salesperson")}
                </h3>
              </div>
              <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                <button
                  onClick={() => {
                    setEditVendedor(null);
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
                  {t("add")}
                </button>
              </div>
            </div>
            <div className="hidden sm:block">
              <GenericTable
                data={paginatedVendedores}
                columns={columns}
                loading={loading}
                error={error}
                onEdit={handleEditVendedor}
                showActions={true}
                hideSearch={true}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                perPage={perPage}
                setPerPage={setPerPage}
                showPagination={true}
                emptyMessage={search ? t("common.noResults") : t("common.salesperson.noData")}
                actionColumnLabel={t("actions")}
              />
            </div>
            <div className="block sm:hidden">
              <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">{t("common.salesperson.loading")}</div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">{error}</div>
                ) : paginatedVendedores.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {filteredVendedores.length === 0 && search ? 
                      t("common.noResults") : 
                      t("common.salesperson.noData")
                    }
                  </div>
                ) : (
                  paginatedVendedores.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="bg-white shadow rounded-lg p-4"
                    >
                      <div className="flex flex-col items-center gap-1 mb-2">
                        <h4 className="font-semibold text-lg text-fuchsia-700 text-center break-words w-full" style={{wordBreak: 'break-word'}}>
                          {v.nombre || v.name}
                        </h4>
                        <p className="text-xs text-gray-500 text-center break-words w-full">{v.correo || v.email}</p>
                      </div>
                      <div className="text-sm mb-2">
                        <p><strong>{t("common.salesperson.cardLocation")}</strong> {v.ubicacion || v.location}</p>
                        <p><strong>{t("common.salesperson.cardPhone")}</strong> {v.telefono || v.phone}</p>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleEditVendedor(v)}
                          className="text-pink-700 hover:text-pink-900 p-2 rounded-full border border-pink-200 bg-white"
                          title={t('common.edit')}
                          style={{ background: '#fff' }}
                        >
                          <Edit2 size={18} color="#cc3399" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded button-icon-no-bg border border-gray-300 bg-white disabled:opacity-50"
                        style={{ color: page === 1 ? "#ccc" : "#e83e8c" }}
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-sm px-3">
                        {t("common.page", { current: page, total: totalPages })}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="p-2 rounded button-icon-no-bg border border-gray-300 bg-white disabled:opacity-50"
                        style={{ color: page === totalPages ? "#ccc" : "#e83e8c" }}
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {wizardOpen && (
            <div className="w-full md:w-[400px] flex-shrink-0 h-[calc(100vh-100px)] overflow-auto">
              <WizardVendedor
                showWizard={wizardOpen}
                setShowWizard={setWizardOpen}
                refs={{ nombreVendedor, correoVendedor, ubicacionVendedor, telefonoVendedor }}
                handleAutoSave={handleAutoSave}
                onCreated={handleVendedorAdded}
                editVendedor={editVendedor}
                onClose={() => {
                  if (isMobile) setWizardOpen(false);
                  setEditVendedor(null);
                }}
                hideCloseButton={!isMobile}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Vendedor;
