/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DebugApiKey = () => {
  const [apiKey, setApiKey] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    setApiKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || t('common.debug.apiKeyNotFound'));
  }, [t]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-semibold mb-2">Debug API Key:</h3>
      <p className="text-sm break-all">{apiKey}</p>
    </div>
  );
};

export default DebugApiKey;
