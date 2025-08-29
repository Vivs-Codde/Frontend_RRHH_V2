import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Tooltip from "./Tooltip";
import { GiFlowerPot } from "react-icons/gi";
import {
  FaGlobe,
  FaShoppingCart,
  FaTruck,
  FaSnowflake,
  FaMapMarkerAlt,
  FaUserTie,
  FaUser,
  FaUsers,
  FaTags,
  FaUsersCog,
  FaWarehouse,
  FaBox,
  FaUtensils,
  FaLayerGroup,
  FaCubes,
  FaTools,  
  FaDollarSign,
  FaListUl,
} from "react-icons/fa";
import { FaPallet } from "react-icons/fa";
import { MdAssignmentInd } from "react-icons/md";
import { CiReceipt } from "react-icons/ci";
import { FaBoxes } from "react-icons/fa";
import { FaMapPin } from "react-icons/fa";
const Sidebar: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => {
  const { t } = useTranslation();
  
  // Opciones principales del sidebar - usando i18n
  const menuItems = [
    {
      label: t('common.sidebar.clients'),
      icon: <FaUser />,
      type: "clientes",
      subItems: [
        { label: t('common.sidebar.client'), icon: <FaUser />, path: "/cliente-usuario" },
        { label: t('common.sidebar.locations'), icon: <FaMapMarkerAlt />, path: "/cliente/locations" },
        { label: t('common.sidebar.salesperson'), icon: <FaUserTie />, path: "/cliente/vendedor" },
        { label: t('common.sidebar.countries'), icon: <FaGlobe />, path: "/cliente/pais" },
        { label: t('common.sidebar.marcaciones'), icon: <FaMapPin  />, path: "/cliente/marcaciones" },
      ],
    },
    {
      label: t('common.sidebar.users'),
      icon: <FaUsers />,
      type: "usuarios",
      subItems: [
        { label: t('common.sidebar.user'), icon: <FaUser />, path: "/usuario" },
        { label: t('common.sidebar.roles'), icon: <FaUsersCog />, path: "/role-permissions" },
        { label: t('common.sidebar.tags'), icon: <FaTags />, path: "/reporte-login" },
      ],
    },
    { 
      label: t('common.sidebar.logistics'), 
      icon: <FaTruck />, 
      type: "logistica",
      subItems: [
        { label: t('common.sidebar.airlines'), icon: <FaGlobe />, path: "/logistica/lineas-aereas" },
        { label: t('common.sidebar.carriers'), icon: <FaTruck />, path: "/cliente/carguera" },
        { label: t('common.sidebar.cooler'), icon: <FaSnowflake />, path: "/cliente/cooler" },
        { label: t('common.sidebar.transporter'), icon: <FaTruck />, path: "/logistica/transportistas" },
        { label: t('common.sidebar.warehouses'), icon: <FaWarehouse />, path: "/logistica/bodegas" },
      ],
    },
    { 
      label: t('common.sidebar.products'), 
      icon: <FaBox />, 
      type: "productos",
      subItems: [
        { label: t('common.sidebar.vegetal'), icon: <GiFlowerPot />, path: "/productos/producto" },
        { label: t('common.sidebar.materiales'), icon: <FaTools />, path: "/productos/materiales" },
        { label: t('common.sidebar.paquetes'), icon: <FaBox />, path: "/productos/paquetes" },
        { label: t('common.sidebar.recipes'), icon: <CiReceipt />, path: "/productos/recetas" },
        { label: t('common.sidebar.categories'), icon: <FaLayerGroup />, path: "/productos/categorias" },
        { label: t('common.sidebar.boxes'), icon: <FaCubes />, path: "/productos/cajas" },
      ],
    },
    ////
    { 
      label: t('common.sidebar.asignaciones'), 
      icon: <MdAssignmentInd  />, 
      type: "asignaciones",
      subItems: [
        { label: t('common.sidebar.asignacioncp'), icon: <MdAssignmentInd  />, path: "/asignaciones/asignaciones" },
        { label: t('common.sidebar.asignacioncap'), icon: <FaBoxes />, path: "/cajas-productos" },
         { label: t('common.sidebar.pallet'), icon: <FaPallet />, path: "/palet-caja" },
      ],
    },
    ////
    {
      label: t('title_price'),
      icon: <FaDollarSign />,
      type: "precios",
      subItems: [
        { label: t('subtitle_price'), icon: <FaListUl />, path: "/precios" },
      ],
    }
  ];

  // Estado para el submenú desplegable - Inicializamos según la ruta actual
  const location = useLocation();
  const getInitialDropdown = () => {
    if (location.pathname.startsWith("/cliente")) return "clientes";
    if (location.pathname.startsWith("/logistica")) return "logistica";
    if (location.pathname.startsWith("/productos")) return "productos";
    if (location.pathname.startsWith("/asignaciones") || location.pathname === "/cajas-productos") return "asignaciones";
    if (location.pathname.startsWith("/precios")) return "precios";
    if (["/usuario", "/role-permissions", "/reporte-login"].includes(location.pathname)) return "usuarios";
    return "clientes";
  };
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(getInitialDropdown());
  // Estado para mostrar/ocultar la barra
  // ...ya inicializado arriba...
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = React.useState(() => {
    // El sidebar solo se muestra en rutas específicas, NO en dashboard por defecto
    return location.pathname.startsWith("/cliente") || 
      location.pathname.startsWith("/logistica") ||
      location.pathname.startsWith("/productos") ||
      location.pathname.startsWith("/asignaciones") ||
     
      location.pathname === "/usuario" ||
      location.pathname === "/role-permissions" ||
      location.pathname === "/reporte-login";
  });
  // Estado para controlar qué secciones del menú se muestran
  const [sidebarMode, setSidebarMode] = React.useState<"general" | "usuarios">("general");
  // Estado para el paso actual del wizard
  const [clienteWizardStep, setClienteWizardStep] = React.useState(0);
  const [usuarioWizardStep, setUsuarioWizardStep] = React.useState(0);
  const [logisticaWizardStep, setLogisticaWizardStep] = React.useState(0);
  const [productosWizardStep, setProductosWizardStep] = React.useState(0);
  const [asignacionesWizardStep, setAsignacionesWizardStep] = React.useState(0);
  const [preciosWizardStep, setPreciosWizardStep] = React.useState(0);

  // Set the appropriate wizard step based on pathname
  useEffect(() => {
    if (location.pathname === "/usuario") {
      setUsuarioWizardStep(0);
    } else if (location.pathname === "/role-permissions") {
      setUsuarioWizardStep(1);
    } else if (location.pathname === "/reporte-login") {
      setUsuarioWizardStep(2);
    }
  }, [location.pathname]);

  // Mostrar sidebar cuando se dispara el evento "show-clientes-sidebar"
  useEffect(() => {
    const handler = () => {
      setShowSidebar(true);
      setOpenDropdown("clientes");
      setSidebarMode("general"); // Mostramos el modo general que incluye clientes
    };
    window.addEventListener("show-clientes-sidebar", handler);
    return () => window.removeEventListener("show-clientes-sidebar", handler);
  }, []);

  // Mostrar sidebar de usuarios cuando se dispara el evento "show-usuarios-sidebar"
  useEffect(() => {
    const handler = () => {
      setShowSidebar(true);
      setOpenDropdown("usuarios");
      setSidebarMode("usuarios"); // Mostramos solo usuarios
      // Navegar automáticamente a la primera opción de usuarios
      setTimeout(() => {
        navigate("/usuario");
      }, 100);
    };
    window.addEventListener("show-usuarios-sidebar", handler);
    return () => window.removeEventListener("show-usuarios-sidebar", handler);
  }, [navigate]);

  // Mostrar sidebar general cuando se dispara el evento "show-general-sidebar"
  useEffect(() => {
    const handler = () => {
      // Forzamos una actualización inmediata
      setShowSidebar(true);
      setIsGeneralMode(true); // Marcamos que estamos en modo general
      setSidebarMode("general"); // Mostramos el modo general
      setOpenDropdown("clientes"); // Asegurar que clientes esté abierto
      
      // Navegar automáticamente a la primera opción de clientes
      // Usar setTimeout para asegurar que la navegación ocurre después de los cambios de estado
      setTimeout(() => {
        navigate("/cliente-usuario");
      }, 100);
      
      // En casos donde hay navegación, necesitamos forzar la actualización
      setTimeout(() => {
        // Este segundo llamado asegura que los estados se apliquen correctamente
        setShowSidebar(true);
        setIsGeneralMode(true);
        setSidebarMode("general");
      }, 150);
    };
    window.addEventListener("show-general-sidebar", handler);
    return () => window.removeEventListener("show-general-sidebar", handler);
  }, [navigate]);

  // Cerrar modo general cuando se presiona específicamente "Clientes" en el header
  useEffect(() => {
    const handler = () => {
      setOpenDropdown("clientes");
      setIsGeneralMode(false); // Salimos del modo general
      setSidebarMode("general"); // Mantener en modo general para mostrar clientes y ventas
    };
    window.addEventListener("close-general-mode", handler);
    return () => window.removeEventListener("close-general-mode", handler);
  }, []);

  // Mantener un estado para recordar si estamos en modo general
  const [isGeneralMode, setIsGeneralMode] = React.useState(false);

  // Mostrar sidebar según la ruta, pero respetando el modo general
  useEffect(() => {
    if (
      location.pathname.startsWith("/cliente") || 
      location.pathname.startsWith("/logistica") ||
      location.pathname.startsWith("/productos") ||
      location.pathname.startsWith("/asignaciones") ||
      location.pathname.startsWith("/precios") ||
      location.pathname.startsWith("/paquetes") ||
      location.pathname === "/cajas-productos" ||
      location.pathname === "/palet-caja"
    ) {
      setShowSidebar(true);
      setIsGeneralMode(false);
      setSidebarMode("general");

      // Set the appropriate dropdown based on the path
      if (location.pathname.startsWith("/cliente")) {
        // Check if it's a path that should be handled by the logistica menu
        if (location.pathname === "/cliente/carguera" || location.pathname === "/cliente/cooler") {
          setOpenDropdown("logistica");

          // Set the logistica wizard step based on the path
          if (location.pathname === "/cliente/carguera") {
            setLogisticaWizardStep(1);
          } else if (location.pathname === "/cliente/cooler") {
            setLogisticaWizardStep(2);
          }
        } else {
          // Normal cliente paths
          setOpenDropdown("clientes");
        }
      } else if (location.pathname.startsWith("/logistica")) {
        setOpenDropdown("logistica");

        // Set the logistica wizard step based on the path
        if (location.pathname === "/logistica/lineas-aereas") {
          setLogisticaWizardStep(0);
        } else if (location.pathname === "/logistica/transportistas") {
          setLogisticaWizardStep(3);
        } else if (location.pathname === "/logistica/bodegas") {
          setLogisticaWizardStep(4);
        }
      } else if (location.pathname.startsWith("/productos")) {
        setOpenDropdown("productos");

        // Set the productos wizard step based on the path
        if (location.pathname === "/productos/producto") {
          setProductosWizardStep(0);
        } else if (location.pathname === "/productos/materiales") {
          setProductosWizardStep(1);
        } else if (location.pathname === "/productos/paquetes") {
          setProductosWizardStep(2);
        } else if (location.pathname === "/productos/recetas") {
          setProductosWizardStep(3);
        } else if (location.pathname === "/productos/categorias") {
          setProductosWizardStep(4);
        } else if (location.pathname === "/productos/cajas") {
          setProductosWizardStep(5);
        }
        
      } else if (location.pathname.startsWith("/asignaciones")) {
        setOpenDropdown("asignaciones");
        // Si tienes más subitems en asignaciones, puedes manejar wizardStep aquí
        setAsignacionesWizardStep(0);
      } else if (location.pathname === "/cajas-productos") {
        setOpenDropdown("asignaciones");
        setAsignacionesWizardStep(1);
      } else if (location.pathname === "/palet-caja") {
        setOpenDropdown("asignaciones");
        setAsignacionesWizardStep(2);
      }
    } else if (
      location.pathname === "/usuario" ||
      location.pathname === "/role-permissions" ||
      location.pathname === "/reporte-login"
    ) {
      setShowSidebar(true);
      setIsGeneralMode(false);
      setSidebarMode("usuarios");
      setOpenDropdown("usuarios");
      
      // Set the appropriate dropdown based on the path
      if (location.pathname === "/usuario") {
        setUsuarioWizardStep(0);
      } else if (location.pathname === "/role-permissions") {
        setUsuarioWizardStep(1);
      } else if (location.pathname === "/reporte-login") {
        setUsuarioWizardStep(2);
      }
    } else if (location.pathname === "/dashboard") {
      if (isGeneralMode) {
        // Cuando estamos en dashboard con modo general, mostramos el sidebar de clientes
        setShowSidebar(true);
        setSidebarMode("general");
        setOpenDropdown("clientes");
      } else {
        // Si llegamos al dashboard normalmente, NO mostramos sidebar
        setShowSidebar(false);
      }
    } else if (!isGeneralMode) {
      // Solo ocultamos si NO estamos en modo general
      setShowSidebar(false);
    }
  }, [location.pathname, isGeneralMode]);

  if (!showSidebar) return null;

  // Filtrar los elementos del menú según el modo
  const filteredMenuItems = menuItems.filter(item => {
    if (sidebarMode === "general") {
      return item.type !== "usuarios"; // En modo general mostramos todo excepto usuarios
    } else if (sidebarMode === "usuarios") {
      return item.type === "usuarios"; // En modo usuarios solo mostramos usuarios
    }
    return true;
  });

  // Obtener los subitems basados en el dropdown abierto
  const clientesSubItems = menuItems[0].subItems || [];
  const usuariosSubItems = menuItems[1].subItems || [];
  const logisticaSubItems = menuItems[2].subItems || [];
  const productosSubItems = menuItems[3].subItems || [];
  const asignacionesSubItems = menuItems[4].subItems || [];
  const preciosSubItems = menuItems[5].subItems || [];

  // Función para manejar el toggle de los dropdowns
  const toggleDropdown = (type: string) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  return (
    <aside
      className={`flex flex-col h-full bg-white text-[#cc3399] shadow-lg transition-all duration-300 font-sans
        w-12 min-w-[3rem] md:w-44 md:min-w-[11rem]`}
      style={{}}
    >
      <nav className="flex-1 overflow-y-auto mt-6 flex flex-col items-center scrollbar-thin scrollbar-thumb-[#cc3399]/30 scrollbar-track-transparent">
        <ul className="flex flex-col gap-0 items-center">
          {filteredMenuItems.map((item, idx) => (
            <li
              key={item.label}
              className="flex flex-col items-center relative p-0 m-0 w-full"
            >
              {/* Item principal */}
              <div
                className="flex flex-row items-center relative p-0 m-0 w-full"
                style={{ minHeight: "44px" }}
              >
                <div
                  className="flex flex-col items-center justify-center relative p-0 m-0"
                  style={{
                    width: "44px",
                    minWidth: "44px",
                    maxWidth: "44px",
                  }}
                >
                  <div className="relative flex items-center justify-center p-0 m-0">
                    <Tooltip text={typeof item.label === 'string' ? item.label : ''}>
                      {item.subItems ? (
                        <button
                          onClick={() => toggleDropdown(item.type)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-4 transition-all duration-200
                            ${
                              openDropdown === item.type
                                ? "border-[#FFB400] bg-white text-[#FFB400]"
                                : "border-white bg-[#cc3399] text-white"
                            }
                            shadow-lg text-2xl focus:outline-none z-10`}
                          style={{
                            textDecoration: "none",
                            transition: "color 0.2s",
                            color:
                              openDropdown === item.type ? "#FFB400" : "#fff",
                            background:
                              openDropdown === item.type ? "#fff" : "#cc3399",
                            borderColor:
                              openDropdown === item.type ? "#FFB400" : "#fff",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "2.5rem",
                            height: "2.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1.2rem",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "inherit",
                            }}
                          >
                            {item.icon}
                          </span>
                        </button>
                      ) : (
                        <Link
                          to={"#"}
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-4 transition-all duration-200
                            border-white bg-[#cc3399] text-white
                            shadow-lg text-2xl focus:outline-none z-10`}
                          style={{
                            textDecoration: "none",
                            transition: "color 0.2s",
                            color: "#fff",
                            background: "#cc3399",
                            borderColor: "#fff",
                          }}
                        >
                          {item.icon}
                        </Link>
                      )}
                    </Tooltip>
                  </div>
                </div>
                {/* Texto del item principal */}
                <span
                  className={`ml-3 text-sm font-semibold whitespace-nowrap ${
                    item.subItems && openDropdown === item.type
                      ? "text-[#FFB400]"
                      : "text-[#cc3399]"
                  } hidden md:inline`}
                >
                  {item.label}
                </span>
              </div>

              {/* Subitems - Solo se muestran cuando está expandido */}
              {item.subItems && openDropdown === item.type && (
                <div className="flex flex-col gap-4 mt-4 w-full pl-2 md:pl-6">
                  {(item.type === "clientes" ? clientesSubItems : 
                    item.type === "usuarios" ? usuariosSubItems : 
                    item.type === "logistica" ? logisticaSubItems : 
                    item.type === "productos" ? productosSubItems : 
                    item.type === "asignaciones" ? asignacionesSubItems :
                    item.type === "precios" ? preciosSubItems :
                    []).map((subItem, subIdx) => {
                    const currentStep = 
                      item.type === "clientes" ? clienteWizardStep :
                      item.type === "usuarios" ? usuarioWizardStep :
                      item.type === "logistica" ? logisticaWizardStep :
                      item.type === "productos" ? productosWizardStep :
                      item.type === "asignaciones" ? asignacionesWizardStep :
                      item.type === "precios" ? preciosWizardStep : 0;

                    const setStep =
                      item.type === "clientes" ? setClienteWizardStep :
                      item.type === "usuarios" ? setUsuarioWizardStep :
                      item.type === "logistica" ? setLogisticaWizardStep :
                      item.type === "productos" ? setProductosWizardStep :
                      item.type === "asignaciones" ? setAsignacionesWizardStep :
                      item.type === "precios" ? setPreciosWizardStep : () => {};
                    return (
                      <div
                        key={subItem.label}
                        className="flex flex-row items-center relative p-0 m-0"
                        style={{ minHeight: "44px", width: "100%" }}
                      >
                        <div
                          className="flex flex-col items-center justify-center relative p-0 m-0"
                          style={{
                            width: "44px",
                            minWidth: "44px",
                            maxWidth: "44px",
                          }}
                        >
                          <div className="relative flex items-center justify-center p-0 m-0">
                            <Tooltip text={typeof subItem.label === 'string' ? subItem.label : ''}>
                              <Link
                                to={subItem.path}
                                onClick={() => setStep(subIdx)}
                                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                                  ${
                                    currentStep === subIdx
                                      ? "border-[#FFB400] bg-[#FFB400] text-white"
                                      : currentStep > subIdx
                                      ? "border-[#FFB400] bg-[#FFB400] text-white"
                                      : "border-[#cc3399] bg-white text-[#cc3399]"
                                  }
                                  shadow-lg text-lg focus:outline-none z-10`}
                                style={{
                                  textDecoration: "none",
                                  transition: "color 0.2s",
                                  color:
                                    currentStep === subIdx || currentStep > subIdx
                                      ? "#fff"
                                      : "#cc3399",
                                  background:
                                    currentStep === subIdx || currentStep > subIdx
                                      ? "#FFB400"
                                      : "#fff",
                                  borderColor:
                                    currentStep === subIdx || currentStep > subIdx
                                      ? "#FFB400"
                                      : "#cc3399",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.9rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "inherit",
                                  }}
                                >
                                  {subItem.icon}
                                </span>
                              </Link>
                            </Tooltip>
                            {/* Línea vertical para subitems */}
                            {subIdx < (
                              item.type === "clientes" ? clientesSubItems.length :
                              item.type === "usuarios" ? usuariosSubItems.length :
                              item.type === "logistica" ? logisticaSubItems.length :
                              item.type === "productos" ? productosSubItems.length :
                              item.type === "asignaciones" ? asignacionesSubItems.length :
                              item.type === "precios" ? preciosSubItems.length : 0
                            ) - 1 && (
                              <div
                                className={`absolute left-1/2 top-full -translate-x-1/2 w-0.5`}
                                style={{
                                  height: "44px",
                                  background: currentStep > subIdx ? "#FFB400" : "#cc3399",
                                  zIndex: 0,
                                  marginTop: "0px",
                                }}
                              ></div>
                            )}
                          </div>
                        </div>
                        {/* Texto del subitem */}
                        <span
                          className={`ml-3 text-xs font-medium whitespace-nowrap ${
                            currentStep === subIdx
                              ? "text-[#FFB400]"
                              : "text-[#cc3399]"
                          } hidden md:inline`}
                        >
                          {subItem.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
      {/* Footer */}
      <div
        className={`p-4 mt-auto${collapsed ? " flex justify-center" : ""}`}
      ></div>
    </aside>
  );
};

export default Sidebar;
