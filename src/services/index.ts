// Exportar todos los servicios desde un solo lugar
export { authService, ApiError } from './authService';
export type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User
} from './authService';

// Aquí puedes agregar más servicios en el futuro cuando sean necesarios
// export { userService } from './userService';
// export { clientService } from './clientService';
// export { salesService } from './salesService';
