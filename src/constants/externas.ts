//export const API_LOCAL_BASE_URL = "http://127.0.0.1:5000";
export const API_LOCAL_BASE_URL = "https://api-consulta.eqrapp.com";
//export const API_MATRICULA_URL =
  //'https://srienlinea.sri.gob.ec/sri-matriculacion-vehicular-recaudacion-servicio-internet/rest/BaseVehiculo/obtenerPorNumeroPlacaOPorNumeroCampvOPorNumeroCpn?numeroPlacaCampvCpn=';

/**
 * Consulta la API local por RUC y retorna la razón social si existe.
 * @param ruc RUC de la empresa (string de 13 dígitos)
 * @returns Promise<string | null> Razón social o null si no existe o error
 */
export async function consultarRazonSocialPorRuc(ruc: string): Promise<string | null> {
  if (!/^\d{13}$/.test(ruc)) return null;
  try {
    const url = `${API_LOCAL_BASE_URL}/api/consulta-ruc/?ruc=${ruc}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.razonSocial || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Consulta el SRI (vía backend local) por placa y retorna el modelo si existe.
 * @param placa Placa del vehículo (string)
 * @returns Promise<string | null> Modelo o null si no existe o error
 */
export async function consultarModeloPorPlaca(placa: string): Promise<string | null> {
  if (!placa || typeof placa !== 'string') return null;
  try {
    const url = `${API_LOCAL_BASE_URL}/api/consulta-sri-placa/?placa=${placa}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data?.descripcionModelo || null;
  } catch {
    return null;
  }
}

/**
 * Consulta la API local por placa y retorna el propietario si existe.
 * Si el propietario es 'xxxxxxxx xxxxx xxxx', reintenta una vez.
 * @param placa Placa del vehículo (string)
 * @returns Promise<string | null> Propietario o null si no existe o error
 */
export async function consultarPropietarioPorPlaca(placa: string): Promise<string | null> {
  if (!placa || typeof placa !== 'string') return null;
  const url = `${API_LOCAL_BASE_URL}/api/consulta-auto/?placa=${placa}`;
  try {
    let response = await fetch(url);
    if (!response.ok) return null;
    let data = await response.json();
    let duenio = data?.Dueño || null; // Usar el campo 'Dueño' de la respuesta
    // Si el propietario es solo x y espacios, reintenta una vez
    if (duenio && duenio.replace(/x/gi, '').replace(/ /g, '') === '') {
      response = await fetch(url);
      if (!response.ok) return null;
      data = await response.json();
      duenio = data?.Dueño || null;
      if (duenio && duenio.replace(/x/gi, '').replace(/ /g, '') === '') {
        return null;
      }
    }
    return duenio;
  } catch {
    return null;
  }
}
// export const API_BASE_URL = 'https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/deudas/porIdentificacion/';

/**
 * Consulta la API local por CI y retorna el nombre (prioridad registro civil) y tipo de licencia si existe.
 * @param ci Cédula de identidad (string de 10 dígitos)
 * @returns Promise<{ nombre: string | null, tipo_licencia: string | null }> Datos o nulls si no existe o error
 */
export async function consultarNombreComercialPorCI(ci: string): Promise<{ nombre: string | null, tipo_licencia: string | null }> {
  if (!/^\d{10}$/.test(ci)) return { nombre: null, tipo_licencia: null };
  try {
    const url = `${API_LOCAL_BASE_URL}//api/consulta-todo-cedula/?cedula=${ci}`;
    const response = await fetch(url);
    if (!response.ok) return { nombre: null, tipo_licencia: null };
    const data = await response.json();
    let nombre = data?.datosregistrosivil?.nombre || data?.datosant?.nombre || null;
    if (nombre === "" && data?.datosant?.nombre) {
      nombre = data.datosant.nombre;
    }
    return {
      nombre,
      tipo_licencia: data?.datosant?.tipo_licencia || null
    };
  } catch {
    return { nombre: null, tipo_licencia: null };
  }
}