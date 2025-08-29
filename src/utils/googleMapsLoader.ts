// Este archivo carga la API de Google Maps de forma global
// Para que esté disponible en toda la aplicación

let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsAPI = () => {
  // Si ya está cargada o cargando, no hacemos nada
  if (isLoaded || isLoading) {
    return Promise.resolve();
  }

  isLoading = true;

  return new Promise<void>((resolve, reject) => {
    try {
      // Obtener la clave API del entorno
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('No se encontró la clave API de Google Maps');
        reject(new Error('No se encontró la clave API de Google Maps'));
        return;
      }

      // Función de callback para cuando la API esté cargada
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

export const isGoogleMapsLoaded = () => isLoaded;
