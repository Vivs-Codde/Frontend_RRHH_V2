import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { createPermission } from '../../services/rolePermissionsService';

interface ModalPermissionProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, module: string, action: string) => void;
}

const ModalPermission: React.FC<ModalPermissionProps> = ({ open, onClose, onCreate }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !module.trim() || !action.trim()) {
      setError(t('common.permissionModal.requiredFieldsError'));
      return;
    }
    setLoading(true);
    try {
      await createPermission(name.trim(), module.trim(), action.trim());
      onCreate(name.trim(), module.trim(), action.trim()); // Notifica al padre para refrescar
      setName('');
      setModule('');
      setAction('');
      setError('');
      onClose();
    } catch (err) {
      setError(t('common.permissionModal.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('common.permissionModal.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-pink-700 text-left">{t('common.permissionModal.nameLabel')}</label>
          <input
            type="text"
            className="w-full border border-pink-200 rounded-xl py-3 px-4 text-gray-700 bg-[#f9e7eb] focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder={t('common.permissionModal.namePlaceholder')}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-pink-700 text-left">{t('common.permissionModal.moduleLabel')}</label>
          <input
            type="text"
            className="w-full border border-pink-200 rounded-xl py-3 px-4 text-gray-700 bg-[#f9e7eb] focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder={t('common.permissionModal.modulePlaceholder')}
            value={module}
            onChange={e => setModule(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-pink-700 text-left">{t('common.permissionModal.actionLabel')}</label>
          <input
            type="text"
            className="w-full border border-pink-200 rounded-xl py-3 px-4 text-gray-700 bg-[#f9e7eb] focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder={t('common.permissionModal.actionPlaceholder')}
            value={action}
            onChange={e => setAction(e.target.value)}
          />
        </div>
        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-[#cc3399] hover:bg-pink-700 transition-colors disabled:bg-[#cc3399] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#cc3399' }}
          disabled={loading}
        >
          {loading ? t('common.permissionModal.saving') : t('common.permissionModal.saveButton')}
        </button>
      </form>
    </Modal>
  );
};

export default ModalPermission;
