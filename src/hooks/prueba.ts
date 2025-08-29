import { useRef } from 'react';

export interface UsuarioWizardProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
}

export interface UserFormRefs {
  // Datos personales
  nombre: React.RefObject<HTMLInputElement | null>;
  apellidos: React.RefObject<HTMLInputElement | null>;
  email: React.RefObject<HTMLInputElement | null>;
  telefono: React.RefObject<HTMLInputElement | null>;
  direccion: React.RefObject<HTMLTextAreaElement | null>;
  
  // Rol y permisos
  rol: React.RefObject<HTMLSelectElement | null>;
  
  // Estado
  estado: React.RefObject<HTMLSelectElement | null>;
  fechaActivacion: React.RefObject<HTMLInputElement | null>;
}

export const useUserFormRefs = (): UserFormRefs => {
  return {
    // Datos personales
    nombre: useRef<HTMLInputElement>(null),
    apellidos: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    telefono: useRef<HTMLInputElement>(null),
    direccion: useRef<HTMLTextAreaElement>(null),
    
    // Rol y permisos
    rol: useRef<HTMLSelectElement>(null),
    
    // Estado
    estado: useRef<HTMLSelectElement>(null),
    fechaActivacion: useRef<HTMLInputElement>(null),
  };
};

// Clave para almacenamiento temporal de usuarios
export const USER_WIZARD_STORAGE_KEY = 'usuario';

// Interfaz para datos temporales de usuario
export interface TempUserWizardData {
  datosPersonales: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    direccion: string;
  };
  rolPermisos: {
    rol: string;
    permisos: string[];
  };
  estado: {
    estado: string;
    fechaActivacion: string;
  };
}

// Función para guardar datos temporalmente
export const saveUserTempData = (refs: UserFormRefs, permisos: string[]): void => {
  const tempData: TempUserWizardData = {
    datosPersonales: {
      nombre: refs.nombre.current?.value?.trim() || '',
      apellidos: refs.apellidos.current?.value?.trim() || '',
      email: refs.email.current?.value?.trim() || '',
      telefono: refs.telefono.current?.value?.trim() || '',
      direccion: refs.direccion.current?.value?.trim() || '',
    },
    rolPermisos: {
      rol: refs.rol.current?.value || '',
      permisos: permisos,
    },
    estado: {
      estado: refs.estado.current?.value || 'activo',
      fechaActivacion: refs.fechaActivacion.current?.value || new Date().toISOString().split('T')[0],
    }
  };
  
  localStorage.setItem(USER_WIZARD_STORAGE_KEY, JSON.stringify(tempData));
};

// Función para cargar datos temporales
export const loadUserTempData = (): TempUserWizardData | null => {
  try {
    const stored = localStorage.getItem(USER_WIZARD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error al cargar datos temporales del usuario:', error);
    return null;
  }
};

// Función para aplicar datos temporales a los formularios
export const applyUserTempDataToRefs = (refs: UserFormRefs, tempData: TempUserWizardData): string[] => {
  
  
  // Aplicar datos personales
  if (refs.nombre.current) {
    refs.nombre.current.value = tempData.datosPersonales.nombre || '';
    // Disparar evento para asegurar que React detecte el cambio
    const event = new Event('input', { bubbles: true });
    refs.nombre.current.dispatchEvent(event);
  }
  
  if (refs.apellidos.current) {
    refs.apellidos.current.value = tempData.datosPersonales.apellidos || '';
    const event = new Event('input', { bubbles: true });
    refs.apellidos.current.dispatchEvent(event);
  }
  
  if (refs.email.current) {
    refs.email.current.value = tempData.datosPersonales.email || '';
    const event = new Event('input', { bubbles: true });
    refs.email.current.dispatchEvent(event);
  }
  
  if (refs.telefono.current) {
    refs.telefono.current.value = tempData.datosPersonales.telefono || '';
    const event = new Event('input', { bubbles: true });
    refs.telefono.current.dispatchEvent(event);
  }
  
  if (refs.direccion.current) {
    refs.direccion.current.value = tempData.datosPersonales.direccion || '';
    const event = new Event('input', { bubbles: true });
    refs.direccion.current.dispatchEvent(event);
  }  // Aplicar rol
  if (refs.rol.current) {
    const rolValue = tempData.rolPermisos.rol || '';
    refs.rol.current.value = rolValue;
    
    
    // Usar múltiples eventos para elementos select para garantizar el cambio
    ['change', 'input', 'blur', 'focus'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.rol.current!.dispatchEvent(event);
    });
    
    // Doble verificación para asegurar que el valor se aplica
    setTimeout(() => {
      if (refs.rol.current && refs.rol.current.value !== rolValue) {
        refs.rol.current.value = rolValue;
        // Disparar eventos de nuevo
        ['change', 'input', 'blur'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          refs.rol.current!.dispatchEvent(event);
        });
      }
      
    }, 50);
  }
      // Aplicar estado
  if (refs.estado.current) {
    const estadoValue = tempData.estado.estado || 'activo';
    refs.estado.current.value = estadoValue;
    
    
    // Usar múltiples eventos para elementos select para garantizar el cambio
    ['change', 'input', 'blur', 'focus'].forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      refs.estado.current!.dispatchEvent(event);
    });
    
    // Doble verificación para asegurar que el valor se aplica
    setTimeout(() => {
      if (refs.estado.current && refs.estado.current.value !== estadoValue) {
        refs.estado.current.value = estadoValue;
        // Disparar eventos de nuevo
        ['change', 'input', 'blur'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          refs.estado.current!.dispatchEvent(event);
        });
      }
      
    }, 50);
  }
  
  if (refs.fechaActivacion.current) {
    refs.fechaActivacion.current.value = tempData.estado.fechaActivacion || new Date().toISOString().split('T')[0];
    const event = new Event('input', { bubbles: true });
    refs.fechaActivacion.current.dispatchEvent(event);
  }
  
  
  
  // Retornar los permisos para que puedan ser establecidos en el state
  return tempData.rolPermisos.permisos || [];
};

