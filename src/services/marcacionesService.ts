import { API_BASE_URL, getAuthHeaders } from "../constants/api";

// Obtener clientes (igual que en ClientesTable)
export async function getClientes() {
  const res = await fetch(`${API_BASE_URL}/api/clientes`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json();
}

// Crear marcación
export async function createMarcacion(id_cliente: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/clientes/${id_cliente}/marcaciones`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear marcación");
  return await res.json();
}

// Obtener todas las marcaciones
export async function getMarcaciones(params = {}) {
  // Construir parámetros de consulta
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/api/marcaciones${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) throw new Error("Error al obtener marcaciones");
  return await res.json();
}

// Obtener marcaciones por cliente
export async function getMarcacionesByCliente(clienteId: string) {
  const res = await fetch(`${API_BASE_URL}/api/clientes/${clienteId}/marcaciones`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener marcaciones del cliente");
  return await res.json();
}

// Actualizar marcación
export async function updateMarcacion(id: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/marcaciones/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar marcación");
  return await res.json();
}

// Eliminar marcación
export async function deleteMarcacion(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/marcaciones/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar marcación");
  return await res.json();
}

// Cambiar estado de marcación
export async function toggleMarcacionStatus(id: string, status: boolean) {
  const res = await fetch(`${API_BASE_URL}/api/marcaciones/${id}/status`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Error al cambiar estado de marcación");
  return await res.json();
}

// Actualizar orden de marcación
export async function updateMarcacionOrder(id: string, orden: number) {
  const res = await fetch(`${API_BASE_URL}/api/marcaciones/${id}/orden`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orden }),
  });
  if (!res.ok) throw new Error("Error al actualizar orden de marcación");
  return await res.json();
}