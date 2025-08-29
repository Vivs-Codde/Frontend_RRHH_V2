import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  id: string | number;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name: string;
  className?: string;
  dropdownPosition?: 'top' | 'bottom';
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccione...",
  disabled = false,
  required = false,
  name,
  className = "",
  dropdownPosition: dropdownPositionProp
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1); // Nuevo estado
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actualizar el valor mostrado cuando cambie el value prop
  useEffect(() => {
    const selectedOption = options.find(option => option.id.toString() === value);
    if (selectedOption && selectedOption.name !== displayValue) {
      setDisplayValue(selectedOption.name);
    } else if (!selectedOption && displayValue !== '') {
      setDisplayValue('');
    }
    // No reiniciar searchTerm ni highlightedIndex aquí para evitar ciclos infinitos
  }, [value, options]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchTerm('');
      setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
      // Si se pasa la prop dropdownPosition, usarla
      if (dropdownPositionProp) {
        setDropdownPosition(dropdownPositionProp);
      } else if (inputRef.current) {
        // Calcular la posición del dropdown
        const rect = inputRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        // Si hay menos de 300px abajo y más espacio arriba, posicionar hacia arriba
        if (spaceBelow < 300 && spaceAbove > spaceBelow) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0); // Resaltar la primera opción al buscar
    // Si se pasa la prop dropdownPosition, usarla
    if (dropdownPositionProp) {
      setDropdownPosition(dropdownPositionProp);
    } else if (inputRef.current) {
      // Recalcular posición al cambiar texto
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  };

  const handleOptionClick = (option: Option) => {
    onChange(option.id.toString());
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleOptionClick(filteredOptions[highlightedIndex]);
      } else if (filteredOptions.length === 1) {
        handleOptionClick(filteredOptions[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(prev => {
          const next = prev + 1;
          return next >= filteredOptions.length ? 0 : next;
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(filteredOptions.length - 1);
      } else {
        setHighlightedIndex(prev => {
          const next = prev - 1;
          return next < 0 ? filteredOptions.length - 1 : next;
        });
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={isOpen ? searchTerm : displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed smooth-transition mobile-touch-target focus-visible searchable-select"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isOpen ? (
            <Search size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div 
          className={`absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-auto searchable-select-dropdown ${
            dropdownPosition === 'top' 
              ? 'dropdown-top max-h-48' 
              : 'dropdown-bottom max-h-60'
          }`}
          style={{
            top: dropdownPosition === 'top' ? 'auto' : '100%',
            bottom: dropdownPosition === 'top' ? '100%' : 'auto',
            left: 0,
            right: 0,
            marginTop: dropdownPosition === 'top' ? 0 : '4px',
            marginBottom: dropdownPosition === 'top' ? '4px' : 0,
            maxHeight: dropdownPosition === 'top' ? '200px' : '280px',
            zIndex: 9999
          }}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center mobile-text-responsive">
              No se encontraron opciones
            </div>
          ) : (
            filteredOptions.map((option, idx) => (
              <div
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={`px-4 py-3 text-sm sm:text-base cursor-pointer 
                  hover:bg-[#cc3399] hover:text-white 
                  ${highlightedIndex === idx ? 'bg-[#cc3399] text-white font-bold' : 'text-gray-700'} 
                  smooth-transition border-b border-gray-100 last:border-b-0 mobile-touch-target mobile-text-responsive`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: highlightedIndex === idx ? 'bold' : 'normal',
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                {option.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
