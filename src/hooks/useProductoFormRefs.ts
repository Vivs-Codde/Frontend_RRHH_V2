import { useRef } from 'react';

export const useProductoFormRefs = () => {
  const skuRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const subCategoryRef = useRef<HTMLSelectElement>(null);
  const varietyRef = useRef<HTMLSelectElement>(null);
  const colorRef = useRef<HTMLSelectElement>(null);
  const gradeRef = useRef<HTMLSelectElement>(null);
  const tallosBuncheRef = useRef<HTMLInputElement>(null);
  const caliberRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  return {
    sku: skuRef,
    category: categoryRef,
    subCategory: subCategoryRef,
    variety: varietyRef,
    color: colorRef,
    grade: gradeRef,
    tallosBunche: tallosBuncheRef,
    caliber: caliberRef,
    status: statusRef,
  };
};
