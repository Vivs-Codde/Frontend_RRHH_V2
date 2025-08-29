import React from 'react';
import { Package } from 'lucide-react';

interface NoProductosDisponiblesProps {
  error: string | null;
}

const NoProductosDisponibles: React.FC<NoProductosDisponiblesProps> = ({
  error
}) => {
  return (
    <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
      <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
        <Package size={18} color="#b7791f" />
        No hay productos disponibles
      </h3>
      <div className="text-sm text-yellow-700">
        <p>Este cliente no tiene productos asignados o no hay asignaciones disponibles.</p>
        {error && (
          <p className="mt-2 text-red-600 bg-red-50 p-2 rounded border border-red-100">
            Error: {error}
          </p>
        )}
        <p className="mt-2">Posibles soluciones:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Verifique que el cliente tenga asignaciones creadas</li>
          <li>Cree una nueva asignación para este cliente</li>
          <li>Seleccione un cliente diferente</li>
        </ul>
      </div>
    </div>
  );
};

export default NoProductosDisponibles;
