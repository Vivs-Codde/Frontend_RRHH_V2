import React, { useState } from 'react';
import { MdOutlineFormatListNumberedRtl } from 'react-icons/md';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GenericTable from '../GenericTable';
import type { TableColumn } from '../GenericTable';
import ClienteModal from '../modals/ClienteModal';
import { toggleClienteStatus, updateClienteOrden } from '../../services/clienteService';

interface ClientesTableProps {
  customers: any[];
  loading: boolean;
  error: string;
  onEdit: (customer: any) => void;
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  perPage: number;
  setPerPage: (n: number) => void;
  hideSearch?: boolean; // <-- Agregado para ocultar el buscador
  onOrderUpdated?: () => void;
  reportMode?: boolean; // <-- Agregado para modo reporte
}

const ClientesTable: React.FC<ClientesTableProps> = ({ 
  customers, 
  loading, 
  error, 
  onEdit, 
  search, 
  setSearch, // eslint-disable-line @typescript-eslint/no-unused-vars
  page, 
  setPage, 
  totalPages, 
  perPage, 
  setPerPage, 
  hideSearch = false,
  onOrderUpdated,
  reportMode = false
}) => {
  const { t } = useTranslation();
  const [statusLoading, setStatusLoading] = useState<{[id:number]:boolean}>({});

  // Estado local para clientes ordenados
  // Estado para modal de cliente
  const [showClienteModal, setShowClienteModal] = React.useState(false);
  const [selectedCliente, setSelectedCliente] = React.useState<any | null>(null);
  const [localCustomers, setLocalCustomers] = useState<any[]>(customers);

  // Sincronizar localCustomers si cambia el prop customers
  React.useEffect(() => {
    setLocalCustomers(customers);
  }, [customers]);

  // Cambiar estado del cliente
  const handleStatusChange = async (customer: any) => {
    setStatusLoading(prev => ({ ...prev, [customer.id]: true }));
    try {
      await toggleClienteStatus(customer.id, customer.status);
      // Actualizar estado local después de la llamada exitosa
      customer.status = !(customer.status === 1 || customer.status === true);
    } catch (e) {
      alert('Error al cambiar el estado del cliente');
    } finally {
      setStatusLoading(prev => ({ ...prev, [customer.id]: false }));
    }
  };

  // Estado para modal de orden
  const [orderModal, setOrderModal] = useState<{ open: boolean; id?: number; value?: number }>({ open: false });
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Función para abrir el modal
  const openOrderModal = (id: number, value: number) => setOrderModal({ open: true, id, value });
  const closeOrderModal = () => setOrderModal({ open: false });

  // PATCH orden y actualizar local
  const handleOrderChange = async () => {
    if (!orderModal.id || typeof orderModal.value !== 'number') return;
    setOrderLoading(true);
    setOrderError(null);
    try {
      await updateClienteOrden(orderModal.id, orderModal.value);
      // Llamar callback para recargar desde la API
      if (typeof onOrderUpdated === 'function') onOrderUpdated();
      closeOrderModal();
    } catch (e: any) {
      setOrderError(e.message || 'Error al actualizar el orden');
    } finally {
      setOrderLoading(false);
    }
  };

  // Configuración de columnas para la tabla genérica
  const columns: TableColumn[] = [
    {
      key: 'orden',
      label: t('clients.table.order', 'Orden'),
      render: (value) => value !== undefined && value !== null ? value : ''
    },
    {
      key: 'NombreCliente',
      label: t('clients.table.name'),
      render: (value) => value || ''
    },
    {
      key: 'acciones',
      label: 'Marcaciones',
      sortable: false,
      width: '10%',
      align: 'center',
      cellClassName: 'py-2 px-2 text-center bg-white align-middle text-sm',
      render: (_: any, row: any) => (
        <button
          className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white"
          onClick={() => {
            setSelectedCliente(row);
            setShowClienteModal(true);
          }}
          title="Ver cliente"
          style={{ background: '#fff' }}
        >
          <Eye size={20} color="#cc3399" />
        </button>
      ),
    },
    {
      key: 'codcustomer',
      label: t('clients.form.code'),
      render: (value) => value || ''
    },
    {
      key: 'direccion',
      label: t('clients.form.address'),
      render: (value) => value || ''
    },
    {
      key: 'ciudad',
      label: t('clients.form.city'),
      render: (value) => value || ''
    },
    {
      key: 'telefono',
      label: t('clients.form.phone'),
      render: (value) => value || ''
    },
    {
      key: 'vendedor',
      label: t('salespersonData'),
      render: (_value, row) => row.vendedor?.nombre || row.vendedor || ''
    },
    {
      key: 'status',
      label: t('common.status', 'Estado'),
      render: (value, row) => reportMode ? (
        <span className={`text-xs font-medium ${value === 1 || value === true ? 'text-green-700' : 'text-gray-500'}`}>
          {value === 1 || value === true ? t('common.active') : t('common.inactive')}
        </span>
      ) : (
        <div className="flex items-center gap-2 justify-center">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={value === 1 || value === true}
              onChange={() => handleStatusChange(row)}
              disabled={statusLoading[row.id]}
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 ${value === 1 || value === true ? 'peer-checked:bg-[#cc3399] bg-[#cc3399]' : 'peer-checked:bg-gray-300 bg-gray-300'}`}></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
          </label>
          <span className={`ml-2 text-xs font-medium ${value === 1 || value === true ? 'text-green-700' : 'text-gray-500'}`}>
            {value === 1 || value === true ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      )
    }
  ];
  

  // Acción personalizada para los botones de acciones
  const handleAction = (customer: any) => {
    if (customer.__orderAction) {
      openOrderModal(customer.id, customer.orden);
    } else {
      onEdit(customer);
    }
  };

  return (
    <>
      <GenericTable
        data={
          [...localCustomers].sort((a, b) => {
            if (typeof a.orden === 'number' && typeof b.orden === 'number') {
              return a.orden - b.orden;
            }
            if (typeof a.orden === 'number') return -1;
            if (typeof b.orden === 'number') return 1;
            return 0;
          })
        }
        columns={columns}
        loading={loading}
        error={error}
        onEdit={handleAction}
        showActions={!reportMode}
        search={search}
        hideSearch={hideSearch}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        perPage={perPage}
        setPerPage={setPerPage}
        showPagination={true}
        emptyMessage={t('common.noData')}
        actionColumnLabel={t('common.actions')}
        orderIconComponent={MdOutlineFormatListNumberedRtl}
      />

      {/* Modal para ver datos de cliente */}
      {showClienteModal && selectedCliente && (
        <ClienteModal
          cliente={selectedCliente}
          onClose={() => setShowClienteModal(false)}
        />
      )}

      {/* Modal para cambiar orden */}
      {!reportMode && orderModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.10)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]">
            <h2 className="text-lg font-semibold mb-4 text-fuchsia-700">{t('clients.table.order', 'Editar orden')}</h2>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full mb-3"
              value={orderModal.value ?? ''}
              min={1}
              onChange={e => setOrderModal(modal => ({ ...modal, value: Number(e.target.value) }))}
              disabled={orderLoading}
              autoFocus
            />
            {orderError && <div className="text-red-600 text-sm mb-2">{orderError}</div>}
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                onClick={closeOrderModal}
                disabled={orderLoading}
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                className="px-4 py-2 rounded font-semibold"
                style={{ background: '#cc3399', color: '#fff' }}
                onClick={handleOrderChange}
                disabled={orderLoading || !orderModal.value}
              >
                {orderLoading ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientesTable;
