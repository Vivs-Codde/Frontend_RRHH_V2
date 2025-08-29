import React from 'react';
import { Package } from 'lucide-react';

interface ProductosDisponiblesProps {
  productosOptions: any[];
  filtroTipoFlor: string;
  setFiltroTipoFlor: (filtro: string) => void;
}

const ProductosDisponibles: React.FC<ProductosDisponiblesProps> = ({
  productosOptions,
  filtroTipoFlor,
  setFiltroTipoFlor
}) => {
  // Extraer todos los tipos de flores únicos de los productos
  const tiposFlores = Array.from(new Set(
    productosOptions.flatMap(p => {
      // Extraer tipos de flores de la receta si existen
      const tiposFlores = p.receta?.flores?.map(f => f.tipo) || [];
      // Incluir tanto el tipo de flor como la categoría del producto
      return [...tiposFlores, p.categoria].filter(Boolean);
    })
  ));
  
  return (
    <div className="bg-pink-50 p-4 rounded-lg mb-6 border border-pink-200">
      <h3 className="font-semibold text-pink-800 mb-3 flex items-center gap-2">
        <Package size={18} color="#cc3399" />
        Productos Asignados
      </h3>
      <div className="text-sm">
        <p className="mb-2">
          <span className="font-medium">Productos disponibles:</span>{" "}
          {productosOptions.length}
        </p>
        
        {productosOptions.length > 0 && (
          <div className="bg-white p-3 rounded border border-pink-100">
            <h4 className="font-medium mb-2 text-pink-700">Tipos de flores:</h4>
            <div className="flex flex-wrap gap-2">
              <span 
                className={`px-2 py-1 ${filtroTipoFlor === "" ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-800"} rounded-full text-xs cursor-pointer`}
                onClick={() => setFiltroTipoFlor("")}
              >
                Todos
              </span>
              {tiposFlores.map((tipo, idx) => (
                <span 
                  key={idx} 
                  className={`px-2 py-1 ${filtroTipoFlor === tipo ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-800"} rounded-full text-xs cursor-pointer`}
                  onClick={() => setFiltroTipoFlor(tipo === filtroTipoFlor ? "" : tipo as string)}
                >
                  {String(tipo)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosDisponibles;
