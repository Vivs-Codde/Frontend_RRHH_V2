import { useEffect, useRef, useState, useCallback, memo, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface PlaceAutocompleteProps {
  onPlaceSelected: (placeData: PlaceData) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export interface PlaceData {
  direccion: string;
  pais: string;
  provincia: string;
  ciudad: string;
  zipcode: string;
  latitud: string;
  longitud: string;
}

const PlaceAutocomplete = memo(forwardRef<HTMLInputElement, PlaceAutocompleteProps>(({
  onPlaceSelected,
  placeholder,
  className = "",
  name = "direccion"
}, forwardedRef) => {
  const { t } = useTranslation();
  const autocompleteRef = useRef<any>(null);
  const listenerRef = useRef<any>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Use translation for default placeholder
  const defaultPlaceholder = placeholder || t('common.placeAutocomplete.placeholder');

  // Stable callback to avoid re-initializing autocomplete on every render
  const stableOnPlaceSelected = useCallback((placeData: PlaceData) => {
    onPlaceSelected(placeData);
  }, [onPlaceSelected]);
  useEffect(() => {
    // Esperar a que google esté disponible
    if (!forwardedRef || typeof forwardedRef === 'function' || !forwardedRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
     
      return;
    }

    // Solo inicializar si no existe ya
    if (autocompleteRef.current) {
      return;
    }

    try {
     
      
      // Inicializar el autocompletado
      autocompleteRef.current = new window.google.maps.places.Autocomplete(forwardedRef.current, {
        types: ['address'],
        fields: ['address_component', 'geometry', 'formatted_address']
      });

      // Eliminar restricciones de país si existen para permitir búsquedas globales
      autocompleteRef.current.setComponentRestrictions({ country: [] });

      // Manejar el evento de selección de lugar
      listenerRef.current = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (!place || !place.address_components) {
          console.error('No se pudo obtener información del lugar');
          return;
        }

        // Extraer componentes de la dirección
        let pais = '';
        let provincia = '';
        let ciudad = '';
        let zipcode = '';
        let direccion = place.formatted_address || '';
        
        // Latitud y longitud
        const latitud = place.geometry?.location?.lat().toString() || '';
        const longitud = place.geometry?.location?.lng().toString() || '';

        // Extraer los componentes de la dirección
        place.address_components.forEach(component => {
          const types = component.types;

          if (types.includes('country')) {
            pais = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            provincia = component.long_name;
          } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            ciudad = component.long_name;
          } else if (types.includes('postal_code')) {
            zipcode = component.long_name;
          }
        });

        // Enviar los datos extraídos al componente padre usando callback estable
        stableOnPlaceSelected({
          direccion,
          pais,
          provincia,
          ciudad,
          zipcode,
          latitud,
          longitud
        });
      });

      // Retornar una función de limpieza
      return () => {
        if (listenerRef.current && window.google && window.google.maps) {
          window.google.maps.event.removeListener(listenerRef.current);
          listenerRef.current = null;
        }
        if (autocompleteRef.current) {
          autocompleteRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error al inicializar el autocompletado de Google Maps:", error);
    }
  }, [stableOnPlaceSelected]);

  // Separate effect for updating the callback without re-initializing autocomplete
  useEffect(() => {
    if (autocompleteRef.current && listenerRef.current && window.google) {
      // Remove old listener
      window.google.maps.event.removeListener(listenerRef.current);
      
      // Add new listener with updated callback
      listenerRef.current = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (!place || !place.address_components) {
          console.error('No se pudo obtener información del lugar');
          return;
        }

        // Extraer componentes de la dirección
        let pais = '';
        let provincia = '';
        let ciudad = '';
        let zipcode = '';
        let direccion = place.formatted_address || '';
        
        // Latitud y longitud
        const latitud = place.geometry?.location?.lat().toString() || '';
        const longitud = place.geometry?.location?.lng().toString() || '';

        // Extraer los componentes de la dirección
        place.address_components.forEach(component => {
          const types = component.types;

          if (types.includes('country')) {
            pais = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            provincia = component.long_name;
          } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            ciudad = component.long_name;
          } else if (types.includes('postal_code')) {
            zipcode = component.long_name;
          }
        });

        // Enviar los datos extraídos al componente padre
        stableOnPlaceSelected({
          direccion,
          pais,
          provincia,
          ciudad,
          zipcode,
          latitud,
          longitud
        });
      });
    }
  }, [stableOnPlaceSelected]);
  // Ajustamos el input para que acepte cambios locales
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // No necesitamos hacer nada aquí ya que no usamos estado controlado
  };

  // Manejo de focus para ayudar a activar el autocompletado
  const handleFocus = () => {
    setIsFocused(true);    // Forzar a Google Maps a reconocer el input
    if (forwardedRef && typeof forwardedRef !== 'function' && forwardedRef.current && autocompleteRef.current && window.google) {
      window.google.maps.event.trigger(autocompleteRef.current, 'focus', {});
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Manejar teclas especiales para mejorar la experiencia
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si se presiona Esc, limpiar el foco
    if (e.key === 'Escape') {
      if (forwardedRef && typeof forwardedRef !== 'function' && forwardedRef.current) {
        forwardedRef.current.blur();
      }
    }
  };
  return (
    <input
      ref={forwardedRef}
      type="text"
      name={name}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} ${isFocused ? 'ring-2 ring-fuchsia-300 border-fuchsia-300' : ''}`}
      placeholder={defaultPlaceholder}
      autoComplete="off" // Deshabilitar el autocompletado del navegador para no interferir con el de Google
      aria-label={t('common.placeAutocomplete.ariaLabel')}
    />
  );
}));

export default PlaceAutocomplete;
