import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cultivoService } from "../../services/cultivoService";
import { createPrecio, updatePrecio } from "../../services/precioService";
import type { PrecioItem } from "../../services/precioService";

interface FormPreciosProps {
  onSaved?: (nuevoPrecio?: any) => void;
  precio?: any;
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
  const [valor, setValor] = useState("");
 
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

const FormPrecios = ({ onSaved, precio, onCancel }: FormPreciosProps) => {
  const { t } = useTranslation();
  
  // Estado para los campos del precio (solo los requeridos por la API)
  const initialPrecioInput = {
    categoria: "",
    medida: "",
    precio: ""
  };
  
  const [precioInput, setPrecioInput] = useState(initialPrecioInput);
  
  // Estado para los campos adicionales de gestión y precio EQR
  const [gestionInput, setGestionInput] = useState("");
  const [precioEqrInput, setPrecioEqrInput] = useState("");
  
  // Estado para la lista de gestiones y precios EQR
  const [listaGestionPrecio, setListaGestionPrecio] = useState<Array<{id: number, gestion: string, precioEqr: string}>>([]);
  
  // Estado para selects
  const [categorias, setCategorias] = useState<string[]>([]);
  useEffect(() => {
    const fetchSubcategorias = async () => {
      const data = await cultivoService.getSubcategorias();
      // Crear un array de strings manualmente para evitar problemas de tipo
      const categoryNames: string[] = [];
      data.forEach((cat: any) => {
        if (cat.name) categoryNames.push(String(cat.name));
      });
      // Eliminar duplicados
      const uniqueCategoriesSet = new Set(categoryNames);
      const uniqueCategories = Array.from(uniqueCategoriesSet);
      setCategorias(uniqueCategories);
    };
    fetchSubcategorias();
  },[]);

  // Función para cargar desglose existente de una categoría
  const cargarDesgloseExistente = async (categoria: string) => {
    try {
      // Solo cargar si no estamos en modo edición
      if (precio) return;
      
      // Buscar precios existentes de esta categoría
      const preciosExistentes = await import("../../services/precioService").then(m => m.precioService.getPreciosFiltered(categoria));
      
      if (preciosExistentes.length > 0) {
        const primerPrecio = preciosExistentes[0];
        
        // Si existe desglose, parsearlo y cargarlo
        if (primerPrecio.preciosDesglose && primerPrecio.preciosDesglose.trim()) {
          try {
            const gestiones = primerPrecio.preciosDesglose.split(',').map((item, index) => {
              const [gestion, precioEqr] = item.split(':');
              return {
                id: Date.now() + index,
                gestion: gestion?.trim() || '',
                precioEqr: precioEqr?.trim() || '0'
              };
            }).filter(item => item.gestion);
            
            setListaGestionPrecio(gestiones);
            console.log(`Cargados ${gestiones.length} elementos de desglose existentes para la categoría ${categoria}`);
          } catch (error) {
            console.warn('Error al parsear desglose existente:', error);
          }
        }
      }
    } catch (error) {
      console.warn('Error al cargar desglose existente:', error);
    }
  };

  // Guardar o actualizar precio usando la API
  const handleGuardarPrecio = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validar campos requeridos
    if (
      !precioInput.categoria ||
      !precioInput.medida ||
      !precioInput.precio
    ) {
      alert("Por favor completa los campos obligatorios");
      setLoading(false);
      return;
    }

    // Preparar preciosDesglose: formato "Gestion1:precio1,Gestion2:precio2,..."
    const preciosDesglose = listaGestionPrecio
      .map(item => `${item.gestion}:${item.precioEqr}`)
      .join(',');

    // Calcular preciosEQR: suma total de todos los precios EQR
    const preciosEQR = listaGestionPrecio
      .reduce((suma, item) => suma + parseFloat(item.precioEqr || '0'), 0)
      .toString();

    let resultado;

    if (precio && precio.id) {
      // ...edición existente...
      const precioActualizado: PrecioItem = {
        Id: precio.id,
        Categoria: precioInput.categoria,
        Medida: precioInput.medida,
        Precio: precioInput.precio,
        preciosDesglose: preciosDesglose,
        preciosEQR: preciosEQR
      };
      resultado = await updatePrecio(precio.id, precioActualizado);
    } else {
      // Antes de crear, verificar si ya existe una combinación de categoría y medida
      const preciosExistentes = await import("../../services/precioService").then(m => m.precioService.getPreciosFiltered(precioInput.categoria, precioInput.medida));
      if (preciosExistentes.length > 0) {
        setDuplicateError("Ya existe un precio para esta categoría y calibre. No se puede crear otro.");
        setShowDuplicateModal(true);
        setLoading(false);
        return;
      }
      // Si no hay duplicado, crear el nuevo precio
      const nuevoPrecio: PrecioItem = {
        Id: 0,
        Categoria: precioInput.categoria,
        Medida: precioInput.medida,
        Precio: precioInput.precio,
        preciosDesglose: preciosDesglose,
        preciosEQR: preciosEQR
      };
      resultado = await createPrecio(nuevoPrecio);
    }

    if (resultado) {
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
      // Solo limpiamos el formulario si estamos creando un nuevo precio
      if (!precio) {
        setPrecioInput(initialPrecioInput);
        setGestionInput("");
        setPrecioEqrInput("");
        setListaGestionPrecio([]);
      }
      // Llamamos al callback onSaved para actualizar la tabla o realizar otras acciones
      if (onSaved) onSaved(resultado);
      // NO redirigimos a la tabla - permanecemos en el formulario si es creación
    } else {
      alert("Error al guardar el precio");
    }
    setLoading(false);
  };

