import { useRef } from 'react';

export interface ClienteFormRefs {
  // Datos básicos
  numeroCliente: React.RefObject<HTMLInputElement | null>;
  codigo: React.RefObject<HTMLInputElement | null>;
  addressSearch: React.RefObject<HTMLInputElement | null>; // Para el input de búsqueda de dirección
  pais: React.RefObject<HTMLSelectElement | null>;
  provincia: React.RefObject<HTMLInputElement | null>;
  ciudad: React.RefObject<HTMLInputElement | null>;
  direccion: React.RefObject<HTMLInputElement | null>;
  zipcode: React.RefObject<HTMLInputElement | null>;
  telefono: React.RefObject<HTMLInputElement | null>;
  email: React.RefObject<HTMLInputElement | null>;
  
  // Datos de ventas
  ubicacionSeleccionada: React.RefObject<HTMLSelectElement | null>; // Nuevo campo para selección
  nombreUbicacion: React.RefObject<HTMLInputElement | null>;
  latitud: React.RefObject<HTMLInputElement | null>;
  longitud: React.RefObject<HTMLInputElement | null>;
  vendedorSeleccionado: React.RefObject<HTMLSelectElement | null>; // Nuevo campo para selección
  nombreVendedor: React.RefObject<HTMLInputElement | null>;
  correoVendedor: React.RefObject<HTMLInputElement | null>;
  ubicacionVendedor: React.RefObject<HTMLInputElement | null>;
  telefonoVendedor: React.RefObject<HTMLInputElement | null>;
  
  // Datos de mercadería
  cargueraSeleccionada: React.RefObject<HTMLSelectElement | null>; // Nuevo campo para selección
  nombreCarguera: React.RefObject<HTMLInputElement | null>;
  rucCarguera: React.RefObject<HTMLInputElement | null>;
  tipoCarguera: React.RefObject<HTMLSelectElement | null>;
  representanteCarguera: React.RefObject<HTMLInputElement | null>;
  telefonoCarguera: React.RefObject<HTMLInputElement | null>;  emailCarguera: React.RefObject<HTMLInputElement | null>;
  nombreCooler: React.RefObject<HTMLInputElement | null>;
  descripcionCooler: React.RefObject<HTMLInputElement | null>;
}

export const useClienteFormRefs = (): ClienteFormRefs => {
  return {
    // Datos básicos
    numeroCliente: useRef<HTMLInputElement>(null),
    codigo: useRef<HTMLInputElement>(null),
    addressSearch: useRef<HTMLInputElement>(null),
    pais: useRef<HTMLSelectElement>(null),
    provincia: useRef<HTMLInputElement>(null),
    ciudad: useRef<HTMLInputElement>(null),
    direccion: useRef<HTMLInputElement>(null),
    zipcode: useRef<HTMLInputElement>(null),
    telefono: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    
    // Datos de ventas
    ubicacionSeleccionada: useRef<HTMLSelectElement>(null), // Nuevo campo para selección
    nombreUbicacion: useRef<HTMLInputElement>(null),
    latitud: useRef<HTMLInputElement>(null),
    longitud: useRef<HTMLInputElement>(null),
    vendedorSeleccionado: useRef<HTMLSelectElement>(null), // Nuevo campo para selección
    nombreVendedor: useRef<HTMLInputElement>(null),
    correoVendedor: useRef<HTMLInputElement>(null),
    ubicacionVendedor: useRef<HTMLInputElement>(null),
    telefonoVendedor: useRef<HTMLInputElement>(null),
    
    // Datos de mercadería
    cargueraSeleccionada: useRef<HTMLSelectElement>(null), // Nuevo campo para selección
    nombreCarguera: useRef<HTMLInputElement>(null),
    rucCarguera: useRef<HTMLInputElement>(null),
    tipoCarguera: useRef<HTMLSelectElement>(null),
    representanteCarguera: useRef<HTMLInputElement>(null),
    telefonoCarguera: useRef<HTMLInputElement>(null),    emailCarguera: useRef<HTMLInputElement>(null),
    nombreCooler: useRef<HTMLInputElement>(null),
    descripcionCooler: useRef<HTMLInputElement>(null),
  };
};

// Clave para almacenamiento temporal de clientes
export const CLIENT_WIZARD_STORAGE_KEY = 'client_wizard_temp_data';

