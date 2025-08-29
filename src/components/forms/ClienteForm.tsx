import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import ClientesTable from "./ClientesTable";
import WizartLocation from "../wizards/WizartLocation";
import WizardVendedor from "../wizards/WizardVendedor";
import WizartCooler from "../wizards/WizartCooler";
import WizardCarguera from "../wizards/WizardCarguera";

import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Briefcase,
  Snowflake,
} from "lucide-react";
import AddressSearch from "../AddressSearch";
import "../../index.css"; // Asegúrate de importar el CSS global si no está ya

// Hook personalizado con la lógica del formulario
import { useClienteForm } from '../../hooks/useClienteForm';

const ClienteForm = () => {
  // Usamos el hook personalizado que contiene toda la lógica
  const {
    formData,
    showForm,
    editingCustomer,
    customers,
    loading,
    error,
    modal,
    search,
    page,
    perPage,
    totalPages,
    locaciones,
    vendedores,
    cuartosFrios,
    paises,
    tiposCliente,
    loadingSelects,
    cargueraOptions,
    fieldErrors,
    fieldLabels,
    carguerasSeleccionadas,
    cargueraActual,
    coolerActual,
    coolersCargueraActual,
    coolersPorCarguera,
    contactos,
    contactoNombre,
    contactoTelefono,
    showLocationWizard,
    showVendorWizard,
    showCoolerWizard,
    showCargueraWizard,
    showBasicData,
    
    // Setters
    setFormData,
    setShowForm,
    setSearch,
    setPage,
    setPerPage,
    setCargueraActual,
    setCoolerActual,
    setContactoNombre,
    setContactoTelefono,
    setModal,
    setShowLocationWizard,
    setShowVendorWizard,
    setShowCargueraWizard,
    setShowCoolerWizard,
    setShowBasicData,
    setLocaciones,
    setVendedores,
    setCuartosFrios,
    setCargueraOptions,

    // Handlers
    handlePlaceSelected,
    handleCargueraChange,
    handleInputChange,
    handleAgregarCarguera,
    handleEliminarCarguera,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCreateNew,
    handleCancel,
    handleBlur,
    handleAgregarContacto,
    handleEliminarContacto,
    
    // Operaciones
    fetchClientes,
    
    // Constantes y servicios API
    API_ENDPOINTS,
    getAuthHeaders,
    getLocaciones,
    getVendedores,
    getCargueras
  } = useClienteForm();
  
  // Refs para los wizards que todavía se necesitan en el componente UI
  const addressSearchRef = useRef<HTMLInputElement>(null);
  const nombreLocationRef = useRef<HTMLInputElement>(null);
  const codigoLocationRef = useRef<HTMLInputElement>(null);
  const nombreVendedorRef = useRef<HTMLInputElement>(null);
  const correoVendedorRef = useRef<HTMLInputElement>(null);
  const ubicacionVendedorRef = useRef<HTMLInputElement>(null);
  const telefonoVendedorRef = useRef<HTMLInputElement>(null);
  const nombreCoolerRef = useRef<HTMLInputElement>(null);
  const codigoCoolerRef = useRef<HTMLInputElement>(null);
  const nombreCargueraRef = useRef<HTMLInputElement>(null);
  const rucCargueraRef = useRef<HTMLInputElement>(null);
  const contactoCargueraRef = useRef<HTMLInputElement>(null);
  const telefonoCargueraRef = useRef<HTMLInputElement>(null);
  const emailCargueraRef = useRef<HTMLInputElement>(null);
  const representanteCargueraRef = useRef<HTMLInputElement>(null);
  const origenCargueraRef = useRef<HTMLSelectElement>(null);
  const estadoCargueraRef = useRef<HTMLSelectElement>(null);
  
  // Obtenemos t de useTranslation para traducciones en la UI
  const { t } = useTranslation();

  // Todo esto ya está en el hook personalizado useClienteForm

  // Componentes modales para gestión de datos
  return (
    <div
      className="min-h-screen w-full px-1 sm:px-4"
      style={{
        fontFamily:
          "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Modal de éxito o error */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.10)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setModal({ ...modal, open: false })}
        >
          <div
            className={`bg-white bg-opacity-90 rounded-lg shadow-lg p-6 min-w-[300px] max-w-xs text-center border-2 ${
              modal.type === "success" ? "border-green-400" : "border-red-400"
            }`}
            style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mb-2 text-lg font-semibold ${
                modal.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {modal.type === "success"
                ? t("common.success", "¡Éxito!")
                : t("common.error", "Error")}
            </div>
            <div className="mb-4 text-gray-700">{modal.message}</div>
            <button
              className={`px-4 py-2 rounded font-semibold`}
              style={{ background: "#cc3399", color: "#fff" }}
              onClick={() => setModal({ ...modal, open: false })}
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
      {/* Layout principal */}
      <div className="min-h-screen bg-gray-100">
        <div
          className="bg-white rounded-2xl shadow-xl overflow-hidden w-full"
          style={{
            fontFamily:
              "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Header responsive */}
          <div
            className="px-2 py-2 sm:px-8"
            style={{
              background: "linear-gradient(90deg, #cc3399 0%, #FFB400 100%)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="min-w-0">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 min-w-0 truncate"
                  style={{
                    fontFamily:
                      "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                  }}
                >
                  <span role="img" aria-label="clients" className="shrink-0">
                    👥
                  </span>
                  <span className="truncate">{t("clients.title")}</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end min-w-0">
                {/* Mostrar botón alineado a la derecha en desktop */}
                {showForm && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-9 h-9 sm:w-auto sm:h-auto px-2 py-1 sm:px-6 sm:py-2 rounded-full sm:rounded-lg flex items-center justify-center gap-0 sm:gap-1 transition-colors text-xs sm:text-lg font-semibold ml-auto"
                    style={{
                      background: "#cc3399",
                      color: "#fff",
                      fontFamily:
                        "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                    }}
                  >
                    <span className="block sm:hidden">
                      <table className="w-full h-full">
                        <tbody>
                          <tr>
                            <td className="align-middle">
                              <User size={18} />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </span>
                    <span className="hidden sm:block">
                      {t("clients.tableButton", { defaultValue: "Tabla" })}
                    </span>
                  </button>
                )}
                {/* Buscador y botón crear cliente adaptados para móvil y desktop */}
                {!showForm && (
                  <div className="flex flex-row items-center gap-2 w-full sm:justify-end">
                    <input
                      type="text"
                      placeholder={t("clients.searchPlaceholder")}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="flex-1 min-w-0 px-2 py-1 sm:w-40 sm:max-w-xs sm:px-2 sm:py-1 border border-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs sm:text-sm bg-white"
                      style={{ height: "36px" }}
                    />
                    <button
                      onClick={handleCreateNew}
                      className="w-9 h-9 sm:w-auto sm:h-auto px-2 py-1 sm:px-4 sm:py-1 rounded-full sm:rounded-lg flex flex-row items-center justify-center gap-1 transition-colors text-xs sm:text-lg font-semibold"
                      style={{
                        background: "#cc3399",
                        color: "#fff",
                        fontFamily:
                          "Figtree, ui-sans-serif, system-ui, -apple-system, sans-serif",
                      }}
                    >
                      <span className="flex items-center justify-center">
                        <Plus size={18} className="sm:w-5 sm:h-5" />
                      </span>
                      <span className="hidden sm:inline-block ml-1">
                        {t("clients.addNew")}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Layout principal con formulario y wizard lateral */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-0 transition-all duration-300 w-full">
            {/* Columna principal: Formulario y tablas */}
            <div
              className={`flex-1 min-w-0 transition-all duration-300 ${
                showLocationWizard ||
                showVendorWizard ||
                showCargueraWizard ||
                showCoolerWizard
                  ? "mr-0"
                  : ""
              }`}
            >
              {/* Tabla de Clientes: visible solo en pantallas medianas o grandes */}
              <div
                className={`transition-all duration-300 ${
                  showForm ? "max-h-0 overflow-hidden" : "max-h-none"
                } mt-0 hidden sm:block`}
              >
                <ClientesTable
                  customers={customers}
                  loading={loading}
                  error={error}
                  onEdit={handleEdit}
                  search={search}
                  setSearch={setSearch}
                  page={page}
                  setPage={setPage}
                  totalPages={totalPages}
                  perPage={perPage}
                  setPerPage={setPerPage}
                  onOrderUpdated={fetchClientes}
                />
              </div>
              {/* Cards de Clientes (solo en móviles) */}
              <div
                className={`transition-all duration-300 ${
                  showForm ? "max-h-0 overflow-hidden" : "max-h-none"
                } mt-0 block sm:hidden`}
              >
                <div className="space-y-3 overflow-y-auto max-h-[80vh] px-1">
                  {loading ? (
                    <p className="text-center text-gray-500 text-sm">
                      {t("common.loading")}
                    </p>
                  ) : error ? (
                    <p className="text-center text-red-500 text-sm">{error}</p>
                  ) : customers.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm">
                      {t("common.noData")}
                    </p>
                  ) : (
                    customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="bg-white shadow rounded-lg p-2"
                      >
                        <div className="flex flex-col items-center gap-1 mb-1">
                          <h4
                            className="font-semibold text-base text-pink-700 text-center break-words w-full"
                            style={{ wordBreak: "break-word" }}
                          >
                            {customer.numero || ""}
                          </h4>
                          <p className="text-xs text-gray-500 text-center break-words w-full">
                            {customer.ciudad}
                          </p>
                        </div>
                        <div className="text-xs mb-1">
                          <p>
                            <strong>{t("clients.form.address")}:</strong>{" "}
                            {customer.direccion}
                          </p>
                          <p>
                            <strong>
                              {t("clients.form.contact", "Contacto")}:
                            </strong>{" "}
                            {customer.contacto}
                          </p>
                          <p>
                            <strong>{t("clients.form.phone")}:</strong>{" "}
                            {customer.telefono}
                          </p>
                          <p>
                            <strong>{t("salespersonData")}:</strong>
                            {typeof customer.vendedor === "object" &&
                            customer.vendedor !== null
                              ? customer.vendedor.nombre ||
                                customer.vendedor.email ||
                                customer.vendedor.correo ||
                                customer.vendedor.emailFactura ||
                                customer.vendedor.id
                              : customer.vendedor || ""}
                          </p>
                        </div>
                        <div className="flex justify-end gap-1 mt-1">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-pink-700 hover:text-pink-900 p-1 rounded-full border border-pink-200 bg-white"
                            title={t("common.edit")}
                            style={{ background: "#fff" }}
                          >
                            <Edit2 size={15} color="#cc3399" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full border border-red-200 bg-white"
                            title={t("common.delete")}
                            style={{ background: "#fff" }}
                          >
                            <Trash2 size={15} color="#dc2626" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Formulario */}
              <form
                onSubmit={handleSubmit}
                className={`transition-all duration-300 ${
                  showForm ? "max-h-none" : "max-h-0 overflow-hidden"
                }`}
              >
                <div className="border-t border-gray-200 pt-4 pb-12 px-2 md:px-8 overflow-y-auto max-h-[90vh] sm:overflow-y-visible sm:max-h-none">
                  {/* Layout inspirado en el boceto */}
                  <div className="flex flex-col gap-6">
                    {/* Datos Básicos with AddressSearch */}
                    <div
                      className={`rounded-xl px-2 py-4 sm:p-6 border transition-all duration-300 ${
                        showBasicData
                          ? "max-h-full opacity-100"
                          : "max-h-0 opacity-0 overflow-hidden p-0 border-0"
                      }`}
                      style={{ borderColor: "#f9c2d7", background: "#fff" }}
                    >
                      <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "#cc3399" }}
                      >
                        <User size={20} className="text-pink-700" />
                        {t("clients.form.basicData")}
                      </h3>
                      <div className="mb-4">
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: "#cc3399" }}
                        >
                          {t("clients.form.searchAddress")}
                        </label>
                        <AddressSearch
                          ref={addressSearchRef}
                          onPlaceSelected={handlePlaceSelected}
                          className="w-full px-2 py-1 border border-amber-50 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.clientNumber")} *
                          </label>
                          <input
                            type="text"
                            name="NombreCliente"
                            value={formData.NombreCliente}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["NombreCliente"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["NombreCliente"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="col-span-1">
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.code")} *
                          </label>
                          <input
                            type="text"
                            name="codcustomer"
                            value={formData.codcustomer}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["codcustomer"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["codcustomer"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="col-span-1">
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.country")} *
                          </label>
                          <select
                            name="pais"
                            value={formData.pais}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          >
                            <option value="">{t("countries.select")}</option>
                            {paises.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                          {fieldErrors["pais"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["pais"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.address")} *
                          </label>
                          <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["direccion"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["direccion"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.address")} {t("common.optional")}
                          </label>
                          <input
                            type="text"
                            name="direccionCobranzas"
                            value={formData.direccionCobranzas}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.city")} *
                          </label>
                          <input
                            type="text"
                            name="ciudad"
                            value={formData.ciudad}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["ciudad"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["ciudad"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.state")} *
                          </label>
                          <input
                            type="text"
                            name="provincia"
                            value={formData.provincia}
                            onChange={(e) => {
                              handleInputChange(e);
                              setFormData((prev) => ({
                                ...prev,
                                estado: e.target.value,
                              }));
                            }}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["provincia"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["provincia"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.zipCode")}
                          </label>
                          <input
                            type="text"
                            name="zipcode"
                            value={formData.zipcode}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.email")} *
                          </label>
                          <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["email"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["email"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.emailFactura")} *
                          </label>
                          <input
                            type="text"
                            name="emailFactura"
                            value={formData.emailFactura}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          />
                          {fieldErrors["email"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["email"],
                              }}
                            ></div>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            Prioridad *
                          </label>
                          <select
                            name="prioridad"
                            value={formData.prioridad}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          >
                            <option value="Rebtabilidad">Rentabilidad</option>
                            <option value="Volumen">Volumen</option>
                            <option value="Extra">Extra</option>
                          </select>
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            Cupo de Credito *
                          </label>
                          <input
                            type="number"
                            name="cupoCredito"
                            value={formData.cupoCredito || ""}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Sección de Contacto */}
                    <div
                      className="rounded-xl px-2 py-4 sm:p-6 border"
                      style={{
                        borderColor: "#b6f7e1",
                        background: "#fff",
                        marginTop: 16,
                      }}
                    >
                      <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "#059669" }}
                      >
                        <User size={20} className="text-green-700" />
                        {t("clients.form.contactSection", "Contacto")}
                      </h3>
                    
                      <div className="mb-4">
                        <h3 className="text-center font-semibold mb-2">
                          contactos obligatorios
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Comercial */}
                          <div>
                            <label
                              className="block text-sm font-medium mb-1 text-center md:text-left"
                              style={{ color: "#cc3399" }}
                            >
                              Comercial *
                            </label>
                            <input
                              type="text"
                              name="contactoComercial"
                              value={formData.contactoComercial || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                              placeholder="Nombre comercial"
                              required
                            />
                            <input
                              type="text"
                              name="telefonoComercial"
                              value={formData.telefonoComercial || ""}
                              onChange={handleInputChange}
                              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                              placeholder="Teléfono comercial"
                              required
                            />
                          </div>
                          {/* Financiero */}
                          <div>
                            <label
                              className="block text-sm font-medium mb-1 text-center md:text-left"
                              style={{ color: "#cc3399" }}
                            >
                              Financiero *
                            </label>
                            <input
                              type="text"
                              name="contactoFinanciero"
                              value={formData.contactoFinanciero || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                              placeholder="Nombre financiero"
                              required
                            />
                            <input
                              type="text"
                              name="telefonoFinanciero"
                              value={formData.telefonoFinanciero || ""}
                              onChange={handleInputChange}
                              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                              placeholder="Teléfono financiero"
                              required
                            />
                          </div>
                          {/* Facturación */}
                          <div>
                            <label
                              className="block text-sm font-medium mb-1 text-center md:text-left"
                              style={{ color: "#cc3399" }}
                            >
                              Facturación *
                            </label>
                            <input
                              type="text"
                              name="contactoFactura"
                              value={formData.contactoFactura || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                              placeholder="Nombre facturación"
                              required
                            />
                            <input
                              type="text"
                              name="telefonoFacturacion"
                              value={formData.telefonoFacturacion || ""}
                              onChange={handleInputChange}
                              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                              placeholder="Teléfono facturación"
                              required
                            />
                          </div>
                          {/* Técnico */}
                          <div>
                            <label
                              className="block text-sm font-medium mb-1 text-center md:text-left"
                              style={{ color: "#cc3399" }}
                            >
                              Técnico *
                            </label>
                            <input
                              type="text"
                              name="contactoTecnico"
                              value={formData.contactoTecnico || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                              placeholder="Nombre técnico"
                              required
                            />
                            <input
                              type="text"
                              name="telefonoTecnico"
                              value={formData.telefonoTecnico || ""}
                              onChange={handleInputChange}
                              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                              placeholder="Teléfono técnico"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <h3>contactos adicionales</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.contact", "Contacto")} *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={contactoNombre}
                              onChange={(e) =>
                                setContactoNombre(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-base bg-gray-100 h-12"
                              placeholder="Nombre del contacto"
                              style={{ height: "35px" }}
                            />
                            <div
                              className="invisible px-3"
                              style={{ height: "48px", minWidth: "48px" }}
                            >
                              +
                            </div>
                          </div>
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: "#cc3399" }}
                          >
                            {t("clients.form.phone")} *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={contactoTelefono}
                              onChange={(e) =>
                                setContactoTelefono(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-base bg-gray-100 h-12"
                              placeholder="Teléfono del contacto"
                              style={{ height: "35px" }}
                            />
                            <button
                              type="button"
                              onClick={handleAgregarContacto}
                              className="px-3 rounded bg-emerald-500 text-white font-bold text-lg"
                              title="Agregar contacto"
                              style={{
                                background: "#cc3399",
                                height: "48px",
                                minWidth: "48px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Lista de contactos agregados visualmente */}
                      {contactos.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-semibold mb-2 text-emerald-700">
                            Contactos agregados:
                          </h4>
                          <ul className="flex flex-row flex-wrap gap-2">
                            {contactos.map((c, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1"
                              >
                                <span className="font-medium text-gray-800">
                                  {c.nombre}
                                </span>
                                <span className="text-gray-500">
                                  {c.telefono}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleEliminarContacto(idx)}
                                  className="text-white px-2 py-0.5 rounded hover:bg-red-100 "
                                  style={{ background: "#cc3399" }}
                                >
                                  x
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {/* 2 filas, 2 selects por fila */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Locación */}
                      <div
                        className="rounded-xl px-2 py-4 sm:p-6 border w-full"
                        style={{ borderColor: "#bcdcff", background: "#fff" }}
                      >
                        <h3
                          className="text-lg font-semibold mb-4 flex items-center gap-2"
                          style={{ color: "#3b82f6" }}
                        >
                          <MapPin size={20} className="text-blue-600" />
                          {t("locationData")}
                        </h3>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <select
                              name="locacion"
                              value={formData.locacion}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                              required
                            >
                              <option value="">
                                {t("common.selectOption", "Seleccionar...")}
                              </option>
                              {locaciones.map((loc, index) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.label}
                                </option>
                              ))}
                            </select>
                            {fieldErrors["locacion"] && (
                              <div
                                className="text-red-500 text-xs mt-1"
                                dangerouslySetInnerHTML={{
                                  __html: fieldErrors["locacion"],
                                }}
                              ></div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowLocationWizard(true);
                              setShowVendorWizard(false);
                              setShowCargueraWizard(false);
                              setShowCoolerWizard(false);
                              setShowBasicData(false); // Ocultar datos básicos
                            }}
                            className="rounded-full"
                            style={{
                              background: "#cc3399",
                              color: "#fff",
                              padding: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title={t("clients.form.locationName")}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      {/* Vendedor */}
                      <div
                        className="rounded-xl px-2 py-4 sm:p-6 border w-full"
                        style={{ borderColor: "#b6f7e1", background: "#fff" }}
                      >
                        <h3
                          className="text-lg font-semibold mb-4 flex items-center gap-2"
                          style={{ color: "#22c55e" }}
                        >
                          <User size={20} className="text-green-600" />
                          {t("salespersonData")}
                        </h3>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <select
                              name="vendedor"
                              value={formData.vendedor}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                              required
                            >
                              <option value="">
                                {t("common.selectOption", "Seleccionar...")}
                              </option>
                              {vendedores.map((v, index) => (
                                <option key={v.id} value={v.id}>
                                  {v.label}
                                </option>
                              ))}
                            </select>
                            {fieldErrors["vendedor"] && (
                              <div
                                className="text-red-500 text-xs mt-1"
                                dangerouslySetInnerHTML={{
                                  __html: fieldErrors["vendedor"],
                                }}
                              ></div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowVendorWizard(true);
                              setShowLocationWizard(false);
                              setShowCargueraWizard(false);
                              setShowCoolerWizard(false);
                              setShowBasicData(false); // Ocultar datos básicos
                            }}
                            className="rounded-full"
                            style={{
                              background: "#cc3399",
                              color: "#fff",
                              padding: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title={t("salespersonData")}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cargueras y Cuartos Fríos múltiples */}
                      <div
                        className="rounded-xl px-2 py-4 sm:p-6 border w-full col-span-2"
                        style={{ borderColor: "#ffe9b6", background: "#fff" }}
                      >
                        <h3
                          className="text-lg font-semibold mb-4 flex items-center gap-2"
                          style={{ color: "#FFB400" }}
                        >
                          <Briefcase size={20} className="text-yellow-500" />
                          {t("clients.form.carrierData")} &{" "}
                          {t("clients.form.coolerData")}
                        </h3>
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-row gap-2 items-end">
                            <div className="flex-1">
                              <select
                                name="cargueraActual"
                                value={cargueraActual}
                                onChange={(e) =>
                                  setCargueraActual(e.target.value)
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                              >
                                <option value="">
                                  {t(
                                    "common.selectOption",
                                    "Seleccionar carguera..."
                                  )}
                                </option>
                                {cargueraOptions.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <select
                                name="coolerActual"
                                value={coolerActual}
                                onChange={(e) =>
                                  setCoolerActual(e.target.value)
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                                disabled={!cargueraActual}
                              >
                                <option value="">
                                  {!cargueraActual
                                    ? t(
                                        "clients.form.selectCarrierFirst",
                                        "Seleccione una carguera primero"
                                      )
                                    : t(
                                        "common.selectOption",
                                        "Seleccionar cuarto frío..."
                                      )}
                                </option>
                                {coolersCargueraActual.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={handleAgregarCarguera}
                              className="rounded-full px-3 py-2"
                              style={{ background: "#cc3399", color: "#fff" }}
                              title="Agregar carguera y cuarto frío"
                              disabled={!cargueraActual || !coolerActual}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {/* Lista de cargueras seleccionadas */}
                          <ul className="mt-2 space-y-1">
                            {carguerasSeleccionadas.map((c, idx) => {
                              const cargueraLabel =
                                cargueraOptions.find(
                                  (opt) => String(opt.id) === String(c.id)
                                )?.label || c.id;
                              let coolerLabel = c.cooler_id;
                              const coolersForCarguera =
                                coolersPorCarguera[String(c.id)] ||
                                coolersCargueraActual;
                              coolerLabel =
                                coolersForCarguera.find(
                                  (opt) =>
                                    String(opt.id) === String(c.cooler_id)
                                )?.label || c.cooler_id;
                              return (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2 text-sm bg-gray-50 rounded px-2 py-1"
                                >
                                  <span className="font-medium text-yellow-700">
                                    {cargueraLabel}
                                  </span>
                                  <span className="text-gray-500">/</span>
                                  <span className="font-medium text-purple-700">
                                    {coolerLabel}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarCarguera(idx)}
                                    className="ml-2 text-white hover:text-white-700"
                                    title="Eliminar"
                                    style={{ background: "#cc3399" }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                    {/* Tipo de Cliente (nuevo campo) */}
                    <div
                      className="rounded-xl px-2 py-4 sm:p-6 border w-full"
                      style={{ borderColor: "#b6f7e1", background: "#fff" }}
                    >
                      <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "#059669" }}
                      >
                        <User size={20} className="text-green-700" />
                        {t("clients.form.clientType", "Tipo de Cliente")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <select
                            name="tipoCliente"
                            value={formData.tipoCliente}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-100"
                            required
                          >
                            <option value="">
                              {t("common.selectOption", "Seleccionar...")}
                            </option>
                            {tiposCliente.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          {fieldErrors["tipoCliente"] && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              dangerouslySetInnerHTML={{
                                __html: fieldErrors["tipoCliente"],
                              }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Botones de acción */}
                  <div className="flex flex-row gap-2 justify-end mt-6">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
                      style={{ background: "transparent" }}
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#e83e8c", border: "none" }}
                      disabled={loading}
                    >
                      {editingCustomer ? t("common.update") : t("common.save")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            {/* Panel lateral para los wizards */}
            {(showLocationWizard ||
              showVendorWizard ||
              showCargueraWizard ||
              showCoolerWizard) && (
              <div
                className="w-full max-w-md flex items-center justify-center h-[90%] min-h-[400px] overflow-y-auto p-0 border-l border-gray-200 transition-all duration-300"
                style={{
                  marginRight: 0,
                  marginLeft: 0,
                  height: "90vh",
                  background: "transparent",
                  boxShadow: "none",
                }}
              >
                {showLocationWizard && (
                  <WizartLocation
                    showWizard={true}
                    setShowWizard={setShowLocationWizard}
                    refs={{
                      nombreLocation: nombreLocationRef,
                      codigoLocation: codigoLocationRef,
                    }}
                    onCreated={async () => {
                      const locs = await getLocaciones();
                      setLocaciones(
                        Array.isArray(locs)
                          ? locs.map((l) => ({
                              id: l.id,
                              label:
                                l.nombre ||
                                l.name ||
                                l.codigolocacion ||
                                l.codigo ||
                                l.code,
                            }))
                          : []
                      );
                    }}
                    onClose={() => {
                      setShowLocationWizard(false);
                      setShowBasicData(true);
                    }}
                  />
                )}
                {showVendorWizard && (
                  <WizardVendedor
                    showWizard={true}
                    setShowWizard={setShowVendorWizard}
                    refs={{
                      nombreVendedor: nombreVendedorRef,
                      correoVendedor: correoVendedorRef,
                      ubicacionVendedor: ubicacionVendedorRef,
                      telefonoVendedor: telefonoVendedorRef,
                    }}
                    onCreated={async () => {
                      const vends = await getVendedores();
                      setVendedores(
                        Array.isArray(vends)
                          ? vends.map((v) => ({
                              id: v.id,
                              label: v.nombre || v.name || v.correo || v.email,
                            }))
                          : []
                      );
                    }}
                    onClose={() => {
                      setShowVendorWizard(false);
                      setShowBasicData(true);
                    }}
                  />
                )}
                {showCargueraWizard && (
                  <WizardCarguera
                    showWizard={true}
                    setShowWizard={setShowCargueraWizard}
                    refs={{
                      nombreCarguera: nombreCargueraRef,
                      rucCarguera: rucCargueraRef,
                      contactoCarguera: contactoCargueraRef,
                      telefonoCarguera: telefonoCargueraRef,
                      emailCarguera: emailCargueraRef,
                      representanteCarguera: representanteCargueraRef,
                      origenCarguera: origenCargueraRef,
                      estadoCarguera: estadoCargueraRef,
                    }}
                    onCreated={async () => {
                      const cargueras = await getCargueras();
                      setCargueraOptions(
                        Array.isArray(cargueras)
                          ? cargueras.map((c) => ({
                              id: c.id,
                              label:
                                c.nombre || c.name || c.razon || c.ruc || c.id,
                            }))
                          : []
                      );
                    }}
                    onClose={() => {
                      setShowCargueraWizard(false);
                      setShowBasicData(true);
                    }}
                  />
                )}
                {showCoolerWizard && (
                  <WizartCooler
                    showWizard={true}
                    setShowWizard={setShowCoolerWizard}
                    refs={{
                      nombreCooler: nombreCoolerRef,
                      codigoCooler: codigoCoolerRef,
                    }}
                    defaultCargueraId={formData.carguera}
                    defaultCargueraLabel={
                      cargueraOptions.find(
                        (c) => String(c.id) === String(formData.carguera)
                      )?.label || ""
                    }
                    onCreated={async () => {
                      // Refrescar coolers de la carguera seleccionada tras crear uno nuevo
                      if (formData.carguera) {
                        try {
                          const response = await fetch(
                            API_ENDPOINTS.CARGUERAS.LIST_ID_CARGUERAS(
                              String(formData.carguera)
                            ),
                            {
                              headers: getAuthHeaders(),
                            }
                          );
                          if (response.ok) {
                            const coolers = await response.json();
                            setCuartosFrios(
                              Array.isArray(coolers)
                                ? coolers.map((c) => ({
                                    id: c.id,
                                    label: c.nombre || c.codigo,
                                  }))
                                : []
                            );
                          } else {
                            setCuartosFrios([]);
                          }
                        } catch {
                          setCuartosFrios([]);
                        }
                      }
                    }}
                    onClose={() => {
                      setShowCoolerWizard(false);
                      setShowBasicData(true);
                    }}
                    hideCloseButton={false}
                    selectCarguera={false}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteForm;