  // Estado para modal de categoría
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  
  // Estado para mostrar mensaje informativo
  const [mensajeInformativo, setMensajeInformativo] = useState("");
  
  // Estado para mostrar el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  // Manejar cambios en los inputs del precio
  const handlePrecioInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Si selecciona "Otro" en categoría, abrir modal
    if (name === "categoria" && value === "Otro") {
      setModalCategoriaOpen(true);
      return;
    }
    
    setPrecioInput((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Si se cambió la categoría y no estamos en modo edición, cargar desglose existente
    if (name === "categoria" && !precio) {
      setMensajeInformativo(""); // Limpiar mensaje anterior
      if (value && value !== "Otro") {
        cargarDesgloseExistente(value);
      } else {
        // Si se deselecciona la categoría, limpiar el desglose
        setListaGestionPrecio([]);
      }
    }
  };
  
  // Guardar nueva categoría
  const handleGuardarNuevaCategoria = (nuevaCategoria: string) => {
    if (!nuevaCategoria || categorias.includes(nuevaCategoria)) {
      setModalCategoriaOpen(false);
      return;
    }
    // En una implementación real, aquí se guardaría en la base de datos
    setPrecioInput((prev) => ({ ...prev, categoria: nuevaCategoria }));
    setModalCategoriaOpen(false);
  };
  
  // Función para agregar gestión y precio EQR a la lista
  const handleAgregarGestionPrecio = () => {
    if (!gestionInput.trim() || !precioEqrInput.trim()) {
      alert(t("completarAmbosGestion"));
      return;
    }
    
    const nuevoItem = {
      id: Date.now(),
      gestion: gestionInput.trim(),
      precioEqr: precioEqrInput.trim()
    };
    
    setListaGestionPrecio(prev => [...prev, nuevoItem]);
    setGestionInput("");
    setPrecioEqrInput("");
  };
  
  // Función para eliminar un item de la lista
  const handleEliminarGestionPrecio = (id: number) => {
    setListaGestionPrecio(prev => prev.filter(item => item.id !== id));
  };
  
  // Si se pasa precio (edición), inicializa el formulario con sus datos
  useEffect(() => {
    if (precio) {
      setPrecioInput({
        categoria: precio.categoria || "",
        medida: precio.producto || precio.medida || "", // Probar ambos nombres
        precio: precio.precioVenta || precio.precio || "" // Probar ambos nombres
      });
      
      // Cargar datos de gestiones y precios EQR si existen
      // Probar diferentes posibles nombres de campos
      const desglose = precio.preciosDesglose || precio.PreciosDesglose || precio.desglose || "";
      
      if (desglose && desglose.trim()) {
        try {
          // Parsear el string de desglose: "Gestion1:precio1,Gestion2:precio2"
          const gestiones = desglose.split(',').map((item: string, index: number) => {
            const [gestion, precioEqr] = item.split(':');
            return {
              id: Date.now() + index,
              gestion: gestion?.trim() || '',
              precioEqr: precioEqr?.trim() || '0'
            };
          }).filter((item: {id: number, gestion: string, precioEqr: string}) => item.gestion); // Filtrar elementos vacíos
          
          setListaGestionPrecio(gestiones);
        } catch (error) {
          console.warn('Error al parsear preciosDesglose:', error);
          setListaGestionPrecio([]);
        }
      } else {
        setListaGestionPrecio([]);
      }
      
      // Limpiar campos de entrada
      setGestionInput("");
      setPrecioEqrInput("");
    } else {
      // Resetear el formulario cuando se vuelve a modo creación
      setPrecioInput(initialPrecioInput);
      setGestionInput("");
      setPrecioEqrInput("");
      setListaGestionPrecio([]);
    }
  }, [precio]);

  return (
    <>
      {showSuccessModal && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{t("precioGuardadoExitosamente")}</span>
        </div>
      )}

      {mensajeInformativo && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{mensajeInformativo}</span>
        </div>
      )}
      
