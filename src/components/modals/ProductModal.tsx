import React from "react";
import type { Producto } from "../../types/producto";
interface ProductModalProps {
  product: Producto;
  onClose: () => void;
}
const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center transition-opacity z-50"
      style={{ backdropFilter: "blur(8px)" }}
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white rounded-lg p-4 sm:p-6 w-[95vw] max-w-5xl shadow-lg overflow-y-auto max-h-[90vh]"
      >
        {/* Responsive modal container */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mb-2">
          <p className="text-gray-700">
            <strong>SKU:</strong> {product.SKU}
          </p>
          <p className="text-gray-700">
            <strong>Nombre:</strong> {product.nombreProducto}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mb-2">
          <p className="text-gray-700">
            <strong>Descripción:</strong> {product.descripcion}
          </p>
        </div>
        {/* ...existing code... */}
        {[
          "bouquete",
          "consumer bounch"
        ].includes(product.categoria.toLowerCase()) && product.flores && (
          <div className="mt-4 overflow-x-auto">
            <h3 className="text-lg font-bold text-pink-600 mb-2">
              Ítems del BQT
            </h3>
            <table className="min-w-[600px] w-full border-collapse border border-gray-300 text-xs sm:text-sm">
              <thead>
                <tr className="bg-pink-100">
                  <th className="border border-gray-300 px-2 py-1 text-left">ID</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Variedad</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Tipo</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Color</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Calibre</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Tallos</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Orden</th>
                   <th className="border border-gray-300 px-2 py-1 text-left">Precio</th>
                </tr>
              </thead>
              <tbody>
                {product.flores.map((flor, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-2 py-1">{flor.id}</td>
                    <td className="border border-gray-300 px-2 py-1">{flor.variedad}</td>
                    <td className="border border-gray-300 px-2 py-1">{flor.tipo}</td>
                    <td className="border border-gray-300 px-2 py-1">{flor.color}</td>
                    <td className="border border-gray-300 px-2 py-1">{flor.calibre}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{flor.pivot.tallos}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{flor.pivot.orden}</td>
                     <td className="border border-gray-300 px-2 py-1 text-center">{flor.precios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors w-full sm:w-auto"
          style={{
            backgroundColor: "#cc3399",
            color: "#FFFFFF",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default ProductModal;
                   
