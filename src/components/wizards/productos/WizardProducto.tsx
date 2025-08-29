import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { productoService } from "../../../services/productoService";
import SuccessModal from "../../modals/SuccessModal";
import type { Producto } from "../../../types/producto";
import { mapProductoToFrontend, mapProductoToBackend } from "../../../utils/productoMapper";

interface WizardProductoProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: {
    sku: React.RefObject<HTMLInputElement | null>;
    category: React.RefObject<HTMLSelectElement | null>;
    subCategory: React.RefObject<HTMLSelectElement | null>;
    variety: React.RefObject<HTMLSelectElement | null>;
    color: React.RefObject<HTMLSelectElement | null>;
    grade: React.RefObject<HTMLSelectElement | null>;
    tallosBunche: React.RefObject<HTMLInputElement | null>;
    caliber: React.RefObject<HTMLInputElement | null>;
    status: React.RefObject<HTMLSelectElement | null>;
  };
  handleAutoSave?: () => void;
  onCreated?: () => void;
  editProducto?: Producto | null;
  onClose?: () => void;
}

const WizardProducto: React.FC<WizardProductoProps> = ({
  showWizard,
  setShowWizard,
  refs,
  handleAutoSave,
  onCreated,
  editProducto,
  onClose,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Datos para los selects
  const categorias = [
    "Flores frescas",
    "Plantas ornamentales",
    "Follaje",
    "Semillas"
  ];

  const subCategorias = [
    "Rosas",
    "Claveles",
    "Alstroemerias",
    "Gerberas",
    "Lirios"
  ];

  const varieties = [
    "Variedad A",
    "Variedad B",
    "Variedad C",
    "Premium",
    "Estándar"
  ];

  const colors = [
    "Rojo",
    "Blanco",
    "Rosa",
    "Amarillo",
    "Naranja",
    "Púrpura",
    "Multicolor"
  ];

  const grades = [
    "Premium",
    "Primera",
    "Segunda",
    "Tercera",
    "Exportación"
  ];

  const statusOptions = [
    "Activo",
    "Inactivo",
    "Descontinuado"
  ];

  // Efecto para inicializar los campos si editProducto cambia
  useEffect(() => {
    if (showWizard && editProducto) {
      // Convertir el producto del backend al formato que usa el frontend
      const productoMapped = mapProductoToFrontend(editProducto);
      
      if (refs.sku.current)
        refs.sku.current.value = productoMapped.sku || "";
      if (refs.category.current)
        refs.category.current.value = productoMapped.category || "";
      if (refs.subCategory.current)
        refs.subCategory.current.value = productoMapped.subCategory || "";
      if (refs.variety.current)
        refs.variety.current.value = productoMapped.variety || "";
      if (refs.color.current)
        refs.color.current.value = productoMapped.color || "";
      if (refs.grade.current)
        refs.grade.current.value = productoMapped.grade || "";
      if (refs.tallosBunche.current)
        refs.tallosBunche.current.value = productoMapped.tallosBunche?.toString() || "";
      if (refs.caliber.current)
        refs.caliber.current.value = productoMapped.caliber || "";
      if (refs.status.current)
        refs.status.current.value = productoMapped.status || "";
    }
  }, [showWizard, editProducto, refs]);

  // Limpiar campos cuando se cierra el wizard
  useEffect(() => {
    if (!showWizard) {
      Object.values(refs).forEach(ref => {
        if (ref.current) {
          ref.current.value = "";
        }
      });
      setError("");
      setSuccess("");
    }
  }, [showWizard, refs]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      // Validar campos requeridos
      if (!refs.sku.current?.value?.trim()) {
        setError("El SKU es obligatorio");
        return;
      }

      if (!refs.category.current?.value) {
        setError("La categoría es obligatoria");
        return;
      }

      if (!refs.subCategory.current?.value) {
        setError("La subcategoría es obligatoria");
        return;
      }

      if (!refs.variety.current?.value) {
        setError("La variedad es obligatoria");
        return;
      }

      if (!refs.color.current?.value) {
        setError("El color es obligatorio");
        return;
      }

      if (!refs.grade.current?.value) {
        setError("El grado es obligatorio");
        return;
      }

      if (!refs.tallosBunche.current?.value) {
        setError("Los tallos por bunche son obligatorios");
        return;
      }

      if (!refs.caliber.current?.value?.trim()) {
        setError("El calibre es obligatorio");
        return;
      }

      if (!refs.status.current?.value) {
        setError("El estado es obligatorio");
        return;
      }

      // Construir objeto con datos del producto para el frontend
      const productoDataFrontend = {
        sku: refs.sku.current.value.trim(),
        category: refs.category.current.value,
        subCategory: refs.subCategory.current.value,
        variety: refs.variety.current.value,
        color: refs.color.current.value,
        grade: refs.grade.current.value,
        tallosBunche: parseInt(refs.tallosBunche.current.value) || 0,
        caliber: refs.caliber.current.value.trim(),
        status: refs.status.current.value,
      };

      // Convertir a formato del backend
      const productoData = mapProductoToBackend(productoDataFrontend);

      if (editProducto) {
        await productoService.update(editProducto.id, productoData);
        setSuccess("Producto actualizado exitosamente");
      } else {
        await productoService.create(productoData);
        setSuccess("Producto creado exitosamente");
      }

      setShowSuccessModal(true);
      
      // Llamar al callback si existe
      if (onCreated) {
        onCreated();
      }

    } catch (error: any) {
      console.error("Error al guardar producto:", error);
      setError(error.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setShowWizard(false);
    if (onClose) {
      onClose();
    }
  };

  if (!showWizard) return null;

  return (
    <>
      {/* Overlay para pantallas pequeñas */}
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
        onClick={() => setShowWizard(false)}
      ></div>
      {/* Wizard Panel */}
      <div
        className={`
          fixed md:relative inset-0 md:inset-auto z-50 md:z-0
          bg-white rounded-lg shadow-md 
          m-4 md:m-0 p-4 md:w-96
          max-h-[95vh] md:max-h-[85vh] overflow-y-auto
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {editProducto ? "Editar Producto" : "Datos del Producto"}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowWizard(false)}
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
              style={{
                background: "#cc3399",
                color: "#fff",
                fontFamily:
                  "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Formulario */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="space-y-3">
            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                ref={refs.sku}
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                placeholder="Ingrese el SKU del producto"
              />
            </div>

            {/* Categoría y Subcategoría en la misma fila */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  ref={refs.category}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                >
                  <option value="">Seleccione</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoría *
                </label>
                <select
                  ref={refs.subCategory}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                >
                  <option value="">Seleccione</option>
                  {subCategorias.map((subCat) => (
                    <option key={subCat} value={subCat}>
                      {subCat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Variedad y Color en la misma fila */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variedad *
                </label>
                <select
                  ref={refs.variety}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                >
                  <option value="">Seleccione</option>
                  {varieties.map((variety) => (
                    <option key={variety} value={variety}>
                      {variety}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color *
                </label>
                <select
                  ref={refs.color}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                >
                  <option value="">Seleccione</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grado y Estado en la misma fila */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grado *
                </label>
                <select
                  ref={refs.grade}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                >
                  <option value="">Seleccione</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  ref={refs.status}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                >
                  <option value="">Seleccione</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tallos Bunche y Calibre en la misma fila */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tallos Bunche *
                </label>
                <input
                  ref={refs.tallosBunche}
                  type="text"
                  inputMode="numeric"
                  min="1"
                  maxLength={2}
                  pattern="^\d{1,2}$"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                  placeholder="Número"
                  onInput={e => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/[^\d]/g, '').slice(0, 2);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calibre *
                </label>
                <input
                  ref={refs.caliber}
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                  placeholder="Calibre"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowWizard(false)}
              className="px-4 py-2 rounded-md transition-colors"
              style={{
                background: "#6b7280",
                color: "#fff",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              style={{
                background: "#cc3399",
                color: "#fff",
              }}
            >
              {loading ? "Guardando..." : editProducto ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          open={showSuccessModal}
          message={success}
          onClose={handleCloseSuccessModal}
        />
      )}
    </>
  );
};

export default WizardProducto;
