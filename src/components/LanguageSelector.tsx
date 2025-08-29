
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import flagEC from '../assets/ec.png';
// @ts-ignore
import flagUS from '../assets/us.png';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const currentLanguage = (i18n.language || 'es').split('-')[0];
  const languages = [
    { code: 'es', flag: flagEC },
    { code: 'en', flag: flagUS }
  ];
  const currentFlag = languages.find(l => l.code === currentLanguage)?.flag;

  // Para menú móvil
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú si se hace clic fuera
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement> | string) => {
    if (typeof e === 'string') {
      i18n.changeLanguage(e);
      setOpen(false);
    } else {
      i18n.changeLanguage(e.target.value);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Desktop: select visible, mobile: hidden */}
      <div className="hidden sm:flex items-center gap-2">
        <img
          src={currentFlag}
          alt={currentLanguage}
          className="w-6 h-4 object-cover rounded shadow border"
          style={{ minWidth: 24 }}
        />
        <select
          value={currentLanguage}
          onChange={handleChange}
          className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {t(`languages.${lang.code}`)}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          ▼
        </div>
      </div>

      {/* Mobile: solo bandera, menú al hacer click */}
      <div className="sm:hidden relative" ref={menuRef}>
        <button
          className="w-8 h-9 flex items-center justify-center bg-white rounded shadow border focus:outline-none"
          onClick={() => setOpen((v) => !v)}
          style={{ backgroundColor: '#cc3399' }}
          aria-label="Select language"
        >
          <img
            src={currentFlag}
            alt={currentLanguage}
            className="w-6 h-4 object-cover rounded"
            style={{ minWidth: 24 }}
          />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow-lg z-50 border border-gray-200 animate-fade-in">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-pink-100 ${currentLanguage === lang.code ? 'font-bold text-pink-600' : 'text-gray-700'}`}
                style={{ backgroundColor: '#f8f8f8' }}
                onClick={() => handleChange(lang.code)}
              >
                <img src={lang.flag} alt={lang.code} className="w-5 h-3 rounded" />
                {t(`languages.${lang.code}`)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
