import React from "react";

interface ActionButtonsProps {
  loading: boolean;
  onCancel?: () => void;
  lang: string;
  initialData?: any;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  loading,
  onCancel,
  lang,
  initialData,
}) => {
  return (
    <div className="w-full flex justify-end gap-4 mt-6">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded font-medium transition-colors"
          style={{ background: "#cc3399", color: "#fff" }}
          disabled={loading}
        >
          {lang === "en" ? "Cancel" : "Cancelar"}
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 rounded font-medium transition-colors"
        style={{ background: "#cc3399", color: "#fff" }}
        disabled={loading}
      >
        {loading
          ? initialData
            ? lang === "en"
              ? "Saving..."
              : "Guardando..."
            : lang === "en"
            ? "Creating..."
            : "Creando..."
          : lang === "en"
          ? "Save"
          : "Guardar"}
      </button>
    </div>
  );
};

export default ActionButtons;
