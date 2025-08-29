import React, { useState, useEffect } from 'react';
import { Shield, Save, Check } from 'lucide-react';
import { updateRolePermissions, getPermissionsByRole } from '../../services/rolePermissionsService';
import ModalRol from '../../components/modals/Rol';
import ModalPermission from '../../components/modals/Permission';
import SuccessModal from '../../components/modals/SuccessModal';
import { useRolesPermsStore } from '../../store/rolesPermsStore';
import { useTranslation } from 'react-i18next';

interface Role {
  id: string | number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
  action: string;
  module: string;
}

const RolePermissionsInterface = () => {
  const { t } = useTranslation();
  
  // Action colors and labels from i18n
  const actionColors: Record<string, string> = {
    crear: 'text-green-600',
    ver: 'text-blue-600',
    editar: 'text-yellow-600',
    eliminar: 'text-red-600',
  };
  
  // Zustand store
  const { roles, permissions, loading, fetchRolesAndPermissions } = useRolesPermsStore();
  const [selectedRole, setSelectedRole] = useState<string | number | null>(null);
  const [rolePerms, setRolePerms] = useState<any>({});
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [openRol, setOpenRol] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');

  // Cargar roles y permisos solo si no existen
  useEffect(() => {
    if (roles.length === 0 || permissions.length === 0) {
      fetchRolesAndPermissions();
    }
  }, [roles.length, permissions.length, fetchRolesAndPermissions]);

  // Actualizar módulos y acciones cuando cambian los permisos
  useEffect(() => {
    if (permissions.length > 0) {
      const uniqueModules = Array.from(new Set(permissions.map((p: Permission) => p.module))) as string[];
      setModules(uniqueModules);
      const uniqueActions = Array.from(new Set(permissions.map((p: Permission) => p.action))) as string[];
      setActions(uniqueActions);
    }
  }, [permissions]);

  // Seleccionar rol por defecto
  useEffect(() => {
    if (roles.length > 0 && selectedRole === null) {
      setSelectedRole(roles[0].id);
    }
  }, [roles, selectedRole]);

  // Cargar permisos del rol seleccionado y marcar los checks
  useEffect(() => {
    let isMounted = true;
    async function fetchRolePerms() {
      if (!selectedRole || modules.length === 0 || actions.length === 0) return;
      const permsByRole: any = { ...rolePerms };
      permsByRole[selectedRole] = {};
      modules.forEach((mod: string) => {
        permsByRole[selectedRole][mod] = {};
        actions.forEach((act: string) => {
          const exists = permissions.some((p: Permission) => p.module === mod && p.action === act);
          permsByRole[selectedRole][mod][act] = exists ? false : null;
        });
      });
      try {
        const assigned = await getPermissionsByRole(selectedRole);
        assigned.forEach((perm: Permission) => {
          if (permsByRole[selectedRole][perm.module] && permsByRole[selectedRole][perm.module][perm.action] !== null) {
            permsByRole[selectedRole][perm.module][perm.action] = true;
          }
        });
        if (isMounted) setRolePerms(permsByRole);
      } catch (e) {
        if (isMounted) setRolePerms(permsByRole);
      }
    }
    fetchRolePerms();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, modules, actions, permissions]);

  // Cambiar permiso
  const togglePermission = (module: string, action: string) => {
    if (!selectedRole) return;
    setRolePerms((prev: any) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: {
          ...prev[selectedRole][module],
          [action]: !prev[selectedRole][module][action],
        },
      },
    }));
  };

  // Cambiar todos los permisos de un módulo
  const toggleAllModulePermissions = (module: string) => {
    if (!selectedRole) return;
    const allEnabled = actions.every((action) => rolePerms[selectedRole][module][action]);
    setRolePerms((prev: any) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: actions.reduce((acc, action) => {
          if (rolePerms[selectedRole][module][action] !== null) {
            acc[action] = !allEnabled;
          } else {
            acc[action] = null;
          }
          return acc;
        }, {} as any),
      },
    }));
  };

  // Contar permisos activos
  const getPermissionCount = (roleId: string | number) => {
    let count = 0;
    if (!rolePerms[roleId]) return 0;
    Object.values(rolePerms[roleId]).forEach((module: any) => {
      Object.values(module as Record<string, boolean | null>).forEach((permission: any) => {
        if (permission === true) count++;
      });
    });
    return count;
  };

  // Permisos seleccionados para guardar
  const getSelectedPermissions = () => {
    const perms: string[] = [];
    if (!selectedRole) return perms;
    Object.entries(rolePerms[selectedRole]).forEach(([moduleId, actionsObj]) => {
      Object.entries(actionsObj as Record<string, boolean | null>).forEach(([actionId, checked]) => {
        if (checked) {
          perms.push(`${actionId} ${moduleId}`);
        }
      });
    });
    return perms;
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    const perms = getSelectedPermissions();
    try {
      await updateRolePermissions(selectedRole, perms);
      setSuccessMessage(t('roles.messages.updateSuccess'));
      setModalType('success');
      setShowSuccessModal(true);
    } catch (e) {
      setSuccessMessage(t('roles.messages.updateError'));
      setModalType('error');
      setShowSuccessModal(true);
    }
  };

  // Crear rol y refrescar lista
  const handleCreateRol = async (name: string) => {
    await fetchRolesAndPermissions();
    // Selecciona el último rol creado automáticamente
    if (roles.length > 0) {
      setSelectedRole(roles[roles.length - 1].id);
    }
  };
  // Crear permiso y refrescar lista
  const handleCreatePermission = async (name: string, module: string, action: string) => {
    await fetchRolesAndPermissions();
  };

  if (!selectedRole || roles.length === 0 || modules.length === 0 || !rolePerms[selectedRole] || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg text-pink-700 font-semibold mb-2">{t('roles.loading')}</div>
        <div className="w-8 h-8 border-4 border-pink-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col px-1 sm:px-2 md:px-4" style={{ background: 'linear-gradient(135deg, #fff 0%, #ffe6f5 100%)', fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
      <div className="flex-1 flex flex-col max-w-full mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col" style={{ fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
          {/* Header */}
          <div className="px-2 sm:px-4 md:px-6 py-3" style={{ background: 'linear-gradient(90deg, #cc3399 0%, #FFB400 100%)' }}>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              {t('roles.title')}
            </h3>
            <p className="text-pink-100 mt-1 text-xs sm:text-sm" style={{ color: '#ffe6f5' }}>
              {t('roles.subtitle')}
            </p>
          </div>

          <div className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 min-h-0">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-0 items-start">
              {/* Sidebar - Lista de Roles */}
              <div className="lg:col-span-1 flex flex-col">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#cc3399' }}>{t('roles.systemRoles')}</h2>
                <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto min-h-0">
                  {roles.map(role => (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${selectedRole === role.id ? 'shadow-md' : 'hover:border-gray-300 bg-white'}`}
                      style={{ borderColor: selectedRole === role.id ? '#cc3399' : '#eee', background: selectedRole === role.id ? '#fce6f6' : '#fff', fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: role.id === 'admin' ? '#cc3399' : role.id === 'editor' ? '#FFB400' : '#4ade80' }}></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate" style={{ fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>{role.name}</h3>
                          <p className="text-xs text-gray-500">
                            {t('roles.permissionsCount', { count: getPermissionCount(role.id) })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content - Matriz de Permisos */}
              <div className="lg:col-span-3 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold" style={{ color: '#cc3399' }}>
                    {t('roles.permissionsFor')} {roles.find(r => r.id === selectedRole)?.name}
                  </h2>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <button className="px-2 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm" style={{ background: '#cc3399', color: '#fff', fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }} onClick={() => setOpenRol(true)}>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t('roles.createRole')}
                    </button>
                    <button className="px-2 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm" style={{ background: '#cc3399', color: '#fff', fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }} onClick={() => setOpenPermission(true)}>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t('roles.createPermission')}
                    </button>
                    <button className="px-2 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm" style={{ background: '#cc3399', color: '#fff', fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }} onClick={handleSave}>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t('roles.saveChanges')}
                    </button>
                  </div>
                </div>
                <ModalRol open={openRol} onClose={() => setOpenRol(false)} onCreate={handleCreateRol} />
                <ModalPermission open={openPermission} onClose={() => setOpenPermission(false)} onCreate={handleCreatePermission} />
                <SuccessModal 
                  open={showSuccessModal} 
                  message={successMessage} 
                  onClose={() => setShowSuccessModal(false)} 
                  type={modalType}
                />

                <div className="flex flex-col">
                  <div className="rounded-xl p-2 sm:p-3 md:p-4" style={{ background: '#fce6f6' }}>
                    <div className="overflow-auto">
                      <table className="w-full" style={{ fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
                      <thead>
                        <tr>
                          <th className="text-left py-1 sm:py-2 px-2 sm:px-4 font-semibold align-middle text-xs sm:text-base w-1/6" style={{ color: '#cc3399' }}>{t('common.module')}</th>
                          {actions.map(action => (
                            <th
                              key={action}
                              className="text-center py-1 sm:py-2 px-1 sm:px-2 font-semibold align-middle text-xs sm:text-base"
                              style={{ color: actionColors[action] || '#cc3399', width: `${Math.floor((5/6) / actions.length * 100)}%` }}
                            >
                              <span className="block w-full text-center">{t(`roles.actions.${action}`) || action}</span>
                            </th>
                          ))}
                          <th className="text-center py-1 sm:py-2 px-1 sm:px-2 font-semibold align-middle text-xs sm:text-base w-16" style={{ color: '#cc3399' }}>{t('roles.allPermissions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modules.map(module => (
                          <tr key={module} className="border-t" style={{ borderColor: '#f3e8ff' }}>
                            <td className="py-1 sm:py-2 px-2 sm:px-4 align-middle">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="font-medium text-gray-800 text-xs sm:text-base">{module.charAt(0).toUpperCase() + module.slice(1)}</span>
                              </div>
                            </td>
                            {actions.map(action => (
                              <td key={action} className="py-1 sm:py-2 px-1 sm:px-2 text-center align-middle">
                                {rolePerms[selectedRole] &&
                                 rolePerms[selectedRole][module] &&
                                 typeof rolePerms[selectedRole][module][action] !== 'undefined' ? (
                                  rolePerms[selectedRole][module][action] !== null ? (
                                    <div className="flex justify-center items-center">
                                      <button
                                        onClick={() => togglePermission(module, action)}
                                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200`}
                                        style={{
                                          background: rolePerms[selectedRole][module][action] ? (action === 'crear' ? '#4ade80' : action === 'ver' ? '#3b82f6' : action === 'editar' ? '#FFB400' : '#cc3399') : '#fff',
                                          borderColor: rolePerms[selectedRole][module][action] ? (action === 'crear' ? '#4ade80' : action === 'ver' ? '#3b82f6' : action === 'editar' ? '#FFB400' : '#cc3399') : '#e5e7eb',
                                          color: rolePerms[selectedRole][module][action] ? '#fff' : '#cc3399'
                                        }}
                                      >
                                        {rolePerms[selectedRole][module][action] && (
                                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )
                                ) : (
                                  <span className="text-gray-300">...</span>
                                )}
                              </td>
                            ))}
                            <td className="py-1 sm:py-2 px-1 sm:px-2 text-center align-middle">
                              {rolePerms[selectedRole] && rolePerms[selectedRole][module] ? (
                                <button
                                  onClick={() => toggleAllModulePermissions(module)}
                                  className="px-1 py-1 sm:px-2 sm:py-1 rounded text-xs whitespace-nowrap" 
                                  style={{ background: '#cc3399', color: '#fff', fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif' }}
                                >
                                  {actions.every(action => rolePerms[selectedRole][module][action])
                                    ? t('roles.removeAll')
                                    : t('roles.selectAll')
                                  }
                                </button>
                              ) : (
                                <span className="text-gray-300">...</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Resumen de Permisos */}
                  <div className="mt-3 sm:mt-4 rounded-xl p-2 sm:p-3 md:p-4" style={{ background: '#FFB40022' }}>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: '#cc3399' }}>{t('roles.permissionsSummary')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                      {actions.map(action => {
                        const count = modules.filter(module => rolePerms[selectedRole][module][action]).length;
                        return (
                          <div key={action} className="text-center">
                            <div className="text-lg sm:text-xl font-bold text-gray-800">{count}</div>
                            <div className="text-xs sm:text-sm font-medium" style={{ color: actionColors[action] || '#cc3399' }}>{t(`roles.actions.${action}`) || action}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsInterface;