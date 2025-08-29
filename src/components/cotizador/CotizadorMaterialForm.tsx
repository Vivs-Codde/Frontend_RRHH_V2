import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
// import AsyncSelect from "react-select/async";
import { API_ENDPOINTS } from "../../constants/api";
import Modal from "../modals/Modal";
import FormPaquete from "../../pages/paquetes/FormPaquete";


type PaqueteOption = {
  value: string;
  label: string;
  raw: any;
};

interface CotizadorMaterialFormState {
  paquete: PaqueteOption | null;
}

const initialForm: CotizadorMaterialFormState = {
  paquete: null,
};

type CotizadorMaterialFormProps = {
  onSubmit: (data: any) => void;
};

const CotizadorMaterialForm: React.FC<CotizadorMaterialFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<CotizadorMaterialFormState>(initialForm);
  const [selectKey, setSelectKey] = useState<number>(Date.now());
  const [paquetes, setPaquetes] = useState<PaqueteOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [nuevoPaquete, setNuevoPaquete] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.paquete) {
      setError("Por favor, selecciona un paquete");
      return;
    }
    setError("");
    setSuccessMessage("Procesando cotización...");
    // Enviar el objeto raw del paquete para desglose completo
    if (form.paquete && (form.paquete as PaqueteOption).raw) {
      onSubmit((form.paquete as PaqueteOption).raw);
    } else {
      onSubmit({ paquete: form.paquete });
    }
    setSuccessMessage("¡Cotización enviada con éxito!");
    setTimeout(() => setSuccessMessage("") , 3000);
  };
  
  // Función para abrir el modal y preparar la clonación del paquete
  const handleEditarPaquete = () => {
    if (!form.paquete || !(form.paquete as PaqueteOption).raw) {
      setError("Primero debes seleccionar un paquete");
      return;
    }
    
    // Verificar si hay clientes seleccionados en localStorage
    let clientesSeleccionados;
    try {
      clientesSeleccionados = JSON.parse(localStorage.getItem("cotizacionClientes") || "[]");
      if (!clientesSeleccionados.length) {
        setError("Debe seleccionar al menos un cliente antes de crear un paquete");
        return;
      }
    } catch (e) {
      setError("Error al obtener los clientes seleccionados");
      return;
    }
    
    const paqueteOriginal = (form.paquete as PaqueteOption).raw;
    
    // Crear una copia profunda del paquete original
    const nuevoPaqueteData = JSON.parse(JSON.stringify(paqueteOriginal));
    
    // Eliminar ID e información que no se debe mantener para que sea un nuevo paquete
    delete nuevoPaqueteData.id;
    
    // Eliminar el nombre para que se pueda asignar uno nuevo
    nuevoPaqueteData.nombre = "";
    
    // Si tenemos múltiples clientes, usar el primer cliente para el paquete
    // (Los demás clientes se mostrarán en el modal pero se asociarán después)
    if (clientesSeleccionados.length > 0) {
        nuevoPaqueteData.cliente_id = clientesSeleccionados[0].value;
        nuevoPaqueteData.cliente = {
          value: clientesSeleccionados[0].value,
          label: clientesSeleccionados[0].label,
          raw: clientesSeleccionados[0]
        };
    }
    
    // Mantener los materiales, categoría y subcategoría
    // Se eliminan solo los campos específicos que no se deben copiar
    
    // Guardar el nuevo paquete en el estado
    setNuevoPaquete(nuevoPaqueteData);
    
    // Abrir el modal con el formulario completo
    setShowModal(true);
  };
  
  // Función para manejar cuando se guarda un nuevo paquete desde el FormPaquete
  const handlePaqueteCreado = (nuevoPaqueteCreado: any) => {
    // Cerrar el modal SIEMPRE al intentar guardar
    setShowModal(false);
    if (!nuevoPaqueteCreado) {
      return;
    }

    // Mostrar mensaje de éxito
    setSuccessMessage("¡Paquete creado con éxito!");
    setTimeout(() => setSuccessMessage(""), 3000);

    // Forzar actualización del select para que recargue la lista
    setSelectKey(Date.now());

    // Seleccionar el nuevo paquete
    const nuevoPaqueteOption = {
      value: nuevoPaqueteCreado.id?.toString() || "",
      label: nuevoPaqueteCreado.nombre || nuevoPaqueteCreado.name || "Nuevo paquete",
      raw: nuevoPaqueteCreado
    };
    setForm({ paquete: nuevoPaqueteOption });

    // Enviar el nuevo paquete al componente padre
    onSubmit(nuevoPaqueteCreado);
  };
  
  // Función para cancelar la creación del nuevo paquete
  const handleCancelarCreacion = () => {
    setShowModal(false);
    setNuevoPaquete(null);
  };

  React.useEffect(() => {
    const fetchPaquetes = async () => {
      const allPaquetes: any[] = [];
      let offset = 0;
      const limit = 200;
      let hasMore = true;
      try {
        while (hasMore) {
          let url = `${API_ENDPOINTS.PAQUETES.LIST}?offset=${offset}&limit=${limit}`;
          if (searchTerm && searchTerm.trim() !== "") {
            url += `&busqueda=${encodeURIComponent(searchTerm)}`;
          }
          const res = await fetch(url);
          const data = await res.json();
          const paquetes: any[] = Array.isArray(data) ? data : data?.data || [];
          allPaquetes.push(...paquetes);
          if (paquetes.length < limit) {
            hasMore = false;
          } else {
            offset += limit;
          }
        }
        setPaquetes(allPaquetes.map((paq: any) => ({
          value: paq.id?.toString() || paq.id,
          label: paq.nombre || paq.name || paq.descripcion || paq.id,
          raw: paq,
        })));
      } catch {
        setPaquetes([]);
      }
    };
    fetchPaquetes();
  }, [searchTerm, selectKey]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4 mb-0 border-2 border-orange-600">
      {successMessage && (
        <div className="w-full text-center text-green-600 font-semibold bg-green-50 border border-green-200 rounded p-2 mb-2">{successMessage}</div>
      )}
      <div className="border border-orange-200 rounded-lg py-6 px-2 mb-2">
        <div className="flex flex-row gap-6 w-full" style={{ minHeight: '320px' }}>
          {/* Sección izquierda: búsqueda y grid de paquetes */}
          <div className="w-1/2 flex flex-col">
           
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("search")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
            />
            <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px]">
              {paquetes.length === 0 ? (
                <div className="text-gray-500 p-4 col-span-3">No hay paquetes disponibles.</div>
              ) : (
                paquetes.map((paq) => (
                  <div
                    key={paq.value}
                    className={`min-h-[60px] max-h-[80px] bg-orange-50 border-2 rounded-lg shadow flex items-center justify-center cursor-pointer transition-all duration-150 px-2 ${form.paquete?.value === paq.value ? 'border-orange-500 ring-2 ring-orange-400' : 'border-orange-200'}`}
                    onClick={() => {
                      setForm({ paquete: paq });
                      if (paq.raw) {
                        onSubmit(paq.raw);
                      } else {
                        onSubmit({ paquete: paq });
                      }
                    }}
                  >
                    <span className="font-bold text-orange-700 text-base truncate">{paq.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Tabla de materiales al lado derecho, mismo ancho que grid */}
          <div className="w-1/2">
            {form.paquete && form.paquete.raw && Array.isArray(form.paquete.raw.materiales) && form.paquete.raw.materiales.length > 0 && (
              <div className="mt-0">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <button
                      type="button"
                      style={{ background: "#cc3399", color: "#fff" }}
                      className="px-3 py-1 rounded text-xs font-medium transition-colors flex items-center hover:bg-orange-700 w-full sm:w-auto"
                      onClick={handleEditarPaquete}
                    >
                      <span className="mr-1">✏️</span> {t("add")}
                    </button>
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[500px] w-full text-xs mt-2 border">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="px-2 py-1 text-left">{t("description")}</th>
                      <th className="px-2 py-1 text-left">{t("brand")}</th>
                      <th className="px-2 py-1">{t("quantity")}</th>
                      <th className="px-2 py-1">{t("price")}</th>
                      <th className="px-2 py-1">{t("subtotal")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.paquete.raw.materiales.map((mat: any, idx: number) => {
                      const cantidad = parseFloat(mat.cantidad_material ?? mat.cantidad ?? 1) || 1;
                      const precio = parseFloat(mat.precio) || 0;
                      return (
                        <tr key={idx}>
                          <td className="px-2 py-1 text-left">{mat.descripcion}</td>
                          <td className="px-2 py-1 text-left">{mat.marca}</td>
                          <td className="px-2 py-1 text-center">{cantidad}</td>
                          <td className="px-2 py-1 text-center">${precio.toFixed(2)}</td>
                          <td className="px-2 py-1 text-center">${(precio * cantidad).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-orange-50">
                      <td colSpan={4} className="px-2 py-1 text-right font-bold text-orange-700">{t("total")}</td>
                      <td className="px-2 py-1 text-center font-bold text-orange-700">
                        ${form.paquete.raw.materiales.reduce((total: number, mat: any) => {
                          const cantidad = parseFloat(mat.cantidad_material ?? mat.cantidad ?? 1) || 1;
                          const precio = parseFloat(mat.precio) || 0;
                          return total + (precio * cantidad);
                        }, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

 

      {error && (
        <div className="w-full mb-4 text-center text-red-600 font-semibold bg-red-50 border border-red-200 rounded p-2">{error}</div>
      )}
      <div className="w-full justify-end gap-4 hidden">
        <button type="button" style={{ background: "#cc3399", color: "#fff" }} className="px-4 py-2 rounded font-medium transition-colors" onClick={() => {
          setForm(initialForm);
          onSubmit(null);
        }} disabled={loading}>Limpiar</button>
      </div>
      
      {/* Modal para crear nuevo paquete con FormPaquete */}
      <Modal open={showModal} onClose={handleCancelarCreacion} title="Crear nuevo paquete basado en el actual" maxWidth="max-w-6xl">
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Crea un nuevo paquete basado en el actual. El nuevo paquete mantendrá los materiales, 
              categoría y subcategoría del paquete original.
            </p>
            
            {/* Mostrar clientes seleccionados */}
            <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4">
              <h3 className="text-sm font-medium text-blue-700 mb-2">Clientes seleccionados:</h3>
              {(() => {
                try {
                  const clientes = JSON.parse(localStorage.getItem("cotizacionClientes") || "[]");
                  if (clientes.length === 0) {
                    return <p className="text-sm text-gray-500">No hay clientes seleccionados</p>;
                  }
                  
                  return (
                    <p className="text-sm">
                      {clientes.map((cliente: any) => cliente.label).join(", ")}
                    </p>
                  );
                } catch (e) {
                  return <p className="text-sm text-red-500">Error al cargar clientes</p>;
                }
              })()}
            </div>
          </div>
          
          {nuevoPaquete && (
            <div className="max-h-[80vh] overflow-y-auto">
              <FormPaquete 
                onSaved={handlePaqueteCreado}
                paquete={nuevoPaquete}
                onCancel={handleCancelarCreacion}
              />
            </div>
          )}
          
          {error && (
            <div className="w-full mb-4 text-center text-red-600 font-semibold bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CotizadorMaterialForm;
