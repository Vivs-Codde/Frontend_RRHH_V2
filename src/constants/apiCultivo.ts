// Endpoint para buscar productos por flores (por descripción)
export const API_PRODUCTOS_BUSCAR_POR_FLORES = "https://api-sales.eqrapp.com/api/productos/buscar/por-flores";
// Constantes de endpoints para API de cultivo
// Todas las APIs aquí son solo GET

export const API_CULTIVO_BASE_URL = "https://cultivo.eqrapp.com/api";

// Endpoints GET
export const API_CULTIVO_COMBO_TIPO_VARIEDAD_API = `${API_CULTIVO_BASE_URL}/comboTipoVariedadApi`;
export const API_CULTIVO_COMBO_VARIEDAD_API = `${API_CULTIVO_BASE_URL}/comboVariedadApi`;
export const API_CULTIVO_COMBO_CALIBRE_API = `${API_CULTIVO_BASE_URL}/comboCalibre`;
export const API_CULTIVO_COMBO_COLOR_API = `${API_CULTIVO_BASE_URL}/comboColorApi`;
// Agrega aquí más endpoints GET según la documentación de la API

// Ejemplo de tipo de respuesta para comboTipoVariedadApi y comboColorApi
export interface TipoVariedad {
  id: string;
  name: string;
}

export interface ColorCultivo {
  id: string;
  name: string;
}

export interface ComboTipoVariedadResponse {
  data: TipoVariedad[];
}

export interface ComboColorCultivoResponse {
  data: ColorCultivo[];
}

export interface VariedadCultivo {
  id: string;
  name: string;
  type_id: string;
  tipo: string;
}

export interface ComboVariedadCultivoResponse {
  data: VariedadCultivo[];
}

export interface CalibreCultivo {
  id_calibre: string;
  prioridad_calibre: string;
  estado_calibre: string;
  nombre_variedad: string;
  nombre_calibre_tipo: string;
}

export interface ComboCalibreCultivoResponse {
  data: CalibreCultivo[];
  success: boolean;
}

// Puedes agregar más endpoints o constantes relacionadas aquí según la estructura de tu backend

