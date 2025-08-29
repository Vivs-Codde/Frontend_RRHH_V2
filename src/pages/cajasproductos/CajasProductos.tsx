

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import cajasproductos from '../../i18n/cajasproductos';
import FormCajasProductos from './FormCajasProductos';
import { getCajasProductos } from '../../services/cajaProductoService';

// ...existing code...
import CajaProductosModal from './CajaProductosModal';

const CajasProductos: React.FC = () => {
  const { t } = useTranslation('cajasproductos');

  // Estados para la tabla real
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [cajasProductos, setCajasProductos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCaja, setSelectedCaja] = useState<any | null>(null);

  // Obtener cajas con productos de la API
  useEffect(() => {
    if (!showForm) {
      // Permitir consulta pública: no requiere token
      const token = localStorage.getItem('token');
      getCajasProductos(token || '')
        .then((res) => {
          let data = Array.isArray(res) ? res : [];
          // Búsqueda
          if (search) {
            const s = search.toLowerCase();
            data = data.filter((cajaProd: any) => {
              const caja = cajaProd.caja || {};
              const nombre = (caja.nombre || '').toLowerCase();
              const descripcion = (caja.descripcion || '').toLowerCase();
              const medidas = [caja.largo, caja.ancho, caja.profundidad].filter(Boolean).join('x');
              let productosStr = '';
              if (Array.isArray(cajaProd.productos)) {
                productosStr = cajaProd.productos.map((p: any) => (p.nombre || p.Nombre || '')).join(' ').toLowerCase();
              }
              return nombre.includes(s) || descripcion.includes(s) || medidas.includes(s) || productosStr.includes(s);
            });
          }
          const total = data.length;
          const start = (page - 1) * perPage;
          const end = start + perPage;
          setCajasProductos(data.slice(start, end));
          setTotalPages(Math.max(1, Math.ceil(total / perPage)));
          setError(null);
        })
        .catch(() => {
          setError('Error al cargar cajas con productos');
          setCajasProductos([]);
          setTotalPages(1);
        });
    }
  }, [showForm, search, page, perPage]);

  return (
    <div className="min-h-screen bg-gray-100 p-0 m-0 w-full">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-none mx-0">
        <div className="px-4 sm:px-8 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)" }}>
          <div className="flex-1 min-w-0 text-left">
            <h2 className="text-3xl font-bold text-white truncate">{t('tituloCP')}</h2>
          </div>
          {!showForm && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end min-w-0">
              <input
                type="text"
                placeholder={t('buscarCP')}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full sm:w-64 px-3 py-2 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
                style={{ minWidth: 0 }}
              />
            </div>
          )}
          <button
            className="text-white font-semibold px-4 py-2 rounded shadow hover:bg-pink-100 transition-all"
            style={{ background: "#cc3399" }}
            onClick={() => setShowForm(f => !f)}
          >
            {showForm ? t('verTablaCP') : t('agregarCP')}
          </button>
        </div>
        {/* El modal debe ir aquí para que no quede dentro de un div con overflow oculto */}
        {showModal && selectedCaja && (
          <CajaProductosModal caja={selectedCaja} onClose={() => { setShowModal(false); setSelectedCaja(null); }} />
        )}
        <div className="p-2 sm:p-6">
          {showForm ? (
            <FormCajasProductos onCancelar={() => setShowForm(false)} />
          ) : (
            <>
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "80vh" }}>
                <div className="relative">
                  {/* Tabla en desktop, cards en móvil */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full border mt-2">
                      <thead>
                        <tr className="bg-[#cc3399] text-white">
                          <th className="py-2 px-2 text-left">{t('nombreCP')}</th>
                          <th className="py-2 px-2 text-left">{t('medidasCP')}</th>
                          <th className="py-2 px-2 text-center">{t('productosCP')}</th>
                          <th className="py-2 px-2 text-center">{t('pesoCP')}</th>
                          <th className="py-2 px-2 text-center">{t('accionesCP')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {error && (
                          <tr><td colSpan={6} className="text-center py-4 text-red-500">{t('errorCP')}</td></tr>
                        )}
                        {!error && cajasProductos.length === 0 && (
                          <tr><td colSpan={6} className="text-center py-4 text-gray-400">{t('noCajasCP')}</td></tr>
                        )}
                        {!error && cajasProductos.map((cajaProd, idx) => {
                          const c = cajaProd.caja || {};
                          const medidas = [c.largo, c.ancho, c.profundidad].filter(Boolean).join('x');
                          return (
                            <tr key={c.id + '-' + idx} className="border-b">
                              <td className="py-2 px-2 text-left">{c.nombre}</td>
                              <td className="py-2 px-2 text-left">{medidas || '-'}</td>
                              <td className="py-2 px-2 text-center">{Array.isArray(cajaProd.productos) ? cajaProd.productos.length : cajaProd.cantidad || 0}</td>
                              <td className="py-2 px-2 text-center">{c.peso || '-'}</td>
                              <td className="py-2 px-2 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200" style={{background:"white"}} title="Ver"
                                    onClick={() => { setSelectedCaja(cajaProd); setShowModal(true); }}
                                  >
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="#cc3399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="#cc3399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Cards en móvil */}
                  <div className="sm:hidden flex flex-col gap-3 mt-2">
                    {error && (
                      <div className="text-center py-4 text-red-500 bg-white rounded-lg shadow">{t('errorCP')}</div>
                    )}
                    {!error && cajasProductos.length === 0 && (
                      <div className="text-center py-4 text-gray-400 bg-white rounded-lg shadow">{t('noCajasCP')}</div>
                    )}
                    {!error && cajasProductos.map((cajaProd, idx) => {
                      const c = cajaProd.caja || {};
                      const medidas = [c.largo, c.ancho, c.profundidad].filter(Boolean).join('x');
                      return (
                        <div key={c.id + '-' + idx} className="bg-white rounded-xl shadow border p-3 flex flex-col gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 font-semibold">{t('nombreCP')}</span>
                            <span className="text-base font-medium text-gray-900">{c.nombre}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 font-semibold">{t('codigoCP')}</span>
                            <span className="text-sm text-gray-800">{c.id}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 font-semibold">{t('medidasCP')}</span>
                            <span className="text-sm text-gray-800">{medidas || '-'}</span>
                          </div>
                          <div className="flex flex-row gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 font-semibold">{t('productosCP')}</span>
                              <span className="text-sm text-gray-800">{Array.isArray(cajaProd.productos) ? cajaProd.productos.length : cajaProd.cantidad || 0}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 font-semibold">{t('pesoCP')}</span>
                              <span className="text-sm text-gray-800">{c.peso || '-'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end mt-2">
                            <button className="text-fuchsia-700 hover:text-fuchsia-900 p-2 rounded-full border border-fuchsia-200 bg-white" title="Ver"
                              onClick={() => { setSelectedCaja(cajaProd); setShowModal(true); }}
                            >
                              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="#cc3399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="#cc3399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
              {/* Modal para ver caja con productos (se renderiza fuera para evitar problemas de overflow) */}
                  </div>
                  {/* Paginación igual a Recetas */}
                  <div className="flex flex-row items-center justify-between gap-2 mt-4 px-2 pb-2">
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 mx-auto">
                      <button
                        className={`rounded-full border border-pink-200 px-2 py-1 flex items-center justify-center hover:bg-pink-100 transition-colors ${page === 1 ? 'cursor-not-allowed' : ''}`}
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        aria-label="Anterior"
                        style={{ minWidth: 32, minHeight: 32, background: '#fff' }}
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path d="M15 19l-7-7 7-7" stroke={page === 1 ? '#d1d5db' : '#cc3399'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <span className="text-sm font-semibold select-none">Página {page} de {totalPages}</span>
                      <button
                        className={`rounded-full border border-pink-200 px-2 py-1 flex items-center justify-center hover:bg-pink-100 transition-colors ${page === totalPages ? 'cursor-not-allowed' : ''}`}
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        aria-label="Siguiente"
                        style={{ minWidth: 32, minHeight: 32, background: '#fff' }}
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path d="M9 5l7 7-7 7" stroke={page === totalPages ? '#d1d5db' : '#cc3399'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="border border-pink-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                        value={perPage}
                        onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                        style={{ minWidth: 48 }}
                      >
                        {[5, 10, 20, 50].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CajasProductos;