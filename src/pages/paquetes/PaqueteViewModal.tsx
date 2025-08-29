import React from "react";
import { useTranslation } from 'react-i18next';
interface PaqueteViewModalProps {
  paquete: any;
  onClose: () => void;
}

const PaqueteViewModal: React.FC<PaqueteViewModalProps> = ({
  paquete,
  onClose,
}) => {
  if (!paquete) return null;
  // Handler para cerrar al hacer click fuera del modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-pink-700">
            {t("detalles_paquete")}
          
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-700 text-2xl"
            style={{ background: "#cc3399" }}
          >
            &times;
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 text-left">
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm">SKU:</p>
            <p className="font-semibold">{paquete.SKU}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm">{t("nombre")}: </p>
            <p className="font-semibold">{paquete.nombre}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm">{t("categoria")}: </p>
            <p className="font-semibold">{paquete.categoria}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm">{t("subcategoria")}: </p>
            <p className="font-semibold">{paquete.subcategoria}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm">{t("cliente")}: </p>
            <p className="font-semibold">{paquete.nombreCliente}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm">{t("estado")}: </p>
            <p className="font-semibold">
              {paquete.estado ? t("activo") : t("inactivo")}
            </p>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-pink-700">{t("materiales")}</h3>
        {paquete.materiales && paquete.materiales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-#cc3399">
              <thead>
                <tr className="bg-[#cc3399]">
                  <th className="py-2 px-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {t("tipo")}
                  </th>
                  <th className="py-2 px-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {t("nombre")}
                  </th>
                  <th className="py-2 px-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {t("unidad")}
                  </th>
                  <th className="py-2 px-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {t("cantidad")}
                  </th>
                  <th className="py-2 px-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {t("precioUnitario")}
                  </th>
                  <th className="py-2 px-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {t("total")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paquete.materiales.map((mat: any, index: number) => {
                  const cantidad = mat.pivot?.cantidad ?? 1;
                  const precioUnitario = parseFloat(mat.precio ?? "0");
                  const costoTotal = cantidad * precioUnitario;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 text-sm text-gray-800">
                        {mat.tipoMaterial}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-800">
                        {mat.nombre}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-800">
                        {mat.unidadMedida}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-800 text-center">
                        {cantidad}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-800 text-right">
                        ${precioUnitario.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-800 text-right">
                        ${costoTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Costo total del paquete */}
            <div className="flex justify-end mt-4">
              <div className="bg-pink-100 rounded-lg px-6 py-3 shadow">
                <span className="font-bold text-pink-700 text-lg">
                  {t("total_materiales")}:{" "}
                </span>
                <span className="font-bold text-gray-800 text-lg">
                  $
                  {paquete.materiales
                    .reduce((acc: number, mat: any) => {
                      const cantidad = mat.pivot?.cantidad ?? 1;
                      const precioUnitario = parseFloat(mat.precio ?? "0");
                      return acc + cantidad * precioUnitario;
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            Este paquete no tiene materiales asociados
          </p>
        )}
      </div>
    </div>
  );
};

export default PaqueteViewModal;
