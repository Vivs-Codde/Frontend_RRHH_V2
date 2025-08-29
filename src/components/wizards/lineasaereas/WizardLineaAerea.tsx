import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { lineaAereaService } from "../../../services/lineaAereaService";
import SuccessModal from "../../modals/SuccessModal";
import type { LineaAerea } from "../../../types/lineaAerea";

interface WizardLineaAereaProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: {
    code: React.RefObject<HTMLInputElement | null>;
    name: React.RefObject<HTMLInputElement | null>;
    status: React.RefObject<HTMLSelectElement | null>;
  };
  handleAutoSave?: () => void;
  onCreated?: () => void;
  editLineaAerea?: LineaAerea | null;
  onClose?: () => void;
  hideCloseButton?: boolean; // NUEVO
  tableHeight?: number; // NUEVO
}

const WizardLineaAerea: React.FC<WizardLineaAereaProps> = ({
  showWizard,
  setShowWizard,
  refs,
  handleAutoSave,
  onCreated,
  editLineaAerea,
  onClose,
  hideCloseButton = false, // NUEVO
  tableHeight
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // Usar 'active'/'inactive' como valor interno
  const [status, setStatus] = useState("active");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({
    code: false,
    name: false,
  });

  // Efecto para inicializar los campos si editLineaAerea cambia
  useEffect(() => {
    if (showWizard && editLineaAerea) {
      if (refs.code.current)
        refs.code.current.value = editLineaAerea.code || "";
      if (refs.name.current)
        refs.name.current.value = editLineaAerea.name || "";
      setStatus(editLineaAerea.status || "active");
    } else if (showWizard && !editLineaAerea) {
      if (refs.code.current) refs.code.current.value = "";
      if (refs.name.current) refs.name.current.value = "";
      setStatus("active");
    }
  }, [showWizard, editLineaAerea, refs]);

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
    setError("");
    setSuccess("");
    setFieldErrors({ code: false, name: false, codeDuplicado: false, nameDuplicado: false });
    const code = refs.code.current?.value?.trim() || "";
    const name = refs.name.current?.value?.trim() || "";
    let errors: { code?: boolean; name?: boolean; codeDuplicado?: boolean; nameDuplicado?: boolean } = {};
    if (!code) errors.code = true;
    if (!name) errors.name = true;
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    try {
      setLoading(true);
      const lineaAereaData = {
        code,
        name,
        status: status, // Guardar como 'active'/'inactive'
      };
      if (editLineaAerea) {
        await lineaAereaService.update(editLineaAerea.id, lineaAereaData);
        setSuccess(t("updateSuccess"));
      } else {
        try {
          await lineaAereaService.create(lineaAereaData);
          setSuccess(t("createSuccess"));
        } catch (error: any) {
          // Si el backend responde con errores de duplicado
          let errorMsg = error.message || t("errorSave");
          setError(errorMsg);
          if (error && error.errors) {
            setFieldErrors((prev) => ({
              ...prev,
              codeDuplicado: !!error.errors.code,
              nameDuplicado: !!error.errors.name,
            }));
          }
          console.error(t("errorSave"), error);
          return;
        }
      }
      setShowSuccessModal(true);
      if (onCreated) {
        onCreated();
      }
    } catch (error: any) {
      console.error(t("errorSave"), error);
      setError(error.message || t("errorSave"));
      if (error && error.errors) {
        setFieldErrors((prev) => ({
          ...prev,
          codeDuplicado: !!error.errors.code,
          nameDuplicado: !!error.errors.name,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // No cerrar el wizard automáticamente, así permanece abierto tras crear
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
  style={
    tableHeight
      ? { height: tableHeight, maxHeight: tableHeight, minHeight: tableHeight }
      : { maxHeight: '85vh' }
  }
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {editLineaAerea ? t("editTitleA") : t("formTitleA")}
          </h3>
          <div className="flex items-center space-x-2">
            {/* Botón cerrar solo si hideCloseButton no es true */}
            {!hideCloseButton && (
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
            )}
          </div>
        </div>

        {/* Switch de estado en la parte superior */}
        <div className="mb-4 flex items-center">
          <label className="block text-sm font-medium text-gray-700 mr-3">
            {t("status")} *
          </label>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={status === "active"}
                onChange={e => setStatus(e.target.checked ? "active" : "inactive")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 peer-checked:bg-[#cc3399]"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
            </label>
            <span className="ml-3 text-sm font-medium text-gray-700 select-none">
              {status === "active" ? t("active") : t("inactive")}
            </span>
          </div>
        </div>
        {/* Formulario */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="space-y-3">
            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("code")} *
              </label>
              <input
                ref={refs.code}
                type="text"
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors?.code ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t("code")}
                maxLength={3}
                pattern="^[A-Za-z0-9]{3}$"
                title={t("code") + " (3)"}
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 3);
                }}
              />
              {fieldErrors?.code && (
                <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('code')})}</div>
              )}
              {fieldErrors?.codeDuplicado && (
                <div className="text-red-500 text-xs mt-1">{t('duplicateCode', 'El código ya existe')}</div>
              )}
            </div>
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("name")} *
              </label>
              <input
                ref={refs.name}
                type="text"
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors?.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t("name")}
                pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                title={t("name")}
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
                }}
              />
              {fieldErrors?.name && (
                <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('name')})}</div>
              )}
              {fieldErrors?.nameDuplicado && (
                <div className="text-red-500 text-xs mt-1">{t('duplicateName', 'El nombre ya existe')}</div>
              )}
            </div>
            {/* ...el campo de estado se movió arriba... */}
            {/* Mensaje de error general debajo del formulario, si existe y no es error de campo */}
            {error && !fieldErrors.code && !fieldErrors.name && (
              <div className="text-red-500 text-xs mt-2 text-center">{error}</div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            {/* Botón cancelar solo si hideCloseButton no es true */}
            {!hideCloseButton && (
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="px-4 py-2 rounded-md transition-colors"
                style={{
                  background: "#6b7280",
                  color: "#fff",
                }}
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
              {loading ? t("loading") : editLineaAerea ? t("update") : t("save")}
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

export default WizardLineaAerea;
