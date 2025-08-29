// modalConfirmLogic.tsx
import { useState } from "react";

export function useModalConfirm(onSaved?: () => void) {
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const handleAccept = () => {
    closeModal();
    if (onSaved) onSaved();
  };
  return { showModal, openModal, closeModal, handleAccept };
}

interface ModalConfirmProps {
  show: boolean;
  onCancel: () => void;
  onAccept: () => void;
  productos: number;
  paquetes: number;
}

export function ModalConfirm({ show, onCancel, onAccept, productos, paquetes }: ModalConfirmProps) {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 min-w-[320px] flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-[#cc3399]">Confirmar guardado</h3>
        <div className="mb-4 text-lg text-gray-700">
          <span className="font-semibold">{productos}</span> productos seleccionados<br />
                        <span className="font-semibold">{paquetes}</span> paquetes agregados para cada producto
        </div>
        <div className="flex gap-4 mt-2">
          <button
            className="border px-6 py-2 rounded-lg font-semibold text-white"
            style={{ background: "#cc3399" }}
            onClick={onCancel}
          >Cancelar</button>
          <button
            className="border px-6 py-2 rounded-lg font-semibold text-white"
            style={{ background: "#cc3399" }}
            onClick={onAccept}
          >Aceptar</button>
        </div>
      </div>
    </div>
  );
}
