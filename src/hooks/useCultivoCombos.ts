import { useEffect, useState } from "react";
import { API_ENDPOINTS, getAuthHeaders } from "../constants/api";
import {
  API_CULTIVO_COMBO_TIPO_VARIEDAD_API,
  API_CULTIVO_COMBO_VARIEDAD_API,
  API_CULTIVO_COMBO_CALIBRE_API
} from "../constants/apiCultivo";
import type {
  TipoVariedad,
  VariedadCultivo,
  ColorCultivo,
  CalibreCultivo,
  ComboTipoVariedadResponse,
  ComboVariedadCultivoResponse,
  ComboColorCultivoResponse,
  ComboCalibreCultivoResponse
} from "../constants/apiCultivo";

// Tipo para las categorías de la API local
export interface Categoria {
  id: number;
  nombreCategoria: string;
  tipo: string;
  estado?: number;
}

export function useCategorias() {
  const [data, setData] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_ENDPOINTS.CATEGORIAS.LIST, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
      .then(res => res.json())
      .then((res) => {
        // La API devuelve directamente un array, no un objeto con data
        if (Array.isArray(res)) {
          setData(res);
        } else {
          // Fallback si viene en otro formato
          const categorias = res.data || res.items || res.results || res;
          setData(Array.isArray(categorias) ? categorias : []);
        }
      })
      .catch((err) => {
        console.error("Error al cargar categorías:", err);
        setError("Error al cargar categorías");
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useTipoVariedad() {
  const [data, setData] = useState<TipoVariedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_CULTIVO_COMBO_TIPO_VARIEDAD_API)
      .then(res => res.json())
      .then((res: ComboTipoVariedadResponse) => setData(res.data))
      .catch(() => setError("Error al cargar tipos de variedad"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useVariedad(tipoId?: string) {
  const [data, setData] = useState<VariedadCultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tipoId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_CULTIVO_COMBO_VARIEDAD_API}?tipo=${tipoId}`)
      .then(res => res.json())
      .then((res: ComboVariedadCultivoResponse) => setData(res.data))
      .catch(() => setError("Error al cargar variedades"))
      .finally(() => setLoading(false));
  }, [tipoId]);

  return { data, loading, error };
}

export function useColorCultivo() {
  const [data, setData] = useState<ColorCultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Eliminado: función para obtener colores de cultivo
  }, []);

  return { data, loading, error };
}

export function useCalibreCultivo() {
  const [data, setData] = useState<CalibreCultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_CULTIVO_COMBO_CALIBRE_API, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-CSRF-TOKEN': ''
      }
    })
      .then(res => res.json())
      .then((res: ComboCalibreCultivoResponse) => {
        if (res.success && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setError("Error en la estructura de respuesta de calibres");
        }
      })
      .catch((err) => {
        console.error("Error al cargar calibres:", err);
        setError("Error al cargar calibres");
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
