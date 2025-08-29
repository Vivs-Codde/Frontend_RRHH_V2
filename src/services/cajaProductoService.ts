export interface CajaProducto {
  caja: {
    id: number;
    nombre: string;
    largo: number | null;
    ancho: number | null;
    profundidad: number | null;
    equivalencia?: number | null;
    peso?: number | null;
    estado?: number;
    created_at?: string;
    updated_at?: string;
  };
  cantidad: number;
  productos: Array<{
    id: number;
    sku: string;
    nombre: string;
    descripcion: string;
    largo: number | null;
    ancho: number | null;
    alto: number | null;
    peso: number | null;
    categoria: string;
    estado: number;
    vendedor?: string | null;
    created_at?: string;
    updated_at?: string;
  }>;
}

export async function getCajasProductos(token: string): Promise<CajaProducto[]> {
  const res = await fetch("https://api-sales.eqrapp.com/api/cajaxproductos", {
    method: "GET",
    headers: {
      "accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error en la petición");
  }
  return res.json();
}
// src/services/cajaProductoService.ts

export interface AsignarMultiplePayload {
  caja_id: number;
  productos: number[];
  cantidad: number;
}

export interface AsignarMultipleResponse {
  message: string;
  data: any[];
}

export async function asignarProductosCajaMultiple(
  payload: AsignarMultiplePayload,
  token: string
): Promise<AsignarMultipleResponse> {
  const res = await fetch("https://api-sales.eqrapp.com/api/cajaxproductos/asignar-multiple", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "accept": "application/json"
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error en la petición");
  }
  return res.json();
}
