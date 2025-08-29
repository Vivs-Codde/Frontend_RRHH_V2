

import { API_ENDPOINTS, getAuthHeaders } from "../constants/api";
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
  // getAuthHeaders no debe poner Content-Type para FormData
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
// Ahora la API espera paquetes con paquete_material_id en vez de materiales
// Ahora la API espera { recetas: [...] }
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
      console.error("Respuesta error recetas API:", errorText);
      throw new Error("Error al crear receta: " + errorText);
    }
    return await res.json();
  } catch (err) {
    console.error("Error en createReceta:", err);
    throw err;
  }
}

// Obtiene la lista de recetas desde la API
export async function getRecetas(params: Record<string, any> = {}) {
  try {
    // Construir la query string
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
      console.error("Error al obtener recetas:", errorText);
      throw new Error("Error al obtener recetas: " + errorText);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error en getRecetas:", err);
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
      console.error("Error al actualizar paquetes de receta:", errorText);
      throw new Error("Error al actualizar paquetes de receta: " + errorText);
    }
    return await res.json();
  } catch (err) {
    console.error("Error en updateRecetaMateriales:", err);
    throw err;
  }
}
