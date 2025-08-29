import React from 'react';
import Select from 'react-select';
import { Box, PackageOpen } from 'lucide-react';
import type { TipoCaja } from '../../types/ventas';

interface SelectorTipoCajaProps {
  tipoCaja: TipoCaja;
  setTipoCaja: (tipo: TipoCaja) => void;
  tipoCajaOptions: { value: string; label: string }[];
  disabled?: boolean;
}

const SelectorTipoCaja: React.FC<SelectorTipoCajaProps> = ({
  tipoCaja,
  setTipoCaja,
  tipoCajaOptions,
  disabled = false
}) => {
  const handleChange = (selected: any) => {
    if (selected && selected.value) {
      setTipoCaja(selected.value as TipoCaja);
    }
  };

  const selectedOption = tipoCajaOptions.find(option => option.value === tipoCaja);
  
  return (
    <div>
      <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
        <Box size={18} color="#cc3399" />
        Tipo de Caja:
      </label>
      <Select
        options={tipoCajaOptions}
        value={selectedOption}
        onChange={handleChange}
        isSearchable={false}
        isDisabled={disabled}
        className="text-sm"
        placeholder="Seleccione tipo de caja..."
        formatOptionLabel={option => (
          <div className="flex items-center gap-2">
            {option.value === 'solida' ? (
              <Box size={16} />
            ) : (
              <PackageOpen size={16} />
            )}
            {option.label}
          </div>
        )}
      />
    </div>
  );
};

export default SelectorTipoCaja;
