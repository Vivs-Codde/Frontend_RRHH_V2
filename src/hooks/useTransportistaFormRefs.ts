import { useRef } from 'react';

export const useTransportistaFormRefs = () => {
  const placaRef = useRef<HTMLInputElement>(null);
  const propietarioRef = useRef<HTMLInputElement>(null);
  const modeloRef = useRef<HTMLInputElement>(null);
  const ciRef = useRef<HTMLInputElement>(null);
  const choferRef = useRef<HTMLInputElement>(null);
  const licenciaRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLInputElement>(null); // Cambiado a HTMLInputElement

  const clearRefs = () => {
    if (placaRef.current) placaRef.current.value = '';
    if (propietarioRef.current) propietarioRef.current.value = '';
    if (modeloRef.current) modeloRef.current.value = '';
    if (ciRef.current) ciRef.current.value = '';
    if (choferRef.current) choferRef.current.value = '';
    if (licenciaRef.current) licenciaRef.current.value = '';
    if (statusRef.current) statusRef.current.value = '';
  };

  const setValuesFromTransportista = (transportista: any) => {
    if (placaRef.current) placaRef.current.value = transportista.placa || '';
    if (propietarioRef.current) propietarioRef.current.value = transportista.propietario || '';
    if (modeloRef.current) modeloRef.current.value = transportista.modelo || '';
    if (ciRef.current) ciRef.current.value = transportista.ci || '';
    if (choferRef.current) choferRef.current.value = transportista.chofer || '';
    if (licenciaRef.current) licenciaRef.current.value = transportista.licencia || '';
    if (statusRef.current) statusRef.current.value = transportista.status || '';
  };

  return {
    placa: placaRef,
    propietario: propietarioRef,
    modelo: modeloRef,
    ci: ciRef,
    chofer: choferRef,
    licencia: licenciaRef,
    status: statusRef,
    clearRefs,
    setValuesFromTransportista,
  };
};
