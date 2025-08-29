import React, { useState } from "react";
import { crearAsignacion } from "../../services/asignacionesService";
import Select from "react-select";
import { useAsignacionFormLogic } from "./useAsignacionFormLogic";
import { Eye } from "lucide-react";
import RecetaModal from "../../components/modals/RecetaModal";
import { useTranslation } from "react-i18next";
interface AsignacionFormProps {
  onGuardar: (asignacion: any) => void;
  onCancelar: () => void;
}

const AsignacionForm: React.FC<AsignacionFormProps> = ({
  onGuardar,
  onCancelar,
}) => {
  // Estado local para productoActivo
  const [productoActivo, setProductoActivo] = React.useState<any | null>(null);
  // Estado para el modal de receta
  const [showRecetaModal, setShowRecetaModal] = React.useState(false);
  const [recetaSeleccionada, setRecetaSeleccionada] = React.useState<any | null>(null);
  const { t } = useTranslation();
  // Al seleccionar un producto, si es Assorted o Rainbow, setear tipo-color automáticamente
  const handleSetProductoActivoCustom = (prod: any) => {
    setProductoActivo(prod);
    if (
      prod &&
      prod.flores &&
      Array.isArray(prod.flores) &&
      prod.flores.length > 0
    ) {
      const tipoBase = prod.flores[0].tipo?.split(" ")[0]?.toLowerCase();
      if (tipoBase === "assorted" || tipoBase === "rainbow") {
        const words =
          typeof prod.flores[0].tipo === "string"
            ? prod.flores[0].tipo.split(" ")
            : [];
        const tipo =
          words.length > 1 ? words.slice(1).join(" ") : words[0] || "";
        const color = prod.flores[0].color || "";
        if (tipo && color) {
          setFlorColorSeleccion((prev) => ({
            ...prev,
            [prod.id]: `${tipo} - ${color}`,
          }));
        }
      }
    }
  };

  const {
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
    variedades,
    busqueda,
    recetas,
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
    florColorSeleccion,
    setFlorColorSeleccion,
    opcionesFlorColor,
    variedadesPorFlor,
    setVariedadesPorFlor,
  } = useAsignacionFormLogic({ onGuardar, onCancelar, productoActivo });

  // --- LOGS DE DEPURACIÓN AL AGREGAR VARIEDAD EXCLUIDA ---
  function handleAgregarVariedadExcluidaConLog(id: any, tipoColor: any) {
    handleAgregarVariedadExcluida(id, tipoColor);
    setTimeout(() => {
      console.log(
        "Variedades excluidas actualizadas:",
        JSON.parse(JSON.stringify(variedadesExcluidas))
      );
    }, 100);
  }

  // Mostrar en consola los productos que trae la API
  React.useEffect(() => {
    if (productos && Array.isArray(productos)) {
      console.log("Productos traídos por la API:", productos);
      // Mostrar tipos de flores de cada producto
    }
  }, [productos]);

  // Determinar si se deben habilitar restricciones para el producto activo
  const restriccionesHabilitadas = React.useMemo(() => {
    if (
      !productoActivo ||
      !productoActivo.flores ||
      !Array.isArray(productoActivo.flores) ||
      productoActivo.flores.length === 0
    )
      return false;
    // Buscar si alguna flor tiene tipo que empiece con 'Rainbow' o 'Assorted' (case-insensitive)
    return productoActivo.flores.some((f) => {
      if (!f.tipo) return false;
      const tipoBase = f.tipo.split(" ")[0]?.toLowerCase();
      return tipoBase === "rainbow" || tipoBase === "assorted";
    });
  }, [productoActivo]);

  // Si restricciones habilitadas y el producto tiene flores, setear subcategoría automáticamente con el tipo de la primera flor
  React.useEffect(() => {
    if (
      restriccionesHabilitadas &&
      productoActivo &&
      productoActivo.flores &&
      Array.isArray(productoActivo.flores) &&
      productoActivo.flores.length > 0
    ) {
      const tipoFlor = productoActivo.flores[0].tipo;
      // Buscar subcategoría que coincida con el tipo de la flor
      const subcat = subcategorias.find((sc) => sc.name === tipoFlor);
      if (subcat && subcatPorProducto[productoActivo.id] !== subcat.id) {
        setSubcatPorProducto((prev) => ({
          ...prev,
          [productoActivo.id]: subcat.id,
        }));
      }
    }
  }, [
    restriccionesHabilitadas,
    productoActivo,
    subcategorias,
    setSubcatPorProducto,
    subcatPorProducto,
  ]);

  // Estado para mensajes de guardado
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Función para construir el objeto de asignación para el POST
  const buildAsignacion = () => {
    const resultado = {
      cliente_id: clienteSeleccionado?.id,
      recetas: selectedProductos.flatMap((prod: any) => {
        const excluidasObj = variedadesExcluidas[prod.id] || {};
        // Si no hay restricciones, igual devolver el tipo base sin excluidas
        const tipoColorKeys = Object.keys(excluidasObj);
        if (tipoColorKeys.length === 0) {
          // Si el producto tiene flores, devolver cada tipo/color aunque no tenga excluidas
          if (prod.flores && Array.isArray(prod.flores)) {
            return prod.flores.map((f: any) => ({
              recetas_id: prod.receta_id,
              tipo: f.tipo,
              variedades_excluidas: [],
            }));
          } else {
            return [
              {
                recetas_id: prod.receta_id,
                tipo:
                  prod.flores && prod.flores[0]?.tipo
                    ? prod.flores[0].tipo
                    : "",
                variedades_excluidas: [],
              },
            ];
          }
        }
        // Para cada tipo/color (key), crear un objeto
        return Object.keys(excluidasObj).map((tipoColorKey) => {
          const excluidasIds = excluidasObj[tipoColorKey] || [];
          // Buscar el nombre de la variedad en todas las fuentes posibles
          const allVariedades = Object.values(variedades).flat();
          const excluidasNombres = excluidasIds.map((vid: string | number) => {
            let v = null;
            // Buscar primero en variedadesPorFlor
            for (const prodId in variedadesPorFlor) {
              const tipoColorObj = variedadesPorFlor[prodId];
              for (const tipoColor in tipoColorObj) {
                v = tipoColorObj[tipoColor].find(
                  (vx: any) => String(vx.id) === String(vid)
                );
                if (v) break;
              }
              if (v) break;
            }
            // Si no lo encuentra, buscar en allVariedades
            if (!v) {
              v = allVariedades.find(
                (vx: any) => String(vx.id) === String(vid)
              );
            }
            return v ? (v as any).name : vid;
          });
          // Guardar el tipo exactamente igual al título amarillo mostrado en la UI
          let tiposCompletos: string[] = [];
          if (prod.flores && Array.isArray(prod.flores)) {
            // Extraer el color del tipoColorKey (después del primer '-')
            let colorKey = tipoColorKey;
            if (tipoColorKey.includes("-")) {
              colorKey = tipoColorKey.split("-").slice(1).join("-").trim();
            }
            // Normalizar para comparar (minúsculas y sin espacios extras)
            const normalize = (str: string) =>
              str.toLowerCase().replace(/\s+/g, " ").trim();
            const colorKeyNorm = normalize(colorKey);
            tiposCompletos = prod.flores
              .filter((f) => {
                if (!f.tipo || !f.color) return false;
                return normalize(f.color) === colorKeyNorm;
              })
              .map((f) => `${f.tipo} - ${f.color}`)
              .filter((v, i, arr) => v && arr.indexOf(v) === i); // únicos
          }
          if (tiposCompletos.length === 0) tiposCompletos = [tipoColorKey];
          return {
            recetas_id: prod.receta_id,
            tipo: tiposCompletos.join(" / "),
            variedades_excluidas: excluidasNombres,
          };
        });
      }),
    };
   
    return resultado;
  };

  // Al enviar el formulario, guardar usando la API y mostrar mensaje
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    if (!clienteSeleccionado || selectedProductos.length === 0) {
      setMensaje("Debes seleccionar un cliente y al menos un producto.");
      return;
    }
    setGuardando(true);
    try {
      const asignacion = buildAsignacion();
      await crearAsignacion(asignacion);
      setMensaje("¡Guardado con éxito!");
      // Limpiar el formulario para seguir creando restricciones
      setSelectedProductos([]);
      setProductoActivo(null);
      setVariedadesExcluidas({});
      setVariedadAExcluir({});
      setFlorColorSeleccion({});
      setSubcatPorProducto({});
      setClienteSeleccionado(null);
      // No llamar a onGuardar ni cambiar de vista
    } catch (error) {
      setMensaje("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="w-full border border-green-400 rounded-lg bg-white overflow-hidden mb-4">
        <div className="bg-green-50 p-3 sm:p-4 border-b border-green-200">
          <div className="flex flex-row items-center gap-4">
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-left">
              {t("cliente")}
            </h4>
            <div className="w-72 max-w-full">
              <Select
                options={
                  Array.isArray(clientes)
                    ? clientes.map((c) => ({
                        value: c.id,
                        label: c.NombreCliente || c.nombre || c.razonSocial,
                      }))
                    : []
                }
                value={
                  Array.isArray(clientes) &&
                  clienteSeleccionado &&
                  clientes.find((c) => c.id === clienteSeleccionado?.id)
                    ? {
                        value: clienteSeleccionado.id,
                        label:
                          clienteSeleccionado.NombreCliente ||
                          clienteSeleccionado.nombre ||
                          clienteSeleccionado.razonSocial,
                      }
                    : null
                }
                onChange={(option) =>
                  setClienteSeleccionado(
                    option && Array.isArray(clientes)
                      ? clientes.find((c) => c.id === option.value)
                      : null
                  )
                }
                placeholder={t("seleccionaCliente")}
                isClearable
                isSearchable
                classNamePrefix="react-select"
                menuPortalTarget={
                  typeof window !== "undefined"
                    ? window.document.body
                    : undefined
                }
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({
                    ...base,
                    minHeight: "40px",
                    borderColor: "#22c55e",
                    boxShadow: "none",
                    background: "#fff",
                    fontSize: "14px",
                  }),
                  menu: (base) => ({ ...base, fontSize: "14px" }),
                  option: (base) => ({ ...base, fontSize: "14px" }),
                }}
              />
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4 flex-1 hidden">
          {/* Info del cliente seleccionado en móviles */}
          {clienteSeleccionado && (
            <div className="mt-3 p-2 bg-green-50 rounded text-xs sm:text-sm">
              <div className="font-medium text-green-800">
                Cliente seleccionado:
              </div>
              <div className="text-green-700">
                {clienteSeleccionado.NombreCliente ||
                  clienteSeleccionado.nombre ||
                  clienteSeleccionado.razonSocial}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Content */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        {/* Grid Layout Responsive */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 h-full">
            {/* Columna 1: Cliente */}

            {/* Columna 2: Productos */}
            {/* Columna 1: Productos a seleccionar */}
            <div className="md:col-span-2 xl:col-span-2 flex flex-col border border-pink-500 rounded-lg bg-white overflow-hidden">
              <div className="bg-pink-50 p-3 sm:p-4 border-b border-pink-200">
                <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-center">
                  {t("productos")}
                </h4>
                <div className="text-xs text-gray-500 text-center mt-1">
                  {productos.length} {t("productosDisponibles")}
                </div>
              </div>
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="flex flex-col gap-2 items-stretch relative">
                  {/* Buscador arriba personalizado */}
                  <input
                    type="text"
                    className="border border-pink-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 mb-2"
                    placeholder={t("buscar")}
                    value={busqueda || ""}
                    onChange={(e) => setBusqueda(e.target.value)}
                    disabled={!clienteSeleccionado}
                  />
                  {/* Lista de productos con scroll */}
                  <div
                    className="mt-2 border rounded-lg overflow-y-auto"
                    style={{ maxHeight: 220 }}
                  >
                    {productosFiltrados.length === 0 ? (
                      <div className="text-gray-400 text-center text-sm p-2">
                        No hay productos
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {productosFiltrados.map((p) => (
                          <li
                            key={p.id}
                            className="p-2 hover:bg-pink-50 flex items-center justify-between gap-2"
                          >
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                if (clienteSeleccionado) {
                                  handleAgregarProducto(p);
                                }
                              }}
                            >
                              <div className="truncate text-xs sm:text-sm font-medium">
                                {p.descripcion || p.nombre}
                              </div>
                              {p.paquete_material && (
                                <div className="text-xs text-pink-600 font-medium">
                                  Paquete: {p.paquete_material.nombre}
                                </div>
                              )}
                            </div>
                            <button 
                              className="flex-shrink-0 p-1 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecetaSeleccionada(p.receta_completa);
                                setShowRecetaModal(true);
                              }}
                              title="Ver receta"
                            >
                              <Eye size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: Lista de productos seleccionados */}
            <div className="flex flex-col border border-pink-500 rounded-lg bg-white overflow-hidden">
              <div className="bg-pink-50 p-3 sm:p-4 border-b border-pink-200">
                <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-center">
                  {t("seleccionados")}
                </h4>
                <div className="text-xs text-gray-500 text-center mt-1">
                  {selectedProductos.length} {t("seleccionados")}
                </div>
              </div>
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto" style={{ maxHeight: 320, minHeight: 120 }}>
                
                {selectedProductos.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-center text-sm">
                    <div>
                      <div className="text-2xl sm:text-3xl mb-2">📦</div>
                      <div>{t("no_productos")}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                {/* Ordenar: Assorted/Rainbow primero */}
                {(() => {
                  const isAssortedOrRainbow = (prod) => {
                    if (!prod.flores || !Array.isArray(prod.flores) || prod.flores.length === 0) return false;
                    const tipoBase = prod.flores[0].tipo?.split(" ")[0]?.toLowerCase();
                    return tipoBase === "assorted" || tipoBase === "rainbow";
                  };
                  const sorted = [...selectedProductos].sort((a, b) => {
                    const aIs = isAssortedOrRainbow(a);
                    const bIs = isAssortedOrRainbow(b);
                    if (aIs === bIs) return 0;
                    return aIs ? -1 : 1;
                  });
                  return sorted.map((prod) => {
                    const assortedOrRainbow = isAssortedOrRainbow(prod);
                    return (
                      <div
                        key={prod.id}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          productoActivo?.id === prod.id
                            ? assortedOrRainbow
                              ? "border-orange-400 bg-orange-200/80 shadow-sm text-orange-900"
                              : "border-pink-500 bg-pink-50 shadow-sm"
                            : assortedOrRainbow
                              ? "border-orange-400 bg-orange-200/80 text-orange-900 hover:border-orange-500"
                              : "border-gray-200 hover:border-pink-300"
                        }`}
                        onClick={() => handleSetProductoActivoCustom(prod)}
                        style={assortedOrRainbow ? { backgroundColor: 'rgba(255, 165, 0, 0.25)', color: '#b45309', borderColor: '#fb923c' } : {}}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className={`text-left font-normal text-xs ${assortedOrRainbow ? 'text-orange-900' : 'text-gray-800'}`}>
                              {prod.descripcion || prod.nombre}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <button
                              type="button"
                              className={`text-white hover:text-red-700 hover:bg-red-50 w-12 h-4 sm:w-2 sm:h-4 rounded-full flex items-center justify-center transition-colors text-sm ${assortedOrRainbow ? '' : ''}`}
                              style={{ backgroundColor: "#cc3399" }}
                              title="Eliminar producto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProducto(prod.id);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
                  </div>
                )}
              </div>
            </div>
            {/* Columna 3: Subcategoría y Variedad */}
            <div className="md:col-span-1 xl:col-span-1 flex flex-col border border-blue-400 rounded-lg bg-white overflow-hidden">
              <div className="bg-blue-50 p-3 sm:p-4 border-b border-blue-200">
                <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-center">
                  {t("restricciones")}
                </h4>
              </div>

              <div className="flex-1 p-3 sm:p-4">
                {!productoActivo ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-center text-sm">
                    <div>
                      <div className="text-2xl sm:text-3xl mb-2">👆</div>
                      <div>{t("selecciona_producto")}</div>
                    </div>
                  </div>
                ) : restriccionesHabilitadas ? (
                  <div className="space-y-4">
                    {/* Info del producto activo */}
                    <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white p-2 sm:p-3 rounded-lg">
                      <div className="font-semibold text-xs sm:text-sm truncate">
                        {productoActivo.nombreProducto || productoActivo.nombre}
                      </div>
                      <div className="text-xs opacity-90">
                        ({productoActivo.categoria})
                      </div>
                    </div>
                    {/* Controles */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tipo y color de flor:
                        </label>
                        <Select
                          options={opcionesFlorColor.map((opt) => {
                            let labelCompleto = opt.value;
                            // Buscar en las flores del producto activo si hay coincidencia para mostrar el tipo completo
                            if (
                              productoActivo &&
                              productoActivo.flores &&
                              Array.isArray(productoActivo.flores)
                            ) {
                              // El value suele ser 'Spray Roses - White', buscamos coincidencia en flores
                              const normalize = (str) =>
                                str.toLowerCase().replace(/\s+/g, " ").trim();
                              let colorKey = opt.value;
                              if (colorKey.includes("-"))
                                colorKey = colorKey
                                  .split("-")
                                  .slice(1)
                                  .join("-")
                                  .trim();
                              const colorKeyNorm = normalize(colorKey);
                              const tiposCompletos = productoActivo.flores
                                .filter(
                                  (f) =>
                                    f.tipo &&
                                    f.color &&
                                    normalize(f.tipo + " - " + f.color) ===
                                      normalize(opt.value)
                                )
                                .map((f) => `${f.tipo} - ${f.color}`);
                              // Si no hay coincidencia exacta, buscar por color
                              let tiposPorColor = [];
                              if (tiposCompletos.length === 0) {
                                tiposPorColor = productoActivo.flores
                                  .filter(
                                    (f) =>
                                      f.color &&
                                      normalize(f.color) === colorKeyNorm
                                  )
                                  .map((f) => `${f.tipo} - ${f.color}`)
                                  .filter(
                                    (v, i, arr) => v && arr.indexOf(v) === i
                                  );
                              }
                              if (tiposCompletos.length > 0)
                                labelCompleto = tiposCompletos.join(" / ");
                              else if (tiposPorColor.length > 0)
                                labelCompleto = tiposPorColor.join(" / ");
                              else labelCompleto = opt.value;
                            } else {
                              labelCompleto = opt.value;
                            }
                            return { ...opt, label: labelCompleto };
                          })}
                          value={(() => {
                            const val = florColorSeleccion[productoActivo.id];
                            if (!val) return null;
                            let labelCompleto = val;
                            if (
                              productoActivo &&
                              productoActivo.flores &&
                              Array.isArray(productoActivo.flores)
                            ) {
                              const normalize = (str) =>
                                str.toLowerCase().replace(/\s+/g, " ").trim();
                              let colorKey = val;
                              if (colorKey.includes("-"))
                                colorKey = colorKey
                                  .split("-")
                                  .slice(1)
                                  .join("-")
                                  .trim();
                              const colorKeyNorm = normalize(colorKey);
                              const tiposCompletos = productoActivo.flores
                                .filter(
                                  (f) =>
                                    f.tipo &&
                                    f.color &&
                                    normalize(f.tipo + " - " + f.color) ===
                                      normalize(val)
                                )
                                .map((f) => `${f.tipo} - ${f.color}`);
                              let tiposPorColor = [];
                              if (tiposCompletos.length === 0) {
                                tiposPorColor = productoActivo.flores
                                  .filter(
                                    (f) =>
                                      f.color &&
                                      normalize(f.color) === colorKeyNorm
                                  )
                                  .map((f) => `${f.tipo} - ${f.color}`)
                                  .filter(
                                    (v, i, arr) => v && arr.indexOf(v) === i
                                  );
                              }
                              if (tiposCompletos.length > 0)
                                labelCompleto = tiposCompletos.join(" / ");
                              else if (tiposPorColor.length > 0)
                                labelCompleto = tiposPorColor.join(" / ");
                              else labelCompleto = val;
                            }
                            return { value: val, label: labelCompleto };
                          })()}
                          onChange={(option) =>
                            setFlorColorSeleccion((prev) => ({
                              ...prev,
                              [productoActivo.id]:
                                typeof option?.value === "string"
                                  ? option.value
                                  : "",
                            }))
                          }
                          placeholder="Selecciona tipo y color de flor..."
                          isClearable
                          isSearchable
                          isDisabled={!clienteSeleccionado}
                          classNamePrefix="react-select"
                          menuPortalTarget={
                            typeof window !== "undefined"
                              ? window.document.body
                              : undefined
                          }
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({
                              ...base,
                              minHeight: "36px",
                              borderColor: "#3b82f6",
                              boxShadow: "none",
                              background: "#fff",
                              fontSize: "12px",
                            }),
                            menu: (base) => ({ ...base, fontSize: "12px" }),
                            option: (base) => ({ ...base, fontSize: "12px" }),
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Variedad a excluir:
                        </label>
                        {florColorSeleccion[productoActivo.id] ? (
                          <Select
                            options={(
                              variedadesPorFlor[productoActivo.id]?.[
                                florColorSeleccion[productoActivo.id]
                              ] || []
                            )
                              .filter(
                                (v) =>
                                  !(
                                    variedadesExcluidas[productoActivo.id]?.[
                                      florColorSeleccion[productoActivo.id]
                                    ] || []
                                  ).includes(v.id)
                              )
                              .map((v) => ({ value: v.id, label: v.name }))}
                            value={(() => {
                              const vId =
                                variedadAExcluir[productoActivo.id]?.[
                                  florColorSeleccion[productoActivo.id]
                                ] || "";
                              const v = (
                                variedadesPorFlor[productoActivo.id]?.[
                                  florColorSeleccion[productoActivo.id]
                                ] || []
                              ).find((vx) => vx.id === vId);
                              return v ? { value: v.id, label: v.name } : null;
                            })()}
                            onChange={(option) =>
                              handleChangeVariedadAExcluir(
                                productoActivo.id,
                                florColorSeleccion[productoActivo.id],
                                option ? option.value : ""
                              )
                            }
                            placeholder="Variedad a excluir..."
                            isClearable
                            isSearchable
                            isDisabled={!clienteSeleccionado}
                            classNamePrefix="react-select"
                            menuPortalTarget={
                              typeof window !== "undefined"
                                ? window.document.body
                                : undefined
                            }
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                              control: (base) => ({
                                ...base,
                                minHeight: "36px",
                                borderColor: "#3b82f6",
                                boxShadow: "none",
                                background: "#fff",
                                fontSize: "12px",
                              }),
                              menu: (base) => ({ ...base, fontSize: "12px" }),
                              option: (base) => ({ ...base, fontSize: "12px" }),
                            }}
                          />
                        ) : (
                          <div className="text-xs text-gray-400">
                            Selecciona tipo y color de flor
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="w-full bg-[#cc3399] hover:bg-pink-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm"
                        style={{ backgroundColor: "#cc3399" }}
                        onClick={() =>
                          handleAgregarVariedadExcluidaConLog(
                            productoActivo.id,
                            florColorSeleccion[productoActivo.id]
                          )
                        }
                        disabled={
                          !florColorSeleccion[productoActivo.id] ||
                          !variedadAExcluir[productoActivo.id]?.[
                            florColorSeleccion[productoActivo.id]
                          ] ||
                          !clienteSeleccionado
                        }
                      >
                        Agregar a NO permitidas
                      </button>
                    </div>
                    {subcatPorProducto[productoActivo.id] &&
                      !variedades[subcatPorProducto[productoActivo.id]] && (
                        <div className="text-center text-gray-500 text-xs">
                          Cargando variedades...
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-center text-sm">
                    <div>
                      <div className="text-2xl sm:text-3xl mb-2">🔒</div>
                      <div>{t("aplica_restricciones")}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fin grid de columnas principales */}
          </div>
        </div>

        {/* Bloque horizontal de Variedades NO permitidas */}
        <div className="w-full border border-yellow-400 rounded-lg bg-white overflow-hidden mb-4 mt-2">
          <div className="bg-yellow-50 border-b border-yellow-200 px-0 py-0">
            <div className="flex items-center px-4 py-3 border-b border-yellow-200">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-left w-full">
                {t("lista_restricciones")}
              </h4>
            </div>
            <div className="flex flex-col gap-0 px-0 py-0">
              {(() => {
                if (!productoActivo) {
                  return (
                    <div className="flex items-center text-gray-400 text-sm w-full justify-center py-4">
                      <span className="text-2xl sm:text-3xl mr-2">🚫</span>
                      <span>{t("selecciona_producto")}</span>
                    </div>
                  );
                }
                const excluidasPorTipoColor =
                  variedadesExcluidas[productoActivo.id] || {};
                const tipoColorKeys = Object.keys(excluidasPorTipoColor);
                if (tipoColorKeys.length === 0) {
                  return (
                    <div className="text-gray-400 text-sm w-full text-center py-4">
                      No hay variedades excluidas
                    </div>
                  );
                }
                return tipoColorKeys.map((tipoColorKey) => {
                  const listaIds = excluidasPorTipoColor[tipoColorKey] || [];
                  if (listaIds.length === 0) return null;
                  // Buscar todos los tipos completos de flor que correspondan a este tipoColorKey
                  let tiposCompletos: string[] = [];
                  if (
                    productoActivo &&
                    productoActivo.flores &&
                    Array.isArray(productoActivo.flores)
                  ) {
                    let colorKey = tipoColorKey;
                    if (tipoColorKey.includes("-")) {
                      colorKey = tipoColorKey
                        .split("-")
                        .slice(1)
                        .join("-")
                        .trim();
                    }
                    const normalize = (str: string) =>
                      str.toLowerCase().replace(/\s+/g, " ").trim();
                    const colorKeyNorm = normalize(colorKey);
                    tiposCompletos = productoActivo.flores
                      .filter((f) => {
                        if (!f.tipo || !f.color) return false;
                        return normalize(f.color) === colorKeyNorm;
                      })
                      .map((f) => `${f.tipo} - ${f.color}`)
                      .filter((v, i, arr) => v && arr.indexOf(v) === i);
                  }
                  if (tiposCompletos.length === 0)
                    tiposCompletos = [tipoColorKey];
                  return (
                    <div
                      key={tipoColorKey}
                      className="flex flex-row items-center gap-2 w-full border-b border-yellow-100 last:border-b-0 px-4 py-2 overflow-x-auto"
                    >
                      <div className="font-semibold text-xs sm:text-sm text-yellow-700 min-w-[180px] md:min-w-[220px] flex items-center justify-start">
                        {tiposCompletos.join(" / ")}
                      </div>
                      <div className="flex flex-row gap-2 flex-1 overflow-x-auto">
                        {listaIds.map((vid) => {
                          const variedadesFlor =
                            variedadesPorFlor[productoActivo.id]?.[
                              tipoColorKey
                            ] || [];
                          const v =
                            variedadesFlor.find((vx) => vx.id === vid) ||
                            (variedades[productoActivo.id] || []).find(
                              (vx) => vx.id === vid
                            );
                          return v ? (
                            <div
                              key={vid}
                              className="relative bg-pink-100 text-pink-800 px-2 sm:px-3 py-1 rounded-lg flex items-center min-w-[80px]"
                            >
                              <span className="text-xs sm:text-sm font-medium truncate flex-1 pr-4">
                                {v.name}
                              </span>
                              <button
                                type="button"
                                className="absolute top-0 right-0 text-pink-700 hover:text-pink-900 text-xs px-1 py-0 m-0 bg-transparent border-none shadow-none"
                                style={{
                                  background: "none",
                                  border: "none",
                                  fontSize: "12px",
                                  lineHeight: "1",
                                  cursor: "pointer",
                                }}
                                title="Quitar"
                                onClick={() =>
                                  handleQuitarVariedadExcluida(
                                    productoActivo.id,
                                    tipoColorKey,
                                    vid
                                  )
                                }
                              >
                                ×
                              </button>
                            </div>
                          ) : // ...existing code...
                          null;
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
        {/* Footer responsivo */}
        <div className="border-t border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              className="w-full sm:w-auto hover:bg-gray-600 text-white px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base order-2 sm:order-1"
              style={{ backgroundColor: "#cc3399" }}
              onClick={onCancelar}
            >
              {t("cancelar")}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto hover:bg-pink-600 text-white px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base order-1 sm:order-2"
              style={{ backgroundColor: "#cc3399" }}
              disabled={
                !clienteSeleccionado ||
                selectedProductos.length === 0 ||
                guardando
              }
            >
              {guardando ? "Guardando..." : t("guardar")}
            </button>
          </div>
          {/* Mensaje de guardado */}
          {mensaje && (
            <div
              className={`mt-3 text-center text-sm ${
                mensaje.includes("éxito") ? "text-green-600" : "text-red-500"
              }`}
            >
              {mensaje}
            </div>
          )}
          {/* Estado de validación en móvil */}
          <div className="mt-3 sm:hidden">
            {!clienteSeleccionado && (
              <div className="text-xs text-red-500 text-center">
                ⚠️ Selecciona un cliente para continuar
              </div>
            )}
            {clienteSeleccionado && selectedProductos.length === 0 && (
              <div className="text-xs text-orange-500 text-center">
                ⚠️ Agrega al menos un producto
              </div>
            )}
            {clienteSeleccionado && selectedProductos.length > 0 && (
              <div className="text-xs text-green-500 text-center">
                ✅ Listo para guardar ({selectedProductos.length} productos)
              </div>
            )}
          </div>
        </div>
      </form>
      
      {/* Modal para ver receta completa */}
      {showRecetaModal && recetaSeleccionada && (
        <RecetaModal 
          receta={recetaSeleccionada}
          onClose={() => setShowRecetaModal(false)}
        />
      )}
    </>
  );
};

export default AsignacionForm;
