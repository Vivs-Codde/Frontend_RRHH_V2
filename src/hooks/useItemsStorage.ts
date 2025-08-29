import { useState, useEffect, Dispatch, SetStateAction } from "react";

// Hook personalizado para manejar arrays de items (BQT/CBS)
export const useItemsStorage = (storageKey: string): {
  items: any[];
  setItems: Dispatch<SetStateAction<any[]>>;
} => {
  const [items, setItems] = useState<any[]>([]);

  // Cargar items desde localStorage al iniciar
  useEffect(() => {
    const storedItems = localStorage.getItem(storageKey);
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
  }, [storageKey]);

  // Efecto para guardar en localStorage cuando items cambian
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  return {
    items,
    setItems,
  };
};
