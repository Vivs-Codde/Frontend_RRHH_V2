import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import Layout from "../../components/Layout";
import GenericTable from "../../components/GenericTable";
import type { TableColumn } from "../../components/GenericTable";
import WizardCategoria from "../../components/wizards/categorias/WizardCategoria";
import { useCategoriaFormRefs } from "../../hooks/useCategoriaFormRefs";
import { categoriaService } from "../../services/categoriaService";
import type { Categoria } from "../../types/categoria";

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

const CategoriasPage: React.FC = () => {
  const { t } = useTranslation();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editCategoria, setEditCategoria] = useState<Categoria | null>(null);
  const isMobile = useIsMobile();
  // En móvil, el wizard inicia cerrado; en desktop, siempre abierto
  const [showWizard, setShowWizard] = useState(!isMobile ? true : false);

  useEffect(() => {
    // Si cambia el tamaño de pantalla, ajusta el estado
    setShowWizard(!isMobile ? true : false);
  }, [isMobile]);

  // Refs para el formulario
  const formRefs = useCategoriaFormRefs();

  const perPage = 10;

  // Filtrar categorías
  const filteredCategorias = categorias.filter((categoria) =>
    categoria.tipo.toLowerCase().includes(search.toLowerCase()) ||
    categoria.nombreCategoria.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredCategorias.length / perPage);
  const paginatedCategorias = filteredCategorias.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Configuración de columnas
  const columns: TableColumn[] = [
    {
      key: "tipo",
      label: t("tipo"),
      sortable: true,
      width: "40%"
    },
    {
      key: "nombreCategoria",
      label: t("nombreCategoria"),
      sortable: true,
      width: "60%"
    }
  ];

  // Cargar categorías
  const loadCategorias = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await categoriaService.getAll();
      setCategorias(data);
      
    } catch (err: any) {
      console.error("Error al cargar categorías:", err);
      setError(err.message || "Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadCategorias();
  }, []);

  // Manejar edición
  const handleEdit = (categoria: Categoria) => {
    setEditCategoria(categoria);
    setShowWizard(true);
  };

  // Manejar eliminación
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar esta categoría?")) {
      return;
    }

    try {
      await categoriaService.delete(id);
      await loadCategorias();
    } catch (error) {
      console.error("Error deleting categoria:", error);
      alert("Error al eliminar la categoría");
    }
  };

  // Manejar creación/actualización exitosa
  const handleCategoriaCreated = () => {
    loadCategorias();
    setEditCategoria(null);
    if (isMobile) setShowWizard(false);
  };

  // Manejar cierre del wizard
  const handleCloseWizard = () => {
    if (isMobile) setShowWizard(false);
    setEditCategoria(null);
  };

  return (
   <div className="min-h-screen bg-gray-100">
  <main className="w-full md:px-0 px-1">
    <div className={`flex ${!isMobile ? "flex-row" : "flex-col"} w-full max-w-full`}>
      {/* Tabla */}
      <div className={`${!isMobile ? "w-full md:w-[calc(100%-400px)]" : "w-full"} flex-shrink-0 overflow-x-auto`}>
        <div className={`bg-white shadow-md w-full h-full p-4 ${!isMobile ? "md:rounded-r-none rounded-lg" : "rounded-lg"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
            <div className="w-full sm:w-auto">
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                />
              </div>
              {/* Título centrado */}
              <div className="flex-1 flex justify-center items-center order-1 sm:order-2">
                <h3 className="text-xl font-semibold text-gray-800 text-center">
                  {t("titleca")}
                </h3>
              </div>
              {/* Botón agregar solo en móvil */}
              {isMobile && (
                <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setEditCategoria(null);
                      setShowWizard(true);
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
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Tabla de categorías */}
            <GenericTable
              data={paginatedCategorias}
              columns={columns}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions={true}
              search={search}
              setSearch={setSearch}
              hideSearch={true}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              perPage={perPage}
              showPagination={true}
              emptyMessage={t("common.noResults")}
              actionColumnLabel={t("actions")}
            />
          </div>
          </div>
          {/* Wizard Component visible según pantalla */}
          {showWizard && (
            <div className="w-full md:w-[400px] flex-shrink-0 h-full flex ml-4">
              <WizardCategoria
                showWizard={showWizard}
                setShowWizard={setShowWizard}
                refs={formRefs}
                onCreated={handleCategoriaCreated}
                editCategoria={editCategoria}
                onClose={handleCloseWizard}
                hideCloseButton={!isMobile}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CategoriasPage;
