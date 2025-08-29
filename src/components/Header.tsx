import React, { useState, useEffect } from "react";
import { getRecetas } from "../services/recetasService";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import { authService } from "../services";
import { isAdmin } from "../utils/isAdmin";
import profileImage from "../assets/perfil.png";
import eqrLogo from "../assets/logoblanco.png";
interface HeaderProps {
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}
const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectValue, setSelectValue] = useState("");
  const [notificaciones, setNotificaciones] = useState({ pendientes: 0, cancelados: 0 });
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();
  // Helper to dispatch event and wait for sidebar-ready before navigating
  const dispatchAndNavigate = async (eventName: string, path: string) => {
    return new Promise<void>((resolve) => {
      const handler = () => {
        window.removeEventListener("sidebar-ready", handler);
        resolve();
      };
      window.addEventListener("sidebar-ready", handler);
      window.dispatchEvent(new Event(eventName));
    }).then(() => {
      navigate(path);
    });
  } 

  const clienteOptions = [
    { value: "usuarios", label: t("header.users") },
    { value: "config-general", label: t("header.general") },
  ];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectValue("");
    if (value === "usuarios") {
      window.dispatchEvent(new Event("close-general-mode"));
      dispatchAndNavigate("show-usuarios-sidebar", "/usuario");
    } else if (value === "config-general") {
      dispatchAndNavigate("show-general-sidebar", "/dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("isAuthenticated");
      if (onLogout) onLogout();
      navigate("/login");
    } catch (error) {
      if (onLogout) onLogout();
      navigate("/login");
    }
  };

  const linkStyle = {
    transition: "color 0.2s",
    color: "white",
  };

  const linkHoverHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
      (e.currentTarget.style.color = "#FFB400"),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) =>
      (e.currentTarget.style.color = "white"),
    onFocus: (e: React.FocusEvent<HTMLElement>) =>
      (e.currentTarget.style.color = "#FFB400"),
    onBlur: (e: React.FocusEvent<HTMLElement>) =>
      (e.currentTarget.style.color = "white"),
  };

  useEffect(() => {
    const userData = authService.getUserData();
    if (userData) setCurrentUser(userData);
    // Consultar pendientes y rechazados al backend
    const fetchNotificaciones = async () => {
      try {
        const res = await getRecetas({ estadoProceso: "pendiente,rechazado", per_page: 100 });
        let pendientes = 0;
        let cancelados = 0;
        if (Array.isArray(res.data)) {
          pendientes = res.data.filter(r => r.estadoProceso === "pendiente").length;
          cancelados = res.data.filter(r => r.estadoProceso === "rechazado").length;
        }
        setNotificaciones({ pendientes, cancelados });
      } catch {
        setNotificaciones({ pendientes: 0, cancelados: 0 });
        
      }
    };
    fetchNotificaciones();
    // Escuchar cambios cada 2 segundos (puedes mejorar con eventos personalizados)
    const interval = setInterval(fetchNotificaciones, 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <header className="bg-[#cc3399] shadow-md w-full relative" style={{ minWidth: 0 }}>
      <div
        className="px-2 sm:px-4 flex items-center justify-between h-auto min-h-[56px] w-full"
        style={{ minWidth: 0 }}
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          <img src={eqrLogo} alt="Logo" className="h-8 w-auto sm:h-10" />

          {/* Menú desktop con opciones en horizontal */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-white font-semibold text-base"
                style={{
                  transition: "color 0.2s",
                  color: "white",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFB400")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                {t("header.dashboard")}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFB400] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </Link>
            </div>
               <div className="relative group">
              <Link
                to="/ventas"
                className="px-4 py-2 text-white font-semibold text-base"
                style={{
                  transition: "color 0.2s",
                  color: "white",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFB400")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                {t("header.ventas")}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFB400] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </Link>
            </div>

            {/* Menú desplegable estilo hover */}
            <div className="relative group">
              {/* Configuraciones */}
              <div
                className="px-4 py-2 text-white font-semibold text-base cursor-pointer flex items-center"
                style={{
                  transition: "color 0.2s",
                  color: "white",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFB400")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                {t("header.config")}
                <svg
                  className="ml-1 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFB400] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
              {/* Dropdown menu */}
              <div className="absolute left-0 mt-0 w-48 bg-white rounded-b-lg shadow-lg z-50 invisible group-hover:visible transition-all duration-300 origin-top">
                {clienteOptions.map((opt) => (
                  <div
                    key={opt.value}
                    className="px-4 py-2 text-sm text-[#333] hover:bg-[#f3f4f6] hover:text-[#cc3399] cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectValue("");
                      if (opt.value === "usuarios") {
                        window.dispatchEvent(new Event("close-general-mode"));
                        dispatchAndNavigate("show-usuarios-sidebar", "/usuario");
                      } else if (opt.value === "config-general") {
                        dispatchAndNavigate("show-general-sidebar", "/dashboard");
                      }
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
            {/* Cotizador como botón independiente */}
            <Link
              to="/cotizador"
              className="px-4 py-2 text-white font-semibold text-base ml-2"
              style={{
                transition: "color 0.2s",
                color: "white",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFB400")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
            >
              {t("header.cotizador")}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFB400] scale-x-0 hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            <Link
              to="/reporte"
              className="px-4 py-2 text-white font-semibold text-base ml-2"
              style={{
                transition: "color 0.2s",
                color: "white",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFB400")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
            >
              {t("header.reporte")}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFB400] scale-x-0 hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
          </div>
        </div>

        {/* Hamburguesa móvil */}
        <button
          className="md:hidden p-2 rounded focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ background: "#cc3399", border: "2px solid #cc3399" }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="#FFB400"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Perfil y selector idioma */}
        <div className="flex items-center gap-2">
          <LanguageSelector />
          {/* Icono de notificaciones */}
          <div className="relative mr-2">
            <button
              className="p-2 rounded-full bg-white border border-[#cc3399] hover:bg-[#FFB400] hover:text-white transition-colors"
              style={{ position: "relative",backgroundColor: "#fff", color: "#cc3399" }}
              onClick={() => setShowNotifMenu((prev) => !prev)}
              aria-label="Notificaciones"
            >
              {/* Icono campana */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#cc3399]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Badge de cantidad */}
              {(notificaciones.pendientes > 0 || notificaciones.cancelados > 0) && (
                <span className="absolute -top-1 -right-1 bg-[#FFB400] text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {notificaciones.pendientes + notificaciones.cancelados}
                </span>
              )}
            </button>
            {/* Menú de notificaciones */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#cc3399] rounded-lg shadow-lg z-50 p-4">
                <div className="font-semibold text-[#cc3399] mb-2">{t("title_notification")}</div>
                <div className="flex items-center justify-between mb-1">
                  <span>{t("pendientes")}:</span>
                  <span className="font-bold text-[#FFB400]">{notificaciones.pendientes}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span>{t("cancelados")}:</span>
                  <span className="font-bold text-red-500">{notificaciones.cancelados}</span>
                </div>
                <button
                  className="mt-2 w-full py-1 px-2 bg-[#cc3399] text-white rounded hover:bg-[#FFB400] transition-colors"
                  style={{backgroundColor: "#cc3399", color: "#fff"}}
                  onClick={() => setShowNotifMenu(false)}
                >{t("close")}</button>
              </div>
            )}
          </div>
          {/* Menú de perfil restaurado */}
          <Menu as="div" className="relative">
            <MenuButton
              className="py-0.5 px-3 rounded-lg flex items-center gap-2"
              style={{
                color: "#333",
                background: "#ffffff",
                transition: "color 0.2s, background 0.2s",
                width: "100%",
                maxWidth: "280px",
                border: "none",
                boxShadow: "none",
                height: "36px",
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <img
                    className="h-6 w-6 rounded-full"
                    src={currentUser?.imagen || profileImage}
                    style={{ objectFit: "cover" }}
                  />
                  <span className="text-[#333] font-medium truncate text-sm">
                    {currentUser?.name || t("common.profile")}
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-[#333]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </MenuButton>

            <MenuItems
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 focus:outline-none"
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
              }}
            >
              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/gestionar-cuenta"
                    className="flex items-center px-4 py-2 text-sm"
                    style={{
                      color: active ? "#cc3399" : "#333",
                      background: active ? "#f3f4f6" : "transparent",
                      transition: "color 0.2s, background 0.2s",
                    }}
                  >
                    {t("header.manageAccount")}
                  </Link>
                )}
              </MenuItem>

              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/perfil"
                    className="flex items-center px-4 py-2 text-sm"
                    style={{
                      color: active ? "#cc3399" : "#333",
                      background: active ? "#f3f4f6" : "transparent",
                      transition: "color 0.2s, background 0.2s",
                    }}
                  >
                    {t("common.profile")}
                  </Link>
                )}
              </MenuItem>

              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-left"
                    style={{
                      color: active ? "#cc3399" : "#333",
                      background: active ? "#f3f4f6" : "transparent",
                      border: "none",
                      transition: "color 0.2s, background 0.2s",
                    }}
                  >
                    {t("header.logout")}
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full z-50 w-full" style={{ pointerEvents: 'auto' }}>
          <div className="bg-white border border-[#cc3399] rounded-b-xl shadow-lg mt-1 px-4 py-3 space-y-2 w-full max-w-xs mx-auto" style={{ minWidth: 220 }}>
            <Link
              to="/dashboard"
              className="block w-full text-center px-4 py-2 font-semibold text-[#cc3399] bg-white rounded-lg shadow-sm border border-[#cc3399] hover:bg-[#FFB400] hover:text-white transition-colors duration-150"
              style={{ fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("header.dashboard")}
            </Link>
            {clienteOptions.map((opt) => (
              <button
                key={opt.value}
                className="block w-full text-center px-4 py-2 font-semibold text-[#cc3399] bg-white rounded-lg shadow-sm border border-[#cc3399] hover:bg-[#FFB400] hover:text-white transition-colors duration-150 focus:outline-none"
                style={{
                  fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif',
                  backgroundColor: '#fff',
                  color: '#cc3399',
                  borderColor: '#cc3399',
                  boxShadow: '0 1px 4px 0 rgba(204,51,153,0.05)',
                }}
                onClick={() => {
                  setSelectValue("");
                  setIsMenuOpen(false);
                  if (opt.value === "usuarios") {
                    window.dispatchEvent(new Event("close-general-mode"));
                    dispatchAndNavigate("show-usuarios-sidebar", "/usuario");
                  } else if (opt.value === "config-general") {
                    dispatchAndNavigate("show-general-sidebar", "/dashboard");
                  }
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
