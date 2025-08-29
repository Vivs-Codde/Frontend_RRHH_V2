// Helpers para Producto: SKU y nombre automático
import type { Producto, ProductoFormData } from "../types/producto";

export function generateSKU(
  data: ProductoFormData,
  categorias: any[],
  tiposVariedad: any[],
  allProducts: Producto[]
) {
  // Buscar la categoría y subcategoría por tipo y por id
  const categoriaObj = categorias.find((c) => c.tipo === data.categoria || c.id.toString() === data.categoria);
  const subcategoriaObj = tiposVariedad.find((t) => t.id === data.subcategoria || t.id.toString() === data.subcategoria);

  // Usar la primera letra del tipo de la categoría si existe, si no, de nombreCategoria
  const categoriaInicial = (categoriaObj?.tipo || categoriaObj?.nombreCategoria || "").replace(/[^a-zA-Z]/g, "").charAt(0).toUpperCase();

  // Condición especial para BQT: usar la inicial del nombre ingresado
  const subcategoriaInicial = data.categoria === "BQT"
    ? (data.nombreProducto || "").replace(/[^a-zA-Z]/g, "").charAt(0).toUpperCase()
    : (subcategoriaObj?.name || "").replace(/[^a-zA-Z]/g, "").charAt(0).toUpperCase();

  const prefix = `${categoriaInicial}${subcategoriaInicial}`;

  // Buscar el último número usado en los últimos 4 dígitos de todos los SKUs (sin importar prefijo)
  let maxNumber = 0;
  allProducts.forEach((p) => {
    if (p.SKU && p.SKU.length >= 4) {
      const numberPart = p.SKU.slice(-4);
      const number = parseInt(numberPart, 10);
      if (!isNaN(number) && number > maxNumber) {
        maxNumber = number;
      }
    }
  });

  const nextNumber = maxNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(4, "0");

  return `${prefix}${paddedNumber}`;
}

export function generateProductName(
  data: ProductoFormData,
  categorias: any[],
  tiposVariedad: any[],
  variedades: any[],
  colores: any[],
  calibres: any[]
) {
  const parts: string[] = [];
  const categoriaName =
    categorias.find((c) => c.id.toString() === data.categoria)?.nombreCategoria ||
    "";
  const subcategoriaName =
    tiposVariedad.find((t) => t.id.toString() === data.subcategoria)?.name ||
    "";
  const variedadName =
    variedades.find((v) => v.id.toString() === data.variedad)?.name || "";
  const colorName =
    colores.find((c) => c.id.toString() === data.color)?.name || "";
  const calibreName =
    calibres.find((c) => c.id_calibre.toString() === data.calibre)?.nombre_calibre_tipo ||
    "";

  if (categoriaName) parts.push(categoriaName);
  if (subcategoriaName) parts.push(subcategoriaName);
  if (data.tallos) parts.push(data.tallos);
  if (variedadName) parts.push(variedadName);
  if (colorName) parts.push(colorName);
  if (calibreName) parts.push(calibreName);

  return parts.join(" ");
}

export function generateProductSummary(
  data: ProductoFormData,
  categorias: any[] = [],
  tiposVariedad: any[] = [],
  variedades: any[] = [],
  colores: any[] = [],
  calibres: any[] = []
) {
  const categoria = categorias.find((c) => c.tipo === data.categoria);
  const tipo = categoria?.tipo || "";
  const nombre = data.categoria === "BQT" ? data.nombreProducto || "" : "";
  const subcategoria = tiposVariedad.find((t) => t.id === data.subcategoria)?.name || "";
  const tallos = data.tallos ? `${data.tallos}st` : "";
  const variedad = variedades.find((v) => v.id === data.variedad)?.name || "";
  const color = colores.find((c) => c.id === data.color)?.name || "";
  const calibre = calibres.find((c) => c.id_calibre === data.calibre)?.nombre_calibre_tipo || "";
  // Para BQT: BQT + nombre + subcat + tallos + variedad + color + calibre
  // Para otros: tipo + subcat + tallos + variedad + color + calibre
  return [
    tipo,
    nombre,
    subcategoria,
    tallos,
    variedad,
    color,
    calibre
  ].filter(Boolean).join(" ");
}
