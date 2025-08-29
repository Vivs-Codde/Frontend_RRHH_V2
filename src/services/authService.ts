import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders, API_CONFIG } from '../constants/api';

// Interfaces para el servicio de autenticación
export interface LoginRequest {
  login: string;  // Puede ser email o usuario
  password: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

// --- API USUARIOS ---
export interface UsuarioApi {
  id: number;
  name: string;
  email: string;
  imagen?: string;
  ip?: string; // Mantener para compatibilidad con versiones anteriores
  ips?: string[]; // Mantener para compatibilidad con versiones anteriores
  ips_activas?: Array<{ 
    id?: number;
    ip_address: string; 
    activa?: boolean; // Campo correcto según la API
    created_at?: string; 
    updated_at?: string;
    descripcion?: string;
    nombreFinca?: string;
  }>; // Nueva estructura de la API
  estado?: number | string;
  idRRHH?: string;
  tipo?: string;
  celular?: string;
  accesoglobal?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getUsuarios(): Promise<UsuarioApi[]> {
  const response = await fetch(API_ENDPOINTS.AUTH.List_Users, {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  if (!response.ok) throw new Error('Error al obtener usuarios');
  return response.json();
}

// Nuevo: obtener usuarios con paginación y búsqueda
export async function getUsuariosPaginado(params: { search?: string; page?: number; per_page?: number }): Promise<{ data: UsuarioApi[]; last_page: number; }> {
  const url = new URL(API_ENDPOINTS.AUTH.List_Users);
  if (params.search) url.searchParams.append('search', params.search);
  if (params.page) url.searchParams.append('page', String(params.page));
  if (params.per_page) url.searchParams.append('per_page', String(params.per_page));
  
  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    method: 'GET',
  });
  
  if (!response.ok) throw new Error('Error al obtener usuarios');
  
  const result = await response.json();
  
  // Si tenemos usuarios, cargar sus IPs detalladas
  if (result.data && Array.isArray(result.data) && result.data.length > 0) {
    
    
    // Cargar IPs para cada usuario en paralelo
    const usuariosConIps = await Promise.all(
      result.data.map(async (usuario) => {
        try {
          const ipsResponse = await fetch(API_ENDPOINTS.AUTH.USER_IPS(usuario.id), {
            headers: getAuthHeaders(),
            method: 'GET',
          });
          
          if (ipsResponse.ok) {
            const ipsData = await ipsResponse.json();
            return {
              ...usuario,
              ips_activas: Array.isArray(ipsData) ? ipsData : []
            };
          } else {
            console.warn(`Error cargando IPs para usuario ${usuario.id}:`, ipsResponse.status);
            return usuario;
          }
        } catch (error) {
          console.error(`Error cargando IPs para usuario ${usuario.id}:`, error);
          return usuario;
        }
      })
    );
    
    result.data = usuariosConIps;
  }
  
  return result;
}

// Clase de error personalizada para la API
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Servicio de autenticación
class AuthService {
  /**
   * Realizar login con email y contraseña
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Error en el inicio de sesión',
          response.status,
          data
        );
      }

      // Guardar token y datos del usuario si el login es exitoso
      if (data.token) {
        this.setAuthToken(data.token);
      }
      
      if (data.user) {
        this.setUserData(data.user);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Si es un error de red o timeout
      throw new ApiError(
        'Error de conexión. Verifique su conexión a internet.',
        0,
        error
      );
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Error en el registro',
          response.status,
          data
        );
      }

      // Guardar token y datos del usuario si el registro es exitoso
      if (data.token) {
        this.setAuthToken(data.token);
      }
      
      if (data.user) {
        this.setUserData(data.user);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Error de conexión. Verifique su conexión a internet.',
        0,
        error
      );
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      const token = this.getAuthToken();
      
      if (token) {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      }
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado de la API
      this.clearAuthData();
    }
  }

  /**
   * Verificar si el token es válido
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        return false;
      }

      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_TOKEN, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    }
  }
  /**
   * Obtener perfil del usuario actual
   */
  async getUserProfile(): Promise<User> {
    try {
      // Nota: Este endpoint aún no está definido en API_ENDPOINTS
      // Se puede agregar cuando sea necesario
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Error al obtener perfil',
          response.status,
          data
        );
      }

      return data.user || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Error de conexión al obtener perfil.',
        0,
        error
      );
    }
  }

  /**
   * Reportar login exitoso
   */
  async reportLogin({
    email,  // Mantenemos el nombre email para compatibilidad con el backend
    fecha_hora_ingreso,
    ip = "",
    latitud = 0,
    longitud = 0,
  }: {
    email: string;  // Puede ser email o nombre de usuario
    fecha_hora_ingreso: string;
    ip?: string;
    latitud?: number;
    longitud?: number;
  }): Promise<void> {
    await fetch(API_ENDPOINTS.AUTH.REPORT_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        fecha_hora_ingreso,
        ip,
        latitud,
        longitud,
      }),
    });
  }

  /**
   * Obtener permisos de un rol
   */
  async getRolePermissions(roleId: number, token: string): Promise<any[]> {
    const res = await fetch(API_ENDPOINTS.ROLES_PERMISOS.LIST(roleId), {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const perms = await res.json();
    return Array.isArray(perms) ? perms : [];
  }

  /**
   * Actualizar IPs de usuarios en bulk
   * @param data Array de objetos { idRRHH, ips }
   */
  async updateUsuariosIpBulk(data: { idRRHH: string; ips: string[] }[]): Promise<any> {
    const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_IP_USUARIO, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar IPs de usuarios');
    return response.json();
  }

  /**
   * Activar/Desactivar una IP específica
   * @param ipId ID de la IP a cambiar de estado
   */
  async toggleIpStatus(ipId: number): Promise<any> {
    const response = await fetch(`https://api-sales.eqrapp.com/api/ips/${ipId}/toggle`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al cambiar estado de la IP');
    return response.json();
  }

  /**
   * Agregar una nueva IP a un usuario
   * @param userId ID del usuario
   * @param ipAddress Dirección IP a agregar
   */
  async addUserIp(userId: number, ipAddress: string): Promise<any> {
    const requestBody = {
      ip_address: ipAddress,
      descripcion: "ip externa",
      nombreFinca: "ip externa",
      activa: true
    };
    
    const response = await fetch(API_ENDPOINTS.AUTH.ADD_USER_IP(userId), {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${errorData.message || 'Error al agregar IP'}`);
    }
    
    return response.json();
  }

  /**
   * Obtener todas las IPs de un usuario
   * @param userId ID del usuario
   */
  async getUserIps(userId: number): Promise<any[]> {
    const response = await fetch(API_ENDPOINTS.AUTH.USER_IPS(userId), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener IPs del usuario');
    }
    
    const ipsData = await response.json();
    return Array.isArray(ipsData) ? ipsData : [];
  }

  /**
   * Eliminar una IP por su ID
   * @param ipId ID de la IP a eliminar
   */
  async deleteIp(ipId: number): Promise<any> {
    const response = await fetch(API_ENDPOINTS.AUTH.DELETE_IP(ipId), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${errorData.message || 'Error al eliminar IP'}`);
    }
    
    return response.json();
  }

  // Métodos para manejar el almacenamiento local
  
  /**
   * Guardar token de autenticación
   */
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Obtener token de autenticación
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Guardar datos del usuario
   */
  setUserData(user: User): void {
    localStorage.setItem('userData', JSON.stringify(user));
  }

  /**
   * Obtener datos del usuario
   */
  getUserData(): User | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
}

// Exportar instancia única del servicio
export const authService = new AuthService();
export default authService;
