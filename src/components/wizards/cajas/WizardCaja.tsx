// Hook para detectar si es móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}
import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { cajaService } from "../../../services/cajaService";
import type { Caja } from "../../../types/caja";
import type { CajaFormRefs } from "../../../hooks/useCajaFormRefs";
import SuccessModal from "../../modals/SuccessModal";
import * as THREE from 'three';
import { useTranslation } from "react-i18next";

interface WizardCajaProps {
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  refs: CajaFormRefs;
  onCreated: () => void;
  editCaja?: Caja | null;
  onClose: () => void;
  hideCloseButton?: boolean;
  tableHeight?: number;
}

const WizardCaja: React.FC<WizardCajaProps> = ({
  showWizard,
  setShowWizard,
  refs,
  onCreated,
  editCaja,
  onClose,
  hideCloseButton = false,
  tableHeight,
}) => {
  const [cajas, setCajas] = useState<any[]>([]);
  useEffect(() => {
    async function fetchCajas() {
      try {
        const resp = await cajaService.getAll();
        setCajas(Array.isArray(resp) ? resp : []);
      } catch {}
    }
    if (showWizard) fetchCajas();
  }, [showWizard]);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [statusValue, setStatusValue] = useState("true");

  // Estados para dibujo de la caja
  const [drawLarge, setDrawLarge] = useState(0);
  const [drawWide, setDrawWide] = useState(0);
  const [drawHide, setDrawHide] = useState(0);

  // Función para limpiar el formulario y el estado de edición
  const resetForm = () => {
    if (refs.name.current) refs.name.current.value = "";
    if (refs.large.current) refs.large.current.value = "";
    if (refs.wide.current) refs.wide.current.value = "";
    if (refs.hide.current) refs.hide.current.value = "";
    if (refs.equivalent.current) refs.equivalent.current.value = "";
    if (refs.weight.current) refs.weight.current.value = "";
    setStatusValue("true");
    setError("");
  };

  useEffect(() => {
    if (showWizard && editCaja) {
      // Llenar el formulario con los datos de la caja a editar
      if (refs.name.current) refs.name.current.value = editCaja.name;
      if (refs.large.current) refs.large.current.value = editCaja.large.toString();
      if (refs.wide.current) refs.wide.current.value = editCaja.wide.toString();
      if (refs.hide.current) refs.hide.current.value = editCaja.hide.toString();
      if (refs.equivalent.current) refs.equivalent.current.value = editCaja.equivalent.toString();
      if (refs.weight.current) refs.weight.current.value = editCaja.weight.toString();
      setStatusValue(editCaja.status ? "true" : "false");
      // Actualizar dibujo 3D inmediatamente
      setDrawLarge(editCaja.large > 0 ? editCaja.large : 0);
      setDrawWide(editCaja.wide > 0 ? editCaja.wide : 0);
      setDrawHide(editCaja.hide > 0 ? editCaja.hide : 0);
    } else if (showWizard) {
      // Limpiar el formulario para nueva caja
      resetForm();
      setDrawLarge(0);
      setDrawWide(0);
      setDrawHide(0);
    }
  }, [showWizard, editCaja, refs]);

  // Llamar resetForm al cancelar (solo limpia, no cierra wizard)
  const handleCancel = () => {
    resetForm();
    // No cerrar el wizard, solo limpiar edición
    // Si hay edición, quitarla
    if (editCaja) {
      onCreated(); // Esto refresca la lista y quita edición en CajasPage
    }
  };

  // Cerrar el wizard (solo con X o overlay)
  const handleClose = () => {
    resetForm();
    setShowWizard(false);
    if (onClose) onClose();
  };

  // Función para calcular el peso volumétrico
  const calculateVolumetricWeight = (largo: number, ancho: number, alto: number): string => {
    if (largo <= 0 || ancho <= 0 || alto <= 0) return "";
    
    // Fórmula para calcular el peso volumétrico: (largo * ancho * alto) / 5000
    // Esto es una fórmula estándar en logística, donde 5000 es el factor de conversión
    const volumeWeight = (largo * ancho * alto) / 6000;
    
    // Formatear con 3 decimales
    return volumeWeight.toFixed(3);
  };

  // Actualizar medidas para el dibujo en tiempo real y calcular peso volumétrico
  useEffect(() => {
    const handle = () => {
      const l = parseFloat(refs.large.current?.value || "");
      const w = parseFloat(refs.wide.current?.value || "");
      const h = parseFloat(refs.hide.current?.value || "");
      
      // Actualizar dimensiones para el dibujo 3D
      setDrawLarge(l > 0 ? l : 0);
      setDrawWide(w > 0 ? w : 0);
      setDrawHide(h > 0 ? h : 0);
      
      // Calcular y actualizar el peso volumétrico solo si las tres dimensiones tienen valores válidos
      if (l > 0 && w > 0 && h > 0 && refs.weight.current) {
        // Solo actualizar si el campo no está siendo editado actualmente
        if (document.activeElement !== refs.weight.current) {
          const calculatedWeight = calculateVolumetricWeight(l, w, h);
          refs.weight.current.value = calculatedWeight;
          
          // Añadir un indicador visual para mostrar que se ha calculado
          refs.weight.current.classList.add('bg-blue-50');
          setTimeout(() => {
            if (refs.weight.current) {
              refs.weight.current.classList.remove('bg-blue-50');
            }
          }, 500);
        }
      }
    };
    
    // Listeners para inputs
    const largeInput = refs.large.current;
    const wideInput = refs.wide.current;
    const hideInput = refs.hide.current;
    
    if (largeInput) largeInput.addEventListener('input', handle);
    if (wideInput) wideInput.addEventListener('input', handle);
    if (hideInput) hideInput.addEventListener('input', handle);
    
    // Inicial
    handle();
    
    return () => {
      if (largeInput) largeInput.removeEventListener('input', handle);
      if (wideInput) wideInput.removeEventListener('input', handle);
      if (hideInput) hideInput.removeEventListener('input', handle);
    };
  }, [showWizard, refs.large, refs.wide, refs.hide, refs.weight]);

  // Validación por campo para mostrar mensajes debajo de cada input
  const getFieldErrors = () => {
    const name = refs.name.current?.value?.trim() || "";
    let nameError = "";
    if (!name) nameError = t("required");
    else if (!/^[A-Za-z0-9]{3}$/.test(name)) nameError = t("invalidNameFormat");
    else if (!editCaja && cajas.some(c => c.name?.toUpperCase() === name.toUpperCase())) nameError = t("nameExists");
    return {
      name: nameError,
      large: !(refs.large.current?.value?.trim()) ? t("required") : "",
      wide: !(refs.wide.current?.value?.trim()) ? t("required") : "",
      hide: !(refs.hide.current?.value?.trim()) ? t("required") : "",
      equivalent: !(refs.equivalent.current?.value?.trim()) ? t("required") : "",
      weight: !(refs.weight.current?.value?.trim()) ? t("required") : "",
    };
  };

  const validateForm = () => {
    const errors: string[] = [];
    const fieldErrors = getFieldErrors();
    if (Object.values(fieldErrors).some(e => e)) setShowFieldErrors(true);

    // Validar name (3 dígitos y único)
    const name = refs.name.current?.value?.trim() || "";
    if (!name) {
      errors.push("El nombre es requerido");
    } else if (!/^[A-Za-z0-9]{3}$/.test(name)) {
      errors.push("El nombre debe tener exactamente 3 caracteres alfanuméricos");
    } else if (!editCaja && cajas.some(c => c.name?.toUpperCase() === name.toUpperCase())) {
      errors.push("El nombre ya existe");
    }

    // Validar large (2 decimales)
    const large = parseFloat(refs.large.current?.value || "0");
    if (isNaN(large) || large <= 0) {
      errors.push("El largo debe ser un número mayor a 0");
    } else if (!/^\d+(\.\d{1,2})?$/.test(refs.large.current?.value || "")) {
      errors.push("El largo debe tener máximo 2 decimales");
    }

    // Validar wide (2 decimales)
    const wide = parseFloat(refs.wide.current?.value || "0");
    if (isNaN(wide) || wide <= 0) {
      errors.push("El ancho debe ser un número mayor a 0");
    } else if (!/^\d+(\.\d{1,2})?$/.test(refs.wide.current?.value || "")) {
      errors.push("El ancho debe tener máximo 2 decimales");
    }

    // Validar hide (2 decimales)
    const hide = parseFloat(refs.hide.current?.value || "0");
    if (isNaN(hide) || hide <= 0) {
      errors.push("La altura debe ser un número mayor a 0");
    } else if (!/^\d+(\.\d{1,2})?$/.test(refs.hide.current?.value || "")) {
      errors.push("La altura debe tener máximo 2 decimales");
    }

    // Validar equivalent (3 decimales)
    const equivalent = parseFloat(refs.equivalent.current?.value || "0");
    if (isNaN(equivalent) || equivalent <= 0) {
      errors.push("El equivalente debe ser un número mayor a 0");
    } else if (!/^\d+(\.\d{1,3})?$/.test(refs.equivalent.current?.value || "")) {
      errors.push("El equivalente debe tener máximo 3 decimales");
    }

    // Validar weight (3 decimales)
    const weight = parseFloat(refs.weight.current?.value || "0");
    if (isNaN(weight) || weight <= 0) {
      errors.push("El peso debe ser un número mayor a 0");
    } else if (!/^\d+(\.\d{1,3})?$/.test(refs.weight.current?.value || "")) {
      errors.push("El peso debe tener máximo 3 decimales");
    }

    return errors;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(". "));
        return;
      }
      const cajaData = {
        name: refs.name.current?.value?.trim().toUpperCase() || "",
        large: parseFloat(refs.large.current?.value || "0"),
        wide: parseFloat(refs.wide.current?.value || "0"),
        hide: parseFloat(refs.hide.current?.value || "0"),
        equivalent: parseFloat(refs.equivalent.current?.value || "0"),
        weight: parseFloat(refs.weight.current?.value || "0"),
        status: statusValue === "true",
      };
      if (editCaja) {
        await cajaService.update(editCaja.id, cajaData);
      } else {
        await cajaService.create(cajaData);
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        onCreated();
        resetForm(); // Limpiar después de guardar
        setShowWizard(false);
      }, 1500);
    } catch (error: any) {
      console.error("Error al guardar caja:", error);
      setError(error.message || "Error al guardar la caja");
    } finally {
      setLoading(false);
    }
  };

  // Componente para la caja 3D
  const Box3D = ({ width = 10, height = 10, depth = 10 }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf9f9fa);
      // Calcular el centro y la distancia óptima de la cámara (más cerca)
      const maxDim = Math.max(width, height, depth);
      const cameraDistance = maxDim * 1.2;
      const center = new THREE.Vector3(width / 2, height / 2, depth / 2);
      const camera = new THREE.PerspectiveCamera(60, 260 / 200, 0.1, 1000);
      camera.position.set(center.x + cameraDistance, center.y + cameraDistance, center.z + cameraDistance);
      camera.lookAt(center);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(260, 200);
      renderer.domElement.style.maxWidth = '100%';
      renderer.domElement.style.maxHeight = '100%';
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.objectFit = 'contain';
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
        mountRef.current.appendChild(renderer.domElement);
      }
      const boxGeometry = new THREE.BoxGeometry(width, height, depth);
      const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.7 });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.set(width / 2, height / 2, depth / 2);
      scene.add(box);
      // Quitar las líneas internas: solo mostrar el contorno exterior
      const edges = new THREE.EdgesGeometry(boxGeometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
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
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
        renderer.domElement.addEventListener('mouseleave', onMouseUp);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
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
          renderer.domElement.removeEventListener('mousedown', onMouseDown);
          renderer.domElement.removeEventListener('mouseup', onMouseUp);
          renderer.domElement.removeEventListener('mouseleave', onMouseUp);
          renderer.domElement.removeEventListener('mousemove', onMouseMove);
        }
        if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    }, [width, height, depth]);
    return (
      <div ref={mountRef} style={{ width: 260, height: 200, margin: '0 auto', cursor: 'grab', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
    );
  };


  // Detectar si es móvil
  const isMobile = useIsMobile();

  if (!showWizard) return null;

  return (
    <>
      {/* Overlay para pantallas pequeñas */}
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
        onClick={handleClose}
      ></div>
      {/* Wizard Panel */}
      <div
        className={`
          fixed md:relative inset-0 md:inset-auto z-50 md:z-0
          bg-white rounded-lg shadow-md 
          m-4 md:m-0 p-4 md:w-96
          max-h-[95vh] md:max-h-[85vh] overflow-y-auto
        `}
        style={
          !isMobile && typeof tableHeight === 'number'
            ? { height: tableHeight, maxHeight: tableHeight, minHeight: tableHeight }
            : { maxHeight: '85vh' }
        }
      >
        <div className="flex items-center mb-2">
          <h3 className="text-2xl font-bold text-gray-800 flex-1 text-center">
            {editCaja ? t("editTitleC") : t("formTitleC")}
          </h3>
          {/* Solo mostrar el botón de cerrar (X) en modo móvil */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                style={{
                  background: "#cc3399",
                  color: "#fff",
                }}
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        {/* Switch de estado debajo del título, alineado a la izquierda */}
        <div className="flex items-center gap-3 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("status")} *
          </label>
          <button
            type="button"
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none border border-[#cc3399]`}
            style={{
              background: statusValue === 'true' ? '#cc3399' : '#fff',
            }}
            onClick={() => {
              setStatusValue(statusValue === 'true' ? 'false' : 'true');
            }}
            disabled={loading}
            aria-pressed={statusValue === 'true'}
          >
            <span
              className={`absolute left-1 top-1 w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${statusValue === 'true' ? 'translate-x-5' : ''}`}
              style={{
                background: statusValue === 'true' ? '#fff' : '#cc3399',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
              }}
            ></span>
          </button>
          <span className="text-sm text-gray-700 select-none">
            {statusValue === 'true' ? t("active") : t("inactive")}
          </span>
          {/* Hidden input to keep status for form logic */}
          <input type="hidden" value={statusValue} readOnly />
        </div>

        <div className="space-y-4">
          {/* Eliminar cuadro de error general, solo mostrar errores debajo de cada campo */}

          {/* Dibujo de la caja 3D */}
          <div className="flex flex-col items-center mb-4 w-full">
            {(drawLarge > 0 && drawHide > 0 && drawWide > 0) ? (
              <Box3D width={drawLarge} height={drawHide} depth={drawWide} />
            ) : (
              <div style={{ width: 260, height: 200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9fa', border: '1px dashed #cc3399', color: '#cc3399', fontWeight: 'bold' }}>
                {t("box3DPlaceholder")}
              </div>
            )}
            <div className="mt-1 text-xs text-gray-500">
              {t("dimensions")}: <span style={{color:'#cc3399', fontWeight:'bold'}}>{drawLarge > 0 ? `${drawLarge} cm` : '--'}</span> | <span style={{color:'#cc3399', fontWeight:'bold'}}>{drawHide > 0 ? `${drawHide} cm` : '--'}</span> | <span style={{color:'#cc3399', fontWeight:'bold'}}>{drawWide > 0 ? `${drawWide} cm` : '--'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("name")} *
              </label>
              <input
                ref={refs.name}
                type="text"
                maxLength={3}
                placeholder="Ej: BOX"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${showFieldErrors && getFieldErrors().name ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 3);
                }}
              />
              {showFieldErrors && getFieldErrors().name && (
                <span className="text-xs text-red-500 mt-1 block">{getFieldErrors().name}</span>
              )}
            </div>

            {/* Large */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("large")} *
              </label>
              <input
                ref={refs.large}
                type="text"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="Ej: 40.50"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${showFieldErrors && !(refs.large.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                pattern="^\d+(\.\d{0,2})?$"
                title="Máximo 2 decimales"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d.]/g, '');
                  const match = input.value.match(/^(\d+)(\.(\d{0,2})?)?/);
                  if (match) input.value = match[0];
                }}
              />
              {showFieldErrors && !(refs.large.current?.value?.trim()) && (
                <span className="text-xs text-red-500 mt-1 block">{t("required")}</span>
              )}
            </div>

            {/* Wide */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("wide")} *
              </label>
              <input
                ref={refs.wide}
                type="text"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="Ej: 30.25"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${showFieldErrors && !(refs.wide.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                pattern="^\d+(\.\d{0,2})?$"
                title="Máximo 2 decimales"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d.]/g, '');
                  const match = input.value.match(/^(\d+)(\.(\d{0,2})?)?/);
                  if (match) input.value = match[0];
                }}
              />
              {showFieldErrors && !(refs.wide.current?.value?.trim()) && (
                <span className="text-xs text-red-500 mt-1 block">{t("required")}</span>
              )}
            </div>

            {/* Hide */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("hide")} *
              </label>
              <input
                ref={refs.hide}
                type="text"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="Ej: 15.75"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${showFieldErrors && !(refs.hide.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                pattern="^\d+(\.\d{0,2})?$"
                title="Máximo 2 decimales"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d.]/g, '');
                  const match = input.value.match(/^(\d+)(\.(\d{0,2})?)?/);
                  if (match) input.value = match[0];
                }}
              />
              {showFieldErrors && !(refs.hide.current?.value?.trim()) && (
                <span className="text-xs text-red-500 mt-1 block">{t("required")}</span>
              )}
            </div>

            {/* Equivalent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("equivalent")} *
              </label>
              <input
                ref={refs.equivalent}
                type="text"
                inputMode="decimal"
                step="0.001"
                min="0"
                placeholder="Ej: 19.125"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${showFieldErrors && !(refs.equivalent.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                pattern="^\d+(\.\d{0,3})?$"
                title="Máximo 3 decimales"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d.]/g, '');
                  const match = input.value.match(/^(\d+)(\.(\d{0,3})?)?/);
                  if (match) input.value = match[0];
                }}
              />
              {showFieldErrors && !(refs.equivalent.current?.value?.trim()) && (
                <span className="text-xs text-red-500 mt-1 block">{t("required")}</span>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("weight")} * <span className="text-xs text-gray-500">(Calculado automáticamente)</span>
              </label>
              <div className="relative">
                <input
                  ref={refs.weight}
                  type="text"
                  inputMode="decimal"
                  step="0.001"
                  min="0"
                  placeholder="Ej: 2.500"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${showFieldErrors && !(refs.weight.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loading}
                  pattern="^\d+(\.\d{0,3})?$"
                  title="Máximo 3 decimales"
                  onInput={e => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/[^\d.]/g, '');
                    const match = input.value.match(/^(\d+)(\.(\d{0,3})?)?/);
                    if (match) input.value = match[0];
                  }}
                />
                
              </div>
              <div className="flex justify-between mt-1">
                {showFieldErrors && !(refs.weight.current?.value?.trim()) ? (
                  <span className="text-xs text-red-500">{t("required")}</span>
                ) : (
                  <span className="text-xs text-gray-500">{t("canBeModifiedManually", "Puede ser modificado manualmente")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            {/* Botón cancelar solo limpia el formulario y edición, no cierra wizard */}
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-md transition-colors"
              style={{
                background: "#6b7280",
                color: "#fff",
              }}
              disabled={loading}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              style={{
                background: "#cc3399",
                color: "#fff",
              }}
            >
              {loading ? t("loading") : editCaja ? t("update") : t("save")}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={
            editCaja
              ? t("updateSuccess")
              : t("createSuccess")
          }
        />
      )}
    </>
  );
};

export default WizardCaja;