// Función para limpiar datos temporales
export const clearUserTempData = (): void => {
  localStorage.removeItem(USER_WIZARD_STORAGE_KEY);
};

// Función para recopilar todos los datos del formulario
export const collectUserFormData = (refs: UserFormRefs, permisos: string[]): TempUserWizardData => {
  return {
    datosPersonales: {
      nombre: refs.nombre.current?.value?.trim() || '',
      apellidos: refs.apellidos.current?.value?.trim() || '',
      email: refs.email.current?.value?.trim() || '',
      telefono: refs.telefono.current?.value?.trim() || '',
      direccion: refs.direccion.current?.value?.trim() || '',
    },
    rolPermisos: {
      rol: refs.rol.current?.value || '',
      permisos: permisos,
    },
    estado: {
      estado: refs.estado.current?.value || 'activo',
      fechaActivacion: refs.fechaActivacion.current?.value || new Date().toISOString().split('T')[0],
    }
  };
};

// Función específica para forzar la selección en el select de rol
export const forceSelectRol = (refs: UserFormRefs): void => {
  const tempData = loadUserTempData();
  if (
    tempData &&
    tempData.rolPermisos.rol &&
    refs.rol.current
  ) {
    // Guardar el valor actual para debug
    const valorAntes = refs.rol.current.value;

    // Forzar valor directamente
    refs.rol.current.value = tempData.rolPermisos.rol;    // Disparar múltiples eventos para asegurar que se capture el cambio
    ["change", "input", "blur", "focus"].forEach((eventType) => {
      const event = new Event(eventType, { bubbles: true });
      refs.rol.current!.dispatchEvent(event);
    });

  } else {
    console.log(
      "No se pudo forzar el valor de rol - no hay datos o referencia"
    );
  }
};

// Función específica para forzar la selección en el select de estado
export const forceSelectEstado = (refs: UserFormRefs): void => {
  const tempData = loadUserTempData();
  if (
    tempData &&
    tempData.estado.estado &&
    refs.estado.current
  ) {
    // Guardar el valor actual para debug
    const valorAntes = refs.estado.current.value;

    // Forzar valor directamente
    refs.estado.current.value = tempData.estado.estado;    // Disparar múltiples eventos para asegurar que se capture el cambio
    ["change", "input", "blur", "focus"].forEach((eventType) => {
      const event = new Event(eventType, { bubbles: true });
      refs.estado.current!.dispatchEvent(event);
    });
  } else {
    console.log(
      "No se pudo forzar el valor de estado - no hay datos o referencia"
    );
  }
};

// Función para limpiar campos específicos según el paso actual
export const clearSpecificUserFields = (refs: UserFormRefs, currentStep: number): void => {
  // Limpiar solo campos visibles según el paso actual
  if (currentStep === 1) {
    if (refs.nombre.current) refs.nombre.current.value = "";
    if (refs.apellidos.current) refs.apellidos.current.value = "";
    if (refs.email.current) refs.email.current.value = "";
    if (refs.telefono.current) refs.telefono.current.value = "";
    if (refs.direccion.current) refs.direccion.current.value = "";
  } else if (currentStep === 2) {
    if (refs.rol.current) refs.rol.current.value = "";
    // Los permisos se manejan a través del estado del componente
  } else if (currentStep === 3) {
    if (refs.estado.current) refs.estado.current.value = "";
    if (refs.fechaActivacion.current) refs.fechaActivacion.current.value = "";
  }

  
};

// Función para recargar datos manualmente desde el localStorage
export const reloadUserDataFromStorage = (refs: UserFormRefs, currentStep: number): string[] => {
  const tempData = loadUserTempData();
  if (tempData) {
    

    // Primer intento de aplicar datos
    const permisos = applyUserTempDataToRefs(refs, tempData);

    // Segunda aplicación después de un breve retraso para asegurar que los datos se apliquen
    setTimeout(() => {
      // Verificar si necesitamos forzar valores específicos según el paso actual
      if (currentStep === 2 && tempData.rolPermisos.rol && refs.rol.current) {
        refs.rol.current.value = tempData.rolPermisos.rol;
        const event = new Event("change", { bubbles: true });
        refs.rol.current.dispatchEvent(event);
        
      }
      
      if (currentStep === 3 && tempData.estado.estado && refs.estado.current) {
        // Llamar a la función específica para estado
        forceSelectEstado(refs);

        // Para mayor seguridad, volvemos a verificar después de un breve tiempo
        setTimeout(() => {
          // Verificar si el valor se aplicó correctamente
          if (
            refs.estado.current &&
            refs.estado.current.value !== tempData.estado.estado
          ) {
           
            forceSelectEstado(refs);
          }
        }, 100);
      }
    }, 100);

    return permisos;
  } else {
    
    return [];
  }
};
