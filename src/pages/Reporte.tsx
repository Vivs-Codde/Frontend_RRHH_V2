
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ClientesTable from "../components/forms/ClientesTable";
import ProductosPanel from "../components/forms/ProductosPanel";
import { productoService } from "../services/productoService";
import { API_ENDPOINTS, getAuthHeaders } from "../constants/api";
import { exportToExcel, exportArraysToExcel } from "../utils/excelUtils";

// Puedes importar los filtros y lógica de productos/clientes según tu estructura

const Reporte: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'clientes' | 'productos'>('clientes');

  // Estados y lógica para clientes
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [clientesError, setClientesError] = useState("");
  const [clientesSearch, setClientesSearch] = useState("");
  const [clientesEstado, setClientesEstado] = useState<string>("todos"); // nuevo filtro de estado
  const [clientesPage, setClientesPage] = useState(1);
  const [clientesPerPage, setClientesPerPage] = useState(10);
  const [clientesTotalPages, setClientesTotalPages] = useState(1);
  const [clientesAll, setClientesAll] = useState<any[]>([]); // Todos los clientes para paginación frontend

  // Estados y lógica para productos
  const [productos, setProductos] = useState<any[]>([]);
  const [productosLoading, setProductosLoading] = useState(false);
  const [productosSearch, setProductosSearch] = useState("");
  const [productosEstado, setProductosEstado] = useState<string>("todos"); // filtro de estado para productos
  const [productosPage, setProductosPage] = useState(1);
  const [productosPerPage, setProductosPerPage] = useState(10);
  const [productosTotalPages, setProductosTotalPages] = useState(1);
  const [productosAll, setProductosAll] = useState<any[]>([]); // Todos los productos para paginación frontend

  // TODO: Agrega aquí los filtros avanzados para clientes y productos

  // Función para exportar clientes a Excel
  const handleExportClientes = () => {
    if (!clientes.length) return;
    const total = clientesAll.length;
    const descargados = clientes.length;
    const fileName = `Reporte Clientes (${descargados} de ${total}).xlsx`;
    const titulo = 'Reporte Clientes';
    const exportData = clientes.map((c) => ({
      Nombre: c.NombreCliente || c.nombre || '',
      Código: c.codcustomer || '',
      Dirección: c.direccion || '',
      Ciudad: c.ciudad || '',
      Teléfono: c.telefono || '',
      Vendedor: c.vendedor?.nombre || c.vendedor || '',
      Estado: c.status === 1 || c.status === true ? t('common.active') : t('common.inactive'),
    }));
    // Configurar anchos de columna para ExcelJS
    const columnWidths = [30, 15, 30, 20, 15, 25, 10]; // Anchos para cada columna
    
    // Exportar directamente con los datos JSON
    exportToExcel(
      exportData,
      "Clientes",
      fileName,
      titulo,
      columnWidths
    );
  };

  // Función para exportar productos a Excel (solo los filtrados)
  const handleExportProductos = () => {
    if (!productos.length) return;
    const exportData = productos.map((p) => ({
      SKU: p.SKU,
      Nombre: p.nombreProducto,
      Descripción: p.descripcion,
      Categoría: p.categoria,
      Estado: p.estado === 1 || p.estado === true ? t("common.active") : t("common.inactive"),
    }));
    // Configurar anchos de columna para una mejor visualización
    const columnWidths = [15, 30, 30, 20, 10]; // Anchos para SKU, Nombre, Descripción, Categoría, Estado
    
    // Exportar directamente utilizando la nueva utilidad
    exportToExcel(
      exportData,
      "Productos",
      "Reporte_Productos.xlsx",
      "Reporte de Productos",
      columnWidths
    );
  };


  // Cargar todos los clientes al montar o al cambiar de tab
  useEffect(() => {
    if (tab === 'clientes') {
      setClientesLoading(true);
      setClientesError("");
      fetch(API_ENDPOINTS.CLIENTES.LIST, {
        headers: getAuthHeaders(),
      })
        .then(res => res.json())
        .then(data => {
          const clientesData = Array.isArray(data) ? data : data.data;
          setClientesAll(Array.isArray(clientesData) ? clientesData : []);
        })
        .catch(() => {
          setClientesAll([]);
          setClientesError("Error al cargar clientes");
        })
        .finally(() => setClientesLoading(false));
    }
  }, [tab]);

  // Filtrar y paginar clientes (incluye filtro por estado)
  useEffect(() => {
    let filtered = clientesAll;
    // Filtro por búsqueda general
    if (clientesSearch) {
      filtered = filtered.filter((c) =>
        [
          c.NombreCliente,
          c.nombre,
          c.codcustomer,
          c.direccion,
          c.ciudad,
          c.telefono,
          c.vendedor?.nombre,
          c.vendedor,
        ]
          .join(" ")
          .toLowerCase()
          .includes(clientesSearch.toLowerCase())
      );
    }
    // Filtro por estado
    if (clientesEstado !== "todos") {
      filtered = filtered.filter((c) => {
        const status = c.status === 1 || c.status === true ? "activo" : "inactivo";
        return clientesEstado === status;
      });
    }
    const total = filtered.length;
    setClientesTotalPages(Math.max(1, Math.ceil(total / clientesPerPage)));
    const start = (clientesPage - 1) * clientesPerPage;
    const end = start + clientesPerPage;
    setClientes(filtered.slice(start, end));
  }, [clientesAll, clientesSearch, clientesEstado, clientesPage, clientesPerPage]);

  // Cargar todos los productos al montar o al cambiar de tab
  useEffect(() => {
    if (tab === 'productos') {
      setProductosLoading(true);
      productoService.buscarPorFlores({})
        .then((data: any[]) => {
          setProductosAll(Array.isArray(data) ? data : []);
        })
        .catch(() => setProductosAll([]))
        .finally(() => setProductosLoading(false));
    }
  }, [tab]);

  // Filtrar y paginar productos (incluye filtro por estado)
  useEffect(() => {
    let filtered = productosAll;
    if (productosSearch) {
      filtered = filtered.filter((p) =>
        [
          p.SKU,
          p.nombreProducto,
          p.descripcion,
          p.categoria,
          p.estado?.toString(),
        ]
          .join(" ")
          .toLowerCase()
          .includes(productosSearch.toLowerCase())
      );
    }
    if (productosEstado !== "todos") {
      filtered = filtered.filter((p) => {
        const status = p.estado === 1 || p.estado === true ? "activo" : "inactivo";
        return productosEstado === status;
      });
    }
    const total = filtered.length;
    setProductosTotalPages(Math.max(1, Math.ceil(total / productosPerPage)));
    const start = (productosPage - 1) * productosPerPage;
    const end = start + productosPerPage;
    setProductos(filtered.slice(start, end));
  }, [productosAll, productosSearch, productosEstado, productosPage, productosPerPage]);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="w-full  px-0">
        <div className="px-0 py-6">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4 w-full">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              {t("report.title", "Reportes")}
            </h1>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'clientes' ? 'bg-fuchsia-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                style={{background: tab === 'clientes' ? '#cc3399' : '#f3f4f6'}}
                onClick={() => setTab('clientes')}
              >
                {t('clients.title', 'Clientes')}
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'productos' ? 'bg-fuchsia-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                style={{background: tab === 'productos' ? '#cc3399' : '#f3f4f6'}}
                onClick={() => setTab('productos')}
              >
                {t('products.title', 'Productos')}
              </button>
            </div>
            {/* Contenido de cada tab */}
            {tab === 'clientes' && (
              <div>
                {/* Filtros de clientes aquí */}
                <div className="mb-4">
                  {/* Filtros de clientes: búsqueda general y por estado y botón de exportar en la misma fila */}
                  <div className="bg-gray-50 p-3 rounded flex flex-wrap gap-3 items-end justify-between">
                    <div className="flex flex-wrap gap-3 items-end">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span>{t('common.search', 'Buscar')}</span>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 text-sm"
                          placeholder={t('common.search', 'Buscar...')}
                          value={clientesSearch}
                          onChange={e => { setClientesSearch(e.target.value); setClientesPage(1); }}
                          style={{ minWidth: 180 }}
                        />
                      </label>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span>{t('common.status', 'Estado')}</span>
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={clientesEstado}
                          onChange={e => { setClientesEstado(e.target.value); setClientesPage(1); }}
                        >
                          <option value="todos">{t('common.all', 'Todos')}</option>
                          <option value="activo">{t('common.active', 'Activo')}</option>
                          <option value="inactivo">{t('common.inactive', 'Inactivo')}</option>
                        </select>
                      </label>
                    </div>
                    <button
                      onClick={handleExportClientes}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      style={{background: '#cc3399'}}
                    >
                      {t('common.exportExcel', 'Descargar Excel')}
                    </button>
                  </div>
                </div>
                {/* Tabla de clientes */}
                <ClientesTable
                  customers={clientes}
                  loading={clientesLoading}
                  error={clientesError}
                  onEdit={() => {}} // No-op handler for report view
                  search={clientesSearch}
                  setSearch={setClientesSearch}
                  page={clientesPage}
                  setPage={setClientesPage}
                  totalPages={clientesTotalPages}
                  perPage={clientesPerPage}
                  setPerPage={setClientesPerPage}
                  hideSearch={false}
                  reportMode={true}
                />
              </div>
            )}
            {tab === 'productos' && (
              <ProductosPanel onExport={exportarProductos => {
                if (!exportarProductos || !exportarProductos.length) return;
                const total = productosAll.length;
                const descargados = exportarProductos.length;
                const fileName = `Reporte Productos (${descargados} de ${total}).xlsx`;
                const titulo = 'Reporte Productos';
                // Estructura igual a Productos.tsx
                const exportData = exportarProductos.map((producto) => {
                  let floresInfo = "";
                  if (
                    ["bouquete", "consumer bounch"].includes(producto.categoria?.toLowerCase?.()) &&
                    Array.isArray(producto.flores)
                  ) {
                    floresInfo = producto.flores
                      .map(
                        (flor: { variedad?: string; tipo: string; color?: string; calibre?: string; pivot?: { tallos: number } }) =>
                          `Variedad: ${flor.variedad}, Tipo: ${flor.tipo}, Color: ${flor.color}, Calibre: ${flor.calibre}, Tallos: ${flor.pivot?.tallos}`
                      )
                      .join("\n");
                  }
                  return {
                    SKU: producto.SKU,
                    Nombre: producto.nombreProducto,
                    Descripción: producto.descripcion,
                    Categoría: producto.categoria,
                    Estado: producto.estado === 1 || producto.estado === true ? t("common.active") : t("common.inactive"),
                    Flores: floresInfo,
                  };
                });
                // Configurar anchos de columna para una mejor visualización
                const columnWidths = [15, 30, 40, 20, 10, 60]; // SKU, Nombre, Descripción, Categoría, Estado, Flores
                
                // Exportar directamente con la nueva utilidad
                exportToExcel(
                  exportData,
                  "Productos",
                  fileName,
                  titulo,
                  columnWidths
                );
              }} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reporte;
