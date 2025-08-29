// Archivo de tipos específicos para useClientes y hooks relacionados con ventas
// Este archivo unifica las definiciones necesarias y evita conflictos de importación

// Definición de Cliente para hooks de ventas
export interface Cliente {
  id: number;
  value?: number;
  label?: string;
  NombreCliente?: string;
  nombre?: string;
  codcustomer?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  locacion_id?: number;
  vendedor_id?: number;
  vendedor?: {
    id: number;
    nombre: string;
    apellido?: string;
  };
  estado?: string;
  ciudad?: string;
  zipcode?: string;
}
// Otros tipos necesarios para hooks de ventas
export interface Producto {
  id: number;
  value?: number;
  label?: string;
  descripcion?: string;
  nombre?: string;
  sku?: string;
  precio?: number;
  precioTotal?: string;
  resumen?: string;
  categoria?: string;
  receta?: any;
  flores?: Array<{
    id: number;
    variedad?: string;
    tipo: string;
    color?: string;
    calibre?: string;
    precios?: string;
    pivot?: {
      tallos: number;
    }
  }>;
  tiposFlores?: string[];
  numTallos?: number;
}
// Definición de ItemVenta
export interface ItemVenta {
  id: number;
  producto: Producto;
  cantidad: number;
  precio: number; // Precio de transferencia
  precioVenta?: number; // Precio de venta por tallo
  numeroDeTallos?: number; // Número total de tallos
  costoMateriales?: number; // Costo del paquete de materiales
  precioTotal?: number; // Precio total calculado (precioVenta * numeroDeTallos + costoMateriales)
  subtotal: number; // Subtotal (precioTotal * cantidad)
  observacion: string;
  floresDetalle?: Array<{
    id: number;
    variedad: string;
    tallos: number;
    precioVentaTallo: number;
  }>;
}
