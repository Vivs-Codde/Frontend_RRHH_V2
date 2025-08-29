/**
 * Este archivo proporciona un mapeo entre los nombres de propiedades usadas
 * en el frontend y las propiedades del backend para productos.
 */

/**
 * Mapea las propiedades usadas en los formularios al formato esperado por la API
 */
export const productoPropsMap = {
  // Propiedades del frontend -> Propiedades del backend
  sku: 'SKU',
  category: 'categoria',
  subCategory: 'subcategoria',
  variety: 'variedad',
  grade: 'tallos',  
  caliber: 'calibre',
  status: 'estado',
};

/**
 * Mapea un producto del backend al formato usado en el frontend
 * @param producto Producto de la API
 * @returns Producto con formato para el frontend
 */
export function mapProductoToFrontend(producto) {
  return {
    id: producto.id,
    sku: producto.SKU,
    category: producto.categoria,
    subCategory: producto.subcategoria,
    variety: producto.variedad,
    color: producto.color,
    grade: producto.tallos,
    tallosBunche: producto.tallos ? parseInt(producto.tallos) : 0,
    caliber: producto.calibre,
    status: producto.estado?.toString(),
    // Mantener otros campos
    nombreProducto: producto.nombreProducto,
    created_at: producto.created_at,
    updated_at: producto.updated_at,
    flores: producto.flores,
  };
}

/**
 * Mapea un producto del frontend al formato esperado por el backend
 * @param producto Producto del formulario
 * @returns Producto con formato para la API
 */
export function mapProductoToBackend(producto) {
  return {
    nombreProducto: producto.sku || '', // Usar SKU como nombreProducto si no se especifica
    SKU: producto.sku,
    categoria: producto.category,
    subcategoria: producto.subCategory,
    variedad: producto.variety,
    color: producto.color,
    tallos: producto.grade || producto.tallosBunche?.toString(),
    calibre: producto.caliber,
    estado: producto.status === 'Activo' ? 1 : 0,
  };
}
