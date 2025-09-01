import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import forgotPassword from "./forgotpassword";
import reporteLogin from "./reporteLogin";
import lineasaereas from "./lineasaereas";
import transportistas from "./transportistas";
import bodegas from "./bodegas";
import categorias from "./categorias";
import cajas from "./cajas";
import { departamentosTranslations } from "./departamentos";
import { fincasTranslations } from "./fincas";
import carguera from "./carguera";
import product from "./productos";
import materiales from "./materiales";
import cajasproductos from "./cajasproductos";
import recetas from "./recetas";
import asignacion from "./asignacion";
import asignaciones from "./asignaciones";
import marcaciones from "./marcaciones";
import precios from "./precios";
import cotizador from "./cotizador";
import locations from "./locations";
import salesperson from "./salesperson";
import notificaciones from "./notificaciones";
// Traducciones
const resources = {
  en: {
    translation: {
      // Login
      login: {
        title: "Login",

        welcome: "Welcome",
        email: "Email",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot your password?",
        signIn: "Sign In",
        showPassword: "Show password",
        hidePassword: "Hide password",
        errors: {
          required: "Please enter your email and password.",
          loginFailed: "Login failed. Please try again.",
          invalidCredentials: "Invalid email or password. Please try again.",
          serverError:
            "Unable to connect to the server. Please try again later.",
        },
        signingIn: "Signing in...",
      },

      // Header/Navigation
      header: {
        dashboard: "Dashboard",
        users: "Users",
        clients: "Clients",
        sales: "Sales",
        logout: "Logout",
        config: "Configuration",
        cotizador: "Quotations",
        reporte: "Reports",

        general: "General",
        manageAccount: "Manage Account",
      },

      // Dashboard
      dashboard: {
        title: "Sales Dashboard",
        welcome: "Welcome to the sales management system",
        quickStats: "Quick Statistics",
        recentActivity: "Recent Activity",
        totalSales: "Total Sales",
        totalClients: "Total Clients",
        totalUsers: "Total Users",
        pendingOrders: "Pending Orders",
      },

      // Roles and Permissions
      roles: {
        title: "Role Permissions Management",
        subtitle: "Manage access permissions for each system role",
        systemRoles: "System Roles",
        permissionsFor: "Permissions for:",
        createRole: "Create Role",
        createPermission: "Create Permission",

        saveChanges: "Save Changes",
        loading: "Loading roles and permissions...",
        allPermissions: "All",
        selectAll: "Select all",
        removeAll: "Remove all",
        permissionsSummary: "Permissions Summary",
        permissionsCount: "{{count}} permissions",
        actions: {
          create: "Create",
          crear: "Create",
          view: "Read",
          ver: "Read",
          edit: "Update",
          editar: "Update",
          delete: "Delete",
          eliminar: "Delete",
        },
        messages: {
          updateSuccess: "Permissions updated successfully",
          updateError: "Error updating permissions",
        },
      },

      // Common/General
      common: {
        selectOption: "Select...",
        search: "Search",
        add: "Add",
        edit: "Edit",
        delete: "Delete",
        view: "View",
        save: "Save",
        cancel: "Cancel",
        back: "Back",
        next: "Next",
        previous: "Previous",
        create: "Create",
        update: "Update",
        close: "Close",
        loading: "Loading...",
        noData: "No data available",
        noResults: "No results found",
        actions: "Actions",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
        module: "Module",
        required: "Required",
        optional: "Optional",
        profile: "My Profile",
        settings: "Settings",
        inventory: "Products in inventory",
        page: "Page {{current}} of {{total}}",
        success: "Success!",
        error: "Error",
        updating: "Updating...",
        creating: "Creating...",

        // IP Modal
        ipModal: {
          title: "Add IP",
          placeholder: "Enter IP address",
          validationError: "Enter a valid IP (ex: 192.168.0.1)",
        },

        // Permission Modal
        permissionModal: {
          title: "Create Permission",
          nameLabel: "Permission name",
          namePlaceholder:
            "(e.g.: view clients, create clients, edit clients, delete clients)",
          moduleLabel: "Module",
          modulePlaceholder: "Module (e.g.: clients)",
          actionLabel: "Action",
          actionPlaceholder: "Action (e.g.: create, view, edit, delete)",
          saveButton: "Save Permission",
          requiredFieldsError: "All fields are required",
          createError: "Error creating permission",
          saving: "Saving...",
        },

        // Role Modal
        roleModal: {
          title: "Create Role",
          placeholder: "Role name",
          nameRequiredError: "Name is required",
          createError: "Error creating role",
          saveButton: "Save Role",
          saving: "Saving...",
        },

        // Address Search
        addressSearch: {
          placeholder: "Search address (type to see suggestions)",
          loading: "Loading address search...",
          error: "Could not load address search",
          processingError: "Error processing selected address",
        },

        // Debug API Key
        debug: {
          apiKeyNotFound: "API key not found",
        },

        // Google Maps Loader
        googleMaps: {
          loading: "Loading Google Maps...",
          error:
            "Error loading Google Maps. Please check your internet connection and API key.",
        },

        // Place Autocomplete
        placeAutocomplete: {
          placeholder: "Enter an address",
          ariaLabel: "Search address",
        },

        // Sidebar Navigation
        sidebar: {
          clients: "Clients",
          client: "Client",
          locations: "Locations",
          salesperson: "Salesperson",
          countries: "Countries",
          users: "Users",
          user: "User",
          roles: "Roles",
          tags: "Tags",
          logistics: "Logistics",
          airlines: "Airlines",
          carriers: "Carriers",
          cooler: "Cooler",
          transporter: "Transporter",
          warehouses: "Warehouses",
          products: "Products",
          product: "Product",
          recipes: "Recipes",
          categories: "Categories",
          boxes: "Boxes",
          materiales: "Materials", 
          asignaciones: "Assignments",
          asignacioncp:"Client-Products",
          asignacioncap:"Box-Products",
          marcaciones: "Ship to",
          vegetal: "Vegetable",
          paquetes: "Packages",
          pallet: "Pallet"
        },

        // Cooler Management
        cooler: {
          title: "Cold Room Management",
          search: "Search cold room...",
          add: "Add",
          loading: "Loading...",
          error: "Error loading cold rooms",
          noData: "No cold rooms",
          // Table headers
          code: "Code",
          name: "Name",
          actions: "Actions",
          // Pagination
          page: "Page",
          of: "of",
        },

        // Locations Management - Moved to locations.ts

        // Countries Management
        countries: {
          title: "Country Management",
          search: "Search country...",
          add: "Add",
          loading: "Loading...",
          error: "Error loading countries",
          noData: "No countries",
          // Table headers
          name: "Name",
          sriCode: "SRI Code",
          taxHaven: "Tax Haven",
          pfCode: "PF Code",
          actions: "Actions",
          // Values
          yes: "Yes",
          no: "No",
          // Pagination
          page: "Page",
          of: "of",
          // Card fields
          cardTaxHaven: "Tax Haven:",
          cardPfCode: "PF Code:",
        },

        // Salesperson Management - Moved to salesperson.ts
      },

      // Users Management
      users: {
        title: "User Management",
        listTitle: "User List",
        addNew: "Add New User",
        createUser: "Create User",
        editUser: "Edit User",
        searchPlaceholder: "Search user...",

        // Form fields
        form: {
          userInformation: "User Information",
          basicData: "Basic Data",
          salesData: "Sales Data",
          personalData: "Personal Data",

          // Basic fields
          userNumber: "Name",
          code: "Code",
          role: "Role",
          currentRole: "Current role",
          selectRole: "Select a role",
          globalAccess: "Global access",
          globalAccessAny: "Global access (any IP)",
          onlyAllowedIps: "Only allowed IPs",
          addIp: "Add IP",
          addIpPlaceholder: "Add IP (use comma for multiple)",
          authorizedIps: "Authorized IPs",
          ipStatus: "IP Status",
          activeIp: "Active",
          inactiveIp: "Inactive",
          deleteIp: "Delete IP",
          noIpsConfigured: "No IPs configured",
          toggleIpStatus: "Toggle IP status",
          country: "Country",
          state: "State/Province",
          city: "City",
          address: "Address",
          searchAddress: "Search address",
          zipCode: "Zip Code",
          phone: "Phone",
          email: "Email",
         

          // Sales fields
          locationName: "Location Name",
          latitude: "Latitude",
          longitude: "Longitude",

          // Personal fields
          firstName: "First Name",
          lastName: "Last Name",
          position: "Position",
          department: "Department",
          birthDate: "Birth Date",
          hireDate: "Hire Date",

          // Placeholders
          placeholders: {
            userNumber: "Enter user number",
            code: "Enter code",
            selectCountry: "Select country",
            state: "Enter state or province",
            city: "Enter city",
            address: "Enter complete address",
            zipCode: "Enter zip code",
            phone: "Enter phone number",
            email: "email@example.com",
            locationName: "Location name",
            latitude: "e.g. 40.7128",
            longitude: "e.g. -74.0060",
            firstName: "Enter first name",
            lastName: "Enter last name",
            position: "Job position",
            department: "Department name",
          },
        },

        // Table headers
        table: {
          id: "ID",
          name: "Name",
          email: "Email",
          phone: "Phone",
          position: "Position",
          department: "Department",
          status: "Status",
          actions: "Actions",
        },

        // Messages
        messages: {
          created: "User created successfully",
          updated: "User updated successfully",
          deleted: "User deleted successfully",
          error: "Error processing user. Please try again.",
          coordinatesInfo:
            "Coordinates can be filled automatically using the address search in Basic Data step.",
          ipAdded: "IP(s) added successfully",
          errorAddingIp: "Error adding IP. Please try again.",
          ipAlreadyExists: "IP already exists",
          invalidIpFormat: "Invalid IP format",
          ipDeleted: "IP deleted successfully",
          errorDeletingIp: "Error deleting IP. Please try again.",
        },
      },

      // Clients Management
      clients: {
        title: "Client Management",
        listTitle: "Client List",
        addNew: "Add",
        createClient: "Create Client",
        editClient: "Edit Client",
        searchPlaceholder: "Search client...",
        tableButton: "Table",
        // Form sections
        form: {
          selectCarrierFirst: "Select a carrier first",
          basicData: "Basic Data",
          salesData: "Sales",
          merchandiseData: "Merchandise",

          // Basic fields
          clientNumber: "Name",
          code: "Code",
          country: "Country",
          state: "State/Province",
          city: "City",
          address: "Address",
          searchAddress: "Search address",
          zipCode: "Zip Code",
          phone: "Phone",
          email: "Email account statement",
          emailFactura: "Invoice Email",
          // Sales fields

          // Merchandise fields
          carrierData: "Carrier Data",
          carrierName: "Name Carrier",
          carrierRuc: "RUC",
          carrierType: "Type",
          carrierRepresentative: "Representative",
          carrierPhone: "Phone",
          carrierEmail: "Email",
          coolerData: "Cooler Data",
          coolerName: "Name Cooler",
          coolerDescription: "Description",
          message: "The code already exists",
          required_name: "Cooler name is required",
          required_code: "The code is required",
          required_carrier: "You must select a carrier",

          // Country fields
          countryData: "Country Data",
          countryName: "Country Name",
          sriCode: "SRI Code",
          taxHaven: "Tax Haven",
          pfCode: "PF Code",

          // Carrier types
          carrierTypes: {
            select: "Select type",
            national: "National",
            international: "International",
            mixed: "Mixed",
          },

          // Placeholders
          placeholders: {
            tipoCliente: "Select client type...",
            clientNumber: "Enter client number",
            code: "Enter code",
            selectCountry: "Select country",
            state: "Enter state or province",
            city: "Enter city",
            address: "Enter complete address",
            zipCode: "Enter zip code",
            phone: "Enter phone number",
            email: "email@example.com",
            locationName: "Location name",
            latitude: "e.g. 40.7128",
            longitude: "e.g. -74.0060",
            carrierName: "Carrier name",
            carrierRuc: "Company RUC",
            carrierRepresentative: "Representative name",
            carrierPhone: "Contact phone",
            carrierEmail: "email@example.com",
            coolerName: "Cooler name",
            coolerDescription: "Brief description",
            countryName: "Country name",
            sriCode: "SRI code",
            pfCode: "PF code",
          },
          // Client type title
          clientType: "Client Type",
        },

        // Table headers
        table: {
          id: "ID",
          name: "Name",
          company: "Company",
          email: "Email",
          phone: "Phone",
          status: "Status",
          actions: "Actions",
        },

        // Messages
        messages: {
          created: "Client created successfully",
          updated: "Client updated successfully",
          deleted: "Client deleted successfully",
          error: "Error creating client. Please try again.",
          coordinatesInfo:
            "Coordinates can be filled automatically using the address search in Basic Data step.",
        },
      },

      // Sales Management
      sales: {
        title: "Sales Management",
        description: "Manage your sales and invoices",
        recentSales: "Recent Sales",
        listTitle: "Sales List",
        addNew: "Add New Sale",
        createSale: "Create Sale",
        editSale: "Edit Sale",
        searchPlaceholder: "Search sale...",

        // Table headers
        table: {
          id: "ID",
          client: "Client",
          amount: "Amount",
          date: "Date",
          status: "Status",
          salesperson: "Salesperson",
          actions: "Actions",
        },

        // Status
        status: {
          pending: "Pending",
          completed: "Completed",
          cancelled: "Cancelled",
        },

        // Messages
        messages: {
          created: "Sale created successfully",
          updated: "Sale updated successfully",
          deleted: "Sale deleted successfully",
          error: "Error processing sale. Please try again.",
        },
      },

      // Countries
      countries: {
        select: "Select country",
        argentina: "Argentina",
        colombia: "Colombia",
        ecuador: "Ecuador",
        mexico: "Mexico",
        spain: "Spain",
        chile: "Chile",
        peru: "Peru",

        // Management messages
        messages: {
          created: "Country saved successfully",
          updated: "Country updated successfully",
          error: "Error saving country",
        },
      },

      // ...productos block removed (now only using spread from product.en)

      // Languages
      languages: {
        en: "English",
        es: "Español",
      },

      // Reset Password
      reset: {
        title: "Reset Password",
        instructions: "Enter your new password.",
        password: "New Password",
        confirm: "Confirm Password",
        send: "Reset Password",
        sending: "Resetting...",
        success: "Password reset successfully!",
        error: "Error resetting password. Please try again.",
        errors: {
          required: "Please enter both password fields.",
          weak: "Password must have at least 8 characters, including uppercase, lowercase, numbers and a special character.",
          nomatch: "Passwords do not match.",
        },
      },

      fieldRequired: "{{field}} is required",
      ...(reporteLogin.en || {}),
      ...(forgotPassword.en || {}),
      ...lineasaereas.en,
      ...transportistas.en,
      ...bodegas.en,
      ...categorias.en,
      ...cajas.en,
      ...carguera.en,
      ...product.en,
      ...materiales.en,
      ...recetas.en,
      ...marcaciones.en,
      ...precios.en,
      ...cotizador.en,
      ...locations.en,
      ...salesperson.en,
      ...notificaciones.en,
      ...asignaciones.en,
      ...departamentosTranslations.en.departamentos,
      ...fincasTranslations.en.fincas,
    },
    
    cajasproductos: {
      ...cajasproductos.en,
      ...asignacion.en,
    },
    
  },
  es: {
    translation: {
      // Login
      login: {
        title: "Iniciar sesión",
        welcome: "Bienvenido",
        email: "Correo electrónico",
        password: "Contraseña",
        rememberMe: "Recordarme",
        forgotPassword: "¿Olvidaste tu contraseña?",
        signIn: "Ingresar",
        showPassword: "Mostrar contraseña",
        hidePassword: "Ocultar contraseña",
        errors: {
          required: "Por favor, introduce tu correo y contraseña.",
          loginFailed:
            "Error al iniciar sesión. Por favor, inténtalo de nuevo.",
          invalidCredentials:
            "Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.",
          serverError:
            "No se puede conectar con el servidor. Por favor, inténtalo más tarde.",
        },
        signingIn: "Iniciando sesión...",
      },

      // Header/Navigation
      header: {
        dashboard: "Panel",
        users: "Usuarios",
        clients: "Clientes",
        sales: "Ventas",
        logout: "Cerrar Sesión",
        config: "Configuraciones",
        general: "General",
        manageAccount: "Gestionar Cuenta",
        cotizador: "Cotizador",
        reporte: "Reportes",
      },

      // Dashboard
      dashboard: {
        title: "Panel de Ventas",
        welcome: "Bienvenido al sistema de gestión de ventas",
        quickStats: "Estadísticas Rápidas",
        recentActivity: "Actividad Reciente",
        totalSales: "Ventas Totales",
        totalClients: "Clientes Totales",
        totalUsers: "Usuarios Totales",
        pendingOrders: "Pedidos Pendientes",
      },

      // Roles and Permissions
      roles: {
        title: "Gestión de Roles y Permisos",
        subtitle: "Administra los permisos de acceso para cada rol del sistema",
        systemRoles: "Roles del Sistema",
        permissionsFor: "Permisos para:",
        createRole: "Crear Rol",
        createPermission: "Crear Permiso",
        saveChanges: "Guardar Cambios",
        loading: "Cargando roles y permisos...",
        allPermissions: "Todos",
        selectAll: "Seleccionar todo",
        removeAll: "Eliminar todo",
        permissionsSummary: "Resumen de Permisos",
        permissionsCount: "{{count}} permisos",
        actions: {
          create: "Crear",
          crear: "Crear",
          view: "Leer",
          ver: "Leer",
          edit: "Actualizar",
          editar: "Actualizar",
          delete: "Eliminar",
          eliminar: "Eliminar",
        },
        messages: {
          updateSuccess: "Permisos actualizados exitosamente",
          updateError: "Error al actualizar permisos",
        },
      },

      // Common/General
      common: {
        selectOption: "Seleccionar...",
        search: "Buscar",
        add: "Agregar",
        edit: "Editar",
        delete: "Eliminar",
        view: "Ver",
        save: "Guardar",
        cancel: "Cancelar",
        back: "Atrás",
        next: "Siguiente",
        previous: "Anterior",
        create: "Crear",
        update: "Actualizar",
        close: "Cerrar",
        loading: "Cargando...",
        noData: "No hay datos disponibles",
        noResults: "Sin resultados",
        actions: "Acciones",
        status: "Estado",
        active: "Activo",
        inactive: "Inactivo",
        module: "Módulo",
        required: "Requerido",
        optional: "Opcional",
        profile: "Mi Perfil",
        settings: "Configuración",
        inventory: "Productos en inventario",
        page: "Página {{current}} de {{total}}",
        success: "¡Éxito!",
        error: "Error",
        updating: "Actualizando...",
        creating: "Creando...",

        // IP Modal
        ipModal: {
          title: "Agregar IP",
          placeholder: "Ingrese la IP",
          validationError: "Ingrese una IP válida (ej: 192.168.0.1)",
        },

        // Permission Modal
        permissionModal: {
          title: "Crear Permiso",
          nameLabel: "Nombre del permiso",
          namePlaceholder:
            "(ej: ver clientes, crear clientes, editar clientes, eliminar clientes)",
          moduleLabel: "Módulo",
          modulePlaceholder: "Módulo (ej: clientes)",
          actionLabel: "Acción",
          actionPlaceholder: "Acción (ej: crear, ver, editar, eliminar)",
          saveButton: "Guardar Permiso",
          requiredFieldsError: "Todos los campos son requeridos",
          createError: "Error al crear el permiso",
          saving: "Guardando...",
        },

        // Role Modal
        roleModal: {
          title: "Crear Rol",
          placeholder: "Nombre del rol",
          nameRequiredError: "El nombre es requerido",
          createError: "Error al crear el rol",
          saveButton: "Guardar Rol",
          saving: "Guardando...",
        },

        // Address Search
        addressSearch: {
          placeholder: "Buscar dirección (escribe para ver sugerencias)",
          loading: "Cargando búsqueda de direcciones...",
          error: "No se pudo cargar la búsqueda de direcciones",
          processingError: "Error al procesar la dirección seleccionada",
        },

        // Debug API Key
        debug: {
          apiKeyNotFound: "No se encontró clave API",
        },

        // Google Maps Loader
        googleMaps: {
          loading: "Cargando Google Maps...",
          error:
            "Error al cargar Google Maps. Por favor, verifica tu conexión a internet y la clave API.",
        },

        // Place Autocomplete
        placeAutocomplete: {
          placeholder: "Ingrese una dirección",
          ariaLabel: "Buscar dirección",
        },

        // Sidebar Navigation
        sidebar: {
          clients: "Clientes",
          client: "Cliente",
          locations: "Locations",
          salesperson: "Vendedor",
          countries: "Países",
          users: "Usuarios",
          user: "Usuario",
          roles: "Roles",
          tags: "Etiquetas",
          logistics: "Logística",
          airlines: "Líneas Aéreas",
          carriers: "Cargueras",
          cooler: "Cooler",
          transporter: "Transportista",
          warehouses: "Bodegas",
          products: "Productos",
          product: "Producto",
          recipes: "Recetas",
          categories: "Categorías",
          boxes: "Cajas",
          materiales: "Materiales", 
          asignaciones: "Asignaciones",
          asignacioncp:"Cliente-Productos",
          asignacioncap:"Productos-Cajas",
          marcaciones:"Marcaciones",
          vegetal:"Vegetal",
          paquetes:"Paquetes",
          pallet:"Palet"
        },

        // Cooler Management
        cooler: {
          title: "Gestión de cuartos fríos",
          search: "Buscar cuarto frío...",
          add: "Agregar",
          loading: "Cargando...",
          error: "Error al cargar cuartos fríos",
          noData: "No hay cuartos fríos",
          // Table headers
          code: "Código",
          name: "Nombre",
          actions: "Acciones",
          // Pagination
          page: "Página",
          of: "de",
        },

        // Locations Management - Moved to locations.ts

        // Countries Management
        countries: {
          title: "Gestión de países",
          search: "Buscar país...",
          add: "Agregar",
          loading: "Cargando...",
          error: "Error al cargar países",
          noData: "No hay países",
          // Table headers
          name: "Nombre",
          sriCode: "Código SRI",
          taxHaven: "Paraíso Fiscal",
          pfCode: "Código PF",
          actions: "Acciones",
          // Values
          yes: "Sí",
          no: "No",
          // Pagination
          page: "Página",
          of: "de",
          // Card fields
          cardTaxHaven: "Paraíso Fiscal:",
          cardPfCode: "Código PF:",
        },

        // Salesperson Management - Moved to salesperson.ts
      },

      // Users Management
      users: {
        title: "Gestión de Usuarios",
        listTitle: "Listado de Usuarios",
        addNew: "Agregar Nuevo Usuario",
        createUser: "Crear Usuario",
        editUser: "Editar Usuario",
        searchPlaceholder: "Buscar usuario...",

        // Form fields
        form: {
          userInformation: "Información del Usuario",
          basicData: "Datos Básicos",
          salesData: "Datos de Ventas",
          personalData: "Datos Personales",

          // Basic fields
          userNumber: "Número de Usuario",
          code: "Código",
          role: "Rol",
          currentRole: "Rol actual",
          selectRole: "Seleccione un rol",
          globalAccess: "Acceso global",
          globalAccessAny: "Acceso global (cualquier IP)",
          onlyAllowedIps: "Solo IPs permitidas",
          addIp: "Agregar IP",
          addIpPlaceholder: "Agregar IP (usa coma para varias)",
          authorizedIps: "IPs Autorizadas",
          ipStatus: "Estado de IP",
          activeIp: "Activa",
          inactiveIp: "Inactiva",
          deleteIp: "Eliminar IP",
          noIpsConfigured: "No hay IPs configuradas",
          toggleIpStatus: "Cambiar estado de IP",
          country: "País",
          state: "Estado/Provincia",
          city: "Ciudad",
          address: "Dirección",
          searchAddress: "Buscar dirección",
          zipCode: "Código Postal",
          phone: "Teléfono",
          email: "Email",

          // Sales fields
          locationName: "Nombre de Ubicación",
          required_name_location: "El nombre de la ubicación es requerido",
          latitude: "Latitud",
          longitude: "Longitud",

          // Personal fields
          firstName: "Nombre",
          lastName: "Apellido",
          position: "Cargo",
          department: "Departamento",
          birthDate: "Fecha de Nacimiento",
          hireDate: "Fecha de Contratación",

          // Placeholders
          placeholders: {
            userNumber: "Ingrese el número de usuario",
            code: "Ingrese el código",
            selectCountry: "Seleccionar país",
            state: "Ingrese el estado o provincia",
            city: "Ingrese la ciudad",
            address: "Ingrese la dirección completa",
            zipCode: "Ingrese el código postal",
            phone: "Ingrese el número telefónico",
            email: "correo@ejemplo.com",
            locationName: "Nombre de la ubicación",
            latitude: "Ej. 40.7128",
            longitude: "Ej. -74.0060",
            firstName: "Ingrese el nombre",
            lastName: "Ingrese el apellido",
            position: "Cargo del puesto",
            department: "Nombre del departamento",
          },
        },

        // Table headers
        table: {
          id: "ID",
          name: "Nombre",
          email: "Email",
          phone: "Teléfono",
          position: "Cargo",
          department: "Departamento",
          status: "Estado",
          ip: "IP",
          actions: "Acciones",
        },

        // Messages
        messages: {
          created: "Usuario creado exitosamente",
          updated: "Usuario actualizado exitosamente",
          deleted: "Usuario eliminado exitosamente",
          error: "Error al procesar usuario. Por favor, inténtelo de nuevo.",
          coordinatesInfo:
            "Las coordenadas pueden rellenarse automáticamente usando el buscador de direcciones en el paso de Datos Básicos.",
          ipAdded: "IP(s) agregada(s) exitosamente",
          errorAddingIp: "Error al agregar IP. Por favor, inténtelo de nuevo.",
          ipAlreadyExists: "La IP ya existe",
          invalidIpFormat: "Formato de IP inválido",
          ipDeleted: "IP eliminada exitosamente",
          errorDeletingIp:
            "Error al eliminar IP. Por favor, inténtelo de nuevo.",
        },
      },

      // Clients Management
      clients: {
        title: "Gestión de Clientes",
        listTitle: "Listado de Clientes",
        addNew: "Agregar",
        createClient: "Crear Cliente",
        editClient: "Editar Cliente",
        searchPlaceholder: "Buscar cliente...",
        tableButton: "Tabla",
        // Form sections
        form: {
          selectCarrierFirst: "Seleccione una carguera primero",
          basicData: "Datos Básicos",
          salesData: "Ventas",
          merchandiseData: "Mercadería",

          // Basic fields
          clientNumber: "Nombre",
          code: "Código",
          country: "País",
          state: "Estado/Provincia",
          city: "Ciudad",
          address: "Dirección",
          searchAddress: "Buscar dirección",
          zipCode: "Código Postal",
          phone: "Teléfono",
          email: "Email Cuenta",
          emailFactura: "Email Factura",

          // Sales fields

          // Merchandise fields
          carrierData: "Datos de Carguera",
          carrierName: "Nombre de Carguera",
          carrierRuc: "RUC",
          carrierType: "Tipo",
          carrierRepresentative: "Representante",
          carrierPhone: "Teléfono",
          carrierEmail: "Email",
          coolerData: "Datos de Enfriador",
          coolerName: "Nombre de cuarto frio",
          coolerDescription: "Descripción",
          message: "El código ya existe",
          required_name: "El nombre del cooler es requerido",
          required_code: "El código del cooler es requerido",
          required_carrier: "Debe seleccionar una carguera",
          // Country fields
          countryData: "Datos de País",
          countryName: "Nombre del País",
          sriCode: "Código SRI",
          taxHaven: "Paraíso Fiscal",
          pfCode: "Código PF",

          // Carrier types
          carrierTypes: {
            select: "Seleccionar tipo",
            national: "Nacional",
            international: "Internacional",
            mixed: "Mixta",
          },

          // Placeholders
          placeholders: {
            tipoCliente: "Seleccionar tipo de cliente...",
            clientNumber: "Ingrese el número de cliente",
            code: "Ingrese el código",
            selectCountry: "Seleccionar país",
            state: "Ingrese la provincia o estado",
            city: "Ingrese la ciudad",
            address: "Ingrese la dirección completa",
            zipCode: "Ingrese el código postal",
            phone: "Ingrese el número telefónico",
            email: "correo@ejemplo.com",
            locationName: "Nombre de la ubicación",
            latitude: "Ej. 40.7128",
            longitude: "Ej. -74.0060",
            carrierName: "Nombre de la carguera",
            carrierRuc: "RUC de la empresa",
            carrierRepresentative: "Nombre del representante",
            carrierPhone: "Teléfono de contacto",
            carrierEmail: "correo@ejemplo.com",
            coolerName: "Nombre del cooler",
            coolerDescription: "Descripción breve",
            countryName: "Nombre del país",
            sriCode: "Código SRI",
            pfCode: "Código PF",
          },
          // Client type title
          clientType: "Tipo de Cliente",
        },

        // Table headers
        table: {
          id: "ID",
          name: "Nombre",
          company: "Empresa",
          email: "Email",
          phone: "Teléfono",
          status: "Estado",
          actions: "Acciones",
        },

        // Messages
        messages: {
          created: "Cliente creado exitosamente",
          updated: "Cliente actualizado exitosamente",
          deleted: "Cliente eliminado exitosamente",
          error: "Error al crear cliente. Por favor, inténtelo de nuevo.",
          coordinatesInfo:
            "Las coordenadas pueden rellenarse automáticamente usando el buscador de direcciones en el paso de Datos Básicos.",
        },
      },

      // Sales Management
      sales: {
        title: "Gestión de Ventas",
        description: "Administra tus ventas y facturas",
        recentSales: "Ventas Recientes",
        listTitle: "Listado de Ventas",
        addNew: "Agregar Nueva Venta",
        createSale: "Crear Venta",
        editSale: "Editar Venta",
        searchPlaceholder: "Buscar venta...",

        // Table headers
        table: {
          id: "ID",
          client: "Cliente",
          amount: "Monto",
          date: "Fecha",
          status: "Estado",
          salesperson: "Vendedor",
          actions: "Acciones",
        },

        // Status
        status: {
          pending: "Pendiente",
          completed: "Completado",
          cancelled: "Cancelado",
        },

        // Messages
        messages: {
          created: "Venta creada exitosamente",
          updated: "Venta actualizada exitosamente",
          deleted: "Venta eliminada exitosamente",
          error: "Error al procesar venta. Por favor, inténtelo de nuevo.",
        },
      },

      // Countries
      countries: {
        select: "Seleccionar país",
        argentina: "Argentina",
        colombia: "Colombia",
        ecuador: "Ecuador",
        mexico: "México",
        spain: "España",
        chile: "Chile",
        peru: "Perú",

        // Management messages
        messages: {
          created: "País guardado exitosamente",
          updated: "País actualizado exitosamente",
          error: "Error al guardar país",
        },
      },
      // Languages
      languages: {
        es: "Español",
        en: "English",
        
      },

      // Reset Password
      reset: {
        title: "Restablecer contraseña",
        instructions: "Ingresa tu nueva contraseña.",
        password: "Nueva contraseña",
        confirm: "Confirmar contraseña",
        send: "Restablecer contraseña",
        sending: "Restableciendo...",
        success: "¡Contraseña restablecida exitosamente!",
        error:
          "Error al restablecer la contraseña. Por favor, inténtalo de nuevo.",
        errors: {
          required: "Por favor, completa ambos campos de contraseña.",
          weak: "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial.",
          nomatch: "Las contraseñas no coinciden.",
        },
      },

      fieldRequired: "{{field}} es requerido",
      ...(reporteLogin.es || {}),
      ...(forgotPassword.es || {}),
      ...lineasaereas.es,
      ...transportistas.es,
      ...bodegas.es,
      ...categorias.es,
      ...cajas.es,
      ...carguera.es,
      ...product.es,
      ...materiales.es,
      ...recetas.es,
      ...marcaciones.es,
      ...precios.es,
      ...cotizador.es,
      ...locations.es,
      ...salesperson.es,
      ...notificaciones.es,
      ...asignaciones.es,
      ...departamentosTranslations.es.departamentos,
      ...fincasTranslations.es.fincas,
    },
   
    cajasproductos: {
      ...cajasproductos.es,
      
      ...asignacion.es,
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en", // Idioma por defecto
     lng: 'en',
    debug: false,

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },
  });

export default i18n;
