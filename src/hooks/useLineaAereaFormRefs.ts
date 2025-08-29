import { useRef } from 'react';

export const useLineaAereaFormRefs = () => {
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  return {
    code: codeRef,
    name: nameRef,
    status: statusRef,
  };
};
