import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
// Componente Box3D para mostrar la caja en 3D (igual que en WizardCaja)
const Box3D: React.FC<{ width: number; height: number; depth: number }> = ({
  width = 10,
  height = 10,
  depth = 10,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf9f9fa);
    const maxDim = Math.max(width, height, depth);
    const cameraDistance = maxDim * 1.2;
    const center = new THREE.Vector3(width / 2, height / 2, depth / 2);
    const camera = new THREE.PerspectiveCamera(60, 260 / 200, 0.1, 1000);
    camera.position.set(
      center.x + cameraDistance,
      center.y + cameraDistance,
      center.z + cameraDistance
    );
    camera.lookAt(center);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(260, 200);
    renderer.domElement.style.maxWidth = "100%";
    renderer.domElement.style.maxHeight = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.objectFit = "contain";
    if (mountRef.current) {
      mountRef.current.innerHTML = "";
      mountRef.current.appendChild(renderer.domElement);
    }
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const boxMaterial = new THREE.MeshLambertMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.7,
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(width / 2, height / 2, depth / 2);
    scene.add(box);
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    line.position.copy(box.position);
    scene.add(line);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(50, 50, 50);
    scene.add(dirLight);
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };
    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      };
      rotation.y += deltaMove.x * 0.01;
      rotation.x += deltaMove.y * 0.01;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };
    if (renderer.domElement) {
      renderer.domElement.addEventListener("mousedown", onMouseDown);
      renderer.domElement.addEventListener("mouseup", onMouseUp);
      renderer.domElement.addEventListener("mouseleave", onMouseUp);
      renderer.domElement.addEventListener("mousemove", onMouseMove);
    }
    let frameId: number;
    const animate = () => {
      box.rotation.x = rotation.x;
      box.rotation.y = rotation.y;
      line.rotation.x = rotation.x;
      line.rotation.y = rotation.y;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frameId);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("mousedown", onMouseDown);
        renderer.domElement.removeEventListener("mouseup", onMouseUp);
        renderer.domElement.removeEventListener("mouseleave", onMouseUp);
        renderer.domElement.removeEventListener("mousemove", onMouseMove);
      }
      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [width, height, depth]);
  return (
    <div
      ref={mountRef}
      style={{
        width: 260,
        height: 200,
        margin: "0 auto",
        cursor: "grab",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
};
import { productoService } from "../../services/productoService";
import { cajaService } from "../../services/cajaService";
import { asignarProductosCajaMultiple } from "../../services/cajaProductoService";

interface Caja {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  volumen: string;
  large?: number;
  wide?: number;
  hide?: number;
}

interface FormCajasProductosProps {
  onGuardar?: (data: any) => void;
  onCancelar?: () => void;
  token?: string; // Token opcional, puedes ajustar según tu auth
}

import { useTranslation } from 'react-i18next';

const FormCajasProductos: React.FC<FormCajasProductosProps> = ({
  onGuardar,
  onCancelar,
  token,
}) => {
  const { t } = useTranslation('cajasproductos');
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [selectedProductos, setSelectedProductos] = useState<any[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cajaSeleccionada, setCajaSeleccionada] = useState<Caja | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await productoService.getAll();
        const activos = Array.isArray(data) ? data.filter((p) => p.estado === 1) : [];
        setProductos(activos);
      } catch (err) {
        setProductos([]);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchCajas = async () => {
      try {
        const data = await cajaService.getAll();
        // Normalizar campos si es necesario
        const cajasNormalizadas = Array.isArray(data)
          ? data.map((c: any) => ({
              id: c.id,
              nombre: c.nombre || c.name || "",
              codigo: c.codigo || c.code || "",
              descripcion: c.descripcion || c.description || "",
              volumen: c.volumen || c.volume || "",
              large: c.large ?? c.largo ?? c.length ?? null,
              wide: c.wide ?? c.ancho ?? c.width ?? null,
              hide: c.hide ?? c.alto ?? c.height ?? null,
            }))
          : [];
        setCajas(cajasNormalizadas);
      } catch (err) {
        setCajas([]);
      }
    };
    fetchCajas();
  }, []);

  // Filtrado normal: excluir productos 'assorted' o 'rainbow'
  const productosFiltrados =
    busqueda.trim().length < 3
      ? productos.filter((p) => {
          // Excluir si alguna flor tiene tipo que empieza con 'assorted' o 'rainbow'
          if (Array.isArray(p.flores) && p.flores.some(f => {
            if (!f.tipo) return false;
            const tipoBase = String(f.tipo).split(' ')[0].toLowerCase();
            return tipoBase === 'assorted' || tipoBase === 'rainbow';
          })) {
            return false;
          }
          return !selectedProductos.some((sp) => sp.id === p.id);
        })
      : productos.filter((p) => {
          if (selectedProductos.some((sp) => sp.id === p.id)) return false;
          if (Array.isArray(p.flores) && p.flores.some(f => {
            if (!f.tipo) return false;
            const tipoBase = String(f.tipo).split(' ')[0].toLowerCase();
            return tipoBase === 'assorted' || tipoBase === 'rainbow';
          })) {
            return false;
          }
          const campo = (p.descripcion || p.nombre || "").toLowerCase();
          return busqueda
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .every((w) => campo.includes(w));
        });
  const handleAgregarProducto = (prod: any) => {
    setSelectedProductos((prev) => [...prev, prod]);
    setBusqueda("");
  };
  const handleRemoveProducto = (id: number) => {
    setSelectedProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cajaSeleccionada || selectedProductos.length === 0 || cantidad < 1) return;
    const payload = {
      caja_id: cajaSeleccionada.id,
      productos: selectedProductos.map((p) => p.id),
      cantidad: cantidad,
    };
    try {
      // Obtener token igual que en los otros formularios
      const authToken = token || localStorage.getItem("authToken") || "";
      const response = await asignarProductosCajaMultiple(payload, authToken);
      setMensaje("¡Guardado exitosamente!");
      // Limpiar campos
      setSelectedProductos([]);
      setCajaSeleccionada(null);
      setCantidad(1);
      setBusqueda("");
      // Opcional: llamar callback externo
      if (onGuardar) onGuardar(response);
      // Ocultar mensaje después de 2.5s
      setTimeout(() => setMensaje(null), 2500);
    } catch (err) {
      console.error("[ERROR POST]", err);
      alert("Error al asignar productos a la caja: " + (err?.message || err));
    }
  };
  return (
    <form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
      {/* Header: Selección de caja */}
      <div className="w-full border border-green-400 rounded-lg bg-white overflow-hidden mb-4">
        <div className="bg-green-50 p-3 sm:p-4 border-b border-green-200">
          <div className="flex flex-row items-center gap-4">
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-left">
              {t('nombreCP')}
            </h4>
            <div className="w-72 max-w-full">
              <select
                className="border border-green-400 rounded px-3 py-2 w-full bg-white text-sm"
                value={cajaSeleccionada?.id || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const caja = cajas.find((c) => c.id === id) || null;
                 
                  setCajaSeleccionada(caja);
                }}
              >
                <option value="">{t('buscarCP')}</option>
                {cajas.map((caja) => (
                  <option key={caja.id} value={caja.id}>
                    {caja.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content: Grid Layout Responsive */}
      <div className="flex-1 p-2 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 h-full">
          {/* Columna 1: Productos a seleccionar */}
          <div className="md:col-span-2 xl:col-span-2 flex flex-col border border-pink-500 rounded-lg bg-white overflow-hidden">
            <div className="bg-pink-50 p-3 sm:p-4 border-b border-pink-200">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-center">
                {t('productosCP')}
              </h4>
              <div className="text-xs text-gray-500 text-center mt-1">
                {productosFiltrados.length} {t('productosCP').toLowerCase()}
              </div>
            </div>
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex flex-col gap-2 items-stretch relative">
                <input
                  type="text"
                  className="border border-pink-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 mb-2"
                  placeholder={t('buscarCP')}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  disabled={!cajaSeleccionada}
                />
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto border border-pink-100 rounded bg-white shadow-sm z-10 relative">
                  {productosFiltrados.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-2">
                      {t('noProductosCP')}
                    </div>
                  )}
                  {productosFiltrados.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between border rounded px-2 py-1 bg-pink-50 hover:bg-pink-100 cursor-pointer"
                      onClick={() => handleAgregarProducto(prod)}
                    >
                      <span className="text-sm text-gray-800">
                        {prod.nombre || prod.descripcion}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2: Lista de productos seleccionados */}
          <div className="flex flex-col border border-pink-500 rounded-lg bg-white overflow-hidden">
            <div className="bg-pink-50 p-3 sm:p-4 border-b border-pink-200">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-center">
                {t('seleccionadosCP')}
              </h4>
              <div className="text-xs text-gray-500 text-center mt-1">
                {selectedProductos.length} {t('productosCP').toLowerCase()} {t('accionesCP').toLowerCase()}
              </div>
            </div>
            <div
              className="flex-1 p-3 sm:p-4 overflow-y-auto"
              style={{ maxHeight: 480, minHeight: 120 }}
            >
              {selectedProductos.length === 0 ? (
                <div className="text-xs text-gray-400 text-center">
                {t('noProductosCP')}
                </div>
              ) : (
                selectedProductos.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between border rounded px-3 py-2 mb-2 bg-white shadow-sm"
                  >
                    <span className="text-[11px] text-gray-800">
                      {prod.nombre || prod.descripcion}
                    </span>
                    <button
                      type="button"
                      className="text-[10px] w-5 h-5 flex items-center justify-center text-white font-semibold p-0 rounded-full leading-none"
                      style={{ background: "#cc3399" }}
                      onClick={() => handleRemoveProducto(prod.id)}
                      title="Quitar"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 3: Visualización de la caja seleccionada */}
          <div className="md:col-span-1 xl:col-span-1 flex flex-col border border-blue-400 rounded-lg bg-white overflow-hidden">
            <div className="bg-blue-50 p-3 sm:p-4 border-b border-blue-200">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#cc3399] text-center">
                {t('equivalenciaCP')}
              </h4>
            </div>
            <div className="flex-1 p-3 sm:p-4 flex flex-col items-center justify-center">
              {!cajaSeleccionada ? (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <span className="text-4xl">🟦</span>
                  <span className="text-sm">{t('buscarCP')}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 w-full">
                  {/* Input de cantidad dentro del gráfico */}
                  <div className="w-full flex flex-row items-center justify-center gap-2 mb-2">
                    <label className="text-sm font-semibold text-[#cc3399]" htmlFor="cantidad-caja">{t('cantidadCP')}:</label>
                    <input
                      id="cantidad-caja"
                      type="number"
                      min={1}
                      className="border border-blue-400 bg-blue-50 rounded px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={cantidad}
                      onChange={e => setCantidad(Number(e.target.value))}
                    />
                  </div>
                  {/* Dibujo de la caja 3D */}
                  <div
                    className="relative flex flex-col items-center mb-2 w-full"
                    style={{ minHeight: 120 }}
                  >
                    {cajaSeleccionada.large &&
                    cajaSeleccionada.wide &&
                    cajaSeleccionada.hide ? (
                      <Box3D
                        width={cajaSeleccionada.large}
                        height={cajaSeleccionada.hide}
                        depth={cajaSeleccionada.wide}
                      />
                    ) : (
                      <div
                        style={{
                          width: 260,
                          height: 200,
                          margin: "0 auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f9f9fa",
                          border: "1px dashed #cc3399",
                          color: "#cc3399",
                          fontWeight: "bold",
                        }}
                      >
                        Sin medidas
                      </div>
                    )}
                    <div className="mt-1 text-xs text-blue-700 font-semibold">
                      {`Largo: ${cajaSeleccionada.large ?? "--"} cm | Alto: ${
                        cajaSeleccionada.hide ?? "--"
                      } cm | Ancho: ${cajaSeleccionada.wide ?? "--"} cm`}
                    </div>
                  </div>
                  <div className="text-base font-semibold text-blue-700">
                    {cajaSeleccionada.nombre}
                  </div>
                  <div className="text-xs text-blue-500">
                    {cajaSeleccionada.codigo}
                  </div>
                  <div className="text-xs text-blue-500">
                    {cajaSeleccionada.descripcion}
                  </div>
                  <div className="text-xs text-blue-500">
                    Volumen: {cajaSeleccionada.volumen}
                  </div>
                </div>
              )}
            </div>
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
            {t('cerrarCP')}
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto hover:bg-pink-600 text-white px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base order-1 sm:order-2"
            style={{ backgroundColor: "#cc3399" }}
            disabled={!cajaSeleccionada || selectedProductos.length === 0}
          >
            {t('agregarCP')}
          </button>
        </div>
        {mensaje && (
          <div className="mt-3 text-center text-sm text-green-600">{mensaje}</div>
        )}
      </div>
    </form>
  );
};

export default FormCajasProductos;