// Interfaz para datos temporales de cliente
export interface TempClienteWizardData {
  datosBasicos: {
    numeroCliente: string;
    codigo: string;
    pais: string;
    provincia: string;
    ciudad: string;
    direccion: string;
    zipcode: string;
    telefono: string;
    email: string;
    addressSearch: string; // Añadido para mantener el valor del campo de búsqueda
  };
  datosVentas: {
    ubicacionSeleccionada: string; // Nuevo campo para selección
    nombreUbicacion: string;
    latitud: string;    longitud: string;
    vendedorSeleccionado: string; // Nuevo campo para selección
    nombreVendedor: string;
    correoVendedor: string;
    ubicacionVendedor: string;
    telefonoVendedor: string;
    mostrarFormularioUbicacion?: boolean; // Estado del checkbox para ubicación
    mostrarFormularioVendedor?: boolean; // Estado del checkbox para vendedor
  };  datosMercaderia: {
    cargueraSeleccionada: string; // Nuevo campo para selección
    nombreCarguera: string;
    rucCarguera: string;
    tipoCarguera: string;
    representanteCarguera: string;
    telefonoCarguera: string;
    emailCarguera: string;
    nombreCooler: string;
    descripcionCooler: string;
    mostrarFormularioCarguera?: boolean; // Estado del checkbox para carguera
  };
}

// Función para guardar datos temporalmente
export const saveClienteTempData = (refs: ClienteFormRefs, checkboxState?: {
  mostrarFormularioUbicacion?: boolean;
  mostrarFormularioVendedor?: boolean;
  mostrarFormularioCarguera?: boolean;
}): void => {
  
  
  const tempData: TempClienteWizardData = {
    datosBasicos: {
      numeroCliente: refs.numeroCliente.current?.value?.trim() || '',
      codigo: refs.codigo.current?.value?.trim() || '',
      pais: refs.pais.current?.value || '',
      provincia: refs.provincia.current?.value?.trim() || '',
      ciudad: refs.ciudad.current?.value?.trim() || '',
      direccion: refs.direccion.current?.value?.trim() || '',
      zipcode: refs.zipcode.current?.value?.trim() || '',
      telefono: refs.telefono.current?.value?.trim() || '',
      email: refs.email.current?.value?.trim() || '',
      addressSearch: refs.addressSearch.current?.value?.trim() || '',
    },
    datosVentas: {
      ubicacionSeleccionada: refs.ubicacionSeleccionada.current?.value || '',
      nombreUbicacion: refs.nombreUbicacion.current?.value?.trim() || '',
      latitud: refs.latitud.current?.value?.trim() || '',
      longitud: refs.longitud.current?.value?.trim() || '',
      vendedorSeleccionado: refs.vendedorSeleccionado.current?.value || '',
      nombreVendedor: refs.nombreVendedor.current?.value?.trim() || '',
      correoVendedor: refs.correoVendedor.current?.value?.trim() || '',
      ubicacionVendedor: refs.ubicacionVendedor.current?.value?.trim() || '',
      telefonoVendedor: refs.telefonoVendedor.current?.value?.trim() || '',
      mostrarFormularioUbicacion: checkboxState?.mostrarFormularioUbicacion || false,
      mostrarFormularioVendedor: checkboxState?.mostrarFormularioVendedor || false,
    },    datosMercaderia: {
      cargueraSeleccionada: refs.cargueraSeleccionada.current?.value || '',
      nombreCarguera: refs.nombreCarguera.current?.value?.trim() || '',
      rucCarguera: refs.rucCarguera.current?.value?.trim() || '',
      tipoCarguera: refs.tipoCarguera.current?.value || '',
      representanteCarguera: refs.representanteCarguera.current?.value?.trim() || '',
      telefonoCarguera: refs.telefonoCarguera.current?.value?.trim() || '',      emailCarguera: refs.emailCarguera.current?.value?.trim() || '',
      nombreCooler: refs.nombreCooler.current?.value?.trim() || '',
      descripcionCooler: refs.descripcionCooler.current?.value?.trim() || '',
      mostrarFormularioCarguera: checkboxState?.mostrarFormularioCarguera || false,
    }
  };
  
 
  localStorage.setItem(CLIENT_WIZARD_STORAGE_KEY, JSON.stringify(tempData));
};

