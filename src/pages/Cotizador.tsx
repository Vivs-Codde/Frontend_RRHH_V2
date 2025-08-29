import React, { useState, lazy, useEffect } from "react";
import { useTranslation } from "react-i18next";
declare global {
  interface Window {
    __notificacionesRecetas?: { pendientes: number; cancelados: number };
  }
}
import { Eye } from "lucide-react";
import GenericTable from "../components/GenericTable";
import type { TableColumn } from "../components/GenericTable";
// @ts-ignore
import icono from "../assets/icono-PDF.png";
import { pdf } from "@react-pdf/renderer";
import RecetaPDF from "../components/RecetaPDF";
import RecetaModal from "../components/modals/RecetaModal";
const CotizadorDesglose = lazy(() => import("./CotizadorDesglose"));
import CotizadorProductoForm from "../components/cotizador/CotizadorProductoForm";
import CotizadorMaterialForm from "../components/cotizador/CotizadorMaterialForm";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { API_ENDPOINTS } from "../constants/api";
import { getRecetas } from "../services/recetasService";

const Cotizador: React.FC = () => {
  const { t } = useTranslation();
  // Estado para recetas cotizador (pendiente/rechazado)
  const [recetasCotizador, setRecetasCotizador] = useState<any[]>([]);
  const [allRecetas, setAllRecetas] = useState<any[]>([]);
  // Exportar conteo de pendientes y cancelados para el Header
  const pendientesCount = allRecetas.filter(
    (r) => r.estadoProceso === "pendiente"
  ).length;
  const canceladosCount = allRecetas.filter(
    (r) => r.estadoProceso === "rechazado"
  ).length;
  // Para compartir con Header, puedes usar contexto o prop drilling
  window.__notificacionesRecetas = {
    pendientes: pendientesCount,
    cancelados: canceladosCount,
  };
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [estadoLoading, setEstadoLoading] = useState<{ [id: number]: boolean }>(
    {}
  );
  // Columnas igual que en Recetas.tsx
  const columns: TableColumn[] = [
    {
      key: "imagen",
      label: t("image"),
      sortable: false,
      width: "1%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (_: any, row: any) =>
        row.imagen ? (
          <img
            src={`https://api-sales.eqrapp.com/storage/${row.imagen}`}
            alt="Receta"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 8,
              cursor: "pointer",
              border: "1px solid #eee",
            }}
            onMouseEnter={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setPreviewImg(
                `https://api-sales.eqrapp.com/storage/${row.imagen}`
              );
              setPreviewPos({ x: rect.right + 10, y: rect.top });
            }}
            onMouseLeave={() => {
              setPreviewImg(null);
            }}
            title={row.sku || "imagen"}
          />
        ) : null,
    },
    {
      key: "sku",
      label: "SKU",
      sortable: true,
      width: "25%",
      align: "left",
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm",
    },
    {
      key: "producto.descripcion",
      label: t("name_product"),
      sortable: true,
      width: "25%",
      align: "left",
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm",
      render: (_: any, row: any) =>
        row.producto?.descripcion || row.producto?.nombre || "-",
    },
    {
      key: "paquete_material.nombre",
      label: t("name_package"),
      sortable: true,
      width: "25%",
      align: "left",
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm",
      render: (_: any, row: any) =>
        row.paquete_material?.nombre || row.paquete_nombre || "-",
    },
    {
      key: "estado",
      label: t("state"),
      sortable: true,
      width: "15%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (value: number, row: any) => (
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!value}
            disabled={!!estadoLoading[row.id]}
            onChange={async () => {
              setEstadoLoading((prev) => ({ ...prev, [row.id]: true }));
              try {
                const { updateRecetaStatus } = await import(
                  "../services/cotizadorRecetaService"
                );
                await updateRecetaStatus(row.id, !value);
                setRecetasCotizador((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, estado: !value } : r
                  )
                );
              } catch (e) {
                alert("Error al cambiar el estado: " + (e?.message || e));
              }
              setEstadoLoading((prev) => ({ ...prev, [row.id]: false }));
            }}
          />
          <div
            className={`w-11 h-6 ${
              value ? "bg-[#cc3399]" : "bg-gray-300"
            } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full transition-colors duration-200`}
          ></div>
          <div
            className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
              value ? "translate-x-5" : ""
            }`}
          ></div>
        </label>
      ),
    },
    {
      key: "estadoProceso",
      label: t("state_process"),
      sortable: true,
      width: "15%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (_: any, row: any) => {
        let bg = "";
        if (row.estadoProceso === "pendiente")
          bg = "bg-orange-200 text-orange-900 font-bold rounded px-2 py-1";
        else if (row.estadoProceso === "rechazado")
          bg = "bg-red-200 text-red-900 font-bold rounded px-2 py-1";
        return <span className={bg}>{row.estadoProceso || "-"}</span>;
      },
    },
    {
      key: "acciones",
      label: t("actions"),
      sortable: false,
      width: "20%",
      align: "center",
      cellClassName: "py-2 px-2 text-center bg-white align-middle text-sm",
      render: (_: any, row: any) => (
        <div className="flex gap-2 justify-center">
          <button
            className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
            onClick={() => {
              setSelectedReceta(row);
              setShowModal(true);
            }}
            title="Ver"
            style={{ background: "#fff" }}
          >
            <Eye size={20} color="#cc3399" />
          </button>
          <button
            className="text-fuchsia-700 hover:text-fuchsia-900 rounded-full border border-fuchsia-200 bg-white flex items-center justify-center"
            title="Descargar PDF"
            style={{ background: "#fff", width: 40, height: 40, padding: 0 }}
            onClick={async () => {
              const blob = await pdf(<RecetaPDF receta={row} />).toBlob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `receta_${row.sku || "factura"}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            }}
          >
            <img
              src={icono}
              alt="PDF"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "contain",
              }}
            />
          </button>
        </div>
      ),
    },
  ];
  const [showModal, setShowModal] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState<any | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [showForms, setShowForms] = useState(false);
  const [productoData, setProductoData] = useState<any>(null);
  const [paqueteData, setPaqueteData] = useState<any>(null);
  const [clientesSeleccionados, setClientesSeleccionados] = useState<any[]>([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState<any>(null);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [formError, setFormError] = useState<string>("");
  const [showDesglose, setShowDesglose] = useState(false);

  useEffect(() => {
    const cargarVendedores = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.VENDEDORES.LIST, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        const vendedoresData = Array.isArray(data) ? data : data?.data || [];
        setVendedores(
          vendedoresData.map((v: any) => ({
            value: v.id.toString(),
            label: v.nombre,
            raw: v,
          }))
        );
        const savedVendedor = localStorage.getItem("cotizacionVendedor");
        if (savedVendedor) {
          try {
            const vendedor = JSON.parse(savedVendedor);
            setVendedorSeleccionado(vendedor);
          } catch (e) {
            console.error("Error al cargar el vendedor de localStorage:", e);
          }
        }
        const savedClientes = localStorage.getItem("cotizacionClientes");
        if (savedClientes) {
          try {
            const clientes = JSON.parse(savedClientes);
            setClientesSeleccionados(clientes);
          } catch (e) {
            console.error("Error al cargar los clientes de localStorage:", e);
          }
        }
      } catch (e) {
        console.error("Error al cargar vendedores:", e);
      }
    };
    cargarVendedores();
  }, []);

  // Fetch recetas cotizador con paginación y filtro
  // Traer todas las recetas y paginar en frontend solo pendientes/rechazadas
  const fetchAllRecetas = async () => {
    setLoading(true);
    try {
      let recetas: any[] = [];
      let currentPage = 1;
      let lastPage = 1;
      do {
        const res = await getRecetas({ page: currentPage, per_page: 100, estadoProceso: "pendiente,rechazado" });
        if (Array.isArray(res.data)) {
          recetas = recetas.concat(res.data);
        }
        lastPage = res.last_page || res.total_pages || 1;
        currentPage++;
      } while (currentPage <= lastPage);
      setAllRecetas(recetas);
    } catch {
      setAllRecetas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecetas();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Paginar en frontend
    const start = (page - 1) * perPage;
    const end = start + perPage;
    setRecetasCotizador(allRecetas.slice(start, end));
    setTotalPages(Math.max(1, Math.ceil(allRecetas.length / perPage)));
  }, [allRecetas, page, perPage]);

  useEffect(() => {
    if (clientesSeleccionados.length > 0) {
      localStorage.setItem(
        "cotizacionClientes",
        JSON.stringify(clientesSeleccionados)
      );
    }
    if (vendedorSeleccionado) {
      localStorage.setItem(
        "cotizacionVendedor",
        JSON.stringify(vendedorSeleccionado)
      );
    }
  }, [clientesSeleccionados, vendedorSeleccionado]);

  const handleProductoFormUpdate = (data: any) => {
    setProductoData(data);
  };

  const handleMaterialFormUpdate = (data: any) => {
    if (data) {
      const esPaqueteExistente = data.id && !isNaN(Number(data.id));
      const paqueteActualizado = {
        ...data,
        tipo: esPaqueteExistente ? "existente" : "nuevo",
        origen: "Cotizador",
        ...(esPaqueteExistente ? { paquete_id: data.id } : {}),
      };
      setPaqueteData(paqueteActualizado);
    } else {
      setPaqueteData(null);
    }
  };

  const handleCotizarClick = () => {
    setFormError("");
    if (clientesSeleccionados.length === 0) {
      setFormError(t("client_select"));
      return;
    }
    if (!vendedorSeleccionado) {
      setFormError(t("saleperson_select"));
      return;
    }
    if (!productoData) {
      setFormError(t("product_select"));
      return;
    }
    if (!paqueteData) {
      setFormError(t("package_select"));
      return;
    }
    if (
      !paqueteData.materiales ||
      !Array.isArray(paqueteData.materiales) ||
      paqueteData.materiales.length === 0
    ) {
      setFormError("El paquete seleccionado no tiene materiales definidos");
      return;
    }
    const nuevaCotizacionProducto = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      vendedor: vendedorSeleccionado,
      clientes: clientesSeleccionados,
      ...productoData,
      flores: productoData.flores || [],
      cbsItems: productoData.cbsItems || [],
    };
    const esPaqueteExistente = paqueteData.id && !isNaN(Number(paqueteData.id));
    const nuevaCotizacionMaterial = {
      id: paqueteData.id || Date.now() + 1,
      timestamp: new Date().toISOString(),
      tipo: esPaqueteExistente ? "existente" : "nuevo",
      paquete_id: esPaqueteExistente ? paqueteData.id : undefined,
      origen: "Cotizador",
      ...paqueteData,
    };
    setCotizaciones((prev) => [
      nuevaCotizacionProducto,
      nuevaCotizacionMaterial,
      ...prev,
    ]);
    localStorage.setItem(
      "cotizacionProducto",
      JSON.stringify(nuevaCotizacionProducto)
    );
    localStorage.setItem(
      "cotizacionPaquete",
      JSON.stringify(nuevaCotizacionMaterial)
    );
    setShowDesglose(true);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div
        className="px-2 py-1 sm:px-8 rounded-2xl"
        style={{
          background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="min-w-0 flex items-center gap-3">
            <span role="img" aria-label="tools" className="shrink-0 text-3xl">
              🛠️
            </span>
            <h1
              className="text-2xl sm:text-3xl font-bold text-white truncate"
              style={{
                fontFamily:
                  "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
              }}
            >
              {t("title_cotizador")}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end min-w-0">
            {showDesglose ? (
              <button
                className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                style={{
                  background: "#cc3399",
                  color: "#fff",
                  fontFamily:
                    "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                }}
                onClick={() => setShowDesglose(false)}
              >
                {t("return")}
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowForms((prev) => {
                    const next = !prev;
                    if (next) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    return next;
                  });
                }}
                className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                style={{
                  background: "#cc3399",
                  color: "#fff",
                  fontFamily:
                    "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                }}
              >
                {showForms ? t("table") : t("add")}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {showDesglose ? (
          <React.Suspense
            fallback={
              <div className="p-8 text-center">Cargando desglose...</div>
            }
          >
            <CotizadorDesglose onClose={() => setShowDesglose(false)} />
          </React.Suspense>
        ) : !showForms ? (
          <div className="overflow-x-auto">
            {/* Modal flotante de preview de imagen */}
            {previewImg && (
              <div
                style={{
                  position: "absolute",
                  left: previewPos.x,
                  top: previewPos.y,
                  zIndex: 9999,
                  background: "rgba(255,255,255,0.98)",
                  border: "1px solid #ccc",
                  borderRadius: 10,
                  boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
                  padding: 8,
                  pointerEvents: "none",
                }}
              >
                <img
                  src={previewImg}
                  alt="preview"
                  style={{
                    maxWidth: 320,
                    maxHeight: 320,
                    borderRadius: 8,
                    display: "block",
                  }}
                />
              </div>
            )}
            <GenericTable
              data={recetasCotizador}
              columns={columns}
              error={loading ? "Cargando..." : ""}
              showActions={false}
              hideSearch={true}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              perPage={perPage}
              setPerPage={setPerPage}
              showPagination={true}
              emptyMessage={
                loading
                  ? "Cargando..."
                  : "No hay recetas pendientes o rechazadas."
              }
              actionColumnLabel="Acciones"
            />
            {/* Modal para ver receta (reutilizando RecetaModal) */}
            {showModal && selectedReceta && (
              <RecetaModal
                receta={selectedReceta}
                onClose={() => setShowModal(false)}
                onUpdated={async () => {
                  // Actualiza la receta seleccionada al cerrar el modal
                  try {
                    const { getRecetasCotizador } = await import(
                      "../services/cotizadorRecetaService"
                    );
                    const recetasActualizadas = await getRecetasCotizador();
                    setRecetasCotizador(recetasActualizadas);
                  } catch (e) {
                    alert("Error al actualizar receta: " + (e?.message || e));
                  }
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {formError && (
              <div className="w-full text-center text-red-600 font-semibold bg-red-50 border border-red-200 rounded p-2 mb-2">
                {formError}
              </div>
            )}
            {/* Sección de clientes y vendedor fija (header) */}
            <div className="sticky top-0 z-10 border border-gray-300 rounded-lg p-6 bg-gray-50 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("client")} *
                  </label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    value={clientesSeleccionados[0] || null}
                    onChange={(selected) => {
                      setClientesSeleccionados(selected ? [selected] : []);
                      // Si el cliente tiene vendedor, lo asigna automáticamente
                      if (selected && selected.raw && selected.raw.vendedor) {
                        setVendedorSeleccionado({
                          value: selected.raw.vendedor.id.toString(),
                          label: selected.raw.vendedor.nombre,
                          raw: selected.raw.vendedor,
                        });
                      }
                    }}
                    loadOptions={async (inputValue) => {
                      try {
                        const res = await fetch(
                          `${
                            API_ENDPOINTS.CLIENTES.LIST
                          }?search=${encodeURIComponent(inputValue)}`,
                          {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "token"
                              )}`,
                            },
                          }
                        );
                        const data = await res.json();
                        const clientes = Array.isArray(data)
                          ? data
                          : data?.data || [];
                        return clientes.map((cli: any) => ({
                          value: cli.id?.toString() || cli.id,
                          label:
                            cli.NombreCliente ||
                            cli.nombre ||
                            cli.razon_social ||
                            cli.id,
                          raw: cli,
                        }));
                      } catch (e) {
                        console.error("Error al cargar clientes:", e);
                        return [];
                      }
                    }}
                    placeholder={t("select")}
                    classNamePrefix="react-select"
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("saleperson")} *
                  </label>
                  {vendedorSeleccionado ? (
                    <div className="p-2 bg-gray-100 rounded">
                      {vendedorSeleccionado.label}
                    </div>
                  ) : (
                    <Select
                      options={vendedores}
                      value={vendedorSeleccionado}
                      onChange={(selected) => setVendedorSeleccionado(selected)}
                      placeholder={t("select")}
                      classNamePrefix="react-select"
                      className="w-full"
                    />
                  )}
                </div>
                <div className="col-span-1">
                  <div className="p-2 bg-gray-50 rounded text-black-900">
                    {productoData && paqueteData && (
                      <div className="mt-0 pt-2 ">
                        <strong>{t("vegetable")}+{t("package")}</strong>
                        <div>
                          {" "}
                          $
                          {parseFloat(
                            productoData?.precioTotal ||
                              productoData?.precio_total ||
                              0
                          ).toFixed(2)}
                          +$
                          {Array.isArray(paqueteData.materiales)
                            ? paqueteData.materiales
                                .reduce((total: number, mat: any) => {
                                  const cantidad =
                                    parseFloat(
                                      mat.cantidad_material ?? mat.cantidad ?? 1
                                    ) || 1;
                                  const precio = parseFloat(mat.precio) || 0;
                                  return total + precio * cantidad;
                                }, 0)
                                .toFixed(2)
                            : "0.00"}
                          =$
                          {parseFloat(
                            (
                              parseFloat(
                                productoData?.precioTotal ||
                                  productoData?.precio_total ||
                                  0
                              ) +
                              (Array.isArray(paqueteData.materiales)
                                ? paqueteData.materiales.reduce(
                                    (total: number, mat: any) => {
                                      const cantidad =
                                        parseFloat(
                                          mat.cantidad_material ??
                                            mat.cantidad ??
                                            1
                                        ) || 1;
                                      const precio =
                                        parseFloat(mat.precio) || 0;
                                      return total + precio * cantidad;
                                    },
                                    0
                                  )
                                : 0)
                            ).toFixed(2)
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección con scroll para vegetal y material */}
            <div className="overflow-y-auto max-h-[calc(100vh-350px)] pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-lg font-semibold text-green-700">
                    {t("vegetable")}
                  </h2>
                  <CotizadorProductoForm onSubmit={handleProductoFormUpdate} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-orange-700">
                    {t("material")}
                  </h2>
                  <CotizadorMaterialForm onSubmit={handleMaterialFormUpdate} />
                </div>
              </div>
            </div>
            <div className="w-full flex justify-end mt-6">
              <button
                onClick={handleCotizarClick}
                style={{ background: "#cc3399", color: "#fff" }}
                className="px-8 py-3 rounded-lg font-medium text-lg transition-colors hover:bg-pink-700"
              >
                {t("quote")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cotizador;
