import type { FieldErrors } from '../types/cliente.types';
// Definimos nuestro propio tipo para la función de traducción
type TranslateFunction = (key: string, options?: any) => string;

// Función para traducir etiquetas de campos
export const getFieldLabels = (t: TranslateFunction) => ({
  NombreCliente: t("clients.form.clientNumber", "Name"),
  codcustomer: t("clients.form.code", "Code"),
  provincia: t("clients.form.state", "State/Province"),
  ciudad: t("clients.form.city", "City"),
  direccion: t("clients.form.address", "Address"),
  contacto: t("clients.form.contact", "Contacto"),
  telefono: t("clients.form.phone", "Phone"),
  email: t("clients.form.email", "Email"),
  pais: t("clients.form.country", "Country"),
  locacion: t("clients.form.locationName", "Location"),
  vendedor: t("clients.form.salespersonName", "Salesperson"),
  carguera: t("clients.form.carrierName", "Carrier"),
  tipoCliente: t("clients.form.clientType", "Client Type"),
  cuartoFrio: t("clients.form.coolerName", "Cooler"),
  prioridad: "Prioridad",
});

// Campos requeridos para validación
export const requiredFields = [
  { key: "NombreCliente", label: "Nombre" },
  { key: "codcustomer", label: "Código" },
  { key: "provincia", label: "Provincia" },
  { key: "ciudad", label: "Ciudad" },
  { key: "direccion", label: "Dirección" },
  { key: "email", label: "Email" },
  { key: "pais", label: "País" },
  { key: "locacion", label: "Locación" },
  { key: "vendedor", label: "Vendedor" },
  { key: "tipoCliente", label: "Tipo de Cliente" },
];

// Validación de campos
export const validateRequiredField = (
  name: string,
  value: string,
  fieldLabels: Record<string, string>,
  t: TranslateFunction
): string => {
  if (!value || value.toString().trim() === "") {
    return t("fieldRequired", { field: fieldLabels[name] });
  }
  return "";
};

// Validar todo el formulario
export const validateClienteForm = (
  formData: any,
  fieldLabels: Record<string, string>,
  t: TranslateFunction,
  contactos: any[],
  carguerasSeleccionadas: any[]
): FieldErrors => {
  const errors: FieldErrors = {};
  
  requiredFields.forEach((f) => {
    if (!formData[f.key] || formData[f.key].toString().trim() === "") {
      errors[f.key] = t("fieldRequired", {
        field: fieldLabels[f.key] || f.label,
      });
    }
  });

  // Validar que haya al menos un contacto
  if (contactos.length === 0) {
    errors["contactos"] = t("fieldRequired", {
      field: t("clients.form.contact", "Contacto"),
    });
  }

  // Validar que haya al menos una carguera/cooler
  if (carguerasSeleccionadas.length === 0) {
    errors["cargueras"] = t("fieldRequired", {
      field:
        t("clients.form.carrierData") + " y " + t("clients.form.coolerData"),
    });
  }

  return errors;
};
