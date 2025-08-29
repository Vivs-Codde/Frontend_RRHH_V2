import { API_CULTIVO_COMBO_TIPO_VARIEDAD_API, API_CULTIVO_COMBO_VARIEDAD_API } from '../constants/apiCultivo';

export const cultivoService = {
  getSubcategorias: async () => {
    const res = await fetch(API_CULTIVO_COMBO_TIPO_VARIEDAD_API);
    const data = await res.json();
    return data.data || [];
  },
  getVariedades: async (subcategoriaId: string) => {
    const res = await fetch(`${API_CULTIVO_COMBO_VARIEDAD_API}?tipo=${subcategoriaId}`);
    const data = await res.json();
    return data.data || [];
  },
  // Nueva función para obtener todas las variedades sin filtro
  getAllVariedades: async () => {
    const res = await fetch(API_CULTIVO_COMBO_VARIEDAD_API);
    const data = await res.json();
    return data.data || [];
  }
};
