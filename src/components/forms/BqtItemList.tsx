import React from "react";

interface BqtItem {
  subcategoria: string;
  variedad: string;
  color: string;
  calibre: string;
  tallos: number;
  precioTotal?: number | null;
}

interface BqtItemListProps {
  items: BqtItem[];
  tiposVariedad: { id: string; name: string }[];
  variedades: { id: string; name: string }[];
  colores?: { id: string; name: string }[];
  calibres: { id_calibre: string; nombre_calibre_tipo: string }[];
  lang: string;
  onRemove: (index: number) => void;
  showHeaders?: boolean; // Nuevo prop opcional
  compact?: boolean; // Nuevo prop para modo compacto en móviles
}

const BqtItemList: React.FC<BqtItemListProps> = ({
  items,
  tiposVariedad,
  variedades,
  colores = [],
  calibres,
  lang,
  onRemove,
  showHeaders = false,
  compact = false,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-4">
        {lang === "en" ? "No items added yet." : "No se han agregado ítems aún."}
      </div>
    );
  }

  // Determine if scroll is needed
  const shouldScroll = items.length > 5;
  const rowHeight = compact ? 36 : 48;
  const maxHeight = rowHeight * 5;

  return (
    <>
      {showHeaders && !compact && (
        <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-center pb-2 border-b items-center" style={{ borderColor: "#e5e7eb" }}>
          <div className="truncate">
            {lang === "en" ? "Subcategory" : "Subcategoría"}
          </div>
          <div className="truncate">{lang === "en" ? "Variety" : "Variedad"}</div>
          <div className="truncate">{lang === "en" ? "Color" : "Color"}</div>
          <div className="truncate">{lang === "en" ? "Caliber" : "Calibre"}</div>
          <div className="truncate text-center">{lang === "en" ? "Stems" : "Tallos"}</div>
          <div className="truncate text-center">{lang === "en" ? "Price" : "Precio"}</div>
          <div className="text-center">{lang === "en" ? "Actions" : "Acciones"}</div>
        </div>
      )}
      <div
        className={shouldScroll ? "overflow-y-auto w-full" : "w-full"}
        style={shouldScroll ? { maxHeight: maxHeight, minHeight: 0 } : {}}
      >
        {items.map((item, index) => (
          compact ? (
            <div key={index} className="flex flex-row items-center justify-between text-xs py-1 border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex flex-col text-left flex-1">
                <span className="font-semibold text-pink-700">{tiposVariedad.find((t) => t.id === item.subcategoria)?.name}</span>
                <span>{item.variedad}</span>
                <span>{
                  colores.find((c) => c.id === item.color)?.name ||
                  colores.find((c) => c.name === item.color)?.name ||
                  item.color
                }</span>
                <span>{calibres.find((c) => c.id_calibre === item.calibre)?.nombre_calibre_tipo}</span>
                <span className="font-bold">{item.tallos} tallos</span>
                {item.precioTotal && <span className="font-semibold text-green-600">${item.precioTotal.toFixed(2)}</span>}
              </div>
              <button
                type="button"
                className="rounded transition-colors duration-150 p-1 ml-2 flex items-center justify-center focus:outline-none"
                style={{ background: '#cc3399', color: '#fff', minHeight: '28px', minWidth: '28px' }}
                title={lang === "en" ? "Remove" : "Eliminar"}
                onClick={() => onRemove(index)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0v10a2 2 0 002 2h4a2 2 0 002-2V7" stroke="#fff" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              key={index}
              className="grid grid-cols-7 gap-2 text-xs sm:text-sm py-2 border-b items-center"
              style={{ borderColor: "#e5e7eb" }}
            >
              <div className="truncate text-left pl-2">
                {tiposVariedad.find((t) => t.id === item.subcategoria)?.name}
              </div>
              <div className="truncate text-left">
                {item.variedad}
              </div>
              <div className="truncate text-left">
                {
                  colores.find((c) => c.id === item.color)?.name ||
                  colores.find((c) => c.name === item.color)?.name ||
                  item.color
                }
              </div>
              <div className="truncate text-left">
                {calibres.find((c) => c.id_calibre === item.calibre)?.nombre_calibre_tipo}
              </div>
              <div className="font-semibold text-center">
                {item.tallos}
              </div>
              <div className="font-semibold text-green-600 text-center">
                {item.precioTotal ? `$${item.precioTotal.toFixed(2)}` : "-"}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <button
                  type="button"
                  className="rounded-full transition-colors duration-150 p-2 flex items-center justify-center focus:outline-none"
                  style={{ background: '#cc3399', color: '#fff', minHeight: '32px', minWidth: '50px' }}
                  title={lang === "en" ? "Remove" : "Eliminar"}
                  onClick={() => onRemove(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0v10a2 2 0 002 2h4a2 2 0 002-2V7" stroke="#fff" />
                  </svg>
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </>
  );
};

export default BqtItemList;
