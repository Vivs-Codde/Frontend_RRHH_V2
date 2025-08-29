
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import { cajaService } from "../../../services/cajaService";
import type { Caja } from "../../../types/caja";
import type { CajaFormRefs } from "../../../hooks/useCajaFormRefs";
import SuccessModal from "../../modals/SuccessModal";

interface FormCajaProps {
  refs: CajaFormRefs;
  onCreated: () => void;
  editCaja?: Caja | null;
  onCancel: () => void;
}

const FormCaja: React.FC<FormCajaProps> = ({
  refs,
  onCreated,
  editCaja,
  onCancel
}) => {
  const { t } = useTranslation();
  const [cajas, setCajas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [statusValue, setStatusValue] = useState("active");

  // Estados para dibujo de la caja
  const [drawLarge, setDrawLarge] = useState(0);
  const [drawWide, setDrawWide] = useState(0);
  const [drawHide, setDrawHide] = useState(0);
  
  // Función para manejar los cálculos con retraso (debounce)
  const debouncedUpdateValues = React.useCallback(
    (() => {
      let timer: number | null = null;
      return (callback: () => void) => {
        if (timer) window.clearTimeout(timer);
        
        // Verificar que todos los campos tengan valores válidos antes de programar un timer
        const large = parseFloat(refs.large.current?.value || "0");
        const wide = parseFloat(refs.wide.current?.value || "0");
        const hide = parseFloat(refs.hide.current?.value || "0");
        
        // Solo programar el cálculo si todos los campos tienen valores válidos
        if (large > 0 && wide > 0 && hide > 0) {
          timer = window.setTimeout(() => {
            callback();
            timer = null;
          }, 50); // Reducido de 300ms a 50ms para una respuesta más rápida
        } else {
          // Si algún campo está vacío, ejecutar el callback de inmediato
          // Esto evita bloqueos cuando se borran valores
          callback();
        }
      };
    })(),
    [refs]
  );

  // Estados para el cálculo de cajas por palet
  const [paletType, setPaletType] = useState("europeo");
  const [customPalet, setCustomPalet] = useState({ largo: "", ancho: "", alto: "" });
  
  // Estados para el cálculo de palets por camión
  const [truckType, setTruckType] = useState("trailer");
  const [customTruck, setCustomTruck] = useState({ largo: "", ancho: "", alto: "" });

  // Cargar cajas existentes para validación
  useEffect(() => {
    async function fetchCajas() {
      try {
        const resp = await cajaService.getAll();
        setCajas(Array.isArray(resp) ? resp : []);
      } catch {}
    }
    fetchCajas();
  }, []);

  // Función para limpiar el formulario y el estado de edición
  const resetForm = () => {
    if (refs.name.current) refs.name.current.value = "";
    if (refs.large.current) refs.large.current.value = "";
    if (refs.wide.current) refs.wide.current.value = "";
    if (refs.hide.current) refs.hide.current.value = "";
    if (refs.equivalent.current) refs.equivalent.current.value = "";
    if (refs.weight.current) refs.weight.current.value = "";
    setStatusValue("active");
    setError("");
    setPaletType("europeo");
    setCustomPalet({ largo: "", ancho: "", alto: "" });
    setTruckType("trailer");
    setCustomTruck({ largo: "", ancho: "", alto: "" });
    setDrawLarge(0);
    setDrawWide(0);
    setDrawHide(0);
  };

  // Configuraciones de palets predefinidos
  const paletOptions = {
    europeo: { largo: 120, ancho: 80, alto: 215 },
    americano: { largo: 100, ancho: 120, alto: 240 },
    americano_pino1: { largo: 104, ancho: 112, alto: 240 },
    americano_pino2: { largo: 96, ancho: 96, alto: 240 },
    americano_pino3: { largo: 111.05, ancho: 85, alto: 240 },
    americano_pino4: { largo: 102, ancho: 122, alto: 240 },
    americano_pino5: { largo: 102, ancho: 120, alto: 240 },
    otro: { largo: 0, ancho: 0, alto: 0 },
  };
  
  // Configuraciones de camiones predefinidos
  const truckOptions = {
    trailer: { largo: 1360, ancho: 250, alto: 270, nombre: "Tráiler estándar (13.6m x 2.5m x 2.7m)" },
    rigido: { largo: 820, ancho: 250, alto: 270, nombre: "Rígido grande (8.2m x 2.5m x 2.7m)" },
    rigido_pequeno: { largo: 620, ancho: 245, alto: 245, nombre: "Rígido pequeño (6.2m x 2.45m x 2.45m)" },
    furgoneta: { largo: 420, ancho: 175, alto: 190, nombre: "Furgoneta (4.2m x 1.75m x 1.9m)" },
    container_20: { largo: 590, ancho: 235, alto: 239, nombre: "Contenedor 20 pies (5.9m x 2.35m x 2.39m)" },
    container_40: { largo: 1203, ancho: 235, alto: 239, nombre: "Contenedor 40 pies (12.03m x 2.35m x 2.39m)" },
    otro: { largo: 0, ancho: 0, alto: 0, nombre: "Otro (personalizado)" },
  };

  // Obtener dimensiones del palet seleccionado
  const getPaletDims = () => {
    if (paletType === "otro") {
      return {
        largo: parseFloat(customPalet.largo) || 0,
        ancho: parseFloat(customPalet.ancho) || 0,
        alto: parseFloat(customPalet.alto) || 0,
      };
    }
    return paletOptions[paletType as keyof typeof paletOptions];
  };
  
  // Obtener dimensiones del camión seleccionado
  const getTruckDims = () => {
    if (truckType === "otro") {
      return {
        largo: parseFloat(customTruck.largo) || 0,
        ancho: parseFloat(customTruck.ancho) || 0,
        alto: parseFloat(customTruck.alto) || 0,
      };
    }
    return truckOptions[truckType as keyof typeof truckOptions];
  };

  // Calcular máximo de cajas por palet
  const getMaxCajas = () => {
    const { largo, ancho, alto } = getPaletDims();
    const largoCaja = parseFloat(refs.large.current?.value || "0");
    const anchoCaja = parseFloat(refs.wide.current?.value || "0");
    const altoCaja = parseFloat(refs.hide.current?.value || "0");
    
    if (largoCaja <= 0 || anchoCaja <= 0 || altoCaja <= 0 || largo <= 0 || ancho <= 0 || alto <= 0) {
      return 0;
    }
    
    const cajasLargo = Math.floor(largo / largoCaja);
    const cajasAncho = Math.floor(ancho / anchoCaja);
    const cajasAlto = Math.floor(alto / altoCaja);
    
    return Math.max(cajasLargo, 0) * Math.max(cajasAncho, 0) * Math.max(cajasAlto, 0);
  };
  
  // Calcular máximo de palets por camión
  const getMaxPalets = () => {
    const { largo: largoTruck, ancho: anchoTruck, alto: altoTruck } = getTruckDims();
    const { largo: largoPalet, ancho: anchoPalet, alto: altoPalet } = getPaletDims();
    
    if (largoPalet <= 0 || anchoPalet <= 0 || altoPalet <= 0 || 
        largoTruck <= 0 || anchoTruck <= 0 || altoTruck <= 0) {
      return 0;
    }
    
    // Calcular cuántos palets caben en el camión
    // Tenemos que considerar que los palets se pueden colocar en dos orientaciones diferentes
    
    // Orientación 1: largo del palet a lo largo del camión
    const paletsLargo1 = Math.floor(largoTruck / largoPalet);
    const paletsAncho1 = Math.floor(anchoTruck / anchoPalet);
    
    // Orientación 2: ancho del palet a lo largo del camión
    const paletsLargo2 = Math.floor(largoTruck / anchoPalet);
    const paletsAncho2 = Math.floor(anchoTruck / largoPalet);
    
    // Altura es igual en ambos casos
    const paletsAlto = Math.floor(altoTruck / altoPalet);
    
    // Elegir la orientación que maximiza la cantidad de palets
    const totalOrientacion1 = paletsLargo1 * paletsAncho1 * paletsAlto;
    const totalOrientacion2 = paletsLargo2 * paletsAncho2 * paletsAlto;
    
    return Math.max(totalOrientacion1, totalOrientacion2);
  };
  
  // Calcular máximo de palets por contenedor (20 o 40 pies)
  const getMaxPaletsContenedor = (tipo: "container_20" | "container_40") => {
    const { largo: largoCont, ancho: anchoCont, alto: altoCont } = truckOptions[tipo];
    const { largo: largoPalet, ancho: anchoPalet, alto: altoPalet } = getPaletDims();
    
    // Para debugging
    console.log(`Contenedor ${tipo}:`, { largoCont, anchoCont, altoCont });
    console.log(`Palet:`, { largoPalet, anchoPalet, altoPalet });
    
    if (largoPalet <= 0 || anchoPalet <= 0 || altoPalet <= 0 || 
        largoCont <= 0 || anchoCont <= 0 || altoCont <= 0) {
      return 0;
    }
    
    // Orientación 1: Largo del palet en dirección del largo del contenedor
    const paletsLargo1 = Math.floor(largoCont / largoPalet);
    const paletsAncho1 = Math.floor(anchoCont / anchoPalet);
    
    // Orientación 2: Ancho del palet en dirección del largo del contenedor
    const paletsLargo2 = Math.floor(largoCont / anchoPalet);
    const paletsAncho2 = Math.floor(anchoCont / largoPalet);
    
    // En contenedores, normalmente solo consideramos una capa de pallets (altura = 1)
    // pero podemos calcular la altura si es relevante
    const paletsAlto = 1; // Usualmente es 1 para contenedores
    
    const totalOrientacion1 = paletsLargo1 * paletsAncho1 * paletsAlto;
    const totalOrientacion2 = paletsLargo2 * paletsAncho2 * paletsAlto;
    
    console.log(`Orientación 1: ${paletsLargo1} x ${paletsAncho1} = ${totalOrientacion1}`);
    console.log(`Orientación 2: ${paletsLargo2} x ${paletsAncho2} = ${totalOrientacion2}`);
    
    return Math.max(totalOrientacion1, totalOrientacion2);
  };

  // Cargar datos de edición si se proporciona
  useEffect(() => {
    if (editCaja) {
      if (refs.name.current) refs.name.current.value = editCaja.name;
      if (refs.large.current) refs.large.current.value = editCaja.large.toString();
      if (refs.wide.current) refs.wide.current.value = editCaja.wide.toString();
      if (refs.hide.current) refs.hide.current.value = editCaja.hide.toString();
      if (refs.equivalent.current) refs.equivalent.current.value = editCaja.equivalent.toString();
      
      // Actualizar dibujo 3D en un solo batch para evitar re-renders múltiples
      setTimeout(() => {
        setDrawLarge(editCaja.large > 0 ? editCaja.large : 0);
        setDrawWide(editCaja.wide > 0 ? editCaja.wide : 0);
        setDrawHide(editCaja.hide > 0 ? editCaja.hide : 0);
        
        // Calcular peso volumétrico automáticamente o usar el peso existente
        const calculatedWeight = calculateVolumetricWeight();
        if (refs.weight.current) {
          // Usar el peso calculado solo si es mayor que el peso existente
          const existingWeight = editCaja.weight;
          if (parseFloat(calculatedWeight) > existingWeight) {
            refs.weight.current.value = calculatedWeight;
          } else {
            refs.weight.current.value = existingWeight.toString();
          }
        }
      }, 0);
      
      setStatusValue(editCaja.status ? "active" : "inactive");
    } else {
      resetForm();
    }
  }, [editCaja, refs]);

  // Actualizar medidas iniciales para el dibujo en tiempo real
  useEffect(() => {
    // Ya que estamos manejando las actualizaciones en los onInput,
    // este efecto solo se necesita para la inicialización inicial
    const l = parseFloat(refs.large.current?.value || "");
    const w = parseFloat(refs.wide.current?.value || "");
    const h = parseFloat(refs.hide.current?.value || "");
    
    if (l > 0) setDrawLarge(l);
    if (w > 0) setDrawWide(w);
    if (h > 0) setDrawHide(h);
    
    // Solo calculamos el peso volumétrico si tenemos los 3 valores
    if (l > 0 && w > 0 && h > 0) {
      setVolumetricWeight();
    }
    
  }, [refs.large, refs.wide, refs.hide]);

  // Validación por campo
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

  // Validación completa del formulario
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

  // Guardar la caja
  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(". "));
        setLoading(false);
        return;
      }
      
      const cajaData = {
        name: refs.name.current?.value?.trim().toUpperCase() || "",
        large: parseFloat(refs.large.current?.value || "0"),
        wide: parseFloat(refs.wide.current?.value || "0"),
        hide: parseFloat(refs.hide.current?.value || "0"),
        equivalent: parseFloat(refs.equivalent.current?.value || "0"),
        weight: parseFloat(refs.weight.current?.value || "0"),
        status: statusValue === "active",
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
        resetForm();
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
      // Configurar escena THREE.js
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf9f9fa);
      
      // Calcular el centro y la distancia óptima de la cámara
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
      
      // Crear la caja
      const boxGeometry = new THREE.BoxGeometry(width, height, depth);
      const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.7 });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.set(width / 2, height / 2, depth / 2);
      scene.add(box);
      
      // Agregar contorno
      const edges = new THREE.EdgesGeometry(boxGeometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
      line.position.copy(box.position);
      scene.add(line);
      
      // Agregar iluminación
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
      dirLight.position.set(50, 50, 50);
      scene.add(dirLight);
      
      // Manejar interacción
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
        
        rotation.x += deltaMove.y * 0.005;
        rotation.y += deltaMove.x * 0.005;
        
        box.rotation.x = rotation.x;
        box.rotation.y = rotation.y;
        line.rotation.x = rotation.x;
        line.rotation.y = rotation.y;
        
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY,
        };
      };
      
      if (renderer.domElement) {
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
      }
      
      // Función de animación
      const animate = () => {
        const frameId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
        return frameId;
      };
      
      const frameId = animate();
      
      // Limpieza
      return () => {
        cancelAnimationFrame(frameId);
        if (renderer.domElement) {
          renderer.domElement.removeEventListener('mousedown', onMouseDown);
          renderer.domElement.removeEventListener('mouseup', onMouseUp);
          renderer.domElement.removeEventListener('mousemove', onMouseMove);
        }
        if (mountRef.current) {
          mountRef.current.innerHTML = '';
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
          margin: '0 auto', 
          cursor: 'grab', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }} 
      />
    );
  };
  
  // Componente para visualizar el palet y las cajas encima
  const Palet3D = ({
    paletDims,
    boxDims,
    maxCajas,
  }: {
    paletDims: { largo: number; ancho: number; alto: number };
    boxDims: { largo: number; ancho: number; alto: number };
    maxCajas: number;
  }) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Ya no necesitamos ajustar la altura manualmente, 
      // porque ahora usamos posicionamiento absoluto y el alto está fijo en el estilo

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf9f9fa);
      
      // Crear un grupo para contener el palet y todas las cajas
      const paletGroup = new THREE.Group();
      scene.add(paletGroup);
      
      // Posicionar el grupo en el centro de la escena
      paletGroup.position.set(0, 0, 0);

      // Palet
      const paletGeometry = new THREE.BoxGeometry(paletDims.largo, 8, paletDims.ancho);
      const paletMaterial = new THREE.MeshLambertMaterial({ color: 0xdeb887 });
      const palet = new THREE.Mesh(paletGeometry, paletMaterial);
      palet.position.set(paletDims.largo / 2, 4, paletDims.ancho / 2);
      paletGroup.add(palet);

      // Contorno del palet
      const paletEdges = new THREE.EdgesGeometry(paletGeometry);
      const paletLine = new THREE.LineSegments(paletEdges, new THREE.LineBasicMaterial({ color: 0x5d4037 }));
      paletLine.position.copy(palet.position);
      paletGroup.add(paletLine);

      // Calcular distribución de cajas
      const cajasLargo = Math.floor(paletDims.largo / boxDims.largo);
      const cajasAncho = Math.floor(paletDims.ancho / boxDims.ancho);
      const cajasAlto = Math.floor((paletDims.alto - 8) / boxDims.alto);
      
      // Agregar cajas
      let count = 0;
      for (let i = 0; i < cajasLargo && count < maxCajas; i++) {
        for (let j = 0; j < cajasAncho && count < maxCajas; j++) {
          for (let k = 0; k < cajasAlto && count < maxCajas; k++) {
            const boxGeometry = new THREE.BoxGeometry(boxDims.largo, boxDims.alto, boxDims.ancho);
            const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.7 });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(
              boxDims.largo / 2 + i * boxDims.largo,
              8 + boxDims.alto / 2 + k * boxDims.alto,
              boxDims.ancho / 2 + j * boxDims.ancho
            );
            paletGroup.add(box);
            
            // Agregar contorno para cada caja
            const edges = new THREE.EdgesGeometry(boxGeometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
            line.position.copy(box.position);
            paletGroup.add(line);
            
            count++;
          }
        }
      }

      // Obtener el tamaño del contenedor para ajustar el renderizador
      const containerWidth = mountRef.current ? mountRef.current.clientWidth : 800;
      const containerHeight = mountRef.current ? mountRef.current.clientHeight : 700;
      
      // Cámara
      const maxDimPalet = Math.max(paletDims.largo, paletDims.ancho, paletDims.alto);
      const cameraDistance = maxDimPalet * 1.1; // Reducido aún más para acercar la cámara y hacer el gráfico más grande
      const center = new THREE.Vector3(paletDims.largo / 2, paletDims.alto / 2, paletDims.ancho / 2);
      const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 5000); // FOV reducido para hacer más zoom
      camera.position.set(center.x + cameraDistance, center.y + cameraDistance, center.z + cameraDistance);
      camera.lookAt(center);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(containerWidth, containerHeight);
      
      // Asegurar que el modelo utiliza todo el espacio disponible
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';

      if (mountRef.current) {
        mountRef.current.innerHTML = '';
        mountRef.current.appendChild(renderer.domElement);
      }

      // Luz
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
      dirLight.position.set(50, 50, 50);
      scene.add(dirLight);

      // Manejar interacción
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      
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
        
        // Rotar todo el grupo de una vez para mantener la estructura intacta
        paletGroup.rotation.y += deltaMove.x * 0.005;
        paletGroup.rotation.x += deltaMove.y * 0.005;
        
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY,
        };
      };
      
      if (renderer.domElement) {
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
      }

      // Función para manejar el redimensionamiento de la ventana
      const handleResize = () => {
        if (!mountRef.current) return;
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Animación
      const animate = () => {
        const frameId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
        return frameId;
      };
      
      const frameId = animate();

      return () => {
        cancelAnimationFrame(frameId);
        if (renderer.domElement) {
          renderer.domElement.removeEventListener('mousedown', onMouseDown);
          renderer.domElement.removeEventListener('mouseup', onMouseUp);
          renderer.domElement.removeEventListener('mousemove', onMouseMove);
        }
        window.removeEventListener('resize', handleResize);
        if (mountRef.current) {
          mountRef.current.innerHTML = '';
        }
        renderer.dispose();
      };
    }, [paletDims, boxDims, maxCajas]);

    return (
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          margin: '0 auto',
          cursor: 'grab',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '580px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '40px', // Espacio para el texto inferior
        }}
      />
    );
  };

  // Calcular peso volumétrico basado en dimensiones
  const calculateVolumetricWeight = () => {
    const large = parseFloat(refs.large.current?.value || "0");
    const wide = parseFloat(refs.wide.current?.value || "0");
    const hide = parseFloat(refs.hide.current?.value || "0");
    
    if (large > 0 && wide > 0 && hide > 0) {
      // Factor de división volumétrico estándar (puede ajustarse según requerimientos)
      const factor = 6000; // Factor común usado en la industria logística
      const volumetricWeight = (large * wide * hide) / factor;
      
      // Formatear a máximo 3 decimales
      return volumetricWeight.toFixed(3);
    }
    return "0";
  };
  
  // Actualizar el campo de peso con el peso volumétrico calculado
  // Solo calcula si los tres campos tienen valores válidos
  const setVolumetricWeight = React.useCallback(() => {
    // Verificar que todos los campos tengan valores válidos mayores a 0
    const large = parseFloat(refs.large.current?.value || "0");
    const wide = parseFloat(refs.wide.current?.value || "0");
    const hide = parseFloat(refs.hide.current?.value || "0");
    
    // Solo actualizar cuando los tres campos tienen valores válidos
    if (large > 0 && wide > 0 && hide > 0 && refs.weight.current) {
      // Calcular directamente sin llamar a la otra función para evitar reprocesamiento
      const factor = 6000;
      const volumetricWeight = (large * wide * hide) / factor;
      refs.weight.current.value = volumetricWeight.toFixed(3);
    }
  }, []);

  // Renderizar el formulario
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-pink-700">
          {editCaja ? t("editBox") : t("addBox")}
        </h2>
        
        {/* Switch de estado en la parte superior */}
        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 mr-3">
            {t("status")} *
          </label>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={statusValue === "active"}
                onChange={e => setStatusValue(e.target.checked ? "active" : "inactive")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fuchsia-300 rounded-full peer transition-colors duration-200 peer-checked:bg-[#cc3399]"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
            </label>
            <span className="ml-3 text-sm font-medium text-gray-700 select-none">
              {statusValue === "active" ? t("active") : t("inactive")}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[950px]">
        {/* Columna izquierda: Formulario */}
        <div>
          {/* Grid de dos columnas para los campos de entrada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {/* Nombre */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("name")} <span className="text-red-500">*</span>
              </label>
              <input
                ref={refs.name}
                type="text"
                maxLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="ABC"
              />
              {showFieldErrors && getFieldErrors().name && (
                <p className="text-red-500 text-xs mt-1">{getFieldErrors().name}</p>
              )}
            </div>

            {/* Largo */}
            <div className="form-group">
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${showFieldErrors && !(refs.large.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                pattern="^\d+(\.\d{0,2})?$"
                title="Máximo 2 decimales"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d.]/g, '');
                  const match = input.value.match(/^(\d+)(\.(\d{0,2})?)?/);
                  if (match) input.value = match[0];
                  
                  // Actualizar el dibujo inmediatamente
                  const value = parseFloat(input.value) || 0;
                  setDrawLarge(value);
                  
                  // Cálculo inmediato para entradas pequeñas
                  if (input.value === '' || value === 0) {
                    // Si se está borrando el valor, actualizar inmediatamente
                    if (refs.weight.current) refs.weight.current.value = '0';
                  } else {
                    // Usar debounce solo para el cálculo del peso volumétrico
                    debouncedUpdateValues(() => {
                      setVolumetricWeight();
                    });
                  }
                }}
              />
              {showFieldErrors && !(refs.large.current?.value?.trim()) && (
                <span className="text-xs text-red-500 mt-1 block">{t("required")}</span>
              )}
            </div>

            {/* Ancho */}
            <div className="form-group">
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${showFieldErrors && !(refs.wide.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                pattern="^\d+(\.\d{0,2})?$"
                title="Máximo 2 decimales"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d.]/g, '');
                  const match = input.value.match(/^(\d+)(\.(\d{0,2})?)?/);
                  if (match) input.value = match[0];
                  
                  // Actualizar el dibujo inmediatamente
                  const value = parseFloat(input.value) || 0;
                  setDrawWide(value);
                  
                  // Cálculo inmediato para entradas pequeñas
                  if (input.value === '' || value === 0) {
                    // Si se está borrando el valor, actualizar inmediatamente
                    if (refs.weight.current) refs.weight.current.value = '0';
                  } else {
                    // Usar debounce solo para el cálculo del peso volumétrico
                    debouncedUpdateValues(() => {
                      setVolumetricWeight();
                    });
                  }
                }}
              />
              {showFieldErrors && !(refs.wide.current?.value?.trim()) && (
                <span className="text-xs text-red-500 mt-1 block">{t("required")}</span>
              )}
            </div>

            {/* Alto */}
            <div className="form-group">
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${showFieldErrors && !(refs.hide.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                pattern="^\d+(\.\d{0,2})?$"
                title="Máximo 2 decimales"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^\d.]/g, '');
                  const match = input.value.match(/^(\d+)(\.(\d{0,2})?)?/);
                  if (match) input.value = match[0];
                  
                  // Actualizar el dibujo inmediatamente
                  const value = parseFloat(input.value) || 0;
                  setDrawHide(value);
                  
                  // Cálculo inmediato para entradas pequeñas
                  if (input.value === '' || value === 0) {
                    // Si se está borrando el valor, actualizar inmediatamente
                    if (refs.weight.current) refs.weight.current.value = '0';
                  } else {
                    // Usar debounce solo para el cálculo del peso volumétrico
                    debouncedUpdateValues(() => {
                      setVolumetricWeight();
                    });
                  }
                }}
              />
              {showFieldErrors && !(refs.hide.current?.value?.trim()) && (
                <span className="text-xs text-red-500 mt-1 block">{t("required")}</span>
              )}
            </div>

            {/* Equivalente */}
            <div className="form-group">
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${showFieldErrors && !(refs.equivalent.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
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

            {/* Peso */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("weight")} *
              </label>
              <input
                ref={refs.weight}
                type="text"
                inputMode="decimal"
                step="0.001"
                min="0"
                placeholder="Ej: 2.500"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${showFieldErrors && !(refs.weight.current?.value?.trim()) ? 'border-red-500' : 'border-gray-300'}`}
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
              <p className="text-xs text-gray-500 mt-1">
                El peso volumétrico se calcula automáticamente al introducir las dimensiones.
              </p>
              {showFieldErrors && !(refs.weight.current?.value?.trim()) && (
                <span className="text-xs text-red-500 mt-1 block">{t("required")}</span>
              )}
            </div>
          </div>

          {/* El control de estado se ha movido a la parte superior como un switch */}
          
          {/* Título para los calculadores */}
          <div className="mt-6 mb-3">
            <h3 className="text-lg font-medium text-gray-700">{t("paletCalculator")}</h3>
          </div>
          
          {/* Grid de dos columnas para los selectores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {/* Selector de tipo de palet */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("paletType")}
              </label>
              <select
                value={paletType}
                onChange={(e) => setPaletType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="europeo">Europeo (120×80×215)</option>
                <option value="americano">Americano (100×120×240)</option>
                <option value="americano_pino1">Americano Pino 1 (104×112×240)</option>
                <option value="americano_pino2">Americano Pino 2 (96×96×240)</option>
                <option value="americano_pino3">Americano Pino 3 (111×85×240)</option>
                <option value="americano_pino4">Americano Pino 4 (102×122×240)</option>
                <option value="americano_pino5">Americano Pino 5 (102×120×240)</option>
                <option value="otro">Otro (personalizado)</option>
              </select>
            </div>

            {/* Selector de tipo de camión */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de camión
              </label>
              <select
                value={truckType}
                onChange={(e) => setTruckType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {Object.entries(truckOptions).map(([key, truck]) => (
                  <option key={key} value={key}>
                    {truck.nombre || `${key} (${truck.largo}×${truck.ancho}×${truck.alto})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campos personalizados para palet */}
          {paletType === "otro" && (
            <div className="mt-2 mb-3 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Dimensiones del palet personalizado</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("length")} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={customPalet.largo}
                    onChange={(e) => setCustomPalet({ ...customPalet, largo: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("width")} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={customPalet.ancho}
                    onChange={(e) => setCustomPalet({ ...customPalet, ancho: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("height")} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={customPalet.alto}
                    onChange={(e) => setCustomPalet({ ...customPalet, alto: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Campos personalizados para camión */}
          {truckType === "otro" && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Dimensiones del camión personalizado</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("length")} (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={customTruck.largo}
                    onChange={(e) => setCustomTruck({ ...customTruck, largo: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("width")} (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={customTruck.ancho}
                    onChange={(e) => setCustomTruck({ ...customTruck, ancho: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t("height")} (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={customTruck.alto}
                    onChange={(e) => setCustomTruck({ ...customTruck, alto: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Resultados de los cálculos (movidos de la columna derecha) */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-3">{t("resultados")}</h3>
            
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-center mb-4">
              <p className="font-medium text-gray-800">{t("boxesPerPalet")}</p>
              <p className="text-2xl font-bold text-pink-700">{getMaxCajas()}</p>
            </div>
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-center mb-4">
              <p className="font-medium text-gray-800">{t("paletCamion")}</p>
              <p className="text-2xl font-bold text-pink-700">{getMaxPalets()}</p>
            </div>
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-center mb-4">
              <p className="font-medium text-gray-800">Palets en contenedor 20'</p>
              <p className="text-2xl font-bold text-pink-700">{getMaxPaletsContenedor("container_20")}</p>
              <p className="text-sm text-gray-600">{getMaxCajas() * getMaxPaletsContenedor("container_20")} cajas totales</p>
            </div>
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-center mb-4">
              <p className="font-medium text-gray-800">Palets en contenedor 40'</p>
              <p className="text-2xl font-bold text-pink-700">{getMaxPaletsContenedor("container_40")}</p>
              <p className="text-sm text-gray-600">{getMaxCajas() * getMaxPaletsContenedor("container_40")} cajas totales</p>
            </div>
            <div className="p-3 bg-white border border-gray-300 rounded-lg text-center">
              <p className="font-medium text-gray-800">{t("boxCamion")}</p>
              <p className="text-2xl font-bold text-pink-700">{getMaxPalets() * getMaxCajas()}</p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Vista previa y resultados de cálculos */}
        <div className="space-y-4 flex flex-col h-full">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t("boxPreview")}</h3>
            <Box3D width={drawLarge} height={drawHide} depth={drawWide} />
            <div className="mt-2 text-center text-sm text-gray-600">
              {drawLarge.toFixed(2)} × {drawWide.toFixed(2)} × {drawHide.toFixed(2)} cm
            </div>
          </div>
          
          {/* Vista previa del palet con cajas (movida de la columna izquierda) */}
          <div className="bg-gray-50 p-2 rounded-lg flex-1 flex flex-col" style={{ height: "calc(100% - 180px)" }}>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Vista palet + cajas</h3>
            <div className="flex-1 w-full relative" style={{ height: "calc(100% - 30px)" }}>
              <Palet3D
                paletDims={getPaletDims()}
                boxDims={{
                  largo: parseFloat(refs.large.current?.value || "0"),
                  ancho: parseFloat(refs.wide.current?.value || "0"),
                  alto: parseFloat(refs.hide.current?.value || "0"),
                }}
                maxCajas={getMaxCajas()}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gray-50 bg-opacity-80 py-1 text-center">
                <p className="text-sm font-medium text-gray-700">
                  <strong>{getMaxCajas()}</strong> cajas por palet
                </p>
                <p className="text-xs text-gray-500 italic">
                  (Gira el modelo con el ratón para ver desde todos los ángulos)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-[#cc3399] text-white rounded-lg hover:bg-pink-700 font-medium flex items-center justify-center"
          style={{ minWidth: "120px" }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            t("save")
          )}
        </button>
      </div>

      {showSuccessModal && (
        <SuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={editCaja ? t("updateSuccess") : t("createSuccess")}
        />
      )}
    </div>
  );
};

export default FormCaja;
