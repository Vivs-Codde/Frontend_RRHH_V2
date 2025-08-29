export interface Caja {
  id: number;
  name: string; // Name - Texto validado 3 dígitos
  large: number; // Large - Numérico validado 2 decimales
  wide: number; // Wide - Numérico validado 2 decimales
  hide: number; // Hide - Numérico validado 2 decimales
  equivalent: number; // Equivalent - Numérico validado 3 decimales
  weight: number; // Weight - Numérico validado 3 decimales
  status: boolean; // Status - Switch booleano
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Unified request interface for create/update
export interface CajaRequest {
  name: string;
  large: number;
  wide: number;
  hide: number;
  equivalent: number;
  weight: number;
  status: boolean;
}
