import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ItemVenta } from '../../hooks/ventas/types';

interface TablaItemsVentaProps {
  items: ItemVenta[];
  totalVenta: number;
  onEliminarItem: (id: number) => void;
  onCantidadCajasChange?: (id: number, cantidadCajas: number) => void;
}

const TablaItemsVenta: React.FC<TablaItemsVentaProps> = ({
  items,
  totalVenta,
  onEliminarItem,
  onCantidadCajasChange
}) => {
  const [cantidadCajas, setCantidadCajas] = useState<{[key: number]: number}>({});
  
  // Calcular el total por ítem (subtotal * cantidad de cajas)
  const calcularTotalPorItem = (item: ItemVenta): number => {
    const numCajas = cantidadCajas[item.id] || 1;
    return item.subtotal * numCajas;
  };
  
  // Calcular el total general
  const calcularTotalGeneral = (): number => {
    return items.reduce((total, item) => total + calcularTotalPorItem(item), 0);
  };
  
  // Manejar cambio en cantidad de cajas
  const handleCantidadCajasChange = (id: number, value: number) => {
    const numCajas = value < 1 ? 1 : value;
    setCantidadCajas(prev => ({ ...prev, [id]: numCajas }));
    if (onCantidadCajasChange) {
      onCantidadCajasChange(id, numCajas);
    }
  };
  return (
    <div className="border border-gray-200 rounded-lg mb-6">
      <h3 className="font-semibold text-[#cc3399] p-3 border-b text-sm">
        Detalle de la Venta
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tallos
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total por Flores
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Materiales
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Total
              </th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-xs">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-2 py-3 text-center text-gray-500 text-xs">
                  No hay productos agregados
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="px-2 py-2 whitespace-nowrap item">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-xs">
                        {item.producto.descripcion || item.producto.nombre}
                      </span>
                      <span className="text-xs text-gray-500">{item.producto.sku}</span>
                      {item.observacion && (
                        <span className="text-xs text-gray-400 italic mt-1">
                          Nota: {item.observacion}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center text-xs">
                    {item.cantidad}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-right text-xs">
                    {item.numeroDeTallos || '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-right text-xs">
                    ${item.floresDetalle && item.floresDetalle.length > 0
                      ? item.floresDetalle.reduce((sum, flor) => sum + (flor.precioVentaTallo * flor.tallos), 0).toFixed(2)
                      : ((item.precioVenta || 0) * (item.numeroDeTallos || 0)).toFixed(2)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-right text-xs">
                    ${item.costoMateriales ? item.costoMateriales.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-right text-xs">
                    ${item.precioTotal ? item.precioTotal.toFixed(2) : item.precio.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-right font-medium text-xs">
                    ${item.subtotal.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <button
                      type="button"
                      onClick={() => onEliminarItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={6} className="px-2 py-2 text-right font-bold text-xs">
                Total:
              </td>
              <td className="px-2 py-2 text-right font-bold text-[#cc3399] text-xs">
                ${totalVenta.toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TablaItemsVenta;
