import React, { useState, memo, useCallback, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import PlaceAutocomplete from "./PlaceAutocomplete";
import type { PlaceData } from "./PlaceAutocomplete";
import { useGoogleMaps } from "../context/GoogleMapsContext";

interface AddressSearchProps {
  onPlaceSelected: (placeData: PlaceData) => void;
  className?: string;
}

const AddressSearch = memo(
  forwardRef<HTMLInputElement, AddressSearchProps>(
    ({ onPlaceSelected, className = "" }, ref) => {
      const { t } = useTranslation();
      const [loading, setLoading] = useState(false);
      const [errorMessage, setErrorMessage] = useState("");
      const { isLoaded, isError, errorMessage: apiError } = useGoogleMaps();

      // Manejador personalizado para la selección de lugar - memoizado
      const handlePlaceSelected = useCallback(
        (placeData: PlaceData) => {
          setLoading(true);
          setErrorMessage("");
          try {
            // Pasar los datos al componente padre
            onPlaceSelected(placeData);

            // Mostrar un mensaje de éxito o alguna animación
            setTimeout(() => {
              setLoading(false);
            }, 600);
          } catch (error) {
            setErrorMessage(t('common.addressSearch.processingError'));
            setLoading(false);
          }
        },
        [onPlaceSelected, t]
      );

      if (isError) {
        return (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            Error: {apiError || t('common.addressSearch.error')}
          </div>
        );
      }

      if (!isLoaded) {
        return (
          <div className="p-3 bg-gray-100 text-gray-500 rounded-md flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-gray-500"
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
            {t('common.addressSearch.loading')}
          </div>
        );
      }

      return (
        <div className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <PlaceAutocomplete
              ref={ref}
              onPlaceSelected={handlePlaceSelected}
              className={`${className} pl-10 pr-10`}
              placeholder={t('common.addressSearch.placeholder')}
              name="direccion"
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-fuchsia-500"
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
              </div>
            )}
          </div>
          {errorMessage && (
            <div className="mt-1 text-xs text-red-500">{errorMessage} </div>
          )}
        </div>
      );
    }
  )
);

export default AddressSearch;
