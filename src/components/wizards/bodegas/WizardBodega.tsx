import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { bodegaService } from "../../../services/bodegaService";
import type { Bodega } from "../../../types/bodega";
import type { BodegaFormRefs } from "../../../hooks/useBodegaFormRefs";
import { useTranslation } from "react-i18next";

interface WizardBodegaProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: BodegaFormRefs;
  onCreated: () => void;
  editBodega?: Bodega | null;
  onClose: () => void;
  hideCloseButton?: boolean; // <-- Nuevo prop opcional
    tableHeight?: number; // NUEVO: altura dinámica de la tabla
}

const WizardBodega: React.FC<WizardBodegaProps> = ({
  showWizard,
  setShowWizard,
  refs,
  onCreated,
  editBodega,
  onClose,
  hideCloseButton = false, // <-- default
  tableHeight, // NUEVO: altura dinámica de la tabla
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [bodegas, setBodegas] = useState<any[]>([]);
  // Obtener lista de bodegas al abrir el wizard
  useEffect(() => {
    async function fetchBodegas() {
      try {
        const resp = await bodegaService.getAll();
        setBodegas(Array.isArray(resp) ? resp : []);
      } catch {}
    }
    if (showWizard) fetchBodegas();
  }, [showWizard]);
  const [statusSwitch, setStatusSwitch] = useState(true);

  // Función para limpiar el formulario y los errores
  const resetForm = () => {
    if (refs.codigo.current) refs.codigo.current.value = "";
    if (refs.nombre.current) refs.nombre.current.value = "";
    setStatusSwitch(true);
    setErrors({});
  };

  useEffect(() => {
    if (showWizard && editBodega) {
      if (refs.codigo.current) refs.codigo.current.value = editBodega.codigo;
      if (refs.nombre.current) refs.nombre.current.value = editBodega.nombre;
      setStatusSwitch(editBodega.status);
    } else if (showWizard && !editBodega) {
      resetForm();
    }
  }, [showWizard, editBodega, refs]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const codigo = refs.codigo.current?.value?.trim() || "";
    const nombre = refs.nombre.current?.value?.trim() || "";
    // Validar código (3 dígitos alfanuméricos)
    if (!codigo) {
      newErrors.codigo = "El código es requerido";
    } else if (!/^[A-Za-z0-9]{3}$/.test(codigo)) {
      newErrors.codigo = "El código debe tener exactamente 3 caracteres alfanuméricos";
    }
    // Validar nombre (no caracteres especiales)
    if (!nombre) {
      newErrors.nombre = "El nombre es requerido";
    } else if (!/^[A-Za-z0-9\s]+$/.test(nombre)) {
      newErrors.nombre = "El nombre no puede contener caracteres especiales";
    } else if (nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    } else if (nombre.length > 50) {
      newErrors.nombre = "El nombre no puede exceder 50 caracteres";
    }
    // Validación de duplicados solo en modo crear
    if (!editBodega) {
      if (bodegas.some(b => b.codigo?.toUpperCase() === codigo.toUpperCase())) {
        newErrors.codigo = "El código ya existe";
      }
      if (bodegas.some(b => b.nombre?.toLowerCase() === nombre.toLowerCase())) {
        newErrors.nombre = "El nombre ya existe";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const bodegaData = {
        codigo: refs.codigo.current?.value?.trim().toUpperCase() || "",
        nombre: refs.nombre.current?.value?.trim() || "",
        status: statusSwitch,
      };
      if (editBodega) {
        await bodegaService.update(editBodega.id, bodegaData);
      } else {
        try {
          await bodegaService.create(bodegaData);
        } catch (error: any) {
          // Captura errores del backend y los muestra debajo del campo correspondiente
          let backendErrors = {};
          if (error && error.message) {
            if (error.message.includes('código')) backendErrors = { ...backendErrors, codigo: error.message };
            if (error.message.includes('nombre')) backendErrors = { ...backendErrors, nombre: error.message };
            if (!('codigo' in backendErrors) && !('nombre' in backendErrors)) backendErrors = { general: error.message };
          }
          setErrors(backendErrors);
          setLoading(false);
          return;
        }
      }
      onCreated();
      resetForm();
      handleClose();
    } catch (error: any) {
      console.error("Error al guardar bodega:", error);
      setErrors({ general: error.message || "Error al guardar la bodega" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setShowWizard(false);
    if (onClose) onClose();
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
  style={
    tableHeight
      ? { height: tableHeight, maxHeight: tableHeight, minHeight: tableHeight }
      : { maxHeight: '85vh' }
  }
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          {editBodega ? t("editTitleB") : t("formTitleB")}
        </h3>
        {/* Switch de estado debajo del título */}
        <div className="flex items-center mb-6">
          <label className="block text-sm font-medium text-gray-700 mr-3">
            {t("status")} *
          </label>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={statusSwitch}
              onChange={e => setStatusSwitch(e.target.checked)}
              disabled={loading}
            />
            <div className={`w-11 h-6 ${statusSwitch ? "bg-[#cc3399]" : "bg-gray-300"} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full transition-colors duration-200`}></div>
            <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${statusSwitch ? "translate-x-5" : ""}`}></div>
          </label>
          <span className="ml-3 text-sm font-medium text-gray-700 select-none">
            {statusSwitch ? t("active") : t("inactive")}
          </span>
        </div>
        <div className="flex justify-end items-center mb-2">
          {/* Solo mostrar el botón de cerrar si hideCloseButton es false */}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("code")} *
            </label>
            <input
              ref={refs.codigo}
              type="text"
              maxLength={3}
              pattern="^[A-Za-z0-9]{3}$"
              placeholder="Ej: BOD"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.codigo ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
              onInput={e => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 3);
                if (errors.codigo) {
                  const newErrors = { ...errors };
                  delete newErrors.codigo;
                  setErrors(newErrors);
                }
              }}
            />
            {errors.codigo && (
              <p className="text-red-500 text-xs mt-1">{errors.codigo}</p>
            )}
          </div>
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("name")} *
            </label>
            <input
              ref={refs.nombre}
              type="text"
              maxLength={50}
              placeholder="Ej: Bodega Central"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
              title="Solo letras y espacios"
              onInput={e => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
                if (errors.nombre) {
                  const newErrors = { ...errors };
                  delete newErrors.nombre;
                  setErrors(newErrors);
                }
              }}
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>
          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
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
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              style={{
                background: "#cc3399",
                color: "#fff",
              }}
              disabled={loading}
            >
              {loading ? "Guardando..." : editBodega ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default WizardBodega;
export { WizardBodega };
