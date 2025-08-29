import { API_ENDPOINTS, getAuthHeaders } from "../constants/api";

// Servicio para consumir recetas con estadoProceso pendiente o rechazado
export async function getRecetasCotizador() {
  try {
    let recetas: any[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await fetch(`${API_ENDPOINTS.RECETAS.LIST}?page=${page}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data.data)) {
        recetas = recetas.concat(
          data.data.filter(
            (r) => r.estadoProceso === "pendiente" || r.estadoProceso === "rechazado"
          )
        );
      }
      lastPage = data.last_page || data.total_pages || 1;
      page++;
    } while (page <= lastPage);
    return recetas;
  } catch (e) {
    return [];
  }
}

// Cambia el estado de una receta (activo/inactivo)
export async function updateRecetaStatus(id: number, nuevoEstado: boolean | number) {
  const url = typeof API_ENDPOINTS.RECETAS.UPDATE_STATUS === 'function'
    ? API_ENDPOINTS.RECETAS.UPDATE_STATUS(id)
    : `${API_ENDPOINTS.RECETAS.UPDATE_STATUS}/${id}/estado`;
  const headers = { ...getAuthHeaders() };
  headers["Content-Type"] = "application/json";
  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ estado: !!nuevoEstado }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "No se pudo cambiar el estado");
  }
  return await res.json();
}

// Actualiza solo la descripción e imagen de una receta
export async function updateRecetaDescripcionImagen(recetaId: number, descripcion: string, imagen?: File) {
  const formData = new FormData();
  formData.append("descripcion", descripcion);
  if (imagen) formData.append("imagen", imagen);
  const headers = { ...getAuthHeaders() };
  delete (headers as any)["Content-Type"];
  const url = typeof API_ENDPOINTS.RECETAS.DESCRIPCION_IMAGEN === 'function'
    ? API_ENDPOINTS.RECETAS.DESCRIPCION_IMAGEN(recetaId)
    : API_ENDPOINTS.RECETAS.DESCRIPCION_IMAGEN;
  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return await res.json();
}

// Crea una receta enviando productos y materiales
export async function createReceta(data: {
  recetas: Array<{
    sku: string;
    producto_id: number;
    paquete_material_id: number;
    cantidad: number;
    precio: number;
  }>;
}) {
  try {
    const res = await fetch(API_ENDPOINTS.RECETAS.CREATE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error("Error al crear receta: " + errorText);
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

// Obtiene la lista de recetas desde la API
export async function getRecetas(params: Record<string, any> = {}) {
  try {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const url = `${API_ENDPOINTS.RECETAS.LIST}${query ? `?${query}` : ""}`;
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error("Error al obtener recetas: " + errorText);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

// Obtiene el historial de cambios de productos en recetas
export async function getRecetaHistorial(params: { page?: number; per_page?: number; producto_id?: number }) {
  const query = new URLSearchParams({
    ...(params.page ? { page: params.page.toString() } : {}),
    ...(params.per_page ? { per_page: params.per_page.toString() } : {}),
    ...(params.producto_id ? { producto_id: params.producto_id.toString() } : {}),
  }).toString();
  const url = `${API_ENDPOINTS.RECETAS.RECETA_HISTORIAL}?${query}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener historial de recetas");
  return await res.json();
}

// Actualiza los paquetes de una receta (producto) usando paquete_material_id
export async function updateRecetaMateriales(producto_id: number, paquetes: Array<{ paquete_material_id: number, cantidad: number, precio: number }>) {
  try {
    const body = JSON.stringify({ paquetes });
    const res = await fetch(API_ENDPOINTS.RECETAS.UPDATE(producto_id), {
      method: "PUT",
      headers: getAuthHeaders(),
      body,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error("Error al actualizar paquetes de receta: " + errorText);
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}
