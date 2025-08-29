import React from "react";

interface ClienteModalProps {
  cliente: any;
  onClose: () => void;
}

const ClienteModal: React.FC<ClienteModalProps> = ({ cliente, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50"
      style={{ backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
  <div className="bg-white rounded-lg p-6 w-[98vw] max-w-5xl shadow-lg overflow-y-auto max-h-[90vh] border-2 border-pink-200">
        <h2 className="text-2xl font-bold text-[#cc3399] mb-4">Cliente :{cliente.NombreCliente}</h2>
        
       
        {/* Cargueras */}
        {Array.isArray(cliente.cargueras) && cliente.cargueras.length > 0 && (
          <div className="mb-4 hidden">
            <b className="block mb-2 text-pink-700">Cargueras:</b>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-pink-200 rounded">
                <thead className="bg-pink-100">
                  <tr>
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">Nombre</th>
                    <th className="px-2 py-1">RUC</th>
                    <th className="px-2 py-1">Contacto</th>
                    <th className="px-2 py-1">Teléfono</th>
                    <th className="px-2 py-1">Email</th>
                    <th className="px-2 py-1">Representante</th>
                    <th className="px-2 py-1">Origen</th>
                    <th className="px-2 py-1">Estado</th>
                    <th className="px-2 py-1">Días Trabajo</th>
                    <th className="px-2 py-1">Cooler ID</th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.cargueras.map((c: any) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-2 py-1">{c.id}</td>
                      <td className="px-2 py-1">{c.nombre}</td>
                      <td className="px-2 py-1">{c.ruc}</td>
                      <td className="px-2 py-1">{c.contacto}</td>
                      <td className="px-2 py-1">{c.telefono}</td>
                      <td className="px-2 py-1">{c.email}</td>
                      <td className="px-2 py-1">{c.representante}</td>
                      <td className="px-2 py-1">{c.origen ?? '-'}</td>
                      <td className="px-2 py-1">{c.estado === 1 ? 'Activo' : 'Inactivo'}</td>
                      <td className="px-2 py-1">{c.diasTrabajo ?? '-'}</td>
                      <td className="px-2 py-1">{c.cooler_id ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Marcaciones */}
  {Array.isArray(cliente.marcaciones) && cliente.marcaciones.length > 0 ? (
          <div className="mb-4">
            <b className="block mb-2 text-yellow-700">Marcaciones:</b>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-yellow-200 rounded">
                <thead className="bg-yellow-100">
                  <tr>
                   
                    <th className="px-2 py-1">Nombre</th>
                    <th className="px-2 py-1">Código</th>
                    <th className="px-2 py-1">Estado</th>
                    <th className="px-2 py-1">Ciudad</th>
                    <th className="px-2 py-1">Dirección</th>
                    <th className="px-2 py-1">Zipcode</th>
                    <th className="px-2 py-1">Contacto</th>
                    <th className="px-2 py-1">Teléfono</th>
                    <th className="px-2 py-1">Email</th>
                  
                    <th className="px-2 py-1">Cargueras</th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.marcaciones.map((m: any) => (
                    <tr key={m.id} className="border-t">
                     
                      <td className="px-2 py-1">{m.nombre}</td>
                      <td className="px-2 py-1">{m.codigo}</td>
                      <td className="px-2 py-1">{m.estado}</td>
                      <td className="px-2 py-1">{m.ciudad}</td>
                      <td className="px-2 py-1">{m.direccion}</td>
                      <td className="px-2 py-1">{m.zipcode}</td>
                      <td className="px-2 py-1">{m.contacto}</td>
                      <td className="px-2 py-1">{m.telefono}</td>
                      <td className="px-2 py-1">{m.email}</td>
                     
                      <td className="px-2 py-1">
                        {Array.isArray(m.cargueras) && m.cargueras.length > 0 ? (
                          <ul className="list-disc ml-2">
                            {m.cargueras.map((c: any) => (
                              <li key={c.id}>{c.nombre} ({c.email})</li>
                            ))}
                          </ul>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
            <div className="mb-4">
              <b className="block mb-2 text-yellow-700">Marcaciones:</b>
              <div className="text-gray-500">Cliente sin marcaciones</div>
            </div>
          )}
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 text-white rounded hover:bg-pink-700 transition-colors w-full sm:w-auto"
          style={{ background: "#cc3399" }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ClienteModal;
