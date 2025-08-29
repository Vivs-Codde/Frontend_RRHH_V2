import React, { useEffect, useState, useCallback, memo } from "react";
import { API_ENDPOINTS, getAuthHeaders } from "../../constants/api";
import { useUserStore } from "../../store/userStore";
import { useUsuarioFormRefs } from "../../hooks/useUserFormRefs";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/authService";
import SuccessModal from "../modals/SuccessModal";

interface IpActiva {
  id?: number;
  ip_address: string;
  activo?: boolean;
  nombreFinca?: string;
  descripcion?: string; // Mantener por compatibilidad, pero usar nombreFinca
}

interface UsuarioWizardProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  editUser: any;
}

const UsuarioWizard: React.FC<UsuarioWizardProps> = memo(({
  showWizard,
  setShowWizard,
  editUser,
}) => {
  const refs = useUsuarioFormRefs();
  const { resetWizard } = useUserStore();
  const [rolesApi, setRolesApi] = useState([]);
  const [ipsActivas, setIpsActivas] = useState<IpActiva[]>([]);
  const [ipInput, setIpInput] = useState("");
  const [accesoGlobal, setAccesoGlobal] = useState(true);
  const [loadingToggle, setLoadingToggle] = useState<number | null>(null);
  const [isUserInfoCollapsed, setIsUserInfoCollapsed] = useState(true); // Acordeón colapsado por defecto
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const { t } = useTranslation();
  // Cargar roles al abrir el wizard
  useEffect(() => {
    if (showWizard) {
      fetch(API_ENDPOINTS.ROLES.LIST, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => setRolesApi(Array.isArray(data) ? data : (data.data || [])))
        .catch(() => setRolesApi([]));
    }
  }, [showWizard]);

  // Precargar datos si es edición (solo al abrir el wizard o cambiar de usuario)
  useEffect(() => {
    if (showWizard && editUser) {
      setTimeout(() => {
        if (refs.nombre.current) refs.nombre.current.value = editUser.name || '';
        if (refs.email.current) refs.email.current.value = editUser.email || '';
        if (refs.estado.current) refs.estado.current.value = editUser.estado || 'A';
        if (refs.celular.current) refs.celular.current.value = editUser.celular || '';
        if (refs.rol.current) refs.rol.current.value = editUser.role?.id?.toString() || '';
        
        // Cargar IPs según la nueva estructura
        let ipsToLoad: IpActiva[] = [];
        if (editUser.ips_activas && editUser.ips_activas.length > 0) {
          // Nueva estructura de la API
          ipsToLoad = editUser.ips_activas.map((ip: any) => ({
            id: ip.id,
            ip_address: ip.ip_address,
            activo: ip.activa !== false, // Usar 'activa' según la estructura de la API
            nombreFinca: ip.nombreFinca || '' // Solo usar nombreFinca, no descripcion
          }));
        } else if (Array.isArray(editUser.ips)) {
          // Compatibilidad con estructura anterior
          ipsToLoad = editUser.ips.map((ip: string) => ({
            ip_address: ip,
            activo: true,
            nombreFinca: 'Migrado desde campo ips'
          }));
        } else if (editUser.ip) {
          // Compatibilidad con IP única
          ipsToLoad = [{
            ip_address: editUser.ip,
            activo: true,
            nombreFinca: 'Migrado desde campo ip'
          }];
        }
        setIpsActivas(ipsToLoad);
        
        setAccesoGlobal(typeof editUser.accesoglobal === 'boolean' ? editUser.accesoglobal : true);
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWizard, editUser?.id]);

  // Validar formato de IP
  const isValidIp = (ip: string): boolean => {
    // Permitir solo números y puntos
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    
    // Validar que cada octeto esté entre 0 y 255
    const octets = ip.split('.');
    return octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  };

  // Validar input en tiempo real (solo números y puntos)
  const handleIpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números, puntos y backspace
    const filteredValue = value.replace(/[^0-9.]/g, '');
    setIpInput(filteredValue);
  };

  // Mostrar modal de éxito o error
  const showModal = (message: string, type: 'success' | 'error' = 'success') => {
    setSuccessMessage(message);
    setModalType(type);
    setShowSuccessModal(true);
  };

  // Agregar IP(s) separadas por coma, limpiando comillas y espacios
  const handleAddIp = async () => {
    const raw = ipInput.trim();
    if (!raw) return;
    
    const nuevasIps = raw
      .split(',')
      .map(ip => ip.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''))
      .filter(ip => ip && !ipsActivas.some(existing => existing.ip_address === ip));
    
    if (nuevasIps.length === 0) {
      showModal(t('users.messages.ipAlreadyExists'), 'error');
      return;
    }

    // Validar formato de IPs
    const invalidIps = nuevasIps.filter(ip => !isValidIp(ip));
    if (invalidIps.length > 0) {
      showModal(`${t('users.messages.invalidIpFormat')}: ${invalidIps.join(', ')}`, 'error');
      return;
    }

    try {
      if (editUser) {
        // Si estamos editando un usuario, enviar cada IP nueva a la API
        for (const ip of nuevasIps) {
          await authService.addUserIp(editUser.id, ip);
        }
        
        // Recargar las IPs desde la API para obtener los datos actualizados
        const ipsData = await authService.getUserIps(editUser.id);
        
        // Actualizar el estado preservando el estado actual de las IPs existentes
        const updatedIps = ipsData.map(newIp => {
          const existingIp = ipsActivas.find(existing => existing.ip_address === newIp.ip_address);
          return {
            ...newIp,
            activo: newIp.activa !== false, // Usar el estado de la API
            nombreFinca: newIp.nombreFinca || 'Sin nombre de finca'
          };
        });
        
        setIpsActivas(updatedIps);
        setIpInput(""); // Limpiar el campo
        showModal(t('users.messages.ipAdded', { count: nuevasIps.length }));
      } else {
        // Si no hay usuario (modo creación), agregar solo localmente
        const nuevasIpsActivas = nuevasIps.map(ip => ({
          ip_address: ip,
          activo: true,
          nombreFinca: 'ip externa'
        }));
        setIpsActivas([...ipsActivas, ...nuevasIpsActivas]);
        setIpInput(""); // Limpiar el campo
        showModal(t('users.messages.ipAdded', { count: nuevasIps.length }));
      }
    } catch (error) {
      console.error('Error al agregar IP:', error);
      showModal(`${t('users.messages.errorAddingIp')}: ${error.message}`, 'error');
    }
  };

  // Toggle estado de IP
  const handleToggleIp = async (ip: IpActiva, index: number) => {
    if (!ip.id) {
      // Si no tiene ID, solo cambiar el estado local
      const updatedIps = [...ipsActivas];
      updatedIps[index] = { ...ip, activo: !ip.activo };
      setIpsActivas(updatedIps);
      return;
    }

    setLoadingToggle(ip.id);
    try {
      await authService.toggleIpStatus(ip.id);
      // Actualizar el estado local
      const updatedIps = [...ipsActivas];
      updatedIps[index] = { ...ip, activo: !ip.activo };
      setIpsActivas(updatedIps);
    } catch (error) {
      console.error('Error al cambiar estado de IP:', error);
      alert('Error al cambiar estado de la IP');
    } finally {
      setLoadingToggle(null);
    }
  };

  // Eliminar IP
  const handleDeleteIp = async (ip: IpActiva, index: number) => {
    if (!ip.id) {
      // Si no tiene ID (IP local), solo remover del estado
      const updatedIps = ipsActivas.filter((_, idx) => idx !== index);
      setIpsActivas(updatedIps);
      showModal(t('users.messages.ipDeleted'));
      return;
    }

    // Confirmar eliminación
    const confirmed = window.confirm(`¿Está seguro de eliminar la IP ${ip.ip_address}?`);
    if (!confirmed) return;

    try {
      await authService.deleteIp(ip.id);
      
      // Remover del estado local
      const updatedIps = ipsActivas.filter((_, idx) => idx !== index);
      setIpsActivas(updatedIps);
      
      showModal(t('users.messages.ipDeleted'));
    } catch (error) {
      console.error('Error al eliminar IP:', error);
      showModal(`${t('users.messages.errorDeletingIp')}: ${error.message}`, 'error');
    }
  };

  // Guardar cambios (solo edición)
  const handleEditUsuario = useCallback(async () => {
    if (!editUser) return;
    const nombre = refs.nombre.current?.value?.trim() || '';
    const email = refs.email.current?.value?.trim() || '';
    const celular = refs.celular.current?.value?.trim() || '';
    const estado = refs.estado.current?.value || 'A';
    const rol = refs.rol.current?.value || '';
    const imagen = editUser.imagen || '';
    const roles = editUser.roles || rol || '';
    const tipos = editUser.tipos || '';
    const accesoglobal = accesoGlobal;
    // Asegurar que ips siempre sea un array de strings para compatibilidad
    const ipsToSend = ipsActivas.map(ip => ip.ip_address);
    const body = {
      name: nombre,
      email: email,
      imagen: imagen,
      roles: roles,
      tipos: tipos,
      estado: estado,
      ips: ipsToSend,
      accesoglobal: accesoglobal,
    };

    try {
      await fetch(`${API_ENDPOINTS.AUTH.UPDATE(editUser.id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      resetWizard();
      setShowWizard(false);
      alert(t('users.messages.updated'));
    } catch (error) {
      alert(t('users.messages.error'));
    }
  }, [editUser, refs, setShowWizard, resetWizard, ipsActivas, accesoGlobal]);

  if (!showWizard) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
        onClick={() => setShowWizard(false)}
      ></div>
      <div
        className="fixed md:relative inset-0 md:inset-auto z-50 md:z-0 bg-white rounded-lg shadow-md m-4 md:m-0 p-4 md:w-96 max-h-[95vh] md:max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {t("users.editUser")}
          </h3>
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
        
        {/* Acordeón para información del usuario */}
        <div className="border rounded-lg mb-4" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}>
          <button
            type="button"
            onClick={() => setIsUserInfoCollapsed(!isUserInfoCollapsed)}
            className="w-full px-4 py-3 text-left hover:opacity-90 transition-colors duration-200 rounded-t-lg flex items-center justify-between"
            style={{ backgroundColor: '#f9fafb', color: '#374151' }}
          >
            <span className="text-sm font-medium">
              {t('users.form.userInformation')}
            </span>
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${
                isUserInfoCollapsed ? 'rotate-0' : 'rotate-180'
              }`}
              style={{ color: '#6b7280' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          {!isUserInfoCollapsed && (
            <div className="p-4 space-y-4" style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t("users.table.name")}
                </label>
                <input
                  type="text"
                  ref={refs.nombre}
                  className="w-full p-2 border border-gray-300 rounded-md cursor-not-allowed"
                  style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                  placeholder={t('users.form.placeholders.firstName')}
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t("users.table.email")}
                </label>
                <input
                  type="email"
                  ref={refs.email}
                  className="w-full p-2 border border-gray-300 rounded-md cursor-not-allowed"
                  style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                  placeholder={t('users.form.placeholders.email')}
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t("users.table.phone")}
                </label>
                <input
                  type="tel"
                  ref={refs.celular}
                  className="w-full p-2 border border-gray-300 rounded-md cursor-not-allowed"
                  style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                  placeholder={t('users.form.placeholders.salespersonPhone')}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t('users.form.role')}
                </label>
                {/* Mostrar el rol actual en un label encima del select */}
                {editUser?.role?.name && (
                  <div className="mb-1 text-xs" style={{ color: '#6b7280' }}>{t('users.form.currentRole')}: <span className="font-semibold">{editUser.role.name}</span></div>
                )}
                <select
                  ref={refs.rol}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                  style={{ backgroundColor: '#ffffff', color: '#374151' }}
                  defaultValue={editUser?.role?.id?.toString() || ''}
                >
                  <option value="">{t('users.form.selectRole')}</option>
                  {rolesApi.map((rol: any) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre || rol.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  {t("users.table.status")}
                </label>
                <select
                  ref={refs.estado}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                  style={{ backgroundColor: '#ffffff', color: '#374151' }}
                  defaultValue={editUser?.estado || 'A'}
                >
                  <option value="A">{t("common.active")}</option>
                  <option value="I">{t("common.inactive")}</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Sección de IPs siempre visible */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
              {t('users.form.authorizedIps')}
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
                placeholder={t('users.form.addIpPlaceholder')}
                value={ipInput}
                onChange={handleIpInputChange}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddIp(); } }}
              />
              <button 
                type="button" 
                onClick={handleAddIp} 
                className="px-4 py-2 rounded-md text-white text-sm transition-colors"
                style={{ backgroundColor: "#cc3399" }}
              >
                {t('users.form.addIp')}
              </button>
            </div>
            
            {/* Lista de IPs con switches */}
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}>
              {ipsActivas.map((ip, idx) => {
                return (
                <div key={`${ip.ip_address}-${idx}`} className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                  <div className="flex-1">
                    <div className="font-medium text-sm" style={{ color: '#374151' }}>{ip.ip_address}</div>
                    <div className="text-xs" style={{color: '#dc143c'}}>
                      Finca: {ip.nombreFinca || 'Sin nombre de finca'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Switch para activar/desactivar */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ip.activo}
                        onChange={() => handleToggleIp(ip, idx)}
                        disabled={loadingToggle === ip.id}
                        className="sr-only peer"
                      />
                      <div
                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-fuchsia-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{ backgroundColor: ip.activo ? '#cc3399' : '#e5e7eb', transition: 'background 0.2s' }}
                      ></div>
                    </label>
                    
                    {/* Estado visual */}
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      ip.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ip.activo ? t('users.form.activeIp') : t('users.form.inactiveIp')}
                    </span>

                    {/* Botón de eliminar IP */}
                    <button
                      type="button"
                      onClick={() => handleDeleteIp(ip, idx)}
                      className="hover:opacity-75 focus:outline-none"
                      disabled={loadingToggle === ip.id}
                      title={t('users.form.deleteIp')}
                      style={{ 
                        color: '#cc3399',
                        backgroundColor: 'transparent !important',
                        border: 'none',
                        padding: '4px',
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                );
              })}
              
              {ipsActivas.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {t('users.form.noIpsConfigured')}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
              {t('users.form.globalAccess')}
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
              style={{ backgroundColor: '#ffffff', color: '#374151' }}
              value={accesoGlobal ? 'true' : 'false'}
              onChange={e => setAccesoGlobal(e.target.value === 'true')}
            >
              <option value="true">{t('users.form.globalAccessAny')}</option>
              <option value="false">{t('users.form.onlyAllowedIps')}</option>
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleEditUsuario}
            className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
            style={{
              background: "#cc3399",
              color: "#fff",
              fontFamily:
                "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
            }}
          >
            {t('common.update')}
          </button>
        </div>
      </div>
      
      {/* Modal de éxito/error */}
      <SuccessModal
        open={showSuccessModal}
        message={successMessage}
        type={modalType}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
});

export default UsuarioWizard;
