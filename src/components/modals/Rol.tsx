import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { createRole } from '../../services/rolesService';

interface ModalRolProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const ModalRol: React.FC<ModalRolProps> = ({ open, onClose, onCreate }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('common.roleModal.nameRequiredError'));
      return;
    }
    setLoading(true);
    try {
      await createRole(name.trim());
      onCreate(name.trim()); // Notifica al padre para refrescar
      setName('');
      setError('');
      onClose();
    } catch (err) {
      setError(t('common.roleModal.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('common.roleModal.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full border border-pink-200 rounded-xl py-3 px-4 text-gray-700 bg-[#f9e7eb] focus:outline-none focus:ring-2 focus:ring-pink-300"
          placeholder={t('common.roleModal.placeholder')}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-[#cc3399] hover:bg-pink-700 transition-colors disabled:bg-[#cc3399] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#cc3399' }}
          disabled={loading}
        >
          {loading ? t('common.roleModal.saving') : t('common.roleModal.saveButton')}
        </button>
      </form>
    </Modal>
  );
};

export default ModalRol;
