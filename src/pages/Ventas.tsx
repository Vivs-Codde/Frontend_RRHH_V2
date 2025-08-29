import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormVentas from "./ventas/FormVentas";
import { getVentas } from "../services/ventasService";
import { Edit2, Eye } from "lucide-react";

const Ventas: React.FC = () => {
  const { t } = useTranslation();
  
  // Estado para ventas
  const [ventas, setVentas] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para mostrar formulario o tabla
  const [showForm, setShowForm] = useState(false);
  
  // Estados para búsqueda y paginación
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Obtener ventas de la API con búsqueda y paginación
  useEffect(() => {
    if (!showForm) {
      setError(null);
      const loadVentas = async () => {
        try {
          const res = await getVentas({ search, page, per_page: perPage });
          
          let data = Array.isArray(res) ? res : res.data || [];
          const total = Array.isArray(res) ? data.length : res.total || data.length;
          
          setVentas(data);
          setTotalPages(Math.max(1, Math.ceil(total / perPage)));
        } catch (error: any) {
          console.error("Error al cargar ventas:", error);
          setError(error.message || "Error al cargar ventas");
          setVentas([]);
          setTotalPages(1);
        }
      };
      
      loadVentas();
    }
  }, [showForm, search, page, perPage]);

  // Manejar guardar venta desde el formulario
  const handleGuardarVenta = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-0 m-0 w-full">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-none mx-0">
        <div
          className="px-4 sm:px-8 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          style={{
            background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)",
          }}
        >
          <div className="flex-1 min-w-0 text-left">
            <h2 className="text-3xl font-bold text-white truncate">
              {t("ventas.titulo")}
            </h2>
          </div>
          {!showForm && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end min-w-0">
              <input
                type="text"
                placeholder={t("buscar")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-64 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
                style={{ minWidth: 0 }}
              />
            </div>
          )}
          <button
            className="text-white font-semibold px-4 py-2 rounded shadow hover:bg-pink-100 transition-all"
            style={{ background: "#cc3399" }}
            onClick={() => setShowForm((f) => !f)}
          >
            {showForm ? t("tabla") : t("agregar")}
          </button>
        </div>
        <div className="p-2 sm:p-6">
          {showForm ? (
            <FormVentas
              onGuardar={handleGuardarVenta}
              onCancelar={() => setShowForm(false)}
            />
          ) : (
            <>
              {/* Lista de ventas */}
              <div
                className="space-y-4 overflow-y-auto"
                style={{ maxHeight: "80vh" }}
              >
                <div className="relative">
                  {/* Tabla en desktop, cards en móvil */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full border mt-2">
                      <thead>
                        <tr className="bg-[#cc3399] text-white">
                          <th className="py-2 px-2 text-left">{t("id")}</th>
                          <th className="py-2 px-2 text-left">{t("cliente")}</th>
                          <th className="py-2 px-2 text-left">{t("fecha")}</th>
                          <th className="py-2 px-2 text-center">{t("cantidad")}</th>
                          <th className="py-2 px-2 text-center">{t("precio")}</th>
                          <th className="py-2 px-2 text-center">{t("total")}</th>
                          <th className="py-2 px-2 text-center">{t("acciones")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {error && (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center py-4 px-4"
                            >
                              <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700 flex flex-col items-center">
                                <p className="font-semibold mb-1">Error al cargar datos</p>
                                <p className="text-sm">{error}</p>
                                <button 
                                  className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-1 rounded text-sm"
                                  onClick={() => {
                                    setError(null);
                                    setPage(1);
                                    // Volver a cargar
                                    getVentas({ search, page: 1, per_page: perPage })
                                      .then(res => {
                                        let data = Array.isArray(res) ? res : res.data || [];
                                        const total = Array.isArray(res) ? data.length : res.total || data.length;
                                        setVentas(data);
                                        setTotalPages(Math.max(1, Math.ceil(total / perPage)));
                                      })
                                      .catch(err => {
                                        setError(err.message || "Error al cargar ventas");
                                      });
                                  }}
                                >
                                  Reintentar
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                        {!error && ventas.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center py-8 px-4"
                            >
                              <div className="bg-gray-50 p-6 rounded border border-gray-200">
                                <p className="text-gray-600 mb-2">No hay ventas registradas.</p>
                                <button
                                  className="bg-[#cc3399] text-white px-4 py-2 rounded hover:bg-pink-700 text-sm transition-colors"
                                  onClick={() => setShowForm(true)}
                                >
                                  Crear primera venta
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                        {!error &&
                          ventas.map((venta, idx) => {
                            const cliente = venta.cliente || {};
                            return (
                              <tr
                                key={venta.id + "-" + idx}
                                className="border-b"
                              >
                                <td className="py-2 px-2 text-left">
                                  #{venta.id}
                                </td>
                                <td className="py-2 px-2 text-left">
                                  {cliente.NombreCliente ||
                                    cliente.nombre ||
                                    "-"}
                                </td>
                                <td className="py-2 px-2 text-left">
                                  {new Date(venta.created_at || venta.fecha).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {venta.cantidad}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  ${venta.precio?.toFixed(2)}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  ${venta.total?.toFixed(2)}
                                </td>
                                <td className="py-2 px-2 text-left">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                                      onClick={() => {
                                        /* Implementar edición */
                                      }}
                                      title="Editar"
                                      style={{ background: "#fff" }}
                                    >
                                      <Edit2 size={18} color="#cc3399" />
                                    </button>
                                    <button
                                      className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                                      onClick={() => {
                                        /* Implementar ver detalles */
                                      }}
                                      title="Ver"
                                      style={{ background: "#fff" }}
                                    >
                                      <Eye size={20} color="#cc3399" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Cards en móvil */}
                  <div className="sm:hidden flex flex-col gap-3 mt-2">
                    {error && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 flex flex-col items-center">
                        <p className="font-semibold mb-1">Error al cargar datos</p>
                        <p className="text-sm">{error}</p>
                        <button 
                          className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-1 rounded text-sm"
                          onClick={() => {
                            setError(null);
                            setPage(1);
                            // Volver a cargar
                            getVentas({ search, page: 1, per_page: perPage })
                              .then(res => {
                                let data = Array.isArray(res) ? res : res.data || [];
                                const total = Array.isArray(res) ? data.length : res.total || data.length;
                                setVentas(data);
                                setTotalPages(Math.max(1, Math.ceil(total / perPage)));
                              })
                              .catch(err => {
                                setError(err.message || "Error al cargar ventas");
                              });
                          }}
                        >
                          Reintentar
                        </button>
                      </div>
                    )}
                    {!error && ventas.length === 0 && (
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600 mb-2">No hay ventas registradas.</p>
                        <button
                          className="bg-[#cc3399] text-white px-4 py-2 rounded hover:bg-pink-700 text-sm transition-colors"
                          onClick={() => setShowForm(true)}
                        >
                          Crear primera venta
                        </button>
                      </div>
                    )}
                    {!error &&
                      ventas.map((venta, idx) => {
                        const cliente = venta.cliente || {};
                        return (
                          <div
                            key={venta.id + "-" + idx}
                            className="bg-white rounded-xl shadow border p-3 flex flex-col gap-2"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-semibold">
                                  ID
                                </span>
                                <span className="text-base font-medium text-gray-900">
                                  #{venta.id}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-500 font-semibold">
                                  Fecha
                                </span>
                                <span className="text-sm text-gray-800">
                                  {new Date(venta.created_at || venta.fecha).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-500 font-semibold">
                                Cliente
                              </span>
                              <span className="text-base font-medium text-gray-900">
                                {cliente.NombreCliente || cliente.nombre || "-"}
                              </span>
                            </div>
                            
                            <div className="flex flex-row justify-between gap-4">
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-semibold">
                                  Cantidad
                                </span>
                                <span className="text-sm text-gray-800">
                                  {venta.cantidad}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-semibold">
                                  Precio
                                </span>
                                <span className="text-sm text-gray-800">
                                  ${venta.precio?.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-semibold">
                                  Total
                                </span>
                                <span className="text-sm text-gray-800">
                                  ${venta.total?.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 justify-end mt-2">
                              <button
                                className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                                onClick={() => {
                                  /* Implementar edición */
                                }}
                                title="Editar"
                                style={{ background: "#fff" }}
                              >
                                <Edit2 size={18} color="#cc3399" />
                              </button>
                              <button
                                className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                                onClick={() => {
                                  /* Implementar ver detalles */
                                }}
                                title="Ver"
                                style={{ background: "#fff" }}
                              >
                                <Eye size={20} color="#cc3399" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* Paginación */}
                  <div className="flex flex-row items-center justify-between gap-2 mt-4 px-2 pb-2">
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 mx-auto">
                      <button
                        className={`rounded-full border border-pink-200 px-2 py-1 flex items-center justify-center hover:bg-pink-100 transition-colors ${
                          page === 1 ? "cursor-not-allowed" : ""
                        }`}
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-label="Anterior"
                        style={{
                          minWidth: 32,
                          minHeight: 32,
                          background: "#fff",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M15 19l-7-7 7-7"
                            stroke={page === 1 ? "#d1d5db" : "#cc3399"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <span className="text-sm font-semibold select-none">
                        {t("pagina")} {page} {t("de")} {totalPages}
                      </span>
                      <button
                        className={`rounded-full border border-pink-200 px-2 py-1 flex items-center justify-center hover:bg-pink-100 transition-colors ${
                          page === totalPages ? "cursor-not-allowed" : ""
                        }`}
                        disabled={page === totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        aria-label="Siguiente"
                        style={{
                          minWidth: 32,
                          minHeight: 32,
                          background: "#fff",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M9 5l7 7-7 7"
                            stroke={page === totalPages ? "#d1d5db" : "#cc3399"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="border border-pink-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                        value={perPage}
                        onChange={(e) => {
                          setPerPage(Number(e.target.value));
                          setPage(1);
                        }}
                        style={{ minWidth: 48 }}
                      >
                        {[5, 10, 20, 50].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ventas;
