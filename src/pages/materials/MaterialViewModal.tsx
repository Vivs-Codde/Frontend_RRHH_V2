import React, { useState } from "react";

interface MaterialViewModalProps {
  material: any;
  onClose: () => void;
}

const MaterialViewModal: React.FC<MaterialViewModalProps> = ({ material, onClose }) => {
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  // Cerrar al hacer click fuera del modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Renderiza la imagen grande flotante (modal pequeño, centrado, solo en hover)
  const renderImgModal = () => (
    imgPreview && (
      <div
        className="fixed z-50 flex items-center justify-center"
        style={{
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.98)',
            border: '1px solid #ccc',
            borderRadius: 10,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            padding: 8,
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          <img
            src={imgPreview}
            alt="preview"
            style={{ maxWidth: 320, maxHeight: 320, borderRadius: 8, display: 'block' }}
          />
        </div>
      </div>
    )
  );

  return (
    <>
      {renderImgModal()}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-[2px]"
        onClick={handleOverlayClick}
      >
        <div
          className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative animate-fadeIn"
          onClick={e => e.stopPropagation()}
          style={{ boxShadow: '0 8px 32px 0 rgba(204,51,153,0.18)' }}
        >
          <button
            className="absolute top-2 right-2 text-white hover:text-red-500 text-xl font-bold"
            style={{ background: "#cc3399" }}
            onClick={onClose}
            title="Cerrar"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-4 text-[#cc3399] text-left">Detalle del {material.materiales ? 'paquete' : 'material'}</h2>
          <div className="mb-2 text-left"><b>SKU:</b> {material.SKU || material.sku || '-'}</div>
          <div className="mb-2 text-left"><b>Nombre:</b> {material.nombre || '-'}</div>
          <div className="mb-2 text-left"><b>Estado:</b> {material.estado ? 'Activo' : 'Inactivo'}</div>
          {material.categoria && <div className="mb-2 text-left"><b>Categoría:</b> {material.categoria}</div>}
          {material.subcategoria && <div className="mb-2 text-left"><b>Subcategoría:</b> {material.subcategoria}</div>}
          {material.materiales ? (
            <>
              <div className="mb-2 text-left font-semibold text-pink-700">Materiales del paquete:</div>
              <ul className="divide-y divide-gray-200">
                {material.materiales.map((mat: any, idx: number) => {
                  const imgUrl = typeof mat.imagen === 'string' ? `https://api-sales.eqrapp.com/storage/${mat.imagen}` : null;
                  return (
                    <li key={mat.id || idx} className="py-2 flex flex-wrap gap-2 items-center">
                      <span className="font-mono text-xs bg-pink-50 px-2 py-1 rounded">{mat.tipoMaterial}</span>
                      <span className="font-semibold">{mat.nombre}</span>
                      {mat.descripcion && <span className="text-gray-500">{mat.descripcion}</span>}
                      {mat.marca && <span className="text-gray-400">{mat.marca}</span>}
                      <span className="text-xs">{mat.unidadMedida}</span>
                      {mat.alto && <span className="text-xs">Alto: {mat.alto}</span>}
                      {mat.ancho && <span className="text-xs">Ancho: {mat.ancho}</span>}
                      {mat.peso && <span className="text-xs">Peso: {mat.peso}</span>}
                      {mat.color && <span className="text-xs">Color: {mat.color}</span>}
                      {mat.precio && <span className="text-xs">Precio: {mat.precio}</span>}
                      {imgUrl && (
                        <span className="text-xs text-blue-500 flex items-center gap-1">
                          Imagen:
                          <img
                            src={imgUrl}
                            alt="mini"
                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'zoom-in', border: '1px solid #eee' }}
                            onMouseOver={() => setImgPreview(imgUrl)}
                            onMouseOut={() => setImgPreview(null)}
                          />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <>
              {material.descripcion && <div className="mb-2 text-left"><b>Descripción:</b> {material.descripcion}</div>}
              {material.marca && <div className="mb-2 text-left"><b>Marca:</b> {material.marca}</div>}
              {material.unidadMedida && <div className="mb-2 text-left"><b>Unidad de medida:</b> {material.unidadMedida}</div>}
              {material.alto && <div className="mb-2 text-left"><b>Alto:</b> {material.alto}</div>}
              {material.ancho && <div className="mb-2 text-left"><b>Ancho:</b> {material.ancho}</div>}
              {material.peso && <div className="mb-2 text-left"><b>Peso:</b> {material.peso}</div>}
              {material.color && <div className="mb-2 text-left"><b>Color:</b> {material.color}</div>}
              {material.precio && <div className="mb-2 text-left"><b>Precio:</b> {material.precio}</div>}
              {material.imagen && (
                (() => {
                  const imgUrl = typeof material.imagen === 'string' ? `https://api-sales.eqrapp.com/storage/${material.imagen}` : null;
                  return imgUrl ? (
                    <div className="mb-2 text-left flex items-center gap-2">
                      <b>Imagen:</b>
                      <img
                        src={imgUrl}
                        alt="mini"
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, cursor: 'zoom-in', border: '1px solid #eee' }}
                        onMouseOver={() => setImgPreview(imgUrl)}
                        onMouseOut={() => setImgPreview(null)}
                      />
                    </div>
                  ) : null;
                })()
              )}
            </>
          )}
        </div>
      </div>
    </>
   );
}

export default MaterialViewModal;
