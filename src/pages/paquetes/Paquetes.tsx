import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GenericTable from '../../components/GenericTable';
import type { TableColumn } from '../../components/GenericTable';
import FormPaquete from './FormPaquete';
import { getPaquetes, updatePaqueteStatus } from '../../services/paquetesService';
import PaqueteViewModal from './PaqueteViewModal';

// El fetch de paquetes se centraliza en el service. Si necesitas filtros, extiende getPaquetes en el service.

function PaquetesPage() {
  // Estados para tabla y formulario
  const [showForm, setShowForm] = useState(false);
  const [paquetes, setPaquetes] = useState<any[]>([]);
  const [totalPaquetes, setTotalPaquetes] = useState<number>(0);
  const [totalPaquetesAbsoluto, setTotalPaquetesAbsoluto] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("todos"); // "todos", "activos", "inactivos"
  const { t } = useTranslation();
  
  // Estado para el paquete en edición o visualización
  const [editPaquete, setEditPaquete] = useState<any | null>(null);
  const [viewPaquete, setViewPaquete] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Estado para el control de cambio de estado
  const [estadoLoading, setEstadoLoading] = useState<{[id: number]: boolean}>({});

  // Columnas para la tabla genérica
  const columns: TableColumn[] = [
    { key: "SKU", label: "SKU", sortable: true, width: "5%", align: "center", cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm" },
    { key: "nombre", label: t("nombre"), sortable: true, width: "15%", align: "left", cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm" },
    { key: "categoria", label: t("categoria"), sortable: true, width: "10%", align: "left", cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm" },
    { key: "subcategoria", label: t("subcategoria"), sortable: true, width: "10%", align: "left", cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm" },
    { key: "materialesCount", label: t("materiales"), sortable: true, width: "8%", align: "center", cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (_: any, row: any) => row.materiales?.length || 0
    },
    { key: "precioTotal", label: t("precioTotal"), sortable: true, width: "10%", align: "left", cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm" },
    {
      key: "estado",
      label: t("estado"),
      sortable: true,
      width: "8%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (value: boolean, row: any) => (
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!value}
            disabled={!!estadoLoading[row.id]}
            onChange={async () => {
              setEstadoLoading((prev) => ({ ...prev, [row.id]: true }));
              try {
                await updatePaqueteStatus(row.id, !value);
                setPaquetes((prev) => prev.map((paq) =>
                  paq.id === row.id ? { ...paq, estado: !value } : paq
                ));
              } catch (e) {
                alert("No se pudo cambiar el estado del paquete");
              } finally {
                setEstadoLoading((prev) => ({ ...prev, [row.id]: false }));
              }
            }}
          />
          <div
            className={`w-11 h-6 ${value ? "bg-[#cc3399]" : "bg-gray-300"} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full transition-colors duration-200`}
          ></div>
          <div
            className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${value ? "translate-x-5" : ""}`}
          ></div>
        </label>
      ),
    },
    {
      key: "acciones",
      label: t("acciones") || "Acciones",
      sortable: false,
      width: "10%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (_: any, row: any) => (
        <div className="flex gap-2 justify-center">
          <button
            className="px-3 py-1 rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-xs transition-colors"
            onClick={() => {
              setViewPaquete(row);
              setShowViewModal(true);
            }}
            title="Ver detalles"
            style={{ background: "#fff" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cc3399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button
            className="px-3 py-1 rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-xs transition-colors"
            onClick={() => {
              setEditPaquete(row);
              setShowForm(true);
            }}
            title="Editar paquete"
            style={{ background: "#fff" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cc3399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  // Obtener el total absoluto de paquetes sin filtros
  const fetchTotalPaquetesAbsoluto = async () => {
    try {
      // Para el total absoluto, sin filtros ni paginación
      const data = await getPaquetes();
      if (typeof data.total === "number") {
        setTotalPaquetesAbsoluto(data.total);
      } else if (Array.isArray(data.data)) {
        setTotalPaquetesAbsoluto(data.data.length);
      }
    } catch (error) {
      console.error("Error obteniendo total absoluto:", error);
      setTotalPaquetesAbsoluto(0);
    }
  };

  // Cargar paquetes desde la API con paginación, búsqueda y filtro de estado
  const fetchPaquetes = async () => {
    setLoading(true);
    try {
      // Mapear paginación y búsqueda a los parámetros de la API
      const params: any = {};
      if (search) params.busqueda = search;
      if (perPage) params.limit = perPage;
      if (page && perPage) params.offset = (page - 1) * perPage;
      const data = await getPaquetes(params);
      setPaquetes(Array.isArray(data.data) ? data.data : []);
      // Calcular total de páginas si la API no lo da
      const total = typeof data.total === "number" ? data.total : (Array.isArray(data.data) ? data.data.length : 1);
      setTotalPages(Math.max(1, Math.ceil(total / perPage)));
      setTotalPaquetes(total);
    } catch (error) {
      console.error("Error cargando paquetes:", error);
      setPaquetes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Cargar paquetes cuando cambian los parámetros
  useEffect(() => {
    fetchPaquetes();
    // eslint-disable-next-line
  }, [search, page, perPage, estadoFiltro]);

  // Solo una vez al montar el componente, obtener el total absoluto
  useEffect(() => {
    fetchTotalPaquetesAbsoluto();
  }, []);

  // Filtrar activos/inactivos/todos en el frontend
  let paginatedPaquetes = paquetes;
  if (estadoFiltro === "activos") {
    paginatedPaquetes = paquetes.filter((p) => p.estado === true || p.estado === 1);
  } else if (estadoFiltro === "inactivos") {
    paginatedPaquetes = paquetes.filter((p) => p.estado === false || p.estado === 0);
  }
  const totalFilteredPages = totalPages;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-xl" style={{ fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
        {/* Sección de formulario cuando showForm está activo */}
        {showForm ? (
          <div className="p-0">
            {/* Header igual a Materiales */}
            <div className="px-2 py-1 sm:px-8 rounded-t-lg flex items-center justify-between" style={{ background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)" }}>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3 m-0" style={{ fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
                <span role="img" aria-label="box">📦</span>
                {editPaquete ? t("editarPaquete") : t("agregarPquete")}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditPaquete(null);
                }}
                className="px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center font-bold"
                style={{ background: "#cc3399", color: "#fff", fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}
              >
                {t("verTabla") || "Tabla"}
              </button>
            </div>
            <div className="p-4 pt-2">
              <FormPaquete
                paquete={editPaquete}
                onSaved={(nuevoPaquete) => {
                  // Actualizar la lista de paquetes
                  if (editPaquete) {
                    setPaquetes((prev) => prev.map((p) =>
                      p.id === editPaquete.id ? { ...p, ...nuevoPaquete } : p
                    ));
                    setShowForm(false);
                    setEditPaquete(null);
                  } else {
                    // Simular ID para nuevo paquete
                    const newId = Math.max(...paquetes.map((p) => p.id || 0), 0) + 1;
                    setPaquetes((prev) => [...prev, { ...nuevoPaquete, id: newId }]);
                    // No cerrar el formulario, permanece abierto
                  }
                  fetchPaquetes();
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditPaquete(null);
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Header y barra de acciones igual a Materiales */}
            <div className="px-2 py-1 sm:px-8" style={{ background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)" }}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
                    <span role="img" aria-label="box">📦</span>
                    {t("paquetes")}
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
                  {!showForm && (
                    <>
                      <select
                        value={estadoFiltro}
                        onChange={(e) => {
                          setEstadoFiltro(e.target.value);
                          setPage(1);
                        }}
                        className="w-full sm:w-40 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
                        style={{ minWidth: 0 }}
                      >
                        <option value="todos">{t("todos") || "Todos"}</option>
                        <option value="activos">{t("activos") || "Activos"}</option>
                        <option value="inactivos">{t("inactivos") || "Inactivos"}</option>
                      </select>
                      <input
                        type="text"
                        placeholder={t("buscar") || "Buscar"}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full sm:w-64 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
                        style={{ minWidth: 0 }}
                      />
                    </>
                  )}
                  <button
                    onClick={() => {
                      setEditPaquete(null);
                      setShowForm((prev) => {
                        const next = !prev;
                        if (next) {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                        return next;
                      });
                    }}
                    className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                    style={{ background: "#cc3399", color: "#fff", fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}
                  >
                    {showForm ? t("verTabla") || "Ver Tabla" : t("agregar") || "Agregar"}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tabla de paquetes usando GenericTable */}
            <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "80vh" }}>
              <GenericTable
                data={paginatedPaquetes}
                columns={columns}
                error={""}
                showActions={false}
                hideSearch={true}
                page={page}
                setPage={setPage}
                totalPages={totalFilteredPages}
                perPage={perPage}
                setPerPage={setPerPage}
                showPagination={true}
                emptyMessage={search ? "No hay resultados" : "No hay paquetes registrados."}
                actionColumnLabel="Acciones"
              />
            </div>
            
            {/* Paginación */}
           
          </>
        )}
        
        {/* Modal para ver detalles del paquete */}
        {showViewModal && viewPaquete && (
          <PaqueteViewModal
            paquete={viewPaquete}
            onClose={() => {
              setShowViewModal(false);
              setViewPaquete(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default PaquetesPage;
