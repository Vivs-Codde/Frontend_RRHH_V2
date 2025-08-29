import { useState, useEffect } from "react";
import type{ CalibreCultivo} from "../constants/apiCultivo";
import { API_CULTIVO_COMBO_CALIBRE_API } from "../constants/apiCultivo";


// Hook para obtener calibres filtrados por tipo de variedad
export function useCalibrePorTipoVariedad(tipoId?: string) {
  const [data, setData] = useState<CalibreCultivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tipoId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_CULTIVO_COMBO_CALIBRE_API}?tipo=${tipoId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch(() => setError("Error al cargar calibres"))
      .finally(() => setLoading(false));
  }, [tipoId]);

  return { data, loading, error };
}
