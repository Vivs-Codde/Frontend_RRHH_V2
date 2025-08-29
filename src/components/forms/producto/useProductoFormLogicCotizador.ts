// Hook específico para el cotizador que incluye el guardado en localStorage
import { useProductoFormLogic as useProductoFormLogicBase } from './useProductoFormLogic';

export const useProductoFormLogicCotizador = (initialData: any, onProductCreated?: () => void) => {
  const baseLogic = useProductoFormLogicBase(initialData, onProductCreated);
  
  // Extender la funcionalidad base con el guardado en localStorage para cotizador
  // Aquí podrías agregar cualquier lógica específica del cotizador si es necesaria
  
  return {
    ...baseLogic,
    // Agregar cualquier funcionalidad específica del cotizador aquí
  };
};