      {/* Modal de error por duplicado */}
      {showDuplicateModal && (
        <div style={{
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
        }}>
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-2 min-w-[250px]">
            <span className="text-red-700 font-semibold mb-2">Error</span>
            <div className="mb-2 text-gray-800">{duplicateError}</div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                className="px-3 py-1 bg-red-500 text-white rounded"
                style={{ background: "#cc3399" }}
                onClick={() => { setShowDuplicateModal(false); setDuplicateError(""); }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleGuardarPrecio} className="px-4 sm:px-8 py-4">
      {/* Bloque 1: Datos del Producto */}
      <div className="border border-pink-400 bg-white rounded-lg py-6 px-2 mb-2">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-pink-700 ml-1">
            {t("datosDelProducto")}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              {t("categoria")}
            </label>
            <select
              name="categoria"
              value={precioInput.categoria}
              onChange={handlePrecioInputChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Seleccionar...</option>
              {categorias.map((cat, index) => (
                <option key={`${cat}-${index}`} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Otro">Otro...</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              {t("medida")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="medida"
              value={precioInput.medida}
              onChange={handlePrecioInputChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Bloque 2: Precio */}
      <div className="border border-blue-300 bg-white rounded-lg py-6 px-2 mb-2">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-blue-700 ml-1">
            {t("precio")}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Todos los campos en una sola fila */}
          <div className="flex gap-2 items-end">
            <div className="flex flex-col flex-1">
              <label className="text-sm text-gray-600 mb-1">
                {t("precio")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="precio"
                value={precioInput.precio}
                onChange={handlePrecioInputChange}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                step="0.01"
                min="0"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm text-gray-600 mb-1">
                {t("gestion")}
              </label>
              <input
                type="text"
                value={gestionInput}
                onChange={(e) => setGestionInput(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("ingresarGestion")}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm text-gray-600 mb-1">
                {t("precioEqr")}
              </label>
              <input
                type="number"
                value={precioEqrInput}
                onChange={(e) => setPrecioEqrInput(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <button
              type="button"
              onClick={handleAgregarGestionPrecio}
              className="px-5 py-2 rounded text-white transition-colors"
              style={{ background: "#cc3399" }}
              title={t("agregarGestionPrecio")}
            >
              {t("agregarGestionPrecio")}
            </button>
          </div>
          
          {/* Lista de gestiones y precios EQR agregados */}
          {listaGestionPrecio.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">{t("listaGestionesPreciosEqr")}</h4>
                <div className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  {t("totalEqr")}: ${listaGestionPrecio.reduce((suma, item) => suma + parseFloat(item.precioEqr || '0'), 0).toFixed(2)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {listaGestionPrecio.map((item) => (
                  <div key={item.id} className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm">
                    <span className="text-blue-800">
                      <strong>{item.gestion}</strong>: ${item.precioEqr}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEliminarGestionPrecio(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors"
                      title={t("eliminar")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales para agregar nueva categoría */}
      <ModalNuevoValor
        open={modalCategoriaOpen}
        onClose={() => setModalCategoriaOpen(false)}
        onSave={handleGuardarNuevaCategoria}
        label={t("nuevaCategoria")}
      />
    
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          onClick={onCancel}
          disabled={loading}
        >
          {t("cancelar")}
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded text-white transition-colors"
          style={{ background: "#cc3399" }}
          disabled={loading}
        >
          {loading ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t("guardando")}...
            </span>
          ) : (
            t("guardar")
          )}
        </button>
      </div>
    </form>
    </>
  );
}

export default FormPrecios;
