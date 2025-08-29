import React from 'react';
import type { CajaProducto } from '../../types/ventas';

interface InfoCajasProductoProps {
  cajasProducto: CajaProducto[];
  loading: boolean;
  error: string | null;
}

const InfoCajasProducto: React.FC<InfoCajasProductoProps> = ({
  cajasProducto,
  loading,
  error
}) => {
  console.log("InfoCajasProducto - cajasProducto:", cajasProducto);
  
  if (loading) {
    return <div className="mt-2 text-sm text-gray-500 p-2 bg-gray-100 rounded-md border border-gray-200">
      <div className="flex items-center">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#cc3399]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Cargando información de cajas...
      </div>
    </div>;
  }

  if (error) {
    return <div className="mt-2 text-sm text-red-500 p-2 bg-red-50 rounded-md border border-red-200">
      <div className="font-medium">Error al cargar las cajas:</div>
      <div>{error}</div>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 bg-white border border-red-300 text-red-600 px-2 py-1 rounded-md text-xs hover:bg-red-50"
      >
        Reintentar
      </button>
    </div>;
  }

  if (!cajasProducto || !Array.isArray(cajasProducto) || !cajasProducto.length) {
    return <div className="mt-2 text-sm text-amber-600 p-2 bg-amber-50 rounded-md border border-amber-200">
      No hay cajas disponibles para este producto
    </div>;
  }

  return (
    <div className="mt-2 border border-gray-200 rounded-md p-3 bg-gray-50">
      <div className="space-y-2">
        {cajasProducto.map((cajaProducto) => (
          <div 
            key={cajaProducto.caja_id} 
            className="bg-white p-2 rounded border border-gray-200 shadow-sm"
          >
            <div className="font-medium">{cajaProducto.caja?.nombre || "Caja sin nombre"}</div>
            <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-600 mt-1">
              <div className="caja-info-cantidad">
                <span className="font-medium">Cantidad:</span> {cajaProducto.cantidad}
              </div>
              <div>
                <span className="font-medium">Peso:</span> {cajaProducto.caja?.peso || "N/A"} {cajaProducto.caja?.peso ? "kg" : ""}
              </div>
              <div>
                <span className="font-medium">Dimensiones:</span> {cajaProducto.caja?.largo || "N/A"}
                {cajaProducto.caja?.ancho && cajaProducto.caja?.largo ? "×" : ""}
                {cajaProducto.caja?.ancho || ""}
                {cajaProducto.caja?.profundidad && cajaProducto.caja?.ancho ? "×" : ""}
                {cajaProducto.caja?.profundidad || ""} 
                {cajaProducto.caja?.largo ? "cm" : ""}
              </div>
              <div>
                <span className="font-medium">Equivalencia:</span> {cajaProducto.caja?.equivalencia || "N/A"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCajasProducto;