// Función para cargar datos temporales
export const loadClienteTempData = (): TempClienteWizardData | null => {
  try {
    const stored = localStorage.getItem(CLIENT_WIZARD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error al cargar datos temporales del cliente:', error);
    return null;
  }
};

// Función para aplicar datos temporales a los formularios
export const applyClienteTempDataToRefs = (refs: ClienteFormRefs, tempData: TempClienteWizardData): void => {
  
  
  // Aplicar datos básicos
  if (refs.numeroCliente.current) {
    refs.numeroCliente.current.value = tempData.datosBasicos.numeroCliente || '';
    // Disparar evento para asegurar que React detecte el cambio
    const event = new Event('input', { bubbles: true });
    refs.numeroCliente.current.dispatchEvent(event);
  }
  
  if (refs.codigo.current) {
    refs.codigo.current.value = tempData.datosBasicos.codigo || '';
    const event = new Event('input', { bubbles: true });
    refs.codigo.current.dispatchEvent(event);
  }
  
  if (refs.pais.current) {
    refs.pais.current.value = tempData.datosBasicos.pais || '';
    // Usar múltiples eventos para elementos select para garantizar el cambio
    ['change', 'input', 'blur'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.pais.current!.dispatchEvent(event);
    });
    
  }
  
  if (refs.provincia.current) {
    refs.provincia.current.value = tempData.datosBasicos.provincia || '';
    const event = new Event('input', { bubbles: true });
    refs.provincia.current.dispatchEvent(event);
  }
  
  if (refs.ciudad.current) {
    refs.ciudad.current.value = tempData.datosBasicos.ciudad || '';
    const event = new Event('input', { bubbles: true });
    refs.ciudad.current.dispatchEvent(event);
  }
  
  if (refs.direccion.current) {
    refs.direccion.current.value = tempData.datosBasicos.direccion || '';
    const event = new Event('input', { bubbles: true });
    refs.direccion.current.dispatchEvent(event);
  }
  
  if (refs.zipcode.current) {
    refs.zipcode.current.value = tempData.datosBasicos.zipcode || '';
    const event = new Event('input', { bubbles: true });
    refs.zipcode.current.dispatchEvent(event);
  }
  
  if (refs.telefono.current) {
    refs.telefono.current.value = tempData.datosBasicos.telefono || '';
    const event = new Event('input', { bubbles: true });
    refs.telefono.current.dispatchEvent(event);
  }
    if (refs.email.current) {
    refs.email.current.value = tempData.datosBasicos.email || '';
    const event = new Event('input', { bubbles: true });
    refs.email.current.dispatchEvent(event);
  }
  
  // Restaurar valor del campo de búsqueda de direcciones
  if (refs.addressSearch.current) {
    refs.addressSearch.current.value = tempData.datosBasicos.addressSearch || '';
    const event = new Event('input', { bubbles: true });
    refs.addressSearch.current.dispatchEvent(event);
  }    // Aplicar datos de ventas  // Capturar estados de selects para paso de ventas
  if (refs.ubicacionSeleccionada.current) {
    const ubicacionValue = tempData.datosVentas.ubicacionSeleccionada || '';
    refs.ubicacionSeleccionada.current.value = ubicacionValue;
    
    
    // Disparar múltiples eventos para asegurar que el cambio se registre
    ['change', 'input', 'blur', 'focus'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.ubicacionSeleccionada.current!.dispatchEvent(event);
    });
    
    // Verificación adicional
    setTimeout(() => {
      if (refs.ubicacionSeleccionada.current && refs.ubicacionSeleccionada.current.value !== ubicacionValue) {
        refs.ubicacionSeleccionada.current.value = ubicacionValue;
        ['change', 'input'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          refs.ubicacionSeleccionada.current!.dispatchEvent(event);
        });
      }      
    }, 50);
  }
  
  if (refs.vendedorSeleccionado.current) {
    const vendedorValue = tempData.datosVentas.vendedorSeleccionado || '';
    refs.vendedorSeleccionado.current.value = vendedorValue;
    
    
    // Disparar múltiples eventos para asegurar que el cambio se registre
    ['change', 'input', 'blur', 'focus'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.vendedorSeleccionado.current!.dispatchEvent(event);
    });
    
    // Verificación adicional
    setTimeout(() => {
      if (refs.vendedorSeleccionado.current && refs.vendedorSeleccionado.current.value !== vendedorValue) {
        refs.vendedorSeleccionado.current.value = vendedorValue;
        ['change', 'input'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          refs.vendedorSeleccionado.current!.dispatchEvent(event);
        });
      }
      
    }, 50);
  }
    // Capturar estados de selects para paso de mercadería
  if (refs.cargueraSeleccionada.current) {
    const cargueraValue = tempData.datosMercaderia.cargueraSeleccionada || '';
    refs.cargueraSeleccionada.current.value = cargueraValue;
    
    
    // Disparar múltiples eventos para asegurar que el cambio se registre
    ['change', 'input', 'blur', 'focus'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.cargueraSeleccionada.current!.dispatchEvent(event);
    });
    
    // Verificación adicional
    setTimeout(() => {
      if (refs.cargueraSeleccionada.current && refs.cargueraSeleccionada.current.value !== cargueraValue) {
        refs.cargueraSeleccionada.current.value = cargueraValue;
        ['change', 'input'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          refs.cargueraSeleccionada.current!.dispatchEvent(event);
        });
      }      
    }, 50);
  }
  
  if (refs.nombreUbicacion.current) {
    refs.nombreUbicacion.current.value = tempData.datosVentas.nombreUbicacion || '';
    const event = new Event('input', { bubbles: true });
    refs.nombreUbicacion.current.dispatchEvent(event);
  }
  
  if (refs.latitud.current) {
    refs.latitud.current.value = tempData.datosVentas.latitud || '';
    const event = new Event('input', { bubbles: true });
    refs.latitud.current.dispatchEvent(event);
  }
  
  if (refs.longitud.current) {
    refs.longitud.current.value = tempData.datosVentas.longitud || '';
    const event = new Event('input', { bubbles: true });
    refs.longitud.current.dispatchEvent(event);
  }
  
  if (refs.nombreVendedor.current) {
    refs.nombreVendedor.current.value = tempData.datosVentas.nombreVendedor || '';
    const event = new Event('input', { bubbles: true });
    refs.nombreVendedor.current.dispatchEvent(event);
  }
  
  if (refs.correoVendedor.current) {
    refs.correoVendedor.current.value = tempData.datosVentas.correoVendedor || '';
    const event = new Event('input', { bubbles: true });
    refs.correoVendedor.current.dispatchEvent(event);
  }
  
  if (refs.ubicacionVendedor.current) {
    refs.ubicacionVendedor.current.value = tempData.datosVentas.ubicacionVendedor || '';
    const event = new Event('input', { bubbles: true });
    refs.ubicacionVendedor.current.dispatchEvent(event);
  }
  
  if (refs.telefonoVendedor.current) {
    refs.telefonoVendedor.current.value = tempData.datosVentas.telefonoVendedor || '';
    const event = new Event('input', { bubbles: true });
    refs.telefonoVendedor.current.dispatchEvent(event);
  }
  // Aplicar datos de mercadería
  if (refs.nombreCarguera.current) {
    refs.nombreCarguera.current.value = tempData.datosMercaderia.nombreCarguera || '';
    const event = new Event('input', { bubbles: true });
    refs.nombreCarguera.current.dispatchEvent(event);
  }
  
  if (refs.rucCarguera.current) {
    refs.rucCarguera.current.value = tempData.datosMercaderia.rucCarguera || '';
    const event = new Event('input', { bubbles: true });
    refs.rucCarguera.current.dispatchEvent(event);
  }
  
  if (refs.tipoCarguera.current) {
    const tipoValue = tempData.datosMercaderia.tipoCarguera || '';
    refs.tipoCarguera.current.value = tipoValue;
    
    
    // Usar múltiples eventos para elementos select para garantizar el cambio
    ['change', 'input', 'blur', 'focus'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.tipoCarguera.current!.dispatchEvent(event);
    });
    
    // Doble verificación para asegurar que el valor se aplica
    setTimeout(() => {
      if (refs.tipoCarguera.current && refs.tipoCarguera.current.value !== tipoValue) {
        refs.tipoCarguera.current.value = tipoValue;
        // Disparar eventos de nuevo
        ['change', 'input', 'blur'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          refs.tipoCarguera.current!.dispatchEvent(event);
        });
      }
      
    }, 50);
  }
  
  if (refs.representanteCarguera.current) {
    refs.representanteCarguera.current.value = tempData.datosMercaderia.representanteCarguera || '';
    const event = new Event('input', { bubbles: true });
    refs.representanteCarguera.current.dispatchEvent(event);
  }
  
  if (refs.telefonoCarguera.current) {
    refs.telefonoCarguera.current.value = tempData.datosMercaderia.telefonoCarguera || '';
    const event = new Event('input', { bubbles: true });
    refs.telefonoCarguera.current.dispatchEvent(event);
  }
  
  if (refs.emailCarguera.current) {
    refs.emailCarguera.current.value = tempData.datosMercaderia.emailCarguera || '';
    const event = new Event('input', { bubbles: true });
    refs.emailCarguera.current.dispatchEvent(event);
  }
  
  if (refs.nombreCooler.current) {
    refs.nombreCooler.current.value = tempData.datosMercaderia.nombreCooler || '';
    const event = new Event('input', { bubbles: true });
    refs.nombreCooler.current.dispatchEvent(event);
  }
  
  if (refs.descripcionCooler.current) {
    refs.descripcionCooler.current.value = tempData.datosMercaderia.descripcionCooler || '';
    const event = new Event('input', { bubbles: true });
    refs.descripcionCooler.current.dispatchEvent(event);
  }
  
  // Si el campo addressSearch está disponible, mantener consistencia
  if (refs.addressSearch.current && tempData.datosBasicos.direccion) {
    refs.addressSearch.current.value = tempData.datosBasicos.direccion;
    const event = new Event('input', { bubbles: true });
    refs.addressSearch.current.dispatchEvent(event);
  }
  
  
};

