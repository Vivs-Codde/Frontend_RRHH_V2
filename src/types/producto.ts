export interface Producto {
  id: number;
  nombreProducto: string;
  SKU: string;
  descripcion?: string; // <-- agregado
  categoria_id: number;
  categoria: string;
  subcategoria: string;
  variedad: string;
  color: string;
  tallos: string;
  calibre: string;
  estado: number;
  vendedor?: string; // <-- campo agregado
   precioTotal?: number;
  created_at: string;
  updated_at: string;
  flores?: Array<{
    id: number;
    variedad: string;
    tipo: string;
    color: string;
    calibre: string;
    precios?: number | string;
    created_at: string;
    updated_at: string;
    pivot: {
      producto_id: number;
      flor_id: number;
      tallos: number;
      orden: number;
      precios?: number;
      created_at: string;
      updated_at: string;
    };
  }>;
  resumen?: string;
}

export interface ProductoFormData {
  nombreProducto: string;
  SKU: string;
  categoria: string;
  subcategoria: string;
  variedad: string;
  color: string;
  tallos: string;
  calibre: string;
  estado: number;
  vendedor?: string;
  precioTotal?: number;
  resumen?: string;
  descripcion?: string;
  // largo?: number | string;
  ancho?: number | string;
  alto?: number | string;
  peso?: number | string;
}
