import { consultarRazonSocialPorRuc } from "../../constants/externas";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { createCarguera } from "../../services/entidadesService";
import { API_ENDPOINTS, getAuthHeaders } from "../../constants/api";
import SuccessModal from "../modals/SuccessModal";

interface WizardCargueraProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: {
    nombreCarguera: React.RefObject<HTMLInputElement | null>;
    rucCarguera: React.RefObject<HTMLInputElement | null>;
    contactoCarguera: React.RefObject<HTMLInputElement | null>;
    telefonoCarguera: React.RefObject<HTMLInputElement | null>;
    emailCarguera: React.RefObject<HTMLInputElement | null>;
    representanteCarguera: React.RefObject<HTMLInputElement | null>;
    origenCarguera: React.RefObject<HTMLSelectElement | null>;
    estadoCarguera: React.RefObject<HTMLSelectElement | null>;
  };
  handleAutoSave?: () => void;
  onCreated?: () => void;
  editCarguera?: any | null;
  onClose?: () => void;
}

const WizardCarguera: React.FC<WizardCargueraProps> = ({
  showWizard,
  setShowWizard,
  refs,
  handleAutoSave,
  onCreated,
  editCarguera,
  onClose,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key:string]:boolean}>({});
  // const [coolers, setCoolers] = useState<{ id: number, label: string }[]>([]);
  // const [selectedCooler, setSelectedCooler] = useState<string>("");
  // Estado local para el switch de estado
  const [estadoSwitch, setEstadoSwitch] = useState(true);
  const [diasConexion, setDiasConexion] = useState<string>("");
  const [showDiasConexion, setShowDiasConexion] = useState<boolean>(false);
  const [diasTrabajo, setDiasTrabajo] = useState<string[]>([]);
  const [horarioRecepcionInicio, setHorarioRecepcionInicio] = useState("");
  const [horarioRecepcionFin, setHorarioRecepcionFin] = useState("");

  // Efecto para inicializar los campos si editCarguera cambia
  useEffect(() => {
    if (showWizard && editCarguera) {
      // Inicializar horarios de recepción si existen
      if (editCarguera.horariosRecepcion && (refs.origenCarguera.current?.value === 'Origen' || editCarguera.origen === 'Origen')) {
        const [inicio, fin] = String(editCarguera.horariosRecepcion).split('-');
        setHorarioRecepcionInicio(inicio || "");
        setHorarioRecepcionFin(fin || "");
      } else {
        setHorarioRecepcionInicio("");
        setHorarioRecepcionFin("");
      }
      if (refs.nombreCarguera.current)
        refs.nombreCarguera.current.value = editCarguera.nombre || "";
      if (refs.rucCarguera.current)
        refs.rucCarguera.current.value = editCarguera.ruc || "";
      if (refs.contactoCarguera.current)
        refs.contactoCarguera.current.value = editCarguera.contacto || "";
      if (refs.telefonoCarguera.current)
        refs.telefonoCarguera.current.value = editCarguera.telefono || "";
      if (refs.emailCarguera.current)
        refs.emailCarguera.current.value = editCarguera.email || "";
      if (refs.representanteCarguera.current)
        refs.representanteCarguera.current.value = editCarguera.representante || "";
      if (refs.origenCarguera.current)
        refs.origenCarguera.current.value = editCarguera.origen || "";
      if (refs.estadoCarguera.current)
        refs.estadoCarguera.current.value = editCarguera.estado || "Activo";
      // setSelectedCooler(editCarguera.cooler_id ? String(editCarguera.cooler_id) : "");
      // Inicializar días de conexión
      setDiasConexion(
        editCarguera.diasConexion !== undefined && editCarguera.diasConexion !== null
          ? String(editCarguera.diasConexion)
          : ""
      );
      // Inicializar días de trabajo
      if (editCarguera.diasTrabajo) {
        if (Array.isArray(editCarguera.diasTrabajo)) {
          setDiasTrabajo(editCarguera.diasTrabajo.map((d: any) => String(d).toLowerCase()));
        } else if (typeof editCarguera.diasTrabajo === 'string') {
          setDiasTrabajo(editCarguera.diasTrabajo.split(',').map((d: string) => d.trim().toLowerCase()).filter(Boolean));
        } else {
          setDiasTrabajo([]);
        }
      } else {
        setDiasTrabajo([]);
      }
    } else if (showWizard && !editCarguera) {
      // Limpiar campos si es nuevo
      if (refs.nombreCarguera.current) refs.nombreCarguera.current.value = "";
      if (refs.rucCarguera.current) refs.rucCarguera.current.value = "";
      if (refs.contactoCarguera.current) refs.contactoCarguera.current.value = "";
      if (refs.telefonoCarguera.current) refs.telefonoCarguera.current.value = "";
      if (refs.emailCarguera.current) refs.emailCarguera.current.value = "";
      if (refs.representanteCarguera.current) refs.representanteCarguera.current.value = "";
      if (refs.origenCarguera.current) refs.origenCarguera.current.value = "";
      if (refs.estadoCarguera.current) refs.estadoCarguera.current.value = "Activo";
      // setSelectedCooler("");
      setDiasConexion("");
      setDiasTrabajo([]);
    }
    // Ocultar el modal de éxito cada vez que se abre el wizard
    setShowSuccessModal(false);
    setSuccess("");
    // Determinar si mostrar Días de Conexión según el valor de origen
    if (refs.origenCarguera.current) {
      setShowDiasConexion(refs.origenCarguera.current.value === 'Destino');
    }
  }, [showWizard, editCarguera, refs]);

  // Mostrar/ocultar Días de Conexión cuando cambia origen
  useEffect(() => {
    const handleOrigenChange = () => {
      if (refs.origenCarguera.current) {
        setShowDiasConexion(refs.origenCarguera.current.value === 'Destino');
        if (refs.origenCarguera.current.value !== 'Destino') {
          setDiasConexion("");
        }
      }
    };
    const origenRef = refs.origenCarguera.current;
    if (origenRef) {
      origenRef.addEventListener('change', handleOrigenChange);
    }
    return () => {
      if (origenRef) {
        origenRef.removeEventListener('change', handleOrigenChange);
      }
    };
  }, [refs.origenCarguera]);

  // Eliminado: Cargar coolers al abrir el wizard

  // Sincronizar el switch con el valor del ref al abrir el wizard
  useEffect(() => {
    if (showWizard && refs.estadoCarguera.current) {
      const valor = refs.estadoCarguera.current.value;
      setEstadoSwitch(valor === 'Activo' || valor === 'true');
    }
  }, [showWizard, refs.estadoCarguera]);

  if (!showWizard) return null;

  // Crear o actualizar
  const handleCreateOrUpdate = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    setFieldErrors({});
    const requiredFields = [
      { key: 'nombreCarguera', label: t('form.name') },
      { key: 'rucCarguera', label: t('form.ruc') },
      { key: 'contactoCarguera', label: t('form.contact') },
      { key: 'telefonoCarguera', label: t('form.phone') },
      { key: 'emailCarguera', label: t('form.email') },
      { key: 'representanteCarguera', label: t('form.representative') },
      { key: 'origenCarguera', label: t('form.origin') },
    ];
    let errors: {[key:string]:boolean} = {};
    // Añadir validación para días de conexión solo si se muestra el campo
    if (showDiasConexion) {
      if (!diasConexion || isNaN(Number(diasConexion)) || Number(diasConexion) < 1) {
        errors['diasConexion'] = true;
      }
    }
    // Validación para días de trabajo (debe seleccionar al menos uno)
    if (!diasTrabajo || diasTrabajo.length === 0) {
      errors['diasTrabajo'] = true;
    }
    requiredFields.forEach(f => {
      const ref = refs[f.key as keyof typeof refs];
      if (!ref?.current?.value || ref.current.value.trim() === "") {
        errors[f.key] = true;
      }
    });
    // Eliminado: Validación para Cuarto Frío
    // Validación especial para el switch de estado
    if (typeof estadoSwitch !== 'boolean') {
      errors['estadoCarguera'] = true;
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    try {
      // Concatenar horario de recepción si origen es 'Origen'
      let horariosRecepcion = "";
      if (refs.origenCarguera.current?.value === "Origen") {
        if (horarioRecepcionInicio && horarioRecepcionFin) {
          horariosRecepcion = `${horarioRecepcionInicio}-${horarioRecepcionFin}`;
        }
      }
      const tipoTransporte = (document.querySelector('select[name="tipoTransporte"]') as HTMLSelectElement | null)?.value || "";
      const data = {
        nombre: refs.nombreCarguera.current?.value || "",
        ruc: refs.rucCarguera.current?.value || "",
        contacto: refs.contactoCarguera.current?.value || "",
        telefono: refs.telefonoCarguera.current?.value || "",
        email: refs.emailCarguera.current?.value || "",
        representante: refs.representanteCarguera.current?.value || "",
        origen: refs.origenCarguera.current?.value || "",
        estado: estadoSwitch, // Usar el valor del switch
        // cooler_id: selectedCooler ? Number(selectedCooler) : null,
        diasConexion: showDiasConexion && diasConexion ? Number(diasConexion) : null,
        diasTrabajo: diasTrabajo.length > 0 ? diasTrabajo.join(",") : null,
        horariosRecepcion,
        tipo: tipoTransporte,
      };
      if (editCarguera && editCarguera.id) {
        // UPDATE
        const response = await fetch(
          API_ENDPOINTS.CARGUERAS.UPDATE(editCarguera.id),
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) throw new Error(t('clients.messages.error'));
        setSuccess(t('clients.messages.updated'));
      } else {
        // CREATE
        await createCarguera(data);
        setSuccess(t('clients.messages.created'));
      }
      setShowSuccessModal(true);
      setDiasTrabajo([]);
      if (onCreated) onCreated();
      setTimeout(() => {
        if (onClose) onClose();
        else setShowWizard(false);
      }, 1500);
    } catch (e) {
      setError(
        editCarguera
          ? t('clients.messages.error')
          : t('clients.messages.error')
      );
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
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {t('form.title_carguera')}
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
        {/* Switch de estado en la parte superior */}
        <div className="mb-4 flex items-center">
          <label className="block text-sm font-medium text-gray-700 mr-3">
             {t('form.state')}
          </label>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={estadoSwitch}
                onChange={e => {
                  setEstadoSwitch(e.target.checked);
                  if (refs.estadoCarguera.current) {
                    refs.estadoCarguera.current.value = e.target.checked ? 'Activo' : 'Inactivo';
                  }
                  if (handleAutoSave) handleAutoSave();
                }}
              />
              <div
                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${
                  estadoSwitch
                    ? 'peer-checked:bg-[#cc3399] bg-[#cc3399]'
                    : 'peer-checked:bg-gray-300 bg-gray-300'
                }`}
              ></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
            </label>
            <span
              className={`ml-2 text-xs font-medium ${
                estadoSwitch ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              {estadoSwitch ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          {fieldErrors['estadoCarguera'] && <div className="text-red-500 text-xs mt-1">{fieldErrors['estadoCarguera']}</div>}
        </div>
        {/* Formulario */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="space-y-3">
            {/* Cada campo en una fila */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.ruc')}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{13}"
                maxLength={13}
                name="rucCarguera"
                ref={refs.rucCarguera}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['rucCarguera'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('clients.form.placeholders.carrierRuc')}
                required
                title="El RUC debe tener exactamente 13 dígitos"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d]/g, '').slice(0, 13);
                }}
                onBlur={async e => {
                  const ruc = e.target.value.trim();
                  if (ruc.length === 13) {
                    const razonSocial = await consultarRazonSocialPorRuc(ruc);
                    if (razonSocial && refs.representanteCarguera.current) {
                      refs.representanteCarguera.current.value = razonSocial;
                    }
                  }
                  if (handleAutoSave) handleAutoSave();
                }}
              />
              {fieldErrors['rucCarguera'] && <div className="text-red-500 text-xs mt-1">{fieldErrors['rucCarguera']}</div>}
              {fieldErrors['rucCarguera'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('form.ruc')})}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.name')}
              </label>
              <input
                type="text"
                name="nombreCarguera"
                ref={refs.nombreCarguera}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['nombreCarguera'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('form.placeholders.name')}
                required
              />
              {fieldErrors['nombreCarguera'] && <div className="text-red-500 text-xs mt-1">{fieldErrors['nombreCarguera']}</div>}
              {fieldErrors['nombreCarguera'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('form.name')})}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.contact')}
              </label>
              <input
                type="text"
                name="contactoCarguera"
                ref={refs.contactoCarguera}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['contactoCarguera'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('form.placeholders.contact')}
                required
              />
              {fieldErrors['contactoCarguera'] && <div className="text-red-500 text-xs mt-1">{fieldErrors['contactoCarguera']}</div>}
              {fieldErrors['contactoCarguera'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('form.contact')})}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.phone')}
              </label>
              <input
                type="text"
                name="telefonoCarguera"
                ref={refs.telefonoCarguera}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['telefonoCarguera'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('form.placeholders.phone')}
                required
              />
              {fieldErrors['telefonoCarguera'] && <div className="text-red-500 text-xs mt-1">{fieldErrors['telefonoCarguera']}</div>}
              {fieldErrors['telefonoCarguera'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('form.phone')})}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.email')}
              </label>
              <input
                type="email"
                name="emailCarguera"
                ref={refs.emailCarguera}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['emailCarguera'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('form.placeholders.email')}
                required
              />
              {fieldErrors['emailCarguera'] && <div className="text-red-500 text-xs mt-1">{fieldErrors['emailCarguera']}</div>}
              {fieldErrors['emailCarguera'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('form.email')})}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.representative')}
              </label>
              <input
                type="text"
                name="representanteCarguera"
                ref={refs.representanteCarguera}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['representanteCarguera'] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('form.placeholders.representative')}
                required
              />
              {fieldErrors['representanteCarguera'] && <div className="text-red-500 text-xs mt-1">{fieldErrors['representanteCarguera']}</div>}
              {fieldErrors['representanteCarguera'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('form.representative')})}</div>}
            </div>
              {/* Select tipo de transporte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Transporte
                </label>
                <select
                  name="tipoTransporte"
                  className="bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300"
                  defaultValue=""
                >
                  <option value="">Seleccione tipo...</option>
                  <option value="maritimo">Marítimo</option>
                  <option value="aereo">Aéreo</option>
                </select>
              </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.origin')}
              </label>
              <select
                name="origenCarguera"
                ref={refs.origenCarguera}
                onChange={handleAutoSave}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['origenCarguera'] ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">{t('form.placeholders.origin')}</option>
                <option value="Origen">Origen</option>
                <option value="Destino">Destino</option>
              </select>
              {fieldErrors['origenCarguera'] && <div className="text-red-500 text-xs mt-1">{fieldErrors['origenCarguera']}</div>}
              {fieldErrors['origenCarguera'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('form.origin')})}</div>}
            </div>
            {/* Campo Días de Conexión debajo de Origen, solo visible si origen es Destino */}
            {showDiasConexion && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.connection_days', 'Días de Conexión')}
                </label>
                <input
                  type="number"
                  min={1}
                  name="diasConexion"
                  value={diasConexion}
                  onChange={e => setDiasConexion(e.target.value)}
                  className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors['diasConexion'] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={t('form.placeholders.connection_days', 'Ej: 7')}
                  required
                />
                {fieldErrors['diasConexion'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('form.connection_days', 'Días de Conexión')})}</div>}
              </div>
            )}
            {/* Campo horariosRecepcion solo si origenCarguera es 'Origen' */}
            {refs.origenCarguera.current && refs.origenCarguera.current.value === 'Origen' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horarios de Recepción
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    name="horarioRecepcionInicio"
                    value={horarioRecepcionInicio}
                    onChange={e => setHorarioRecepcionInicio(e.target.value)}
                    className="bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300"
                  />
                  <span className="px-2">a</span>
                  <input
                    type="time"
                    name="horarioRecepcionFin"
                    value={horarioRecepcionFin}
                    onChange={e => setHorarioRecepcionFin(e.target.value)}
                    className="bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300"
                  />
                </div>
              </div>
            )}
            {/* Campo Días de Trabajo debajo de Días de Conexión, siempre visible */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dias_work')}

              </label>
              <Select
                isMulti
                name="diasTrabajo"
                options={[
                  { value: t("lunes"), label: t("lunes") },
                  { value: t("martes"), label: t("martes") },
                  { value: t("miercoles"), label: t("miercoles") },
                  { value: t("jueves"), label: t("jueves") },
                  { value: t("viernes"), label: t("viernes") },
                  { value: t("sabado"), label: t("sabado") },
                  { value: t("domingo"), label: t("domingo") },
                ]}
                value={diasTrabajo.map(dia => {
                  const dias = [
                    { value: t("lunes"), label: t("lunes") },
                    { value: t("martes"), label: t("martes") },
                    { value: t("miercoles"), label: t("miercoles") },
                    { value: t("jueves"), label: t("jueves") },
                    { value: t("viernes"), label: t("viernes") },
                    { value: t("sabado"), label: t("sabado") },
                    { value: t("domingo"), label: t("domingo") },
                  ];
                  return dias.find(opt => opt.value === dia) || { value: dia, label: dia };
                })}
                onChange={selected => {
                  setDiasTrabajo(Array.isArray(selected) ? selected.map(opt => opt.value) : []);
                }}
                classNamePrefix="react-select"
                className="w-full text-sm px-2 py-1 border-2 border-white focus:border-fuchsia-300 rounded-md bg-white"
                menuPortalTarget={typeof window !== "undefined" ? window.document.body : undefined}
                menuPosition="fixed"
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                placeholder={t('select')}
                isDisabled={loading}
              />
              {fieldErrors['diasTrabajo'] && <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('form.working_days', 'Días de Trabajo')})}</div>}
            </div>
            {/* ...el campo de estado se movió arriba... */}
            {/* Eliminado campo de Cuarto Frío */}
          </div>
        </div>
        {/* El campo Días de Conexión ahora es condicional y está dentro del bloque de campos */}
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
              ? editCarguera
                ? t('common.updating', 'Actualizando...')
                : t('common.creating', 'Creando...')
              : editCarguera
              ? t('common.update')
              : t('common.create')}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {/* El mensaje de éxito solo se muestra en el modal, no aquí */}
        <SuccessModal
          open={showSuccessModal}
          message={success}
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </>
  );
};

export default WizardCarguera;
