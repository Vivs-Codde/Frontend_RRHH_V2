import type { ClienteFormData } from '../types/cliente.types';

// Estado inicial para el formulario de cliente
export const initialClienteFormState: ClienteFormData = {
  NombreCliente: "",
  codcustomer: "",
  ciudad: "",
  direccion: "",
  direccionCobranzas: "",
  provincia: "",
  zipcode: "",
  contacto: "",
  telefono: "",
  email: "",
  emailFactura: "",
  pais: "",
  locacion: "",
  vendedor: "",
  carguera: "",
  tipoCliente: "",
  cuartoFrio: "",
  prioridad: "1",
  // Nuevos campos
  cupoCredito: "",
  contactoComercial: "",
  telefonoComercial: "",
  contactoFinanciero: "",
  telefonoFinanciero: "",
  contactoFactura: "",
  telefonoFacturacion: "",
  contactoTecnico: "",
  telefonoTecnico: "",
};
