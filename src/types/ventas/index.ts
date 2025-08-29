// Interfaces para Ventas

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
  costoMateriales?: number;
}

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

export interface VentaData {
  cliente_id: number;
  fecha_entrega: string;
  items: Array<{
    producto_id: number;
    receta_id?: number;
    cantidad: number;
    precio: number;
    observacion?: string;
  }>;
  total: number;
}

export interface FormVentasProps {
  onGuardar: (venta?: any) => void;
  onCancelar: () => void;
}

export interface Marcacion {
  id: number;
  nombre: string;
  codigo?: string;
  estado?: string;
  ciudad?: string;
  direccion?: string;
  zipcode?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  pais_id?: number;
  locacion_id?: number;
  transporte_id?: number;
  cliente_id: number;
  status?: number;
  pais?: {
    id: number;
    nombre: string;
  };
  locacion?: {
    id: number;
    nombre: string;
    codigolocacion?: string;
    vendedor?: string;
  };
  transporte?: {
    id: number;
    placa?: string;
    propietario?: string;
    modelo?: string;
    chofer?: string;
  };
  cargueras?: Array<{
    id: number;
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    pivot?: {
      cooler_id?: number;
    };
  }>;
  cliente?: {
    id: number;
    NombreCliente?: string;
    vendedor_id?: number;
    vendedor?: {
      id: number;
      nombre?: string;
    };
  };
}

export interface MarcacionesResponse {
  cliente_id: string;
  marcaciones_count: number;
  marcaciones: Marcacion[];
}

export interface Caja {
  id: number;
  nombre: string;
  largo: number;
  ancho: number;
  profundidad: number;
  equivalencia: number;
  peso: number;
  estado: number;
  created_at: string;
  updated_at: string;
  calculoPalet?: any;
  calculoCamion?: any;
  calculoAvion?: any;
  calculoCarguera?: any;
}

export interface CajaProducto {
  caja_id: number;
  cantidad: number;
  caja: Caja;
}

export interface CajaProductoResponse {
  producto_id: string;
  producto: Producto;
  cajas: CajaProducto[];
}

export type TipoCaja = 'mixta' | 'solida';
