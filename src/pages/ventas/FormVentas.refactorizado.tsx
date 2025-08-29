import React from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { ShoppingCart } from "lucide-react";

// Hooks personalizados
import { useVentasForm } from "../../hooks/ventas/useVentasForm";

// Componentes
import ClienteInfo from "../../components/ventas/ClienteInfo";
import ProductosDisponibles from "../../components/ventas/ProductosDisponibles";
import NoProductosDisponibles from "../../components/ventas/NoProductosDisponibles";
import FormAgregarProducto from "../../components/ventas/FormAgregarProducto";
import TablaItemsVenta from "../../components/ventas/TablaItemsVenta";

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
    fechaEntrega,
    mostrarDetalleCliente,
    loading,
    error,
    filtroTipoFlor,
    
    // Funciones de actualización
    handleClienteChange,
    handleProductoChange,
    handlePrecioFlor,
    setCantidad,
    setPrecio,
    setPrecioVenta,
    setObservacion,
    setFechaEntrega,
    setMostrarDetalleCliente,
    setFiltroTipoFlor,
    
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
          />
        )}

        {/* Información de asignación */}
        {clienteSeleccionado && asignacion && productosOptions.length > 0 && (
          <ProductosDisponibles
            productosOptions={productosOptions}
            filtroTipoFlor={filtroTipoFlor}
            setFiltroTipoFlor={setFiltroTipoFlor}
          />
        )}
        
        {/* Mensaje cuando no hay productos */}
        {clienteSeleccionado && (!asignacion || productosOptions.length === 0) && !loading && (
          <NoProductosDisponibles error={error} />
        )}

        {/* Agregar productos */}
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
            tipoCaja="solida"
            itemsVenta={itemsVenta}
            obtenerNumeroTallos={obtenerNumeroTallos}
            obtenerCostoMateriales={obtenerCostoMateriales}
          />
        )}

        {/* Tabla de productos agregados */}
        <TablaItemsVenta
          items={itemsVenta}
          totalVenta={totalVenta}
          onEliminarItem={handleEliminarItem}
        />

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || itemsVenta.length === 0 || !clienteSeleccionado || !fechaEntrega}
            className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#cc3399] hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
          >
            <ShoppingCart size={18} /> Guardar Venta
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormVentas;
