import React from "react";


interface AsignacionResumenModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  asignacion: {
    cliente: any;
    productos: Array<{
      producto: any;
      subcategoria: string;
      variedadesExcluidas: string[];
    }>;
  };
  subcategorias: Array<{ id: string; name: string }>;
  // Ahora recibe todas las variedades como array global
  variedades: Array<{ id: string; name: string }>;
}


const AsignacionResumenModal: React.FC<AsignacionResumenModalProps> = ({ open, onClose, onConfirm, asignacion, subcategorias, variedades }) => {
  if (!open) return null;
  // Handler para cerrar al hacer click fuera del modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-40 backdrop-blur-sm" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-[#cc3399] mb-4 text-center">Resumen de Asignación</h2>
        <div className="mb-4">
          <div className="font-semibold text-gray-700">Cliente:</div>
          <div className="text-gray-900 mb-2">{asignacion.cliente?.NombreCliente || asignacion.cliente?.nombre || asignacion.cliente?.razonSocial}</div>
          <div className="font-semibold text-gray-700 mt-2">Productos seleccionados:</div>
          <ul className="list-disc pl-5">
            {asignacion.productos.map((p, idx) => {
              const subcatName = subcategorias.find(sc => sc.id === p.subcategoria)?.name || p.subcategoria || 'N/A';
              // Todas las variedades globales
              const allVars = variedades;
              // Las no permitidas (por nombre)
              const notAllowed = p.variedadesExcluidas;
              // Las permitidas: todas menos las no permitidas
              const allowed = allVars.filter(v => !notAllowed.includes(v.name));
              return (
                <li key={idx} className="mb-2">
                  <div className="font-medium text-pink-700">{p.producto.nombreProducto || p.producto.nombre} <span className="text-xs text-gray-500">({p.producto.categoria})</span></div>
                  <div className="text-xs text-gray-600">Subcategoría: <span className="font-semibold">{subcatName}</span></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {/* Columna permitidas */}
                    <div>
                      <div className="text-xs text-gray-600 mb-1"><span className="text-green-700 font-semibold">PERMITIDAS</span>:</div>
                      {allowed.length === 0 ? (
                        <div className="text-xs text-gray-400 ml-2">Ninguna</div>
                      ) : (
                        <ul className="list-disc pl-6">
                          {allowed.map((v, i) => (
                            <li key={i} className="text-xs text-green-800">{v.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {/* Columna no permitidas */}
                    <div>
                      <div className="text-xs text-gray-600 mb-1"><span className="text-pink-700 font-semibold">NO permitidas</span>:</div>
                      {notAllowed.length === 0 ? (
                        <div className="text-xs text-gray-400 ml-2">Ninguna</div>
                      ) : (
                        <ul className="list-disc pl-6">
                          {notAllowed.map((v, i) => (
                            <li key={i} className="text-xs text-pink-800">{v}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded  hover:bg-gray-400 text-white font-semibold" style={{background:'#cc3399'}}>Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded  hover:bg-gray-400 text-white font-semibold" style={{background:'#cc3399'}}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default AsignacionResumenModal;
