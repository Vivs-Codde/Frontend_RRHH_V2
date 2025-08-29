/**
 * Constantes y utilidades para API con tipos correctos
 */

// URL base de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configuración global de la API
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 30000, // 30 segundos
  retries: 1,
};

// Endpoints de la API organizados por módulo
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    refreshToken: `${API_BASE_URL}/auth/refresh-token`,
    user: `${API_BASE_URL}/auth/user`,
  },
  users: {
    base: `${API_BASE_URL}/users`,
    profile: `${API_BASE_URL}/users/profile`,
    permissions: `${API_BASE_URL}/users/permissions`,
  },
  clientes: {
    base: `${API_BASE_URL}/clientes`,
    marcaciones: `${API_BASE_URL}/marcaciones`,
  },
  productos: {
    base: `${API_BASE_URL}/productos`,
    categorias: `${API_BASE_URL}/categorias`,
    cajas: `${API_BASE_URL}/cajas`,
  },
  ventas: {
    base: `${API_BASE_URL}/ventas`,
    asignaciones: `${API_BASE_URL}/asignaciones`,
  },
  // Añade más endpoints según sea necesario
};

/**
 * Obtiene los headers de autenticación para las peticiones a la API
 * @returns Headers con el token de autenticación
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

/**
 * Construye una URL con parámetros de query
 * @param baseUrl URL base
 * @param params Parámetros de query
 * @returns URL completa con parámetros
 */
export function buildUrl(baseUrl: string, params: Record<string, any> = {}): string {
  const url = new URL(baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
}
