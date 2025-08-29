import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { useTranslation } from "react-i18next";
import { createLocacion, getVendedores } from "../../services/entidadesService";
import { API_ENDPOINTS, getAuthHeaders } from "../../constants/api";
import SuccessModal from '../modals/SuccessModal';

interface WizartLocationProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: {
    nombreLocation: React.RefObject<HTMLInputElement | null>;
    codigoLocation: React.RefObject<HTMLInputElement | null>;
  };
  handleAutoSave?: () => void;
  onCreated?: () => void;
  editLocation?: any | null;
  onClose?: () => void;
  hideCloseButton?: boolean; // NUEVO
  tableHeight?: number; // NUEVO: altura dinámica de la tabla
}

const WizartLocation: React.FC<WizartLocationProps> = ({
  showWizard,
  setShowWizard,
  refs,
  handleAutoSave,
  onCreated,
  editLocation,
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
  const [fieldErrors, setFieldErrors] = useState<{nombre?: boolean; codigo?: boolean; moneda?: boolean; metodoPago?: boolean; porcentaje?: boolean; vendedor?: boolean}>({});
  const [fieldErrorMessages, setFieldErrorMessages] = useState<{nombre?: string; codigo?: string; moneda?: string; metodoPago?: string; porcentaje?: string; vendedor?: string}>({});

  // NUEVO: Estados para los campos adicionales
  const [moneda, setMoneda] = useState("");
  const [metodoPago, setMetodoPago] = useState<string[]>([]);
  const [porcentajes, setPorcentajes] = useState<string[]>([]);

  // Estado para vendedores y selección
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [vendedorIds, setVendedorIds] = useState<any[]>([]);

  useEffect(() => {
    getVendedores().then((data) => {
  setVendedores(Array.isArray(data) ? data : []);
    });
  }, []);

  // Opciones de moneda
  const monedaOptions = [
    { value: '', label: t('select', 'Seleccione') },
    { value: 'USD', label: 'USD - Dólar estadounidense' },
    { value: 'EUR', label: 'EUR - Euro' },
   
  ];

  // Opciones de método de pago
  const metodoPagoOptions = [
    { value: '', label: t('common.select', 'Seleccione') },
    { value: 'efectivo', label: t('common.cash', 'Efectivo') },
    { value: 'transferencia', label: t('common.transfer', 'Transferencia') },
    { value: 'tarjeta', label: t('common.card', 'Tarjeta') },
    { value: 'otro', label: t('common.other', 'Otro') },
  ];


  // Efecto para inicializar los campos si editLocation cambia
  useEffect(() => {
    if (showWizard && editLocation) {
      if (refs.nombreLocation.current) refs.nombreLocation.current.value = editLocation.nombre || "";
      if (refs.codigoLocation.current) refs.codigoLocation.current.value = editLocation.codigolocacion || editLocation.codigo || "";
      setEstado(editLocation.estado === 1 || editLocation.estado === true);
      setMoneda(editLocation.cambioMoneda || editLocation.moneda || "");
      setMetodoPago(editLocation.metodoPago ? editLocation.metodoPago.split(",") : []);
      setPorcentajes(editLocation.porcentaje ? editLocation.porcentaje.replace(/%/g, '').split(",").map(p => p.trim()) : []);
      // No asignar vendedores aquí
    } else if (showWizard && !editLocation) {
      if (refs.nombreLocation.current) refs.nombreLocation.current.value = "";
      if (refs.codigoLocation.current) refs.codigoLocation.current.value = "";
      setEstado(true);
      setMoneda("");
      setMetodoPago([]);
      setPorcentajes([]);
      setVendedorIds([]);
    }
    setShowSuccessModal(false);
    setSuccess("");
  }, [showWizard, editLocation, refs]);

  // Sincronizar vendedores seleccionados cuando editLocation y vendedores estén listos
  useEffect(() => {
    if (showWizard && editLocation && vendedores.length > 0 && editLocation.vendedor) {
      setVendedorIds(
        editLocation.vendedor.split(",").map(nombre => {
          const v = vendedores.find(v => (v.nombre || v.name || v.correo || v.email) === nombre.trim());
          return v ? v.id : null;
        }).filter(Boolean)
      );
    }
  }, [showWizard, editLocation, vendedores]);

  if (!showWizard) return null;

  // Crear o actualizar
  const handleCreateOrUpdate = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});
    setFieldErrorMessages({});
    const nombre = refs.nombreLocation.current?.value?.trim() || "";
    const codigo = refs.codigoLocation.current?.value?.trim() || "";
  let errors: {nombre?: boolean; codigo?: boolean; moneda?: boolean; metodoPago?: boolean; porcentaje?: boolean; vendedor?: boolean} = {};
  if (!nombre) errors.nombre = true;
  if (!codigo) errors.codigo = true;
  if (!moneda) errors.moneda = true;
  if (!metodoPago || metodoPago.length === 0) errors.metodoPago = true;
  if (porcentajes.length !== metodoPago.length || porcentajes.some(p => !p || isNaN(Number(p)) || Number(p) < 0 || Number(p) > 100)) errors.porcentaje = true;
  if (!vendedorIds || vendedorIds.length === 0) errors.vendedor = true;
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
  setError(t('fieldRequired', {field: errors.nombre ? t('clients.form.required_name_location') : errors.codigo ? t('clients.form.code') : errors.moneda ? t('common.currency', 'Moneda') : errors.metodoPago ? t('common.paymentMethod', 'Método de pago') : errors.porcentaje ? t('common.percentage', 'Porcentaje') : errors.vendedor ? t('common.salesperson', 'Vendedor') : ''}));
      let errorMsgs: {nombre?: string; codigo?: string; moneda?: string; metodoPago?: string; porcentaje?: string; vendedor?: string} = {};
      if (errors.porcentaje) errorMsgs.porcentaje = t('common.percentageError', 'Porcentaje debe ser un número entre 0 y 100');
      if (errors.vendedor) errorMsgs.vendedor = t('fieldRequired', {field: t('common.salesperson', 'Vendedor')});
      setFieldErrorMessages(errorMsgs);
      return;
    }
    setLoading(true);
    try {
      const vendedorNombres = vendedorIds
        .map(id => {
          const vendedor = vendedores.find(v => v.id === id);
          return vendedor ? (vendedor.nombre || vendedor.name || vendedor.correo || vendedor.email) : null;
        })
        .filter(Boolean)
        .join(",");
      const handling = (document.querySelector('input[name="handling"]') as HTMLInputElement | null)?.value || "";
      const freight = (document.querySelector('input[name="freight"]') as HTMLInputElement | null)?.value || "";
      const duties = (document.querySelector('input[name="duties"]') as HTMLInputElement | null)?.value || "";
      const data = {
        nombre,
        codigolocacion: codigo,
        estado: estado,
        cambioMoneda: moneda, // Solo la abreviatura
        metodoPago: metodoPago.join(","),
        porcentaje: porcentajes.map(p => p !== '' ? `${p}%` : '').join(","),
        vendedor: vendedorNombres,
        handling,
        freight,
        duties,
      };
      if (editLocation && editLocation.id) {
        // UPDATE
        const response = await fetch(API_ENDPOINTS.LOCACIONES.UPDATE(editLocation.id), {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(t('clients.messages.error'));
        setSuccess(t('clients.messages.updated'));
      } else {
        // CREATE
        await createLocacion(data);
        setSuccess(t('clients.messages.created'));
      }
      setShowSuccessModal(true);
      if (onCreated) onCreated();
      setTimeout(() => {
        if (onClose) onClose();
        else setShowWizard(false);
      }, 1500);
    } catch (e: any) {
      // Mostrar mensaje del backend debajo del campo correspondiente
      if (e?.errors) {
        let errors: {nombre?: boolean; codigo?: boolean; moneda?: boolean; metodoPago?: boolean; porcentaje?: boolean; vendedor?: boolean} = {};
        let errorMsgs: {nombre?: string; codigo?: string; moneda?: string; metodoPago?: string; porcentaje?: string; vendedor?: string} = {};
        if (e.errors.codigolocacion) {
          errors.codigo = true;
          errorMsgs.codigo = e.errors.codigolocacion[0];
        }
        if (e.errors.nombre) {
          errors.nombre = true;
          errorMsgs.nombre = e.errors.nombre[0];
        }
        if (e.errors.moneda) {
          errors.moneda = true;
          errorMsgs.moneda = e.errors.moneda[0];
        }
        if (e.errors.metodoPago) {
          errors.metodoPago = true;
          errorMsgs.metodoPago = e.errors.metodoPago[0];
        }
        if (e.errors.porcentaje) {
          errors.porcentaje = true;
          errorMsgs.porcentaje = e.errors.porcentaje[0];
        }
        if (e.errors.vendedor_id) {
          errors.vendedor = true;
          errorMsgs.vendedor = e.errors.vendedor_id[0];
        }
        setFieldErrors(errors);
        setFieldErrorMessages(errorMsgs);
      } else if (e?.message) {
        setError(e.message);
      } else {
        setError(editLocation ? t('clients.messages.error') : t('clients.messages.error'));
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
          overflow-y-auto
        `}
        style={
          tableHeight
            ? { height: tableHeight, maxHeight: tableHeight, minHeight: tableHeight }
            : { maxHeight: '85vh' }
        }
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {t('locationData')}
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
        {/* Formulario de location */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="space-y-3">
            {/* Estado */}
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
            {/* Nombre location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('locationName')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="nombreLocation"
                ref={refs.nombreLocation}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('clients.form.placeholders.locationName')}
                required
                pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                title="Solo letras y espacios"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
                }}
              />
              {fieldErrors.nombre && (
                <div className="text-red-500 text-xs mt-1">{fieldErrorMessages.nombre || t('fieldRequired', {field: t('clients.form.locationName')})}</div>
              )}
            </div>
            {/* Código location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.form.code')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="codigoLocation"
                ref={refs.codigoLocation}
                onBlur={handleAutoSave}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.codigo ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('clients.form.placeholders.code')}
                required
                maxLength={3}
                pattern="^[A-Za-z0-9]{3}$"
                title="Solo 3 caracteres alfanuméricos"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 3);
                }}
              />
              {fieldErrors.codigo && (
                <div className="text-red-500 text-xs mt-1">{fieldErrorMessages.codigo || t('fieldRequired', {field: t('clients.form.code')})}</div>
              )}
            </div>
              {/* Vendedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vendedor_location', 'Vendedor')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Select
                isMulti
                name="vendedor"
                options={vendedores.map(v => ({ value: v.id, label: v.nombre || v.name || v.correo || v.email }))}
                value={vendedorIds.map(id => {
                  const vendedor = vendedores.find(v => v.id === id);
                  return vendedor ? { value: vendedor.id, label: vendedor.nombre || vendedor.name || vendedor.correo || vendedor.email } : null;
                }).filter(Boolean)}
                onChange={selected => setVendedorIds(selected.map((s: any) => s.value))}
                classNamePrefix="react-select"
                className={`react-select-container w-full ${fieldErrors.vendedor ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('select')}
                required
              />
              {fieldErrors.vendedor && (
                <div className="text-red-500 text-xs mt-1">{fieldErrorMessages.vendedor || t('fieldRequired', {field: t('common.salesperson', 'Vendedor')})}</div>
              )}
            </div>
            {/* Cambio de moneda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('cambioMoneda')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="moneda"
                value={moneda}
                onChange={e => setMoneda(e.target.value)}
                className={`bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.moneda ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                {monedaOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {fieldErrors.moneda && (
                <div className="text-red-500 text-xs mt-1">{fieldErrorMessages.moneda || t('fieldRequired', {field: t('common.currency', 'Cambio de moneda')})}</div>
              )}
            </div>
            {/* Método de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('metodoPago')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Select
                isMulti
                name="metodoPago"
                options={metodoPagoOptions.filter(opt => opt.value !== '').map(opt => ({ value: opt.value, label: opt.label }))}
                value={metodoPagoOptions.filter(opt => metodoPago.includes(opt.value)).map(opt => ({ value: opt.value, label: opt.label }))}
                onChange={selected => setMetodoPago(selected.map((s: any) => s.value))}
                classNamePrefix="react-select"
                className={fieldErrors.metodoPago ? 'border-red-500' : ''}
                placeholder={t('select')}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: fieldErrors.metodoPago ? '#f87171' : base.borderColor,
                    minHeight: '44px',
                  })
                }}
              />
              {fieldErrors.metodoPago && (
                <div className="text-red-500 text-xs mt-1">{fieldErrorMessages.metodoPago || t('fieldRequired', {field: t('common.paymentMethod', 'Método de pago')})}</div>
              )}
            </div>
          
            {/* Porcentajes por método de pago */}
            {metodoPago.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.percentage', 'Porcentaje por método de pago')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="space-y-2">
                  {metodoPago.map((metodo, idx) => (
                    <div key={metodo} className="flex items-center gap-2">
                      <span className="min-w-[100px] font-medium text-gray-600">{metodoPagoOptions.find(opt => opt.value === metodo)?.label || metodo}</span>
                      <input
                        type="number"
                        name={`porcentaje_${metodo}`}
                        value={porcentajes[idx] || ""}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setPorcentajes(prev => {
                            const arr = [...prev];
                            arr[idx] = val;
                            return arr;
                          });
                        }}
                        className={`bg-white w-24 p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 ${fieldErrors.porcentaje ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder={t('common.percentagePlaceholder', 'Ej: 10')}
                        min={0}
                        max={100}
                        step={0.01}
                        required
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  ))}
                </div>
                {fieldErrors.porcentaje && (
                  <div className="text-red-500 text-xs mt-1">{fieldErrorMessages.porcentaje || t('common.percentageError', 'Porcentaje debe ser un número entre 0 y 100')}</div>
                )}
              </div>
            )}
            {/* Nuevos campos: Handling, Freight y Duties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Handling</label>
              <input
                type="number"
                name="handling"
                className="bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300"
                placeholder="Ej: 12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Freight</label>
              <input
                type="number"
                name="freight"
                className="bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300"
                placeholder="Ej: 125"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duties</label>
              <input
                type="number"
                name="duties"
                className="bg-white w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300 border-gray-300"
                placeholder="Ej: 23"
              />
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
              ? (editLocation ? t('common.updating') : t('common.creating'))
              : (editLocation ? t('common.update') : t('common.create'))}
          </button>
        </div>
        {/* El mensaje de error general ya no es necesario, los errores aparecen debajo de cada campo */}
        {/* El mensaje de éxito solo se muestra en el modal, no aquí */}
        <SuccessModal open={showSuccessModal} message={success} onClose={() => setShowSuccessModal(false)} />
      </div>
    </>
  );
};

export default WizartLocation;
