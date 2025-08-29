import { createPaqueteMaterialesCompleto } from "../../services/materialesService";
// formMaterialLogic.ts
// Lógica separada para el formulario de materiales
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../constants/api";
import { API_CULTIVO_COMBO_TIPO_VARIEDAD_API } from "../../constants/apiCultivo";
import { useTranslation } from "react-i18next";
export const API_CATEGORIAS = API_ENDPOINTS.CATEGORIAS.LIST;

export const initialForm = {
  sku: "",
  tipoMaterial: "",
  categoria: "",
  subcategoria: "",
  nombre: "",
  descripcion: "",
  marca: "",
  alto: "",
  ancho: "",
  peso: "",
  tasa_uso: "",
  color: "",
  unidadMedida: "",
  estado: true,
  precio: "",
  imagen: null,
};

export function useFormMaterial(onSaved?: (nuevoMaterial?: any) => void) {
  // Estado para cantidad de material (default 1 para cada material)
  const [cantidades, setCantidades] = useState<{[key: string]: number}>({});
  const handleSubmitPaquete = async (e: React.FormEvent) => {
    e.preventDefault();
    // Buscar el nombre de la categoría seleccionada
    const categoriaId = Array.isArray(form.categoria) ? form.categoria[0] : form.categoria;
    const subcategoriaVal = Array.isArray(form.subcategoria) ? form.subcategoria[0] : form.subcategoria;
    let categoriaNombre = categoriaId;
    if (categoriaId && categoriaId !== "general") {
      const catObj = categorias.find((c) => c.id?.toString() === categoriaId || c.nombreCategoria === categoriaId || c.name === categoriaId);
      categoriaNombre = catObj?.nombreCategoria || catObj?.name || catObj?.descripcion || categoriaId;
    } else if (categoriaId === "general") {
      categoriaNombre = "General";
    }
    // Para subcategoría, si es objeto, usar el nombre, si no, dejar el valor
    let subcategoriaNombre = subcategoriaVal;
    if (subcategoriaVal && typeof subcategoriaVal === 'string') {
      const subcatObj = subcategorias.find((s) => s.id?.toString() === subcategoriaVal || s.name === subcategoriaVal || s.nombre === subcategoriaVal);
      subcategoriaNombre = subcatObj?.name || subcatObj?.nombre || subcatObj?.nombreTipoVariedad || subcatObj?.descripcion || subcategoriaVal;
    }
    // Mapear materiales para que también usen el nombre de la categoría
    const materialesDebug = materiales.map(mat => {
      let matCatNombre = mat.categoria;
      if (mat.categoria && mat.categoria !== "general") {
        const catObj = categorias.find((c) => c.id?.toString() === mat.categoria || c.nombreCategoria === mat.categoria || c.name === mat.categoria);
        matCatNombre = catObj?.nombreCategoria || catObj?.name || catObj?.descripcion || mat.categoria;
      } else if (mat.categoria === "general") {
        matCatNombre = "General";
      }
      let matSubcatNombre = mat.subcategoria;
      if (mat.subcategoria && typeof mat.subcategoria === 'string') {
        const subcatObj = subcategorias.find((s) => s.id?.toString() === mat.subcategoria || s.name === mat.subcategoria || s.nombre === mat.subcategoria);
        matSubcatNombre = subcatObj?.name || subcatObj?.nombre || subcatObj?.nombreTipoVariedad || subcatObj?.descripcion || mat.subcategoria;
      }
      return {
        ...mat,
        categoria: matCatNombre,
        subcategoria: matSubcatNombre,
      };
    });
    const datosParaApi = {
      categoria: categoriaNombre,
      subcategoria: subcategoriaNombre,
      SKU: form.sku,
      nombre: form.nombre,
      estado: form.estado,
      materiales: materialesDebug
    };
    if (materiales.length === 0) {
      alert('Agrega al menos un material');
      return;
    }
    if (!categoriaNombre || !subcategoriaNombre || !form.sku || !form.nombre) {
      alert('Completa los campos obligatorios del paquete');
      return;
    }
    setLoading(true);
    try {
      await createPaqueteMaterialesCompleto({
        categoria: categoriaNombre,
        subcategoria: subcategoriaNombre,
        SKU: form.sku,
        nombre: form.nombre,
        materiales: materialesDebug
      });
      alert('Paquete creado correctamente');
      resetMateriales();
      setForm(initialForm);
      setEditId(null);
      setShowForm(false);
      if (onSaved) onSaved();
    } catch (err: any) {
      alert('Error al crear paquete: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };
  // Estado para el número correlativo del SKU
  const [skuNumber, setSkuNumber] = useState("0001");

  // Función para calcular el siguiente SKU correlativo
  const calcularSiguienteSKU = async () => {
    try {
      const { getMateriales } = await import("../../services/materialesService");
      // Traer todos los materiales sin paginación (o con perPage grande)
      const res = await getMateriales({ perPage: 9999 });
      const allMaterials = Array.isArray(res.data) ? res.data : [];
      // Buscar el número correlativo más alto de todos los SKUs (sin importar prefijo)
      let maxNum = 0;
      allMaterials.forEach((m) => {
        // Considerar tanto m.sku como m.SKU
        const skuVal = m.sku || m.SKU;
        if (typeof skuVal === "string") {
          const match = skuVal.match(/(\d{3,})$/);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[0], 10));
          }
        }
      });
      setSkuNumber((maxNum + 1).toString().padStart(4, "0"));
    } catch (e) {
      setSkuNumber("0001");
      setForm((prev) => ({ ...prev, sku: "0001" }));
    }
  };
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const { t } = useTranslation();
  // Verifica si el nombre del material ya existe y guarda el error con el SKU
  const checkDuplicateMaterialName = (nombre: string, editId?: number | null) => {
    if (!nombre) {
      setDuplicateError("");
      return;
    }
    const normalized = (str: string) => str.toLowerCase().replace(/\s+/g, " ").trim();
    const duplicate = materiales.find(
      (m) => normalized(m.nombre) === normalized(nombre) && (!editId || m.id !== editId)
    );
    if (duplicate) {
      setDuplicateError("Nombre de material duplicado");
      return true;
    } else {
      setDuplicateError("");
      return false;
    }
  };

  useEffect(() => {
    calcularSiguienteSKU();
  }, []);

  // Calcular el prefijo del SKU solo si NO se está editando (crear nuevo)
  useEffect(() => {
    if (editId) return; // Si se está editando, no recalcular SKU
    if (!form.categoria || (form.categoria !== "general" && !form.subcategoria)) {
      setForm((prev) => ({ ...prev, sku: skuNumber }));
      return;
    }
    const catObj = categorias.find((c) => c.id?.toString() === form.categoria);
    let catIni = catObj?.nombreCategoria?.substring(0, 1)?.toUpperCase() || "C";
    let prefix = "";
    if (form.categoria === "general") {
      catIni = "GE";
      prefix = catIni;
    } else {
      const subcatObj = subcategorias.find(
        (s) => s.id?.toString() === form.subcategoria
      );
      const subcatIni =
        subcatObj?.name?.substring(0, 1)?.toUpperCase() ||
        subcatObj?.nombre?.substring(0, 1)?.toUpperCase() ||
        "S";
      prefix = `${catIni}${subcatIni}`;
    }
    setForm((prev) => ({ ...prev, sku: `${prefix}${skuNumber}` }));
  }, [form.categoria, form.subcategoria, categorias, subcategorias, skuNumber, editId]);

  // Ocultar mensaje de éxito automáticamente después de 2.5 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Cargar categorías igual que en Productos
  useEffect(() => {
    fetch(API_CATEGORIAS, { headers: { accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => {
        const categorias = Array.isArray(data) ? data : data.data;
        setCategorias(Array.isArray(categorias) ? categorias : []);
      })
      .catch(() => setCategorias([]));
  }, []);

  // Cargar subcategorías (tipos de variedad) desde API_CULTIVO_COMBO_TIPO_VARIEDAD_API
  useEffect(() => {
    fetch(API_CULTIVO_COMBO_TIPO_VARIEDAD_API)
      .then((r) => r.json())
      .then((data) => {
        setSubcategorias(data.data || []);
      });
  }, [form.categoria]);

  // Handler para cambios en los inputs
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: any; type?: string } }
  ) => {
    const { name, value } = e.target;
    let newValue = value;
    if ("type" in e.target && e.target.type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Handler para submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    try {
      // Buscar los nombres de categoría y subcategoría
      const categoriaObj = categorias.find(
        (c) => c.id?.toString() === form.categoria
      );
      const subcategoriaObj = subcategorias.find(
        (s) => s.id?.toString() === form.subcategoria
      );
      const formToSend = {
        sku: form.sku,
        tipoMaterial: form.tipoMaterial,
        unidadMedida: form.unidadMedida,
        categoria: categoriaObj
          ? categoriaObj.nombreCategoria ||
            categoriaObj.name ||
            categoriaObj.descripcion ||
            form.categoria
          : form.categoria,
        subcategoria:
          form.categoria === "general"
            ? categoriaObj
              ? categoriaObj.nombreCategoria ||
                categoriaObj.name ||
                categoriaObj.descripcion ||
                form.categoria
              : form.categoria
            : subcategoriaObj
            ? subcategoriaObj.name ||
              subcategoriaObj.nombre ||
              subcategoriaObj.nombreTipoVariedad ||
              subcategoriaObj.descripcion ||
              form.subcategoria
            : form.subcategoria,
        nombre: form.nombre,
        descripcion: form.descripcion,
        marca: form.marca,
        estado: form.estado,
        alto: Number(form.alto) || 0,
        ancho: Number(form.ancho) || 0,
        peso: Number(form.peso) || 0,
        color: form.color,
        precio: form.precio,
        tasa_uso: form.tasa_uso,
        imagen: form.imagen // <-- Asegura que la imagen se envía
      };
      let result;
      if (editId) {
        // Editar existente: cerrar formulario y recargar tabla tras actualizar
        const { updateMaterial } = await import("../../services/materialesService");
        try {
          result = await updateMaterial(editId, formToSend);
          setSuccessMessage(t("material_actualizado_correctamente") || "Material actualizado correctamente");
          setForm(initialForm);
          setEditId(null);
          setShowForm(false);
          if (onSaved) onSaved(result); // Recargar tabla
        } catch (err: any) {
          setDuplicateError(err.message || "Error al actualizar material");
          setLoading(false);
          return;
        }
      }
    } catch (error: any) {
      setDuplicateError(error.message || t("error_guardar_material"));
    } finally {
      setLoading(false);
    }
  };

  // Agregar material a la lista de materiales del paquete
  const addMaterial = (material: any) => {
    // Validar que la imagen sea un File o null
    let imagenValida = null;
    if (material.imagen instanceof File) {
      imagenValida = material.imagen;
    } else if (material.imagen) {
      alert("La imagen seleccionada no es válida. Selecciona un archivo de imagen.");
      imagenValida = null;
    }
    // Asegurar que el material tenga una cantidad (default: 1)
    const materialConCantidad = {
      ...material,
      imagen: imagenValida,
      cantidad: material.cantidad || 1
    };
    setMateriales((prev: any[]) => [...prev, materialConCantidad]);
    // Actualizar cantidades
    setCantidades(prev => ({
      ...prev,
      [material.id || material.nombre]: material.cantidad || 1
    }));
  };
  
  // Actualizar cantidad de un material específico
  const updateCantidad = (materialId: string | number, cantidad: number) => {
    setCantidades(prev => ({
      ...prev,
      [materialId]: cantidad
    }));
    
    // También actualizar en la lista de materiales
    setMateriales(prev => prev.map(mat => {
      if ((mat.id && mat.id === materialId) || mat.nombre === materialId) {
        return { ...mat, cantidad };
      }
      return mat;
    }));
  };
  
  // Limpiar la lista de materiales agregados
  const resetMateriales = () => {
    setMateriales([]);
    setCantidades({});
  };

  return {
    form,
    setForm,
    loading,
    setLoading,
    materiales,
    setMateriales,
    addMaterial,
    resetMateriales,
    search,
    setSearch,
    categorias,
    setCategorias,
    subcategorias,
    setSubcategorias,
    showForm,
    setShowForm,
    editId,
    setEditId,
    successMessage,
    setSuccessMessage,
    handleChange,
    handleSubmit,
    handleSubmitPaquete,
    initialForm,
    duplicateError,
    cantidades,
    updateCantidad,
    calcularSiguienteSKU,
  };
}
