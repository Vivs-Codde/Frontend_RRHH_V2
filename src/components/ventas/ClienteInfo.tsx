import React, { useState } from 'react';
import type { Cliente, Marcacion } from '../../types/ventas';
import { ChevronDown, MapPin, User, Building } from 'lucide-react';
import Select from 'react-select';

interface ClienteInfoProps {
  cliente: Cliente | null;
  mostrarDetalleCliente: boolean;
  setMostrarDetalleCliente: (mostrar: boolean) => void;
  marcaciones?: Marcacion[];
  marcacionSeleccionada?: Marcacion | null;
  marcacionesOptions?: any[];
  handleMarcacionChange?: (marcacion: Marcacion | null) => void;
  totalMarcaciones?: number;
}

const ClienteInfo: React.FC<ClienteInfoProps> = ({ 
  cliente, 
  mostrarDetalleCliente, 
  setMostrarDetalleCliente,
  marcaciones = [],
  marcacionSeleccionada,
  marcacionesOptions = [],
  handleMarcacionChange,
  totalMarcaciones = 0
}) => {
  const [mostrarMarcacion, setMostrarMarcacion] = useState<boolean>(true);
  
  if (!cliente) return null;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
      {/* Encabezados en la misma fila */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Título de Información del Cliente */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setMostrarDetalleCliente(!mostrarDetalleCliente)}
        >
          <h3 className="font-semibold text-gray-800">
            <span className="flex items-center gap-2">
              <User size={18} color="#cc3399" />
              Información del Cliente
            </span>
          </h3>
          <ChevronDown 
            size={18} 
            className={`transform transition-transform ${mostrarDetalleCliente ? 'rotate-180' : ''}`} 
          />
        </div>
        
        {/* Título de Marcaciones en la misma fila */}
        {totalMarcaciones > 0 && (
          <div 
            className="flex items-center gap-2 cursor-pointer border-l border-gray-200 pl-4"
            onClick={() => setMostrarMarcacion(!mostrarMarcacion)}
          >
            <h4 className="font-semibold text-gray-800">
              <span className="flex items-center gap-2">
                <MapPin size={16} color="#cc3399" />
                Marcaciones ({totalMarcaciones})
              </span>
            </h4>
            <ChevronDown 
              size={16} 
              className={`transform transition-transform ${mostrarMarcacion ? 'rotate-180' : ''}`} 
            />
          </div>
        )}
      </div>
      
      {/* Contenido de la sección de cliente */}
      {mostrarDetalleCliente && (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm text-left">
            <div>
              <span className="font-medium">Código:</span>{" "}
              {cliente.codcustomer || "-"}
            </div>
            <div>
              <span className="font-medium">Contacto:</span>{" "}
              {cliente.contacto || "-"}
            </div>
            <div>
              <span className="font-medium">Email:</span>{" "}
              {cliente.email || "-"}
            </div>
            <div>
              <span className="font-medium">Teléfono:</span>{" "}
              {cliente.telefono || "-"}
            </div>
            <div>
              <span className="font-medium">Vendedor:</span>{" "}
              {/* Primera opción: Vendedor de las marcaciones */}
              {marcaciones && marcaciones.length > 0 && marcaciones[0]?.cliente?.vendedor?.nombre 
                ? marcaciones[0]?.cliente?.vendedor?.nombre
                /* Segunda opción: Vendedor del propio cliente */
                : cliente.vendedor?.nombre 
                  ? `${cliente.vendedor.nombre} ${cliente.vendedor.apellido || ''}`
                  /* Tercera opción: ID del vendedor */
                  : cliente.vendedor_id 
                    ? `ID: ${cliente.vendedor_id}` 
                    : "-"}
            </div>
            <div>
              <span className="font-medium">Locación:</span>{" "}
              {marcaciones && marcaciones.length > 0 && marcaciones[0]?.locacion?.nombre
                ? `${marcaciones[0]?.locacion?.nombre} ${marcaciones[0]?.locacion?.codigolocacion ? `(${marcaciones[0]?.locacion?.codigolocacion})` : ''}`
                : cliente.locacion_id ? `ID: ${cliente.locacion_id}` : "-"}
            </div>
            <div className="md:col-span-2">
              <span className="font-medium">Dirección:</span>{" "}
              {cliente.direccion || "-"}
            </div>
            <div>
              <span className="font-medium">Ciudad/Estado:</span>{" "}
              {`${cliente.ciudad || "-"} / ${cliente.estado || "-"}`}
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido de la sección de marcaciones */}
      {totalMarcaciones > 0 && mostrarMarcacion && (
        <div className={`${mostrarDetalleCliente ? 'mt-4 pt-4 border-t border-gray-200' : 'mt-4'}`}>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-semibold mb-1 text-left">
                Seleccionar Marcación:
              </label>
              <Select
                options={marcacionesOptions}
                value={marcacionesOptions.find(m => marcacionSeleccionada && m.value === marcacionSeleccionada.id)}
                onChange={(selected) => handleMarcacionChange && handleMarcacionChange(selected ? selected : null)}
                placeholder="Seleccione una marcación..."
                className="text-sm"
                isClearable
              />
            </div>
            
            {marcacionSeleccionada && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-left">
                <div>
                  <span className="font-medium">Código:</span>{" "}
                  {marcacionSeleccionada.codigo || "-"}
                </div>
                <div>
                  <span className="font-medium">Contacto:</span>{" "}
                  {marcacionSeleccionada.contacto || "-"}
                </div>
                <div>
                  <span className="font-medium">Dirección:</span>{" "}
                  {marcacionSeleccionada.direccion || "-"}
                </div>
                <div>
                  <span className="font-medium">Ciudad/Estado:</span>{" "}
                  {`${marcacionSeleccionada.ciudad || "-"} / ${marcacionSeleccionada.estado || "-"}`}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span>{" "}
                  {marcacionSeleccionada.telefono || "-"}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {marcacionSeleccionada.email || "-"}
                </div>
                
                {/* Información adicional de Locación */}
                {marcacionSeleccionada.locacion && (
                  <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                    <div className="font-medium mb-1 flex items-center gap-1">
                      <MapPin size={14} />
                      Detalles de Locación:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-xs">
                      <div>
                        <span className="font-medium">Nombre:</span>{" "}
                        {marcacionSeleccionada.locacion.nombre || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Código:</span>{" "}
                        {marcacionSeleccionada.locacion.codigolocacion || "-"}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Información de Cargueras */}
                {marcacionSeleccionada.cargueras && marcacionSeleccionada.cargueras.length > 0 && (
                  <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                    <div className="font-medium mb-1 flex items-center gap-1">
                      <Building size={14} />
                      Cargueras:
                    </div>
                    <ul className="list-disc pl-5 text-left">
                      {marcacionSeleccionada.cargueras.map((carguera, idx) => (
                        <li key={idx}>
                          {carguera.nombre} {carguera.contacto ? `- ${carguera.contacto}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteInfo;
