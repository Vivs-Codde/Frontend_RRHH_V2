import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders, API_CONFIG } from '../constants/api';

// Interfaces para el servicio de autenticación
export interface LoginRequest {
  email: string;  // Puede ser email o usuario
  password: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data?: {
    user?: {
      id: number;
      name: string;
      email: string;
      email_verified_at?: string | null;
      created_at?: string;
      updated_at?: string;
      roles?: Array<{
        id: number;
        name: string;
        guard_name: string;
        created_at: string;
        updated_at: string;
        pivot: {
          model_type: string;
          model_id: number;
          role_id: number;
        };
        permissions?: Array<{
          id: number;
          name: string;
          guard_name: string;
          created_at: string;
          updated_at: string;
          pivot: {
            role_id: number;
            permission_id: number;
          }
        }>;
      }>;
      permissions?: any[];
    };
    roles?: string[];
    permissions?: string[];
    token?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  success?: boolean; // Para mantener compatibilidad con código existente
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
      result.data.map(async (usuario: any) => {
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
  status?: number;
  data?: any;
  
  constructor(
    message: string,
    status?: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
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
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      // En la nueva API, debemos verificar status en lugar de response.ok
      if (!data.status) {
        throw new ApiError(
          data.message || 'Error en el inicio de sesión',
          response.status,
          data
        );
      }

      // Para mantener compatibilidad con el código existente
      data.success = data.status;

      // Guardar token y datos del usuario según la nueva estructura
      if (data.data?.token) {
        this.setAuthToken(data.data.token);
      }
      
      if (data.data?.user) {
        this.setUserData(data.data.user);
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
          headers: {
            ...getAuthHeaders(),
            'Authorization': `Bearer ${token}`
          }
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
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
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
