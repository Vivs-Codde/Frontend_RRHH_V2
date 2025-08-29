import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsAPI: () => void;
  }
}

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { t } = useTranslation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;  useEffect(() => {
    // Solo cargar si no está ya cargado
    if (window.google?.maps?.places) {
      
      setIsLoaded(true);
      return;
    }

    // Verificar si ya existe un script de Google Maps para evitar duplicados
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
     
      // Si el script ya existe, esperar a que se cargue
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      
      // Timeout después de 10 segundos
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!window.google?.maps?.places) {
          console.error("Timeout esperando Google Maps API");
          setIsError(true);
        }
      }, 10000);
      
      return;
    }

    window.initGoogleMapsAPI = () => {
      
      setIsLoaded(true);
    };

    const handleScriptError = () => {
      console.error("Error al cargar la API de Google Maps");
      setIsError(true);
    };

    try {
      // Crear y cargar el script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAPI`;
      script.async = true;
      script.defer = true;
      script.onerror = handleScriptError;
      document.head.appendChild(script);

      return () => {
        // Eliminar el script y la función global cuando el componente se desmonte
        // @ts-ignore
        window.initGoogleMapsAPI = null;
        if (script.parentNode) {
          document.head.removeChild(script);
        }
      };
    } catch (error) {
      console.error("Error al configurar Google Maps:", error);
      setIsError(true);
    }
  }, [apiKey]);
  if (isError) {
    return (
      <div className="p-3 bg-red-100 text-red-700 rounded-md">
        {t('common.googleMaps.error')}
      </div>
    );
  }

  return (
    <>
      {isLoaded ? (
        children
      ) : (
        <div className="p-3 bg-gray-100 text-gray-500 rounded-md flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('common.googleMaps.loading')}
        </div>
      )}
    </>
  );
};

export default GoogleMapsLoader;
