
import React, { use, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import { Edit2, Eye } from "lucide-react";
import FormPrecios from "./FormPrecios";
import { precioService } from "../../services/precioService";
function PrecioPage() {
  // Estados para tabla y formulario
  const [showForm, setShowForm] = useState(false);
  const [precios, setPrecios] = useState<any[]>([]);
  const [totalPrecios, setTotalPrecios] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("todos"); // "todos", "activos", "inactivos"
  const { t } = useTranslation();
  const [estadoLoading, setEstadoLoading] = useState<{[id: number]: boolean}>({});
  const [editPrecio, setEditPrecio] = useState<any | null>(null);
  
  // Extraemos la función fetchPrecios para poder usarla en otros lugares del componente
  const fetchPrecios = async () => {
    setLoading(true);
    try {
      // Buscar por categoría o medida según el término de búsqueda
      let response;
      if (search) {
        // Si parece ser una medida (contiene números o unidades comunes), búsqueda por medida
        if (/\d/.test(search) || /cm|mm|kg|g|lb|oz/.test(search.toLowerCase())) {
          response = await precioService.getPreciosFiltered(undefined, search);
        } else {
          // Si parece ser texto sin números, búsqueda por categoría
          response = await precioService.getPreciosFiltered(search, undefined);
        }
      } else {
        response = await precioService.getAllPrecios();
      }

      // Adaptar datos para la tabla
      const adaptados = response.map((p: any) => {
        const adaptado = {
          id: p.Id,
          producto: p.Medida,
          categoria: p.Categoria,
          precioVenta: p.Precio,
          moneda: "USD", // Se mantiene para mostrar en la tabla
          estado: true,
          // Incluir los nuevos campos para la edición
          preciosDesglose: p.preciosDesglose || p.PreciosDesglose || "",
          preciosEQR: p.preciosEQR || p.PreciosEQR || "",
          // También mantener los nombres originales por si acaso
          medida: p.Medida,
          precio: p.Precio
        };
        
        return adaptado;
      });

      // Filtrar por estado si es necesario (filtrado en cliente ya que la API no tiene filtro por estado)
      let filtrados = adaptados;
      if (estadoFiltro === "activos") {
        filtrados = adaptados.filter(p => p.estado);
      } else if (estadoFiltro === "inactivos") {
        filtrados = adaptados.filter(p => !p.estado);
      }

      setPrecios(filtrados);
      setTotalPrecios(filtrados.length);
      setTotalPages(Math.ceil(filtrados.length / perPage));
    } catch (e) {
      setPrecios([]);
      setTotalPrecios(0);
      setTotalPages(1);
    }
    setLoading(false);
  };
  
  // Necesitamos incluir fetchPrecios en las dependencias para evitar warnings
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchPrecios();
  }, [search, estadoFiltro, perPage]);

  // Columnas para la tabla
  const columns: TableColumn[] = [
    { key: "categoria", label: t("categoria"), sortable: true, width: "10%", align: "left", cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm" },
    { key: "producto", label: t("calibre"), sortable: true, width: "15%", align: "left", cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm" },
    { 
      key: "precioVenta", 
      label: t("precioVenta"), 
      sortable: true, 
      width: "10%", 
      align: "left", 
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm",
      render: (value: string, row: any) => (
        <span>{value} {row.moneda}</span>
      )
    },
    { 
      key: "preciosEQR", 
      label: t("precioEqr"), 
      sortable: true, 
      width: "10%", 
      align: "left", 
      cellClassName: "py-2 px-2 text-left bg-white align-middle text-sm",
      render: (value: string, row: any) => (
        <span>{value ? `$${value}` : '-'}</span>
      )
    },
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
                // Simulación de cambio de estado
                setTimeout(() => {
                  setPrecios((prev) => prev.map((p) =>
                    p.id === row.id ? { ...p, estado: !value } : p
                  ));
                  setEstadoLoading((prev) => ({ ...prev, [row.id]: false }));
                }, 500);
              } catch (e) {
                alert("Error al cambiar el estado");
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
      key: "actions",
      label: t("acciones"),
      sortable: false,
      width: "10%",
      align: "center",
      cellClassName: "py-1 px-2 text-center bg-white align-middle text-sm",
      render: (_, row: any) => (
        <div className="flex justify-center space-x-1">
          <button
            className="px-3 py-2 rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-[#cc3399] font-semibold text-xs transition-colors"
            style={{background: "white"}}
            onClick={() => {
              setEditPrecio(row);
              setShowForm(true);
            }}
            title={t("editar")}
          >
            <Edit2 size={20} />
          </button>
          <button
            className="p-1 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-full hidden"
            onClick={() => {
              // Ver detalles
              alert(JSON.stringify(row, null, 2));
            }}
            title={t("ver")}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Paginación manual
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedPrecios = precios.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-xl" style={{ fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
        <div className="px-2 py-1 sm:px-8" style={{ background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)" }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
                <span role="img" aria-label="price-tag">💰</span>
                {t("precios")}
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
                    <option value="todos">{t("todos")}</option>
                    <option value="activos">{t("activos")}</option>
                    <option value="inactivos">{t("inactivos")}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={t("buscarPrecio")}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full sm:w-64 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
                    style={{ minWidth: 0 }}
                  />
                </>
              )}
              <button
                onClick={() => {
                  setEditPrecio(null); // Limpiar edición
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
                {showForm ? t("verTabla") : t("agregar")}
              </button>
            </div>
          </div>
        </div>
        <div className="block sm:flex sm:flex-row sm:items-center transition-all duration-300">
          <div className="transition-all duration-300 w-full">
            {!showForm && (
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "80vh" }}>
                <div className="relative">
                  <GenericTable
                    data={paginatedPrecios}
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
                    emptyMessage={search ? t("noResultados") : t("noPreciosRegistrados")}
                    actionColumnLabel={t("acciones")}
                  />
                </div>
              </div>
            )}
            {showForm && (
              <div className="mb-8 mt-6 overflow-y-auto max-h-[80vh]">
                <FormPrecios
                  key={editPrecio ? editPrecio.id : 'new'}
                  precio={editPrecio}
                  onSaved={(nuevoPrecio) => {
                    // En cualquier caso (edición o creación), actualizamos los datos
                    fetchPrecios();
                    
                    // Si estamos en modo edición, volvemos a la tabla
                    if (editPrecio) {
                      setEditPrecio(null);
                      setShowForm(false);
                    } else {
                      // Si estamos creando un nuevo precio, permanecemos en el formulario
                      // No cerramos el formulario para que el usuario pueda seguir agregando precios
                    }
                  }}
                  onCancel={() => {
                    // También refrescamos los datos al cancelar, por si acaso hubiera cambios en el servidor
                    fetchPrecios();
                    setEditPrecio(null);
                    setShowForm(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrecioPage;