# CRUD de Departamentos

Se ha implementado exitosamente el CRUD completo de Departamentos siguiendo la misma estructura que el módulo de Colores.

## Archivos Creados

### 1. Servicio (Backend API Integration)
- **`src/services/departamentosService.ts`**
  - Funciones para interactuar con la API REST del backend
  - `getDepartamentos()` - Listar departamentos
  - `createDepartamento()` - Crear nuevo departamento
  - `updateDepartamento()` - Actualizar departamento existente
  - `deleteDepartamento()` - Eliminar departamento
  - `toggleDepartamentoStatus()` - Cambiar estado activo/inactivo

### 2. Wizard (Formulario de Creación/Edición)
- **`src/components/wizards/WizardDepartamento.tsx`**
  - Formulario modal para crear/editar departamentos
  - Validaciones de campos obligatorios
  - Validación de duplicados
  - Selector de color con preview
  - Switch para estado activo/inactivo
  - Responsive para móviles y desktop

### 3. Página Principal (Lista y Gestión)
- **`src/pages/empleadopage/Departamento.tsx`**
  - Tabla responsive con paginación
  - Búsqueda en tiempo real
  - Cards para vista móvil
  - Botones de editar y eliminar
  - Modal de confirmación para eliminación
  - Toggle directo del estado desde la tabla

### 4. Traducciones
- **`src/i18n/departamentos.ts`** - Traducciones en español e inglés
- Integrado en **`src/i18n/index.ts`**

### 5. Configuración API
- Agregado endpoint `UPDATE_STATUS` en **`src/constants/api.ts`**

### 6. Routing
- Agregada ruta `/cliente/departamento` en **`src/App.tsx`**

## Estructura de Datos

```typescript
interface Departamento {
  id?: number;
  nombre: string;       // Nombre del departamento
  color: string;        // Color en formato hexadecimal
  estado: boolean;      // Estado activo/inactivo
  created_at?: string;
  updated_at?: string;
}
```

## Funcionalidades Implementadas

### ✅ CRUD Completo
- **Create**: Crear nuevos departamentos con validaciones
- **Read**: Listar departamentos con paginación y búsqueda
- **Update**: Editar departamentos existentes
- **Delete**: Eliminar departamentos con confirmación

### ✅ Características Adicionales
- **Búsqueda**: Filtrado por nombre de departamento
- **Paginación**: Control de elementos por página
- **Responsive**: Vista optimizada para móviles y desktop
- **Estados**: Toggle directo activo/inactivo
- **Validaciones**: Campos obligatorios y duplicados
- **Internacionalización**: Soporte español/inglés
- **Permisos**: Integración con sistema de permisos
- **Preview Color**: Visualización del color seleccionado

### ✅ Características de UX
- Modal de confirmación para eliminaciones
- Mensajes de éxito/error
- Loading states
- Formularios auto-llenados en modo edición
- Persistencia de estado del wizard

## Endpoints Backend Requeridos

```
GET    /api/departamentos          -> Lista todos los departamentos
POST   /api/departamentos          -> Crea nuevo departamento
PUT    /api/departamentos/{id}     -> Actualiza departamento
DELETE /api/departamentos/{id}     -> Elimina departamento
PATCH  /api/departamentos/{id}/estado -> Cambia estado del departamento
```

## Cómo Acceder

1. Iniciar el servidor: `npm run dev`
2. Navegar a: `http://localhost:5174/cliente/departamento`

## Permisos Requeridos

El usuario debe tener los permisos apropiados para:
- `crear` en módulo `departamento`
- `editar` en módulo `departamento`  
- `eliminar` en módulo `departamento`

## Tecnologías Utilizadas

- React 18 + TypeScript
- Tailwind CSS
- React Router
- React i18next
- Lucide React (iconos)
- Vite (build tool)

## Notas de Implementación

- Sigue exactamente la misma estructura y patrones que el módulo de Colores
- Totalmente responsive (móviles y desktop)
- Integrado con el sistema de autenticación y permisos existente
- Compatible con el sistema de traducción internacional
- Maneja errores de API de forma consistente
- Optimizado para performance con paginación del lado cliente
