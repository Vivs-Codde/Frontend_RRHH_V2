export interface Vendedor {
  id: number | string;
  nombre?: string;
  correo?: string;
  email?: string;
  emailFactura?: string;
}

export interface Cliente {
  id: number;
  numero: string;
  codigo: string;
  direccion: string;
  provincia: string;
  ciudad: string;
  codigoPostal?: string;
  telefono: string;
  correo?: string;
  email?: string;
  emailFactura?: string;
  contacto?: string;
  pais_id: number;
  locacion_id: number;
  vendedor_id: number;
  carguera?: number; // Opcional para compatibilidad
  cooler_id?: number;
  tipo_cliente_id: number;
  // Añadido para tipado flexible en frontend
  vendedor?: Vendedor | string | null;
  orden?: number;
}
