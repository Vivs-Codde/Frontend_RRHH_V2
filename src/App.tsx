import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Login from './auth/Login'
import Dashboard from './pages/Dashboard'
import Ventas from './pages/Ventas'
import Usuario from './pages/Usuario'
import ClienteForm from './components/forms/ClienteForm'
import Carguera from './pages/clientepage/Carguera'
import Cooler from './pages/clientepage/Cooler'
import Color from './pages/empleadopage/Color'
import Vendedor from './pages/clientepage/Vendedor'
import ForgotPassword from './auth/ForgotPassword'
import ResetPassword from './auth/ResetPassword'
import Layout from './components/Layout'
import RolePermissionsInterface from './pages/rolespage/Roles'
import Pais from './pages/clientepage/Pais';
import React from 'react';
import { PermissionsProvider } from "./context/PermissionsContext";
import ReporteLogin from './pages/ReporteLogin'
import ProductosPage from './pages/productospage/Productos'
import CategoriasPage from './pages/productospage/Categorias'
import CajasPage from './pages/productospage/Cajas'
import LineasAereasPage from './pages/logistica/LineasAereas'
import TransportistasPage from './pages/logistica/Transportistas'
import BodegasPage from './pages/logistica/Bodegas'
import Profile from './pages/Profile'; // Asegúrate de que la ruta de importación sea correcta
import ProtectedRoute from './components/ProtectedRoute';
import MaterialesPage from './pages/materials/Materiales'
import RecetasPage from './pages/recestas/Recetas';
import AsignacionPage from './pages/asignaciones/Asignacion';
import Cotizador from './pages/Cotizador';
import CajasProductos from './pages/cajasproductos/CajasProductos'  // Importa el componente CajasProductos 
import Reporte from './pages/Reporte'
//import Marcaciones from './pages/clientepage/Marcaciones'
import MarcacionesForm from './components/forms/MarcacionForm'
import PaquetesPage from './pages/paquetes/Paquetes'
import PrecioPage from './pages/precios/Precios'
import PaletCajaPage from './pages/productospage/PaletCaja'
interface AppRoutesProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogin: () => void;
}

function AppRoutes({ isAuthenticated, setIsAuthenticated, handleLogin }: AppRoutesProps) {
  // Función para logout global
  const handleLogout = () => {
    setIsAuthenticated(false);
  };
  const location = useLocation();
  return (
    <Routes>
      {/* Rutas públicas fuera del layout */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
      />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
      />
      <Route 
        path="/forgot-password" 
        element={<ForgotPassword />} 
      />
      <Route 
        path="/reset-password" 
        element={<ResetPassword />} 
      />
      {/* Rutas protegidas dentro del layout */}
      <Route element={<Layout onLogout={handleLogout} />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ventas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
        <Route path="/usuario" element={<ProtectedRoute><Usuario /></ProtectedRoute>} />
        <Route path="/cliente-usuario" element={<ProtectedRoute><ClienteForm /></ProtectedRoute>} />
        <Route path="/config-cliente" element={<ProtectedRoute><Navigate to="/cliente/carguera" /></ProtectedRoute>} />
        <Route path="/cliente/carguera" element={<ProtectedRoute><Carguera /></ProtectedRoute>} />
        <Route path="/cliente/cooler" element={<ProtectedRoute><Cooler /></ProtectedRoute>} />
        <Route path="/cliente/color" element={<ProtectedRoute><Color /></ProtectedRoute>} />
        <Route path="/cliente/vendedor" element={<ProtectedRoute><Vendedor /></ProtectedRoute>} />
        <Route path="/cliente/pais" element={<ProtectedRoute><Pais /></ProtectedRoute>} />
        <Route path="/cliente/marcaciones" element={<ProtectedRoute><MarcacionesForm /></ProtectedRoute>} />
        <Route path="/productos/producto" element={<ProtectedRoute><ProductosPage /></ProtectedRoute>} />
        <Route path="/productos/categorias" element={<ProtectedRoute><CategoriasPage /></ProtectedRoute>} />
        <Route path="/productos/cajas" element={<ProtectedRoute><CajasPage /></ProtectedRoute>} />
        <Route path="/logistica/lineas-aereas" element={<ProtectedRoute><LineasAereasPage /></ProtectedRoute>} />
        <Route path="/logistica/transportistas" element={<ProtectedRoute><TransportistasPage /></ProtectedRoute>} />
        <Route path="/logistica/bodegas" element={<ProtectedRoute><BodegasPage /></ProtectedRoute>} />
        <Route path="/role-permissions" element={<ProtectedRoute><RolePermissionsInterface /></ProtectedRoute>} />
        <Route path="/reporte-login" element={<ProtectedRoute><ReporteLogin /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/productos/materiales" element={<ProtectedRoute><MaterialesPage /></ProtectedRoute>} />
        <Route path="/productos/recetas" element={<ProtectedRoute><RecetasPage /></ProtectedRoute>} />
        <Route path="/asignaciones/asignaciones" element={<ProtectedRoute><AsignacionPage /></ProtectedRoute>} />
        <Route path="/cotizador" element={<ProtectedRoute><Cotizador /></ProtectedRoute>} />
        <Route path="/cajas-productos" element={<ProtectedRoute><CajasProductos /></ProtectedRoute>} />
        <Route path="/reporte" element={<ProtectedRoute><Reporte /></ProtectedRoute>} />
        <Route path="/productos/paquetes" element={<ProtectedRoute><PaquetesPage /></ProtectedRoute>} />
        <Route path="/precios" element={<ProtectedRoute><PrecioPage /></ProtectedRoute>} />
        <Route path="/palet-caja" element={<ProtectedRoute><PaletCajaPage /></ProtectedRoute>} />
        {/* Ruta para el formulario de paquetes */}
      </Route>
      {/* Ruta de fallback para cualquier otra URL */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

const App: React.FC = () => {
  // Estado para controlar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('authToken') || !!localStorage.getItem('userData');
  });

  // Verifica el token con el backend al iniciar la app
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
    
      if (token) {
        try {
          // Usar el servicio centralizado para validar el token
          await import('./services/authService').then(({ getUsuariosPaginado }) =>
            getUsuariosPaginado({ page: 1, per_page: 1 })
          ).then(() => {
            setIsAuthenticated(true);
          }).catch((error) => {
            // Token inválido o error en la API
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setIsAuthenticated(false);
           
          });
        } catch (error) {
          setIsAuthenticated(false);
         
        }
      } else {
        setIsAuthenticated(false);
        
      }
    };
    checkAuth();
    // También escucha cambios en el storage
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken') || !!localStorage.getItem('userData'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Función para manejar el login exitoso
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <PermissionsProvider>
      <BrowserRouter>
        <AppRoutes isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} handleLogin={handleLogin} />
      </BrowserRouter>
    </PermissionsProvider>
  );
}

export default App
