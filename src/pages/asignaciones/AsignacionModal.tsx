import React, { useRef, useState } from "react";

interface AsignacionModalProps {
  asignacion: any;
  onClose: () => void;
}

const AsignacionModal: React.FC<AsignacionModalProps> = ({
  asignacion,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cierra si el click es fuera del modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative"
      >
        <button
          className="absolute top-2 right-2 text-white hover:text-red-500 text-xl font-bold"
          style={{ background: "#cc3399" }}
          onClick={onClose}
          title="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-[#cc3399] text-left">
          Detalle de Asignación
        </h2>
        <div className="mb-2 text-left">
          <b>Cliente:</b>{" "}
          {asignacion.cliente?.NombreCliente ||
            asignacion.cliente?.nombre ||
            "-"}
        </div>
        {/* <div className="mb-2 text-left"><b>Dirección:</b> {asignacion.cliente?.direccion || '-'}</div>
        <div className="mb-2 text-left"><b>Correo:</b> {asignacion.cliente?.email || '-'}</div>
        <div className="mb-2 text-left"><b>Productos asignados:</b> {Array.isArray(asignacion.productos) ? asignacion.productos.length : 0}</div>
        <div className="mb-2 text-left"><b>Restricciones totales:</b> {Array.isArray(asignacion.productos) ? asignacion.productos.reduce((acc, p) => acc + (Array.isArray(p.variedades_excluidas) ? p.variedades_excluidas.length : 0), 0) : 0}</div> */}
        <div className="mb-2 text-left">
          <b>Detalle de productos:</b>
        </div>

        <div className="flex flex-col gap-2 text-left">
          {(() => {
            if (!Array.isArray(asignacion.recetas)) return null;
            // Agrupar por producto_id
            const productosPorId = asignacion.recetas.reduce(
              (acc: any, receta: any) => {
                const p = receta.producto;
                const key = p.id || p.producto_id || p.sku;
                if (!acc[key])
                  acc[key] = {
                    nombre: p.descripcion || p.nombre || "-",
                    tipos: [],
                  };
                acc[key].tipos.push(receta);
                return acc;
              },
              {}
            );

            const [open, setOpen] = useState<{ [key: string]: boolean }>({});

            const tieneRestricciones = (receta: any) =>
              Array.isArray(receta.variedades_excluidas) &&
              receta.variedades_excluidas.length > 0;

            return Object.entries(productosPorId).map(
              ([prodId, prodData]: any) => {
                const algunTipoConRestriccion =
                  prodData.tipos.some(tieneRestricciones);
                if (!algunTipoConRestriccion) {
                  return (
                    <div
                      key={prodId}
                      className="py-2 text-left border-b border-pink-100 last:border-b-0"
                    >
                      <div className="mb-1 text-base font-bold text-[#cc3399] text-left">
                        Producto:{" "}
                        <span className="font-medium text-black">
                          {prodData.nombre}
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={prodId}
                      className="py-2 text-left border-b border-pink-100 last:border-b-0"
                    >
                      <div className="mb-1 text-base font-bold text-[#cc3399] text-left flex items-center justify-between">
                        <span>
                          Producto:{" "}
                          <span className="font-medium text-gray-950">
                            {prodData.nombre}
                          </span>
                        </span>
                        <button
                          className="ml-2 px-3 py-1 rounded text-xs font-semibold text-white"
                          style={{ background: "#cc3399" }}
                          onClick={() =>
                            setOpen((prev) => ({
                              ...prev,
                              [prodId]: !prev[prodId],
                            }))
                          }
                          aria-expanded={!!open[prodId]}
                          aria-controls={`detalle-prod-${prodId}`}
                        >
                          {open[prodId] ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 15l-7-7-7 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {open[prodId] && (
                        <div id={`detalle-prod-${prodId}`}>
                          {prodData.tipos.map((receta: any, j: number) => (
                            <React.Fragment key={j}>
                              <div className="mb-2 ml-2 text-left">
                                <div className="mb-1 text-left">
                                  <span className="font-semibold text-[#cc3399]">
                                    Tipo:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {receta.tipo || "-"}
                                  </span>
                                </div>
                                <div className="mb-1 text-left">
                                  <span className="font-semibold text-[#cc3399]">
                                    Variedades excluidas:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {tieneRestricciones(receta)
                                      ? receta.variedades_excluidas
                                          .map(
                                            (v: any) =>
                                              v.variedad || v.name || v
                                          )
                                          .join(", ")
                                      : "Ninguna"}
                                  </span>
                                </div>
                              </div>
                              {prodData.tipos.length > 1 &&
                                j < prodData.tipos.length - 1 && (
                                  <hr className="border-t border-pink-200 my-2 ml-2 mr-2" />
                                )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
              }
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default AsignacionModal;
