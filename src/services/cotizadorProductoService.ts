// Servicio para consumir productos con estadoProceso pendiente o cancelado
import { API_ENDPOINTS } from "../constants/api";

export async function getProductosCotizador() {
  try {
    const res = await fetch(API_ENDPOINTS.PRODUCTOS.LIST, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    // Filtrar productos por estadoProceso pendiente o cancelado
    const productos = Array.isArray(data.productos)
      ? data.productos.filter(
          (p) => p.estadoProceso === "pendiente" || p.estadoProceso === "cancelado"
        )
      : [];
    return productos;
  } catch (e) {
    return [];
  }
}
