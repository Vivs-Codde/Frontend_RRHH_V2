import React from 'react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth }) => {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-12 w-full ${maxWidth ? maxWidth : 'max-w-6xl'} relative`}
        style={{ fontFamily: 'Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif', minHeight: '70vh' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-pink-600 hover:text-pink-800 text-2xl font-bold"
          aria-label={t('common.close')}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#cc3399' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
