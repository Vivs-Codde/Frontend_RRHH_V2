import React, { useEffect, useState } from "react";
import { Edit2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../store/userStore";
import UsuarioWizard from "../components/wizards/UsuarioWizard";
import { getUsuariosPaginado, authService } from "../services/authService";
import type { UsuarioApi } from "../services/authService";
import IpInputModal from "../components/modals/IpInputModal";
import SuccessModal from "../components/modals/SuccessModal";
import GenericTable from "../components/GenericTable";
import type { TableColumn } from "../components/GenericTable";

const Usuario: React.FC = () => {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState<UsuarioApi | null>(null);
  // Estados para búsqueda y paginación
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  // Estados para selección múltiple
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Estados para modales
  const [ipModalOpen, setIpModalOpen] = useState(false);
  const [ipValue, setIpValue] = useState("");
  const [successModal, setSuccessModal] = useState({ open: false, message: "" });
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  const handleOpenWizard = () => {
    setEditUser(null);
    setWizardOpen(true);
  };
  const handleCloseWizard = () => {
    setWizardOpen(false);
    setEditUser(null);
  };

  // Fetch usuarios con búsqueda y paginación
  const fetchUsuarios = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsuariosPaginado({
        search,
        page,
        per_page: perPage,
        ...params,
      });
      setUsuarios(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.last_page || 1);
      setSelectedIds([]);
    } catch (e) {
      // Manejo especial para 401 Unauthorized
      if (e instanceof Error && e.message === "Error al obtener usuarios") {
        // Logout real: llamar logout para limpiar en backend y frontend
        try {
          await authService.logout();
        } catch (logoutErr) {
          // Ignorar errores de logout
        }
        window.location.href = "/"; // Redirige al login inmediatamente (ajusta si tu ruta de login es diferente)
        return;
      }
      console.error('Error al cargar usuarios:', e);
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line
  }, [search, page, perPage]);

  const handleEdit = async (usuario: UsuarioApi) => {
    setEditUser(usuario);
    setWizardOpen(true);
  };

  const handleWizardClose = () => {
    setWizardOpen(false);
    setEditUser(null);
  };

  // Multi-select logic
  const isAllSelected =
    usuarios.length > 0 && selectedIds.length === usuarios.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < usuarios.length;
  const handleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(usuarios.map((u) => u.id));
  };
  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  // Acción masiva: agregar IP
  const handleBulkAddIp = () => {
    if (selectedIds.length === 0) {
      setErrorModal({ open: true, message: t("users.messages.error") || "Seleccione al menos un usuario" });
      return;
    }
    setIpValue("");
    setIpModalOpen(true);
  };

  const handleIpModalSave = async (ip: string) => {
    setIpModalOpen(false);
    if (!ip) return;
    try {
      const data = usuarios
        .filter((u) => selectedIds.includes(u.id) && u.idRRHH)
        .map((u) => ({ idRRHH: u.idRRHH || "", ips: [ip] }));
      await authService.updateUsuariosIpBulk(data);
      setSuccessModal({ open: true, message: t("users.messages.updated") || "IP actualizada correctamente" });
      fetchUsuarios();
    } catch (e) {
      setErrorModal({ open: true, message: t("users.messages.error") || "Error actualizando IP" });
    }
  };

  // Utilidad para estado
  const isActivo = (estado: string | number | undefined) => {
    return estado === 1 || estado === "A" || estado === "a";
  };

  // Helper function para obtener las IPs activas del usuario
  const getActiveIPs = (usuario: UsuarioApi): string => {
    // Priorizar la nueva estructura ips_activas
    if (usuario.ips_activas && usuario.ips_activas.length > 0) {
      const ips = usuario.ips_activas.map(ip => ip.ip_address);
      // Mostrar máximo 2 IPs, luego agregar "..."
      if (ips.length > 2) {
        return `${ips.slice(0, 2).join(', ')}...`;
      }
      return ips.join(', ');
    }
    
    // Fallback para compatibilidad con versiones anteriores
    if (usuario.ip) {
      return usuario.ip;
    }
    
    if (usuario.ips && usuario.ips.length > 0) {
      // Mostrar máximo 2 IPs, luego agregar "..."
      if (usuario.ips.length > 2) {
        return `${usuario.ips.slice(0, 2).join(', ')}...`;
      }
      return usuario.ips.join(', ');
    }
    
    return "-";
  };

  // Helper function para obtener el número de IPs activas
  const getActiveIPsCount = (usuario: UsuarioApi): number => {
    if (usuario.ips_activas && usuario.ips_activas.length > 0) {
      return usuario.ips_activas.length;
    }
    
    if (usuario.ips && usuario.ips.length > 0) {
      return usuario.ips.length;
    }
    
    if (usuario.ip) {
      return 1;
    }
    
    return 0;
  };

  // Definir columnas para la tabla genérica
  const columns: TableColumn[] = [
    {
      key: 'idRRHH',
      label: 'ID RRHH',
      render: (value) => value || '-'
    },
    {
      key: 'name',
      label: t("users.table.name").toUpperCase()
    },
    {
      key: 'email',
      label: t("users.table.email").toUpperCase()
    },
    {
      key: 'ip',
      label: t("users.table.ip").toUpperCase(),
      render: (value, row) => getActiveIPs(row)
    },
    {
      key: 'estado',
      label: t("users.table.status").toUpperCase(),
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isActivo(value) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {isActivo(value) ? "Activo" : "Inactivo"}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Modals */}
      <IpInputModal
        open={ipModalOpen}
        onClose={() => setIpModalOpen(false)}
        onSave={handleIpModalSave}
      />
      <SuccessModal
        open={successModal.open}
        message={successModal.message}
        onClose={() => setSuccessModal({ open: false, message: "" })}
      />
      <SuccessModal
        open={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: "" })}
      />
      <main className="max-w-full mx-auto px-4">
        <div className={`flex ${wizardOpen ? "flex-row" : "flex-col"} w-full max-w-full`}>
          {/* Tabla */}
          <div className={`${wizardOpen ? "md:w-[calc(100%-400px)] w-full" : "w-full"} flex-shrink-0 overflow-x-auto`}>
            <div className={`bg-white rounded-lg shadow-md p-6 w-full h-full ${wizardOpen ? "md:rounded-r-none rounded-lg" : "rounded-lg"}`}>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {t("users.title")}
              </h3>
              {/* Filtro de búsqueda y tabla tipo ClientesTable */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  {/* Búsqueda y botón agregar IP en la misma fila, responsivo como Locations */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-start order-2 sm:order-1">
                      <input
                        type="text"
                        placeholder={t("users.searchPlaceholder")}
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500 w-full max-w-xs"
                      />
                    </div>
                    <div className="flex justify-end flex-shrink-0 order-3 mt-2 sm:mt-0">
                      <button
                        className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
                        style={{ background: "#cc3399", color: "#fff", fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif" }}
                        onClick={handleBulkAddIp}
                        disabled={selectedIds.length === 0}
                      >
                        Agregar IP
                      </button>
                    </div>
                  </div>
                </div>
                {/* Tabla tipo ClientesTable */}
                <div className="w-full overflow-x-auto hidden sm:block">
                  <GenericTable
                    data={usuarios}
                    columns={columns}
                    loading={loading}
                    error={error}
                    onEdit={handleEdit}
                    showActions={true}
                    hideSearch={true}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    showPagination={true}
                    emptyMessage="No hay usuarios"
                    actionColumnLabel={t("users.table.actions").toUpperCase()}
                    showCheckbox={true}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectOne={handleSelectOne}
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                  />
                </div>
                {/* Vista tipo tarjeta visible solo en móviles */}
                <div className="block sm:hidden space-y-4">
                  {loading ? (
                    <p className="text-center">Cargando...</p>
                  ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                  ) : usuarios.length === 0 ? (
                    <p className="text-center">No hay usuarios</p>
                  ) : (
                    usuarios.map((usuario) => (
                      <div
                        key={usuario.id}
                        className="bg-white shadow rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(usuario.id)}
                            onChange={() => handleSelectOne(usuario.id)}
                            className="mr-2"
                          />
                          {usuario.imagen && (
                            <img
                              src={usuario.imagen}
                              alt={usuario.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          {/* Eliminado el círculo con el número/código */}
                          <h4 className="font-semibold text-lg">
                            {usuario.name}
                          </h4>
                        </div>
                        <p className="text-sm">
                          <strong>ID RRHH:</strong> {usuario.idRRHH || "-"}
                        </p>
                        <p className="text-sm">
                          <strong>Email:</strong> {usuario.email}
                        </p>
                        <p className="text-sm">
                          <strong>IP{getActiveIPsCount(usuario) > 1 ? 's' : ''}:</strong>
                          <span className="ml-1">
                            {getActiveIPsCount(usuario) > 2 ? (
                              <span 
                                title={usuario.ips_activas?.map(ip => ip.ip_address).join(', ') || 
                                       usuario.ips?.join(', ') || 
                                       usuario.ip || 
                                       '-'}
                                className="cursor-help"
                              >
                                {getActiveIPs(usuario)}
                              </span>
                            ) : (
                              getActiveIPs(usuario)
                            )}
                            {getActiveIPsCount(usuario) > 1 && (
                              <span className="ml-1 px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                {getActiveIPsCount(usuario)} IPs
                              </span>
                            )}
                          </span>
                        </p>
                        <p className="text-sm">
                          <strong>Estado:</strong>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              isActivo(usuario.estado)
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isActivo(usuario.estado) ? "Activo" : "Inactivo"}
                          </span>
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-2 rounded-full border border-pink-200 bg-white text-pink-700 hover:text-pink-900 focus:outline-none"
                            title="Editar"
                            style={{ background: '#fff' }}
                          >
                            <Edit2 size={18} color="#cc3399" />
                          </button>
                          {/* Si tienes botón de eliminar, agrégalo aquí igual que en Locations */}
                          {/* <button
                            onClick={() => handleDelete(usuario)}
                            className="p-2 rounded-full border border-red-200 bg-white text-red-600 hover:text-red-800 focus:outline-none"
                            title="Eliminar"
                            style={{ background: '#fff' }}
                          >
                            <Trash2 size={18} color="#cc3399" />
                          </button> */}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Wizard solo cuando está abierto, panel lateral como en cargueras */}
          {wizardOpen && (
            <div className="md:w-[400px] w-full flex-shrink-0">
              <UsuarioWizard
                showWizard={wizardOpen}
                setShowWizard={handleCloseWizard}
                editUser={editUser}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Usuario;
