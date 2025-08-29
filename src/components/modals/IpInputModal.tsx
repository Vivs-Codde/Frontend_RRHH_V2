import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface IpInputModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (ip: string) => void;
}

const IpInputModal: React.FC<IpInputModalProps> = ({ open, onClose, onSave }) => {
  const { t } = useTranslation();
  const [ip, setIp] = useState("");
  const [error, setError] = useState("");

  // Regex para IPv4
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo números y puntos
    let value = e.target.value.replace(/[^0-9.]/g, "");
    // Evitar más de 3 puntos
    const parts = value.split('.');
    if (parts.length > 4) {
      value = parts.slice(0, 4).join('.');
    }
    setIp(value);
    if (value === "" || ipv4Regex.test(value)) {
      setError("");
    } else {
      setError(t('common.ipModal.validationError'));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.10)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 min-w-[300px] max-w-xs text-center border-2 border-fuchsia-400"
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-2 text-lg font-semibold text-fuchsia-600">{t('common.ipModal.title')}</div>
        <input
          type="text"
          className="w-full px-3 py-2 border border-fuchsia-300 rounded mb-1 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          placeholder={t('common.ipModal.placeholder')}
          value={ip}
          onChange={handleChange}
          inputMode="decimal"
          pattern="[0-9.]*"
          maxLength={15}
          autoComplete="off"
        />
        {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
        <div className="flex justify-center gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold"
            onClick={onClose}
          >
            {t('common.cancel')}
          </button>
          <button
            className="px-4 py-2 rounded bg-fuchsia-600 text-white font-semibold hover:bg-fuchsia-700"
            style={{ backgroundColor: "#cc3399" }}
            onClick={() => { if (ip && ipv4Regex.test(ip)) onSave(ip); }}
            disabled={!ip || !!error}
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IpInputModal;
