import React, { useEffect, useState } from "react";
import { Edit2, Eye } from "lucide-react";
import { FileText } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import RecetaPDF from "../../components/RecetaPDF";
import Modal from "../../components/modals/Modal";
// @ts-ignore
import icono from "../../assets/icono-PDF.png";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import FormRecetas from "./FormRecetas";
import { getRecetas, updateRecetaStatus } from "../../services/recetasService";
import RecetaModal from "../../components/modals/RecetaModal";
import { useTranslation } from "react-i18next";

function RecetasPage() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [recetaEdit, setRecetaEdit] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState<any | null>(null);
  const [estadoLoading, setEstadoLoading] = useState<{ [id: number]: boolean }>(
    {}
  );
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfReceta, setPdfReceta] = useState<any | null>(null);

  const handleRecetaStatusChange = async (
    id: number,
    nuevoEstado: boolean | number
  ) => {
    setEstadoLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await updateRecetaStatus(id, nuevoEstado);
      setRecetas((prev) =>
        prev.map((rec) =>
          rec.id === id ? { ...rec, estado: nuevoEstado ? 1 : 0 } : rec
        )
      );
    } catch (e) {
      alert("No se pudo cambiar el estado de la receta");
    } finally {
      setEstadoLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Estado para el preview de imagen
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const columns: TableColumn[] = [
    {
      key: "imagen",
      label: t("imagen") || "Imagen",
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
      label: t("sku"),
      sortable: true,
      width: "25%",
      align: "left",
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm",
    },
    {
      key: "producto.descripcion",
      label: t("nombre_producto") || "Producto",
      sortable: true,
      width: "25%",
      align: "left",
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm",
      render: (_: any, row: any) =>
        row.producto?.descripcion || row.producto_descripcion || "-",
    },
    {
      key: "paquete_material.nombre",
      label: t("nombre_paquete") || "Paquete",
      sortable: true,
      width: "25%",
      align: "left",
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm",
      render: (_: any, row: any) =>
        row.paquete_material?.nombre || row.paquete_nombre || "-",
    },
    {
      key: "estado",
      label: t("estado") || "Estado",
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
              await handleRecetaStatusChange(row.id, !value);
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
      key: "acciones",
      label: t("acciones"),
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
              // Genera el PDF solo al hacer clic
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

  const fetchRecetas = async () => {
    setLoading(true);
    try {
      const params: any = {
        search,
        page,
        per_page: perPage,
      };
      const res = await getRecetas(params);
      setRecetas(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.last_page || res.total_pages || 1);
    } catch {
      setRecetas([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecetas();
    // eslint-disable-next-line
  }, [search, page, perPage]);

  return (
    <div className="min-h-screen bg-gray-100">
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
      <div
        className="bg-white rounded-2xl shadow-xl"
        style={{
          fontFamily:
            "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          className="px-2 py-2 sm:px-8"
          style={{
            background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="min-w-0">
              <h2
                className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 min-w-0 truncate"
                style={{
                  fontFamily:
                    "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                }}
              >
                <span role="img" aria-label="recipe" className="shrink-0">
                  📋
                </span>
                <span className="truncate">{t("titler")}</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end min-w-0">
              {!showForm && (
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
              )}
              <button
                onClick={() => {
                  setRecetaEdit(null);
                  setShowForm((prev) => {
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
                {showForm ? t("ver_tabla") : t("add")}
              </button>
            </div>
          </div>
        </div>
        <div className="block sm:flex sm:flex-row sm:items-center transition-all duration-300">
          <div className="transition-all duration-300 w-full">
            {!showForm && (
              <div
                className="space-y-4 overflow-y-auto"
                style={{ maxHeight: "80vh" }}
              >
                <div className="relative">
                  <GenericTable
                    data={recetas}
                    columns={columns}
                    error=""
                    showActions={false}
                    hideSearch={true}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    showPagination={true}
                    emptyMessage={
                      search
                        ? "No hay resultados"
                        : "No hay recetas registradas."
                    }
                    actionColumnLabel="Acciones"
                  />
                </div>
              </div>
            )}
            {showForm && (
              <div className="mb-8 mt-6 overflow-y-auto max-h-[80vh]">
                <FormRecetas
                  onSaved={() => {
                    fetchRecetas(); // Actualiza la tabla
                  }}
                />
              </div>
            )}
            {/* Modal para ver receta */}
            {showModal && selectedReceta && (
              <RecetaModal
                receta={selectedReceta}
                onClose={() => setShowModal(false)}
                onUpdated={() => fetchRecetas()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecetasPage;
