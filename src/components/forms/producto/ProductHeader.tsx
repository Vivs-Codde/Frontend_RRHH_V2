import React, { useEffect, useState, useRef } from "react";
import type { ProductoFormData } from "../../../types/producto";

// Estilos para texto responsivo
const responsiveStyles = `
  /* Estilos para el texto responsivo */
  .responsive-product-name {
    /* Base styles */
    font-size: clamp(0.875rem, 3vw, 1.75rem);
  }
  
  /* En pantallas muy pequeñas */
  @media (max-width: 480px) {
    .responsive-product-name {
      font-size: clamp(0.75rem, 2.5vw, 1rem);
    }
  }
  
  /* En pantallas pequeñas */
  @media (min-width: 481px) and (max-width: 767px) {
    .responsive-product-name {
      font-size: clamp(0.875rem, 3vw, 1.25rem);
    }
  }
  
  /* En pantallas medianas */
  @media (min-width: 768px) and (max-width: 1023px) {
    .responsive-product-name {
      font-size: clamp(1rem, 3.5vw, 1.5rem);
    }
  }
  
  /* En pantallas grandes */
  @media (min-width: 1024px) {
    .responsive-product-name {
      font-size: clamp(1.25rem, 5vw, 1.75rem);
    }
  }
`;

interface ProductHeaderProps {
  formData: ProductoFormData;
  fieldErrors: { [key: string]: string };
  statusValue: boolean;
  setStatusValue: (value: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProductoFormData>>;
  loading: boolean;
  lang: string;
  resumenProducto: string;
  resumenBQT?: string;
  resumenCBS?: string;
  getResumenBQTVisual?: () => string;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  formData,
  fieldErrors,
  statusValue,
  setStatusValue,
  setFormData,
  loading,
  lang,
  resumenProducto,
  resumenBQT,
  resumenCBS,
  getResumenBQTVisual,
}) => {
  // Referencia al elemento contenedor para medir su tamaño
  const containerRef = useRef<HTMLDivElement>(null);
  // Estado para almacenar el tamaño del texto calculado
  const [textSize, setTextSize] = useState<string>("1rem");
  
  // Inyectar los estilos CSS en el documento
  useEffect(() => {
    // Crear un elemento style
    const style = document.createElement('style');
    style.innerHTML = responsiveStyles;
    style.id = 'responsive-product-name-styles';
    
    // Verificar si ya existe para evitar duplicados
    if (!document.getElementById('responsive-product-name-styles')) {
      document.head.appendChild(style);
    }
    
    // Limpieza al desmontar
    return () => {
      const existingStyle = document.getElementById('responsive-product-name-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
  
  // Función para adaptar el tamaño del texto basado en el ancho del contenedor
  useEffect(() => {
    // Función para calcular el tamaño de texto adecuado
    const calculateTextSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const textLength = (formData.categoria === "BQT" 
        ? (getResumenBQTVisual ? getResumenBQTVisual() : resumenBQT)
        : formData.categoria === "CBS"
          ? resumenCBS
          : resumenProducto)?.length || 0;
      
      // Algoritmo simple para adaptar el tamaño según el ancho y longitud del texto
      let fontSize = "1.75rem"; // Tamaño por defecto
      
      if (containerWidth < 300) {
        fontSize = "0.75rem"; // Muy pequeño
      } else if (containerWidth < 450) {
        fontSize = "0.875rem"; // Pequeño
      } else if (containerWidth < 600) {
        fontSize = "1rem"; // Mediano
      } else if (containerWidth < 768) {
        fontSize = "1.25rem"; // Grande
      } else {
        fontSize = "1.5rem"; // Muy grande
      }
      
      // Ajustar aún más según la longitud del texto
      if (textLength > 100) {
        fontSize = "0.75rem";
      } else if (textLength > 70) {
        fontSize = "0.875rem";
      } else if (textLength > 50) {
        fontSize = "1rem";
      }
      
      setTextSize(fontSize);
    };
    
    // Calcular inicialmente
    calculateTextSize();
    
    // Añadir listener para cuando cambie el tamaño de la ventana
    window.addEventListener('resize', calculateTextSize);
    
    // Limpiar al desmontar
    return () => {
      window.removeEventListener('resize', calculateTextSize);
    };
  }, [formData.categoria, resumenBQT, resumenCBS, resumenProducto, getResumenBQTVisual]);
  
  return (
    <div
      className="rounded-xl px-3 py-4 sm:p-6 border"
      style={{ borderColor: "#f9c2d7", background: "#fff" }}
    >
      {/* Primera fila: SKU (izquierda), Nombre (centro), Estado (derecha) - Mejor alineación */}
      <div className="flex flex-row items-center justify-between gap-2 mb-4 w-full">
        {/* SKU a la izquierda */}
        <div className="min-w-[180px] flex-0 text-left">
          <div
            className="text-lg sm:text-xl font-medium px-2 py-1"
            style={{
              color: "#cc3399",
              background: "transparent",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {lang === "en" ? "SKU" : "SKU"}: {formData.SKU || ""}
          </div>
          {fieldErrors["SKU"] && (
            <div className="text-red-500 text-xs mt-1">
              {fieldErrors["SKU"]}
            </div>
          )}
        </div>
        {/* Nombre del producto centrado y expandible */}
        <div className="flex-1 flex flex-col items-center justify-center px-2" ref={containerRef}>
          <div
            className="w-full px-3 py-3 sm:py-4 rounded-md focus:outline-none text-center break-words mobile-product-name smooth-transition responsive-product-name"
            style={{
              background: "transparent",
              color: fieldErrors["nombreProducto"] ? "#ef4444" : "#cc3399",
              border: "none",
              boxShadow: "none",
              fontWeight: "600",
              lineHeight: "1.3",
              minHeight: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: textSize, /* Usando el tamaño calculado dinámicamente */
              transition: "font-size 0.2s ease",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            <span title="Vista previa de la descripción" className="responsive-text">
              {formData.categoria === "BQT" 
                ? (getResumenBQTVisual ? getResumenBQTVisual() : resumenBQT)
                : formData.categoria === "CBS"
                  ? resumenCBS
                  : resumenProducto}
            </span>
          </div>
       
          {fieldErrors["nombreProducto"] && (
            <div className="text-red-500 text-xs mt-1 flex items-center justify-center gap-1 mobile-text-responsive">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {fieldErrors["nombreProducto"]}
            </div>
          )}
        </div>
        {/* Switch de estado a la derecha */}
        <div className="min-w-[180px] flex-0 flex items-center justify-end">
          <label className="relative inline-flex items-center cursor-pointer mobile-switch mobile-touch-target">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={statusValue}
              onChange={(e) => {
                const newValue = e.target.checked;
                setStatusValue(newValue);
                setFormData((prev) => ({
                  ...prev,
                  estado: newValue ? 1 : 0,
                }));
              }}
              disabled={loading}
            />
            <div
              className={`w-14 h-8 sm:w-12 sm:h-7 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer smooth-transition relative ${
                statusValue ? "bg-[#cc3399]" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-6 sm:h-6 bg-white rounded-full shadow-md smooth-transition absolute top-0.5 mobile-switch-circle ${
                  statusValue ? "switch-active" : "switch-inactive"
                }`}
              ></div>
            </div>
            <span
              className="ml-3 text-base sm:text-sm font-medium mobile-text-responsive"
              style={{ color: statusValue ? "#15803d" : "#6b7280" }}
            >
              {statusValue
                ? (lang === "en" ? "Active" : "Activo")
                : (lang === "en" ? "Inactive" : "Inactivo")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
