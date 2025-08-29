import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS, getAuthHeaders } from "../constants/api";
import GenericTable from "../components/GenericTable";
import type { TableColumn } from "../components/GenericTable";
interface ReporteLoginItem {
  id: number;
  email: string;
  fecha_hora_ingreso: string;
  ip: string;
  latitud: string;
  longitud: string;
}

const ReporteLogin: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<ReporteLoginItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estados para filtrado, búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState<ReporteLoginItem[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.REPORT_LOGIN, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Error al obtener reporte de login");
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
        setFilteredData(Array.isArray(json) ? json : []);
      } catch (e: any) {
        setError(e.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Efecto para filtrar los datos basado en el término de búsqueda y fechas
  useEffect(() => {
    let filtered = data;

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ip.includes(searchTerm) ||
        item.fecha_hora_ingreso.includes(searchTerm) ||
        item.latitud.includes(searchTerm) ||
        item.longitud.includes(searchTerm)
      );
    }

    // Filtrar por rango de fechas
    if (dateFrom || dateTo) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.fecha_hora_ingreso);
        let isInRange = true;

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          isInRange = isInRange && itemDate >= fromDate;
        }

        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          isInRange = isInRange && itemDate <= toDate;
        }

        return isInRange;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, data]);


  // Calcular datos para la paginación
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Funciones para manejar la paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Definir columnas para la tabla genérica
  const columns: TableColumn[] = [
    { key: 'email', label: t('reporteLogin.email', 'EMAIL') },
    { key: 'fecha_hora_ingreso', label: t('reporteLogin.date', 'FECHA/HORA') },
    { key: 'ip', label: t('reporteLogin.ip', 'IP') },
    { key: 'latitud', label: t('reporteLogin.latitude', 'LATITUD') },
    { key: 'longitud', label: t('reporteLogin.longitude', 'LONGITUD') },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-full pl-0 pr-4">
        <div className="flex flex-wrap relative">
          <div className="bg-white rounded-lg shadow-md p-4 flex-1 ml-0 w-full max-w-full">
            {/* Título */}
            <div className="flex justify-center items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                {t('reporteLogin.title', 'Reporte de Logins')}
              </h3>
            </div>
            
            {/* Filtros */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reporteLogin.search', 'Buscar')}
                </label>
                <input
                  type="text"
                  placeholder={t('reporteLogin.search', 'Buscar por email, IP, etc...')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                />
              </div>
              <div className="flex-1 lg:flex-none lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reporteLogin.dateFrom', 'Fecha desde')}
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={handleDateFromChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                />
              </div>
              <div className="flex-1 lg:flex-none lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reporteLogin.dateTo', 'Fecha hasta')}
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={handleDateToChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                />
              </div>
              <div className="flex items-end">
                {/*
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Limpiar
                </button>
                */}
              </div>
            </div>

            {/* Información de filtros activos */}
            {(searchTerm || dateFrom || dateTo) && (
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="flex">
                  <div>
                    <p className="text-sm text-blue-700">
                      <strong>{t('reporteLogin.search', 'Filtros activos')}:</strong>
                      {searchTerm && ` ${t('reporteLogin.search', 'Búsqueda')}: "${searchTerm}"`}
                      {dateFrom && ` | ${t('reporteLogin.dateFrom', 'Desde')}: ${dateFrom}`}
                      {dateTo && ` | ${t('reporteLogin.dateTo', 'Hasta')}: ${dateTo}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Tabla genérica (solo en pantallas medianas o grandes) */}
            <div className="overflow-x-auto hidden sm:block">
              <GenericTable
                data={currentData}
                columns={columns}
                loading={loading}
                error={error}
                showActions={false}
                hideSearch={true}
                page={currentPage}
                setPage={setCurrentPage}
                totalPages={totalPages}
                perPage={itemsPerPage}
                setPerPage={setItemsPerPage}
                showPagination={true}
                emptyMessage={(searchTerm || dateFrom || dateTo) ? t('reporteLogin.noResults', 'No se encontraron resultados con los filtros aplicados') : t('reporteLogin.noRecords', 'Sin registros')}
              />
             
            </div>

            {/* Cards (solo en móviles) */}
            <div className="block sm:hidden">
              {loading ? (
                <div className="text-center py-8">{t('common.loading', 'Cargando...')}</div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : currentData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {(searchTerm || dateFrom || dateTo) ? t('reporteLogin.noResults', 'No se encontraron resultados con los filtros aplicados') : t('reporteLogin.noRecords', 'Sin registros')}
                </div>
              ) : (
                <div className="space-y-4">
                  {currentData.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white shadow rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {/* Eliminado el círculo con las iniciales del email */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-lg text-fuchsia-700 break-words whitespace-pre-line break-all w-full" style={{wordBreak: 'break-all'}}>
                            {item.email}
                          </h4>
                          <p className="text-xs text-gray-500 break-words">{item.fecha_hora_ingreso}</p>
                        </div>
                      </div>
                      <div className="text-sm mb-2">
                        <p>
                          <strong>{t('reporteLogin.ip', 'IP')}:</strong> {item.ip}
                        </p>
                        <p>
                          <strong>{t('reporteLogin.latitude', 'Latitud')}:</strong> {item.latitud}
                        </p>
                        <p>
                          <strong>{t('reporteLogin.longitude', 'Longitud')}:</strong> {item.longitud}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Paginación para vista móvil */}
              {!loading && !error && totalPages > 1 && (
                <div className="flex flex-col items-center mt-4 gap-2">
                  <div className="text-sm text-gray-700 text-center">
                    {t('common.page', { current: currentPage, total: totalPages })} ({totalItems} {t('common.noData', 'registros')})
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: "#e83e8c" }}
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <select 
                      className="px-2 py-1 border rounded text-sm"
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                    <button
                      className="p-2 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: "#e83e8c" }}
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReporteLogin;
