# Services

Esta carpeta contiene todos los servicios para realizar llamadas a la API de manera organizada y reutilizable.

## Estructura

```
services/
├── index.ts          # Exporta todos los servicios
├── authService.ts    # Servicio de autenticación
├── userService.ts    # Servicio de usuarios
└── README.md         # Este archivo
```

## Uso

### Importación

```typescript
// Importar servicios específicos
import { authService, userService, ApiError } from '../services';

// Importar tipos
import type { LoginRequest, User } from '../services';
```

### Servicio de Autenticación

```typescript
// Login
try {
  const response = await authService.login({
    email: 'usuario@ejemplo.com',
    password: 'contraseña123'
  });
  
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Error de API:', error.message);
  }
}

// Logout
await authService.logout();

// Verificar si está autenticado
const isAuth = authService.isAuthenticated();

// Obtener token
const token = authService.getAuthToken();

// Obtener datos del usuario
const userData = authService.getUserData();
```

### Servicio de Usuarios

```typescript
// Obtener todos los usuarios
const users = await userService.getUsers(1, 10); // página 1, 10 por página

// Obtener usuario por ID
const user = await userService.getUserById(1);

// Crear usuario
const newUser = await userService.createUser({
  name: 'Nuevo Usuario',
  email: 'nuevo@ejemplo.com',
  password: 'contraseña123',
  role: 'admin'
});

// Actualizar usuario
const updatedUser = await userService.updateUser(1, {
  name: 'Nombre Actualizado'
});

// Eliminar usuario
await userService.deleteUser(1);
```

## Manejo de Errores

Todos los servicios lanzan errores del tipo `ApiError` que incluyen:

- `message`: Mensaje de error
- `status`: Código de estado HTTP (si está disponible)
- `data`: Datos adicionales del error (si están disponibles)

```typescript
try {
  await authService.login(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Credenciales inválidas
        break;
      case 422:
        // Error de validación
        break;
      case 500:
        // Error del servidor
        break;
      default:
        // Otro error
        break;
    }
  }
}
```

## Configuración

Las URLs base y endpoints se configuran en `../constants/api.ts`.

## Agregar Nuevos Servicios

1. Crear un nuevo archivo en esta carpeta (ej: `clientService.ts`)
2. Implementar la clase del servicio siguiendo el patrón de los existentes
3. Exportar el servicio desde `index.ts`
4. Documentar su uso en este README

### Ejemplo de nuevo servicio:

```typescript
// clientService.ts
import { API_ENDPOINTS, getAuthHeaders } from '../constants/api';
import { ApiError } from './authService';

class ClientService {
  async getClients() {
    // Implementación...
  }
}

export const clientService = new ClientService();
```

```typescript
// index.ts
export { clientService } from './clientService';
```
