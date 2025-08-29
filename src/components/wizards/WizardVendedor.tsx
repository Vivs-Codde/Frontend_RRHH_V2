import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createVendedor } from "../../services/entidadesService";
import { API_ENDPOINTS, getAuthHeaders } from "../../constants/api";
import SuccessModal from '../modals/SuccessModal';

interface WizardVendedorProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: {
    nombreVendedor: React.RefObject<HTMLInputElement | null>;
    correoVendedor: React.RefObject<HTMLInputElement | null>;
    ubicacionVendedor: React.RefObject<HTMLInputElement | null>;
    telefonoVendedor: React.RefObject<HTMLInputElement | null>;
  };
  handleAutoSave?: () => void;
  onCreated?: () => void;
  editVendedor?: any | null;
  onClose?: () => void;
  hideCloseButton?: boolean; // NUEVO
  tableHeight?: number; // NUEVO: altura dinámica de la tabla
}

const WizardVendedor: React.FC<WizardVendedorProps> = ({
  showWizard,
  setShowWizard,
  refs,
  handleAutoSave,
  onCreated,
  editVendedor,
  onClose,
  hideCloseButton = false, // NUEVO
  tableHeight,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [estado, setEstado] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{nombre?: boolean; telefono?: boolean; correo?: boolean; ubicacion?: boolean; emailFormat?: boolean}>({});
  // --- Vacaciones ---
  const [showVacaciones, setShowVacaciones] = useState(false);
  const [vendedoresList, setVendedoresList] = useState<any[]>([]);
  const [vendedorAsignado, setVendedorAsignado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  // Cargar vendedores para el select (excepto el actual si edita)
  useEffect(() => {
    if (showWizard) {
      import("../../services/entidadesService").then(({ getVendedores }) => {
        getVendedores().then((data) => {
          let lista = Array.isArray(data) ? data : [];
          if (editVendedor) {
            lista = lista.filter((v) => v.id !== editVendedor.id);
          }
          setVendedoresList(lista);
          // Si hay backup, buscar el id por nombre
          if (editVendedor && editVendedor.vendedorBackup) {
            const backup = lista.find(v => (v.nombre || v.name) === editVendedor.vendedorBackup);
            setVendedorAsignado(backup ? String(backup.id) : "");
          } else {
            setVendedorAsignado("");
          }
        }).catch(() => {
          setVendedoresList([]);
          setVendedorAsignado("");
        });
      });
      setFechaInicio(editVendedor?.fechaInicio || "");
      setFechaFin(editVendedor?.fechaFin || "");
      setShowVacaciones(!!(editVendedor?.vendedorBackup || editVendedor?.fechaInicio || editVendedor?.fechaFin));
    }
  }, [editVendedor, showWizard]);

  // Efecto para inicializar los campos si editVendedor cambia
  useEffect(() => {
    if (showWizard && editVendedor) {
      if (refs.nombreVendedor.current) refs.nombreVendedor.current.value = editVendedor.nombre || "";
      if (refs.correoVendedor.current) refs.correoVendedor.current.value = editVendedor.correo || "";
      if (refs.ubicacionVendedor.current) refs.ubicacionVendedor.current.value = editVendedor.ubicacion || "";
      if (refs.telefonoVendedor.current) refs.telefonoVendedor.current.value = editVendedor.telefono || "";
      // Manejo más robusto del estado, contemplando diferentes formatos (booleano o numérico)
      const estadoValue = editVendedor.estado;
      setEstado(estadoValue === true || estadoValue === 1);
    } else if (showWizard && !editVendedor) {
      // Limpiar campos para un nuevo vendedor
      if (refs.nombreVendedor.current) refs.nombreVendedor.current.value = "";
      if (refs.correoVendedor.current) refs.correoVendedor.current.value = "";
      if (refs.ubicacionVendedor.current) refs.ubicacionVendedor.current.value = "";
      if (refs.telefonoVendedor.current) refs.telefonoVendedor.current.value = "";
      setEstado(true); // Por defecto activo
    }
    setShowSuccessModal(false);
    setSuccess("");
  }, [showWizard, editVendedor, refs]);

  if (!showWizard) return null;

  // Crear o actualizar
  const handleCreateOrUpdate = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});
    const nombre = refs.nombreVendedor.current?.value?.trim() || "";
    const telefono = refs.telefonoVendedor.current?.value?.trim() || "";
    const correo = refs.correoVendedor.current?.value?.trim() || "";
    const ubicacion = refs.ubicacionVendedor.current?.value?.trim() || "";
    let errors: {nombre?: boolean; telefono?: boolean; correo?: boolean; ubicacion?: boolean; emailFormat?: boolean} = {};
    if (!nombre) errors.nombre = true;
    if (!telefono) errors.telefono = true;
    if (!correo) errors.correo = true;
    if (!ubicacion) errors.ubicacion = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (correo && !emailRegex.test(correo)) errors.emailFormat = true;
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Solo muestra el primer error general arriba
      if (errors.nombre) setError(t('fieldRequired', {field: t('clients.form.salespersonName')}));
      else if (errors.telefono) setError(t('fieldRequired', {field: t('clients.form.salespersonPhone')}));
      else if (errors.correo) setError(t('fieldRequired', {field: t('clients.form.email', 'Correo')}));
      else if (errors.ubicacion) setError(t('fieldRequired', {field: t('clients.form.location', 'Ubicación')}));
      else if (errors.emailFormat) setError(t('clients.messages.invalidEmail', 'El formato del correo electrónico no es válido'));
      return;
    }
    setLoading(true);
    try {
      // Formateando los datos exactamente como espera la API según Swagger
      let vendedorBackupNombre = undefined;
      if (showVacaciones && vendedorAsignado) {
        const vendedorObj = vendedoresList.find(v => String(v.id) === String(vendedorAsignado));
        vendedorBackupNombre = vendedorObj ? (vendedorObj.nombre || vendedorObj.name || vendedorAsignado) : vendedorAsignado;
      }
      const data = {
        nombre: refs.nombreVendedor.current?.value.trim(),
        correo: refs.correoVendedor.current?.value?.trim() || "",
        ubicacion: refs.ubicacionVendedor.current?.value?.trim() || "",
        telefono: refs.telefonoVendedor.current?.value.trim(),
        estado: estado, // Siempre enviamos un booleano true/false
        vendedorBackup: showVacaciones ? vendedorBackupNombre : undefined,
        fechaInicio: showVacaciones ? fechaInicio : undefined,
        fechaFin: showVacaciones ? fechaFin : undefined,
      };
      let correoError = '';
      if (editVendedor && editVendedor.id) {
        // UPDATE
        const response = await fetch(API_ENDPOINTS.VENDEDORES.UPDATE(editVendedor.id), {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          // Detectar error de correo existente
          if (errorData?.errors?.correo && errorData.errors.correo[0]?.includes('has already been taken')) {
            correoError = 'Correo existente';
            setFieldErrors(prev => ({ ...prev, correo: true }));
            setError(correoError);
            return;
          }
          throw new Error(errorData?.message || t('clients.messages.error'));
        }
        setSuccess(t('clients.messages.updated'));
      } else {
        // CREATE
        const response = await fetch(API_ENDPOINTS.VENDEDORES.CREATE, {
          headers: getAuthHeaders(),
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          // Detectar error de correo existente
          if (errorData?.errors?.correo && errorData.errors.correo[0]?.includes('has already been taken')) {
            correoError = 'Correo existente';
            setFieldErrors(prev => ({ ...prev, correo: true }));
            setError(correoError);
            return;
          }
          throw new Error(errorData?.message || `Error ${response.status}: ${t('clients.messages.error')}`);
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
      console.error("Error en operación vendedor:", e);
      let errorMsg = e.message || (editVendedor ? t('clients.messages.error') : t('clients.messages.error'));
      setError(errorMsg);
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
          m-4 md:m-0 p-4 w-full
          max-h-screen md:max-h-[85vh] overflow-y-auto
        `}
        style={
          tableHeight
            ? { height: tableHeight, maxHeight: tableHeight, minHeight: tableHeight }
            : { maxHeight: '100vh' }
        }
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {t('salespersonData')}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowWizard(false)}
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
              style={{ background: '#cc3399', color: '#fff', fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }}
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
        {/* Formulario de vendedor */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="space-y-3">
            {/* Asignación de vacaciones tanto en creación como edición */}
            <div className="border border-fuchsia-200 rounded-lg p-3 bg-white">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={showVacaciones}
                  onChange={e => setShowVacaciones(e.target.checked)}
                  className="accent-fuchsia-500"
                />
                <span className="font-medium text-fuchsia-700">{t('asignarVacaciones')}</span>
              </label>
              {showVacaciones && (
                              <div className="space-y-2 w-full">
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendedorAsignado')}</label>
                                  <select
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300"
                                    value={vendedorAsignado}
                                    onChange={e => setVendedorAsignado(e.target.value)}
                                  >
                                    <option value="">{t("select")}</option>
                                    {vendedoresList.map((v) => (
                                      <option key={v.id} value={v.id}>{v.nombre || v.name} </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex gap-2 w-full">
                                  <div className="flex-1 min-w-0">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('fechaInicio')}</label>
                                    <input type="date" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('fechaFin')}</label>
                                    <input type="date" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                                  </div>
                                </div>
                              </div>
              )}
            </div>
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
                {t('salespersonName')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="nombreVendedor"
                ref={refs.nombreVendedor}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('salespersonName')}
                required
                pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                title="Solo letras y espacios"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
                }}
              />
              {fieldErrors.nombre && (
                <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('salespersonName')})}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('salespersonPhone')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                name="telefonoVendedor"
                ref={refs.telefonoVendedor}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('salespersonPhone')}
                required
              />
              {fieldErrors.telefono && (
                <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('salespersonPhone')})}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.form.email', 'Correo')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                name="correoVendedor"
                ref={refs.correoVendedor}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.correo || fieldErrors.emailFormat ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('clients.form.placeholders.email', 'Correo electrónico')}
                required
              />
              {fieldErrors.correo && (
                <div className="text-red-500 text-xs mt-1">Correo existente</div>
              )}
              {fieldErrors.emailFormat && (
                <div className="text-red-500 text-xs mt-1">{t('clients.messages.invalidEmail', 'El formato del correo electrónico no es válido')}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('location')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="ubicacionVendedor"
                ref={refs.ubicacionVendedor}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.ubicacion ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('location')}
                required
              />
              {fieldErrors.ubicacion && (
                <div className="text-red-500 text-xs mt-1">{t('fieldRequired', {field: t('clients.form.location', 'Ubicación')})}</div>
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
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading
              ? (editVendedor ? t('common.updating') : t('common.creating'))
              : (editVendedor ? t('common.update') : t('common.create'))}
          </button>
        </div>
        {/* El mensaje de error general ya no es necesario, los errores aparecen debajo de cada campo */}
        {/* El mensaje de éxito solo se muestra en el modal, no aquí */}
        <SuccessModal open={showSuccessModal} message={success} onClose={() => setShowSuccessModal(false)} />
      </div>
    </>
  );
};

export default WizardVendedor;
