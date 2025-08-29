// ...existing code...
// ...existing code...
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { transportistaService } from "../../../services/transportistaService";
import SuccessModal from "../../modals/SuccessModal";
import type { Transportista } from "../../../types/transportista";
import { API_LOCAL_BASE_URL, consultarNombreComercialPorCI, consultarModeloPorPlaca, consultarPropietarioPorPlaca } from "../../../constants/externas";

interface WizardTransportistaProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: {
    placa: React.RefObject<HTMLInputElement | null>;
    propietario: React.RefObject<HTMLInputElement | null>;
    modelo: React.RefObject<HTMLInputElement | null>;
    ci: React.RefObject<HTMLInputElement | null>;
    chofer: React.RefObject<HTMLInputElement | null>;
    licencia: React.RefObject<HTMLInputElement | null>;
    status: React.RefObject<HTMLInputElement | null>; // Cambiado a HTMLInputElement
  };
  handleAutoSave?: () => void;
  onCreated?: () => void;
  editTransportista?: Transportista | null;
  onClose?: () => void;
}

const WizardTransportista: React.FC<WizardTransportistaProps> = ({
  showWizard,
  setShowWizard,
  refs,
  handleAutoSave,
  onCreated,
  editTransportista,
  onClose,
}) => {
  // Consulta SRI por Placa y autocompleta modelo y propietario usando función externa
  const handlePlacaBlur = async () => {
    const placa = refs.placa.current?.value?.trim();
    if (!placa) return;
    // Consultar la API local /api/consulta-auto para obtener modelo y propietario
    setLoadingModelo(true);
    setLoadingPropietario(true);
    if (refs.modelo.current) refs.modelo.current.value = "Cargando...";
    if (refs.propietario.current) refs.propietario.current.value = "Cargando...";
    try {
      const url = `${API_LOCAL_BASE_URL}/api/consulta-auto/?placa=${placa}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("No se pudo consultar la placa");
      const data = await response.json();
      // Modelo
      if (refs.modelo.current) {
        refs.modelo.current.value = data?.Modelo || "";
      }
      // Propietario
      if (refs.propietario.current) {
        refs.propietario.current.value = data?.Dueño || "";
      }
    } catch (e) {
      if (refs.modelo.current) refs.modelo.current.value = "";
      if (refs.propietario.current) refs.propietario.current.value = "";
    } finally {
      setLoadingModelo(false);
      setLoadingPropietario(false);
    }
  };
  // Consulta API local por CI y autocompleta chofer y licencia usando función externa
  const handleCIBlur = async () => {
    const ci = refs.ci.current?.value?.trim();
    if (!ci) return;
    const result = await consultarNombreComercialPorCI(ci);
    if (result?.nombre && refs.chofer.current) {
      refs.chofer.current.value = result.nombre;
    }
    if (refs.licencia.current) {
      if (result?.tipo_licencia) {
        refs.licencia.current.value = result.tipo_licencia;
      } else {
        refs.licencia.current.value = "";
      }
    }
  };
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [status, setStatus] = useState(true); // true = Activo, false = Inactivo
  // Estado para país
  const [pais, setPais] = useState<string>("Quito");
  const [loadingPropietario, setLoadingPropietario] = useState(false);
  const [loadingModelo, setLoadingModelo] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key:string]:boolean}>({});

  // Datos para los selects
  const statusOptions = [
    "Activo",
    "Inactivo",
    "Mantenimiento",
    "Fuera de Servicio"
  ];

  // Efecto para inicializar los campos si editTransportista cambia
  useEffect(() => {
    if (showWizard && editTransportista) {
      if (refs.placa.current)
        refs.placa.current.value = editTransportista.placa || "";
      if (refs.propietario.current)
        refs.propietario.current.value = editTransportista.propietario || "";
      if (refs.modelo.current)
        refs.modelo.current.value = editTransportista.modelo || "";
      if (refs.ci.current)
        refs.ci.current.value = editTransportista.ci || "";
      if (refs.chofer.current)
        refs.chofer.current.value = editTransportista.chofer || "";
      if (refs.licencia.current)
        refs.licencia.current.value = editTransportista.licencia || "";
      setStatus(editTransportista.status === "Activo");
    } else if (showWizard && !editTransportista) {
      setStatus(true);
      setPais("Quito");
    }
  }, [showWizard, editTransportista, refs]);

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
    setFieldErrors({});
    setLoading(true);
    // Validar campos requeridos
    const newFieldErrors: {[key:string]:boolean} = {};
    if (!refs.placa.current?.value?.trim()) newFieldErrors['placa'] = true;
    if (!refs.propietario.current?.value?.trim()) newFieldErrors['propietario'] = true;
    if (!refs.modelo.current?.value?.trim()) newFieldErrors['modelo'] = true;
    const ciValue = refs.ci.current?.value?.trim();
    if (!ciValue) newFieldErrors['ci'] = true;
    else if (!/^[0-9]{10}$/.test(ciValue)) newFieldErrors['ciFormato'] = true;
    if (!refs.chofer.current?.value?.trim()) newFieldErrors['chofer'] = true;
    if (!refs.licencia.current?.value?.trim()) newFieldErrors['licencia'] = true;
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }
    try {
      const transportistaData = {
        placa: refs.placa.current!.value.trim(),
        propietario: refs.propietario.current!.value.trim(),
        modelo: refs.modelo.current!.value.trim(),
        CI: refs.ci.current!.value.trim(), // Enviar como CI mayúsculas
        chofer: refs.chofer.current!.value.trim(),
        licencia: refs.licencia.current!.value.trim(),
        estado: status, // Booleano: true (Activo), false (Inactivo)
        pais: pais,
      };
     
      if (editTransportista) {
        await transportistaService.update(editTransportista.id, transportistaData);
        setSuccess(t("updateSuccess"));
      } else {
        await transportistaService.create(transportistaData);
        setSuccess(t("createSuccess"));
      }
      setShowSuccessModal(true);
      if (onCreated) {
        onCreated();
      }
    } catch (error: any) {
      console.error("Error al guardar transportista:", error);
      setError(error.message || "Error al guardar el transportista");
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
            {editTransportista ? t("editTitleT") : t("formTitleT")}
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

        {/* Switch de estado en la parte superior */}
        <div className="mb-4 flex items-center">
          <label className="block text-sm font-medium text-gray-700 mr-3">
            {t("status")} *
          </label>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                ref={refs.status}
                type="checkbox"
                className="sr-only peer"
                checked={status}
                onChange={e => setStatus(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 peer-checked:bg-[#cc3399]"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
            </label>
            <span className="ml-3 text-sm font-medium text-gray-700 select-none">
              {status ? t("active") : t("inactive")}
            </span>
          </div>
        </div>
          {/* Select País en la parte superior */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            País
          </label>
          <select
            className="bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300 font-semibold"
            value={pais}
            onChange={e => setPais(e.target.value)}
          >
            <option value="Quito">Quito</option>
            <option value="Miami">Miami</option>
          </select>
        </div>

        {/* Formulario */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="space-y-3">
            {/* Placa en una fila */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("plate_title")} *
              </label>
              <input
                ref={refs.placa}
                type="text"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 bg-white ${fieldErrors['placa'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t("plate")}
                onBlur={handlePlacaBlur}
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  // Solo letras y números, en mayúsculas
                  input.value = input.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                }}
              />
              {fieldErrors['placa'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('plate')})}</div>}
            </div>
            {/* Propietario en una sola fila */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("owner")} *
              </label>
              <input
                ref={refs.propietario}
                type="text"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 bg-white ${fieldErrors['propietario'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t("owner")}
                disabled={loadingPropietario}
                style={loadingPropietario ? { background: '#f3f4f6', color: '#a1a1aa', fontStyle: 'italic' } : {}}
              />
              {fieldErrors['propietario'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('owner')})}</div>}
            </div>
            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("model")} *
              </label>
              <input
                ref={refs.modelo}
                type="text"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 bg-white ${fieldErrors['modelo'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t("model")}
                disabled={loadingModelo}
                style={loadingModelo ? { background: '#f3f4f6', color: '#a1a1aa', fontStyle: 'italic' } : {}}
              />
              {fieldErrors['modelo'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('model')})}</div>}
            </div>

            {/* CI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CI *
              </label>
              <input
                ref={refs.ci}
                type="text"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 bg-white ${fieldErrors['ci'] || fieldErrors['ciFormato'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="CI"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10);
                }}
                onBlur={handleCIBlur}
              />
              {fieldErrors['ci'] && <div className="text-red-500 text-xs mt-1">Campo requerido</div>}
              {fieldErrors['ciFormato'] && <div className="text-red-500 text-xs mt-1">El CI debe tener exactamente 10 dígitos</div>}
            </div>
            {/* Chofer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("driver")} *
              </label>
              <input
                ref={refs.chofer}
                type="text"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 bg-white ${fieldErrors['chofer'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t("driver")}
              />
              {fieldErrors['chofer'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('driver')})}</div>}
            </div>

            {/* Licencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Licencia *
              </label>
              <input
                ref={refs.licencia}
                type="text"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 bg-white ${fieldErrors['licencia'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t("license")}
              />
              {fieldErrors['licencia'] && <div className="text-red-500 text-xs mt-1">Campo requerido</div>}
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
              {t("cancel")}
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
              {loading ? t("loading") : editTransportista ? t("update") : t("save")}
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

export default WizardTransportista;
