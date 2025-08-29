import React, { useState, useEffect } from "react";
import AsignacionForm from "./AsignacionForm";
import { getAsignaciones } from "../../services/asignacionesService";
import { Edit2, Eye } from "lucide-react";
import AsignacionModal from "./AsignacionModal";
import { useTranslation } from "react-i18next";
const AsignacionPage: React.FC = () => {
  const { t } = useTranslation();
  // Estado para asignaciones creadas
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  // No loading para UX natural como Recetas
  const [error, setError] = useState<string | null>(null);
  // Estado para mostrar formulario o tabla
  const [showForm, setShowForm] = useState(false);
  // Estado para modal de ver asignación
  const [showModal, setShowModal] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<any | null>(
    null
  );
  // Estados para búsqueda y paginación
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Obtener asignaciones de la API con búsqueda y paginación
  useEffect(() => {
    if (!showForm) {
      // UX natural: no loading
      getAsignaciones()
        .then((res) => {
          let data = Array.isArray(res) ? res : res.data || [];
          if (search) {
            const s = search.toLowerCase();
            data = data.filter((a: any) => {
              const cliente = a.cliente || {};
              const nombreCliente = (
                cliente.NombreCliente ||
                cliente.nombre ||
                ""
              ).toLowerCase();
              const productos = Array.isArray(a.productos) ? a.productos : [];
              const productosStr = productos
                .map((p: any) => p.nombre || p.Nombre || "")
                .join(" ")
                .toLowerCase();
              return nombreCliente.includes(s) || productosStr.includes(s);
            });
          }
          const total = data.length;
          const start = (page - 1) * perPage;
          const end = start + perPage;
          setAsignaciones(data.slice(start, end));
          setTotalPages(Math.max(1, Math.ceil(total / perPage)));
          setError(null);
        })
        .catch(() => {
          setError("Error al cargar asignaciones");
          setAsignaciones([]);
          setTotalPages(1);
        });
    }
  }, [showForm, search, page, perPage]);

  // Manejar guardar asignación desde el formulario (puedes implementar POST si lo deseas)
  const handleGuardarAsignacion = () => {
    setShowForm(false);
  };

  // Manejar eliminar asignación (solo local, implementar DELETE si lo deseas)
  const handleEliminarAsignacion = (id: number) => {
    setAsignaciones((prev) => prev.filter((a) => a.id !== id));
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
              {t("titulo_asignacion")}
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
            <AsignacionForm
              onGuardar={handleGuardarAsignacion}
              onCancelar={() => setShowForm(false)}
            />
          ) : (
            <>
              {/* Lista de asignaciones guardadas */}
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
                          <th className="py-2 px-2 text-left">{t("cliente")}</th>
                          <th className="py-2 px-2 text-left">
                            {t("codigoCliente")}
                          </th>
                          <th className="py-2 px-2 text-left">{t("correo")}</th>
                          <th className="py-2 px-2 text-center">{t("productos")}</th>
                          <th className="py-2 px-2 text-center">
                            {t("totalRestricciones")}
                          </th>
                          <th className="py-2 px-2 text-center">{t("acciones")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {error && (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-center py-4 text-red-500"
                            >
                              {error}
                            </td>
                          </tr>
                        )}
                        {!error && asignaciones.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-center py-4 text-gray-400"
                            >
                              No hay asignaciones registradas.
                            </td>
                          </tr>
                        )}
                        {!error &&
                          asignaciones.map((asig, idx) => {
                            const cliente = asig.cliente || {};
                            const recetas = Array.isArray(asig.recetas)
                              ? asig.recetas
                              : [];
                            // # Productos únicos por producto_id
                            const productosUnicos = new Set(
                              recetas.map(
                                (r: any) =>
                                  r.producto?.id ||
                                  r.producto?.producto_id ||
                                  r.producto?.sku
                              )
                            );
                            // Total restricciones sumando todas las variedades excluidas de cada receta
                            const totalRestricciones = recetas.reduce(
                              (acc, r) =>
                                acc +
                                (Array.isArray(r.variedades_excluidas)
                                  ? r.variedades_excluidas.length
                                  : 0),
                              0
                            );
                            return (
                              <tr
                                key={cliente.id + "-" + idx}
                                className="border-b"
                              >
                                <td className="py-2 px-2 text-left">
                                  {cliente.NombreCliente ||
                                    cliente.nombre ||
                                    "-"}
                                </td>
                                <td className="py-2 px-2 text-left">
                                  {cliente.codcustomer || "-"}
                                </td>
                                <td className="py-2 px-2 text-left">
                                  {cliente.email || "-"}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {productosUnicos.size}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {totalRestricciones}
                                </td>
                                <td className="py-2 px-2 text-left">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                                      onClick={() => {
                                        /* Aquí puedes implementar la edición si lo deseas */
                                      }}
                                      title="Editar"
                                      style={{ background: "#fff" }}
                                    >
                                      <Edit2 size={18} color="#cc3399" />
                                    </button>
                                    <button
                                      className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                                      onClick={() => {
                                        setSelectedAsignacion(asig);
                                        setShowModal(true);
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
                      <div className="text-center py-4 text-red-500 bg-white rounded-lg shadow">
                        {error}
                      </div>
                    )}
                    {!error && asignaciones.length === 0 && (
                      <div className="text-center py-4 text-gray-400 bg-white rounded-lg shadow">
                        No hay asignaciones registradas.
                      </div>
                    )}
                    {!error &&
                      asignaciones.map((asig, idx) => {
                        const cliente = asig.cliente || {};
                        const productos = Array.isArray(asig.productos)
                          ? asig.productos
                          : [];
                        const totalRestricciones = productos.reduce(
                          (acc, p) =>
                            acc +
                            (Array.isArray(p.variedades_excluidas)
                              ? p.variedades_excluidas.length
                              : 0),
                          0
                        );
                        return (
                          <div
                            key={cliente.id + "-" + idx}
                            className="bg-white rounded-xl shadow border p-3 flex flex-col gap-2"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-500 font-semibold">
                                Cliente
                              </span>
                              <span className="text-base font-medium text-gray-900">
                                {cliente.NombreCliente || cliente.nombre || "-"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-500 font-semibold">
                                Dirección
                              </span>
                              <span className="text-sm text-gray-800">
                                {cliente.direccion || "-"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-500 font-semibold">
                                Correo
                              </span>
                              <span className="text-sm text-gray-800">
                                {cliente.email || "-"}
                              </span>
                            </div>
                            <div className="flex flex-row gap-4">
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-semibold">
                                  # Productos
                                </span>
                                <span className="text-sm text-gray-800">
                                  {productos.length}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-semibold">
                                  Total restricciones
                                </span>
                                <span className="text-sm text-gray-800">
                                  {totalRestricciones}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                              <button
                                className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                                onClick={() => {
                                  /* Aquí puedes implementar la edición si lo deseas */
                                }}
                                title="Editar"
                                style={{ background: "#fff" }}
                              >
                                <Edit2 size={18} color="#cc3399" />
                              </button>
                              <button
                                className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
                                onClick={() => {
                                  setSelectedAsignacion(asig);
                                  setShowModal(true);
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
                  {/* Paginación igual a Recetas */}
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
              {/* Modal para ver asignación */}
              {showModal && selectedAsignacion && (
                <AsignacionModal
                  asignacion={selectedAsignacion}
                  onClose={() => setShowModal(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsignacionPage;
