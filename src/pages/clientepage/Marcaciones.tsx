import React, { useState } from 'react';
import { MdOutlineFormatListNumberedRtl } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import GenericTable from '../../components/GenericTable';
import type{ TableColumn } from '../../components/GenericTable';
import {
  toggleMarcacionStatus,
  updateMarcacionOrder
} from '../../services/marcacionesService';

// Estructura de respuesta paginada para marcaciones
interface PaginatedResponse {
  data: any[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from?: number;
  to?: number;
}

interface MarcacionesTableProps {
  marcaciones: any[] | PaginatedResponse;
  loading: boolean;
  error: string;
  onEdit: (marcacion: any) => void;
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  perPage: number;
  setPerPage: (n: number) => void;
  hideSearch?: boolean;
  onOrderUpdated?: () => void;
  reportMode?: boolean;
// Fin de la interfaz MarcacionesTableProps
}

const Marcaciones: React.FC<MarcacionesTableProps> = ({
  marcaciones,
  loading,
  error,
  onEdit,
  search,
  setSearch,
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

  // Estado local para marcaciones ordenados
  const [localMarcaciones, setLocalMarcaciones] = useState<any[]>([]);

  // Sincronizar localMarcaciones si cambia el prop marcaciones
  React.useEffect(() => {
    // Verificar si tenemos datos de marcaciones
    if (marcaciones) {
      // Comprobar si marcaciones es un array directamente o tiene estructura paginada
      if (Array.isArray(marcaciones)) {
        setLocalMarcaciones(marcaciones);
      } else if (typeof marcaciones === 'object' && 'data' in marcaciones && Array.isArray(marcaciones.data)) {
        // Es una estructura paginada
        setLocalMarcaciones(marcaciones.data);
      } else {
        // Fallback a array vacío si no reconocemos la estructura
        setLocalMarcaciones([]);
      }
    } else {
      setLocalMarcaciones([]);
    }
  }, [marcaciones]);

  // Cambiar estado del cliente
  const handleStatusChange = async (marcacion: any) => {
    setStatusLoading(prev => ({ ...prev, [marcacion.id]: true }));
    try {
      await toggleMarcacionStatus(marcacion.id, !(marcacion.status === 1 || marcacion.status === true));
      marcacion.status = !(marcacion.status === 1 || marcacion.status === true);
    } catch (e) {
      alert('Error al cambiar el estado de la marcación');
    } finally {
      setStatusLoading(prev => ({ ...prev, [marcacion.id]: false }));
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
      await updateMarcacionOrder(String(orderModal.id), orderModal.value);
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
      key: 'nombre',
      label: t('name'),
      render: (value) => value || ''
    },
    {
      key: 'codigo',
      label: t('code'),
      render: (value) => value || ''
    },
    {
      key: 'cliente',
      label: t('client'),
      render: (value, row) => row.cliente?.NombreCliente || row.cliente?.nombre || value || ''
    },
    {
      key: 'transporte',
      label: t('driver'),
      render: (value, row) => {
        if (row.transporte) {
          return row.transporte.chofer || row.transporte.propietario || '';
        }
        return '';
      }
    },
    {
      key: 'ubicacion',
      label: t('location'),
      render: (value, row) => {
        const ciudad = row.ciudad || '';
        const estado = row.estado || '';
        return [ciudad, estado].filter(Boolean).join(', ');
      }
    },
    {
      key: 'contacto',
      label: t('contact'),
      render: (value, row) => {
        const contacto = row.contacto || '';
        const telefono = row.telefono ? `(${row.telefono})` : '';
        return [contacto, telefono].filter(Boolean).join(' ');
      }
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
  const handleAction = (marcacion: any) => {
    if (marcacion.__orderAction) {
      openOrderModal(marcacion.id, marcacion.orden);
    } else {
      onEdit(marcacion);
    }
  };

  return (
    <>
      <GenericTable
        data={
          [...localMarcaciones]
            // No filtramos localmente, confiamos en que la API ya filtra correctamente
            .sort((a, b) => {
              // First sort by orden if available
              if (typeof a.orden === 'number' && typeof b.orden === 'number') {
                return a.orden - b.orden;
              }
              if (typeof a.orden === 'number') return -1;
              if (typeof b.orden === 'number') return 1;
              
              // Then try to sort by creation date (newest first) if orden isn't available
              const dateA = a.created_at ? new Date(a.created_at) : null;
              const dateB = b.created_at ? new Date(b.created_at) : null;
              if (dateA && dateB) return dateB.getTime() - dateA.getTime();
              
              return 0;
            })
        }
        columns={columns}
        loading={loading}
        error={error}
        onEdit={handleAction}
        showActions={!reportMode}
        search={search}
        setSearch={setSearch}
        hideSearch={hideSearch}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        perPage={perPage}
        setPerPage={setPerPage}
        showPagination={true}
        emptyMessage={t('common.noData', 'No hay datos disponibles')}
        actionColumnLabel={t('common.actions')}
        orderIconComponent={MdOutlineFormatListNumberedRtl}
      />

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

export default Marcaciones;
