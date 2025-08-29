export interface Transportista {
  id: number;
  placa: string;
  propietario: string;
  modelo: string;
  ci: string;
  chofer: string;
  licencia: string;
  status: string;
  pais: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  
}

export interface TransportistaFormData {
  placa: string;
  propietario: string;
  modelo: string;
  ci: string;
  chofer: string;
  licencia: string;
  status: string;
  pais: string;
}
