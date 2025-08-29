import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPais } from "../../services/entidadesService";
import { API_ENDPOINTS, getAuthHeaders } from "../../constants/api";
import SuccessModal from '../modals/SuccessModal';

interface WizardPaisProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: {
    nombrePais: React.RefObject<HTMLInputElement | null>;
    codsriPais: React.RefObject<HTMLInputElement | null>;
    paraisofiscalPais: React.RefObject<HTMLInputElement | null>;
    codpfPais: React.RefObject<HTMLInputElement | null>;
  };
  handleAutoSave?: () => void;
  onCreated?: () => void;
  editPais?: any | null;
  onClose?: () => void;
  hideCloseButton?: boolean; // <-- Added prop
  tableHeight?: number; // NUEVO
}

const WizardPais: React.FC<WizardPaisProps> = ({
  showWizard,
  setShowWizard,
  refs,
  handleAutoSave,
  onCreated,
  editPais,
  onClose,
  hideCloseButton = false, // <-- Default to false
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
    codsri?: boolean;
    codpf?: boolean;
    sriFormat?: boolean;
    nombreDuplicado?: boolean;
    codsriDuplicado?: boolean;
    codpfDuplicado?: boolean;
  }>({});
  const [paises, setPaises] = useState<any[]>([]);

  // Obtener lista de países al abrir el wizard
  useEffect(() => {
    async function fetchPaises() {
      try {
        const resp = await fetch(API_ENDPOINTS.PAISES.LIST, {
          headers: getAuthHeaders(),
        });
        if (resp.ok) {
          const data = await resp.json();
          setPaises(Array.isArray(data) ? data : []);
        }
      } catch {}
    }
    if (showWizard) fetchPaises();
  }, [showWizard]);

  // Efecto para inicializar los campos si editPais cambia
  useEffect(() => {
    if (showWizard && editPais) {
      if (refs.nombrePais.current) refs.nombrePais.current.value = editPais.nombre || "";
      if (refs.codsriPais.current) refs.codsriPais.current.value = editPais.codsri || "";
      if (refs.paraisofiscalPais.current) refs.paraisofiscalPais.current.checked = !!editPais.paraisofiscal;
      if (refs.codpfPais.current) refs.codpfPais.current.value = editPais.codpf || "";
      setEstado(editPais.estado === true || editPais.estado === 1);
    } else if (showWizard && !editPais) {
      if (refs.nombrePais.current) refs.nombrePais.current.value = "";
      if (refs.codsriPais.current) refs.codsriPais.current.value = "";
      if (refs.paraisofiscalPais.current) refs.paraisofiscalPais.current.checked = false;
      if (refs.codpfPais.current) refs.codpfPais.current.value = "";
      setEstado(true);
    }
    setShowSuccessModal(false);
    setSuccess("");
  }, [showWizard, editPais, refs]);

  if (!showWizard) return null;

  // Crear o actualizar
  const handleCreateOrUpdate = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});
    const nombre = refs.nombrePais.current?.value?.trim() || "";
    const codsri = refs.codsriPais.current?.value?.trim() || "";
    const codpf = refs.codpfPais.current?.value?.trim() || "";
    let errors: {nombre?: boolean; codsri?: boolean; codpf?: boolean; sriFormat?: boolean; nombreDuplicado?: boolean; codsriDuplicado?: boolean; codpfDuplicado?: boolean} = {};

    if (!nombre) errors.nombre = true;
    if (!codsri) errors.codsri = true;
    if (!codpf) errors.codpf = true;
    if (codsri && !/^\d{3}$/.test(codsri)) errors.sriFormat = true;
    // Validación de duplicados (solo en modo crear)
    if (!editPais) {
      if (paises.some(p => p.nombre?.toLowerCase() === nombre.toLowerCase())) {
        errors.nombreDuplicado = true;
      }
      if (paises.some(p => p.codsri === codsri)) {
        errors.codsriDuplicado = true;
      }
      if (paises.some(p => p.codpf === codpf)) {
        errors.codpfDuplicado = true;
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      
      if (errors.nombre) setError(t('fieldRequired', {field: t('clients.form.countryName')}));
      else if (errors.codsri) setError(t('fieldRequired', {field: t('clients.form.sriCode')}));
      else if (errors.codpf) setError(t('fieldRequired', {field: t('clients.form.pfCode')}));
      else if (errors.sriFormat) setError(t('countries.messages.invalidSriCode', 'El código SRI debe tener 3 dígitos'));
      else if (errors.nombreDuplicado) setError(t('countries.messages.duplicateName', 'El nombre ya existe'));
      else if (errors.codsriDuplicado) setError(t('countries.messages.duplicateSriCode', 'El código SRI ya existe'));
      else if (errors.codpfDuplicado) setError(t('countries.messages.duplicatePfCode', 'El código PF ya existe'));
      return;
    }
    setLoading(true);
    try {
      const data = {
        nombre: refs.nombrePais.current?.value.trim(),
        codsri: refs.codsriPais.current?.value.trim(),
        paraisofiscal: refs.paraisofiscalPais.current?.checked || false,
        codpf: refs.codpfPais.current?.value.trim(),
        estado: estado,
      };
      
      if (editPais && editPais.id) {
        // UPDATE
        const response = await fetch(API_ENDPOINTS.PAISES.UPDATE(editPais.id), {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          let errorMsg = t('countries.messages.error');
          let errorFieldObj = {};
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) errorMsg = errorData.message;
            if (errorData && errorData.errors) {
              errorFieldObj = {
                nombreDuplicado: !!errorData.errors.nombre,
                codsriDuplicado: !!errorData.errors.codsri,
                codpfDuplicado: !!errorData.errors.codpf,
              };
              setFieldErrors((prev) => ({ ...prev, ...errorFieldObj }));
            }
          } catch {}
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        setSuccess(t('countries.messages.updated', 'País actualizado correctamente'));
      } else {
        // CREATE
        let resp;
        try {
          resp = await createPais(data);
        } catch (err: any) {
          // Si createPais lanza, intentamos extraer el mensaje y los errores de campos
          let errorMsg = t('countries.messages.error');
          if (err && err.message) errorMsg = err.message;
          setError(errorMsg);
          // Mostrar errores específicos en los campos
          if (err && err.errors) {
            setFieldErrors((prev) => ({
              ...prev,
              nombreDuplicado: !!err.errors.nombre,
              codsriDuplicado: !!err.errors.codsri,
              codpfDuplicado: !!err.errors.codpf,
            }));
          }
          console.error("Error en creación/actualización", err);
          return;
        }
        
        setSuccess(t('countries.messages.created'));
      }
      setShowSuccessModal(true);
      if (onCreated) onCreated();
      setTimeout(() => {
        if (onClose) onClose();
        else setShowWizard(false);
      }, 1500);
    } catch (e: any) {
      let errorMsg = t('countries.messages.error');
      if (e && e.message) errorMsg = e.message;
      setError(errorMsg);
      // Mostrar errores específicos en los campos también en catch general
      if (e && e.errors) {
        setFieldErrors((prev) => ({
          ...prev,
          nombreDuplicado: !!e.errors.nombre,
          codsriDuplicado: !!e.errors.codsri,
          codpfDuplicado: !!e.errors.codpf,
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
            {t('clients.form.countryData')}
          </h3>
          <div className="flex items-center space-x-2">
            {/* Only show close button if hideCloseButton is false */}
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
        {/* Formulario de país */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.form.countryName')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="nombrePais"
                ref={refs.nombrePais}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('clients.form.placeholders.countryName')}
                required
                pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                title="Solo letras y espacios"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
                }}
              />
              {fieldErrors.nombre && (
                <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('clients.form.countryName')})}</div>
              )}
              {fieldErrors.nombreDuplicado && (
                <div className="text-red-500 text-xs mt-1">{t('countries.messages.duplicateName', 'El nombre ya existe')}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.form.sriCode')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{3}"
                maxLength={3}
                name="codsriPais"
                ref={refs.codsriPais}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.codsri || fieldErrors.sriFormat ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('clients.form.placeholders.sriCode')}
                required
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d]/g, '').slice(0, 3);
                }}
              />
              {fieldErrors.codsri && (
                <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('clients.form.sriCode')})}</div>
              )}
              {fieldErrors.codsriDuplicado && (
                <div className="text-red-500 text-xs mt-1">{t('countries.messages.duplicateSriCode', 'El código SRI ya existe')}</div>
              )}
              {fieldErrors.sriFormat && (
                <div className="text-red-500 text-xs mt-1">{t('countries.messages.invalidSriCode', 'El código SRI debe tener 3 dígitos')}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.form.taxHaven')}
              </label>
              <input
                type="checkbox"
                name="paraisofiscalPais"
                ref={refs.paraisofiscalPais}
                onBlur={handleAutoSave}
                className="mr-2"
              />
              <span>{t('common.active')}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.form.pfCode')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="codpfPais"
                ref={refs.codpfPais}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.codpf ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('clients.form.placeholders.pfCode')}
                required
              />
              {fieldErrors.codpf && (
                <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('clients.form.pfCode')})}</div>
              )}
              {fieldErrors.codpfDuplicado && (
                <div className="text-red-500 text-xs mt-1">{t('countries.messages.duplicatePfCode', 'El código PF ya existe')}</div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleCreateOrUpdate}
            className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
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
              ? (editPais ? t('common.updating', 'Actualizando...') : t('common.creating', 'Creando...'))
              : (editPais ? t('common.update', 'Actualizar') : t('common.create', 'Crear'))}
          </button>
        </div>
        {/* El mensaje de error general ya no es necesario, los errores aparecen debajo de cada campo */}
        {/* El mensaje de éxito solo se muestra en el modal, no aquí */}
        <SuccessModal open={showSuccessModal} message={success} onClose={() => setShowSuccessModal(false)} />
      </div>
    </>
  );
};

export default WizardPais;
