// Tipos para el formulario de cliente
export interface ClienteFormData {
  NombreCliente: string;
  codcustomer: string;
  ciudad: string;
  direccion: string;
  direccionCobranzas: string;
  provincia: string;
  zipcode: string;
  contacto: string;
  telefono: string;
  email: string;
  emailFactura: string;
  pais: string;
  locacion: string;
  vendedor: string;
  carguera: string;
  tipoCliente: string;
  cuartoFrio: string;
  prioridad: string;
  // Campo para cupo de crédito
  cupoCredito?: string;
  // Campos adicionales para contactos específicos
  contactoComercial?: string;
  telefonoComercial?: string;
  contactoFinanciero?: string;
  telefonoFinanciero?: string;
  contactoFactura?: string;  // Alineado con el backend
  telefonoFacturacion?: string;
  contactoTecnico?: string;
  telefonoTecnico?: string;
}

// Tipo para contactos
export interface Contacto {
  nombre: string;
  telefono: string;
}

// Tipo para cargueras y coolers
export interface CargueraCooler {
  id: string | number;
  cooler_id: string | number;
}

// Tipo para el payload de creación/actualización de cliente
export interface ClientePayload {
  NombreCliente: string;
  codcustomer: string;
  estado: string;
  ciudad: string;
  direccion: string;
  direccionCobranzas: string;
  zipcode: string;
  telefono: string;
  contacto: string;
  email: string;
  emailFactura: string;
  pais_id: number | null;
  locacion_id: number | null;
  vendedor_id: number | null;
  tipo_cliente_id: number | null;
  prioridad: string;
  cargueras: CargueraCooler[];
  orden?: number;
  // Campos adicionales
  cupoCredito?: string;
  contactoComercial?: string;
  contactoFinanciero?: string;
  contactoFactura?: string;
  contactoTecnico?: string;
  telefonoComercial?: string;
  telefonoFinanciero?: string;
  telefonoFacturacion?: string;
  telefonoTecnico?: string;
}

// Tipo para los select options
export interface SelectOption {
  id: string | number;
  label: string;
}

// Tipo para los errores de campo
export interface FieldErrors {
  [key: string]: string;
}

// Tipo para el modal
export interface ModalState {
  open: boolean;
  message: string;
  type: "success" | "error";
}
