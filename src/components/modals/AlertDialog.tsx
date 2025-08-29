import React from "react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Dialog */}
        <div
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-lg font-bold mb-2">{title}</div>
          <div className="text-gray-700 mb-6">{message}</div>

          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
