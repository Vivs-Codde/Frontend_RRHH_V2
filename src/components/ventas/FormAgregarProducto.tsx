import React from 'react';
import Select from 'react-select';
import { Plus } from 'lucide-react';
import type { Producto, ItemVenta } from '../../hooks/ventas/types';
import type { TipoCaja } from '../../types/ventas';

interface FormAgregarProductoProps {
  productoSeleccionado: Producto | null;
  handleProductoChange: (producto: Producto | null) => void;
  cantidad: number;
  setCantidad: (cantidad: number) => void;
  precio: number;
  setPrecio: (precio: number) => void;
  precioVenta: number;
  setPrecioVenta: (precio: number) => void;
  floresDetalle: Array<any>;
  handlePrecioFlor: (id: number, precio: number) => void;
  observacion: string;
  setObservacion: (observacion: string) => void;
  handleAgregarItem: () => void;
  loading: boolean;
  productosOptions: Producto[];
  filtroTipoFlor: string;
  clienteSeleccionado: any;
  tipoCaja?: TipoCaja;
  itemsVenta?: ItemVenta[];
  obtenerNumeroTallos: (producto: Producto) => number;
  obtenerCostoMateriales: (producto: Producto) => number;
  costoTotalUnidad?: number; // Representa el costo total de la caja
  setCostoTotalUnidad?: (costo: number) => void;
  maximoUnidadesCaja?: number; // Cantidad máxima de unidades permitidas en la caja
}

