import { useRef } from 'react';

export interface CategoriaFormRefs {
  tipo: React.RefObject<HTMLSelectElement | null>;
  nombreCategoria: React.RefObject<HTMLInputElement | null>;
}

export const useCategoriaFormRefs = (): CategoriaFormRefs => {
  return {
    tipo: useRef<HTMLSelectElement>(null),
    nombreCategoria: useRef<HTMLInputElement>(null),
  };
};
