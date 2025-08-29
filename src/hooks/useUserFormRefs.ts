import { useRef } from 'react';

export interface UsuarioFormRefs {
  // Datos personales
  nombre: React.RefObject<HTMLInputElement | null>;
  apellidos: React.RefObject<HTMLInputElement | null>;
  email: React.RefObject<HTMLInputElement | null>;
  celular: React.RefObject<HTMLInputElement | null>;
  direccion: React.RefObject<HTMLTextAreaElement | null>;
  
  // Rol y permisos
  rol: React.RefObject<HTMLSelectElement | null>;
  tipo: React.RefObject<HTMLSelectElement | null>;
  permisos: React.RefObject<HTMLInputElement | null>;
  // Estado
  estado: React.RefObject<HTMLSelectElement | null>;
}

export const useUsuarioFormRefs = (): UsuarioFormRefs => {
  return {
    // Datos personales
    nombre: useRef<HTMLInputElement>(null),
    apellidos: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    celular: useRef<HTMLInputElement>(null),
    direccion: useRef<HTMLTextAreaElement>(null),
    
   // Rol y permisos
    rol: useRef<HTMLSelectElement>(null),
    tipo: useRef<HTMLSelectElement>(null),
    permisos: useRef<HTMLInputElement>(null),
   
    // Estado
    estado: useRef<HTMLSelectElement>(null),
  };
};

// Clave para almacenamiento temporal de usuarios
export const USER_WIZARD_STORAGE_KEY = 'user_wizard_temp_data';

// Interfaz para datos temporales de usuario
export interface TempUsuarioWizardData {
  datosBasicos: {
    nombre: string;
    apellidos: string;
    email: string;
    celular: string;
    direccion: string;
  };
  datosPermisos: {
    rol: string;
    tipo: string;
    permisos: string[];
  };
  datosEstado: {
    estado: string | boolean;
  };
}

// Función para guardar datos temporalmente
export const saveUsuarioTempData = (refs: UsuarioFormRefs): void => {
  const tempData: TempUsuarioWizardData = {
    datosBasicos: {
      nombre: refs.nombre.current?.value?.trim() || '',
      apellidos: refs.apellidos.current?.value?.trim() || '',
      email: refs.email.current?.value?.trim() || '',
      celular: refs.celular.current?.value?.trim() || '',
      direccion: refs.direccion.current?.value?.trim() || '',
    },
    datosPermisos: {
      rol: refs.rol.current?.value || '',
      tipo: refs.tipo.current?.value || '',
      permisos: refs.permisos.current?.value?.trim().split(',') || [],
    },
    datosEstado: {
      estado: refs.estado.current?.value || '',
    }
  };

  localStorage.setItem(USER_WIZARD_STORAGE_KEY, JSON.stringify(tempData));
};

// Función para cargar datos temporales
export const loadUsuarioTempData = (): TempUsuarioWizardData | null => {
  try {
    const stored = localStorage.getItem(USER_WIZARD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error al cargar datos temporales del usuario:', error);
    return null;
  }
};

// Función para aplicar datos temporales a los formularios
export const applyUsuarioTempDataToRefs = (refs: UsuarioFormRefs, tempData: TempUsuarioWizardData): void => {
  

  // Aplicar datos básicos
  if (refs.nombre.current) {
    refs.nombre.current.value = tempData.datosBasicos.nombre || '';
    const event = new Event('input', { bubbles: true });
    refs.nombre.current.dispatchEvent(event);
  }

  if (refs.apellidos.current) {
    refs.apellidos.current.value = tempData.datosBasicos.apellidos || '';
    const event = new Event('input', { bubbles: true });
    refs.apellidos.current.dispatchEvent(event);
  }
   if (refs.email.current) {
    refs.email.current.value = tempData.datosBasicos.email || '';
    const event = new Event('input', { bubbles: true });
    refs.email.current.dispatchEvent(event);
  }
   if (refs.celular.current) {
    refs.celular.current.value = tempData.datosBasicos.celular || '';
    const event = new Event('input', { bubbles: true });
    refs.celular.current.dispatchEvent(event);
  }
  if (refs.direccion.current) {
    refs.direccion.current.value = tempData.datosBasicos.direccion || '';
    const event = new Event('input', { bubbles: true });
    refs.direccion.current.dispatchEvent(event);
  }
 
 
    // Aplicar datos de permisos
  if (refs.rol.current) {
    refs.rol.current.value = tempData.datosPermisos.rol || '';
    // Usar múltiples eventos para elementos select para garantizar el cambio
    ['change', 'input', 'blur'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.rol.current!.dispatchEvent(event);
    });
    
  }
  if (refs.tipo.current) {
    refs.tipo.current.value = tempData.datosPermisos.tipo || '';
    // Usar múltiples eventos para elementos select para garantizar el cambio
    ['change', 'input', 'blur'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.tipo.current!.dispatchEvent(event);
    });
    
  }
  if (refs.permisos.current) {
    refs.permisos.current.value = tempData.datosPermisos.permisos.join(', ') || '';
    const event = new Event('input', { bubbles: true });
    refs.permisos.current.dispatchEvent(event);
  }
  
  // Aplicar datos de estado
  
  if (refs.estado.current) {
    const estadoValue = tempData.datosEstado.estado ?? '';
    refs.estado.current.value = String(estadoValue);
    
    
    // Usar múltiples eventos para elementos select para garantizar el cambio
    ['change', 'input', 'blur', 'focus'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.estado.current!.dispatchEvent(event);
    });
    
    // Doble verificación para asegurar que el valor se aplica
    setTimeout(() => {
      if (refs.estado.current && refs.estado.current.value !== String(estadoValue)) {
        refs.estado.current.value = String(estadoValue);
        // Disparar eventos de nuevo
        ['change', 'input', 'blur'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          refs.estado.current!.dispatchEvent(event);
        });
      }
      
    }, 50);
  }
  
};

// Función para limpiar datos temporales
export const clearUsuarioTempData = (): void => {
  localStorage.removeItem(USER_WIZARD_STORAGE_KEY);
};

// Función para recopilar todos los datos del formulario
export const collectUsuarioFormData = (refs: UsuarioFormRefs): TempUsuarioWizardData => {
  return {
    datosBasicos: {
      nombre: refs.nombre.current?.value?.trim() || '',
      apellidos: refs.apellidos.current?.value?.trim() || '',
      email: refs.email.current?.value?.trim() || '',
      celular: refs.celular.current?.value?.trim() || '',
      direccion: refs.direccion.current?.value?.trim() || '',
    },
    datosPermisos: {
      rol: refs.rol.current?.value || '',
      tipo: refs.tipo.current?.value || '',
      permisos: refs.permisos.current?.value?.trim().split(',').map(p => p.trim()).filter(p => p.length > 0) || [],
    },
    datosEstado: {
      estado: refs.estado.current?.value || '',
    }
  };
};
