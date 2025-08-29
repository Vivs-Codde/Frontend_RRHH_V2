import { useRef } from 'react';

export interface BodegaFormRefs {
  codigo: React.RefObject<HTMLInputElement | null>;
  nombre: React.RefObject<HTMLInputElement | null>;
  status: React.RefObject<HTMLSelectElement | null>;
}

export const useBodegaFormRefs = (): BodegaFormRefs => {
  return {
    codigo: useRef<HTMLInputElement>(null),
    nombre: useRef<HTMLInputElement>(null),
    status: useRef<HTMLSelectElement>(null),
  };
};
