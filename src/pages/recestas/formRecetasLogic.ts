// Genera un SKU de receta combinando el SKU del producto y el SKU del paquete
export function generarSkuReceta(producto: any, paquete: any) {
  const skuProducto = producto?.SKU || producto?.sku || "";
  const skuPaquete = paquete?.SKU || paquete?.sku || "";
  if (!skuProducto && !skuPaquete) return "";
  if (!skuProducto) return skuPaquete;
  if (!skuPaquete) return skuProducto;
  // Quitar el guion medio, unir directamente
  return `${skuProducto}${skuPaquete}`;
}

// Genera el array recetas en el formato que espera la API
export function generarRecetasPayload({ productosSeleccionados, paquetesSeleccionados, productos, paquetes }: {
  productosSeleccionados: any[],
  paquetesSeleccionados: any[],
  productos: any[],
  paquetes: any[],
}): any[] {
  const recetas: any[] = [];
  productosSeleccionados.forEach(pid => {
    // Buscar el producto en la lista completa
    const producto = productos.find(p => p.id === pid);
    paquetesSeleccionados.forEach(pk => {
      // Buscar el paquete en la lista completa
      const paquete = paquetes.find(p => (p.id || p.paquete_id) === (pk.id || pk.paquete_id)) || pk;
      // Calcular el precio: suma de precioTotal del producto y del paquete
      const costoProducto = Number(producto?.precioTotal ?? 0);
      const costoPaquete = Number(paquete?.precioTotal ?? 0);
      recetas.push({
        sku: generarSkuReceta(producto, paquete),
        producto_id: producto.id,
        paquete_material_id: paquete.id || paquete.paquete_id,
        cantidad: 1,
        precio: costoProducto + costoPaquete,
      });
    });
  });
  return recetas;
}
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../constants/api";
import { getMateriales } from "../../services/materialesService";
import { API_CULTIVO_COMBO_TIPO_VARIEDAD_API } from "../../constants/apiCultivo";
import type { TipoVariedad } from "../../constants/apiCultivo";

export type CategoriaOption = { value: string; label: string };
export type TipoFlorOption = { value: string; label: string };

export function useFormRecetasLogic(onSaved?: () => void) {
  // Modal confirmación
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaOption[]>([]);
  const [tipoFloresFiltro, setTipoFloresFiltro] = useState<TipoFlorOption[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; nombreCategoria: string }[]>([]);
  const [tiposFloresOptions, setTiposFloresOptions] = useState<TipoFlorOption[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);

  const handleCheck = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCheckAll = async () => {
    if (selectedIds.length === totalProductos) {
      setSelectedIds([]);
    } else {
      // Obtener todos los productos activos filtrados (todas las páginas)
      const all = await fetchProductosActivos(categoriaFiltro, tipoFloresFiltro);
      setSelectedIds(all.map((p: any) => p.id));
    }
  };

  useEffect(() => {
    async function loadCategorias() {
      try {
        const res = await fetch(API_ENDPOINTS.CATEGORIAS.LIST, {
          headers: { accept: "application/json" },
        });
        const data = await res.json();
        const categorias = Array.isArray(data) ? data : data.data;
        setCategorias(Array.isArray(categorias) ? categorias : []);
      } catch {
        setCategorias([]);
      }
    }
    async function loadTiposVariedad() {
      try {
        const res = await fetch(API_CULTIVO_COMBO_TIPO_VARIEDAD_API, {
          headers: { accept: "application/json" },
        });
        const data = await res.json();
        const tipos = Array.isArray(data.data) ? data.data : [];
        setTiposFloresOptions(
          tipos.map((t: any) => ({
            value: t.name || t.nombre || t.tipo || "",
            label: t.name || t.nombre || t.tipo || ""
          }))
        );
      } catch {
        setTiposFloresOptions([]);
      }
    }
    loadCategorias();
    loadTiposVariedad();
  }, []);

  useEffect(() => {
    async function buscarProductos() {
      try {
        const searchParams: Record<string, string | number | boolean> = {};
        searchParams.estado = true;
        if (categoriaFiltro.length > 0)
          searchParams.categoria = categoriaFiltro.map(c => c.value).join(",");
        if (tipoFloresFiltro.length > 0)
          searchParams.tipos_flores = tipoFloresFiltro.map(t => t.value).join(",");
        searchParams.per_page = perPage;
        searchParams.page = page;
        const url = API_ENDPOINTS.PRODUCTOS.LIST + "?" + new URLSearchParams(searchParams as any);
        const res = await fetch(url, {
          headers: { accept: "application/json" },
        });
        const data = await res.json();
        const productos = Array.isArray(data.productos) ? data.productos : [];
        const mapped = productos.map((p: { 
          sku?: string; 
          SKU?: string; 
          nombreProducto?: string; 
          nombre?: string;
          descripcion?: string;
          categoria?: string;
          nombreCategoria?: string;
          [key: string]: any;
        }) => ({
          ...p,
          SKU: p.sku || p.SKU,
          nombreProducto: p.nombreProducto || p.nombre,
          descripcion: p.descripcion,
          categoria: p.categoria || p.nombreCategoria
        }));
        setProductos(mapped);
        if (data.pagination) {
          setTotalPages(data.pagination.last_page || 1);
          setTotalProductos(data.pagination.total || mapped.length);
        } else {
          setTotalPages(1);
          setTotalProductos(mapped.length);
        }
      } catch {
        setProductos([]);
        setTotalPages(1);
        setTotalProductos(0);
      }
    }
    buscarProductos();
  }, [categoriaFiltro, tipoFloresFiltro, page, perPage]);

  return {
    selectedIds,
    setSelectedIds,
    categoriaFiltro,
    setCategoriaFiltro,
    tipoFloresFiltro,
    setTipoFloresFiltro,
    productos,
    categorias,
    tiposFloresOptions,
    page,
    setPage,
    perPage,
    setPerPage,
    totalPages,
    totalProductos,
    handleCheck,
    handleCheckAll,
  };
}

// Función para obtener productos activos filtrados (igual que en el componente)
export async function fetchProductosActivos(categorias: CategoriaOption[], tiposFlores: TipoFlorOption[]) {
  try {
    const res = await fetch(API_ENDPOINTS.PRODUCTOS.LIST, {
      headers: { accept: "application/json" },
    });
    const data = await res.json();
    const productos = Array.isArray(data.productos) ? data.productos : [];
    
    interface Producto {
      estado?: number;
      categoria?: string;
      nombreCategoria?: string;
      tipo?: string;
      [key: string]: any;
    }
    
    let activos = productos.filter((p: Producto) => p.estado === 1);
    if (categorias && categorias.length > 0) {
      const selectedCats = categorias.map(c => c.value);
      activos = activos.filter((p: Producto) => 
        (p.categoria && selectedCats.includes(p.categoria)) || 
        (p.nombreCategoria && selectedCats.includes(p.nombreCategoria))
      );
    }
    if (tiposFlores && tiposFlores.length > 0) {
      const selectedTipos = tiposFlores.map(t => t.value);
      activos = activos.filter((p: Producto) => p.tipo && selectedTipos.includes(p.tipo));
    }
    return activos;
  } catch (err) {
    return [];
  }
}