// Función para limpiar datos temporales
export const clearClienteTempData = (): void => {
  localStorage.removeItem(CLIENT_WIZARD_STORAGE_KEY);
};

// Función para recopilar todos los datos del formulario
export const collectClienteFormData = (refs: ClienteFormRefs): TempClienteWizardData => {
  return {    
    datosBasicos: {
      numeroCliente: refs.numeroCliente.current?.value?.trim() || '',
      codigo: refs.codigo.current?.value?.trim() || '',
      pais: refs.pais.current?.value || '',
      provincia: refs.provincia.current?.value?.trim() || '',
      ciudad: refs.ciudad.current?.value?.trim() || '',
      direccion: refs.direccion.current?.value?.trim() || '',
      zipcode: refs.zipcode.current?.value?.trim() || '',
      telefono: refs.telefono.current?.value?.trim() || '',
      email: refs.email.current?.value?.trim() || '',
      addressSearch: refs.addressSearch.current?.value?.trim() || '',
    },
    datosVentas: {
      ubicacionSeleccionada: refs.ubicacionSeleccionada.current?.value || '',
      nombreUbicacion: refs.nombreUbicacion.current?.value?.trim() || '',
      latitud: refs.latitud.current?.value?.trim() || '',
      longitud: refs.longitud.current?.value?.trim() || '',
      vendedorSeleccionado: refs.vendedorSeleccionado.current?.value || '',
      nombreVendedor: refs.nombreVendedor.current?.value?.trim() || '',
      correoVendedor: refs.correoVendedor.current?.value?.trim() || '',
      ubicacionVendedor: refs.ubicacionVendedor.current?.value?.trim() || '',
      telefonoVendedor: refs.telefonoVendedor.current?.value?.trim() || '',
    },
    datosMercaderia: {
      cargueraSeleccionada: refs.cargueraSeleccionada.current?.value || '',
      nombreCarguera: refs.nombreCarguera.current?.value?.trim() || '',      rucCarguera: refs.rucCarguera.current?.value?.trim() || '',
      tipoCarguera: refs.tipoCarguera.current?.value || '',
      representanteCarguera: refs.representanteCarguera.current?.value?.trim() || '',
      telefonoCarguera: refs.telefonoCarguera.current?.value?.trim() || '',      emailCarguera: refs.emailCarguera.current?.value?.trim() || '',
      nombreCooler: refs.nombreCooler.current?.value?.trim() || '',
      descripcionCooler: refs.descripcionCooler.current?.value?.trim() || '',
    }
  };
};
