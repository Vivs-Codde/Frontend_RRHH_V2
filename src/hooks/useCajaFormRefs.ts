import { useRef } from 'react';

export interface CajaFormRefs {
  name: React.RefObject<HTMLInputElement | null>;
  large: React.RefObject<HTMLInputElement | null>;
  wide: React.RefObject<HTMLInputElement | null>;
  hide: React.RefObject<HTMLInputElement | null>;
  equivalent: React.RefObject<HTMLInputElement | null>;
  weight: React.RefObject<HTMLInputElement | null>;
  status: React.RefObject<HTMLSelectElement | null>;
}

export const useCajaFormRefs = (): CajaFormRefs => {
  return {
    name: useRef<HTMLInputElement>(null),
    large: useRef<HTMLInputElement>(null),
    wide: useRef<HTMLInputElement>(null),
    hide: useRef<HTMLInputElement>(null),
    equivalent: useRef<HTMLInputElement>(null),
    weight: useRef<HTMLInputElement>(null),
    status: useRef<HTMLSelectElement>(null),
  };
};
