import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getAuthHeaders, API_ENDPOINTS } from "../../constants/api";
import { createDepartamento, updateDepartamento } from "../../services/departamentosService";
import type { Departamento } from "../../services/departamentosService";
import SuccessModal from "../modals/SuccessModal";

interface WizardDepartamentoProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: {
    nombreDepartamento: React.RefObject<HTMLInputElement | null>;
    colorDepartamento: React.RefObject<HTMLInputElement | null>;
  };
  handleAutoSave?: () => void;
  onCreated?: () => void;
  editDepartamento?: Departamento | null;
  onClose?: () => void;
  hideCloseButton?: boolean;
  tableHeight?: number;
}

const WizardDepartamento: React.FC<WizardDepartamentoProps> = ({
  showWizard,
  setShowWizard,
  refs,
  handleAutoSave,
  onCreated,
  editDepartamento,
  onClose,
  hideCloseButton = false,
  tableHeight
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [estado, setEstado] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{
    nombre?: boolean;
    color?: boolean;
    nombreDuplicado?: boolean;
  }>({});
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  // Obtener lista de departamentos al abrir el wizard
  useEffect(() => {
    async function fetchDepartamentos() {
      try {
        const resp = await fetch(API_ENDPOINTS.DEPARTAMENTOS.LIST, {
          headers: getAuthHeaders(),
        });
        if (resp.ok) {
          const data = await resp.json();
          setDepartamentos(Array.isArray(data.data?.data) ? data.data.data : []);
        }
      } catch {}
    }
    if (showWizard) fetchDepartamentos();
  }, [showWizard]);

  // Efecto para inicializar los campos si editDepartamento cambia
  useEffect(() => {
    if (showWizard && editDepartamento) {
      if (refs.nombreDepartamento.current) refs.nombreDepartamento.current.value = editDepartamento.nombre || "";
      if (refs.colorDepartamento.current) refs.colorDepartamento.current.value = editDepartamento.color || "";
      // Verificar el estado como booleano o como valor 1/0
      setEstado(editDepartamento.estado === true || editDepartamento.estado === 1 as unknown as boolean);
    } else if (showWizard && !editDepartamento) {
      if (refs.nombreDepartamento.current) refs.nombreDepartamento.current.value = "";
      if (refs.colorDepartamento.current) refs.colorDepartamento.current.value = "#FF5733";
      setEstado(true);
    }
    setShowSuccessModal(false);
    setSuccess("");
  }, [showWizard, editDepartamento, refs]);

  if (!showWizard) return null;

  // Crear o actualizar
  const handleCreateOrUpdate = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});
    const nombre = refs.nombreDepartamento.current?.value?.trim() || "";
    const color = refs.colorDepartamento.current?.value?.trim() || "";
    let errors: {nombre?: boolean; color?: boolean; nombreDuplicado?: boolean} = {};

    if (!nombre) errors.nombre = true;
    if (!color) errors.color = true;
    
    // Validación de duplicados (solo en modo crear)
    if (!editDepartamento) {
      if (departamentos.some(d => d.nombre?.toLowerCase() === nombre.toLowerCase())) {
        errors.nombreDuplicado = true;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      
      if (errors.nombre) setError(t('fieldRequired', {field: 'Nombre del departamento'}));
      else if (errors.color) setError(t('fieldRequired', {field: 'Color del departamento'}));
      else if (errors.nombreDuplicado) setError('El nombre del departamento ya existe');
      return;
    }
    
    setLoading(true);
    try {
      const data = {
        nombre: refs.nombreDepartamento.current?.value.trim() || "",
        color: refs.colorDepartamento.current?.value.trim() || "",
        estado: estado,
      };
      
      if (editDepartamento && editDepartamento.id) {
        // UPDATE
        await updateDepartamento(editDepartamento.id, data);
        setSuccess('Departamento actualizado correctamente');
      } else {
        // CREATE
        await createDepartamento(data);
        setSuccess('Departamento creado correctamente');
      }
      
      setShowSuccessModal(true);
      if (onCreated) onCreated();
      setTimeout(() => {
        if (onClose) onClose();
        else setShowWizard(false);
      }, 1500);
    } catch (e: any) {
      let errorMsg = 'Error al guardar el departamento';
      if (e && e.message) errorMsg = e.message;
      setError(errorMsg);
      
      if (e && e.errors) {
        setFieldErrors((prev) => ({
          ...prev,
          nombreDuplicado: !!e.errors.nombre,
        }));
      }
      console.error("Error en creación/actualización", e);
    } finally {
      setLoading(false);
    }
  };

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
            {editDepartamento ? 'Editar Departamento' : 'Nuevo Departamento'}
          </h3>
          <div className="flex items-center space-x-2">
            {!hideCloseButton && (
              <button
                onClick={() => {
                  if (onClose) onClose();
                  else setShowWizard(false);
                }}
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
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="space-y-4">
            {/* Estado - En la parte superior */}
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('common.status', 'Estado')}
              </label>
              <label className="relative inline-flex items-center cursor-pointer select-none ml-2">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={estado}
                  onChange={() => setEstado((prev) => !prev)}
                />
                <div
                  className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                    estado ? 'peer-checked:bg-[#cc3399] bg-[#cc3399]' : 'peer-checked:bg-gray-300 bg-gray-300'
                  }`}
                ></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
              </label>
              <span className={`ml-2 text-xs font-medium ${estado ? 'text-green-700' : 'text-gray-500'}`}>
                {estado ? t('common.active', 'Activo') : t('common.inactive', 'Inactivo')}
              </span>
            </div>

            {/* Nombre del Departamento */}
            <div>
              <label
                htmlFor="nombreDepartamento"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Departamento *
              </label>
              <input
                type="text"
                name="nombreDepartamento"
                id="nombreDepartamento"
                ref={refs.nombreDepartamento as React.RefObject<HTMLInputElement>}
                className={`w-full p-2 border ${
                  fieldErrors.nombre || fieldErrors.nombreDuplicado
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } rounded-md`}
                placeholder="Ej: Recursos Humanos"
              />
              {fieldErrors.nombreDuplicado && (
                <p className="mt-1 text-xs text-red-600">
                  Este departamento ya existe
                </p>
              )}
            </div>
            
            {/* Color del Departamento */}
            <div>
              <label
                htmlFor="colorDepartamento"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Color del Departamento (Hexadecimal) *
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  className="h-10 w-10 mr-2 rounded border-0"
                  value={refs.colorDepartamento.current?.value || "#FF5733"}
                  onChange={(e) => {
                    if (refs.colorDepartamento.current) {
                      refs.colorDepartamento.current.value = e.target.value;
                    }
                  }}
                />
                <input
                  type="text"
                  name="colorDepartamento"
                  id="colorDepartamento"
                  ref={refs.colorDepartamento as React.RefObject<HTMLInputElement>}
                  className={`flex-1 p-2 border ${
                    fieldErrors.color
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } rounded-md`}
                  placeholder="Ej: #FF5733"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              else setShowWizard(false);
            }}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateOrUpdate}
            className="px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
            style={{
              background: "#cc3399",
              color: "#fff",
              fontFamily:
                "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading
              ? (editDepartamento ? t('common.updating', 'Actualizando...') : t('common.creating', 'Creando...'))
              : (editDepartamento ? t('common.update', 'Actualizar') : t('common.create', 'Crear'))}
          </button>
        </div>
        
        {/* Modal de éxito */}
        <SuccessModal open={showSuccessModal} message={success} onClose={() => setShowSuccessModal(false)} />
      </div>
    </>
  );
};

export default WizardDepartamento;
