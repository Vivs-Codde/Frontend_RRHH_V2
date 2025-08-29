import { useEffect, useRef } from 'react';

/**
 * Hook para manejar la persistencia de valores en selects que dependen de datos de API
 * Aplica el valor una vez que las opciones estén disponibles
 */
export const useSelectPersistence = (
  selectRef: React.RefObject<HTMLSelectElement | null>,
  options: any[],
  savedValue: string,
  isLoading: boolean
) => {
  const hasAppliedValue = useRef(false);
  const pendingValue = useRef(savedValue);

  useEffect(() => {
    // Solo aplicar si hay un valor guardado, opciones disponibles, el select existe y no se ha aplicado aún
    if (
      pendingValue.current &&
      options.length > 0 &&
      selectRef.current &&
      !isLoading &&
      !hasAppliedValue.current
    ) {
      // Verificar que la opción existe en las opciones cargadas
      const optionExists = options.some(option => 
        option.nombre === pendingValue.current || option.id.toString() === pendingValue.current
      );

      if (optionExists) {
        selectRef.current.value = pendingValue.current;
        
        // Disparar evento change para notificar a React
        const changeEvent = new Event('change', { bubbles: true });
        selectRef.current.dispatchEvent(changeEvent);
        
        hasAppliedValue.current = true;
        
      }
    }
  }, [options, isLoading, selectRef, savedValue]);

  // Resetear cuando cambie el valor guardado
  useEffect(() => {
    if (pendingValue.current !== savedValue) {
      pendingValue.current = savedValue;
      hasAppliedValue.current = false;
    }
  }, [savedValue]);

  return {
    isValuePending: !hasAppliedValue.current && !!pendingValue.current,
    pendingValue: pendingValue.current
  };
};
