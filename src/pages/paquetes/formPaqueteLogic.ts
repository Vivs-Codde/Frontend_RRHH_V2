import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPaquete, updatePaquete } from "../../services/paquetesService";
import { getMateriales } from "../../services/materialesService";
import { API_ENDPOINTS } from "../../constants/api";
import { API_CULTIVO_COMBO_TIPO_VARIEDAD_API } from "../../constants/apiCultivo";

const API_CATEGORIAS = API_ENDPOINTS.CATEGORIAS.LIST;

export type ClienteOption = { value: string; label: string } | null;
export const initialForm = {
  sku: "",
  categoria: "",
  subcategoria: "",
  nombre: "",
  estado: true,
  cliente: null as ClienteOption,
  precioTotal: 0,
};

export function useFormPaqueteLogic(paquete: any, onSaved?: (nuevoPaquete?: any) => void) {
  const [form, setForm] = useState<typeof initialForm>(initialForm);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [duplicateError, setDuplicateError] = useState<string>("");
  const [skuNumber, setSkuNumber] = useState<string>("0001");
  const [search, setSearch] = useState<string>("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [materialesBusqueda, setMaterialesBusqueda] = useState<string>("");
  const [materialesFiltrados, setMaterialesFiltrados] = useState<any[]>([]);
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState<any[]>([]);
  const { t } = useTranslation();

  // Calcular precioTotal automáticamente cuando cambian los materiales seleccionados
  useEffect(() => {
    const total = materialesSeleccionados.reduce(
      (acc, mat) => acc + ((mat.cantidad || 1) * (mat.precioUnitario ?? mat.precio ?? 0)),
      0
    );
    setForm((prev) => ({ ...prev, precioTotal: Number(total.toFixed(2)) }));
  }, [materialesSeleccionados]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const data = await getMateriales({
          search: materialesBusqueda,
          page: 1,
          perPage: 20,
        });
        setMateriales(Array.isArray(data.data) ? data.data : []);
      } catch {
        setMateriales([]);
      }
    };
    fetchMateriales();
  }, [materialesBusqueda]);

  useEffect(() => {
    setMaterialesFiltrados(
      materiales.filter(
        (mat) => !materialesSeleccionados.some((sel) => sel.id === mat.id)
      )
    );
  }, [materiales, materialesSeleccionados]);

  useEffect(() => {
    if (paquete && Array.isArray(paquete.materiales)) {
      setMaterialesSeleccionados(
        paquete.materiales.map((m) => ({ ...m, cantidad: m.cantidad || 1 }))
      );
    } else {
      setMaterialesSeleccionados([]);
    }
  }, [paquete]);

  const calcularSiguienteSKU = async () => {
    try {
      const { getPaquetes } = await import("../../services/paquetesService");
      const res = await getPaquetes({ limit: 9999 });
      const allPaquetes = Array.isArray(res.data) ? res.data : [];
      let maxNum = 0;
      allPaquetes.forEach((p) => {
        const skuVal = p.sku || p.SKU;
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
      setSkuNumber(nextNum);
      setForm((prev) => ({ ...prev, sku: prev.sku ? prev.sku.replace(/\d{4,}$/, nextNum) : nextNum }));
    } catch (e) {
      setSkuNumber("0001");
      setForm((prev) => ({ ...prev, sku: "0001" }));
    }
  };

  const checkDuplicatePaqueteName = (nombre, editId) => {
    if (!nombre) return;
    setDuplicateError("");
  };

  const handleMaterialImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    try {
      let categoriaNombre = "";
      let subcategoriaNombre = "";
      if (Array.isArray(form.categoria)) {
        categoriaNombre = form.categoria.length > 0 ? String(form.categoria[0]) : "";
      } else if (typeof form.categoria === "string") {
        categoriaNombre = form.categoria;
      }
      if (Array.isArray(form.subcategoria)) {
        subcategoriaNombre = form.subcategoria.length > 0 ? String(form.subcategoria[0]) : "";
      } else if (typeof form.subcategoria === "string") {
        subcategoriaNombre = form.subcategoria;
      }
      let clienteVal = form.cliente && typeof form.cliente === "object" ? form.cliente.label || form.cliente.value : form.cliente;
      if (editId && paquete) {
        clienteVal = paquete.NombreCliente || paquete.nombreCliente || paquete.cliente || clienteVal;
      }
      if (!categoriaNombre || !subcategoriaNombre || !form.sku || !form.nombre || !clienteVal) {
        alert("Por favor, completa todos los campos obligatorios.");
        setLoading(false);
        return;
      }
      if (materialesSeleccionados.length === 0) {
        alert("Debes seleccionar al menos un material.");
        setLoading(false);
        return;
      }
      const catObj = categorias.find(
        (c) =>
          c.id?.toString() === categoriaNombre ||
          c.nombreCategoria === categoriaNombre ||
          c.name === categoriaNombre
      );
      const subCatObj = subcategorias.find(
        (s) =>
          s.id?.toString() === subcategoriaNombre ||
          s.name === subcategoriaNombre ||
          s.nombre === subcategoriaNombre
      );
      const datosParaApi = {
        categoria: catObj?.nombreCategoria || catObj?.name || categoriaNombre,
        subcategoria: subCatObj?.nombre || subCatObj?.name || subcategoriaNombre,
        SKU: (editId && paquete && (paquete.sku || paquete.SKU)) ? (paquete.sku || paquete.SKU) : form.sku,
        nombre: form.nombre,
        nombreCliente: clienteVal,
        estado: form.estado,
        precioTotal: form.precioTotal,
        materiales: materialesSeleccionados.map((mat) => ({
          material_id: mat.id,
          cantidad: mat.cantidad || 1,
        })),
      };
      if (editId && paquete) {
        await updatePaquete(paquete.id, datosParaApi);
        setSuccessMessage("Paquete actualizado con éxito");
        if (onSaved) onSaved({ ...datosParaApi, id: paquete.id });
      } else {
        await createPaquete(datosParaApi);
        setSuccessMessage("Paquete creado con éxito");
        if (onSaved) onSaved();
        setForm(initialForm);
        setMaterialesSeleccionados([]);
        setShowForm(false);
        setEditId(null);
      }
    } catch (err) {
      if (err && err.response) {
        err.response.json().then((data) => {
          alert(`Error: ${err?.message || "No se pudo guardar el paquete"}\n${JSON.stringify(data)}`);
        }).catch(() => {
          alert(`Error: ${err?.message || "No se pudo guardar el paquete"}`);
        });
      } else {
        alert(`Error: ${err?.message || "No se pudo guardar el paquete"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editId) return;
    if (!form.categoria || (Array.isArray(form.categoria) && form.categoria.length === 0)) {
      setForm((prev) => ({ ...prev, sku: skuNumber }));
      return;
    }
    let clienteIni = "";
    let catIni = "";
    let subCatIni = "";
    if (form.cliente && typeof form.cliente === "object" && form.cliente.label) {
      clienteIni = form.cliente.label.substring(0, 2).toUpperCase();
    }
    let catValue = Array.isArray(form.categoria) ? form.categoria[0] : form.categoria;
    if (catValue) {
      if (String(catValue).toLowerCase() === "general") {
        catIni = "G";
      } else {
        const catObj = categorias.find(
          (c) =>
            c.id?.toString() === catValue ||
            c.nombreCategoria === catValue ||
            c.name === catValue
        );
        catIni = catObj?.nombreCategoria?.substring(0, 1)?.toUpperCase() || catObj?.name?.substring(0, 1)?.toUpperCase() || "";
      }
    }
    let subCatValue = Array.isArray(form.subcategoria) ? form.subcategoria[0] : form.subcategoria;
    if (subCatValue) {
      const subCatObj = subcategorias.find(
        (s) =>
          s.id?.toString() === subCatValue ||
          s.name === subCatValue ||
          s.nombre === subCatValue
      );
      subCatIni = subCatObj?.name?.substring(0, 1)?.toUpperCase() || subCatObj?.nombre?.substring(0, 1)?.toUpperCase() || "";
    }
    let prefix = `${clienteIni}${catIni}${subCatIni}`;
    setForm((prev) => ({ ...prev, sku: `${prefix}${skuNumber}` }));
  }, [form.categoria, form.subcategoria, form.cliente, categorias, subcategorias, skuNumber, editId]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    fetch(API_CATEGORIAS, { headers: { accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => {
        setCategorias(Array.isArray(data) ? data : data?.data || []);
      })
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (!form.categoria) {
      setSubcategorias([]);
      return;
    }
    fetch(API_CULTIVO_COMBO_TIPO_VARIEDAD_API)
      .then((r) => r.json())
      .then((data) => {
        setSubcategorias(Array.isArray(data) ? data : data?.data || []);
      });
  }, [form.categoria]);

  useEffect(() => {
    if (paquete) {
      const normalizeToArray = (val) => {
        if (Array.isArray(val))
          return val.flatMap((v) =>
            typeof v === "string"
              ? v.split(",").map((s) => s.trim()).filter(Boolean)
              : [String(v)]
          );
        if (typeof val === "string" && val)
          return val.split(",").map((s) => s.trim()).filter(Boolean);
        if (val == null) return [];
        return [String(val)];
      };
      setForm((prev) => ({
        ...prev,
        ...paquete,
        sku: paquete.sku || prev.sku || "",
        categoria: normalizeToArray(paquete.categoria),
        subcategoria: normalizeToArray(paquete.subcategoria),
        estado: typeof paquete.estado === 'boolean' ? paquete.estado : (paquete.estado === 1 ? true : false),
      }));
      setEditId(paquete.id);
      setShowForm(true);
    } else {
      setEditId(null);
      if (typeof calcularSiguienteSKU === "function") {
        calcularSiguienteSKU();
      }
    }
  }, [paquete]);

  useEffect(() => {
    calcularSiguienteSKU();
  }, []);

  useEffect(() => {
    if (typeof calcularSiguienteSKU === "function") {
      calcularSiguienteSKU();
    }
  }, [form.categoria, form.subcategoria]);

  return {
    form,
    setForm,
    loading,
    setLoading,
    showForm,
    setShowForm,
    editId,
    setEditId,
    successMessage,
    setSuccessMessage,
    duplicateError,
    setDuplicateError,
    skuNumber,
    setSkuNumber,
    search,
    setSearch,
    categorias,
    setCategorias,
    subcategorias,
    setSubcategorias,
    materiales,
    setMateriales,
    materialesBusqueda,
    setMaterialesBusqueda,
    materialesFiltrados,
    setMaterialesFiltrados,
    materialesSeleccionados,
    setMaterialesSeleccionados,
    t,
    handleChange,
    handleSubmit,
    handleMaterialImagenChange,
    checkDuplicatePaqueteName,
    calcularSiguienteSKU,
  };
}
