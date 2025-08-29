export interface Bodega {
  id: number;
  codigo: string; // Wherehose Code - 3 dígitos alfanuméricos
  nombre: string; // Name - No caracteres especiales/trim
  status: boolean; // Status - Booleano (activo/inactivo)
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateBodegaRequest {
  codigo: string;
  nombre: string;
  status: boolean;
}

export interface UpdateBodegaRequest {
  codigo: string;
  nombre: string;
  status: boolean;
}
