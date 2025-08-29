import React, { useState, useEffect, useRef } from "react";
import { getClientes } from "../../services/marcacionesService";
import { useTranslation } from "react-i18next";
//import ClientesTable from "./ClientesTable";
import Marcaciones from "../../pages/clientepage/Marcaciones";
import {
  getMarcaciones,
  createMarcacion,
  updateMarcacion,
  deleteMarcacion,
} from "../../services/marcacionesService";
import {
  getLocaciones,
  getVendedores,
  getCoolers,
  getCargueras,
  getPaises,
  getTransportistas,
} from "../../services/entidadesService";
import WizartLocation from "../wizards/WizartLocation";
import WizardVendedor from "../wizards/WizardVendedor";
import WizartCooler from "../wizards/WizartCooler";
import WizardCarguera from "../wizards/WizardCarguera";

import type { Cliente } from "../../types/cliente";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Briefcase,
  Snowflake,
} from "lucide-react";
import AddressSearch from "../AddressSearch";
import type { PlaceData } from "../PlaceAutocomplete";
import { API_ENDPOINTS, getAuthHeaders } from "../../constants/api";
import "../../index.css"; // Asegúrate de importar el CSS global si no está ya

// Manejar autocompletado de dirección
const MarcacionesForm = () => {
  // Estados para contactos múltiples
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [contactos, setContactos] = useState<{nombre:string, telefono:string}[]>([]);

  // Agregar contacto a la lista
  const handleAgregarContacto = () => {
    if (contactoNombre.trim() && contactoTelefono.trim()) {
      setContactos([...contactos, { nombre: contactoNombre.trim(), telefono: contactoTelefono.trim() }]);
      setContactoNombre("");
      setContactoTelefono("");
    }
  };

  // Eliminar contacto
  const handleEliminarContacto = (idx:number) => {
    setContactos(contactos.filter((_, i) => i !== idx));
  };

  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Cliente | null>(null);
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({ open: false, message: "", type: "success" });
  // Ref para AddressSearch
  const addressSearchRef = useRef<HTMLInputElement>(null);
  // Cargar clientes desde la API al montar
  useEffect(() => {
  fetchMarcaciones();
  }, []);

  // Estados para paginación y búsqueda
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Nuevo fetchMarcaciones con paginación y búsqueda usando los parámetros de la API
  const fetchMarcaciones = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      // Usar los parámetros nativos de la API según documentación Swagger:
      // - cliente: filtra por nombre del cliente
      // - search: busca en nombre, código, email, teléfono, ciudad de la marcación
      const apiParams = {
        cliente: search, // La API usa 'cliente' para buscar por nombre del cliente
        page,
        per_page: perPage,
        ...params,
      };
      
      const data = await getMarcaciones(apiParams);
      setCustomers(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.last_page || 1);
    } catch (e) {
      console.error('Error al buscar marcaciones:', e);
      setError(t("marcaciones.messages.error"));
    } finally {
      setLoading(false);
    }
  };

  // Actualizar marcaciones cuando cambia la búsqueda o la paginación
  useEffect(() => {
    // Agregamos un pequeño retraso (debounce) para evitar demasiadas llamadas API mientras se escribe
    const timeoutId = setTimeout(() => {
      fetchMarcaciones();
    }, 300);
    
    // Limpiamos el timeout si el componente se desmonta o si cambian las dependencias
    return () => clearTimeout(timeoutId);
  }, [search, page, perPage]);

  const [formData, setFormData] = useState({
    NombreCliente: "",
    codcustomer: "",
    codigo: "",
    ciudad: "",
    direccion: "",
    direccionCobranzas: "",
    provincia: "",
    zipcode: "",
    contacto: "",
    telefono: "",
    email: "",
    pais: "",
    locacion: "",
    vendedor: "",
    carguera: "",
    cuartoFrio: "",
    prioridad: "media",
  });
  // Manejar autocompletado de dirección
  const handlePlaceSelected = (placeData: PlaceData) => {
    setFormData((prev) => ({
      ...prev,
      direccion: placeData.direccion || "",
      pais: placeData.pais || "",
      provincia: placeData.provincia || "",
      ciudad: placeData.ciudad || "",
      zipcode: placeData.zipcode || "",
    }));
  };

  // Estado para clientes de la API
  const [clientesApi, setClientesApi] = useState<any[]>([]);
  useEffect(() => {
    getClientes().then(setClientesApi).catch(() => setClientesApi([]));
  }, []);
  // Datos para los selects (locaciones, vendedores, cuartos fríos desde API)
  const [locaciones, setLocaciones] = useState<{ id: string; label: string }[]>(
    []
  );
  const [vendedores, setVendedores] = useState<{ id: string; label: string }[]>(
    []
  );
  const [cuartosFrios, setCuartosFrios] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [paises, setPaises] = useState<
    { id: string | number; label: string }[]
  >([]);
  const [tiposCliente, setTiposCliente] = useState<
    { id: string | number; label: string }[]
  >([]);
  const [loadingSelects, setLoadingSelects] = useState(false);
  // Control de wizards
  const [showLocationWizard, setShowLocationWizard] = useState(false);
  const [showVendorWizard, setShowVendorWizard] = useState(false);
  const [showCoolerWizard, setShowCoolerWizard] = useState(false);
  const [showCargueraWizard, setShowCargueraWizard] = useState(false);
  // Refs para los wizards
  const nombreLocationRef = useRef<HTMLInputElement>(null);
  const codigoLocationRef = useRef<HTMLInputElement>(null);
  const nombreVendedorRef = useRef<HTMLInputElement>(null);
  const correoVendedorRef = useRef<HTMLInputElement>(null);
  const ubicacionVendedorRef = useRef<HTMLInputElement>(null);
  const telefonoVendedorRef = useRef<HTMLInputElement>(null);
  const nombreCoolerRef = useRef<HTMLInputElement>(null);
  const codigoCoolerRef = useRef<HTMLInputElement>(null);
  // Refs para WizardCarguera
  const nombreCargueraRef = useRef<HTMLInputElement>(null);
  const rucCargueraRef = useRef<HTMLInputElement>(null);
  const contactoCargueraRef = useRef<HTMLInputElement>(null);
  const telefonoCargueraRef = useRef<HTMLInputElement>(null);
  const emailCargueraRef = useRef<HTMLInputElement>(null);
  const representanteCargueraRef = useRef<HTMLInputElement>(null);
  const origenCargueraRef = useRef<HTMLSelectElement>(null);
  const estadoCargueraRef = useRef<HTMLSelectElement>(null);
  const [cargueraOptions, setCargueraOptions] = useState<
    { id: string; label: string }[]
  >([]);

  // Cargar datos de selects desde la API
  useEffect(() => {
    const fetchSelects = async () => {
      try {
        const [locs, transportistas, cools, cargueras] = await Promise.all([
          getLocaciones(),
          getTransportistas(),
          getCoolers(),
          getCargueras(),
        ]);

        setLocaciones(
          Array.isArray(locs)
            ? locs.map((l) => ({
                id: l.id,
                label:
                  l.nombre || l.name || l.codigolocacion || l.codigo || l.code,
              }))
            : []
        );
        setVendedores(
          Array.isArray(transportistas)
            ? transportistas.map((t) => ({
                id: t.id,
                label: t.chofer || t.propietario || t.placa || t.id,
              }))
            : []
        );
        setCuartosFrios(
          Array.isArray(cools)
            ? cools.map((c) => ({
                id: c.id,
                label: c.nombre || c.name || c.codigo || c.code,
              }))
            : []
        );
        setCargueraOptions(
          Array.isArray(cargueras)
            ? cargueras.map((c) => ({
                id: c.id,
                label: c.nombre || c.name || c.razon || c.ruc || c.id,
              }))
            : []
        );
      } catch (e) {
        // Si falla, deja los selects vacíos
        console.error("Error cargando selects:", e);
      }
    };
    fetchSelects();
  }, []);

  useEffect(() => {
    // Obtener países
    getPaises()
      .then((data) => {
        setPaises(data.map((p) => ({ id: p.id, label: p.nombre })));
      })
      .catch(() => setPaises([]));

    // Obtener tipos de cliente
    fetch(API_ENDPOINTS.TIPOS_CLIENTES.LIST, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) =>
        setTiposCliente(data.map((t) => ({ id: t.id, label: t.nombre })))
      )

      .catch(() => setTiposCliente([]));
  }, []);

  // Manejar cambio de carguera y cargar coolers relacionados
  const handleCargueraChange = async (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      carguera: value,
      cuartoFrio: "", // Limpiar selección de cooler al cambiar carguera
    }));
    if (value) {
      try {
        setLoadingSelects(true);
        const response = await fetch(
          API_ENDPOINTS.CARGUERAS.LIST_ID_CARGUERAS(value),
          {
            headers: getAuthHeaders(),
          }
        );
        if (!response.ok)
          throw new Error("Error al obtener coolers de la carguera");
        const coolers = await response.json();
        setCuartosFrios(
          Array.isArray(coolers)
            ? coolers.map((c) => ({ id: c.id, label: c.nombre || c.codigo }))
            : []
        );
      } catch (err) {
        setCuartosFrios([]);
      } finally {
        setLoadingSelects(false);
      }
    } else {
      setCuartosFrios([]);
    }
  };

  // handleInputChange: transforma a mayúsculas los campos de texto
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    // Si cambia la carguera, obtener coolers relacionados
    if (name === "carguera") {
      setFormData((prev) => ({
        ...prev,
        carguera: value,
        cuartoFrio: "", // Limpiar selección de cooler
      }));
      if (value) {
        try {
          const res = await fetch(
            API_ENDPOINTS.CARGUERAS.LIST_ID_CARGUERAS(value),
            {
              headers: getAuthHeaders(),
            }
          );
          if (res.ok) {
            const coolers = await res.json();
            setCuartosFrios(
              Array.isArray(coolers)
                ? coolers.map((c) => ({
                    id: c.id,
                    label: c.nombre || c.codigo,
                  }))
                : []
            );
          } else {
            setCuartosFrios([]);
          }
        } catch {
          setCuartosFrios([]);
        }
      } else {
        setCuartosFrios([]);
      }
      // Validar campo requerido en tiempo real
      setFieldErrors((prev) => ({
        ...prev,
        [name]:
          value && value.toString().trim() !== ""
            ? ""
            : t("fieldRequired", { field: fieldLabels[name] }),
      }));
      return;
    }
    // Solo transformar a mayúsculas si NO es el campo email
    const newValue =
      name === "email"
        ? value
        : typeof value === "string"
        ? value.toUpperCase()
        : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    // Validar campo requerido en tiempo real
    if (Object.keys(fieldLabels).includes(name)) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]:
          newValue && newValue.toString().trim() !== ""
            ? ""
            : t("fieldRequired", { field: fieldLabels[name] }),
      }));
    }
  };

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Diccionario para nombres legibles de campos con artículo correcto (en español e inglés)
  const fieldLabels = {
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
    cuartoFrio: t("clients.form.coolerName", "Cooler"),
    prioridad: "Prioridad",
  };

  // Estado para cargueras múltiples (tipado)
  type CargueraCooler = { id: string|number; cooler_id: string|number };
  // Tipo extendido para dataToSend
  type ClientePayload = {
    NombreCliente: string;
    codcustomer: string;
    estado: string;
    ciudad: string;
    direccion: string;
    direccionCobranzas: string;
    zipcode: string;
    telefono: string;
    contacto:string,
    email: string;
    pais_id: number|null;
    locacion_id: number|null;
    vendedor_id: number|null;
    tipo_cliente_id: number|null;
    prioridad: string;
    cargueras: CargueraCooler[];
    orden?: number;
  };
  const [carguerasSeleccionadas, setCarguerasSeleccionadas] = useState<CargueraCooler[]>([]);
  const [cargueraActual, setCargueraActual] = useState<string>("");
  const [coolerActual, setCoolerActual] = useState<string>("");
  const [coolersCargueraActual, setCoolersCargueraActual] = useState<{id:string|number,label:string}[]>([]);

  // Cargar cuartos fríos dinámicamente al cambiar cargueraActual
  useEffect(() => {
    if (cargueraActual) {
      (async () => {
        try {
          const response = await fetch(
            API_ENDPOINTS.CARGUERAS.LIST_ID_CARGUERAS(String(cargueraActual)),
            { headers: getAuthHeaders() }
          );
          if (response.ok) {
            const coolers = await response.json();
            setCoolersCargueraActual(Array.isArray(coolers)
              ? coolers.map((c) => ({ id: c.id, label: c.nombre || c.codigo }))
              : []);
          } else {
            setCoolersCargueraActual([]);
          }
        } catch {
          setCoolersCargueraActual([]);
        }
      })();
    } else {
      setCoolersCargueraActual([]);
      setCoolerActual("");
    }
  }, [cargueraActual]);

  // Historial local de coolers por carguera
  const [coolersPorCarguera, setCoolersPorCarguera] = useState<Record<string, {id:string|number,label:string}[]>>({});
  // Agregar carguera+cooler
  const handleAgregarCarguera = () => {
    if (cargueraActual && coolerActual) {
      setCarguerasSeleccionadas([
        ...carguerasSeleccionadas,
        { id: cargueraActual, cooler_id: coolerActual },
      ]);
      // Guardar historial de coolers para esa carguera
      setCoolersPorCarguera(prev => ({
        ...prev,
        [cargueraActual]: coolersCargueraActual,
      }));
      setCargueraActual("");
      setCoolerActual("");
      setCoolersCargueraActual([]);
    }
  };

  // Eliminar carguera+cooler
  const handleEliminarCarguera = (idx) => {
    setCarguerasSeleccionadas(carguerasSeleccionadas.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault && e.preventDefault();
    setFieldErrors({});
    // Validación visual de campos requeridos (excepto carguera/cuartoFrio individuales)
    const requiredFields = [
      { key: "codcustomer", label: "Cliente" },
      { key: "NombreCliente", label: "Nombre de Marcación" },
      { key: "provincia", label: "Provincia/Estado" },
      { key: "ciudad", label: "Ciudad" },
      { key: "direccion", label: "Dirección" },
      { key: "email", label: "Email" },
      { key: "pais", label: "País" },
      { key: "locacion", label: "Locación" },
      { key: "vendedor", label: "Transportista" },
    ];
    const newFieldErrors: { [key: string]: string } = {};
    requiredFields.forEach((f) => {
      if (!formData[f.key] || formData[f.key].toString().trim() === "") {
        newFieldErrors[f.key] = t("fieldRequired", {
          field: fieldLabels[f.key] || f.label,
        });
      }
    });
    // Validar que haya al menos un contacto agregado
    if (contactos.length === 0) {
      newFieldErrors["contactos"] = t("fieldRequired", { field: t("clients.form.contact", "Contacto") });
    }
    if (carguerasSeleccionadas.length === 0) {
      newFieldErrors["cargueras"] = t("fieldRequired", { field: t("clients.form.carrierData") + " y " + t("clients.form.coolerData") });
    }
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setModal({ open: true, message: t("common.required"), type: "error" });
      return;
    }
    // Concatenar nombres y teléfonos de contactos
    const contactosNombres = contactos.map(c => c.nombre).join(",");
    const contactosTelefonos = contactos.map(c => c.telefono).join(",");

    // Construir el objeto exactamente como lo requiere la API según la respuesta de Swagger
    const dataToSend = {
      nombre: formData.NombreCliente,
      codigo: formData.codcustomer.toString().substring(0, 5),  // Usar primeros 5 caracteres como código
      estado: formData.provincia,
      ciudad: formData.ciudad,
      direccion: formData.direccion,
      zipcode: formData.zipcode,
      contacto: contactosNombres, // Usar contactos múltiples concatenados
      telefono: contactosTelefonos, // Usar teléfonos múltiples concatenados
      email: formData.email,
      pais_id: formData.pais ? Number(formData.pais) : null,
      locacion_id: formData.locacion ? Number(formData.locacion) : null,
      transporte_id: formData.vendedor ? Number(formData.vendedor) : null,  // Usar vendedor como transporte_id
      cargueras: carguerasSeleccionadas.map(c => ({ 
        id: Number(c.id), 
        cooler_id: Number(c.cooler_id) 
      })),
      prioridad: formData.prioridad || "media"
    };
    
    // Si es creación, agregar orden = max + 1
    if (!editingCustomer) {
      const maxOrden = customers && customers.length > 0
        ? Math.max(...customers.map((c:any) => typeof c.orden === 'number' ? c.orden : 0))
        : 0;
      dataToSend["orden"] = maxOrden + 1;
    }
    setLoading(true);
    setError("");
    try {
      if (editingCustomer) {
        await updateMarcacion(String(editingCustomer.id), dataToSend);
        setEditingCustomer(null);
        setModal({
          open: true,
          message: t("marcaciones.messages.updated"),
          type: "success",
        });
        setTimeout(() => {
          setModal((prev) =>
            prev.type === "success" ? { ...prev, open: false } : prev
          );
        }, 1500);
        // No cerrar el formulario automáticamente al editar
        setShowForm(false);
      } else {
        // Usar codcustomer como id_cliente
        if (!formData.codcustomer) throw new Error("Falta seleccionar un cliente para crear marcación");
        // Llamada a la API para crear marcación
        const resultado = await createMarcacion(String(formData.codcustomer), dataToSend);
        setModal({
          open: true,
          message: t("marcaciones.messages.created"),
          type: "success",
        });
        setTimeout(() => {
          setModal((prev) =>
            prev.type === "success" ? { ...prev, open: false } : prev
          );
        }, 1500);
      }
      await fetchMarcaciones();
      
      // Solo limpiar el formulario si no estamos editando
      if (!editingCustomer) {
        setFormData({
          NombreCliente: "",
          codcustomer: "",
          codigo: "",
          ciudad: "",
          direccion: "",
          direccionCobranzas: "",
          provincia: "",
          zipcode: "",
          contacto: "",
          telefono: "",
          email: "",
          pais: "",
          locacion: "",
          vendedor: "",
          carguera: "",
          cuartoFrio: "",
          prioridad: "media",
        });
        // Limpiar contactos
        setContactos([]);
        setContactoNombre("");
        setContactoTelefono("");
        // No cerrar el formulario después de guardar para crear uno nuevo inmediatamente
        // Limpiar storage temporal al guardar
        localStorage.removeItem("marcacion_form_temp");
        // Limpiar cargueras seleccionadas y selects relacionados
        setCarguerasSeleccionadas([]);
        setCargueraActual("");
        setCoolerActual("");
        setCoolersCargueraActual([]);
        setCoolersPorCarguera && setCoolersPorCarguera({});
      }
    } catch (e) {
      // Mostrar el error real del backend en consola y modal
      if (e instanceof Response) {
        let errorText = "";
        try {
          errorText = await e.text();
          // Si la respuesta parece HTML, mostrar mensaje amigable
          if (
            errorText.trim().startsWith("<!DOCTYPE") ||
            errorText.trim().startsWith("<html")
          ) {
            console.error("Error backend (HTML):", errorText);
            setError(t("login.errors.serverError"));
            setModal({
              open: true,
              message: t("login.errors.serverError"),
              type: "error",
            });
            return;
          }
        } catch (parseErr) {
          errorText = t("login.errors.serverError");
        }
        console.error("Error backend:", errorText);
        setError(errorText);
        setModal({ open: true, message: errorText, type: "error" });
      } else if (e instanceof Error) {
        console.error("Error JS:", e.message);
        setError(e.message);
        setModal({ open: true, message: e.message, type: "error" });
      } else {
        console.error("Error desconocido:", e);
        setError(t("clients.messages.error"));
        setModal({
          open: true,
          message: t("clients.messages.error"),
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

   
  
  const handleEdit = async (customer) => {
    setEditingCustomer(customer);
    
    // Limpiar estados previos para evitar mezclas de datos
    setContactos([]);
    setCarguerasSeleccionadas([]);
    setCoolersPorCarguera({});
    
    // Si la marcación tiene contactos, cargarlos como objetos separados
    if (customer.contacto && customer.telefono) {
      const nombres = customer.contacto.split(",");
      const telefonos = customer.telefono.split(",");
      const contactosArray: {nombre: string, telefono: string}[] = [];
      
      // Crear pares de contacto+teléfono
      for (let i = 0; i < Math.min(nombres.length, telefonos.length); i++) {
        if (nombres[i].trim() && telefonos[i].trim()) {
          contactosArray.push({
            nombre: nombres[i].trim(), 
            telefono: telefonos[i].trim()
          });
        }
      }
      
      setContactos(contactosArray);
    }
  
    // Si el cliente tiene array de cargueras, cargarlo en el estado
    if (Array.isArray(customer.cargueras) && customer.cargueras.length > 0) {
      setCarguerasSeleccionadas(
        customer.cargueras.map((c) => ({
          id: String(c.id),
          cooler_id: String(c.cooler_id),
        }))
      );
      // Opcional: reconstruir historial de coolers por carguera para mostrar nombres
      const coolersHist = {};
      for (const c of customer.cargueras) {
        if (c.carguera && Array.isArray(c.carguera.coolers)) {
          coolersHist[String(c.id)] = c.carguera.coolers.map((cooler) => ({
            id: String(cooler.id),
            label: cooler.nombre || cooler.codigo,
          }));
        }
      }
      setCoolersPorCarguera(coolersHist);
    } else {
      setCarguerasSeleccionadas([]);
      setCoolersPorCarguera({});
    }
  
    // El resto de tu lógica para cargar los campos del formulario:
    let cargueraId =
      customer.cargueras_id ||
      (customer.carguera && typeof customer.carguera === "object"
        ? customer.carguera.id
        : customer.carguera);
    let coolerId = customer.cooler_id || customer.cuartoFrio;
  
    setFormData({
      NombreCliente: customer.NombreCliente || customer.nombre || "",
      codcustomer: customer.codcustomer || customer.codigo || "",
      codigo: customer.codigo || "",
      ciudad: customer.ciudad || "",
      direccion: customer.direccion || "",
      direccionCobranzas: customer.direccionCobranzas || "",
      provincia: customer.provincia || customer.estado || "",
      zipcode: customer.zipcode || "",
      contacto: customer.contacto || "",
      telefono: customer.telefono || "",
      email: customer.email || "",
      pais: customer.pais_id
        ? String(customer.pais_id)
        : customer.pais && typeof customer.pais === "object"
        ? String(customer.pais.id)
        : customer.pais
        ? String(customer.pais)
        : "",
      locacion: customer.locacion_id
        ? String(customer.locacion_id)
        : customer.locacion && typeof customer.locacion === "object"
        ? String(customer.locacion.id)
        : customer.locacion
        ? String(customer.locacion)
        : "",
      vendedor: customer.vendedor_id || customer.transporte_id
        ? String(customer.vendedor_id || customer.transporte_id)
        : customer.vendedor && typeof customer.vendedor === "object"
        ? String(customer.vendedor.id)
        : customer.transporte && typeof customer.transporte === "object"
        ? String(customer.transporte.id)
        : customer.vendedor || customer.transporte
        ? String(customer.vendedor || customer.transporte)
        : "",
      carguera: cargueraId ? String(cargueraId) : "",
      cuartoFrio: coolerId ? String(coolerId) : "",
      prioridad: customer.prioridad ? String(customer.prioridad) : "media",
    });
    setShowForm(true);
  };
  
  // ...existing code...

  const handleDelete = async (id) => {
    setLoading(true);
    setError("");
    try {
      await deleteMarcacion(String(id));
      await fetchMarcaciones();
    } catch (e) {
      setError(t("marcaciones.messages.error"));
    } finally {
      setLoading(false);
    }
  };
  // Autoguardado en localStorage (opcional, como en el wizard)
  useEffect(() => {
    if (showForm) {
      localStorage.setItem("marcacion_form_temp", JSON.stringify(formData));
    }
  }, [formData, showForm]);

  useEffect(() => {
    if (showForm) {
      const temp = localStorage.getItem("marcacion_form_temp");
      if (temp) {
        setFormData(JSON.parse(temp));
      }
    }
  }, [showForm]);

  const handleCreateNew = () => {
    // Limpiar todo el formulario
    setFormData({
      NombreCliente: "",
      codcustomer: "",
      codigo: "",
      ciudad: "",
      direccion: "",
      direccionCobranzas: "",
      provincia: "",
      zipcode: "",
      contacto: "",
      telefono: "",
      email: "",
      pais: "",
      locacion: "",
      vendedor: "",
      carguera: "",
      cuartoFrio: "",
      prioridad: "media",
    });
    // Limpiar contactos
    setContactos([]);
    setContactoNombre("");
    setContactoTelefono("");
    // Limpiar cargueras seleccionadas
    setCarguerasSeleccionadas([]);
    setCargueraActual("");
    setCoolerActual("");
    setCoolersCargueraActual([]);
    setCoolersPorCarguera && setCoolersPorCarguera({});
    // Resetear errores
    setFieldErrors({});
    setEditingCustomer(null);
    setShowForm(true);
  };

  // Al cerrar el formulario, limpiar errores y modal, y también limpiar los errores visuales de los campos requeridos
  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({
      NombreCliente: "",
      codcustomer: "",
      codigo: "",
      ciudad: "",
      direccion: "",
      direccionCobranzas: "",
      provincia: "",
      zipcode: "",
      contacto: "",
      telefono: "",
      email: "",
      pais: "",
      locacion: "",
      vendedor: "",
      carguera: "",
      cuartoFrio: "",
      prioridad: "media",
    });
    // Limpiar contactos
    setContactos([]);
    setContactoNombre("");
    setContactoTelefono("");
    setFieldErrors({}); // Limpiar errores de validación
    setModal({ open: false, message: "", type: "success" }); // Cerrar modal si está abierto
    // Limpiar storage temporal
    localStorage.removeItem("marcacion_form_temp");
    // Limpiar cargueras seleccionadas
    setCarguerasSeleccionadas([]);
    setCargueraActual("");
    setCoolerActual("");
    setCoolersCargueraActual([]);
    setCoolersPorCarguera && setCoolersPorCarguera({});
    // Limpiar validación nativa de HTML5 (si algún campo quedó con :invalid)
    if (typeof window !== "undefined") {
      const form = document.querySelector("form");
      if (form) {
        // Forzar revalidación para limpiar mensajes nativos
        Array.from(form.elements).forEach((el) => {
          if (
            el instanceof HTMLInputElement ||
            el instanceof HTMLSelectElement
          ) {
            el.setCustomValidity("");
          }
        });
      }
    }
  };

  // handleBlur: valida el campo requerido al perder el foco
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const requiredField = Object.keys(fieldLabels);
    if (requiredField.includes(name)) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]:
          value && value.toString().trim() !== ""
            ? ""
            : t("fieldRequired", { field: fieldLabels[name] }),
      }));
    }
  };

  // Componentes modales para gestión de datos
  return (
    <div
      className="min-h-screen w-full px-1 sm:px-4"
      style={{
        fontFamily:
          "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Modal de éxito o error */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.10)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setModal({ ...modal, open: false })}
        >
          <div
            className={`bg-white bg-opacity-90 rounded-lg shadow-lg p-6 min-w-[300px] max-w-xs text-center border-2 ${
              modal.type === "success" ? "border-green-400" : "border-red-400"
            }`}
            style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mb-2 text-lg font-semibold ${
                modal.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {modal.type === "success"
                ? t("common.success", "¡Éxito!")
                : t("common.error", "Error")}
            </div>
            <div className="mb-4 text-gray-700">{modal.message}</div>
            <button
              className={`px-4 py-2 rounded font-semibold`}
              style={{ background: "#cc3399", color: "#fff" }}
              onClick={() => setModal({ ...modal, open: false })}
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
      {/* Layout principal */}
      <div className="min-h-screen bg-gray-100">
        <div
          className="bg-white rounded-2xl shadow-xl overflow-hidden w-full"
          style={{
            fontFamily:
              "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Header responsive */}
          <div
            className="px-2 py-2 sm:px-8"
            style={{
              background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="min-w-0">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 min-w-0 truncate"
                  style={{
                    fontFamily:
                      "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                  }}
                >
                  <span role="img" aria-label="clients" className="shrink-0">
                    👥
                  </span>
                  <span className="truncate">{t("marcaciones_title")}</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end min-w-0">
                {/* Mostrar botón alineado a la derecha en desktop */}
                {showForm && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-9 h-9 sm:w-auto sm:h-auto px-2 py-1 sm:px-6 sm:py-2 rounded-full sm:rounded-lg flex items-center justify-center gap-0 sm:gap-1 transition-colors text-xs sm:text-lg font-semibold ml-auto"
                    style={{
                      background: "#cc3399",
                      color: "#fff",
                      fontFamily:
                        "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                    }}
                  >
                    <span className="block sm:hidden">
                      <table className="w-full h-full">
                        <tbody>
                          <tr>
                            <td className="align-middle">
                              <User size={18} />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </span>
                    <span className="hidden sm:block">
                      {t("clients.tableButton", { defaultValue: "Tabla" })}
                    </span>
                  </button>
                )}
                {/* Buscador y botón crear cliente adaptados para móvil y desktop */}
                {!showForm && (
                  <div className="flex flex-row items-center gap-2 w-full sm:justify-end">
                    <input
                      type="text"
                      placeholder={t("search")}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="flex-1 min-w-0 px-2 py-1 sm:w-40 sm:max-w-xs sm:px-2 sm:py-1 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs sm:text-sm bg-white"
                      style={{ height: "36px" }}
                    />
                    <button
                      onClick={handleCreateNew}
                      className="w-9 h-9 sm:w-auto sm:h-auto px-2 py-1 sm:px-4 sm:py-1 rounded-full sm:rounded-lg flex flex-row items-center justify-center gap-1 transition-colors text-xs sm:text-lg font-semibold"
                      style={{
                        background: "#cc3399",
                        color: "#fff",
                        fontFamily:
                          "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                      }}
                    >
                      <span className="flex items-center justify-center">
                        <Plus size={18} className="sm:w-5 sm:h-5" />
                      </span>
                      <span className="hidden sm:inline-block ml-1">
                        {t("clients.addNew")}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Layout principal con formulario y wizard lateral */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-0 transition-all duration-300 w-full">
            {/* Columna principal: Formulario y tablas */}
            <div
              className={`flex-1 min-w-0 transition-all duration-300 ${
                showLocationWizard ||
                showVendorWizard ||
                showCargueraWizard ||
                showCoolerWizard
                  ? "mr-0"
                  : ""
              }`}
            >
              {/* Tabla de Clientes: visible solo en pantallas medianas o grandes */}
              <div
                className={`transition-all duration-300 ${
                  showForm ? "max-h-0 overflow-hidden" : "max-h-none"
                } mt-0 hidden sm:block`}
              >
                <Marcaciones
                  marcaciones={customers}
                  loading={loading}
                  error={error}
                  onEdit={handleEdit}
                  search={search}
                  setSearch={setSearch}
                  page={page}
                  setPage={setPage}
                  totalPages={totalPages}
                  perPage={perPage}
                  setPerPage={setPerPage}
                  onOrderUpdated={fetchMarcaciones}
                />
              </div>
              {/* Cards de Clientes (solo en móviles) */}
              <div
                className={`transition-all duration-300 ${
                  showForm ? "max-h-0 overflow-hidden" : "max-h-none"
                } mt-0 block sm:hidden`}
              >
                <div className="space-y-3 overflow-y-auto max-h-[80vh] px-1">
                  {loading ? (
                    <p className="text-center text-gray-500 text-sm">
                      {t("common.loading")}
                    </p>
                  ) : error ? (
                    <p className="text-center text-red-500 text-sm">{error}</p>
                  ) : customers.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm">
                      {t("common.noData")}
                    </p>
                  ) : (
                    customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="bg-white shadow rounded-lg p-2"
                      >
                        <div className="flex flex-col items-center gap-1 mb-1">
                          <h4
                            className="font-semibold text-base text-pink-700 text-center break-words w-full"
                            style={{ wordBreak: "break-word" }}
                          >
                            {customer.numero || ""}
                          </h4>
                          <p className="text-xs text-gray-500 text-center break-words w-full">
                            {customer.ciudad}
                          </p>
                        </div>
                        <div className="text-xs mb-1">
                          <p>
                            <strong>{t("clients.form.address")}:</strong>{" "}
                            {customer.direccion}
                          </p>
                          <p>
                            <strong>{t("clients.form.contact", "Contacto")}:</strong>{" "}
                            {customer.contacto}
                          </p>
                          <p>
                            <strong>{t("clients.form.phone")}:</strong>{" "}
                            {customer.telefono}
                          </p>
                          <p>
                            <strong>
                              {t("clients.form.salespersonData")}:
                            </strong>{" "}
                            {typeof customer.vendedor === "object" &&
                            customer.vendedor !== null
                              ? customer.vendedor.nombre ||
                                customer.vendedor.email ||
                                customer.vendedor.correo ||
                                customer.vendedor.id
                              : customer.vendedor || ""}
                          </p>
                        </div>
                        <div className="flex justify-end gap-1 mt-1">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-pink-700 hover:text-pink-900 p-1 rounded-full border border-pink-200 bg-white"
                            title={t("common.edit")}
                            style={{ background: "#fff" }}
                          >
                            <Edit2 size={15} color="#cc3399" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full border border-red-200 bg-white"
                            title={t("common.delete")}
                            style={{ background: "#fff" }}
                          >
                            <Trash2 size={15} color="#dc2626" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Formulario */}
              <form
                onSubmit={handleSubmit}
                className={`transition-all duration-300 ${
                  showForm ? "max-h-none" : "max-h-0 overflow-hidden"
                }`}
              >
                <div className="border-t border-gray-200 pt-4 pb-12 px-2 md:px-8 overflow-y-auto max-h-[90vh] sm:overflow-y-visible sm:max-h-none">
                  {/* Layout inspirado en el boceto */}
                  <div className="flex flex-col gap-6">
                    {/* Datos Básicos with AddressSearch */}
                    <div
                      className="rounded-xl px-2 py-4 sm:p-6 border"
                      style={{ borderColor: "#f9c2d7", background: "#fff" }}
                    >
                      <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "#cc3399" }}
                      >
                        <User size={20} className="text-pink-700" />
                        {t("clients.form.basicData")}
                      </h3>
                      <div className="mb-4">
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: "#cc3399" }}
                        >
                          {t("cliente_select")} *
                        </label>
                        <select
                          name="codcustomer"
                          value={formData.codcustomer}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-amber-50 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                          required
                        >
                          <option value="">{t("cliente_select")}</option>
                          {clientesApi.map((cli) => (
                            <option key={cli.id} value={cli.id}>
                              {cli.NombreCliente || cli.nombre || cli.name}
                            </option>
                          ))}
                        </select>
                        {fieldErrors["codcustomer"] && (
                          <div
                            className="text-red-500 text-xs mt-1"
                            dangerouslySetInnerHTML={{
                              __html: fieldErrors["codcustomer"],
                            }}
                          ></div>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: "#cc3399" }}
                        >
                          {t("clients.form.searchAddress")}
                        </label>
                        <AddressSearch
                          ref={addressSearchRef}
                          onPlaceSelected={handlePlaceSelected}
                          className="w-full px-2 py-1 border border-amber-50 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("name")} *
                          </label>
                          <input
                            type="text"
                            name="NombreCliente"
                            value={formData.NombreCliente}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                            placeholder={t("name")}
                          />
                          {fieldErrors["NombreCliente"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["NombreCliente"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="col-span-1">
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("code")} *
                          </label>
                          <input
                            type="text"
                            name="codigo"
                            value={formData.codigo || ""}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            placeholder={t("code")}
                          />
                          {fieldErrors["codcustomer"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["codcustomer"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="col-span-1">
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.country")} *
                          </label>
                          <select
                            name="pais"
                            value={formData.pais}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          >
                            <option value="">{t("countries.select")}</option>
                            {paises.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                          {fieldErrors["pais"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["pais"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.address")} *
                          </label>
                          <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["direccion"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["direccion"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.address")} {t("common.optional")}
                          </label>
                          <input
                            type="text"
                            name="direccionCobranzas"
                            value={formData.direccionCobranzas}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.city")} *
                          </label>
                          <input
                            type="text"
                            name="ciudad"
                            value={formData.ciudad}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["ciudad"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["ciudad"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.state")} *
                          </label>
                          <input
                            type="text"
                            name="provincia"
                            value={formData.provincia}
                            onChange={(e) => {
                              handleInputChange(e);
                              setFormData((prev) => ({
                                ...prev,
                                estado: e.target.value,
                              }));
                            }}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["provincia"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["provincia"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.zipCode")}
                          </label>
                          <input
                            type="text"
                            name="zipcode"
                            value={formData.zipcode}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.email")} *
                          </label>
                          <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["email"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["email"],
                              }}
                            ></div>
                          )}
                        </div>
                       
                      </div>
                    </div>

                    {/* Sección de Contacto */}
                    <div
                      className="rounded-xl px-2 py-4 sm:p-6 border"
                      style={{ borderColor: "#b6f7e1", background: "#fff", marginTop: 16 }}
                    >
                      <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "#059669" }}
                      >
                        <User size={20} className="text-green-700" />
                        {t("clients.form.contactSection", "Contacto")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: "#cc3399" }}>{t("clients.form.contact", "Contacto")} *</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={contactoNombre}
                              onChange={e => setContactoNombre(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-base bg-gray-100 h-12"
                              placeholder="Nombre del contacto"
                              style={{height: "35px"}}
                            />
                            <div className="invisible px-3" style={{height: "48px", minWidth: "48px"}}>+</div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: "#cc3399" }}>{t("clients.form.phone")} *</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={contactoTelefono}
                              onChange={e => setContactoTelefono(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-base bg-gray-100 h-12"
                              placeholder="Teléfono del contacto"
                              style={{height: "35px"}}
                            />
                            <button type="button" onClick={handleAgregarContacto} className="px-3 rounded bg-emerald-500 text-white font-bold text-lg" title="Agregar contacto" style={{background: "#cc3399", height: "48px", minWidth: "48px"}}>+</button>
                          </div>
                        </div>
                      </div>
                      {/* Lista de contactos agregados visualmente */}
                      {contactos.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-semibold mb-2 text-emerald-700">Contactos agregados:</h4>
                          <ul className="flex flex-row flex-wrap gap-2">
                            {contactos.map((c, idx) => (
                              <li key={idx} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                                <span className="font-medium text-gray-800">{c.nombre}</span>
                                <span className="text-gray-500">{c.telefono}</span>
                                <button type="button" onClick={() => handleEliminarContacto(idx)} className="text-white px-2 py-0.5 rounded hover:bg-red-100 " style={{background: "#cc3399"}}>x</button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {fieldErrors["contactos"] && (
                        <div className="text-red-500 text-xs mt-1">
                          {fieldErrors["contactos"]}
                        </div>
                      )}
                    </div>
                    {/* 2 filas, 2 selects por fila */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Locación */}
                      <div
                        className="rounded-xl px-2 py-4 sm:p-6 border w-full"
                        style={{ borderColor: "#bcdcff", background: "#fff" }}
                      >
                        <h3
                          className="text-lg font-semibold mb-4 flex items-center gap-2"
                          style={{ color: "#3b82f6" }}
                        >
                          <MapPin size={20} className="text-blue-600" />
                          {t("locationData")}
                        </h3>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <select
                              name="locacion"
                              value={formData.locacion}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                              required
                            >
                              <option value="">
                                {t("common.selectOption", "Seleccionar...")}
                              </option>
                              {locaciones.map((loc, index) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.label}
                                </option>
                              ))}
                            </select>
                            {fieldErrors["locacion"] && (
                              <div
                                className="text-red-500 text-xs mt-1"
                                dangerouslySetInnerHTML={{
                                  __html: fieldErrors["locacion"],
                                }}
                              ></div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowLocationWizard(true);
                              setShowVendorWizard(false);
                              setShowCargueraWizard(false);
                              setShowCoolerWizard(false);
                            }}
                            className="rounded-full"
                            style={{
                              background: "#cc3399",
                              color: "#fff",
                              padding: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title={t("clients.form.locationName")}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      {/* Vendedor */}
                      <div
                        className="rounded-xl px-2 py-4 sm:p-6 border w-full"
                        style={{ borderColor: "#b6f7e1", background: "#fff" }}
                      >
                        <h3
                          className="text-lg font-semibold mb-4 flex items-center gap-2"
                          style={{ color: "#22c55e" }}
                        >
                          <User size={20} className="text-green-600" />
                          {t("driver")} *
                        </h3>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <select
                              name="vendedor"
                              value={formData.vendedor}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                              required
                            >
                              <option value="">
                                {t("common.selectOption", "Seleccionar transportista...")}
                              </option>
                              {vendedores.map((v, index) => (
                                <option key={v.id} value={v.id}>
                                  {v.label}
                                </option>
                              ))}
                            </select>
                            {fieldErrors["vendedor"] && (
                              <div
                                className="text-red-500 text-xs mt-1"
                                dangerouslySetInnerHTML={{
                                  __html: fieldErrors["vendedor"],
                                }}
                              ></div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowVendorWizard(true);
                              setShowLocationWizard(false);
                              setShowCargueraWizard(false);
                              setShowCoolerWizard(false);
                            }}
                            className="rounded-full"
                            style={{
                              background: "#cc3399",
                              color: "#fff",
                              padding: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title={t("clients.form.salespersonData")}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cargueras y Cuartos Fríos múltiples */}
                      <div className="rounded-xl px-2 py-4 sm:p-6 border w-full col-span-2" style={{ borderColor: "#ffe9b6", background: "#fff" }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "#FFB400" }}>
                          <Briefcase size={20} className="text-yellow-500" />
                          {t("clients.form.carrierData")} & {t("clients.form.coolerData")}
                        </h3>
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-row gap-2 items-end">
                            <div className="flex-1">
                          <select
                            name="cargueraActual"
                            value={cargueraActual}
                            onChange={e => setCargueraActual(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                          >
                            <option value="">{t("common.selectOption", "Seleccionar carguera...")}</option>
                            {cargueraOptions.map((c) => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                            </div>
                            <div className="flex-1">
                          <select
                            name="coolerActual"
                            value={coolerActual}
                            onChange={e => setCoolerActual(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            disabled={!cargueraActual}
                          >
                            <option value="">{!cargueraActual ? t("clients.form.selectCarrierFirst", "Seleccione una carguera primero") : t("common.selectOption", "Seleccionar cuarto frío...")}</option>
                            {coolersCargueraActual.map((c) => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                            </div>
                            <button
                              type="button"
                              onClick={handleAgregarCarguera}
                              className="rounded-full px-3 py-2"
                              style={{ background: "#cc3399", color: "#fff" }}
                              title="Agregar carguera y cuarto frío"
                              disabled={!cargueraActual || !coolerActual}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {/* Lista de cargueras seleccionadas */}
                          <ul className="mt-2 space-y-1">
                            {carguerasSeleccionadas.map((c, idx) => {
                              const cargueraLabel = cargueraOptions.find(opt => String(opt.id) === String(c.id))?.label || c.id;
                              let coolerLabel = c.cooler_id;
                              const coolersForCarguera = coolersPorCarguera[String(c.id)] || coolersCargueraActual;
                              coolerLabel = coolersForCarguera.find(opt => String(opt.id) === String(c.cooler_id))?.label || c.cooler_id;
                              return (
                                <li key={idx} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-2 py-1">
                                  <span className="font-medium text-yellow-700">{cargueraLabel}</span>
                                  <span className="text-gray-500">/</span>
                                  <span className="font-medium text-purple-700">{coolerLabel}</span>
                                  <button type="button" onClick={() => handleEliminarCarguera(idx)} className="ml-2 text-red-500 hover:text-red-700" title="Eliminar">
                                    <Trash2 size={14} />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Botones de acción */}
                  <div className="flex flex-row gap-2 justify-end mt-6">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
                      style={{ background: "transparent" }}
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#e83e8c", border: "none" }}
                      disabled={loading}
                    >
                      {editingCustomer ? t("common.update") : t("common.save")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            {/* Panel lateral para los wizards */}
            {(showLocationWizard ||
              showVendorWizard ||
              showCargueraWizard ||
              showCoolerWizard) && (
              <div
                className="w-full max-w-md flex items-center justify-center h-[90%] min-h-[400px] overflow-y-auto p-0 border-l border-gray-200 transition-all duration-300"
                style={{
                  marginRight: 0,
                  marginLeft: 0,
                  height: "90vh",
                  background: "transparent",
                  boxShadow: "none",
                }}
              >
                {showLocationWizard && (
                  <WizartLocation
                    showWizard={true}
                    setShowWizard={setShowLocationWizard}
                    refs={{
                      nombreLocation: nombreLocationRef,
                      codigoLocation: codigoLocationRef,
                    }}
                    onCreated={async () => {
                      const locs = await getLocaciones();
                      setLocaciones(
                        Array.isArray(locs)
                          ? locs.map((l) => ({
                              id: l.id,
                              label:
                                l.nombre ||
                                l.name ||
                                l.codigolocacion ||
                                l.codigo ||
                                l.code,
                            }))
                          : []
                      );
                    }}
                    onClose={() => setShowLocationWizard(false)}
                  />
                )}
                {showVendorWizard && (
                  <WizardVendedor
                    showWizard={true}
                    setShowWizard={setShowVendorWizard}
                    refs={{
                      nombreVendedor: nombreVendedorRef,
                      correoVendedor: correoVendedorRef,
                      ubicacionVendedor: ubicacionVendedorRef,
                      telefonoVendedor: telefonoVendedorRef,
                    }}
                    onCreated={async () => {
                      const transportistas = await getTransportistas();
                      setVendedores(
                        Array.isArray(transportistas)
                          ? transportistas.map((t) => ({
                              id: t.id,
                              label: t.chofer || t.propietario || t.placa || t.id,
                            }))
                          : []
                      );
                    }}
                    onClose={() => setShowVendorWizard(false)}
                  />
                )}
                {showCargueraWizard && (
                  <WizardCarguera
                    showWizard={true}
                    setShowWizard={setShowCargueraWizard}
                    refs={{
                      nombreCarguera: nombreCargueraRef,
                      rucCarguera: rucCargueraRef,
                      contactoCarguera: contactoCargueraRef,
                      telefonoCarguera: telefonoCargueraRef,
                      emailCarguera: emailCargueraRef,
                      representanteCarguera: representanteCargueraRef,
                      origenCarguera: origenCargueraRef,
                      estadoCarguera: estadoCargueraRef,
                    }}
                    onCreated={async () => {
                      const cargueras = await getCargueras();
                      setCargueraOptions(
                        Array.isArray(cargueras)
                          ? cargueras.map((c) => ({
                              id: c.id,
                              label:
                                c.nombre || c.name || c.razon || c.ruc || c.id,
                            }))
                          : []
                      );
                    }}
                    onClose={() => setShowCargueraWizard(false)}
                  />
                )}
                {showCoolerWizard && (
                  <WizartCooler
                    showWizard={true}
                    setShowWizard={setShowCoolerWizard}
                    refs={{
                      nombreCooler: nombreCoolerRef,
                      codigoCooler: codigoCoolerRef,
                    }}
                    defaultCargueraId={formData.carguera}
                    defaultCargueraLabel={
                      cargueraOptions.find(
                        (c) => String(c.id) === String(formData.carguera)
                      )?.label || ""
                    }
                    onCreated={async () => {
                      // Refrescar coolers de la carguera seleccionada tras crear uno nuevo
                      if (formData.carguera) {
                        try {
                          const response = await fetch(
                            API_ENDPOINTS.CARGUERAS.LIST_ID_CARGUERAS(
                              String(formData.carguera)
                            ),
                            {
                              headers: getAuthHeaders(),
                            }
                          );
                          if (response.ok) {
                            const coolers = await response.json();
                            setCuartosFrios(
                              Array.isArray(coolers)
                                ? coolers.map((c) => ({
                                    id: c.id,
                                    label: c.nombre || c.codigo,
                                  }))
                                : []
                            );
                          } else {
                            setCuartosFrios([]);
                          }
                        } catch {
                          setCuartosFrios([]);
                        }
                      }
                    }}
                    onClose={() => setShowCoolerWizard(false)}
                    hideCloseButton={false}
                    selectCarguera={false}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarcacionesForm;
