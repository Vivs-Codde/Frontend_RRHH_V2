// Constantes relacionadas con la API
export const API_BASE_URL = 'http://127.0.0.1:8000';
//export const API_BASE_URL = 'https://api-sales.eqrapp.com'
//export const API_BASE_URL = 'http://192.168.1.101:8000'
// Endpoints específicos
export const API_ENDPOINTS = {
  // Cajas por productos
  CAJAS_PRODUCTOS: {
    LIST_PRODUCT: (id_producto: number | string) => `${API_BASE_URL}/api/cajaxproductos/producto/${id_producto}`,
  },
  // Autenticación
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/login`,
    REGISTER: `${API_BASE_URL}/api/register`,
    LOGOUT: `${API_BASE_URL}/api/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/reset-password`,
    VERIFY_TOKEN: `${API_BASE_URL}/api/verify-token`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/refresh-token`,
    List_Users: `${API_BASE_URL}/api/usuarios`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/usuarios/${id}`,
    REPORT_LOGIN: `${API_BASE_URL}/api/reporte-login`,
    LIST_REPOR_LOGIN: `${API_BASE_URL}/api/reporte-login`,
    UPDATE_IP_USUARIO: `${API_BASE_URL}/api/usuarios/ips-bulk`,
    USER_IPS: (id: number | string) => `${API_BASE_URL}/api/usuarios/${id}/ips?estado=todas`,
    ADD_USER_IP: (id: number | string) => `${API_BASE_URL}/api/usuarios/${id}/ips`,
    DELETE_IP: (id: number | string) => `${API_BASE_URL}/api/ips/${id}`,
    PROFILE:`${API_BASE_URL}/api/user`,
  },
  //COLORES
  COLORES: {
    LIST: `${API_BASE_URL}/api/colores`,
    CREATE: `${API_BASE_URL}/api/colores`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/colores/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/colores/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/colores/${id}/estado`,
  },
  //DEPARTAMENTOS
  DEPARTAMENTOS:{
    LIST: `${API_BASE_URL}/api/departamentos`,
    CREATE: `${API_BASE_URL}/api/departamentos`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/departamentos/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/departamentos/${id}`,
  },
  //FINCAS
  FINCAS: {
    LIST: `${API_BASE_URL}/api/fincas`,
    CREATE: `${API_BASE_URL}/api/fincas`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/fincas/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/fincas/${id}`,
  },
  //TIPO DE CONTRATO
  TIPOS_CONTRATO: {
    LIST: `${API_BASE_URL}/api/tipos-contrato`,
    CREATE: `${API_BASE_URL}/api/tipos-contrato`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/tipos-contrato/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/tipos-contrato/${id}`,
  },
  //ESTRUCTURAS ORGANIZACIONELES
  ESTRUCTURAS: {
    LIST: `${API_BASE_URL}/api/estructuras-organizacionaes`,
    CREATE: `${API_BASE_URL}/api/estructuras-organizacionaes`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/estructuras-organizacionaes/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/estructuras-organizacionaes/${id}`,
  },

  //////////APIS DE VENTAS////////////
  //Cargeras
  CARGUERAS: {
    LIST: `${API_BASE_URL}/api/cargueras`,
    CREATE: `${API_BASE_URL}/api/cargueras`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/cargueras/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/cargueras/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/cargueras/${id}/estado`,
    LIST_ID_CARGUERAS: (id: number | string) => `${API_BASE_URL}/api/cargueras/${id}/coolers`,
  },
  //Locations
  LOCACIONES: {
    LIST: `${API_BASE_URL}/api/locaciones`,
    CREATE: `${API_BASE_URL}/api/locaciones`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/locaciones/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/locaciones/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/locaciones/${id}/estado`,
  },
  //Clientes
  CLIENTES: {
    LIST: `${API_BASE_URL}/api/clientes/full`,
    CREATE: `${API_BASE_URL}/api/clientes`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/clientes/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/clientes/${id}`,
  },
  //Pais
  PAISES: {
    LIST: `${API_BASE_URL}/api/paises`,
    CREATE: `${API_BASE_URL}/api/paises`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/paises/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/paises/${id}/estado`,
  },  
  //vendedores
  VENDEDORES: {
    LIST: `${API_BASE_URL}/api/vendedores`,
    CREATE: `${API_BASE_URL}/api/vendedores`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/vendedores/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/vendedores/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/vendedores/${id}/estado`,
  },
  //roles
  ROLES: {
    LIST: `${API_BASE_URL}/api/roles`,
    CREATE: `${API_BASE_URL}/api/roles`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/roles/${id}/update`,
  },
  //permisos
  TIPOS: {
    LIST: `${API_BASE_URL}/api/permissions`,
    CREATE: `${API_BASE_URL}/api/permissions`,
  },
  //roles-permisos
  ROLES_PERMISOS: {
    LIST: (id: number | string)=>`${API_BASE_URL}/api/roles/${id}/permissions`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/roles/${id}/permissions`,
    
  },
  //tipos de clientes
  TIPOS_CLIENTES: {
    LIST: `${API_BASE_URL}/api/tipo-clientes`,
    CREATE: `${API_BASE_URL}/api/tipo-clientes`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/tipo-clientes/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/tipo-clientes/${id}`,
  },
  //Coolers
  COOLERS: {
    LIST: `${API_BASE_URL}/api/coolers`,
    CREATE: `${API_BASE_URL}/api/coolers`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/coolers/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/coolers/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/coolers/${id}/estado`,
  },
  //Productos
  PRODUCTOS: {
    LIST: `${API_BASE_URL}/api/productos/buscar/por-flores`,
    CREATE: `${API_BASE_URL}/api/productos`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/productos/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/productos/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/productos/${id}/estado`,
    CREATE_COMPLET: `${API_BASE_URL}/api/productos/crear-completo`,
  },
  //Categorías
  CATEGORIAS: {
    LIST: `${API_BASE_URL}/api/categoria`,
    CREATE: `${API_BASE_URL}/api/categoria`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/categoria/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/categoria/${id}`,
  },
  //Lineas Aereas
  LINEAS_AEREAS:{
    LIST: `${API_BASE_URL}/api/aerolineas`,
    CREATE: `${API_BASE_URL}/api/aerolineas`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/aerolineas/${id}`,
     UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/aerolineas/${id}/estado`,
  },
  //Transportistas
  TRANSPORTISTAS:{
    LIST: `${API_BASE_URL}/api/transporte`,
    CREATE: `${API_BASE_URL}/api/transporte`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/transporte/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/transporte/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/transporte/${id}/estado`,
  },
  
  //Bodegas
  BODEGAS: {
    LIST: `${API_BASE_URL}/api/bodega`,
    CREATE: `${API_BASE_URL}/api/bodega`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/bodega/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/bodegas/${id}`,
     UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/bodega/${id}/estado`,
  },
  //Cajas
  CAJAS:{
    LIST: `${API_BASE_URL}/api/cajas`,
    CREATE: `${API_BASE_URL}/api/cajas`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/cajas/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/cajas/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/cajas/${id}/estado`,
  },
 //Materiales
  MATERIALES: {
    LIST: `${API_BASE_URL}/api/materiales`,
    CREATE: `${API_BASE_URL}/api/materiales`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/materiales/update/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/materiales/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/materiales/${id}/estado`,
  },
  //Paquetes
  PAQUETES: {
    LIST: `${API_BASE_URL}/api/paquete-materiales`,
    CREATE: `${API_BASE_URL}/api/paquete-materiales`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/paquete-materiales/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/paquete-materiales/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/paquete-materiales/${id}/estado`,
  },
  //Recetas
  RECETAS: {
    LIST: `${API_BASE_URL}/api/recetas`,
    CREATE: `${API_BASE_URL}/api/recetas`,
    UPDATE: (producto_id: number | string) => `${API_BASE_URL}/api/recetas/${producto_id}/descripcion-imagen`,
    DESCRIPCION_IMAGEN: (id: number | string) => `${API_BASE_URL}/api/recetas/${id}/descripcion-imagen`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/recetas/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/recetas/${id}/estado`,
    RECETA_HISTORIAL: `${API_BASE_URL}/api/reporte-historial`,
  },
  //Asignaciones
  ASIGNACIONES: {
    LIST: `${API_BASE_URL}/api/asignaciones`,
    CREATE: `${API_BASE_URL}/api/asignaciones`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/asignaciones/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/asignaciones/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/asignaciones/${id}/estado`,
    ASIGNACION_RESUMEN: (id: number | string) => `${API_BASE_URL}/api/asignaciones/${id}/resumen`,
  },
  //Marcaciones
  MARCACIONES: {
    LIST: `${API_BASE_URL}/api/marcaciones`,
    CREATE: (id_cliente: number | string)=>`${API_BASE_URL}/api/clientes/${id_cliente}/marcaciones`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/marcaciones/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/marcaciones/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/marcaciones/${id}/estado`,
    LIST_marcaciones: (id_cliente: number | string) => `${API_BASE_URL}/api/clientes/${id_cliente}/marcaciones/count`,
  },
  // Los endpoints de precios han sido movidos a precioService.ts
  //Cotizacion
  COTIZACION: {
    LIST: `${API_BASE_URL}/api/productos-con-paquetes`,
    CREATE: `${API_BASE_URL}/api/productos-con-paquetes`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/productos-con-paquetes/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/productos-con-paquetes/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/productos-con-paquetes/${id}/estado`,
  },
  //Precios
  PRECIOS: {
    LIST: `${API_BASE_URL}/api/ven-precios`,
    CREATE: `${API_BASE_URL}/api/ven-precios`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/ven-precios/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/ven-precios/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/ven-precios/${id}/estado`,
  },
  //Ventas
  VENTAS: {
    LIST: `${API_BASE_URL}/api/ventas`,
    CREATE: `${API_BASE_URL}/api/ventas`,
    UPDATE: (id: number | string) => `${API_BASE_URL}/api/ventas/${id}`,
    DELETE: (id: number | string) => `${API_BASE_URL}/api/ventas/${id}`,
    UPDATE_STATUS: (id: number | string) => `${API_BASE_URL}/api/ventas/${id}/estado`,
    POR_CLIENTE: (clienteId: number | string) => `${API_BASE_URL}/api/clientes/${clienteId}/ventas`,
  },
  //Cajas por producto
  CAJASPRODUCTOS: {
    LIST: `${API_BASE_URL}/api/cajaxproductos`,
    CREATE: `${API_BASE_URL}/api/cajaxproductos/asignar-multiple`,
    UPDATE: (_id_producto: number | string, id_caja: number | string) => `${API_BASE_URL}/api/cajasxproductos/${id_caja}`,
    DELETE: (_id_producto: number | string, id_caja: number | string) => `${API_BASE_URL}/api/cajasxproductos/${id_caja}`,
    LIST_PRODUCT: (id_producto: number | string) => `${API_BASE_URL}/api/cajasxproductos/producto/${id_producto}`,
    UPDATE_STATUS: (_id_producto: number | string, id_caja: number | string) => `${API_BASE_URL}/api/cajasxproductos/${id_caja}/estado`,
  }
};

// Headers comunes para las peticiones
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'accept': 'application/json',
    
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Configuración de timeout para las peticiones
export const API_CONFIG = {
  TIMEOUT: 10000, // 30 segundos
  RETRY_ATTEMPTS: 3,
};

// El endpoint de precios de venta se ha movido a precioService.ts
