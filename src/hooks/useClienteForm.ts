import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ClienteFormData, Contacto, CargueraCooler, ClientePayload, SelectOption, ModalState, FieldErrors } from '../types/cliente.types';
import type { PlaceData } from '../types/places.types';
import { initialClienteFormState } from '../constants/clienteForm';
import { getFieldLabels, validateClienteForm, validateRequiredField } from '../utils/clienteFormUtils';
import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';
// Importar los servicios de cliente centralizados
import { 
  getClientes, 
  createCliente, 
  updateCliente, 
  deleteCliente,
  getLocaciones,
  getVendedores,
  getCoolers,
  getCargueras,
  getPaises 
} from '../services/clienteService';

export const useClienteForm = () => {
  const { t } = useTranslation();
  
  // Estados para contactos múltiples
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [contactos, setContactos] = useState<Contacto[]>([]);

  // Estados principales del formulario
  const [formData, setFormData] = useState<ClienteFormData>(initialClienteFormState);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>({ open: false, message: "", type: "success" });
  
  // Estados para paginación y búsqueda
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para selects
  const [locaciones, setLocaciones] = useState<SelectOption[]>([]);
  const [vendedores, setVendedores] = useState<SelectOption[]>([]);
  const [cuartosFrios, setCuartosFrios] = useState<SelectOption[]>([]);
  const [paises, setPaises] = useState<SelectOption[]>([]);
  const [tiposCliente, setTiposCliente] = useState<SelectOption[]>([]);
  const [loadingSelects, setLoadingSelects] = useState(false);
  const [cargueraOptions, setCargueraOptions] = useState<SelectOption[]>([]);

  // Estados para cargueras
  const [carguerasSeleccionadas, setCarguerasSeleccionadas] = useState<CargueraCooler[]>([]);
  const [cargueraActual, setCargueraActual] = useState<string>("");
  const [coolerActual, setCoolerActual] = useState<string>("");
  const [coolersCargueraActual, setCoolersCargueraActual] = useState<SelectOption[]>([]);
  const [coolersPorCarguera, setCoolersPorCarguera] = useState<Record<string, SelectOption[]>>({});

  // Estados para wizards
  const [showLocationWizard, setShowLocationWizard] = useState(false);
  const [showVendorWizard, setShowVendorWizard] = useState(false);
  const [showCoolerWizard, setShowCoolerWizard] = useState(false);
  const [showCargueraWizard, setShowCargueraWizard] = useState(false);
  const [showBasicData, setShowBasicData] = useState(true);

  // Refs (los refs se pasan desde el componente)
  const addressSearchRef = useRef<HTMLInputElement>(null);

  // Errores de validación
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const fieldLabels = getFieldLabels(t);

  // Cargar clientes desde la API al montar
  useEffect(() => {
    fetchClientes();
  }, []);

  // Nuevo fetchClientes con paginación y búsqueda
  const fetchClientes = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await getClientes({
        search,
        page,
        per_page: perPage,
        ...params,
      });
      setCustomers(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.last_page || 1);
    } catch (e) {
      setError(t("clients.messages.error"));
    } finally {
      setLoading(false);
    }
  };

  // Actualizar clientes al cambiar búsqueda o página
  useEffect(() => {
    fetchClientes();
  }, [search, page, perPage]);

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

  // Efecto para controlar la visibilidad de la sección de datos básicos
  useEffect(() => {
    // Si cualquiera de los wizards está activo, ocultar la sección de datos básicos
    const anyWizardVisible =
      showLocationWizard ||
      showVendorWizard ||
      showCoolerWizard ||
      showCargueraWizard;
    setShowBasicData(!anyWizardVisible);
  }, [
    showLocationWizard,
    showVendorWizard,
    showCoolerWizard,
    showCargueraWizard,
  ]);

  // Cargar datos de selects desde la API
  useEffect(() => {
    const fetchSelects = async () => {
      try {
        const [locs, vends, cools, cargueras] = await Promise.all([
          getLocaciones(),
          getVendedores(),
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
          Array.isArray(vends)
            ? vends.map((v) => ({
                id: v.id,
                label: v.nombre || v.name || v.correo || v.email,
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
        console.error("Error cargando selects:", e);
      }
    };
    fetchSelects();
  }, []);

  useEffect(() => {
    // Obtener países
    getPaises()
      .then((data) => {
        setPaises(data.map((p: { id: string | number; nombre: string }) => ({ id: p.id, label: p.nombre })));
      })
      .catch(() => setPaises([]));

    // Obtener tipos de cliente
    fetch(API_ENDPOINTS.TIPOS_CLIENTES.LIST, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) =>
        setTiposCliente(data.map((t: { id: string | number; nombre: string }) => ({ id: t.id, label: t.nombre })))
      )
      .catch(() => setTiposCliente([]));
  }, []);

  // Agregar contacto a la lista
  const handleAgregarContacto = () => {
    if (contactoNombre.trim() && contactoTelefono.trim()) {
      setContactos([
        ...contactos,
        { nombre: contactoNombre.trim(), telefono: contactoTelefono.trim() },
      ]);
      setContactoNombre("");
      setContactoTelefono("");
    }
  };

  // Eliminar contacto
  const handleEliminarContacto = (idx: number) => {
    setContactos(contactos.filter((_, i) => i !== idx));
  };

  // Manejar cambio de carguera y cargar coolers relacionados
  const handleCargueraChange = async (e: { target: { value: string } }) => {
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
  const handleInputChange = async (e: { target: { name: string; value: string } }) => {
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
            : t("fieldRequired", { field: fieldLabels[name as keyof typeof fieldLabels] || name }),
      }));
    }
  };

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
            setCoolersCargueraActual(
              Array.isArray(coolers)
                ? coolers.map((c) => ({
                    id: c.id,
                    label: c.nombre || c.codigo,
                  }))
                : []
            );
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

  // Agregar carguera+cooler
  const handleAgregarCarguera = () => {
    if (cargueraActual && coolerActual) {
      setCarguerasSeleccionadas([
        ...carguerasSeleccionadas,
        { id: cargueraActual, cooler_id: coolerActual },
      ]);
      // Guardar historial de coolers para esa carguera
      setCoolersPorCarguera((prev) => ({
        ...prev,
        [cargueraActual]: coolersCargueraActual,
      }));
      setCargueraActual("");
      setCoolerActual("");
      setCoolersCargueraActual([]);
    }
  };

  // Eliminar carguera+cooler
  const handleEliminarCarguera = (idx: number) => {
    setCarguerasSeleccionadas(
      carguerasSeleccionadas.filter((_, i) => i !== idx)
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault && e.preventDefault();
    setFieldErrors({});
    
    // Validación usando la utilidad importada
    const newFieldErrors = validateClienteForm(formData, fieldLabels, t, contactos, carguerasSeleccionadas);
    
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setModal({ open: true, message: t("common.required"), type: "error" });
      return;
    }
    // Concatenar nombres y teléfonos de contactos
    const contactosNombres = contactos.map((c) => c.nombre).join(",");
    const contactosTelefonos = contactos.map((c) => c.telefono).join(",");
    let dataToSend: ClientePayload = {
      NombreCliente: formData.NombreCliente,
      codcustomer: formData.codcustomer,
      estado: formData.provincia,
      ciudad: formData.ciudad,
      direccion: formData.direccion,
      direccionCobranzas: formData.direccionCobranzas,
      zipcode: formData.zipcode,
      telefono: contactosTelefonos,
      email: formData.email,
      emailFactura: formData.emailFactura,
      contacto: contactosNombres,
      pais_id: formData.pais ? Number(formData.pais) : null,
      locacion_id: formData.locacion ? Number(formData.locacion) : null,
      vendedor_id: formData.vendedor ? Number(formData.vendedor) : null,
      tipo_cliente_id: formData.tipoCliente
        ? Number(formData.tipoCliente)
        : null,
      prioridad: formData.prioridad || "Muy baja",
      cargueras: carguerasSeleccionadas.map((c) => ({
        id: Number(c.id),
        cooler_id: Number(c.cooler_id),
      })),
      // Nuevos campos
      cupoCredito: formData.cupoCredito,
      
      // Concatenamos nombre y teléfono para cada contacto obligatorio en formato "nombre,teléfono"
      contactoComercial: formData.contactoComercial && formData.telefonoComercial 
        ? `${formData.contactoComercial},${formData.telefonoComercial}` 
        : formData.contactoComercial || "",
        
      contactoFinanciero: formData.contactoFinanciero && formData.telefonoFinanciero
        ? `${formData.contactoFinanciero},${formData.telefonoFinanciero}` 
        : formData.contactoFinanciero || "",
        
      contactoFactura: formData.contactoFactura && formData.telefonoFacturacion
        ? `${formData.contactoFactura},${formData.telefonoFacturacion}` 
        : formData.contactoFactura || "",
        
      contactoTecnico: formData.contactoTecnico && formData.telefonoTecnico
        ? `${formData.contactoTecnico},${formData.telefonoTecnico}` 
        : formData.contactoTecnico || "",
      
      // Mantenemos también los campos de teléfono por separado por si se necesitan
      telefonoComercial: formData.telefonoComercial,
      telefonoFinanciero: formData.telefonoFinanciero,
      telefonoFacturacion: formData.telefonoFacturacion,
      telefonoTecnico: formData.telefonoTecnico,
    };
    // Si es creación, agregar orden = max + 1
    if (!editingCustomer) {
      const maxOrden =
        customers && customers.length > 0
          ? Math.max(
              ...customers.map((c: any) =>
                typeof c.orden === "number" ? c.orden : 0
              )
            )
          : 0;
      dataToSend.orden = maxOrden + 1;
    }
    setLoading(true);
    setError("");
    try {
      if (editingCustomer) {
        await updateCliente(editingCustomer.id, dataToSend);
        setEditingCustomer(null);
        setModal({
          open: true,
          message: t("clients.messages.updated"),
          type: "success",
        });
        // Cerrar el modal automáticamente después de 1.5 segundos si es éxito
        setTimeout(() => {
          setModal((prev) =>
            prev.type === "success" ? { ...prev, open: false } : prev
          );
        }, 1500);
        setShowForm(false); // Cerrar el formulario después de editar
      } else {
        await createCliente(dataToSend);
        setModal({
          open: true,
          message: t("clients.messages.created"),
          type: "success",
        });
        // Cerrar el modal automáticamente después de 1.5 segundos si es éxito
        setTimeout(() => {
          setModal((prev) =>
            prev.type === "success" ? { ...prev, open: false } : prev
          );
        }, 1500);
      }
      await fetchClientes();

      // Limpiar contactos y cargueras
      setContactos([]);
      setCarguerasSeleccionadas([]);
      setCoolersPorCarguera({});

      setFormData(initialClienteFormState);
      
      // Limpiar storage temporal al guardar
      localStorage.removeItem("cliente_form_temp");
      // Limpiar cargueras seleccionadas y selects relacionados
      setCargueraActual("");
      setCoolerActual("");
      setCoolersCargueraActual([]);
      setCoolersPorCarguera({});
    } catch (e: any) {
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

  const handleEdit = async (customer: any) => {
    setEditingCustomer(customer);

    // Limpiar estados previos para evitar mezclas de datos
    setContactos([]);
    setCarguerasSeleccionadas([]);
    setCoolersPorCarguera({});

    // Si el cliente tiene contactos, cargarlos como objetos separados
    if (customer.contacto && customer.telefono) {
      const nombres = customer.contacto.split(",");
      const telefonos = customer.telefono.split(",");
      const contactosArray: Contacto[] = [];

      // Crear pares de contacto+teléfono
      for (let i = 0; i < Math.min(nombres.length, telefonos.length); i++) {
        if (nombres[i].trim() && telefonos[i].trim()) {
          contactosArray.push({
            nombre: nombres[i].trim(),
            telefono: telefonos[i].trim(),
          });
        }
      }

      setContactos(contactosArray);
    }

    // Si el cliente tiene array de cargueras, cargarlo en el estado
    if (Array.isArray(customer.cargueras) && customer.cargueras.length > 0) {
      setCarguerasSeleccionadas(
        customer.cargueras.map((c: any) => ({
          id: String(c.id),
          cooler_id: String(c.cooler_id),
        }))
      );
      // Opcional: reconstruir historial de coolers por carguera para mostrar nombres
      const coolersHist: Record<string, SelectOption[]> = {};
      for (const c of customer.cargueras) {
        if (c.carguera && Array.isArray(c.carguera.coolers)) {
          coolersHist[String(c.id)] = c.carguera.coolers.map((cooler: any) => ({
            id: String(cooler.id),
            label: cooler.nombre || cooler.codigo,
          }));
        }
      }
      setCoolersPorCarguera(coolersHist);
    }

    // El resto de tu lógica para cargar los campos del formulario:
    let cargueraId =
      customer.cargueras_id ||
      (customer.carguera && typeof customer.carguera === "object"
        ? customer.carguera.id
        : customer.carguera);
    let coolerId = customer.cooler_id || customer.cuartoFrio;

    // Procesamos los contactos obligatorios para extraer nombre y teléfono
    // El formato en la base de datos es "nombre,teléfono"
    let contactoComercial = "";
    let telefonoComercial = "";
    let contactoFinanciero = "";
    let telefonoFinanciero = "";
    let contactoFactura = "";
    let telefonoFacturacion = "";
    let contactoTecnico = "";
    let telefonoTecnico = "";
    
    // Procesar contacto comercial
    if (customer.contactoComercial) {
      const parts = customer.contactoComercial.split(',');
      if (parts.length >= 2) {
        contactoComercial = parts[0].trim();
        telefonoComercial = parts[1].trim();
      } else {
        contactoComercial = customer.contactoComercial;
      }
    }
    
    // Procesar contacto financiero
    if (customer.contactoFinanciero) {
      const parts = customer.contactoFinanciero.split(',');
      if (parts.length >= 2) {
        contactoFinanciero = parts[0].trim();
        telefonoFinanciero = parts[1].trim();
      } else {
        contactoFinanciero = customer.contactoFinanciero;
      }
    }
    
    // Procesar contacto factura
    if (customer.contactoFactura) {
      const parts = customer.contactoFactura.split(',');
      if (parts.length >= 2) {
        contactoFactura = parts[0].trim();
        telefonoFacturacion = parts[1].trim();
      } else {
        contactoFactura = customer.contactoFactura;
      }
    }
    
    // Procesar contacto técnico
    if (customer.contactoTecnico) {
      const parts = customer.contactoTecnico.split(',');
      if (parts.length >= 2) {
        contactoTecnico = parts[0].trim();
        telefonoTecnico = parts[1].trim();
      } else {
        contactoTecnico = customer.contactoTecnico;
      }
    }

    setFormData({
      NombreCliente: customer.NombreCliente || "",
      codcustomer: customer.codcustomer || customer.codigo || "",
      ciudad: customer.ciudad || "",
      direccion: customer.direccion || "",
      direccionCobranzas: customer.direccionCobranzas || "",
      provincia: customer.provincia || customer.estado || "",
      zipcode: customer.zipcode || "",
      contacto: customer.contacto || "",
      telefono: customer.telefono || "",
      email: customer.email || "",
      emailFactura: customer.emailFactura || "",
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
      vendedor: customer.vendedor_id
        ? String(customer.vendedor_id)
        : customer.vendedor && typeof customer.vendedor === "object"
        ? String(customer.vendedor.id)
        : customer.vendedor
        ? String(customer.vendedor)
        : "",
      carguera: cargueraId ? String(cargueraId) : "",
      tipoCliente: customer.tipo_cliente_id
        ? String(customer.tipo_cliente_id)
        : customer.tipo_cliente && typeof customer.tipo_cliente === "object"
        ? String(customer.tipo_cliente.id)
        : customer.tipoCliente
        ? String(customer.tipoCliente)
        : "",
      cuartoFrio: coolerId ? String(coolerId) : "",
      prioridad: customer.prioridad ? String(customer.prioridad) : "1",
      cupoCredito: customer.cupoCredito || "",
      // Campos de contactos obligatorios separados
      contactoComercial,
      telefonoComercial,
      contactoFinanciero,
      telefonoFinanciero,
      contactoFactura,
      telefonoFacturacion,
      contactoTecnico,
      telefonoTecnico,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string | number) => {
    setLoading(true);
    setError("");
    try {
      await deleteCliente(id);
      await fetchClientes();
    } catch (e) {
      setError(t("clients.messages.error"));
    } finally {
      setLoading(false);
    }
  };

  // Autoguardado en localStorage
  useEffect(() => {
    if (showForm) {
      localStorage.setItem("cliente_form_temp", JSON.stringify(formData));
    }
  }, [formData, showForm]);

  useEffect(() => {
    if (showForm) {
      const temp = localStorage.getItem("cliente_form_temp");
      if (temp) {
        setFormData(JSON.parse(temp));
      }
    }
  }, [showForm]);

  const handleCreateNew = () => {
    // Limpiar listas de contactos y cargueras
    setContactos([]);
    setCarguerasSeleccionadas([]);
    setCoolersPorCarguera({});

    setFormData(initialClienteFormState);
    setEditingCustomer(null);
    setShowForm(true);
  };

  // Al cerrar el formulario, limpiar errores y modal, y también limpiar los errores visuales de los campos requeridos
  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData(initialClienteFormState);
    setFieldErrors({}); // Limpiar errores de validación
    setModal({ open: false, message: "", type: "success" }); // Cerrar modal si está abierto
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
  const handleBlur = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    const requiredField = Object.keys(fieldLabels);
    if (requiredField.includes(name)) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]:
          value && value.toString().trim() !== ""
            ? ""
            : t("fieldRequired", { field: fieldLabels[name as keyof typeof fieldLabels] || name }),
      }));
    }
  };

  return {
    // Estados
    formData,
    showForm,
    editingCustomer,
    customers,
    loading,
    error,
    modal,
    search,
    page,
    perPage,
    totalPages,
    locaciones,
    vendedores,
    cuartosFrios,
    paises,
    tiposCliente,
    loadingSelects,
    cargueraOptions,
    fieldErrors,
    fieldLabels,
    carguerasSeleccionadas,
    cargueraActual,
    coolerActual,
    coolersCargueraActual,
    coolersPorCarguera,
    contactos,
    contactoNombre,
    contactoTelefono,
    showLocationWizard,
    showVendorWizard,
    showCoolerWizard,
    showCargueraWizard,
    showBasicData,

    // Métodos
    setFormData,
    setShowForm,
    setEditingCustomer,
    setSearch,
    setPage,
    setPerPage,
    setCargueraActual,
    setCoolerActual,
    setContactoNombre,
    setContactoTelefono,
    setShowLocationWizard,
    setShowVendorWizard,
    setShowCoolerWizard,
    setShowCargueraWizard,
    setModal,

    // Manejadores de eventos
    handlePlaceSelected,
    handleCargueraChange,
    handleInputChange,
    handleAgregarCarguera,
    handleEliminarCarguera,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCreateNew,
    handleCancel,
    handleBlur,
    handleAgregarContacto,
    handleEliminarContacto,
    
    // Funciones de operaciones
    fetchClientes,
    
    // Setters adicionales
    setShowBasicData,
    setLocaciones,
    setVendedores,
    setCuartosFrios,
    setCargueraOptions,
    
    // Constantes y servicios API
    API_ENDPOINTS,
    getAuthHeaders,
    getLocaciones,
    getVendedores,
    getCargueras
  };
};
