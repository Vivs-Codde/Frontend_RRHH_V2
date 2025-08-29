import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { categoriaService } from "../../../services/categoriaService";
import type { Categoria } from "../../../types/categoria";
import type { CategoriaFormRefs } from "../../../hooks/useCategoriaFormRefs";
import SuccessModal from "../../modals/SuccessModal";
import { useTranslation } from "react-i18next";

interface WizardCategoriaProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: CategoriaFormRefs;
  onCreated: () => void;
  editCategoria?: Categoria | null;
  onClose: () => void;
  hideCloseButton?: boolean; // NUEVO: opcional
}

const WizardCategoria: React.FC<WizardCategoriaProps> = ({
  showWizard,
  setShowWizard,
  refs,
  onCreated,
  editCategoria,
  onClose,
  hideCloseButton = false, // NUEVO: default false
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key:string]:boolean}>({});

  // Opciones para el select de tipo
  const tipoOptions = [
    t("Producto"),
    t("Servicio"),
    t("Otro")
  ];

  // Limpiar el formulario y el error
  const resetForm = () => {
    if (refs.tipo.current) refs.tipo.current.value = "";
    if (refs.nombreCategoria?.current) refs.nombreCategoria.current.value = "";
    setError("");
  };

  useEffect(() => {
    if (showWizard && editCategoria) {
      if (refs.tipo.current) refs.tipo.current.value = editCategoria.tipo;
      if (refs.nombreCategoria?.current) refs.nombreCategoria.current.value = editCategoria.nombreCategoria;
    } else if (showWizard) {
      resetForm();
    }
  }, [showWizard, editCategoria, refs]);

  // Llamar resetForm al cerrar el wizard
  const handleClose = () => {
    resetForm();
    setShowWizard(false);
    if (onClose) onClose();
  };

  const handleSave = async () => {
    setError("");
    setFieldErrors({});
    try {
      setLoading(true);
      const newFieldErrors: {[key:string]:boolean} = {};
      if (!refs.tipo.current?.value?.trim()) newFieldErrors['tipo'] = true;
      if (!refs.nombreCategoria?.current?.value?.trim()) newFieldErrors['nombreCategoria'] = true;
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setLoading(false);
        return;
      }
      const categoriaData = {
        tipo: refs.tipo.current?.value?.trim() || "",
        nombreCategoria: refs.nombreCategoria.current?.value?.trim() || "",
      };
      if (editCategoria) {
        await categoriaService.update(editCategoria.id, categoriaData);
      } else {
        await categoriaService.create(categoriaData);
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        onCreated();
        resetForm();
        setShowWizard(false);
      }, 1500);
    } catch (error: any) {
      console.error("Error al guardar categoría:", error);
      setError(error.message || "Error al guardar la categoría");
    } finally {
      setLoading(false);
    }
  };

  if (!showWizard) return null;

  return (
    <>
      {/* Overlay para pantallas pequeñas */}
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
        onClick={handleClose}
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
            {editCategoria ? t("editTitle") : t("formTitle")}
          </h3>
          <div className="flex items-center space-x-2">
            {/* Botón cerrar solo si hideCloseButton no es true */}
            {!hideCloseButton && (
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                style={{
                  background: "#cc3399",
                  color: "#fff",
                }}
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("tipo")} *
            </label>
            <select
              ref={refs.tipo}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors['tipo'] ? 'border-red-500' : 'border-gray-300'}`}
              disabled={loading}
            >
              <option value="">{t("selectTipoPlaceholder")}</option>
              {tipoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldErrors['tipo'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('tipo')})}</div>}
          </div>

          {/* Nombre Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("nombre")} *
            </label>
            <input
              ref={refs.nombreCategoria}
              type="text"
              maxLength={50}
              placeholder={t("nombre")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors['nombreCategoria'] ? 'border-red-500' : 'border-gray-300'}`}
              disabled={loading}
            />
            {fieldErrors['nombreCategoria'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('nombreCategoria')})}</div>}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            {/* Botón cancelar solo si hideCloseButton no es true */}
            {!hideCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-md transition-colors"
                style={{
                  background: "#6b7280",
                  color: "#fff",
                }}
                disabled={loading}
              >
                {t("cancel")}
              </button>
            )}
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
              {loading ? t("loading") : editCategoria ? t("update") : t("save")}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={
            editCategoria
              ? t("updateSuccess")
              : t("createSuccess")
          }
        />
      )}
    </>
  );
};

export default WizardCategoria;
