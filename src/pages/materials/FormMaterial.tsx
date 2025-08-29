import React, { useEffect } from "react";
import tiposMaterialData from "../../constants/tiposMaterial.json";
import unidadesMedidaData from "../../constants/unidadesMedida.json";
import { useFormMaterial, initialForm } from "./formMaterialLogic";
import { useTranslation } from "react-i18next";

interface FormMateriaProps {
  onSaved?: (nuevoMaterial?: any) => void;
  material?: any;
  onCancel?: () => void;
}

const ModalNuevoValor = ({
  open,
  onClose,
  onSave,
  label,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (valor: string) => void;
  label: string;
}) => {
  const [valor, setValor] = React.useState("");
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-2 min-w-[250px]">
        <span className="text-pink-700 font-semibold mb-2">{label}</span>
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="border rounded px-2 py-1"
          autoFocus
        />
        <div className="flex gap-2 justify-end mt-2">
          <button
            type="button"
            className="px-3 py-1 bg-pink-500 text-white rounded"
            style={{ background: "#cc3399" }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-pink-500 text-white rounded"
            style={{ background: "#cc3399" }}
            onClick={() => {
              if (valor.trim()) {
                onSave(valor.trim());
                setValor("");
              }
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const FormMateria = ({ onSaved, material, onCancel }: FormMateriaProps) => {
  const {
    form,
    setForm,
    loading,
    showForm,
    setShowForm,
    editId,
    setEditId,
    successMessage,
    handleChange,
    handleSubmit,
    duplicateError,
  } = useFormMaterial(onSaved);
  const { t } = useTranslation();

  // Estado para los campos del material
  const initialMaterialInput = {
    Nserie: "",
    tipoMaterial: "",
    nombre: "",
    descripcion: "",
    marca: "",
    unidadMedida: "",
    alto: "",
    ancho: "",
    peso: "",
    color: "",
    precio: "",
    imagen: null as File | null,
    estado: true,
    sku: "",
  };
  const [materialInput, setMaterialInput] =
    React.useState(initialMaterialInput);
  // Estado para selects
  const [tiposMaterial, setTiposMaterial] =
    React.useState<string[]>(tiposMaterialData);
  const [unidadesMedida, setUnidadesMedida] =
    React.useState<string[]>(unidadesMedidaData);
  // Estado para modal
  const [modalTipoOpen, setModalTipoOpen] = React.useState(false);
  const [modalUnidadOpen, setModalUnidadOpen] = React.useState(false);

  // Manejar cambios en los inputs del material
  const handleMaterialInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && name === "estado") {
      setMaterialInput((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }
    // Si selecciona "Otro" en tipoMaterial o unidadMedida, abrir modal
    if (name === "tipoMaterial" && value === "Otro") {
      setModalTipoOpen(true);
      return;
    }
    if (name === "unidadMedida" && value === "Otro") {
      setModalUnidadOpen(true);
      return;
    }
    setMaterialInput((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : String(value),
    }));
  };
  // Guardar nuevo tipo de material en JSON y actualizar select
  const handleGuardarNuevoTipo = async (nuevoTipo: string) => {
    if (!nuevoTipo || tiposMaterial.includes(nuevoTipo)) {
      setModalTipoOpen(false);
      return;
    }
    const nuevosTipos = [...tiposMaterial, nuevoTipo];
    setTiposMaterial(nuevosTipos);
    setMaterialInput((prev) => ({ ...prev, tipoMaterial: nuevoTipo }));
    setModalTipoOpen(false);
    // Guardar en archivo JSON
    try {
      await fetch("/src/constants/tiposMaterial.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevosTipos),
      });
    } catch {}
  };

  // Guardar nueva unidad de medida en JSON y actualizar select
  const handleGuardarNuevaUnidad = async (nuevaUnidad: string) => {
    if (!nuevaUnidad || unidadesMedida.includes(nuevaUnidad)) {
      setModalUnidadOpen(false);
      return;
    }
    const nuevasUnidades = [...unidadesMedida, nuevaUnidad];
    setUnidadesMedida(nuevasUnidades);
    setMaterialInput((prev) => ({ ...prev, unidadMedida: nuevaUnidad }));
    setModalUnidadOpen(false);
    // Guardar en archivo JSON
    try {
      await fetch("/src/constants/unidadesMedida.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevasUnidades),
      });
    } catch {}
  };

  // Manejar cambio de archivo imagen
  const handleMaterialImagenChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Convertir a webp usando canvas
    const fileToWebp = (file: File) => {
      return new Promise<Blob>((resolve, reject) => {
        const img = new window.Image();
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result;
          if (typeof result === "string") {
            img.src = result;
          } else {
            reject(new Error("No se pudo leer la imagen."));
          }
        };
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("No se pudo obtener el contexto del canvas."));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("No se pudo convertir a webp"));
            },
            "image/webp",
            0.9
          );
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };
    try {
      const webpBlob = await fileToWebp(file);
      const webpFile = new File(
        [webpBlob],
        file.name.replace(/\.[^.]+$/, ".webp"),
        { type: "image/webp" }
      );
      setMaterialInput((prev) => ({ ...prev, imagen: webpFile }));
    } catch (err) {
      alert("No se pudo convertir la imagen a webp");
    }
  };

  // Calcular correlativo SKU
  const calcularCorrelativoSKU = async (tipo: string, nom: string) => {
    let correlativo = "0001";
    try {
      const { getMateriales } = await import(
        "../../services/materialesService"
      );
      const res = await getMateriales({ perPage: 9999 });
      const allMaterials = Array.isArray(res.data) ? res.data : [];
      let maxNum = 0;
      allMaterials.forEach((m) => {
        const skuVal = m.sku || m.SKU;
        if (typeof skuVal === "string") {
          // Solo considerar los SKU que empiezan igual
          if (skuVal.startsWith(tipo + nom)) {
            const match = skuVal.match(/(\d{4})$/);
            if (match) {
              maxNum = Math.max(maxNum, parseInt(match[0], 10));
            }
          }
        }
      });
      correlativo = (maxNum + 1).toString().padStart(4, "0");
    } catch {}
    return correlativo;
  };

  // Al abrir el formulario, obtener el último correlativo numérico del SKU y mostrar solo el número
  React.useEffect(() => {
    const setNextSKU = async () => {
      try {
        const { getMateriales } = await import(
          "../../services/materialesService"
        );
        const res = await getMateriales({ perPage: 9999 });
        const allMaterials = Array.isArray(res.data) ? res.data : [];
        let maxNum = 0;
        allMaterials.forEach((m) => {
          const skuVal = m.sku || m.SKU;
          if (typeof skuVal === "string") {
            const match = skuVal.match(/(\d{4,})$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) {
                maxNum = num;
              }
            }
          }
        });
        const nextNum = (maxNum + 1).toString().padStart(4, "0");
        setMaterialInput((prev) => ({ ...prev, sku: nextNum }));
      } catch {
        setMaterialInput((prev) => ({ ...prev, sku: "0001" }));
      }
    };
    setNextSKU();
  }, []);

  // Cuando cambia tipoMaterial o nombre, armar el SKU con el prefijo y el número correlativo
  React.useEffect(() => {
    if (!materialInput.sku || materialInput.sku.length < 4) return;
    const correlativo = materialInput.sku.slice(-4);
    const tipo = materialInput.tipoMaterial
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .substring(0, 2)
      .padEnd(2, "X");
    const nom = materialInput.nombre
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .substring(0, 1);
    if (materialInput.tipoMaterial) {
      if (nom) {
        setMaterialInput((prev) => ({
          ...prev,
          sku: `${tipo}${nom}${correlativo}`,
        }));
      } else {
        setMaterialInput((prev) => ({ ...prev, sku: `${tipo}${correlativo}` }));
      }
    }
  }, [materialInput.tipoMaterial, materialInput.nombre]);

  // Estado para mostrar el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  // Guardar material directamente
  const handleGuardarMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar campos requeridos
    if (
      !materialInput.tipoMaterial ||
      !materialInput.nombre ||
      !materialInput.unidadMedida
    ) {
      alert("Completa los campos obligatorios del material");
      return;
    }
    if (!materialInput.imagen) {
      alert("Debes seleccionar una imagen para el material");
      return;
    }
    // El SKU ya está calculado en materialInput.sku
    const sku = materialInput.sku;
    try {
      const { createMaterial } = await import(
        "../../services/materialesService"
      );
      await createMaterial({ ...materialInput, sku });
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
      // Calcular el siguiente correlativo y limpiar el formulario, pero dejar el nuevo SKU
      const setNextSKU = async () => {
        try {
          const { getMateriales } = await import(
            "../../services/materialesService"
          );
          const res = await getMateriales({ perPage: 9999 });
          const allMaterials = Array.isArray(res.data) ? res.data : [];
          let maxNum = 0;
          allMaterials.forEach((m) => {
            const skuVal = m.sku || m.SKU;
            if (typeof skuVal === "string") {
              const match = skuVal.match(/(\d{4,})$/);
              if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) {
                  maxNum = num;
                }
              }
            }
          });
          const nextNum = (maxNum + 1).toString().padStart(4, "0");
          setMaterialInput((prev) => ({
            ...initialMaterialInput,
            sku: nextNum,
          }));
        } catch {
          setMaterialInput((prev) => ({
            ...initialMaterialInput,
            sku: "0001",
          }));
        }
      };
      await setNextSKU();
      if (onSaved) onSaved();
    } catch (err: any) {
      alert("Error al guardar material: " + (err?.message || err));
    }
  };

  // Si se pasa material (edición), inicializa el formulario con sus datos
  useEffect(() => {
    if (material) {
      setMaterialInput({
        Nserie: material.Nserie || "",
        tipoMaterial: material.tipoMaterial || "",
        nombre: material.nombre || "",
        descripcion: material.descripcion || "",
        marca: material.marca || "",
        unidadMedida: material.unidadMedida || "",
        alto: material.alto || "",
        ancho: material.ancho || "",
        peso: material.peso || "",
        color: material.color || "",
        precio: material.precio || "",
        imagen: null,
        estado: material.estado !== undefined ? material.estado : true,
        sku: material.sku || "",
      });
      setEditId(material.id);
      setShowForm(true);
    } else {
      setMaterialInput(initialMaterialInput);
      setEditId(null);
    }
  }, [material]);

  return (
    <>
      {/* Modal de éxito */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 30,
            left: 0,
            right: 0,
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded shadow-lg text-lg font-semibold animate-fade-in-out">
            Material guardado correctamente
          </div>
        </div>
      )}
      <form
        onSubmit={handleGuardarMaterial}
        className="bg-white rounded-lg shadow-md p-0 sm:p-1 flex flex-col gap-0 mb-0"
      >
        {/* SKU y Estado arriba */}
        <div className="w-full flex items-center justify-between mt-0 mb-0">
          <div>
            <span className="font-mono text-xl text-pink-700">SKU:</span>
            <input
              type="text"
              className="font-mono text-xl text-pink-700 ml-2 bg-transparent border-none outline-none"
              value={materialInput.sku || ""}
              readOnly
              tabIndex={-1}
              style={{ width: "120px" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-pink-700">
              {t("estado")}
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                id="estado-switch"
                type="checkbox"
                className="sr-only peer"
                checked={materialInput.estado}
                onChange={handleMaterialInputChange}
                name="estado"
                disabled={loading}
              />
              <div
                className={`w-11 h-6 ${
                  materialInput.estado ? "bg-[#cc3399]" : "bg-gray-300"
                } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full transition-colors duration-200`}
              ></div>
              <div
                className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  materialInput.estado ? "translate-x-5" : ""
                }`}
              ></div>
            </label>
          </div>
        </div>

        {/* Bloque 1: Datos Básicos */}
        <div className="border border-pink-400 bg-white rounded-lg py-6 px-2 mb-2">
          <div className="mb-4">
            <span className="text-lg font-semibold text-pink-700 block text-left">
              {t("datosBasicos")}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 mb-2">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-pink-700 mb-1">
                N° Serie *
              </label>
              <input
                name="Nserie"
                value={materialInput.Nserie}
                onChange={handleMaterialInputChange}
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("tipoMaterial")} *
              </label>
              <select
                name="tipoMaterial"
                value={materialInput.tipoMaterial}
                onChange={handleMaterialInputChange}
                disabled={loading}
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
              >
                <option value="">{t("seleccionar")}</option>
                {tiposMaterial.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("nombre")} *
              </label>
              <input
                name="nombre"
                value={materialInput.nombre}
                onChange={handleMaterialInputChange}
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("marca")}
              </label>
              <input
                name="marca"
                value={materialInput.marca}
                onChange={handleMaterialInputChange}
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("descripcion")}
              </label>
              <input
                name="descripcion"
                value={materialInput.descripcion}
                onChange={handleMaterialInputChange}
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
              />
            </div>
          </div>
        </div>

        {/* Bloque 2: Medidas */}
        <div className="border border-blue-300 bg-white rounded-lg py-6 px-2 mb-2">
          <div className="mb-4">
            <span className="text-lg font-semibold text-blue-700 block text-left">
              {t("datosComplementarios")}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 mb-2">
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("unidadMedida")}
              </label>
              <select
                name="unidadMedida"
                value={materialInput.unidadMedida}
                onChange={handleMaterialInputChange}
                disabled={loading}
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
              >
                <option value="">{t("seleccionar")}</option>
                {unidadesMedida.map((unidad) => (
                  <option key={unidad} value={unidad}>
                    {unidad}
                  </option>
                ))}
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("alto")}
              </label>
              <input
                name="alto"
                value={materialInput.alto}
                onChange={handleMaterialInputChange}
                type="number"
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("ancho")}
              </label>
              <input
                name="ancho"
                value={materialInput.ancho}
                onChange={handleMaterialInputChange}
                type="number"
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("peso")}
              </label>
              <input
                name="peso"
                value={materialInput.peso}
                onChange={handleMaterialInputChange}
                type="number"
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("color")}
              </label>
              <input
                name="color"
                value={materialInput.color}
                onChange={handleMaterialInputChange}
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">
                {t("precio")}
              </label>
              <input
                name="precio"
                value={materialInput.precio}
                onChange={handleMaterialInputChange}
                type="number"
                min={0}
                step="0.01"
                className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
                placeholder="Precio"
              />
            </div>
          </div>
          {/* Fila nueva para imagen */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-2 items-center">
            <div className="sm:col-span-2 flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-1">
                  {t("imagen")}
                </label>
                <input
                  name="imagen"
                  type="file"
                  accept="image/*"
                  onChange={handleMaterialImagenChange}
                  className="w-full text-sm text-gray-500 px-2 py-2 border-1 border-gray-300 focus:border-[#3b82f6] rounded-md bg-[#f5f6fa]"
                  style={{ minWidth: 0 }}
                />
              </div>
              {/* Previsualización de la imagen */}
              {materialInput.imagen && (
                <img
                  src={URL.createObjectURL(materialInput.imagen)}
                  alt="Previsualización"
                  className="h-16 w-16 object-cover rounded border border-gray-300"
                />
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de error de nombre duplicado sobre los botones */}
        {duplicateError && (
          <div className="w-full mb-4 text-center text-red-600 font-semibold bg-red-50 border border-red-200 rounded p-2">
            {duplicateError}
          </div>
        )}
        {/* Modales para agregar nuevo tipo o unidad */}
        <ModalNuevoValor
          open={modalTipoOpen}
          onClose={() => setModalTipoOpen(false)}
          onSave={handleGuardarNuevoTipo}
          label="Nuevo tipo de material"
        />
        <ModalNuevoValor
          open={modalUnidadOpen}
          onClose={() => setModalUnidadOpen(false)}
          onSave={handleGuardarNuevaUnidad}
          label="Nueva unidad de medida"
        />
        {/* Botones */}
        <div className="w-full flex justify-end gap-4">
          <button
            type="button"
            style={{ background: "#cc3399", color: "#fff" }}
            className="px-4 py-2 rounded font-medium transition-colors"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                setEditId(null);
                setShowForm(false);
              }
            }}
            disabled={loading}
          >
            {t("cancelar")}
          </button>
          {!duplicateError && (
            <button
              type="submit"
              style={{ background: "#cc3399", color: "#fff" }}
              className="px-4 py-2 rounded font-medium transition-colors"
              disabled={loading}
            >
              {editId ? t("actualizar") : t("guardar")}
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default FormMateria;
