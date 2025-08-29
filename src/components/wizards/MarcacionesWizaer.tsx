import React, { useEffect, useState } from "react";
// ...existing code...
import {
  getClientes,
  createMarcacion,
} from "../../services/marcacionesService";
// ...existing code...

interface Props {
  showWizard: boolean;
  setShowWizard: (open: boolean) => void;
  onCreated: () => void;
  editMarcacion?: any;
  onClose: () => void;
}



const WizartMarcacion: React.FC<Props> = ({
  showWizard,
  setShowWizard,
  onCreated,
  editMarcacion,
  onClose,
}) => {
  const [clientes, setClientes] = useState<any[]>([]);
  const [form, setForm] = useState({
    clienteId: "",
    nombre: "",
    codigo: "",
    estado: "",
    ciudad: "",
    direccion: "",
    zipcode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClientes().then(setClientes);
  }, []);

  useEffect(() => {
    if (editMarcacion) {
      setForm({
        clienteId: editMarcacion.clienteId || "",
        nombre: editMarcacion.nombre || "",
        codigo: editMarcacion.codigo || "",
        estado: editMarcacion.estado || "",
        ciudad: editMarcacion.ciudad || "",
        direccion: editMarcacion.direccion || "",
        zipcode: editMarcacion.zipcode || "",
      });
    } else {
      setForm((prev) => ({
        clienteId: prev.clienteId, // Mantener el cliente seleccionado
        nombre: "",
        codigo: "",
        estado: "",
        ciudad: "",
        direccion: "",
        zipcode: "",
      }));
    }
  }, [editMarcacion]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.clienteId) {
    alert("Debe seleccionar un cliente");
    return;
  }
  setLoading(true);
  try {
    const dataToSend = {
      nombre: form.nombre,
      codigo: form.codigo,
      estado: form.estado,
      ciudad: form.ciudad,
      direccion: form.direccion,
      zipcode: form.zipcode,
    };
    const response = await createMarcacion(
      form.clienteId,
      dataToSend
    );
    // Limpiar campos excepto clienteId para permitir agregar otra marcación
    setForm((prev) => ({
      clienteId: prev.clienteId,
      nombre: "",
      codigo: "",
      estado: "",
      ciudad: "",
      direccion: "",
      zipcode: "",
    }));
    onCreated();
    // alert("Marcación creada correctamente");
  } catch (err) {
    console.error("Error al crear la marcación:", err);
    alert("Error al crear la marcación");
  } finally {
    setLoading(false);
  }
};
  // ...existing code...

  if (!showWizard) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md relative">
      {/* Botón cerrar (X) en la esquina superior derecha */}
      <button
        type="button"
        onClick={() => setShowWizard(false)}
        className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 focus:outline-none"
        style={{ background: "#cc3399", color: "#fff" }}
        aria-label="Cerrar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 className="text-lg font-semibold mb-4">
        {editMarcacion ? "Editar Marcación" : "Nueva Marcación"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select
            name="clienteId"
            value={form.clienteId}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map((cli) => (
              <option key={cli.id} value={cli.id}>
                {cli.NombreCliente || cli.nombre || cli.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Código</label>
          <input
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Provincia</label>
          <input
            name="estado"
            value={form.estado}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
            placeholder="Ej: Pichincha"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <input
            name="ciudad"
            value={form.ciudad}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Zipcode</label>
          <input
            name="zipcode"
            value={form.zipcode}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button
            type="button"
            className="bg-gray-200 px-4 py-2 rounded"
            style={{ background: "#cc3399", color: "#fff" }}
            onClick={() => setShowWizard(false)}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-fuchsia-600 text-white px-4 py-2 rounded"
            style={{ background: "#cc3399", color: "#fff" }}
            disabled={loading}
          >
            {editMarcacion ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WizartMarcacion;
