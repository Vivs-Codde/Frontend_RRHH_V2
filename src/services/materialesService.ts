// Crear paquete de materiales completo (paquete + materiales + imágenes)
import { API_BASE_URL } from "../constants/api";
export async function createPaqueteMaterialesCompleto({ categoria, subcategoria, SKU, nombre, materiales }: any) {
  const formData = new FormData();
  formData.append("categoria", categoria || "");
  formData.append("subcategoria", subcategoria || "");
  formData.append("SKU", SKU || "");
  formData.append("nombre", nombre || "");
  // Prepara materiales para el backend (quita imagen y cantidad si no existe)
  const materialesForApi = materiales.map((mat: any) => {
    const { imagen, ...rest } = mat;
    // Si no hay cantidad, default 1
    return { ...rest, cantidad: mat.cantidad ? mat.cantidad : 1 };
  });
  formData.append("materiales", JSON.stringify(materialesForApi));
  // Agrega imágenes como imagen_0, imagen_1, ...
  materiales.forEach((mat: any, idx: number) => {
    if (mat.imagen instanceof File) {
      formData.append(`imagen_${idx}`, mat.imagen);
    }
  });
  // Quitar Content-Type si existe en los headers
  const headers = { ...getAuthHeaders() };
  if (Object.prototype.hasOwnProperty.call(headers, "Content-Type")) delete (headers as any)["Content-Type"];
  if (Object.prototype.hasOwnProperty.call(headers, "content-type")) delete (headers as any)["content-type"];
  // Usar endpoint completo
  const url = `${API_BASE_URL}/api/paquete-materiales/crear-completo`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
}
// Actualiza un material existente
export async function updateMaterial(id: number, material: any) {
  const formData = new FormData();
  formData.append("sku", material.sku || "");
  formData.append("tipoMaterial", material.tipoMaterial || "");
  formData.append("unidadMedida", material.unidadMedida || "");
  formData.append("categoria", material.categoria || "");
  formData.append("subcategoria", material.subcategoria || "");
  formData.append("nombre", material.nombre || "");
  formData.append("descripcion", material.descripcion || "");
  formData.append("marca", material.marca || "");
  formData.append("Nserie", material.Nserie || "");
  formData.append("estado", material.estado ? "1" : "0");
  formData.append("altura", (material.alto !== undefined && material.alto !== null && material.alto !== "" ? Number(material.alto) : 0).toString());
  formData.append("ancho", (material.ancho !== undefined && material.ancho !== null && material.ancho !== "" ? Number(material.ancho) : 0).toString());
  formData.append("peso", (material.peso !== undefined && material.peso !== null && material.peso !== "" ? Number(material.peso) : 0).toString());
  formData.append("color", material.color || "");
  formData.append("precio", (material.precio !== undefined && material.precio !== null && material.precio !== "" ? Number(material.precio) : 0).toString());
  if (material.imagen instanceof File) {
    formData.append("imagen", material.imagen);
  }
  let tasaUsoValue = 0;
  if (material.tasa_uso !== undefined && material.tasa_uso !== null && material.tasa_uso !== "") {
    tasaUsoValue = Number(material.tasa_uso);
  } else if (material.tasaUso !== undefined && material.tasaUso !== null && material.tasaUso !== "") {
    tasaUsoValue = Number(material.tasaUso);
  }
  formData.append("tasaUso", tasaUsoValue.toString());

  // Quitar Content-Type si existe en los headers
  const headers = { ...getAuthHeaders() };
  if (Object.prototype.hasOwnProperty.call(headers, "Content-Type")) delete (headers as any)["Content-Type"];
  if (Object.prototype.hasOwnProperty.call(headers, "content-type")) delete (headers as any)["content-type"];
  // Usar POST y la ruta /api/materiales/update/{id}
  // Tomar la base de la ruta de LIST o CREATE y reemplazar lo necesario
  const updateUrl = `${API_ENDPOINTS.MATERIALES.LIST}/update/${id}`;
  const res = await fetch(updateUrl, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
}

import { API_ENDPOINTS, getAuthHeaders } from "../constants/api";
// Cambia el estado de un material
export async function patchEstadoMaterial(id: number, estado: boolean) {
  const res = await fetch(API_ENDPOINTS.MATERIALES.UPDATE_STATUS(id), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) {
    throw new Error("Error al cambiar el estado del material");
  }
  return res.json();
}
// Obtiene la lista de materiales con soporte de búsqueda y paginación
export async function getMateriales({ search = "", page = 1, perPage = 10 } = {}) {
  const params = new URLSearchParams();
  if (search) params.append("search", search); // Usar 'search' como espera la API
  params.append("per_page", String(perPage)); // Usar 'per_page' como espera la API
  params.append("page", String(page)); // Usar 'page' como espera la API
  // Si se recibe estado, agregarlo como parámetro
  if (arguments[0] && typeof arguments[0].estado === "boolean") {
    params.append("estado", arguments[0].estado ? "1" : "0");
  }
  const url = `${API_ENDPOINTS.MATERIALES.LIST}?${params.toString()}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error("Error al obtener materiales");
  }
  const data = await res.json();
  // Si el backend ya devuelve paginado, respeta la estructura
  if (data.data && (data.last_page || data.total_pages)) {
    return data;
  }
  // Si no, adapta a la estructura esperada
  const arr = Array.isArray(data) ? data : data.data || [];
  return {
    data: arr,
    total: arr.length,
    last_page: 1,
    total_pages: 1,
  };
}



// Crea un material
export async function createMaterial(material: any) {
  // Usar FormData para enviar como multipart/form-data
  const formData = new FormData();
  formData.append("sku", material.sku || "");
  formData.append("tipoMaterial", material.tipoMaterial || "");
  formData.append("unidadMedida", material.unidadMedida || "");
  formData.append("categoria", material.categoria || "");
  formData.append("subcategoria", material.subcategoria || "");
  formData.append("nombre", material.nombre || "");
  formData.append("descripcion", material.descripcion || "");
  formData.append("marca", material.marca || "");
  formData.append("Nserie", material.Nserie || "");
  formData.append("estado", material.estado ? "1" : "0");
  // Enviar como número, no string
  formData.append("altura", (material.alto !== undefined && material.alto !== null && material.alto !== "" ? Number(material.alto) : 0).toString());
  formData.append("ancho", (material.ancho !== undefined && material.ancho !== null && material.ancho !== "" ? Number(material.ancho) : 0).toString());
  formData.append("peso", (material.peso !== undefined && material.peso !== null && material.peso !== "" ? Number(material.peso) : 0).toString());
  formData.append("color", material.color || "");
  formData.append("precio", (material.precio !== undefined && material.precio !== null && material.precio !== "" ? Number(material.precio) : 0).toString());
  if (material.imagen instanceof File) {
    formData.append("imagen", material.imagen);
  }
  // tasaUso SIEMPRE debe ir, como número
  let tasaUsoValue = 0;
  if (material.tasa_uso !== undefined && material.tasa_uso !== null && material.tasa_uso !== "") {
    tasaUsoValue = Number(material.tasa_uso);
  } else if (material.tasaUso !== undefined && material.tasaUso !== null && material.tasaUso !== "") {
    tasaUsoValue = Number(material.tasaUso);
  }
  formData.append("tasaUso", tasaUsoValue.toString());

  // Mostrar el contenido del FormData en consola para depuración (sin la imagen)
  const debugFormData: any = {};
  formData.forEach((value, key) => {
    if (key !== "imagen") {
      debugFormData[key] = value;
    } else if (value instanceof File) {
      debugFormData[key] = `[File: ${value.name}]`;
    } else {
      debugFormData[key] = value;
    }
  });
  // Quitar Content-Type si existe en los headers
  const headers = { ...getAuthHeaders() };
  if (Object.prototype.hasOwnProperty.call(headers, "Content-Type")) delete (headers as any)["Content-Type"];
  if (Object.prototype.hasOwnProperty.call(headers, "content-type")) delete (headers as any)["content-type"];
  const res = await fetch(API_ENDPOINTS.MATERIALES.CREATE, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    // Mostrar el texto de error del backend para depuración
    const errorText = await res.text();
    console.error("[createMaterial] Error backend:", errorText);
    throw new Error("Error al crear material: " + errorText);
  }
  return res.json();
}
