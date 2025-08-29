import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createCooler, getCoolers } from "../../services/entidadesService";
import { API_ENDPOINTS, getAuthHeaders } from "../../constants/api";
import SuccessModal from '../modals/SuccessModal';

interface WizartCoolerProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: {
    nombreCooler: React.RefObject<HTMLInputElement | null>;
    codigoCooler: React.RefObject<HTMLInputElement | null>;
  };
  handleAutoSave?: () => void;
  onCreated?: () => void;
  editCooler?: any | null;
  onClose?: () => void;
  defaultCargueraId?: string | number;
  defaultCargueraLabel?: string;
  hideCloseButton?: boolean;
  selectCarguera?: boolean; // NUEVO
  cargueras?: any[]; // NUEVO
  tableHeight?: number; // NUEVO
}

const WizartCooler: React.FC<WizartCoolerProps> = ({
  showWizard,
  setShowWizard,
  refs,
  handleAutoSave,
  onCreated,
  editCooler,
  onClose,
  defaultCargueraId,
  defaultCargueraLabel,
  hideCloseButton = false,
  selectCarguera = false, // default false
  cargueras = [], // default vacío
  tableHeight 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cargueraId, setCargueraId] = useState<string | number | undefined>(defaultCargueraId);
  const [estado, setEstado] = useState(true); // true = Activo, false = Inactivo
  const [fieldErrors, setFieldErrors] = useState<{[key:string]:boolean}>({});
  const [coolers, setCoolers] = useState<any[]>([]);
  // Obtener lista de coolers al abrir el wizard
  useEffect(() => {
    async function fetchCoolers() {
      try {
        const resp = await getCoolers();
        setCoolers(Array.isArray(resp) ? resp : []);
      } catch {}
    }
    if (showWizard) fetchCoolers();
  }, [showWizard]);

  // Use the label prop directly
  const cargueraLabel = defaultCargueraLabel || (cargueraId ? cargueraId.toString() : "");

  // Efecto para inicializar los campos si editCooler cambia
  useEffect(() => {
    if (showWizard && editCooler) {
      if (refs.nombreCooler.current) refs.nombreCooler.current.value = editCooler.nombre || "";
      if (refs.codigoCooler.current) refs.codigoCooler.current.value = editCooler.codigo || "";
      setEstado(editCooler.estado === 1 || editCooler.estado === true);
    } else if (showWizard && !editCooler) {
      if (refs.nombreCooler.current) refs.nombreCooler.current.value = "";
      if (refs.codigoCooler.current) refs.codigoCooler.current.value = "";
      setEstado(true);
    }
    setShowSuccessModal(false);
    setSuccess("");
  }, [showWizard, editCooler, refs]);

  useEffect(() => {
    if (showWizard && defaultCargueraId) {
      setCargueraId(defaultCargueraId);
    }
  }, [showWizard, defaultCargueraId]);

  if (!showWizard) return null;

  // Crear o actualizar
  const handleCreateOrUpdate = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    setFieldErrors({});
    const nombre = refs.nombreCooler.current?.value?.trim() || "";
    const codigo = refs.codigoCooler.current?.value?.trim() || "";
    let errors: {[key:string]:boolean} = {};
    if (!nombre) errors['nombreCooler'] = true;
    if (!codigo) errors['codigoCooler'] = true;
    if (selectCarguera && !cargueraId) errors['cargueraId'] = true;
    // Validación de duplicados solo en modo crear
    if (!editCooler) {
      if (coolers.some(c => c.nombre?.toLowerCase() === nombre.toLowerCase())) {
        errors['nombreDuplicado'] = true;
      }
      if (coolers.some(c => c.codigo === codigo)) {
        errors['codigoDuplicado'] = true;
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    try {
      const data = {
        nombre,
        codigo,
        cargueras_id: cargueraId ? Number(cargueraId) : undefined,
        estado: estado,
      };
      if (editCooler && editCooler.id) {
        // UPDATE
        const response = await fetch(API_ENDPOINTS.COOLERS.UPDATE(editCooler.id), {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          let errorMsg = t('clients.messages.error');
          let errorFieldObj = {};
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) errorMsg = errorData.message;
            if (errorData && errorData.errors) {
              errorFieldObj = {
                nombreDuplicado: !!errorData.errors.nombre,
                codigoDuplicado: !!errorData.errors.codigo,
              };
              setFieldErrors((prev) => ({ ...prev, ...errorFieldObj }));
            }
          } catch {}
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        setSuccess(t('clients.messages.updated'));
      } else {
        // CREATE
        let resp;
        try {
          resp = await createCooler(data);
        } catch (err) {
          let errorMsg = t('clients.messages.error');
          if (err && err.message) errorMsg = err.message;
          setError(errorMsg);
          if (err && err.errors) {
            setFieldErrors((prev) => ({
              ...prev,
              nombreDuplicado: !!err.errors.nombre,
              codigoDuplicado: !!err.errors.codigo,
            }));
          }
          return;
        }
        setSuccess(t('clients.messages.created'));
      }
      setShowSuccessModal(true);
      if (onCreated) onCreated();
      setTimeout(() => {
        if (onClose) onClose();
        else setShowWizard(false);
      }, 1500);
    } catch (e) {
      let errorMsg = t('clients.messages.error');
      if (e && e.message) errorMsg = e.message;
      setError(errorMsg);
      if (e && e.errors) {
        setFieldErrors((prev) => ({
          ...prev,
          nombreDuplicado: !!e.errors.nombre,
          codigoDuplicado: !!e.errors.codigo,
        }));
      }
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
            {t('clients.form.coolerData')}
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
        {/* Formulario de cooler */}
        {/* Switch de estado en la parte superior */}
        <div className="mb-4 flex items-center">
          <label className="block text-sm font-medium text-gray-700 mr-3">
            {t('common.status', 'Estado')}
          </label>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={estado}
                onChange={e => setEstado(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 peer-checked:bg-[#cc3399]"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
            </label>
            <span className="ml-3 text-sm font-medium text-gray-700 select-none">
              {estado ? t('common.active', 'Activo') : t('common.inactive', 'Inactivo')}
            </span>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="space-y-3">
            {/* Mostrar la carguera seleccionada o select según prop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.form.carrierName', 'Carguera asignada')}
              </label>
            {selectCarguera ? (
                <>
                  <select
                    className={`bg-white w-full p-2 border rounded-md text-gray-700 font-semibold focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['cargueraId'] ? 'border-red-500' : 'border-gray-300'}`}
                    value={cargueraId || ''}
                    onChange={e => setCargueraId(e.target.value)}
                    required
                  >
                    <option value="">{t('clients.form.selectCarrierFirst')}</option>
                    {cargueras.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nombre || c.name}</option>
                    ))}
                  </select>
                  {fieldErrors['cargueraId'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('clients.form.carrierName', 'Carguera asignada')})}</div>}
                </>
              ) : (
                <div className="bg-white w-full p-2 border border-gray-300 rounded-md text-gray-700 font-semibold">
                  {cargueraLabel}
                </div>
              )}
            </div>
            {/* Campo oculto para cargueraId */}
            <input type="hidden" name="cargueras_id" value={cargueraId || ''} readOnly />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.form.coolerName')}
              </label>
              <input
                type="text"
                name="nombreCooler"
                ref={refs.nombreCooler}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['nombreCooler'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('clients.form.placeholders.coolerName')}
                required
                pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                title="Solo letras y espacios"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
                  setFieldErrors(prev => ({
                    ...prev,
                    nombreDuplicado: false,
                    codigoDuplicado: false
                  }));
                }}
              />
              {fieldErrors['nombreCooler'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('clients.form.coolerName')})}</div>}
              {fieldErrors['nombreDuplicado'] && <div className="text-red-500 text-xs mt-1">{t('clients.messages.duplicateName', 'El nombre ya existe')}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.form.code')}
              </label>
              <input
                type="text"
                name="codigoCooler"
                ref={refs.codigoCooler}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['codigoCooler'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('clients.form.placeholders.code')}
                required
                maxLength={3}
                pattern="^[A-Za-z0-9]{3}$"
                title="Solo 3 caracteres alfanuméricos"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 3);
                  setFieldErrors(prev => ({
                    ...prev,
                    codigoDuplicado: false,
                    nombreDuplicado: false
                  }));
                }}
              />
              {fieldErrors['codigoCooler'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('clients.form.code')})}</div>}
              {fieldErrors['codigoDuplicado'] && <div className="text-red-500 text-xs mt-1">{t('clients.messages.duplicateCode', 'El código ya existe')}</div>}
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
            }}
            disabled={loading}
          >
            {loading
              ? (editCooler ? t('common.updating') : t('common.creating'))
              : (editCooler ? t('common.update') : t('common.create'))}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {/* El mensaje de éxito solo se muestra en el modal, no aquí */}
        <SuccessModal open={showSuccessModal} message={success} onClose={() => setShowSuccessModal(false)} />
      </div>
    </>
  );
};

export default WizartCooler;
