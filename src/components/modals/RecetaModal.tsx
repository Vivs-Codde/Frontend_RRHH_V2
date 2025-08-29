import React from "react";
import { useTranslation } from "react-i18next";
import { updateRecetaDescripcionImagen } from "../../services/recetasService";
interface RecetaModalProps {
  receta: any;
  onClose: () => void;
  onUpdated?: () => void;
}

const RecetaModal: React.FC<RecetaModalProps> = ({
  receta,
  onClose,
  onUpdated,
}) => {
  const { t } = useTranslation();
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Calcular totales de materiales y producto
  const totalMateriales = Array.isArray(receta.materiales)
    ? receta.materiales.reduce(
        (acc, mat) =>
          acc +
          parseFloat(mat.precio) *
            (parseFloat(mat.cantidad_material ?? mat.cantidad ?? 1) || 1),
        0
      )
    : 0;
  // Costo del producto
  const costoProducto = receta.producto?.precioTotal
    ? parseFloat(receta.producto.precioTotal)
    : receta.producto?.precio
    ? parseFloat(receta.producto.precio)
    : 0;

  // Estado para edición de descripción e imagen
  const [editDescripcion, setEditDescripcion] = React.useState(
    receta.descripcion || ""
  );
  const [editImagen, setEditImagen] = React.useState<File | null>(null);
  const [loadingUpdate, setLoadingUpdate] = React.useState(false);
  const [errorUpdate, setErrorUpdate] = React.useState("");

  // Función para actualizar descripción e imagen
  const handleUpdateDescripcionImagen = async () => {
    setLoadingUpdate(true);
    setErrorUpdate("");
    try {
      await updateRecetaDescripcionImagen(
        receta.id,
        editDescripcion,
        editImagen || undefined
      );
      setLoadingUpdate(false);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setErrorUpdate(err.message || "Error al actualizar");
      setLoadingUpdate(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50"
      style={{ backdropFilter: "blur(8px)" }}
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg p-6 w-[95vw] max-w-3xl shadow-lg overflow-y-auto max-h-[90vh] border-2 border-pink-200">
      
        {/* Encabezado tipo factura + Producto y Paquete en la misma fila */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-2 border-b border-pink-200">
          <div className="flex flex-col w-full gap-4">
            {/* Info principal en una sola fila */}
            <div className="flex flex-wrap items-center gap-6 mb-2 text-left">
              <span className="text-2xl font-bold text-[#cc3399]">
                RECETA #{receta.id}
              </span>
              <span className="text-sm text-gray-700">
                SKU: <b>{receta.sku || "-"}</b>
              </span>
              <span className="text-sm text-gray-700">
                Fecha:{" "}
                <b>
                  {receta.created_at
                    ? new Date(receta.created_at).toLocaleDateString()
                    : "-"}
                </b>
              </span>
            </div>
            {/* Producto y Paquete en la misma fila, Producto más grande */}
            <div className="flex flex-row gap-4 w-full">
              {/* Producto */}
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 flex-[2] text-left">
                <h4 className="text-lg font-bold text-[#FFB400] mb-2 text-left">
                  Vegetal
                </h4>
                {receta.producto ? (
                  <>
                    <p className="text-gray-700 text-left">
                      <strong>SKU:</strong> {receta.producto.sku}
                    </p>
                    <p className="text-gray-700 text-left">
                      <strong>Descripción:</strong>{" "}
                      {receta.producto.descripcion}
                    </p>
                    <p className="text-gray-700 text-left">
                      <strong>Categoría:</strong> {receta.producto.categoria}
                    </p>
                  </>
                ) : (
                  <div className="text-gray-500 text-sm text-left">
                    No hay datos de producto.
                  </div>
                )}
              </div>
              {/* Paquete */}
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200 flex-1 text-left">
                <h4 className="text-lg font-bold text-[#cc3399] mb-2 text-left">
                  Paquete
                </h4>
                {receta.paquete_material ? (
                  <>
                    <p className="text-gray-700 text-left">
                      <strong>SKU:</strong> {receta.paquete_material.sku}
                    </p>
                    <p className="text-gray-700 text-left">
                      <strong>Nombre:</strong> {receta.paquete_material.nombre}
                    </p>
                  </>
                ) : (
                  <div className="text-gray-500 text-sm text-left">
                    No hay datos de paquete.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        
        {/* Tabla de flores justo antes de la tabla de materiales */}
        {receta.producto &&
          Array.isArray(receta.producto.flores) &&
          receta.producto.flores.length > 0 && (
            <div className="mb-4">
              <h5 className="text-base font-bold text-[#FFB400] mb-2">
                Flores
              </h5>
              <div className="max-h-56 overflow-y-auto">
                <div className="max-h-36 overflow-y-auto overflow-x-auto rounded-lg border border-yellow-100 shadow-sm">
                  <table className="min-w-full divide-y divide-yellow-100 text-xs sm:text-sm">
                    <thead className="bg-gradient-to-r from-yellow-100 to-pink-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                          Variedad
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                          Color
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                          Calibre
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                          Precio
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                          Tallos
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-yellow-50">
                      {receta.producto.flores.map((flor: any) => {
                        const tallos = flor.pivot?.tallos || 0;
                        const precio = parseFloat(flor.precios) || 0;
                        const subtotal = precio * tallos;
                        return (
                          <tr
                            key={flor.id}
                            className="hover:bg-yellow-50 transition"
                          >
                            <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap">
                              {flor.variedad}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap">
                              {flor.tipo}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap">
                              {flor.color}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-700 font-semibold">
                              {flor.calibre}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-700 font-semibold">
                              ${precio.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-700 font-semibold">
                              {tallos}
                            </td>
                            <td className="px-3 py-2 text-sm text-center text-gray-700 font-semibold">
                              ${subtotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-yellow-50">
                        <td
                          colSpan={6}
                          className="px-3 py-2 text-right font-bold text-[#FFB400]"
                        >
                          Total flores:
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-[#FFB400]">
                          $
                          {receta.producto.flores
                            .reduce((total: number, flor: any) => {
                              const tallos = flor.pivot?.tallos || 0;
                              const precio = parseFloat(flor.precios) || 0;
                              return total + precio * tallos;
                            }, 0)
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        <div className="mb-4">
          <h4 className="text-lg font-bold text-[#FFB400] mb-2">Materiales</h4>
          {Array.isArray(receta.materiales) && receta.materiales.length > 0 ? (
            <div className="max-h-56 overflow-y-auto">
              <div className="max-h-36 overflow-y-auto overflow-x-auto rounded-lg border border-pink-100 shadow-sm">
                <table className="min-w-full divide-y divide-pink-100 text-xs sm:text-sm">
                  <thead className="bg-gradient-to-r from-pink-100 to-yellow-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                        Marca
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-[#cc3399] uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-pink-50">
                    {receta.materiales.map((mat: any) => {
                      const cantidad =
                        parseFloat(
                          mat.cantidad_material ?? mat.cantidad ?? 1
                        ) || 1;
                      const precio = parseFloat(mat.precio) || 0;
                      return (
                        <tr
                          key={mat.id}
                          className="hover:bg-pink-50 transition"
                        >
                          <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                            {mat.sku}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap text-left">
                            {mat.descripcion}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap text-left">
                            {mat.marca}
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-gray-700 font-semibold">
                            {cantidad}
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-gray-700 font-semibold">
                            ${precio.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-gray-700 font-semibold">
                            ${(precio * cantidad).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-pink-50">
                      <td
                        colSpan={5}
                        className="px-3 py-2 text-right font-bold text-[#cc3399]"
                      >
                        Total materiales:
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-[#cc3399]">
                        ${totalMateriales.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              No hay materiales registrados.
            </div>
          )}
        </div>

        {/* Pie tipo factura con desglose de totales y edición de descripción/imagen */}
        {/* Pie tipo factura con desglose de totales y edición de descripción/imagen */}
        <div className="mt-6 pt-4 border-t border-pink-200">
          {/* Total receta arriba */}
          <div className="mb-4 text-right">
            <span className="font-bold text-pink-700 text-lg">
              Total receta:
            </span>
            <span className="text-pink-700 font-bold text-lg ml-2">
              ${(totalMateriales + costoProducto).toFixed(2)}
            </span>
          </div>
          {/* Observaciones e imagen en la misma fila */}

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Imagen */}
            <div className="flex-1">
              <label className="block font-bold text-pink-700 mb-1">
                Imagen:
              </label>
              <div className="flex items-center gap-4">
                {editImagen || receta.imagen ? (
                  <img
                    src={
                      editImagen
                        ? URL.createObjectURL(editImagen)
                        : `https://api-sales.eqrapp.com/storage/${receta.imagen}`
                    }
                    alt="Receta"
                    className="w-14 h-14 object-cover rounded border border-pink-200 cursor-pointer"
                                     // ...existing code...
                                  
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const preview = document.createElement("div");
                      preview.style.position = "fixed";
                      preview.style.left = rect.left - 330 + "px"; // 330px es el ancho aprox. del preview
                      preview.style.top = rect.top - 170 + "px";   // Cambia -20 por -120 para que suba más
                      preview.style.zIndex = "9999";
                      preview.style.background = "rgba(255,255,255,0.98)";
                      preview.style.border = "1px solid #ccc";
                      preview.style.borderRadius = "10px";
                      preview.style.boxShadow = "0 4px 24px 0 rgba(0,0,0,0.18)";
                      preview.style.padding = "8px";
                      preview.style.pointerEvents = "none";
                      preview.className = "modal-img-preview";
                      const img = document.createElement("img");
                      img.src = editImagen
                        ? URL.createObjectURL(editImagen)
                        : `https://api-sales.eqrapp.com/storage/${receta.imagen}`;
                      img.style.maxWidth = "320px";
                      img.style.maxHeight = "320px";
                      img.style.borderRadius = "8px";
                      img.style.display = "block";
                      preview.appendChild(img);
                      document.body.appendChild(preview);
                    }}
                    // ...existing code...
                    // ...existing code...
                    onMouseLeave={() => {
                      document
                        .querySelectorAll(".modal-img-preview")
                        .forEach((el) => el.remove());
                    }}
                    title={receta.sku || "imagen"}
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No hay imagen</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditImagen(
                      e.target.files && e.target.files[0]
                        ? e.target.files[0]
                        : null
                    )
                  }
                  className="block text-sm border border-pink-200 rounded p-1 w-32 sm:w-55"
                />
              </div>
            </div>
            {/* Observaciones */}
            <div className="flex-1">
              <label className="block font-bold text-gray-700 mb-1">
                Observaciones:
              </label>
              <textarea
                className="w-full border border-pink-200 rounded p-2 text-sm"
                value={editDescripcion}
                onChange={(e) => setEditDescripcion(e.target.value)}
                rows={3}
                placeholder="Descripción de la receta"
              />
            </div>
          </div>
          {/* Botón actualizar */}
          <button
            onClick={handleUpdateDescripcionImagen}
            disabled={loadingUpdate}
            className="mt-4 px-4 py-2 text-white rounded hover:bg-pink-700 transition-colors w-full sm:w-auto"
            style={{ background: loadingUpdate ? "#ccc" : "#cc3399" }}
          >
            {loadingUpdate
              ? "Actualizando..."
              : "Actualizar descripción e imagen"}
          </button>
          {errorUpdate && (
            <div className="mt-2 text-red-600 text-xs">{errorUpdate}</div>
          )}
        </div>
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

export default RecetaModal;