const FormAgregarProducto: React.FC<FormAgregarProductoProps> = ({
  productoSeleccionado,
  handleProductoChange,
  cantidad,
  setCantidad,
  precio,
  setPrecio,
  precioVenta,
  setPrecioVenta,
  floresDetalle,
  handlePrecioFlor,
  observacion,
  setObservacion,
  handleAgregarItem,
  loading,
  productosOptions,
  filtroTipoFlor,
  clienteSeleccionado,
  tipoCaja = 'solida',
  itemsVenta = [],
  obtenerNumeroTallos,
  obtenerCostoMateriales,
  costoTotalUnidad = 0,
  setCostoTotalUnidad = (v: number) => console.log('Valor de costo de caja actualizado:', v),
  maximoUnidadesCaja = 0
}) => {
  const productosFiltrados = filtroTipoFlor ? productosOptions.filter(p => {
    const tiposFlores = p.receta?.flores?.map((f: { tipo: string }) => f.tipo) || [];
    return tiposFlores.includes(filtroTipoFlor) || p.categoria === filtroTipoFlor;
  }) : productosOptions;
  
  // Determinar si debe deshabilitar la selección de producto basado en tipo de caja
  const disableProductoSelection = 
    !clienteSeleccionado || 
    loading || 
    (tipoCaja === 'solida' && itemsVenta.length > 0);
  
  // Efecto para asegurarse que la cantidad nunca exceda el máximo permitido
  React.useEffect(() => {
    if (maximoUnidadesCaja > 0 && cantidad > maximoUnidadesCaja) {
      setCantidad(maximoUnidadesCaja);
      console.log('Cantidad ajustada al máximo permitido de la caja:', maximoUnidadesCaja);
    }
  }, [maximoUnidadesCaja, cantidad, setCantidad]);
  
  // Log para depuración
  React.useEffect(() => {
    console.log('FormAgregarProducto - maximoUnidadesCaja:', maximoUnidadesCaja);
  }, [maximoUnidadesCaja]);
  
  // Mostrar mensaje basado en el tipo de caja
  const getTipoCajaMessage = () => {
    if (tipoCaja === 'solida' && itemsVenta.length > 0) {
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded mb-4 text-sm">
          En caja sólida solo puede agregar un producto. Elimine el producto actual para agregar uno diferente.
        </div>
      );
    } else if (tipoCaja === 'mixta' && itemsVenta.length > 0 && productoSeleccionado) {
      const categoriaActual = itemsVenta[0].producto.categoria;
      if (productoSeleccionado.categoria !== categoriaActual) {
        return (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded mb-4 text-sm">
            En caja mixta solo puede agregar productos de la misma categoría: <strong>{categoriaActual}</strong>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-[#cc3399] mb-4 flex items-center gap-2">
        Agregar Productos {tipoCaja === 'solida' ? '(Caja Sólida)' : '(Caja Mixta)'}
      </h3>
      
      {getTipoCajaMessage()}
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        {/* Producto */}
        <div className="md:col-span-12">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Producto:
          </label>
          <Select
            options={productosFiltrados}
            onChange={handleProductoChange}
            value={productoSeleccionado}
            isSearchable
            placeholder={
              disableProductoSelection && tipoCaja === 'solida' && itemsVenta.length > 0 
                ? "Solo un producto para caja sólida" 
                : filtroTipoFlor 
                  ? `Seleccione un producto (${filtroTipoFlor})...` 
                  : "Seleccione un producto..."
            }
            className="text-sm"
            isDisabled={disableProductoSelection}
            isLoading={loading && clienteSeleccionado}
            noOptionsMessage={() => {
              if (!clienteSeleccionado) return "Seleccione un cliente primero";
              if (tipoCaja === 'solida' && itemsVenta.length > 0) return "Solo un producto para caja sólida";
              if (filtroTipoFlor) return `No hay productos de tipo ${filtroTipoFlor} disponibles`;
              return "No hay productos disponibles para este cliente";
            }}
            formatOptionLabel={(option) => (
              <div className="flex flex-col">
                <div>{option.label}</div>
                {option.resumen && (
                  <div className="text-xs text-gray-600 hidden">
                    Detalle: {option.resumen}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-1">
                  {option.tiposFlores && option.tiposFlores.length > 0 && (
                    <div className="text-xs text-gray-600">
                      Flores: {option.tiposFlores.join(', ')}
                    </div>
                  )}
                  {/* Mostrar número de tallos si está disponible */}
                  {option.resumen && option.resumen.includes('st') && (
                    <div className="text-xs font-semibold text-[#cc3399] px-1 bg-pink-50 rounded">
                      Tallos: {option.resumen.match(/(\d+)st/) ? option.resumen.match(/(\d+)st/)?.[1] || 'N/A' : 'N/A'}
                    </div>
                  )}
                  {/* Mostrar precio total del producto */}
                  {option.precioTotal && productoSeleccionado && productoSeleccionado.receta?.paquete && (
                    <div className="text-xs font-medium bg-gray-100 px-1 rounded">
                      Costo producto: ${parseFloat(option.precioTotal).toFixed(2)}{"+ costo paquete: $"}{parseFloat(productoSeleccionado.receta.paquete.precioTotal || "0").toFixed(2)}{" = $"}{(parseFloat(option.precioTotal) + parseFloat(productoSeleccionado.receta.paquete.precioTotal || "0")).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        </div>
      </div>
      
      {/* Segunda fila con Observación, Costo de la Caja y Cantidad */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        {/* Observación */}
        <div className="md:col-span-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Observación:
          </label>
          <input
            type="text"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Opcional"
          />
        </div>
        {/* Costo de la Caja */}
        <div className="md:col-span-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Costo de la Caja:
          </label>
          <input
            type="number"
            value={costoTotalUnidad}
            onChange={(e) => setCostoTotalUnidad(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Ingrese costo"
            min="0"
            step="0.01"
          />
        </div>
        {/* Cantidad */}
        <div className="md:col-span-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Cantidad:
          </label>
          <div className="relative">
            <input
              type="number"
              value={cantidad}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                // Validar que no exceda el máximo permitido por la caja
                if (maximoUnidadesCaja > 0 && newValue > maximoUnidadesCaja) {
                  setCantidad(maximoUnidadesCaja);
                } else {
                  setCantidad(newValue);
                }
              }}
              onBlur={() => {
                // Validación adicional al perder el foco
                if (maximoUnidadesCaja > 0 && cantidad > maximoUnidadesCaja) {
                  setCantidad(maximoUnidadesCaja);
                }
              }}
              onKeyDown={(e) => {
                // Prevenir que se puedan ingresar valores que generarían un número mayor al máximo
                if (maximoUnidadesCaja > 0) {
                  const inputValue = e.currentTarget.value + e.key;
                  if (!isNaN(Number(e.key)) && Number(inputValue) > maximoUnidadesCaja) {
                    e.preventDefault();
                  }
                }
              }}
              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                cantidad > maximoUnidadesCaja && maximoUnidadesCaja > 0 ? 'border-red-500' : ''
              }`}
              min="1"
              max={maximoUnidadesCaja > 0 ? maximoUnidadesCaja : undefined}
            />
          
          </div>
          {cantidad > maximoUnidadesCaja && maximoUnidadesCaja > 0 && (
            <p className="text-red-600 text-xs mt-1 font-medium bg-red-50 p-1 rounded border border-red-200">
              ⚠️ La cantidad no puede exceder el máximo de {maximoUnidadesCaja} unidades para esta caja
            </p>
          )}
         
        </div>
      </div>
      
      {/* Detalles del paquete si hay disponible */}
      {productoSeleccionado && productoSeleccionado.receta?.paquete && (
        <div className="mt-4 border-t border-dashed border-pink-200 pt-4 hidden">
          <h4 className="text-sm font-semibold text-[#cc3399] mb-3 flex items-center justify-between">
            <span>Información del paquete:</span>
            <span className="bg-pink-100 text-[#cc3399] px-2 py-1 rounded-full text-xs font-bold">
              Costo paquete: ${parseFloat(productoSeleccionado.receta.paquete.precioTotal || "0").toFixed(2)}
            </span>
          </h4>
          <div className="bg-pink-50 border border-pink-100 rounded-md p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Nombre del paquete:</p>
                <p className="text-sm font-medium">{productoSeleccionado.receta.paquete.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">SKU del paquete:</p>
                <p className="text-sm font-medium">{productoSeleccionado.receta.paquete.SKU}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Resumen de precios:</p>
                <div className="flex flex-col gap-1 mt-1">
                  <p className="text-xs"><span className="font-medium">Producto:</span> ${parseFloat(productoSeleccionado.precioTotal || "0").toFixed(2)}</p>
                  <p className="text-xs font-semibold text-[#cc3399]"><span className="font-medium">Paquete:</span> ${parseFloat(productoSeleccionado.receta.paquete.precioTotal || "0").toFixed(2)}</p>
                  <p className="text-xs font-bold border-t border-pink-200 pt-1 mt-1">
                    <span className="font-medium">Total:</span> ${(parseFloat(productoSeleccionado.precioTotal || "0") + parseFloat(productoSeleccionado.receta.paquete.precioTotal || "0")).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            {productoSeleccionado.receta.paquete.materiales && productoSeleccionado.receta.paquete.materiales.length > 0 && (
              <div className="mt-2 pt-2 border-t border-pink-100">
                <p className="text-xs font-medium text-gray-600 mb-1">Materiales incluidos:</p>
                <div className="max-h-40 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-pink-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Material</th>
                        <th className="px-2 py-1 text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productoSeleccionado.receta.paquete.materiales.map((material: any, index: number) => (
                        <tr key={index} className="border-b border-pink-50">
                          <td className="px-2 py-1">{material.nombre || material.tipoMaterial || 'Material'}</td>
                          <td className="px-2 py-1 text-right">${parseFloat(material.precio || "0").toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Detalle de flores si hay disponibles */}
      {productoSeleccionado && floresDetalle && floresDetalle.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Detalle de flores por tallos:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {floresDetalle.map(flor => (
              <div key={flor.id} className="border rounded p-2 bg-gray-50 max-w-xs">
                <div className="flex flex-col items-start mb-1">
                  <div className="flex justify-between w-full">
                    <p className="text-sm font-medium truncate">{flor.variedad} ({flor.tipo})</p>
                    <span className="bg-[#cc3399] text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ml-1">
                      {flor.tallos} tallos
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{flor.color}, {flor.calibre}</p>
                </div>
                <div className="mb-1">
                  <label className="block text-xs text-gray-700 mb-1 text-left">
                    Precio por tallo ($):
                  </label>
                  <input
                    type="number"
                    value={flor.precioVentaTallo}
                    onChange={(e) => handlePrecioFlor(flor.id, Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className="w-full px-2 py-0.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-pink-400 text-left"
                  />
                </div>
                <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-gray-200">
                  <span className="text-left">Subtotal flor:</span>
                  <span className="font-medium text-right">${(flor.precioVentaTallo * flor.tallos).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Precio total de venta calculado */}
          <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3">
            <h5 className="text-sm font-semibold text-green-800 mb-2">Precio Total de Venta</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ul className="space-y-1 text-sm">
                  {floresDetalle.map(flor => (
                    <li key={flor.id} className="flex justify-between">
                      <span className="text-xs text-gray-600">{flor.variedad} ({flor.tallos} tallos):</span>
                      <span className="text-xs font-medium">${(flor.precioVentaTallo * flor.tallos).toFixed(2)}</span>
                    </li>
                  ))}
                  {productoSeleccionado.receta?.paquete?.precioTotal && (
                    <li className="flex justify-between pt-1 border-t border-green-200">
                      <span className="text-xs text-gray-600">Costo del paquete:</span>
                      <span className="text-xs font-medium">${parseFloat(productoSeleccionado.receta.paquete.precioTotal).toFixed(2)}</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">Precio base de transferencia:</span>
                  <span className="text-xs font-medium">${parseFloat(productoSeleccionado.precioTotal || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">Total por flores:</span>
                  <span className="text-xs font-medium">
                    ${floresDetalle.reduce((sum, flor) => sum + (flor.precioVentaTallo * flor.tallos), 0).toFixed(2)}
                  </span>
                </div>
                {productoSeleccionado.receta?.paquete?.precioTotal && (
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">Costo del paquete:</span>
                    <span className="text-xs font-medium">${parseFloat(productoSeleccionado.receta.paquete.precioTotal).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-green-200 pt-1 mt-1">
                  <span className="text-sm">TOTAL:</span>
                  <span className="text-sm">
                    ${(() => {
                      // Calcular el total por flores
                      const totalFlores = floresDetalle.reduce((sum, flor) => sum + (flor.precioVentaTallo * flor.tallos), 0);
                      
                      // Calcular el precio del paquete
                      const precioPaquete = parseFloat(productoSeleccionado.receta?.paquete?.precioTotal || "0");
                      
                      // Calcular el nuevo precio total (solo flores + paquete)
                      const nuevoPrecioTotal = totalFlores + precioPaquete;
                      
                      // Precio base de transferencia
                      const precioBase = parseFloat(productoSeleccionado.precioTotal || "0");
                      
                      // El precio total no debe ser menor que el precio base de transferencia
                      return (nuevoPrecioTotal > precioBase ? nuevoPrecioTotal : precioBase).toFixed(2);
                    })()}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Costo total de la caja: 
                  <span className="font-medium ml-1">${costoTotalUnidad.toFixed(2)}</span>
                </div>
                {maximoUnidadesCaja > 0 && (
                  <div className="mt-1 text-xs text-amber-600">
                    <span className="font-medium">Nota:</span> Esta caja puede contener máximo {maximoUnidadesCaja} unidades
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Botón agregar */}
      <div className="text-right mt-4">
        <button
          type="button"
          onClick={handleAgregarItem}
          disabled={!productoSeleccionado || loading || (maximoUnidadesCaja > 0 && cantidad > maximoUnidadesCaja)}
          className="bg-[#cc3399] hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center gap-2 ml-auto disabled:opacity-50"
        >
          <Plus size={18} /> Agregar
        </button>
        {maximoUnidadesCaja > 0 && cantidad > maximoUnidadesCaja && (
          <div className="text-sm bg-red-50 border border-red-200 text-red-600 p-2 rounded mt-2 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            No se puede agregar: Esta caja solo permite un máximo de {maximoUnidadesCaja} unidades
          </div>
        )}
      </div>
    </div>
  );
};

export default FormAgregarProducto;
