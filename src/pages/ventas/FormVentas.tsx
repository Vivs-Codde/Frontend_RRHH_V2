import React from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { ShoppingCart } from "lucide-react";

// Hooks personalizados
import { useVentasForm } from "../../hooks/ventas/useVentasForm";
import type { TipoCaja } from "../../types/ventas";

// Componentes
import ClienteInfo from "../../components/ventas/ClienteInfo";

import FormAgregarProducto from "../../components/ventas/FormAgregarProducto";
import TablaItemsVenta from "../../components/ventas/TablaItemsVenta";
import SelectorTipoCaja from "../../components/ventas/SelectorTipoCaja";
import InfoCajasProducto from "../../components/ventas/InfoCajasProducto";

// Tipos
import type { FormVentasProps } from "../../types/ventas";

const FormVentas: React.FC<FormVentasProps> = ({ onGuardar, onCancelar }) => {
  const { t } = useTranslation();
  
  const {
    // Estados
    clienteSeleccionado,
    clienteOptions,
    asignacion,
    productosOptions,
    itemsVenta,
    productoSeleccionado,
    cantidad,
    precio,
    precioVenta,
    floresDetalle,
    observacion,
    totalVenta,
    costoTotalUnidad,
    fechaEntrega,
    mostrarDetalleCliente,
    loading,
    error,
    filtroTipoFlor,
    marcaciones,
    marcacionSeleccionada,
    totalMarcaciones,
    marcacionesOptions,
    tipoCaja,
    tipoCajaOptions,
    cajasProducto,
    categoriaSeleccionada,
    loadingCajas,
    errorCajas,
    
    // Funciones de actualización
    handleClienteChange,
    handleProductoChange,
    handlePrecioFlor,
    setCantidad,
    setPrecio,
    setPrecioVenta,
    setObservacion,
    setCostoTotalUnidad,
    setFechaEntrega,
    setMostrarDetalleCliente,
    setFiltroTipoFlor,
    handleMarcacionChange,
    setTipoCaja,
    
    // Funciones de acción
    handleAgregarItem,
    handleEliminarItem,
    handleSubmit,
    obtenerNumeroTallos,
    obtenerCostoMateriales
  } = useVentasForm(onGuardar);

  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-2xl font-bold text-[#cc3399] mb-6">
        {t("ventas.nueva") || "Nueva Venta"}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Selección de cliente */}
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              {t("cliente")}:
            </label>
            <Select
              options={clienteOptions}
              onChange={handleClienteChange}
              value={clienteSeleccionado}
              isSearchable
              placeholder="Seleccione un cliente..."
              className="text-sm"
              isLoading={loading}
              isDisabled={loading || itemsVenta.length > 0}
            />
          </div>
          
          {/* Fecha de entrega */}
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              {t("fecha_entrega") || "Fecha de Entrega"}:
            </label>
            <input
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        {/* Información del cliente seleccionado */}
        {clienteSeleccionado && (
          <ClienteInfo 
            cliente={clienteSeleccionado} 
            mostrarDetalleCliente={mostrarDetalleCliente}
            setMostrarDetalleCliente={setMostrarDetalleCliente}
            marcaciones={marcaciones}
            marcacionSeleccionada={marcacionSeleccionada}
            marcacionesOptions={marcacionesOptions}
            handleMarcacionChange={handleMarcacionChange}
            totalMarcaciones={totalMarcaciones}
          />
        )}
        
        {/* Selector de Tipo de Caja */}
        {clienteSeleccionado && (
          <div className="mt-4 mb-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectorTipoCaja
                tipoCaja={tipoCaja}
                setTipoCaja={setTipoCaja}
                tipoCajaOptions={tipoCajaOptions}
                disabled={itemsVenta.length > 0}
              />
              
              {/* Información de cajas para producto seleccionado (solo en modo caja sólida) */}
              {tipoCaja === 'solida' && productoSeleccionado && (
                <div className="col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="block text-gray-700 text-sm font-semibold">Cajas disponibles:</h4>
                    {loadingCajas && (
                      <span className="text-xs text-gray-500">(Cargando...)</span>
                    )}
                  </div>
                  <InfoCajasProducto 
                    cajasProducto={cajasProducto || []}
                    loading={loadingCajas}
                    error={errorCajas}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {/* Contenedor para FormAgregarProducto y TablaItemsVenta en la misma fila */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Agregar productos */}
          <div className="lg:col-span-1">
            {clienteSeleccionado && asignacion && productosOptions.length > 0 && (
              <FormAgregarProducto
                productoSeleccionado={productoSeleccionado}
                handleProductoChange={handleProductoChange}
                cantidad={cantidad}
                setCantidad={setCantidad}
                precio={precio}
                setPrecio={setPrecio}
                precioVenta={precioVenta}
                setPrecioVenta={setPrecioVenta}
                floresDetalle={floresDetalle}
                handlePrecioFlor={handlePrecioFlor}
                observacion={observacion}
                setObservacion={setObservacion}
                handleAgregarItem={handleAgregarItem}
                loading={loading}
                productosOptions={productosOptions}
                filtroTipoFlor={filtroTipoFlor}
                clienteSeleccionado={clienteSeleccionado}
                tipoCaja={tipoCaja}
                itemsVenta={itemsVenta}
                obtenerNumeroTallos={obtenerNumeroTallos}
                obtenerCostoMateriales={obtenerCostoMateriales}
                costoTotalUnidad={costoTotalUnidad}
                setCostoTotalUnidad={setCostoTotalUnidad}
                maximoUnidadesCaja={(() => {
                  // Verificar si hay cajas disponibles para este producto
                  if (cajasProducto && Array.isArray(cajasProducto) && cajasProducto.length > 0) {
                    console.log("Enviando cantidad máxima de la caja:", cajasProducto[0].cantidad);
                    return cajasProducto[0].cantidad;
                  }
                  // Si estamos en una vista de caja
                  if (tipoCaja === 'solida' && productoSeleccionado) {
                    // Si estamos en la InfoCajasProducto, debe haber información de cantidad
                    if (document.querySelector('.caja-info-cantidad')) {
                      const cantidadStr = document.querySelector('.caja-info-cantidad')?.textContent?.match(/\d+/)?.[0];
                      if (cantidadStr) {
                        console.log("Extrayendo cantidad del DOM:", parseInt(cantidadStr, 10));
                        return parseInt(cantidadStr, 10);
                      }
                    }
                  }
                  return 0;
                })()}
              />
            )}
          </div>

          {/* Tabla de productos agregados */}
          <div className="lg:col-span-1">
            <TablaItemsVenta
              items={itemsVenta}
              totalVenta={totalVenta}
              onEliminarItem={handleEliminarItem}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            style={{backgroundColor: '#cc3399'}}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || itemsVenta.length === 0 || !clienteSeleccionado || !fechaEntrega}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            style={{backgroundColor: '#cc3399'}}
          >
            <ShoppingCart size={18} /> Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormVentas;
