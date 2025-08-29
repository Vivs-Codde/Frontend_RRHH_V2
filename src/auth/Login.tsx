import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";
import { authService, ApiError } from "../services";
import { Link, useLocation } from "react-router-dom";
import { useSetPermissions } from "../context/PermissionsContext";
// Importación de la imagen - se maneja usando la ruta relativa
// @ts-ignore
import eqrLogo from "../assets/eqr.png";
// @ts-ignore
import eqrBg from "../assets/eqr1.webp";
interface LoginProps {
  onLogin?: (() => void) | unknown;
}
const Login: React.FC<LoginProps> = (props) => {
  const { t } = useTranslation();
  const setPermissions = useSetPermissions();
  const location = useLocation();
  // Extraer onLogin de las props y asegurarnos que es una función
  const onLogin =
    typeof props.onLogin === "function" ? props.onLogin : () => {};
  // Mensaje de redirección desde rutas protegidas
  const loginMessage = location.state?.message;

  // Cargar nombre de usuario y contraseña recordados al iniciar
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Guardar o eliminar nombre de usuario y contraseña según el checkbox
    if (rememberMe) {
      localStorage.setItem("rememberedUsername", username);
      localStorage.setItem("rememberedPassword", password);
    } else {
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
    }

   
    if (!username || !password) {
      setError(t("login.errors.required"));
      setIsLoading(false);
      return;
    }
    // Obtener coordenadas antes de hacer login
    const doLogin = async (coords?: { latitude: number; longitude: number }) => {
      try {
        // Usar el servicio de autenticación para credenciales reales
        const response = await authService.login({
          login: username, // Enviar username como login
          password,
          ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
        });

       

        // Guardar los datos del usuario si no se guardaron automáticamente
        if (response.user && !authService.getUserData()) {
          authService.setUserData(response.user);
        }

        // Validar usuario, tipo y estado
        type UserApi = typeof response.user & { estado?: string; tipo?: string };
        const user = response.user as UserApi;
        if (!user) {
          setError("Usuario no encontrado en la respuesta del servidor.");
          setIsLoading(false);
          return;
        }
        if (user.estado !== "A") {
          setError("El usuario no está activo. Contacte al administrador.");
          setIsLoading(false);
          return;
        }
        // Normalizar tipo de usuario para manejar inconsistencias de singular/plural
        const userType = (user.tipo || "").toUpperCase();
        const allowedTypes = ["ADMIN", "RRHH", "EMPLEADO"];
        
        if (!allowedTypes.includes(userType)) {
          setError("Solo usuarios de tipo ADMIN/RRHH/EMPLEADO pueden ingresar a este sistema.");
          setIsLoading(false);
          return;
        }
        // Obtener y guardar permisos del rol
        let roleId: number | null = null;
        let isAdmin = false;
        if (user.role) {
          if (typeof user.role === "object" && "id" in user.role) {
            roleId = (user.role as { id: number }).id;
            isAdmin = (user.role as { name?: string }).name === "Admin";
          } else if (!isNaN(Number(user.role))) {
            roleId = Number(user.role);
          }
        }

        // Ejecutar permisos y reporte de login en paralelo para mayor velocidad
        const promises: Promise<any>[] = [];
        
        // Promesa 1: Obtener permisos (solo si hay roleId y token)
        if (response.token && roleId) {
          promises.push(
            authService.getRolePermissions(roleId, response.token)
              .then(perms => setPermissions(perms))
              .catch(e => console.warn("Error obteniendo permisos:", e))
          );
        }

        // Promesa 2: Reportar login (de forma asíncrona)
        promises.push(
          (async () => {
            try {
              // Obtener IP pública de forma más rápida
              const ipPromise = fetch("https://api.ipify.org?format=json", { 
                signal: AbortSignal.timeout(2000) // 2 segundos timeout
              })
                .then(res => res.ok ? res.json() : { ip: "" })
                .then(data => data.ip || "")
                .catch(() => "");

              const ip = await ipPromise;
              
              // Determinar lat/lon si se recibieron coords
              let latitud = 0;
              let longitud = 0;
              if (coords) {
                latitud = coords.latitude;
                longitud = coords.longitude;
              }
              
              // Formatear fecha/hora a 'YYYY-MM-DD HH:mm:ss'
              const now = new Date();
              const pad = (n: number) => n.toString().padStart(2, '0');
              const fecha_hora_ingreso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
              
              await authService.reportLogin({
                email: username,
                fecha_hora_ingreso,
                ip,
                latitud,
                longitud,
              });
            } catch (e) {
              console.warn("No se pudo reportar el login:", e);
            }
          })()
        );

        // Ejecutar login inmediatamente sin esperar las operaciones secundarias
        if (typeof onLogin === "function") {
          onLogin();
        } else {
          console.error("onLogin no es una función válida");
          setError(t("login.errors.loginFailed"));
        }

        // Ejecutar promesas en paralelo sin bloquear el login
        Promise.allSettled(promises).then(() => {
          console.log("Operaciones post-login completadas");
        });
      } catch (error) {
        console.error("Error de autenticación:", error);

        if (error instanceof ApiError) {
          // Mostrar el mensaje de error de la API
          setError(error.message || t("login.errors.loginFailed"));
        } else {
          // Errores de conexión
          setError(t("login.errors.serverError"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (navigator.geolocation) {
      // Configurar timeout más corto para geolocalización
      const geoOptions = {
        timeout: 3000, // 3 segundos máximo
        enableHighAccuracy: false, // Más rápido pero menos preciso
        maximumAge: 300000 // Usar ubicación de hasta 5 minutos de antigüedad
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          doLogin({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (geoError) => {
          console.error("No se pudo obtener la ubicación:", geoError);
          doLogin(); // Login sin coordenadas si el usuario no da permiso
        },
        geoOptions
      );
    } else {
      doLogin(); // Login sin coordenadas si el navegador no soporta geolocalización
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${eqrBg})`,
      }}
    >
      {/* Selector de idioma en la esquina superior derecha - responsive */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <div className="scale-75 sm:scale-100">
          <LanguageSelector />
        </div>
      </div>
      <div className="w-full max-w-md px-4 sm:px-6">
        {/* Card del formulario */}
        <div
          className="bg-transparent backdrop-blur-sm rounded-lg shadow-lg p-6 sm:p-8 w-full border shadow-pink-100 mx-auto"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderColor: "#FADCE6",
            borderWidth: 1,
            borderStyle: "solid",
          }}
        >
          {/* Cabecera */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="my-2 sm:my-4 flex justify-center">
              <img src={eqrLogo} alt="EQR Logo" className="h-24 sm:h-32" />
            </div>
            <h3 className="text-xl sm:text-2xl font-medium text-pink-600">
              {t("login.title")}
            </h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
              {t("login.welcome")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Campo Usuario o Email */}
            <div>
              <input
                id="username"
                type="text"
                placeholder="Usuario o Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-3xl py-3 px-4 text-gray-700 bg-[#f9e7eb] focus:outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300"
              />
            </div>
            {/* Campo Contraseña */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("login.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-3xl py-3 px-4 text-gray-700 bg-[#f9e7eb] focus:outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 pr-10 password-input"
                autoComplete="current-password"
              />
              {/* Posicionado más a la izquierda para evitar superposición con el icono de limpiar campo del navegador */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  padding: "4px",
                }}
                aria-label={
                  showPassword
                    ? t("login.hidePassword")
                    : t("login.showPassword")
                }
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {/* Mensaje de error y de redirección */}
            {loginMessage && (
              <div className="text-red-500 text-sm font-medium">{t("notAuthenticated")}</div>
            )}
            {error && (
              <div className="text-red-500 text-sm font-medium">{error}</div>
            )}
            {/* Recordarme y Olvidé mi contraseña */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  {t("login.rememberMe")}
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-pink-500 hover:text-pink-600 focus:outline-none focus:ring focus:ring-pink-300"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>
            </div>
            {/* Botón de inicio de sesión */}
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 border-0 rounded-3xl text-sm font-medium text-white bg-[#e83e8c] hover:bg-pink-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#e83e8c" }}
                disabled={!username || !password || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("login.signingIn")}
                  </div>
                ) : (
                  t("login.signIn")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
