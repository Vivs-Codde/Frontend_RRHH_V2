import React, { useRef } from "react";
import { useTranslation } from 'react-i18next';

interface CajaProductosModalProps {
  caja: any;
  onClose: () => void;
}

const CajaProductosModal: React.FC<CajaProductosModalProps> = ({ caja, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('cajasproductos');
  const c = caja?.caja || {};
  const medidas = [c.largo, c.ancho, c.profundidad].filter(Boolean).join('x');
  const productos = Array.isArray(caja?.productos) ? caja.productos : [];

  // Cierra si el click es fuera del modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative"
      >
        <button
          className="absolute top-2 right-2 text-white hover:text-red-500 text-xl font-bold"
          style={{ background: "#cc3399" }}
          onClick={onClose}
          title={t('cerrarCP')}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-[#cc3399] text-left">{t('detalleCP')}</h2>
        <div className="mb-2 text-left"><b>{t('modalNombreCP')}:</b> {c.nombre || '-'}</div>
        <div className="mb-2 text-left"><b>{t('modalMedidasCP')}:</b> {medidas || '-'}</div>
        <div className="mb-2 text-left"><b>{t('modalPesoCP')}:</b> {c.peso || '-'}</div>
        <div className="mb-2 text-left"><b>{t('modalProductosCP')}:</b></div>
        <div className="flex flex-col gap-2 text-left">
          {productos.length === 0 && <div className="text-gray-400">{t('noProductosCP')}</div>}
          {productos.map((p: any, idx: number) => (
            <div key={p.id || idx} className="py-2 text-left border-b border-pink-100 last:border-b-0">
              <div className="mb-1 text-base font-bold text-[#cc3399] text-left">{t('productosCP')}: <span className="font-medium text-black">{p.descripcion || '-'}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CajaProductosModal;
