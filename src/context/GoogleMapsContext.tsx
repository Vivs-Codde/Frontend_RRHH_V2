/// <reference types="vite/client" />
import React, { createContext, useContext, useEffect, useState } from 'react';

// Crear el contexto
const GoogleMapsContext = createContext<{
  isLoaded: boolean;
  isError: boolean;
  errorMessage: string;
}>({
  isLoaded: false,
  isError: false,
  errorMessage: '',
});

// Hook personalizado para usar el contexto
export const useGoogleMaps = () => useContext(GoogleMapsContext);

// Variables globales para evitar cargas múltiples
let isLoading = false;
let isLoaded = false;

const loadGoogleMapsAPI = (): Promise<void> => {
  // Si ya está cargada o cargando, retornar promise resolved/pending
  if (isLoaded) return Promise.resolve();
  if (isLoading) {
    // Si ya está cargando, esperar hasta que termine
    return new Promise((resolve, reject) => {
      const checkLoaded = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      
      // Timeout después de 10 segundos
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!isLoaded) {
          reject(new Error('Timeout loading Google Maps API'));
        }
      }, 10000);
    });
  }

  isLoading = true;

  return new Promise<void>((resolve, reject) => {
    try {
      // Verificar si ya existe un script de Google Maps
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Si ya existe, verificar si está cargado
        if (window.google?.maps?.places) {
          isLoaded = true;
          isLoading = false;
          resolve();
          return;
        }
        
        // Si existe pero no está cargado, esperar
        const checkExisting = setInterval(() => {
          if (window.google?.maps?.places) {
            isLoaded = true;
            isLoading = false;
            clearInterval(checkExisting);
            resolve();
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkExisting);
          if (!isLoaded) {
            isLoading = false;
            reject(new Error('Existing script timeout'));
          }
        }, 10000);
        
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        isLoading = false;
        reject(new Error('No se encontró la clave API de Google Maps'));
        return;
      }

      // Función de callback global
      window.initGoogleMapsAPI = () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      };

      // Crear el script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAPI`;
      script.async = true;
      script.defer = true;
      
      script.onerror = (error) => {
        console.error('Error al cargar la API de Google Maps:', error);
        isLoading = false;
        reject(error);
      };

      // Añadir el script al DOM
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error al configurar la carga de Google Maps:', error);
      isLoading = false;
      reject(error);
    }
  });
};

// Declarar el tipo global
declare global {
  interface Window {
    google: any;
    initGoogleMapsAPI: () => void;
  }
}

// Proveedor del contexto
export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Verificar si ya está cargada
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Cargar la API de Google Maps
    loadGoogleMapsAPI()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Error al cargar Google Maps desde el proveedor:', error);
        setIsError(true);
        setErrorMessage('No se pudo cargar la API de Google Maps');
      });
  }, []);

  // Valor que se proveerá a los componentes que consuman este contexto
  const value = {
    isLoaded,
    isError,
    errorMessage,
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export default GoogleMapsProvider;
