import React from 'react';
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Definir el tipo para las columnas
export interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cellClassName?: string;
}

// Props de la tabla genérica
interface GenericTableProps {
  data: any[];
  columns: TableColumn[];
  loading?: boolean;
  error?: string;
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
  search?: string;
  setSearch?: (s: string) => void;
  hideSearch?: boolean;
  page?: number;
  setPage?: (p: number) => void;
  totalPages?: number;
  perPage?: number;
  setPerPage?: (n: number) => void;
  showPagination?: boolean;
  emptyMessage?: string;
  actionColumnLabel?: string;
  // Props para selección múltiple
  showCheckbox?: boolean;
  selectedIds?: number[];
  onSelectAll?: () => void;
  onSelectOne?: (id: number) => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  extraHeaderContent?: React.ReactNode;
  orderIconComponent?: React.ComponentType<{ className?: string; title?: string }>;
}

const GenericTable: React.FC<GenericTableProps> = ({
  data,
  columns,
  loading = false,
  error = '',
  onEdit,
  onDelete,
  showActions = true,
  // @ts-ignore - Estos parámetros se declaran para mantener la interfaz completa
  search = '', 
  // @ts-ignore - pero no se usan en la implementación actual
  setSearch, 
  // @ts-ignore - Se mantienen para compatibilidad con implementaciones futuras
  hideSearch = true, // Por defecto oculto como en la tabla original
  page = 1,
  setPage,
  totalPages = 1,
  perPage = 10,
  setPerPage,
  showPagination = true,
  emptyMessage,
  actionColumnLabel,
  // Props para selección múltiple
  showCheckbox = false,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  isAllSelected = false,
  isIndeterminate = false,
  extraHeaderContent,
  orderIconComponent,
}) => {
  const { t } = useTranslation();

  // Calcular número de columnas para colspan
  const totalColumns = (showCheckbox ? 1 : 0) + columns.length + (showActions && (onEdit || onDelete) ? 1 : 0);

  return (
    <div className="p-2">
      {/* Buscador (si no está oculto) */}
    

      {/* Tabla en desktop/tablet */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              {showCheckbox && (
                <th
                  className="py-2 px-3 font-bold text-sm text-left text-gray-100 uppercase tracking-wider border-b"
                  style={{ background: 'rgba(204, 51, 153, 1)' }}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={onSelectAll}
                    style={{ accentColor: 'rgba(204, 51, 153, 1)' }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`py-2 px-3 font-bold text-sm text-${column.align || 'left'} text-gray-100 uppercase tracking-wider border-b`}
                  style={{ background: 'rgba(204, 51, 153, 1)', ...(column.width ? { width: column.width } : {}) }}
                >
                  {column.label}
                </th>
              ))}
              {showActions && (onEdit || onDelete) && (
                <th
                  className="py-2 px-3 font-bold text-sm text-center text-gray-100 uppercase tracking-wider border-b"
                  style={{ background: 'rgba(204, 51, 153, 1)' }}
                >
                  {actionColumnLabel || t('common.actions')}
                </th>
              )}
              {/* Extra header content, e.g. Excel button */}
              {extraHeaderContent && (
                <th
                  className="py-2 px-3 font-bold text-sm text-center text-gray-100 uppercase tracking-wider border-b"
                  style={{ background: 'rgba(204, 51, 153, 1)' }}
                >
                  {extraHeaderContent}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse border-b">
                    {showCheckbox && (
                      <td className="py-3 px-2">
                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      </td>
                    )}
                    {columns.map((_column, colIndex) => (
                      <td key={`skeleton-cell-${i}-${colIndex}`} className="py-3 px-2">
                        <div className="h-5 bg-gray-200 rounded w-full max-w-[150px]"></div>
                      </td>
                    ))}
                    {showActions && (
                      <td className="py-3 px-2">
                        <div className="flex justify-center gap-2">
                          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                        </div>
                      </td>
                    )}
                    {extraHeaderContent && (
                      <td className="py-3 px-2">
                        <div className="h-5 w-10 mx-auto bg-gray-200 rounded"></div>
                      </td>
                    )}
                  </tr>
                ))}
              </>
            ) : error ? (
              <tr>
                <td colSpan={totalColumns} className="text-center py-3 text-red-500">
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={totalColumns} className="text-center py-3 text-gray-500">
                  {emptyMessage || t('common.noData')}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index} className="border-b hover:bg-gray-50">
                  {showCheckbox && (
                    <td className="py-1 px-2 text-left bg-white align-middle whitespace-nowrap text-sm font-normal">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => onSelectOne && onSelectOne(item.id)}
                        style={{ accentColor: 'rgba(204, 51, 153, 1)' }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.cellClassName || `py-1 px-2 text-${column.align || 'left'} bg-white align-middle whitespace-nowrap text-sm font-normal`}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key] || ''}
                    </td>
                  ))}
                  {showActions && (onEdit || onDelete) && (
                    <td className="py-1 px-2 text-center bg-white align-middle whitespace-nowrap text-sm font-normal">
                      <div className="flex justify-center gap-2">
                        {onEdit && (
                          <>
                            <button
                              onClick={() => onEdit(item)}
                              className="p-0 m-0 border-none button-icon-no-bg hover:opacity-80 focus:outline-none"
                              title={t('common.edit')}
                              style={{ color: '#e83e8c' }}
                            >
                              <Edit2 size={20} />
                            </button>
                            {typeof item.orden !== 'undefined' && orderIconComponent && (
                              <button
                                onClick={() => onEdit({ ...item, __orderAction: true })}
                                className="p-0 m-0 border-none button-icon-no-bg hover:opacity-80 focus:outline-none ml-1"
                                title={t('clients.table.order', 'Editar orden')}
                                style={{ color: '#e83e8c' }}
                              >
                                {React.createElement(orderIconComponent, { className: 'text-xl', title: 'Orden' })}
                              </button>
                            )}
                          </>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-0 m-0 border-none button-icon-no-bg hover:opacity-80 focus:outline-none"
                            title={t('common.delete')}
                            style={{ color: '#e83e8c' }}
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards en mobile */}
      <div className="block sm:hidden">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={`skeleton-mobile-${i}`} className="animate-pulse bg-white shadow rounded-lg p-4">
                <div className="flex flex-col items-center gap-1 mb-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="space-y-2 mb-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={`skeleton-mobile-${i}-field-${j}`} className="flex flex-col">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">{emptyMessage || t('common.noData')}</p>
        ) : (
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={item.id || index} className="bg-white shadow rounded-lg p-4">
                {/* Render principal: nombre o primer campo */}
                <div className="flex flex-col items-center gap-1 mb-2">
                  {columns[0].render ? (
                    <div className="font-semibold text-lg text-fuchsia-700 text-center break-words w-full" style={{wordBreak: 'break-word'}}>
                      {columns[0].render(item[columns[0].key], item)}
                    </div>
                  ) : (
                    <h4 className="font-semibold text-lg text-fuchsia-700 text-center break-words w-full" style={{wordBreak: 'break-word'}}>
                      {item[columns[0].key] || ''}
                    </h4>
                  )}
                  {columns[1] && (
                    columns[1].render ? (
                      <div className="text-xs text-gray-500 text-center break-words w-full">
                        {columns[1].render(item[columns[1].key], item)}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 text-center break-words w-full">
                        {item[columns[1].key] || ''}
                      </p>
                    )
                  )}
                </div>
                <div className="text-sm mb-2">
                  {columns.slice(2).map((col) => (
                    col.render
                      ? (
                          <div key={col.key} className="break-words">
                            <strong>{col.label}:</strong>{' '}
                            {col.render(item[col.key], item)}
                          </div>
                        )
                      : (
                          <p key={col.key} className="break-words">
                            <strong>{col.label}:</strong>{' '}
                            {item[col.key] || ''}
                          </p>
                        )
                  ))}
                </div>
                {showActions && (onEdit || onDelete) && (
                  <div className="flex justify-end gap-2 mt-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-pink-700 hover:text-pink-900 p-2 rounded-full border border-pink-200 bg-white"
                        title={t('common.edit')}
                        style={{ background: '#fff' }}
                      >
                        <Edit2 size={18} color="#cc3399" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full border border-red-200 bg-white"
                        title={t('common.delete')}
                        style={{ background: '#fff' }}
                      >
                        <Trash2 size={18} color="#cc3399" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {showPagination && setPage && setPerPage && (
        <div className="flex justify-end mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-1 rounded button-icon-no-bg"
              title={t('common.previous')}
              style={{ color: page === 1 ? '#ccc' : '#e83e8c' }}
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-sm">
              {t('common.page', { current: page, total: totalPages || 1 })}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
              className="p-1 rounded button-icon-no-bg"
              title={t('common.next')}
              style={{ color: (page === totalPages || totalPages === 0) ? '#ccc' : '#e83e8c' }}
            >
              <ChevronRight size={22} />
            </button>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 px-2 py-1 border rounded text-sm"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericTable;
