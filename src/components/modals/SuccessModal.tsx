import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface SuccessModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number; // ms
  type?: 'success' | 'error';
}

const SuccessModal: React.FC<SuccessModalProps> = ({ open, message, onClose, duration = 2000, type = 'success' }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, onClose, duration]);

  if (!open) return null;

  const isError = type === 'error';
  const borderColor = isError ? 'border-red-400' : 'border-green-400';
  const textColor = isError ? 'text-red-600' : 'text-green-600';
  const title = isError ? t('common.error') : t('common.success');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.10)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white bg-opacity-90 rounded-lg shadow-lg p-6 min-w-[300px] max-w-xs text-center border-2 ${borderColor}`}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className={`mb-2 text-lg font-semibold ${textColor}`}>{title}</div>
        <div className="mb-4 text-gray-700">{message}</div>
      </div>
    </div>
  );
};

export default SuccessModal;
