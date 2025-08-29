

import React, { useState, useEffect } from "react";
import { getClientes } from "../../services/clienteService";
import { API_CULTIVO_COMBO_VARIEDAD_API } from "../../constants/apiCultivo";
import { buscarProductosPorDescripcion } from "../../services/asignacionesService";
import { getRecetas } from "../../services/recetasService";

export function useAsignacionFormLogic({ onGuardar, onCancelar, productoActivo }: { onGuardar: (asignacion: any) => void, onCancelar: () => void, productoActivo: any }) {
  // Estado para selección de tipo-color por producto
  const [florColorSeleccion, setFlorColorSeleccion] = React.useState<Record<number, string>>({});
  // Estado para variedades filtradas por tipo-color por producto
  // { [productoId]: { [tipoColorKey]: variedad[] } }
  const [variedadesPorFlor, setVariedadesPorFlor] = React.useState<Record<number, Record<string, any[]>>>({});
  // Opciones únicas de tipo y color de flor concatenados para el producto activo
  const opcionesFlorColor = React.useMemo(() => {
    if (!productoActivo || !productoActivo.flores) return [];
    const combinaciones = productoActivo.flores.map(f => {
      const words = typeof f.tipo === 'string' ? f.tipo.split(' ') : [];
      const tipo = words.length > 1 ? words.slice(1).join(' ') : (words[0] || '');
      const color = f.color || '';
      return tipo && color ? `${tipo} - ${color}` : '';
    }).filter(Boolean);
    return Array.from(new Set(combinaciones)).map(c => ({ value: String(c), label: String(c) }));
  }, [productoActivo]);

  // Efecto para cargar variedades cuando cambia la selección de tipo-color
  useEffect(() => {
    if (!productoActivo) return;
    const seleccion = florColorSeleccion[productoActivo.id];
    if (seleccion) {
      const [tipo, ...colorArr] = seleccion.split(' - ');
      const color = colorArr.join(' - ');
      if (tipo && color) {
        const url = `${API_CULTIVO_COMBO_VARIEDAD_API}?nombre_tipo=${encodeURIComponent(tipo)}&nombre_color=${encodeURIComponent(color)}`;
        fetch(url)
          .then(res => res.json())
          .then(data => {
            setVariedadesPorFlor(prev => ({
              ...prev,
              [productoActivo.id]: {
                ...(prev[productoActivo.id] || {}),
                [seleccion]: data.data || []
              }
            }));
          });
      }
    }
    // eslint-disable-next-line
  }, [productoActivo, florColorSeleccion]);
  // Estado para clientes
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any | null>(null);

  // Estado para productos cargados desde la API
  const [productos, setProductos] = useState<any[]>([]);
  // Estado para productos seleccionados (múltiples)
  const [selectedProductos, setSelectedProductos] = useState<any[]>([]);
  // Cargar productos y clientes desde la API al montar
  
  // Estado para almacenar las recetas completas
  const [recetas, setRecetas] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await getRecetas({ per_page: 1000 });
        // Almacenamos las recetas completas
        const productosDeRecetas = response.data || [];
        setRecetas(productosDeRecetas);
        
        // Extraemos los productos de las recetas y nos aseguramos de que no haya duplicados
        // Ahora para cada producto incluimos también la receta_id y el paquete_material
        const productos = productosDeRecetas
          .filter(receta => receta.producto && receta.producto.estado === 1) // Solo productos activos
          .map(receta => ({
            ...receta.producto,
            receta_id: receta.id,
            paquete_material: receta.paquete_material,
            receta_completa: receta // Guardamos la receta completa para mostrarla en el modal
          }))
          // Eliminamos duplicados por ID
          .filter((producto, index, self) => 
            index === self.findIndex((p) => p.id === producto.id)
          );
        setProductos(productos);
      } catch (err) {
        setProductos([]);
        setRecetas([]);
      }
    };
    const fetchClientes = async () => {
      try {
        const data = await getClientes({ per_page: 1000 });
        setClientes(data.data || []);
      } catch (err) {
        setClientes([]);
      }
    };
    fetchProductos();
    fetchClientes();
  }, []);


  // Estado para subcategoría y variedad por producto
  const [subcatPorProducto, setSubcatPorProducto] = useState<Record<number, string>>({});
  // Estado para variedades excluidas por producto y tipo-color
  // { [productoId]: { [tipoColorKey]: string[] } }
  const [variedadesExcluidas, setVariedadesExcluidas] = useState<Record<number, Record<string, string[]>>>({});
  // Estado para variedad seleccionada para excluir por producto y tipo-color
  // { [productoId]: { [tipoColorKey]: string } }
  const [variedadAExcluir, setVariedadAExcluir] = useState<Record<number, Record<string, string>>>({});
  // Estado para combos
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  // Ahora variedades es un objeto: key = productoId, value = array de variedades para ese producto
  const [variedades, setVariedades] = useState<Record<number, any[]>>({});
  // Producto actualmente activo para asignar subcat/variedad se maneja desde el componente padre (AsignacionForm)
  // const [productoActivo, setProductoActivo] = useState<any | null>(null);
  // Estado para el texto de búsqueda
  const [busqueda, setBusqueda] = useState("");
  // Estado para el producto sugerido (seleccionado de la lista de coincidencias)
  const [productoSugerido, setProductoSugerido] = useState<any | null>(null);
  // Estado para mostrar/ocultar el dropdown
  const [showDropdown, setShowDropdown] = useState(false);


  // Estado para productos filtrados por búsqueda en API
  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([]);

  // Efecto: buscar productos por descripción en la API al escribir (mínimo 3 caracteres), si no hay resultados, buscar localmente
  useEffect(() => {
    let ignore = false;
    const fetchBusqueda = async () => {
      const texto = busqueda.trim();
      if (!texto) {
        setProductosFiltrados(productos.filter((p) => !selectedProductos.some((sp) => sp.id === p.id)));
        return;
      }
      if (texto.length < 3) {
        setProductosFiltrados([]);
        return;
      }
      try {
        const data = await buscarProductosPorDescripcion(texto);
        const palabras = texto.toLowerCase().split(/\s+/).filter(Boolean);
        let resultados = (data.data || []).filter((p: any) => {
          const campo = (p.descripcion || p.nombre || "").toLowerCase();
          return palabras.every(w => campo.includes(w));
        });
        // Si la API no devuelve nada, buscar localmente en productos
        if (resultados.length === 0) {
          resultados = productos.filter((p) => {
            if (selectedProductos.some((sp) => sp.id === p.id)) return false;
            const campo = (p.descripcion || p.nombre || "").toLowerCase();
            return palabras.every(w => campo.includes(w));
          });
        }
        // Quitar los ya seleccionados
        const filtrados = resultados.filter((p: any) => !selectedProductos.some((sp) => sp.id === p.id));
        if (!ignore) setProductosFiltrados(filtrados);
      } catch (err) {
        // Si la API falla, buscar localmente
        const texto = busqueda.trim();
        const palabras = texto.toLowerCase().split(/\s+/).filter(Boolean);
        const filtrados = productos.filter((p) => {
          if (selectedProductos.some((sp) => sp.id === p.id)) return false;
          const campo = (p.descripcion || p.nombre || "").toLowerCase();
          return palabras.every(w => campo.includes(w));
        });
        setProductosFiltrados(filtrados);
      }
    };
    fetchBusqueda();
    return () => { ignore = true; };
  }, [busqueda, selectedProductos, productos]);

  // Agregar producto sugerido a la lista de seleccionados
 const handleAgregarProducto = (producto?: any) => {
  const prod = producto || productoSugerido;
  if (!prod) return;
  setSelectedProductos((prev) => [...prev, prod]);
  setBusqueda("");
  setProductoSugerido(null);

    // Si el producto es Assorted/Rainbow, cargar variedades filtradas automáticamente
    if (productoSugerido.flores && Array.isArray(productoSugerido.flores) && productoSugerido.flores.length > 0) {
      const flor = productoSugerido.flores[0];
      const tipoBase = flor.tipo?.split(" ")[0]?.toLowerCase();
      if (tipoBase === "assorted" || tipoBase === "rainbow") {
        const tipoWords = (flor.tipo || '').split(' ');
        const nombre_tipo = tipoWords.length > 1 ? tipoWords[1].toUpperCase() : '';
        const nombre_color = (flor.color || '').toLowerCase();
        if (nombre_tipo && nombre_color) {
          const url = `${API_CULTIVO_COMBO_VARIEDAD_API}?nombre_tipo=${encodeURIComponent(nombre_tipo)}&nombre_color=${encodeURIComponent(nombre_color)}`;
          fetch(url)
            .then(res => res.json())
            .then(data => {
              setVariedades(prev => ({ ...prev, [productoSugerido.id]: data.data || [] }));
            });
        }
      }
    }
  };

  // Manejar selección de producto activo para asignar subcat/variedad
  // El manejo de productoActivo se realiza en el componente padre
  const handleSetProductoActivo = (_prod: any) => {};


  // Manejar cambio de subcategoría (y cargar variedades si es Assorted/Rainbow)
  const handleChangeSubcat = async (productoId: number, subcatId: string) => {
    setSubcatPorProducto((prev) => ({ ...prev, [productoId]: subcatId }));
    // Buscar el producto seleccionado
    const prod = selectedProductos.find(p => p.id === productoId);
    if (!prod || !prod.flores || !Array.isArray(prod.flores) || prod.flores.length === 0) return;
    const flor = prod.flores[0];
    const tipoBase = flor.tipo?.split(" ")[0]?.toLowerCase();
    if (tipoBase === "assorted" || tipoBase === "rainbow") {
      // Tomar la segunda palabra del tipo como nombre_tipo
      const tipoWords = (flor.tipo || '').split(' ');
      const nombre_tipo = tipoWords.length > 1 ? tipoWords[1].toUpperCase() : '';
      const nombre_color = (flor.color || '').toLowerCase();
      if (nombre_tipo && nombre_color) {
        // Llamar a la API con los filtros
        const url = `${API_CULTIVO_COMBO_VARIEDAD_API}?nombre_tipo=${encodeURIComponent(nombre_tipo)}&nombre_color=${encodeURIComponent(nombre_color)}`;
        const res = await fetch(url);
        const data = await res.json();
        setVariedades(prev => ({ ...prev, [productoId]: data.data || [] }));
      }
    }
  };


  // Manejar cambio de variedad a excluir por producto y tipo-color
  const handleChangeVariedadAExcluir = (productoId: number, tipoColorKey: string, variedadId: string) => {
    setVariedadAExcluir((prev) => ({
      ...prev,
      [productoId]: {
        ...(prev[productoId] || {}),
        [tipoColorKey]: variedadId
      }
    }));
  };

  // Agregar variedad a la lista de excluidas por producto y tipo-color
  const handleAgregarVariedadExcluida = (productoId: number, tipoColorKey: string) => {
    const variedadId = (variedadAExcluir[productoId] || {})[tipoColorKey];
    if (!variedadId) return;
    setVariedadesExcluidas((prev) => {
      const prevPorProd = prev[productoId] || {};
      const actuales = prevPorProd[tipoColorKey] || [];
      if (actuales.includes(variedadId)) return prev;
      return {
        ...prev,
        [productoId]: {
          ...prevPorProd,
          [tipoColorKey]: [...actuales, variedadId]
        }
      };
    });
    setVariedadAExcluir((prev) => ({
      ...prev,
      [productoId]: {
        ...(prev[productoId] || {}),
        [tipoColorKey]: ""
      }
    }));
  };

  // Quitar variedad de la lista de excluidas por producto y tipo-color
  const handleQuitarVariedadExcluida = (productoId: number, tipoColorKey: string, variedadId: string) => {
    setVariedadesExcluidas((prev) => {
      const prevPorProd = prev[productoId] || {};
      return {
        ...prev,
        [productoId]: {
          ...prevPorProd,
          [tipoColorKey]: (prevPorProd[tipoColorKey] || []).filter((v) => v !== variedadId)
        }
      };
    });
  };

  // Eliminar producto de la lista de seleccionados
  const handleRemoveProducto = (productoId: number) => {
    setSelectedProductos((prev) => prev.filter((p) => p.id !== productoId));
    setSubcatPorProducto((prev) => {
      const copy = { ...prev };
      delete copy[productoId];
      return copy;
    });
    // El manejo de productoActivo se realiza en el componente padre
  };

  // Manejar guardar asignación
  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSeleccionado || selectedProductos.length === 0) return;
    onGuardar({
      cliente: clienteSeleccionado,
      productos: selectedProductos.map((prod) => ({
        producto: prod,
        subcategoria: subcatPorProducto[prod.id] || "",
        variedadesExcluidas: variedadesExcluidas[prod.id] || {}, // ahora es por tipo-color
      }))
    });
    setClienteSeleccionado(null);
    setSelectedProductos([]);
    setSubcatPorProducto({});
    setVariedadesExcluidas({});
    setVariedadAExcluir({});
    // El manejo de productoActivo se realiza en el componente padre
  };

  // Cargar subcategorías al montar
  useEffect(() => {
    const fetchSubcats = async () => {
      const { cultivoService } = await import("../../services/cultivoService");
      const subcats = await cultivoService.getSubcategorias();
      setSubcategorias(subcats);
    };
    fetchSubcats();
  }, []);

  return {
    clientes,
    clienteSeleccionado,
    setClienteSeleccionado,
    productos,
    selectedProductos,
    setSelectedProductos,
    subcatPorProducto,
    setSubcatPorProducto,
    variedadesExcluidas,
    setVariedadesExcluidas,
    variedadAExcluir,
    setVariedadAExcluir,
    subcategorias,
    variedades, // ahora es un objeto por productoId
    // productoActivo,
    // setProductoActivo,
    busqueda,
    setBusqueda,
    productoSugerido,
    setProductoSugerido,
    showDropdown,
    setShowDropdown,
    productosFiltrados,
    handleAgregarProducto,
    handleSetProductoActivo,
    handleChangeSubcat,
    handleChangeVariedadAExcluir,
    handleAgregarVariedadExcluida,
    handleQuitarVariedadExcluida,
    handleRemoveProducto,
    handleGuardar,
    florColorSeleccion,
    setFlorColorSeleccion,
    opcionesFlorColor,
    variedadesPorFlor,
    setVariedadesPorFlor,
    recetas // Exponemos las recetas completas
  };
}
