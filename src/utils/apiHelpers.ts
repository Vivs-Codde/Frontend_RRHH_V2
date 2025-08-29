// Utilidades para manejo de API
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: string[];
}

/**
 * Maneja las respuestas de la API de manera consistente
 */
export const handleApiResponse = async <T = any>(response: Response): Promise<T> => {
  try {
    const contentType = response.headers.get('content-type');
    let responseData: any = {};

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = { message: await response.text() };
    }

    if (!response.ok) {
      const error: ApiError = {
        message: responseData.message || `Error ${response.status}: ${response.statusText}`,
        status: response.status,
        errors: responseData.errors || []
      };
      throw error;
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error; // Re-throw API errors
    }
    
    // Handle network or parsing errors
    throw {
      message: 'Error de conexión. Verifique su conexión a internet.',
      status: 0
    } as ApiError;
  }
};

/**
 * Maneja errores de la API y devuelve un mensaje amigable para el usuario
 */
export const getErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (error?.status === 401) {
    return 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
  }
  
  if (error?.status === 403) {
    return 'No tiene permisos para realizar esta acción.';
  }
  
  if (error?.status === 404) {
    return 'El recurso solicitado no fue encontrado.';
  }
  
  if (error?.status === 422) {
    return error?.errors?.join(', ') || 'Los datos proporcionados no son válidos.';
  }
  
  if (error?.status >= 500) {
    return 'Error interno del servidor. Intente nuevamente más tarde.';
  }
  
  if (error?.status === 0) {
    return 'Error de conexión. Verifique su conexión a internet.';
  }
  
  return 'Ha ocurrido un error inesperado. Intente nuevamente.';
};

/**
 * Wrapper para hacer peticiones fetch con manejo de errores
 */
export const apiRequest = async <T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
