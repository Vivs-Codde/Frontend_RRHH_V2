import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import { cajaService } from "../../services/cajaService";
import type { Caja } from "../../types/caja";
import { Search, Box, RefreshCw } from "lucide-react";

const PaletCajaPage: React.FC = () => {
  const { t } = useTranslation();
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [search, setSearch] = useState("");
  
  // Estados para el cálculo de cajas por palet
  const [paletType, setPaletType] = useState("europeo");
  const [customPalet, setCustomPalet] = useState({ largo: "", ancho: "", alto: "" });
  
  // Estados para el cálculo de palets por camión
  const [truckType, setTruckType] = useState("trailer");
  const [customTruck, setCustomTruck] = useState({ largo: "", ancho: "", alto: "" });

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

  // Cargar cajas desde el servidor
  useEffect(() => {
    const fetchCajas = async () => {
      try {
        setLoading(true);
        const data = await cajaService.getAll();
        setCajas(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar las cajas");
        console.error("Error al cargar cajas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCajas();
  }, []);

  // Filtrar cajas por búsqueda
  const filteredCajas = cajas.filter(caja =>
    caja.name.toLowerCase().includes(search.toLowerCase()) ||
    caja.large.toString().includes(search) ||
    caja.wide.toString().includes(search) ||
    caja.hide.toString().includes(search)
  );

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
    if (!selectedCaja) return 0;
    
    const { largo, ancho, alto } = getPaletDims();
    const largoCaja = selectedCaja.large;
    const anchoCaja = selectedCaja.wide;
    const altoCaja = selectedCaja.hide;
    
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
    
    return Math.max(totalOrientacion1, totalOrientacion2);
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
      if (!mountRef.current) return;

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

      // Calcular distribución de cajas - usando la misma orientación fija que en FormCaja.tsx
      const cajasLargo = Math.floor(paletDims.largo / boxDims.largo);
      const cajasAncho = Math.floor(paletDims.ancho / boxDims.ancho);
      const cajasAlto = Math.floor((paletDims.alto - 8) / boxDims.alto);
      
      // Agregar cajas
      let count = 0;
      for (let i = 0; i < cajasLargo && count < maxCajas; i++) {
        for (let j = 0; j < cajasAncho && count < maxCajas; j++) {
          for (let k = 0; k < cajasAlto && count < maxCajas; k++) {
            // Crear la caja - dimensiones en el mismo orden que FormCaja.tsx
            const boxGeometry = new THREE.BoxGeometry(
              boxDims.largo,
              boxDims.alto,
              boxDims.ancho
            );
            const boxMaterial = new THREE.MeshLambertMaterial({
              color: 0x4a90e2,
              transparent: true,
              opacity: 0.8,
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            
            // Posicionar la caja
            box.position.set(
              i * boxDims.largo + boxDims.largo / 2,
              k * boxDims.alto + boxDims.alto / 2 + 8, // 8 es la altura del palet
              j * boxDims.ancho + boxDims.ancho / 2
            );
            
            paletGroup.add(box);
            
            // Añadir contorno a la caja
            const edges = new THREE.EdgesGeometry(boxGeometry);
            const line = new THREE.LineSegments(
              edges,
              new THREE.LineBasicMaterial({ color: 0x000000 })
            );
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
      const cameraDistance = maxDimPalet * 1.5; // Ajustado para ver mejor el palet completo
      const center = new THREE.Vector3(paletDims.largo / 2, paletDims.alto / 2, paletDims.ancho / 2);
      const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 5000);
      camera.position.set(center.x + cameraDistance, center.y + cameraDistance, center.z + cameraDistance);
      camera.lookAt(center);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerWidth, containerHeight);
      
      // Asegurar que el modelo utiliza todo el espacio disponible
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';

      if (mountRef.current) {
        // Limpiar el contenedor antes de añadir el nuevo canvas
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
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
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY,
        };
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
        
        const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            deltaMove.y * (Math.PI / 180),
            deltaMove.x * (Math.PI / 180),
            0,
            'XYZ'
          )
        );
        
        paletGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, paletGroup.quaternion);
        
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY,
        };
        
        // Renderizar la escena después del movimiento del mouse
        renderer.render(scene, camera);
      };
      
      if (renderer.domElement) {
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
      }

      // Función para manejar el redimensionamiento de la ventana
      const handleResize = () => {
        if (!mountRef.current) return;
        
        const newWidth = mountRef.current.clientWidth;
        const newHeight = mountRef.current.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
        renderer.render(scene, camera);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Renderizar la escena inicial
      renderer.render(scene, camera);
      
      // Función de animación sin rotación automática, solo renderiza cuando es necesario
      const animate = () => {
        renderer.render(scene, camera);
        return requestAnimationFrame(animate);
      };
      
      const frameId = animate();
      
      // Limpieza al desmontar
      return () => {
        window.removeEventListener('resize', handleResize);
        if (renderer.domElement) {
          renderer.domElement.removeEventListener('mousedown', onMouseDown);
          document.removeEventListener('mouseup', onMouseUp);
          document.removeEventListener('mousemove', onMouseMove);
        }
        cancelAnimationFrame(frameId);
        if (mountRef.current) {
          while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
          }
        }
        // Liberar recursos de THREE.js
        scene.clear();
        renderer.dispose();
      };
    }, [paletDims, boxDims, maxCajas]);

    return (
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '500px',
          margin: '0 auto',
          cursor: 'grab',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      />
    );
  };

  // Manejar selección de caja
  const handleSelectCaja = (caja: Caja) => {
    setSelectedCaja(caja);
  };

  // Calcular cajas totales (cajas por palet * palets por camión)
  const getTotalCajas = () => {
    const cajasPerPalet = getMaxCajas();
    const paletsPerTruck = getMaxPalets();
    return cajasPerPalet * paletsPerTruck;
  };
  
  // Calcular palets en contenedor de 40 pies
  const getPaletsContainer40 = () => {
    return getMaxPaletsContenedor("container_40");
  };
  
  // Calcular total de cajas en contenedor de 40 pies
  const getTotalCajasContainer40 = () => {
    const cajasPerPalet = getMaxCajas();
    const paletsPerContainer = getPaletsContainer40();
    return cajasPerPalet * paletsPerContainer;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t('common.sidebar.pallet')}</h1>
        
        {/* Contenedor principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Panel izquierdo - Selector de cajas */}
          <div className="col-span-1 bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Seleccionar Caja</h2>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                  placeholder="Buscar cajas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="animate-spin text-[#cc3399]" size={24} />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2">
                {filteredCajas.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredCajas.map((caja) => (
                      <li key={caja.id}>
                        <button
                          className={`w-full text-left p-3 rounded-md transition-colors ${
                            selectedCaja?.id === caja.id 
                              ? 'bg-[#cc3399] text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          style={{background:selectedCaja?.id === caja.id ? '#cc3399' : 'transparent'}}
                          onClick={() => handleSelectCaja(caja)}
                        >
                          <div className="flex items-center">
                            <Box size={18} className="mr-2" />
                            <span className="font-medium">{caja.name}</span>
                          </div>
                          <div className="text-sm mt-1">
                            {caja.large.toFixed(2)} x {caja.wide.toFixed(2)} x {caja.hide.toFixed(2)}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    No se encontraron cajas
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Panel central - Visualización 3D */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Visualización de Palet</h2>
            
            {selectedCaja ? (
              <>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  {/* Selector de tipo de palet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Palet
                    </label>
                    <select
                      value={paletType}
                      onChange={(e) => setPaletType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="europeo">Europeo (120 x 80 x 215)</option>
                      <option value="americano">Americano (100 x 120 x 240)</option>
                      <option value="americano_pino1">Americano Pino 1 (104 x 112 x 240)</option>
                      <option value="americano_pino2">Americano Pino 2 (96 x 96 x 240)</option>
                      <option value="americano_pino3">Americano Pino 3 (111.05 x 85 x 240)</option>
                      <option value="americano_pino4">Americano Pino 4 (102 x 122 x 240)</option>
                      <option value="americano_pino5">Americano Pino 5 (102 x 120 x 240)</option>
                      <option value="otro">Personalizado</option>
                    </select>
                  </div>
                  
                  {/* Selector de tipo de camión */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Transporte
                    </label>
                    <select
                      value={truckType}
                      onChange={(e) => setTruckType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {Object.entries(truckOptions).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Campos personalizados para palet (si se selecciona "otro") */}
                {paletType === "otro" && (
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Largo (cm)
                      </label>
                      <input
                        type="number"
                        value={customPalet.largo}
                        onChange={(e) => setCustomPalet({...customPalet, largo: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ancho (cm)
                      </label>
                      <input
                        type="number"
                        value={customPalet.ancho}
                        onChange={(e) => setCustomPalet({...customPalet, ancho: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alto (cm)
                      </label>
                      <input
                        type="number"
                        value={customPalet.alto}
                        onChange={(e) => setCustomPalet({...customPalet, alto: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
                
                {/* Campos personalizados para camión (si se selecciona "otro") */}
                {truckType === "otro" && (
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Largo (cm)
                      </label>
                      <input
                        type="number"
                        value={customTruck.largo}
                        onChange={(e) => setCustomTruck({...customTruck, largo: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ancho (cm)
                      </label>
                      <input
                        type="number"
                        value={customTruck.ancho}
                        onChange={(e) => setCustomTruck({...customTruck, ancho: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alto (cm)
                      </label>
                      <input
                        type="number"
                        value={customTruck.alto}
                        onChange={(e) => setCustomTruck({...customTruck, alto: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
                
                {/* Visualización 3D */}
                <div className="flex-1 mt-4">
                  <Palet3D
                    paletDims={getPaletDims()}
                    boxDims={{
                      largo: selectedCaja.large,
                      ancho: selectedCaja.wide,
                      alto: selectedCaja.hide
                    }}
                    maxCajas={getMaxCajas()}
                  />
                </div>
                
                {/* Información de cálculos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center p-3 bg-white rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">Cajas por Palet</p>
                    <p className="text-2xl font-bold text-[#cc3399]">{getMaxCajas()}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">Palets por {truckType === "container_20" ? "Cont. 20'" : truckType === "container_40" ? "Cont. 40'" : "Camión"}</p>
                    <p className="text-2xl font-bold text-[#cc3399]">{getMaxPalets()}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">Cajas Totales</p>
                    <p className="text-2xl font-bold text-[#cc3399]">{getTotalCajas()}</p>
                  </div>
                </div>
                
                {/* Información específica de contenedor de 40 pies */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Información de Contenedor de 40 pies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">Palets en Contenedor 40'</p>
                      <p className="text-2xl font-bold text-[#cc3399]">{getPaletsContainer40()}</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">Cajas Totales en Contenedor 40'</p>
                      <p className="text-2xl font-bold text-[#cc3399]">{getTotalCajasContainer40()}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Box className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">Selecciona una caja para visualizar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaletCajaPage;
